import {RecommendationError} from './errors.mjs';
export const OPENROUTER_URL='https://openrouter.ai/api/v1/chat/completions';

export function createOpenRouterTransport(config,{fetchImpl=fetch}={}){
 return async({body,signal})=>{
  if(!config.apiKey)throw new RecommendationError('The design service is not configured yet. Add OPEN_ROUTER_KEY to the backend environment.',503);
  signal?.throwIfAborted();
  // One HTTP attempt. No model fallback, application retry or credential redirect.
  return fetchImpl(OPENROUTER_URL,{method:'POST',headers:{Authorization:`Bearer ${config.apiKey}`,'Content-Type':'application/json','X-OpenRouter-Title':'Jeni Diam Ring Studio'},body:JSON.stringify({...body,model:config.model,provider:{require_parameters:true,allow_fallbacks:false,max_price:{prompt:0,completion:0,request:0}},reasoning:config.reasoning==='none'?{enabled:false,exclude:true}:{effort:config.reasoning,exclude:true}}),signal,redirect:'error'});
 };
}
