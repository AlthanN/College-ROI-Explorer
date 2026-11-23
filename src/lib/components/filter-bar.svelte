<script lang="ts">
	import * as Select from '#lib/components/ui/select/index.js';
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js';
	import { Slider } from '#lib/components/ui/slider/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { CONTROL_COLORS, CONTROL_LABELS, STATE_NAMES, count, moneyShort } from '#lib/format.js';
	import type { Control } from '#lib/types.js';

	let {
		states,
		priceMax,
		stateCode = $bindable(),
		types = $bindable(),
		priceRange = $bindable(),
		search = $bindable(),
		shown,
		total,
		onreset
	}: {
		states: string[];
		priceMax: number;
		stateCode: string;
		types: string[];
		priceRange: number[];
		search: string;
		shown: number;
		total: number;
		onreset: () => void;
	} = $props();

	const stateLabel = $derived(stateCode === 'all' ? 'All states' : (STATE_NAMES[stateCode] ?? stateCode));
	const controls: Control[] = [1, 2, 3];
</script>

<div class="flex flex-wrap items-end gap-x-6 gap-y-4">
	<label class="grid gap-1.5">
		<span class="text-muted-foreground text-xs font-medium">State</span>
		<Select.Root type="single" bind:value={stateCode}>
			<Select.Trigger class="w-48" aria-label="Filter by state">{stateLabel}</Select.Trigger>
			<Select.Content class="max-h-80">
				<Select.Item value="all" label="All states">All states</Select.Item>
				{#each states as code (code)}
					<Select.Item value={code} label={STATE_NAMES[code] ?? code}>{STATE_NAMES[code] ?? code}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</label>

	<div class="grid max-w-full gap-1.5 overflow-x-auto">
		<span class="text-muted-foreground text-xs font-medium" id="type-label">College type</span>
		<ToggleGroup.Root type="multiple" variant="outline" bind:value={types} aria-labelledby="type-label">
			{#each controls as control (control)}
				<ToggleGroup.Item value={String(control)} class="gap-2 px-3">
					<span class="size-2 rounded-full" style:background={CONTROL_COLORS[control]}></span>
					{CONTROL_LABELS[control]}
				</ToggleGroup.Item>
			{/each}
		</ToggleGroup.Root>
	</div>

	<div class="grid w-full gap-1.5 sm:w-64">
		<span class="text-muted-foreground flex justify-between text-xs font-medium">
			<span id="price-label">Net price per year</span>
			<span class="text-foreground tabular-nums">{moneyShort(priceRange[0])} – {moneyShort(priceRange[1])}</span>
		</span>
		<Slider
			type="multiple"
			bind:value={priceRange}
			min={0}
			max={priceMax}
			step={1000}
			class="py-2"
			aria-labelledby="price-label"
		/>
	</div>

	<label class="grid w-full gap-1.5 sm:w-auto">
		<span class="text-muted-foreground text-xs font-medium">Find a college</span>
		<span class="relative">
			<SearchIcon class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
			<Input bind:value={search} placeholder="College name" class="w-full pl-8 sm:w-56" type="search" />
		</span>
	</label>

	<div class="ml-auto flex items-center gap-3">
		<p class="text-muted-foreground text-xs tabular-nums" aria-live="polite">
			Showing <span class="text-foreground font-medium">{count(shown)}</span> of {count(total)} colleges
		</p>
		<Button variant="outline" size="sm" onclick={onreset}>
			<RotateCcwIcon />
			Reset filters
		</Button>
	</div>
</div>
