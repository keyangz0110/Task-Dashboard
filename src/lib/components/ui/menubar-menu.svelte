<script lang="ts">
	import { Menubar as MenubarPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		value?: string;
		children: Snippet;
	}

	let { value, children }: Props = $props();
</script>

<MenubarPrimitive.Menu {value}>
	{@render children()}
</MenubarPrimitive.Menu>
