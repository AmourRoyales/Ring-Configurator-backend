// OpenRouter wiring shared by the Vercel functions and the local Node backend.
import { hostedConfigFromEnv } from './config.mjs';
import { createApiHandler } from './http.mjs';
import { createOpenRouterTransport } from './openrouter.mjs';
export function createHostedApi(env=process.env,transportOptions){
 const config=hostedConfigFromEnv(env);
 // Vercel stops functions at maxDuration (60s in vercel.json) without CORS headers; time out first so the browser gets a readable 504.
 const api=createApiHandler({config,generate:createOpenRouterTransport(config,transportOptions),allowedOrigins:config.allowedOrigins,hosted:true,timeoutMs:55000,reportFailure:diagnostic=>console.warn('Ring design request rejected:',JSON.stringify(diagnostic))});
 return async(req,res)=>{if(!await api(req,res)){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');}};
}
