// Classify provider failures without returning or logging raw provider messages.
// Google may include request content in diagnostics, so only fixed labels leave here.
const PROVIDERS={
 vertex:{name:'Vertex',model:'Vertex rejected the model or location. Check VERTEX_MODEL and GOOGLE_CLOUD_LOCATION.',401:'Vertex authentication was rejected. Refresh the backend ADC login and try again.',403:'Vertex access was denied. Check the project permissions, Vertex AI API and billing configuration.',404:'The Vertex model is unavailable in this project or location. Check VERTEX_MODEL and GOOGLE_CLOUD_LOCATION.'},
 gemini:{name:'The Gemini API',model:'The Gemini API rejected the model. Check GEMINI_MODEL.',401:'The Gemini API key was rejected. Check GEMINI_API_KEY.',403:'The Gemini API key does not have access. Check GEMINI_API_KEY and its Google project.',404:'The Gemini model is unavailable for this API key. Check GEMINI_MODEL.'}
};
export async function providerFailure(response,provider='vertex'){
 const labels=PROVIDERS[provider]||PROVIDERS.vertex;
 let error;try{error=(await response.json()).error;}catch{error=null;}
 const message=typeof error?.message==='string'?error.message.toLowerCase():'';
 const violations=Array.isArray(error?.details)?error.details.flatMap(d=>Array.isArray(d?.fieldViolations)?d.fieldViolations:[]):[];
 const fields=[...new Set(violations.map(v=>typeof v.field==='string'?v.field:'').flatMap(field=>['responseSchema','responseJsonSchema','thinkingConfig','maxOutputTokens','contents','systemInstruction'].filter(name=>field.toLowerCase().replaceAll('_','').includes(name.toLowerCase()))))];
 let category='request';
 // The Gemini API reports an invalid key as HTTP 400, not 401.
 if(provider==='gemini'&&/api key/.test(message))category='key';
 else if(/schema|enum|constraint|too many states/.test(message)||fields.some(f=>/schema/i.test(f)))category='schema';
 else if(/thinking|thinking_level|thinkingbudget/.test(message)||fields.includes('thinkingConfig'))category='thinking';
 else if(/max.?output.?tokens|token limit/.test(message)||fields.includes('maxOutputTokens'))category='output-limit';
 else if(/model|location|region/.test(message))category='model';
 const specific={key:labels[401],schema:`${labels.name} rejected the structured-output schema. Check the backend response schema.`,thinking:`${labels.name} rejected the thinking configuration for this model. Check the backend thinking level.`,'output-limit':`${labels.name} rejected the output token limit. Check the backend generation limit.`,model:labels.model,request:`${labels.name} rejected the request parameters. Check the backend request format.`};
 const messages={401:labels[401],403:labels[403],429:`${labels.name} is busy or its quota has been reached. Please try again later.`,400:specific[category],404:labels[404]};
 return {message:messages[response.status]||`${labels.name} could not complete this request. Please try again.`,diagnostic:{provider,httpStatus:response.status,category,fields}};
}
export const vertexFailure=response=>providerFailure(response,'vertex');
