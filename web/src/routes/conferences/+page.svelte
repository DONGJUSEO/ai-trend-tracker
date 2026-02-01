<script>
	import { onMount } from 'svelte';

	let conferences = [];
	let loading = true;
	let error = null;

	async function fetchConferences() {
		try {
			loading = true;
			const response = await fetch('/api/v1/conferences/?page=1&page_size=30', {
				headers: {
					'X-API-Key': 'test1234'
				}
			});

			if (!response.ok) throw new Error('Failed to fetch conferences');

			const data = await response.json();
			conferences = data.items || [];
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	onMount(fetchConferences);

	function formatDate(dateString) {
		if (!dateString) return 'TBD';
		const date = new Date(dateString);
		return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
	}

	function getTierBadgeColor(tier) {
		switch (tier) {
			case 'A*':
				return 'bg-yellow-600/20 text-yellow-300 border-yellow-500/50';
			case 'A':
				return 'bg-blue-600/20 text-blue-300 border-blue-500/50';
			default:
				return 'bg-gray-600/20 text-gray-300 border-gray-500/50';
		}
	}
</script>

<svelte:head>
	<title>AI 컨퍼런스 - AI Trend Tracker</title>
</svelte:head>

<!-- Page Header -->
<div class="flex justify-between items-center mb-8">
	<div>
		<h1 class="text-4xl font-bold text-gray-900 mb-2">📅 AI 컨퍼런스</h1>
		<p class="text-gray-600">주요 AI 학회 및 컨퍼런스 일정 ({conferences.length}개)</p>
	</div>
	<button
		on:click={fetchConferences}
		class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
	>
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
			/>
		</svg>
		<span>새로고침</span>
	</button>
</div>

{#if loading}
	<div class="flex items-center justify-center py-20">
		<div class="text-center">
			<div class="animate-spin text-6xl mb-4">📅</div>
			<p class="text-gray-600 text-lg">컨퍼런스 정보 로딩 중...</p>
		</div>
	</div>
{:else if error}
	<div class="bg-red-50 border border-red-200 rounded-xl p-6">
		<p class="text-red-600 font-semibold">❌ 오류: {error}</p>
		<p class="text-sm text-red-500 mt-2">
			백엔드 서버가 실행 중인지 확인해주세요. 데이터를 불러오는 중 문제가 발생했습니다.
		</p>
	</div>
{:else if conferences.length === 0}
	<div class="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
		<p class="text-6xl mb-4">📅</p>
		<p class="text-gray-600 text-lg">아직 수집된 컨퍼런스 정보가 없습니다.</p>
		<p class="text-sm text-gray-500 mt-2">데이터 수집이 진행되면 여기에 표시됩니다.</p>
	</div>
{:else}
	<!-- Conferences List -->
	<div class="space-y-6">
		{#each conferences as conference}
			<div
				class="bg-white border border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
			>
				<div class="flex items-start justify-between mb-4">
					<div class="flex-1">
						<!-- Conference Name & Acronym -->
						<div class="flex items-center gap-3 mb-2">
							<h3 class="text-xl font-bold text-gray-900">
								{conference.conference_name}
							</h3>
							{#if conference.conference_acronym}
								<span class="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-lg">
									{conference.conference_acronym}
									{conference.year ? conference.year : ''}
								</span>
							{/if}
							{#if conference.tier}
								<span class="px-3 py-1 border rounded-lg text-xs font-bold {getTierBadgeColor(conference.tier)}">
									{conference.tier}
								</span>
							{/if}
						</div>

						<!-- Location & Venue Type -->
						{#if conference.location || conference.venue_type}
							<div class="flex items-center gap-4 text-sm text-gray-600 mb-3">
								{#if conference.location}
									<span class="flex items-center gap-1">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
											/>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
											/>
										</svg>
										{conference.location}
									</span>
								{/if}
								{#if conference.venue_type}
									<span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
										{conference.venue_type}
									</span>
								{/if}
							</div>
						{/if}
					</div>

					{#if conference.is_upcoming}
						<span class="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg">
							Upcoming
						</span>
					{/if}
				</div>

				<!-- Dates -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
					{#if conference.submission_deadline}
						<div class="flex items-center gap-2 text-sm">
							<span class="text-gray-500">⏰ 마감:</span>
							<span class="font-semibold text-red-600">
								{formatDate(conference.submission_deadline)}
							</span>
						</div>
					{/if}
					{#if conference.notification_date}
						<div class="flex items-center gap-2 text-sm">
							<span class="text-gray-500">📧 통지:</span>
							<span class="font-medium text-gray-700">
								{formatDate(conference.notification_date)}
							</span>
						</div>
					{/if}
					{#if conference.start_date}
						<div class="flex items-center gap-2 text-sm">
							<span class="text-gray-500">📅 시작:</span>
							<span class="font-medium text-gray-700">
								{formatDate(conference.start_date)}
							</span>
						</div>
					{/if}
					{#if conference.end_date}
						<div class="flex items-center gap-2 text-sm">
							<span class="text-gray-500">🏁 종료:</span>
							<span class="font-medium text-gray-700">
								{formatDate(conference.end_date)}
							</span>
						</div>
					{/if}
				</div>

				<!-- Statistics -->
				{#if conference.num_submissions || conference.acceptance_rate}
					<div class="flex items-center gap-6 mb-4 text-sm text-gray-600">
						{#if conference.num_submissions}
							<span>📊 제출: {conference.num_submissions.toLocaleString()}</span>
						{/if}
						{#if conference.num_acceptances}
							<span>✅ 채택: {conference.num_acceptances.toLocaleString()}</span>
						{/if}
						{#if conference.acceptance_rate}
							<span class="font-semibold text-indigo-600">
								채택률: {conference.acceptance_rate.toFixed(1)}%
							</span>
						{/if}
					</div>
				{/if}

				<!-- Summary -->
				{#if conference.summary}
					<p class="text-gray-700 mb-4 line-clamp-3">{conference.summary}</p>
				{/if}

				<!-- Topics -->
				{#if conference.topics && conference.topics.length > 0}
					<div class="flex flex-wrap gap-2 mb-4">
						{#each conference.topics as topic}
							<span class="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full">
								{topic}
							</span>
						{/each}
					</div>
				{/if}

				<!-- Keynote Speakers -->
				{#if conference.keynote_speakers && conference.keynote_speakers.length > 0}
					<div class="mb-4">
						<span class="text-sm font-semibold text-gray-700">🎤 기조연설:</span>
						<span class="text-sm text-gray-600 ml-2">
							{conference.keynote_speakers.slice(0, 3).join(', ')}
							{#if conference.keynote_speakers.length > 3}
								외 {conference.keynote_speakers.length - 3}명
							{/if}
						</span>
					</div>
				{/if}

				<!-- Keywords -->
				{#if conference.keywords && conference.keywords.length > 0}
					<div class="flex flex-wrap gap-2 mb-4">
						{#each conference.keywords.slice(0, 5) as keyword}
							<span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
								{keyword}
							</span>
						{/each}
					</div>
				{/if}

				<!-- Website Link -->
				{#if conference.website_url}
					<a
						href={conference.website_url}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
							/>
						</svg>
						웹사이트 방문
					</a>
				{/if}
			</div>
		{/each}
	</div>
{/if}
