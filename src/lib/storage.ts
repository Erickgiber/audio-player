import { get, set, del } from 'idb-keyval';
import type { Track, Library, StorageType } from './types';

const LIBRARY_KEY = 'audio-library';
const TRACKS_DIR = 'tracks';

class StorageManager {
	private storageType: StorageType = 'indexeddb';
	private opfsRoot: FileSystemDirectoryHandle | null = null;

	async init(): Promise<void> {
		// Try to use OPFS first
		if ('storage' in navigator && 'getDirectory' in navigator.storage) {
			try {
				this.opfsRoot = await navigator.storage.getDirectory();
				this.storageType = 'opfs';
				console.log('Using OPFS for storage');
			} catch (err) {
				console.warn('OPFS not available, falling back to IndexedDB', err);
			}
		}

		// Request persistent storage
		if ('storage' in navigator && 'persist' in navigator.storage) {
			const isPersisted = await navigator.storage.persist();
			console.log(`Persistent storage: ${isPersisted}`);
		}
	}

	getStorageType(): StorageType {
		return this.storageType;
	}

	async saveLibrary(library: Library): Promise<void> {
		await set(LIBRARY_KEY, library);
	}

	async loadLibrary(): Promise<Library | null> {
		const library = await get<Library>(LIBRARY_KEY);
		return library || null;
	}

	async saveTrackFile(trackId: string, file: File): Promise<string> {
		if (this.storageType === 'opfs' && this.opfsRoot) {
			try {
				// Create tracks directory if it doesn't exist
				const tracksDir = await this.opfsRoot.getDirectoryHandle(TRACKS_DIR, { create: true });
				
				// Save file
				const fileHandle = await tracksDir.getFileHandle(trackId, { create: true });
				const writable = await fileHandle.createWritable();
				await writable.write(file);
				await writable.close();
				
				return `opfs://${TRACKS_DIR}/${trackId}`;
			} catch (err) {
				console.error('Error saving to OPFS, falling back to IndexedDB', err);
			}
		}

		// Fallback to IndexedDB
		const buffer = await file.arrayBuffer();
		await set(`track-${trackId}`, buffer);
		return `idb://track-${trackId}`;
	}

	async loadTrackFile(filePath: string): Promise<Blob | null> {
		if (filePath.startsWith('opfs://') && this.opfsRoot) {
			try {
				const path = filePath.replace('opfs://', '');
				const [dir, filename] = path.split('/');
				const tracksDir = await this.opfsRoot.getDirectoryHandle(dir);
				const fileHandle = await tracksDir.getFileHandle(filename);
				const file = await fileHandle.getFile();
				return file;
			} catch (err) {
				console.error('Error loading from OPFS', err);
				return null;
			}
		}

		if (filePath.startsWith('idb://')) {
			const key = filePath.replace('idb://', '');
			const buffer = await get<ArrayBuffer>(key);
			if (buffer) {
				return new Blob([buffer]);
			}
		}

		return null;
	}

	async deleteTrackFile(filePath: string): Promise<void> {
		if (filePath.startsWith('opfs://') && this.opfsRoot) {
			try {
				const path = filePath.replace('opfs://', '');
				const [dir, filename] = path.split('/');
				const tracksDir = await this.opfsRoot.getDirectoryHandle(dir);
				await tracksDir.removeEntry(filename);
			} catch (err) {
				console.error('Error deleting from OPFS', err);
			}
		}

		if (filePath.startsWith('idb://')) {
			const key = filePath.replace('idb://', '');
			await del(key);
		}
	}

	async saveCoverArt(trackId: string, blob: Blob): Promise<string> {
		// Convert to base64 for easier storage and display
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				resolve(reader.result as string);
			};
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	}
}

export const storageManager = new StorageManager();
