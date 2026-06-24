<script lang="ts">
	import { Menubar as MenubarPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children: Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<MenubarPrimitive.Root
	class={cn('flex items-center gap-1 rounded-lg border border-transparent p-1', className)}
>
	{@render children()}
</MenubarPrimitive.Root>
