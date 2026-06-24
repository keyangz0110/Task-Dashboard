<script lang="ts">
	import { Menubar as MenubarPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		disabled?: boolean;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		children?: Snippet;
	}

	let { class: className, disabled = false, child: content, children }: Props = $props();
</script>

{#if content}
	<MenubarPrimitive.Trigger {disabled}>
		{#snippet child({ props })}
			{@render content({ props: { ...props, class: cn(props.class as string, className) } })}
		{/snippet}
	</MenubarPrimitive.Trigger>
{:else}
	<MenubarPrimitive.Trigger
		{disabled}
		class={cn(
			'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-accent',
			className
		)}
	>
		{@render children?.()}
	</MenubarPrimitive.Trigger>
{/if}
