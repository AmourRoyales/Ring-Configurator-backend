import { configSummary } from './config.mjs';
import { recommend, RecommendationError } from './recommend.mjs';
// `hosted` (server/hosted.mjs, Vercel) lists only the storefront origins; loopback origins are for local development.
export function createApiHandler({config,generate,allowedOrigins=[],hosted=false,timeoutMs=150000,recommendImpl=recommend,reportFailure}){
 const origins=new Set([...(hosted?[]:['http://127.0.0.1:9393','http://localhost:9393','http://127.0.0.1:9293','http://localhost:9293']),...allowedOrigins]);
 const limits=new Map();let active=0;
 const send=(res,status,data)=>{if(res.destroyed||res.writableEnded)return;res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
 return async(req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;if(!['/api/ring/recommend','/api/ring/health'].includes(pathname))return false;
  const origin=req.headers.origin;
  // Browsers always send Origin on these cross-site POSTs, so hosted mode refuses POSTs without one.
  // This keeps other sites from using the API; it is not authentication, since scripts can forge Origin.
  if(origin?!origins.has(origin):hosted&&req.method==='POST'){send(res,403,{error:'This origin is not allowed.'});return true;}
  if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Methods','POST, GET, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');}
  if(req.method==='OPTIONS'){res.writeHead(204);res.end();return true;}
  if(pathname.endsWith('/health')&&req.method==='GET'){send(res,200,configSummary(config));return true;}
  if(req.method!=='POST'||pathname.endsWith('/health')){send(res,405,{error:'Method not allowed.'});return true;}
  if(!req.headers['content-type']?.startsWith('application/json')){send(res,415,{error:'Expected JSON.'});return true;}
  // Behind Vercel's proxy the socket address is the proxy's; its x-forwarded-for names the client.
  const now=Date.now(),ip=(hosted&&String(req.headers['x-forwarded-for']||'').split(',')[0].trim())||req.socket.remoteAddress;for(const [k,v] of limits)if(now-v.start>60000)limits.delete(k);
  const limit=limits.get(ip)||{start:now,count:0};if(limit.count>=6||active>=2){send(res,429,{error:'Please wait a moment before creating more designs.'});return true;}
  limit.count++;limits.set(ip,limit);active++;
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),timeoutMs);const disconnect=()=>{if(!res.writableEnded)controller.abort();};res.on('close',disconnect);
  try{
   const chunks=[];let bytes=0;for await(const chunk of req){const buffer=Buffer.from(chunk);bytes+=buffer.length;if(bytes>18000)throw new RecommendationError('Your description is too long.',413);chunks.push(buffer);}const data=Buffer.concat(chunks).toString('utf8');
   let input;try{input=JSON.parse(data);}catch{throw new RecommendationError('Invalid JSON request.',400);}
   if(!input||Object.keys(input).some(k=>k!=='text'))throw new RecommendationError('Invalid request fields.',400);
   const result=await recommendImpl({text:input.text,signal:controller.signal,generate,reportFailure,provider:config.provider||'vertex'});send(res,200,result);
  }catch(e){send(res,e instanceof RecommendationError?e.status:controller.signal.aborted?504:502,{error:e instanceof RecommendationError?e.message:controller.signal.aborted?'Designing took too long. Your answers are preserved; please try again.':'The design service is temporarily unavailable. Please try again.'});}
  finally{active--;clearTimeout(timeout);res.off('close',disconnect);}
  return true;
 };
}
