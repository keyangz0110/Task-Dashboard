<script lang="ts">
	import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';
	import type { Component } from 'svelte';

	interface Props {
		value: string;
		label: string;
		icon: Component;
		disabled?: boolean;
		class?: string;
	}

	let { value, label, icon: Icon, disabled = false, class: className }: Props = $props();
</script>

<ToggleGroupPrimitive.Item
	{value}
	{disabled}
	aria-label={label}
	class={cn(
		'inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-all',
		'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
		'data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary',
		disabled && 'cursor-not-allowed opacity-50',
		className
	)}
>
	{#snippet children({ pressed })}
		<Icon
			class={cn('h-4 w-4', pressed ? 'text-primary' : 'text-muted-foreground')}
			aria-hidden="true"
		/>
		<span>{label}</span>
	{/snippet}
</ToggleGroupPrimitive.Item>
