<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import { cn } from '$lib/utils/cn';
	import type { Component, Snippet } from 'svelte';

	interface Props {
		for?: string;
		id?: string;
		icon?: Component;
		class?: string;
		children: Snippet;
	}

	let { for: htmlFor, id, icon: Icon, class: className, children }: Props = $props();
</script>

<Label
	for={htmlFor}
	{id}
	class={cn('inline-flex items-center gap-2', className)}
>
	{#if Icon}
		<Icon class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
	{/if}
	{@render children()}
</Label>
