<script>
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	const navItems = [
		{ name: '대시보드', path: '/', icon: '📊' },
		{ name: 'Hugging Face 모델', path: '/huggingface', icon: '🤗' },
		{ name: 'YouTube 영상', path: '/youtube', icon: '📺' },
		{ name: 'AI 논문', path: '/papers', icon: '📄' },
		{ name: 'AI 뉴스', path: '/news', icon: '📰' },
		{ name: 'GitHub 프로젝트', path: '/github', icon: '⭐' },
		{ name: '시스템 상태', path: '/system', icon: '⚙️' }
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
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
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
	<div class="flex h-screen bg-white">
		<!-- Sidebar -->
		<aside class="w-64 bg-black border-r border-gray-200 flex flex-col">
			<div class="p-6">
				<h1 class="text-2xl font-bold text-white">AI Trend Tracker</h1>
				<p class="text-gray-400 text-sm mt-1">AI 트렌드 한눈에 보기</p>
			</div>

			<nav class="mt-6 flex-1">
				{#each navItems as item}
					<a
						href={item.path}
						class="flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-900 hover:text-white transition-colors {$page.url.pathname === item.path ? 'bg-gray-900 text-white border-l-4 border-white' : ''}"
					>
						<span class="text-2xl">{item.icon}</span>
						<span class="font-medium">{item.name}</span>
					</a>
				{/each}
			</nav>

			<!-- Logout Button & Footer -->
			<div class="p-6 border-t border-gray-800 space-y-3">
				<div class="text-center mb-3">
					<p class="text-xs text-gray-500 mb-1">🕐 현재 시간</p>
					<p class="text-sm text-white font-mono">{currentTime}</p>
				</div>
				<button
					on:click={handleLogout}
					class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
				>
					<span>🚪</span>
					<span>로그아웃</span>
				</button>
				<p class="text-xs text-gray-600 text-center">v1.0.0 | Made with Claude Code</p>
			</div>
		</aside>

		<!-- Main Content -->
		<main class="flex-1 overflow-auto">
			<!-- Top Header Bar -->
			<div class="bg-black border-b border-gray-200 px-8 py-4 flex justify-end">
				<button
					on:click={handleRefresh}
					class="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg transition-colors border border-gray-300"
				>
					<span>🔄</span>
					<span>새로고침</span>
				</button>
			</div>

			<div class="p-8 bg-white">
				<slot />
			</div>
		</main>
	</div>
{/if}
