import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
export const PROJECT_ROOT=fileURLToPath(new URL('../../../',import.meta.url));
export const DEFAULT_MODEL='gemini-3.1-pro-preview';
export const GEMINI_MODEL='gemini-3.6-flash';
export const OPENROUTER_MODEL='nvidia/nemotron-3-super-120b-a12b:free';
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
 return openRouterConfigFromEnv({...fileEnv,...Object.fromEntries(Object.entries(env).filter(([,v])=>v!==undefined))});
}
// Legacy transports are retained for isolated tests; active local/hosted wiring
// uses OpenRouter exclusively, with no fallback to Google credentials.
export function geminiConfigFromEnv(env={}){
 const config={provider:'gemini',model:(env.GEMINI_MODEL||GEMINI_MODEL).trim(),allowedOrigins:(env.RING_ALLOWED_ORIGINS||'').split(',').map(o=>o.trim().replace(/\/+$/,'')).filter(Boolean)};
 if(!/^gemini-[a-z0-9.-]+$/.test(config.model))throw Error('GEMINI_MODEL must be a Gemini model ID.');
 if(config.allowedOrigins.some(o=>!/^https?:\/\/[a-z0-9.-]+(:\d+)?$/i.test(o)))throw Error('RING_ALLOWED_ORIGINS must be comma-separated origins, e.g. https://www.jenidiam.com.');
 // Non-enumerable, so the key never reaches JSON, logs or the health response.
 Object.defineProperty(config,'apiKey',{value:(env.GEMINI_API_KEY||'').trim(),enumerable:false});
 return Object.freeze(config);
}
export function openRouterConfigFromEnv(env={}){
 const config={provider:'openrouter',model:(env.OPEN_ROUTER_MODEL||env.OPENROUTER_MODEL||OPENROUTER_MODEL).trim(),reasoning:(env.OPEN_ROUTER_REASONING||'low').trim(),port:Number(env.RING_BACKEND_PORT||env.RING_PREVIEW_PORT||9393),allowedOrigins:(env.RING_ALLOWED_ORIGINS||'').split(',').map(o=>o.trim().replace(/\/+$/,'')).filter(Boolean)};
 if(!/^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._:-]*$/i.test(config.model))throw Error('OPEN_ROUTER_MODEL must be an OpenRouter provider/model ID.');
 if(config.model!=='openrouter/free'&&!config.model.endsWith(':free'))throw Error('OPEN_ROUTER_MODEL must select a :free model or openrouter/free. Paid models are disabled.');
 if(!['none','low','medium','high'].includes(config.reasoning))throw Error('OPEN_ROUTER_REASONING must be none, low, medium or high.');
 if(!Number.isInteger(config.port)||config.port<1024||config.port>65535)throw Error('RING_BACKEND_PORT must be an integer between 1024 and 65535.');
 if(config.allowedOrigins.some(o=>!/^https?:\/\/[a-z0-9.-]+(:\d+)?$/i.test(o)))throw Error('RING_ALLOWED_ORIGINS must be comma-separated HTTP origins.');
 Object.defineProperty(config,'apiKey',{value:(env.OPEN_ROUTER_KEY||env.OPENROUTER_API_KEY||'').trim(),enumerable:false});
 return Object.freeze(config);
}
export const hostedConfigFromEnv=openRouterConfigFromEnv;
export const configSummary=config=>['gemini','openrouter'].includes(config.provider)?{provider:config.provider==='gemini'?'gemini-api':'openrouter',configured:Boolean(config.apiKey),authentication:'api-key',authenticationChecked:false,model:config.model}:{provider:'vertex',configured:Boolean(config.project),authentication:'adc',authenticationChecked:false,location:config.location,model:config.model};
