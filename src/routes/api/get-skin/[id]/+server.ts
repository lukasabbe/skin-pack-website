export async function GET({ params }) {
	const { id } = params;
	const skinImage = await fetch(`http://textures.minecraft.net/texture/${id}`);
	const skinBuffer = await skinImage.arrayBuffer();
	const skinData = Buffer.from(skinBuffer);
	return new Response(skinData, {
		headers: {
			'Content-Type': 'image/png'
		}
	});
}
