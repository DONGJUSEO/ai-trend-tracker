<script>
	const stats = [
		{ label: 'Hugging Face 모델', value: '26', icon: '🤗', color: 'bg-yellow-600' },
		{ label: 'YouTube 영상', value: '0', icon: '📺', color: 'bg-red-600' },
		{ label: 'AI 논문', value: '0', icon: '📄', color: 'bg-blue-600' },
		{ label: 'AI 뉴스', value: '0', icon: '📰', color: 'bg-green-600' },
		{ label: 'GitHub 프로젝트', value: '0', icon: '⭐', color: 'bg-purple-600' }
	];
</script>

<svelte:head>
	<title>AI Trend Tracker - 대시보드</title>
</svelte:head>

<div class="space-y-8">
	<!-- Header -->
	<div>
		<h1 class="text-4xl font-bold text-white">대시보드</h1>
		<p class="text-gray-400 mt-2">AI 트렌드를 한눈에 확인하세요</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
		{#each stats as stat}
			<div class="card">
				<div class="flex items-center justify-between mb-4">
					<div class="{stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl">
						{stat.icon}
					</div>
				</div>
				<p class="text-gray-400 text-sm">{stat.label}</p>
				<p class="text-3xl font-bold text-white mt-2">{stat.value}</p>
			</div>
		{/each}
	</div>

	<!-- Welcome Section -->
	<div class="card max-w-3xl">
		<h2 class="text-2xl font-bold text-white mb-4">환영합니다! 🚀</h2>
		<p class="text-gray-300 leading-relaxed">
			AI Trend Tracker는 5개 카테고리에서 최신 AI 트렌드 정보를 자동으로 수집합니다:
		</p>
		<ul class="mt-4 space-y-2 text-gray-300">
			<li class="flex items-center gap-2">
				<span class="text-yellow-500">🤗</span>
				<span><strong>Hugging Face:</strong> 최신 AI 모델 26개 수집 완료</span>
			</li>
			<li class="flex items-center gap-2">
				<span class="text-red-500">📺</span>
				<span><strong>YouTube:</strong> 30명의 큐레이션된 AI 유튜버 영상 수집</span>
			</li>
			<li class="flex items-center gap-2">
				<span class="text-blue-500">📄</span>
				<span><strong>arXiv Papers:</strong> 최신 AI 논문 자동 수집</span>
			</li>
			<li class="flex items-center gap-2">
				<span class="text-green-500">📰</span>
				<span><strong>AI News:</strong> 7개 주요 AI 뉴스 소스에서 기사 수집</span>
			</li>
			<li class="flex items-center gap-2">
				<span class="text-purple-500">⭐</span>
				<span><strong>GitHub:</strong> 트렌딩 AI/ML 프로젝트 수집</span>
			</li>
		</ul>
		<p class="mt-4 text-sm text-gray-400">
			⏰ 12시간마다 자동으로 데이터가 수집되며, Gemini API를 통해 한국어 요약이 생성됩니다.
		</p>
	</div>
</div>
