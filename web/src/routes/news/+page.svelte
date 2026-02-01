<script>
	import { onMount } from 'svelte';

	let newsArticles = [];
	let loading = true;
	let error = null;

	async function fetchNews() {
		try {
			loading = true;
			const response = await fetch('/api/v1/news/news?limit=30', {
				headers: {
					'X-API-Key': 'test1234'
				}
			});

			if (!response.ok) throw new Error('Failed to fetch news');

			const data = await response.json();
			newsArticles = data.news || [];
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	onMount(fetchNews);
</script>

<svelte:head>
	<title>AI 뉴스 - AI Trend Tracker</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
				<span class="text-4xl">📰</span>
				AI 뉴스
			</h1>
			<p class="text-gray-400 mt-2">7개 주요 AI 뉴스 소스에서 수집한 기사 {newsArticles.length}개</p>
		</div>
		<button on:click={fetchNews} class="btn btn-primary">
			🔄 새로고침
		</button>
	</div>

	<!-- Loading State -->
	{#if loading}
		<div class="flex items-center justify-center py-20">
			<div class="text-center">
				<div class="animate-spin text-6xl mb-4">📰</div>
				<p class="text-gray-400">뉴스 로딩 중...</p>
			</div>
		</div>
	{/if}

	<!-- Error State -->
	{#if error}
		<div class="card bg-red-900/20 border-red-700">
			<p class="text-red-400">❌ 오류: {error}</p>
		</div>
	{/if}

	<!-- News Grid -->
	{#if !loading && !error && newsArticles.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			{#each newsArticles as article}
				<div class="card">
					<!-- Source Badge -->
					{#if article.source}
						<div class="mb-3">
							<span class="inline-flex items-center gap-2 px-3 py-1 bg-green-600/20 text-green-300 text-xs rounded-full">
								📰 {article.source}
							</span>
						</div>
					{/if}

					<!-- Title -->
					<a
						href={article.url}
						target="_blank"
						class="text-xl font-semibold text-white hover:text-primary-400 mb-3 block line-clamp-2"
					>
						{article.title}
					</a>

					<!-- Published Date & Author -->
					<div class="flex gap-3 text-sm text-gray-500 mb-4">
						{#if article.published_date}
							<span>
								{new Date(article.published_date).toLocaleDateString('ko-KR')}
							</span>
						{/if}
						{#if article.author}
							<span>by {article.author}</span>
						{/if}
					</div>

					<!-- Summary -->
					{#if article.summary}
						<p class="text-gray-300 mb-4 leading-relaxed line-clamp-4">
							{article.summary}
						</p>
					{:else if article.content}
						<p class="text-gray-400 italic mb-4 leading-relaxed line-clamp-4">
							{article.content}
						</p>
					{/if}

					<!-- Key Points -->
					{#if article.key_points && article.key_points.length > 0}
						<div class="mt-4">
							<p class="text-sm font-semibold text-gray-300 mb-2">주요 포인트:</p>
							<ul class="space-y-1">
								{#each article.key_points as point}
									<li class="text-sm text-gray-400 flex items-start gap-2">
										<span class="text-green-400">•</span>
										<span>{point}</span>
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					<!-- Keywords -->
					{#if article.keywords && article.keywords.length > 0}
						<div class="flex flex-wrap gap-2 mt-4">
							{#each article.keywords as keyword}
								<span class="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
									{keyword}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Empty State -->
	{#if !loading && !error && newsArticles.length === 0}
		<div class="card text-center py-12">
			<p class="text-6xl mb-4">📰</p>
			<p class="text-gray-400">아직 수집된 뉴스가 없습니다.</p>
			<p class="text-sm text-gray-500 mt-2">TechCrunch, VentureBeat 등 7개 소스에서 뉴스를 수집합니다.</p>
		</div>
	{/if}
</div>
