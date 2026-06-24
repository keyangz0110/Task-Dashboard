<script lang="ts">
	import { Menubar as MenubarPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		disabled?: boolean;
		onSelect?: (event: Event) => void;
		children: Snippet;
	}

	let { class: className, disabled = false, onSelect, children }: Props = $props();
</script>

<MenubarPrimitive.Item
	{disabled}
	{onSelect}
	class={cn(
		'relative flex cursor-default select-none items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
		className
	)}
>
	{@render children()}
</MenubarPrimitive.Item>
