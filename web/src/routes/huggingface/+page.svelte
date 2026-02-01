<script>
	import { onMount } from 'svelte';

	let models = [];
	let loading = true;
	let error = null;

	async function fetchModels() {
		try {
			loading = true;
			const response = await fetch('/api/v1/huggingface/?page=1&page_size=30', {
				headers: {
					'X-API-Key': 'test1234'
				}
			});

			if (!response.ok) throw new Error('Failed to fetch models');

			const data = await response.json();
			models = data.items || [];
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	onMount(fetchModels);
</script>

<svelte:head>
	<title>Hugging Face 모델 - AI Trend Tracker</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-white flex items-center gap-3">
				<span class="text-4xl">🤗</span>
				Hugging Face 모델
			</h1>
			<p class="text-gray-400 mt-2">최신 트렌딩 AI 모델 {models.length}개</p>
		</div>
		<button on:click={fetchModels} class="btn btn-primary">
			🔄 새로고침
		</button>
	</div>

	<!-- Loading State -->
	{#if loading}
		<div class="flex items-center justify-center py-20">
			<div class="text-center">
				<div class="animate-spin text-6xl mb-4">🤗</div>
				<p class="text-gray-400">모델 로딩 중...</p>
			</div>
		</div>
	{/if}

	<!-- Error State -->
	{#if error}
		<div class="card bg-red-900/20 border-red-700">
			<p class="text-red-400">❌ 오류: {error}</p>
			<p class="text-sm text-gray-400 mt-2">백엔드 서버가 실행 중인지 확인해주세요.</p>
		</div>
	{/if}

	<!-- Models Grid -->
	{#if !loading && !error && models.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each models as model}
				<div class="card group">
					<!-- Model Header -->
					<div class="flex items-start justify-between mb-4">
						<div class="flex-1">
							<a
								href="https://huggingface.co/{model.model_name}"
								target="_blank"
								class="text-lg font-semibold text-primary-400 hover:text-primary-300 line-clamp-2"
							>
								{model.model_name}
							</a>
							{#if model.author}
								<p class="text-sm text-gray-500 mt-1">by {model.author}</p>
							{/if}
						</div>
					</div>

					<!-- Stats -->
					<div class="flex gap-4 text-sm text-gray-400 mb-4">
						<span>👍 {model.likes?.toLocaleString() || 0}</span>
						<span>⬇️ {model.downloads?.toLocaleString() || 0}</span>
					</div>

					<!-- Task & Tags -->
					{#if model.task}
						<div class="mb-3">
							<span class="inline-block px-3 py-1 bg-primary-600/20 text-primary-300 text-xs rounded-full">
								{model.task}
							</span>
						</div>
					{/if}

					<!-- Summary -->
					{#if model.summary}
						<p class="text-gray-300 text-sm line-clamp-3 mb-4">
							{model.summary}
						</p>
					{:else if model.description}
						<p class="text-gray-400 text-sm line-clamp-3 mb-4 italic">
							{model.description}
						</p>
					{/if}

					<!-- Tags -->
					{#if model.tags && model.tags.length > 0}
						<div class="flex flex-wrap gap-2 mt-auto">
							{#each model.tags.slice(0, 3) as tag}
								<span class="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
									{tag}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Empty State -->
	{#if !loading && !error && models.length === 0}
		<div class="card text-center py-12">
			<p class="text-6xl mb-4">🤗</p>
			<p class="text-gray-400">아직 수집된 모델이 없습니다.</p>
			<p class="text-sm text-gray-500 mt-2">스케줄러가 자동으로 데이터를 수집할 때까지 기다려주세요.</p>
		</div>
	{/if}
</div>
