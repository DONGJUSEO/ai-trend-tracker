<script>
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let sidebarOpen = false; // 모바일 사이드바 토글 상태

	const navItems = [
		{
			name: '대시보드',
			path: '/',
			svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />',
			color: 'from-purple-600 to-pink-600',
			bgColor: 'bg-purple-100',
			iconColor: 'text-purple-600'
		},
		{
			name: 'Hugging Face',
			path: '/huggingface',
			svg: '<circle cx="12" cy="8" r="1.5"/><circle cx="9" cy="11" r="1"/><circle cx="15" cy="11" r="1"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14s1.5 2 4 2 4-2 4-2"/>',
			color: 'from-yellow-500 to-orange-600',
			bgColor: 'bg-yellow-100',
			iconColor: 'text-yellow-600'
		},
		{
			name: 'YouTube',
			path: '/youtube',
			svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
			color: 'from-red-600 to-red-700',
			bgColor: 'bg-red-100',
			iconColor: 'text-red-600'
		},
		{
			name: 'AI 논문',
			path: '/papers',
			svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />',
			color: 'from-blue-600 to-indigo-700',
			bgColor: 'bg-blue-100',
			iconColor: 'text-blue-600'
		},
		{
			name: 'AI 뉴스',
			path: '/news',
			svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />',
			color: 'from-green-600 to-emerald-700',
			bgColor: 'bg-green-100',
			iconColor: 'text-green-600'
		},
		{
			name: 'GitHub',
			path: '/github',
			svg: '<path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>',
			color: 'from-gray-800 to-black',
			bgColor: 'bg-gray-200',
			iconColor: 'text-gray-800'
		},
	{
		name: '컨퍼런스',
		path: '/conferences',
		svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />',
		color: 'from-indigo-600 to-violet-600',
		bgColor: 'bg-indigo-100',
		iconColor: 'text-indigo-600'
	},
	{
		name: 'AI 도구',
		path: '/tools',
		svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />',
		color: 'from-teal-600 to-cyan-600',
		bgColor: 'bg-teal-100',
		iconColor: 'text-teal-600'
	},
	{
		name: 'AI 리더보드',
		path: '/leaderboards',
		svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />',
		color: 'from-yellow-600 to-amber-600',
		bgColor: 'bg-yellow-100',
		iconColor: 'text-yellow-600'
	},
	{
		name: 'AI 채용',
		path: '/jobs',
		svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />',
		color: 'from-rose-600 to-pink-600',
		bgColor: 'bg-rose-100',
		iconColor: 'text-rose-600'
	},
	{
		name: 'AI 정책',
		path: '/policies',
		svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />',
		color: 'from-amber-600 to-orange-600',
		bgColor: 'bg-amber-100',
		iconColor: 'text-amber-600'
	},
	{
		name: '스타트업',
		path: '/startups',
		svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />',
		color: 'from-emerald-600 to-green-600',
		bgColor: 'bg-emerald-100',
		iconColor: 'text-emerald-600'
	},
		{
			name: '시스템 상태',
			path: '/system',
			svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />',
			color: 'from-cyan-600 to-blue-700',
			bgColor: 'bg-cyan-100',
			iconColor: 'text-cyan-600'
		},
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
	<div class="flex h-screen bg-gray-50 overflow-hidden">
		<!-- Mobile Overlay -->
		{#if sidebarOpen}
			<div
				class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
				on:click={() => sidebarOpen = false}
			></div>
		{/if}

		<!-- Sidebar -->
		<aside class="fixed md:static inset-y-0 left-0 z-50 w-72 bg-white shadow-lg flex flex-col border-r border-gray-200 transform transition-transform duration-300 ease-in-out {sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}">
			<!-- Logo & Title -->
			<div class="p-6 border-b border-gray-200 bg-gradient-to-r from-slate-700 to-gray-800">
			<!-- Hyundai Rotem Logo -->
			<div class="mb-4 flex justify-center">
				<div class="bg-white px-6 py-3 rounded-lg shadow-lg">
					<img
						src="/images/hyundai-rotem-logo.png"
						alt="Hyundai Rotem"
						class="h-10 object-contain"
						on:error={(e) => {
							e.target.style.display = 'none';
							e.target.parentElement.style.display = 'none';
							e.target.parentElement.nextElementSibling.style.display = 'block';
						}}
					/>
				</div>
				<div style="display: none;" class="bg-white px-4 py-2 rounded-lg shadow-md">
					<div class="text-lg font-bold text-blue-900">HYUNDAI</div>
					<div class="text-2xl font-bold text-blue-800">Rotem</div>
				</div>
			</div>
				<h1 class="text-2xl font-bold text-white">AI Trend Tracker</h1>
				<p class="text-blue-100 text-sm mt-1">AI 트렌드 한눈에 보기</p>
			</div>

			<!-- Navigation -->
			<nav class="flex-1 overflow-y-auto py-4 px-3">
				{#each navItems as item}
					<a
						href={item.path}
						on:click={() => sidebarOpen = false}
						class="group mb-2 flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 {$page.url.pathname === item.path
							? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg transform scale-105'
							: 'text-gray-700 hover:bg-gray-100 hover:shadow-md'}"
					>
						<div class="{$page.url.pathname === item.path ? 'text-white' : item.bgColor + ' ' + item.iconColor} p-2 rounded-lg transition-all group-hover:scale-110">
							<svg class="w-5 h-5" fill={item.path === '/github' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
								{@html item.svg}
							</svg>
						</div>
						<span class="font-semibold">{item.name}</span>
					</a>
				{/each}
			</nav>

			<!-- Footer -->
			<div class="p-4 border-t border-gray-200 space-y-3 bg-gray-50">
				<!-- Current Time -->
				<div class="flex items-center justify-center gap-2 text-gray-700 text-sm font-medium">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span class="font-mono">{currentTime}</span>
				</div>

				<!-- Logout Button -->
				<button
					on:click={handleLogout}
					class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
					</svg>
					<span>로그아웃</span>
				</button>

				<p class="text-xs text-gray-500 text-center font-medium">v1.0.0 | AI Perspicio</p>
			</div>
		</aside>

		<!-- Main Content -->
		<main class="flex-1 flex flex-col overflow-hidden bg-gray-50">
			<!-- Top Header Bar -->
			<div class="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-5 flex justify-between items-center shadow-sm">
				<div class="flex items-center gap-3">
					<!-- Hamburger Menu Button (Mobile Only) -->
					<button
						on:click={() => sidebarOpen = !sidebarOpen}
						class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
						aria-label="메뉴"
					>
						<svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					</button>

					<h2 class="text-xl md:text-2xl font-bold text-gray-900">
						{navItems.find(item => item.path === $page.url.pathname)?.name || '대시보드'}
					</h2>
				</div>

				<button
					on:click={handleRefresh}
					class="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
				>
					<svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
					<span class="hidden sm:inline">새로고침</span>
					<span class="sm:hidden">↻</span>
				</button>
			</div>

			<!-- Content Area -->
			<div class="flex-1 overflow-auto">
				<div class="p-4 md:p-8">
					<slot />
				</div>
			</div>
		</main>
	</div>
{/if}
