<script lang="ts">
	import { Select } from 'bits-ui';
	import { cn } from '$lib/utils/cn';
	import { Check, ChevronDown } from '@lucide/svelte';

	export interface SelectFieldItem {
		value: string;
		label: string;
		disabled?: boolean;
	}

	interface Props {
		value?: string;
		items: SelectFieldItem[];
		placeholder?: string;
		class?: string;
		id?: string;
		disabled?: boolean;
		required?: boolean;
		allowDeselect?: boolean;
		onValueChange?: (value: string) => void;
		'aria-label'?: string;
	}

	let {
		value = $bindable(''),
		items,
		placeholder = '',
		class: className,
		id,
		disabled = false,
		required = false,
		allowDeselect = false,
		onValueChange,
		'aria-label': ariaLabel
	}: Props = $props();

	const triggerClass = $derived(
		cn(
			'flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 text-sm',
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
			'disabled:cursor-not-allowed disabled:opacity-50',
			className
		)
	);

	const contentClass =
		'z-50 max-h-60 min-w-[var(--bits-select-anchor-width)] overflow-auto rounded-lg border border-border bg-card p-1 shadow-lg';

	const itemClass =
		'relative flex cursor-default select-none items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50';
</script>

<Select.Root
	type="single"
	bind:value
	{items}
	{disabled}
	{required}
	{allowDeselect}
	{onValueChange}
>
	<Select.Trigger {id} aria-label={ariaLabel} class={triggerClass}>
		<Select.Value {placeholder} class="flex-1 truncate text-left" />
		<ChevronDown class="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
	</Select.Trigger>
	<Select.Portal>
		<Select.Content class={contentClass} sideOffset={4}>
			{#each items as item (item.value)}
				<Select.Item value={item.value} label={item.label} disabled={item.disabled} class={itemClass}>
					{#snippet children({ selected })}
						<span class="flex-1">{item.label}</span>
						{#if selected}
							<Check class="h-4 w-4 text-primary" aria-hidden="true" />
						{/if}
					{/snippet}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Portal>
</Select.Root>
