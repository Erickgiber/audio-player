<script lang="ts">
	import { onMount } from 'svelte';
	import { library } from '$lib/stores';
	import { storageManager } from '$lib/storage';
	import Player from '$lib/components/Player.svelte';
	import Library from '$lib/components/Library.svelte';
	import FileUploader from '$lib/components/FileUploader.svelte';

	let isLoading = $state(true);

	onMount(async () => {
		// Initialize storage
		await storageManager.init();
		
		// Load library
		await library.load();
		
		isLoading = false;
	});
</script>

<div class="app-container">
	<header class="header">
		<h1>🎵 Audio Player</h1>
		<p class="subtitle">Offline Music Library</p>
	</header>

	{#if isLoading}
		<div class="loading-screen">
			<div class="spinner"></div>
			<p>Loading...</p>
		</div>
	{:else}
		<FileUploader />
		<Player />
		<Library tracks={$library} />
	{/if}
</div>

<style>
	.header {
		text-align: center;
		margin-bottom: var(--spacing-xl);
		padding: var(--spacing-lg) 0;
	}

	.header h1 {
		font-size: 2rem;
		margin-bottom: var(--spacing-xs);
		background: linear-gradient(135deg, var(--color-primary), #ec4899);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		color: var(--color-text-secondary);
		font-size: 0.9rem;
	}

	.loading-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		color: var(--color-text-secondary);
	}

	.spinner {
		width: 48px;
		height: 48px;
		margin-bottom: var(--spacing-md);
		border: 4px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation: none;
		}
	}
</style>

