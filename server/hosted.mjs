// Hosted wiring (Gemini API key) shared by the Vercel functions in ../api/ring/.
// Local development keeps Vertex ADC via ../../../ring-backend.mjs.
import { hostedConfigFromEnv } from './config.mjs';
import { createApiHandler } from './http.mjs';
import { createGeminiTransport } from './gemini.mjs';
export function createHostedApi(env=process.env){
 const config=hostedConfigFromEnv(env);
 // Vercel stops functions at maxDuration (60s in vercel.json) without CORS headers; time out first so the browser gets a readable 504.
 const api=createApiHandler({config,generate:createGeminiTransport(config),allowedOrigins:config.allowedOrigins,hosted:true,timeoutMs:55000,reportFailure:diagnostic=>console.warn('Ring design request rejected:',JSON.stringify(diagnostic))});
 return async(req,res)=>{if(!await api(req,res)){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');}};
}
