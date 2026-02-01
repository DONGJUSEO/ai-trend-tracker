<script>
	import { onMount } from 'svelte';
	let items = [];
	let loading = true;
	let error = null;
	async function fetchData() {
		try {
			loading = true;
			const response = await fetch('/api/v1/policies/?page=1&page_size=30', { headers: { 'X-API-Key': 'test1234' } });
			if (!response.ok) throw new Error('Failed to fetch');
			items = (await response.json()).items || [];
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}
	onMount(fetchData);
</script>

<svelte:head><title>AI 정책 - AI Trend Tracker</title></svelte:head>

<div class="mb-8"><h1 class="text-4xl font-bold text-gray-900 mb-2">📜 AI 정책</h1><p class="text-gray-600">AI 관련 정책 및 규제 ({items.length}개)</p></div>

{#if loading}
	<div class="flex items-center justify-center py-20"><div class="text-center"><div class="animate-spin text-6xl mb-4">📜</div><p class="text-gray-600">로딩 중...</p></div></div>
{:else if error}
	<div class="bg-red-50 border border-red-200 rounded-xl p-6"><p class="text-red-600 font-semibold">❌ 오류: {error}</p></div>
{:else if items.length === 0}
	<div class="bg-white border rounded-xl p-12 text-center"><p class="text-6xl mb-4">📜</p><p class="text-gray-600">데이터를 수집하는 중입니다...</p></div>
{:else}
	<div class="space-y-4">
		{#each items as item}
			<div class="bg-white border rounded-xl p-6 hover:shadow-md transition-all">
				<div class="flex items-start justify-between mb-3">
					<h3 class="text-xl font-bold text-gray-900 flex-1">{item.title}</h3>
					{#if item.status}
						<span class="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded">{item.status}</span>
					{/if}
				</div>
				<p class="text-gray-600 mb-3">🌍 {item.country || 'Global'} • {item.policy_type || 'Policy'}</p>
				{#if item.description}
					<p class="text-gray-700 mb-3">{item.description}</p>
				{/if}
				{#if item.impact_areas && item.impact_areas.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each item.impact_areas as area}
							<span class="px-2 py-1 bg-amber-50 text-amber-600 text-xs rounded">{area}</span>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}
