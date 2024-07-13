// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	if (response.status === 404) {
		// Redirect to /stake
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/stake'
			}
		});
	}

	return response;
};
