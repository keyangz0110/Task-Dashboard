<script lang="ts">
	import { Accordion as AccordionPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		value: string;
		class?: string;
		children: Snippet;
	}

	let { value, class: className, children }: Props = $props();
</script>

<AccordionPrimitive.Item {value} class={cn('rounded-lg border border-border bg-card', className)}>
	{@render children()}
</AccordionPrimitive.Item>
