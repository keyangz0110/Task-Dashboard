<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		'aria-label'?: string;
		disabled?: boolean;
		children: Snippet;
	}

	let { class: className, 'aria-label': ariaLabel, disabled = false, children }: Props = $props();
</script>

<DropdownMenuPrimitive.Trigger
	{disabled}
	aria-label={ariaLabel}
	class={cn(
		'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
		className
	)}
>
	{@render children()}
</DropdownMenuPrimitive.Trigger>
