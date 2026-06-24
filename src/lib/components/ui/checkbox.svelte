<script lang="ts">
	import { Checkbox as CheckboxPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';
	import { Check } from '@lucide/svelte';

	interface Props {
		checked?: boolean;
		disabled?: boolean;
		required?: boolean;
		name?: string;
		value?: string;
		id?: string;
		class?: string;
		'aria-label'?: string;
	}

	let {
		checked = $bindable(false),
		disabled = false,
		required = false,
		name,
		value = 'on',
		id,
		class: className,
		'aria-label': ariaLabel
	}: Props = $props();
</script>

<CheckboxPrimitive.Root
	bind:checked
	{disabled}
	{required}
	{name}
	{value}
	{id}
	aria-label={ariaLabel}
	class={cn(
		'peer inline-flex size-4 shrink-0 items-center justify-center rounded border border-input bg-card transition-colors',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
		'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
		'disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
>
	{#snippet children({ checked: isChecked })}
		{#if isChecked}
			<Check class="size-3" aria-hidden="true" />
		{/if}
	{/snippet}
</CheckboxPrimitive.Root>
