<script>
	import { onMount } from 'svelte';

	let systemStatus = null;
	let loading = true;
	let error = null;

	async function fetchSystemStatus() {
		try {
			loading = true;
			const response = await fetch('/api/v1/system/status', {
				headers: {
					'X-API-Key': 'test1234'
				}
			});

			if (!response.ok) throw new Error('Failed to fetch system status');

			systemStatus = await response.json();
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	function formatDate(dateString) {
		if (!dateString) return '없음';
		const date = new Date(dateString);
		return date.toLocaleString('ko-KR');
	}

	function getStatusColor(status) {
		if (status === 'healthy') return 'bg-green-100 text-green-800 border-green-300';
		if (status === 'no_data') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		return 'bg-red-100 text-red-800 border-red-300';
	}

	function getStatusText(status) {
		if (status === 'healthy') return '정상';
		if (status === 'no_data') return '데이터 없음';
		return '오류';
	}

	onMount(fetchSystemStatus);
</script>

<svelte:head>
	<title>시스템 상태 - AI Trend Tracker</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-black flex items-center gap-3">
				<span class="text-4xl">⚙️</span>
				시스템 상태
			</h1>
			<p class="text-gray-600 mt-2">백엔드 서버 및 데이터 수집 상태</p>
		</div>
		<button on:click={fetchSystemStatus} class="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
			🔄 새로고침
		</button>
	</div>

	<!-- Loading State -->
	{#if loading}
		<div class="flex items-center justify-center py-20">
			<div class="text-center">
				<div class="animate-spin text-6xl mb-4">⚙️</div>
				<p class="text-gray-600">시스템 상태 확인 중...</p>
			</div>
		</div>
	{/if}

	<!-- Error State -->
	{#if error}
		<div class="card bg-red-50 border-red-300">
			<p class="text-red-800">❌ 오류: {error}</p>
			<p class="text-sm text-gray-600 mt-2">백엔드 서버에 연결할 수 없습니다.</p>
		</div>
	{/if}

	<!-- System Status -->
	{#if !loading && !error && systemStatus}
		<!-- Overall Status -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
			<div class="border border-gray-300 rounded-lg p-4 bg-white">
				<p class="text-sm text-gray-600 mb-1">백엔드 서버</p>
				<p class="text-2xl font-bold text-green-600">● 온라인</p>
			</div>

			<div class="border border-gray-300 rounded-lg p-4 bg-white">
				<p class="text-sm text-gray-600 mb-1">데이터베이스</p>
				<p class="text-2xl font-bold {systemStatus.database_status === 'connected' ? 'text-green-600' : 'text-red-600'}">
					{systemStatus.database_status === 'connected' ? '● 연결됨' : '● 연결 끊김'}
				</p>
			</div>

			<div class="border border-gray-300 rounded-lg p-4 bg-white">
				<p class="text-sm text-gray-600 mb-1">전체 데이터</p>
				<p class="text-2xl font-bold text-black">{systemStatus.total_items.toLocaleString()}개</p>
			</div>

			<div class="border border-gray-300 rounded-lg p-4 bg-white">
				<p class="text-sm text-gray-600 mb-1">정상 카테고리</p>
				<p class="text-2xl font-bold text-black">
					{systemStatus.healthy_categories} / {systemStatus.total_categories}
				</p>
			</div>
		</div>

		<!-- Categories Status -->
		<div class="border border-gray-300 rounded-lg bg-white">
			<div class="border-b border-gray-300 px-6 py-4">
				<h2 class="text-xl font-semibold text-black">카테고리별 상태</h2>
			</div>

			<div class="divide-y divide-gray-200">
				{#each Object.entries(systemStatus.categories) as [key, category]}
					<div class="px-6 py-4 hover:bg-gray-50 transition-colors">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-4 flex-1">
								<span class="text-3xl">{category.icon}</span>
								<div>
									<p class="font-medium text-black">{category.name}</p>
									<p class="text-sm text-gray-600">
										{category.total.toLocaleString()}개 항목
									</p>
								</div>
							</div>

							<div class="flex items-center gap-4">
								<div class="text-right">
									<p class="text-sm text-gray-600">최근 업데이트</p>
									<p class="text-sm font-mono text-black">
										{formatDate(category.last_update)}
									</p>
								</div>

								<span class="px-3 py-1 rounded-full text-sm font-medium border {getStatusColor(category.status)}">
									{getStatusText(category.status)}
								</span>
							</div>
						</div>

						{#if category.error}
							<p class="text-sm text-red-600 mt-2">오류: {category.error}</p>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Timestamp -->
		<p class="text-sm text-gray-500 text-center">
			마지막 확인: {formatDate(systemStatus.timestamp)}
		</p>
	{/if}
</div>

<style>
	.card {
		@apply border rounded-lg p-6;
	}
</style>
