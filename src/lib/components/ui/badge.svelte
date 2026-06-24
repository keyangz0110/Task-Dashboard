<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { HTMLAttributes } from 'svelte/elements';

	type Variant = 'default' | 'urgent' | 'important' | 'routine' | 'status';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		variant?: Variant;
		class?: string;
	}

	let { variant = 'default', class: className, children, ...rest }: Props = $props();

	const variants: Record<Variant, string> = {
		default: 'bg-muted text-muted-foreground',
		urgent: 'bg-destructive/15 text-destructive',
		important: 'bg-primary/15 text-primary',
		routine: 'bg-accent text-accent-foreground',
		status: 'bg-card border border-border text-foreground'
	};
</script>

<span
	class={cn(
		'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
		variants[variant],
		className
	)}
	{...rest}
>
	{@render children?.()}
</span>
