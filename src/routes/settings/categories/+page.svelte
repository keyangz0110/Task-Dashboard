<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import {
		createCategory,
		deleteCategory,
		updateCategory
	} from '$lib/supabase/tasks';
	import type { TaskCategory } from '$lib/supabase/types';
	import type { PageData } from './$types';
	import { ArrowLeft, FolderPlus, Pencil, Trash2 } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();

	let categories = $state<TaskCategory[]>([]);
	let newCategoryName = $state('');
	let editingId = $state<string | null>(null);
	let editingName = $state('');
	let message = $state('');
	let error = $state('');
	let saving = $state(false);

	$effect(() => {
		categories = data.categories;
	});

	function categoryErrorMessage(err: unknown, fallbackKey: 'categoryCreateFailed' | 'categoryUpdateFailed' | 'categoryDeleteFailed') {
		if (err instanceof Error && err.message === 'Category Name is Required') {
			return t($locale, 'categoryNameRequired');
		}
		const code = (err as { code?: string })?.code;
		if (code === '23505') {
			return t($locale, 'categoryNameExists');
		}
		return t($locale, fallbackKey);
	}

	async function addCategory(e: Event) {
		e.preventDefault();
		if (!data.user) return;
		saving = true;
		error = '';
		message = '';
		try {
			const category = await createCategory(data.user.id, newCategoryName);
			categories = [...categories, category].sort((a, b) => a.name.localeCompare(b.name));
			newCategoryName = '';
			message = t($locale, 'categoryCreated');
		} catch (err) {
			error = categoryErrorMessage(err, 'categoryCreateFailed');
		} finally {
			saving = false;
		}
	}

	function startEdit(category: TaskCategory) {
		editingId = category.id;
		editingName = category.name;
		error = '';
		message = '';
	}

	function cancelEdit() {
		editingId = null;
		editingName = '';
	}

	async function saveEdit(categoryId: string) {
		saving = true;
		error = '';
		message = '';
		try {
			const updated = await updateCategory(categoryId, editingName);
			categories = categories
				.map((category) => (category.id === updated.id ? updated : category))
				.sort((a, b) => a.name.localeCompare(b.name));
			editingId = null;
			editingName = '';
			message = t($locale, 'categoryUpdated');
		} catch (err) {
			error = categoryErrorMessage(err, 'categoryUpdateFailed');
		} finally {
			saving = false;
		}
	}

	async function removeCategory(category: TaskCategory) {
		if (!confirm(t($locale, 'confirmDeleteCategory'))) return;
		saving = true;
		error = '';
		message = '';
		try {
			await deleteCategory(category.id);
			categories = categories.filter((item) => item.id !== category.id);
			if (editingId === category.id) cancelEdit();
			message = t($locale, 'categoryDeleted');
		} catch (err) {
			error = categoryErrorMessage(err, 'categoryDeleteFailed');
		} finally {
			saving = false;
		}
	}
</script>

<div class="mx-auto max-w-lg space-y-6">
	<div class="space-y-2">
		<a
			href="/settings"
			class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
		>
			<ArrowLeft class="h-4 w-4" aria-hidden="true" />
			{t($locale, 'backToSettings')}
		</a>
		<h1 class="text-2xl font-bold">{t($locale, 'manageCategories')}</h1>
		<p class="text-sm text-muted-foreground">{t($locale, 'manageCategoriesDescription')}</p>
	</div>

	<form class="flex gap-2 rounded-xl border border-border bg-card p-4" onsubmit={addCategory}>
		<Input
			bind:value={newCategoryName}
			placeholder={t($locale, 'newCategory')}
			aria-label={t($locale, 'newCategory')}
			required
			class="flex-1"
		/>
		<Button type="submit" disabled={saving} class="shrink-0 gap-1.5">
			<FolderPlus class="h-4 w-4" aria-hidden="true" />
			{t($locale, 'addCategory')}
		</Button>
	</form>

	{#if message}
		<p class="text-sm text-status-done">{message}</p>
	{/if}
	{#if error}
		<p class="text-sm text-destructive">{error}</p>
	{/if}

	<div class="rounded-xl border border-border bg-card">
		{#if categories.length === 0}
			<p class="p-6 text-center text-sm text-muted-foreground">{t($locale, 'noCategories')}</p>
		{:else}
			<ul class="divide-y divide-border">
				{#each categories as category (category.id)}
					<li class="flex items-center gap-2 p-4">
						{#if editingId === category.id}
							<form
								class="flex flex-1 gap-2"
								onsubmit={(e) => {
									e.preventDefault();
									saveEdit(category.id);
								}}
							>
								<Input
									bind:value={editingName}
									aria-label={t($locale, 'category')}
									required
									class="flex-1"
								/>
								<Button type="submit" size="sm" disabled={saving}>
									{t($locale, 'save')}
								</Button>
								<Button type="button" variant="ghost" size="sm" onclick={cancelEdit}>
									{t($locale, 'cancel')}
								</Button>
							</form>
						{:else}
							<span class="flex-1 font-medium">{category.name}</span>
							<div class="flex gap-1">
								<Button
									variant="ghost"
									size="icon"
									onclick={() => startEdit(category)}
									aria-label={t($locale, 'edit')}
								>
									<Pencil class="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onclick={() => removeCategory(category)}
									aria-label={t($locale, 'delete')}
								>
									<Trash2 class="h-4 w-4 text-destructive" />
								</Button>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
