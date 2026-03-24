import { json } from '@sveltejs/kit';
import { normalApiQueue, skinApiQueue } from '$lib/server/apiQueue';
import { getProfilesFromUsernames, MinecraftProfile } from 'minecraft-api-wrapper';

export async function POST({ request }) {
	try {
		const payload = await request.json();

		const usernames = chunkArray<string>(payload.usernames);

		const promises: Promise<MinecraftProfile[] | null>[] = [];

		for (const chunk of usernames) {
			promises.push(
				normalApiQueue.add(async () => {
					const profiles = await getProfilesFromUsernames(chunk);
					if (!profiles) return null;
					for (const profile of profiles) {
						await skinApiQueue.add(async () => {
							await profile.getSkinUrl();
						});
					}
					return profiles;
				})
			);
		}

		const results = await Promise.all(promises);
		const filteredResults = results.filter(
			(result): result is MinecraftProfile[] => result !== null
		);
		const allProfiles = filteredResults.flat();
		return json({ success: true, data: allProfiles });
	} catch (error) {
		console.error('Queue/API Error:', error);
		return json({ success: false, message: 'Failed to fetch data' }, { status: 500 });
	}
}

function chunkArray<T>(list: T[]): T[][] {
	const chunkSize = 10;
	const chunkedList: T[][] = [];

	for (let i = 0; i < list.length; i += chunkSize) {
		// .slice() automatically handles cases where there are fewer than 10 elements left
		chunkedList.push(list.slice(i, i + chunkSize));
	}

	return chunkedList;
}
