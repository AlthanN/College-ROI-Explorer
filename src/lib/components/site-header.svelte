<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { mode, toggleMode } from 'mode-watcher';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';

	const REPO_URL = 'https://github.com/AlthanN/College-ROI-Explorer';
</script>

<header class="flex flex-wrap items-start justify-between gap-4">
	<div class="max-w-2xl">
		<h1 class="text-2xl font-semibold tracking-[-0.02em] text-balance">College ROI Explorer</h1>
		<p class="text-muted-foreground mt-1 text-sm text-pretty">
			Compare what bachelor's colleges cost with what their graduates earn. Pick a college to see how
			its majors pay off.
		</p>
	</div>

	<div class="flex items-center gap-1">
		<Button
			variant="ghost"
			size="icon"
			href={REPO_URL}
			target="_blank"
			rel="noreferrer"
			aria-label="View the source code on GitHub"
			title="View on GitHub"
		>
			<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
				<path
					d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.6 18.3 5 18.3 5c.7 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"
				/>
			</svg>
		</Button>
		<Button
			variant="ghost"
			size="icon"
			onclick={toggleMode}
			aria-label={mode.current === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
			title={mode.current === 'dark' ? 'Light mode' : 'Dark mode'}
		>
			{#if mode.current === 'dark'}
				<SunIcon />
			{:else}
				<MoonIcon />
			{/if}
		</Button>
	</div>
</header>
