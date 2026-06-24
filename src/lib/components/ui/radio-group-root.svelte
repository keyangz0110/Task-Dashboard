<script lang="ts">
	import { RadioGroup as RadioGroupPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	type Orientation = 'horizontal' | 'vertical';

	interface Props {
		value?: string;
		onValueChange?: (value: string) => void;
		orientation?: Orientation;
		class?: string;
		'aria-labelledby'?: string;
		children: Snippet;
	}

	let {
		value = $bindable(''),
		onValueChange,
		orientation = 'vertical',
		class: className,
		'aria-labelledby': ariaLabelledby,
		children
	}: Props = $props();
</script>

<RadioGroupPrimitive.Root
	bind:value
	{onValueChange}
	{orientation}
	aria-labelledby={ariaLabelledby}
	class={cn('grid gap-2', className)}
>
	{@render children()}
</RadioGroupPrimitive.Root>
