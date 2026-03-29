<script lang="ts">
	import fileSaver from 'file-saver';
	const { saveAs } = fileSaver;
	import JSZip from 'jszip';
	import skins from '$lib/assets/skins.png';

	let isLoading = $state(false);
	let names = $state<string[]>([]);
	let currentInput = $state('');

	let errorMessage = $state<string | null>(null);

	type MCData = {
		success: boolean;
		data: {
			MinecraftUUID: string;
			MinecraftUsername: string;
			MinecraftSkinData: {
				timestamp: number;
				UUID: string;
				username: string;
				skinUrl: string;
				model: string;
			};
		}[];
	};

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === ' ' || event.key === 'Enter') {
			event.preventDefault();

			const trimmedName = currentInput.trim();
			if (trimmedName && !names.includes(trimmedName)) {
				names = [...names, trimmedName];
				currentInput = '';
			}
		} else if (event.key === 'Backspace' && currentInput === '') {
			names = names.slice(0, -1);
		}
	}

	function removeName(indexToRemove: number) {
		names = names.filter((_, index) => index !== indexToRemove);
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		errorMessage = null;

		const pendingName = currentInput.trim();
		let finalNames = [...names];
		if (pendingName && !finalNames.includes(pendingName)) {
			finalNames.push(pendingName);
			names = finalNames;
			currentInput = '';
		}

		if (finalNames.length === 0) {
			errorMessage = 'Please enter at least one username.';
			return;
		}

		isLoading = true;

		try {
			const response = await fetch('/api/get-skins', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ usernames: finalNames })
			});

			const result = (await response.json()) as MCData;

			if (result.success) {
				const zipBlob = await generateZip(result);
				if (zipBlob) {
					saveAs(zipBlob, 'skinpack.zip');
				}
				names = [];
			} else {
				errorMessage = 'Something went wrong.';
			}
		} catch (error) {
			console.error(error);
			errorMessage = 'Failed to connect to the server.';
		} finally {
			isLoading = false;
		}
	}

	async function getImageDimensions(blob: Blob) {
		return new Promise<{ width: number; height: number }>((resolve, reject) => {
			const img = new Image();
			const objectUrl = URL.createObjectURL(blob);

			img.onload = () => {
				URL.revokeObjectURL(objectUrl);
				resolve({ width: img.width, height: img.height });
			};

			img.onerror = () => {
				URL.revokeObjectURL(objectUrl);
				reject(new Error('Failed to load image to get dimensions'));
			};

			img.src = objectUrl;
		});
	}

	async function generateZip(data: MCData) {
		const zip = new JSZip();
		const packMcmeta = {
			pack: {
				pack_format: 75,
				min_format: 75,
				max_format: 75,
				description: 'Skin pack\nMade by Lukasabbe'
			}
		};

		zip.file('pack.mcmeta', JSON.stringify(packMcmeta, null, 2));
		const itemsFolder = zip.folder('assets/minecraft/items');
		const modelsFolder = zip.folder('assets/trusted_skin_pack/models/item');
		const texturesFolder = zip.folder('assets/trusted_skin_pack/textures/item');
		if (!texturesFolder || !modelsFolder || !itemsFolder) return;

		let carved_pumpkin_item_obj = {
			model: {
				type: 'minecraft:select',
				property: 'minecraft:component',
				component: 'minecraft:custom_name',
				cases: {},
				fallback: {
					type: 'minecraft:model',
					model: 'minecraft:block/carved_pumpkin'
				}
			}
		};

		let cases: { when: string; model: { type: string; model: string } }[] = [];

		const oldModel = await fetch('/old.json');
		const oldModelJson = await oldModel.json();
		const slimModel = await fetch('/slim.json');
		const slimModelJson = await slimModel.json();
		const normalModel = await fetch('/normal.json');
		const normalModelJson = await normalModel.json();

		for (const profile of data.data) {
			const image = await fetch(
				`/api/get-skin/${profile.MinecraftSkinData.skinUrl.split('texture/')[1]}`
			);
			const imageBlob = await image.blob();
			texturesFolder.file(`${profile.MinecraftUsername}.png`, imageBlob);
			const { height } = await getImageDimensions(imageBlob);

			let model;

			if (height == 32) {
				model = oldModelJson;
			} else if (profile.MinecraftSkinData.model == 'SLIM') {
				model = slimModelJson;
			} else if (profile.MinecraftSkinData.model == 'CLASSIC') {
				model = normalModelJson;
			} else return;

			model.textures['0'] = `trusted_skin_pack:item/${profile.MinecraftUsername}`;
			model.textures.particle = `trusted_skin_pack:item/${profile.MinecraftUsername}`;

			modelsFolder.file(`${profile.MinecraftUsername}.json`, JSON.stringify(model, null, 2));

			cases.push({
				when: profile.MinecraftUsername.toLowerCase(),
				model: {
					type: 'minecraft:model',
					model: `trusted_skin_pack:item/${profile.MinecraftUsername}`
				}
			});
		}

		carved_pumpkin_item_obj.model.cases = cases;
		itemsFolder.file('carved_pumpkin.json', JSON.stringify(carved_pumpkin_item_obj, null, 2));
		return new Promise<Blob>((resolve, reject) => {
			zip
				.generateAsync({ type: 'blob' })
				.then((content) => {
					resolve(content);
				})
				.catch(reject);
		});
	}
</script>

<div class="flex flex-col items-center px-4 py-8">
	<div
		class="mb-8 w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800"
	>
		<h2 class="mb-4 text-xl font-bold text-gray-800 dark:text-white">
			Skin Pack Generator - 1.21.11
		</h2>

		<div class="flex flex-col gap-6">
			<div class="space-y-3 text-sm text-gray-600 dark:text-gray-300">
				<p>
					<bold>Welcome to the Minecraft Skin Pack Generator!</bold>
					This tool allows you to generate a resource pack with dynamic skins.
				</p>
				<p>
					Simply type in the usernames of the players below, press Space or Enter to add them, and
					click "Download Pack."
				</p>
				<h2 class="text-m font-bold text-gray-800 dark:text-white">How to use</h2>
				<ul>
					<li>1. Put the .zip file into your Minecraft resource packs folder.</li>
					<li>
						2. In-game, rename a carved pumpkin to a username you entered when you generated the
						pack.
					</li>
					<li>3. The pumpkin will take on the model of the skin you entered.</li>
				</ul>
			</div>

			<div
				class="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50"
			>
				<img src={skins} alt="Skins" class="h-full w-full object-cover" />
			</div>
		</div>
	</div>

	<div
		class="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800"
	>
		<h1 class="mb-6 text-2xl font-bold text-gray-800 dark:text-white">Minecraft Skin Generator</h1>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div>
				<label
					for="nameInput"
					class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					Enter Usernames (Press Space or Enter to add)
				</label>

				<div
					class="flex min-h-15 w-full flex-wrap items-start gap-2 rounded-lg border border-gray-300 bg-white p-2 transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 {isLoading
						? 'cursor-not-allowed bg-gray-100 dark:bg-gray-600'
						: ''}"
				>
					{#each names as name, index (name)}
						<span
							class="flex items-center gap-1 rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
						>
							{name}
							<button
								type="button"
								class="flex h-5 w-5 items-center justify-center rounded-full hover:bg-blue-200 hover:text-blue-900 focus:outline-none dark:hover:bg-blue-800 dark:hover:text-blue-100"
								onclick={() => removeName(index)}
								disabled={isLoading}
								aria-label="Remove {name}"
							>
								&times;
							</button>
						</span>
					{/each}

					<input
						id="nameInput"
						type="text"
						bind:value={currentInput}
						onkeydown={handleKeydown}
						disabled={isLoading}
						placeholder={names.length === 0 ? 'e.g. Notch, Jeb_...' : ''}
						class="mt-1 min-w-30 flex-1 bg-transparent py-1 text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed dark:text-white dark:placeholder:text-gray-400"
					/>
				</div>
			</div>

			<button
				type="submit"
				disabled={isLoading}
				class="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 dark:hover:bg-blue-500 dark:disabled:bg-blue-800"
			>
				{#if isLoading}
					<svg
						class="mr-3 h-5 w-5 animate-spin text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Fetching Skins...
				{:else}
					Download Pack
				{/if}
			</button>
		</form>

		{#if errorMessage}
			<div
				class="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
			>
				<p>{errorMessage}</p>
			</div>
		{/if}
	</div>
</div>
