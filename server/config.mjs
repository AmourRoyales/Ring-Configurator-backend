import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
export const PROJECT_ROOT=fileURLToPath(new URL('../../../',import.meta.url));
export const DEFAULT_MODEL='gemini-3.1-pro-preview';
export const GEMINI_MODEL='gemini-3-flash-preview';
// Match CAD Tools' project/location names. Local Vertex config never reads GEMINI_API_KEY.
export function configFromEnv(env={}){
 const config={project:(env.GOOGLE_CLOUD_PROJECT||env.VERTEX_PROJECT||'').trim(),location:(env.GOOGLE_CLOUD_LOCATION||'global').trim(),model:(env.VERTEX_MODEL||DEFAULT_MODEL).trim(),port:Number(env.RING_BACKEND_PORT||env.RING_PREVIEW_PORT||9393),credentialsFile:env.GOOGLE_APPLICATION_CREDENTIALS?path.resolve(PROJECT_ROOT,env.GOOGLE_APPLICATION_CREDENTIALS):undefined};
 if(config.project&&!/^(?:[a-z][a-z0-9-]{4,61}[a-z0-9]|\d+)$/.test(config.project))throw Error('GOOGLE_CLOUD_PROJECT must be a Google Cloud project ID or number.');
 if(!/^[a-z][a-z0-9-]*$/.test(config.location))throw Error('GOOGLE_CLOUD_LOCATION is invalid.');
 if(!/^gemini-[a-z0-9.-]+$/.test(config.model))throw Error('VERTEX_MODEL must be a Gemini publisher model ID.');
 if(['gemini-3.1-pro-preview','gemini-3-flash-preview'].includes(config.model)&&config.location!=='global')throw Error(`${config.model} requires GOOGLE_CLOUD_LOCATION=global.`);
 if(!Number.isInteger(config.port)||config.port<1024||config.port>65535)throw Error('RING_BACKEND_PORT must be an integer between 1024 and 65535.');
 return Object.freeze(config);
}
export async function loadConfig({env=process.env,envFile=new URL('../../../.env',import.meta.url)}={}){
 let fileEnv={};try{fileEnv=parseEnv(await readFile(envFile,'utf8'));}catch(error){if(error.code!=='ENOENT')throw Error('Could not read the ring backend .env file.');}
 return configFromEnv({...fileEnv,...Object.fromEntries(Object.entries(env).filter(([,v])=>v!==undefined))});
}
// Hosted backend (Vercel functions, see hosted.mjs) has no ADC, so it uses the Gemini API key.
export function hostedConfigFromEnv(env={}){
 const config={provider:'gemini',model:(env.GEMINI_MODEL||GEMINI_MODEL).trim(),allowedOrigins:(env.RING_ALLOWED_ORIGINS||'').split(',').map(o=>o.trim().replace(/\/+$/,'')).filter(Boolean)};
 if(!/^gemini-[a-z0-9.-]+$/.test(config.model))throw Error('GEMINI_MODEL must be a Gemini model ID.');
 if(config.allowedOrigins.some(o=>!/^https?:\/\/[a-z0-9.-]+(:\d+)?$/i.test(o)))throw Error('RING_ALLOWED_ORIGINS must be comma-separated origins, e.g. https://www.jenidiam.com.');
 // Non-enumerable, so the key never reaches JSON, logs or the health response.
 Object.defineProperty(config,'apiKey',{value:(env.GEMINI_API_KEY||'').trim(),enumerable:false});
 return Object.freeze(config);
}
export const configSummary=config=>config.provider==='gemini'?{provider:'gemini-api',configured:Boolean(config.apiKey),authentication:'api-key',authenticationChecked:false,model:config.model}:{provider:'vertex',configured:Boolean(config.project),authentication:'adc',authenticationChecked:false,location:config.location,model:config.model};
