<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();
</script>

<DialogPrimitive.Overlay class={cn('fixed inset-0 z-40 bg-black/55', className)} />
