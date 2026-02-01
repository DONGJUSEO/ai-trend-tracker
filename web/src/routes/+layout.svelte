<script>
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	const navItems = [
		{ name: '대시보드', path: '/', icon: '📊', color: 'from-purple-500 to-pink-500' },
		{ name: 'Hugging Face', path: '/huggingface', icon: '🤗', color: 'from-yellow-400 to-orange-500' },
		{ name: 'YouTube', path: '/youtube', icon: '📺', color: 'from-red-500 to-red-600' },
		{ name: 'AI 논문', path: '/papers', icon: '📄', color: 'from-blue-500 to-indigo-600' },
		{ name: 'AI 뉴스', path: '/news', icon: '📰', color: 'from-green-500 to-emerald-600' },
		{ name: 'GitHub', path: '/github', icon: '⭐', color: 'from-gray-700 to-gray-900' },
		{ name: '시스템 상태', path: '/system', icon: '⚙️', color: 'from-cyan-500 to-blue-600' }
	];

	let isAuthenticated = false;
	let currentTime = '';

	onMount(() => {
		// 로그인 페이지가 아닌 경우에만 인증 체크
		if (browser && $page.url.pathname !== '/login') {
			const token = localStorage.getItem('auth_token');
			if (!token) {
				goto('/login');
			} else {
				isAuthenticated = true;
			}
		} else if (browser && $page.url.pathname === '/login') {
			// 이미 로그인된 상태에서 /login 접근 시 홈으로
			const token = localStorage.getItem('auth_token');
			if (token) {
				goto('/');
			}
		}

		// 현재 시간 업데이트
		updateTime();
		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	});

	function updateTime() {
		const now = new Date();
		currentTime = now.toLocaleString('ko-KR', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function handleLogout() {
		if (browser) {
			localStorage.removeItem('auth_token');
			goto('/login');
		}
	}

	function handleRefresh() {
		if (browser) {
			window.location.reload();
		}
	}
</script>

{#if $page.url.pathname === '/login'}
	<!-- 로그인 페이지는 레이아웃 없이 -->
	<slot />
{:else}
	<div class="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
		<!-- Sidebar -->
		<aside class="w-72 bg-white shadow-xl flex flex-col border-r border-gray-200">
			<!-- Logo & Title -->
			<div class="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
				<h1 class="text-2xl font-bold text-white">AI Trend Tracker</h1>
				<p class="text-blue-100 text-sm mt-1">AI 트렌드 한눈에 보기</p>
			</div>

			<!-- Navigation -->
			<nav class="flex-1 overflow-y-auto py-4">
				{#each navItems as item}
					<a
						href={item.path}
						class="group mx-3 my-1 flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 {$page.url.pathname === item.path
							? 'bg-gradient-to-r ' + item.color + ' text-white shadow-md transform scale-105'
							: 'text-gray-700 hover:bg-gray-100'}"
					>
						<span class="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
						<span class="font-medium">{item.name}</span>
					</a>
				{/each}
			</nav>

			<!-- Footer -->
			<div class="p-4 border-t border-gray-200 space-y-3 bg-gray-50">
				<!-- Current Time -->
				<div class="flex items-center justify-center gap-2 text-gray-600 text-sm">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span class="font-mono">{currentTime}</span>
				</div>

				<!-- Logout Button -->
				<button
					on:click={handleLogout}
					class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
					</svg>
					<span class="font-medium">로그아웃</span>
				</button>

				<p class="text-xs text-gray-500 text-center">v1.0.0 | Built with ❤️</p>
			</div>
		</aside>

		<!-- Main Content -->
		<main class="flex-1 flex flex-col overflow-hidden">
			<!-- Top Header Bar -->
			<div class="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
				<div>
					<h2 class="text-xl font-semibold text-gray-800">
						{navItems.find(item => item.path === $page.url.pathname)?.name || '대시보드'}
					</h2>
				</div>

				<button
					on:click={handleRefresh}
					class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
					<span class="font-medium">새로고침</span>
				</button>
			</div>

			<!-- Content Area -->
			<div class="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
				<div class="p-8">
					<slot />
				</div>
			</div>
		</main>
	</div>
{/if}
