<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		align?: 'start' | 'center' | 'end';
		sideOffset?: number;
		children: Snippet;
	}

	let { class: className, align = 'end', sideOffset = 4, children }: Props = $props();
</script>

<DropdownMenuPrimitive.Portal>
	<DropdownMenuPrimitive.Content
		{align}
		{sideOffset}
		class={cn(
			'z-50 min-w-[10rem] overflow-hidden rounded-lg border border-border bg-card p-1 shadow-lg',
			className
		)}
	>
		{@render children()}
	</DropdownMenuPrimitive.Content>
</DropdownMenuPrimitive.Portal>
