export const FAMILY_LABELS={solitaire:'Solitaire',hidden:'Hidden-halo solitaire',halo:'Halo',three:'Three stone',eternity:'Full eternity',partial:'Half / ¾ eternity',toi:'Toi et Moi',cluster:'Cluster',bridal:'Bridal set',wedding:'Wedding / anniversary'};
export const SHAPE_LABELS={round:'Round',oval:'Oval',cushion:'Cushion',princess:'Princess',emerald:'Emerald',radiant:'Radiant',pear:'Pear',marquise:'Marquise',asscher:'Asscher',heart:'Heart',baguette:'Straight baguette',tapered:'Tapered baguette',trillion:'Trillion',trapezoid:'Trapezoid',halfmoon:'Half moon',matching:'Matching centre'};
export const MAIN_SHAPES=['round','oval','cushion','princess','emerald','radiant','pear','marquise','asscher','heart'];
export const SIDE_SHAPES=['trapezoid','trillion','tapered','halfmoon','pear','oval','emerald','round','matching'];
export const ETERNITY_SHAPES=['round','oval','princess','emerald','baguette'];
export const RATIOS={round:[1],oval:[1.3,1.4,1.5],cushion:[1,1.1,1.2],princess:[1],emerald:[1.3,1.4,1.5],radiant:[1,1.2,1.3],pear:[1.45,1.55,1.7],marquise:[1.85,2,2.15],asscher:[1],heart:[.95,1]};
export const PRONG_LABELS={four:'4 prongs',five:'5 prongs',six:'6 prongs',eight:'8 prongs'};
export const TIP_LABELS={round:'Rounded',claw:'Fine claw',tab:'Flat tab',double:'Double claw',v:'V-prong'};
export const BASKETS={plain:'Plain',hidden:'Hidden halo',double:'Double hidden halo',pave:'Pavé basket',prongs:'Pavé prongs',filigree:'Filigree'};
export const HALOS={none:'None',single:'Single halo',double:'Double halo',floating:'Floating halo',compass:'Compass halo'};
export const SHANKS={straight:'Straight',cathedral:'Cathedral',tapered:'Tapered',reverse:'Reverse taper',split:'Split shank',doubleSplit:'Double split',knife:'Knife edge',twisted:'Twisted / bypass',euro:'Euro · flat bottom',pinched:'Pinched'};
export const PROFILES={court:'Court',flat:'Flat',flatCourt:'Flat court',halfRound:'Half round',knife:'Knife edge',bevel:'Bevelled'};
export const FINISHES={polish:'High polish',matte:'Matte / satin',brushed:'Brushed',hammered:'Hammered',milgrain:'Milgrain edge',bright:'Bright cut'};
export const SHOULDER_LABELS={plain:'Plain',shared:'Shared prong',pave:'Micro pavé',french:'French pavé',u:'U-prong',cutdown:'Cut-down',channel:'Channel',bar:'Bar',bezel:'Bezel row',flush:'Flush / burnish',milgrain:'Milgrain pavé'};
export const COVERAGES={accent:'Accent only',third:'⅓ coverage',half:'Half · 50%',threequarter:'¾ · 75%',full:'Full eternity',graduated:'Graduated'};
export const ROWS={single:'Single row',double:'Double row',triple:'Triple row',sided:'Three-sided'};
export const MELEE_SIZES=[.8,.9,1,1.1,1.2,1.25,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2,2.2,2.5,2.75,3];
export const WIDTHS=[1.2,1.4,1.6,1.8,2,2.2,2.5,3];
export const METALS={};
const metalColours={yellow:['#d9bb83','#e7c17d','#edc37b'],white:['#dedad0','#e2dfd5','#e8e1d4'],rose:['#d8aaa0','#e3ae9d','#e9aa92']};
for(const [tone,colours] of Object.entries(metalColours))for(const [i,karat] of [10,14,18].entries())METALS[`${tone}${karat}`]={label:`${karat}k ${tone} gold`,short:`${karat}k ${tone}`,color:colours[i],roughness:.17,tone,karat,swatch:`linear-gradient(125deg,${colours[i]},#fff5e0 40%,${colours[i]} 62%,#eee)`};
METALS.platinum={label:'Platinum 950',short:'Platinum',color:'#dbe0e4',roughness:.19,tone:'platinum',swatch:'linear-gradient(125deg,#87929c,#f7f8fa 40%,#b8c2cc 62%,#dee5eb)'};
METALS.silver={label:'Sterling silver 925',short:'Silver',color:'#edf0f2',roughness:.15,tone:'silver',swatch:'linear-gradient(125deg,#999,#fff 40%,#bcc4cc 62%,#eee)'};
export const DEFAULTS=Object.freeze({family:'solitaire',shape:'round',ratio:1,carat:1.5,colour:'E',clarity:'VS1',cut:'excellent',certificate:'IGI',inscription:'report',laserText:'',fluorescence:'none',
 metal:'yellow18',twoTone:false,headMetal:'white18',rhodium:true,prongs:'six',tip:'claw',basket:'plain',visibleHalo:'none',haloSize:1,height:'standard',gallery:'plain',basketMilgrain:false,mount:'integrated',setting:'prong',
 shank:'straight',profile:'court',width:2.2,thickness:1.6,fit:'comfort',finish:'polish',underGallery:'open',engraving:'',engravingFont:'serif',
 shoulders:'plain',paveCoverage:'half',rows:'single',meleeShape:'round',meleeSize:1.2,
 sideShape:'round',sideRatio:3,sideSetting:'prong',sideOrientation:'auto',sideColour:'match',clusterShape:'round',
 secondShape:'pear',secondCarat:1,eternityShape:'round',eternitySize:1.5,coverage:'half',eternitySetting:'shared',size:6.5,sizeSystem:'US',quarterSizes:false});
export const sizeToInnerDiameter=size=>11.63+.8128*size;
export const caratToDiameter=carat=>6.5*Math.cbrt(carat);
export const hasCentre=s=>!['eternity','partial','wedding'].includes(s.family);
export const isBandFamily=s=>!hasCentre(s);
export const availableProngs=shape=>({round:['four','six','eight'],oval:['four','six','eight'],cushion:['four','six','eight'],pear:['five','six'],marquise:['six'],heart:['five','six']}[shape]||['four']);
export const availableTips=shape=>['princess'].includes(shape)?['v','tab']:['emerald','radiant','asscher'].includes(shape)?['tab']:['round','oval','cushion'].includes(shape)?Object.keys(TIP_LABELS):['v','claw','double'];
export function availableMeleeShapes(style){return ['channel','bar'].includes(style)?['round','princess','baguette']:style==='bezel'?['round','oval']:['round'];}
export function maxMelee(s){const rows=s.rows==='double'?2:s.rows==='triple'?3:1;const shape=isBandFamily(s)?s.eternityShape:s.meleeShape;const ratio={baguette:1.8,oval:1.4,emerald:1.4}[shape]||1;return (rows===1?s.width-.7:(s.width-.6)/rows)/ratio;}
export function allowedMeleeSizes(s){const style=isBandFamily(s)?s.eternitySetting:s.shoulders;const minimum=METALS[s.metal]?.karat===10&&['pave','french','cutdown','milgrain'].includes(style)?1.1:.8;return MELEE_SIZES.filter(x=>x<=maxMelee(s)+1e-6&&x>=minimum);}
export function sizeLabels(size){const d=sizeToInnerDiameter(size),c=d*Math.PI;const ukIndex=Math.round((c-37.5)/1.25);return {US:size.toFixed(size%1===.25||size%1===.75?2:1),EU:c.toFixed(1),UK:String.fromCharCode(65+Math.max(0,Math.min(25,ukIndex))),JP:String(Math.round((c-40.8)/1.02))};}
export function resizability(s){const coverage=isBandFamily(s)?(s.family==='eternity'?'full':s.coverage):s.paveCoverage;if((isBandFamily(s)?s.family!=='wedding'||s.shoulders!=='plain':s.shoulders!=='plain')&&coverage==='full')return 'No · full eternity';return coverage==='threequarter'?'Limited':'Yes · designer to confirm';}
const enums={family:Object.keys(FAMILY_LABELS),shape:MAIN_SHAPES,metal:Object.keys(METALS),headMetal:Object.keys(METALS),prongs:Object.keys(PRONG_LABELS),tip:Object.keys(TIP_LABELS),basket:Object.keys(BASKETS),visibleHalo:Object.keys(HALOS),height:['low','standard','high'],gallery:['plain','scroll','heart','arch','celtic'],mount:['peg','integrated'],setting:['prong','bezel','tension'],shank:Object.keys(SHANKS),profile:Object.keys(PROFILES),fit:['comfort','standard'],finish:Object.keys(FINISHES),underGallery:['open','closed','motif'],engravingFont:['serif','sans','script'],shoulders:Object.keys(SHOULDER_LABELS),paveCoverage:Object.keys(COVERAGES),rows:Object.keys(ROWS),meleeShape:['round','princess','baguette','oval'],sideShape:SIDE_SHAPES,clusterShape:['round','marquise','pear'],sideSetting:['prong','bezel','channel'],sideOrientation:['auto','in','out','parallel'],sideColour:['match','below'],secondShape:MAIN_SHAPES,eternityShape:ETERNITY_SHAPES,coverage:['half','threequarter','full'],eternitySetting:Object.keys(SHOULDER_LABELS).filter(s=>s!=='plain'),sizeSystem:['US','UK','EU','JP'],colour:['D','E','F','G','H'],clarity:['VVS1','VVS2','VS1','VS2'],cut:['excellent','ideal'],certificate:['IGI','GIA'],inscription:['report','custom'],fluorescence:['none','faint']};
export const SPEC_ONLY_KEYS=new Set(['colour','clarity','cut','certificate','inscription','laserText','fluorescence','sideColour','sizeSystem','quarterSizes']);
export const MATERIAL_KEYS=new Set(['metal','headMetal','twoTone','rhodium','finish']);
export function normaliseDesign(input={}){
 const s={...DEFAULTS};
 for(const [key,values] of Object.entries(enums))if(values.includes(input[key]))s[key]=input[key];
 for(const [key,min,max,step] of [['carat',.3,5,.05],['secondCarat',.3,5,.05],['haloSize',.9,1.7,.1],['thickness',1.2,2,.1],['size',4,13,.25]])if(Number.isFinite(input[key]))s[key]=Math.round(Math.min(max,Math.max(min,input[key]))/step)*step;
 if(s.carat>=1)s.carat=Math.round(s.carat*10)/10;
 for(const key of ['twoTone','rhodium','basketMilgrain','quarterSizes'])if(typeof input[key]==='boolean')s[key]=input[key];
 if(!s.quarterSizes)s.size=Math.round(s.size*2)/2;
 s.width=WIDTHS.includes(input.width)?input.width:DEFAULTS.width;
 s.ratio=RATIOS[s.shape].includes(input.ratio)?input.ratio:RATIOS[s.shape][Math.min(1,RATIOS[s.shape].length-1)];
 s.sideRatio=[2,3,4,5].includes(input.sideRatio)?input.sideRatio:3;
 for(const key of ['engraving','laserText'])s[key]=String(input[key]||'').replace(/[\u0000-\u001f\u007f]/g,'').slice(0,30);
 if(!availableProngs(s.shape).includes(s.prongs))s.prongs=availableProngs(s.shape)[0];
 if(!availableTips(s.shape).includes(s.tip))s.tip=availableTips(s.shape)[0];
 if(s.family==='hidden'&&!['hidden','double'].includes(s.basket))s.basket='hidden';
 if(s.family==='halo'&&s.visibleHalo==='none')s.visibleHalo='single';
 if(['hidden','double'].includes(s.basket)&&s.height==='low')s.height='standard';
 if(s.family==='eternity')s.coverage='full';
 if(s.family==='partial'&&s.coverage==='full')s.coverage='half';
 if(s.setting==='tension'&&(!['round','princess','emerald'].includes(s.shape)||s.carat<.7||!['solitaire'].includes(s.family)))s.setting='prong';
 if(METALS[s.metal].tone!=='white'&&(!s.twoTone||METALS[s.headMetal].tone!=='white'))s.rhodium=false;
 if(s.shank==='knife')s.profile='knife';
 if(s.profile==='knife'&&s.shoulders!=='plain')s.rows='sided';
 if(s.rows==='sided'&&s.profile!=='knife'&&!['flat','bevel'].includes(s.profile))s.profile='flat';
 if(s.rows==='double'&&s.width<2.2)s.width=2.2;
 if(s.rows==='triple'&&s.width<3)s.width=3;
 const style=isBandFamily(s)?s.eternitySetting:s.shoulders;
 if(['channel','bar'].includes(style)&&(!['straight','tapered','euro'].includes(s.shank)||s.profile==='knife')){s.shank='straight';s.profile='flat';}
 const set=isBandFamily(s)?s.family!=='wedding'||s.shoulders!=='plain':s.shoulders!=='plain';
 if(set&&s.width<1.6)s.width=1.6;
 if(set&&METALS[s.metal].karat===10&&['pave','french','cutdown','milgrain'].includes(style)){if(s.rows==='double'||s.rows==='triple')s.rows='single';if(s.width<1.8)s.width=1.8;}
 if(!availableMeleeShapes(style).includes(s.meleeShape))s.meleeShape=availableMeleeShapes(style)[0];
 if(isBandFamily(s)&&!availableMeleeShapes(s.eternitySetting).includes(s.eternityShape))s.eternityShape=availableMeleeShapes(s.eternitySetting)[0];
 if(set&&maxMelee(s)<.8-1e-6){
  while(s.width<3&&maxMelee(s)<.8-1e-6)s.width=WIDTHS.find(w=>w>s.width)||3;
  if(maxMelee(s)<.8-1e-6)s.rows='single';
 }
 const sizes=allowedMeleeSizes(s);for(const key of ['meleeSize','eternitySize']){const desired=Number.isFinite(input[key])?input[key]:DEFAULTS[key];s[key]=sizes.includes(desired)?desired:(sizes.filter(x=>x<=desired).at(-1)||sizes[0]||.8);}
 return s;
}
