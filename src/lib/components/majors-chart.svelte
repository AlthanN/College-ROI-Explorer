<script lang="ts">
	import { max, scaleLinear } from 'd3';
	import { getPrograms } from '#lib/data.remote.js';
	import { money, moneyShort } from '#lib/format.js';
	import type { College } from '#lib/types.js';

	let {
		college,
		selectedCip,
		onselect
	}: {
		college: College;
		selectedCip: string | null;
		onselect: (cip: string) => void;
	} = $props();

	const programs = $derived(await getPrograms(college.id));
	const sorted = $derived(programs.toSorted((a, b) => b.earnings - a.earnings));

	let width = $state(760);
	const rowHeight = 28;
	const margin = $derived({ top: 28, right: 56, bottom: 8, left: width < 560 ? 132 : 236 });
	const innerWidth = $derived(Math.max(0, width - margin.left - margin.right));
	const height = $derived(margin.top + sorted.length * rowHeight + margin.bottom);
	const x = $derived(
		scaleLinear()
			.domain([0, max(sorted, (p) => Math.max(p.earnings, p.debt ?? 0)) ?? 1])
			.nice()
			.range([0, innerWidth])
	);

	let hoveredCip = $state<string | null>(null);

	const maxChars = $derived(width < 560 ? 18 : 34);
	const truncate = (name: string) => (name.length > maxChars ? name.slice(0, maxChars - 1) + '…' : name);
</script>

{#if sorted.length === 0}
	<p class="text-muted-foreground py-8 text-sm">
		The Scorecard has no earnings data for majors at {college.name}, usually because too few graduates
		were reported to publish it.
	</p>
{:else}
	<div class="flex flex-wrap items-center gap-x-5 gap-y-1 pb-2 text-xs">
		<span class="flex items-center gap-2">
			<span class="bg-chart-ink h-2.5 w-5 rounded-sm"></span>Median earnings 4 years after graduating
		</span>
		<span class="flex items-center gap-2">
			<svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="4" class="fill-background stroke-foreground" stroke-width="2" /></svg>
			Median debt
		</span>
		<span class="text-muted-foreground">Click a major for details</span>
	</div>

	<div class="max-h-[420px] min-w-0 overflow-x-hidden overflow-y-auto" bind:clientWidth={width}>
		<svg {width} {height} role="img" aria-label="Bar chart of median earnings by major at {college.name}">
			<g transform="translate({margin.left},{margin.top})">
				{#each x.ticks(width < 560 ? 3 : 6) as tick (tick)}
					<line x1={x(tick)} x2={x(tick)} y1={-6} y2={sorted.length * rowHeight} class="stroke-chart-grid" />
					<text x={x(tick)} y={-12} text-anchor="middle" class="fill-muted-foreground text-[11px] tabular-nums">{moneyShort(tick)}</text>
				{/each}

				{#each sorted as program, i (program.cip)}
					{@const isSelected = program.cip === selectedCip}
					{@const y = i * rowHeight}
					<g
						role="button"
						tabindex="0"
						aria-label="{program.name}: earnings {money(program.earnings)}{program.debt === null ? '' : `, debt ${money(program.debt)}`}"
						aria-pressed={isSelected}
						class="cursor-pointer outline-none"
						onclick={() => onselect(program.cip)}
						onkeydown={(event) => (event.key === 'Enter' || event.key === ' ') && (event.preventDefault(), onselect(program.cip))}
						onpointerenter={() => (hoveredCip = program.cip)}
						onpointerleave={() => (hoveredCip = null)}
					>
						<rect x={-margin.left} y={y} width={width} height={rowHeight} class={isSelected ? 'fill-accent' : hoveredCip === program.cip ? 'fill-muted' : 'fill-transparent'} />
						<text x={-12} y={y + rowHeight / 2} dy="0.35em" text-anchor="end" class={['text-xs', isSelected ? 'fill-foreground font-semibold' : 'fill-foreground']}>
							<title>{program.name}</title>
							{truncate(program.name)}
						</text>
						<rect x={0} y={y + 7} width={x(program.earnings)} height={rowHeight - 14} rx={3} class="fill-chart-ink" fill-opacity={isSelected ? 1 : 0.85} />
						<text x={x(program.earnings) + 6} y={y + rowHeight / 2} dy="0.35em" class="fill-muted-foreground text-[11px] tabular-nums">
							{moneyShort(program.earnings)}
						</text>
						{#if program.debt !== null}
							<circle cx={x(program.debt)} cy={y + rowHeight / 2} r={4} class="fill-background stroke-foreground" stroke-width={2} />
						{/if}
					</g>
				{/each}
			</g>
		</svg>
	</div>
{/if}
