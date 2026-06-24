<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import Button from '$lib/components/ui/button.svelte';
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'secondary' | 'ghost' | 'destructive' | 'outline';

	interface Props {
		variant?: Variant;
		class?: string;
		children: Snippet;
	}

	let { variant = 'outline', class: className, children }: Props = $props();
</script>

<DialogPrimitive.Close>
	{#snippet child({ props })}
		<Button {...props} type="button" {variant} class={className}>
			{@render children()}
		</Button>
	{/snippet}
</DialogPrimitive.Close>
