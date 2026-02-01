<script>
	import { onMount } from 'svelte';

	let tools = [];
	let loading = true;
	let error = null;

	async function fetchTools() {
		try {
			loading = true;
			const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
			const apiKey = import.meta.env.VITE_API_KEY || 'test1234';
			const response = await fetch(`${apiUrl}/api/v1/tools/?page=1&page_size=30`, {
				headers: {
					'X-API-Key': apiKey
				}
			});
			if (!response.ok) throw new Error('Failed to fetch AI tools');
			const data = await response.json();
			tools = data.items || [];
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	onMount(fetchTools);
</script>

<svelte:head>
	<title>AI 도구 - AI Trend Tracker</title>
</svelte:head>

<div class="flex justify-between items-center mb-8">
	<div>
		<h1 class="text-4xl font-bold text-gray-900 mb-2">🛠️ AI 도구</h1>
		<p class="text-gray-600">최신 AI 도구 및 서비스 ({tools.length}개)</p>
	</div>
	<button on:click={fetchTools} class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg">
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
		<span>새로고침</span>
	</button>
</div>

{#if loading}
	<div class="flex items-center justify-center py-20">
		<div class="text-center">
			<div class="animate-spin text-6xl mb-4">🛠️</div>
			<p class="text-gray-600 text-lg">AI 도구 로딩 중...</p>
		</div>
	</div>
{:else if error}
	<div class="bg-red-50 border border-red-200 rounded-xl p-6">
		<p class="text-red-600 font-semibold">❌ 오류: {error}</p>
		<p class="text-sm text-red-500 mt-2">백엔드 서버가 실행 중인지 확인해주세요.</p>
	</div>
{:else if tools.length === 0}
	<div class="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
		<p class="text-6xl mb-4">🛠️</p>
		<p class="text-gray-600 text-lg">아직 수집된 AI 도구가 없습니다.</p>
		<p class="text-sm text-gray-500 mt-2">데이터 수집이 진행되면 여기에 표시됩니다.</p>
	</div>
{:else}
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each tools as tool}
			<div class="bg-white border border-gray-200 rounded-xl p-6 hover:border-teal-300 hover:shadow-lg transition-all duration-200">
				<div class="flex items-start justify-between mb-3">
					<h3 class="text-xl font-bold text-gray-900 flex-1">{tool.tool_name}</h3>
					{#if tool.is_trending}
						<span class="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded">🔥 Trending</span>
					{/if}
				</div>
				
				{#if tool.tagline}
					<p class="text-gray-600 text-sm mb-3 italic">{tool.tagline}</p>
				{/if}

				{#if tool.category}
					<span class="inline-block px-3 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded-lg mb-3">
						{tool.category}
					</span>
				{/if}

				{#if tool.description}
					<p class="text-gray-700 text-sm mb-4 line-clamp-3">{tool.description}</p>
				{/if}

				<div class="flex items-center gap-4 mb-4 text-sm text-gray-600">
					{#if tool.rating}
						<span>⭐ {tool.rating.toFixed(1)}</span>
					{/if}
					{#if tool.upvotes}
						<span>👍 {tool.upvotes.toLocaleString()}</span>
					{/if}
				</div>

				{#if tool.pricing_model}
					<div class="flex items-center gap-2 mb-4">
						<span class="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
							{tool.pricing_model}
						</span>
						{#if tool.price_range}
							<span class="text-gray-600 text-xs">{tool.price_range}</span>
						{/if}
						{#if tool.free_tier_available}
							<span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Free tier</span>
						{/if}
					</div>
				{/if}

				{#if tool.use_cases && tool.use_cases.length > 0}
					<div class="flex flex-wrap gap-2 mb-4">
						{#each tool.use_cases.slice(0, 3) as useCase}
							<span class="px-2 py-1 bg-teal-50 text-teal-600 text-xs rounded">{useCase}</span>
						{/each}
					</div>
				{/if}

				{#if tool.website}
					<a href={tool.website} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm transition-colors">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
						웹사이트 방문
					</a>
				{/if}
			</div>
		{/each}
	</div>
{/if}
