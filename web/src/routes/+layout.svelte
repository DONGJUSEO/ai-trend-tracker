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
		{ name: 'GitHub 프로젝트', path: '/github', icon: '⭐' }
	];

	let isAuthenticated = false;

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
	});

	function handleLogout() {
		if (browser) {
			localStorage.removeItem('auth_token');
			goto('/login');
		}
	}
</script>

{#if $page.url.pathname === '/login'}
	<!-- 로그인 페이지는 레이아웃 없이 -->
	<slot />
{:else}
	<div class="flex h-screen bg-gray-900">
		<!-- Sidebar -->
		<aside class="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
			<div class="p-6">
				<h1 class="text-2xl font-bold text-primary-400">AI Trend Tracker</h1>
				<p class="text-gray-400 text-sm mt-1">AI 트렌드 한눈에 보기</p>
			</div>

			<nav class="mt-6 flex-1">
				{#each navItems as item}
					<a
						href={item.path}
						class="flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors {$page.url.pathname === item.path ? 'bg-gray-700 text-white border-l-4 border-primary-500' : ''}"
					>
						<span class="text-2xl">{item.icon}</span>
						<span class="font-medium">{item.name}</span>
					</a>
				{/each}
			</nav>

			<!-- Logout Button & Footer -->
			<div class="p-6 border-t border-gray-700 space-y-3">
				<button
					on:click={handleLogout}
					class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
				>
					<span>🚪</span>
					<span>로그아웃</span>
				</button>
				<p class="text-xs text-gray-500 text-center">v1.0.0 | Made with Claude Code</p>
			</div>
		</aside>

		<!-- Main Content -->
		<main class="flex-1 overflow-auto">
			<div class="p-8">
				<slot />
			</div>
		</main>
	</div>
{/if}
