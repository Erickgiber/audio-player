<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Audio Player</title>
	<meta name="description" content="Offline-capable audio player" />
</svelte:head>

{@render children()}
