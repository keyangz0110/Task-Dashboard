<script lang="ts">
	import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		value?: string[];
		onValueChange?: (value: string[]) => void;
		class?: string;
		'aria-labelledby'?: string;
		children: Snippet;
	}

	let {
		value = $bindable<string[]>([]),
		onValueChange,
		class: className,
		'aria-labelledby': ariaLabelledby,
		children
	}: Props = $props();
</script>

<ToggleGroupPrimitive.Root
	type="multiple"
	bind:value
	{onValueChange}
	aria-labelledby={ariaLabelledby}
	class={cn('flex flex-wrap gap-2', className)}
>
	{@render children()}
</ToggleGroupPrimitive.Root>
