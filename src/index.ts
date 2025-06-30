import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

function lastfm_url(method: String, name: String, api_key: String) {
	return `http://ws.audioscrobbler.com/2.0/?method=${method}&user=${name}&api_key=${api_key}&format=json`;
}

app.get('/', (c) =>
	c.html(`<!doctype html>
			<h1>prydt's lastfm api wrapper</h1>
			<p>get the source here: <a href="https://github.com/prydt/lastfm-worker">https://github.com/prydt/lastfm-worker</a></p>`),
);

app.get('/user/:name', async (c) => {
	const name = c.req.param('name');
	const key = c.env.LASTFM_API_KEY;
	const url = lastfm_url('user.getRecentTracks', name, key);
	const ipaddr = c.req.header('cf-connecting-ip') || '';

	// Generally you shouldn't rate limit based on IP due to IP sharing,
	// but we really shouldn't ever hit this limit.
	// This is a better option than stopping every single person from accessing
	// the API rather than just potentially a single mobile service provider or something.
	const { success } = await c.env.RATE_LIMITER.limit({ key: ipaddr });

	if (!success) {
		return new Response('API rate limit exceeded', { status: 429 });
	}

	let response = await fetch(url, {
		cf: {
			cacheEverything: true,
			cacheTtl: 21600, // max cache duration of 6 hours
			cacheKey: url,
		},
	});

	// set browser cache header to cache for 12 hours
	response = new Response(response.body, response);
	response.headers.set('Cache-Control', 'max-age=43200');

	return response;
});

export default app;
