<script lang="ts">
	import { Separator as SeparatorPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		orientation?: 'horizontal' | 'vertical';
	}

	let { class: className, orientation = 'horizontal' }: Props = $props();
</script>

<SeparatorPrimitive.Root
	{orientation}
	class={cn(
		'shrink-0 bg-border',
		orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
		className
	)}
/>
