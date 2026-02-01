<script>
	import { onMount } from 'svelte';

	let papers = [];
	let loading = true;
	let error = null;

	async function fetchPapers() {
		try {
			loading = true;
			const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
			const apiKey = import.meta.env.VITE_API_KEY || 'test1234';
			const response = await fetch(`${apiUrl}/api/v1/papers/papers?limit=30`, {
				headers: {
					'X-API-Key': apiKey
				}
			});

			if (!response.ok) throw new Error('Failed to fetch papers');

			const data = await response.json();
			papers = data.papers || [];
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	onMount(fetchPapers);
</script>

<svelte:head>
	<title>AI 논문 - AI Trend Tracker</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
				<span class="text-4xl">📄</span>
				AI 논문
			</h1>
			<p class="text-gray-400 mt-2">arXiv에서 수집한 최신 AI 논문 {papers.length}개</p>
		</div>
		<button on:click={fetchPapers} class="btn btn-primary">
			🔄 새로고침
		</button>
	</div>

	<!-- Loading State -->
	{#if loading}
		<div class="flex items-center justify-center py-20">
			<div class="text-center">
				<div class="animate-spin text-6xl mb-4">📄</div>
				<p class="text-gray-400">논문 로딩 중...</p>
			</div>
		</div>
	{/if}

	<!-- Error State -->
	{#if error}
		<div class="card bg-red-900/20 border-red-700">
			<p class="text-red-400">❌ 오류: {error}</p>
		</div>
	{/if}

	<!-- Papers List -->
	{#if !loading && !error && papers.length > 0}
		<div class="space-y-6">
			{#each papers as paper}
				<div class="card">
					<!-- Title & arXiv Link -->
					<a
						href={paper.arxiv_url}
						target="_blank"
						class="text-xl font-semibold text-primary-400 hover:text-primary-300 mb-2 block"
					>
						{paper.title}
					</a>

					<!-- Authors -->
					{#if paper.authors && paper.authors.length > 0}
						<p class="text-sm text-gray-400 mb-3">
							{paper.authors.slice(0, 5).join(', ')}
							{#if paper.authors.length > 5}
								외 {paper.authors.length - 5}명
							{/if}
						</p>
					{/if}

					<!-- Categories & Published Date -->
					<div class="flex gap-3 mb-4">
						{#if paper.categories && paper.categories.length > 0}
							{#each paper.categories.slice(0, 3) as category}
								<span class="px-3 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full">
									{category}
								</span>
							{/each}
						{/if}
						{#if paper.published_date}
							<span class="text-sm text-gray-500">
								{new Date(paper.published_date).toLocaleDateString('ko-KR')}
							</span>
						{/if}
					</div>

					<!-- Summary -->
					{#if paper.summary}
						<p class="text-gray-300 mb-4 leading-relaxed">
							{paper.summary}
						</p>
					{:else if paper.abstract}
						<p class="text-gray-400 italic mb-4 leading-relaxed line-clamp-4">
							{paper.abstract}
						</p>
					{/if}

					<!-- Key Contributions -->
					{#if paper.key_contributions && paper.key_contributions.length > 0}
						<div class="mt-4">
							<p class="text-sm font-semibold text-gray-300 mb-2">주요 기여:</p>
							<ul class="space-y-1">
								{#each paper.key_contributions as contribution}
									<li class="text-sm text-gray-400 flex items-start gap-2">
										<span class="text-primary-400">•</span>
										<span>{contribution}</span>
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					<!-- Keywords -->
					{#if paper.keywords && paper.keywords.length > 0}
						<div class="flex flex-wrap gap-2 mt-4">
							{#each paper.keywords as keyword}
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
	{#if !loading && !error && papers.length === 0}
		<div class="card text-center py-12">
			<p class="text-6xl mb-4">📄</p>
			<p class="text-gray-400">아직 수집된 논문이 없습니다.</p>
			<p class="text-sm text-gray-500 mt-2">arXiv에서 최신 AI 논문을 수집합니다.</p>
		</div>
	{/if}
</div>
