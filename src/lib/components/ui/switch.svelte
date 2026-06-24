<script lang="ts">
	import { Switch as SwitchPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';

	interface Props {
		checked?: boolean;
		onCheckedChange?: (checked: boolean) => void;
		class?: string;
		id?: string;
	}

	let { checked = $bindable(false), onCheckedChange, class: className, id }: Props = $props();
</script>

<SwitchPrimitive.Root
	{id}
	bind:checked
	{onCheckedChange}
	class={cn(
		'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-muted transition-colors data-[state=checked]:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
		className
	)}
>
	<SwitchPrimitive.Thumb
		class="pointer-events-none block h-5 w-5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
	/>
</SwitchPrimitive.Root>
