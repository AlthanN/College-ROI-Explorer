<script lang="ts">
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { getPrograms } from '#lib/data.remote.js';
	import { CATEGORY_LABELS, CONTROL_LABELS, STATE_NAMES, category, count, money, percent } from '#lib/format.js';
	import type { College } from '#lib/types.js';

	let { college, selectedCip }: { college: College; selectedCip: string | null } = $props();

	const programs = $derived(await getPrograms(college.id));
	const program = $derived(programs.find((p) => p.cip === selectedCip) ?? null);
	const fourYearCost = $derived(college.netPrice * 4);
</script>

<div class="grid gap-4">
	<div>
		<h2 class="text-base font-semibold leading-snug text-balance">{college.name}</h2>
		<p class="text-muted-foreground text-sm">
			{college.city}, {STATE_NAMES[college.state] ?? college.state} · {CONTROL_LABELS[college.control]}
			{#if college.size !== null}· {count(college.size)} undergraduates{/if}
		</p>
	</div>

	<dl class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-sm tabular-nums">
		<dt class="text-muted-foreground">Net price per year</dt>
		<dd class="text-right font-medium">{money(college.netPrice)}</dd>
		<dt class="text-muted-foreground">Estimated cost for 4 years</dt>
		<dd class="text-right font-medium">{money(fourYearCost)}</dd>
		<dt class="text-muted-foreground">Acceptance rate</dt>
		<dd class="text-right font-medium">
			{college.admitRate === null ? 'No data' : `${percent(college.admitRate)} · ${CATEGORY_LABELS[category(college.admitRate)]}`}
		</dd>
		<dt class="text-muted-foreground">Graduation rate</dt>
		<dd class="text-right font-medium">{percent(college.gradRate)}</dd>
		<dt class="text-muted-foreground">Median earnings 10 years after starting</dt>
		<dd class="text-right font-medium">{money(college.earnings)}</dd>
		<dt class="text-muted-foreground">Median debt at graduation</dt>
		<dd class="text-right font-medium">{college.debt === null ? 'No data' : money(college.debt)}</dd>
	</dl>

	<Separator />

	{#if program}
		<div class="grid gap-2">
			<h3 class="text-sm font-semibold text-balance">{program.name}</h3>
			<dl class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-sm tabular-nums">
				<dt class="text-muted-foreground">Median earnings 4 years after graduating</dt>
				<dd class="text-right font-medium">{money(program.earnings)}</dd>
				<dt class="text-muted-foreground">Median debt</dt>
				<dd class="text-right font-medium">{program.debt === null ? 'No data' : money(program.debt)}</dd>
				{#if program.debt !== null}
					<dt class="text-muted-foreground">Debt compared with a year's pay</dt>
					<dd class="text-right font-medium">{percent(program.debt / program.earnings)}</dd>
				{/if}
			</dl>
		</div>
	{:else}
		<p class="text-muted-foreground text-sm">Pick a major in the chart to see its earnings and debt here.</p>
	{/if}
</div>
