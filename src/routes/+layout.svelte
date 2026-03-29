<script lang="ts">
	import './layout.css';
	import { ModeWatcher, toggleMode } from 'mode-watcher';

	let { children } = $props();
</script>

<ModeWatcher />

<div
	class="relative flex min-h-screen flex-col bg-gray-100 text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-gray-100"
>
	<div class="absolute top-4 right-4 z-50">
		<button
			onclick={toggleMode}
			class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
			aria-label="Toggle Dark Mode"
		>
			<svg
				class="block dark:hidden"
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="12" cy="12" r="4" />
				<path d="M12 2v2" />
				<path d="M12 20v2" />
				<path d="m4.93 4.93 1.41 1.41" />
				<path d="m17.66 17.66 1.41 1.41" />
				<path d="M2 12h2" />
				<path d="M20 12h2" />
				<path d="m6.34 17.66-1.41 1.41" />
				<path d="m19.07 4.93-1.41 1.41" />
			</svg>

			<svg
				class="hidden dark:block"
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
			</svg>
		</button>
	</div>

	<main class="flex-1 pt-16">
		{@render children()}
	</main>

	<footer
		class="border-t border-gray-300 bg-white p-6 text-center transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900"
	>
		<div
			class="flex items-center justify-center gap-4 text-sm font-medium text-gray-600 dark:text-gray-400"
		>
			<a
				href="https://github.com/lukasabbe"
				target="_blank"
				class="hover:text-blue-600 dark:hover:text-blue-400"
			>
				My GitHub
			</a>
			<span>&bull;</span>
			<a
				href="https://lukasabbe.com"
				target="_blank"
				class="hover:text-blue-600 dark:hover:text-blue-400"
			>
				My Website
			</a>
			<span>&bull;</span>
			<a
				href="https://github.com/lukasabbe/skin-pack-website"
				target="_blank"
				class="hover:text-blue-600 dark:hover:text-blue-400"
			>
				GitHub Repo
			</a>
		</div>
		<p class="mt-2 text-xs text-gray-500 dark:text-gray-500">
			&copy; {new Date().getFullYear()} Lukas HB. All rights reserved.
		</p>
	</footer>
</div>
