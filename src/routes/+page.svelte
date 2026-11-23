<script lang="ts">
	import SiteHeader from '#lib/components/site-header.svelte';
	import FilterBar from '#lib/components/filter-bar.svelte';
	import CollegeScatter from '#lib/components/college-scatter.svelte';
	import CollegeList from '#lib/components/college-list.svelte';
	import MajorsChart from '#lib/components/majors-chart.svelte';
	import CollegeDetails from '#lib/components/college-details.svelte';
	import { getColleges } from '#lib/data.remote.js';
	import { CONTROL_COLORS, CONTROL_LABELS } from '#lib/format.js';
	import type { College, Control } from '#lib/types.js';

	const colleges = await getColleges();

	// Round the slider's top end up to the next $10K so the most expensive college is included.
	const priceMax = Math.ceil(Math.max(...colleges.map((c) => c.netPrice)) / 10000) * 10000;
	const states = [...new Set(colleges.map((c) => c.state))].sort();
	const allTypes = ['1', '2', '3'];

	let stateCode = $state('all');
	let types = $state([...allTypes]);
	let priceRange = $state([0, priceMax]);
	let search = $state('');

	let selectedId = $state<number | null>(null);
	let selectedCip = $state<string | null>(null);
	let hoveredId = $state<number | null>(null);

	const isShown = $derived.by(() => {
		const query = search.trim().toLowerCase();
		return (college: College) =>
			(stateCode === 'all' || college.state === stateCode) &&
			types.includes(String(college.control)) &&
			college.netPrice >= priceRange[0] &&
			college.netPrice <= priceRange[1] &&
			(query === '' || college.name.toLowerCase().includes(query));
	});
	const shown = $derived(colleges.filter(isShown));
	const selected = $derived(colleges.find((c) => c.id === selectedId) ?? null);

	function selectCollege(id: number) {
		if (id !== selectedId) selectedCip = null;
		selectedId = id;
	}

	function resetFilters() {
		stateCode = 'all';
		types = [...allTypes];
		priceRange = [0, priceMax];
		search = '';
	}

	const controls: Control[] = [1, 2, 3];
</script>

<div class="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 md:px-8 md:py-8">
	<SiteHeader />

	<FilterBar
		{states}
		{priceMax}
		bind:stateCode
		bind:types
		bind:priceRange
		bind:search
		shown={shown.length}
		total={colleges.length}
		onreset={resetFilters}
	/>

	<div class="grid gap-4 lg:grid-cols-3">
		<section class="bg-card min-w-0 rounded-xl border p-4 lg:col-span-2" aria-labelledby="scatter-title">
			<div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
				<div>
					<h2 id="scatter-title" class="text-sm font-semibold">Net price vs. acceptance rate</h2>
					<p class="text-muted-foreground text-xs">
						Each dot is a college. Hover for details, click to see its majors. Gray dots are filtered out.
					</p>
				</div>
				<ul class="flex flex-wrap gap-x-4 gap-y-1 text-xs">
					{#each controls as control (control)}
						<li class="flex items-center gap-1.5">
							<span class="size-2.5 rounded-full" style:background={CONTROL_COLORS[control]}></span>
							{CONTROL_LABELS[control]}
						</li>
					{/each}
				</ul>
			</div>
			<CollegeScatter
				colleges={colleges}
				{isShown}
				{priceMax}
				{selectedId}
				bind:hoveredId
				onselect={selectCollege}
			/>
		</section>

		<section class="bg-card min-w-0 rounded-xl border" aria-label="College list">
			<CollegeList colleges={shown} {priceMax} {selectedId} bind:hoveredId onselect={selectCollege} />
		</section>
	</div>

	<div class="grid gap-4 lg:grid-cols-3">
		<section class="bg-card min-w-0 rounded-xl border p-4 lg:col-span-2" aria-labelledby="majors-title">
			<h2 id="majors-title" class="text-sm font-semibold">
				{selected ? `Majors at ${selected.name}` : 'Majors'}
			</h2>
			<p class="text-muted-foreground pb-3 text-xs">
				Bachelor's majors sorted by what graduates earn, with the typical debt they leave with.
			</p>
			{#if selected}
				<svelte:boundary>
					<MajorsChart college={selected} {selectedCip} onselect={(cip) => (selectedCip = cip)} />
					{#snippet pending()}
						<p class="text-muted-foreground py-8 text-sm">Loading majors…</p>
					{/snippet}
				</svelte:boundary>
			{:else}
				<p class="text-muted-foreground py-8 text-sm">Pick a college in the chart or the list to compare its majors.</p>
			{/if}
		</section>

		<section class="bg-card min-w-0 rounded-xl border p-4" aria-label="College details">
			{#if selected}
				<svelte:boundary>
					<CollegeDetails college={selected} {selectedCip} />
					{#snippet pending()}
						<p class="text-muted-foreground text-sm">Loading details…</p>
					{/snippet}
				</svelte:boundary>
			{:else}
				<h2 class="text-sm font-semibold">College details</h2>
				<p class="text-muted-foreground mt-1 text-sm">
					Cost, admission chances and outcomes for the college you pick show up here.
				</p>
			{/if}
		</section>
	</div>

	<footer class="text-muted-foreground max-w-3xl text-xs leading-relaxed">
		Data from the U.S. Department of Education College Scorecard (October 2026 release), limited to
		1,651 colleges that mainly award bachelor's degrees and report cost, graduation and earnings. Net
		price is the average yearly cost after grants for students who get federal aid. Earnings and debt
		are medians for federally aided students. Values the Scorecard hides for privacy are shown as no
		data.
	</footer>
</div>
