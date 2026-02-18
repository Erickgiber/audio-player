import * as mm from 'music-metadata';
import type { Track } from './types';
import { storageManager } from './storage';

export async function extractMetadata(file: File, trackId: string): Promise<Track> {
	try {
		// Parse metadata
		const metadata = await mm.parseBlob(file);
		
		// Extract cover art
		let coverArt: string | undefined;
		if (metadata.common.picture && metadata.common.picture.length > 0) {
			const picture = metadata.common.picture[0];
			const blob = new Blob([picture.data.buffer], { type: picture.format });
			coverArt = await storageManager.saveCoverArt(trackId, blob);
		}

		// Save the audio file
		const filePath = await storageManager.saveTrackFile(trackId, file);

		return {
			id: trackId,
			title: metadata.common.title || file.name.replace(/\.[^/.]+$/, ''),
			artist: metadata.common.artist,
			album: metadata.common.album,
			duration: metadata.format.duration,
			coverArt,
			filePath,
			addedAt: Date.now()
		};
	} catch (err) {
		console.error('Error extracting metadata:', err);
		
		// Fallback: create basic track info
		const filePath = await storageManager.saveTrackFile(trackId, file);
		
		return {
			id: trackId,
			title: file.name.replace(/\.[^/.]+$/, ''),
			filePath,
			addedAt: Date.now()
		};
	}
}

export async function processBatch(
	files: File[],
	onProgress?: (current: number, total: number) => void
): Promise<Track[]> {
	const tracks: Track[] = [];
	const batchSize = 5; // Process 5 files at a time

	for (let i = 0; i < files.length; i += batchSize) {
		const batch = files.slice(i, i + batchSize);
		const batchPromises = batch.map((file, idx) => {
			const trackId = `${Date.now()}-${i + idx}-${Math.random().toString(36).substr(2, 9)}`;
			return extractMetadata(file, trackId);
		});

		const batchResults = await Promise.all(batchPromises);
		tracks.push(...batchResults);

		if (onProgress) {
			onProgress(Math.min(i + batchSize, files.length), files.length);
		}
	}

	return tracks;
}
