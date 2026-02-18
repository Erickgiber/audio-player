<script lang="ts">
	import { library } from '$lib/stores';
	import { processBatch } from '$lib/metadata';

	let fileInput: HTMLInputElement;
	let folderInput: HTMLInputElement;
	let isLoading = $state(false);
	let progress = $state(0);
	let total = $state(0);

	async function handleFiles(files: File[]) {
		if (files.length === 0) return;

		// Filter audio files
		const audioFiles = files.filter((file) =>
			file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|m4a|flac|aac)$/i)
		);

		if (audioFiles.length === 0) {
			alert('No valid audio files found');
			return;
		}

		isLoading = true;
		progress = 0;
		total = audioFiles.length;

		try {
			const tracks = await processBatch(audioFiles, (current, total) => {
				progress = current;
			});

			library.addTracks(tracks);
		} catch (err) {
			console.error('Error processing files:', err);
			alert('Error processing some files. Check console for details.');
		} finally {
			isLoading = false;
			progress = 0;
			total = 0;
		}
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			handleFiles(Array.from(target.files));
			target.value = ''; // Reset input
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		if (event.dataTransfer?.files) {
			handleFiles(Array.from(event.dataTransfer.files));
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
	}
</script>

<div class="uploader" ondrop={handleDrop} ondragover={handleDragOver} role="region" aria-label="File upload area">
	<input
		bind:this={fileInput}
		type="file"
		accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac"
		multiple
		onchange={handleFileSelect}
		style="display: none;"
	/>
	
	<input
		bind:this={folderInput}
		type="file"
		webkitdirectory
		multiple
		onchange={handleFileSelect}
		style="display: none;"
	/>

	{#if isLoading}
		<div class="loading">
			<div class="spinner"></div>
			<p>Processing {progress} of {total} files...</p>
			<div class="progress-bar">
				<div class="progress-fill" style="width: {(progress / total) * 100}%"></div>
			</div>
		</div>
	{:else}
		<div class="upload-buttons">
			<button class="upload-btn" onclick={() => fileInput.click()}>
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				<span>Add Files</span>
			</button>

			<button class="upload-btn" onclick={() => folderInput.click()}>
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M12 11v6M9 14h6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				<span>Add Folder</span>
			</button>
		</div>

		<div class="drop-zone">
			<p>or drag and drop files here</p>
		</div>
	{/if}
</div>

<style>
	.uploader {
		background: var(--color-surface);
		border-radius: var(--border-radius);
		padding: var(--spacing-lg);
		margin-bottom: var(--spacing-md);
	}

	.upload-buttons {
		display: flex;
		gap: var(--spacing-md);
		justify-content: center;
		margin-bottom: var(--spacing-md);
	}

	.upload-btn {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-md) var(--spacing-lg);
		background: var(--color-primary);
		color: white;
		border-radius: var(--border-radius);
		font-weight: 500;
		transition: all var(--transition);
	}

	.upload-btn:hover {
		background: var(--color-primary-hover);
		transform: translateY(-2px);
	}

	.upload-btn:active {
		transform: translateY(0);
	}

	.drop-zone {
		text-align: center;
		padding: var(--spacing-md);
		border: 2px dashed var(--color-border);
		border-radius: var(--border-radius);
		color: var(--color-text-secondary);
	}

	.loading {
		text-align: center;
		padding: var(--spacing-lg);
	}

	.spinner {
		width: 40px;
		height: 40px;
		margin: 0 auto var(--spacing-md);
		border: 3px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.progress-bar {
		width: 100%;
		height: 4px;
		background: var(--color-border);
		border-radius: 2px;
		overflow: hidden;
		margin-top: var(--spacing-md);
	}

	.progress-fill {
		height: 100%;
		background: var(--color-primary);
		transition: width 0.3s ease;
	}

	@media (max-width: 768px) {
		.upload-buttons {
			flex-direction: column;
		}

		.upload-btn {
			width: 100%;
			justify-content: center;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation: none;
		}

		.upload-btn:hover {
			transform: none;
		}
	}
</style>
