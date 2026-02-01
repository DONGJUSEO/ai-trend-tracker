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

<div class="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
	<div class="max-w-md w-full">
		<!-- Logo & Title -->
		<div class="text-center mb-8">
		<!-- Hyundai Rotem Logo -->
		<div class="mb-6 flex justify-center">
			<div class="bg-white px-8 py-4 rounded-lg shadow-lg">
				<img
					src="/images/hyundai-rotem-logo.svg"
					alt="Hyundai Rotem"
					class="h-14 md:h-16 object-contain"
					on:error={(e) => {
						// Fallback to text if image not found
						e.target.style.display = 'none';
						e.target.parentElement.style.display = 'none';
						e.target.parentElement.nextElementSibling.style.display = 'block';
					}}
				/>
			</div>
			<div style="display: none;" class="bg-white px-8 py-4 rounded-lg shadow-lg">
				<div class="text-3xl font-bold text-blue-900">HYUNDAI</div>
				<div class="text-4xl font-bold text-blue-800">Rotem</div>
			</div>
		</div>

			<h1 class="text-4xl font-bold text-white mb-2">AI Trend Tracker</h1>
			<p class="text-blue-200">AI 트렌드를 한눈에 보는 큐레이션 서비스</p>
		</div>

		<!-- Login Form -->
		<div class="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
			<h2 class="text-2xl font-bold text-white mb-6">로그인</h2>

			<form on:submit={handleLogin} class="space-y-4">
				<div>
					<label for="password" class="block text-sm font-medium text-blue-100 mb-2">
						비밀번호
					</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						placeholder="비밀번호를 입력하세요"
						class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-300/50 backdrop-blur"
						required
					/>
				</div>

				{#if error}
					<div class="bg-red-500/20 border border-red-400/50 rounded-lg p-3 backdrop-blur">
						<p class="text-red-100 text-sm">❌ {error}</p>
					</div>
				{/if}

				<button
					type="submit"
					disabled={loading}
					class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? '로그인 중...' : '로그인'}
				</button>
			</form>

			<div class="mt-6 pt-6 border-t border-white/20">
				<p class="text-sm text-blue-200 text-center">
					💡 관리자에게 비밀번호를 문의하세요
				</p>
			</div>
		</div>

		<!-- Footer -->
		<div class="text-center mt-8">
			<p class="text-sm text-blue-200">
				Powered by AI Perspicio
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
