<script>
	import { onMount } from 'svelte';

	let systemStatus = null;
	let keywords = null;
	let loading = true;
	let error = null;

	async function fetchDashboardData() {
		try {
			loading = true;

			// Fetch system status and keywords in parallel
			const [statusResponse, keywordsResponse] = await Promise.all([
				fetch('/api/v1/system/status', {
					headers: { 'X-API-Key': 'test1234' }
				}),
				fetch('/api/v1/system/keywords?limit=30', {
					headers: { 'X-API-Key': 'test1234' }
				})
			]);

			if (statusResponse.ok) {
				systemStatus = await statusResponse.json();
			}

			if (keywordsResponse.ok) {
				keywords = await keywordsResponse.json();
			}
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	function getMaxCount(keywords) {
		if (!keywords?.top_keywords || keywords.top_keywords.length === 0) return 1;
		return keywords.top_keywords[0].count;
	}

	onMount(fetchDashboardData);
</script>

<svelte:head>
	<title>대시보드 - AI Trend Tracker</title>
</svelte:head>

<div class="space-y-6">
	<!-- Welcome Header -->
	<div>
		<h1 class="text-4xl font-bold text-gray-800 mb-2">AI Trend Dashboard</h1>
		<p class="text-gray-600">실시간 AI 트렌드를 한눈에 확인하세요</p>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-20">
			<div class="text-center">
				<div class="animate-spin text-6xl mb-4">📊</div>
				<p class="text-gray-600">대시보드 로딩 중...</p>
			</div>
		</div>
	{/if}

	{#if !loading && systemStatus}
		<!-- Stats Overview -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600 mb-1">전체 데이터</p>
						<p class="text-3xl font-bold text-gray-800">{systemStatus.total_items.toLocaleString()}</p>
					</div>
					<div class="bg-blue-100 p-3 rounded-lg">
						<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
						</svg>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600 mb-1">활성 카테고리</p>
						<p class="text-3xl font-bold text-gray-800">{systemStatus.healthy_categories}/{systemStatus.total_categories}</p>
					</div>
					<div class="bg-green-100 p-3 rounded-lg">
						<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600 mb-1">고유 키워드</p>
						<p class="text-3xl font-bold text-gray-800">{keywords?.unique_keywords || 0}</p>
					</div>
					<div class="bg-purple-100 p-3 rounded-lg">
						<svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
						</svg>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600 mb-1">서버 상태</p>
						<p class="text-2xl font-bold text-green-600">● 온라인</p>
					</div>
					<div class="bg-yellow-100 p-3 rounded-lg">
						<svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
						</svg>
					</div>
				</div>
			</div>
		</div>

		<!-- Categories Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Categories Status -->
			<div class="bg-white rounded-xl shadow-lg p-6">
				<h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
					<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
					</svg>
					카테고리별 현황
				</h2>

				<div class="space-y-3">
					{#each Object.entries(systemStatus.categories) as [key, category]}
						<div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
							<div class="flex items-center gap-3">
								<span class="text-2xl">{category.icon}</span>
								<div>
									<p class="font-medium text-gray-800">{category.name}</p>
									<p class="text-sm text-gray-600">{category.total.toLocaleString()}개 항목</p>
								</div>
							</div>
							<span class="px-3 py-1 rounded-full text-xs font-medium {category.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
								{category.status === 'healthy' ? '정상' : '대기중'}
							</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- Top Keywords -->
			<div class="bg-white rounded-xl shadow-lg p-6">
				<h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
					<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
					</svg>
					인기 키워드 TOP 15
				</h2>

				{#if keywords && keywords.top_keywords && keywords.top_keywords.length > 0}
					<div class="space-y-2 max-h-[400px] overflow-y-auto">
						{#each keywords.top_keywords.slice(0, 15) as keyword, index}
							{@const maxCount = getMaxCount(keywords)}
							{@const percentage = (keyword.count / maxCount) * 100}
							<div class="group">
								<div class="flex items-center justify-between mb-1">
									<span class="text-sm font-medium text-gray-700 flex items-center gap-2">
										<span class="text-xs font-bold text-gray-400 w-6">#{index + 1}</span>
										{keyword.keyword}
									</span>
									<span class="text-sm font-bold text-gray-600">{keyword.count}</span>
								</div>
								<div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
									<div
										class="h-2 rounded-full transition-all duration-500 {
											index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
											index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
											index === 2 ? 'bg-gradient-to-r from-orange-600 to-red-600' :
											'bg-gradient-to-r from-blue-500 to-indigo-600'
										}"
										style="width: {percentage}%"
									></div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-gray-500 text-center py-8">데이터를 수집하는 중입니다...</p>
				{/if}
			</div>
		</div>

		<!-- Word Cloud Visualization (Simple version) -->
		{#if keywords && keywords.all_keywords && keywords.all_keywords.length > 0}
			<div class="bg-white rounded-xl shadow-lg p-6">
				<h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
					<svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
					</svg>
					키워드 클라우드
				</h2>

				<div class="flex flex-wrap gap-3 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
					{#each keywords.all_keywords.slice(0, 40) as keyword}
						{@const size = Math.max(12, Math.min(32, 12 + keyword.weight * 20))}
						<span
							class="inline-block px-3 py-1 rounded-lg bg-white shadow-sm hover:shadow-md transition-all cursor-default {
								keyword.weight > 0.7 ? 'text-indigo-700 font-bold' :
								keyword.weight > 0.4 ? 'text-blue-600 font-semibold' :
								'text-gray-700'
							}"
							style="font-size: {size}px;"
						>
							{keyword.keyword}
						</span>
					{/each}
				</div>
			</div>
		{/if}
	{/if}

	{#if error}
		<div class="bg-red-50 border border-red-200 rounded-xl p-6">
			<p class="text-red-800 font-medium">❌ 오류: {error}</p>
			<p class="text-sm text-red-600 mt-2">데이터를 불러올 수 없습니다. 백엔드 서버를 확인해주세요.</p>
		</div>
	{/if}
</div>
