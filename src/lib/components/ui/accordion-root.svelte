<script lang="ts">
	import { Accordion as AccordionPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children: Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<AccordionPrimitive.Root type="multiple" class={cn('space-y-2', className)}>
	{@render children()}
</AccordionPrimitive.Root>
