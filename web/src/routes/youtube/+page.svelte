<script>
	import { onMount } from 'svelte';

	let videos = [];
	let loading = true;
	let error = null;

	async function fetchVideos() {
		try {
			loading = true;
			const response = await fetch('/api/v1/youtube/videos?limit=30', {
				headers: {
					'X-API-Key': 'test1234'
				}
			});

			if (!response.ok) throw new Error('Failed to fetch videos');

			const data = await response.json();
			videos = data.videos || [];
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	onMount(fetchVideos);
</script>

<svelte:head>
	<title>YouTube 영상 - AI Trend Tracker</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-white flex items-center gap-3">
				<span class="text-4xl">📺</span>
				YouTube AI 영상
			</h1>
			<p class="text-gray-400 mt-2">큐레이션된 AI 유튜버 30명의 최신 영상 {videos.length}개</p>
		</div>
		<button on:click={fetchVideos} class="btn btn-primary">
			🔄 새로고침
		</button>
	</div>

	<!-- Loading State -->
	{#if loading}
		<div class="flex items-center justify-center py-20">
			<div class="text-center">
				<div class="animate-spin text-6xl mb-4">📺</div>
				<p class="text-gray-400">영상 로딩 중...</p>
			</div>
		</div>
	{/if}

	<!-- Error State -->
	{#if error}
		<div class="card bg-red-900/20 border-red-700">
			<p class="text-red-400">❌ 오류: {error}</p>
		</div>
	{/if}

	<!-- Videos Grid -->
	{#if !loading && !error && videos.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each videos as video}
				<div class="card group">
					<!-- Thumbnail -->
					{#if video.thumbnail_url}
						<a
							href="https://youtube.com/watch?v={video.video_id}"
							target="_blank"
							class="block mb-4 overflow-hidden rounded-lg"
						>
							<img
								src={video.thumbnail_url}
								alt={video.title}
								class="w-full aspect-video object-cover group-hover:scale-105 transition-transform"
							/>
						</a>
					{/if}

					<!-- Title & Channel -->
					<a
						href="https://youtube.com/watch?v={video.video_id}"
						target="_blank"
						class="text-lg font-semibold text-white hover:text-primary-400 line-clamp-2 mb-2"
					>
						{video.title}
					</a>

					{#if video.channel_title}
						<p class="text-sm text-gray-400 mb-3">{video.channel_title}</p>
					{/if}

					<!-- Stats -->
					<div class="flex gap-4 text-sm text-gray-400 mb-4">
						<span>👁️ {video.view_count?.toLocaleString() || 0}</span>
						<span>👍 {video.like_count?.toLocaleString() || 0}</span>
						<span>💬 {video.comment_count?.toLocaleString() || 0}</span>
					</div>

					<!-- Summary -->
					{#if video.summary}
						<p class="text-gray-300 text-sm line-clamp-3">
							{video.summary}
						</p>
					{:else if video.description}
						<p class="text-gray-400 text-sm line-clamp-3 italic">
							{video.description}
						</p>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Empty State -->
	{#if !loading && !error && videos.length === 0}
		<div class="card text-center py-12">
			<p class="text-6xl mb-4">📺</p>
			<p class="text-gray-400">아직 수집된 영상이 없습니다.</p>
			<p class="text-sm text-gray-500 mt-2">스케줄러가 30명의 AI 유튜버 채널에서 최신 영상을 수집합니다.</p>
		</div>
	{/if}
</div>
