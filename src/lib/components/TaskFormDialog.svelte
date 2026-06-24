<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import FieldLabel from '$lib/components/ui/field-label.svelte';
	import RadioGroupRoot from '$lib/components/ui/radio-group-root.svelte';
	import RadioGroupItem from '$lib/components/ui/radio-group-item.svelte';
	import ToggleGroupRoot from '$lib/components/ui/toggle-group-root.svelte';
	import ToggleGroupItem from '$lib/components/ui/toggle-group-item.svelte';
	import SelectField from '$lib/components/ui/select-field.svelte';
	import DatePickerField from '$lib/components/ui/date-picker-field.svelte';
	import DialogRoot from '$lib/components/ui/dialog-root.svelte';
	import DialogPortal from '$lib/components/ui/dialog-portal.svelte';
	import DialogOverlay from '$lib/components/ui/dialog-overlay.svelte';
	import DialogContent from '$lib/components/ui/dialog-content.svelte';
	import DialogTitle from '$lib/components/ui/dialog-title.svelte';
	import DialogClose from '$lib/components/ui/dialog-close.svelte';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { createCategory } from '$lib/supabase/tasks';
	import type {
		Profile,
		RoutineFrequency,
		Task,
		TaskCategory,
		TaskFormData,
		TaskKind
	} from '$lib/supabase/types';
	import { emptyTaskForm } from '$lib/supabase/types';
	import {
		AlertTriangle,
		Calendar,
		CalendarDays,
		CalendarRange,
		CircleDot,
		Clock,
		FolderPlus,
		Hourglass,
		Repeat,
		Star,
		Sun,
		Timer,
		User,
		UserPlus,
		Users
	} from '@lucide/svelte';

	interface Props {
		open: boolean;
		profiles: Profile[];
		categories: TaskCategory[];
		currentUserId: string;
		task?: Task | null;
		onClose: () => void;
		onSave: (form: TaskFormData) => Promise<void>;
		onCategoryCreated: (category: TaskCategory) => void;
	}

	let {
		open = $bindable(false),
		profiles,
		categories,
		currentUserId,
		task = null,
		onClose,
		onSave,
		onCategoryCreated
	}: Props = $props();

	let form = $state<TaskFormData>(emptyTaskForm(''));
	let saving = $state(false);
	let newCategoryName = $state('');
	let creatingCategory = $state(false);
	let categoryError = $state('');
	let priorityFlags = $state<string[]>([]);

	const otherProfiles = $derived(profiles.filter((p) => p.id !== currentUserId));

	const categoryItems = $derived([
		{ value: '', label: t($locale, 'noCategory') },
		...categories.map((category) => ({ value: category.id, label: category.name }))
	]);

	const assigneeItems = $derived(
		otherProfiles.map((profile) => ({ value: profile.id, label: profile.display_name }))
	);

	let categorySelectValue = $state('');

	const canSubmit = $derived(
		form.title.trim().length > 0 &&
			(form.assignment_type !== 'delegate' || otherProfiles.length > 0) &&
			(form.task_kind !== 'routine' || form.routine_frequency !== null)
	);

	$effect(() => {
		form.category_id = categorySelectValue ? categorySelectValue : null;
	});

	$effect(() => {
		if (form.task_kind === 'routine' && !form.routine_frequency) {
			form.routine_frequency = 'weekly';
		}
		if (form.task_kind === 'one_time') {
			form.routine_frequency = null;
		}
	});

	function priorityFlagsFromForm(value: TaskFormData): string[] {
		return [
			...(value.is_urgent ? ['urgent'] : []),
			...(value.is_important ? ['important'] : [])
		];
	}

	function onPriorityFlagsChange(flags: string[]) {
		priorityFlags = flags;
		form.is_urgent = flags.includes('urgent');
		form.is_important = flags.includes('important');
	}

	function taskKindFromTask(value: Task): TaskKind {
		return value.is_routine ? 'routine' : 'one_time';
	}

	function resetForm() {
		const nextForm: TaskFormData = task
			? {
					title: task.title,
					status: task.status,
					due_date: task.due_date ?? '',
					is_urgent: task.is_urgent,
					is_important: task.is_important,
					duration_type: task.duration_type,
					task_kind: taskKindFromTask(task),
					routine_frequency: task.routine_frequency,
					category_id: task.category_id,
					assignment_type:
						task.assigned_to !== currentUserId && task.assigned_by === currentUserId
							? 'delegate'
							: 'myself',
					assigned_to:
						task.assigned_to !== currentUserId
							? task.assigned_to
							: (otherProfiles[0]?.id ?? currentUserId),
					notes: task.notes
				}
			: emptyTaskForm(currentUserId);

		form = nextForm;
		priorityFlags = priorityFlagsFromForm(nextForm);
		categorySelectValue = nextForm.category_id ?? '';
		newCategoryName = '';
		categoryError = '';
	}

	$effect(() => {
		if (!open) return;
		const taskId = task?.id ?? null;
		const userId = currentUserId;
		void taskId;
		void userId;
		resetForm();
	});

	$effect(() => {
		if (form.assignment_type === 'myself') {
			form.assigned_to = currentUserId;
		} else if (form.assigned_to === currentUserId && otherProfiles.length > 0) {
			form.assigned_to = otherProfiles[0].id;
		}
	});

	async function addCategory() {
		if (!newCategoryName.trim()) return;
		creatingCategory = true;
		categoryError = '';
		try {
			const category = await createCategory(currentUserId, newCategoryName);
			onCategoryCreated(category);
			form.category_id = category.id;
			categorySelectValue = category.id;
			newCategoryName = '';
		} catch (err) {
			categoryError =
				err instanceof Error && err.message === 'Category Name is Required'
					? t($locale, 'categoryNameRequired')
					: err instanceof Error
						? err.message
						: t($locale, 'categoryCreateFailed');
		} finally {
			creatingCategory = false;
		}
	}

	async function submit(e: Event) {
		e.preventDefault();
		if (!canSubmit) return;
		saving = true;
		try {
			await onSave(form);
			open = false;
			onClose();
		} finally {
			saving = false;
		}
	}

	const frequencyOptions: { value: RoutineFrequency; labelKey: 'frequencyDaily' | 'frequencyWeekly' | 'frequencyQuarterly' | 'frequencyYearly'; icon: typeof Sun }[] = [
		{ value: 'daily', labelKey: 'frequencyDaily', icon: Sun },
		{ value: 'weekly', labelKey: 'frequencyWeekly', icon: CalendarDays },
		{ value: 'quarterly', labelKey: 'frequencyQuarterly', icon: CalendarRange },
		{ value: 'yearly', labelKey: 'frequencyYearly', icon: Calendar }
	];
</script>

<DialogRoot
	bind:open
	onOpenChange={(isOpen) => {
		if (!isOpen) onClose();
	}}
>
	<DialogPortal>
		<DialogOverlay />
		<DialogContent class="max-h-[90vh] max-w-xl overflow-y-auto">
			<DialogTitle class="mb-4">
				{t($locale, task ? 'editTask' : 'createTask')}
			</DialogTitle>

			<form class="space-y-5" onsubmit={submit}>
				<div class="space-y-2">
					<FieldLabel for="title">{t($locale, 'title')}</FieldLabel>
					<Input id="title" bind:value={form.title} required />
				</div>

				<div class="space-y-2">
					<FieldLabel for="due" icon={Calendar}>{t($locale, 'dueDate')}</FieldLabel>
					<DatePickerField id="due" bind:value={form.due_date} locale={$locale} inline />
				</div>

				<fieldset class="space-y-2">
					<p class="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
						<Users class="h-3.5 w-3.5" aria-hidden="true" />
						{t($locale, 'filterView')}
					</p>
					<RadioGroupRoot
						bind:value={form.assignment_type}
						orientation="horizontal"
						class="grid-cols-1 sm:grid-cols-2"
					>
						<RadioGroupItem value="myself" label={t($locale, 'forMyself')} icon={User} />
						<RadioGroupItem
							value="delegate"
							label={t($locale, 'delegateTask')}
							icon={UserPlus}
							disabled={otherProfiles.length === 0}
						/>
					</RadioGroupRoot>
					{#if form.assignment_type === 'delegate'}
						<div class="space-y-2 pt-1">
							<FieldLabel for="assignee" icon={UserPlus}>{t($locale, 'assignTo')}</FieldLabel>
							<SelectField
								id="assignee"
								bind:value={form.assigned_to}
								items={assigneeItems}
								required
								aria-label={t($locale, 'assignTo')}
							/>
						</div>
					{/if}
				</fieldset>

				<fieldset class="space-y-2">
					<p class="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
						<Star class="h-3.5 w-3.5" aria-hidden="true" />
						{t($locale, 'filterPriority')}
					</p>
					<ToggleGroupRoot
						bind:value={priorityFlags}
						onValueChange={onPriorityFlagsChange}
					>
						<ToggleGroupItem
							value="urgent"
							label={t($locale, 'urgent')}
							icon={AlertTriangle}
						/>
						<ToggleGroupItem
							value="important"
							label={t($locale, 'important')}
							icon={Star}
						/>
					</ToggleGroupRoot>
				</fieldset>

				<fieldset class="space-y-2">
					<p class="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
						<Clock class="h-3.5 w-3.5" aria-hidden="true" />
						{t($locale, 'filterDuration')}
					</p>
					<RadioGroupRoot
						bind:value={form.duration_type}
						orientation="horizontal"
						class="grid-cols-3"
					>
						<RadioGroupItem value="short" label={t($locale, 'short')} icon={Timer} />
						<RadioGroupItem value="medium" label={t($locale, 'medium')} icon={Clock} />
						<RadioGroupItem value="long" label={t($locale, 'long')} icon={Hourglass} />
					</RadioGroupRoot>
				</fieldset>

				<fieldset class="space-y-3">
					<p class="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
						<Calendar class="h-3.5 w-3.5" aria-hidden="true" />
						{t($locale, 'filterType')}
					</p>
					<RadioGroupRoot
						bind:value={form.task_kind}
						orientation="horizontal"
						class="grid-cols-1 sm:grid-cols-2"
					>
						<RadioGroupItem value="one_time" label={t($locale, 'oneTime')} icon={CircleDot} />
						<RadioGroupItem value="routine" label={t($locale, 'routine')} icon={Repeat} />
					</RadioGroupRoot>
					{#if form.task_kind === 'routine'}
						<div class="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
							<p class="text-xs font-medium text-muted-foreground">{t($locale, 'routineFrequency')}</p>
							<RadioGroupRoot
								value={form.routine_frequency ?? 'weekly'}
								onValueChange={(value) => {
									form.routine_frequency = value as RoutineFrequency;
								}}
								orientation="horizontal"
								class="grid-cols-2"
							>
								{#each frequencyOptions as option (option.value)}
									<RadioGroupItem
										value={option.value}
										label={t($locale, option.labelKey)}
										icon={option.icon}
										class="gap-2 px-3 py-2.5"
									/>
								{/each}
							</RadioGroupRoot>
						</div>
					{/if}
				</fieldset>

				<div class="space-y-2">
					<FieldLabel icon={FolderPlus}>{t($locale, 'category')}</FieldLabel>
					<SelectField
						bind:value={categorySelectValue}
						items={categoryItems}
						allowDeselect
						aria-label={t($locale, 'category')}
					/>
					<div class="flex gap-2">
						<Input
							class="min-w-0 flex-1"
							placeholder={t($locale, 'newCategory')}
							bind:value={newCategoryName}
							aria-label={t($locale, 'newCategory')}
						/>
						<Button
							type="button"
							variant="secondary"
							class="shrink-0 whitespace-nowrap"
							onclick={addCategory}
							disabled={creatingCategory}
						>
							<FolderPlus class="h-4 w-4" aria-hidden="true" />
							{t($locale, 'addCategory')}
						</Button>
					</div>
					{#if categoryError}
						<p class="text-sm text-destructive">{categoryError}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<FieldLabel for="notes">{t($locale, 'notes')}</FieldLabel>
					<Textarea id="notes" bind:value={form.notes} />
				</div>

				<div class="flex justify-end gap-2 pt-2">
					<DialogClose>
						{t($locale, 'cancel')}
					</DialogClose>
					<Button type="submit" disabled={saving || !canSubmit}>
						{saving ? t($locale, 'loading') : t($locale, 'save')}
					</Button>
				</div>
			</form>
		</DialogContent>
	</DialogPortal>
</DialogRoot>
