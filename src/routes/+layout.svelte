<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>College ROI Explorer</title>
	<meta
		name="description"
		content="Compare what bachelor's colleges cost with what their graduates earn, using U.S. College Scorecard data."
	/>
</svelte:head>

<ModeWatcher defaultMode="light" />

<svelte:boundary>
	{@render children()}

	{#snippet pending()}
		<p class="text-muted-foreground p-6 text-sm">Loading college data…</p>
	{/snippet}
</svelte:boundary>
