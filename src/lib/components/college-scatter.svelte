<script lang="ts">
	import { Delaunay, median, scaleLinear } from 'd3';
	import {
		CATEGORY_LABELS,
		CONTROL_COLORS,
		CONTROL_LABELS,
		REACH_BELOW,
		SAFETY_FROM,
		category,
		money,
		moneyShort,
		percent
	} from '#lib/format.js';
	import type { College } from '#lib/types.js';

	let {
		colleges,
		isShown,
		priceMax,
		selectedId,
		hoveredId = $bindable(),
		onselect
	}: {
		colleges: College[];
		isShown: (college: College) => boolean;
		priceMax: number;
		selectedId: number | null;
		hoveredId: number | null;
		onselect: (id: number) => void;
	} = $props();

	let width = $state(760);
	const height = 472;
	const margin = { top: 28, right: 64, bottom: 84, left: 52 };
	const plotHeight = height - margin.top - margin.bottom;
	// Colleges without an acceptance rate sit in a strip under the x axis instead of being dropped.
	const stripY = plotHeight + 50;

	const innerWidth = $derived(Math.max(0, width - margin.left - margin.right));
	const x = $derived(scaleLinear().domain([0, priceMax]).range([0, innerWidth]));
	const y = scaleLinear().domain([0, 1]).range([plotHeight, 0]);

	// Small fixed vertical offset per college so the no-data strip doesn't collapse into one line.
	const jitter = (id: number) => (((id * 2654435761) % 997) / 997 - 0.5) * 14;

	const points = $derived(
		colleges.map((college) => ({
			college,
			px: x(college.netPrice),
			py: college.admitRate === null ? stripY + jitter(college.id) : y(college.admitRate),
			shown: isShown(college)
		}))
	);
	const active = $derived(points.filter((p) => p.shown));
	const faint = $derived(points.filter((p) => !p.shown));
	const delaunay = $derived(Delaunay.from(active, (p) => p.px, (p) => p.py));
	const medianPrice = $derived(median(active, (p) => p.college.netPrice));

	const hovered = $derived(active.find((p) => p.college.id === hoveredId));
	const selected = $derived(points.find((p) => p.college.id === selectedId));

	const bands = [
		{ label: 'Safety', from: SAFETY_FROM, to: 1 },
		{ label: 'Target', from: REACH_BELOW, to: SAFETY_FROM },
		{ label: 'Reach', from: 0, to: REACH_BELOW }
	];

	function nearest(event: PointerEvent) {
		const rect = (event.currentTarget as SVGRectElement).getBoundingClientRect();
		const mx = event.clientX - rect.left;
		const my = event.clientY - rect.top;
		const index = delaunay.find(mx, my);
		const point = active[index];
		if (!point) return null;
		return Math.hypot(point.px - mx, point.py - my) < 24 ? point : null;
	}
</script>

<div class="relative min-w-0 overflow-hidden" bind:clientWidth={width}>
	<svg {width} {height} role="img" aria-label="Scatterplot of net price against acceptance rate for each college">
		<g transform="translate({margin.left},{margin.top})">
			<!-- Safety / target / reach bands -->
			{#each bands as band, i (band.label)}
				<rect
					x={0}
					y={y(band.to)}
					width={innerWidth}
					height={y(band.from) - y(band.to)}
					class={i === 1 ? 'fill-chart-band' : 'fill-transparent'}
				/>
				<text x={innerWidth + 10} y={(y(band.from) + y(band.to)) / 2} dy="0.35em" class="fill-foreground text-xs font-medium">
					{band.label}
				</text>
			{/each}
			<text x={innerWidth + 10} y={stripY} dy="0.35em" class="fill-muted-foreground text-[11px]">No data</text>

			<!-- Gridlines and axes -->
			{#each [0, 0.2, 0.4, 0.6, 0.8, 1] as tick (tick)}
				<line x1={0} x2={innerWidth} y1={y(tick)} y2={y(tick)} class="stroke-chart-grid" />
				<text x={-8} y={y(tick)} dy="0.35em" text-anchor="end" class="fill-muted-foreground text-[11px] tabular-nums">
					{percent(tick)}
				</text>
			{/each}
			{#each [REACH_BELOW, SAFETY_FROM] as cut (cut)}
				<line x1={0} x2={innerWidth} y1={y(cut)} y2={y(cut)} class="stroke-muted-foreground/60" />
			{/each}
			{#each x.ticks(width < 520 ? 4 : 7) as tick (tick)}
				<text x={x(tick)} y={plotHeight + 18} text-anchor="middle" class="fill-muted-foreground text-[11px] tabular-nums">
					{moneyShort(tick)}
				</text>
			{/each}
			<line x1={0} x2={innerWidth} y1={plotHeight} y2={plotHeight} class="stroke-border" />
			<text x={innerWidth / 2} y={height - margin.top - 4} text-anchor="middle" class="fill-muted-foreground text-xs">
				Net price per year
			</text>
			<text transform="rotate(-90)" x={-plotHeight / 2} y={-40} text-anchor="middle" class="fill-muted-foreground text-xs">
				Acceptance rate
			</text>

			<!-- Median net price of the colleges that pass the filters -->
			{#if medianPrice !== undefined}
				<line x1={x(medianPrice)} x2={x(medianPrice)} y1={-4} y2={plotHeight} class="stroke-chart-ink" stroke-width="1" />
				<text x={x(medianPrice)} y={-10} text-anchor="middle" class="fill-foreground text-[11px] font-medium tabular-nums">
					Median {moneyShort(medianPrice)}
				</text>
			{/if}

			<!-- Filtered-out colleges stay as faint context -->
			{#each faint as p (p.college.id)}
				<circle cx={p.px} cy={p.py} r={2.5} class="fill-chart-faint" />
			{/each}
			{#each active as p (p.college.id)}
				<circle
					cx={p.px}
					cy={p.py}
					r={3.5}
					fill={CONTROL_COLORS[p.college.control]}
					fill-opacity={0.8}
					class="stroke-background"
					stroke-width={0.75}
				/>
			{/each}

			{#if hovered && hovered !== selected}
				<circle cx={hovered.px} cy={hovered.py} r={6} fill={CONTROL_COLORS[hovered.college.control]} class="stroke-background" stroke-width={2} />
			{/if}
			{#if selected}
				<circle cx={selected.px} cy={selected.py} r={7} fill={CONTROL_COLORS[selected.college.control]} class="stroke-foreground" stroke-width={2} />
				<text
					x={selected.px + (selected.px > innerWidth * 0.7 ? -11 : 11)}
					y={selected.py}
					dy="0.35em"
					text-anchor={selected.px > innerWidth * 0.7 ? 'end' : 'start'}
					class="fill-foreground stroke-background text-xs font-semibold [paint-order:stroke]"
					stroke-width={4}
				>
					{selected.college.name}
				</text>
			{/if}

			<!-- One hit layer finds the nearest college, so small dots are easy to hover and click -->
			<rect
				role="presentation"
				x={0}
				y={0}
				width={innerWidth}
				height={stripY + 12}
				fill="transparent"
				class={hoveredId ? 'cursor-pointer' : ''}
				onpointermove={(event) => (hoveredId = nearest(event)?.college.id ?? null)}
				onpointerleave={() => (hoveredId = null)}
				onclick={(event) => {
					const point = nearest(event as unknown as PointerEvent);
					if (point) onselect(point.college.id);
				}}
			/>
		</g>
	</svg>

	{#if hovered}
		{@const c = hovered.college}
		<div
			class="bg-popover text-popover-foreground pointer-events-none absolute z-10 w-60 rounded-lg border p-3 text-xs shadow-[0_4px_16px_-4px_rgb(0_0_0/0.18)]"
			style:left="{Math.min(hovered.px + margin.left + 14, width - 250)}px"
			style:top="{hovered.py + margin.top + 14}px"
		>
			<p class="text-sm font-semibold leading-snug">{c.name}</p>
			<p class="text-muted-foreground">{c.city}, {c.state} · {CONTROL_LABELS[c.control]}</p>
			<dl class="mt-2 grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 tabular-nums">
				<dt class="text-muted-foreground">Net price per year</dt>
				<dd class="text-right font-medium">{money(c.netPrice)}</dd>
				<dt class="text-muted-foreground">Acceptance rate</dt>
				<dd class="text-right font-medium">{c.admitRate === null ? 'No data' : percent(c.admitRate)}</dd>
				<dt class="text-muted-foreground">Category</dt>
				<dd class="text-right font-medium">{CATEGORY_LABELS[category(c.admitRate)]}</dd>
			</dl>
		</div>
	{/if}
</div>
