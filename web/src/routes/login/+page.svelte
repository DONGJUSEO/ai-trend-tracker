<script>
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let password = '';
	let error = '';
	let loading = false;

	function handleLogin(e) {
		e.preventDefault();
		loading = true;
		error = '';

		// 비밀번호 확인
		if (password === 'test1234') {
			// 인증 성공 - localStorage에 토큰 저장
			if (browser) {
				localStorage.setItem('auth_token', 'authenticated');
				goto('/');
			}
		} else {
			error = '비밀번호가 올바르지 않습니다.';
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>로그인 - AI Trend Tracker</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
	<div class="max-w-md w-full">
		<!-- Logo & Title -->
		<div class="text-center mb-8">
			<div class="text-6xl mb-4">🤖</div>
			<h1 class="text-4xl font-bold text-white mb-2">AI Trend Tracker</h1>
			<p class="text-gray-400">AI 트렌드를 한눈에 보는 큐레이션 서비스</p>
		</div>

		<!-- Login Form -->
		<div class="bg-gray-800 border border-gray-700 rounded-lg p-8">
			<h2 class="text-2xl font-bold text-white mb-6">로그인</h2>

			<form on:submit={handleLogin} class="space-y-4">
				<div>
					<label for="password" class="block text-sm font-medium text-gray-300 mb-2">
						비밀번호
					</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						placeholder="비밀번호를 입력하세요"
						class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
						required
					/>
				</div>

				{#if error}
					<div class="bg-red-900/20 border border-red-700 rounded-lg p-3">
						<p class="text-red-400 text-sm">❌ {error}</p>
					</div>
				{/if}

				<button
					type="submit"
					disabled={loading}
					class="w-full btn btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? '로그인 중...' : '로그인'}
				</button>
			</form>

			<div class="mt-6 pt-6 border-t border-gray-700">
				<p class="text-sm text-gray-500 text-center">
					💡 Tip: 관리자에게 비밀번호를 문의하세요
				</p>
			</div>
		</div>

		<!-- Footer -->
		<div class="text-center mt-8">
			<p class="text-sm text-gray-500">
				Made with ❤️ using Claude Code
			</p>
		</div>
	</div>
</div>

<style>
	/* 로그인 페이지는 사이드바 레이아웃 사용 안 함 */
	:global(body) {
		overflow: auto;
	}
</style>
