<script lang="ts">
	// Svelte 5 Runes for Reactivity
	let diff = $state('');
	let messages = $state<string[]>([]);
	let loading = $state(false);
	let error = $state('');
	let copiedIndex = $state<number | null>(null);

	async function generateMessages() {
		if (!diff.trim()) {
			error = 'Please paste a git diff first.';
			return;
		}
		loading = true;
		error = '';
		messages = [];

		try {
			const response = await fetch('/api/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ diff })
			});
			const data = await response.json();
			
			if (!response.ok) throw new Error(data.error || 'API Error');
			
			// Handle both array and object responses
			messages = Array.isArray(data.messages) ? data.messages : [data.messages];
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	function copyToClipboard(text: string, index: number) {
		navigator.clipboard.writeText(text);
		copiedIndex = index;
		setTimeout(() => (copiedIndex = null), 2000);
	}
</script>

<div class="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500/30">
	<header class="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
		<div class="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">C</div>
				<h1 class="text-xl font-bold tracking-tight text-white">Commit<span class="text-indigo-400">Craft</span></h1>
			</div>
			<div class="text-xs text-slate-500 font-mono bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
				v1.0.0
			</div>
		</div>
	</header>

	<main class="max-w-4xl mx-auto px-6 py-12">
		<section class="space-y-6">
			<div class="flex flex-col gap-2">
				<h2 class="text-2xl font-bold text-white">Generate Commit Message</h2>
				<p class="text-slate-400">Paste your <code class="text-indigo-300">git diff</code> output below to get AI-powered suggestions.</p>
			</div>

			<div class="relative group">
				<div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
				<div class="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
					<textarea
						bind:value={diff}
						placeholder="Paste your diff here (e.g., git diff --staged)..."
						class="w-full h-80 p-6 bg-transparent text-slate-300 font-mono text-sm outline-none resize-none placeholder:text-slate-600 scrollbar-thin scrollbar-thumb-slate-700"
					></textarea>
					
					<div class="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
						{#if error}
							<span class="text-red-400 text-sm animate-pulse">{error}</span>
						{:else}
							<span class="text-slate-500 text-xs uppercase tracking-widest font-semibold">Input Buffer</span>
						{/if}

						<button
							onclick={generateMessages}
							disabled={loading}
							class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center gap-3 shadow-lg shadow-indigo-500/20"
						>
							{#if loading}
								<div class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
								<span>Processing...</span>
							{:else}
								<span>Generate</span>
								<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
							{/if}
						</button>
					</div>
				</div>
			</div>
		</section>

		{#if messages.length > 0}
			<section class="mt-16 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
				<div class="flex items-center gap-4">
					<h3 class="text-lg font-bold text-white uppercase tracking-wider">Suggestions</h3>
					<div class="h-px flex-1 bg-slate-800"></div>
				</div>

				<div class="grid gap-4">
					{#each messages as msg, i}
						<div class="group flex items-center justify-between p-5 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-indigo-500/40 hover:bg-slate-900 transition-all duration-300">
							<code class="text-indigo-400 font-mono text-sm sm:text-base">{msg}</code>
							<button
								onclick={() => copyToClipboard(msg, i)}
								class="shrink-0 ml-4 px-4 py-2 rounded-lg text-xs font-bold transition-all {copiedIndex === i ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-indigo-500'}"
							>
								{copiedIndex === i ? 'Copied' : 'Copy'}
							</button>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</main>

	<footer class="mt-20 py-12 border-t border-slate-900 text-center">
		<p class="text-slate-600 text-sm">Built by <span class="text-slate-400 font-semibold">Hizaki Labs</span> &copy; 2026</p>
	</footer>
</div>

<style>
	:global(body) {
		background-color: #0f172a;
	}
</style>