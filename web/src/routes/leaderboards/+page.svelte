<script>
	import { onMount } from 'svelte';
	let items = [];
	let loading = true;
	let error = null;

	async function fetchData() {
		try {
			loading = true;
			const response = await fetch('/api/v1/leaderboards/?page=1&page_size=30', {
				headers: { 'X-API-Key': 'test1234' }
			});
			if (!response.ok) throw new Error('Failed to fetch');
			const data = await response.json();
			items = data.items || [];
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}
	onMount(fetchData);
</script>

<svelte:head>
	<title>AI 리더보드 - AI Trend Tracker</title>
</svelte:head>

<div class="mb-8">
	<h1 class="text-4xl font-bold text-gray-900 mb-2">🏆 AI 리더보드</h1>
	<p class="text-gray-600">AI 모델 성능 순위 ({items.length}개)</p>
</div>

{#if loading}
	<div class="flex items-center justify-center py-20">
		<div class="text-center"><div class="animate-spin text-6xl mb-4">🏆</div><p class="text-gray-600">로딩 중...</p></div>
	</div>
{:else if error}
	<div class="bg-red-50 border border-red-200 rounded-xl p-6">
		<p class="text-red-600 font-semibold">❌ 오류: {error}</p>
	</div>
{:else if items.length === 0}
	<div class="bg-white border rounded-xl p-12 text-center">
		<p class="text-6xl mb-4">🏆</p>
		<p class="text-gray-600">데이터를 수집하는 중입니다...</p>
	</div>
{:else}
	<div class="space-y-4">
		{#each items as item}
			<div class="bg-white border rounded-xl p-6 hover:shadow-md transition-all">
				<div class="flex items-center gap-4 mb-3">
					<span class="text-3xl font-bold text-yellow-600">#{item.rank || '?'}</span>
					<div class="flex-1">
						<h3 class="text-xl font-bold text-gray-900">{item.model_name}</h3>
						<p class="text-sm text-gray-600">{item.organization || 'Unknown'} • {item.model_size || 'Unknown size'}</p>
					</div>
					{#if item.is_trending}
						<span class="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded">🔥 Trending</span>
					{/if}
				</div>
				{#if item.scores && Object.keys(item.scores).length > 0}
					<div class="grid grid-cols-3 gap-4 mb-3">
						{#each Object.entries(item.scores) as [key, value]}
							<div class="text-center p-3 bg-gray-50 rounded">
								<p class="text-xs text-gray-500">{key}</p>
								<p class="text-lg font-bold text-gray-900">{value}%</p>
							</div>
						{/each}
					</div>
				{/if}
				{#if item.strengths && item.strengths.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each item.strengths as strength}
							<span class="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded">{strength}</span>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}
