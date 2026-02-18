import { writable, derived, get } from 'svelte/store';
import type { Track, Library } from './types';
import { storageManager } from './storage';

// Library store
function createLibraryStore() {
	const { subscribe, set, update } = writable<Track[]>([]);

	return {
		subscribe,
		set,
		addTracks: (tracks: Track[]) => {
			update(library => {
				const newLibrary = [...library, ...tracks];
				// Save to storage
				storageManager.saveLibrary({
					tracks: newLibrary,
					version: 1
				});
				return newLibrary;
			});
		},
		removeTrack: async (trackId: string) => {
			update(library => {
				const track = library.find(t => t.id === trackId);
				if (track?.filePath) {
					storageManager.deleteTrackFile(track.filePath);
				}
				const newLibrary = library.filter(t => t.id !== trackId);
				storageManager.saveLibrary({
					tracks: newLibrary,
					version: 1
				});
				return newLibrary;
			});
		},
		load: async () => {
			const library = await storageManager.loadLibrary();
			if (library) {
				set(library.tracks);
			}
		},
		clear: () => {
			set([]);
			storageManager.saveLibrary({
				tracks: [],
				version: 1
			});
		}
	};
}

export const library = createLibraryStore();

// Player store
interface PlayerState {
	currentTrack: Track | null;
	currentTrackIndex: number;
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	volume: number;
	audioUrl: string | null;
}

function createPlayerStore() {
	const { subscribe, set, update } = writable<PlayerState>({
		currentTrack: null,
		currentTrackIndex: -1,
		isPlaying: false,
		currentTime: 0,
		duration: 0,
		volume: 1,
		audioUrl: null
	});

	let audioElement: HTMLAudioElement | null = null;
	let currentObjectUrl: string | null = null;

	const revokeCurrentUrl = () => {
		if (currentObjectUrl) {
			URL.revokeObjectURL(currentObjectUrl);
			currentObjectUrl = null;
		}
	};

	return {
		subscribe,
		setAudioElement: (audio: HTMLAudioElement) => {
			audioElement = audio;
		},
		playTrack: async (track: Track, index: number) => {
			revokeCurrentUrl();

			if (!track.filePath) {
				console.error('No file path for track');
				return;
			}

			const blob = await storageManager.loadTrackFile(track.filePath);
			if (!blob) {
				console.error('Could not load track file');
				return;
			}

			const url = URL.createObjectURL(blob);
			currentObjectUrl = url;

			update(state => ({
				...state,
				currentTrack: track,
				currentTrackIndex: index,
				audioUrl: url,
				currentTime: 0
			}));

			if (audioElement) {
				audioElement.src = url;
				await audioElement.play();
			}
		},
		play: async () => {
			if (audioElement) {
				await audioElement.play();
			}
		},
		pause: () => {
			if (audioElement) {
				audioElement.pause();
			}
		},
		togglePlay: async () => {
			update(state => {
				if (state.isPlaying) {
					audioElement?.pause();
				} else {
					audioElement?.play();
				}
				return state;
			});
		},
		setPlaying: (isPlaying: boolean) => {
			update(state => ({ ...state, isPlaying }));
		},
		setCurrentTime: (time: number) => {
			if (audioElement) {
				audioElement.currentTime = time;
			}
			update(state => ({ ...state, currentTime: time }));
		},
		updateTime: (time: number) => {
			update(state => ({ ...state, currentTime: time }));
		},
		setDuration: (duration: number) => {
			update(state => ({ ...state, duration }));
		},
		setVolume: (volume: number) => {
			if (audioElement) {
				audioElement.volume = volume;
			}
			update(state => ({ ...state, volume }));
		},
		next: () => {
			const tracks = get(library);
			update(state => {
				if (tracks.length === 0 || state.currentTrackIndex === -1) return state;
				const nextIndex = (state.currentTrackIndex + 1) % tracks.length;
				const nextTrack = tracks[nextIndex];
				if (nextTrack) {
					player.playTrack(nextTrack, nextIndex);
				}
				return state;
			});
		},
		previous: () => {
			const tracks = get(library);
			update(state => {
				if (tracks.length === 0 || state.currentTrackIndex === -1) return state;
				const prevIndex = state.currentTrackIndex - 1 < 0 ? tracks.length - 1 : state.currentTrackIndex - 1;
				const prevTrack = tracks[prevIndex];
				if (prevTrack) {
					player.playTrack(prevTrack, prevIndex);
				}
				return state;
			});
		},
		cleanup: () => {
			revokeCurrentUrl();
			if (audioElement) {
				audioElement.pause();
				audioElement.src = '';
			}
			set({
				currentTrack: null,
				currentTrackIndex: -1,
				isPlaying: false,
				currentTime: 0,
				duration: 0,
				volume: 1,
				audioUrl: null
			});
		}
	};
}

export const player = createPlayerStore();

// Derived store for progress percentage
export const progress = derived(
	player,
	$player => {
		if ($player.duration === 0) return 0;
		return ($player.currentTime / $player.duration) * 100;
	}
);
