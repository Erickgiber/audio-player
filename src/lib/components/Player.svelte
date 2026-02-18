<script lang="ts">
	import { player, progress } from '$lib/stores';
	import { onMount, onDestroy } from 'svelte';

	let audioElement: HTMLAudioElement;
	let showVolume = $state(false);

	onMount(() => {
		player.setAudioElement(audioElement);

		const handleTimeUpdate = () => {
			player.updateTime(audioElement.currentTime);
		};

		const handleDurationChange = () => {
			player.setDuration(audioElement.duration);
		};

		const handlePlay = () => {
			player.setPlaying(true);
		};

		const handlePause = () => {
			player.setPlaying(false);
		};

		const handleEnded = () => {
			player.setPlaying(false);
			// TODO: Auto-play next track
		};

		audioElement.addEventListener('timeupdate', handleTimeUpdate);
		audioElement.addEventListener('durationchange', handleDurationChange);
		audioElement.addEventListener('play', handlePlay);
		audioElement.addEventListener('pause', handlePause);
		audioElement.addEventListener('ended', handleEnded);

		return () => {
			audioElement.removeEventListener('timeupdate', handleTimeUpdate);
			audioElement.removeEventListener('durationchange', handleDurationChange);
			audioElement.removeEventListener('play', handlePlay);
			audioElement.removeEventListener('pause', handlePause);
			audioElement.removeEventListener('ended', handleEnded);
		};
	});

	onDestroy(() => {
		player.cleanup();
	});

	function formatTime(seconds: number): string {
		if (!seconds || !isFinite(seconds)) return '0:00';
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	function handleSeek(e: Event) {
		const target = e.target as HTMLInputElement;
		const time = (parseFloat(target.value) / 100) * $player.duration;
		player.setCurrentTime(time);
	}

	function handleVolumeChange(e: Event) {
		const target = e.target as HTMLInputElement;
		player.setVolume(parseFloat(target.value) / 100);
	}
</script>

<audio bind:this={audioElement}></audio>

<div class="player">
	{#if $player.currentTrack}
		<div class="track-info">
			{#if $player.currentTrack.coverArt}
				<img src={$player.currentTrack.coverArt} alt="Album art" class="cover-art" />
			{:else}
				<div class="cover-art-placeholder">♪</div>
			{/if}
			<div class="info">
				<div class="title">{$player.currentTrack.title}</div>
				{#if $player.currentTrack.artist}
					<div class="artist">{$player.currentTrack.artist}</div>
				{/if}
			</div>
		</div>

		<div class="controls">
			<button class="control-btn" onclick={() => player.previous()} aria-label="Previous track">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<path d="M19 20L9 12L19 4V20Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M5 19V5" stroke-width="2" stroke-linecap="round"/>
				</svg>
			</button>

			<button class="control-btn play-btn" onclick={() => player.togglePlay()}>
				{#if $player.isPlaying}
					<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<rect x="6" y="4" width="4" height="16" stroke-width="2" stroke-linecap="round"/>
						<rect x="14" y="4" width="4" height="16" stroke-width="2" stroke-linecap="round"/>
					</svg>
				{:else}
					<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path d="M8 5V19L19 12L8 5Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				{/if}
			</button>

			<button class="control-btn" onclick={() => player.next()} aria-label="Next track">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<path d="M5 4L15 12L5 20V4Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M19 5V19" stroke-width="2" stroke-linecap="round"/>
				</svg>
			</button>
		</div>

		<div class="progress-section">
			<div class="time">{formatTime($player.currentTime)}</div>
			<input
				type="range"
				min="0"
				max="100"
				value={$progress}
				oninput={handleSeek}
				class="progress-bar"
			/>
			<div class="time">{formatTime($player.duration)}</div>
		</div>

		<div class="volume-section">
			<button
				class="control-btn"
				onclick={() => (showVolume = !showVolume)}
				aria-label="Toggle volume"
			>
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<path d="M11 5L6 9H2V15H6L11 19V5Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</button>
			{#if showVolume}
				<input
					type="range"
					min="0"
					max="100"
					value={$player.volume * 100}
					oninput={handleVolumeChange}
					class="volume-bar"
				/>
			{/if}
		</div>
	{:else}
		<div class="no-track">
			<p>No track selected</p>
		</div>
	{/if}
</div>

<style>
	.player {
		background: var(--color-surface);
		border-radius: var(--border-radius);
		padding: var(--spacing-lg);
		margin-bottom: var(--spacing-md);
		display: grid;
		gap: var(--spacing-md);
	}

	.track-info {
		display: flex;
		gap: var(--spacing-md);
		align-items: center;
	}

	.cover-art {
		width: 80px;
		height: 80px;
		border-radius: var(--border-radius);
		object-fit: cover;
	}

	.cover-art-placeholder {
		width: 80px;
		height: 80px;
		background: var(--color-bg);
		border-radius: var(--border-radius);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		color: var(--color-primary);
	}

	.info {
		flex: 1;
		min-width: 0;
	}

	.title {
		font-size: 1.25rem;
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.artist {
		color: var(--color-text-secondary);
		font-size: 0.9rem;
	}

	.controls {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--spacing-md);
	}

	.control-btn {
		padding: var(--spacing-sm);
		border-radius: 50%;
		transition: all var(--transition);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.control-btn:hover {
		background: var(--color-surface-hover);
		transform: scale(1.1);
	}

	.control-btn:active {
		transform: scale(0.95);
	}

	.play-btn {
		background: var(--color-primary);
		padding: var(--spacing-md);
	}

	.play-btn:hover {
		background: var(--color-primary-hover);
	}

	.progress-section {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.time {
		font-size: 0.85rem;
		color: var(--color-text-secondary);
		min-width: 40px;
		text-align: center;
	}

	.progress-bar {
		flex: 1;
	}

	.volume-section {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		justify-content: flex-end;
	}

	.volume-bar {
		width: 100px;
	}

	.no-track {
		text-align: center;
		color: var(--color-text-secondary);
		padding: var(--spacing-xl);
	}

	@media (max-width: 768px) {
		.player {
			padding: var(--spacing-md);
		}

		.track-info {
			flex-direction: column;
			text-align: center;
		}

		.cover-art,
		.cover-art-placeholder {
			width: 120px;
			height: 120px;
		}

		.volume-section {
			justify-content: center;
		}
	}
</style>
