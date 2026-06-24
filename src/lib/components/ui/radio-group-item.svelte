<script lang="ts">
	import { RadioGroup as RadioGroupPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';
	import type { Component } from 'svelte';

	interface Props {
		value: string;
		label: string;
		icon?: Component;
		disabled?: boolean;
		class?: string;
	}

	let { value, label, icon: Icon, disabled = false, class: className }: Props = $props();
</script>

<RadioGroupPrimitive.Item
	{value}
	{disabled}
	class={cn(
		'group flex w-full min-w-0 items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left text-sm transition-all',
		'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
		'data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 data-[state=checked]:ring-1 data-[state=checked]:ring-primary',
		disabled && 'cursor-not-allowed opacity-50',
		className
	)}
>
	{#snippet children({ checked })}
		{#if Icon}
			<span
				class={cn(
					'flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground',
					checked && 'bg-primary/20 text-primary'
				)}
				aria-hidden="true"
			>
				<Icon class="h-4 w-4" />
			</span>
		{/if}
		<span class="min-w-0 font-medium leading-tight">{label}</span>
	{/snippet}
</RadioGroupPrimitive.Item>
