export interface Track {
	id: string;
	title: string;
	artist?: string;
	album?: string;
	duration?: number;
	coverArt?: string; // base64 or blob URL
	filePath?: string; // for OPFS
	addedAt: number;
}

export interface Library {
	tracks: Track[];
	version: number;
}

export type StorageType = 'opfs' | 'indexeddb';
