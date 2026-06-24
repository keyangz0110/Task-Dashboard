<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		value: string;
		class?: string;
		children: Snippet;
	}

	let { value, class: className, children }: Props = $props();
</script>

<TabsPrimitive.Content {value} class={cn('mt-4 focus-visible:outline-none', className)}>
	{@render children()}
</TabsPrimitive.Content>
