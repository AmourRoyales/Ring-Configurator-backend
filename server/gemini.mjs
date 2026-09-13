import { RecommendationError } from './errors.mjs';
export const geminiUrl=model=>`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
// Hosted deployments have no ADC, so they call the Gemini API with a server-side key.
// It accepts the same generateContent body that Vertex receives.
export function createGeminiTransport(config,{fetchImpl=fetch}={}){
 return async({body,signal})=>{
  if(!config.apiKey)throw new RecommendationError('The design service is not configured yet. Add GEMINI_API_KEY to the deployment environment.',503);
  signal?.throwIfAborted();
  // One attempt with native fetch. The key travels only in this header, never in the URL or body.
  return fetchImpl(geminiUrl(config.model),{method:'POST',headers:{'x-goog-api-key':config.apiKey,'Content-Type':'application/json'},body:JSON.stringify(body),signal,redirect:'error'});
 };
}
