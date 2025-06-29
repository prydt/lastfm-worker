import { Hono } from 'hono';
const app = new Hono();

function lastfm_url(method: String, name: String, api_key: String) {
	return `http://ws.audioscrobbler.com/2.0/?method=${method}&user=${name}&api_key=${api_key}&format=json`;
}

app.get('/', (c) => c.text("prydt's lastfm cloudflare worker"));

app.get('/user/:name', async (c) => {
	const name = c.req.param('name');
	const key = c.env.LASTFM_API_KEY;

	let response = await fetch(lastfm_url('user.getRecentTracks', name, key));

	return response;
});

export default app;
