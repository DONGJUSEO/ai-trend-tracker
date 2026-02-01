<script>
	import { onMount } from 'svelte';

	let projects = [];
	let loading = true;
	let error = null;

	async function fetchProjects() {
		try {
			loading = true;
			const response = await fetch('/api/v1/github/projects?limit=30', {
				headers: {
					'X-API-Key': 'test1234'
				}
			});

			if (!response.ok) throw new Error('Failed to fetch projects');

			const data = await response.json();
			projects = data.projects || [];
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	onMount(fetchProjects);
</script>

<svelte:head>
	<title>GitHub 프로젝트 - AI Trend Tracker</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-white flex items-center gap-3">
				<span class="text-4xl">⭐</span>
				GitHub 트렌딩 프로젝트
			</h1>
			<p class="text-gray-400 mt-2">AI/ML 트렌딩 오픈소스 프로젝트 {projects.length}개</p>
		</div>
		<button on:click={fetchProjects} class="btn btn-primary">
			🔄 새로고침
		</button>
	</div>

	<!-- Loading State -->
	{#if loading}
		<div class="flex items-center justify-center py-20">
			<div class="text-center">
				<div class="animate-spin text-6xl mb-4">⭐</div>
				<p class="text-gray-400">프로젝트 로딩 중...</p>
			</div>
		</div>
	{/if}

	<!-- Error State -->
	{#if error}
		<div class="card bg-red-900/20 border-red-700">
			<p class="text-red-400">❌ 오류: {error}</p>
		</div>
	{/if}

	<!-- Projects Grid -->
	{#if !loading && !error && projects.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each projects as project}
				<div class="card">
					<!-- Repo Name -->
					<a
						href={project.url}
						target="_blank"
						class="text-lg font-semibold text-primary-400 hover:text-primary-300 mb-2 block"
					>
						{project.repo_name}
					</a>

					<!-- Owner -->
					{#if project.owner}
						<p class="text-sm text-gray-500 mb-3">by {project.owner}</p>
					{/if}

					<!-- Stats -->
					<div class="flex gap-4 text-sm text-gray-400 mb-4">
						<span>⭐ {project.stars?.toLocaleString() || 0}</span>
						<span>🔱 {project.forks?.toLocaleString() || 0}</span>
						{#if project.language}
							<span class="px-2 py-0.5 bg-purple-600/20 text-purple-300 rounded text-xs">
								{project.language}
							</span>
						{/if}
					</div>

					<!-- Summary -->
					{#if project.summary}
						<p class="text-gray-300 text-sm mb-4 line-clamp-3">
							{project.summary}
						</p>
					{:else if project.description}
						<p class="text-gray-400 text-sm mb-4 italic line-clamp-3">
							{project.description}
						</p>
					{/if}

					<!-- Use Cases -->
					{#if project.use_cases && project.use_cases.length > 0}
						<div class="mt-4">
							<p class="text-xs font-semibold text-gray-400 mb-2">활용 사례:</p>
							<ul class="space-y-1">
								{#each project.use_cases.slice(0, 3) as useCase}
									<li class="text-xs text-gray-400 flex items-start gap-2">
										<span class="text-purple-400">•</span>
										<span>{useCase}</span>
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					<!-- Topics -->
					{#if project.topics && project.topics.length > 0}
						<div class="flex flex-wrap gap-2 mt-4">
							{#each project.topics.slice(0, 4) as topic}
								<span class="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
									{topic}
								</span>
							{/each}
						</div>
					{/if}

					<!-- License -->
					{#if project.license}
						<div class="mt-4 pt-4 border-t border-gray-700">
							<p class="text-xs text-gray-500">
								📜 {project.license}
							</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Empty State -->
	{#if !loading && !error && projects.length === 0}
		<div class="card text-center py-12">
			<p class="text-6xl mb-4">⭐</p>
			<p class="text-gray-400">아직 수집된 프로젝트가 없습니다.</p>
			<p class="text-sm text-gray-500 mt-2">GitHub에서 트렌딩 AI/ML 프로젝트를 수집합니다.</p>
		</div>
	{/if}
</div>
