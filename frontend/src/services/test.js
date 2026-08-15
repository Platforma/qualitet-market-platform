import { API } from './api.js'; export async function testApi(){ const res = await fetch(\\/api/test\); return await res.json(); }
