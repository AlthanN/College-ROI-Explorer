<script lang="ts">
	import { ScrollArea } from '#lib/components/ui/scroll-area/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import ArrowUpDownIcon from '@lucide/svelte/icons/arrow-up-down';
	import { CATEGORY_LABELS, CONTROL_COLORS, CONTROL_LABELS, category, money } from '#lib/format.js';
	import type { College } from '#lib/types.js';

	let {
		colleges,
		priceMax,
		selectedId,
		hoveredId = $bindable(),
		onselect
	}: {
		colleges: College[];
		priceMax: number;
		selectedId: number | null;
		hoveredId: number | null;
		onselect: (id: number) => void;
	} = $props();

	let lowestFirst = $state(true);
	const sorted = $derived(
		colleges.toSorted((a, b) => (lowestFirst ? a.netPrice - b.netPrice : b.netPrice - a.netPrice))
	);

	// When a college is picked in the scatterplot, bring its row into view.
	function revealIfSelected(id: number) {
		return (node: HTMLElement) => {
			if (id === selectedId) node.scrollIntoView({ block: 'nearest' });
		};
	}
</script>

<div class="flex h-full flex-col">
	<div class="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
		<h2 class="text-sm font-semibold">Colleges by net price</h2>
		<Button variant="ghost" size="sm" onclick={() => (lowestFirst = !lowestFirst)}>
			<ArrowUpDownIcon />
			{lowestFirst ? 'Lowest first' : 'Highest first'}
		</Button>
	</div>

	{#if sorted.length === 0}
		<p class="text-muted-foreground px-4 py-8 text-sm">No colleges match these filters. Try widening the price range or picking another state.</p>
	{:else}
		<ScrollArea class="h-[480px]">
			<ul class="px-2 pb-2">
				{#each sorted as college (college.id)}
					<li>
						<button
							type="button"
							class={[
								'grid w-full grid-cols-[1fr_auto] items-center gap-x-3 rounded-md px-2 py-1.5 text-left transition-colors',
								'focus-visible:ring-ring/50 outline-none focus-visible:ring-3',
								college.id === selectedId ? 'bg-accent' : college.id === hoveredId ? 'bg-muted' : 'hover:bg-muted'
							]}
							aria-pressed={college.id === selectedId}
							onclick={() => onselect(college.id)}
							onpointerenter={() => (hoveredId = college.id)}
							onpointerleave={() => (hoveredId = null)}
							{@attach revealIfSelected(college.id)}
						>
							<span class="min-w-0">
								<span class="block truncate text-sm font-medium">{college.name}</span>
								<span class="text-muted-foreground block truncate text-xs">
									{college.state} · {CONTROL_LABELS[college.control]} · {CATEGORY_LABELS[category(college.admitRate)]}
								</span>
							</span>
							<span class="text-sm font-medium tabular-nums">{money(college.netPrice)}</span>
							<span class="bg-muted col-span-2 mt-1 block h-1 overflow-hidden rounded-full">
								<span
									class="block h-full rounded-full"
									style:width="{(college.netPrice / priceMax) * 100}%"
									style:background={CONTROL_COLORS[college.control]}
								></span>
							</span>
						</button>
					</li>
				{/each}
			</ul>
		</ScrollArea>
	{/if}
</div>
