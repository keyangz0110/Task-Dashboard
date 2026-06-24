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

<AccordionPrimitive.Content class={cn('px-4 pb-4 text-sm text-muted-foreground', className)}>
	{@render children()}
</AccordionPrimitive.Content>
