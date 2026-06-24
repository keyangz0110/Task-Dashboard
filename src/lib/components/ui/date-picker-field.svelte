<script lang="ts">
	import { DatePicker } from 'bits-ui';
	import type { DateValue } from '@internationalized/date';
	import { cn } from '$lib/utils/cn';
	import {
		dateValueToString,
		getBitsLocale,
		stringToDateValue
	} from '$lib/utils/dates';
	import { Calendar, ChevronLeft, ChevronRight } from '@lucide/svelte';

	interface Props {
		value?: string;
		class?: string;
		id?: string;
		disabled?: boolean;
		locale?: string;
	}

	let {
		value = $bindable(''),
		class: className,
		id,
		disabled = false,
		locale = 'en'
	}: Props = $props();

	let pickerValue = $state<DateValue | undefined>(undefined);

	$effect(() => {
		pickerValue = stringToDateValue(value);
	});

	function handleValueChange(next: DateValue | undefined) {
		pickerValue = next;
		value = dateValueToString(next);
	}

	const inputClass = $derived(
		cn(
			'flex h-10 w-full items-center rounded-lg border border-input bg-card px-3 text-sm',
			'focus-within:outline-none focus-within:ring-2 focus-within:ring-ring',
			'disabled:cursor-not-allowed disabled:opacity-50',
			className
		)
	);

	const segmentClass =
		'rounded px-1 py-0.5 hover:bg-accent focus:bg-accent aria-[valuetext=Empty]:text-muted-foreground';

	const contentClass =
		'z-50 rounded-xl border border-border bg-card p-4 shadow-lg';

	const dayClass =
		'inline-flex size-9 items-center justify-center rounded-lg text-sm transition-colors hover:bg-accent data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[outside-month]:text-muted-foreground/50 data-[unavailable]:line-through';
</script>

<DatePicker.Root
	value={pickerValue}
	onValueChange={handleValueChange}
	locale={getBitsLocale(locale)}
	weekdayFormat="short"
	fixedWeeks={true}
	{disabled}
	closeOnDateSelect={true}
>
	<DatePicker.Input {id} class={inputClass}>
		{#snippet children({ segments })}
			{#each segments as { part, value: segmentValue }, index (part + String(index))}
				{#if part === 'literal'}
					<DatePicker.Segment {part} class="text-muted-foreground">
						{segmentValue}
					</DatePicker.Segment>
				{:else}
					<DatePicker.Segment {part} class={segmentClass}>
						{segmentValue}
					</DatePicker.Segment>
				{/if}
			{/each}
			<DatePicker.Trigger
				class="ml-auto inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent"
			>
				<Calendar class="h-4 w-4" aria-hidden="true" />
			</DatePicker.Trigger>
		{/snippet}
	</DatePicker.Input>
	<DatePicker.Content sideOffset={6} class={contentClass}>
		<DatePicker.Calendar>
			{#snippet children({ months, weekdays })}
				<DatePicker.Header class="mb-3 flex items-center justify-between">
					<DatePicker.PrevButton
						class="inline-flex size-9 items-center justify-center rounded-lg hover:bg-accent"
					>
						<ChevronLeft class="h-4 w-4" aria-hidden="true" />
					</DatePicker.PrevButton>
					<DatePicker.Heading class="text-sm font-medium" />
					<DatePicker.NextButton
						class="inline-flex size-9 items-center justify-center rounded-lg hover:bg-accent"
					>
						<ChevronRight class="h-4 w-4" aria-hidden="true" />
					</DatePicker.NextButton>
				</DatePicker.Header>
				{#each months as month (month.value)}
					<DatePicker.Grid class="w-full border-collapse">
						<DatePicker.GridHead>
							<DatePicker.GridRow class="flex">
								{#each weekdays as day (day)}
									<DatePicker.HeadCell
										class="w-9 text-center text-xs font-normal text-muted-foreground"
									>
										{day.slice(0, 2)}
									</DatePicker.HeadCell>
								{/each}
							</DatePicker.GridRow>
						</DatePicker.GridHead>
						<DatePicker.GridBody>
							{#each month.weeks as weekDates (weekDates)}
								<DatePicker.GridRow class="flex">
									{#each weekDates as date (date)}
										<DatePicker.Cell {date} month={month.value} class="p-0">
											<DatePicker.Day class={dayClass} />
										</DatePicker.Cell>
									{/each}
								</DatePicker.GridRow>
							{/each}
						</DatePicker.GridBody>
					</DatePicker.Grid>
				{/each}
			{/snippet}
		</DatePicker.Calendar>
	</DatePicker.Content>
</DatePicker.Root>
