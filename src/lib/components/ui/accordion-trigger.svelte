<script lang="ts">
	import { Accordion as AccordionPrimitive } from 'bits-ui';
	import { ChevronDown } from '@lucide/svelte';
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children: Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<AccordionPrimitive.Header>
	<AccordionPrimitive.Trigger
		class={cn(
			'flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium transition-all hover:bg-accent [&[data-state=open]>svg]:rotate-180',
			className
		)}
	>
		{@render children()}
		<ChevronDown class="h-4 w-4 shrink-0 transition-transform" />
	</AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
