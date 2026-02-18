<script lang="ts">
	import { library, player } from '$lib/stores';
	import type { Track } from '$lib/types';

	let { tracks = $bindable([]) }: { tracks: Track[] } = $props();

	function handleTrackClick(track: Track, index: number) {
		player.playTrack(track, index);
	}

	function handleDelete(trackId: string, event: MouseEvent) {
		event.stopPropagation();
		if (confirm('Are you sure you want to delete this track?')) {
			library.removeTrack(trackId);
		}
	}

	function formatDuration(seconds?: number): string {
		if (!seconds) return '';
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<div class="library">
	{#if tracks.length === 0}
		<div class="empty-state">
			<div class="empty-icon">♪</div>
			<h2>No tracks yet</h2>
			<p>Add some music files to get started</p>
		</div>
	{:else}
		<div class="track-list">
			{#each tracks as track, index (track.id)}
				<div
					class="track-item"
					class:active={$player.currentTrack?.id === track.id}
					onclick={() => handleTrackClick(track, index)}
					onkeydown={(e) => e.key === 'Enter' && handleTrackClick(track, index)}
					role="button"
					tabindex="0"
				>
					{#if track.coverArt}
						<img src={track.coverArt} alt="" class="track-cover" />
					{:else}
						<div class="track-cover-placeholder">♪</div>
					{/if}

					<div class="track-info">
						<div class="track-title">{track.title}</div>
						{#if track.artist || track.album}
							<div class="track-meta">
								{#if track.artist}{track.artist}{/if}
								{#if track.artist && track.album} · {/if}
								{#if track.album}{track.album}{/if}
							</div>
						{/if}
					</div>

					{#if track.duration}
						<div class="track-duration">{formatDuration(track.duration)}</div>
					{/if}

					<button
						class="delete-btn"
						onclick={(e) => handleDelete(track.id, e)}
						aria-label="Delete track"
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
							<path d="M3 6h18M8 6V4h8v2m-5 3v6m4-6v6M5 6l1 14h12l1-14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.library {
		background: var(--color-surface);
		border-radius: var(--border-radius);
		padding: var(--spacing-lg);
		flex: 1;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-xl);
		text-align: center;
		height: 100%;
		color: var(--color-text-secondary);
	}

	.empty-icon {
		font-size: 4rem;
		color: var(--color-primary);
		margin-bottom: var(--spacing-md);
	}

	.empty-state h2 {
		margin-bottom: var(--spacing-sm);
		color: var(--color-text);
	}

	.track-list {
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.track-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-md);
		border-radius: var(--border-radius);
		cursor: pointer;
		transition: background var(--transition);
		position: relative;
	}

	.track-item:hover {
		background: var(--color-surface-hover);
	}

	.track-item.active {
		background: var(--color-primary);
	}

	.track-cover,
	.track-cover-placeholder {
		width: 48px;
		height: 48px;
		border-radius: 4px;
		flex-shrink: 0;
	}

	.track-cover {
		object-fit: cover;
	}

	.track-cover-placeholder {
		background: var(--color-bg);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-primary);
		font-size: 1.5rem;
	}

	.track-info {
		flex: 1;
		min-width: 0;
	}

	.track-title {
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.track-meta {
		font-size: 0.85rem;
		color: var(--color-text-secondary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.track-item.active .track-meta {
		color: rgba(255, 255, 255, 0.8);
	}

	.track-duration {
		font-size: 0.85rem;
		color: var(--color-text-secondary);
		margin-right: var(--spacing-sm);
	}

	.track-item.active .track-duration {
		color: rgba(255, 255, 255, 0.8);
	}

	.delete-btn {
		opacity: 0;
		padding: var(--spacing-sm);
		border-radius: 4px;
		transition: all var(--transition);
	}

	.track-item:hover .delete-btn {
		opacity: 1;
	}

	.delete-btn:hover {
		background: rgba(239, 68, 68, 0.2);
		color: #ef4444;
	}

	@media (max-width: 768px) {
		.library {
			padding: var(--spacing-md);
		}

		.track-item {
			padding: var(--spacing-sm);
		}

		.delete-btn {
			opacity: 1;
		}
	}
</style>
