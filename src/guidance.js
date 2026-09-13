import * as D from './design.js';
const map = values => Object.fromEntries(values.map(v => [String(v), D.SHAPE_LABELS[v] || String(v)]));
export const CATALOG = {
 family: D.FAMILY_LABELS, shape: map(D.MAIN_SHAPES), carat: map([.3,.5,.7,1,1.2,1.5,2,2.5,3,4,5]),
 metal: Object.fromEntries(Object.entries(D.METALS).map(([k,v])=>[k,v.label])),
 setting: {prong:'Prong',bezel:'Bezel',tension:'Tension'}, prongs:D.PRONG_LABELS, tip:D.TIP_LABELS,
 height:{low:'Low',standard:'Standard',high:'High'}, basket:D.BASKETS, visibleHalo:D.HALOS,
 shank:D.SHANKS, profile:D.PROFILES, width:map(D.WIDTHS), finish:D.FINISHES,
 shoulders:D.SHOULDER_LABELS, paveCoverage:D.COVERAGES, rows:D.ROWS,
 sideShape:map(D.SIDE_SHAPES), sideRatio:{2:'1 : 2',3:'1 : 3',4:'1 : 4',5:'1 : 5'},
 sideSetting:{prong:'Prong',bezel:'Bezel',channel:'Channel'}, sideOrientation:{auto:'Follow shoulders',in:'Point in',out:'Point out',parallel:'Parallel'},
 secondShape:map(D.MAIN_SHAPES), secondCarat:map([.3,.5,.7,1,1.5,2,3]), clusterShape:map(['round','marquise','pear']),
 eternitySetting:Object.fromEntries(Object.entries(D.SHOULDER_LABELS).filter(([k])=>k!=='plain')),
 eternityShape:map(D.ETERNITY_SHAPES), coverage:{half:'Half',threequarter:'Three-quarter',full:'Full'},
 meleeShape:map(['round','princess','baguette','oval']), meleeSize:map(D.MELEE_SIZES), eternitySize:map(D.MELEE_SIZES),
 fit:{comfort:'Comfort fit',standard:'Standard fit'}, colour:map(['D','E','F','G','H']), clarity:map(['VVS1','VVS2','VS1','VS2']),
 size:map(Array.from({length:19},(_,i)=>4+i*.5))
};
export const FIELD_LABELS={family:'Ring style',shape:'Main diamond',carat:'Centre carat',metal:'Metal',setting:'Centre setting',prongs:'Prong count',tip:'Prong style',height:'Setting height',basket:'Basket',visibleHalo:'Halo',shank:'Band style',profile:'Band profile',width:'Band width',finish:'Finish',shoulders:'Band diamonds',paveCoverage:'Diamond coverage',rows:'Diamond rows',sideShape:'Side diamonds',sideRatio:'Side stone proportion',sideSetting:'Side setting',sideOrientation:'Side orientation',secondShape:'Second diamond',secondCarat:'Second carat',clusterShape:'Cluster diamonds',eternitySetting:'Band stone setting',eternityShape:'Band diamond shape',coverage:'Coverage',meleeShape:'Small diamond shape',meleeSize:'Small diamond width',eternitySize:'Band diamond width',fit:'Finger fit',colour:'Diamond colour',clarity:'Diamond clarity',size:'Ring size · US'};
export const valueLabel=(key,value)=>(CATALOG[key]?.[typeof value==='number'?String(Number(value.toFixed(3))):String(value)]||String(value)) + (['carat','secondCarat'].includes(key)?' ct':['width','meleeSize','eternitySize'].includes(key)?' mm':'');
export const valueType=(key,value)=>typeof D.DEFAULTS[key]==='number'?Number(value):value;
export const sameValue=(a,b)=>typeof a==='number'&&Number.isFinite(Number(b))?Math.abs(a-Number(b))<1e-6:a===b;
const equal=sameValue;
export function applicable(key,s){
 const centre=D.hasCentre(s);
 if(['shape','carat','setting','height','basket','visibleHalo','prongs','tip'].includes(key)&&!centre)return false;
 if(['prongs','tip'].includes(key)&&s.setting!=='prong')return false;
 if(key.startsWith('side'))return s.family==='three';
 if(key.startsWith('second'))return s.family==='toi';
 if(key==='clusterShape')return s.family==='cluster';
 if(['eternityShape','eternitySize','eternitySetting','coverage'].includes(key))return !centre&&(s.family!=='wedding'||s.shoulders!=='plain');
 if(['paveCoverage','meleeSize','meleeShape'].includes(key))return centre&&s.shoulders!=='plain';
 if(key==='rows')return centre?s.shoulders!=='plain':s.family!=='wedding'||s.shoulders!=='plain';
 if(key==='shoulders')return centre||s.family==='wedding';
 return true;
}
// A bounded compatibility graph, built once per AI response, never per animation frame.
export function compileVariation(raw,source=''){
 if(!raw||typeof raw.title!=='string'||!raw.title.trim()||raw.title.length>70||typeof raw.summary!=='string'||raw.summary.length>280)throw Error('Invalid design description');
 if(!Array.isArray(raw.options)||raw.options.length<3||raw.options.length>16)throw Error('Invalid option count');
 const seen=new Set();let combinations=1;
 const options=raw.options.map(o=>{
  if(!o||!Object.hasOwn(CATALOG,o.key)||seen.has(o.key)||!Array.isArray(o.values)||!o.values.length||o.values.length>3)throw Error('Invalid design option');
  seen.add(o.key);combinations*=o.values.length;if(combinations>729)throw Error('Too many variations');
  if(o.values.some(v=>typeof v!=='string'||!Object.hasOwn(CATALOG[o.key],v))||new Set(o.values).size!==o.values.length)throw Error('Unsupported option value');
  if(typeof o.reason!=='string'||!o.reason.trim()||o.reason.length>280||typeof o.evidence!=='string'||o.evidence.length>160)throw Error('Invalid design reason');
  if(o.evidence&&!source.toLowerCase().includes(o.evidence.toLowerCase()))throw Error('Ungrounded design evidence');
  return {key:o.key,values:[...o.values],reason:o.reason,evidence:o.evidence};
 });
 if(!seen.has('family')||!seen.has('metal')||raw.options.find(o=>o.key==='family').values.length!==1)throw Error('A variation needs one family and a metal');
 const configurations=[];
 function visit(i,s){
  if(i<options.length){const o=options[i];for(const v of o.values)visit(i+1,{...s,[o.key]:valueType(o.key,v)});return;}
  const n=D.normaliseDesign(s);
  if(options.every(o=>equal(s[o.key],n[o.key])&&applicable(o.key,n)))configurations.push(n);
 }
 visit(0,{...D.DEFAULTS});
 if(!configurations.length)throw Error('Incompatible design options');
 // Reject instead of silently changing the AI's offered values or quoted reasoning.
 if(options.some(o=>o.values.some(v=>!configurations.some(s=>equal(s[o.key],valueType(o.key,v))))))throw Error('An offered option has no compatible design');
 return {title:raw.title,summary:raw.summary,options,configurations};
}
export function validateRecommendations(raw,source){
 if(!raw||raw.version!==1||!Array.isArray(raw.variations)||raw.variations.length<2||raw.variations.length>3)throw Error('Expected two or three designs');
 return {version:1,variations:raw.variations.map(v=>compileVariation(v,source))};
}
export function chooseConfiguration(variation,state,key,value){
 const candidates=variation.configurations.filter(s=>equal(s[key],valueType(key,value)));
 if(!candidates.length)return null;
 return candidates.reduce((best,s)=>{
  const score=x=>variation.options.reduce((n,o)=>n+(equal(x[o.key],state[o.key])?1:0),0);
  return !best||score(s)>score(best)?s:best;
 },null);
}
const q=(id,title,entries,hint='')=>({id,title,entries:typeof entries[0]==='string'?entries.map(v=>[v,v]):entries,hint});
export function lifestyleQuestions(answers={},count=5){
 const gift=answers.recipient==='Gift',medical=answers.routine==='Clinical work / frequent gloves';
 return [
  q('recipient','Who is this ring for?',['Myself','Gift']),
  q('occasion',gift?'What are you celebrating?':'What brings you here?',['Anniversary','Engagement','Wedding','A milestone','Just because']),
  q('routine',gift?'What does their everyday life look like?':'What does your everyday life look like?',['Clinical work / frequent gloves','Hands-on work / active days','Desk work / mixed routine','Mainly occasions'],'Choose the closest fit; you can add details before we design.'),
  q('style',gift?'Which feels most like them?':'Which feels most like you?',['Quiet & minimal','Timeless & classic','Romantic & detailed','Bold & expressive','Not sure']),
  q('metal','Which metal colour feels right?',['Yellow gold','White metal','Rose gold','No preference']),
  q('wear',medical?'When would the ring be worn?':'How often will it be worn?',medical?['Outside clinical work','Daily where workplace rules allow','Special occasions']:['Every day','Weekends & evenings','Special occasions']),
  q('priority','What matters most?',['Comfort & practicality','A meaningful story','A striking centre stone','Easy care','Balanced design']),
  q('budget','Do you have a budget direction?',['Keep the design modest','A balanced investment','Room for a statement','Discuss with the jeweller'],'Design direction only. A quotation depends on the final stones and metal.'),
  q('sparkle','How much sparkle feels right?',['One focal diamond','A little along the band','Sparkle all around','Let the design guide me']),
  q('symbol',gift?'What would you like the gift to say?':'What should the ring represent?',['Our story together','A fresh chapter','Quiet confidence','Celebration & joy','No particular symbol']),
  q('care','How much upkeep suits the wearer?',['Prefer simpler cleaning','Happy to care for fine details','Not sure']),
  q('avoid','Anything to steer away from?',['Tall settings','Pointed shapes','Lots of small diamonds','Nothing in particular'])
 ].slice(0,[5,8,12].includes(count)?count:5);
}
export function specQuestions(s){
 const steps=[];const add=(key,title,values=CATALOG[key],hint='')=>steps.push({id:key,title,entries:Object.entries(values).map(([v,l])=>[v,v==='unknown'?'Confirm later':valueLabel(key,v)]),hint});
 add('family','Start with a ring style.');
 if(D.hasCentre(s)){
  add('shape','Choose the main diamond shape.');add('carat','How prominent should the centre be?');
  add('setting','How should the diamond be held?',{prong:'Prong',bezel:'Bezel',...(s.family==='solitaire'&&['round','princess','emerald'].includes(s.shape)&&s.carat>=.7?{tension:'Tension'}:{})});
  if(s.setting==='prong'){add('prongs','Choose the prong arrangement.',Object.fromEntries(D.availableProngs(s.shape).map(v=>[v,D.PRONG_LABELS[v]])));add('tip','Choose the prong finish.',Object.fromEntries(D.availableTips(s.shape).map(v=>[v,D.TIP_LABELS[v]])));}
  if(s.family==='three'){add('sideShape','Which side diamonds complete the trio?');add('sideRatio','Choose their proportion.');add('sideSetting','How should the side stones be held?');}
  if(s.family==='toi'){add('secondShape','Choose the second diamond.');add('secondCarat','Choose the second diamond’s size.');}
  if(s.family==='cluster')add('clusterShape','Choose the accent stones.');
  if(s.family==='hidden')add('basket','Choose your hidden halo.',{hidden:'Hidden halo',double:'Double hidden halo'});
  if(s.family==='halo')add('visibleHalo','Choose the halo.',Object.fromEntries(Object.entries(D.HALOS).filter(([k])=>k!=='none')));
 }
 add('shank','What shape should the band take?');
 if(D.hasCentre(s)||s.family==='wedding')add('shoulders','Add diamonds along the band?');
 if(D.hasCentre(s)&&s.shoulders!=='plain')add('paveCoverage','How far should the diamonds continue?');
 if(!D.hasCentre(s)&&(s.family!=='wedding'||s.shoulders!=='plain')){
  add('eternitySetting','Choose the band stone setting.');add('eternityShape','Choose the band diamond shape.',map(D.availableMeleeShapes(s.eternitySetting)));
  if(s.family!=='eternity')add('coverage','How far should the diamonds continue?',s.family==='partial'?{half:'Half',threequarter:'Three-quarter'}:CATALOG.coverage);
 }
 add('metal','Choose the metal.');
 add('width','Choose a comfortable band width.',Object.fromEntries(D.WIDTHS.filter(w=>D.normaliseDesign({...s,width:w}).width===w).map(w=>[w,String(w)])));
 add('size','Do you know the ring size?',{unknown:'Confirm later',...CATALOG.size},'US sizes. Choose “Confirm later” if you are unsure.');
 steps.at(-1).entries.unshift(['unknown','Confirm later']);steps.at(-1).entries=steps.at(-1).entries.filter((e,i,a)=>a.findIndex(x=>x[0]===e[0])===i);
 return steps;
}
export function specState(history){let s=D.normaliseDesign(D.DEFAULTS);for(const h of history)if(h.value!=='unknown')s=D.normaliseDesign({...s,[h.key]:valueType(h.key,h.value)});return s;}
