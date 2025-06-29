import { Hono } from 'hono';

const app = new Hono();

function lastfm_url(method: String, name: String, api_key: String) {
	return `http://ws.audioscrobbler.com/2.0/?method=${method}&user=${name}&api_key=${api_key}&format=json`;
}

app.get('/', (c) => c.text("prydt's lastfm cloudflare worker"));

app.get('/user/:name', async (c) => {
	const name = c.req.param('name');
	const key = c.env.LASTFM_API_KEY;
	const url = lastfm_url('user.getRecentTracks', name, key)

	let response = await fetch(url, {
		cf: {
			cacheEverything: true,
			cacheTtl: 21600, // max cache duration of 6 hours
			cacheKey: url,
		}
	});

	// set browser cache header to cache for 12 hours
	response = new Response(response.body, response)
	response.headers.set('Cache-Control', 'max-age=43200')

	return response;
});

export default app;
