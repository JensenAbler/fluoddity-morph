function Tr(n,e){for(var t=0;t<e.length;t++){const s=e[t];if(typeof s!="string"&&!Array.isArray(s)){for(const a in s)if(a!=="default"&&!(a in n)){const i=Object.getOwnPropertyDescriptor(s,a);i&&Object.defineProperty(n,a,i.get?i:{enumerable:!0,get:()=>s[a]})}}}return Object.freeze(Object.defineProperty(n,Symbol.toStringTag,{value:"Module"}))}(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function t(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(a){if(a.ep)return;a.ep=!0;const i=t(a);fetch(a.href,i)}})();const Sr="modulepreload",Ar=function(n,e){return new URL(n,e).href},xs={},gp=function(e,t,s){let a=Promise.resolve();if(t&&t.length>0){let r=function(d){return Promise.all(d.map(h=>Promise.resolve(h).then(u=>({status:"fulfilled",value:u}),u=>({status:"rejected",reason:u}))))};const o=document.getElementsByTagName("link"),c=document.querySelector("meta[property=csp-nonce]"),l=c?.nonce||c?.getAttribute("nonce");a=r(t.map(d=>{if(d=Ar(d,s),d in xs)return;xs[d]=!0;const h=d.endsWith(".css"),u=h?'[rel="stylesheet"]':"";if(!!s)for(let m=o.length-1;m>=0;m--){const E=o[m];if(E.href===d&&(!h||E.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${d}"]${u}`))return;const v=document.createElement("link");if(v.rel=h?"stylesheet":Sr,h||(v.as="script"),v.crossOrigin="",v.href=d,l&&v.setAttribute("nonce",l),document.head.appendChild(v),h)return new Promise((m,E)=>{v.addEventListener("load",m),v.addEventListener("error",()=>E(new Error(`Unable to preload CSS for ${d}`)))})}))}function i(r){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=r,window.dispatchEvent(o),!o.defaultPrevented)throw r}return a.then(r=>{for(const o of r||[])o.status==="rejected"&&i(o.reason);return e().catch(i)})},At=1024,Cr=3,Ts=.1;class Rr{querySet;resolveBuffer;readbacks=[];labels=[];current=null;inFlight=new Map;averages=new Map;total=0;constructor(e){this.querySet=e.createQuerySet({type:"timestamp",count:At}),this.resolveBuffer=e.createBuffer({label:"pass-timer-resolve",size:At*8,usage:GPUBufferUsage.QUERY_RESOLVE|GPUBufferUsage.COPY_SRC});for(let t=0;t<Cr;t++)this.readbacks.push({buffer:e.createBuffer({label:`pass-timer-readback-${t}`,size:At*8,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),busy:!1})}beginFrame(){this.labels=[],this.current=this.readbacks.find(e=>!e.busy)??null}writes(e){if(this.current===null)return;const t=this.labels.length;if(!((t+1)*2>At))return this.labels.push(e),{querySet:this.querySet,beginningOfPassWriteIndex:t*2,endOfPassWriteIndex:t*2+1}}resolve(e){const t=this.current;if(t===null||this.labels.length===0){this.current=null;return}const s=this.labels.length*2;e.resolveQuerySet(this.querySet,0,s,this.resolveBuffer,0),e.copyBufferToBuffer(this.resolveBuffer,0,t.buffer,0,s*8),t.busy=!0,this.inFlight.set(t,this.labels)}afterSubmit(){const e=this.current;if(this.current=null,e===null)return;const t=this.inFlight.get(e);if(t===void 0)return;const s=t.length*16;e.buffer.mapAsync(GPUMapMode.READ,0,s).then(()=>{const a=new BigUint64Array(e.buffer.getMappedRange(0,s).slice(0));e.buffer.unmap(),e.busy=!1,this.inFlight.delete(e),this.accumulate(t,a)},()=>{e.busy=!1,this.inFlight.delete(e)})}accumulate(e,t){const s=new Map;let a=0;e.forEach((i,r)=>{const o=t[r*2]??0n,c=t[r*2+1]??0n,l=c>o?Number(c-o)/1e6:0;s.set(i,(s.get(i)??0)+l),a+=l});for(const i of this.averages.keys())s.has(i)||s.set(i,0);for(const[i,r]of s){const o=this.averages.get(i);this.averages.set(i,o===void 0?r:o+(r-o)*Ts)}this.total+=(a-this.total)*Ts}}let Se=null;const Tn="timestamp-query";function wp(n){return n.features.has(Tn)?(Se??=new Rr(n),!0):!1}function bp(){Se?.beginFrame()}function re(n){return Se?.writes(n)}function yp(n){Se?.resolve(n)}function _p(){Se?.afterSubmit()}function Ep(){if(Se===null)return null;const n=[...Se.averages].sort((e,t)=>t[1]-e[1]);return{total:Se.total,passes:n}}class an extends Error{reason;constructor(e,t){super(t),this.name="WebGPUUnavailable",this.reason=e}}function Ir(n){return{maxStorageBufferBindingSize:n.limits.maxStorageBufferBindingSize,maxBufferSize:n.limits.maxBufferSize,maxTextureDimension2D:n.limits.maxTextureDimension2D}}async function xp(n){if(!("gpu"in navigator)||navigator.gpu===void 0)throw new an("no-api","This browser does not support WebGPU. Try a current version of Chrome, Edge, or Safari 26+.");const e=await navigator.gpu.requestAdapter();if(e===null)throw new an("no-adapter","WebGPU is present but no compatible GPU adapter was available. This usually means a blocklisted driver, a headless session, or a VM without GPU passthrough.");let t;try{const s=e.features.has(Tn)?[Tn]:[];t=await e.requestDevice({requiredLimits:Ir(e),requiredFeatures:s})}catch(s){throw new an("no-device",`Requesting a GPU device failed: ${String(s)}`)}return t.lost.then(s=>{s.reason!=="destroyed"&&(console.error(`WebGPU device lost (${s.reason}): ${s.message}`),n?.(s))}),t.addEventListener("uncapturederror",s=>{console.error("WebGPU uncaptured error:",s.error.message)}),{adapter:e,device:t}}function Tp(n,e,t=!1){document.getElementById("gpu-error")?.remove();const a=document.createElement("div");a.id="gpu-error",a.setAttribute("role","alert"),a.style.cssText="position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:0.5rem;padding:2rem;text-align:center;font:16px/1.5 system-ui,sans-serif;color:#eee;background:#1a1a1a;";const i=document.createElement("h1");i.textContent=n,i.style.cssText="margin:0;font-size:1.25rem;font-weight:600;";const r=document.createElement("p");if(r.textContent=e,r.style.cssText="margin:0;max-width:44rem;color:#bbb;",a.append(i,r),t){const o=document.createElement("button");o.type="button",o.textContent="Reload",o.style.cssText="margin-top:1rem;padding:0.6rem 1.6rem;font:inherit;color:#111;background:#eee;border:0;border-radius:6px;cursor:pointer;",o.addEventListener("click",()=>window.location.reload()),a.append(o)}document.body.append(a)}function Sp(n,e){const t=n.getContext("webgpu");if(t===null)throw new Error("Failed to acquire a WebGPU canvas context.");const s=navigator.gpu.getPreferredCanvasFormat();t.configure({device:e,format:s,alphaMode:"opaque"});let a=[1,1];const i=e.limits.maxTextureDimension2D,r=(l,d)=>{const h=Math.max(1,Math.min(i,Math.floor(l))),u=Math.max(1,Math.min(i,Math.floor(d)));h===n.width&&u===n.height||(n.width=h,n.height=u,a=[h,u])},o=new ResizeObserver(l=>{for(const d of l){const h=d.devicePixelContentBoxSize?.[0];if(h!==void 0){r(h.inlineSize,h.blockSize);continue}const u=d.contentBoxSize?.[0],w=window.devicePixelRatio||1;u!==void 0?r(u.inlineSize*w,u.blockSize*w):r(d.contentRect.width*w,d.contentRect.height*w)}});try{o.observe(n,{box:"device-pixel-content-box"})}catch{o.observe(n)}const c=n.getBoundingClientRect();return r(c.width*(window.devicePixelRatio||1),c.height*(window.devicePixelRatio||1)),{canvas:n,context:t,format:s,size:()=>a,setAspectLock:l=>{if(l===null||!Number.isFinite(l)||l<=0){n.style.removeProperty("width"),n.style.removeProperty("height"),n.style.removeProperty("margin");return}const d=n.parentElement,h=d?.clientWidth??window.innerWidth,u=d?.clientHeight??window.innerHeight,w=h/l<=u,v=w?h:u*l,m=w?h/l:u;n.style.width=`${Math.floor(v)}px`,n.style.height=`${Math.floor(m)}px`,n.style.margin=`${Math.max(0,Math.floor((u-m)/2))}px auto`},dispose:()=>o.disconnect()}}const Sa=[0,0],Aa=1;function Ss(n,e){return n[0]===e[0]&&n[1]===e[1]}function Vn(n){const e=n[0]/n[1],t=Math.sqrt(e);return[t,1/t]}function Ap(n,e){const[t,s]=Vn(e);return[n[0]/(2*t)+.5,n[1]/(2*s)+.5]}const Lr=2;function Or(n){return n*Lr}function Nr(n,e){const[t,s]=Vn(e);return[n[0]*t,n[1]*s]}function Pr(n,e){if(e[0]<=0||e[1]<=0)return[1,1];const t=n[0]/n[1],s=e[0]/e[1];return s>t?[t/s,1]:[1,s/t]}function kr(n,e,t,s=Sa,a=Aa){const[i,r]=Pr(e,t);let o=i?n[0]/i:0,c=r?n[1]/r:0;a&&(o/=a,c/=a);const[l,d]=Nr([o,c],e);return[l+s[0],d+s[1]]}function Dr(n,e){return e[0]<=0||e[1]<=0?[0,0]:[2*n[0]/e[0]-1,1-2*n[1]/e[1]]}function Oe(n,e,t,s=Sa,a=Aa){const i=Dr(n,e);return kr(i,t,e,s,a)}const Ur=.1,Mr=100,Gr=1.1,Cp=.9,Rp=2.2,rn=["trail","particles"];function Br(n){const e=rn.indexOf(n);return rn[(e+1)%rn.length]??"particles"}class Ip{pan=[0,0];zoom=1;mode="particles";constructor(e){e?.pan!==void 0&&(this.pan=e.pan),e?.zoom!==void 0&&(this.zoom=e.zoom),e?.mode!==void 0&&(this.mode=e.mode)}reset(){this.pan=[0,0],this.zoom=1}zoomAtPixel(e,t,s,a){if(!e)return;const i=Oe(t,s,a,this.pan,this.zoom);this.setZoom(this.zoom*Gr**e);const r=Oe(t,s,a,this.pan,this.zoom);this.pan=[this.pan[0]+(i[0]-r[0]),this.pan[1]+(i[1]-r[1])]}panByFraction(e,t){if(Ss(e,[0,0]))return;const[,s]=Vn(t),a=2*s/this.zoom;this.pan=[this.pan[0]+e[0]*a,this.pan[1]+e[1]*a]}panByPixels(e,t,s){if(Ss(e,[0,0]))return;const a=Oe([0,0],t,s,this.pan,this.zoom),i=Oe([e[0],e[1]],t,s,this.pan,this.zoom);this.pan=[this.pan[0]-(i[0]-a[0]),this.pan[1]-(i[1]-a[1])]}zoomByFactor(e){e!==1&&this.setZoom(this.zoom*e)}setZoom(e){Number.isFinite(e)&&(this.zoom=Math.max(Ur,Math.min(Mr,e)))}toggleMode(){this.mode=Br(this.mode)}}const Fr={FourierCenter:{size:32,float32Count:8,members:[{name:"frequency",offset:0,size:16,type:"vec4",floatIndex:0,floatCount:4},{name:"amplitude",offset:16,size:16,type:"vec4",floatIndex:4,floatCount:4}]},Rule:{size:320,float32Count:80,members:[{name:"centers",offset:0,size:320,type:"FourierCenter",floatIndex:0,floatCount:80,arrayLength:10,stride:32}]},ConfigData:{size:432,float32Count:108,members:[{name:"rule",offset:0,size:320,type:"Rule",floatIndex:0,floatCount:80},{name:"sensor",offset:320,size:16,type:"vec4",floatIndex:80,floatCount:4},{name:"force",offset:336,size:16,type:"vec4",floatIndex:84,floatCount:4},{name:"misc",offset:352,size:16,type:"vec4",floatIndex:88,floatCount:4},{name:"force2",offset:368,size:16,type:"vec4",floatIndex:92,floatCount:4},{name:"misc2",offset:384,size:16,type:"vec4",floatIndex:96,floatCount:4},{name:"misc3",offset:400,size:16,type:"vec4",floatIndex:100,floatCount:4},{name:"misc4",offset:416,size:16,type:"vec4",floatIndex:104,floatCount:4}]},WorldData:{size:32,float32Count:8,members:[{name:"trail",offset:0,size:16,type:"vec4",floatIndex:0,floatCount:4},{name:"bounds",offset:16,size:16,type:"vec4",floatIndex:4,floatCount:4}]},Entity:{size:32,float32Count:8,members:[{name:"pos_vel",offset:0,size:16,type:"vec4",floatIndex:0,floatCount:4},{name:"misc",offset:16,size:16,type:"vec4",floatIndex:4,floatCount:4}]}},zr={structs:Fr},Ca=zr.structs;function Ie(n){const e=Ca[n];if(e===void 0)throw new Error(`layout.fixture.json has no struct "${n}". Either it was renamed in common.wgsl without the descriptor following, or the caller is asking for something that never existed.`);return e}function Vr(n,e){const t=Ie(n).members.find(s=>s.name===e);if(t===void 0)throw new Error(`struct ${n} has no member "${e}" in layout.fixture.json. Update it alongside common.wgsl.`);return t}const Ra=Ie("ConfigData"),Hr=Ie("WorldData"),Wr=Ie("Entity"),Ft=Ra.size,Ia=Hr.size,Ct=Wr.size;Ra.float32Count;const qr={FourierCenter:32,Rule:320,ConfigData:432,WorldData:32,Entity:32};for(const[n,e]of Object.entries(qr)){const t=Ie(n).size;if(t!==e)throw new Error(`struct ${n} is ${t} bytes in layout.fixture.json, expected ${e}. Every hardcoded stride in src/particleSystem assumes the expected value.`)}{const n=Vr("Rule","centers");if(n.stride!==32||n.arrayLength!==10)throw new Error(`Rule.centers is ${n.arrayLength} x ${n.stride} bytes, expected 10 x 32. WGSL's array<FourierCenter,10> stride would no longer match std430's.`)}for(const[n,e]of Object.entries(Ca)){if(e.size%16!==0)throw new Error(`struct ${n} is ${e.size} bytes, not a multiple of 16.`);for(const t of e.members)if(t.offset%16!==0)throw new Error(`struct ${n}: member "${t.name}" is at offset ${t.offset}, not 16-byte aligned.`)}function La(n,e){const t=Ie(n);for(const[s,a]of Object.entries(e)){const i=t.members.find(r=>r.name.toLowerCase()===s.toLowerCase());if(i===void 0)throw new Error(`${n} has no member matching lane constant "${s}". Either common.wgsl renamed it or the LANE table is stale.`);if(i.floatIndex!==a)throw new Error(`${n}.${i.name} is at float lane ${i.floatIndex} in layout.fixture.json, but the LANE table says ${a}. The struct changed and the lane constants did not follow -- packing would write every field after this point into the wrong place, silently.`)}}const Ne={BOUNCE:0,WRAP:1,RESET:2,KILL:3},$e={GRID:0,RANDOM:1,CENTER:2,RING:3},O={rule:0,sensor:80,force:84,misc:88,force2:92,misc2:96,misc3:100,misc4:104},je={trail:0,bounds:4};La("ConfigData",O);La("WorldData",je);const As=80,jr={gravityForce:0,gravityStrafe:0,initialConditions:$e.CENTER,cohortFences:!1,colorSensitivity:.5,colorOffset:0,colorByCohort:!1,sensorAngleJitter:0,sensorDistanceJitter:0,radialGravity:!1,gravityTrails:0,trailWeight:1,rule:[]};function Yr(n,e={}){return{...jr,...n,...e}}const $r={trailPersistence:.94,trailDiffusion:1,boundaryConditions:Ne.WRAP};function Kr(n={}){return{...$r,...n}}function Xr(n,e,t){return{...n,sqrtWorldSize:e,configCount:t}}const Qr=4096;function Oa(n){const e=Math.trunc(n.cohorts);return Number.isFinite(e)?Math.min(Math.max(e,1),Qr):1}function Zr(n,e){if(e){const t=n[0];if(t===void 0)return[];const s=t.trailWeight===1?t:{...t,trailWeight:1};return new Array(Oa(t)).fill(s)}return n.map(t=>t.cohorts===1?t:{...t,cohorts:1})}const A=Math.fround,Cs=80,Rs=new DataView(new ArrayBuffer(4));function Is(n){return Rs.setFloat32(0,n,!0),Rs.getUint32(0,!0)}function Ls(n){const e=Math.imul(n,747796405)+2891336453>>>0,t=Math.imul((e>>>((e>>>28)+4>>>0)^e)>>>0,277803737)>>>0;return(t>>>22^t)>>>0}function Ke(n,e){const t=Ls((Is(n)^Ls(Is(e)))>>>0);return A(A(t)/4294967296)}function Jr(n,e){return[Ke(n,e),Ke(A(A(-n)+5),A(A(-e)+5)),Ke(A(e-100),A(n-100)),Ke(A(A(-e)+25),A(A(-n)+25))]}function eo(n,e){return A(A(n)+Math.floor(e))}function to(n,e,t){if(n.length!==Cs)throw new Error(`mutateRuleV1: rule must be ${Cs} floats, got ${n.length}`);const s=n.map(A),a=A(e),i=(h,u)=>s[h*8+u]??0,r=(h,u)=>s[h*8+4+u]??0,o=A(A(i(4,0)+r(7,1))+i(1,2)),c=A(A(i(4,1)+r(7,0))+i(1,3)),l=A(Ke(o,c)+t),d=A(a*.5);for(let h=0;h<10;h++){const u=Jr(A(-.5+A(-h+l)),A(-.5+h));for(let v=0;v<4;v++){const m=A(a*A(-1+A(2*(u[v]??0))));s[h*8+4+v]=A((s[h*8+4+v]??0)+m)}const w=A(1+A(d*A(Ke(l,h)-.5)));for(let v=0;v<4;v++)s[h*8+v]=A((s[h*8+v]??0)*w)}return s}const Sn=9,Os=8;class oe extends Error{constructor(e){super(e),this.name="ConfigFormatError"}}function ct(n){return typeof n=="object"&&n!==null&&!Array.isArray(n)?n:{}}function kt(n,e,t){const s=n[e];if(typeof s!="object"||s===null||Array.isArray(s))throw new oe(`${t}: missing or malformed "${e}" block`);return s}function K(n,e,t){const s=n[e];if(typeof s!="number"||!Number.isFinite(s))throw new oe(`${t}: "${e}" is not a finite number (${String(s)})`);return s}function ie(n,e,t,s){return n[e]===void 0?t:K(n,e,s)}function Ns(n,e,t,s){const a=n[e];if(a===void 0)return t;if(typeof a!="boolean")throw new oe(`${s}: "${e}" is not a boolean (${String(a)})`);return a}function no(n,e,t){const s=n[e];if(s===void 0)return!1;if(typeof s=="boolean")return s;if(typeof s=="number")return s>0;throw new oe(`${t}: "${e}" is not a boolean or a number (${String(s)})`)}function so(n,e){if(![Ne.BOUNCE,Ne.WRAP,Ne.RESET,Ne.KILL].includes(n))throw new oe(`${e}: boundary_conditions ${n} is not a BC_* mode`);return n}function ao(n,e){if(![$e.GRID,$e.RANDOM,$e.CENTER,$e.RING].includes(n))throw new oe(`${e}: initial_conditions ${n} is not an IC_* mode`);return n}function io(n,e){const t=kt(n,"sensor",e),s=kt(n,"force",e),a=kt(n,"misc",e),i=ct(n.force2),r=n.misc2!==void 0?ct(n.misc2):ct(n.appearance),o=ct(n.misc3),c=n.rule;if(!Array.isArray(c)||c.some(l=>typeof l!="number"||!Number.isFinite(l)))throw new oe(`${e}: "rule" is not an array of finite numbers`);return Yr({cohorts:K(a,"cohorts",e),mutationSeed:a.mutation_seed!==void 0?K(a,"mutation_seed",e):ie(a,"rule_seed",0,e),sensorGain:K(t,"gain",e),sensorAngle:K(t,"angle",e),sensorDistance:K(t,"distance",e),mutationScale:K(t,"mutation_scale",e),globalForceMult:K(s,"global_mult",e),drag:K(s,"drag",e),strafePower:K(s,"strafe",e),axialForce:K(s,"axial",e),lateralForce:K(a,"lateral",e),hazardRate:K(a,"hazard_rate",e)},{gravityForce:ie(i,"gravity_force",0,e),gravityStrafe:ie(i,"gravity_strafe",0,e),initialConditions:ao(ie(i,"initial_conditions",$e.CENTER,e),e),cohortFences:no(i,"cohort_fences",e),colorSensitivity:ie(r,"color_sensitivity",.5,e),colorByCohort:Ns(r,"color_by_cohort",!1,e),sensorAngleJitter:ie(r,"sensor_angle_jitter",0,e),sensorDistanceJitter:ie(r,"sensor_distance_jitter",0,e),radialGravity:Ns(o,"radial_gravity",!1,e),gravityTrails:ie(o,"gravity_trails",0,e),colorOffset:ie(o,"color_offset",0,e),trailWeight:ie(o,"trail_weight",1,e),rule:c})}function Ps(n,e="config"){if(typeof n!="object"||n===null||Array.isArray(n))throw new oe(`${e}: not a JSON object`);const t=n,s=t.version;if(s!==Sn&&s!==Os)throw new oe(`${e}: unrecognized config version ${String(s)}; expected ${Sn}`);const a=kt(t,"world",e),i=t.configs;if(!Array.isArray(i))throw new oe(`${e}: missing or malformed "configs" list`);if(i.length===0)throw new oe(`${e}: "configs" is empty`);const r=i.map((l,d)=>io(ct(l),`${e}: configs[${d}]`)),o=s===Os?r.map(ro):r,c=Kr({trailPersistence:K(a,"trail_persistence",e),trailDiffusion:K(a,"trail_diffusion",e),boundaryConditions:so(ie(a,"boundary_conditions",Ne.WRAP,e),e)});return{configs:o,world:c,notes:typeof t.notes=="string"?t.notes:""}}function ro(n){return n.mutationScale===0||oo(n.rule)||Oa(n)!==1?n:{...n,rule:to(n.rule,n.mutationScale,eo(n.mutationSeed,0)),mutationScale:0}}function oo(n){return[0,1,2,3,44,45,46,47].every(e=>n[e]===0)}function lo(n){return{rule:[...n.rule],sensor:{gain:n.sensorGain,angle:n.sensorAngle,distance:n.sensorDistance,mutation_scale:n.mutationScale},force:{global_mult:n.globalForceMult,drag:n.drag,strafe:n.strafePower,axial:n.axialForce},misc:{lateral:n.lateralForce,hazard_rate:n.hazardRate,cohorts:n.cohorts,mutation_seed:n.mutationSeed},force2:{gravity_force:n.gravityForce,gravity_strafe:n.gravityStrafe,initial_conditions:n.initialConditions,cohort_fences:n.cohortFences},misc2:{color_sensitivity:n.colorSensitivity,color_by_cohort:n.colorByCohort,sensor_angle_jitter:n.sensorAngleJitter,sensor_distance_jitter:n.sensorDistanceJitter},misc3:{radial_gravity:n.radialGravity,gravity_trails:n.gravityTrails,color_offset:n.colorOffset,trail_weight:n.trailWeight}}}function Lp(n,e,t=""){const s={version:Sn,world:{trail_persistence:e.trailPersistence,trail_diffusion:e.trailDiffusion,boundary_conditions:e.boundaryConditions},configs:n.map(lo)};return t&&(s.notes=t),s}const co=new Set(["\\","/",":","*","?",'"',"<",">","|"]);function Op(n){return[...n.trim()].filter(t=>!co.has(t)).join("").trim().replace(/\.+$/,"").slice(0,120)}function ho(n){return n&&n.__esModule&&Object.prototype.hasOwnProperty.call(n,"default")?n.default:n}var on={exports:{}},ks;function uo(){return ks||(ks=1,(function(n){var e=(function(){var t=String.fromCharCode,s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",i={};function r(c,l){if(!i[c]){i[c]={};for(var d=0;d<c.length;d++)i[c][c.charAt(d)]=d}return i[c][l]}var o={compressToBase64:function(c){if(c==null)return"";var l=o._compress(c,6,function(d){return s.charAt(d)});switch(l.length%4){default:case 0:return l;case 1:return l+"===";case 2:return l+"==";case 3:return l+"="}},decompressFromBase64:function(c){return c==null?"":c==""?null:o._decompress(c.length,32,function(l){return r(s,c.charAt(l))})},compressToUTF16:function(c){return c==null?"":o._compress(c,15,function(l){return t(l+32)})+" "},decompressFromUTF16:function(c){return c==null?"":c==""?null:o._decompress(c.length,16384,function(l){return c.charCodeAt(l)-32})},compressToUint8Array:function(c){for(var l=o.compress(c),d=new Uint8Array(l.length*2),h=0,u=l.length;h<u;h++){var w=l.charCodeAt(h);d[h*2]=w>>>8,d[h*2+1]=w%256}return d},decompressFromUint8Array:function(c){if(c==null)return o.decompress(c);for(var l=new Array(c.length/2),d=0,h=l.length;d<h;d++)l[d]=c[d*2]*256+c[d*2+1];var u=[];return l.forEach(function(w){u.push(t(w))}),o.decompress(u.join(""))},compressToEncodedURIComponent:function(c){return c==null?"":o._compress(c,6,function(l){return a.charAt(l)})},decompressFromEncodedURIComponent:function(c){return c==null?"":c==""?null:(c=c.replace(/ /g,"+"),o._decompress(c.length,32,function(l){return r(a,c.charAt(l))}))},compress:function(c){return o._compress(c,16,function(l){return t(l)})},_compress:function(c,l,d){if(c==null)return"";var h,u,w={},v={},m="",E="",g="",N=2,P=3,x=2,T=[],f=0,b=0,p;for(p=0;p<c.length;p+=1)if(m=c.charAt(p),Object.prototype.hasOwnProperty.call(w,m)||(w[m]=P++,v[m]=!0),E=g+m,Object.prototype.hasOwnProperty.call(w,E))g=E;else{if(Object.prototype.hasOwnProperty.call(v,g)){if(g.charCodeAt(0)<256){for(h=0;h<x;h++)f=f<<1,b==l-1?(b=0,T.push(d(f)),f=0):b++;for(u=g.charCodeAt(0),h=0;h<8;h++)f=f<<1|u&1,b==l-1?(b=0,T.push(d(f)),f=0):b++,u=u>>1}else{for(u=1,h=0;h<x;h++)f=f<<1|u,b==l-1?(b=0,T.push(d(f)),f=0):b++,u=0;for(u=g.charCodeAt(0),h=0;h<16;h++)f=f<<1|u&1,b==l-1?(b=0,T.push(d(f)),f=0):b++,u=u>>1}N--,N==0&&(N=Math.pow(2,x),x++),delete v[g]}else for(u=w[g],h=0;h<x;h++)f=f<<1|u&1,b==l-1?(b=0,T.push(d(f)),f=0):b++,u=u>>1;N--,N==0&&(N=Math.pow(2,x),x++),w[E]=P++,g=String(m)}if(g!==""){if(Object.prototype.hasOwnProperty.call(v,g)){if(g.charCodeAt(0)<256){for(h=0;h<x;h++)f=f<<1,b==l-1?(b=0,T.push(d(f)),f=0):b++;for(u=g.charCodeAt(0),h=0;h<8;h++)f=f<<1|u&1,b==l-1?(b=0,T.push(d(f)),f=0):b++,u=u>>1}else{for(u=1,h=0;h<x;h++)f=f<<1|u,b==l-1?(b=0,T.push(d(f)),f=0):b++,u=0;for(u=g.charCodeAt(0),h=0;h<16;h++)f=f<<1|u&1,b==l-1?(b=0,T.push(d(f)),f=0):b++,u=u>>1}N--,N==0&&(N=Math.pow(2,x),x++),delete v[g]}else for(u=w[g],h=0;h<x;h++)f=f<<1|u&1,b==l-1?(b=0,T.push(d(f)),f=0):b++,u=u>>1;N--,N==0&&(N=Math.pow(2,x),x++)}for(u=2,h=0;h<x;h++)f=f<<1|u&1,b==l-1?(b=0,T.push(d(f)),f=0):b++,u=u>>1;for(;;)if(f=f<<1,b==l-1){T.push(d(f));break}else b++;return T.join("")},decompress:function(c){return c==null?"":c==""?null:o._decompress(c.length,32768,function(l){return c.charCodeAt(l)})},_decompress:function(c,l,d){var h=[],u=4,w=4,v=3,m="",E=[],g,N,P,x,T,f,b,p={val:d(0),position:l,index:1};for(g=0;g<3;g+=1)h[g]=g;for(P=0,T=Math.pow(2,2),f=1;f!=T;)x=p.val&p.position,p.position>>=1,p.position==0&&(p.position=l,p.val=d(p.index++)),P|=(x>0?1:0)*f,f<<=1;switch(P){case 0:for(P=0,T=Math.pow(2,8),f=1;f!=T;)x=p.val&p.position,p.position>>=1,p.position==0&&(p.position=l,p.val=d(p.index++)),P|=(x>0?1:0)*f,f<<=1;b=t(P);break;case 1:for(P=0,T=Math.pow(2,16),f=1;f!=T;)x=p.val&p.position,p.position>>=1,p.position==0&&(p.position=l,p.val=d(p.index++)),P|=(x>0?1:0)*f,f<<=1;b=t(P);break;case 2:return""}for(h[3]=b,N=b,E.push(b);;){if(p.index>c)return"";for(P=0,T=Math.pow(2,v),f=1;f!=T;)x=p.val&p.position,p.position>>=1,p.position==0&&(p.position=l,p.val=d(p.index++)),P|=(x>0?1:0)*f,f<<=1;switch(b=P){case 0:for(P=0,T=Math.pow(2,8),f=1;f!=T;)x=p.val&p.position,p.position>>=1,p.position==0&&(p.position=l,p.val=d(p.index++)),P|=(x>0?1:0)*f,f<<=1;h[w++]=t(P),b=w-1,u--;break;case 1:for(P=0,T=Math.pow(2,16),f=1;f!=T;)x=p.val&p.position,p.position>>=1,p.position==0&&(p.position=l,p.val=d(p.index++)),P|=(x>0?1:0)*f,f<<=1;h[w++]=t(P),b=w-1,u--;break;case 2:return E.join("")}if(u==0&&(u=Math.pow(2,v),v++),h[b])m=h[b];else if(b===w)m=N+N.charAt(0);else return null;E.push(m),h[w++]=N+m.charAt(0),u--,N=m,u==0&&(u=Math.pow(2,v),v++)}}};return o})();n!=null?n.exports=e:typeof angular<"u"&&angular!=null&&angular.module("LZString",[]).factory("LZString",function(){return e})})(on)),on.exports}var Na=uo();const Pa=ho(Na),fo=Tr({__proto__:null,default:Pa},[Na]),ka=4;class Xe extends Error{constructor(e){super(e),this.name="ShareCodecError"}}const Hn=80,Da=[["sensor","gain"],["sensor","angle"],["sensor","distance"],["sensor","mutation_scale"],["force","global_mult"],["force","drag"],["force","strafe"],["force","axial"],["misc","lateral"],["misc","hazard_rate"],["misc","mutation_seed"],["force2","gravity_force"],["force2","gravity_strafe"],["misc2","color_sensitivity"],["misc2","sensor_angle_jitter"],["misc2","sensor_distance_jitter"]],Ua=[...Da,["misc3","gravity_trails"]],Ma=[...Ua,["misc3","color_offset"]],Ga=[...Ma,["misc3","trail_weight"]],po={1:Da,2:Ua,3:Ma,4:Ga},Ba=Ga,mo=[["force2","cohort_fences"],["misc2","color_by_cohort"],["misc3","radial_gravity"]];function le(n){return typeof n=="object"&&n!==null&&!Array.isArray(n)?n:{}}function ze(n,e,t=0){const s=n[e];return typeof s=="number"&&Number.isFinite(s)?s:t}const vo={trail_weight:1};function go(n,e){const t=n[e];return typeof t=="boolean"?t:typeof t=="number"?t>0:!1}function Fa(n){return Hn*4+n.length*8+4+1+1}const wo=Fa(Ba),An=21;function bo(n){const e=le(n),t=le(e.world),s=Array.isArray(e.configs)?e.configs:[];if(s.length>65535)throw new Xe(`too many configs to encode (${s.length})`);const a=typeof e.notes=="string"?e.notes:"",i=new TextEncoder().encode(a),r=An+s.length*wo+4+i.length,o=new Uint8Array(r),c=new DataView(o.buffer);let l=0;c.setUint8(l,ka),l+=1,c.setUint8(l,typeof e.version=="number"?e.version:0),l+=1,c.setUint16(l,s.length,!0),l+=2,c.setFloat64(l,ze(t,"trail_persistence"),!0),l+=8,c.setFloat64(l,ze(t,"trail_diffusion"),!0),l+=8,c.setUint8(l,ze(t,"boundary_conditions")),l+=1;for(const d of s){const h=le(d),u={sensor:le(h.sensor),force:le(h.force),misc:le(h.misc),force2:le(h.force2),misc2:h.misc2!==void 0?le(h.misc2):le(h.appearance),misc3:le(h.misc3)},w=Array.isArray(h.rule)?h.rule:[];for(let m=0;m<Hn;m+=1){const E=w[m];c.setFloat32(l,typeof E=="number"?E:0,!0),l+=4}for(const[m,E]of Ba)c.setFloat64(l,ze(u[m],E,vo[E]),!0),l+=8;c.setUint32(l,Math.max(0,ze(u.misc,"cohorts")),!0),l+=4,c.setUint8(l,ze(u.force2,"initial_conditions")&255),l+=1;let v=0;mo.forEach(([m,E],g)=>{go(u[m],E)&&(v|=1<<g)}),c.setUint8(l,v),l+=1}return c.setUint32(l,i.length,!0),l+=4,o.set(i,l),o}function yo(n){if(n.length<An)throw new Xe("the payload is too short to be a config");const e=new DataView(n.buffer,n.byteOffset,n.byteLength);let t=0;const s=e.getUint8(t);t+=1;const a=po[s];if(a===void 0)throw new Xe(`this link uses share format ${s}, which this version cannot read (it reads ${ka}) -- the page may need updating`);const i=e.getUint8(t);t+=1;const r=e.getUint16(t,!0);t+=2;const o=e.getFloat64(t,!0);t+=8;const c=e.getFloat64(t,!0);t+=8;const l=e.getUint8(t);t+=1;const d=An+r*Fa(a)+4;if(n.length<d)throw new Xe(`the payload claims ${r} configs but is ${n.length} bytes, short of the ${d} they need`);const h=[];for(let m=0;m<r;m+=1){const E=[];for(let T=0;T<Hn;T+=1)E.push(e.getFloat32(t,!0)),t+=4;const g=[];for(let T=0;T<a.length;T+=1)g.push(e.getFloat64(t,!0)),t+=8;const N=e.getUint32(t,!0);t+=4;const P=e.getUint8(t);t+=1;const x=e.getUint8(t);t+=1,h.push({rule:E,sensor:{gain:g[0],angle:g[1],distance:g[2],mutation_scale:g[3]},force:{global_mult:g[4],drag:g[5],strafe:g[6],axial:g[7]},misc:{lateral:g[8],hazard_rate:g[9],cohorts:N,mutation_seed:g[10]},force2:{gravity_force:g[11],gravity_strafe:g[12],initial_conditions:P,cohort_fences:(x&1)!==0},misc2:{color_sensitivity:g[13],color_by_cohort:(x&2)!==0,sensor_angle_jitter:g[14],sensor_distance_jitter:g[15]},misc3:{radial_gravity:(x&4)!==0,...g.length>16?{gravity_trails:g[16]}:{},...g.length>17?{color_offset:g[17]}:{},...g.length>18?{trail_weight:g[18]}:{}}})}const u=e.getUint32(t,!0);if(t+=4,n.length<t+u)throw new Xe("the payload ends inside its notes");const w=new TextDecoder().decode(n.subarray(t,t+u)),v={version:i,world:{trail_persistence:o,trail_diffusion:c,boundary_conditions:l},configs:h};return w!==""&&(v.notes=w),v}const _o=Pa??fo,{decompressFromEncodedURIComponent:Eo}=_o,Np="Shared Link",xo="c",To="b",Ds=`${xo}=`,Cn=`${To}=`,Pp=8e3;class Ve extends Error{constructor(e){super(e),this.name="ShareLinkError"}}function So(n){let e="";for(let s=0;s<n.length;s+=32768)e+=String.fromCharCode(...n.subarray(s,s+32768));return btoa(e).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}function Ao(n){const e=atob(n.replace(/-/g,"+").replace(/_/g,"/")),t=new Uint8Array(e.length);for(let s=0;s<e.length;s+=1)t[s]=e.charCodeAt(s);return t}function Co(n){return`#${Cn}${So(bo(n))}`}function Ro(n){const e=n.startsWith("#")?n.slice(1):n;if(e.startsWith(Cn)){const a=e.slice(Cn.length);if(a==="")throw new Ve("the share link carries no data");let i;try{i=Ao(a)}catch{throw new Ve("the share link is damaged or incomplete -- it was most likely truncated somewhere between being copied and being opened")}try{return yo(i)}catch(r){throw r instanceof Xe?new Ve(r.message):r}}if(!e.startsWith(Ds))return null;const t=e.slice(Ds.length);if(t==="")throw new Ve("the share link carries no data");let s;try{s=Eo(t)}catch{s=null}if(s===null||s==="")throw new Ve("the share link is damaged or incomplete -- it was most likely truncated somewhere between being copied and being opened");try{return JSON.parse(s)}catch{throw new Ve("the share link did not contain a readable config")}}function kp(n){const e=n.trim();if(e==="")return null;const t=e.indexOf("#"),s=t===-1?e:e.slice(t+1);return Ro(s.replace(/\s+/g,""))}function Dp(n,e){return`${n.origin}${n.pathname}${n.search}${Co(e)}`}const Io=2;function Up(n){return n.calibrationVersion>=Io}const He=Object.freeze({brightness:2,physicsSteps:5,tonemapSoftness:2.5,motionBlurSamples:1,showFpsCounter:!0,physicsSliderOpen:!0,showPhysicsSlider:!0,bloomEnabled:!0,bloomThreshold:.2,bloomIntensity:.1,bloomRadius:1,drawSize:.01,drawPower:2.5,brushMode:0,drawAngle:0,wallsStrength:1,trailsStrength:1,fieldOpacity:.1,fieldAlwaysShow:!1,trailsAlwaysShow:!1,showReticle:!0,resetOnBehaviorChange:!0,oneClickSelection:!1,strongLogging:!1,worldSize:.5,canvasAspect:1,advancedProject:!1,advancedPreferences:!1,advancedDrawing:!1,mobileMode:0,calibrationVersion:0}),Wn={brightness:"float",physicsSteps:"int",tonemapSoftness:"float",motionBlurSamples:"int",showFpsCounter:"bool",physicsSliderOpen:"bool",showPhysicsSlider:"bool",bloomEnabled:"bool",bloomThreshold:"float",bloomIntensity:"float",bloomRadius:"float",drawSize:"float",drawPower:"float",brushMode:"int",drawAngle:"float",wallsStrength:"float",trailsStrength:"float",fieldOpacity:"float",fieldAlwaysShow:"bool",trailsAlwaysShow:"bool",showReticle:"bool",resetOnBehaviorChange:"bool",oneClickSelection:"bool",strongLogging:"bool",worldSize:"float",canvasAspect:"float",advancedProject:"bool",advancedPreferences:"bool",advancedDrawing:"bool",mobileMode:"int",calibrationVersion:"int"},Mp=Object.keys(Wn);function za(n){return Object.prototype.hasOwnProperty.call(Wn,n)}function Va(n,e){const t=Wn[n];return t==="bool"?typeof e=="boolean"?e:null:typeof e!="number"||!Number.isFinite(e)?null:t==="int"?Math.trunc(e):e}const Ha="fluoddity.preferences";function Wa(){try{return typeof localStorage>"u"?null:localStorage}catch{return null}}function Gp(n=Wa()){if(n===null)return He;let e;try{e=n.getItem(Ha)}catch(r){return console.warn(`Could not read preferences (${String(r)}); using defaults`),He}if(e===null)return He;let t;try{t=JSON.parse(e)}catch(r){return console.warn(`Could not parse preferences (${String(r)}); using defaults`),He}if(typeof t!="object"||t===null||Array.isArray(t))return He;const s=t,a={...He},i=[];for(const[r,o]of Object.entries(s)){if(!za(r))continue;const c=Va(r,o);if(c===null){i.push(r);continue}a[r]=c}return i.length>0&&console.warn(`Ignoring stored preferences with unusable values: ${i.join(", ")}`),Object.freeze(a)}function Bp(n,e=Wa()){if(e!==null)try{e.setItem(Ha,JSON.stringify(n))}catch(t){console.warn(`Could not write preferences: ${String(t)}`)}}function Fp(n,e,t){if(!za(e))return n;const s=Va(e,t);return s===null||n[e]===s?n:Object.freeze({...n,[e]:s})}function zp(n,e){return n.worldSize!==e.worldSize||n.canvasAspect!==e.canvasAspect}const Lo=.01,Oo=.001;function Vp(n){return{walls:n.wallsStrength*Lo,trails:n.trailsStrength*Oo}}const j="basic",L="advanced",D="config",ln="world",Y="prefs",F="slider",Us="input",Ms="int",ce="bool",qa="seed",cn="choice",Rt="gated",No="gated_int",Po={kind:F,lo:0,hi:1,help:"",implemented:!0,disruptive:!1,group:"",options:[],revealsOn:"",curve:1,inverted:!1,gateBase:0,gateEpsilon:1e-4,gates:[],panel:!0,requires:null,studio:!0,minMagnitude:0};function y(n){return{...Po,...n}}const It={boundaryConditions:["Bounce","Wrap","Reset","Kill"],initialConditions:["Grid","Random","Center","Ring"],mobileMode:["Auto","Always Touch","Always Desktop"]},qn=[y({field:"mutationScale",label:"Mutation Scale",tier:j,source:D,kind:F,lo:0,hi:.6,help:"How much each cohort's rule is randomly varied from the base rule. The most consequential control here: 0 makes every particle obey the same rule, higher values fan the population out into distinct behaviours.",group:"Mutation",panel:!1}),y({field:"mutationSeed",label:"Mutation Seed",tier:j,source:D,kind:qa,lo:0,hi:1,help:"Which random variation the mutation uses. Only has an effect when Mutation Scale is above zero. Reroll to explore alternatives at the same mutation strength.",group:"Mutation",panel:!1}),y({field:"cohorts",label:"Cohorts",tier:j,source:D,kind:Ms,lo:1,hi:64,help:"How many groups the population is divided into. When mutation Scale > 0, each cohort gets its own mutation of the parent behavior.",group:"Population"}),y({field:"boundaryConditions",label:"Boundary Conditions",tier:L,source:ln,kind:cn,lo:0,hi:3,help:"What happens when a particle reaches the edge of the world: Bounce reflects it, reset returns it to starting position, wrap carries it around to the opposite edge, and kill destroys it.",group:"Population",options:It.boundaryConditions}),y({field:"initialConditions",label:"Initial Conditions",tier:j,source:D,kind:cn,lo:0,hi:3,help:"How particles are arranged when the simulation starts: Grid and ring lay the cohorts out in a regular pattern, Random spreads them evenly, and Center starts them all in a dense clump in the middle.",group:"Population",options:It.initialConditions}),y({field:"cohortFences",label:"Cohort Fences",tier:j,source:D,kind:ce,lo:0,hi:1,help:"Cohort fences: When enabled, particles are forced to stay close to their initial locations (Grid only).",group:"Population",requires:["initialConditions",0]}),y({field:"hazardRate",label:"Hazard Rate",tier:L,source:D,kind:Rt,lo:0,hi:.01,help:'Applies a small probability each tick for a particle to "die" and be "reincarnated" at its initial conditions',group:"Population",curve:3}),y({field:"sensorAngle",label:"Sensor Angle",tier:j,source:D,kind:F,lo:-1,hi:1,help:"Defines how wide the angle is between a particle's two sensor locations. Values near 0.0 are looking straight ahead, values near 0.5 look to the left and right, while values near 1.0 look behind.",group:"Sensors"}),y({field:"sensorAngleJitter",label:"Sensor Angle Jitter",tier:L,source:D,kind:Rt,lo:0,hi:1,help:"Adds random, per-tick variation to each particle's sensor angle",group:"Sensors"}),y({field:"sensorDistance",label:"Sensor Distance",tier:j,source:D,kind:F,lo:0,hi:5,help:"Defines how far away from a particle's center it reads the trail. Higher values tend to result in larger, more global patterns",group:"Sensors"}),y({field:"sensorDistanceJitter",label:"Sensor Distance Jitter",tier:L,source:D,kind:Rt,lo:0,hi:1,help:"Adds random, per-tick variation to each particle's sensor distance. Distance jitter often produces softer edges and less noticeable grid-aligned aliasing",group:"Sensors"}),y({field:"sensorGain",label:"Sensor Gain",tier:L,source:D,kind:F,lo:0,hi:8,help:"Determines how sensitive each particle is to trail conditions. Set it too low and particles will travel ~straight, ignoring the trails. Set it too high and their behavior will become noisy and chaotic",group:"Sensors"}),y({field:"globalForceMult",label:"Global Force",tier:L,source:D,kind:F,lo:0,hi:1,help:"Determines the strength with which particles turn quickly, accelerate, and strafe",group:"Forces"}),y({field:"drag",label:"Momentum",tier:L,source:D,kind:F,lo:0,hi:1,help:"How much velocity carries over between ticks. At high values, particles will be able to build up momentum",group:"Forces"}),y({field:"",label:"Gravity",tier:j,source:D,kind:ce,help:"Enables vertical/radial gravity controls",group:"Forces",gates:["gravityStrafe","gravityTrails","gravityForce"]}),y({field:"gravityStrafe",label:"Gravity (Strafe)",tier:j,source:D,kind:F,lo:-1,hi:1,help:"Applies a fixed offset to particles each frame, shifting them downward",group:"Forces",revealsOn:"Gravity"}),y({field:"gravityTrails",label:"Gravity (Trails)",tier:L,source:D,kind:F,lo:-1,hi:1,help:"Biases what every particle senses, as though a trail lay downhill. Nothing is pushed -- each rule decides whether to follow that trail or flee it, so this can make a population fall or rise, and does nothing at all to one that ignores its sensors",group:"Forces",revealsOn:"Gravity"}),y({field:"gravityForce",label:"Gravity (Force)",tier:L,source:D,kind:F,lo:-1,hi:1,help:"Applies a fixed force to particles each frame, accelerating them downward",group:"Forces",revealsOn:"Gravity"}),y({field:"radialGravity",label:"Radial Gravity",tier:L,source:D,kind:ce,help:"Makes gravity push particles towards the center of the simulation instead of straight down",group:"Forces",revealsOn:"Gravity"}),y({field:"trailPersistence",label:"Trail Persistence",tier:L,source:ln,kind:F,lo:.5,hi:.999,help:"Determines how long particle trails remain detectable. At high values, trails will spread widely and decay slowly.",group:"Trails"}),y({field:"trailWeight",label:"Trail Weight",tier:L,source:D,kind:F,lo:-2,hi:2,help:"How much this config's trails count against other configs'. Heavier configs lay stronger trails and are swayed less by lighter ones; a negative weight lays trails that point backwards to everyone else. Has no effect on a config on its own.",group:"Trails",studio:!1,minMagnitude:.02}),y({field:"colorSensitivity",label:"Color Sensitivity",tier:L,source:D,kind:F,lo:-1,hi:1,help:"Determines how sensitive the hue of a particle is to its brain outputs. At high values particle hue becomes chaotic and regions will become a random mix of hues: appearing pale/white. Pairs with Color Offset, which decides where on the wheel that response starts",group:"Appearance"}),y({field:"colorOffset",label:"Color Offset",tier:L,source:D,kind:F,lo:0,hi:1,help:"Shifts this config’s hue around the colour wheel, before Color Sensitivity swings it. Lets each config sit in its own colour instead of every one fanning out from red",group:"Appearance"}),y({field:"colorByCohort",label:"Color By Cohort",tier:j,source:D,kind:ce,help:"Assign each cohort a unique color instead of basing hue on brain outputs",group:"Appearance"}),y({field:"axialForce",label:"Axial Force",tier:L,source:D,kind:F,lo:-2,hi:2,help:"Determines the relative strength of acceleration/braking forces and forward/backward strafing",group:"Advanced"}),y({field:"lateralForce",label:"Lateral Force",tier:L,source:D,kind:F,lo:-2,hi:2,help:"Determines the relative strength of turning forces and left-right strafing",group:"Advanced"}),y({field:"strafePower",label:"Strafe Power",tier:L,source:D,kind:F,lo:0,hi:.5,help:"Determines the relative strength of particle strafe, which directly shifts particle positions, bypassing momentum",group:"Advanced"}),y({field:"trailDiffusion",label:"Trail Stiffness",tier:L,source:ln,kind:Rt,lo:0,hi:1,help:"Allows you to slow or stop the pace at which particle trails spread through the environment. At stiffness 1.0, trails do not diffuse at all, and simply decay over time.",group:"Advanced",inverted:!0,gateBase:1}),y({field:"worldSize",label:"World Size",tier:j,source:Y,kind:Us,lo:.05,hi:27,help:"(Expensive) Determines the particle count and resolution of the trail map. Overall density -- Particles/Trail pixel -- is kept constant.",disruptive:!0,group:"Simulation"}),y({field:"canvasAspect",label:"Canvas Aspect",tier:L,source:Y,kind:Us,lo:.1,hi:10,help:"Determines Width/Height ratio of simulation area.",disruptive:!0,group:"Simulation"}),y({field:"physicsSteps",label:"Physics Rate",tier:j,source:Y,kind:Ms,lo:1,hi:60,help:"(Expensive) Determines how many physics substeps are performed per frame. Higher values run the simulation faster.",group:"Simulation"}),y({field:"brightness",label:"Brightness",tier:j,source:Y,kind:F,lo:.1,hi:4,help:"Determines overall intensity of each particle",group:"Display"}),y({field:"tonemapSoftness",label:"Tonemap Softness",tier:L,source:Y,kind:F,lo:.1,hi:5,help:"Determines how aggressively the bright highlights are dimmed. High values have reduced contrast between bright and dim regions.",group:"Display"}),y({field:"motionBlurSamples",label:"Motion Blur",tier:j,source:Y,kind:No,lo:1,hi:16,help:"(Expensive) Renders multiple images at different substeps and blends them together. Results in a smoother, less noisy image",group:"Display",gateBase:1}),y({field:"showFpsCounter",label:"Show FPS Counter",tier:j,source:Y,kind:ce,help:`The frame-rate button in the top-right corner. Its colour tracks how hard your GPU is working: red or yellow means it is struggling, green means it is well used, and blue means the full frame rate is holding.

The number is capped at 60, which is what the simulation is budgeted for -- a faster display is spent on a heavier simulation rather than on more frames.

The same colour tints World Size, Physics Rate and Motion Blur, which are the three settings that decide it.`,group:"Display"}),y({field:"showPhysicsSlider",label:"Show Physics Rate Widget",tier:L,source:Y,kind:ce,help:`The fast-forward button and its rate slider, at the right edge. It is the way to reach Physics Rate while the panels are hidden.

Untick to remove it from the screen entirely. To merely fold the slider away and keep the button, press the button itself -- and right-click it to auto-calibrate the rate.`,group:"Display"}),y({field:"bloomEnabled",label:"Bloom",tier:j,source:Y,kind:ce,help:"Adds a glowing halo effect to over-bright regions",group:"Display"}),y({field:"bloomThreshold",label:"Threshold",tier:L,source:Y,kind:F,lo:0,hi:2,help:"Determines the brightness above which bloom is applied",group:"Display",revealsOn:"bloomEnabled"}),y({field:"bloomIntensity",label:"Intensity",tier:L,source:Y,kind:F,lo:0,hi:.5,help:"Determines the strength of the bloom effect",group:"Display",revealsOn:"bloomEnabled"}),y({field:"bloomRadius",label:"Radius",tier:L,source:Y,kind:F,lo:.1,hi:1,help:"Determines the size of the bloom halo",group:"Display",revealsOn:"bloomEnabled"}),y({field:"resetOnBehaviorChange",label:"Reset on Behavior Change",tier:L,source:Y,kind:ce,help:"Resets the simulation whenever particles are given new behaviors",group:"Behavior"}),y({field:"oneClickSelection",label:"1-Click Selection",tier:L,source:Y,kind:ce,help:"Allow a single click to bypass cohort selection and generate children immediately",group:"Behavior"}),y({field:"mobileMode",label:"Touch Layout",tier:L,source:Y,kind:cn,lo:0,hi:It.mobileMode.length-1,help:"Which layout to build: Auto picks the touch layout on touchscreens, including tablets. Change this only if the automatic choice is wrong for your device -- it takes effect after you reload the page.",group:"Behavior",options:It.mobileMode}),y({field:"strongLogging",label:"Strong Logging",tier:L,source:Y,kind:ce,help:"Record every project state you visit to a local archive, so the exploration can be studied later. Changes nothing on screen",group:"Archive"})];function ko(n){return qn.filter(e=>e.panel&&e.studio&&(n||e.tier===j))}function Hp(n,e){const t=n.minMagnitude;return t<=0||Math.abs(e)>=t?e:e<0?-t:t}function Wp(n,e){const t=new Set(e),s=[],a=new Map;for(const i of ko(n)){if(!t.has(i.source))continue;let r=a.get(i.group);r===void 0&&(r=[],a.set(i.group,r),s.push(i.group)),r.push(i)}return s.map(i=>[i,a.get(i)??[]])}function qp(){return qn.find(n=>n.kind===qa)??null}function jp(n,e){return qn.find(t=>t.source===n&&t.field===e)??null}const Pe="rgba16float";function Do(n,e){const[t,s]=e;return!Number.isFinite(t)||!Number.isFinite(s)||t<=0||s<=0?!1:n===null?!0:n[0]!==t||n[1]!==s}class Yp{device;hdrTarget=null;accumTarget=null;currentSize=null;sampler;constructor(e){this.device=e,this.sampler=e.createSampler({label:"hdr-linear-clamp",magFilter:"linear",minFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"})}get size(){return this.currentSize}get hdr(){return this.hdrTarget?.view??null}get accum(){return this.accumTarget?.view??null}ensure(e){if(!Do(this.currentSize,e))return!1;this.release();const[t,s]=e,a=i=>{const r=this.device.createTexture({label:i,size:{width:t,height:s},format:Pe,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING});return{texture:r,view:r.createView()}};return this.hdrTarget=a("hdr"),this.accumTarget=a("accum"),this.currentSize=[t,s],!0}release(){this.hdrTarget?.texture.destroy(),this.accumTarget?.texture.destroy(),this.hdrTarget=null,this.accumTarget=null,this.currentSize=null}}async function $(n,e,t){let s;try{s=n.createShaderModule({label:e,code:t})}catch(o){return console.error(`Failed to compile ${e}: ${String(o)}`),null}let a;try{a=await s.getCompilationInfo()}catch(o){return console.error(`Failed to read compilation info for ${e}: ${String(o)}`),null}const i=a.messages.filter(o=>o.type==="error"),r=a.messages.filter(o=>o.type==="warning");for(const o of r)console.warn(`${e}:${o.lineNum}:${o.linePos}: ${o.message}`);if(i.length>0){console.error(`Failed to compile ${e}:`);for(const o of i)console.error(`  ${e}:${o.lineNum}:${o.linePos}: ${o.message}`);return null}return console.log(`${e} compiled successfully`),s}const ja=6e5,Uo=1024,Mo=1;function Go(n){return[Math.max(1,Math.trunc(ja*n)),Math.max(16,Math.trunc(Uo*Math.sqrt(n)))]}const[Bo,Fo]=Go(1);function Ya(n=Mo,e){const t=e??Fo,s=Math.sqrt(n);return[Math.max(1,Math.round(t*s)),Math.max(1,Math.round(t/s))]}const zt="rgba16float",hn=512;function zo(n){const[e,t]=n;return e*t<=hn*hn?[e,t]:Ya(e/t,hn)}const Rn=16,In=16,$a=128;function Vo(n,e,t){const s=new ArrayBuffer(Rn),a=new Float32Array(s),i=new Int32Array(s);return a[0]=n[0],a[1]=n[1],a[2]=e,i[3]=t?1:0,s}function Ho(n,e){const t=new ArrayBuffer(In),s=new Float32Array(t);return s[0]=n[0],s[1]=n[1],s[2]=e,t}const Wo=["plain","dashed","out","in","fixed"],qo=Object.fromEntries(Wo.map((n,e)=>[n,e])),$p={showField:!1,showTrails:!1,reticleCenter:[0,0],reticleRadius:0,reticleStyle:"plain",reticleAngle:0,linePreview:null,crop:null,capture:null};function jo(n,e,t,s,a=!1){const i=new ArrayBuffer($a),r=new Float32Array(i),o=new Int32Array(i);r[0]=n.canvasSize[0],r[1]=n.canvasSize[1],r[2]=n.windowSize[0],r[3]=n.windowSize[1],r[4]=n.pan[0],r[5]=n.pan[1],r[6]=n.zoom;const c=e.bloomEnabled&&e.bloomIntensity>0&&t;r[8]=c?e.bloomIntensity:0,r[9]=e.brightness,r[10]=Math.max(0,e.tonemapSoftness),r[11]=s.showField?Math.max(0,e.fieldOpacity):0,r[12]=s.reticleCenter[0],r[13]=s.reticleCenter[1],r[14]=s.reticleRadius,r[15]=s.reticleAngle,o[16]=qo[s.reticleStyle],r[17]=s.showTrails?Math.max(0,e.fieldOpacity):0,r[19]=a?1:0,s.linePreview!==null&&(r[18]=1,r[28]=s.linePreview.from[0],r[29]=s.linePreview.from[1],r[30]=s.linePreview.to[0],r[31]=s.linePreview.to[1]),s.crop!==null&&(r[20]=s.crop.halfExtent[0],r[21]=s.crop.halfExtent[1],r[22]=1,r[23]=$o);const l=s.capture??Yo;return r[24]=l.scale[0],r[25]=l.scale[1],r[26]=l.offset[0],r[27]=l.offset[1],i}const Yo={scale:[1,1],offset:[0,0]},$o=.65;function Ko(n,e,t){if(n.rule.length!==As)throw new Error(`rule must be ${As} floats (10 centers x 8), got ${n.rule.length}`);if(t%4!==0)throw new Error(`byteOffset must be 4-byte aligned, got ${t}`);if(t+Ft>e.byteLength)throw new Error(`writing a ${Ft}-byte record at offset ${t} overruns a ${e.byteLength}-byte buffer`);const s=new Float32Array(e),a=new Int32Array(e),i=t/4;s.set(n.rule,i+O.rule),s[i+O.sensor+0]=n.sensorGain,s[i+O.sensor+1]=n.sensorAngle,s[i+O.sensor+2]=n.sensorDistance,s[i+O.sensor+3]=n.mutationScale,s[i+O.force+0]=n.globalForceMult,s[i+O.force+1]=n.drag,s[i+O.force+2]=n.strafePower,s[i+O.force+3]=n.axialForce,s[i+O.misc+0]=n.lateralForce,s[i+O.misc+1]=n.hazardRate,a[i+O.misc+2]=n.cohorts,s[i+O.misc+3]=n.mutationSeed,s[i+O.force2+0]=n.gravityForce,s[i+O.force2+1]=n.gravityStrafe,a[i+O.force2+2]=n.initialConditions,a[i+O.force2+3]=n.cohortFences?1:0,s[i+O.misc2+0]=n.colorSensitivity,a[i+O.misc2+1]=n.colorByCohort?1:0,s[i+O.misc2+2]=n.sensorAngleJitter,s[i+O.misc2+3]=n.sensorDistanceJitter,a[i+O.misc3+0]=n.radialGravity?1:0,s[i+O.misc3+1]=n.gravityTrails,s[i+O.misc3+2]=n.colorOffset,s[i+O.misc3+3]=n.trailWeight,s[i+O.misc4+0]=n.mutationScale2??0,s[i+O.misc4+1]=n.mutationSeed2??0}function Gs(n){const e=new ArrayBuffer(n.length*Ft);for(let t=0;t<n.length;t++)Ko(n[t],e,t*Ft);return e}function Xo(n){const e=new ArrayBuffer(Ia),t=new Float32Array(e),s=new Int32Array(e);return t[je.trail+0]=n.trailPersistence,t[je.trail+1]=n.trailDiffusion,t[je.trail+2]=n.sqrtWorldSize,s[je.trail+3]=n.configCount,s[je.bounds+0]=n.boundaryConditions,e}const Ka=24,Qo=(1<<Ka)-1,Zo=8,Jo=(1<<Zo)-1,Xa=4294967295,Kp=15,el=0,tl=4,nl=12,Qa=16,Dt=80,ke=Qa+Ie("Rule").size;{const n=Ie("Rule").size;if(n!==Dt*4)throw new Error(`Rule is ${n} bytes in layout.fixture.json but pick.ts reads ${Dt} floats (${Dt*4} bytes) out of the pick result.`);if(ke%16!==0)throw new Error(`PickResultBuffer is ${ke} bytes, not a multiple of 16.`)}const sl={index:-1,pos:[0,0],distance:1/0,rule:null,cohort:-1};function Xp(n){return n.index>=0}function al(n,e){if(n.byteLength<ke)throw new Error(`pick result is ${n.byteLength} bytes, expected at least ${ke}`);const t=new Uint32Array(n,el,1)[0];if(t===Xa)return sl;const s=t&Qo,i=(t>>>Ka)/Jo*e,r=new Float32Array(n,tl,2),o=new Float32Array(n,nl,1)[0],c=new Float32Array(n,Qa,Dt);return{index:s,pos:[r[0],r[1]],distance:i,rule:Array.from(c),cohort:o}}function Qp(n,e,t,s,a){const i=[e[0]/2,e[1]/2],r=Oe(i,e,t,s,a),o=Oe([i[0]+n,i[1]],e,t,s,a);return Math.abs(o[0]-r[0])}const Za=48,Ln=96,On=48,il={walls:.01,trails:.001},jn={walls:0,trails:0};function Yn(n,e){const t=new ArrayBuffer(e);return new Uint8Array(t).set(new Uint8Array(Xo(n)),0),{buffer:t,f32:new Float32Array(t),i32:new Int32Array(t)}}const W=Ia/4;function rl(n,e,t,s,a,i,r,o=jn){const{buffer:c,f32:l,i32:d}=Yn(n,Ln);return l[W+0]=e[0],l[W+1]=e[1],l[W+2]=t[0],l[W+3]=t[1],l[W+4]=a===null?0:a.center[0],l[W+5]=a===null?0:a.center[1],l[W+6]=a===null?0:a.strength,l[W+7]=a===null?0:a.size,d[W+8]=s,d[W+9]=i?1:0,l[W+10]=r.walls,l[W+11]=r.trails,l[W+12]=o.walls,l[W+13]=o.trails,c}function ol(n,e){const{buffer:t,i32:s}=Yn(n,On);return s[W+0]=e,t}function ll(n,e,t,s=-1){const{buffer:a,f32:i}=Yn(n,Za);return i[W+0]=e[0],i[W+1]=e[1],i[W+2]=t,i[W+3]=s,a}function Vt(n,e){return Math.ceil(n/e)*e}const se=5;function cl(n,e){const t=[];let s=n,a=e;for(let i=0;i<se;i++)s=Math.max(1,Math.floor(s/2)),a=Math.max(1,Math.floor(a/2)),t.push([s,a]);return t}const hl=`// Bloom downsample: halve the resolution with a 4-tap box filter.
// A port of \`assembler/shaders/bloom_downsample.frag\`.
//
// The taps sit half a SOURCE texel off-centre, so each one lands exactly
// between four source texels and bilinear filtering averages them for free --
// four samples covering a 4x4 neighbourhood.
//
// Everything here is linear HDR. The original Fluoddity has to inverse-tonemap
// on the first pass because it tonemaps before blooming; we bloom first, so
// there is nothing to undo.
// ==== begin include: fullscreenQuad.wgsl ====
// The fullscreen quad, shared by every pass that covers the screen.
//
// The desktop's \`shared/shaders/fullscreen_quad.vert\` is shared across five
// consumers; this is that file. Consumers here:
//
//   camera/shaders/camera.wgsl              TRAIL present
//   camera/shaders/accumulate.wgsl          motion blur accumulation
//   assembler/shaders/bloomDownsample.wgsl  the mip chain, down
//   assembler/shaders/bloomUpsample.wgsl    the mip chain, up
//   assembler/shaders/frameAssembly.wgsl    bloom, tone curve, overlays
//   webcam/shaders/cameraPreview.wgsl       the Camera tab's thumbnail
//   webcam/shaders/camera{Ingest,Blur,Map}.wgsl -- the VERTEX only. They render
//                                           into textures the particles sample,
//                                           so they index by @builtin(position)
//                                           and ignore \`uv\`; see cameraIngest.
//
// NOT a consumer: \`particleSystem/shaders/canvas.wgsl\`. It needs the V FLIP
// (see its header) because it rasterizes into the canvas texture and every
// fragment must read the texel it is about to write; every consumer above needs
// NO flip. Merging the two behind a boolean parameter would put the single most
// dangerous decision in this port -- the one Step 4 lost the most time to --
// behind an argument that is easy to pass wrong and impossible to see in a
// diff. Two small definitions, each unconditionally correct, is the right shape.
//
// WHY NOT IN common.wgsl. That file declares no bindings and must stay
// stage-agnostic (its own editing rules 3 and 4), and a \`@vertex\` entry point
// is the opposite of stage-agnostic. It is also parsed by \`common.wgsl.test.ts\`
// against the generated layout descriptor, so unrelated additions there are
// noise in a file whose job is struct layout.
//
// NO VERTEX BUFFER. The quad comes from \`@builtin(vertex_index)\`, so there is
// nothing to allocate, bind or keep in sync. Drawn as \`draw(4)\` with
// \`topology: 'triangle-strip'\` -- TRIANGLE_FAN is not a WebGPU topology, which
// is why the corner order below is strip order rather than the desktop's fan.

struct FsQuadVsOut {
    @builtin(position) clip : vec4f,
    @location(0) uv : vec2f,
}

// Strip order: (-,-) (+,-) (-,+) (+,+). The same order \`canvas.wgsl\` and the
// deleted \`debugPresent.wgsl\` use, so all four agree by inspection.
fn fullscreen_corner(vi: u32) -> vec2f {
    var corners = array<vec2f, 4>(
        vec2f(-1.0, -1.0),
        vec2f( 1.0, -1.0),
        vec2f(-1.0,  1.0),
        vec2f( 1.0,  1.0),
    );
    return corners[vi];
}

// NO Y FLIP, for every consumer of this entry point.
//
// The canvas texture is stored TOP-LEFT-ORIGIN: the trail deposit
// (entityUpdate.wgsl) writes each pixel at the texture row \`get_can\` samples,
// and canvas.wgsl flips v to read back the texel it writes, so the stored image
// matches WebGPU's framebuffer convention. Sampling it straight therefore puts
// world +y at the top of the screen, matching the desktop. See \`web/README.md\`'s
// Y-flip section.
//
// The intermediate targets (hdr, accum, the bloom mips) are all WRITTEN by
// passes using this entry point and READ by passes using this entry point, so
// they are internally consistent whatever convention is chosen -- the only
// externally observable flips are \`camera.wgsl\` reading the canvas and
// \`frameAssembly.wgsl\` reading the strafe field, and both want none.
@vertex
fn fullscreen_vs(@builtin(vertex_index) vi : u32) -> FsQuadVsOut {
    let p = fullscreen_corner(vi);
    var out : FsQuadVsOut;
    out.clip = vec4f(p, 0.0, 1.0);
    out.uv = p * 0.5 + 0.5;
    return out;
}

// ==== end include: fullscreenQuad.wgsl ====

struct BloomDownsampleUniforms {
    // xy: 1.0 / SOURCE resolution   z: threshold   w: apply_threshold(i)
    //
    // "SOURCE" is load-bearing: the texel size is the level being READ, not the
    // one being written (bloom.py:113,121 takes it from \`src\`). Using the
    // destination's would halve every tap offset and read as a tuning
    // difference rather than as a bug.
    params : vec4f,
}

@group(0) @binding(0) var<uniform> u : BloomDownsampleUniforms;
@group(0) @binding(1) var source_tex : texture_2d<f32>;
@group(0) @binding(2) var source_sampler : sampler;

fn apply_threshold() -> bool { return bitcast<i32>(u.params.w) != 0; }

@fragment
fn fs_main(in: FsQuadVsOut) -> @location(0) vec4f {
    let texel = u.params.xy;

    let a = textureSampleLevel(source_tex, source_sampler, in.uv + texel * vec2f(-0.5, -0.5), 0.0).rgb;
    let b = textureSampleLevel(source_tex, source_sampler, in.uv + texel * vec2f( 0.5, -0.5), 0.0).rgb;
    let c = textureSampleLevel(source_tex, source_sampler, in.uv + texel * vec2f(-0.5,  0.5), 0.0).rgb;
    let d = textureSampleLevel(source_tex, source_sampler, in.uv + texel * vec2f( 0.5,  0.5), 0.0).rgb;

    var color = (a + b + c + d) * 0.25;

    // Thresholded on the FIRST pass only: this is where the bloom source is
    // separated from the image, and every later mip is just blurring what came
    // out of it. Re-applying it would eat the glow it was meant to spread.
    //
    // Subtracting from the max channel and rescaling preserves hue -- clamping
    // per-channel instead would tint bright colours toward white.
    if (apply_threshold()) {
        let brightness = max(color.r, max(color.g, color.b));
        color *= max(0.0, brightness - u.params.z) / max(brightness, 0.0001);
    }

    return vec4f(color, 1.0);
}
`,dl=`// Bloom upsample: 3x3 tent filter, added into the next mip up.
// A port of \`assembler/shaders/bloom_upsample.frag\`.
//
// Walking back up the chain adding each blurred level to the one above is what
// gives bloom its wide, soft falloff: the smallest mip contributes a huge
// diffuse halo, the largest a tight glow, and the sum of them is far smoother
// than any single blur of the same width.
//
// THE ADDITION IS DONE BY THE BLEND UNIT (ONE, ONE), not by sampling the
// destination here. The original Fluoddity binds the destination mip as a
// sampler while rendering into it, which is undefined behaviour -- it works
// only because the read is 1:1 at the fragment's own uv. Blending is correct
// and cheaper, and on the web it is the only option: WebGPU rejects the bind
// group outright.
//
// THE PASS MUST LOAD, NOT CLEAR. The destination already holds its own
// downsampled content and this pass ADDS to it. moderngl simply does not clear,
// so the GLSL has nothing to say about it; WebGPU makes the choice explicit and
// 'clear' would silently discard the entire down-chain, leaving only the
// smallest mip's contribution -- a plausible, slightly-too-diffuse glow that
// reads as "the radius is too big". See bloom.ts, which sets it.
//
// No per-level weight: every mip is added at full strength and bloom_intensity
// is the single global scale, applied once during composite.
// ==== begin include: fullscreenQuad.wgsl ====
// The fullscreen quad, shared by every pass that covers the screen.
//
// The desktop's \`shared/shaders/fullscreen_quad.vert\` is shared across five
// consumers; this is that file. Consumers here:
//
//   camera/shaders/camera.wgsl              TRAIL present
//   camera/shaders/accumulate.wgsl          motion blur accumulation
//   assembler/shaders/bloomDownsample.wgsl  the mip chain, down
//   assembler/shaders/bloomUpsample.wgsl    the mip chain, up
//   assembler/shaders/frameAssembly.wgsl    bloom, tone curve, overlays
//   webcam/shaders/cameraPreview.wgsl       the Camera tab's thumbnail
//   webcam/shaders/camera{Ingest,Blur,Map}.wgsl -- the VERTEX only. They render
//                                           into textures the particles sample,
//                                           so they index by @builtin(position)
//                                           and ignore \`uv\`; see cameraIngest.
//
// NOT a consumer: \`particleSystem/shaders/canvas.wgsl\`. It needs the V FLIP
// (see its header) because it rasterizes into the canvas texture and every
// fragment must read the texel it is about to write; every consumer above needs
// NO flip. Merging the two behind a boolean parameter would put the single most
// dangerous decision in this port -- the one Step 4 lost the most time to --
// behind an argument that is easy to pass wrong and impossible to see in a
// diff. Two small definitions, each unconditionally correct, is the right shape.
//
// WHY NOT IN common.wgsl. That file declares no bindings and must stay
// stage-agnostic (its own editing rules 3 and 4), and a \`@vertex\` entry point
// is the opposite of stage-agnostic. It is also parsed by \`common.wgsl.test.ts\`
// against the generated layout descriptor, so unrelated additions there are
// noise in a file whose job is struct layout.
//
// NO VERTEX BUFFER. The quad comes from \`@builtin(vertex_index)\`, so there is
// nothing to allocate, bind or keep in sync. Drawn as \`draw(4)\` with
// \`topology: 'triangle-strip'\` -- TRIANGLE_FAN is not a WebGPU topology, which
// is why the corner order below is strip order rather than the desktop's fan.

struct FsQuadVsOut {
    @builtin(position) clip : vec4f,
    @location(0) uv : vec2f,
}

// Strip order: (-,-) (+,-) (-,+) (+,+). The same order \`canvas.wgsl\` and the
// deleted \`debugPresent.wgsl\` use, so all four agree by inspection.
fn fullscreen_corner(vi: u32) -> vec2f {
    var corners = array<vec2f, 4>(
        vec2f(-1.0, -1.0),
        vec2f( 1.0, -1.0),
        vec2f(-1.0,  1.0),
        vec2f( 1.0,  1.0),
    );
    return corners[vi];
}

// NO Y FLIP, for every consumer of this entry point.
//
// The canvas texture is stored TOP-LEFT-ORIGIN: the trail deposit
// (entityUpdate.wgsl) writes each pixel at the texture row \`get_can\` samples,
// and canvas.wgsl flips v to read back the texel it writes, so the stored image
// matches WebGPU's framebuffer convention. Sampling it straight therefore puts
// world +y at the top of the screen, matching the desktop. See \`web/README.md\`'s
// Y-flip section.
//
// The intermediate targets (hdr, accum, the bloom mips) are all WRITTEN by
// passes using this entry point and READ by passes using this entry point, so
// they are internally consistent whatever convention is chosen -- the only
// externally observable flips are \`camera.wgsl\` reading the canvas and
// \`frameAssembly.wgsl\` reading the strafe field, and both want none.
@vertex
fn fullscreen_vs(@builtin(vertex_index) vi : u32) -> FsQuadVsOut {
    let p = fullscreen_corner(vi);
    var out : FsQuadVsOut;
    out.clip = vec4f(p, 0.0, 1.0);
    out.uv = p * 0.5 + 0.5;
    return out;
}

// ==== end include: fullscreenQuad.wgsl ====

struct BloomUpsampleUniforms {
    // xy: 1.0 / SOURCE resolution (the LOWER-res mip being read)
    // z: bloom_radius, scaling the tap offsets   w: reserved
    params : vec4f,
}

@group(0) @binding(0) var<uniform> u : BloomUpsampleUniforms;
@group(0) @binding(1) var source_tex : texture_2d<f32>;
@group(0) @binding(2) var source_sampler : sampler;

@fragment
fn fs_main(in: FsQuadVsOut) -> @location(0) vec4f {
    let texel = u.params.xy;
    let r = u.params.z;

    var sum = vec3f(0.0);
    sum += textureSampleLevel(source_tex, source_sampler, in.uv + texel * vec2f( -r,  -r), 0.0).rgb * 1.0;
    sum += textureSampleLevel(source_tex, source_sampler, in.uv + texel * vec2f(0.0,  -r), 0.0).rgb * 2.0;
    sum += textureSampleLevel(source_tex, source_sampler, in.uv + texel * vec2f(  r,  -r), 0.0).rgb * 1.0;
    sum += textureSampleLevel(source_tex, source_sampler, in.uv + texel * vec2f( -r, 0.0), 0.0).rgb * 2.0;
    sum += textureSampleLevel(source_tex, source_sampler, in.uv + texel * vec2f(0.0, 0.0), 0.0).rgb * 4.0;
    sum += textureSampleLevel(source_tex, source_sampler, in.uv + texel * vec2f(  r, 0.0), 0.0).rgb * 2.0;
    sum += textureSampleLevel(source_tex, source_sampler, in.uv + texel * vec2f( -r,   r), 0.0).rgb * 1.0;
    sum += textureSampleLevel(source_tex, source_sampler, in.uv + texel * vec2f(0.0,   r), 0.0).rgb * 2.0;
    sum += textureSampleLevel(source_tex, source_sampler, in.uv + texel * vec2f(  r,   r), 0.0).rgb * 1.0;
    sum /= 16.0;

    return vec4f(sum, 1.0);
}
`;class ul{device;sampler;downPipeline=null;upPipeline=null;downLayout=null;upLayout=null;downUniforms;upUniforms;downStride;upStride;mips=[];downGroups=[];upGroups=[];sourceSize=null;sourceView=null;constructor(e,t){this.device=e,this.sampler=t;const s=e.limits.minUniformBufferOffsetAlignment;this.downStride=Vt(Rn,s),this.upStride=Vt(In,s),this.downUniforms=e.createBuffer({label:"bloom-downsample-uniforms",size:this.downStride*se,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.upUniforms=e.createBuffer({label:"bloom-upsample-uniforms",size:this.upStride*se,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST})}async reload(){const e=this.device,[t,s]=await Promise.all([$(e,"bloomDownsample.wgsl",hl),$(e,"bloomUpsample.wgsl",dl)]),a=i=>e.createBindGroupLayout({label:i,entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,buffer:{type:"uniform",hasDynamicOffset:!0}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:2,visibility:GPUShaderStage.FRAGMENT,sampler:{}}]});t!==null&&(this.downLayout=a("bloom-downsample"),this.downPipeline=e.createRenderPipeline({label:"bloom-downsample",layout:e.createPipelineLayout({bindGroupLayouts:[this.downLayout]}),vertex:{module:t,entryPoint:"fullscreen_vs"},fragment:{module:t,entryPoint:"fs_main",targets:[{format:Pe}]},primitive:{topology:"triangle-strip"}})),s!==null&&(this.upLayout=a("bloom-upsample"),this.upPipeline=e.createRenderPipeline({label:"bloom-upsample",layout:e.createPipelineLayout({bindGroupLayouts:[this.upLayout]}),vertex:{module:s,entryPoint:"fullscreen_vs"},fragment:{module:s,entryPoint:"fs_main",targets:[{format:Pe,blend:{color:{srcFactor:"one",dstFactor:"one",operation:"add"},alpha:{srcFactor:"one",dstFactor:"one",operation:"add"}}}]},primitive:{topology:"triangle-strip"}})),this.invalidate()}pipelineStatus(){return{bloomDownsample:this.downPipeline!==null,bloomUpsample:this.upPipeline!==null}}invalidate(){this.downGroups=[],this.upGroups=[],this.sourceView=null}process(e,t,s,a,i){if(this.downPipeline===null||this.upPipeline===null||this.downLayout===null||this.upLayout===null)return null;const[r,o]=s;if(r<=0||o<=0||(this.ensureResources(r,o),this.mips.length===0))return null;this.ensureGroups(t);const c=new Uint8Array(this.downStride*se),l=new Uint8Array(this.upStride*se);for(let h=0;h<se;h++){const u=h===0?s:this.mips[h-1].size;c.set(new Uint8Array(Vo([1/u[0],1/u[1]],a,h===0)),h*this.downStride)}for(let h=se-1;h>0;h--){const u=this.mips[h].size;l.set(new Uint8Array(Ho([1/u[0],1/u[1]],i)),h*this.upStride)}const d=this.device.queue;d.writeBuffer(this.downUniforms,0,c),d.writeBuffer(this.upUniforms,0,l);for(let h=0;h<se;h++){const u=e.beginRenderPass({label:`bloom-down-${h}`,timestampWrites:re("bloom"),colorAttachments:[{view:this.mips[h].view,clearValue:{r:0,g:0,b:0,a:1},loadOp:"clear",storeOp:"store"}]});u.setPipeline(this.downPipeline),u.setBindGroup(0,this.downGroups[h],[h*this.downStride]),u.draw(4),u.end()}for(let h=se-1;h>0;h--){const u=e.beginRenderPass({label:`bloom-up-${h}`,timestampWrites:re("bloom"),colorAttachments:[{view:this.mips[h-1].view,loadOp:"load",storeOp:"store"}]});u.setPipeline(this.upPipeline),u.setBindGroup(0,this.upGroups[h],[h*this.upStride]),u.draw(4),u.end()}return this.mips[0].view}ensureResources(e,t){if(!(this.sourceSize!==null&&this.sourceSize[0]===e&&this.sourceSize[1]===t)){this.release();for(const[s,a]of cl(e,t)){const i=this.device.createTexture({label:`bloom-mip-${this.mips.length}`,size:{width:s,height:a},format:Pe,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING});this.mips.push({texture:i,view:i.createView(),size:[s,a]})}this.sourceSize=[e,t]}}ensureGroups(e){if(this.sourceView===e&&this.downGroups.length===se)return;const t=(s,a,i,r,o)=>this.device.createBindGroup({label:a,layout:s,entries:[{binding:0,resource:{buffer:i,size:r}},{binding:1,resource:o},{binding:2,resource:this.sampler}]});this.downGroups=[];for(let s=0;s<se;s++)this.downGroups.push(t(this.downLayout,`bloom-down-${s}`,this.downUniforms,Rn,s===0?e:this.mips[s-1].view));this.upGroups=[];for(let s=0;s<se;s++)this.upGroups.push(t(this.upLayout,`bloom-up-${s}`,this.upUniforms,In,this.mips[s].view));this.sourceView=e}release(){for(const e of this.mips)e.texture.destroy();this.mips=[],this.sourceSize=null,this.invalidate()}destroy(){this.release(),this.downUniforms.destroy(),this.upUniforms.destroy()}}const fl=`// Frame assembly: everything between the finished camera frame and the screen.
// A port of \`assembler/shaders/frame_assembly.frag\`.
//
//   composite bloom  (linear)
//   brightness       (linear)
//   tone curve       linear -> display
//   field overlay    on top of the curve
//   brush reticle    on top of the curve
//
// ORDER MATTERS IN BOTH DIRECTIONS. Bloom and brightness go before the curve
// because they are physical quantities -- adding light, then exposing it. The
// overlays go after because they are not part of the image at all: they are
// annotations, and running them through a compressive curve would dim the
// reticle's white and make its apparent thickness depend on scene brightness.
//
// EVERY TEXTURE READ HERE IS textureSampleLevel, NOT textureSample. The field
// sample sits inside a branch on \`inside\`, which is per-fragment -- non-uniform
// control flow, where WGSL forbids implicit-derivative sampling outright. The
// other two would be legal either way; using one form throughout means nobody
// has to work out which is which, and no mips exist so level 0 is identical.
// ==== begin include: common.wgsl ====
// ============================================================================
// common.wgsl -- shared struct definitions and coordinate math.
//
// THIS FILE IS THE SINGLE SOURCE OF TRUTH FOR GPU STRUCT LAYOUT. What the
// structs below declare is what the GPU reads.
//
// The layout is stated in ONE OTHER PLACE: \`src/particleSystem/layout.fixture.json\`,
// which is what the host packs against (\`pack.ts\`, guarded by \`assertLaneMap\`).
// Two hand-authored statements of one fact, so \`common.wgsl.test.ts\` checks the
// declarations below against that descriptor on every \`npm test\`. It is the
// shader-side counterpart of \`assertLaneMap\`; together they close the loop.
//
// If that test fails, the two have diverged and the GPU is reinterpreting memory
// the host packed to a different plan -- which does not crash, it just makes the
// simulation subtly wrong. CHANGE BOTH FILES IN THE SAME COMMIT.
//
// (The descriptor was originally generated by the Python desktop app's
// layout.py, which parsed the GLSL original of this file. That app is gone;
// there is no generator now and deliberately no replacement -- see layout.ts.)
//
// RULES FOR EDITING THIS FILE:
//
//  1. vec4-ONLY. Every member of every struct must be a vec4f, a fixed-size
//     array of vec4f, or another struct that obeys this rule. No bare f32,
//     no i32, no vec2f/vec3f. Scalars ride in vec4 lanes; ints ride in float
//     lanes via bitcast.
//
//     Why: std430 (GLSL) and WGSL do NOT agree on how to lay out structs with
//     mixed scalar types. An all-vec4 struct is 16-byte aligned with an
//     unambiguous stride in both, so this codebase translates between them
//     without a layout audit. Both layout.py and common.wgsl.test.ts enforce
//     this and will fail on anything else.
//
//  2. ADD A FIELD BY CLAIMING A RESERVED LANE, not by appending a scalar.
//     When the reserved lanes run out, add a whole new vec4.
//
//  3. NO uniforms and NO buffer/binding declarations in this file -- types and
//     pure functions only. Bindings belong to the shader that owns them.
//     (Binding assignments are recorded in the table below for coordination.)
//
//     This rule is MORE load-bearing on the web than on the desktop. GLSL
//     drivers strip unused uniforms and moderngl's tryset() tolerates the
//     result; WebGPU validates against an explicit bind group layout, so a
//     uniform declared here but unused by an including shader is a hard
//     pipeline-creation error rather than a warning.
//
//  4. NO \`#version\` line here (WGSL has none) and no entry points. This file is
//     included into compute, vertex AND fragment modules, so it must stay
//     stage-agnostic: no texture sampling, no discard, no derivatives
//     (fwidth/dpdx). It currently has none of those -- keep it that way.
//
// SSBO BINDING ASSIGNMENTS (project-wide, keep in sync):
//     binding = 0   EntityBuffer
//     binding = 1   ConfigBuffer
// ============================================================================

const PI: f32 = 3.1415926;

// \`STRAFE_FIELD_GAIN\` USED TO LIVE HERE, at 0.01, as the fixed rate at which the
// painted field displaced a particle. It is now a UNIFORM, because the Walls
// Field Strength preference multiplies it -- so the host owns the number
// (\`FIELD_STRENGTH_GAIN\` in \`prefs/preferences.ts\`) and packs \`strength * 0.01\`
// into the entity update's uniform.
//
// Moved rather than kept alongside the slider: two multipliers, one here and one
// host-side, is exactly the "second multiplier for the user to get lost between"
// that the original comment ruled out. At the default strength of 1.0 the product
// is 0.01 and every painted field behaves precisely as it did before.

// ---------------------------------------------------------------------------
// CANVAS VALUE SCALE -- the canvas is RG16F (see CANVAS_DTYPE in
// particle_system.py), and fp16's usable range starts at ~6.1e-5. At high
// Trail Persistence the splat premultiply (1-P)/P shrinks each deposit to
// ~1e-6, which is SUBNORMAL in fp16: blend units flush it and trails starve
// (measured: 40x dimmer at P=0.999). All stored canvas values therefore ride
// 512x above their physical meaning: the splat multiplies by this, every READER
// divides by it. canvas decay/diffuse is linear and scale-invariant, so it
// neither knows nor cares.
//
// 512 is chosen with both ends in view: it lifts a slow particle's deposit at
// P = 0.999 (~3.6e-6) to ~1.8e-3 -- comfortably normal -- while the largest
// legitimate single splat (fast particle at the P clamp floor) stays around
// 1e4, under fp16's 65504 ceiling. Readers: get_can() in entity_update,
// camera. Writers: the trail deposit (entityUpdate.wgsl \`deposit\`, drained
// into the canvas by canvas.wgsl).
const CANVAS_VALUE_SCALE: f32 = 512.0;

// THE SPLAT ACCUMULATOR'S FIXED POINT. WGSL atomics are integer-only, so each
// deposit rides in an i32 at this many counts per (already scaled) canvas unit.
//
// 2^14 matches fp16 at both ends. One count is 2^-14, fp16's smallest normal,
// so the accumulator resolves exactly the deposits a blended fp16 splat could;
// and +-2^31 counts span +-2^17, twice fp16's 65504 ceiling, so a pile-up
// saturates in the canvas pass's CANVAS_VALUE_MAX clamp before it can wrap.
// The deposit range this has to hold is CANVAS_VALUE_SCALE's, above.
const SPLAT_FIXED_SCALE: f32 = 16384.0;

// Saturation ceiling for stored (scaled) canvas values, applied by the canvas
// pass on every write. NEEDED BECAUSE OF fp16: a texel pushed past 65504 rounds
// to inf, and inf survives decay forever (inf * P == inf) -- one extreme splat
// pile-up would permanently poison the texel and NaN any particle that senses
// it. Saturating below the ceiling lets even an absurd pile-up decay back down.
// fp32 never needed this; do not remove it while the canvas is fp16.
const CANVAS_VALUE_MAX: f32 = 60000.0;

// Trail Persistence's legal range inside the shaders. The FLOOR is well below
// the slider (0.5..0.999) and below every known config (observed min 0.312);
// it exists for typed-in extremes. It was 1e-4, but (1-P)/P at 1e-4 is ~1e4,
// which times CANVAS_VALUE_SCALE would overflow fp16 on a single splat --
// 1e-2 caps the premultiply at ~99 and costs nothing anyone uses.
// The deposit and the canvas pass MUST clamp with the same bounds, or the
// splat premultiply and the decay would disagree about what P means.
const TRAIL_PERSISTENCE_MIN: f32 = 1e-2;
const TRAIL_PERSISTENCE_MAX: f32 = 0.999;

// ---------------------------------------------------------------------------
// MODE ENUMS -- the single definition. ui/settings_spec.py mirrors these BY
// VALUE in its DROPDOWN_MODES tuples, so the order of the options there is the
// order here. Change one, change both.
// ---------------------------------------------------------------------------

// What happens when a particle reaches the edge of the world. A WorldData
// setting: the trail field follows the same rule, so it cannot vary per config.
const BC_BOUNCE: i32 = 0;
const BC_WRAP: i32 = 1;
const BC_RESET: i32 = 2;
// Leaving the world KILLS the particle rather than respawning it: it is marked
// dead and its index pushed onto the free list. The sand modality's default,
// and the worked example of the sinks system -- BC_RESET's sibling, differing
// only in what happens to the particle that crossed.
//
// ADDED AS A FOURTH VALUE rather than by redefining BC_RESET, so the studio's
// three modes keep their exact meanings. A config that has never heard of this
// mode cannot select it, and nothing in the studio writes a 3.
const BC_KILL: i32 = 3;

// How particles are placed on reset. A ConfigData setting: different
// populations can seed differently.
const IC_GRID: i32 = 0;
const IC_RANDOM: i32 = 1;
// No shader compares against IC_CENTER -- it is the fall-through \`else\` branch
// of initial_position() in entity_update. It stays defined because it is a real
// mode, mirrored by value in ui/settings_spec.py's dropdown. Do not drop it as
// dead code.
const IC_CENTER: i32 = 2;
const IC_RING: i32 = 3;

// ---------------------------------------------------------------------------
// Rule -- the Fourier Feature Network coefficients that define particle behavior
// ---------------------------------------------------------------------------

// 4D input -> 4D output basis element.
struct FourierCenter {
    frequency: vec4f,
    amplitude: vec4f,
}

// 10 FourierCenters makes a Rule. 320 bytes, all vec4.
//
// This is the only array in the layout, and it is the case that usually bites:
// std430's array-of-struct stride here is 32 bytes, and WGSL's
// array<FourierCenter,10> stride is also 32 (alignment 16, size 32 -- already a
// multiple). No stride divergence. common.wgsl.test.ts asserts it rather than
// trusting this comment.
struct Rule {
    centers: array<FourierCenter, 10>,
}

// ---------------------------------------------------------------------------
// ConfigData -- everything a particle needs to know about how to behave.
//
// This unifies what used to be two separate systems: the Rule (behavior) and
// the physics parameters. They live together now because they are the same
// kind of thing -- per-particle-population settings -- and separating them is
// what made the reference implementation's parameter handling sprawl.
//
// Lives in ConfigBuffer (binding 1). Each entity selects its ConfigData via
// its own config_index, so different particles can obey different configs.
// ---------------------------------------------------------------------------
struct ConfigData {
    rule: Rule,      // 320 B -- behavior coefficients
    sensor: vec4f,   // x: gain          y: angle       z: distance    w: mutation_scale
    force: vec4f,    // x: global_mult   y: drag        z: strafe      w: axial
    misc: vec4f,     // x: lateral       y: hazard_rate z: cohorts(i)  w: mutation_seed
    // The first four vec4s filled up (misc.w went to mutation_seed), so this is
    // the "add a whole new vec4" case rule 2 describes rather than a reclaimed
    // lane. Two spares here for the next additions.
    force2: vec4f,   // x: gravity_force y: gravity_strafe z: initial_conditions(i) w: cohort_fences(i)
    // force2 filled up the same way misc did, so this is another whole new
    // vec4 rather than a reclaimed lane. This one's zw were the last two spares
    // in the struct, and the sensor jitters claimed them -- rule 2's "claim a
    // reserved lane" case. THERE ARE NO SPARE LANES LEFT: the next addition
    // needs a whole new vec4.
    //
    // NAMED FOR BEING AN OVERFLOW LANE, NOT FOR A THEME -- like \`misc\` and
    // \`force2\` above it. It was called \`appearance\` while it held only the two
    // colour settings; the sensor jitters are physics, so that name had become
    // a lie about half its contents. A lane is a place four floats fit, not a
    // category, and pretending otherwise makes the next addition agonize over
    // whether it belongs. Read the per-lane comment, not the name.
    misc2: vec4f,  // x: color_sensitivity     y: color_by_cohort(i)
                   // z: sensor_angle_jitter   w: sensor_distance_jitter
    // misc2 had no spares left, so Radial Gravity is rule 2's "add a whole new
    // vec4" case again rather than a reclaimed lane. Gravity (Trails) then took
    // .y -- rule 2's "claim a reserved lane" case, as did Color Offset in .z
    // and Trail Weight in .w. No spares left.
    misc3: vec4f,  // x: radial_gravity(i)     y: gravity_trails
                   // z: color_offset          w: trail_weight
    // misc3 had no spares left, so the evolver's SECOND mutation voice is rule
    // 2's "add a whole new vec4" case. RUNTIME ONLY: never saved, always 0 in
    // a loaded state, so every saved state packs and behaves exactly as before.
    // Breathe mode's Orbit overlaps two breaths, and the fading one rides here.
    misc4: vec4f,  // x: mutation_scale_2      y: mutation_seed_2
                   // z: reserved              w: reserved
}  // 432 bytes

fn cfg_sensor_gain(c: ConfigData) -> f32     { return c.sensor.x; }
fn cfg_sensor_angle(c: ConfigData) -> f32    { return c.sensor.y; }
fn cfg_sensor_distance(c: ConfigData) -> f32 { return c.sensor.z; }
fn cfg_mutation_scale(c: ConfigData) -> f32  { return c.sensor.w; }

fn cfg_global_force_mult(c: ConfigData) -> f32 { return c.force.x; }
fn cfg_drag(c: ConfigData) -> f32              { return c.force.y; }
fn cfg_strafe_power(c: ConfigData) -> f32      { return c.force.z; }
fn cfg_axial_force(c: ConfigData) -> f32       { return c.force.w; }

fn cfg_lateral_force(c: ConfigData) -> f32 { return c.misc.x; }
fn cfg_hazard_rate(c: ConfigData) -> f32   { return c.misc.y; }
fn cfg_cohorts(c: ConfigData) -> i32       { return bitcast<i32>(c.misc.z); }
// Which random variation the rule mutation uses. Per-config rather than a
// uniform, so different particle populations can mutate differently.
fn cfg_mutation_seed(c: ConfigData) -> f32 { return c.misc.w; }
// A second, independent mutation layered on the first (evolver Orbit only).
// Scale 0 = absent. The seed is always used in stable mode (see mutate_rule).
fn cfg_mutation_scale_2(c: ConfigData) -> f32 { return c.misc4.x; }
fn cfg_mutation_seed_2(c: ConfigData) -> f32  { return c.misc4.y; }

// Uniform pull on the whole population, in the two motion channels the rest of
// the physics uses: _force feeds velocity, _strafe displaces position directly.
// Both are LINEAR -1..1 controls -- run them through gravity_expand() before
// use, never apply them raw.
fn cfg_gravity_force(c: ConfigData) -> f32  { return c.force2.x; }
fn cfg_gravity_strafe(c: ConfigData) -> f32 { return c.force2.y; }

// How this population is arranged on reset -- one of the IC_* modes above.
fn cfg_initial_conditions(c: ConfigData) -> i32 { return bitcast<i32>(c.force2.z); }
// Whether each particle is held near its own spawn point. ON/OFF ONLY: the
// fence RADIUS is derived from the grid cell size rather than stored, so
// cohorts just barely touch at any cohort count -- see the fence block in
// entity_update, which also explains why it applies to IC_GRID alone.
fn cfg_cohort_fences(c: ConfigData) -> bool { return bitcast<i32>(c.force2.w) != 0; }

// How strongly the brain's colour signal swings the hue. Read by the PARTICLE
// CAMERA, not by the physics -- entity_update only decides what raw signal to
// store, so this can be dragged without disturbing the simulation.
//
// NO SHADER CALLS THIS. The camera does not read the config buffer (rule 3);
// the value reaches cam_brush as a loose uniform instead. This accessor is the
// record of which lane holds it -- keep it.
fn cfg_color_sensitivity(c: ConfigData) -> f32 { return c.misc2.x; }
// Colour each population flat by its cohort instead of by its brain's output.
// A DISPLAY choice, read by the particle camera -- entity_update transmits both
// signals (col_params.x is the brain, .y the cohort) and picks neither, so this
// takes effect immediately, even while the simulation is paused.
//
// Also uncalled by any shader, for the same reason as cfg_color_sensitivity.
fn cfg_color_by_cohort(c: ConfigData) -> bool { return bitcast<i32>(c.misc2.y) != 0; }

// WHERE THIS POPULATION'S HUE SITS BEFORE THE SIGNAL MOVES IT. Sensitivity is
// the coefficient A and this is the bias B in \`hue = A * signal + B\`, so a
// config can be tuned to a corner of the wheel and its signal read as variation
// WITHIN that colour rather than across the whole spectrum.
//
// 0..1 spans the wheel exactly once. Hue is periodic, so the ends meet and no
// wrapping is needed anywhere -- see the fragment stage in cam_brush.
//
// IN A DIFFERENT LANE FROM cfg_color_sensitivity, which it belongs beside by
// meaning. misc2 was full; this is rule 2's "claim a reserved lane" case in
// misc3 rather than a fourth vec4 for one float. The accessors are written
// together here because that is where a reader looks for them -- the lane a
// value lives in is an allocation detail, which is exactly what the misc2
// comment above says.
//
// Uncalled by any shader, like the two above: the camera does not read the
// config buffer (rule 3), so this reaches cam_brush through the swatch table on
// its own uniform. The accessor is the record of which lane holds it.
fn cfg_color_offset(c: ConfigData) -> f32 { return c.misc3.z; }

// Random wobble added to each sensor reading, resampled EVERY PHYSICS STEP --
// a shimmer, not a fixed per-particle trait. Both are 0..1 controls scaled so
// that 1.0 spans the whole range of the parameter they perturb: angle covers
// its own -1..1 slider directly, distance covers SENSOR_DISTANCE_SPAN below.
// Applied in entity_update; 0 is off.
fn cfg_sensor_angle_jitter(c: ConfigData) -> f32    { return c.misc2.z; }
fn cfg_sensor_distance_jitter(c: ConfigData) -> f32 { return c.misc2.w; }

// Which direction the two gravity channels above pull in. False (the default,
// and what every config written before this existed means) is the fixed
// vec2(0,1) screen-down pull; true swings it to the particle's own position
// vector, so positive values fall inwards towards the origin and negative
// values blow outwards. Lives in misc3 rather than beside the gravity values
// because force2 and misc2 were both full -- read the lane comment, not the
// name.
fn cfg_radial_gravity(c: ConfigData) -> bool { return bitcast<i32>(c.misc3.x) != 0; }

// THE THIRD GRAVITY CHANNEL, and the only one that is not a motion.
//
// Force and Strafe above move the particle. This one moves what the particle
// BELIEVES: it is a constant bias added to every canvas sensor reading, in
// exactly the manner the user-drawn trails layer is added (see \`get_can\` in
// entityUpdate.wgsl). Nothing is pushed -- particles are told there is a trail
// downhill, and each rule decides for itself what to do about that. A rule that
// chases trails falls; a rule that avoids them rises. So unlike the other two,
// this channel's SIGN IS NOT ITS DIRECTION, and it does nothing whatsoever to a
// population whose rule ignores the sensors.
//
// LINEAR -1..1 like its siblings, expanded by the same gravity_expand() -- one
// curve for all three, so the feel of the three sliders matches.
fn cfg_gravity_trails(c: ConfigData) -> f32 { return c.misc3.y; }

// TRAIL WEIGHT: how heavily a config's trails count against OTHER configs'.
// Its deposits are multiplied by it and its reads of the swarm's trails divided
// by it (both in entityUpdate.wgsl), so a config alone is unaffected at any
// weight. Negative lays trails that point backwards, to everyone else.
//
// THE FLOOR IS LOAD-BEARING: reads divide by this. A stored value inside
// +-TRAIL_WEIGHT_MIN -- a hand-edited file, a typed 0 -- is pushed out to the
// floor on its own side, zero counting as positive. Mirrored by value in
// \`particleSystem/config.ts\` and pinned by a test.
const TRAIL_WEIGHT_MIN: f32 = 0.02;
fn cfg_trail_weight(c: ConfigData) -> f32 {
    let w = c.misc3.w;
    if (abs(w) >= TRAIL_WEIGHT_MIN) { return w; }
    return select(TRAIL_WEIGHT_MIN, -TRAIL_WEIGHT_MIN, w < 0.0);
}

// The width of the Sensor Distance slider (0..5), which is what a distance
// jitter of 1.0 spans. It lives here rather than being read from the slider
// bounds because the shader has no access to those -- MUST MATCH the \`hi\` of
// the sensor_distance entry in ui/settings_spec.py.
const SENSOR_DISTANCE_SPAN: f32 = 5.0;

// The speed below which a particle is considered STALLED and is given a random
// heading. See the rescue block in entityUpdate.wgsl for why one is needed: a
// particle's heading is its velocity, so at exactly zero it has no direction,
// its sensors collapse onto each other, and nothing can ever restore it.
//
// 5e-5 is \`reset()\`'s own spawn magnitude -- the number this codebase already
// picked for "slow, but moving enough to have a direction". Using the same value
// makes a rescued particle indistinguishable from a freshly reset one.
//
// A FLOOR, NOT AN EPSILON. It is deliberately far above fp32's denormal range:
// the failure is not underflow to exactly zero, it is a velocity too small for
// \`sample_dist\` to place the sensors on different texels, which happens long
// before the bits run out.
const MIN_VELOCITY: f32 = 5e-5;

// ---------------------------------------------------------------------------
// WorldData -- settings that are properties of the world, not of a particle.
//
// Set as a uniform, never per-entity. If a setting would be meaningless to
// vary between two particles sharing a canvas (trail decay, world scale), it
// belongs here rather than in ConfigData.
// ---------------------------------------------------------------------------
struct WorldData {
    trail: vec4f,  // x: persistence  y: diffusion  z: sqrt_world_size  w: config_count(i)
    // trail filled up, so this is rule 2's "add a whole new vec4" case.
    bounds: vec4f, // x: boundary_conditions(i)   yzw: reserved
}

fn world_trail_persistence(w: WorldData) -> f32 { return w.trail.x; }
fn world_trail_diffusion(w: WorldData) -> f32   { return w.trail.y; }
fn world_sqrt_world_size(w: WorldData) -> f32   { return w.trail.z; }
fn world_config_count(w: WorldData) -> i32      { return bitcast<i32>(w.trail.w); }

// What happens at the edge of the world -- one of the BC_* modes above. A
// world property rather than a per-config one: the trail field has to obey the
// same boundary as the particles do, and there is only one trail field.
fn world_boundary_conditions(w: WorldData) -> i32 { return bitcast<i32>(w.bounds.x); }

// ---------------------------------------------------------------------------
// Entity -- one particle. 32 bytes, 16-byte aligned.
//
// Lives in EntityBuffer (binding 0). Mirrored by no one: every shader that
// touches entities includes this file.
// ---------------------------------------------------------------------------
struct Entity {
    pos_vel: vec4f,  // xy: pos    zw: vel
    misc: vec4f,     // x: size    y: config_index(i)    zw: col_params
}

fn e_pos(e: Entity) -> vec2f          { return e.pos_vel.xy; }
fn e_vel(e: Entity) -> vec2f          { return e.pos_vel.zw; }
fn e_size(e: Entity) -> f32           { return e.misc.x; }
fn e_config_index(e: Entity) -> i32   { return bitcast<i32>(e.misc.y); }

// ---------------------------------------------------------------------------
// LIFETIME -- a negative config_index means the particle is DEAD.
//
// NO LAYOUT CHANGE. Entity is full at 32 bytes and every lane is spoken for, so
// a dead FLAG would have meant widening the struct and editing
// layout.fixture.json in lockstep. It is not needed: config_index is already an
// i32 riding a float lane, and no real config index is ever negative -- so the
// sign bit was free the whole time.
//
// EVERY READER MUST TEST THIS BEFORE THE CONFIG LOOKUP. \`entityUpdate\` clamps
// config_index into range (\`clamp(idx, 0, count-1)\`), which would quietly turn
// a dead particle into a config-0 particle rather than skipping it. The clamp is
// correct for its own purpose -- it makes a SHRUNK ConfigBuffer degrade
// gracefully -- so the dead test goes above it rather than replacing it.
//
// The studio produces these only through BC_KILL, and its reset frame brings
// them back (see the dead-particle note in entityUpdate's \`main\`).
// ---------------------------------------------------------------------------
// \`make_entity_dead\` is NOT here: it calls make_entity, which is declared below,
// and WGSL requires declaration before use. It sits under that function instead.
const DEAD_CONFIG: i32 = -1;

fn e_is_dead(e: Entity) -> bool { return e_config_index(e) < 0; }

// RAW OUTPUT FROM THE PARTICLE'S BRAIN, kept for rendering rather than physics.
// entity_update writes these; the particle camera turns them into a hue.
//
// .x is a raw force term from the black box -- deliberately arbitrary, tuned by
// eye, so nothing downstream should read meaning into its scale.
// .y is the particle's COHORT INDEX, which cam_brush reads when Color By
// Cohort is on.
//
// The RENDERER decides what these look like. Storing the raw signals instead of
// a finished hue is what lets Color Sensitivity be dragged without re-running
// the simulation, which is where the reference put it.
fn e_col_params(e: Entity) -> vec2f { return e.misc.zw; }

fn make_entity(pos: vec2f, vel: vec2f, size: f32, config_index: i32,
               col_params: vec2f) -> Entity {
    return Entity(vec4f(pos, vel),
                  vec4f(size, bitcast<f32>(config_index), col_params));
}

// Same, for the paths that have no colour signal to offer -- reset() runs
// before any behaviour is computed. Zero is a valid hue, so this is not a
// sentinel; the entity simply gets its colour on the next real step.
//
// RENAMED from the GLSL, which overloads \`make_entity\` on arity -- WGSL has no
// function overloading. The delegation is kept: this is the 5-arg form with a
// zero colour, not a second implementation.
fn make_entity_reset(pos: vec2f, vel: vec2f, size: f32,
                     config_index: i32) -> Entity {
    return make_entity(pos, vel, size, config_index, vec2f(0.0));
}

// A DEAD particle -- see the lifetime block above \`e_is_dead\`.
//
// Everything is zeroed rather than left stale: a readback of the buffer stays
// legible, and nothing downstream can be fooled by a plausible-looking position
// on a particle that is not there. A size of 0 means that even a consumer which
// somehow skipped the dead test would draw a zero-area sprite.
//
// DECLARED HERE, not beside e_is_dead, because it calls make_entity above and
// WGSL requires declaration before use.
fn make_entity_dead() -> Entity {
    return make_entity(vec2f(0.0), vec2f(0.0), 0.0, DEAD_CONFIG, vec2f(0.0));
}

// ---------------------------------------------------------------------------
// COORDINATE CONVENTION -- the one canonical implementation.
//
// World space is AREA-PRESERVING. With ca = canvas_res.x / canvas_res.y:
//
//     world = [-sqrt(ca), +sqrt(ca)]  x  [-1/sqrt(ca), +1/sqrt(ca)]
//
// so the world always has area 4 regardless of canvas aspect, and a circle in
// world space stays a circle on screen. On a square canvas ca == 1 and this
// reduces exactly to the familiar [-1,1] x [-1,1].
//
// NO OTHER FILE MAY WRITE ASPECT-RATIO MATH. Every world<->uv<->ndc
// conversion goes through the functions below (and their TypeScript mirrors in
// src/particleSystem/coords.ts). The reference implementation had six divergent
// copies of this math, at least one of which contradicted the others; that is
// the specific failure this rule exists to prevent.
//
// THE WORLD IS A TORUS ONLY IN BC_WRAP. The boundary mode decides the world's
// topology, so anything that crosses an edge must ask: world_wrap for wrap,
// world_bounce for bounce, and world_to_uv_bc for every texture read.
//
// SEVERAL FUNCTIONS BELOW HAVE NO EXTERNAL CALLER. world_half_extent,
// world_to_uv, uv_to_world, edge_fold, letterbox_scale and screen_ndc_to_world
// are each an internal composition step of one that does. They are load-bearing,
// not dead. WGSL does not warn about unused module-scope functions.
// ---------------------------------------------------------------------------

// Half-extent of world space on each axis, from canvas aspect ca = res.x/res.y.
fn world_half_extent(ca: f32) -> vec2f {
    let s = sqrt(ca);
    return vec2f(s, 1.0 / s);
}

fn world_half_extent_from_res(canvas_res: vec2f) -> vec2f {
    return world_half_extent(canvas_res.x / canvas_res.y);
}

// Scale a uv-space delta into the aspect-corrected metric -- literally
// world_half_extent applied as a scale, which is why it lives here rather than
// being its own piece of aspect math. World space is area-preserving, so a raw
// uv delta is anisotropic on a non-square canvas; brushes measured in this
// metric stay circular, and a ring drawn in it matches the brush that paints
// in it. Used by strafe_draw (painting) and frame_assembly (the reticle that
// must agree with it).
fn aspect_correct_uv(d: vec2f, canvas_res: vec2f) -> vec2f {
    return d * world_half_extent_from_res(canvas_res);
}

// World -> texture uv [0,1]. In BC_WRAP the canvas textures are sampled with a
// repeating sampler and the sampler does the wrapping, so uv is deliberately
// left unclamped. Every other boundary mode must go through world_to_uv_bc.
fn world_to_uv(p: vec2f, canvas_res: vec2f) -> vec2f {
    return p / (2.0 * world_half_extent_from_res(canvas_res)) + 0.5;
}

// World -> texture uv, honoring the boundary mode. Only BC_WRAP leaves uv free
// for the sampler's repeat to handle; the others clamp, so a sensor reaching
// past the edge reads the edge rather than the far side of the world.
fn world_to_uv_bc(p: vec2f, canvas_res: vec2f, bc: i32) -> vec2f {
    let uv = world_to_uv(p, canvas_res);
    // select(false_value, true_value, condition) -- the argument order is the
    // reverse of GLSL's \`cond ? a : b\`.
    return select(clamp(uv, vec2f(0.0), vec2f(1.0)), uv, bc == BC_WRAP);
}

fn uv_to_world(uv: vec2f, canvas_res: vec2f) -> vec2f {
    return (uv - 0.5) * 2.0 * world_half_extent_from_res(canvas_res);
}

// The corner of an instanced quad, in TRIANGLE-STRIP order, as a 0..1 uv:
// (0,0) (1,0) (0,1) (1,1) for vertex_id 0..3. The matching offset from the quad
// centre is \`(strip_corner(v) * 2.0 - 1.0) * half_size\`, which pairs uv and
// corner by construction -- they are the same value.
//
// ARITHMETIC, NOT A LOOKUP TABLE, and that is the reason this exists. The
// per-particle sprite shaders (camBrush.wgsl; the brush pass before it became
// a point splat) used \`var offsets = array<vec2f, 4>(...)\` indexed by vertex_id.
// A local array indexed by a non-constant is spilled to per-thread scratch
// memory by the browser's shader compilers (the same trap that made
// entityUpdate's by-value Rule so slow), and a sprite shader runs four times
// per particle. Do not turn this back into a table.
//
// Strip, not fan: WebGPU has no triangle-fan, and a strip over the desktop's
// fan order (brush.vert:25-36) draws a bowtie.
fn strip_corner(vertex_id: u32) -> vec2f {
    return vec2f(f32(vertex_id & 1u), f32(vertex_id >> 1u));
}

// World -> normalized device coords [-1,1] for rasterizing into the canvas.
fn world_to_ndc(p: vec2f, canvas_res: vec2f) -> vec2f {
    return p / world_half_extent_from_res(canvas_res);
}

// Wrap a world position into the world bounds. BC_WRAP only -- the world is a
// torus in that mode alone.
//
// DO NOT REWRITE fract() AS \`%\`. \`p\` here is freely signed (a world position
// past either edge), so \`p / size - 0.5\` is routinely negative, and WGSL's \`%\`
// is truncated where this needs floored behaviour. WGSL defines fract(x) as
// \`x - floor(x)\`, identical to GLSL, so it translates verbatim and correctly --
// the \`%\` "cleanup" would break wrap for every particle leaving the left or
// bottom edge.
fn world_wrap(p: vec2f, canvas_res: vec2f) -> vec2f {
    let extent = world_half_extent_from_res(canvas_res);
    let size = 2.0 * extent;
    return size * (fract(p / size - 0.5) - 0.5);
}

// Reflect a coordinate given in edge units back into [-1,1]. A triangle wave,
// so it is correct for ARBITRARY overshoot. The reference's single-fold version
// (sign(x)*(1-abs(1-abs(x)))) silently teleported a particle to the far side
// once it passed 2x the edge in one step, which heavy gravity reaches.
//
// GLSL's mod() is floored and WGSL's \`%\` is truncated, so they are NOT
// interchangeable in general. They agree here because the dividend is abs(x),
// non-negative BY CONSTRUCTION rather than by caller convention, and the
// divisor is a positive literal. That is what makes \`%\` safe -- if the abs()
// ever goes away, this needs a floored mod again.
fn edge_fold(x: f32) -> f32 {
    let t = abs(x) % 2.0;
    return sign(x) * (1.0 - abs(1.0 - t));
}

// What world_bounce returns. GLSL passed p and v as \`inout\`; WGSL has no
// inout, so the pair comes back as a struct. (A ptr<function, vec2f> parameter
// would also work, but a return struct reads better at the one call site.)
struct BounceResult {
    pos: vec2f,
    vel: vec2f,
}

// Reflect a position off the world bounds, flipping the velocity components
// that crossed. Position and velocity move together: reflecting the position
// without reversing the velocity would just re-trigger the bounce every frame,
// pinning the particle to the wall.
//
// THE ORDER BELOW IS LOAD-BEARING: the velocity flips are decided against the
// PRE-FOLD position, and only then is the position folded. Computing the folded
// position first and testing that would silently change the exact-boundary case.
fn world_bounce(p: vec2f, v: vec2f, canvas_res: vec2f) -> BounceResult {
    let extent = world_half_extent_from_res(canvas_res);
    var vel = v;
    if (abs(p.x) > extent.x) { vel.x = -vel.x; }
    if (abs(p.y) > extent.y) { vel.y = -vel.y; }
    let pos = vec2f(edge_fold(p.x / extent.x), edge_fold(p.y / extent.y)) * extent;
    return BounceResult(pos, vel);
}

// ---------------------------------------------------------------------------
// THE VIEW TRANSFORM -- world to screen, through camera and letterbox.
//
//     world  --/half_extent-->  canvas ndc
//            --(-pan, *zoom)->  view ndc
//            --*letterbox---->  screen ndc [-1,1]
//
// THREE INDEPENDENT ASPECT QUANTITIES, never conflate them:
//   canvas_res  simulation texture size; defines world space
//   window_res  framebuffer size in pixels; changes on resize
//   letterbox   derived fit of one into the other; never stored
//
// ZOOM: bigger = zoomed IN (a magnification factor). zoom=1 fits the world.
// PAN:  world units. pan is the world point at the center of the view.
// ---------------------------------------------------------------------------

// Scale fitting the canvas box into the window, preserving shape. The axis
// that would overflow shrinks; the other stays 1.0, and the slack is the
// letterbox bar. Fit, not fill: the whole canvas is always visible.
fn letterbox_scale(canvas_res: vec2f, window_res: vec2f) -> vec2f {
    if (window_res.x <= 0.0 || window_res.y <= 0.0) { return vec2f(1.0); }
    let canvas_aspect = canvas_res.x / canvas_res.y;
    let window_aspect = window_res.x / window_res.y;
    return select(
        vec2f(1.0, window_aspect / canvas_aspect),  // bars top/bottom
        vec2f(canvas_aspect / window_aspect, 1.0),  // bars left/right
        window_aspect > canvas_aspect);
}

fn world_to_screen_ndc(p: vec2f, canvas_res: vec2f, window_res: vec2f,
                       pan: vec2f, zoom: f32) -> vec2f {
    let ndc = world_to_ndc(p - pan, canvas_res) * zoom;
    return ndc * letterbox_scale(canvas_res, window_res);
}

fn screen_ndc_to_world(ndc: vec2f, canvas_res: vec2f, window_res: vec2f,
                       pan: vec2f, zoom: f32) -> vec2f {
    var v = ndc / letterbox_scale(canvas_res, window_res);
    if (zoom != 0.0) { v /= zoom; }
    return uv_to_world(v * 0.5 + 0.5, canvas_res) + pan;
}

// Screen ndc -> canvas uv, for the present pass sampling the canvas texture.
// Values outside [0,1] fall in the letterbox bars; the caller decides whether
// to clamp, wrap (tiling) or paint them black.
fn screen_ndc_to_canvas_uv(ndc: vec2f, canvas_res: vec2f, window_res: vec2f,
                           pan: vec2f, zoom: f32) -> vec2f {
    return world_to_uv(
        screen_ndc_to_world(ndc, canvas_res, window_res, pan, zoom),
        canvas_res);
}

// ==== end include: common.wgsl ====
// ==== begin include: fullscreenQuad.wgsl ====
// The fullscreen quad, shared by every pass that covers the screen.
//
// The desktop's \`shared/shaders/fullscreen_quad.vert\` is shared across five
// consumers; this is that file. Consumers here:
//
//   camera/shaders/camera.wgsl              TRAIL present
//   camera/shaders/accumulate.wgsl          motion blur accumulation
//   assembler/shaders/bloomDownsample.wgsl  the mip chain, down
//   assembler/shaders/bloomUpsample.wgsl    the mip chain, up
//   assembler/shaders/frameAssembly.wgsl    bloom, tone curve, overlays
//   webcam/shaders/cameraPreview.wgsl       the Camera tab's thumbnail
//   webcam/shaders/camera{Ingest,Blur,Map}.wgsl -- the VERTEX only. They render
//                                           into textures the particles sample,
//                                           so they index by @builtin(position)
//                                           and ignore \`uv\`; see cameraIngest.
//
// NOT a consumer: \`particleSystem/shaders/canvas.wgsl\`. It needs the V FLIP
// (see its header) because it rasterizes into the canvas texture and every
// fragment must read the texel it is about to write; every consumer above needs
// NO flip. Merging the two behind a boolean parameter would put the single most
// dangerous decision in this port -- the one Step 4 lost the most time to --
// behind an argument that is easy to pass wrong and impossible to see in a
// diff. Two small definitions, each unconditionally correct, is the right shape.
//
// WHY NOT IN common.wgsl. That file declares no bindings and must stay
// stage-agnostic (its own editing rules 3 and 4), and a \`@vertex\` entry point
// is the opposite of stage-agnostic. It is also parsed by \`common.wgsl.test.ts\`
// against the generated layout descriptor, so unrelated additions there are
// noise in a file whose job is struct layout.
//
// NO VERTEX BUFFER. The quad comes from \`@builtin(vertex_index)\`, so there is
// nothing to allocate, bind or keep in sync. Drawn as \`draw(4)\` with
// \`topology: 'triangle-strip'\` -- TRIANGLE_FAN is not a WebGPU topology, which
// is why the corner order below is strip order rather than the desktop's fan.

struct FsQuadVsOut {
    @builtin(position) clip : vec4f,
    @location(0) uv : vec2f,
}

// Strip order: (-,-) (+,-) (-,+) (+,+). The same order \`canvas.wgsl\` and the
// deleted \`debugPresent.wgsl\` use, so all four agree by inspection.
fn fullscreen_corner(vi: u32) -> vec2f {
    var corners = array<vec2f, 4>(
        vec2f(-1.0, -1.0),
        vec2f( 1.0, -1.0),
        vec2f(-1.0,  1.0),
        vec2f( 1.0,  1.0),
    );
    return corners[vi];
}

// NO Y FLIP, for every consumer of this entry point.
//
// The canvas texture is stored TOP-LEFT-ORIGIN: the trail deposit
// (entityUpdate.wgsl) writes each pixel at the texture row \`get_can\` samples,
// and canvas.wgsl flips v to read back the texel it writes, so the stored image
// matches WebGPU's framebuffer convention. Sampling it straight therefore puts
// world +y at the top of the screen, matching the desktop. See \`web/README.md\`'s
// Y-flip section.
//
// The intermediate targets (hdr, accum, the bloom mips) are all WRITTEN by
// passes using this entry point and READ by passes using this entry point, so
// they are internally consistent whatever convention is chosen -- the only
// externally observable flips are \`camera.wgsl\` reading the canvas and
// \`frameAssembly.wgsl\` reading the strafe field, and both want none.
@vertex
fn fullscreen_vs(@builtin(vertex_index) vi : u32) -> FsQuadVsOut {
    let p = fullscreen_corner(vi);
    var out : FsQuadVsOut;
    out.clip = vec4f(p, 0.0, 1.0);
    out.uv = p * 0.5 + 0.5;
    return out;
}

// ==== end include: fullscreenQuad.wgsl ====

struct FrameAssemblyUniforms {
    canvas_res : vec4f,   // xy: canvas size   zw: window size
    camera     : vec4f,   // xy: pan   z: zoom   w: reserved
    // x: bloom_intensity   y: brightness   z: tonemap_softness   w: field_opacity
    tone       : vec4f,
    // xy: center (canvas uv)   z: radius   w: draw angle (the \`fixed\` arrow)
    reticle    : vec4f,
    // x: reticle_style(i)   y: trails_opacity   z: line_enable
    // w: source_flipped -- see \`fs_main\`'s source read
    flags      : vec4f,
    // xy: crop half-extent as a fraction of the window   z: enable
    // w: how far the surround is dimmed, 0..1
    crop       : vec4f,
    // xy: uv scale   zw: uv offset. The identity (1,1,0,0) on the screen pass;
    // the crop sub-rect on the recording pass. See \`fs_main\`'s first statement.
    capture    : vec4f,
    // xy: the line tool's anchor   zw: the cursor. Both in canvas uv. Gated by
    // \`flags.z\`, NOT by being non-zero: a zero-length segment is a legitimate
    // preview on the frame the line arms.
    line       : vec4f,
}

@group(0) @binding(0) var<uniform> u : FrameAssemblyUniforms;

// group 1 is the TEXTURES, which change identity on resize and when bloom is
// toggled. Splitting them from the uniform means the uniform is bound once.
@group(1) @binding(0) var source : texture_2d<f32>;        // accumulated camera frame, linear HDR
@group(1) @binding(1) var bloom_tex : texture_2d<f32>;     // half-res bloom. A 1x1 dummy when off
@group(1) @binding(2) var strafe_field : texture_2d<f32>;  // painted vector field. A 1x1 dummy until Step 9
@group(1) @binding(3) var tex_sampler : sampler;

fn reticle_style() -> i32 { return bitcast<i32>(u.flags.x); }
fn trails_opacity() -> f32 { return u.flags.y; }
fn line_enabled() -> bool { return u.flags.z > 0.0; }
fn source_flipped() -> bool { return u.flags.w > 0.0; }
fn draw_angle() -> f32 { return u.reticle.w; }

// Reticle styles. MUST match \`RETICLE_STYLES\` in \`assemblerUniforms.ts\`, whose
// array order IS this numbering.
const RETICLE_PLAIN  : i32 = 0;
const RETICLE_DASHED : i32 = 1;
const RETICLE_OUT    : i32 = 2;
const RETICLE_IN     : i32 = 3;
const RETICLE_FIXED  : i32 = 4;

// Turns the field's small magnitudes into visible grey. A default stroke peaks
// near 0.06 (0.01 * draw_power/5 / draw_size), so this puts a typical stroke
// high on the saturating curve without a heavy one clipping flat.
const FIELD_OVERLAY_GAIN: f32 = 40.0;

// Reticle line width, in pixels. Converted to uv via fwidth, so the ring stays
// this thick on screen at any zoom.
const RETICLE_WIDTH_PX: f32 = 1.5;

// Dashed-ring geometry. A FIXED NUMBER OF DASHES around the circumference
// rather than a fixed dash length: the ring changes size with the brush and
// with zoom, and a fixed length would collapse into a dotted blur on a small
// brush and stretch into near-solid arcs on a big one. A fixed count keeps the
// pattern recognisable at every size, which is the entire job here -- it has to
// read as "dashed, therefore Shove" at a glance.
const RETICLE_DASH_COUNT: f32 = 16.0;
// Fraction of each dash cell that is drawn, so the gap is 1 - this. Tuned by
// eye: enough gap to read as deliberately dashed, but small enough that the
// ring still reads as a circle whose radius you can judge.
const RETICLE_DASH_DUTY: f32 = 0.6625;

// Crop box border width, in pixels. Converted via fwidth like the reticle's, so
// the rule stays this thick on screen whatever the window size.
const CROP_BORDER_PX: f32 = 1.0;

// How many rays the In and Out reticles carry, and how long they are.
//
// Eight is enough to read as "radiating" at a glance without the rays merging
// into a solid annulus on a small brush. The length is a FRACTION OF THE RADIUS
// rather than a fixed distance, so the decoration scales with the ring instead of
// swamping a small brush and vanishing on a large one.
const RETICLE_RAY_COUNT: f32 = 8.0;
const RETICLE_RAY_LENGTH: f32 = 1.0 / 6.0;

// The \`fixed\` arrow: one ray with a head, at the Draw Angle.
const RETICLE_ARROW_LENGTH: f32 = 1.0 / 6.0;
// The barbs' length, as a fraction of the RADIUS, so the head scales with the
// ring. Deliberately more than half the shaft's own length: a head shorter than
// that reads as a thickening rather than as an arrow at the default brush size.
const RETICLE_ARROW_HEAD: f32 = 0.10;

// The line tool's preview, drawn at half opacity: it is a proposal, not a mark.
const LINE_PREVIEW_ALPHA: f32 = 0.5;

// hsv2rgb, for the TRAILS overlay's direction colouring. The same function
// \`camera.wgsl:35\` carries, and deliberately the same one: the trails layer is
// colourized by exactly the formula the Trail Map View uses on the canvas, so a
// painted trail and a simulated one at the same angle are the same colour.
fn hsv2rgb(c: vec3f) -> vec3f {
    let p = abs(fract(c.xxx + vec3f(1.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - vec3f(3.0));
    return c.z * mix(vec3f(1.0), clamp(p - vec3f(1.0), vec3f(0.0), vec3f(1.0)), c.y);
}

// Distance from \`p\` to the segment a->b, in whatever metric the caller passes in.
// The line preview's capsule, and the same shape \`strafeDraw.wgsl\` paints along --
// which is what makes the preview show the stroke's real footprint rather than an
// approximation of it.
fn dist_to_segment(p: vec2f, a: vec2f, b: vec2f) -> f32 {
    let pa = p - a;
    let ba = b - a;
    let denom = dot(ba, ba);
    // denom == 0 while the line is armed but the cursor has not moved. h = 0 then,
    // which degenerates to a point -- the correct preview for a zero-length line.
    // \`var\` + \`if\`, not select(): the discarded arm divides by zero.
    var h = 0.0;
    if (denom > 0.0) {
        h = clamp(dot(pa, ba) / denom, 0.0, 1.0);
    }
    return length(pa - ba * h);
}

// asinh is NOT a WGSL builtin. asinh(x) = log(x + sqrt(x*x + 1)).
//
// The argument here is \`len * softness\` -- a vector length and a preference the
// host clamps to >= 0 -- so it is non-negative, the sqrt argument is >= 1 and
// the log argument is >= 1. No domain hazard, and no need for the
// sign-preserving form. DO NOT copy this helper somewhere it might see a
// negative input without restoring the \`sign(x) *\` factor.
fn asinh_f32(x: f32) -> f32 {
    return log(x + sqrt(x * x + 1.0));
}

@fragment
fn fs_main(in: FsQuadVsOut) -> @location(0) vec4f {
    // THE CAPTURE REMAP, and it is the first thing that happens because
    // EVERYTHING downstream must agree about which part of the image this
    // fragment is.
    //
    // On the screen pass \`capture_scale\` is 1 and \`capture_offset\` is 0, so this
    // is the identity and costs a multiply-add. On the RECORDING pass they
    // describe the crop box, and this maps the recording's full-frame quad onto
    // that sub-rectangle of the source -- which is what makes the exported
    // pixels the interior of the box, 1:1 at native resolution, with no
    // upscaling and no second render of the world.
    //
    // The remapped uv then feeds the source sample AND the overlay transform
    // below, which is the point of doing it once here: a crop that moved the
    // image without moving the field overlay would put the painted field in the
    // wrong place in the exported video, and only in the exported video.
    let uv = in.uv * u.capture.xy + u.capture.zw;

    // THE SOURCE IS UPSIDE DOWN when the camera presents its HDR target
    // directly (a one-sample frame, \`Camera.direct\`). Every \`fullscreen_vs\`
    // pass reads its input at an unflipped uv and so mirrors it vertically, and
    // the accumulate pass is one of those -- skipping it skips a mirror. Flipped
    // AFTER the capture remap: the crop rect is described in the accumulator's
    // orientation, and in the HDR target that same content sits at 1 - y.
    let source_uv = select(uv, vec2f(uv.x, 1.0 - uv.y), source_flipped());
    var color = textureSampleLevel(source, tex_sampler, source_uv, 0.0).rgb;

    // -- bloom, added in linear space where adding light is meaningful --
    // The intensity carries the on/off switch (assembler.py:102-109): at zero
    // the fetch is skipped, so the 1x1 dummy bound in that case is never read.
    //
    // **THE BLOOM READ IS Y-FLIPPED, and nothing else here is.** The mip chain
    // is both written and read by \`fullscreen_vs\` consumers, so it is internally
    // consistent whatever convention it picked -- but that convention is the
    // opposite of \`source\`'s, and the two only ever meet HERE. So the flip
    // belongs at this one boundary, on the bloom fetch alone.
    //
    // DO NOT "fix" this in \`fullscreenQuad.wgsl\` instead: that quad is shared
    // with the camera present and accumulate passes, its header commits to "NO
    // Y FLIP, for every consumer", and two shader tests assert the absence of a
    // flip there. Flipping it would mirror the camera to un-mirror the bloom.
    if (u.tone.x > 0.0) {
        // The REMAPPED uv: the bloom mips are the same size and orientation as
        // the source, so a crop must take the same sub-rect from both or the
        // glow would slide against the image it belongs to.
        //
        // From \`source_uv\`, not \`uv\`: the chain is built FROM the source, so it
        // inherits the source's orientation and flips with it.
        let bloom_uv = vec2f(source_uv.x, 1.0 - source_uv.y);
        color += textureSampleLevel(bloom_tex, tex_sampler, bloom_uv, 0.0).rgb * u.tone.x;
    }

    // -- exposure, then tone --
    color *= u.tone.y;

    // asinh, applied to the LENGTH of the colour rather than per channel, so
    // the direction of the vector -- hue and saturation -- survives untouched.
    // Dividing by softness keeps the curve tangent to the identity at the
    // origin for every setting, so dim regions stay put as the slider moves and
    // only the highlights compress. Unbounded: it never asymptotes to 1, so a
    // bright enough region still clips at the 8-bit present.
    //
    // \`if (len > 0.0)\` is non-uniform control flow, but contains no sampling
    // and no derivatives -- pure arithmetic, which is always legal.
    let softness = u.tone.z;
    let len = length(color);
    if (len > 0.0) {
        color *= asinh_f32(len * softness) / (len * softness);
    }

    // ------------------------------------------------------------------
    // Overlays. Both walk the inverse view transform, so they pan and zoom
    // with the world rather than sitting on the glass.
    //
    // ================== fwidth() BELOW IS LEGAL, AND IT IS LEGAL FOR A
    // ================== REASON THAT A REFACTOR CAN DESTROY.
    //
    // WGSL permits derivative builtins (fwidth/dpdx/dpdy) only in UNIFORM
    // CONTROL FLOW. Both calls sit inside \`if (u.reticle.z > 0.0)\`, nested in
    // the \`if\` just below -- and BOTH conditions read UNIFORMS ONLY. Every
    // invocation in a quad takes the same branch, so the flow is uniform and
    // the derivative is well defined.
    //
    // This breaks the moment either guard gains a per-fragment term. Note
    // \`inside\` IS per-fragment and is deliberately NOT in the reticle's guard
    // -- frame_assembly.frag:117-119 keeps the ring drawn outside the canvas on
    // purpose, and that choice is also what keeps fwidth legal here. Hoisting
    // \`inside\` up into the outer condition is a plausible-looking tidy-up that
    // makes this shader fail to compile.
    // ------------------------------------------------------------------
    if (u.tone.w > 0.0 || trails_opacity() > 0.0 || u.reticle.z > 0.0 || line_enabled()) {
        // The REMAPPED uv, so the field lands on the same particles it does on
        // screen. Using \`in.uv\` here would put the painted field in the wrong
        // place in the exported video and nowhere else -- a bug visible only in
        // the finished file, which is the worst place to find one.
        let ndc = uv * 2.0 - 1.0;
        let canvas_uv = screen_ndc_to_canvas_uv(ndc, u.canvas_res.xy, u.canvas_res.zw,
                                                u.camera.xy, u.camera.z);
        let inside = all(canvas_uv >= vec2f(0.0)) && all(canvas_uv <= vec2f(1.0));

        // The field is the same SHAPE as the canvas -- only its resolution is
        // capped -- so canvas uv indexes it directly with no correction.
        //
        // ONE SAMPLE FOR BOTH LAYERS: walls in rg, trails in ba.
        if ((u.tone.w > 0.0 || trails_opacity() > 0.0) && inside) {
            let field = textureSampleLevel(strafe_field, tex_sampler, canvas_uv, 0.0);

            // WALLS: greyscale by magnitude. Direction is deliberately not shown
            // -- a wall's job is to be in the way, and which way it pushes is
            // legible from what the particles do when they hit it.
            if (u.tone.w > 0.0) {
                let m = length(field.rg);
                // Saturating rather than clamped: a faint field and a heavily
                // overpainted one both stay readable, and repainting the same spot
                // approaches white instead of flattening into a solid blob.
                let g = 1.0 - exp(-m * FIELD_OVERLAY_GAIN);
                color = mix(color, vec3f(g), u.tone.w * g);
            }

            // TRAILS: HUE BY DIRECTION, exactly as the Trail Map View colours the
            // canvas (\`camera.wgsl:85\`). The two are the same kind of data -- a 2D
            // vector field the sensors read -- so painting them with one formula
            // is what lets a user compare a drawn trail against a simulated one
            // and see that they agree. Greyscale here would hide the very thing
            // the trails layer is for, since a trail's DIRECTION is what steers.
            //
            // 3.1415, not PI, matching the camera literal it mirrors: the ~2e-5
            // hue difference is invisible, and a gratuitous divergence between two
            // formulas that must look identical is worse than the rounding.
            if (trails_opacity() > 0.0) {
                let m = length(field.ba);
                let g = 1.0 - exp(-m * FIELD_OVERLAY_GAIN);
                let hue = atan2(field.a, field.b) / 3.1415 / 2.0;
                color = mix(color, hsv2rgb(vec3f(hue, 0.75, 1.0)), trails_opacity() * g);
            }
        }

        // THE LINE TOOL'S PREVIEW, under the reticle so the ring stays readable
        // where the two cross.
        //
        // A CAPSULE AT THE BRUSH'S RADIUS: this is the stroke's FOOTPRINT -- where
        // the line will land and how wide it will be -- not the vector field it
        // would deposit. The footprint is what is being aimed, and a field of
        // arrows at preview opacity would be unreadable over a moving simulation.
        //
        // Measured in the aspect-corrected metric, like the reticle and like the
        // brush that will paint it, so the preview is the same shape as the result
        // on a non-square canvas.
        //
        // ONE RADIUS SERVES BOTH A DRAWING AND AN ERASING LINE (shift+left and
        // shift+right). \`u.reticle.z\` is 2 sigma of the brush's gaussian, which is
        // ALSO the eraser's hard cutoff -- the two coincide by construction, and
        // that is what lets this preview be honest about a gesture whose effect
        // depends on which button ends it.
        if (line_enabled()) {
            let from_p = aspect_correct_uv(canvas_uv - u.line.xy, u.canvas_res.xy);
            let to_p = aspect_correct_uv(canvas_uv - u.line.zw, u.canvas_res.xy);
            // Both endpoints are expressed relative to this fragment, so the
            // segment runs between them and the fragment sits at the origin.
            let d = dist_to_segment(vec2f(0.0), from_p, to_p);
            let edge = fwidth(d) * RETICLE_WIDTH_PX;
            let band = 1.0 - smoothstep(0.0, edge, abs(d - u.reticle.z));
            color = mix(color, vec3f(1.0), band * LINE_PREVIEW_ALPHA);
        }

        // Drawn outside the canvas too: the brush paints right up to the edge,
        // so clipping the ring there would hide where the stroke lands.
        if (u.reticle.z > 0.0) {
            // The SAME correction strafe_draw applies when it paints (both take
            // it from common.wgsl) -- the ring must be measured in the metric
            // the brush works in, or it would read as an oval exactly when the
            // canvas is not square.
            let rel = aspect_correct_uv(canvas_uv - u.reticle.xy, u.canvas_res.xy);
            let d = length(rel);
            let w = fwidth(d) * RETICLE_WIDTH_PX;
            var ring = 1.0 - smoothstep(0.0, w, abs(d - u.reticle.z));

            let style = reticle_style();

            // SHOVE draws the same circle dashed, so it is told apart from the
            // painting tools at a glance without moving or resizing the reticle.
            // UNCHANGED BY THE BRUSH MODES: Shove has none, and its reticle must
            // keep meaning exactly what it meant.
            if (style == RETICLE_DASHED) {
                // Position around the ring, in dash cells. atan2 is the one
                // place this fragment cares about angle at all.
                let cell = (atan2(rel.y, rel.x) / (2.0 * PI) + 0.5) * RETICLE_DASH_COUNT;

                // Antialias along the ARC, which needs the angular derivative
                // rather than the radial one used for \`w\` above. fwidth(cell) is
                // wrong on its own: atan2 wraps once per revolution, and at that
                // seam the derivative explodes and smears one cell into a solid
                // blob. Deriving the arc footprint from the radial measure
                // instead is continuous everywhere.
                let arc = fwidth(d) * RETICLE_DASH_COUNT
                        / max(2.0 * PI * u.reticle.z, 1e-6);

                // Triangle wave over the cell, so both dash ends antialias with
                // one smoothstep and the pattern has no seam.
                let t = abs(fract(cell) - 0.5) * 2.0;
                ring *= 1.0 - smoothstep(RETICLE_DASH_DUTY - arc,
                                         RETICLE_DASH_DUTY + arc, t);
            }

            // IN / OUT: eight short rays saying which way the brush deposits.
            //
            // The rays live OUTSIDE the ring for Out and INSIDE it for In, which
            // is the whole signal -- the ring is the brush's edge, and the rays
            // show what crosses it in which direction. Drawn as an angular repeat
            // crossed with a radial band, so both are one smoothstep each.
            if (style == RETICLE_OUT || style == RETICLE_IN) {
                // Each ray is a SEGMENT, tested by distance-to-segment, rather
                // than an angular sector crossed with a radial band.
                //
                // **THE BAND VERSION DOES NOT SURVIVE A SMALL BRUSH, and that is
                // the default brush.** A ray is 1/6 of the radius -- ~0.0033 uv at
                // the default size -- while \`w\`, the line's antialiasing
                // half-width, is ~0.002. Two opposed smoothsteps whose transition
                // bands are each 2w then overlap the whole 0.0033 extent, their
                // product never approaches 1, and the decoration washes out to
                // nothing. It looked correct on a large brush and vanished on the
                // one every session starts with.
                //
                // Distance-to-segment has no such failure: the ray is drawn at the
                // SAME width as the ring itself, so it is exactly as visible as the
                // circle it decorates, at every brush size.
                let len = u.reticle.z * RETICLE_RAY_LENGTH;
                var inner = u.reticle.z;
                var outer = u.reticle.z + len;
                if (style == RETICLE_IN) {
                    inner = u.reticle.z - len;
                    outer = u.reticle.z;
                }

                // Snap this fragment to its nearest ray's direction, so one
                // distance test covers all eight. Rounding the turn fraction to
                // the nearest 1/8 IS the angular repeat.
                let turn = atan2(rel.y, rel.x);
                let step_angle = 2.0 * PI / RETICLE_RAY_COUNT;
                let snapped = round(turn / step_angle) * step_angle;
                let dir = vec2f(cos(snapped), sin(snapped));

                // The ray runs from \`inner\` to \`outer\` along that direction.
                let a = dir * inner;
                let b = dir * outer;
                let ray = dist_to_segment(rel, a, b);
                ring = max(ring, 1.0 - smoothstep(0.0, w, ray));
            }

            // FIXED: one arrow, pointing where the brush will push.
            //
            // ROTATES LIVE WITH THE DRAW ANGLE SLIDER, which is the point of
            // drawing it at all: the direction a \`fixed\` brush deposits is
            // otherwise invisible until after the first stroke.
            //
            // ANGLE 0 IS UP, AND CANVAS UV IS Y-UP HERE -- so this is \`+cos(a)\`,
            // with no negation.
            //
            // \`world_to_uv\` (common.wgsl) is a plain scale-and-offset with NO Y
            // FLIP, so \`rel\` inherits world space's y-up orientation. The flip
            // that does exist in this feature belongs to \`strafeDraw.wgsl\`, which
            // RASTERIZES INTO the field through its own flipped quad -- a
            // different space entirely, and not this one. Assuming "uv means
            // y-down" here put the arrow at the bottom of the ring while the
            // brush it describes pushed upward.
            if (style == RETICLE_FIXED) {
                let a = draw_angle();
                let dir = vec2f(sin(a), cos(a));
                let perp = vec2f(-dir.y, dir.x);
                let tip = u.reticle.z * (1.0 + RETICLE_ARROW_LENGTH);

                // THE SHAFT, as a segment from the ring to the tip. Segment
                // distance for the same reason the rays above use it: a shaft
                // built from an across-axis smoothstep is thinner than its own
                // antialiasing band at the default brush size and disappears.
                let shaft = dist_to_segment(rel, dir * u.reticle.z, dir * tip);

                // THE HEAD: two short barbs swept back from the tip, drawn as
                // segments like everything else here. A filled triangle would need
                // a taper test whose width again collapses below \`w\` on a small
                // brush -- the exact trap the shaft above just escaped.
                let barb = u.reticle.z * RETICLE_ARROW_HEAD;
                let base = dir * (tip - barb);
                let left = base + perp * barb;
                let right = base - perp * barb;
                let head = min(
                    dist_to_segment(rel, dir * tip, left),
                    dist_to_segment(rel, dir * tip, right),
                );

                ring = max(ring, 1.0 - smoothstep(0.0, w, min(shaft, head)));
            }

            color = mix(color, vec3f(1.0), ring);
        }
    }

    // ------------------------------------------------------------------
    // The recording crop box.
    //
    // LAST, and ON THE GLASS. Unlike the field and the reticle above, this does
    // NOT walk the inverse view transform: it marks a region of the OUTPUT
    // IMAGE -- the pixels that will be in the video file -- so it must stay put
    // when the world pans and zoom underneath it. Panning does change which
    // particles are inside it, which is the entire point of aiming a crop.
    //
    // NEVER DRAWN INTO THE RECORDING. \`crop.z\` is the enable, and the capture
    // pass always packs it zero -- the same rule the brush reticle follows, for
    // the same reason: a box marking what will be recorded, recorded, would be
    // burned into the thing it describes.
    //
    // In SCREEN uv throughout. \`crop.xy\` is the box's half-extent as a fraction
    // of the window and the box is centred, so the test is a single symmetric
    // distance from the middle -- which is why no origin needs to be passed.
    if (u.crop.z > 0.0) {
        let from_center = abs(in.uv - vec2f(0.5));
        let half_extent = u.crop.xy;

        // Signed distance to the box edge, in uv. Positive outside.
        let outside = any(from_center > half_extent);
        if (outside) {
            // Dim, not black: the surround still shows what is happening just
            // beyond the frame, which is what makes it possible to aim a crop at
            // something that is about to move into it.
            color *= 1.0 - u.crop.w;
        }

        // The white rule, drawn at the boundary in both axes. \`fwidth\` is legal
        // here for the same reason it is above -- this whole block is guarded on
        // a UNIFORM only, so every invocation in a quad agrees. \`from_center\` is
        // per-fragment but is not in the guard.
        let d = max(from_center.x - half_extent.x, from_center.y - half_extent.y);
        let w = fwidth(d) * CROP_BORDER_PX;
        let border = 1.0 - smoothstep(0.0, w, abs(d));
        color = mix(color, vec3f(1.0), border);
    }

    return vec4f(color, 1.0);
}
`;class Ja{device;targets;outputFormat;bloom;pipeline=null;uniformLayout=null;textureLayout=null;uniformGroup=null;textureGroupBloomOff=null;textureGroupBloomOn=null;textureGroupSource=null;uniforms;dummyHdrView;dummyFieldView;strafeFieldView;constructor(e,t,s){this.device=e,this.targets=t,this.outputFormat=s,this.bloom=new ul(e,t.sampler),this.uniforms=e.createBuffer({label:"FrameAssemblyUniforms",size:$a,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});const a=(i,r)=>e.createTexture({label:i,size:{width:1,height:1},format:r,usage:GPUTextureUsage.TEXTURE_BINDING}).createView();this.dummyHdrView=a("bloom-placeholder",Pe),this.dummyFieldView=a("strafe-field-placeholder",zt),this.strafeFieldView=this.dummyFieldView}setStrafeField(e){this.strafeFieldView=e,this.invalidateTargets()}static async create(e,t,s){const a=new Ja(e,t,s);return await a.reload(),a}async reload(){const e=this.device,[t]=await Promise.all([$(e,"frameAssembly.wgsl",fl),this.bloom.reload()]);if(t===null){this.pipeline=null;return}this.uniformLayout=e.createBindGroupLayout({label:"frame-assembly-uniforms",entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,buffer:{type:"uniform"}}]}),this.textureLayout=e.createBindGroupLayout({label:"frame-assembly-textures",entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:2,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:3,visibility:GPUShaderStage.FRAGMENT,sampler:{}}]}),this.pipeline=e.createRenderPipeline({label:"frame-assembly",layout:e.createPipelineLayout({bindGroupLayouts:[this.uniformLayout,this.textureLayout]}),vertex:{module:t,entryPoint:"fullscreen_vs"},fragment:{module:t,entryPoint:"fs_main",targets:[{format:this.outputFormat}]},primitive:{topology:"triangle-strip"}}),this.uniformGroup=e.createBindGroup({label:"frame-assembly-uniforms",layout:this.uniformLayout,entries:[{binding:0,resource:{buffer:this.uniforms}}]}),this.invalidateTargets()}pipelineStatus(){return{frameAssembly:this.pipeline!==null,...this.bloom.pipelineStatus()}}invalidateTargets(){this.textureGroupBloomOff=null,this.textureGroupBloomOn=null,this.bloom.invalidate()}present(e,t,s,a,i,r){if(this.pipeline===null||this.textureLayout===null||this.uniformGroup===null||t===null)return;let o=null;if(i.bloomEnabled&&i.bloomIntensity>0){const d=this.targets.size;d!==null&&(o=this.bloom.process(e,t,d,i.bloomThreshold,i.bloomRadius))}this.device.queue.writeBuffer(this.uniforms,0,jo(a,i,o!==null,r,t===this.targets.hdr));const c=this.ensureTextureGroup(t,o),l=e.beginRenderPass({label:"frame-assembly",timestampWrites:re("frame-assembly"),colorAttachments:[{view:s,clearValue:{r:0,g:0,b:0,a:1},loadOp:"clear",storeOp:"store"}]});l.setPipeline(this.pipeline),l.setBindGroup(0,this.uniformGroup),l.setBindGroup(1,c),l.draw(4),l.end()}ensureTextureGroup(e,t){const s=a=>this.device.createBindGroup({label:"frame-assembly-textures",layout:this.textureLayout,entries:[{binding:0,resource:e},{binding:1,resource:a},{binding:2,resource:this.strafeFieldView},{binding:3,resource:this.targets.sampler}]});return e!==this.textureGroupSource&&(this.textureGroupBloomOff=null,this.textureGroupBloomOn=null,this.textureGroupSource=e),t===null?(this.textureGroupBloomOff??=s(this.dummyHdrView),this.textureGroupBloomOff):(this.textureGroupBloomOn??=s(t),this.textureGroupBloomOn)}destroy(){this.uniforms.destroy(),this.bloom.destroy()}}const ei=48,ti=40,ni=64+ti*16,pl=16,si=16,ml=1.5,vl=.045;function ai(n,e){n[0]=e.canvasSize[0],n[1]=e.canvasSize[1],n[2]=e.windowSize[0],n[3]=e.windowSize[1],n[4]=e.pan[0],n[5]=e.pan[1],n[6]=e.zoom}function gl(n){const e=new ArrayBuffer(ei);return ai(new Float32Array(e),n),e}function wl(n,e,t=-1,s=[],a=0){const i=new ArrayBuffer(ni),r=new Float32Array(i),o=new Int32Array(i);ai(r,n),r[8]=ml,r[9]=vl,o[12]=e,r[13]=t,r[14]=a;const c=Math.min(s.length,ti);for(let l=0;l<c;l++){const d=s[l];if(d===void 0)continue;const h=pl+l*4;r[h+0]=d.hue,r[h+1]=d.saturation,r[h+2]=d.colorSensitivity,r[h+3]=d.colorOffset}return i}function bl(n){const e=new ArrayBuffer(si),t=new Float32Array(e);return t[0]=1/(Math.max(1,Math.trunc(n))||1),e}const yl=`// Present pass for TRAIL mode: sample the canvas through the camera transform
// and colorize it. A port of \`camera/shaders/camera.frag\`.
//
// The camera is applied HERE rather than by moving the quad, because the quad is
// always fullscreen: we walk each screen pixel backwards to the world point it
// shows. That inverse is what puts the letterbox bars in the right place and
// keeps zoom anchored, and it lives in common.wgsl -- not in this file.
// ==== begin include: common.wgsl ====
// ============================================================================
// common.wgsl -- shared struct definitions and coordinate math.
//
// THIS FILE IS THE SINGLE SOURCE OF TRUTH FOR GPU STRUCT LAYOUT. What the
// structs below declare is what the GPU reads.
//
// The layout is stated in ONE OTHER PLACE: \`src/particleSystem/layout.fixture.json\`,
// which is what the host packs against (\`pack.ts\`, guarded by \`assertLaneMap\`).
// Two hand-authored statements of one fact, so \`common.wgsl.test.ts\` checks the
// declarations below against that descriptor on every \`npm test\`. It is the
// shader-side counterpart of \`assertLaneMap\`; together they close the loop.
//
// If that test fails, the two have diverged and the GPU is reinterpreting memory
// the host packed to a different plan -- which does not crash, it just makes the
// simulation subtly wrong. CHANGE BOTH FILES IN THE SAME COMMIT.
//
// (The descriptor was originally generated by the Python desktop app's
// layout.py, which parsed the GLSL original of this file. That app is gone;
// there is no generator now and deliberately no replacement -- see layout.ts.)
//
// RULES FOR EDITING THIS FILE:
//
//  1. vec4-ONLY. Every member of every struct must be a vec4f, a fixed-size
//     array of vec4f, or another struct that obeys this rule. No bare f32,
//     no i32, no vec2f/vec3f. Scalars ride in vec4 lanes; ints ride in float
//     lanes via bitcast.
//
//     Why: std430 (GLSL) and WGSL do NOT agree on how to lay out structs with
//     mixed scalar types. An all-vec4 struct is 16-byte aligned with an
//     unambiguous stride in both, so this codebase translates between them
//     without a layout audit. Both layout.py and common.wgsl.test.ts enforce
//     this and will fail on anything else.
//
//  2. ADD A FIELD BY CLAIMING A RESERVED LANE, not by appending a scalar.
//     When the reserved lanes run out, add a whole new vec4.
//
//  3. NO uniforms and NO buffer/binding declarations in this file -- types and
//     pure functions only. Bindings belong to the shader that owns them.
//     (Binding assignments are recorded in the table below for coordination.)
//
//     This rule is MORE load-bearing on the web than on the desktop. GLSL
//     drivers strip unused uniforms and moderngl's tryset() tolerates the
//     result; WebGPU validates against an explicit bind group layout, so a
//     uniform declared here but unused by an including shader is a hard
//     pipeline-creation error rather than a warning.
//
//  4. NO \`#version\` line here (WGSL has none) and no entry points. This file is
//     included into compute, vertex AND fragment modules, so it must stay
//     stage-agnostic: no texture sampling, no discard, no derivatives
//     (fwidth/dpdx). It currently has none of those -- keep it that way.
//
// SSBO BINDING ASSIGNMENTS (project-wide, keep in sync):
//     binding = 0   EntityBuffer
//     binding = 1   ConfigBuffer
// ============================================================================

const PI: f32 = 3.1415926;

// \`STRAFE_FIELD_GAIN\` USED TO LIVE HERE, at 0.01, as the fixed rate at which the
// painted field displaced a particle. It is now a UNIFORM, because the Walls
// Field Strength preference multiplies it -- so the host owns the number
// (\`FIELD_STRENGTH_GAIN\` in \`prefs/preferences.ts\`) and packs \`strength * 0.01\`
// into the entity update's uniform.
//
// Moved rather than kept alongside the slider: two multipliers, one here and one
// host-side, is exactly the "second multiplier for the user to get lost between"
// that the original comment ruled out. At the default strength of 1.0 the product
// is 0.01 and every painted field behaves precisely as it did before.

// ---------------------------------------------------------------------------
// CANVAS VALUE SCALE -- the canvas is RG16F (see CANVAS_DTYPE in
// particle_system.py), and fp16's usable range starts at ~6.1e-5. At high
// Trail Persistence the splat premultiply (1-P)/P shrinks each deposit to
// ~1e-6, which is SUBNORMAL in fp16: blend units flush it and trails starve
// (measured: 40x dimmer at P=0.999). All stored canvas values therefore ride
// 512x above their physical meaning: the splat multiplies by this, every READER
// divides by it. canvas decay/diffuse is linear and scale-invariant, so it
// neither knows nor cares.
//
// 512 is chosen with both ends in view: it lifts a slow particle's deposit at
// P = 0.999 (~3.6e-6) to ~1.8e-3 -- comfortably normal -- while the largest
// legitimate single splat (fast particle at the P clamp floor) stays around
// 1e4, under fp16's 65504 ceiling. Readers: get_can() in entity_update,
// camera. Writers: the trail deposit (entityUpdate.wgsl \`deposit\`, drained
// into the canvas by canvas.wgsl).
const CANVAS_VALUE_SCALE: f32 = 512.0;

// THE SPLAT ACCUMULATOR'S FIXED POINT. WGSL atomics are integer-only, so each
// deposit rides in an i32 at this many counts per (already scaled) canvas unit.
//
// 2^14 matches fp16 at both ends. One count is 2^-14, fp16's smallest normal,
// so the accumulator resolves exactly the deposits a blended fp16 splat could;
// and +-2^31 counts span +-2^17, twice fp16's 65504 ceiling, so a pile-up
// saturates in the canvas pass's CANVAS_VALUE_MAX clamp before it can wrap.
// The deposit range this has to hold is CANVAS_VALUE_SCALE's, above.
const SPLAT_FIXED_SCALE: f32 = 16384.0;

// Saturation ceiling for stored (scaled) canvas values, applied by the canvas
// pass on every write. NEEDED BECAUSE OF fp16: a texel pushed past 65504 rounds
// to inf, and inf survives decay forever (inf * P == inf) -- one extreme splat
// pile-up would permanently poison the texel and NaN any particle that senses
// it. Saturating below the ceiling lets even an absurd pile-up decay back down.
// fp32 never needed this; do not remove it while the canvas is fp16.
const CANVAS_VALUE_MAX: f32 = 60000.0;

// Trail Persistence's legal range inside the shaders. The FLOOR is well below
// the slider (0.5..0.999) and below every known config (observed min 0.312);
// it exists for typed-in extremes. It was 1e-4, but (1-P)/P at 1e-4 is ~1e4,
// which times CANVAS_VALUE_SCALE would overflow fp16 on a single splat --
// 1e-2 caps the premultiply at ~99 and costs nothing anyone uses.
// The deposit and the canvas pass MUST clamp with the same bounds, or the
// splat premultiply and the decay would disagree about what P means.
const TRAIL_PERSISTENCE_MIN: f32 = 1e-2;
const TRAIL_PERSISTENCE_MAX: f32 = 0.999;

// ---------------------------------------------------------------------------
// MODE ENUMS -- the single definition. ui/settings_spec.py mirrors these BY
// VALUE in its DROPDOWN_MODES tuples, so the order of the options there is the
// order here. Change one, change both.
// ---------------------------------------------------------------------------

// What happens when a particle reaches the edge of the world. A WorldData
// setting: the trail field follows the same rule, so it cannot vary per config.
const BC_BOUNCE: i32 = 0;
const BC_WRAP: i32 = 1;
const BC_RESET: i32 = 2;
// Leaving the world KILLS the particle rather than respawning it: it is marked
// dead and its index pushed onto the free list. The sand modality's default,
// and the worked example of the sinks system -- BC_RESET's sibling, differing
// only in what happens to the particle that crossed.
//
// ADDED AS A FOURTH VALUE rather than by redefining BC_RESET, so the studio's
// three modes keep their exact meanings. A config that has never heard of this
// mode cannot select it, and nothing in the studio writes a 3.
const BC_KILL: i32 = 3;

// How particles are placed on reset. A ConfigData setting: different
// populations can seed differently.
const IC_GRID: i32 = 0;
const IC_RANDOM: i32 = 1;
// No shader compares against IC_CENTER -- it is the fall-through \`else\` branch
// of initial_position() in entity_update. It stays defined because it is a real
// mode, mirrored by value in ui/settings_spec.py's dropdown. Do not drop it as
// dead code.
const IC_CENTER: i32 = 2;
const IC_RING: i32 = 3;

// ---------------------------------------------------------------------------
// Rule -- the Fourier Feature Network coefficients that define particle behavior
// ---------------------------------------------------------------------------

// 4D input -> 4D output basis element.
struct FourierCenter {
    frequency: vec4f,
    amplitude: vec4f,
}

// 10 FourierCenters makes a Rule. 320 bytes, all vec4.
//
// This is the only array in the layout, and it is the case that usually bites:
// std430's array-of-struct stride here is 32 bytes, and WGSL's
// array<FourierCenter,10> stride is also 32 (alignment 16, size 32 -- already a
// multiple). No stride divergence. common.wgsl.test.ts asserts it rather than
// trusting this comment.
struct Rule {
    centers: array<FourierCenter, 10>,
}

// ---------------------------------------------------------------------------
// ConfigData -- everything a particle needs to know about how to behave.
//
// This unifies what used to be two separate systems: the Rule (behavior) and
// the physics parameters. They live together now because they are the same
// kind of thing -- per-particle-population settings -- and separating them is
// what made the reference implementation's parameter handling sprawl.
//
// Lives in ConfigBuffer (binding 1). Each entity selects its ConfigData via
// its own config_index, so different particles can obey different configs.
// ---------------------------------------------------------------------------
struct ConfigData {
    rule: Rule,      // 320 B -- behavior coefficients
    sensor: vec4f,   // x: gain          y: angle       z: distance    w: mutation_scale
    force: vec4f,    // x: global_mult   y: drag        z: strafe      w: axial
    misc: vec4f,     // x: lateral       y: hazard_rate z: cohorts(i)  w: mutation_seed
    // The first four vec4s filled up (misc.w went to mutation_seed), so this is
    // the "add a whole new vec4" case rule 2 describes rather than a reclaimed
    // lane. Two spares here for the next additions.
    force2: vec4f,   // x: gravity_force y: gravity_strafe z: initial_conditions(i) w: cohort_fences(i)
    // force2 filled up the same way misc did, so this is another whole new
    // vec4 rather than a reclaimed lane. This one's zw were the last two spares
    // in the struct, and the sensor jitters claimed them -- rule 2's "claim a
    // reserved lane" case. THERE ARE NO SPARE LANES LEFT: the next addition
    // needs a whole new vec4.
    //
    // NAMED FOR BEING AN OVERFLOW LANE, NOT FOR A THEME -- like \`misc\` and
    // \`force2\` above it. It was called \`appearance\` while it held only the two
    // colour settings; the sensor jitters are physics, so that name had become
    // a lie about half its contents. A lane is a place four floats fit, not a
    // category, and pretending otherwise makes the next addition agonize over
    // whether it belongs. Read the per-lane comment, not the name.
    misc2: vec4f,  // x: color_sensitivity     y: color_by_cohort(i)
                   // z: sensor_angle_jitter   w: sensor_distance_jitter
    // misc2 had no spares left, so Radial Gravity is rule 2's "add a whole new
    // vec4" case again rather than a reclaimed lane. Gravity (Trails) then took
    // .y -- rule 2's "claim a reserved lane" case, as did Color Offset in .z
    // and Trail Weight in .w. No spares left.
    misc3: vec4f,  // x: radial_gravity(i)     y: gravity_trails
                   // z: color_offset          w: trail_weight
    // misc3 had no spares left, so the evolver's SECOND mutation voice is rule
    // 2's "add a whole new vec4" case. RUNTIME ONLY: never saved, always 0 in
    // a loaded state, so every saved state packs and behaves exactly as before.
    // Breathe mode's Orbit overlaps two breaths, and the fading one rides here.
    misc4: vec4f,  // x: mutation_scale_2      y: mutation_seed_2
                   // z: reserved              w: reserved
}  // 432 bytes

fn cfg_sensor_gain(c: ConfigData) -> f32     { return c.sensor.x; }
fn cfg_sensor_angle(c: ConfigData) -> f32    { return c.sensor.y; }
fn cfg_sensor_distance(c: ConfigData) -> f32 { return c.sensor.z; }
fn cfg_mutation_scale(c: ConfigData) -> f32  { return c.sensor.w; }

fn cfg_global_force_mult(c: ConfigData) -> f32 { return c.force.x; }
fn cfg_drag(c: ConfigData) -> f32              { return c.force.y; }
fn cfg_strafe_power(c: ConfigData) -> f32      { return c.force.z; }
fn cfg_axial_force(c: ConfigData) -> f32       { return c.force.w; }

fn cfg_lateral_force(c: ConfigData) -> f32 { return c.misc.x; }
fn cfg_hazard_rate(c: ConfigData) -> f32   { return c.misc.y; }
fn cfg_cohorts(c: ConfigData) -> i32       { return bitcast<i32>(c.misc.z); }
// Which random variation the rule mutation uses. Per-config rather than a
// uniform, so different particle populations can mutate differently.
fn cfg_mutation_seed(c: ConfigData) -> f32 { return c.misc.w; }
// A second, independent mutation layered on the first (evolver Orbit only).
// Scale 0 = absent. The seed is always used in stable mode (see mutate_rule).
fn cfg_mutation_scale_2(c: ConfigData) -> f32 { return c.misc4.x; }
fn cfg_mutation_seed_2(c: ConfigData) -> f32  { return c.misc4.y; }

// Uniform pull on the whole population, in the two motion channels the rest of
// the physics uses: _force feeds velocity, _strafe displaces position directly.
// Both are LINEAR -1..1 controls -- run them through gravity_expand() before
// use, never apply them raw.
fn cfg_gravity_force(c: ConfigData) -> f32  { return c.force2.x; }
fn cfg_gravity_strafe(c: ConfigData) -> f32 { return c.force2.y; }

// How this population is arranged on reset -- one of the IC_* modes above.
fn cfg_initial_conditions(c: ConfigData) -> i32 { return bitcast<i32>(c.force2.z); }
// Whether each particle is held near its own spawn point. ON/OFF ONLY: the
// fence RADIUS is derived from the grid cell size rather than stored, so
// cohorts just barely touch at any cohort count -- see the fence block in
// entity_update, which also explains why it applies to IC_GRID alone.
fn cfg_cohort_fences(c: ConfigData) -> bool { return bitcast<i32>(c.force2.w) != 0; }

// How strongly the brain's colour signal swings the hue. Read by the PARTICLE
// CAMERA, not by the physics -- entity_update only decides what raw signal to
// store, so this can be dragged without disturbing the simulation.
//
// NO SHADER CALLS THIS. The camera does not read the config buffer (rule 3);
// the value reaches cam_brush as a loose uniform instead. This accessor is the
// record of which lane holds it -- keep it.
fn cfg_color_sensitivity(c: ConfigData) -> f32 { return c.misc2.x; }
// Colour each population flat by its cohort instead of by its brain's output.
// A DISPLAY choice, read by the particle camera -- entity_update transmits both
// signals (col_params.x is the brain, .y the cohort) and picks neither, so this
// takes effect immediately, even while the simulation is paused.
//
// Also uncalled by any shader, for the same reason as cfg_color_sensitivity.
fn cfg_color_by_cohort(c: ConfigData) -> bool { return bitcast<i32>(c.misc2.y) != 0; }

// WHERE THIS POPULATION'S HUE SITS BEFORE THE SIGNAL MOVES IT. Sensitivity is
// the coefficient A and this is the bias B in \`hue = A * signal + B\`, so a
// config can be tuned to a corner of the wheel and its signal read as variation
// WITHIN that colour rather than across the whole spectrum.
//
// 0..1 spans the wheel exactly once. Hue is periodic, so the ends meet and no
// wrapping is needed anywhere -- see the fragment stage in cam_brush.
//
// IN A DIFFERENT LANE FROM cfg_color_sensitivity, which it belongs beside by
// meaning. misc2 was full; this is rule 2's "claim a reserved lane" case in
// misc3 rather than a fourth vec4 for one float. The accessors are written
// together here because that is where a reader looks for them -- the lane a
// value lives in is an allocation detail, which is exactly what the misc2
// comment above says.
//
// Uncalled by any shader, like the two above: the camera does not read the
// config buffer (rule 3), so this reaches cam_brush through the swatch table on
// its own uniform. The accessor is the record of which lane holds it.
fn cfg_color_offset(c: ConfigData) -> f32 { return c.misc3.z; }

// Random wobble added to each sensor reading, resampled EVERY PHYSICS STEP --
// a shimmer, not a fixed per-particle trait. Both are 0..1 controls scaled so
// that 1.0 spans the whole range of the parameter they perturb: angle covers
// its own -1..1 slider directly, distance covers SENSOR_DISTANCE_SPAN below.
// Applied in entity_update; 0 is off.
fn cfg_sensor_angle_jitter(c: ConfigData) -> f32    { return c.misc2.z; }
fn cfg_sensor_distance_jitter(c: ConfigData) -> f32 { return c.misc2.w; }

// Which direction the two gravity channels above pull in. False (the default,
// and what every config written before this existed means) is the fixed
// vec2(0,1) screen-down pull; true swings it to the particle's own position
// vector, so positive values fall inwards towards the origin and negative
// values blow outwards. Lives in misc3 rather than beside the gravity values
// because force2 and misc2 were both full -- read the lane comment, not the
// name.
fn cfg_radial_gravity(c: ConfigData) -> bool { return bitcast<i32>(c.misc3.x) != 0; }

// THE THIRD GRAVITY CHANNEL, and the only one that is not a motion.
//
// Force and Strafe above move the particle. This one moves what the particle
// BELIEVES: it is a constant bias added to every canvas sensor reading, in
// exactly the manner the user-drawn trails layer is added (see \`get_can\` in
// entityUpdate.wgsl). Nothing is pushed -- particles are told there is a trail
// downhill, and each rule decides for itself what to do about that. A rule that
// chases trails falls; a rule that avoids them rises. So unlike the other two,
// this channel's SIGN IS NOT ITS DIRECTION, and it does nothing whatsoever to a
// population whose rule ignores the sensors.
//
// LINEAR -1..1 like its siblings, expanded by the same gravity_expand() -- one
// curve for all three, so the feel of the three sliders matches.
fn cfg_gravity_trails(c: ConfigData) -> f32 { return c.misc3.y; }

// TRAIL WEIGHT: how heavily a config's trails count against OTHER configs'.
// Its deposits are multiplied by it and its reads of the swarm's trails divided
// by it (both in entityUpdate.wgsl), so a config alone is unaffected at any
// weight. Negative lays trails that point backwards, to everyone else.
//
// THE FLOOR IS LOAD-BEARING: reads divide by this. A stored value inside
// +-TRAIL_WEIGHT_MIN -- a hand-edited file, a typed 0 -- is pushed out to the
// floor on its own side, zero counting as positive. Mirrored by value in
// \`particleSystem/config.ts\` and pinned by a test.
const TRAIL_WEIGHT_MIN: f32 = 0.02;
fn cfg_trail_weight(c: ConfigData) -> f32 {
    let w = c.misc3.w;
    if (abs(w) >= TRAIL_WEIGHT_MIN) { return w; }
    return select(TRAIL_WEIGHT_MIN, -TRAIL_WEIGHT_MIN, w < 0.0);
}

// The width of the Sensor Distance slider (0..5), which is what a distance
// jitter of 1.0 spans. It lives here rather than being read from the slider
// bounds because the shader has no access to those -- MUST MATCH the \`hi\` of
// the sensor_distance entry in ui/settings_spec.py.
const SENSOR_DISTANCE_SPAN: f32 = 5.0;

// The speed below which a particle is considered STALLED and is given a random
// heading. See the rescue block in entityUpdate.wgsl for why one is needed: a
// particle's heading is its velocity, so at exactly zero it has no direction,
// its sensors collapse onto each other, and nothing can ever restore it.
//
// 5e-5 is \`reset()\`'s own spawn magnitude -- the number this codebase already
// picked for "slow, but moving enough to have a direction". Using the same value
// makes a rescued particle indistinguishable from a freshly reset one.
//
// A FLOOR, NOT AN EPSILON. It is deliberately far above fp32's denormal range:
// the failure is not underflow to exactly zero, it is a velocity too small for
// \`sample_dist\` to place the sensors on different texels, which happens long
// before the bits run out.
const MIN_VELOCITY: f32 = 5e-5;

// ---------------------------------------------------------------------------
// WorldData -- settings that are properties of the world, not of a particle.
//
// Set as a uniform, never per-entity. If a setting would be meaningless to
// vary between two particles sharing a canvas (trail decay, world scale), it
// belongs here rather than in ConfigData.
// ---------------------------------------------------------------------------
struct WorldData {
    trail: vec4f,  // x: persistence  y: diffusion  z: sqrt_world_size  w: config_count(i)
    // trail filled up, so this is rule 2's "add a whole new vec4" case.
    bounds: vec4f, // x: boundary_conditions(i)   yzw: reserved
}

fn world_trail_persistence(w: WorldData) -> f32 { return w.trail.x; }
fn world_trail_diffusion(w: WorldData) -> f32   { return w.trail.y; }
fn world_sqrt_world_size(w: WorldData) -> f32   { return w.trail.z; }
fn world_config_count(w: WorldData) -> i32      { return bitcast<i32>(w.trail.w); }

// What happens at the edge of the world -- one of the BC_* modes above. A
// world property rather than a per-config one: the trail field has to obey the
// same boundary as the particles do, and there is only one trail field.
fn world_boundary_conditions(w: WorldData) -> i32 { return bitcast<i32>(w.bounds.x); }

// ---------------------------------------------------------------------------
// Entity -- one particle. 32 bytes, 16-byte aligned.
//
// Lives in EntityBuffer (binding 0). Mirrored by no one: every shader that
// touches entities includes this file.
// ---------------------------------------------------------------------------
struct Entity {
    pos_vel: vec4f,  // xy: pos    zw: vel
    misc: vec4f,     // x: size    y: config_index(i)    zw: col_params
}

fn e_pos(e: Entity) -> vec2f          { return e.pos_vel.xy; }
fn e_vel(e: Entity) -> vec2f          { return e.pos_vel.zw; }
fn e_size(e: Entity) -> f32           { return e.misc.x; }
fn e_config_index(e: Entity) -> i32   { return bitcast<i32>(e.misc.y); }

// ---------------------------------------------------------------------------
// LIFETIME -- a negative config_index means the particle is DEAD.
//
// NO LAYOUT CHANGE. Entity is full at 32 bytes and every lane is spoken for, so
// a dead FLAG would have meant widening the struct and editing
// layout.fixture.json in lockstep. It is not needed: config_index is already an
// i32 riding a float lane, and no real config index is ever negative -- so the
// sign bit was free the whole time.
//
// EVERY READER MUST TEST THIS BEFORE THE CONFIG LOOKUP. \`entityUpdate\` clamps
// config_index into range (\`clamp(idx, 0, count-1)\`), which would quietly turn
// a dead particle into a config-0 particle rather than skipping it. The clamp is
// correct for its own purpose -- it makes a SHRUNK ConfigBuffer degrade
// gracefully -- so the dead test goes above it rather than replacing it.
//
// The studio produces these only through BC_KILL, and its reset frame brings
// them back (see the dead-particle note in entityUpdate's \`main\`).
// ---------------------------------------------------------------------------
// \`make_entity_dead\` is NOT here: it calls make_entity, which is declared below,
// and WGSL requires declaration before use. It sits under that function instead.
const DEAD_CONFIG: i32 = -1;

fn e_is_dead(e: Entity) -> bool { return e_config_index(e) < 0; }

// RAW OUTPUT FROM THE PARTICLE'S BRAIN, kept for rendering rather than physics.
// entity_update writes these; the particle camera turns them into a hue.
//
// .x is a raw force term from the black box -- deliberately arbitrary, tuned by
// eye, so nothing downstream should read meaning into its scale.
// .y is the particle's COHORT INDEX, which cam_brush reads when Color By
// Cohort is on.
//
// The RENDERER decides what these look like. Storing the raw signals instead of
// a finished hue is what lets Color Sensitivity be dragged without re-running
// the simulation, which is where the reference put it.
fn e_col_params(e: Entity) -> vec2f { return e.misc.zw; }

fn make_entity(pos: vec2f, vel: vec2f, size: f32, config_index: i32,
               col_params: vec2f) -> Entity {
    return Entity(vec4f(pos, vel),
                  vec4f(size, bitcast<f32>(config_index), col_params));
}

// Same, for the paths that have no colour signal to offer -- reset() runs
// before any behaviour is computed. Zero is a valid hue, so this is not a
// sentinel; the entity simply gets its colour on the next real step.
//
// RENAMED from the GLSL, which overloads \`make_entity\` on arity -- WGSL has no
// function overloading. The delegation is kept: this is the 5-arg form with a
// zero colour, not a second implementation.
fn make_entity_reset(pos: vec2f, vel: vec2f, size: f32,
                     config_index: i32) -> Entity {
    return make_entity(pos, vel, size, config_index, vec2f(0.0));
}

// A DEAD particle -- see the lifetime block above \`e_is_dead\`.
//
// Everything is zeroed rather than left stale: a readback of the buffer stays
// legible, and nothing downstream can be fooled by a plausible-looking position
// on a particle that is not there. A size of 0 means that even a consumer which
// somehow skipped the dead test would draw a zero-area sprite.
//
// DECLARED HERE, not beside e_is_dead, because it calls make_entity above and
// WGSL requires declaration before use.
fn make_entity_dead() -> Entity {
    return make_entity(vec2f(0.0), vec2f(0.0), 0.0, DEAD_CONFIG, vec2f(0.0));
}

// ---------------------------------------------------------------------------
// COORDINATE CONVENTION -- the one canonical implementation.
//
// World space is AREA-PRESERVING. With ca = canvas_res.x / canvas_res.y:
//
//     world = [-sqrt(ca), +sqrt(ca)]  x  [-1/sqrt(ca), +1/sqrt(ca)]
//
// so the world always has area 4 regardless of canvas aspect, and a circle in
// world space stays a circle on screen. On a square canvas ca == 1 and this
// reduces exactly to the familiar [-1,1] x [-1,1].
//
// NO OTHER FILE MAY WRITE ASPECT-RATIO MATH. Every world<->uv<->ndc
// conversion goes through the functions below (and their TypeScript mirrors in
// src/particleSystem/coords.ts). The reference implementation had six divergent
// copies of this math, at least one of which contradicted the others; that is
// the specific failure this rule exists to prevent.
//
// THE WORLD IS A TORUS ONLY IN BC_WRAP. The boundary mode decides the world's
// topology, so anything that crosses an edge must ask: world_wrap for wrap,
// world_bounce for bounce, and world_to_uv_bc for every texture read.
//
// SEVERAL FUNCTIONS BELOW HAVE NO EXTERNAL CALLER. world_half_extent,
// world_to_uv, uv_to_world, edge_fold, letterbox_scale and screen_ndc_to_world
// are each an internal composition step of one that does. They are load-bearing,
// not dead. WGSL does not warn about unused module-scope functions.
// ---------------------------------------------------------------------------

// Half-extent of world space on each axis, from canvas aspect ca = res.x/res.y.
fn world_half_extent(ca: f32) -> vec2f {
    let s = sqrt(ca);
    return vec2f(s, 1.0 / s);
}

fn world_half_extent_from_res(canvas_res: vec2f) -> vec2f {
    return world_half_extent(canvas_res.x / canvas_res.y);
}

// Scale a uv-space delta into the aspect-corrected metric -- literally
// world_half_extent applied as a scale, which is why it lives here rather than
// being its own piece of aspect math. World space is area-preserving, so a raw
// uv delta is anisotropic on a non-square canvas; brushes measured in this
// metric stay circular, and a ring drawn in it matches the brush that paints
// in it. Used by strafe_draw (painting) and frame_assembly (the reticle that
// must agree with it).
fn aspect_correct_uv(d: vec2f, canvas_res: vec2f) -> vec2f {
    return d * world_half_extent_from_res(canvas_res);
}

// World -> texture uv [0,1]. In BC_WRAP the canvas textures are sampled with a
// repeating sampler and the sampler does the wrapping, so uv is deliberately
// left unclamped. Every other boundary mode must go through world_to_uv_bc.
fn world_to_uv(p: vec2f, canvas_res: vec2f) -> vec2f {
    return p / (2.0 * world_half_extent_from_res(canvas_res)) + 0.5;
}

// World -> texture uv, honoring the boundary mode. Only BC_WRAP leaves uv free
// for the sampler's repeat to handle; the others clamp, so a sensor reaching
// past the edge reads the edge rather than the far side of the world.
fn world_to_uv_bc(p: vec2f, canvas_res: vec2f, bc: i32) -> vec2f {
    let uv = world_to_uv(p, canvas_res);
    // select(false_value, true_value, condition) -- the argument order is the
    // reverse of GLSL's \`cond ? a : b\`.
    return select(clamp(uv, vec2f(0.0), vec2f(1.0)), uv, bc == BC_WRAP);
}

fn uv_to_world(uv: vec2f, canvas_res: vec2f) -> vec2f {
    return (uv - 0.5) * 2.0 * world_half_extent_from_res(canvas_res);
}

// The corner of an instanced quad, in TRIANGLE-STRIP order, as a 0..1 uv:
// (0,0) (1,0) (0,1) (1,1) for vertex_id 0..3. The matching offset from the quad
// centre is \`(strip_corner(v) * 2.0 - 1.0) * half_size\`, which pairs uv and
// corner by construction -- they are the same value.
//
// ARITHMETIC, NOT A LOOKUP TABLE, and that is the reason this exists. The
// per-particle sprite shaders (camBrush.wgsl; the brush pass before it became
// a point splat) used \`var offsets = array<vec2f, 4>(...)\` indexed by vertex_id.
// A local array indexed by a non-constant is spilled to per-thread scratch
// memory by the browser's shader compilers (the same trap that made
// entityUpdate's by-value Rule so slow), and a sprite shader runs four times
// per particle. Do not turn this back into a table.
//
// Strip, not fan: WebGPU has no triangle-fan, and a strip over the desktop's
// fan order (brush.vert:25-36) draws a bowtie.
fn strip_corner(vertex_id: u32) -> vec2f {
    return vec2f(f32(vertex_id & 1u), f32(vertex_id >> 1u));
}

// World -> normalized device coords [-1,1] for rasterizing into the canvas.
fn world_to_ndc(p: vec2f, canvas_res: vec2f) -> vec2f {
    return p / world_half_extent_from_res(canvas_res);
}

// Wrap a world position into the world bounds. BC_WRAP only -- the world is a
// torus in that mode alone.
//
// DO NOT REWRITE fract() AS \`%\`. \`p\` here is freely signed (a world position
// past either edge), so \`p / size - 0.5\` is routinely negative, and WGSL's \`%\`
// is truncated where this needs floored behaviour. WGSL defines fract(x) as
// \`x - floor(x)\`, identical to GLSL, so it translates verbatim and correctly --
// the \`%\` "cleanup" would break wrap for every particle leaving the left or
// bottom edge.
fn world_wrap(p: vec2f, canvas_res: vec2f) -> vec2f {
    let extent = world_half_extent_from_res(canvas_res);
    let size = 2.0 * extent;
    return size * (fract(p / size - 0.5) - 0.5);
}

// Reflect a coordinate given in edge units back into [-1,1]. A triangle wave,
// so it is correct for ARBITRARY overshoot. The reference's single-fold version
// (sign(x)*(1-abs(1-abs(x)))) silently teleported a particle to the far side
// once it passed 2x the edge in one step, which heavy gravity reaches.
//
// GLSL's mod() is floored and WGSL's \`%\` is truncated, so they are NOT
// interchangeable in general. They agree here because the dividend is abs(x),
// non-negative BY CONSTRUCTION rather than by caller convention, and the
// divisor is a positive literal. That is what makes \`%\` safe -- if the abs()
// ever goes away, this needs a floored mod again.
fn edge_fold(x: f32) -> f32 {
    let t = abs(x) % 2.0;
    return sign(x) * (1.0 - abs(1.0 - t));
}

// What world_bounce returns. GLSL passed p and v as \`inout\`; WGSL has no
// inout, so the pair comes back as a struct. (A ptr<function, vec2f> parameter
// would also work, but a return struct reads better at the one call site.)
struct BounceResult {
    pos: vec2f,
    vel: vec2f,
}

// Reflect a position off the world bounds, flipping the velocity components
// that crossed. Position and velocity move together: reflecting the position
// without reversing the velocity would just re-trigger the bounce every frame,
// pinning the particle to the wall.
//
// THE ORDER BELOW IS LOAD-BEARING: the velocity flips are decided against the
// PRE-FOLD position, and only then is the position folded. Computing the folded
// position first and testing that would silently change the exact-boundary case.
fn world_bounce(p: vec2f, v: vec2f, canvas_res: vec2f) -> BounceResult {
    let extent = world_half_extent_from_res(canvas_res);
    var vel = v;
    if (abs(p.x) > extent.x) { vel.x = -vel.x; }
    if (abs(p.y) > extent.y) { vel.y = -vel.y; }
    let pos = vec2f(edge_fold(p.x / extent.x), edge_fold(p.y / extent.y)) * extent;
    return BounceResult(pos, vel);
}

// ---------------------------------------------------------------------------
// THE VIEW TRANSFORM -- world to screen, through camera and letterbox.
//
//     world  --/half_extent-->  canvas ndc
//            --(-pan, *zoom)->  view ndc
//            --*letterbox---->  screen ndc [-1,1]
//
// THREE INDEPENDENT ASPECT QUANTITIES, never conflate them:
//   canvas_res  simulation texture size; defines world space
//   window_res  framebuffer size in pixels; changes on resize
//   letterbox   derived fit of one into the other; never stored
//
// ZOOM: bigger = zoomed IN (a magnification factor). zoom=1 fits the world.
// PAN:  world units. pan is the world point at the center of the view.
// ---------------------------------------------------------------------------

// Scale fitting the canvas box into the window, preserving shape. The axis
// that would overflow shrinks; the other stays 1.0, and the slack is the
// letterbox bar. Fit, not fill: the whole canvas is always visible.
fn letterbox_scale(canvas_res: vec2f, window_res: vec2f) -> vec2f {
    if (window_res.x <= 0.0 || window_res.y <= 0.0) { return vec2f(1.0); }
    let canvas_aspect = canvas_res.x / canvas_res.y;
    let window_aspect = window_res.x / window_res.y;
    return select(
        vec2f(1.0, window_aspect / canvas_aspect),  // bars top/bottom
        vec2f(canvas_aspect / window_aspect, 1.0),  // bars left/right
        window_aspect > canvas_aspect);
}

fn world_to_screen_ndc(p: vec2f, canvas_res: vec2f, window_res: vec2f,
                       pan: vec2f, zoom: f32) -> vec2f {
    let ndc = world_to_ndc(p - pan, canvas_res) * zoom;
    return ndc * letterbox_scale(canvas_res, window_res);
}

fn screen_ndc_to_world(ndc: vec2f, canvas_res: vec2f, window_res: vec2f,
                       pan: vec2f, zoom: f32) -> vec2f {
    var v = ndc / letterbox_scale(canvas_res, window_res);
    if (zoom != 0.0) { v /= zoom; }
    return uv_to_world(v * 0.5 + 0.5, canvas_res) + pan;
}

// Screen ndc -> canvas uv, for the present pass sampling the canvas texture.
// Values outside [0,1] fall in the letterbox bars; the caller decides whether
// to clamp, wrap (tiling) or paint them black.
fn screen_ndc_to_canvas_uv(ndc: vec2f, canvas_res: vec2f, window_res: vec2f,
                           pan: vec2f, zoom: f32) -> vec2f {
    return world_to_uv(
        screen_ndc_to_world(ndc, canvas_res, window_res, pan, zoom),
        canvas_res);
}

// ==== end include: common.wgsl ====
// ==== begin include: fullscreenQuad.wgsl ====
// The fullscreen quad, shared by every pass that covers the screen.
//
// The desktop's \`shared/shaders/fullscreen_quad.vert\` is shared across five
// consumers; this is that file. Consumers here:
//
//   camera/shaders/camera.wgsl              TRAIL present
//   camera/shaders/accumulate.wgsl          motion blur accumulation
//   assembler/shaders/bloomDownsample.wgsl  the mip chain, down
//   assembler/shaders/bloomUpsample.wgsl    the mip chain, up
//   assembler/shaders/frameAssembly.wgsl    bloom, tone curve, overlays
//   webcam/shaders/cameraPreview.wgsl       the Camera tab's thumbnail
//   webcam/shaders/camera{Ingest,Blur,Map}.wgsl -- the VERTEX only. They render
//                                           into textures the particles sample,
//                                           so they index by @builtin(position)
//                                           and ignore \`uv\`; see cameraIngest.
//
// NOT a consumer: \`particleSystem/shaders/canvas.wgsl\`. It needs the V FLIP
// (see its header) because it rasterizes into the canvas texture and every
// fragment must read the texel it is about to write; every consumer above needs
// NO flip. Merging the two behind a boolean parameter would put the single most
// dangerous decision in this port -- the one Step 4 lost the most time to --
// behind an argument that is easy to pass wrong and impossible to see in a
// diff. Two small definitions, each unconditionally correct, is the right shape.
//
// WHY NOT IN common.wgsl. That file declares no bindings and must stay
// stage-agnostic (its own editing rules 3 and 4), and a \`@vertex\` entry point
// is the opposite of stage-agnostic. It is also parsed by \`common.wgsl.test.ts\`
// against the generated layout descriptor, so unrelated additions there are
// noise in a file whose job is struct layout.
//
// NO VERTEX BUFFER. The quad comes from \`@builtin(vertex_index)\`, so there is
// nothing to allocate, bind or keep in sync. Drawn as \`draw(4)\` with
// \`topology: 'triangle-strip'\` -- TRIANGLE_FAN is not a WebGPU topology, which
// is why the corner order below is strip order rather than the desktop's fan.

struct FsQuadVsOut {
    @builtin(position) clip : vec4f,
    @location(0) uv : vec2f,
}

// Strip order: (-,-) (+,-) (-,+) (+,+). The same order \`canvas.wgsl\` and the
// deleted \`debugPresent.wgsl\` use, so all four agree by inspection.
fn fullscreen_corner(vi: u32) -> vec2f {
    var corners = array<vec2f, 4>(
        vec2f(-1.0, -1.0),
        vec2f( 1.0, -1.0),
        vec2f(-1.0,  1.0),
        vec2f( 1.0,  1.0),
    );
    return corners[vi];
}

// NO Y FLIP, for every consumer of this entry point.
//
// The canvas texture is stored TOP-LEFT-ORIGIN: the trail deposit
// (entityUpdate.wgsl) writes each pixel at the texture row \`get_can\` samples,
// and canvas.wgsl flips v to read back the texel it writes, so the stored image
// matches WebGPU's framebuffer convention. Sampling it straight therefore puts
// world +y at the top of the screen, matching the desktop. See \`web/README.md\`'s
// Y-flip section.
//
// The intermediate targets (hdr, accum, the bloom mips) are all WRITTEN by
// passes using this entry point and READ by passes using this entry point, so
// they are internally consistent whatever convention is chosen -- the only
// externally observable flips are \`camera.wgsl\` reading the canvas and
// \`frameAssembly.wgsl\` reading the strafe field, and both want none.
@vertex
fn fullscreen_vs(@builtin(vertex_index) vi : u32) -> FsQuadVsOut {
    let p = fullscreen_corner(vi);
    var out : FsQuadVsOut;
    out.clip = vec4f(p, 0.0, 1.0);
    out.uv = p * 0.5 + 0.5;
    return out;
}

// ==== end include: fullscreenQuad.wgsl ====

// Turns the canvas's stored magnitude into a sensible starting exposure, so the
// Brightness slider lands near 1.0 for a typical scene. Not a tone curve: a
// plain linear gain, applied before anything else sees the value.
const CANVAS_GAIN: f32 = 24.0;

struct CameraViewUniforms {
    canvas_res : vec4f,   // xy: canvas size   zw: window size
    camera     : vec4f,   // xy: pan   z: zoom   w: reserved
    flags      : vec4f,   // reserved; TRAIL has no int state
}

@group(0) @binding(0) var<uniform> u : CameraViewUniforms;

// Group 1 is the SWAPPING group: the canvas is double-buffered and its front
// texture changes every sub-step, so keeping it out of group 0 means the
// uniform is bound once. The same split \`canvas.wgsl\` makes, for the same
// reason.
@group(1) @binding(0) var canvas_texture : texture_2d<f32>;
@group(1) @binding(1) var canvas_sampler : sampler;

// Duplicated from \`camBrush.wgsl\` deliberately. The GLSL duplicates it too
// (\`camera.frag:26\` and \`cam_brush.frag:37\`) and it is NOT in common.glsl, so
// hoisting it into common.wgsl would make that file diverge from the .glsl it
// mirrors -- which \`common.wgsl.test.ts\` scans. Five lines is the cheaper cost.
fn hsv2rgb(c: vec3f) -> vec3f {
    let K = vec4f(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    let p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    // GLSL's clamp(vec3, float, float) overload does not exist in WGSL, so the
    // bounds widen to vec3f.
    return c.z * mix(K.xxx, clamp(p - K.xxx, vec3f(0.0), vec3f(1.0)), c.y);
}

@fragment
fn fs_main(in: FsQuadVsOut) -> @location(0) vec4f {
    let ndc = in.uv * 2.0 - 1.0;
    let canvas_uv = screen_ndc_to_canvas_uv(ndc, u.canvas_res.xy, u.canvas_res.zw,
                                            u.camera.xy, u.camera.z);

    // Outside the canvas: letterbox bar (window aspect != canvas aspect) or
    // panned/zoomed past the world edge. Paint it black rather than clamping,
    // so the world's extent is visible instead of smeared edge pixels.
    //
    // GLSL's \`any(lessThan(v, vec2(0.0)))\` becomes \`any(v < vec2f(0.0))\` --
    // WGSL's comparison operators are already component-wise on vectors.
    if (any(canvas_uv < vec2f(0.0)) || any(canvas_uv > vec2f(1.0))) {
        return vec4f(0.0, 0.0, 0.0, 1.0);
    }

    // textureSampleLevel, NOT textureSample. The early-out above makes this
    // NON-UNIFORM CONTROL FLOW, and WGSL forbids implicit-derivative sampling
    // there -- it is a compile error, not a subtle wrong answer. The canvas has
    // no mips, so level 0 is numerically identical; this is the same
    // substitution \`entityUpdate.wgsl\` makes for the compute stage, arrived at
    // for a different reason.
    //
    // Stored canvas values ride CANVAS_VALUE_SCALE above their physical meaning
    // (an fp16 range fix -- see common.wgsl); divide it back out so brightness
    // means what it always did.
    let canv = textureSampleLevel(canvas_texture, canvas_sampler, canvas_uv, 0.0)
               / CANVAS_VALUE_SCALE;

    // LINEAR HDR OUT. The tone curve, brightness and bloom all belong to the
    // assembler. That matters for more than tidiness: the accumulator averages
    // what this pass emits, and averaging display values rather than energy
    // would make motion blur darken as it smeared.
    //
    // The colorize stays HERE, though, rather than moving downstream with the
    // rest. The canvas holds a vector field, and the accumulator has to average
    // COLORS, not vectors -- a particle that reverses direction mid-frame would
    // otherwise average toward zero and punch a black hole in the blur.
    //
    // 3.1415, not PI. \`camera.frag:58\` uses this literal; common.wgsl's PI is
    // 3.1415926. They differ by a ~2e-5 hue rotation, which is invisible -- but
    // changing it is a gratuitous divergence in a step verified by eye.
    let color = CANVAS_GAIN * hsv2rgb(vec3f(atan2(canv.y, canv.x) / 3.1415 / 2.0,
                                            0.75, length(canv.xy)));
     //This term is an (unused) emboss style effect: 
     //+ dot(normalize(vec3f(1.,.05,1.)),normalize(vec3f(canv.x,.05,canv.y)));
    return vec4f(color, 1.0);
}
`,_l=`// Particle-cam: one instanced quad per entity, drawn straight to the screen.
// A port of \`camera/shaders/cam_brush.vert\` + \`cam_brush.frag\`, joined into one
// module because a WebGPU pipeline takes both stages from one place.
//
// Unlike the old brush pass (which splatted into the canvas in canvas-ndc),
// this goes all the way to SCREEN ndc, so the camera transform is baked into
// the vertices here. The present pass must therefore NOT apply the camera again.
//
// Colour is decided HERE and nowhere upstream. \`entityUpdate\` transmits BOTH
// signals and chooses neither: \`col_params.x\` is a raw output of the black box
// the particle evaluates each step, \`col_params.y\` is its cohort index.
//
// THAT SPLIT IS THE POINT. Colour is a display decision, so deciding it in the
// compute shader would mean a checkbox that does nothing until the next physics
// step -- appearing broken exactly while paused, which is when you most want to
// flip between the two and compare. Here, both toggles are immediate.
// ==== begin include: common.wgsl ====
// ============================================================================
// common.wgsl -- shared struct definitions and coordinate math.
//
// THIS FILE IS THE SINGLE SOURCE OF TRUTH FOR GPU STRUCT LAYOUT. What the
// structs below declare is what the GPU reads.
//
// The layout is stated in ONE OTHER PLACE: \`src/particleSystem/layout.fixture.json\`,
// which is what the host packs against (\`pack.ts\`, guarded by \`assertLaneMap\`).
// Two hand-authored statements of one fact, so \`common.wgsl.test.ts\` checks the
// declarations below against that descriptor on every \`npm test\`. It is the
// shader-side counterpart of \`assertLaneMap\`; together they close the loop.
//
// If that test fails, the two have diverged and the GPU is reinterpreting memory
// the host packed to a different plan -- which does not crash, it just makes the
// simulation subtly wrong. CHANGE BOTH FILES IN THE SAME COMMIT.
//
// (The descriptor was originally generated by the Python desktop app's
// layout.py, which parsed the GLSL original of this file. That app is gone;
// there is no generator now and deliberately no replacement -- see layout.ts.)
//
// RULES FOR EDITING THIS FILE:
//
//  1. vec4-ONLY. Every member of every struct must be a vec4f, a fixed-size
//     array of vec4f, or another struct that obeys this rule. No bare f32,
//     no i32, no vec2f/vec3f. Scalars ride in vec4 lanes; ints ride in float
//     lanes via bitcast.
//
//     Why: std430 (GLSL) and WGSL do NOT agree on how to lay out structs with
//     mixed scalar types. An all-vec4 struct is 16-byte aligned with an
//     unambiguous stride in both, so this codebase translates between them
//     without a layout audit. Both layout.py and common.wgsl.test.ts enforce
//     this and will fail on anything else.
//
//  2. ADD A FIELD BY CLAIMING A RESERVED LANE, not by appending a scalar.
//     When the reserved lanes run out, add a whole new vec4.
//
//  3. NO uniforms and NO buffer/binding declarations in this file -- types and
//     pure functions only. Bindings belong to the shader that owns them.
//     (Binding assignments are recorded in the table below for coordination.)
//
//     This rule is MORE load-bearing on the web than on the desktop. GLSL
//     drivers strip unused uniforms and moderngl's tryset() tolerates the
//     result; WebGPU validates against an explicit bind group layout, so a
//     uniform declared here but unused by an including shader is a hard
//     pipeline-creation error rather than a warning.
//
//  4. NO \`#version\` line here (WGSL has none) and no entry points. This file is
//     included into compute, vertex AND fragment modules, so it must stay
//     stage-agnostic: no texture sampling, no discard, no derivatives
//     (fwidth/dpdx). It currently has none of those -- keep it that way.
//
// SSBO BINDING ASSIGNMENTS (project-wide, keep in sync):
//     binding = 0   EntityBuffer
//     binding = 1   ConfigBuffer
// ============================================================================

const PI: f32 = 3.1415926;

// \`STRAFE_FIELD_GAIN\` USED TO LIVE HERE, at 0.01, as the fixed rate at which the
// painted field displaced a particle. It is now a UNIFORM, because the Walls
// Field Strength preference multiplies it -- so the host owns the number
// (\`FIELD_STRENGTH_GAIN\` in \`prefs/preferences.ts\`) and packs \`strength * 0.01\`
// into the entity update's uniform.
//
// Moved rather than kept alongside the slider: two multipliers, one here and one
// host-side, is exactly the "second multiplier for the user to get lost between"
// that the original comment ruled out. At the default strength of 1.0 the product
// is 0.01 and every painted field behaves precisely as it did before.

// ---------------------------------------------------------------------------
// CANVAS VALUE SCALE -- the canvas is RG16F (see CANVAS_DTYPE in
// particle_system.py), and fp16's usable range starts at ~6.1e-5. At high
// Trail Persistence the splat premultiply (1-P)/P shrinks each deposit to
// ~1e-6, which is SUBNORMAL in fp16: blend units flush it and trails starve
// (measured: 40x dimmer at P=0.999). All stored canvas values therefore ride
// 512x above their physical meaning: the splat multiplies by this, every READER
// divides by it. canvas decay/diffuse is linear and scale-invariant, so it
// neither knows nor cares.
//
// 512 is chosen with both ends in view: it lifts a slow particle's deposit at
// P = 0.999 (~3.6e-6) to ~1.8e-3 -- comfortably normal -- while the largest
// legitimate single splat (fast particle at the P clamp floor) stays around
// 1e4, under fp16's 65504 ceiling. Readers: get_can() in entity_update,
// camera. Writers: the trail deposit (entityUpdate.wgsl \`deposit\`, drained
// into the canvas by canvas.wgsl).
const CANVAS_VALUE_SCALE: f32 = 512.0;

// THE SPLAT ACCUMULATOR'S FIXED POINT. WGSL atomics are integer-only, so each
// deposit rides in an i32 at this many counts per (already scaled) canvas unit.
//
// 2^14 matches fp16 at both ends. One count is 2^-14, fp16's smallest normal,
// so the accumulator resolves exactly the deposits a blended fp16 splat could;
// and +-2^31 counts span +-2^17, twice fp16's 65504 ceiling, so a pile-up
// saturates in the canvas pass's CANVAS_VALUE_MAX clamp before it can wrap.
// The deposit range this has to hold is CANVAS_VALUE_SCALE's, above.
const SPLAT_FIXED_SCALE: f32 = 16384.0;

// Saturation ceiling for stored (scaled) canvas values, applied by the canvas
// pass on every write. NEEDED BECAUSE OF fp16: a texel pushed past 65504 rounds
// to inf, and inf survives decay forever (inf * P == inf) -- one extreme splat
// pile-up would permanently poison the texel and NaN any particle that senses
// it. Saturating below the ceiling lets even an absurd pile-up decay back down.
// fp32 never needed this; do not remove it while the canvas is fp16.
const CANVAS_VALUE_MAX: f32 = 60000.0;

// Trail Persistence's legal range inside the shaders. The FLOOR is well below
// the slider (0.5..0.999) and below every known config (observed min 0.312);
// it exists for typed-in extremes. It was 1e-4, but (1-P)/P at 1e-4 is ~1e4,
// which times CANVAS_VALUE_SCALE would overflow fp16 on a single splat --
// 1e-2 caps the premultiply at ~99 and costs nothing anyone uses.
// The deposit and the canvas pass MUST clamp with the same bounds, or the
// splat premultiply and the decay would disagree about what P means.
const TRAIL_PERSISTENCE_MIN: f32 = 1e-2;
const TRAIL_PERSISTENCE_MAX: f32 = 0.999;

// ---------------------------------------------------------------------------
// MODE ENUMS -- the single definition. ui/settings_spec.py mirrors these BY
// VALUE in its DROPDOWN_MODES tuples, so the order of the options there is the
// order here. Change one, change both.
// ---------------------------------------------------------------------------

// What happens when a particle reaches the edge of the world. A WorldData
// setting: the trail field follows the same rule, so it cannot vary per config.
const BC_BOUNCE: i32 = 0;
const BC_WRAP: i32 = 1;
const BC_RESET: i32 = 2;
// Leaving the world KILLS the particle rather than respawning it: it is marked
// dead and its index pushed onto the free list. The sand modality's default,
// and the worked example of the sinks system -- BC_RESET's sibling, differing
// only in what happens to the particle that crossed.
//
// ADDED AS A FOURTH VALUE rather than by redefining BC_RESET, so the studio's
// three modes keep their exact meanings. A config that has never heard of this
// mode cannot select it, and nothing in the studio writes a 3.
const BC_KILL: i32 = 3;

// How particles are placed on reset. A ConfigData setting: different
// populations can seed differently.
const IC_GRID: i32 = 0;
const IC_RANDOM: i32 = 1;
// No shader compares against IC_CENTER -- it is the fall-through \`else\` branch
// of initial_position() in entity_update. It stays defined because it is a real
// mode, mirrored by value in ui/settings_spec.py's dropdown. Do not drop it as
// dead code.
const IC_CENTER: i32 = 2;
const IC_RING: i32 = 3;

// ---------------------------------------------------------------------------
// Rule -- the Fourier Feature Network coefficients that define particle behavior
// ---------------------------------------------------------------------------

// 4D input -> 4D output basis element.
struct FourierCenter {
    frequency: vec4f,
    amplitude: vec4f,
}

// 10 FourierCenters makes a Rule. 320 bytes, all vec4.
//
// This is the only array in the layout, and it is the case that usually bites:
// std430's array-of-struct stride here is 32 bytes, and WGSL's
// array<FourierCenter,10> stride is also 32 (alignment 16, size 32 -- already a
// multiple). No stride divergence. common.wgsl.test.ts asserts it rather than
// trusting this comment.
struct Rule {
    centers: array<FourierCenter, 10>,
}

// ---------------------------------------------------------------------------
// ConfigData -- everything a particle needs to know about how to behave.
//
// This unifies what used to be two separate systems: the Rule (behavior) and
// the physics parameters. They live together now because they are the same
// kind of thing -- per-particle-population settings -- and separating them is
// what made the reference implementation's parameter handling sprawl.
//
// Lives in ConfigBuffer (binding 1). Each entity selects its ConfigData via
// its own config_index, so different particles can obey different configs.
// ---------------------------------------------------------------------------
struct ConfigData {
    rule: Rule,      // 320 B -- behavior coefficients
    sensor: vec4f,   // x: gain          y: angle       z: distance    w: mutation_scale
    force: vec4f,    // x: global_mult   y: drag        z: strafe      w: axial
    misc: vec4f,     // x: lateral       y: hazard_rate z: cohorts(i)  w: mutation_seed
    // The first four vec4s filled up (misc.w went to mutation_seed), so this is
    // the "add a whole new vec4" case rule 2 describes rather than a reclaimed
    // lane. Two spares here for the next additions.
    force2: vec4f,   // x: gravity_force y: gravity_strafe z: initial_conditions(i) w: cohort_fences(i)
    // force2 filled up the same way misc did, so this is another whole new
    // vec4 rather than a reclaimed lane. This one's zw were the last two spares
    // in the struct, and the sensor jitters claimed them -- rule 2's "claim a
    // reserved lane" case. THERE ARE NO SPARE LANES LEFT: the next addition
    // needs a whole new vec4.
    //
    // NAMED FOR BEING AN OVERFLOW LANE, NOT FOR A THEME -- like \`misc\` and
    // \`force2\` above it. It was called \`appearance\` while it held only the two
    // colour settings; the sensor jitters are physics, so that name had become
    // a lie about half its contents. A lane is a place four floats fit, not a
    // category, and pretending otherwise makes the next addition agonize over
    // whether it belongs. Read the per-lane comment, not the name.
    misc2: vec4f,  // x: color_sensitivity     y: color_by_cohort(i)
                   // z: sensor_angle_jitter   w: sensor_distance_jitter
    // misc2 had no spares left, so Radial Gravity is rule 2's "add a whole new
    // vec4" case again rather than a reclaimed lane. Gravity (Trails) then took
    // .y -- rule 2's "claim a reserved lane" case, as did Color Offset in .z
    // and Trail Weight in .w. No spares left.
    misc3: vec4f,  // x: radial_gravity(i)     y: gravity_trails
                   // z: color_offset          w: trail_weight
    // misc3 had no spares left, so the evolver's SECOND mutation voice is rule
    // 2's "add a whole new vec4" case. RUNTIME ONLY: never saved, always 0 in
    // a loaded state, so every saved state packs and behaves exactly as before.
    // Breathe mode's Orbit overlaps two breaths, and the fading one rides here.
    misc4: vec4f,  // x: mutation_scale_2      y: mutation_seed_2
                   // z: reserved              w: reserved
}  // 432 bytes

fn cfg_sensor_gain(c: ConfigData) -> f32     { return c.sensor.x; }
fn cfg_sensor_angle(c: ConfigData) -> f32    { return c.sensor.y; }
fn cfg_sensor_distance(c: ConfigData) -> f32 { return c.sensor.z; }
fn cfg_mutation_scale(c: ConfigData) -> f32  { return c.sensor.w; }

fn cfg_global_force_mult(c: ConfigData) -> f32 { return c.force.x; }
fn cfg_drag(c: ConfigData) -> f32              { return c.force.y; }
fn cfg_strafe_power(c: ConfigData) -> f32      { return c.force.z; }
fn cfg_axial_force(c: ConfigData) -> f32       { return c.force.w; }

fn cfg_lateral_force(c: ConfigData) -> f32 { return c.misc.x; }
fn cfg_hazard_rate(c: ConfigData) -> f32   { return c.misc.y; }
fn cfg_cohorts(c: ConfigData) -> i32       { return bitcast<i32>(c.misc.z); }
// Which random variation the rule mutation uses. Per-config rather than a
// uniform, so different particle populations can mutate differently.
fn cfg_mutation_seed(c: ConfigData) -> f32 { return c.misc.w; }
// A second, independent mutation layered on the first (evolver Orbit only).
// Scale 0 = absent. The seed is always used in stable mode (see mutate_rule).
fn cfg_mutation_scale_2(c: ConfigData) -> f32 { return c.misc4.x; }
fn cfg_mutation_seed_2(c: ConfigData) -> f32  { return c.misc4.y; }

// Uniform pull on the whole population, in the two motion channels the rest of
// the physics uses: _force feeds velocity, _strafe displaces position directly.
// Both are LINEAR -1..1 controls -- run them through gravity_expand() before
// use, never apply them raw.
fn cfg_gravity_force(c: ConfigData) -> f32  { return c.force2.x; }
fn cfg_gravity_strafe(c: ConfigData) -> f32 { return c.force2.y; }

// How this population is arranged on reset -- one of the IC_* modes above.
fn cfg_initial_conditions(c: ConfigData) -> i32 { return bitcast<i32>(c.force2.z); }
// Whether each particle is held near its own spawn point. ON/OFF ONLY: the
// fence RADIUS is derived from the grid cell size rather than stored, so
// cohorts just barely touch at any cohort count -- see the fence block in
// entity_update, which also explains why it applies to IC_GRID alone.
fn cfg_cohort_fences(c: ConfigData) -> bool { return bitcast<i32>(c.force2.w) != 0; }

// How strongly the brain's colour signal swings the hue. Read by the PARTICLE
// CAMERA, not by the physics -- entity_update only decides what raw signal to
// store, so this can be dragged without disturbing the simulation.
//
// NO SHADER CALLS THIS. The camera does not read the config buffer (rule 3);
// the value reaches cam_brush as a loose uniform instead. This accessor is the
// record of which lane holds it -- keep it.
fn cfg_color_sensitivity(c: ConfigData) -> f32 { return c.misc2.x; }
// Colour each population flat by its cohort instead of by its brain's output.
// A DISPLAY choice, read by the particle camera -- entity_update transmits both
// signals (col_params.x is the brain, .y the cohort) and picks neither, so this
// takes effect immediately, even while the simulation is paused.
//
// Also uncalled by any shader, for the same reason as cfg_color_sensitivity.
fn cfg_color_by_cohort(c: ConfigData) -> bool { return bitcast<i32>(c.misc2.y) != 0; }

// WHERE THIS POPULATION'S HUE SITS BEFORE THE SIGNAL MOVES IT. Sensitivity is
// the coefficient A and this is the bias B in \`hue = A * signal + B\`, so a
// config can be tuned to a corner of the wheel and its signal read as variation
// WITHIN that colour rather than across the whole spectrum.
//
// 0..1 spans the wheel exactly once. Hue is periodic, so the ends meet and no
// wrapping is needed anywhere -- see the fragment stage in cam_brush.
//
// IN A DIFFERENT LANE FROM cfg_color_sensitivity, which it belongs beside by
// meaning. misc2 was full; this is rule 2's "claim a reserved lane" case in
// misc3 rather than a fourth vec4 for one float. The accessors are written
// together here because that is where a reader looks for them -- the lane a
// value lives in is an allocation detail, which is exactly what the misc2
// comment above says.
//
// Uncalled by any shader, like the two above: the camera does not read the
// config buffer (rule 3), so this reaches cam_brush through the swatch table on
// its own uniform. The accessor is the record of which lane holds it.
fn cfg_color_offset(c: ConfigData) -> f32 { return c.misc3.z; }

// Random wobble added to each sensor reading, resampled EVERY PHYSICS STEP --
// a shimmer, not a fixed per-particle trait. Both are 0..1 controls scaled so
// that 1.0 spans the whole range of the parameter they perturb: angle covers
// its own -1..1 slider directly, distance covers SENSOR_DISTANCE_SPAN below.
// Applied in entity_update; 0 is off.
fn cfg_sensor_angle_jitter(c: ConfigData) -> f32    { return c.misc2.z; }
fn cfg_sensor_distance_jitter(c: ConfigData) -> f32 { return c.misc2.w; }

// Which direction the two gravity channels above pull in. False (the default,
// and what every config written before this existed means) is the fixed
// vec2(0,1) screen-down pull; true swings it to the particle's own position
// vector, so positive values fall inwards towards the origin and negative
// values blow outwards. Lives in misc3 rather than beside the gravity values
// because force2 and misc2 were both full -- read the lane comment, not the
// name.
fn cfg_radial_gravity(c: ConfigData) -> bool { return bitcast<i32>(c.misc3.x) != 0; }

// THE THIRD GRAVITY CHANNEL, and the only one that is not a motion.
//
// Force and Strafe above move the particle. This one moves what the particle
// BELIEVES: it is a constant bias added to every canvas sensor reading, in
// exactly the manner the user-drawn trails layer is added (see \`get_can\` in
// entityUpdate.wgsl). Nothing is pushed -- particles are told there is a trail
// downhill, and each rule decides for itself what to do about that. A rule that
// chases trails falls; a rule that avoids them rises. So unlike the other two,
// this channel's SIGN IS NOT ITS DIRECTION, and it does nothing whatsoever to a
// population whose rule ignores the sensors.
//
// LINEAR -1..1 like its siblings, expanded by the same gravity_expand() -- one
// curve for all three, so the feel of the three sliders matches.
fn cfg_gravity_trails(c: ConfigData) -> f32 { return c.misc3.y; }

// TRAIL WEIGHT: how heavily a config's trails count against OTHER configs'.
// Its deposits are multiplied by it and its reads of the swarm's trails divided
// by it (both in entityUpdate.wgsl), so a config alone is unaffected at any
// weight. Negative lays trails that point backwards, to everyone else.
//
// THE FLOOR IS LOAD-BEARING: reads divide by this. A stored value inside
// +-TRAIL_WEIGHT_MIN -- a hand-edited file, a typed 0 -- is pushed out to the
// floor on its own side, zero counting as positive. Mirrored by value in
// \`particleSystem/config.ts\` and pinned by a test.
const TRAIL_WEIGHT_MIN: f32 = 0.02;
fn cfg_trail_weight(c: ConfigData) -> f32 {
    let w = c.misc3.w;
    if (abs(w) >= TRAIL_WEIGHT_MIN) { return w; }
    return select(TRAIL_WEIGHT_MIN, -TRAIL_WEIGHT_MIN, w < 0.0);
}

// The width of the Sensor Distance slider (0..5), which is what a distance
// jitter of 1.0 spans. It lives here rather than being read from the slider
// bounds because the shader has no access to those -- MUST MATCH the \`hi\` of
// the sensor_distance entry in ui/settings_spec.py.
const SENSOR_DISTANCE_SPAN: f32 = 5.0;

// The speed below which a particle is considered STALLED and is given a random
// heading. See the rescue block in entityUpdate.wgsl for why one is needed: a
// particle's heading is its velocity, so at exactly zero it has no direction,
// its sensors collapse onto each other, and nothing can ever restore it.
//
// 5e-5 is \`reset()\`'s own spawn magnitude -- the number this codebase already
// picked for "slow, but moving enough to have a direction". Using the same value
// makes a rescued particle indistinguishable from a freshly reset one.
//
// A FLOOR, NOT AN EPSILON. It is deliberately far above fp32's denormal range:
// the failure is not underflow to exactly zero, it is a velocity too small for
// \`sample_dist\` to place the sensors on different texels, which happens long
// before the bits run out.
const MIN_VELOCITY: f32 = 5e-5;

// ---------------------------------------------------------------------------
// WorldData -- settings that are properties of the world, not of a particle.
//
// Set as a uniform, never per-entity. If a setting would be meaningless to
// vary between two particles sharing a canvas (trail decay, world scale), it
// belongs here rather than in ConfigData.
// ---------------------------------------------------------------------------
struct WorldData {
    trail: vec4f,  // x: persistence  y: diffusion  z: sqrt_world_size  w: config_count(i)
    // trail filled up, so this is rule 2's "add a whole new vec4" case.
    bounds: vec4f, // x: boundary_conditions(i)   yzw: reserved
}

fn world_trail_persistence(w: WorldData) -> f32 { return w.trail.x; }
fn world_trail_diffusion(w: WorldData) -> f32   { return w.trail.y; }
fn world_sqrt_world_size(w: WorldData) -> f32   { return w.trail.z; }
fn world_config_count(w: WorldData) -> i32      { return bitcast<i32>(w.trail.w); }

// What happens at the edge of the world -- one of the BC_* modes above. A
// world property rather than a per-config one: the trail field has to obey the
// same boundary as the particles do, and there is only one trail field.
fn world_boundary_conditions(w: WorldData) -> i32 { return bitcast<i32>(w.bounds.x); }

// ---------------------------------------------------------------------------
// Entity -- one particle. 32 bytes, 16-byte aligned.
//
// Lives in EntityBuffer (binding 0). Mirrored by no one: every shader that
// touches entities includes this file.
// ---------------------------------------------------------------------------
struct Entity {
    pos_vel: vec4f,  // xy: pos    zw: vel
    misc: vec4f,     // x: size    y: config_index(i)    zw: col_params
}

fn e_pos(e: Entity) -> vec2f          { return e.pos_vel.xy; }
fn e_vel(e: Entity) -> vec2f          { return e.pos_vel.zw; }
fn e_size(e: Entity) -> f32           { return e.misc.x; }
fn e_config_index(e: Entity) -> i32   { return bitcast<i32>(e.misc.y); }

// ---------------------------------------------------------------------------
// LIFETIME -- a negative config_index means the particle is DEAD.
//
// NO LAYOUT CHANGE. Entity is full at 32 bytes and every lane is spoken for, so
// a dead FLAG would have meant widening the struct and editing
// layout.fixture.json in lockstep. It is not needed: config_index is already an
// i32 riding a float lane, and no real config index is ever negative -- so the
// sign bit was free the whole time.
//
// EVERY READER MUST TEST THIS BEFORE THE CONFIG LOOKUP. \`entityUpdate\` clamps
// config_index into range (\`clamp(idx, 0, count-1)\`), which would quietly turn
// a dead particle into a config-0 particle rather than skipping it. The clamp is
// correct for its own purpose -- it makes a SHRUNK ConfigBuffer degrade
// gracefully -- so the dead test goes above it rather than replacing it.
//
// The studio produces these only through BC_KILL, and its reset frame brings
// them back (see the dead-particle note in entityUpdate's \`main\`).
// ---------------------------------------------------------------------------
// \`make_entity_dead\` is NOT here: it calls make_entity, which is declared below,
// and WGSL requires declaration before use. It sits under that function instead.
const DEAD_CONFIG: i32 = -1;

fn e_is_dead(e: Entity) -> bool { return e_config_index(e) < 0; }

// RAW OUTPUT FROM THE PARTICLE'S BRAIN, kept for rendering rather than physics.
// entity_update writes these; the particle camera turns them into a hue.
//
// .x is a raw force term from the black box -- deliberately arbitrary, tuned by
// eye, so nothing downstream should read meaning into its scale.
// .y is the particle's COHORT INDEX, which cam_brush reads when Color By
// Cohort is on.
//
// The RENDERER decides what these look like. Storing the raw signals instead of
// a finished hue is what lets Color Sensitivity be dragged without re-running
// the simulation, which is where the reference put it.
fn e_col_params(e: Entity) -> vec2f { return e.misc.zw; }

fn make_entity(pos: vec2f, vel: vec2f, size: f32, config_index: i32,
               col_params: vec2f) -> Entity {
    return Entity(vec4f(pos, vel),
                  vec4f(size, bitcast<f32>(config_index), col_params));
}

// Same, for the paths that have no colour signal to offer -- reset() runs
// before any behaviour is computed. Zero is a valid hue, so this is not a
// sentinel; the entity simply gets its colour on the next real step.
//
// RENAMED from the GLSL, which overloads \`make_entity\` on arity -- WGSL has no
// function overloading. The delegation is kept: this is the 5-arg form with a
// zero colour, not a second implementation.
fn make_entity_reset(pos: vec2f, vel: vec2f, size: f32,
                     config_index: i32) -> Entity {
    return make_entity(pos, vel, size, config_index, vec2f(0.0));
}

// A DEAD particle -- see the lifetime block above \`e_is_dead\`.
//
// Everything is zeroed rather than left stale: a readback of the buffer stays
// legible, and nothing downstream can be fooled by a plausible-looking position
// on a particle that is not there. A size of 0 means that even a consumer which
// somehow skipped the dead test would draw a zero-area sprite.
//
// DECLARED HERE, not beside e_is_dead, because it calls make_entity above and
// WGSL requires declaration before use.
fn make_entity_dead() -> Entity {
    return make_entity(vec2f(0.0), vec2f(0.0), 0.0, DEAD_CONFIG, vec2f(0.0));
}

// ---------------------------------------------------------------------------
// COORDINATE CONVENTION -- the one canonical implementation.
//
// World space is AREA-PRESERVING. With ca = canvas_res.x / canvas_res.y:
//
//     world = [-sqrt(ca), +sqrt(ca)]  x  [-1/sqrt(ca), +1/sqrt(ca)]
//
// so the world always has area 4 regardless of canvas aspect, and a circle in
// world space stays a circle on screen. On a square canvas ca == 1 and this
// reduces exactly to the familiar [-1,1] x [-1,1].
//
// NO OTHER FILE MAY WRITE ASPECT-RATIO MATH. Every world<->uv<->ndc
// conversion goes through the functions below (and their TypeScript mirrors in
// src/particleSystem/coords.ts). The reference implementation had six divergent
// copies of this math, at least one of which contradicted the others; that is
// the specific failure this rule exists to prevent.
//
// THE WORLD IS A TORUS ONLY IN BC_WRAP. The boundary mode decides the world's
// topology, so anything that crosses an edge must ask: world_wrap for wrap,
// world_bounce for bounce, and world_to_uv_bc for every texture read.
//
// SEVERAL FUNCTIONS BELOW HAVE NO EXTERNAL CALLER. world_half_extent,
// world_to_uv, uv_to_world, edge_fold, letterbox_scale and screen_ndc_to_world
// are each an internal composition step of one that does. They are load-bearing,
// not dead. WGSL does not warn about unused module-scope functions.
// ---------------------------------------------------------------------------

// Half-extent of world space on each axis, from canvas aspect ca = res.x/res.y.
fn world_half_extent(ca: f32) -> vec2f {
    let s = sqrt(ca);
    return vec2f(s, 1.0 / s);
}

fn world_half_extent_from_res(canvas_res: vec2f) -> vec2f {
    return world_half_extent(canvas_res.x / canvas_res.y);
}

// Scale a uv-space delta into the aspect-corrected metric -- literally
// world_half_extent applied as a scale, which is why it lives here rather than
// being its own piece of aspect math. World space is area-preserving, so a raw
// uv delta is anisotropic on a non-square canvas; brushes measured in this
// metric stay circular, and a ring drawn in it matches the brush that paints
// in it. Used by strafe_draw (painting) and frame_assembly (the reticle that
// must agree with it).
fn aspect_correct_uv(d: vec2f, canvas_res: vec2f) -> vec2f {
    return d * world_half_extent_from_res(canvas_res);
}

// World -> texture uv [0,1]. In BC_WRAP the canvas textures are sampled with a
// repeating sampler and the sampler does the wrapping, so uv is deliberately
// left unclamped. Every other boundary mode must go through world_to_uv_bc.
fn world_to_uv(p: vec2f, canvas_res: vec2f) -> vec2f {
    return p / (2.0 * world_half_extent_from_res(canvas_res)) + 0.5;
}

// World -> texture uv, honoring the boundary mode. Only BC_WRAP leaves uv free
// for the sampler's repeat to handle; the others clamp, so a sensor reaching
// past the edge reads the edge rather than the far side of the world.
fn world_to_uv_bc(p: vec2f, canvas_res: vec2f, bc: i32) -> vec2f {
    let uv = world_to_uv(p, canvas_res);
    // select(false_value, true_value, condition) -- the argument order is the
    // reverse of GLSL's \`cond ? a : b\`.
    return select(clamp(uv, vec2f(0.0), vec2f(1.0)), uv, bc == BC_WRAP);
}

fn uv_to_world(uv: vec2f, canvas_res: vec2f) -> vec2f {
    return (uv - 0.5) * 2.0 * world_half_extent_from_res(canvas_res);
}

// The corner of an instanced quad, in TRIANGLE-STRIP order, as a 0..1 uv:
// (0,0) (1,0) (0,1) (1,1) for vertex_id 0..3. The matching offset from the quad
// centre is \`(strip_corner(v) * 2.0 - 1.0) * half_size\`, which pairs uv and
// corner by construction -- they are the same value.
//
// ARITHMETIC, NOT A LOOKUP TABLE, and that is the reason this exists. The
// per-particle sprite shaders (camBrush.wgsl; the brush pass before it became
// a point splat) used \`var offsets = array<vec2f, 4>(...)\` indexed by vertex_id.
// A local array indexed by a non-constant is spilled to per-thread scratch
// memory by the browser's shader compilers (the same trap that made
// entityUpdate's by-value Rule so slow), and a sprite shader runs four times
// per particle. Do not turn this back into a table.
//
// Strip, not fan: WebGPU has no triangle-fan, and a strip over the desktop's
// fan order (brush.vert:25-36) draws a bowtie.
fn strip_corner(vertex_id: u32) -> vec2f {
    return vec2f(f32(vertex_id & 1u), f32(vertex_id >> 1u));
}

// World -> normalized device coords [-1,1] for rasterizing into the canvas.
fn world_to_ndc(p: vec2f, canvas_res: vec2f) -> vec2f {
    return p / world_half_extent_from_res(canvas_res);
}

// Wrap a world position into the world bounds. BC_WRAP only -- the world is a
// torus in that mode alone.
//
// DO NOT REWRITE fract() AS \`%\`. \`p\` here is freely signed (a world position
// past either edge), so \`p / size - 0.5\` is routinely negative, and WGSL's \`%\`
// is truncated where this needs floored behaviour. WGSL defines fract(x) as
// \`x - floor(x)\`, identical to GLSL, so it translates verbatim and correctly --
// the \`%\` "cleanup" would break wrap for every particle leaving the left or
// bottom edge.
fn world_wrap(p: vec2f, canvas_res: vec2f) -> vec2f {
    let extent = world_half_extent_from_res(canvas_res);
    let size = 2.0 * extent;
    return size * (fract(p / size - 0.5) - 0.5);
}

// Reflect a coordinate given in edge units back into [-1,1]. A triangle wave,
// so it is correct for ARBITRARY overshoot. The reference's single-fold version
// (sign(x)*(1-abs(1-abs(x)))) silently teleported a particle to the far side
// once it passed 2x the edge in one step, which heavy gravity reaches.
//
// GLSL's mod() is floored and WGSL's \`%\` is truncated, so they are NOT
// interchangeable in general. They agree here because the dividend is abs(x),
// non-negative BY CONSTRUCTION rather than by caller convention, and the
// divisor is a positive literal. That is what makes \`%\` safe -- if the abs()
// ever goes away, this needs a floored mod again.
fn edge_fold(x: f32) -> f32 {
    let t = abs(x) % 2.0;
    return sign(x) * (1.0 - abs(1.0 - t));
}

// What world_bounce returns. GLSL passed p and v as \`inout\`; WGSL has no
// inout, so the pair comes back as a struct. (A ptr<function, vec2f> parameter
// would also work, but a return struct reads better at the one call site.)
struct BounceResult {
    pos: vec2f,
    vel: vec2f,
}

// Reflect a position off the world bounds, flipping the velocity components
// that crossed. Position and velocity move together: reflecting the position
// without reversing the velocity would just re-trigger the bounce every frame,
// pinning the particle to the wall.
//
// THE ORDER BELOW IS LOAD-BEARING: the velocity flips are decided against the
// PRE-FOLD position, and only then is the position folded. Computing the folded
// position first and testing that would silently change the exact-boundary case.
fn world_bounce(p: vec2f, v: vec2f, canvas_res: vec2f) -> BounceResult {
    let extent = world_half_extent_from_res(canvas_res);
    var vel = v;
    if (abs(p.x) > extent.x) { vel.x = -vel.x; }
    if (abs(p.y) > extent.y) { vel.y = -vel.y; }
    let pos = vec2f(edge_fold(p.x / extent.x), edge_fold(p.y / extent.y)) * extent;
    return BounceResult(pos, vel);
}

// ---------------------------------------------------------------------------
// THE VIEW TRANSFORM -- world to screen, through camera and letterbox.
//
//     world  --/half_extent-->  canvas ndc
//            --(-pan, *zoom)->  view ndc
//            --*letterbox---->  screen ndc [-1,1]
//
// THREE INDEPENDENT ASPECT QUANTITIES, never conflate them:
//   canvas_res  simulation texture size; defines world space
//   window_res  framebuffer size in pixels; changes on resize
//   letterbox   derived fit of one into the other; never stored
//
// ZOOM: bigger = zoomed IN (a magnification factor). zoom=1 fits the world.
// PAN:  world units. pan is the world point at the center of the view.
// ---------------------------------------------------------------------------

// Scale fitting the canvas box into the window, preserving shape. The axis
// that would overflow shrinks; the other stays 1.0, and the slack is the
// letterbox bar. Fit, not fill: the whole canvas is always visible.
fn letterbox_scale(canvas_res: vec2f, window_res: vec2f) -> vec2f {
    if (window_res.x <= 0.0 || window_res.y <= 0.0) { return vec2f(1.0); }
    let canvas_aspect = canvas_res.x / canvas_res.y;
    let window_aspect = window_res.x / window_res.y;
    return select(
        vec2f(1.0, window_aspect / canvas_aspect),  // bars top/bottom
        vec2f(canvas_aspect / window_aspect, 1.0),  // bars left/right
        window_aspect > canvas_aspect);
}

fn world_to_screen_ndc(p: vec2f, canvas_res: vec2f, window_res: vec2f,
                       pan: vec2f, zoom: f32) -> vec2f {
    let ndc = world_to_ndc(p - pan, canvas_res) * zoom;
    return ndc * letterbox_scale(canvas_res, window_res);
}

fn screen_ndc_to_world(ndc: vec2f, canvas_res: vec2f, window_res: vec2f,
                       pan: vec2f, zoom: f32) -> vec2f {
    var v = ndc / letterbox_scale(canvas_res, window_res);
    if (zoom != 0.0) { v /= zoom; }
    return uv_to_world(v * 0.5 + 0.5, canvas_res) + pan;
}

// Screen ndc -> canvas uv, for the present pass sampling the canvas texture.
// Values outside [0,1] fall in the letterbox bars; the caller decides whether
// to clamp, wrap (tiling) or paint them black.
fn screen_ndc_to_canvas_uv(ndc: vec2f, canvas_res: vec2f, window_res: vec2f,
                           pan: vec2f, zoom: f32) -> vec2f {
    return world_to_uv(
        screen_ndc_to_world(ndc, canvas_res, window_res, pan, zoom),
        canvas_res);
}

// ==== end include: common.wgsl ====

// HOW MANY SLOTS RIDE THE APPEARANCE TABLE. Must equal \`SLOT_COUNT\` in
// \`sand/palette.ts\`, which is the length of the ConfigData array and therefore
// the range a particle's config_index can take; \`shaders.test.ts\` asserts they
// agree. A mismatch would colour the materials above the cut from whatever
// followed the array in memory.
const SWATCH_COLOR_COUNT: i32 = 40;

// THE THREE COLOUR MODES. Mirrored from \`sand/colorMode.ts\`, whose
// \`colorModeIndex\` produces exactly these; shaders.test.ts pins the pair.
//
// Zero is BEHAVIOR so that a uniform which failed to be written (all zeroes)
// renders the original look rather than an unrecognised mode.
const MODE_BEHAVIOR: i32 = 0;
const MODE_COHORT: i32   = 1;
const MODE_SWATCH: i32   = 2;

struct CamBrushUniforms {
    canvas_res : vec4f,   // xy: canvas size   zw: window size
    camera     : vec4f,   // xy: pan   z: zoom   w: reserved
    // x: sprite_size   y: particle_alpha   zw: unused
    //
    // \`z\` HELD ONE COLOUR SENSITIVITY FOR THE WHOLE FRAME, taken from the
    // master slot. It is unwritten now that every slot carries its own -- see
    // the table below. Left empty rather than reused so a stale read is a
    // visible zero rather than a plausible wrong number.
    sprite     : vec4f,
    // x: color_mode(i)   y: highlighted cohort (< 0 = none)   zw: reserved
    flags      : vec4f,
    // ONE SLOT'S WHOLE APPEARANCE PER ENTRY, indexed by config_index:
    //
    //   xy  hue and saturation, the authored swatch colour (Swatch mode)
    //   z   color_sensitivity, the coefficient A  (the two signal modes)
    //   w   color_offset, the bias B              (the two signal modes)
    //
    // A vec4f array rather than a vec2f one because a uniform array's elements
    // are padded to 16 bytes each in the std140-style layout WGSL uses for the
    // \`uniform\` address space -- declaring it as vec2f would reserve the same
    // memory while making the stride a lie. Saying vec4f kept the shape honest,
    // and left exactly the room the two coefficients needed when appearance
    // became per-config: all four lanes are data now.
    swatches   : array<vec4f, 40>,
}

@group(0) @binding(0) var<uniform> u : CamBrushUniforms;
// READ-ONLY, in the VERTEX STAGE. A vertex stage cannot write storage at all,
// so \`read\` is not a choice here.
@group(0) @binding(1) var<storage, read> entities : array<Entity>;

fn color_mode() -> i32 { return bitcast<i32>(u.flags.x); }

// One slot's appearance entry, clamped into the table.
//
// CLAMPED RATHER THAN TRUSTED: \`config_index\` is bounds-checked everywhere it
// is read in the physics (\`entityUpdate.wgsl\` clamps it too), and an index past
// the table here would be an out-of-bounds uniform read. The dead-particle test
// in the vertex stage means this is never reached with a negative index, but
// the clamp costs nothing and makes the read safe on its own terms.
//
// THE ONE PLACE THAT INDEXES THE TABLE, so the clamp is written once and the
// two readers below cannot disagree about which slot they are describing.
fn swatch_entry(index: i32) -> vec4f {
    return u.swatches[clamp(index, 0, SWATCH_COLOR_COUNT - 1)];
}

// A swatch's authored hue and saturation. Swatch mode's colour.
fn swatch_color(index: i32) -> vec2f {
    return swatch_entry(index).xy;
}

// THIS SLOT'S HUE COEFFICIENTS: x is sensitivity (A), y is offset (B), for
// \`hue = A * signal + B\`.
//
// PER-SLOT, WHICH IS THE POINT. The camera used to take one sensitivity for the
// whole frame from the master slot, so every material on screen answered to the
// master's slider and each other slot's copy was saved and silently ignored.
// Read by the particle's own config_index, a material's colour settings now
// describe that material.
fn hue_coefficients(index: i32) -> vec2f {
    return swatch_entry(index).zw;
}

// The cohort the mouse is resting on, or negative when none is. A PLAIN FLOAT
// AND NOT A SEPARATE BOOLEAN LANE: cohorts are non-negative (\`get_cohort\` is a
// non-negative ramp), so "no highlight" has a spare value of its own and a
// second lane could only ever disagree with this one.
fn highlighted_cohort() -> f32 { return u.flags.y; }
// Cohort mode only: 0 = pure cohort colours, 1 = pure behaviour colours.
// The evolver fades through it so colour-by-cohort never pops.
fn cohort_color_fade() -> f32 { return u.flags.z; }

// How far apart consecutive cohorts land on the hue wheel. Three quarters of a
// turn separates neighbours without the arbitrary jumble a hash gives, and hue
// is periodic so it wraps on its own -- no normalizing by the cohort count.
const COHORT_COLOR_CONSTANT: f32 = 0.75;

// THE TWO HIGHLIGHT KNOBS. Both describe what a particle OUTSIDE the
// highlighted cohort KEEPS, so both run 0..1 and 1.0 is "no effect" -- setting
// both to 1.0 disables the visual highlight without disabling the two-stage
// selection that depends on it.
//
// Tweak these; do not tweak the arithmetic at the bottom of the fragment stage.
const COHORT_DIM: f32 = 0.125;    // ...of its brightness
const COHORT_WASH: f32 = 0.25;    // ...of its saturation

struct VsOut {
    @builtin(position) clip : vec4f,
    @location(0) uv : vec2f,
    @location(1) pos_vel : vec4f,
    // \`flat\` because every vertex of a sprite reads the same entity, so the
    // value is constant across the quad -- interpolating it would be four
    // identical corners' worth of arithmetic for the same answer. Dropping the
    // attribute does not error: the hue would simply interpolate across each
    // sprite, which reads as a rendering style rather than as a bug.
    @location(2) @interpolate(flat) col_params : vec2f,
    // WHICH SWATCH PAINTED THIS PARTICLE, for Color By Swatch.
    //
    // \`flat\` and an i32 for the same reason as above and one more: a config
    // index is an identity, not a quantity, so interpolating it across the quad
    // would produce indices that belong to no material at all. It is carried
    // rather than re-read in the fragment stage because the entity buffer is
    // bound to the VERTEX stage only -- see the binding's note.
    @location(3) @interpolate(flat) config_index : i32,
}

// Rotate a local offset into the entity's velocity frame, so the sprite is
// oriented along travel. Falls back to axis-aligned when nearly stationary.
//
// An \`if\`, NOT \`select()\`. \`select\` evaluates both arms, and the discarded arm
// here is \`normalize(vec2f(0.0))\` -- a divide by zero. The same decision
// recorded in web/README.md for the engine's singularity guards.
fn to_velocity_frame(offset: vec2f, vel: vec2f) -> vec2f {
    if (dot(vel, vel) == 0.0) { return offset; }
    let forward = normalize(vel);
    let left = vec2f(-forward.y, forward.x);
    return forward * offset.x + left * offset.y;
}

@vertex
fn vs_main(@builtin(vertex_index) vertex_id : u32,
           @builtin(instance_index) instance_id : u32) -> VsOut {
    let e = entities[instance_id];

    // DEAD PARTICLES ARE NOT DRAWN, culled in the vertex stage so that at a
    // mostly-empty sand world, where dead particles are nearly the whole draw,
    // no fragment cost is paid. A w of 0 empties the clip volume, so nothing is
    // rasterized.
    if (e_is_dead(e)) {
        var dead : VsOut;
        dead.clip = vec4f(0.0, 0.0, 0.0, 0.0);
        dead.uv = vec2f(0.0);
        dead.pos_vel = vec4f(0.0);
        dead.col_params = vec2f(0.0);
        // ZERO, not the entity's own index -- a dead particle's is negative
        // (that IS the death flag), and nothing downstream should see one.
        // Nothing is rasterized from this vertex anyway; this keeps the struct
        // fully written rather than leaving one field to whatever was there.
        dead.config_index = 0;
        return dead;
    }

    let entity_pos = e_pos(e);
    let entity_vel = e_vel(e);
    let size = e_size(e) * u.sprite.x;

    // STRIP ORDER -- (-,-) (+,-) (-,+) (+,+) -- not the fan order of
    // cam_brush.vert:46-54. TRIANGLE_FAN is not a WebGPU topology, and a strip
    // over the fan's vertex order draws a bowtie.
    //
    // The uv and the offset are ONE value (strip_corner, common.wgsl), so they
    // cannot be permuted apart. That matters more than it looks: the fragment
    // kernel below is \`gaussian(uv - 0.5)\` gated by \`length(uv - 0.5) > 0.5\`,
    // which is RADIALLY SYMMETRIC about the quad's centre -- so a mismatched
    // pairing would render a pixel-identical sprite and could not be caught by
    // looking at it. Computed, not looked up: see strip_corner for why.
    let corner = strip_corner(vertex_id);
    let offset = (corner * 2.0 - 1.0) * size;

    // The offset is added in WORLD space, before the transform, which is what
    // makes particles world-sized: they grow as you zoom in, exactly as if you
    // were moving closer to a physical object.
    let vertex_pos = entity_pos + to_velocity_frame(offset, entity_vel);

    // ========================================================================
    // NO Y FLIP HERE -- and note that the old brush pass, which this file
    // otherwise mirrored, DID negate y. The difference is the TARGET, not the
    // shader.
    //
    //   brush pass    rasterized into the CANVAS TEXTURE, which is read back
    //                 through world_to_uv (y-up). WebGPU's top-left framebuffer
    //                 origin means an unflipped y-up NDC deposits into the
    //                 mirrored row from the one the sensor reads -- a feedback
    //                 loop reading its own mirror. Hence the negation there.
    //                 (The splat is now an atomic deposit that indexes the
    //                 canvas by texture row, with no rasterizer and no flip.)
    //
    //   camBrush.wgsl rasterizes into the HDR SCREEN target, which is consumed
    //                 by accumulate -> frameAssembly -> swap chain, all
    //                 unflipped fullscreen passes. Its only correctness partner
    //                 is camera.wgsl (TRAIL), which walks this same transform
    //                 BACKWARDS from an unflipped quad. The two modes agree
    //                 exactly when neither flips.
    //
    // THAT AGREEMENT IS THE TEST. camera.py:14-18 -- toggling between TRAIL and
    // PARTICLES must not shift the image. If this file gained a flip, PARTICLES
    // would be vertically mirrored relative to TRAIL, which IS visible: switch
    // ?camera=trail to ?camera=particles and watch whether the structure jumps.
    // ========================================================================
    var out : VsOut;
    out.clip = vec4f(
        world_to_screen_ndc(vertex_pos, u.canvas_res.xy, u.canvas_res.zw,
                            u.camera.xy, u.camera.z),
        0.0, 1.0);
    out.uv = corner;
    out.pos_vel = vec4f(entity_pos, entity_vel);
    out.col_params = e_col_params(e);
    out.config_index = e_config_index(e);
    return out;
}

// Duplicated from camera.wgsl deliberately -- the GLSL duplicates it too
// (\`camera.frag:26\`, \`cam_brush.frag:37\`) and it is NOT in common.glsl, so
// hoisting it would make common.wgsl diverge from the file it mirrors.
fn hsv2rgb(c: vec3f) -> vec3f {
    let K = vec4f(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    let p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, vec3f(0.0), vec3f(1.0)), c.y);
}

fn gaussian(pos: vec2f, sigma: f32) -> f32 {
    let sigma2 = sigma * sigma;
    let norm = 1.0 / (2.0 * 3.14159265359 * sigma2);
    return norm * exp(-dot(pos, pos) / (2.0 * sigma2));
}

@fragment
fn fs_main(in: VsOut) -> @location(0) vec4f {
    let centered = in.uv - 0.5;
    if (length(centered) > 0.5) { discard; }   // circular sprite, not a square

    let kernel = gaussian(centered, 0.163);

    // THE THREE COLOUR MODES. Exactly one applies -- see \`sand/colorMode.ts\` on
    // why this is an enumerated mode rather than two independent toggles.
    //
    // Hue is periodic, so no clamping or wrapping is needed anywhere here -- a
    // large signal simply travels further around the wheel, and a bias past the
    // end of the wheel arrives back at the start.
    //
    // ## THE TWO SIGNAL MODES ARE \`hue = A * signal + B\`
    //
    // A is Color Sensitivity, B is Color Offset, and BOTH COME FROM THE SLOT
    // THE PARTICLE WAS PAINTED FROM -- see \`hue_coefficients\`. They differ only
    // in which signal they multiply:
    //
    //   BEHAVIOR  the brain's own output, whose scale is arbitrary, so A is
    //             what makes it legible as hue at all.
    //   COHORT    the cohort index times a fixed spacing, so A sets how far
    //             apart the populations sit on the wheel.
    //
    // WHAT B BUYS: without it every material starts at hue 0 and fans out from
    // red, so two configs with similar signals are indistinguishable and a
    // palette cannot be composed. The bias moves a population to its own corner
    // of the wheel and lets A read as variation WITHIN that colour. A alone
    // could never do this -- it scales the signal, so at any gain the hue still
    // passes through 0 wherever the signal does.
    //
    // A RUNS -1..1 and B RUNS 0..1 (see settingsSpec.ts). A is signed because
    // reversing which way a signal pushes the hue is meaningful; B spans the
    // wheel exactly once, and since hue is periodic that is every colour there
    // is -- a signed range would only offer each one twice.
    //
    // SWATCH MODE USES NEITHER, and that is not an oversight. The other two
    // derive a hue from a number whose scale is arbitrary; a swatch colour was
    // CHOSEN. Applying a gain would rotate every material away from the colour
    // its author picked, and a bias would do it twice over -- the picker
    // already puts the hue exactly where the author wants it. It is also the
    // only mode that carries its own saturation, which is the whole reason it
    // exists -- the other two pin it at 0.8.
    var hue : f32;
    var behavior_hue = 0.0;
    var saturation = 0.8;
    let mode = color_mode();
    if (mode == MODE_SWATCH) {
        let picked = swatch_color(in.config_index);
        hue = picked.x;
        saturation = picked.y;
    } else {
        // ONE LOOKUP FOR BOTH SIGNAL MODES, which is what keeps them honestly
        // the same expression over two different signals.
        let ab = hue_coefficients(in.config_index);
        let signal = select(in.col_params.x,
                            in.col_params.y * COHORT_COLOR_CONSTANT,
                            mode == MODE_COHORT);
        hue = ab.x * signal + ab.y;
        behavior_hue = ab.x * in.col_params.x + ab.y;
    }

    // THE COHORT HIGHLIGHT. \`col_params.y\` is floor(cohort)
    // (entityUpdate.wgsl:531) and the highlighted cohort arrives already
    // floored by entityPick.wgsl's derive pass, so both sides of this
    // comparison are integers-in-a-float and \`==\` is exact. Comparing a floored
    // value against a raw one would match nothing and dim the entire field.
    //
    // INDEPENDENT OF THE COLOUR MODE. The highlight answers "which particles am
    // I about to select", the mode answers "how is hue assigned" -- a user
    // colouring by the black-box signal, or by swatch, still needs to see what a
    // click will take. Applied to the returned COLOUR rather than to alpha, so
    // it dims what the particle contributes without changing the additive
    // blend's shape.
    // TWO KNOBS, BOTH APPLIED TO THE SAME PARTICLES. Brightness alone reads as
    // "further away"; pulling the colour toward grey as well reads as "not the
    // thing you are looking at", which is what the highlight actually means. The
    // saturation is the one below, so the wash multiplies it rather than
    // replacing it -- COHORT_WASH of 1.0 leaves the hue exactly as it was and
    // turns this half off, the same way COHORT_DIM of 1.0 turns the other half
    // off.
    var dim = 1.0;
    var wash = 1.0;
    if (highlighted_cohort() >= 0.0 && in.col_params.y != highlighted_cohort()) {
        dim = COHORT_DIM;
        wash = COHORT_WASH;
    }

    // \`saturation\` rather than a literal 0.8: the two signal modes set it to
    // exactly that above, so their output is unchanged, while Swatch mode
    // carries the saturation its author picked. The wash still multiplies it,
    // so a desaturated swatch washes further toward grey when it is outside the
    // highlighted cohort -- which is the highlight doing its job in every mode.
    var rgb = hsv2rgb(vec3f(hue, saturation * wash, 1.0));
    if (mode == MODE_COHORT) {
        rgb = mix(rgb, hsv2rgb(vec3f(behavior_hue, saturation * wash, 1.0)),
                  clamp(cohort_color_fade(), 0.0, 1.0));
    }
    return vec4f(rgb * kernel * u.sprite.y * dim, 1.0);
}
`,El=`// Add one temporal sample into the accumulation buffer.
// A port of \`camera/shaders/accumulate.frag\`.
//
// This is the whole of motion blur's math. The pass runs with ONE, ONE
// blending, so the accumulator receives a straight sum; weighting each sample
// by 1/N here rather than dividing the sum at the end is what makes that sum a
// box average.
//
// WHY BLENDING, RATHER THAN READ-MODIFY-WRITE. The obvious implementation binds
// the accumulator as a sampler and adds to what it reads -- which is what the
// original Fluoddity does, and which is undefined behaviour: a texture must not
// be sampled while it is attached to the bound framebuffer. It happens to work
// there because sampling is 1:1 at the fragment's own uv. Letting the blend unit
// do the addition is both correct and cheaper, and it removes the reference's
// is_first_frame branch: clearing once per cycle IS the reset.
//
// On the web that argument gains teeth -- WebGPU does not merely leave the
// read-while-attached case undefined, it rejects the bind group outright.
// ==== begin include: fullscreenQuad.wgsl ====
// The fullscreen quad, shared by every pass that covers the screen.
//
// The desktop's \`shared/shaders/fullscreen_quad.vert\` is shared across five
// consumers; this is that file. Consumers here:
//
//   camera/shaders/camera.wgsl              TRAIL present
//   camera/shaders/accumulate.wgsl          motion blur accumulation
//   assembler/shaders/bloomDownsample.wgsl  the mip chain, down
//   assembler/shaders/bloomUpsample.wgsl    the mip chain, up
//   assembler/shaders/frameAssembly.wgsl    bloom, tone curve, overlays
//   webcam/shaders/cameraPreview.wgsl       the Camera tab's thumbnail
//   webcam/shaders/camera{Ingest,Blur,Map}.wgsl -- the VERTEX only. They render
//                                           into textures the particles sample,
//                                           so they index by @builtin(position)
//                                           and ignore \`uv\`; see cameraIngest.
//
// NOT a consumer: \`particleSystem/shaders/canvas.wgsl\`. It needs the V FLIP
// (see its header) because it rasterizes into the canvas texture and every
// fragment must read the texel it is about to write; every consumer above needs
// NO flip. Merging the two behind a boolean parameter would put the single most
// dangerous decision in this port -- the one Step 4 lost the most time to --
// behind an argument that is easy to pass wrong and impossible to see in a
// diff. Two small definitions, each unconditionally correct, is the right shape.
//
// WHY NOT IN common.wgsl. That file declares no bindings and must stay
// stage-agnostic (its own editing rules 3 and 4), and a \`@vertex\` entry point
// is the opposite of stage-agnostic. It is also parsed by \`common.wgsl.test.ts\`
// against the generated layout descriptor, so unrelated additions there are
// noise in a file whose job is struct layout.
//
// NO VERTEX BUFFER. The quad comes from \`@builtin(vertex_index)\`, so there is
// nothing to allocate, bind or keep in sync. Drawn as \`draw(4)\` with
// \`topology: 'triangle-strip'\` -- TRIANGLE_FAN is not a WebGPU topology, which
// is why the corner order below is strip order rather than the desktop's fan.

struct FsQuadVsOut {
    @builtin(position) clip : vec4f,
    @location(0) uv : vec2f,
}

// Strip order: (-,-) (+,-) (-,+) (+,+). The same order \`canvas.wgsl\` and the
// deleted \`debugPresent.wgsl\` use, so all four agree by inspection.
fn fullscreen_corner(vi: u32) -> vec2f {
    var corners = array<vec2f, 4>(
        vec2f(-1.0, -1.0),
        vec2f( 1.0, -1.0),
        vec2f(-1.0,  1.0),
        vec2f( 1.0,  1.0),
    );
    return corners[vi];
}

// NO Y FLIP, for every consumer of this entry point.
//
// The canvas texture is stored TOP-LEFT-ORIGIN: the trail deposit
// (entityUpdate.wgsl) writes each pixel at the texture row \`get_can\` samples,
// and canvas.wgsl flips v to read back the texel it writes, so the stored image
// matches WebGPU's framebuffer convention. Sampling it straight therefore puts
// world +y at the top of the screen, matching the desktop. See \`web/README.md\`'s
// Y-flip section.
//
// The intermediate targets (hdr, accum, the bloom mips) are all WRITTEN by
// passes using this entry point and READ by passes using this entry point, so
// they are internally consistent whatever convention is chosen -- the only
// externally observable flips are \`camera.wgsl\` reading the canvas and
// \`frameAssembly.wgsl\` reading the strafe field, and both want none.
@vertex
fn fullscreen_vs(@builtin(vertex_index) vi : u32) -> FsQuadVsOut {
    let p = fullscreen_corner(vi);
    var out : FsQuadVsOut;
    out.clip = vec4f(p, 0.0, 1.0);
    out.uv = p * 0.5 + 0.5;
    return out;
}

// ==== end include: fullscreenQuad.wgsl ====

struct AccumulateUniforms {
    // x: inv_samples   yzw: reserved
    params : vec4f,
}

@group(0) @binding(0) var<uniform> u : AccumulateUniforms;
@group(0) @binding(1) var hdr : texture_2d<f32>;
@group(0) @binding(2) var hdr_sampler : sampler;

@fragment
fn fs_main(in: FsQuadVsOut) -> @location(0) vec4f {
    // 1.0 / sample count. The count is DERIVED from the cadence, not the target
    // the user asked for -- see camera/blurSchedule.ts. Passed as a uniform
    // rather than baked in as a constant so changing the slider does not
    // recompile a shader mid-frame.
    //
    // Alpha is written as 1.0 and the blend adds it, so after N samples the
    // accumulator's alpha is N. That is harmless and deliberate: frameAssembly
    // reads .rgb only, and the swap chain is opaque. Do not "fix" it to 0 --
    // it would change nothing visible while making the buffer's meaning murkier.
    return vec4f(
        textureSampleLevel(hdr, hdr_sampler, in.uv, 0.0).rgb * u.params.x,
        1.0);
}
`;class ii{device;state;targetFormat=Pe;targets;trailPipeline=null;trailUniformLayout=null;trailTextureLayout=null;trailUniformGroup=null;particlePipeline=null;particleLayout=null;particleGroup=null;particleGroupBuffer=null;accumPipeline=null;accumLayout=null;accumGroup=null;viewUniforms;camBrushUniforms;accumUniforms;canvasSampler;canvasGroups=new WeakMap;samplesTaken=0;direct=!1;constructor(e,t,s){this.device=e,this.state=t,this.targets=s,this.viewUniforms=e.createBuffer({label:"CameraViewUniforms",size:ei,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.camBrushUniforms=e.createBuffer({label:"CamBrushUniforms",size:ni,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.accumUniforms=e.createBuffer({label:"AccumulateUniforms",size:si,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.canvasSampler=e.createSampler({label:"camera-canvas",magFilter:"linear",minFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"})}static async create(e,t,s){const a=new ii(e,t,s);return await a.reload(),a}async reload(){const[e,t,s]=await Promise.all([$(this.device,"camera.wgsl",yl),$(this.device,"camBrush.wgsl",_l),$(this.device,"accumulate.wgsl",El)]);this.buildTrail(e),this.buildParticles(t),this.buildAccumulate(s)}buildAccumulate(e){const t=this.device;if(e===null){this.accumPipeline=null;return}this.accumLayout=t.createBindGroupLayout({label:"accumulate",entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:2,visibility:GPUShaderStage.FRAGMENT,sampler:{}}]}),this.accumPipeline=t.createRenderPipeline({label:"accumulate",layout:t.createPipelineLayout({bindGroupLayouts:[this.accumLayout]}),vertex:{module:e,entryPoint:"fullscreen_vs"},fragment:{module:e,entryPoint:"fs_main",targets:[{format:Pe,blend:{color:{srcFactor:"one",dstFactor:"one",operation:"add"},alpha:{srcFactor:"one",dstFactor:"one",operation:"add"}}}]},primitive:{topology:"triangle-strip"}}),this.accumGroup=null}ensureAccumGroup(){if(this.accumLayout===null)return null;const e=this.targets.hdr;return e===null?null:this.accumGroup!==null?this.accumGroup:(this.accumGroup=this.device.createBindGroup({label:"accumulate",layout:this.accumLayout,entries:[{binding:0,resource:{buffer:this.accumUniforms}},{binding:1,resource:e},{binding:2,resource:this.targets.sampler}]}),this.accumGroup)}invalidateTargets(){this.accumGroup=null,this.samplesTaken=0}buildTrail(e){const t=this.device;if(e===null){this.trailPipeline=null;return}this.trailUniformLayout=t.createBindGroupLayout({label:"camera-view",entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,buffer:{type:"uniform"}}]}),this.trailTextureLayout=t.createBindGroupLayout({label:"camera-canvas",entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:1,visibility:GPUShaderStage.FRAGMENT,sampler:{}}]}),this.trailPipeline=t.createRenderPipeline({label:"camera-trail",layout:t.createPipelineLayout({bindGroupLayouts:[this.trailUniformLayout,this.trailTextureLayout]}),vertex:{module:e,entryPoint:"fullscreen_vs"},fragment:{module:e,entryPoint:"fs_main",targets:[{format:this.targetFormat}]},primitive:{topology:"triangle-strip"}}),this.trailUniformGroup=t.createBindGroup({label:"camera-view",layout:this.trailUniformLayout,entries:[{binding:0,resource:{buffer:this.viewUniforms}}]})}buildParticles(e){const t=this.device;if(e===null){this.particlePipeline=null;return}this.particleLayout=t.createBindGroupLayout({label:"cam-brush",entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.VERTEX,buffer:{type:"read-only-storage"}}]}),this.particlePipeline=t.createRenderPipeline({label:"camera-particles",layout:t.createPipelineLayout({bindGroupLayouts:[this.particleLayout]}),vertex:{module:e,entryPoint:"vs_main"},fragment:{module:e,entryPoint:"fs_main",targets:[{format:this.targetFormat,blend:{color:{srcFactor:"one",dstFactor:"one",operation:"add"},alpha:{srcFactor:"one",dstFactor:"one",operation:"add"}}}]},primitive:{topology:"triangle-strip",cullMode:"none"}}),this.particleGroup=null,this.particleGroupBuffer=null}pipelineStatus(){return{cameraTrail:this.trailPipeline!==null,cameraParticles:this.particlePipeline!==null,accumulate:this.accumPipeline!==null}}beginFrame(e,t){this.samplesTaken=0,this.direct=t===1;const s={canvasSize:e.canvasSize,windowSize:e.windowSize,pan:this.state.pan,zoom:this.state.zoom},a=this.device.queue;a.writeBuffer(this.viewUniforms,0,gl(s)),a.writeBuffer(this.camBrushUniforms,0,wl(s,e.colorMode,e.highlightedCohort??-1,e.swatchColors??[],e.cohortColorFade??0)),a.writeBuffer(this.accumUniforms,0,bl(t))}canHold(){return this.samplesTaken>0&&this.presented()!==null}presented(){return this.direct?this.targets.hdr:this.targets.accum}clearAccumulator(e){if(this.direct)return;const t=this.targets.accum;t!==null&&e.beginRenderPass({label:"accumulate-clear",timestampWrites:re("accumulate-clear"),colorAttachments:[{view:t,clearValue:{r:0,g:0,b:0,a:1},loadOp:"clear",storeOp:"store"}]}).end()}result(){return this.samplesTaken===0?null:this.presented()}render(e,t){const s=this.targets.hdr;s!==null&&(this.state.mode==="particles"?this.renderParticles(e,s,t):this.renderTrail(e,s,t),this.direct||this.accumulate(e),this.samplesTaken+=1)}accumulate(e){const t=this.targets.accum,s=this.ensureAccumGroup();if(this.accumPipeline===null||t===null||s===null)return;const a=e.beginRenderPass({label:"accumulate",timestampWrites:re("accumulate"),colorAttachments:[{view:t,loadOp:"load",storeOp:"store"}]});a.setPipeline(this.accumPipeline),a.setBindGroup(0,s),a.draw(4),a.end()}renderParticles(e,t,s){if(this.particlePipeline===null||this.particleLayout===null)return;(this.particleGroup===null||this.particleGroupBuffer!==s.entities)&&(this.particleGroup=this.device.createBindGroup({label:"cam-brush",layout:this.particleLayout,entries:[{binding:0,resource:{buffer:this.camBrushUniforms}},{binding:1,resource:{buffer:s.entities}}]}),this.particleGroupBuffer=s.entities);const a=e.beginRenderPass({label:"camera-particles",timestampWrites:re("camera-particles"),colorAttachments:[{view:t,clearValue:{r:0,g:0,b:0,a:1},loadOp:"clear",storeOp:"store"}]});a.setPipeline(this.particlePipeline),a.setBindGroup(0,this.particleGroup),a.draw(4,s.entityCount),a.end()}renderTrail(e,t,s){if(this.trailPipeline===null||this.trailTextureLayout===null||this.trailUniformGroup===null)return;let a=this.canvasGroups.get(s.canvas);a===void 0&&(a=this.device.createBindGroup({label:"camera-canvas",layout:this.trailTextureLayout,entries:[{binding:0,resource:s.canvas},{binding:1,resource:this.canvasSampler}]}),this.canvasGroups.set(s.canvas,a));const i=e.beginRenderPass({label:"camera-trail",timestampWrites:re("camera-trail"),colorAttachments:[{view:t,clearValue:{r:0,g:0,b:0,a:1},loadOp:"clear",storeOp:"store"}]});i.setPipeline(this.trailPipeline),i.setBindGroup(0,this.trailUniformGroup),i.setBindGroup(1,a),i.draw(4),i.end()}destroy(){this.viewUniforms.destroy(),this.camBrushUniforms.destroy(),this.accumUniforms.destroy()}}const xl=4,Tl=4;function dn(n){const e=Math.max(1,Math.max(0,n));return xl+e*Tl}function Sl(n){const e=Math.max(0,n),t=new Uint32Array(new ArrayBuffer((1+e)*4));t[0]=e;for(let s=0;s<e;s++)t[s+1]=e-1-s;return t}const ri=-1;function Al(n){const e=Math.max(0,n),t=8,s=5,a=new ArrayBuffer(e*t*4),i=new Int32Array(a);for(let r=0;r<e;r++)i[r*t+s]=ri;return a}function Bs(n,e){const t=Math.max(0,n),s=Math.max(0,Math.min(e,t)),a=t-s,i=new Uint32Array(new ArrayBuffer((1+t)*4));i[0]=a;for(let r=0;r<a;r++)i[r+1]=t-1-r;return i}function Zp(n,e,t,s){if(n<=0||e<=0||t<=0)return 0;const a=Math.PI*n*n;return Math.max(0,Math.min(Math.round(a*e*t),Math.max(0,s)))}const at=8;function Fs(n){const{liveFlags:e,poolSlots:t,mark:s,capacity:a}=n,i=[];let r=0,o=-1;for(let m=0;m<a;m++)e[m]===!0&&(r++,o=m);const c=t.filter(m=>!Number.isInteger(m)||m<0||m>=a);c.length>0&&i.push({kind:"out-of-range",detail:`${c.length} pool entries are not valid indices into a ${a}-slot buffer`,samples:c.slice(0,at),count:c.length});const l=new Set,d=[];for(const m of t)l.has(m)?d.push(m):l.add(m);d.length>0&&i.push({kind:"duplicate-in-pool",detail:`${d.length} indices appear more than once in the pool -- a double free, so two brushes can be handed the same slot`,samples:d.slice(0,at),count:d.length});const h=[];for(const m of l)e[m]===!0&&h.push(m);h.length>0&&(h.sort((m,E)=>m-E),i.push({kind:"live-in-pool",detail:`${h.length} LIVE indices are in the free list -- the next spawns will overwrite existing particles`,samples:h.slice(0,at),count:h.length}));const u=[];for(let m=0;m<a;m++)e[m]!==!0&&!l.has(m)&&u.push(m);if(u.length>0&&i.push({kind:"unaccounted",detail:`${u.length} dead slots are missing from the pool -- leaked capacity, and the live count reads high by this amount`,samples:u.slice(0,at),count:u.length}),o>=s){const m=[];for(let g=s;g<a&&m.length<at;g++)e[g]===!0&&m.push(g);let E=0;for(let g=s;g<a;g++)e[g]===!0&&E++;i.push({kind:"mark-too-low",detail:`${E} live particles sit at or above the mark (${s}) -- they are skipped by every pass and drawn by nothing`,samples:m,count:E})}const w=4096;let v=null;if(n.cachedHead!==void 0){const m=Math.abs(n.cachedHead-t.length);v=m,m>w&&i.push({kind:"head-mismatch",detail:`the host believes ${n.cachedHead} slots are free but the pool holds ${t.length} -- too far apart to be readback lag, so the UI's live count is genuinely wrong`,samples:[],count:m})}return{ok:i.length===0,violations:i,liveCount:r,poolCount:t.length,mark:s,capacity:a,highestLive:o,headDrift:v}}function Cl(n){const e=`live ${n.liveCount.toLocaleString()} · pool ${n.poolCount.toLocaleString()} · mark ${n.mark.toLocaleString()} / ${n.capacity.toLocaleString()}`;if(n.ok)return`POOL OK — ${e}`;const t=n.violations[0];return`POOL BROKEN (${n.violations.length}) — ${e} — ${t?.detail??""}`}function Jp(n){const e=[Cl(n)];n.highestLive>=0&&e.push(`  highest live index: ${n.highestLive.toLocaleString()}`);const t=n.liveCount+n.poolCount;e.push(`  live + pool = ${t.toLocaleString()} (capacity ${n.capacity.toLocaleString()})`+(t===n.capacity?" ✓":" ✗ MISMATCH")),n.headDrift!==null&&e.push(`  cached head drift: ${n.headDrift.toLocaleString()} (readback lag)`);for(const s of n.violations)if(e.push(`  [${s.kind}] ${s.detail}`),s.samples.length>0){const a=s.samples.join(", "),i=s.count>s.samples.length?`, … (${s.count} total)`:"";e.push(`      e.g. ${a}${i}`)}return e.join(`
`)}function Rl(n){const e=new Uint32Array(new ArrayBuffer(n.length*4));e.set(n);const t=n[0]??0;if(t===0||t>n.length-1)return e;const s=e.subarray(1,1+t);return s.sort(),s.reverse(),e}function Il(n,e,t){return e>0&&n===e&&t===0}function Ll(n,e,t){const s=Math.max(0,Math.trunc(t)),a=Math.max(0,Math.min(s,Math.trunc(n)));if(!Number.isFinite(e))return a;const i=Math.max(0,Math.min(s,Math.trunc(e)));return Math.max(a,i)}function em(n,e){return e<=0?1:Math.max(0,Math.min(1,n/e))}const Ol=256;function zs(n){return Math.ceil(n/Ol)}const Nl=`// ============================================================================
// entityUpdate.wgsl -- the physics. The WGSL translation of
// \`particle_system/shaders/entity_update.glsl\` (581 lines).
//
// Structure, order and comments follow that file deliberately, so the two stay
// diff-comparable and an \`entity_update.glsl:NNN\` reference still lands near
// the right place. This is the file the port's fidelity is decided in.
//
// ---------------------------------------------------------------------------
// THE PROMOTION AUDIT
// ---------------------------------------------------------------------------
// GLSL promotes int to float implicitly; WGSL has NO implicit conversions at
// all. Every site below needed an explicit cast, and EVERY ONE IS
// VALUE-PRESERVING -- that is the point of having enumerated them. After this
// audit, a behavioural difference between the two apps is *not* a cast error,
// which is most of the search space gone.
//
//   :68-70   co*-1+5, co.yx-100, co.yx*-1+25   float literals
//   :85      2*float(i)                        2.0 * f32(i)
//   :111-122 float(i*8+n)                      f32(i*8+n), arithmetic kept i32
//   :209     float(index)/float(len)           f32(u32), f32(arrayLength)
//   :234     cohort_val+index+2.142            + f32(index); vec2(x) is a SPLAT
//   :254     cohort_val/float(cohorts)         cohorts is i32
//   :273     hash(vec2(cohort_val,index))      f32(index); *2-1 -> *2.0-1.0
//   :285     hash4(-.5+vec2(-i+seed,i))        -f32(i); operand order kept
//   :287     1 + amount*0.5*(...)              leading 1.0; f32(i) in the hash
//   :389     hash(vec2(..., frame_count))      f32(frame_count)
//   :439     frequency==vec4(0)                all(...) -- SEE BELOW
//
// TWO TRANSLATIONS THAT ARE NOT CASTS:
//
//  1. GLSL's \`==\` on a vector returns a SCALAR bool (whole-vector equality).
//     WGSL's returns a vec4<bool>, so \`:439\` needs \`all()\` on each side. The
//     compiler catches this one (\`&&\` on vec4<bool> is an error), but it is a
//     genuine semantic difference and not merely a cast.
//
//  2. WGSL function parameters are IMMUTABLE. GLSL's are mutable copies, and
//     \`calculate_entity_behavior\` reassigns L and R (\`:344-345\`). Those become
//     \`var\` locals here.
//
// ---------------------------------------------------------------------------
// WHAT IS DELIBERATELY NOT PORTED
// ---------------------------------------------------------------------------
//  * \`normalized_fourier_noise\` (:133) and \`random_fourier_noise\` (:128) have
//    no callers -- \`generate_random_centers\` is invoked directly at :452.
//  * The \`#ifdef HARD_FENCE\` branch (:552-556). WGSL has no preprocessor, and
//    the macro is never defined by any host path (it is a commented-out
//    \`//#define\` at :551), so the \`#else\` soft fence is the live code. See the
//    fence block below, which keeps the original comment.
//
// ---------------------------------------------------------------------------
// ON BIT-EXACTNESS
// ---------------------------------------------------------------------------
// Do not expect it, and do not chase it. WGSL permits the same FMA contraction
// GLSL does (PORT_AUDIT.md:743), and the browser's compiler need not fuse the
// same multiply-adds the desktop driver does. \`hash()\` is chaotic, so a 1-ULP
// difference in one generated coefficient produces a COMPLETELY DIFFERENT rule
// -- the same trap :446-451 documents for the host-side mirror. Two runs of the
// same preset therefore diverge into different-but-statistically-identical
// behaviour. That is expected. The verification is emergent character, judged
// by eye (docs/WEB_PORT_PLAN.md:41-45), which is exactly why.
// ============================================================================

// ==== begin include: common.wgsl ====
// ============================================================================
// common.wgsl -- shared struct definitions and coordinate math.
//
// THIS FILE IS THE SINGLE SOURCE OF TRUTH FOR GPU STRUCT LAYOUT. What the
// structs below declare is what the GPU reads.
//
// The layout is stated in ONE OTHER PLACE: \`src/particleSystem/layout.fixture.json\`,
// which is what the host packs against (\`pack.ts\`, guarded by \`assertLaneMap\`).
// Two hand-authored statements of one fact, so \`common.wgsl.test.ts\` checks the
// declarations below against that descriptor on every \`npm test\`. It is the
// shader-side counterpart of \`assertLaneMap\`; together they close the loop.
//
// If that test fails, the two have diverged and the GPU is reinterpreting memory
// the host packed to a different plan -- which does not crash, it just makes the
// simulation subtly wrong. CHANGE BOTH FILES IN THE SAME COMMIT.
//
// (The descriptor was originally generated by the Python desktop app's
// layout.py, which parsed the GLSL original of this file. That app is gone;
// there is no generator now and deliberately no replacement -- see layout.ts.)
//
// RULES FOR EDITING THIS FILE:
//
//  1. vec4-ONLY. Every member of every struct must be a vec4f, a fixed-size
//     array of vec4f, or another struct that obeys this rule. No bare f32,
//     no i32, no vec2f/vec3f. Scalars ride in vec4 lanes; ints ride in float
//     lanes via bitcast.
//
//     Why: std430 (GLSL) and WGSL do NOT agree on how to lay out structs with
//     mixed scalar types. An all-vec4 struct is 16-byte aligned with an
//     unambiguous stride in both, so this codebase translates between them
//     without a layout audit. Both layout.py and common.wgsl.test.ts enforce
//     this and will fail on anything else.
//
//  2. ADD A FIELD BY CLAIMING A RESERVED LANE, not by appending a scalar.
//     When the reserved lanes run out, add a whole new vec4.
//
//  3. NO uniforms and NO buffer/binding declarations in this file -- types and
//     pure functions only. Bindings belong to the shader that owns them.
//     (Binding assignments are recorded in the table below for coordination.)
//
//     This rule is MORE load-bearing on the web than on the desktop. GLSL
//     drivers strip unused uniforms and moderngl's tryset() tolerates the
//     result; WebGPU validates against an explicit bind group layout, so a
//     uniform declared here but unused by an including shader is a hard
//     pipeline-creation error rather than a warning.
//
//  4. NO \`#version\` line here (WGSL has none) and no entry points. This file is
//     included into compute, vertex AND fragment modules, so it must stay
//     stage-agnostic: no texture sampling, no discard, no derivatives
//     (fwidth/dpdx). It currently has none of those -- keep it that way.
//
// SSBO BINDING ASSIGNMENTS (project-wide, keep in sync):
//     binding = 0   EntityBuffer
//     binding = 1   ConfigBuffer
// ============================================================================

const PI: f32 = 3.1415926;

// \`STRAFE_FIELD_GAIN\` USED TO LIVE HERE, at 0.01, as the fixed rate at which the
// painted field displaced a particle. It is now a UNIFORM, because the Walls
// Field Strength preference multiplies it -- so the host owns the number
// (\`FIELD_STRENGTH_GAIN\` in \`prefs/preferences.ts\`) and packs \`strength * 0.01\`
// into the entity update's uniform.
//
// Moved rather than kept alongside the slider: two multipliers, one here and one
// host-side, is exactly the "second multiplier for the user to get lost between"
// that the original comment ruled out. At the default strength of 1.0 the product
// is 0.01 and every painted field behaves precisely as it did before.

// ---------------------------------------------------------------------------
// CANVAS VALUE SCALE -- the canvas is RG16F (see CANVAS_DTYPE in
// particle_system.py), and fp16's usable range starts at ~6.1e-5. At high
// Trail Persistence the splat premultiply (1-P)/P shrinks each deposit to
// ~1e-6, which is SUBNORMAL in fp16: blend units flush it and trails starve
// (measured: 40x dimmer at P=0.999). All stored canvas values therefore ride
// 512x above their physical meaning: the splat multiplies by this, every READER
// divides by it. canvas decay/diffuse is linear and scale-invariant, so it
// neither knows nor cares.
//
// 512 is chosen with both ends in view: it lifts a slow particle's deposit at
// P = 0.999 (~3.6e-6) to ~1.8e-3 -- comfortably normal -- while the largest
// legitimate single splat (fast particle at the P clamp floor) stays around
// 1e4, under fp16's 65504 ceiling. Readers: get_can() in entity_update,
// camera. Writers: the trail deposit (entityUpdate.wgsl \`deposit\`, drained
// into the canvas by canvas.wgsl).
const CANVAS_VALUE_SCALE: f32 = 512.0;

// THE SPLAT ACCUMULATOR'S FIXED POINT. WGSL atomics are integer-only, so each
// deposit rides in an i32 at this many counts per (already scaled) canvas unit.
//
// 2^14 matches fp16 at both ends. One count is 2^-14, fp16's smallest normal,
// so the accumulator resolves exactly the deposits a blended fp16 splat could;
// and +-2^31 counts span +-2^17, twice fp16's 65504 ceiling, so a pile-up
// saturates in the canvas pass's CANVAS_VALUE_MAX clamp before it can wrap.
// The deposit range this has to hold is CANVAS_VALUE_SCALE's, above.
const SPLAT_FIXED_SCALE: f32 = 16384.0;

// Saturation ceiling for stored (scaled) canvas values, applied by the canvas
// pass on every write. NEEDED BECAUSE OF fp16: a texel pushed past 65504 rounds
// to inf, and inf survives decay forever (inf * P == inf) -- one extreme splat
// pile-up would permanently poison the texel and NaN any particle that senses
// it. Saturating below the ceiling lets even an absurd pile-up decay back down.
// fp32 never needed this; do not remove it while the canvas is fp16.
const CANVAS_VALUE_MAX: f32 = 60000.0;

// Trail Persistence's legal range inside the shaders. The FLOOR is well below
// the slider (0.5..0.999) and below every known config (observed min 0.312);
// it exists for typed-in extremes. It was 1e-4, but (1-P)/P at 1e-4 is ~1e4,
// which times CANVAS_VALUE_SCALE would overflow fp16 on a single splat --
// 1e-2 caps the premultiply at ~99 and costs nothing anyone uses.
// The deposit and the canvas pass MUST clamp with the same bounds, or the
// splat premultiply and the decay would disagree about what P means.
const TRAIL_PERSISTENCE_MIN: f32 = 1e-2;
const TRAIL_PERSISTENCE_MAX: f32 = 0.999;

// ---------------------------------------------------------------------------
// MODE ENUMS -- the single definition. ui/settings_spec.py mirrors these BY
// VALUE in its DROPDOWN_MODES tuples, so the order of the options there is the
// order here. Change one, change both.
// ---------------------------------------------------------------------------

// What happens when a particle reaches the edge of the world. A WorldData
// setting: the trail field follows the same rule, so it cannot vary per config.
const BC_BOUNCE: i32 = 0;
const BC_WRAP: i32 = 1;
const BC_RESET: i32 = 2;
// Leaving the world KILLS the particle rather than respawning it: it is marked
// dead and its index pushed onto the free list. The sand modality's default,
// and the worked example of the sinks system -- BC_RESET's sibling, differing
// only in what happens to the particle that crossed.
//
// ADDED AS A FOURTH VALUE rather than by redefining BC_RESET, so the studio's
// three modes keep their exact meanings. A config that has never heard of this
// mode cannot select it, and nothing in the studio writes a 3.
const BC_KILL: i32 = 3;

// How particles are placed on reset. A ConfigData setting: different
// populations can seed differently.
const IC_GRID: i32 = 0;
const IC_RANDOM: i32 = 1;
// No shader compares against IC_CENTER -- it is the fall-through \`else\` branch
// of initial_position() in entity_update. It stays defined because it is a real
// mode, mirrored by value in ui/settings_spec.py's dropdown. Do not drop it as
// dead code.
const IC_CENTER: i32 = 2;
const IC_RING: i32 = 3;

// ---------------------------------------------------------------------------
// Rule -- the Fourier Feature Network coefficients that define particle behavior
// ---------------------------------------------------------------------------

// 4D input -> 4D output basis element.
struct FourierCenter {
    frequency: vec4f,
    amplitude: vec4f,
}

// 10 FourierCenters makes a Rule. 320 bytes, all vec4.
//
// This is the only array in the layout, and it is the case that usually bites:
// std430's array-of-struct stride here is 32 bytes, and WGSL's
// array<FourierCenter,10> stride is also 32 (alignment 16, size 32 -- already a
// multiple). No stride divergence. common.wgsl.test.ts asserts it rather than
// trusting this comment.
struct Rule {
    centers: array<FourierCenter, 10>,
}

// ---------------------------------------------------------------------------
// ConfigData -- everything a particle needs to know about how to behave.
//
// This unifies what used to be two separate systems: the Rule (behavior) and
// the physics parameters. They live together now because they are the same
// kind of thing -- per-particle-population settings -- and separating them is
// what made the reference implementation's parameter handling sprawl.
//
// Lives in ConfigBuffer (binding 1). Each entity selects its ConfigData via
// its own config_index, so different particles can obey different configs.
// ---------------------------------------------------------------------------
struct ConfigData {
    rule: Rule,      // 320 B -- behavior coefficients
    sensor: vec4f,   // x: gain          y: angle       z: distance    w: mutation_scale
    force: vec4f,    // x: global_mult   y: drag        z: strafe      w: axial
    misc: vec4f,     // x: lateral       y: hazard_rate z: cohorts(i)  w: mutation_seed
    // The first four vec4s filled up (misc.w went to mutation_seed), so this is
    // the "add a whole new vec4" case rule 2 describes rather than a reclaimed
    // lane. Two spares here for the next additions.
    force2: vec4f,   // x: gravity_force y: gravity_strafe z: initial_conditions(i) w: cohort_fences(i)
    // force2 filled up the same way misc did, so this is another whole new
    // vec4 rather than a reclaimed lane. This one's zw were the last two spares
    // in the struct, and the sensor jitters claimed them -- rule 2's "claim a
    // reserved lane" case. THERE ARE NO SPARE LANES LEFT: the next addition
    // needs a whole new vec4.
    //
    // NAMED FOR BEING AN OVERFLOW LANE, NOT FOR A THEME -- like \`misc\` and
    // \`force2\` above it. It was called \`appearance\` while it held only the two
    // colour settings; the sensor jitters are physics, so that name had become
    // a lie about half its contents. A lane is a place four floats fit, not a
    // category, and pretending otherwise makes the next addition agonize over
    // whether it belongs. Read the per-lane comment, not the name.
    misc2: vec4f,  // x: color_sensitivity     y: color_by_cohort(i)
                   // z: sensor_angle_jitter   w: sensor_distance_jitter
    // misc2 had no spares left, so Radial Gravity is rule 2's "add a whole new
    // vec4" case again rather than a reclaimed lane. Gravity (Trails) then took
    // .y -- rule 2's "claim a reserved lane" case, as did Color Offset in .z
    // and Trail Weight in .w. No spares left.
    misc3: vec4f,  // x: radial_gravity(i)     y: gravity_trails
                   // z: color_offset          w: trail_weight
    // misc3 had no spares left, so the evolver's SECOND mutation voice is rule
    // 2's "add a whole new vec4" case. RUNTIME ONLY: never saved, always 0 in
    // a loaded state, so every saved state packs and behaves exactly as before.
    // Breathe mode's Orbit overlaps two breaths, and the fading one rides here.
    misc4: vec4f,  // x: mutation_scale_2      y: mutation_seed_2
                   // z: reserved              w: reserved
}  // 432 bytes

fn cfg_sensor_gain(c: ConfigData) -> f32     { return c.sensor.x; }
fn cfg_sensor_angle(c: ConfigData) -> f32    { return c.sensor.y; }
fn cfg_sensor_distance(c: ConfigData) -> f32 { return c.sensor.z; }
fn cfg_mutation_scale(c: ConfigData) -> f32  { return c.sensor.w; }

fn cfg_global_force_mult(c: ConfigData) -> f32 { return c.force.x; }
fn cfg_drag(c: ConfigData) -> f32              { return c.force.y; }
fn cfg_strafe_power(c: ConfigData) -> f32      { return c.force.z; }
fn cfg_axial_force(c: ConfigData) -> f32       { return c.force.w; }

fn cfg_lateral_force(c: ConfigData) -> f32 { return c.misc.x; }
fn cfg_hazard_rate(c: ConfigData) -> f32   { return c.misc.y; }
fn cfg_cohorts(c: ConfigData) -> i32       { return bitcast<i32>(c.misc.z); }
// Which random variation the rule mutation uses. Per-config rather than a
// uniform, so different particle populations can mutate differently.
fn cfg_mutation_seed(c: ConfigData) -> f32 { return c.misc.w; }
// A second, independent mutation layered on the first (evolver Orbit only).
// Scale 0 = absent. The seed is always used in stable mode (see mutate_rule).
fn cfg_mutation_scale_2(c: ConfigData) -> f32 { return c.misc4.x; }
fn cfg_mutation_seed_2(c: ConfigData) -> f32  { return c.misc4.y; }

// Uniform pull on the whole population, in the two motion channels the rest of
// the physics uses: _force feeds velocity, _strafe displaces position directly.
// Both are LINEAR -1..1 controls -- run them through gravity_expand() before
// use, never apply them raw.
fn cfg_gravity_force(c: ConfigData) -> f32  { return c.force2.x; }
fn cfg_gravity_strafe(c: ConfigData) -> f32 { return c.force2.y; }

// How this population is arranged on reset -- one of the IC_* modes above.
fn cfg_initial_conditions(c: ConfigData) -> i32 { return bitcast<i32>(c.force2.z); }
// Whether each particle is held near its own spawn point. ON/OFF ONLY: the
// fence RADIUS is derived from the grid cell size rather than stored, so
// cohorts just barely touch at any cohort count -- see the fence block in
// entity_update, which also explains why it applies to IC_GRID alone.
fn cfg_cohort_fences(c: ConfigData) -> bool { return bitcast<i32>(c.force2.w) != 0; }

// How strongly the brain's colour signal swings the hue. Read by the PARTICLE
// CAMERA, not by the physics -- entity_update only decides what raw signal to
// store, so this can be dragged without disturbing the simulation.
//
// NO SHADER CALLS THIS. The camera does not read the config buffer (rule 3);
// the value reaches cam_brush as a loose uniform instead. This accessor is the
// record of which lane holds it -- keep it.
fn cfg_color_sensitivity(c: ConfigData) -> f32 { return c.misc2.x; }
// Colour each population flat by its cohort instead of by its brain's output.
// A DISPLAY choice, read by the particle camera -- entity_update transmits both
// signals (col_params.x is the brain, .y the cohort) and picks neither, so this
// takes effect immediately, even while the simulation is paused.
//
// Also uncalled by any shader, for the same reason as cfg_color_sensitivity.
fn cfg_color_by_cohort(c: ConfigData) -> bool { return bitcast<i32>(c.misc2.y) != 0; }

// WHERE THIS POPULATION'S HUE SITS BEFORE THE SIGNAL MOVES IT. Sensitivity is
// the coefficient A and this is the bias B in \`hue = A * signal + B\`, so a
// config can be tuned to a corner of the wheel and its signal read as variation
// WITHIN that colour rather than across the whole spectrum.
//
// 0..1 spans the wheel exactly once. Hue is periodic, so the ends meet and no
// wrapping is needed anywhere -- see the fragment stage in cam_brush.
//
// IN A DIFFERENT LANE FROM cfg_color_sensitivity, which it belongs beside by
// meaning. misc2 was full; this is rule 2's "claim a reserved lane" case in
// misc3 rather than a fourth vec4 for one float. The accessors are written
// together here because that is where a reader looks for them -- the lane a
// value lives in is an allocation detail, which is exactly what the misc2
// comment above says.
//
// Uncalled by any shader, like the two above: the camera does not read the
// config buffer (rule 3), so this reaches cam_brush through the swatch table on
// its own uniform. The accessor is the record of which lane holds it.
fn cfg_color_offset(c: ConfigData) -> f32 { return c.misc3.z; }

// Random wobble added to each sensor reading, resampled EVERY PHYSICS STEP --
// a shimmer, not a fixed per-particle trait. Both are 0..1 controls scaled so
// that 1.0 spans the whole range of the parameter they perturb: angle covers
// its own -1..1 slider directly, distance covers SENSOR_DISTANCE_SPAN below.
// Applied in entity_update; 0 is off.
fn cfg_sensor_angle_jitter(c: ConfigData) -> f32    { return c.misc2.z; }
fn cfg_sensor_distance_jitter(c: ConfigData) -> f32 { return c.misc2.w; }

// Which direction the two gravity channels above pull in. False (the default,
// and what every config written before this existed means) is the fixed
// vec2(0,1) screen-down pull; true swings it to the particle's own position
// vector, so positive values fall inwards towards the origin and negative
// values blow outwards. Lives in misc3 rather than beside the gravity values
// because force2 and misc2 were both full -- read the lane comment, not the
// name.
fn cfg_radial_gravity(c: ConfigData) -> bool { return bitcast<i32>(c.misc3.x) != 0; }

// THE THIRD GRAVITY CHANNEL, and the only one that is not a motion.
//
// Force and Strafe above move the particle. This one moves what the particle
// BELIEVES: it is a constant bias added to every canvas sensor reading, in
// exactly the manner the user-drawn trails layer is added (see \`get_can\` in
// entityUpdate.wgsl). Nothing is pushed -- particles are told there is a trail
// downhill, and each rule decides for itself what to do about that. A rule that
// chases trails falls; a rule that avoids them rises. So unlike the other two,
// this channel's SIGN IS NOT ITS DIRECTION, and it does nothing whatsoever to a
// population whose rule ignores the sensors.
//
// LINEAR -1..1 like its siblings, expanded by the same gravity_expand() -- one
// curve for all three, so the feel of the three sliders matches.
fn cfg_gravity_trails(c: ConfigData) -> f32 { return c.misc3.y; }

// TRAIL WEIGHT: how heavily a config's trails count against OTHER configs'.
// Its deposits are multiplied by it and its reads of the swarm's trails divided
// by it (both in entityUpdate.wgsl), so a config alone is unaffected at any
// weight. Negative lays trails that point backwards, to everyone else.
//
// THE FLOOR IS LOAD-BEARING: reads divide by this. A stored value inside
// +-TRAIL_WEIGHT_MIN -- a hand-edited file, a typed 0 -- is pushed out to the
// floor on its own side, zero counting as positive. Mirrored by value in
// \`particleSystem/config.ts\` and pinned by a test.
const TRAIL_WEIGHT_MIN: f32 = 0.02;
fn cfg_trail_weight(c: ConfigData) -> f32 {
    let w = c.misc3.w;
    if (abs(w) >= TRAIL_WEIGHT_MIN) { return w; }
    return select(TRAIL_WEIGHT_MIN, -TRAIL_WEIGHT_MIN, w < 0.0);
}

// The width of the Sensor Distance slider (0..5), which is what a distance
// jitter of 1.0 spans. It lives here rather than being read from the slider
// bounds because the shader has no access to those -- MUST MATCH the \`hi\` of
// the sensor_distance entry in ui/settings_spec.py.
const SENSOR_DISTANCE_SPAN: f32 = 5.0;

// The speed below which a particle is considered STALLED and is given a random
// heading. See the rescue block in entityUpdate.wgsl for why one is needed: a
// particle's heading is its velocity, so at exactly zero it has no direction,
// its sensors collapse onto each other, and nothing can ever restore it.
//
// 5e-5 is \`reset()\`'s own spawn magnitude -- the number this codebase already
// picked for "slow, but moving enough to have a direction". Using the same value
// makes a rescued particle indistinguishable from a freshly reset one.
//
// A FLOOR, NOT AN EPSILON. It is deliberately far above fp32's denormal range:
// the failure is not underflow to exactly zero, it is a velocity too small for
// \`sample_dist\` to place the sensors on different texels, which happens long
// before the bits run out.
const MIN_VELOCITY: f32 = 5e-5;

// ---------------------------------------------------------------------------
// WorldData -- settings that are properties of the world, not of a particle.
//
// Set as a uniform, never per-entity. If a setting would be meaningless to
// vary between two particles sharing a canvas (trail decay, world scale), it
// belongs here rather than in ConfigData.
// ---------------------------------------------------------------------------
struct WorldData {
    trail: vec4f,  // x: persistence  y: diffusion  z: sqrt_world_size  w: config_count(i)
    // trail filled up, so this is rule 2's "add a whole new vec4" case.
    bounds: vec4f, // x: boundary_conditions(i)   yzw: reserved
}

fn world_trail_persistence(w: WorldData) -> f32 { return w.trail.x; }
fn world_trail_diffusion(w: WorldData) -> f32   { return w.trail.y; }
fn world_sqrt_world_size(w: WorldData) -> f32   { return w.trail.z; }
fn world_config_count(w: WorldData) -> i32      { return bitcast<i32>(w.trail.w); }

// What happens at the edge of the world -- one of the BC_* modes above. A
// world property rather than a per-config one: the trail field has to obey the
// same boundary as the particles do, and there is only one trail field.
fn world_boundary_conditions(w: WorldData) -> i32 { return bitcast<i32>(w.bounds.x); }

// ---------------------------------------------------------------------------
// Entity -- one particle. 32 bytes, 16-byte aligned.
//
// Lives in EntityBuffer (binding 0). Mirrored by no one: every shader that
// touches entities includes this file.
// ---------------------------------------------------------------------------
struct Entity {
    pos_vel: vec4f,  // xy: pos    zw: vel
    misc: vec4f,     // x: size    y: config_index(i)    zw: col_params
}

fn e_pos(e: Entity) -> vec2f          { return e.pos_vel.xy; }
fn e_vel(e: Entity) -> vec2f          { return e.pos_vel.zw; }
fn e_size(e: Entity) -> f32           { return e.misc.x; }
fn e_config_index(e: Entity) -> i32   { return bitcast<i32>(e.misc.y); }

// ---------------------------------------------------------------------------
// LIFETIME -- a negative config_index means the particle is DEAD.
//
// NO LAYOUT CHANGE. Entity is full at 32 bytes and every lane is spoken for, so
// a dead FLAG would have meant widening the struct and editing
// layout.fixture.json in lockstep. It is not needed: config_index is already an
// i32 riding a float lane, and no real config index is ever negative -- so the
// sign bit was free the whole time.
//
// EVERY READER MUST TEST THIS BEFORE THE CONFIG LOOKUP. \`entityUpdate\` clamps
// config_index into range (\`clamp(idx, 0, count-1)\`), which would quietly turn
// a dead particle into a config-0 particle rather than skipping it. The clamp is
// correct for its own purpose -- it makes a SHRUNK ConfigBuffer degrade
// gracefully -- so the dead test goes above it rather than replacing it.
//
// The studio produces these only through BC_KILL, and its reset frame brings
// them back (see the dead-particle note in entityUpdate's \`main\`).
// ---------------------------------------------------------------------------
// \`make_entity_dead\` is NOT here: it calls make_entity, which is declared below,
// and WGSL requires declaration before use. It sits under that function instead.
const DEAD_CONFIG: i32 = -1;

fn e_is_dead(e: Entity) -> bool { return e_config_index(e) < 0; }

// RAW OUTPUT FROM THE PARTICLE'S BRAIN, kept for rendering rather than physics.
// entity_update writes these; the particle camera turns them into a hue.
//
// .x is a raw force term from the black box -- deliberately arbitrary, tuned by
// eye, so nothing downstream should read meaning into its scale.
// .y is the particle's COHORT INDEX, which cam_brush reads when Color By
// Cohort is on.
//
// The RENDERER decides what these look like. Storing the raw signals instead of
// a finished hue is what lets Color Sensitivity be dragged without re-running
// the simulation, which is where the reference put it.
fn e_col_params(e: Entity) -> vec2f { return e.misc.zw; }

fn make_entity(pos: vec2f, vel: vec2f, size: f32, config_index: i32,
               col_params: vec2f) -> Entity {
    return Entity(vec4f(pos, vel),
                  vec4f(size, bitcast<f32>(config_index), col_params));
}

// Same, for the paths that have no colour signal to offer -- reset() runs
// before any behaviour is computed. Zero is a valid hue, so this is not a
// sentinel; the entity simply gets its colour on the next real step.
//
// RENAMED from the GLSL, which overloads \`make_entity\` on arity -- WGSL has no
// function overloading. The delegation is kept: this is the 5-arg form with a
// zero colour, not a second implementation.
fn make_entity_reset(pos: vec2f, vel: vec2f, size: f32,
                     config_index: i32) -> Entity {
    return make_entity(pos, vel, size, config_index, vec2f(0.0));
}

// A DEAD particle -- see the lifetime block above \`e_is_dead\`.
//
// Everything is zeroed rather than left stale: a readback of the buffer stays
// legible, and nothing downstream can be fooled by a plausible-looking position
// on a particle that is not there. A size of 0 means that even a consumer which
// somehow skipped the dead test would draw a zero-area sprite.
//
// DECLARED HERE, not beside e_is_dead, because it calls make_entity above and
// WGSL requires declaration before use.
fn make_entity_dead() -> Entity {
    return make_entity(vec2f(0.0), vec2f(0.0), 0.0, DEAD_CONFIG, vec2f(0.0));
}

// ---------------------------------------------------------------------------
// COORDINATE CONVENTION -- the one canonical implementation.
//
// World space is AREA-PRESERVING. With ca = canvas_res.x / canvas_res.y:
//
//     world = [-sqrt(ca), +sqrt(ca)]  x  [-1/sqrt(ca), +1/sqrt(ca)]
//
// so the world always has area 4 regardless of canvas aspect, and a circle in
// world space stays a circle on screen. On a square canvas ca == 1 and this
// reduces exactly to the familiar [-1,1] x [-1,1].
//
// NO OTHER FILE MAY WRITE ASPECT-RATIO MATH. Every world<->uv<->ndc
// conversion goes through the functions below (and their TypeScript mirrors in
// src/particleSystem/coords.ts). The reference implementation had six divergent
// copies of this math, at least one of which contradicted the others; that is
// the specific failure this rule exists to prevent.
//
// THE WORLD IS A TORUS ONLY IN BC_WRAP. The boundary mode decides the world's
// topology, so anything that crosses an edge must ask: world_wrap for wrap,
// world_bounce for bounce, and world_to_uv_bc for every texture read.
//
// SEVERAL FUNCTIONS BELOW HAVE NO EXTERNAL CALLER. world_half_extent,
// world_to_uv, uv_to_world, edge_fold, letterbox_scale and screen_ndc_to_world
// are each an internal composition step of one that does. They are load-bearing,
// not dead. WGSL does not warn about unused module-scope functions.
// ---------------------------------------------------------------------------

// Half-extent of world space on each axis, from canvas aspect ca = res.x/res.y.
fn world_half_extent(ca: f32) -> vec2f {
    let s = sqrt(ca);
    return vec2f(s, 1.0 / s);
}

fn world_half_extent_from_res(canvas_res: vec2f) -> vec2f {
    return world_half_extent(canvas_res.x / canvas_res.y);
}

// Scale a uv-space delta into the aspect-corrected metric -- literally
// world_half_extent applied as a scale, which is why it lives here rather than
// being its own piece of aspect math. World space is area-preserving, so a raw
// uv delta is anisotropic on a non-square canvas; brushes measured in this
// metric stay circular, and a ring drawn in it matches the brush that paints
// in it. Used by strafe_draw (painting) and frame_assembly (the reticle that
// must agree with it).
fn aspect_correct_uv(d: vec2f, canvas_res: vec2f) -> vec2f {
    return d * world_half_extent_from_res(canvas_res);
}

// World -> texture uv [0,1]. In BC_WRAP the canvas textures are sampled with a
// repeating sampler and the sampler does the wrapping, so uv is deliberately
// left unclamped. Every other boundary mode must go through world_to_uv_bc.
fn world_to_uv(p: vec2f, canvas_res: vec2f) -> vec2f {
    return p / (2.0 * world_half_extent_from_res(canvas_res)) + 0.5;
}

// World -> texture uv, honoring the boundary mode. Only BC_WRAP leaves uv free
// for the sampler's repeat to handle; the others clamp, so a sensor reaching
// past the edge reads the edge rather than the far side of the world.
fn world_to_uv_bc(p: vec2f, canvas_res: vec2f, bc: i32) -> vec2f {
    let uv = world_to_uv(p, canvas_res);
    // select(false_value, true_value, condition) -- the argument order is the
    // reverse of GLSL's \`cond ? a : b\`.
    return select(clamp(uv, vec2f(0.0), vec2f(1.0)), uv, bc == BC_WRAP);
}

fn uv_to_world(uv: vec2f, canvas_res: vec2f) -> vec2f {
    return (uv - 0.5) * 2.0 * world_half_extent_from_res(canvas_res);
}

// The corner of an instanced quad, in TRIANGLE-STRIP order, as a 0..1 uv:
// (0,0) (1,0) (0,1) (1,1) for vertex_id 0..3. The matching offset from the quad
// centre is \`(strip_corner(v) * 2.0 - 1.0) * half_size\`, which pairs uv and
// corner by construction -- they are the same value.
//
// ARITHMETIC, NOT A LOOKUP TABLE, and that is the reason this exists. The
// per-particle sprite shaders (camBrush.wgsl; the brush pass before it became
// a point splat) used \`var offsets = array<vec2f, 4>(...)\` indexed by vertex_id.
// A local array indexed by a non-constant is spilled to per-thread scratch
// memory by the browser's shader compilers (the same trap that made
// entityUpdate's by-value Rule so slow), and a sprite shader runs four times
// per particle. Do not turn this back into a table.
//
// Strip, not fan: WebGPU has no triangle-fan, and a strip over the desktop's
// fan order (brush.vert:25-36) draws a bowtie.
fn strip_corner(vertex_id: u32) -> vec2f {
    return vec2f(f32(vertex_id & 1u), f32(vertex_id >> 1u));
}

// World -> normalized device coords [-1,1] for rasterizing into the canvas.
fn world_to_ndc(p: vec2f, canvas_res: vec2f) -> vec2f {
    return p / world_half_extent_from_res(canvas_res);
}

// Wrap a world position into the world bounds. BC_WRAP only -- the world is a
// torus in that mode alone.
//
// DO NOT REWRITE fract() AS \`%\`. \`p\` here is freely signed (a world position
// past either edge), so \`p / size - 0.5\` is routinely negative, and WGSL's \`%\`
// is truncated where this needs floored behaviour. WGSL defines fract(x) as
// \`x - floor(x)\`, identical to GLSL, so it translates verbatim and correctly --
// the \`%\` "cleanup" would break wrap for every particle leaving the left or
// bottom edge.
fn world_wrap(p: vec2f, canvas_res: vec2f) -> vec2f {
    let extent = world_half_extent_from_res(canvas_res);
    let size = 2.0 * extent;
    return size * (fract(p / size - 0.5) - 0.5);
}

// Reflect a coordinate given in edge units back into [-1,1]. A triangle wave,
// so it is correct for ARBITRARY overshoot. The reference's single-fold version
// (sign(x)*(1-abs(1-abs(x)))) silently teleported a particle to the far side
// once it passed 2x the edge in one step, which heavy gravity reaches.
//
// GLSL's mod() is floored and WGSL's \`%\` is truncated, so they are NOT
// interchangeable in general. They agree here because the dividend is abs(x),
// non-negative BY CONSTRUCTION rather than by caller convention, and the
// divisor is a positive literal. That is what makes \`%\` safe -- if the abs()
// ever goes away, this needs a floored mod again.
fn edge_fold(x: f32) -> f32 {
    let t = abs(x) % 2.0;
    return sign(x) * (1.0 - abs(1.0 - t));
}

// What world_bounce returns. GLSL passed p and v as \`inout\`; WGSL has no
// inout, so the pair comes back as a struct. (A ptr<function, vec2f> parameter
// would also work, but a return struct reads better at the one call site.)
struct BounceResult {
    pos: vec2f,
    vel: vec2f,
}

// Reflect a position off the world bounds, flipping the velocity components
// that crossed. Position and velocity move together: reflecting the position
// without reversing the velocity would just re-trigger the bounce every frame,
// pinning the particle to the wall.
//
// THE ORDER BELOW IS LOAD-BEARING: the velocity flips are decided against the
// PRE-FOLD position, and only then is the position folded. Computing the folded
// position first and testing that would silently change the exact-boundary case.
fn world_bounce(p: vec2f, v: vec2f, canvas_res: vec2f) -> BounceResult {
    let extent = world_half_extent_from_res(canvas_res);
    var vel = v;
    if (abs(p.x) > extent.x) { vel.x = -vel.x; }
    if (abs(p.y) > extent.y) { vel.y = -vel.y; }
    let pos = vec2f(edge_fold(p.x / extent.x), edge_fold(p.y / extent.y)) * extent;
    return BounceResult(pos, vel);
}

// ---------------------------------------------------------------------------
// THE VIEW TRANSFORM -- world to screen, through camera and letterbox.
//
//     world  --/half_extent-->  canvas ndc
//            --(-pan, *zoom)->  view ndc
//            --*letterbox---->  screen ndc [-1,1]
//
// THREE INDEPENDENT ASPECT QUANTITIES, never conflate them:
//   canvas_res  simulation texture size; defines world space
//   window_res  framebuffer size in pixels; changes on resize
//   letterbox   derived fit of one into the other; never stored
//
// ZOOM: bigger = zoomed IN (a magnification factor). zoom=1 fits the world.
// PAN:  world units. pan is the world point at the center of the view.
// ---------------------------------------------------------------------------

// Scale fitting the canvas box into the window, preserving shape. The axis
// that would overflow shrinks; the other stays 1.0, and the slack is the
// letterbox bar. Fit, not fill: the whole canvas is always visible.
fn letterbox_scale(canvas_res: vec2f, window_res: vec2f) -> vec2f {
    if (window_res.x <= 0.0 || window_res.y <= 0.0) { return vec2f(1.0); }
    let canvas_aspect = canvas_res.x / canvas_res.y;
    let window_aspect = window_res.x / window_res.y;
    return select(
        vec2f(1.0, window_aspect / canvas_aspect),  // bars top/bottom
        vec2f(canvas_aspect / window_aspect, 1.0),  // bars left/right
        window_aspect > canvas_aspect);
}

fn world_to_screen_ndc(p: vec2f, canvas_res: vec2f, window_res: vec2f,
                       pan: vec2f, zoom: f32) -> vec2f {
    let ndc = world_to_ndc(p - pan, canvas_res) * zoom;
    return ndc * letterbox_scale(canvas_res, window_res);
}

fn screen_ndc_to_world(ndc: vec2f, canvas_res: vec2f, window_res: vec2f,
                       pan: vec2f, zoom: f32) -> vec2f {
    var v = ndc / letterbox_scale(canvas_res, window_res);
    if (zoom != 0.0) { v /= zoom; }
    return uv_to_world(v * 0.5 + 0.5, canvas_res) + pan;
}

// Screen ndc -> canvas uv, for the present pass sampling the canvas texture.
// Values outside [0,1] fall in the letterbox bars; the caller decides whether
// to clamp, wrap (tiling) or paint them black.
fn screen_ndc_to_canvas_uv(ndc: vec2f, canvas_res: vec2f, window_res: vec2f,
                           pan: vec2f, zoom: f32) -> vec2f {
    return world_to_uv(
        screen_ndc_to_world(ndc, canvas_res, window_res, pan, zoom),
        canvas_res);
}

// ==== end include: common.wgsl ====
// The hash family and get_cohort, shared with entityPick.wgsl so both agree on
// which cohort a particle is in. The rule derivation in the same file is NOT
// called from here any more: cohortRules.wgsl bakes each slot's rule into the
// config buffer, and this shader reads it (see \`fourier_noise\`).
// ==== begin include: rule.wgsl ====
// ============================================================================
// rule.wgsl -- how an entity's Rule is derived, and THE ONLY COPY of that.
//
// WHY THIS FILE EXISTS. Every shader that answers "what rule does cohort N of
// this config obey?" must answer it identically:
//
//   cohortRules.wgsl   derives it once per config slot, per upload, and bakes
//                      it into the config buffer. entityUpdate.wgsl and
//                      entityPick.wgsl read that baked rule; neither derives.
//   deriveRule.wgsl    derives it offline, to rebuild an adopted rule for the
//                      archive.
//
// On the desktop that question has THREE implementations: entity_update.glsl,
// entity_pick's caller, and particle_system/mutation.py -- a float32 host mirror
// that recomputes the rule so selection needs no GPU readback. The web port
// deletes the mirror (docs/WEB_PORT_PLAN.md Step 6) and derives on the GPU
// instead, precisely because a wrong adopted rule LOOKS LIKE A LEGITIMATE
// RESULT. Both callers share this file, so they cannot drift.
// ARCHITECTURE.md:715-718 records what happened the one time the desktop's
// copies did: selection adopted near-zero coefficients and the simulation
// appeared to die.
//
// WHY NOT common.wgsl. That file is included by camBrush.wgsl in a VERTEX
// stage, and its own rules 3 and 4 (common.wgsl:38-52) require it to
// hold pure, stage-agnostic code only. generate_random_centers is an 80-call
// hash loop that no vertex stage wants, and get_cohort below could not live
// there at all -- see its comment. This file is a SIBLING of the two shaders
// that include it; wgslInclude.ts resolves sibling-first (:125-141), so both
// find it with no build config.
//
// The include guard is per compilation unit (wgslInclude.ts:92-99), so the
// diamond entityUpdate -> {common, rule -> common} emits common.wgsl once.
// ============================================================================


//=========================================================================================
//------------------------------------RANDOM / HASH / NOISE--------------------------------
//====================================VVVVVVVVVVVVVVVVVVVVV================================

// pcg_hash, hash and hash4 MOVED TO \`shaders/hash.wgsl\`, and are included here
// rather than declared. They left because the sand modality's spawn brush needs
// the same generator and is not a sibling of this file -- including this one to
// reach \`hash\` would have dragged \`generate_random_centers\`, an 80-call hash
// loop, into a shader that wants three random numbers.
//
// Nothing about them changed in the move: the arithmetic is identical, so every
// rule derived before it is derived identically after. See that file's header.
// ==== begin include: hash.wgsl ====
// ============================================================================
// hash.wgsl -- the PCG hash family. THE ONLY COPY.
//
// WHY THIS FILE EXISTS. Three shaders now need the same random generator, and
// they sit in two different directories:
//
//   particleSystem/shaders/rule.wgsl  rule derivation (and through it,
//                                     entityUpdate and entityPick)
//   sand/shaders/spawn.wgsl           where a painted particle lands
//
// \`rule.wgsl\` held these and is a SIBLING of its two callers, which is what let
// them find it with no build config. The sand brushes are not siblings of it,
// and pulling the whole file in would drag \`generate_random_centers\` -- an
// 80-call hash loop -- into a shader that wants three random numbers. So the
// hash family moved here, to the shared directory every shader can reach, and
// \`rule.wgsl\` includes it like everyone else.
//
// WHY NOT common.wgsl. That file is included by vertex stages and its own rules
// 3 and 4 hold it to struct layout and coordinate math. A hash is neither, and
// keeping it out means a vertex shader that needs only the Entity layout does
// not also compile a hash it never calls.
//
// BIT-EXACTNESS IS THE POINT. The u32 multiplies wrap in WGSL exactly as they do
// in GLSL, so this is a verbatim translation of the desktop's. \`hash\` is chaotic
// by design: a 1-ULP difference in an input produces a COMPLETELY DIFFERENT
// output, which is why rule derivation had to move to the GPU rather than keep a
// JavaScript mirror. Do not "simplify" the arithmetic here.
//
// The include guard is per compilation unit, so the diamond
// entityUpdate -> {common, rule -> hash} emits each file once.
// ============================================================================

// PCG hash - bit-exact across all platforms.
fn pcg_hash(seed: u32) -> u32 {
    let state = seed * 747796405u + 2891336453u;
    let word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
    return (word >> 22u) ^ word;
}

// Two floats in, one pseudo-random float in [0,1) out.
//
// The inputs are BITCAST, not converted: the hash consumes the float's bit
// pattern, so two inputs that differ in the last mantissa bit are unrelated
// outputs. That is what makes \`hash(vec2f(f32(index), f32(frame)))\` a usable
// per-particle-per-frame draw.
fn hash(co: vec2f) -> f32 {
    let u_bits = vec2u(bitcast<u32>(co.x), bitcast<u32>(co.y));
    let h = pcg_hash(u_bits.x ^ pcg_hash(u_bits.y));
    return f32(h) / f32(0xffffffffu);
}

// Four decorrelated draws from one seed.
//
// Three implicit promotions in four lines on the GLSL side; the int literals
// became float literals here. Operand order is kept exactly, because the
// bitcast above makes \`co * -1.0 + 5.0\` and \`5.0 - co\` different seeds.
fn hash4(co: vec2f) -> vec4f {
    return vec4f(
        hash(co),
        hash(co * -1.0 + 5.0),
        hash(co.yx - 100.0),
        hash(co.yx * -1.0 + 25.0)
    );
}

// ==== end include: hash.wgsl ====

// Given a seed, return 10 random FourierCenters: enough for a Rule.
//
// DO NOT REWRITE \`pow(h, 2.0)\` AS \`h*h\`. \`freq_scale\` and \`frequency.x\` draw
// from the SAME hash lane (\`i*8+0\`), so frequency.x is \`(h*2-1) * (1+2*pow(h,2))\`.
// pow(h,2) and h*h differ by 1 ULP, and the chaotic hash amplifies that into a
// completely different rule -- measured on the desktop as seed 0.3088 vs 0.2605
// (see the comment at mutation.py:149, and entity_update.glsl:446-451).
//
// THIS IS NOW MORE LOAD-BEARING THAN IT WAS IN STEP 4, not less: the rule this
// produces is read back and adopted into the config when a user clicks a
// particle, so "simplifying" this line changes what selection gives you.
fn generate_random_centers(seed: f32) -> array<FourierCenter, 10> {
    var centers : array<FourierCenter, 10>;

    for (var i = 0; i < 10; i++) {
        // Generate frequency vectors
        // Bias towards lower frequencies for smoother base behaviors
        // Range: [-2, 2] with bias towards [-1, 1]
        let freq_scale = 1.0 + 2.0 * pow(hash(vec2f(seed, f32(i * 8 + 0))), 2.0);
        centers[i].frequency.x = (hash(vec2f(seed, f32(i * 8 + 0))) * 2.0 - 1.0) * freq_scale;
        centers[i].frequency.y = (hash(vec2f(seed, f32(i * 8 + 1))) * 2.0 - 1.0) * freq_scale;
        centers[i].frequency.z = (hash(vec2f(seed, f32(i * 8 + 2))) * 2.0 - 1.0) * freq_scale;
        centers[i].frequency.w = (hash(vec2f(seed, f32(i * 8 + 3))) * 2.0 - 1.0) * freq_scale;

        // Generate amplitude vectors
        // Range: [-1, 1]
        centers[i].amplitude.x = hash(vec2f(seed, f32(i * 8 + 4))) * 2.0 - 1.0;
        centers[i].amplitude.y = hash(vec2f(seed, f32(i * 8 + 5))) * 2.0 - 1.0;
        centers[i].amplitude.z = hash(vec2f(seed, f32(i * 8 + 6))) * 2.0 - 1.0;
        centers[i].amplitude.w = hash(vec2f(seed, f32(i * 8 + 7))) * 2.0 - 1.0;
    }

    return centers;
}

//=====================================^^^^^^^^^^^^^^^^^^==================================
//------------------------------------RANDOM / HASH / NOISE--------------------------------
//=========================================================================================

// Simply assigns each to a cohort based on its index.
// floor(get_cohort(index)) should be used for cohort equality tests.
//
// THE ENTITY COUNT IS A PARAMETER, and that is not a style choice. This file is
// included by two shaders that bind the entity array with DIFFERENT access
// qualifiers -- entityUpdate.wgsl as \`storage, read_write\`, entityPick.wgsl as
// \`storage, read\` -- so a function here may not name the binding at all.
// \`arrayLength(&entities)\` is therefore evaluated at the CALL SITE and handed
// in. (Reverting it to name the binding compiles in entityUpdate and fails only
// in entityPick, i.e. in a browser and not in \`npm test\`, so shaders.test.ts
// asserts it.)
//
// BOTH CALL SITES PASS arrayLength(&entities), never the host's entityCount
// uniform. The buffer is sized exactly entityCount * 32
// (particleSystem.ts:200-206) so the two are identical today -- but if that ever
// stopped being true, the physics and the picker must still divide by the SAME
// number or the rule the picker derives is not the rule the entity obeys.
fn get_cohort(index: u32, config: ConfigData, entity_count: u32) -> f32 {
    return f32(cfg_cohorts(config)) * f32(index) / f32(entity_count);
}

// Randomly change noise function parameters, scaled by parameter 'amount'.
// Each cohort gets a unique mutation for any given rule.
//
// GLSL took \`inout Rule\`; WGSL has no inout, so the mutated rule comes back as
// a return value and the call site assigns it.
//
// STABLE MODE (\`stable\`): the seed skips the hash of the rule and is the
// cohort seed alone. The usual seed hashes the rule's own coefficients, which
// is chaotic -- so a rule that is MOVING (the evolver blending between
// favorites) would draw a fresh twist every frame: flicker, not motion. With
// the hash left out, each cohort's twist is a fixed direction that holds while
// the rule moves. Only the evolver asks for it (see \`derive_entity_rule\`); for
// every saved state the branch below is not taken and the seed is computed
// exactly as before.
fn mutate_rule(current_rule: Rule, amount: f32, cohort: f32, stable: bool) -> Rule {
    var rule = current_rule;
    var rule_hash = 0.0;
    if (!stable) {
        rule_hash = hash(rule.centers[4].frequency.xy
                         + rule.centers[7].amplitude.yx
                         + rule.centers[1].frequency.zw);
    }
    let seed = rule_hash + cohort;

    for (var i = 0; i < 10; i++) {
        // Operand order kept as the GLSL writes it (\`-.5 + vec2(...)\`), since
        // reassociating a float add is not required to be value-preserving.
        let amp_mutation = amount * (-1.0 + 2.0 * hash4(-0.5 + vec2f(-f32(i) + seed, f32(i))));
        rule.centers[i].amplitude += amp_mutation;
        // FOUR DRAWS, one per component, like the amplitude above. The desktop
        // drew one scalar and scaled the whole vec4 by it, which only ever
        // stretched a frequency and never turned it. Factor range is
        // 1 +/- amount/2, double the old 1 +/- amount/4. \`.x\` is the old draw.
        let freq_mutation = amount * (hash4(vec2f(seed, f32(i))) - 0.5);
        rule.centers[i].frequency *= 1.0 + freq_mutation;
    }
    return rule;
}

// The rule an entity actually obeys: the generate-or-mutate branch, in one
// place. entity_update.glsl:439-460 on the desktop, mirrored there a THIRD time
// in mutation.py:208-236 -- which is exactly what Step 6 deletes.
//
// A GENERATED RULE IS NEVER MUTATED. It is already random, and the seed that
// produced it rerolls it wholesale, so Mutation Scale has nothing to add -- and
// letting it apply would mean that slider silently reshaping a rule the user
// never authored. \`entity_update\` therefore branches: generate *or* mutate,
// never both.
//
// On the desktop that also had a numerical reason: mutate_rule derives its own
// seed by HASHING the rule's coefficients, hash() is chaotic, and the GPU fuses
// a multiply-add in the generator that numpy cannot -- so mutating on top of a
// generated rule amplified a 1-ULP difference into a completely different rule,
// and the host mirror could not reproduce what the particle obeyed. THE WEB
// PORT HAS NO HOST MIRROR, so that argument does not apply here. The design
// reason above does, and it is sufficient on its own.
//
// GLSL's \`==\` on a vector is whole-vector equality returning a scalar bool;
// WGSL's is componentwise and returns vec4<bool>, hence all().
//
// A NEGATIVE MUTATION SEED MEANS STABLE MODE (see \`mutate_rule\`). Seeds are
// drawn from [0,1], so no saved state has one; the evolver writes -|seed| to
// ask for steady per-cohort twists while it blends the rule. The magnitude is
// what seeds both branches, so a non-negative seed behaves exactly as before.
fn derive_entity_rule(rule_in: Rule, cohort: f32, config: ConfigData) -> Rule {
    let raw_seed = cfg_mutation_seed(config);
    let stable = raw_seed < 0.0;
    let rule_seed = abs(raw_seed) + floor(cohort);

    // If a few arbitrary coefficients are exactly 0, then assume the rule is
    // all 0s (no target) and generate a random rule instead. Zeroing is how the
    // host asks for a new behaviour without reproducing this generator --
    // Randomize Behavior (\`B\`) does exactly that. See ARCHITECTURE.md
    // "Particle selection and history".
    if (all(rule_in.centers[0].frequency == vec4f(0.0))
        && all(rule_in.centers[5].amplitude == vec4f(0.0))) {
        return Rule(generate_random_centers(rule_seed));
    }

    // Each cohort gets a random mutation.
    var rule = mutate_rule(rule_in, cfg_mutation_scale(config), rule_seed, stable);

    // THE SECOND VOICE (evolver Orbit): a breath still fading out while the
    // next fades in. Layered on top of the first, its own seed, stable twists.
    // Scale 0 in every saved state, so this branch is never taken for them.
    let scale_2 = cfg_mutation_scale_2(config);
    if (scale_2 != 0.0) {
        rule = mutate_rule(rule, scale_2, abs(cfg_mutation_seed_2(config)) + floor(cohort), true);
    }
    return rule;
}

// ==== end include: rule.wgsl ====
// The dead-index pool, for BC_KILL. Shared with the sand modality's spawn and
// kill passes so all three agree about how a slot is taken and returned.
//
// THE STRUCT ONLY. Its operations name the \`freelist\` binding directly, so they
// are included below it -- see the note in freeList.wgsl.
// ==== begin include: freeList.wgsl ====
// ============================================================================
// freeList.wgsl -- the pool of dead particle indices.
//
// A stack of available entity indices with an atomic head. \`head\` is the COUNT
// of available slots, so the valid entries are \`slots[0 .. head)\` and the top of
// the stack is \`slots[head - 1]\`.
//
// ---------------------------------------------------------------------------
// WHY CREATION AND DELETION ARE SEPARATE PASSES
// ---------------------------------------------------------------------------
// Within a single pass the head moves MONOTONICALLY -- creation only ever
// decreases it, deletion only ever increases it. That is what makes an atomic
// reservation safe to act on:
//
//   * creation does atomicSub and then writes \`entities[slots[prev-1]]\`
//   * deletion does atomicAdd and then writes \`slots[prev]\`
//
// If the two ran in one pass the head could move both ways while an invocation
// held a reserved index, and two particles could be handed the same slot. This
// is the same hazard \`entityPick.wgsl\` documents at its head: a thread that
// loses an atomic still executes its writes, so the atomic alone is not a lock.
// Splitting the passes is what removes the interleaving, not the atomic.
//
// THE ONE PERMITTED OVERLAP is edge-death inside \`advance()\`, which pushes with
// atomicAdd while the deletion pass would also push. Both only ever INCREASE the
// head, so they compose -- the invariant is direction, not exclusivity. Nothing
// may atomicSub during advance(), which is precisely why spawning is hoisted out
// to once per frame.
//
// ---------------------------------------------------------------------------
// EXHAUSTION IS NORMAL, NOT AN ERROR
// ---------------------------------------------------------------------------
// A full world has an empty free list and a brush that keeps painting will hit
// it every frame. Both guards below therefore FAIL QUIETLY and put the
// reservation back, rather than clamping -- a clamped index would be a real,
// live particle that the brush then overwrites.
//
// The counter is u32, so an unguarded atomicSub at zero wraps to 4294967295 and
// indexes wildly out of range. \`prev > arrayLength(&slots)\` catches both that
// wrap and any genuine corruption.
// ============================================================================

struct FreeList {
    // Count of available slots. Valid entries are slots[0 .. head).
    head  : atomic<u32>,
    // Dead entity indices. Sized to the entity count -- every particle can be
    // dead at once, which is exactly the state a fresh sand world starts in.
    slots : array<u32>,
}

// Reserve one index for a NEW particle. Returns the entity index to write, or
// \`NO_SLOT\` when the pool is empty.
//
// Callers must test the result. Writing to NO_SLOT would index past the entity
// buffer; in WGSL that is a clamped or dropped access rather than a crash, which
// would present as one particle at index 0 behaving strangely.
const NO_SLOT: u32 = 0xffffffffu;

// ---------------------------------------------------------------------------
// THE OPERATIONS LIVE IN \`freeListOps.wgsl\`, NOT HERE, AND THE SPLIT IS FORCED.
//
// They name the \`freelist\` binding directly rather than taking a pointer to it.
// The natural signature -- \`fn take(fl: ptr<storage, FreeList, read_write>)\` --
// is deliberately NOT used: a pointer parameter in the \`storage\` address space
// requires the \`unrestricted_pointer_parameters\` language feature, which is not
// baseline WebGPU. A shader using one compiles on some implementations and
// fails on others, which is exactly the device-matrix narrowing that the
// texture-format rule in common.wgsl exists to avoid.
//
// Naming the binding means the functions must be declared AFTER it, and the
// struct must be declared BEFORE it. One file cannot be both, hence two:
//
//     #include "freeList.wgsl"        // the struct
//     @group(0) @binding(N) var<storage, read_write> freelist : FreeList;
//     #include "freeListOps.wgsl"     // the operations
//
// Every including shader must declare a binding named exactly \`freelist\`. That
// is a real coupling, stated here so a shader adding these includes knows what
// it owes; a missing or misnamed binding is a compile error naming \`freelist\`,
// which is loud rather than silent.
// ---------------------------------------------------------------------------

// ==== end include: freeList.wgsl ====

// --- bindings --------------------------------------------------------------
// Group 0 is the simulation state; group 1 is the textures. They are split
// because the TEXTURE group is what swaps: the canvas is double-buffered, and
// the sampler's address mode follows the boundary mode (WebGPU samplers are
// immutable, so switching Wrap/Bounce means switching bind groups). Keeping the
// buffers out of that group means they are bound once.
//
// Bindings 0 and 1 are fixed project-wide -- see the table in common.wgsl.

@group(0) @binding(0) var<storage, read_write> entities : array<Entity>;
@group(0) @binding(1) var<storage, read>       configs  : array<ConfigData>;
// How the config buffer is laid out -- see configSlots.ts. On in the studio,
// where slot i is cohort i and a particle's slot follows its index; off in sand,
// where a particle keeps the slot its spawn gave it. A pipeline constant, so the
// branch it guards costs nothing, and set from the same field as
// cohortRules.wgsl's so the two cannot disagree about the layout.
override CONFIG_PER_COHORT: bool = false;
// The dead-index pool. Written ONLY by the BC_KILL branch, which pushes the
// index of a particle that has left the world.
//
// BOUND IN BOTH APPS, because WebGPU validates a bind group against the layout
// whether or not the shader reads it -- unlike GL, where an unused binding is
// simply absent. The studio binds a MINIMAL DUMMY (see \`freeListBufferFor\` in
// particleSystem.ts). The studio CAN select BC_KILL, whose push lands in the
// dummy's one slot or is dropped by the bounds test in free_list_give; nothing in
// the studio ever takes from it, so either outcome is inert. This is the same
// shape \`strafe_field_texture\` already uses with its 1x1 dummy.
@group(0) @binding(3) var<storage, read_write> freelist : FreeList;
// The operations, which name the binding above. Must follow it.
// ==== begin include: freeListOps.wgsl ====
// ============================================================================
// freeListOps.wgsl -- taking and returning free-list slots.
//
// INCLUDE THIS *AFTER* DECLARING THE BINDING. These functions name \`freelist\`
// directly, so the order is:
//
//     #include "freeList.wgsl"        // the struct
//     @group(0) @binding(N) var<storage, read_write> freelist : FreeList;
//     #include "freeListOps.wgsl"     // this file
//
// The split is forced by WGSL: the struct must precede the binding and these
// must follow it, and a pointer parameter (which would remove the ordering
// constraint) needs the \`unrestricted_pointer_parameters\` language feature that
// is not baseline WebGPU. See the long note in \`freeList.wgsl\`.
//
// The protocol these implement -- why creation and deletion are separate passes,
// and why exhaustion is normal rather than an error -- is documented there too.
// ============================================================================

// Reserve one index for a NEW particle. Returns the entity index to write, or
// \`NO_SLOT\` when the pool is empty.
//
// ONLY EVER DECREASES THE HEAD, which is what makes it safe to act on the
// reservation: within the creation pass nothing moves the head the other way, so
// no two invocations can be handed the same slot.
fn free_list_take() -> u32 {
    let prev = atomicSub(&freelist.head, 1u);
    // prev == 0 means the list was already empty and we have just wrapped it to
    // u32 max. prev > length means it was already corrupt or wrapped earlier.
    if (prev == 0u || prev > arrayLength(&freelist.slots)) {
        atomicAdd(&freelist.head, 1u);   // undo, so the head does not stay wrapped
        return NO_SLOT;
    }
    return freelist.slots[prev - 1u];
}

// Return a dead particle's index to the pool.
//
// ONLY EVER INCREASES THE HEAD. That is why the eraser pass and edge-death
// inside advance() can both call this without coordinating: they agree about
// direction, which is the whole invariant.
//
// The bounds test is not optional: without it a double-free (the eraser and
// edge-death claiming the same particle on the same frame) would push past the
// end of the array. The push is dropped in that case, which LEAKS the index --
// it stays dead and unreusable until the next reset. Leaking a slot is strictly
// better than handing the same slot to two brushes.
fn free_list_give(index: u32) {
    let slot = atomicAdd(&freelist.head, 1u);
    if (slot < arrayLength(&freelist.slots)) {
        freelist.slots[slot] = index;
    } else {
        atomicSub(&freelist.head, 1u);   // undo the overflow, drop the push
    }
}

// ==== end include: freeListOps.wgsl ====

// THE SPLAT ACCUMULATOR: this step's trail deposits, one (x, y) i32 pair per
// canvas pixel, interleaved, at SPLAT_FIXED_SCALE counts per canvas unit. Every
// live particle adds to it here -- see \`deposit\` -- and canvas.wgsl drains it
// into the canvas and zeroes it, so it is empty again by the next step.
@group(0) @binding(4) var<storage, read_write> splat : array<atomic<i32>>;

// The desktop's loose uniforms, gathered into one struct. \`canvas_res\` is the
// \`textureSize()\` hoist -- see uniforms.ts.
struct EntityUpdateUniforms {
    world      : WorldData,
    // xy: canvas resolution   zw: strafe field resolution
    canvas_res : vec4f,
    // xy: shove center (world)   z: strength (signed; 0 is off)   w: size
    shove      : vec4f,
    // x: frame_count(i)   y: strafe_field_active(i)
    // z: walls_strength   w: trails_strength
    //
    // The two strengths took the vec4's LAST TWO SPARE LANES rather than a new
    // vec4 -- the "claim reserved lanes" half of invariant 7, the same move the
    // sensor jitters made in \`misc2\`. They are PREFS, not config, so they are
    // deliberately not in \`WorldData\`: a downloaded config must not carry someone
    // else's decision to mute the walls they painted and you did not.
    flags      : vec4f,
    // x: camera walls strength   y: camera trails strength   zw: reserved
    //
    // Both zero while no camera runs, and \`get_camera\` then skips the sample.
    // A NEW vec4 rather than more spare lanes: \`flags\` had none left.
    camera     : vec4f,
}
@group(0) @binding(2) var<uniform> u : EntityUpdateUniforms;

@group(1) @binding(0) var canvas_texture       : texture_2d<f32>;
@group(1) @binding(1) var canvas_sampler       : sampler;
// The painted Strafe Field (see strafe_field/). Displaces particles directly,
// bypassing velocity. Inactive until the module binds a texture -- the sample
// is skipped entirely rather than reading an unbound one. Step 4 always binds a
// 1x1 dummy with the flag off (WebGPU validates bind groups regardless of
// whether the shader reads them, unlike GL).
@group(1) @binding(2) var strafe_field_texture : texture_2d<f32>;
@group(1) @binding(3) var strafe_field_sampler : sampler;
// The camera's vector field (see webcam/). Rebuilt from the camera picture on
// every new video frame -- nothing accumulates in it, which is why it is a
// texture of its own rather than more channels of the painted field above: the
// painted field persists, and a camera written into it would leave its last
// frame behind for good when it stopped. A 1x1 placeholder until bound.
@group(1) @binding(4) var camera_field_texture : texture_2d<f32>;

fn frame_count() -> i32 { return bitcast<i32>(u.flags.x); }
fn strafe_field_active() -> bool { return bitcast<i32>(u.flags.y) != 0; }
fn canvas_res() -> vec2f { return u.canvas_res.xy; }
// Already multiplied by the old STRAFE_FIELD_GAIN host-side, so this is the whole
// factor -- do not reapply that constant here. See \`get_walls\`.
fn walls_strength() -> f32 { return u.flags.z; }
fn trails_strength() -> f32 { return u.flags.w; }
fn camera_walls_strength() -> f32 { return u.camera.x; }
fn camera_trails_strength() -> f32 { return u.camera.y; }

//=========================================================================================
//------------------------------------RANDOM / HASH / NOISE--------------------------------
//====================================VVVVVVVVVVVVVVVVVVVVV================================
//
// pcg_hash, hash and hash4 now live in rule.wgsl, included above -- the picker
// needs the same hash family to derive the same rule. Nothing about them
// changed in the move.

// Fourier basis evaluation.
// This is how the entities evaluate their Rule.
//
// One center's contribution. \`i\` is the center's index, for its phase offset.
fn fourier_term(center: FourierCenter, i: i32, signals: vec4f) -> vec4f {
    // Compute phase from dot product of input with frequency vector
    let phase = dot(signals, center.frequency);

    // Add per-center phase offset to break degeneracy at origin
    // Use a deterministic offset based on center index and amplitude values
    let phase_offset = 2.0 * f32(i) * 0.6283 + center.amplitude.w * 3.14159;

    // Create basis functions from phase with offset
    // Using sin/cos pairs at fundamental and first harmonic for richer representation
    let basis = vec4f(
        sin(phase + phase_offset),
        cos(phase + phase_offset * 0.7),  // Different offsets for variety
        sin(phase * 2.0 + phase_offset * 1.3),
        cos(phase * 2.0 + phase_offset * 0.5)
    );

    // Weight
    return center.amplitude * basis;
}

// Both black box evaluations -- the base term and the mirror term -- at once.
struct FourierPair {
    base: vec4f,
    mirror: vec4f,
}

// fourier_noise for two signal vectors over the same rule. The GLSL evaluates
// the rule twice, once per signal; this is the same arithmetic in the same
// order, so each result is summed exactly as before.
//
// THREE THINGS HERE ARE PERFORMANCE, AND EACH WAS MEASURED:
//
//  1. IT TAKES A SLOT INDEX, NOT A Rule. Passing the 320-byte Rule by value (as
//     the GLSL does) makes every thread hold it as a local array indexed by the
//     loop counter, which the browser's shader compilers spill to per-thread
//     scratch memory -- ~5x the cost of the entire entity update. Do not
//     "tidy" this back into a Rule parameter.
//
//  2. EACH CENTER IS READ ONCE, FOR BOTH TERMS. Two separate evaluations read
//     all ten centers twice.
//
//  3. IT IS A LOOP, AND THE LOOP IS KEPT A LOOP. This was hand-unrolled once,
//     so the compiler could issue all ten centers' reads early and overlap
//     them with the trig -- a win on the desktop that measured it. On a phone
//     (Pixel 4a, Adreno 618) it was the entity update's whole problem: every
//     center held live at once is ~80 floats of rule data on top of the trig's
//     temporaries, past the register budget, and the cost went SUPERLINEAR --
//     evaluating half the centers made the pass ~4x faster. As a loop only one
//     center is live at a time. That was a large win on the phone and neutral
//     on every other device tried.
//
//     THE BOUND IS OPAQUE ON PURPOSE. \`frame_count()\` is never negative, so it
//     is always 10, but the compiler cannot know that -- and a constant 10 is
//     exactly what invites a driver to unroll the loop straight back into the
//     form that was slow. This is the form that was measured; do not "simplify"
//     it to a literal without measuring on a phone again.
//
// The rule in the slot is already this cohort's mutation -- cohortRules.wgsl
// baked it in when the configs were uploaded.
fn fourier_noise_pair(slot: i32, signals_base: vec4f, signals_mirror: vec4f) -> FourierPair {
    var base = vec4f(0.0);
    var mirror = vec4f(0.0);

    let centers = select(10, 0, frame_count() < 0);
    for (var i = 0; i < centers; i++) {
        let c = configs[slot].rule.centers[i];
        base += fourier_term(c, i, signals_base);
        mirror += fourier_term(c, i, signals_mirror);
    }

    return FourierPair(base, mirror);
}

//=====================================^^^^^^^^^^^^^^^^^^==================================
//------------------------------------RANDOM / HASH / NOISE--------------------------------
//=========================================================================================

// Rotate p around origin by angle a.
// GLSL took \`inout vec2 p\`; WGSL has no inout, so this returns the rotated
// vector and the two call sites assign it back.
fn pR(p: vec2f, a: f32) -> vec2f {
    return cos(a) * p + sin(a) * vec2f(p.y, -p.x);
}

// Read the user-drawn field at a world position, honoring the boundary mode for
// the same reason get_can does: past the edge, wrap reads the far side and every
// other mode reads the edge.
//
// ONE SAMPLE, BOTH LAYERS. The texture is rgba16float -- walls in rg, trails in
// ba (see \`FIELD_FORMAT\`) -- and the two callers below take the half they want.
// Sampling it twice would cost a second fetch for data the first one already
// returned.
//
// DECLARED ABOVE \`get_can\` BECAUSE \`get_can\` CALLS IT. WGSL requires a function
// to be declared before it is used, unlike GLSL's more forgiving rules -- and the
// error a wrong order produces here names the callee, not the ordering.
fn get_field(p: vec2f, bc: i32) -> vec4f {
    if (!strafe_field_active()) { return vec4f(0.0); }
    let res = u.canvas_res.zw;
    return textureSampleLevel(strafe_field_texture, strafe_field_sampler,
                              world_to_uv_bc(p, res, bc), 0.0);
}

// The camera field at a world position, times \`strength\` -- or zero, without
// sampling, when the strength is zero. Each destination calls this with its own
// strength and exactly one of the two is ever nonzero, so the camera costs at
// most one fetch per caller and none at all while it is off.
//
// THE CANVAS'S RESOLUTION, NOT THE FIELD'S, goes to \`world_to_uv_bc\`. That
// argument only supplies the world's ASPECT (\`world_half_extent_from_res\`), and
// the camera field is a fixed square texture whose own shape says nothing about
// the world's -- \`webcamField.ts\` stretches it over the world and corrects for
// the stretch in its own passes. Shares the painted field's sampler, so it
// follows the boundary mode the same way.
//
// AN \`if\`, NOT A MULTIPLY BY ZERO: the point is to skip the fetch.
fn get_camera(p: vec2f, bc: i32, strength: f32) -> vec2f {
    if (strength == 0.0) { return vec2f(0.0); }
    let uv = world_to_uv_bc(p, canvas_res(), bc);
    return textureSampleLevel(camera_field_texture, strafe_field_sampler, uv, 0.0).rg
         * strength;
}

// The WALLS layer: a displacement added straight to position.
//
// \`walls_strength\` REPLACED THE \`STRAFE_FIELD_GAIN\` CONSTANT that used to live in
// common.wgsl. The host multiplies the user's 0..4 slider by that same 0.01, so a
// strength of 1.0 reproduces the old constant exactly and nothing about a painted
// field changes on upgrade. What the slider buys is the ability to mute a painted
// set of walls (0.0) or lean on it (4.0) without repainting.
fn get_walls(p: vec2f, bc: i32) -> vec2f {
    return get_field(p, bc).rg * walls_strength()
         + get_camera(p, bc, camera_walls_strength());
}

// Which way is "down" for this particle, shared by all three gravity channels.
//
// TAKEN ONCE, IN ONE PLACE, so Force, Strafe and Trails can never disagree about
// it. Radial Gravity swings it from the fixed screen axis to the particle's own
// position vector, which points AWAY from the origin -- the callers negate, so a
// positive slider still falls "down", now meaning inwards.
//
// A particle sitting exactly on the origin has no direction to fall in.
// normalize() would hand back NaN there and poison the position for good, so
// that one case gets vec2(0) -- no pull rather than an arbitrary one.
//
// HOISTED OUT OF \`main\` when Gravity (Trails) arrived: the trails channel biases
// the SENSOR READ, which happens well before the motion channels are applied, so
// the direction is now needed at two points in the step rather than one. Sharing
// a function rather than recomputing it is what keeps the guarantee above true.
fn gravity_direction(pos: vec2f, config: ConfigData) -> vec2f {
    if (!cfg_radial_gravity(config)) { return vec2f(0.0, 1.0); }
    let r = length(pos);
    // An \`if\`, not select() -- same reason as safenorm: select() evaluates both
    // arms, and \`pos / r\` at r == 0 is the NaN this guard exists to prevent.
    if (r > 0.0) { return pos / r; }
    return vec2f(0.0);
}

// Convert p from worldspace to texture coords and retrieve canvas.
// The boundary mode decides what a sensor reaching past the edge sees: in
// BC_WRAP the sampler repeats and it reads the far side; otherwise it clamps
// and reads the edge, because in those modes the far side is not adjacent.
//
// \`bias\` is Gravity (Trails): a constant vec2 the caller has already expanded and
// aimed, added to the reading exactly where the painted trails layer is added.
// Zero when the slider is centred, which is the whole cost of the feature when
// it is off.
//
// \`weight\` is the reader's Trail Weight (cfg_trail_weight), and divides the
// SWARM'S TRAILS ONLY. That is what makes it invisible to a config alone: its
// own deposits were multiplied by the same number, so they come back as they
// went in. The painted layer and the bias are NOT divided -- neither was laid
// by a config, so dividing them would change how a lone config answers the
// user's brush and its own gravity, which is exactly what the weight must not do.
fn get_can(p: vec2f, bc: i32, bias: vec2f, weight: f32) -> vec4f {
    // The GLSL calls textureSize() here, twice per invocation. Hoisted to the
    // uniform -- see the header of uniforms.ts.
    let res = canvas_res();
    // Stored values ride CANVAS_VALUE_SCALE above their physical meaning (an
    // fp16 range fix -- see common.wgsl); divide it back out so the sensors
    // see the same magnitudes they always did. The clamp guards against a
    // transient inf texel (a splat pile-up the canvas pass has not scrubbed
    // yet): sensing inf would NaN the particle's position permanently.
    //
    // textureSampleLevel, not textureSample: a compute entry point has no
    // implicit derivatives, so the sampling level must be given explicitly.
    // Identical here -- there are no mips.
    let canv = textureSampleLevel(canvas_texture, canvas_sampler,
                                  world_to_uv_bc(p, res, bc), 0.0);
    let trail = clamp(canv, vec4f(-CANVAS_VALUE_MAX), vec4f(CANVAS_VALUE_MAX))
                / (CANVAS_VALUE_SCALE * weight);

    // THE USER-DRAWN TRAILS LAYER, added to what the sensors see.
    //
    // This is the whole difference between the two painted layers: walls are
    // added to POSITION and no rule can resist them, while trails are added to
    // the SENSOR READING, so the particle merely believes something is there and
    // its rule decides what to do about it. Painted trails steer; painted walls
    // shove. A trail the user paints is therefore indistinguishable, to a
    // particle, from one the swarm laid down itself -- which is the point, and
    // the reason this is an addition here rather than a term further down.
    //
    // AFTER THE DESCALE, deliberately. The canvas stores values multiplied by
    // CANVAS_VALUE_SCALE (an fp16 range fix); the painted field does not, because
    // the brush writes it directly. Adding before the divide would shrink the
    // painted contribution by 512x -- not zero, so it would look like the feature
    // works and the slider does nothing.
    //
    // Only xy carry a vector: the canvas is a 2D field (\`camera.wgsl:85\`
    // colorizes it as atan2(y, x)), so the trails layer is one too and zw stay
    // whatever the canvas put there.
    // GRAVITY (TRAILS) RIDES THE SAME ADDITION, deliberately.
    //
    // It is the painted trails layer with a constant in place of a texture: same
    // channel, same place in the pipeline, same units. Everything the comment
    // above says about painted trails is therefore true of it -- a particle
    // cannot tell this bias from a trail the user drew or one the swarm laid
    // down, and its rule is what decides whether that means fall or climb.
    //
    // Being HERE rather than after \`sensor_scaling\` means Sensor Gain multiplies
    // it, which is correct for the same reason: gain is how loudly this
    // population hears the canvas, and a bias it cannot distinguish from the
    // canvas must be heard just as loudly. A config with the gain at zero senses
    // nothing at all, and this is nothing at all along with it.
    //
    // THE CAMERA, when it feeds Trails, rides this same addition for the same
    // reason: to a particle it is one more trail it did not lay itself.
    let painted = get_field(p, bc).ba * trails_strength()
                + get_camera(p, bc, camera_trails_strength());
    return trail + vec4f(painted + bias, 0.0, 0.0);
}

// The Shove tool: a displacement away from (or toward) the cursor while the
// mouse is held. Unlike the painted field this leaves NOTHING behind -- it acts
// only on the frames the button is down, which is what makes it feel like
// pushing the particles rather than painting something that pushes them.
//
// Measured in world space directly. That space is area-preserving, so a circle
// in it is a circle on screen and no aspect correction is needed here (see the
// coordinate convention in common.wgsl).
//
// Deliberately NOT boundary-aware, unlike the two readers above. Those sample a
// texture, where past the edge has to mean something; this is a distance to a
// point the user is pointing at. In BC_WRAP a shove near the edge does not
// reach around to the far side, because the cursor is not there.
const SHOVE_MULTIPLIER: f32 = 8.0;
fn get_shove(p: vec2f) -> vec2f {
    let shove_strength = u.shove.z;
    if (shove_strength == 0.0) { return vec2f(0.0); }
    let away = p - u.shove.xy;
    let d = length(away);
    // Exactly on the cursor the direction is undefined. Contributing nothing is
    // also what keeps ATTRACT stable: the kernel peaks here, so without this
    // guard the strongest pull would be the one with no direction to pull in.
    if (d <= 0.0) { return vec2f(0.0); }

    // Same gaussian the brush paints with, so the reticle shows the real reach
    // of both tools. No cutoff radius: a distant particle gets a denormal rather
    // than a branch, and every invocation pays for the exp() either way.
    let shove_size = u.shove.w;
    let kernel = exp(-d * d / (2.0 * shove_size * shove_size));
    return SHOVE_MULTIPLIER * (away / d) * shove_strength * kernel;
}

// Normalize vector that tolerates vec2(0).
//
// AN \`if\`, NOT \`select()\`. GLSL's \`?:\` evaluates only the taken branch, but
// WGSL's \`select(f, t, cond)\` is an ordinary function call: BOTH arguments are
// evaluated first. \`normalize(vec2f(0.0))\` is 0/0 -- NaN -- so a select() here
// would compute the NaN and then discard it, which is fine on paper and a
// coin-flip in practice once a compiler is allowed to contract or reassociate
// around it. The whole point of this function is that vec2(0) is a value it
// must survive, so the branch stays a branch.
fn safenorm(p: vec2f) -> vec2f {
    if (length(p) == 0.0) { return vec2f(0.0); }
    return normalize(p);
}

// get_cohort now lives in rule.wgsl (the picker needs the same cohort to derive
// the same rule). It takes the entity count as a THIRD ARGUMENT there, because
// a shared function cannot name a binding that the two including shaders
// qualify differently -- so every call below passes arrayLength(&entities).

// Decide which ConfigData slot an entity uses. See configSlots.ts for the layout.
//
// STUDIO (CONFIG_PER_COHORT): the slot IS the particle's cohort. \`main\` calls
// this EVERY STEP rather than only at reset, because the cohort is a function of
// the index and the live Cohorts count -- a stored slot would go stale the
// moment the slider moved, and particles would keep a rule from the old split.
// Every slot is a copy of one parent, so slot 0's cohort count is everyone's.
//
// SAND: the slot is whatever the spawn pass wrote, and this is only reached on
// a reset frame, which sand never runs (see the dead-particle note in \`main\`).
fn assign_config_index(index: u32) -> i32 {
    if (!CONFIG_PER_COHORT) { return 0; }
    return i32(floor(get_cohort(index, configs[0], arrayLength(&entities))));
}

// Where an entity starts, per the config's initial-conditions mode.
//
// PURE, and deliberately so: Cohort Fences needs to know where a particle's
// home is on every frame, and recomputing it here is cheaper than widening
// Entity to store it. Because both the fence and reset() call this, they can
// never disagree about where home is.
//
// How IC_GRID divides the world: the number of cells across and down.
//
// Split out of initial_position so COHORT FENCES can size itself from the same
// numbers the layout uses. The fence radius is half a cell (see the fence block
// in entity_update), and "half a cell" is only the right answer if it is half of
// THE cell this function laid out -- so the two must read from one place. Duplicating
// the cols/rows expression would let a future change to the layout silently
// stop the fences from touching.
//
// One cell per cohort, laid out so the cells come out roughly SQUARE: for n
// cohorts in a box of aspect a, that wants sqrt(n*a) columns. (Using n*a rather
// than sqrt(n)*a is the difference between a grid and a single wide strip on a
// wide canvas.)
fn grid_cells(cohorts: i32, extent: vec2f) -> vec2f {
    let cols = max(1.0, round(sqrt(f32(cohorts) * extent.x / extent.y)));
    return vec2f(cols, ceil(f32(cohorts) / cols));
}

// Every mode starts from the same small per-cohort jitter, then places it.
// Grid and Ring are expressed in world extent rather than the reference's
// inline aspect fudge, so they stay correct on a non-square canvas.
fn initial_position(index: u32, config: ConfigData) -> vec2f {
    let cohort_val = get_cohort(index, config, arrayLength(&entities));
    let extent = world_half_extent_from_res(canvas_res());

    // vec2(x) in GLSL is a SPLAT, not a (x, 0) constructor -- vec2f(x) here
    // means the same thing. \`index\` is a u32 promoted to float by GLSL.
    var pos = 0.019 * vec2f(hash(vec2f(cohort_val)),
                            hash(vec2f(cohort_val + f32(index) + 2.142)));

    let mode = cfg_initial_conditions(config);
    let cohorts = max(1, cfg_cohorts(config));

    if (mode == IC_GRID) {
        let cells = grid_cells(cohorts, extent);
        let cols = cells.x;
        // GLSL's mod() is floored and WGSL's \`%\` is truncated, so they are NOT
        // interchangeable in general. They agree here because floor(cohort_val)
        // is non-negative BY CONSTRUCTION -- cohort_val is cohorts*index/N, a
        // quotient of non-negatives -- and cols >= 1.0. That is what makes \`%\`
        // safe; if cohort_val could go negative this would need a floored mod.
        // (Same reasoning, same wording, as edge_fold in common.wgsl.)
        let cell = vec2f(floor(cohort_val) % cols, floor(floor(cohort_val) / cols));
        pos += (cell + 0.5) / cells * 2.0 * extent - extent;
    }
    else if (mode == IC_RANDOM) {
        // Scattered across the whole world. Note this ASSIGNS rather than adds:
        // the jitter above is discarded in this mode.
        pos = (vec2f(hash(vec2f(cohort_val, 1.0)), hash(vec2f(cohort_val, 2.0))) * 2.0 - 1.0) * extent;
    }
    else if (mode == IC_RING) {
        let angle = cohort_val / f32(cohorts) * 2.0 * PI;
        pos += vec2f(cos(angle), sin(angle)) * 0.5 * min(extent.x, extent.y);
    }
    // IC_CENTER: the bare jitter, which is what this app did before the mode
    // was selectable. Kept as a real mode so that look stays reachable.

    return pos;
}

// ---------------------------------------------------------------------------
// THE TRAIL DEPOSIT
// ---------------------------------------------------------------------------
// Each live particle adds its velocity to ONE canvas pixel per step, with
// atomics, straight from this pass. This replaced a brush render pass that drew
// a point per particle and let the blend unit do the adding: same deposits,
// but no extra graphics pass per sub-step, which roughly doubled the frame rate
// on a phone GPU and made no difference on desktop ones.
//
// WHY ONE PIXEL. The desktop drew an instanced gaussian QUAD ~1.5 px wide, so
// the rasterizer's per-primitive work dwarfed the pixels it wrote, and what it
// deposited swung ~700x with the particle's subpixel position: the kernel is
// only sampled at the pixel centres the quad happens to cover. Instead each
// particle deposits the quad's EXPECTED TOTAL into one pixel, chosen at random
// with the same odds the quad spread its weight -- so every pixel receives the
// same amount on average, without the aliasing. Trails match the quad's in
// expectation, not texel for texel. This is the desktop's own atomic deposit
// (Fluoddity experiments2, ca7b4a5).
//
// The quad blended \`vel * k^2\` per pixel, with k = gaussian(uv - 0.5, SIGMA)
// normalised in the quad's 0..1 uv and cut off at radius RADIUS. Over a quad
// \`dot_px\` pixels wide, the sum of k^2 is dot_px^2 times its integral over the
// disc -- the closed form below, checked numerically in shaders.test.ts -- and
// k^2 is itself a gaussian of sigma SIGMA/sqrt(2), which is the spread the
// random pixel is drawn with.
//
// CALLED WITH THE STATE BEING WRITTEN, after the move: the order ported from
// the desktop splats after the entity update (see particleSystem.ts), so a
// particle deposits from where it has just arrived.
//
// \`weight\` is the depositor's Trail Weight -- the multiply half of the pair
// \`get_can\` divides by. See cfg_trail_weight.
//
// PRECISION AT SMALL WEIGHTS. The deposit is rounded to whole fixed-point
// counts, so a light config's faint deposits lose resolution the division then
// amplifies: at 0.02 a slow particle at high persistence deposits under one
// count per component. Stochastic rounding (floor(value + hash)) would make that
// unbiased; left out until a weight that small is actually used.
const SPLAT_SIGMA: f32 = 0.163;
const SPLAT_RADIUS: f32 = 0.5;
fn deposit(index: u32, pos: vec2f, vel: vec2f, size: f32, weight: f32) {
    let res = canvas_res();
    // Canvas pixels per world unit. The same on both axes -- world space is
    // area-preserving (common.wgsl) -- so x stands for both.
    let px_per_world = res.x / (2.0 * world_half_extent_from_res(res).x);
    // The old quad spanned +-size in world units.
    let dot_px = 2.0 * size * px_per_world;
    let amount = (1.0 - exp(-SPLAT_RADIUS * SPLAT_RADIUS / (SPLAT_SIGMA * SPLAT_SIGMA)))
                 / (4.0 * PI * SPLAT_SIGMA * SPLAT_SIGMA) * dot_px * dot_px;

    // Box-Muller: a gaussian offset with k^2's spread, in pixels. Seeded on
    // (index, frame), so each particle lands somewhere new every step. u1 is
    // kept off zero, where log() is -inf.
    let fc = f32(frame_count());
    let u1 = max(hash(vec2f(f32(index), fc + 0.25)), 1e-7);
    let u2 = hash(vec2f(fc + 0.75, f32(index)));
    let offset_px = sqrt(-2.0 * log(u1)) * vec2f(cos(2.0 * PI * u2), sin(2.0 * PI * u2))
                    * (SPLAT_SIGMA / sqrt(2.0)) * dot_px;

    // In BC_WRAP a deposit past an edge wraps onto the far side, as the particle
    // itself would; in every other mode it falls off the canvas and is dropped.
    var uv = world_to_uv(pos, res) + offset_px / res;
    if (world_boundary_conditions(u.world) == BC_WRAP) {
        uv = fract(uv);
    }
    if (any(uv < vec2f(0.0)) || any(uv >= vec2f(1.0))) { return; }

    // Read as a texture coordinate, v counts rows from the texture's first row
    // -- the row \`get_can\` samples at that same v -- so this pixel, indexed
    // row-major from row 0, is the texel the sensors will read. canvas.wgsl
    // drains by the same index. No flip anywhere: the old brush pass had to
    // negate NDC y to land here, because the rasterizer's y and the texture's v
    // disagree. The min() guards fract's round-up to 1.0.
    let pixel = min(vec2u(uv * res), vec2u(res) - 1u);

    // Premultiplied by (1-P)/P so that after the canvas pass's P decay the
    // steady contribution matches the desktop's (1-P)*brush mix, and scaled by
    // CANVAS_VALUE_SCALE like every canvas value (see common.wgsl).
    let P = clamp(world_trail_persistence(u.world),
                  TRAIL_PERSISTENCE_MIN, TRAIL_PERSISTENCE_MAX);
    let premult = (1.0 - P) / P;
    let value = vel * weight * amount * premult * CANVAS_VALUE_SCALE * SPLAT_FIXED_SCALE;
    // Clamped inside i32 before converting; a single deposit that large is
    // already far past what the canvas can hold (see SPLAT_FIXED_SCALE).
    let fixed = vec2i(round(clamp(value, vec2f(-2.0e9), vec2f(2.0e9))));
    let i = (pixel.y * u32(res.x) + pixel.x) * 2u;
    atomicAdd(&splat[i], fixed.x);
    atomicAdd(&splat[i + 1u], fixed.y);
}

// Return an entity to its initialization state.
//
// NOTE: this writes the entity buffer ITSELF, so every caller must return
// immediately after -- a later \`entities[index]=...\` would clobber it.
fn reset(index: u32, config: ConfigData) {
    let size = select(0.0, 0.0015 / world_sqrt_world_size(u.world),
                      index < arrayLength(&entities));
    let cohort_val = get_cohort(index, config, arrayLength(&entities));

    let pos = initial_position(index, config);
    let vel = 0.00005 * (vec2f(hash(vec2f(cohort_val, f32(index))),
                               hash(vec2f(cohort_val, pos.y))) * 2.0 - 1.0);

    // store to persistent entity buffer
    entities[index] = make_entity_reset(pos, vel, size, assign_config_index(index));
    // A respawned particle deposits where it landed. Not on frame 0: that is
    // the reset sentinel, the canvas pass is clearing, and it must not be
    // immediately re-dirtied (particle_system.py:259-275).
    if (frame_count() != 0) { deposit(index, pos, vel, size, cfg_trail_weight(config)); }
}

// mutate_rule now lives in rule.wgsl, beside the generate-or-mutate branch that
// chooses between it and generate_random_centers.

// Gravity-like force expansion: maps a linear -1..1 slider (gravity_force /
// gravity_strafe) to a logarithmic physical force, so a small knob covers a
// wide range. Odd-symmetric, with a dead zone near centre that means exactly
// no gravity.
//
//   physical = sign(c) * MAXV * 10^(DECADES*(|c|-1))   for |c| > KNEE
//   physical = 0                                       for |c| <= KNEE
//
// ## THE CLAMP IS LOAD-BEARING
//
// A config may legitimately hold a value outside the slider's bounds
// (\`gating.ts:46-50\` -- \`position()\` clamps the POSITION, never the value), and
// a hand-edited save file or a typed field can put one there. Unclamped,
// pow(10, DECADES*(a-1)) with a >> 1 overflows to Inf, and Inf * a zeroed
// gravity_dir is NaN -- which poisons that particle's position permanently and
// takes a restart to clear. Clamping the input costs one instruction and closes
// the whole class.
//
// ## THE DEAD ZONE IS A HARD ZERO, not a ramp
//
// It used to ramp linearly from 0 at c == 0 up to the knee value, which reaches
// exactly 0 only at exactly 0.0. Every slider position NEAR zero therefore
// still applied a small pull, which is not what a control sitting visually at
// centre should do. A dead zone that means "no gravity" has to actually be one.
//
// That makes the curve discontinuous at |c| == KNEE, stepping to
// MAXV*10^(DECADES*(KNEE-1)) -- with the constants below, ~6e-5, which is far
// below what is visible in a frame. Widen GRAVITY_DECADES before restoring the
// ramp if that step ever becomes noticeable.
const GRAVITY_MAXV: f32    = 0.5;   // physical value at |control| = 1
const GRAVITY_DECADES: f32 = 4.0;   // log span: MAXV .. MAXV/10^DECADES
const GRAVITY_KNEE: f32    = 0.05;  // |control| at or below this is exactly 0
fn gravity_expand(c: f32) -> f32 {
    let cc = clamp(c, -1.0, 1.0);
    let a = abs(cc);
    if (a <= GRAVITY_KNEE) {
        return 0.0;
    }
    return sign(cc) * GRAVITY_MAXV * pow(10.0, GRAVITY_DECADES * (a - 1.0));
}

// Used to enforce left-right symmetry in the local coordinates vec2(forward, left).
fn y_reflect(p: vec2f) -> vec2f {
    return p * vec2f(1.0, -1.0);
}

// Somewhat arbitrary generator of functions with 4 float inputs and 4 float outputs,
// varying rule should smoothly change the behavior of black box. Here, we use fourier noise.
//
// Evaluated for the base signal (L, R) and the mirrored one together -- see
// fourier_noise_pair for why they share one pass.
fn black_box_pair(L: vec2f, R: vec2f, L_mirror: vec2f, R_mirror: vec2f,
                  slot: i32) -> FourierPair {
    return fourier_noise_pair(slot, vec4f(L, R), vec4f(L_mirror, R_mirror));
}

// What calculate_entity_behavior returns. GLSL used three \`out\` parameters;
// WGSL has none, so they come back as a struct.
struct Behavior {
    // A "push" vector that will be added to entity.vel
    force: vec2f,
    // A "hop" vector that will be added to entity.pos and have no effect on velocity
    strafe: vec2f,
    // Raw signal kept for rendering only -- never fed back into the physics
    color: vec2f,
}

// This function determines entity output by plugging sensor values into a noise function called black_box()
// The calculation is performed twice, once in mirrored coordinates, and the two values are averaged.
// This keeps entities from displaying clockwise/counterclockwise bias.
// PARAMETERS:
// --L and R: velocity field measurements from left sensor and right sensor.
// --axis: forward vector that defines our orientation.
// --slot: the config slot whose (already mutated) rule dictates entity behavior.
fn calculate_entity_behavior(L_in: vec2f, R_in: vec2f, axis: vec2f, slot: i32,
                             config: ConfigData) -> Behavior {
    // Build a local coordinate frame where "axis" is forward.
    let forward = safenorm(axis);
    let left = vec2f(forward.y, -forward.x);

    // Convert L and R to local coordinates.
    // Ie. decompose each into an axial component and a lateral component.
    //
    // WGSL parameters are immutable, so these are locals. Each is computed from
    // its OWN pre-decomposition value on a single line, exactly as the GLSL
    // does -- dot(L, left) must see the original L, not the rewritten one.
    let L = vec2f(dot(L_in, forward), dot(L_in, left));
    let R = vec2f(dot(R_in, forward), dot(R_in, left));

    // Calculate black box noise values.
    // Note the L/R SWAP in the mirror term, not merely a reflection.
    let terms = black_box_pair(L, R, y_reflect(R), y_reflect(L), slot);
    let baseterm = terms.base;
    let mirrorterm = terms.mirror;

    // Combine base and mirror terms to cancel bias
    var force = baseterm.xy + y_reflect(mirrorterm.xy);
    var strafe = baseterm.zw + y_reflect(mirrorterm.zw);

    // Convert force and strafe back to world coordinates
    force = (forward * force.x * cfg_axial_force(config)) + (left * force.y * cfg_lateral_force(config));
    strafe = (forward * strafe.x * cfg_axial_force(config)) + (left * strafe.y * cfg_lateral_force(config));

    // An arbitrary function of the black box output, reusing the force terms.
    // NOT y_reflect'd, unlike force above: cancelling the mirror bias is what
    // keeps motion free of a clockwise preference, but colour WANTS that
    // asymmetry -- it is what makes the signal something other than a recoloured
    // copy of where the particle is already going.
    //
    // Stays in local coordinates. Nothing downstream treats it as a direction.
    let color = baseterm.xy + mirrorterm.xy;

    return Behavior(force, strafe, color);
}

// WORKGROUP SIZE 256 -- must match WORKGROUP_SIZE in particleSystem.ts. These
// live in different files and drifting them under-dispatches silently, leaving
// a tail of entities frozen; shaders.test.ts asserts they agree.
@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid: vec3u) {
    let index = gid.x;
    if (index >= arrayLength(&entities)) { return; }

    let e = entities[index];

    let fc = frame_count();

    // DEAD PARTICLES COST ONE READ AND A BRANCH, and nothing else. This is the
    // whole of "only pay for living particles" in the update path: no sensor
    // taps, no rule derivation, no black box evaluation.
    //
    // ABOVE THE CONFIG LOOKUP DELIBERATELY. That line clamps config_index into
    // range, which would turn a dead particle's -1 into config 0 and run a full
    // physics step on it -- the particle would be invisible (the renderers cull
    // it) while still depositing trails and burning a full step's work. The
    // clamp is right for its own job (a shrunk ConfigBuffer degrades gracefully)
    // so this test goes above it rather than replacing it.
    //
    // A RESET FRAME RESURRECTS IN THE STUDIO, AND ONLY THERE. The studio can
    // select BC_KILL too, and its particles have no other way back: there is no
    // brush to respawn them, so without this a kill boundary empties the world
    // until a page reload. A reset means "start over", which includes the dead,
    // so on frame 0 they fall through to reset() below like everyone else.
    //
    // Sand must NOT be repopulated by that path -- it restores to frame 1
    // precisely so it never runs, but a stray frame 0 must leave the dead dead.
    // CONFIG_PER_COHORT is the app switch, as it is for the hazard branch below.
    if (e_is_dead(e) && !(CONFIG_PER_COHORT && fc == 0)) { return; }

    // Select this entity's config. On a reset frame the entity's stored
    // config_index is not yet meaningful (nothing has been written), so ask
    // assign_config_index() directly rather than reading it back.
    //
    // The studio re-assigns on EVERY step, not just this one -- see
    // assign_config_index for why its slot cannot be stored.
    let config_index = select(e_config_index(e), assign_config_index(index),
                              fc == 0 || CONFIG_PER_COHORT);
    let slot = clamp(config_index, 0, world_config_count(u.world) - 1);
    let config = configs[slot];

    let sqrt_world_size = world_sqrt_world_size(u.world);
    let canvas_resolution = canvas_res();

    let cohort = get_cohort(index, config, arrayLength(&entities));
    // Hazard Rate == probability each frame that this particle's life ends
    let hazard_hit = cfg_hazard_rate(config)
        > hash(vec2f(f32(index) / f32(arrayLength(&entities)), f32(fc)));

    // frame_count == 0 signals a simulation reset
    if (fc == 0) { reset(index, config); return; }

    // WHAT BECOMES OF A HAZARD HIT DEPENDS ON THE APP. The studio respawns it,
    // as it always has. Sand KILLS it, exactly as BC_KILL does below: sand has
    // no respawn -- particles come only from the brush -- and reset() would
    // bring it back at an initial position under the MASTER's config
    // (assign_config_index), whatever species it was.
    //
    // CONFIG_PER_COHORT is the app switch: off exactly when the pipeline has
    // lifetimes (\`particleSystem.ts\`), which is also exactly when the free list
    // is real. The studio binds a dummy, so it must never reach the push.
    if (hazard_hit) {
        if (CONFIG_PER_COHORT) {
            reset(index, config);
        } else {
            free_list_give(index);
            entities[index] = make_entity_dead();
        }
        return;
    }

    var pos = e_pos(e);
    var vel = e_vel(e);

    // THE STALLED-PARTICLE RESCUE.
    //
    // A particle's heading IS its velocity: \`orientation\` below is
    // \`safenorm(vel)\`, which returns vec2(0) at zero. Both sensor offsets then
    // collapse onto the particle itself, so it samples the same texel twice,
    // \`calculate_entity_behavior\` gets a zero \`axis\` and builds a degenerate
    // frame, and the force it produces cannot restore a direction it no longer
    // has. The particle is stuck for good -- it never moves again, and nothing
    // in the simulation can dislodge it.
    //
    // Reachable from two directions. Drag compounds every step, so any particle
    // whose rule stops driving it decays toward zero and eventually underflows;
    // and anything that CREATES a particle at rest starts it there (the sand
    // modality's spawn brush does exactly that, which is how this was found).
    //
    // So: below a floor, give it a random heading at that floor's magnitude.
    // Cheaper than the alternative of special-casing the degenerate frame
    // downstream, and it fixes the cause rather than one of its symptoms.
    //
    // MIN_VELOCITY is \`reset()\`'s own spawn magnitude, so a rescued particle is
    // indistinguishable from a freshly reset one -- a number this file already
    // chose for the job of "moving enough to have a direction".
    //
    // Seeded on (index, frame) like the sensor jitters, so two particles at the
    // same spot get different headings and one particle re-rolls if it stalls
    // again. Note this runs BEFORE the sensors read, so the rescue takes effect
    // on the very step it fires rather than the next one.
    if (length(vel) < MIN_VELOCITY) {
        let kick = hash(vec2f(f32(index) + 7.77, f32(fc))) * 2.0 * PI;
        vel = MIN_VELOCITY * vec2f(cos(kick), sin(kick));
    }

    // Sensor jitter: a random wobble on where this particle looks, resampled
    // EVERY STEP rather than fixed per particle -- so it reads as a shimmer that
    // softens structure, not as a population of individuals with different eyes.
    //
    // Each slider is 0..1 and scaled so that 1.0 spans the whole range of the
    // parameter it perturbs: angle is a -1..1 half-turn control so it needs no
    // scaling, distance is 0..SENSOR_DISTANCE_SPAN so it takes that factor.
    // Both offsets are the SAME draw, applied to both sensors together, so the
    // pair stays symmetric about the heading and jitter never introduces the
    // left/right bias that y_reflect exists to cancel.
    var angle = cfg_sensor_angle(config);
    var distance = cfg_sensor_distance(config);

    let angle_jitter = cfg_sensor_angle_jitter(config);
    if (angle_jitter != 0.0) {
        angle += angle_jitter * (2.0 * hash(vec2f(f32(index), f32(fc))) - 1.0);
    }
    let distance_jitter = cfg_sensor_distance_jitter(config);
    if (distance_jitter != 0.0) {
        // Deliberately UNCLAMPED: a negative distance puts both sensors behind
        // the particle (and swaps which is left), which is a genuinely different
        // look that no combination of the other sliders can reach.
        distance += SENSOR_DISTANCE_SPAN * distance_jitter
                  * (2.0 * hash(vec2f(f32(index) + 0.5, f32(fc))) - 1.0);
    }

    // Calculate position offsets for the two sensors.
    let sample_dist = 1.0 / sqrt_world_size * 0.005 * distance;
    // Vector facing the same direction as velocity, with length==sample_dist
    let orientation = safenorm(vel);

    // Rotate them opposite directions.
    let left_sensor_offset = pR(orientation * sample_dist, angle * PI);
    let right_sensor_offset = pR(orientation * sample_dist, -angle * PI);

    // Which way is "down", for all three gravity channels. Taken here rather than
    // beside the two motion channels below because the trails channel needs it
    // NOW, to bias the reads on the next line.
    let gravity_dir = gravity_direction(pos, config);

    // GRAVITY (TRAILS): a constant added to what the sensors report, negated on
    // the same convention as the other two so a positive slider means "down".
    //
    // ONE BIAS FOR BOTH SENSORS. Left and right get the identical vector, which
    // is what makes it a bias rather than a steer: an asymmetric one would push
    // every particle to one side, reintroducing exactly the handedness that
    // y_reflect in calculate_entity_behavior exists to cancel.
    //
    // DIVIDED BY sqrt_world_size, to CANCEL the multiply in \`sensor_scaling\`.
    //
    // This is not the same 1/sqrt_world_size the two motion channels apply, and
    // it is not applied for the same reason -- it is the inverse of a term this
    // value is about to be multiplied by, and it exists to make the bias
    // world-invariant like the other two gravity channels.
    //
    // WHY THE MULTIPLY IS RIGHT FOR EVERYTHING ELSE. \`sensor_scaling\` below is
    // \`sqrt_world_size * 38.855 * gain\`. The canvas is a DENSITY: the same
    // population spread over a larger world lays fainter trails per texel, so a
    // real reading dilutes as the world grows and the multiply is what undoes
    // that. Sensor readings therefore stay world-invariant.
    //
    // A CONSTANT HAS NOTHING TO DILUTE. \`trail_bias\` is not sampled from the
    // canvas -- it is a fixed vector added at the same point (see \`get_can\`), so
    // it never shrank in the first place. Riding the multiply unopposed made
    // Gravity (Trails) grow as sqrt_world_size while Gravity (Force) and Gravity
    // (Strafe) shrank as 1/sqrt_world_size, leaving the trails channel scaling
    // with world size where the other two are invariant.
    //
    // Dividing here rather than moving the addition after \`sensor_scaling\` keeps
    // Sensor Gain applying to the bias, which is deliberate -- see \`get_can\`.
    let trail_bias =
        -gravity_expand(cfg_gravity_trails(config)) * gravity_dir / sqrt_world_size;

    // Read the trails from canvas.
    let bc = world_boundary_conditions(u.world);
    let trail_weight = cfg_trail_weight(config);
    var ltap = get_can(pos + left_sensor_offset, bc, trail_bias, trail_weight);
    var rtap = get_can(pos + right_sensor_offset, bc, trail_bias, trail_weight);

    // NO RULE DERIVATION HERE. The generate-or-mutate branch runs once per
    // config slot in cohortRules.wgsl, and the black box below reads the result
    // out of the slot. Calling derive_entity_rule here again would mutate an
    // already-mutated rule; shaders.test.ts asserts it stays out.

    // Rescale sensor values.
    let sensor_scaling = sqrt_world_size * 38.855 * cfg_sensor_gain(config);
    ltap *= sensor_scaling;
    rtap *= sensor_scaling;

    // Compute entity action.
    let behavior = calculate_entity_behavior(ltap.xy, rtap.xy, orientation, slot, config);
    var force = behavior.force;
    var strafe = behavior.strafe;
    var col_params = behavior.color;

    // The particle's cohort, carried alongside the brain's signal so the
    // RENDERER can choose between them. This shader transmits both and decides
    // nothing: Color By Cohort is a display choice, and deciding it here would
    // mean the checkbox did nothing until the next physics step -- so it would
    // appear broken while paused, which is exactly when you want to compare.
    //
    // Sent raw. What a cohort index looks like as a colour is the renderer's
    // business (see cam_brush.frag).
    col_params.y = floor(cohort);

    // Rescale output forces.
    force *= 1.0 / sqrt_world_size * cfg_global_force_mult(config) / 400.0;
    strafe *= 1.0 / sqrt_world_size * cfg_global_force_mult(config) / 20.0;

    // Accelerate: Apply drag and add force to e.vel.
    vel = vel * cfg_drag(config) + force;

    // Uniform pull on the whole population, in the two MOTION channels: _force
    // feeds velocity (after drag, so drag does not damp it away the same frame),
    // _strafe displaces position directly. Negated so a positive slider pulls
    // DOWN the screen. Scaled by 1/sqrt_world_size like every other force here,
    // so the feel survives a World Size change.
    //
    // The third channel, _trails, is not here and is not a motion: it biases the
    // sensor read far above, so the particle is persuaded rather than pushed.
    //
    // Which way is "down" is one direction shared by all three channels, taken
    // once by \`gravity_direction\` so they can never disagree about it. Computed
    // further up, because the third channel (Trails) biases the sensor read and
    // so needs it before this point -- see the call there.
    vel += 0.01 / sqrt_world_size * -gravity_expand(cfg_gravity_force(config)) * gravity_dir;

    // Move: add vel and strafe to pos.
    pos += vel;
    pos += strafe * cfg_strafe_power(config);
    pos += 0.01 / sqrt_world_size * -gravity_expand(cfg_gravity_strafe(config)) * gravity_dir;

    // The painted WALLS layer, in the strafe channel: a displacement, not a
    // force, so no rule can resist it and drag never damps it. Applied before
    // the fence and the boundary so containment still gets the last word --
    // you can paint a particle against a wall, not through it.
    //
    // Deliberately NOT scaled by 1/sqrt_world_size, unlike every force above
    // it. Those are tuned in world units and must shrink as the world grows;
    // this is painted in uv space and read in uv space, so it already tracks
    // canvas size. Dividing again would make an identical stroke weaker in a
    // bigger world for no reason the user could see.
    //
    // The gain that used to be here is now inside \`get_walls\`, folded into the
    // Walls Field Strength preference -- see that function.
    pos += get_walls(pos, bc);

    // The Shove tool, in the same channel and for the same reasons: a
    // displacement, so drag cannot damp it and no rule can resist a direct push.
    // Also before the fence and the boundary, so containment still gets the last
    // word -- you can shove a particle against a wall, not through it.
    //
    // Already scaled down by the physics rate on the host, so raising the rate
    // does not multiply the shove by the sub-step count. Without that, the
    // Physics Rate slider would silently be a strength slider too -- the trap
    // the Draw brush's once-per-frame cadence exists to avoid.
    //
    // The host divides by \`steps ** 0.75\` rather than \`steps\`, deliberately
    // leaving the brush relatively stronger at low rates. Nothing here depends
    // on which: this reads one number per sub-step either way. See
    // \`shoveCommands.shoveState\` for the tuning argument.
    pos += get_shove(pos);

    // Cohort Fences: hold each particle near its own spawn point, so cohorts
    // stay legible instead of dispersing into each other. A soft wall -- it
    // pushes back in both motion channels rather than hard-clamping, so a
    // particle can still lean on the fence and be shaped by it.
    //
    // ON/OFF ONLY -- the radius is DERIVED, not dialled. It is half of the
    // smaller side of an IC_GRID cell, which is exactly the radius at which
    // neighbouring cohorts' fences just barely touch: cells are 2*extent/cells
    // apart centre to centre, so half of that is the largest circle that does
    // not overlap the next one. The tightness therefore tracks the cohort count
    // on its own -- more cohorts means smaller cells means smaller fences, and
    // they stay touching the whole way. A user-facing radius could only get
    // this wrong (overlapping blobs, or gaps the layout did not intend), which
    // is why the slider became a checkbox.
    //
    // GRID ONLY. The derivation needs a known distance to the next cohort, and
    // only IC_GRID has one: IC_RANDOM scatters cohort centres by hash, IC_CENTER
    // stacks every cohort on the same point (spacing zero), and IC_RING spaces
    // them along a circle rather than in cells. Rather than invent a radius for
    // those, the feature switches off -- and the UI greys the checkbox out in
    // those modes so the reason is visible rather than mysterious.
    let fences = cfg_cohort_fences(config);
    if (fences && cfg_initial_conditions(config) == IC_GRID) {
        let extent = world_half_extent_from_res(canvas_resolution);
        let cells = grid_cells(max(1, cfg_cohorts(config)), extent);
        let cell_size = 2.0 * extent / cells;
        let radius = 0.5 * min(cell_size.x, cell_size.y);
        let to_home = initial_position(index, config) - pos;
        let excess = length(to_home) - radius;
        if (excess > 0.0) {
            let dir = safenorm(to_home);
            // The GLSL guards a HARD_FENCE variant here -- \`reset(); return;\`,
            // "leaving the fence is fatal" -- behind an \`#ifdef\` whose \`#define\`
            // is commented out at entity_update.glsl:551 and is defined by no
            // host path. WGSL has no preprocessor, so only the live \`#else\`
            // branch is translated. The hard version is kept in the GLSL because
            // it is a genuinely different look, not because it is a fallback;
            // see entity_update.glsl:552-556 to restore it.
            vel += 0.001 * excess * dir;   // force: accelerate toward home
            pos += 0.51 * excess * dir;    // strafe: hop most of the way back
        }
    }

    // Boundary conditions, applied last: after every force, both integrations,
    // and the fence. A world property, so it comes from WorldData.
    if (bc == BC_WRAP) {
        pos = world_wrap(pos, canvas_resolution);
    }
    else if (bc == BC_BOUNCE) {
        // world_bounce took \`inout\` p and v in GLSL; common.wgsl returns the
        // pair as a struct. The velocity flips are decided against the PRE-FOLD
        // position inside it -- see the note on its ordering there.
        let bounced = world_bounce(pos, vel, canvas_resolution);
        pos = bounced.pos;
        vel = bounced.vel;
    }
    else if (bc == BC_RESET) {
        if (any(abs(pos) > world_half_extent_from_res(canvas_resolution))) {
            reset(index, config);
            return; // reset writes the entity buffer itself
        }
    }
    // BC_KILL -- BC_RESET's sibling, differing only in what becomes of the
    // particle that crossed. Rather than being respawned at its initial
    // position, it dies: marked dead and its index returned to the pool.
    //
    // THE ONE PLACE THE FREE LIST IS TOUCHED INSIDE advance(). It only ever
    // PUSHES (atomicAdd), which is the same direction the deletion pass moves
    // the head, so the two compose even though they run at different cadences.
    // Nothing here may take a slot -- see the header of freeList.wgsl.
    //
    // The push happens BEFORE the entity is zeroed, so a reader that races this
    // sees either a live particle or a dead one, never a live index sitting on
    // the free list.
    else if (bc == BC_KILL) {
        if (any(abs(pos) > world_half_extent_from_res(canvas_resolution))) {
            free_list_give(index);
            entities[index] = make_entity_dead();
            return; // the entity buffer is written above
        }
    }

    // Commit new entity state to buffers, and lay its trail from there.
    entities[index] = make_entity(pos, vel, e_size(e), config_index, col_params);
    deposit(index, pos, vel, e_size(e), trail_weight);
}
`,Pl=`// ============================================================================
// canvas.wgsl -- the trail canvas's decay and diffuse pass.
//
// The WGSL translation of \`particle_system/shaders/canvas.frag\` (61 lines),
// plus \`shared/shaders/fullscreen_quad.vert\` (9), which is folded in here
// because WebGPU has no free-floating vertex programs to share.
//
// Runs once per sub-step, over every texel, reading the front canvas and
// writing the back one. The host swaps them afterwards.
//
// It also lands the step's TRAIL DEPOSITS: the entity update added them to the
// splat accumulator with atomics (entityUpdate.wgsl \`deposit\`), and each
// fragment here takes its own pixel's sum, adds it after the decay, and zeroes
// it for the next step.
//
// THREE TRANSLATIONS WORTH KNOWING:
//
//  1. \`getCan(vec2 p, sampler2D sam)\` (canvas.frag:18) took a SAMPLER AS A
//     FUNCTION PARAMETER, which WGSL forbids outright. It is inlined into the
//     one place it is used -- there is exactly one texture here, so the
//     parameter was never buying anything.
//
//  2. The quad comes from \`@builtin(vertex_index)\`, not a vertex buffer. The
//     desktop's fullscreen_quad.vert reads \`in vec2 in_position\` from a VBO;
//     generating it in the shader deletes the buffer, the layout and the VAO.
//
//  3. \`pow(5, D)\` (canvas.frag:48) has an INT base literal. WGSL's pow is
//     float-only, so it is written \`pow(5.0, D)\`.
// ============================================================================

// ==== begin include: common.wgsl ====
// ============================================================================
// common.wgsl -- shared struct definitions and coordinate math.
//
// THIS FILE IS THE SINGLE SOURCE OF TRUTH FOR GPU STRUCT LAYOUT. What the
// structs below declare is what the GPU reads.
//
// The layout is stated in ONE OTHER PLACE: \`src/particleSystem/layout.fixture.json\`,
// which is what the host packs against (\`pack.ts\`, guarded by \`assertLaneMap\`).
// Two hand-authored statements of one fact, so \`common.wgsl.test.ts\` checks the
// declarations below against that descriptor on every \`npm test\`. It is the
// shader-side counterpart of \`assertLaneMap\`; together they close the loop.
//
// If that test fails, the two have diverged and the GPU is reinterpreting memory
// the host packed to a different plan -- which does not crash, it just makes the
// simulation subtly wrong. CHANGE BOTH FILES IN THE SAME COMMIT.
//
// (The descriptor was originally generated by the Python desktop app's
// layout.py, which parsed the GLSL original of this file. That app is gone;
// there is no generator now and deliberately no replacement -- see layout.ts.)
//
// RULES FOR EDITING THIS FILE:
//
//  1. vec4-ONLY. Every member of every struct must be a vec4f, a fixed-size
//     array of vec4f, or another struct that obeys this rule. No bare f32,
//     no i32, no vec2f/vec3f. Scalars ride in vec4 lanes; ints ride in float
//     lanes via bitcast.
//
//     Why: std430 (GLSL) and WGSL do NOT agree on how to lay out structs with
//     mixed scalar types. An all-vec4 struct is 16-byte aligned with an
//     unambiguous stride in both, so this codebase translates between them
//     without a layout audit. Both layout.py and common.wgsl.test.ts enforce
//     this and will fail on anything else.
//
//  2. ADD A FIELD BY CLAIMING A RESERVED LANE, not by appending a scalar.
//     When the reserved lanes run out, add a whole new vec4.
//
//  3. NO uniforms and NO buffer/binding declarations in this file -- types and
//     pure functions only. Bindings belong to the shader that owns them.
//     (Binding assignments are recorded in the table below for coordination.)
//
//     This rule is MORE load-bearing on the web than on the desktop. GLSL
//     drivers strip unused uniforms and moderngl's tryset() tolerates the
//     result; WebGPU validates against an explicit bind group layout, so a
//     uniform declared here but unused by an including shader is a hard
//     pipeline-creation error rather than a warning.
//
//  4. NO \`#version\` line here (WGSL has none) and no entry points. This file is
//     included into compute, vertex AND fragment modules, so it must stay
//     stage-agnostic: no texture sampling, no discard, no derivatives
//     (fwidth/dpdx). It currently has none of those -- keep it that way.
//
// SSBO BINDING ASSIGNMENTS (project-wide, keep in sync):
//     binding = 0   EntityBuffer
//     binding = 1   ConfigBuffer
// ============================================================================

const PI: f32 = 3.1415926;

// \`STRAFE_FIELD_GAIN\` USED TO LIVE HERE, at 0.01, as the fixed rate at which the
// painted field displaced a particle. It is now a UNIFORM, because the Walls
// Field Strength preference multiplies it -- so the host owns the number
// (\`FIELD_STRENGTH_GAIN\` in \`prefs/preferences.ts\`) and packs \`strength * 0.01\`
// into the entity update's uniform.
//
// Moved rather than kept alongside the slider: two multipliers, one here and one
// host-side, is exactly the "second multiplier for the user to get lost between"
// that the original comment ruled out. At the default strength of 1.0 the product
// is 0.01 and every painted field behaves precisely as it did before.

// ---------------------------------------------------------------------------
// CANVAS VALUE SCALE -- the canvas is RG16F (see CANVAS_DTYPE in
// particle_system.py), and fp16's usable range starts at ~6.1e-5. At high
// Trail Persistence the splat premultiply (1-P)/P shrinks each deposit to
// ~1e-6, which is SUBNORMAL in fp16: blend units flush it and trails starve
// (measured: 40x dimmer at P=0.999). All stored canvas values therefore ride
// 512x above their physical meaning: the splat multiplies by this, every READER
// divides by it. canvas decay/diffuse is linear and scale-invariant, so it
// neither knows nor cares.
//
// 512 is chosen with both ends in view: it lifts a slow particle's deposit at
// P = 0.999 (~3.6e-6) to ~1.8e-3 -- comfortably normal -- while the largest
// legitimate single splat (fast particle at the P clamp floor) stays around
// 1e4, under fp16's 65504 ceiling. Readers: get_can() in entity_update,
// camera. Writers: the trail deposit (entityUpdate.wgsl \`deposit\`, drained
// into the canvas by canvas.wgsl).
const CANVAS_VALUE_SCALE: f32 = 512.0;

// THE SPLAT ACCUMULATOR'S FIXED POINT. WGSL atomics are integer-only, so each
// deposit rides in an i32 at this many counts per (already scaled) canvas unit.
//
// 2^14 matches fp16 at both ends. One count is 2^-14, fp16's smallest normal,
// so the accumulator resolves exactly the deposits a blended fp16 splat could;
// and +-2^31 counts span +-2^17, twice fp16's 65504 ceiling, so a pile-up
// saturates in the canvas pass's CANVAS_VALUE_MAX clamp before it can wrap.
// The deposit range this has to hold is CANVAS_VALUE_SCALE's, above.
const SPLAT_FIXED_SCALE: f32 = 16384.0;

// Saturation ceiling for stored (scaled) canvas values, applied by the canvas
// pass on every write. NEEDED BECAUSE OF fp16: a texel pushed past 65504 rounds
// to inf, and inf survives decay forever (inf * P == inf) -- one extreme splat
// pile-up would permanently poison the texel and NaN any particle that senses
// it. Saturating below the ceiling lets even an absurd pile-up decay back down.
// fp32 never needed this; do not remove it while the canvas is fp16.
const CANVAS_VALUE_MAX: f32 = 60000.0;

// Trail Persistence's legal range inside the shaders. The FLOOR is well below
// the slider (0.5..0.999) and below every known config (observed min 0.312);
// it exists for typed-in extremes. It was 1e-4, but (1-P)/P at 1e-4 is ~1e4,
// which times CANVAS_VALUE_SCALE would overflow fp16 on a single splat --
// 1e-2 caps the premultiply at ~99 and costs nothing anyone uses.
// The deposit and the canvas pass MUST clamp with the same bounds, or the
// splat premultiply and the decay would disagree about what P means.
const TRAIL_PERSISTENCE_MIN: f32 = 1e-2;
const TRAIL_PERSISTENCE_MAX: f32 = 0.999;

// ---------------------------------------------------------------------------
// MODE ENUMS -- the single definition. ui/settings_spec.py mirrors these BY
// VALUE in its DROPDOWN_MODES tuples, so the order of the options there is the
// order here. Change one, change both.
// ---------------------------------------------------------------------------

// What happens when a particle reaches the edge of the world. A WorldData
// setting: the trail field follows the same rule, so it cannot vary per config.
const BC_BOUNCE: i32 = 0;
const BC_WRAP: i32 = 1;
const BC_RESET: i32 = 2;
// Leaving the world KILLS the particle rather than respawning it: it is marked
// dead and its index pushed onto the free list. The sand modality's default,
// and the worked example of the sinks system -- BC_RESET's sibling, differing
// only in what happens to the particle that crossed.
//
// ADDED AS A FOURTH VALUE rather than by redefining BC_RESET, so the studio's
// three modes keep their exact meanings. A config that has never heard of this
// mode cannot select it, and nothing in the studio writes a 3.
const BC_KILL: i32 = 3;

// How particles are placed on reset. A ConfigData setting: different
// populations can seed differently.
const IC_GRID: i32 = 0;
const IC_RANDOM: i32 = 1;
// No shader compares against IC_CENTER -- it is the fall-through \`else\` branch
// of initial_position() in entity_update. It stays defined because it is a real
// mode, mirrored by value in ui/settings_spec.py's dropdown. Do not drop it as
// dead code.
const IC_CENTER: i32 = 2;
const IC_RING: i32 = 3;

// ---------------------------------------------------------------------------
// Rule -- the Fourier Feature Network coefficients that define particle behavior
// ---------------------------------------------------------------------------

// 4D input -> 4D output basis element.
struct FourierCenter {
    frequency: vec4f,
    amplitude: vec4f,
}

// 10 FourierCenters makes a Rule. 320 bytes, all vec4.
//
// This is the only array in the layout, and it is the case that usually bites:
// std430's array-of-struct stride here is 32 bytes, and WGSL's
// array<FourierCenter,10> stride is also 32 (alignment 16, size 32 -- already a
// multiple). No stride divergence. common.wgsl.test.ts asserts it rather than
// trusting this comment.
struct Rule {
    centers: array<FourierCenter, 10>,
}

// ---------------------------------------------------------------------------
// ConfigData -- everything a particle needs to know about how to behave.
//
// This unifies what used to be two separate systems: the Rule (behavior) and
// the physics parameters. They live together now because they are the same
// kind of thing -- per-particle-population settings -- and separating them is
// what made the reference implementation's parameter handling sprawl.
//
// Lives in ConfigBuffer (binding 1). Each entity selects its ConfigData via
// its own config_index, so different particles can obey different configs.
// ---------------------------------------------------------------------------
struct ConfigData {
    rule: Rule,      // 320 B -- behavior coefficients
    sensor: vec4f,   // x: gain          y: angle       z: distance    w: mutation_scale
    force: vec4f,    // x: global_mult   y: drag        z: strafe      w: axial
    misc: vec4f,     // x: lateral       y: hazard_rate z: cohorts(i)  w: mutation_seed
    // The first four vec4s filled up (misc.w went to mutation_seed), so this is
    // the "add a whole new vec4" case rule 2 describes rather than a reclaimed
    // lane. Two spares here for the next additions.
    force2: vec4f,   // x: gravity_force y: gravity_strafe z: initial_conditions(i) w: cohort_fences(i)
    // force2 filled up the same way misc did, so this is another whole new
    // vec4 rather than a reclaimed lane. This one's zw were the last two spares
    // in the struct, and the sensor jitters claimed them -- rule 2's "claim a
    // reserved lane" case. THERE ARE NO SPARE LANES LEFT: the next addition
    // needs a whole new vec4.
    //
    // NAMED FOR BEING AN OVERFLOW LANE, NOT FOR A THEME -- like \`misc\` and
    // \`force2\` above it. It was called \`appearance\` while it held only the two
    // colour settings; the sensor jitters are physics, so that name had become
    // a lie about half its contents. A lane is a place four floats fit, not a
    // category, and pretending otherwise makes the next addition agonize over
    // whether it belongs. Read the per-lane comment, not the name.
    misc2: vec4f,  // x: color_sensitivity     y: color_by_cohort(i)
                   // z: sensor_angle_jitter   w: sensor_distance_jitter
    // misc2 had no spares left, so Radial Gravity is rule 2's "add a whole new
    // vec4" case again rather than a reclaimed lane. Gravity (Trails) then took
    // .y -- rule 2's "claim a reserved lane" case, as did Color Offset in .z
    // and Trail Weight in .w. No spares left.
    misc3: vec4f,  // x: radial_gravity(i)     y: gravity_trails
                   // z: color_offset          w: trail_weight
    // misc3 had no spares left, so the evolver's SECOND mutation voice is rule
    // 2's "add a whole new vec4" case. RUNTIME ONLY: never saved, always 0 in
    // a loaded state, so every saved state packs and behaves exactly as before.
    // Breathe mode's Orbit overlaps two breaths, and the fading one rides here.
    misc4: vec4f,  // x: mutation_scale_2      y: mutation_seed_2
                   // z: reserved              w: reserved
}  // 432 bytes

fn cfg_sensor_gain(c: ConfigData) -> f32     { return c.sensor.x; }
fn cfg_sensor_angle(c: ConfigData) -> f32    { return c.sensor.y; }
fn cfg_sensor_distance(c: ConfigData) -> f32 { return c.sensor.z; }
fn cfg_mutation_scale(c: ConfigData) -> f32  { return c.sensor.w; }

fn cfg_global_force_mult(c: ConfigData) -> f32 { return c.force.x; }
fn cfg_drag(c: ConfigData) -> f32              { return c.force.y; }
fn cfg_strafe_power(c: ConfigData) -> f32      { return c.force.z; }
fn cfg_axial_force(c: ConfigData) -> f32       { return c.force.w; }

fn cfg_lateral_force(c: ConfigData) -> f32 { return c.misc.x; }
fn cfg_hazard_rate(c: ConfigData) -> f32   { return c.misc.y; }
fn cfg_cohorts(c: ConfigData) -> i32       { return bitcast<i32>(c.misc.z); }
// Which random variation the rule mutation uses. Per-config rather than a
// uniform, so different particle populations can mutate differently.
fn cfg_mutation_seed(c: ConfigData) -> f32 { return c.misc.w; }
// A second, independent mutation layered on the first (evolver Orbit only).
// Scale 0 = absent. The seed is always used in stable mode (see mutate_rule).
fn cfg_mutation_scale_2(c: ConfigData) -> f32 { return c.misc4.x; }
fn cfg_mutation_seed_2(c: ConfigData) -> f32  { return c.misc4.y; }

// Uniform pull on the whole population, in the two motion channels the rest of
// the physics uses: _force feeds velocity, _strafe displaces position directly.
// Both are LINEAR -1..1 controls -- run them through gravity_expand() before
// use, never apply them raw.
fn cfg_gravity_force(c: ConfigData) -> f32  { return c.force2.x; }
fn cfg_gravity_strafe(c: ConfigData) -> f32 { return c.force2.y; }

// How this population is arranged on reset -- one of the IC_* modes above.
fn cfg_initial_conditions(c: ConfigData) -> i32 { return bitcast<i32>(c.force2.z); }
// Whether each particle is held near its own spawn point. ON/OFF ONLY: the
// fence RADIUS is derived from the grid cell size rather than stored, so
// cohorts just barely touch at any cohort count -- see the fence block in
// entity_update, which also explains why it applies to IC_GRID alone.
fn cfg_cohort_fences(c: ConfigData) -> bool { return bitcast<i32>(c.force2.w) != 0; }

// How strongly the brain's colour signal swings the hue. Read by the PARTICLE
// CAMERA, not by the physics -- entity_update only decides what raw signal to
// store, so this can be dragged without disturbing the simulation.
//
// NO SHADER CALLS THIS. The camera does not read the config buffer (rule 3);
// the value reaches cam_brush as a loose uniform instead. This accessor is the
// record of which lane holds it -- keep it.
fn cfg_color_sensitivity(c: ConfigData) -> f32 { return c.misc2.x; }
// Colour each population flat by its cohort instead of by its brain's output.
// A DISPLAY choice, read by the particle camera -- entity_update transmits both
// signals (col_params.x is the brain, .y the cohort) and picks neither, so this
// takes effect immediately, even while the simulation is paused.
//
// Also uncalled by any shader, for the same reason as cfg_color_sensitivity.
fn cfg_color_by_cohort(c: ConfigData) -> bool { return bitcast<i32>(c.misc2.y) != 0; }

// WHERE THIS POPULATION'S HUE SITS BEFORE THE SIGNAL MOVES IT. Sensitivity is
// the coefficient A and this is the bias B in \`hue = A * signal + B\`, so a
// config can be tuned to a corner of the wheel and its signal read as variation
// WITHIN that colour rather than across the whole spectrum.
//
// 0..1 spans the wheel exactly once. Hue is periodic, so the ends meet and no
// wrapping is needed anywhere -- see the fragment stage in cam_brush.
//
// IN A DIFFERENT LANE FROM cfg_color_sensitivity, which it belongs beside by
// meaning. misc2 was full; this is rule 2's "claim a reserved lane" case in
// misc3 rather than a fourth vec4 for one float. The accessors are written
// together here because that is where a reader looks for them -- the lane a
// value lives in is an allocation detail, which is exactly what the misc2
// comment above says.
//
// Uncalled by any shader, like the two above: the camera does not read the
// config buffer (rule 3), so this reaches cam_brush through the swatch table on
// its own uniform. The accessor is the record of which lane holds it.
fn cfg_color_offset(c: ConfigData) -> f32 { return c.misc3.z; }

// Random wobble added to each sensor reading, resampled EVERY PHYSICS STEP --
// a shimmer, not a fixed per-particle trait. Both are 0..1 controls scaled so
// that 1.0 spans the whole range of the parameter they perturb: angle covers
// its own -1..1 slider directly, distance covers SENSOR_DISTANCE_SPAN below.
// Applied in entity_update; 0 is off.
fn cfg_sensor_angle_jitter(c: ConfigData) -> f32    { return c.misc2.z; }
fn cfg_sensor_distance_jitter(c: ConfigData) -> f32 { return c.misc2.w; }

// Which direction the two gravity channels above pull in. False (the default,
// and what every config written before this existed means) is the fixed
// vec2(0,1) screen-down pull; true swings it to the particle's own position
// vector, so positive values fall inwards towards the origin and negative
// values blow outwards. Lives in misc3 rather than beside the gravity values
// because force2 and misc2 were both full -- read the lane comment, not the
// name.
fn cfg_radial_gravity(c: ConfigData) -> bool { return bitcast<i32>(c.misc3.x) != 0; }

// THE THIRD GRAVITY CHANNEL, and the only one that is not a motion.
//
// Force and Strafe above move the particle. This one moves what the particle
// BELIEVES: it is a constant bias added to every canvas sensor reading, in
// exactly the manner the user-drawn trails layer is added (see \`get_can\` in
// entityUpdate.wgsl). Nothing is pushed -- particles are told there is a trail
// downhill, and each rule decides for itself what to do about that. A rule that
// chases trails falls; a rule that avoids them rises. So unlike the other two,
// this channel's SIGN IS NOT ITS DIRECTION, and it does nothing whatsoever to a
// population whose rule ignores the sensors.
//
// LINEAR -1..1 like its siblings, expanded by the same gravity_expand() -- one
// curve for all three, so the feel of the three sliders matches.
fn cfg_gravity_trails(c: ConfigData) -> f32 { return c.misc3.y; }

// TRAIL WEIGHT: how heavily a config's trails count against OTHER configs'.
// Its deposits are multiplied by it and its reads of the swarm's trails divided
// by it (both in entityUpdate.wgsl), so a config alone is unaffected at any
// weight. Negative lays trails that point backwards, to everyone else.
//
// THE FLOOR IS LOAD-BEARING: reads divide by this. A stored value inside
// +-TRAIL_WEIGHT_MIN -- a hand-edited file, a typed 0 -- is pushed out to the
// floor on its own side, zero counting as positive. Mirrored by value in
// \`particleSystem/config.ts\` and pinned by a test.
const TRAIL_WEIGHT_MIN: f32 = 0.02;
fn cfg_trail_weight(c: ConfigData) -> f32 {
    let w = c.misc3.w;
    if (abs(w) >= TRAIL_WEIGHT_MIN) { return w; }
    return select(TRAIL_WEIGHT_MIN, -TRAIL_WEIGHT_MIN, w < 0.0);
}

// The width of the Sensor Distance slider (0..5), which is what a distance
// jitter of 1.0 spans. It lives here rather than being read from the slider
// bounds because the shader has no access to those -- MUST MATCH the \`hi\` of
// the sensor_distance entry in ui/settings_spec.py.
const SENSOR_DISTANCE_SPAN: f32 = 5.0;

// The speed below which a particle is considered STALLED and is given a random
// heading. See the rescue block in entityUpdate.wgsl for why one is needed: a
// particle's heading is its velocity, so at exactly zero it has no direction,
// its sensors collapse onto each other, and nothing can ever restore it.
//
// 5e-5 is \`reset()\`'s own spawn magnitude -- the number this codebase already
// picked for "slow, but moving enough to have a direction". Using the same value
// makes a rescued particle indistinguishable from a freshly reset one.
//
// A FLOOR, NOT AN EPSILON. It is deliberately far above fp32's denormal range:
// the failure is not underflow to exactly zero, it is a velocity too small for
// \`sample_dist\` to place the sensors on different texels, which happens long
// before the bits run out.
const MIN_VELOCITY: f32 = 5e-5;

// ---------------------------------------------------------------------------
// WorldData -- settings that are properties of the world, not of a particle.
//
// Set as a uniform, never per-entity. If a setting would be meaningless to
// vary between two particles sharing a canvas (trail decay, world scale), it
// belongs here rather than in ConfigData.
// ---------------------------------------------------------------------------
struct WorldData {
    trail: vec4f,  // x: persistence  y: diffusion  z: sqrt_world_size  w: config_count(i)
    // trail filled up, so this is rule 2's "add a whole new vec4" case.
    bounds: vec4f, // x: boundary_conditions(i)   yzw: reserved
}

fn world_trail_persistence(w: WorldData) -> f32 { return w.trail.x; }
fn world_trail_diffusion(w: WorldData) -> f32   { return w.trail.y; }
fn world_sqrt_world_size(w: WorldData) -> f32   { return w.trail.z; }
fn world_config_count(w: WorldData) -> i32      { return bitcast<i32>(w.trail.w); }

// What happens at the edge of the world -- one of the BC_* modes above. A
// world property rather than a per-config one: the trail field has to obey the
// same boundary as the particles do, and there is only one trail field.
fn world_boundary_conditions(w: WorldData) -> i32 { return bitcast<i32>(w.bounds.x); }

// ---------------------------------------------------------------------------
// Entity -- one particle. 32 bytes, 16-byte aligned.
//
// Lives in EntityBuffer (binding 0). Mirrored by no one: every shader that
// touches entities includes this file.
// ---------------------------------------------------------------------------
struct Entity {
    pos_vel: vec4f,  // xy: pos    zw: vel
    misc: vec4f,     // x: size    y: config_index(i)    zw: col_params
}

fn e_pos(e: Entity) -> vec2f          { return e.pos_vel.xy; }
fn e_vel(e: Entity) -> vec2f          { return e.pos_vel.zw; }
fn e_size(e: Entity) -> f32           { return e.misc.x; }
fn e_config_index(e: Entity) -> i32   { return bitcast<i32>(e.misc.y); }

// ---------------------------------------------------------------------------
// LIFETIME -- a negative config_index means the particle is DEAD.
//
// NO LAYOUT CHANGE. Entity is full at 32 bytes and every lane is spoken for, so
// a dead FLAG would have meant widening the struct and editing
// layout.fixture.json in lockstep. It is not needed: config_index is already an
// i32 riding a float lane, and no real config index is ever negative -- so the
// sign bit was free the whole time.
//
// EVERY READER MUST TEST THIS BEFORE THE CONFIG LOOKUP. \`entityUpdate\` clamps
// config_index into range (\`clamp(idx, 0, count-1)\`), which would quietly turn
// a dead particle into a config-0 particle rather than skipping it. The clamp is
// correct for its own purpose -- it makes a SHRUNK ConfigBuffer degrade
// gracefully -- so the dead test goes above it rather than replacing it.
//
// The studio produces these only through BC_KILL, and its reset frame brings
// them back (see the dead-particle note in entityUpdate's \`main\`).
// ---------------------------------------------------------------------------
// \`make_entity_dead\` is NOT here: it calls make_entity, which is declared below,
// and WGSL requires declaration before use. It sits under that function instead.
const DEAD_CONFIG: i32 = -1;

fn e_is_dead(e: Entity) -> bool { return e_config_index(e) < 0; }

// RAW OUTPUT FROM THE PARTICLE'S BRAIN, kept for rendering rather than physics.
// entity_update writes these; the particle camera turns them into a hue.
//
// .x is a raw force term from the black box -- deliberately arbitrary, tuned by
// eye, so nothing downstream should read meaning into its scale.
// .y is the particle's COHORT INDEX, which cam_brush reads when Color By
// Cohort is on.
//
// The RENDERER decides what these look like. Storing the raw signals instead of
// a finished hue is what lets Color Sensitivity be dragged without re-running
// the simulation, which is where the reference put it.
fn e_col_params(e: Entity) -> vec2f { return e.misc.zw; }

fn make_entity(pos: vec2f, vel: vec2f, size: f32, config_index: i32,
               col_params: vec2f) -> Entity {
    return Entity(vec4f(pos, vel),
                  vec4f(size, bitcast<f32>(config_index), col_params));
}

// Same, for the paths that have no colour signal to offer -- reset() runs
// before any behaviour is computed. Zero is a valid hue, so this is not a
// sentinel; the entity simply gets its colour on the next real step.
//
// RENAMED from the GLSL, which overloads \`make_entity\` on arity -- WGSL has no
// function overloading. The delegation is kept: this is the 5-arg form with a
// zero colour, not a second implementation.
fn make_entity_reset(pos: vec2f, vel: vec2f, size: f32,
                     config_index: i32) -> Entity {
    return make_entity(pos, vel, size, config_index, vec2f(0.0));
}

// A DEAD particle -- see the lifetime block above \`e_is_dead\`.
//
// Everything is zeroed rather than left stale: a readback of the buffer stays
// legible, and nothing downstream can be fooled by a plausible-looking position
// on a particle that is not there. A size of 0 means that even a consumer which
// somehow skipped the dead test would draw a zero-area sprite.
//
// DECLARED HERE, not beside e_is_dead, because it calls make_entity above and
// WGSL requires declaration before use.
fn make_entity_dead() -> Entity {
    return make_entity(vec2f(0.0), vec2f(0.0), 0.0, DEAD_CONFIG, vec2f(0.0));
}

// ---------------------------------------------------------------------------
// COORDINATE CONVENTION -- the one canonical implementation.
//
// World space is AREA-PRESERVING. With ca = canvas_res.x / canvas_res.y:
//
//     world = [-sqrt(ca), +sqrt(ca)]  x  [-1/sqrt(ca), +1/sqrt(ca)]
//
// so the world always has area 4 regardless of canvas aspect, and a circle in
// world space stays a circle on screen. On a square canvas ca == 1 and this
// reduces exactly to the familiar [-1,1] x [-1,1].
//
// NO OTHER FILE MAY WRITE ASPECT-RATIO MATH. Every world<->uv<->ndc
// conversion goes through the functions below (and their TypeScript mirrors in
// src/particleSystem/coords.ts). The reference implementation had six divergent
// copies of this math, at least one of which contradicted the others; that is
// the specific failure this rule exists to prevent.
//
// THE WORLD IS A TORUS ONLY IN BC_WRAP. The boundary mode decides the world's
// topology, so anything that crosses an edge must ask: world_wrap for wrap,
// world_bounce for bounce, and world_to_uv_bc for every texture read.
//
// SEVERAL FUNCTIONS BELOW HAVE NO EXTERNAL CALLER. world_half_extent,
// world_to_uv, uv_to_world, edge_fold, letterbox_scale and screen_ndc_to_world
// are each an internal composition step of one that does. They are load-bearing,
// not dead. WGSL does not warn about unused module-scope functions.
// ---------------------------------------------------------------------------

// Half-extent of world space on each axis, from canvas aspect ca = res.x/res.y.
fn world_half_extent(ca: f32) -> vec2f {
    let s = sqrt(ca);
    return vec2f(s, 1.0 / s);
}

fn world_half_extent_from_res(canvas_res: vec2f) -> vec2f {
    return world_half_extent(canvas_res.x / canvas_res.y);
}

// Scale a uv-space delta into the aspect-corrected metric -- literally
// world_half_extent applied as a scale, which is why it lives here rather than
// being its own piece of aspect math. World space is area-preserving, so a raw
// uv delta is anisotropic on a non-square canvas; brushes measured in this
// metric stay circular, and a ring drawn in it matches the brush that paints
// in it. Used by strafe_draw (painting) and frame_assembly (the reticle that
// must agree with it).
fn aspect_correct_uv(d: vec2f, canvas_res: vec2f) -> vec2f {
    return d * world_half_extent_from_res(canvas_res);
}

// World -> texture uv [0,1]. In BC_WRAP the canvas textures are sampled with a
// repeating sampler and the sampler does the wrapping, so uv is deliberately
// left unclamped. Every other boundary mode must go through world_to_uv_bc.
fn world_to_uv(p: vec2f, canvas_res: vec2f) -> vec2f {
    return p / (2.0 * world_half_extent_from_res(canvas_res)) + 0.5;
}

// World -> texture uv, honoring the boundary mode. Only BC_WRAP leaves uv free
// for the sampler's repeat to handle; the others clamp, so a sensor reaching
// past the edge reads the edge rather than the far side of the world.
fn world_to_uv_bc(p: vec2f, canvas_res: vec2f, bc: i32) -> vec2f {
    let uv = world_to_uv(p, canvas_res);
    // select(false_value, true_value, condition) -- the argument order is the
    // reverse of GLSL's \`cond ? a : b\`.
    return select(clamp(uv, vec2f(0.0), vec2f(1.0)), uv, bc == BC_WRAP);
}

fn uv_to_world(uv: vec2f, canvas_res: vec2f) -> vec2f {
    return (uv - 0.5) * 2.0 * world_half_extent_from_res(canvas_res);
}

// The corner of an instanced quad, in TRIANGLE-STRIP order, as a 0..1 uv:
// (0,0) (1,0) (0,1) (1,1) for vertex_id 0..3. The matching offset from the quad
// centre is \`(strip_corner(v) * 2.0 - 1.0) * half_size\`, which pairs uv and
// corner by construction -- they are the same value.
//
// ARITHMETIC, NOT A LOOKUP TABLE, and that is the reason this exists. The
// per-particle sprite shaders (camBrush.wgsl; the brush pass before it became
// a point splat) used \`var offsets = array<vec2f, 4>(...)\` indexed by vertex_id.
// A local array indexed by a non-constant is spilled to per-thread scratch
// memory by the browser's shader compilers (the same trap that made
// entityUpdate's by-value Rule so slow), and a sprite shader runs four times
// per particle. Do not turn this back into a table.
//
// Strip, not fan: WebGPU has no triangle-fan, and a strip over the desktop's
// fan order (brush.vert:25-36) draws a bowtie.
fn strip_corner(vertex_id: u32) -> vec2f {
    return vec2f(f32(vertex_id & 1u), f32(vertex_id >> 1u));
}

// World -> normalized device coords [-1,1] for rasterizing into the canvas.
fn world_to_ndc(p: vec2f, canvas_res: vec2f) -> vec2f {
    return p / world_half_extent_from_res(canvas_res);
}

// Wrap a world position into the world bounds. BC_WRAP only -- the world is a
// torus in that mode alone.
//
// DO NOT REWRITE fract() AS \`%\`. \`p\` here is freely signed (a world position
// past either edge), so \`p / size - 0.5\` is routinely negative, and WGSL's \`%\`
// is truncated where this needs floored behaviour. WGSL defines fract(x) as
// \`x - floor(x)\`, identical to GLSL, so it translates verbatim and correctly --
// the \`%\` "cleanup" would break wrap for every particle leaving the left or
// bottom edge.
fn world_wrap(p: vec2f, canvas_res: vec2f) -> vec2f {
    let extent = world_half_extent_from_res(canvas_res);
    let size = 2.0 * extent;
    return size * (fract(p / size - 0.5) - 0.5);
}

// Reflect a coordinate given in edge units back into [-1,1]. A triangle wave,
// so it is correct for ARBITRARY overshoot. The reference's single-fold version
// (sign(x)*(1-abs(1-abs(x)))) silently teleported a particle to the far side
// once it passed 2x the edge in one step, which heavy gravity reaches.
//
// GLSL's mod() is floored and WGSL's \`%\` is truncated, so they are NOT
// interchangeable in general. They agree here because the dividend is abs(x),
// non-negative BY CONSTRUCTION rather than by caller convention, and the
// divisor is a positive literal. That is what makes \`%\` safe -- if the abs()
// ever goes away, this needs a floored mod again.
fn edge_fold(x: f32) -> f32 {
    let t = abs(x) % 2.0;
    return sign(x) * (1.0 - abs(1.0 - t));
}

// What world_bounce returns. GLSL passed p and v as \`inout\`; WGSL has no
// inout, so the pair comes back as a struct. (A ptr<function, vec2f> parameter
// would also work, but a return struct reads better at the one call site.)
struct BounceResult {
    pos: vec2f,
    vel: vec2f,
}

// Reflect a position off the world bounds, flipping the velocity components
// that crossed. Position and velocity move together: reflecting the position
// without reversing the velocity would just re-trigger the bounce every frame,
// pinning the particle to the wall.
//
// THE ORDER BELOW IS LOAD-BEARING: the velocity flips are decided against the
// PRE-FOLD position, and only then is the position folded. Computing the folded
// position first and testing that would silently change the exact-boundary case.
fn world_bounce(p: vec2f, v: vec2f, canvas_res: vec2f) -> BounceResult {
    let extent = world_half_extent_from_res(canvas_res);
    var vel = v;
    if (abs(p.x) > extent.x) { vel.x = -vel.x; }
    if (abs(p.y) > extent.y) { vel.y = -vel.y; }
    let pos = vec2f(edge_fold(p.x / extent.x), edge_fold(p.y / extent.y)) * extent;
    return BounceResult(pos, vel);
}

// ---------------------------------------------------------------------------
// THE VIEW TRANSFORM -- world to screen, through camera and letterbox.
//
//     world  --/half_extent-->  canvas ndc
//            --(-pan, *zoom)->  view ndc
//            --*letterbox---->  screen ndc [-1,1]
//
// THREE INDEPENDENT ASPECT QUANTITIES, never conflate them:
//   canvas_res  simulation texture size; defines world space
//   window_res  framebuffer size in pixels; changes on resize
//   letterbox   derived fit of one into the other; never stored
//
// ZOOM: bigger = zoomed IN (a magnification factor). zoom=1 fits the world.
// PAN:  world units. pan is the world point at the center of the view.
// ---------------------------------------------------------------------------

// Scale fitting the canvas box into the window, preserving shape. The axis
// that would overflow shrinks; the other stays 1.0, and the slack is the
// letterbox bar. Fit, not fill: the whole canvas is always visible.
fn letterbox_scale(canvas_res: vec2f, window_res: vec2f) -> vec2f {
    if (window_res.x <= 0.0 || window_res.y <= 0.0) { return vec2f(1.0); }
    let canvas_aspect = canvas_res.x / canvas_res.y;
    let window_aspect = window_res.x / window_res.y;
    return select(
        vec2f(1.0, window_aspect / canvas_aspect),  // bars top/bottom
        vec2f(canvas_aspect / window_aspect, 1.0),  // bars left/right
        window_aspect > canvas_aspect);
}

fn world_to_screen_ndc(p: vec2f, canvas_res: vec2f, window_res: vec2f,
                       pan: vec2f, zoom: f32) -> vec2f {
    let ndc = world_to_ndc(p - pan, canvas_res) * zoom;
    return ndc * letterbox_scale(canvas_res, window_res);
}

fn screen_ndc_to_world(ndc: vec2f, canvas_res: vec2f, window_res: vec2f,
                       pan: vec2f, zoom: f32) -> vec2f {
    var v = ndc / letterbox_scale(canvas_res, window_res);
    if (zoom != 0.0) { v /= zoom; }
    return uv_to_world(v * 0.5 + 0.5, canvas_res) + pan;
}

// Screen ndc -> canvas uv, for the present pass sampling the canvas texture.
// Values outside [0,1] fall in the letterbox bars; the caller decides whether
// to clamp, wrap (tiling) or paint them black.
fn screen_ndc_to_canvas_uv(ndc: vec2f, canvas_res: vec2f, window_res: vec2f,
                           pan: vec2f, zoom: f32) -> vec2f {
    return world_to_uv(
        screen_ndc_to_world(ndc, canvas_res, window_res, pan, zoom),
        canvas_res);
}

// ==== end include: common.wgsl ====

struct CanvasUniforms {
    world : WorldData,
    // x: frame_count(i)   yzw: reserved
    flags : vec4f,
}

@group(0) @binding(0) var<uniform> u : CanvasUniforms;
@group(1) @binding(0) var canvas_texture : texture_2d<f32>;
@group(1) @binding(1) var canvas_sampler : sampler;

fn frame_count() -> i32 { return bitcast<i32>(u.flags.x); }

// The splat accumulator -- see the binding in entityUpdate.wgsl. Plain i32 on
// this side: each fragment owns its own pair, so nothing else touches it while
// this pass runs.
@group(0) @binding(1) var<storage, read_write> splat : array<i32>;

// This pixel's deposits, in canvas units, zeroing them for the next step. The
// target is the canvas's own size, so the fragment's pixel is the
// accumulator's -- indexed row-major from the top, as \`deposit\` writes it.
fn take_splat(pixel: vec2u) -> vec4f {
    let i = (pixel.y * textureDimensions(canvas_texture, 0).x + pixel.x) * 2u;
    let value = vec2f(f32(splat[i]), f32(splat[i + 1u])) / SPLAT_FIXED_SCALE;
    splat[i] = 0;
    splat[i + 1u] = 0;
    return vec4f(value, 0.0, 0.0);
}

struct VsOut {
    @builtin(position) clip : vec4f,
    @location(0) uv : vec2f,
}

// The fullscreen triangle-strip quad, from the vertex index alone.
//
// Four vertices in STRIP order: (-1,-1) (1,-1) (-1,1) (1,1). The desktop draws
// two triangles from a 6-vertex VBO; the shape covered is identical.
//
// ---------------------------------------------------------------------------
// THE V FLIP, AND WHY IT IS NOT IN THE GLSL
// ---------------------------------------------------------------------------
// fullscreen_quad.vert:7 is \`uv = in_position * 0.5 + 0.5\`, with no flip. That
// is correct THERE because OpenGL's framebuffer origin is BOTTOM-left: row 0 of
// the render target sits at NDC y = -1, which is also where uv.y = 0 samples.
// The two agree, so a fragment always reads the texel it is about to write.
//
// WebGPU's framebuffer origin is TOP-left. Row 0 sits at NDC y = +1 while
// uv.y = 0 still samples row 0, so the unflipped formula makes every fragment
// read the texel MIRRORED about the horizontal axis instead of its own.
//
// That is not a cosmetic upside-down image -- this pass is a feedback loop, and
// reading the wrong row means the decay and the 5-tap diffusion operate on the
// mirror of the trail field. Measured cost: the canvas held ~3x less energy by
// sub-step 3, and the simulation settled into visibly different dynamics (many
// small curls instead of large sweeping arcs). It looks like a physics
// difference, not like a flipped picture, which is what makes it dangerous.
@vertex
fn vs_main(@builtin(vertex_index) vi : u32) -> VsOut {
    var corners = array<vec2f, 4>(
        vec2f(-1.0, -1.0),
        vec2f( 1.0, -1.0),
        vec2f(-1.0,  1.0),
        vec2f( 1.0,  1.0),
    );
    let p = corners[vi];

    var out : VsOut;
    out.clip = vec4f(p, 0.0, 1.0);
    out.uv = vec2f(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);
    return out;
}

// The diffusion stencil reaches one texel past the edge, so it has to obey the
// same boundary the particles do: wrap across the seam only in BC_WRAP,
// otherwise clamp so trails stop at the wall instead of bleeding through it.
//
// This is the INLINED getCan (canvas.frag:18-22) -- the sampler parameter is
// gone, per the header. Note the sampler's OWN address mode is set to match by
// the host (\`_apply_boundary_sampling\`); these are two layers of one decision
// and must not disagree (invariant 9).
fn get_can(p: vec2f) -> vec4f {
    var uv = clamp(p, vec2f(0.0), vec2f(1.0));
    if (world_boundary_conditions(u.world) == BC_WRAP) {
        uv = fract(p);
    }
    return textureSampleLevel(canvas_texture, canvas_sampler, uv, 0.0);
}

// Weighted 5-tap cross: centre weight K, four neighbours weight 1.
fn get_blur(pos: vec2f, diffusion_constant: f32) -> vec4f {
    let imsz = textureDimensions(canvas_texture, 0);
    let off = vec3f(1.0 / vec2f(imsz), 0.0);
    let np = pos + off.zy;
    let sp = pos - off.zy;
    let wp = pos - off.xz;
    let ep = pos + off.xz;
    let nc = get_can(np);
    let sc = get_can(sp);
    let wc = get_can(wp);
    let ec = get_can(ep);
    let K = diffusion_constant;
    return (get_can(pos) * K + nc + sc + wc + ec) / (4.0 + K);
}

@fragment
fn fs_main(in: VsOut) -> @location(0) vec4f {
    // FRAME 0 IS THE TRAIL CLEAR. This is not bookkeeping -- \`reset()\` on the
    // host does nothing but set frame_count to 0, and this line is what
    // actually erases the canvas (see particle_system.py:259-275).
    // Drained BEFORE the frame-0 early out, so a reset still leaves the
    // accumulator empty.
    let splat_add = take_splat(vec2u(in.clip.xy));

    if (frame_count() == 0) { return vec4f(0.0, 0.0, 0.0, 0.0); }

    var canvas_color : vec4f;
    var TRAIL_DIFFUSION = clamp(world_trail_diffusion(u.world), 0.001, 1.0);
    // Same bounds as the deposit's premultiply, from common.wgsl -- the splat
    // and the decay must agree about what P means.
    let TRAIL_PERSISTENCE = clamp(world_trail_persistence(u.world),
                                  TRAIL_PERSISTENCE_MIN, TRAIL_PERSISTENCE_MAX);
    if (TRAIL_DIFFUSION > 0.0) {
        TRAIL_DIFFUSION = TRAIL_DIFFUSION * TRAIL_DIFFUSION;      // better scaling for slider
        TRAIL_DIFFUSION = 4.0 / (pow(5.0, TRAIL_DIFFUSION) - 1.0); // better scaling for slider
        canvas_color = get_blur(in.uv, TRAIL_DIFFUSION);
    }
    else {
        // Unreachable as written -- the clamp above has a floor of 0.001, so
        // the branch above always wins. Kept because the GLSL keeps it.
        canvas_color = textureSampleLevel(canvas_texture, canvas_sampler, in.uv, 0.0);
    }
    // Decay by persistence, THEN add this step's deposits: the order the
    // desktop's separate brush pass gave them, which the presets were tuned
    // against (see particleSystem.ts).
    //
    // The clamp is fp16 insurance, not a look decision: past 65504 a texel
    // rounds to inf, and inf survives decay forever (see CANVAS_VALUE_MAX in
    // common.wgsl). It also catches a deposit pile-up in the same step.
    return clamp(canvas_color * TRAIL_PERSISTENCE + splat_add,
                 vec4f(-CANVAS_VALUE_MAX), vec4f(CANVAS_VALUE_MAX));
}
`,kl=`// ============================================================================
// entityPick.wgsl -- find the entity nearest a target, and derive its rule.
//
// The WGSL translation of \`particle_system/shaders/entity_pick.glsl\` (87 lines),
// plus the rule derivation that file does not have. Structure and comments
// follow it so the two stay diff-comparable.
//
// ---------------------------------------------------------------------------
// THE ATOMIC TRICK (unchanged from the GLSL)
// ---------------------------------------------------------------------------
// There is no atomicMin for floats, so distance is packed into the high bits of
// a u32 and the entity index into the low bits:
//
//     key = (quantized_distance << INDEX_BITS) | entity_index
//
// A single atomicMin over that key minimizes distance first and breaks ties by
// lowest index -- deterministic, which matters because otherwise the same click
// could select different particles on different frames.
//
// WHERE THE 32 BITS GO: 24 to the index, 8 to the distance. The index is the
// part that must not overflow -- an entity past INDEX_MASK cannot be encoded,
// so it silently stops being pickable, which reads as "the last cohorts don't
// respond to clicks" rather than as a bug. 24 bits covers 16.7M entities, well
// past any world size the UI offers. pick.test.ts asserts that bound.
//
// The distance gets what is left because its precision barely matters: 256
// buckets across the radius only decides which of two near-equidistant
// particles wins, and a tie is broken by lowest index -- still deterministic,
// which is the property that actually matters.
//
// ---------------------------------------------------------------------------
// WHY TWO ENTRY POINTS, AND WHY TWO SEPARATE PASSES
// ---------------------------------------------------------------------------
// \`reduce\` finds the winner. \`derive\` writes its rule and position.
//
// They cannot be one pass. A thread that LOSES the atomicMin still executes its
// next instruction, so if the reducing threads also wrote the rule, a loser
// could overwrite the winner's -- which is exactly why the desktop keeps the
// index authoritative and puts nothing else in the result buffer
// (entity_pick.glsl:43-47). Deriving from a single invocation, after the atomic
// has settled, is what makes writing the rule safe at all.
//
// They also cannot be two dispatches in ONE compute pass: WebGPU orders passes
// within a submission and inserts the barriers between them, but dispatches
// inside a single pass have no ordering guarantee, so \`derive\` would race the
// reduction it depends on. Two beginComputePass calls. See particleSystem.ts.
//
// ---------------------------------------------------------------------------
// WHERE THE RULE COMES FROM
// ---------------------------------------------------------------------------
// The config buffer. Each slot holds the rule its particles obey, already
// mutated for its cohort by cohortRules.wgsl (see configSlots.ts), and
// entityUpdate.wgsl reads the same slot. So the rule adopted here is the rule
// the particle was running BY CONSTRUCTION, not because two derivations agree.
//
// The desktop instead recomputes it HOST-SIDE in float32
// (particle_system/mutation.py) to avoid a readback. That file is deliberately
// not ported -- JS has no float32 arithmetic, and mutation.py:149's pow(h, 2.0)
// trap has no reliable JS equivalent. A wrong adopted rule looks like a
// legitimate result.
// ============================================================================

// ==== begin include: common.wgsl ====
// ============================================================================
// common.wgsl -- shared struct definitions and coordinate math.
//
// THIS FILE IS THE SINGLE SOURCE OF TRUTH FOR GPU STRUCT LAYOUT. What the
// structs below declare is what the GPU reads.
//
// The layout is stated in ONE OTHER PLACE: \`src/particleSystem/layout.fixture.json\`,
// which is what the host packs against (\`pack.ts\`, guarded by \`assertLaneMap\`).
// Two hand-authored statements of one fact, so \`common.wgsl.test.ts\` checks the
// declarations below against that descriptor on every \`npm test\`. It is the
// shader-side counterpart of \`assertLaneMap\`; together they close the loop.
//
// If that test fails, the two have diverged and the GPU is reinterpreting memory
// the host packed to a different plan -- which does not crash, it just makes the
// simulation subtly wrong. CHANGE BOTH FILES IN THE SAME COMMIT.
//
// (The descriptor was originally generated by the Python desktop app's
// layout.py, which parsed the GLSL original of this file. That app is gone;
// there is no generator now and deliberately no replacement -- see layout.ts.)
//
// RULES FOR EDITING THIS FILE:
//
//  1. vec4-ONLY. Every member of every struct must be a vec4f, a fixed-size
//     array of vec4f, or another struct that obeys this rule. No bare f32,
//     no i32, no vec2f/vec3f. Scalars ride in vec4 lanes; ints ride in float
//     lanes via bitcast.
//
//     Why: std430 (GLSL) and WGSL do NOT agree on how to lay out structs with
//     mixed scalar types. An all-vec4 struct is 16-byte aligned with an
//     unambiguous stride in both, so this codebase translates between them
//     without a layout audit. Both layout.py and common.wgsl.test.ts enforce
//     this and will fail on anything else.
//
//  2. ADD A FIELD BY CLAIMING A RESERVED LANE, not by appending a scalar.
//     When the reserved lanes run out, add a whole new vec4.
//
//  3. NO uniforms and NO buffer/binding declarations in this file -- types and
//     pure functions only. Bindings belong to the shader that owns them.
//     (Binding assignments are recorded in the table below for coordination.)
//
//     This rule is MORE load-bearing on the web than on the desktop. GLSL
//     drivers strip unused uniforms and moderngl's tryset() tolerates the
//     result; WebGPU validates against an explicit bind group layout, so a
//     uniform declared here but unused by an including shader is a hard
//     pipeline-creation error rather than a warning.
//
//  4. NO \`#version\` line here (WGSL has none) and no entry points. This file is
//     included into compute, vertex AND fragment modules, so it must stay
//     stage-agnostic: no texture sampling, no discard, no derivatives
//     (fwidth/dpdx). It currently has none of those -- keep it that way.
//
// SSBO BINDING ASSIGNMENTS (project-wide, keep in sync):
//     binding = 0   EntityBuffer
//     binding = 1   ConfigBuffer
// ============================================================================

const PI: f32 = 3.1415926;

// \`STRAFE_FIELD_GAIN\` USED TO LIVE HERE, at 0.01, as the fixed rate at which the
// painted field displaced a particle. It is now a UNIFORM, because the Walls
// Field Strength preference multiplies it -- so the host owns the number
// (\`FIELD_STRENGTH_GAIN\` in \`prefs/preferences.ts\`) and packs \`strength * 0.01\`
// into the entity update's uniform.
//
// Moved rather than kept alongside the slider: two multipliers, one here and one
// host-side, is exactly the "second multiplier for the user to get lost between"
// that the original comment ruled out. At the default strength of 1.0 the product
// is 0.01 and every painted field behaves precisely as it did before.

// ---------------------------------------------------------------------------
// CANVAS VALUE SCALE -- the canvas is RG16F (see CANVAS_DTYPE in
// particle_system.py), and fp16's usable range starts at ~6.1e-5. At high
// Trail Persistence the splat premultiply (1-P)/P shrinks each deposit to
// ~1e-6, which is SUBNORMAL in fp16: blend units flush it and trails starve
// (measured: 40x dimmer at P=0.999). All stored canvas values therefore ride
// 512x above their physical meaning: the splat multiplies by this, every READER
// divides by it. canvas decay/diffuse is linear and scale-invariant, so it
// neither knows nor cares.
//
// 512 is chosen with both ends in view: it lifts a slow particle's deposit at
// P = 0.999 (~3.6e-6) to ~1.8e-3 -- comfortably normal -- while the largest
// legitimate single splat (fast particle at the P clamp floor) stays around
// 1e4, under fp16's 65504 ceiling. Readers: get_can() in entity_update,
// camera. Writers: the trail deposit (entityUpdate.wgsl \`deposit\`, drained
// into the canvas by canvas.wgsl).
const CANVAS_VALUE_SCALE: f32 = 512.0;

// THE SPLAT ACCUMULATOR'S FIXED POINT. WGSL atomics are integer-only, so each
// deposit rides in an i32 at this many counts per (already scaled) canvas unit.
//
// 2^14 matches fp16 at both ends. One count is 2^-14, fp16's smallest normal,
// so the accumulator resolves exactly the deposits a blended fp16 splat could;
// and +-2^31 counts span +-2^17, twice fp16's 65504 ceiling, so a pile-up
// saturates in the canvas pass's CANVAS_VALUE_MAX clamp before it can wrap.
// The deposit range this has to hold is CANVAS_VALUE_SCALE's, above.
const SPLAT_FIXED_SCALE: f32 = 16384.0;

// Saturation ceiling for stored (scaled) canvas values, applied by the canvas
// pass on every write. NEEDED BECAUSE OF fp16: a texel pushed past 65504 rounds
// to inf, and inf survives decay forever (inf * P == inf) -- one extreme splat
// pile-up would permanently poison the texel and NaN any particle that senses
// it. Saturating below the ceiling lets even an absurd pile-up decay back down.
// fp32 never needed this; do not remove it while the canvas is fp16.
const CANVAS_VALUE_MAX: f32 = 60000.0;

// Trail Persistence's legal range inside the shaders. The FLOOR is well below
// the slider (0.5..0.999) and below every known config (observed min 0.312);
// it exists for typed-in extremes. It was 1e-4, but (1-P)/P at 1e-4 is ~1e4,
// which times CANVAS_VALUE_SCALE would overflow fp16 on a single splat --
// 1e-2 caps the premultiply at ~99 and costs nothing anyone uses.
// The deposit and the canvas pass MUST clamp with the same bounds, or the
// splat premultiply and the decay would disagree about what P means.
const TRAIL_PERSISTENCE_MIN: f32 = 1e-2;
const TRAIL_PERSISTENCE_MAX: f32 = 0.999;

// ---------------------------------------------------------------------------
// MODE ENUMS -- the single definition. ui/settings_spec.py mirrors these BY
// VALUE in its DROPDOWN_MODES tuples, so the order of the options there is the
// order here. Change one, change both.
// ---------------------------------------------------------------------------

// What happens when a particle reaches the edge of the world. A WorldData
// setting: the trail field follows the same rule, so it cannot vary per config.
const BC_BOUNCE: i32 = 0;
const BC_WRAP: i32 = 1;
const BC_RESET: i32 = 2;
// Leaving the world KILLS the particle rather than respawning it: it is marked
// dead and its index pushed onto the free list. The sand modality's default,
// and the worked example of the sinks system -- BC_RESET's sibling, differing
// only in what happens to the particle that crossed.
//
// ADDED AS A FOURTH VALUE rather than by redefining BC_RESET, so the studio's
// three modes keep their exact meanings. A config that has never heard of this
// mode cannot select it, and nothing in the studio writes a 3.
const BC_KILL: i32 = 3;

// How particles are placed on reset. A ConfigData setting: different
// populations can seed differently.
const IC_GRID: i32 = 0;
const IC_RANDOM: i32 = 1;
// No shader compares against IC_CENTER -- it is the fall-through \`else\` branch
// of initial_position() in entity_update. It stays defined because it is a real
// mode, mirrored by value in ui/settings_spec.py's dropdown. Do not drop it as
// dead code.
const IC_CENTER: i32 = 2;
const IC_RING: i32 = 3;

// ---------------------------------------------------------------------------
// Rule -- the Fourier Feature Network coefficients that define particle behavior
// ---------------------------------------------------------------------------

// 4D input -> 4D output basis element.
struct FourierCenter {
    frequency: vec4f,
    amplitude: vec4f,
}

// 10 FourierCenters makes a Rule. 320 bytes, all vec4.
//
// This is the only array in the layout, and it is the case that usually bites:
// std430's array-of-struct stride here is 32 bytes, and WGSL's
// array<FourierCenter,10> stride is also 32 (alignment 16, size 32 -- already a
// multiple). No stride divergence. common.wgsl.test.ts asserts it rather than
// trusting this comment.
struct Rule {
    centers: array<FourierCenter, 10>,
}

// ---------------------------------------------------------------------------
// ConfigData -- everything a particle needs to know about how to behave.
//
// This unifies what used to be two separate systems: the Rule (behavior) and
// the physics parameters. They live together now because they are the same
// kind of thing -- per-particle-population settings -- and separating them is
// what made the reference implementation's parameter handling sprawl.
//
// Lives in ConfigBuffer (binding 1). Each entity selects its ConfigData via
// its own config_index, so different particles can obey different configs.
// ---------------------------------------------------------------------------
struct ConfigData {
    rule: Rule,      // 320 B -- behavior coefficients
    sensor: vec4f,   // x: gain          y: angle       z: distance    w: mutation_scale
    force: vec4f,    // x: global_mult   y: drag        z: strafe      w: axial
    misc: vec4f,     // x: lateral       y: hazard_rate z: cohorts(i)  w: mutation_seed
    // The first four vec4s filled up (misc.w went to mutation_seed), so this is
    // the "add a whole new vec4" case rule 2 describes rather than a reclaimed
    // lane. Two spares here for the next additions.
    force2: vec4f,   // x: gravity_force y: gravity_strafe z: initial_conditions(i) w: cohort_fences(i)
    // force2 filled up the same way misc did, so this is another whole new
    // vec4 rather than a reclaimed lane. This one's zw were the last two spares
    // in the struct, and the sensor jitters claimed them -- rule 2's "claim a
    // reserved lane" case. THERE ARE NO SPARE LANES LEFT: the next addition
    // needs a whole new vec4.
    //
    // NAMED FOR BEING AN OVERFLOW LANE, NOT FOR A THEME -- like \`misc\` and
    // \`force2\` above it. It was called \`appearance\` while it held only the two
    // colour settings; the sensor jitters are physics, so that name had become
    // a lie about half its contents. A lane is a place four floats fit, not a
    // category, and pretending otherwise makes the next addition agonize over
    // whether it belongs. Read the per-lane comment, not the name.
    misc2: vec4f,  // x: color_sensitivity     y: color_by_cohort(i)
                   // z: sensor_angle_jitter   w: sensor_distance_jitter
    // misc2 had no spares left, so Radial Gravity is rule 2's "add a whole new
    // vec4" case again rather than a reclaimed lane. Gravity (Trails) then took
    // .y -- rule 2's "claim a reserved lane" case, as did Color Offset in .z
    // and Trail Weight in .w. No spares left.
    misc3: vec4f,  // x: radial_gravity(i)     y: gravity_trails
                   // z: color_offset          w: trail_weight
    // misc3 had no spares left, so the evolver's SECOND mutation voice is rule
    // 2's "add a whole new vec4" case. RUNTIME ONLY: never saved, always 0 in
    // a loaded state, so every saved state packs and behaves exactly as before.
    // Breathe mode's Orbit overlaps two breaths, and the fading one rides here.
    misc4: vec4f,  // x: mutation_scale_2      y: mutation_seed_2
                   // z: reserved              w: reserved
}  // 432 bytes

fn cfg_sensor_gain(c: ConfigData) -> f32     { return c.sensor.x; }
fn cfg_sensor_angle(c: ConfigData) -> f32    { return c.sensor.y; }
fn cfg_sensor_distance(c: ConfigData) -> f32 { return c.sensor.z; }
fn cfg_mutation_scale(c: ConfigData) -> f32  { return c.sensor.w; }

fn cfg_global_force_mult(c: ConfigData) -> f32 { return c.force.x; }
fn cfg_drag(c: ConfigData) -> f32              { return c.force.y; }
fn cfg_strafe_power(c: ConfigData) -> f32      { return c.force.z; }
fn cfg_axial_force(c: ConfigData) -> f32       { return c.force.w; }

fn cfg_lateral_force(c: ConfigData) -> f32 { return c.misc.x; }
fn cfg_hazard_rate(c: ConfigData) -> f32   { return c.misc.y; }
fn cfg_cohorts(c: ConfigData) -> i32       { return bitcast<i32>(c.misc.z); }
// Which random variation the rule mutation uses. Per-config rather than a
// uniform, so different particle populations can mutate differently.
fn cfg_mutation_seed(c: ConfigData) -> f32 { return c.misc.w; }
// A second, independent mutation layered on the first (evolver Orbit only).
// Scale 0 = absent. The seed is always used in stable mode (see mutate_rule).
fn cfg_mutation_scale_2(c: ConfigData) -> f32 { return c.misc4.x; }
fn cfg_mutation_seed_2(c: ConfigData) -> f32  { return c.misc4.y; }

// Uniform pull on the whole population, in the two motion channels the rest of
// the physics uses: _force feeds velocity, _strafe displaces position directly.
// Both are LINEAR -1..1 controls -- run them through gravity_expand() before
// use, never apply them raw.
fn cfg_gravity_force(c: ConfigData) -> f32  { return c.force2.x; }
fn cfg_gravity_strafe(c: ConfigData) -> f32 { return c.force2.y; }

// How this population is arranged on reset -- one of the IC_* modes above.
fn cfg_initial_conditions(c: ConfigData) -> i32 { return bitcast<i32>(c.force2.z); }
// Whether each particle is held near its own spawn point. ON/OFF ONLY: the
// fence RADIUS is derived from the grid cell size rather than stored, so
// cohorts just barely touch at any cohort count -- see the fence block in
// entity_update, which also explains why it applies to IC_GRID alone.
fn cfg_cohort_fences(c: ConfigData) -> bool { return bitcast<i32>(c.force2.w) != 0; }

// How strongly the brain's colour signal swings the hue. Read by the PARTICLE
// CAMERA, not by the physics -- entity_update only decides what raw signal to
// store, so this can be dragged without disturbing the simulation.
//
// NO SHADER CALLS THIS. The camera does not read the config buffer (rule 3);
// the value reaches cam_brush as a loose uniform instead. This accessor is the
// record of which lane holds it -- keep it.
fn cfg_color_sensitivity(c: ConfigData) -> f32 { return c.misc2.x; }
// Colour each population flat by its cohort instead of by its brain's output.
// A DISPLAY choice, read by the particle camera -- entity_update transmits both
// signals (col_params.x is the brain, .y the cohort) and picks neither, so this
// takes effect immediately, even while the simulation is paused.
//
// Also uncalled by any shader, for the same reason as cfg_color_sensitivity.
fn cfg_color_by_cohort(c: ConfigData) -> bool { return bitcast<i32>(c.misc2.y) != 0; }

// WHERE THIS POPULATION'S HUE SITS BEFORE THE SIGNAL MOVES IT. Sensitivity is
// the coefficient A and this is the bias B in \`hue = A * signal + B\`, so a
// config can be tuned to a corner of the wheel and its signal read as variation
// WITHIN that colour rather than across the whole spectrum.
//
// 0..1 spans the wheel exactly once. Hue is periodic, so the ends meet and no
// wrapping is needed anywhere -- see the fragment stage in cam_brush.
//
// IN A DIFFERENT LANE FROM cfg_color_sensitivity, which it belongs beside by
// meaning. misc2 was full; this is rule 2's "claim a reserved lane" case in
// misc3 rather than a fourth vec4 for one float. The accessors are written
// together here because that is where a reader looks for them -- the lane a
// value lives in is an allocation detail, which is exactly what the misc2
// comment above says.
//
// Uncalled by any shader, like the two above: the camera does not read the
// config buffer (rule 3), so this reaches cam_brush through the swatch table on
// its own uniform. The accessor is the record of which lane holds it.
fn cfg_color_offset(c: ConfigData) -> f32 { return c.misc3.z; }

// Random wobble added to each sensor reading, resampled EVERY PHYSICS STEP --
// a shimmer, not a fixed per-particle trait. Both are 0..1 controls scaled so
// that 1.0 spans the whole range of the parameter they perturb: angle covers
// its own -1..1 slider directly, distance covers SENSOR_DISTANCE_SPAN below.
// Applied in entity_update; 0 is off.
fn cfg_sensor_angle_jitter(c: ConfigData) -> f32    { return c.misc2.z; }
fn cfg_sensor_distance_jitter(c: ConfigData) -> f32 { return c.misc2.w; }

// Which direction the two gravity channels above pull in. False (the default,
// and what every config written before this existed means) is the fixed
// vec2(0,1) screen-down pull; true swings it to the particle's own position
// vector, so positive values fall inwards towards the origin and negative
// values blow outwards. Lives in misc3 rather than beside the gravity values
// because force2 and misc2 were both full -- read the lane comment, not the
// name.
fn cfg_radial_gravity(c: ConfigData) -> bool { return bitcast<i32>(c.misc3.x) != 0; }

// THE THIRD GRAVITY CHANNEL, and the only one that is not a motion.
//
// Force and Strafe above move the particle. This one moves what the particle
// BELIEVES: it is a constant bias added to every canvas sensor reading, in
// exactly the manner the user-drawn trails layer is added (see \`get_can\` in
// entityUpdate.wgsl). Nothing is pushed -- particles are told there is a trail
// downhill, and each rule decides for itself what to do about that. A rule that
// chases trails falls; a rule that avoids them rises. So unlike the other two,
// this channel's SIGN IS NOT ITS DIRECTION, and it does nothing whatsoever to a
// population whose rule ignores the sensors.
//
// LINEAR -1..1 like its siblings, expanded by the same gravity_expand() -- one
// curve for all three, so the feel of the three sliders matches.
fn cfg_gravity_trails(c: ConfigData) -> f32 { return c.misc3.y; }

// TRAIL WEIGHT: how heavily a config's trails count against OTHER configs'.
// Its deposits are multiplied by it and its reads of the swarm's trails divided
// by it (both in entityUpdate.wgsl), so a config alone is unaffected at any
// weight. Negative lays trails that point backwards, to everyone else.
//
// THE FLOOR IS LOAD-BEARING: reads divide by this. A stored value inside
// +-TRAIL_WEIGHT_MIN -- a hand-edited file, a typed 0 -- is pushed out to the
// floor on its own side, zero counting as positive. Mirrored by value in
// \`particleSystem/config.ts\` and pinned by a test.
const TRAIL_WEIGHT_MIN: f32 = 0.02;
fn cfg_trail_weight(c: ConfigData) -> f32 {
    let w = c.misc3.w;
    if (abs(w) >= TRAIL_WEIGHT_MIN) { return w; }
    return select(TRAIL_WEIGHT_MIN, -TRAIL_WEIGHT_MIN, w < 0.0);
}

// The width of the Sensor Distance slider (0..5), which is what a distance
// jitter of 1.0 spans. It lives here rather than being read from the slider
// bounds because the shader has no access to those -- MUST MATCH the \`hi\` of
// the sensor_distance entry in ui/settings_spec.py.
const SENSOR_DISTANCE_SPAN: f32 = 5.0;

// The speed below which a particle is considered STALLED and is given a random
// heading. See the rescue block in entityUpdate.wgsl for why one is needed: a
// particle's heading is its velocity, so at exactly zero it has no direction,
// its sensors collapse onto each other, and nothing can ever restore it.
//
// 5e-5 is \`reset()\`'s own spawn magnitude -- the number this codebase already
// picked for "slow, but moving enough to have a direction". Using the same value
// makes a rescued particle indistinguishable from a freshly reset one.
//
// A FLOOR, NOT AN EPSILON. It is deliberately far above fp32's denormal range:
// the failure is not underflow to exactly zero, it is a velocity too small for
// \`sample_dist\` to place the sensors on different texels, which happens long
// before the bits run out.
const MIN_VELOCITY: f32 = 5e-5;

// ---------------------------------------------------------------------------
// WorldData -- settings that are properties of the world, not of a particle.
//
// Set as a uniform, never per-entity. If a setting would be meaningless to
// vary between two particles sharing a canvas (trail decay, world scale), it
// belongs here rather than in ConfigData.
// ---------------------------------------------------------------------------
struct WorldData {
    trail: vec4f,  // x: persistence  y: diffusion  z: sqrt_world_size  w: config_count(i)
    // trail filled up, so this is rule 2's "add a whole new vec4" case.
    bounds: vec4f, // x: boundary_conditions(i)   yzw: reserved
}

fn world_trail_persistence(w: WorldData) -> f32 { return w.trail.x; }
fn world_trail_diffusion(w: WorldData) -> f32   { return w.trail.y; }
fn world_sqrt_world_size(w: WorldData) -> f32   { return w.trail.z; }
fn world_config_count(w: WorldData) -> i32      { return bitcast<i32>(w.trail.w); }

// What happens at the edge of the world -- one of the BC_* modes above. A
// world property rather than a per-config one: the trail field has to obey the
// same boundary as the particles do, and there is only one trail field.
fn world_boundary_conditions(w: WorldData) -> i32 { return bitcast<i32>(w.bounds.x); }

// ---------------------------------------------------------------------------
// Entity -- one particle. 32 bytes, 16-byte aligned.
//
// Lives in EntityBuffer (binding 0). Mirrored by no one: every shader that
// touches entities includes this file.
// ---------------------------------------------------------------------------
struct Entity {
    pos_vel: vec4f,  // xy: pos    zw: vel
    misc: vec4f,     // x: size    y: config_index(i)    zw: col_params
}

fn e_pos(e: Entity) -> vec2f          { return e.pos_vel.xy; }
fn e_vel(e: Entity) -> vec2f          { return e.pos_vel.zw; }
fn e_size(e: Entity) -> f32           { return e.misc.x; }
fn e_config_index(e: Entity) -> i32   { return bitcast<i32>(e.misc.y); }

// ---------------------------------------------------------------------------
// LIFETIME -- a negative config_index means the particle is DEAD.
//
// NO LAYOUT CHANGE. Entity is full at 32 bytes and every lane is spoken for, so
// a dead FLAG would have meant widening the struct and editing
// layout.fixture.json in lockstep. It is not needed: config_index is already an
// i32 riding a float lane, and no real config index is ever negative -- so the
// sign bit was free the whole time.
//
// EVERY READER MUST TEST THIS BEFORE THE CONFIG LOOKUP. \`entityUpdate\` clamps
// config_index into range (\`clamp(idx, 0, count-1)\`), which would quietly turn
// a dead particle into a config-0 particle rather than skipping it. The clamp is
// correct for its own purpose -- it makes a SHRUNK ConfigBuffer degrade
// gracefully -- so the dead test goes above it rather than replacing it.
//
// The studio produces these only through BC_KILL, and its reset frame brings
// them back (see the dead-particle note in entityUpdate's \`main\`).
// ---------------------------------------------------------------------------
// \`make_entity_dead\` is NOT here: it calls make_entity, which is declared below,
// and WGSL requires declaration before use. It sits under that function instead.
const DEAD_CONFIG: i32 = -1;

fn e_is_dead(e: Entity) -> bool { return e_config_index(e) < 0; }

// RAW OUTPUT FROM THE PARTICLE'S BRAIN, kept for rendering rather than physics.
// entity_update writes these; the particle camera turns them into a hue.
//
// .x is a raw force term from the black box -- deliberately arbitrary, tuned by
// eye, so nothing downstream should read meaning into its scale.
// .y is the particle's COHORT INDEX, which cam_brush reads when Color By
// Cohort is on.
//
// The RENDERER decides what these look like. Storing the raw signals instead of
// a finished hue is what lets Color Sensitivity be dragged without re-running
// the simulation, which is where the reference put it.
fn e_col_params(e: Entity) -> vec2f { return e.misc.zw; }

fn make_entity(pos: vec2f, vel: vec2f, size: f32, config_index: i32,
               col_params: vec2f) -> Entity {
    return Entity(vec4f(pos, vel),
                  vec4f(size, bitcast<f32>(config_index), col_params));
}

// Same, for the paths that have no colour signal to offer -- reset() runs
// before any behaviour is computed. Zero is a valid hue, so this is not a
// sentinel; the entity simply gets its colour on the next real step.
//
// RENAMED from the GLSL, which overloads \`make_entity\` on arity -- WGSL has no
// function overloading. The delegation is kept: this is the 5-arg form with a
// zero colour, not a second implementation.
fn make_entity_reset(pos: vec2f, vel: vec2f, size: f32,
                     config_index: i32) -> Entity {
    return make_entity(pos, vel, size, config_index, vec2f(0.0));
}

// A DEAD particle -- see the lifetime block above \`e_is_dead\`.
//
// Everything is zeroed rather than left stale: a readback of the buffer stays
// legible, and nothing downstream can be fooled by a plausible-looking position
// on a particle that is not there. A size of 0 means that even a consumer which
// somehow skipped the dead test would draw a zero-area sprite.
//
// DECLARED HERE, not beside e_is_dead, because it calls make_entity above and
// WGSL requires declaration before use.
fn make_entity_dead() -> Entity {
    return make_entity(vec2f(0.0), vec2f(0.0), 0.0, DEAD_CONFIG, vec2f(0.0));
}

// ---------------------------------------------------------------------------
// COORDINATE CONVENTION -- the one canonical implementation.
//
// World space is AREA-PRESERVING. With ca = canvas_res.x / canvas_res.y:
//
//     world = [-sqrt(ca), +sqrt(ca)]  x  [-1/sqrt(ca), +1/sqrt(ca)]
//
// so the world always has area 4 regardless of canvas aspect, and a circle in
// world space stays a circle on screen. On a square canvas ca == 1 and this
// reduces exactly to the familiar [-1,1] x [-1,1].
//
// NO OTHER FILE MAY WRITE ASPECT-RATIO MATH. Every world<->uv<->ndc
// conversion goes through the functions below (and their TypeScript mirrors in
// src/particleSystem/coords.ts). The reference implementation had six divergent
// copies of this math, at least one of which contradicted the others; that is
// the specific failure this rule exists to prevent.
//
// THE WORLD IS A TORUS ONLY IN BC_WRAP. The boundary mode decides the world's
// topology, so anything that crosses an edge must ask: world_wrap for wrap,
// world_bounce for bounce, and world_to_uv_bc for every texture read.
//
// SEVERAL FUNCTIONS BELOW HAVE NO EXTERNAL CALLER. world_half_extent,
// world_to_uv, uv_to_world, edge_fold, letterbox_scale and screen_ndc_to_world
// are each an internal composition step of one that does. They are load-bearing,
// not dead. WGSL does not warn about unused module-scope functions.
// ---------------------------------------------------------------------------

// Half-extent of world space on each axis, from canvas aspect ca = res.x/res.y.
fn world_half_extent(ca: f32) -> vec2f {
    let s = sqrt(ca);
    return vec2f(s, 1.0 / s);
}

fn world_half_extent_from_res(canvas_res: vec2f) -> vec2f {
    return world_half_extent(canvas_res.x / canvas_res.y);
}

// Scale a uv-space delta into the aspect-corrected metric -- literally
// world_half_extent applied as a scale, which is why it lives here rather than
// being its own piece of aspect math. World space is area-preserving, so a raw
// uv delta is anisotropic on a non-square canvas; brushes measured in this
// metric stay circular, and a ring drawn in it matches the brush that paints
// in it. Used by strafe_draw (painting) and frame_assembly (the reticle that
// must agree with it).
fn aspect_correct_uv(d: vec2f, canvas_res: vec2f) -> vec2f {
    return d * world_half_extent_from_res(canvas_res);
}

// World -> texture uv [0,1]. In BC_WRAP the canvas textures are sampled with a
// repeating sampler and the sampler does the wrapping, so uv is deliberately
// left unclamped. Every other boundary mode must go through world_to_uv_bc.
fn world_to_uv(p: vec2f, canvas_res: vec2f) -> vec2f {
    return p / (2.0 * world_half_extent_from_res(canvas_res)) + 0.5;
}

// World -> texture uv, honoring the boundary mode. Only BC_WRAP leaves uv free
// for the sampler's repeat to handle; the others clamp, so a sensor reaching
// past the edge reads the edge rather than the far side of the world.
fn world_to_uv_bc(p: vec2f, canvas_res: vec2f, bc: i32) -> vec2f {
    let uv = world_to_uv(p, canvas_res);
    // select(false_value, true_value, condition) -- the argument order is the
    // reverse of GLSL's \`cond ? a : b\`.
    return select(clamp(uv, vec2f(0.0), vec2f(1.0)), uv, bc == BC_WRAP);
}

fn uv_to_world(uv: vec2f, canvas_res: vec2f) -> vec2f {
    return (uv - 0.5) * 2.0 * world_half_extent_from_res(canvas_res);
}

// The corner of an instanced quad, in TRIANGLE-STRIP order, as a 0..1 uv:
// (0,0) (1,0) (0,1) (1,1) for vertex_id 0..3. The matching offset from the quad
// centre is \`(strip_corner(v) * 2.0 - 1.0) * half_size\`, which pairs uv and
// corner by construction -- they are the same value.
//
// ARITHMETIC, NOT A LOOKUP TABLE, and that is the reason this exists. The
// per-particle sprite shaders (camBrush.wgsl; the brush pass before it became
// a point splat) used \`var offsets = array<vec2f, 4>(...)\` indexed by vertex_id.
// A local array indexed by a non-constant is spilled to per-thread scratch
// memory by the browser's shader compilers (the same trap that made
// entityUpdate's by-value Rule so slow), and a sprite shader runs four times
// per particle. Do not turn this back into a table.
//
// Strip, not fan: WebGPU has no triangle-fan, and a strip over the desktop's
// fan order (brush.vert:25-36) draws a bowtie.
fn strip_corner(vertex_id: u32) -> vec2f {
    return vec2f(f32(vertex_id & 1u), f32(vertex_id >> 1u));
}

// World -> normalized device coords [-1,1] for rasterizing into the canvas.
fn world_to_ndc(p: vec2f, canvas_res: vec2f) -> vec2f {
    return p / world_half_extent_from_res(canvas_res);
}

// Wrap a world position into the world bounds. BC_WRAP only -- the world is a
// torus in that mode alone.
//
// DO NOT REWRITE fract() AS \`%\`. \`p\` here is freely signed (a world position
// past either edge), so \`p / size - 0.5\` is routinely negative, and WGSL's \`%\`
// is truncated where this needs floored behaviour. WGSL defines fract(x) as
// \`x - floor(x)\`, identical to GLSL, so it translates verbatim and correctly --
// the \`%\` "cleanup" would break wrap for every particle leaving the left or
// bottom edge.
fn world_wrap(p: vec2f, canvas_res: vec2f) -> vec2f {
    let extent = world_half_extent_from_res(canvas_res);
    let size = 2.0 * extent;
    return size * (fract(p / size - 0.5) - 0.5);
}

// Reflect a coordinate given in edge units back into [-1,1]. A triangle wave,
// so it is correct for ARBITRARY overshoot. The reference's single-fold version
// (sign(x)*(1-abs(1-abs(x)))) silently teleported a particle to the far side
// once it passed 2x the edge in one step, which heavy gravity reaches.
//
// GLSL's mod() is floored and WGSL's \`%\` is truncated, so they are NOT
// interchangeable in general. They agree here because the dividend is abs(x),
// non-negative BY CONSTRUCTION rather than by caller convention, and the
// divisor is a positive literal. That is what makes \`%\` safe -- if the abs()
// ever goes away, this needs a floored mod again.
fn edge_fold(x: f32) -> f32 {
    let t = abs(x) % 2.0;
    return sign(x) * (1.0 - abs(1.0 - t));
}

// What world_bounce returns. GLSL passed p and v as \`inout\`; WGSL has no
// inout, so the pair comes back as a struct. (A ptr<function, vec2f> parameter
// would also work, but a return struct reads better at the one call site.)
struct BounceResult {
    pos: vec2f,
    vel: vec2f,
}

// Reflect a position off the world bounds, flipping the velocity components
// that crossed. Position and velocity move together: reflecting the position
// without reversing the velocity would just re-trigger the bounce every frame,
// pinning the particle to the wall.
//
// THE ORDER BELOW IS LOAD-BEARING: the velocity flips are decided against the
// PRE-FOLD position, and only then is the position folded. Computing the folded
// position first and testing that would silently change the exact-boundary case.
fn world_bounce(p: vec2f, v: vec2f, canvas_res: vec2f) -> BounceResult {
    let extent = world_half_extent_from_res(canvas_res);
    var vel = v;
    if (abs(p.x) > extent.x) { vel.x = -vel.x; }
    if (abs(p.y) > extent.y) { vel.y = -vel.y; }
    let pos = vec2f(edge_fold(p.x / extent.x), edge_fold(p.y / extent.y)) * extent;
    return BounceResult(pos, vel);
}

// ---------------------------------------------------------------------------
// THE VIEW TRANSFORM -- world to screen, through camera and letterbox.
//
//     world  --/half_extent-->  canvas ndc
//            --(-pan, *zoom)->  view ndc
//            --*letterbox---->  screen ndc [-1,1]
//
// THREE INDEPENDENT ASPECT QUANTITIES, never conflate them:
//   canvas_res  simulation texture size; defines world space
//   window_res  framebuffer size in pixels; changes on resize
//   letterbox   derived fit of one into the other; never stored
//
// ZOOM: bigger = zoomed IN (a magnification factor). zoom=1 fits the world.
// PAN:  world units. pan is the world point at the center of the view.
// ---------------------------------------------------------------------------

// Scale fitting the canvas box into the window, preserving shape. The axis
// that would overflow shrinks; the other stays 1.0, and the slack is the
// letterbox bar. Fit, not fill: the whole canvas is always visible.
fn letterbox_scale(canvas_res: vec2f, window_res: vec2f) -> vec2f {
    if (window_res.x <= 0.0 || window_res.y <= 0.0) { return vec2f(1.0); }
    let canvas_aspect = canvas_res.x / canvas_res.y;
    let window_aspect = window_res.x / window_res.y;
    return select(
        vec2f(1.0, window_aspect / canvas_aspect),  // bars top/bottom
        vec2f(canvas_aspect / window_aspect, 1.0),  // bars left/right
        window_aspect > canvas_aspect);
}

fn world_to_screen_ndc(p: vec2f, canvas_res: vec2f, window_res: vec2f,
                       pan: vec2f, zoom: f32) -> vec2f {
    let ndc = world_to_ndc(p - pan, canvas_res) * zoom;
    return ndc * letterbox_scale(canvas_res, window_res);
}

fn screen_ndc_to_world(ndc: vec2f, canvas_res: vec2f, window_res: vec2f,
                       pan: vec2f, zoom: f32) -> vec2f {
    var v = ndc / letterbox_scale(canvas_res, window_res);
    if (zoom != 0.0) { v /= zoom; }
    return uv_to_world(v * 0.5 + 0.5, canvas_res) + pan;
}

// Screen ndc -> canvas uv, for the present pass sampling the canvas texture.
// Values outside [0,1] fall in the letterbox bars; the caller decides whether
// to clamp, wrap (tiling) or paint them black.
fn screen_ndc_to_canvas_uv(ndc: vec2f, canvas_res: vec2f, window_res: vec2f,
                           pan: vec2f, zoom: f32) -> vec2f {
    return world_to_uv(
        screen_ndc_to_world(ndc, canvas_res, window_res, pan, zoom),
        canvas_res);
}

// ==== end include: common.wgsl ====
// ==== begin include: rule.wgsl ====
// ============================================================================
// rule.wgsl -- how an entity's Rule is derived, and THE ONLY COPY of that.
//
// WHY THIS FILE EXISTS. Every shader that answers "what rule does cohort N of
// this config obey?" must answer it identically:
//
//   cohortRules.wgsl   derives it once per config slot, per upload, and bakes
//                      it into the config buffer. entityUpdate.wgsl and
//                      entityPick.wgsl read that baked rule; neither derives.
//   deriveRule.wgsl    derives it offline, to rebuild an adopted rule for the
//                      archive.
//
// On the desktop that question has THREE implementations: entity_update.glsl,
// entity_pick's caller, and particle_system/mutation.py -- a float32 host mirror
// that recomputes the rule so selection needs no GPU readback. The web port
// deletes the mirror (docs/WEB_PORT_PLAN.md Step 6) and derives on the GPU
// instead, precisely because a wrong adopted rule LOOKS LIKE A LEGITIMATE
// RESULT. Both callers share this file, so they cannot drift.
// ARCHITECTURE.md:715-718 records what happened the one time the desktop's
// copies did: selection adopted near-zero coefficients and the simulation
// appeared to die.
//
// WHY NOT common.wgsl. That file is included by camBrush.wgsl in a VERTEX
// stage, and its own rules 3 and 4 (common.wgsl:38-52) require it to
// hold pure, stage-agnostic code only. generate_random_centers is an 80-call
// hash loop that no vertex stage wants, and get_cohort below could not live
// there at all -- see its comment. This file is a SIBLING of the two shaders
// that include it; wgslInclude.ts resolves sibling-first (:125-141), so both
// find it with no build config.
//
// The include guard is per compilation unit (wgslInclude.ts:92-99), so the
// diamond entityUpdate -> {common, rule -> common} emits common.wgsl once.
// ============================================================================


//=========================================================================================
//------------------------------------RANDOM / HASH / NOISE--------------------------------
//====================================VVVVVVVVVVVVVVVVVVVVV================================

// pcg_hash, hash and hash4 MOVED TO \`shaders/hash.wgsl\`, and are included here
// rather than declared. They left because the sand modality's spawn brush needs
// the same generator and is not a sibling of this file -- including this one to
// reach \`hash\` would have dragged \`generate_random_centers\`, an 80-call hash
// loop, into a shader that wants three random numbers.
//
// Nothing about them changed in the move: the arithmetic is identical, so every
// rule derived before it is derived identically after. See that file's header.
// ==== begin include: hash.wgsl ====
// ============================================================================
// hash.wgsl -- the PCG hash family. THE ONLY COPY.
//
// WHY THIS FILE EXISTS. Three shaders now need the same random generator, and
// they sit in two different directories:
//
//   particleSystem/shaders/rule.wgsl  rule derivation (and through it,
//                                     entityUpdate and entityPick)
//   sand/shaders/spawn.wgsl           where a painted particle lands
//
// \`rule.wgsl\` held these and is a SIBLING of its two callers, which is what let
// them find it with no build config. The sand brushes are not siblings of it,
// and pulling the whole file in would drag \`generate_random_centers\` -- an
// 80-call hash loop -- into a shader that wants three random numbers. So the
// hash family moved here, to the shared directory every shader can reach, and
// \`rule.wgsl\` includes it like everyone else.
//
// WHY NOT common.wgsl. That file is included by vertex stages and its own rules
// 3 and 4 hold it to struct layout and coordinate math. A hash is neither, and
// keeping it out means a vertex shader that needs only the Entity layout does
// not also compile a hash it never calls.
//
// BIT-EXACTNESS IS THE POINT. The u32 multiplies wrap in WGSL exactly as they do
// in GLSL, so this is a verbatim translation of the desktop's. \`hash\` is chaotic
// by design: a 1-ULP difference in an input produces a COMPLETELY DIFFERENT
// output, which is why rule derivation had to move to the GPU rather than keep a
// JavaScript mirror. Do not "simplify" the arithmetic here.
//
// The include guard is per compilation unit, so the diamond
// entityUpdate -> {common, rule -> hash} emits each file once.
// ============================================================================

// PCG hash - bit-exact across all platforms.
fn pcg_hash(seed: u32) -> u32 {
    let state = seed * 747796405u + 2891336453u;
    let word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
    return (word >> 22u) ^ word;
}

// Two floats in, one pseudo-random float in [0,1) out.
//
// The inputs are BITCAST, not converted: the hash consumes the float's bit
// pattern, so two inputs that differ in the last mantissa bit are unrelated
// outputs. That is what makes \`hash(vec2f(f32(index), f32(frame)))\` a usable
// per-particle-per-frame draw.
fn hash(co: vec2f) -> f32 {
    let u_bits = vec2u(bitcast<u32>(co.x), bitcast<u32>(co.y));
    let h = pcg_hash(u_bits.x ^ pcg_hash(u_bits.y));
    return f32(h) / f32(0xffffffffu);
}

// Four decorrelated draws from one seed.
//
// Three implicit promotions in four lines on the GLSL side; the int literals
// became float literals here. Operand order is kept exactly, because the
// bitcast above makes \`co * -1.0 + 5.0\` and \`5.0 - co\` different seeds.
fn hash4(co: vec2f) -> vec4f {
    return vec4f(
        hash(co),
        hash(co * -1.0 + 5.0),
        hash(co.yx - 100.0),
        hash(co.yx * -1.0 + 25.0)
    );
}

// ==== end include: hash.wgsl ====

// Given a seed, return 10 random FourierCenters: enough for a Rule.
//
// DO NOT REWRITE \`pow(h, 2.0)\` AS \`h*h\`. \`freq_scale\` and \`frequency.x\` draw
// from the SAME hash lane (\`i*8+0\`), so frequency.x is \`(h*2-1) * (1+2*pow(h,2))\`.
// pow(h,2) and h*h differ by 1 ULP, and the chaotic hash amplifies that into a
// completely different rule -- measured on the desktop as seed 0.3088 vs 0.2605
// (see the comment at mutation.py:149, and entity_update.glsl:446-451).
//
// THIS IS NOW MORE LOAD-BEARING THAN IT WAS IN STEP 4, not less: the rule this
// produces is read back and adopted into the config when a user clicks a
// particle, so "simplifying" this line changes what selection gives you.
fn generate_random_centers(seed: f32) -> array<FourierCenter, 10> {
    var centers : array<FourierCenter, 10>;

    for (var i = 0; i < 10; i++) {
        // Generate frequency vectors
        // Bias towards lower frequencies for smoother base behaviors
        // Range: [-2, 2] with bias towards [-1, 1]
        let freq_scale = 1.0 + 2.0 * pow(hash(vec2f(seed, f32(i * 8 + 0))), 2.0);
        centers[i].frequency.x = (hash(vec2f(seed, f32(i * 8 + 0))) * 2.0 - 1.0) * freq_scale;
        centers[i].frequency.y = (hash(vec2f(seed, f32(i * 8 + 1))) * 2.0 - 1.0) * freq_scale;
        centers[i].frequency.z = (hash(vec2f(seed, f32(i * 8 + 2))) * 2.0 - 1.0) * freq_scale;
        centers[i].frequency.w = (hash(vec2f(seed, f32(i * 8 + 3))) * 2.0 - 1.0) * freq_scale;

        // Generate amplitude vectors
        // Range: [-1, 1]
        centers[i].amplitude.x = hash(vec2f(seed, f32(i * 8 + 4))) * 2.0 - 1.0;
        centers[i].amplitude.y = hash(vec2f(seed, f32(i * 8 + 5))) * 2.0 - 1.0;
        centers[i].amplitude.z = hash(vec2f(seed, f32(i * 8 + 6))) * 2.0 - 1.0;
        centers[i].amplitude.w = hash(vec2f(seed, f32(i * 8 + 7))) * 2.0 - 1.0;
    }

    return centers;
}

//=====================================^^^^^^^^^^^^^^^^^^==================================
//------------------------------------RANDOM / HASH / NOISE--------------------------------
//=========================================================================================

// Simply assigns each to a cohort based on its index.
// floor(get_cohort(index)) should be used for cohort equality tests.
//
// THE ENTITY COUNT IS A PARAMETER, and that is not a style choice. This file is
// included by two shaders that bind the entity array with DIFFERENT access
// qualifiers -- entityUpdate.wgsl as \`storage, read_write\`, entityPick.wgsl as
// \`storage, read\` -- so a function here may not name the binding at all.
// \`arrayLength(&entities)\` is therefore evaluated at the CALL SITE and handed
// in. (Reverting it to name the binding compiles in entityUpdate and fails only
// in entityPick, i.e. in a browser and not in \`npm test\`, so shaders.test.ts
// asserts it.)
//
// BOTH CALL SITES PASS arrayLength(&entities), never the host's entityCount
// uniform. The buffer is sized exactly entityCount * 32
// (particleSystem.ts:200-206) so the two are identical today -- but if that ever
// stopped being true, the physics and the picker must still divide by the SAME
// number or the rule the picker derives is not the rule the entity obeys.
fn get_cohort(index: u32, config: ConfigData, entity_count: u32) -> f32 {
    return f32(cfg_cohorts(config)) * f32(index) / f32(entity_count);
}

// Randomly change noise function parameters, scaled by parameter 'amount'.
// Each cohort gets a unique mutation for any given rule.
//
// GLSL took \`inout Rule\`; WGSL has no inout, so the mutated rule comes back as
// a return value and the call site assigns it.
//
// STABLE MODE (\`stable\`): the seed skips the hash of the rule and is the
// cohort seed alone. The usual seed hashes the rule's own coefficients, which
// is chaotic -- so a rule that is MOVING (the evolver blending between
// favorites) would draw a fresh twist every frame: flicker, not motion. With
// the hash left out, each cohort's twist is a fixed direction that holds while
// the rule moves. Only the evolver asks for it (see \`derive_entity_rule\`); for
// every saved state the branch below is not taken and the seed is computed
// exactly as before.
fn mutate_rule(current_rule: Rule, amount: f32, cohort: f32, stable: bool) -> Rule {
    var rule = current_rule;
    var rule_hash = 0.0;
    if (!stable) {
        rule_hash = hash(rule.centers[4].frequency.xy
                         + rule.centers[7].amplitude.yx
                         + rule.centers[1].frequency.zw);
    }
    let seed = rule_hash + cohort;

    for (var i = 0; i < 10; i++) {
        // Operand order kept as the GLSL writes it (\`-.5 + vec2(...)\`), since
        // reassociating a float add is not required to be value-preserving.
        let amp_mutation = amount * (-1.0 + 2.0 * hash4(-0.5 + vec2f(-f32(i) + seed, f32(i))));
        rule.centers[i].amplitude += amp_mutation;
        // FOUR DRAWS, one per component, like the amplitude above. The desktop
        // drew one scalar and scaled the whole vec4 by it, which only ever
        // stretched a frequency and never turned it. Factor range is
        // 1 +/- amount/2, double the old 1 +/- amount/4. \`.x\` is the old draw.
        let freq_mutation = amount * (hash4(vec2f(seed, f32(i))) - 0.5);
        rule.centers[i].frequency *= 1.0 + freq_mutation;
    }
    return rule;
}

// The rule an entity actually obeys: the generate-or-mutate branch, in one
// place. entity_update.glsl:439-460 on the desktop, mirrored there a THIRD time
// in mutation.py:208-236 -- which is exactly what Step 6 deletes.
//
// A GENERATED RULE IS NEVER MUTATED. It is already random, and the seed that
// produced it rerolls it wholesale, so Mutation Scale has nothing to add -- and
// letting it apply would mean that slider silently reshaping a rule the user
// never authored. \`entity_update\` therefore branches: generate *or* mutate,
// never both.
//
// On the desktop that also had a numerical reason: mutate_rule derives its own
// seed by HASHING the rule's coefficients, hash() is chaotic, and the GPU fuses
// a multiply-add in the generator that numpy cannot -- so mutating on top of a
// generated rule amplified a 1-ULP difference into a completely different rule,
// and the host mirror could not reproduce what the particle obeyed. THE WEB
// PORT HAS NO HOST MIRROR, so that argument does not apply here. The design
// reason above does, and it is sufficient on its own.
//
// GLSL's \`==\` on a vector is whole-vector equality returning a scalar bool;
// WGSL's is componentwise and returns vec4<bool>, hence all().
//
// A NEGATIVE MUTATION SEED MEANS STABLE MODE (see \`mutate_rule\`). Seeds are
// drawn from [0,1], so no saved state has one; the evolver writes -|seed| to
// ask for steady per-cohort twists while it blends the rule. The magnitude is
// what seeds both branches, so a non-negative seed behaves exactly as before.
fn derive_entity_rule(rule_in: Rule, cohort: f32, config: ConfigData) -> Rule {
    let raw_seed = cfg_mutation_seed(config);
    let stable = raw_seed < 0.0;
    let rule_seed = abs(raw_seed) + floor(cohort);

    // If a few arbitrary coefficients are exactly 0, then assume the rule is
    // all 0s (no target) and generate a random rule instead. Zeroing is how the
    // host asks for a new behaviour without reproducing this generator --
    // Randomize Behavior (\`B\`) does exactly that. See ARCHITECTURE.md
    // "Particle selection and history".
    if (all(rule_in.centers[0].frequency == vec4f(0.0))
        && all(rule_in.centers[5].amplitude == vec4f(0.0))) {
        return Rule(generate_random_centers(rule_seed));
    }

    // Each cohort gets a random mutation.
    var rule = mutate_rule(rule_in, cfg_mutation_scale(config), rule_seed, stable);

    // THE SECOND VOICE (evolver Orbit): a breath still fading out while the
    // next fades in. Layered on top of the first, its own seed, stable twists.
    // Scale 0 in every saved state, so this branch is never taken for them.
    let scale_2 = cfg_mutation_scale_2(config);
    if (scale_2 != 0.0) {
        rule = mutate_rule(rule, scale_2, abs(cfg_mutation_seed_2(config)) + floor(cohort), true);
    }
    return rule;
}

// ==== end include: rule.wgsl ====

// --- bindings --------------------------------------------------------------
// Bindings 0 and 1 are fixed project-wide -- see the table in common.wgsl.
// Binding 2 is the pick result, mirroring PICK_RESULT_BINDING in picker.py:41
// and entity_pick.glsl:48.
//
// \`entities\` is READ-ONLY here, unlike entityUpdate.wgsl's read_write. That is
// not incidental: rule.wgsl is shared between the two shaders, so nothing in it
// may name this binding -- which is why get_cohort takes the entity count as a
// parameter instead of calling arrayLength() itself.

@group(0) @binding(0) var<storage, read> entities : array<Entity>;
@group(0) @binding(1) var<storage, read> configs  : array<ConfigData>;

// The config buffer's layout -- see entityUpdate.wgsl, which is built with the
// same value from the same field.
override CONFIG_PER_COHORT: bool = false;

// The config slot an entity is using, selected EXACTLY as entityUpdate.wgsl's
// \`main\` selects it, INCLUDING the clamp bound -- a different bound could pick a
// different slot than the physics used, and adopt a rule the entity is not
// obeying.
//
// The studio recomputes the slot from the index rather than trusting the stored
// one, as the physics does: after a Cohorts change while PAUSED, the stored
// slot is from the old split until the next step, and the pick must describe
// the population as it now stands.
//
// The physics' frame-0 case (assign by index, because nothing has been written
// yet) is not reproduced for sand: a pick on frame 0 has nothing meaningful to
// select, and the stored index is valid on every frame a user could click.
fn entity_slot(e: Entity, index: u32) -> i32 {
    var config_index = e_config_index(e);
    if (CONFIG_PER_COHORT) {
        config_index = i32(floor(get_cohort(index, configs[0], arrayLength(&entities))));
    }
    return clamp(config_index, 0, world_config_count(u.world) - 1);
}

// The result. 336 bytes; the layout is mirrored in pick.ts, which asserts it.
//
//   key   : atomic<u32>  offset 0
//   pos_x : f32          offset 4    <- both ride in the 12 bytes of padding
//   pos_y : f32          offset 8       that Rule's 16-byte alignment forces,
//   _pad  : u32          offset 12      so the position costs nothing
//   rule  : Rule         offset 16
//
// POSITION IS TWO f32s, NOT A vec2f, AND THAT IS THE WHOLE POINT. \`vec2f\` has
// ALIGNMENT 8, so it cannot start at offset 4 -- WGSL would push it to 8, the
// cohort to 16 and \`rule\` to 32, making the struct 352 bytes and the position
// cost a full 16-byte lane after all. Two f32s align to 4 and genuinely fit in
// the hole. (Measured: the driver rejected the 336-byte buffer as "too small,
// the pipeline requires 352" when this was a vec2f.)
//
// \`cohort\` FILLS WHAT WAS PADDING, at no cost. Offset 12 was \`_pad : u32\` --
// dead space Rule's 16-byte alignment forces to exist whether or not anything
// is written there. The cohort highlight needs to compare which COHORT two
// successive picks landed on, and the host cannot recompute it: get_cohort
// divides by arrayLength(&entities), and reproducing that host-side is the same
// class of mistake as reproducing the rule (see the header). So the shader
// reports it, and the struct is still 336 bytes.
struct PickResult {
    key    : atomic<u32>,
    pos_x  : f32,
    pos_y  : f32,
    cohort : f32,
    rule   : Rule,
}
@group(0) @binding(2) var<storage, read_write> result : PickResult;

struct PickUniforms {
    world  : WorldData,
    // xy: target (world space)   z: max_dist   w: reserved
    params : vec4f,
}
@group(0) @binding(3) var<uniform> u : PickUniforms;

// \`pick_target\`, not \`target\`: TARGET IS A RESERVED KEYWORD IN WGSL. The GLSL
// spells this uniform \`target\` (entity_pick.glsl:52) and the obvious
// translation does not compile -- a browser-only error, since nothing in
// \`npm test\` parses WGSL.
fn pick_target() -> vec2f { return u.params.xy; }
fn max_dist() -> f32 { return abs(u.params.z); }

/**
 * CONFIRM MODE: restrict the search to the highlighted cohort.
 *
 * Carried as the SIGN of \`max_dist\` rather than a new lane, because the two
 * facts are inseparable -- a confirm is always "this cohort, anywhere" and never
 * has a meaningful radius -- and because distance is only ever compared as a
 * magnitude, so the sign bit was doing nothing.
 *
 * ## Why this exists rather than a very large radius
 *
 * The keyboard confirm first tried to reach every member of the cohort by
 * passing a radius that spanned the world, on the theory that the confirmation
 * snap below would then pick one of them. It does not work, and the way it fails
 * is instructive: \`dist_norm\` is \`distance / limit\`, so a limit of 100 against
 * distances of ~1 quantizes EVERY particle in the world into bucket 0. The key
 * degenerates to the raw index, \`atomicMin\` returns the lowest index in the
 * world, and \`get_cohort\` is monotonic in index -- so the winner was always in a
 * LOW-numbered cohort. Confirming cohort 20 silently re-aimed to cohort 12.
 *
 * The snap could not save it: it sets \`dist_norm = 0\` for cohort members, but
 * the huge radius had already set everyone to 0. Filtering is the operation that
 * was actually wanted, and distance was the wrong instrument for it.
 */
fn confirm_only() -> bool { return u.params.z < 0.0; }

// The cohort the user is currently aiming at, or negative when none is. Rides
// the lane the GLSL left reserved. Floored host-side, matching \`col_params.y\`
// and the derive pass below, so \`==\` between them is exact.
fn highlighted_cohort() -> f32 { return u.params.w; }

// How close a member of the highlighted cohort has to be, as a FRACTION OF THE
// PICK RADIUS, before the reduce pass treats it as a direct hit.
//
// ---------------------------------------------------------------------------
// WHY THIS EXISTS
// ---------------------------------------------------------------------------
// Confirming a cohort means clicking any of its members a second time. But the
// members are scattered among everything else, so a click aimed at one of them
// often lands with some unrelated particle a few pixels nearer -- and a plain
// nearest-wins reduce hands the pick to that interloper. What the user sees is
// their confirmation silently re-aiming the highlight at a cohort they were not
// pointing at, which is the single most annoying way this feature can fail.
//
// So a highlighted-cohort particle inside this radius gets its distance clamped
// to zero: it enters the atomicMin at the very bottom of the key space and wins
// against anything that is merely closer. Ties among several such particles fall
// through to the index tie-break, which is deterministic (see the header).
//
// ---------------------------------------------------------------------------
// WHY 0.5 AND NOT SOMETHING ELSE
// ---------------------------------------------------------------------------
// The pick radius is 40 screen pixels (DEFAULT_PICK_RADIUS_PX), so this is 20px
// -- roughly a fingertip's worth of aim, and about the distance at which a user
// would say they were "clicking that particle" rather than near it.
//
// The trade is symmetric and worth stating in both directions. Too LARGE and a
// deliberate re-aim at a neighbouring cohort gets swallowed: you click a
// different particle, and a highlighted one half a radius away wins anyway, so
// the highlight appears stuck. Too SMALL and the feature does nothing, because
// the interloper cases it exists for are exactly the ones where a rival is
// within a few pixels. Half the radius keeps a re-aim working everywhere in the
// outer half of the pick circle while covering the near-miss case completely.
//
// PRIORITY IS NOT UNCONDITIONAL, and that is the point of having a radius at
// all: outside it a highlighted particle competes on its true distance like
// everything else, so clicking well away from the cohort still re-aims. A
// version without the radius would make the highlighted cohort win every pick
// anywhere on screen, and the highlight could never be moved by clicking.
const CONFIRM_SNAP_FRACTION: f32 = 0.5;

// The distance that saturates the key's buckets in CONFIRM MODE, in world units.
//
// A FIXED REFERENCE, not the pick radius: confirm mode has no meaningful radius
// (it searches the whole world), and normalising by one is exactly the mistake
// that made every particle land in bucket 0 -- see \`confirm_only\`.
//
// 2.0 spans world space, whose half-extent is ~1 per axis, so the buckets are
// spread across the range distances actually occupy. Anything beyond saturates
// to the last bucket and ties break on index, which is harmless: every candidate
// here is already a member of the right cohort, so the worst case is adopting
// the rule of a cohort-mate further from the centre than another.
const CONFIRM_DIST_SCALE: f32 = 2.0;

// --- the key ---------------------------------------------------------------
// Mirrored in pick.ts; pick.test.ts parses THIS FILE for the two bit counts and
// asserts they match, as tests/test_async_pick.py:65 does against the GLSL.
const INDEX_BITS: u32 = 24u;
const INDEX_MASK: u32 = (1u << INDEX_BITS) - 1u;
const DIST_BITS:  u32 = 8u;           // 256 distance buckets across the radius
const DIST_MAX:   u32 = (1u << DIST_BITS) - 1u;

// Written by the host before every dispatch. atomicMin only ever LOWERS, so a
// stale winner would beat every candidate forever if this were not reset.
const NO_HIT: u32 = 0xFFFFFFFFu;

//=========================================================================================
// PASS A -- reduce
//=========================================================================================

@compute @workgroup_size(256)
fn reduce(@builtin(global_invocation_id) gid: vec3u) {
    let index = gid.x;
    if (index >= arrayLength(&entities)) { return; }
    if (index > INDEX_MASK) { return; }   // beyond what the key can encode

    let e = entities[index];
    let pos = e_pos(e);

    // Straight-line, deliberately NOT toroidal. Picking is a UI affordance, and
    // the wrap only changes the answer for a click within a particle radius of
    // the seam -- not worth threading the boundary mode down here, and wrong in
    // every mode but BC_WRAP anyway.
    let d = pick_target() - pos;
    let dist_sq = dot(d, d);
    let limit = max_dist();

    // CONFIRM MODE FILTERS BY COHORT AND IGNORES THE RADIUS ENTIRELY. The
    // keyboard confirm has no cursor, so "near the target" is not the question
    // being asked -- "is this the cohort the user is looking at" is. See
    // \`confirm_only\`.
    //
    // The cohort is derived EXACTLY as the derive pass and entityUpdate do --
    // same \`get_cohort\`, same config selection, same clamp bound, same floor.
    // Any divergence would select from a different set than the one the shader
    // draws bright, and the two would disagree while both looked internally
    // consistent.
    if (confirm_only()) {
        // The cohort filter applies only when there IS a highlighted cohort.
        // With none -- one-click selection, or a single-cohort config -- every
        // particle is a candidate and the nearest to the target wins, which is
        // what a click at that point would have adopted. Returning early here
        // instead would make Enter find nothing in exactly the configurations
        // that have no other keyboard route.
        if (highlighted_cohort() >= 0.0) {
            let config = configs[entity_slot(e, index)];
            let cohort = floor(get_cohort(index, config, arrayLength(&entities)));
            if (cohort != highlighted_cohort()) { return; }
        }

        // Among the cohort's members, the one NEAREST THE TARGET wins, so the
        // adopted rule comes from a particle near the middle of the view rather
        // than from whichever happens to hold the lowest index. Quantized
        // against a fixed reference -- the radius is meaningless here, and
        // dividing by it is what collapsed every bucket to 0 in the version this
        // replaces.
        let dist_q_confirm = u32(clamp(sqrt(dist_sq) / CONFIRM_DIST_SCALE, 0.0, 1.0)
                                 * f32(DIST_MAX));
        atomicMin(&result.key, (dist_q_confirm << INDEX_BITS) | index);
        return;
    }

    if (dist_sq > limit * limit) { return; }   // outside the radius

    // Quantize distance into the high bits. Using the actual distance (not the
    // square) spreads the buckets evenly in the units the user perceives.
    var dist_norm = sqrt(dist_sq) / limit;               // [0,1]

    // THE CONFIRMATION SNAP. A member of the highlighted cohort, close enough
    // that the click plausibly meant it, is treated as a direct hit so no merely
    // nearer interloper can steal the confirmation. See CONFIRM_SNAP_FRACTION.
    if (highlighted_cohort() >= 0.0 && dist_norm <= CONFIRM_SNAP_FRACTION) {
        let config = configs[entity_slot(e, index)];
        let cohort = floor(get_cohort(index, config, arrayLength(&entities)));
        if (cohort == highlighted_cohort()) { dist_norm = 0.0; }
    }

    let dist_q = u32(clamp(dist_norm, 0.0, 1.0) * f32(DIST_MAX));

    let key = (dist_q << INDEX_BITS) | index;
    atomicMin(&result.key, key);
}

//=========================================================================================
// PASS B -- derive
//=========================================================================================

// ONE INVOCATION. @workgroup_size(1) is load-bearing: at 256 every thread in
// the group would race to write the same rule to the same 320 bytes. It would
// probably even LOOK correct, since they all compute the same value -- which is
// why shaders.test.ts asserts the 1 rather than trusting review.
//
// The host dispatches this only after \`reduce\` has finished in a separate pass,
// so \`result.key\` is settled by the time it is read.
@compute @workgroup_size(1)
fn derive() {
    let key = atomicLoad(&result.key);
    // Nothing was in range. Leave pos and rule alone -- the host reads the
    // sentinel first and never looks at them.
    if (key == NO_HIT) { return; }

    let index = key & INDEX_MASK;
    if (index >= arrayLength(&entities)) { return; }   // paranoia; cannot happen

    let e = entities[index];

    // The winner's position, from THE SAME READ of the same record that the
    // rule below comes from. The desktop instead looks the position up
    // host-side from the index (picker.py:142-145), on the argument that the
    // index is authoritative so the two cannot disagree. That argument still
    // holds; this is simply stronger, and it saves a second readback.
    //
    // Note this does NOT reopen the "losers must not write" hazard above: that
    // applies to the reduce pass, where many threads compete. Here there is one
    // invocation and no competitor.
    let winner_pos = e_pos(e);
    result.pos_x = winner_pos.x;
    result.pos_y = winner_pos.y;

    // The slot the physics is reading. Its rule is already this cohort's
    // mutation, so it is copied, not derived -- deriving again would mutate it
    // twice.
    let config = configs[entity_slot(e, index)];
    let cohort = get_cohort(index, config, arrayLength(&entities));
    result.rule = config.rule;

    // FLOORED, because that is what cohort IDENTITY is. get_cohort returns a
    // CONTINUOUS ramp (rule.wgsl:120-122) -- two entities in the same cohort
    // have different raw values, so comparing them raw would say every pick
    // disagrees with every other and no cohort would ever highlight.
    // rule.wgsl:104 says floor() is the equality test, entityUpdate.wgsl:531
    // stores floor(cohort) into col_params.y for the same reason, and the
    // highlight compares this against THAT. All three must floor or the shader
    // dims a different set of particles than the host thinks it highlighted.
    result.cohort = floor(cohort);
}
`,Dl=`// ============================================================================
// cohortRules.wgsl -- bake each config slot's cohort mutation into its rule.
//
// One invocation per slot of the config buffer (see configSlots.ts for what a
// slot is). Each replaces its slot's PARENT rule with the rule that slot's
// particles obey, so entityUpdate.wgsl reads a finished rule instead of deriving
// one per particle per step.
//
// THE SAME derive_entity_rule, FROM THE SAME FILE, that deriveRule.wgsl runs for
// the archive's offline rebuild of an adopted rule. That is what keeps the
// rebuild bit-identical to the rule the particle was running: there is still
// exactly one implementation, it has just moved from "every particle, every
// step" to "every slot, every upload".
//
// IN PLACE, AND THEREFORE NOT IDEMPOTENT. Running this twice over one upload
// would mutate the already-mutated rule. The host only dispatches it after
// \`uploadConfigs\` has rewritten the parent configs -- see \`rulesDirty\` in
// particleSystem.ts.
// ============================================================================

// ==== begin include: common.wgsl ====
// ============================================================================
// common.wgsl -- shared struct definitions and coordinate math.
//
// THIS FILE IS THE SINGLE SOURCE OF TRUTH FOR GPU STRUCT LAYOUT. What the
// structs below declare is what the GPU reads.
//
// The layout is stated in ONE OTHER PLACE: \`src/particleSystem/layout.fixture.json\`,
// which is what the host packs against (\`pack.ts\`, guarded by \`assertLaneMap\`).
// Two hand-authored statements of one fact, so \`common.wgsl.test.ts\` checks the
// declarations below against that descriptor on every \`npm test\`. It is the
// shader-side counterpart of \`assertLaneMap\`; together they close the loop.
//
// If that test fails, the two have diverged and the GPU is reinterpreting memory
// the host packed to a different plan -- which does not crash, it just makes the
// simulation subtly wrong. CHANGE BOTH FILES IN THE SAME COMMIT.
//
// (The descriptor was originally generated by the Python desktop app's
// layout.py, which parsed the GLSL original of this file. That app is gone;
// there is no generator now and deliberately no replacement -- see layout.ts.)
//
// RULES FOR EDITING THIS FILE:
//
//  1. vec4-ONLY. Every member of every struct must be a vec4f, a fixed-size
//     array of vec4f, or another struct that obeys this rule. No bare f32,
//     no i32, no vec2f/vec3f. Scalars ride in vec4 lanes; ints ride in float
//     lanes via bitcast.
//
//     Why: std430 (GLSL) and WGSL do NOT agree on how to lay out structs with
//     mixed scalar types. An all-vec4 struct is 16-byte aligned with an
//     unambiguous stride in both, so this codebase translates between them
//     without a layout audit. Both layout.py and common.wgsl.test.ts enforce
//     this and will fail on anything else.
//
//  2. ADD A FIELD BY CLAIMING A RESERVED LANE, not by appending a scalar.
//     When the reserved lanes run out, add a whole new vec4.
//
//  3. NO uniforms and NO buffer/binding declarations in this file -- types and
//     pure functions only. Bindings belong to the shader that owns them.
//     (Binding assignments are recorded in the table below for coordination.)
//
//     This rule is MORE load-bearing on the web than on the desktop. GLSL
//     drivers strip unused uniforms and moderngl's tryset() tolerates the
//     result; WebGPU validates against an explicit bind group layout, so a
//     uniform declared here but unused by an including shader is a hard
//     pipeline-creation error rather than a warning.
//
//  4. NO \`#version\` line here (WGSL has none) and no entry points. This file is
//     included into compute, vertex AND fragment modules, so it must stay
//     stage-agnostic: no texture sampling, no discard, no derivatives
//     (fwidth/dpdx). It currently has none of those -- keep it that way.
//
// SSBO BINDING ASSIGNMENTS (project-wide, keep in sync):
//     binding = 0   EntityBuffer
//     binding = 1   ConfigBuffer
// ============================================================================

const PI: f32 = 3.1415926;

// \`STRAFE_FIELD_GAIN\` USED TO LIVE HERE, at 0.01, as the fixed rate at which the
// painted field displaced a particle. It is now a UNIFORM, because the Walls
// Field Strength preference multiplies it -- so the host owns the number
// (\`FIELD_STRENGTH_GAIN\` in \`prefs/preferences.ts\`) and packs \`strength * 0.01\`
// into the entity update's uniform.
//
// Moved rather than kept alongside the slider: two multipliers, one here and one
// host-side, is exactly the "second multiplier for the user to get lost between"
// that the original comment ruled out. At the default strength of 1.0 the product
// is 0.01 and every painted field behaves precisely as it did before.

// ---------------------------------------------------------------------------
// CANVAS VALUE SCALE -- the canvas is RG16F (see CANVAS_DTYPE in
// particle_system.py), and fp16's usable range starts at ~6.1e-5. At high
// Trail Persistence the splat premultiply (1-P)/P shrinks each deposit to
// ~1e-6, which is SUBNORMAL in fp16: blend units flush it and trails starve
// (measured: 40x dimmer at P=0.999). All stored canvas values therefore ride
// 512x above their physical meaning: the splat multiplies by this, every READER
// divides by it. canvas decay/diffuse is linear and scale-invariant, so it
// neither knows nor cares.
//
// 512 is chosen with both ends in view: it lifts a slow particle's deposit at
// P = 0.999 (~3.6e-6) to ~1.8e-3 -- comfortably normal -- while the largest
// legitimate single splat (fast particle at the P clamp floor) stays around
// 1e4, under fp16's 65504 ceiling. Readers: get_can() in entity_update,
// camera. Writers: the trail deposit (entityUpdate.wgsl \`deposit\`, drained
// into the canvas by canvas.wgsl).
const CANVAS_VALUE_SCALE: f32 = 512.0;

// THE SPLAT ACCUMULATOR'S FIXED POINT. WGSL atomics are integer-only, so each
// deposit rides in an i32 at this many counts per (already scaled) canvas unit.
//
// 2^14 matches fp16 at both ends. One count is 2^-14, fp16's smallest normal,
// so the accumulator resolves exactly the deposits a blended fp16 splat could;
// and +-2^31 counts span +-2^17, twice fp16's 65504 ceiling, so a pile-up
// saturates in the canvas pass's CANVAS_VALUE_MAX clamp before it can wrap.
// The deposit range this has to hold is CANVAS_VALUE_SCALE's, above.
const SPLAT_FIXED_SCALE: f32 = 16384.0;

// Saturation ceiling for stored (scaled) canvas values, applied by the canvas
// pass on every write. NEEDED BECAUSE OF fp16: a texel pushed past 65504 rounds
// to inf, and inf survives decay forever (inf * P == inf) -- one extreme splat
// pile-up would permanently poison the texel and NaN any particle that senses
// it. Saturating below the ceiling lets even an absurd pile-up decay back down.
// fp32 never needed this; do not remove it while the canvas is fp16.
const CANVAS_VALUE_MAX: f32 = 60000.0;

// Trail Persistence's legal range inside the shaders. The FLOOR is well below
// the slider (0.5..0.999) and below every known config (observed min 0.312);
// it exists for typed-in extremes. It was 1e-4, but (1-P)/P at 1e-4 is ~1e4,
// which times CANVAS_VALUE_SCALE would overflow fp16 on a single splat --
// 1e-2 caps the premultiply at ~99 and costs nothing anyone uses.
// The deposit and the canvas pass MUST clamp with the same bounds, or the
// splat premultiply and the decay would disagree about what P means.
const TRAIL_PERSISTENCE_MIN: f32 = 1e-2;
const TRAIL_PERSISTENCE_MAX: f32 = 0.999;

// ---------------------------------------------------------------------------
// MODE ENUMS -- the single definition. ui/settings_spec.py mirrors these BY
// VALUE in its DROPDOWN_MODES tuples, so the order of the options there is the
// order here. Change one, change both.
// ---------------------------------------------------------------------------

// What happens when a particle reaches the edge of the world. A WorldData
// setting: the trail field follows the same rule, so it cannot vary per config.
const BC_BOUNCE: i32 = 0;
const BC_WRAP: i32 = 1;
const BC_RESET: i32 = 2;
// Leaving the world KILLS the particle rather than respawning it: it is marked
// dead and its index pushed onto the free list. The sand modality's default,
// and the worked example of the sinks system -- BC_RESET's sibling, differing
// only in what happens to the particle that crossed.
//
// ADDED AS A FOURTH VALUE rather than by redefining BC_RESET, so the studio's
// three modes keep their exact meanings. A config that has never heard of this
// mode cannot select it, and nothing in the studio writes a 3.
const BC_KILL: i32 = 3;

// How particles are placed on reset. A ConfigData setting: different
// populations can seed differently.
const IC_GRID: i32 = 0;
const IC_RANDOM: i32 = 1;
// No shader compares against IC_CENTER -- it is the fall-through \`else\` branch
// of initial_position() in entity_update. It stays defined because it is a real
// mode, mirrored by value in ui/settings_spec.py's dropdown. Do not drop it as
// dead code.
const IC_CENTER: i32 = 2;
const IC_RING: i32 = 3;

// ---------------------------------------------------------------------------
// Rule -- the Fourier Feature Network coefficients that define particle behavior
// ---------------------------------------------------------------------------

// 4D input -> 4D output basis element.
struct FourierCenter {
    frequency: vec4f,
    amplitude: vec4f,
}

// 10 FourierCenters makes a Rule. 320 bytes, all vec4.
//
// This is the only array in the layout, and it is the case that usually bites:
// std430's array-of-struct stride here is 32 bytes, and WGSL's
// array<FourierCenter,10> stride is also 32 (alignment 16, size 32 -- already a
// multiple). No stride divergence. common.wgsl.test.ts asserts it rather than
// trusting this comment.
struct Rule {
    centers: array<FourierCenter, 10>,
}

// ---------------------------------------------------------------------------
// ConfigData -- everything a particle needs to know about how to behave.
//
// This unifies what used to be two separate systems: the Rule (behavior) and
// the physics parameters. They live together now because they are the same
// kind of thing -- per-particle-population settings -- and separating them is
// what made the reference implementation's parameter handling sprawl.
//
// Lives in ConfigBuffer (binding 1). Each entity selects its ConfigData via
// its own config_index, so different particles can obey different configs.
// ---------------------------------------------------------------------------
struct ConfigData {
    rule: Rule,      // 320 B -- behavior coefficients
    sensor: vec4f,   // x: gain          y: angle       z: distance    w: mutation_scale
    force: vec4f,    // x: global_mult   y: drag        z: strafe      w: axial
    misc: vec4f,     // x: lateral       y: hazard_rate z: cohorts(i)  w: mutation_seed
    // The first four vec4s filled up (misc.w went to mutation_seed), so this is
    // the "add a whole new vec4" case rule 2 describes rather than a reclaimed
    // lane. Two spares here for the next additions.
    force2: vec4f,   // x: gravity_force y: gravity_strafe z: initial_conditions(i) w: cohort_fences(i)
    // force2 filled up the same way misc did, so this is another whole new
    // vec4 rather than a reclaimed lane. This one's zw were the last two spares
    // in the struct, and the sensor jitters claimed them -- rule 2's "claim a
    // reserved lane" case. THERE ARE NO SPARE LANES LEFT: the next addition
    // needs a whole new vec4.
    //
    // NAMED FOR BEING AN OVERFLOW LANE, NOT FOR A THEME -- like \`misc\` and
    // \`force2\` above it. It was called \`appearance\` while it held only the two
    // colour settings; the sensor jitters are physics, so that name had become
    // a lie about half its contents. A lane is a place four floats fit, not a
    // category, and pretending otherwise makes the next addition agonize over
    // whether it belongs. Read the per-lane comment, not the name.
    misc2: vec4f,  // x: color_sensitivity     y: color_by_cohort(i)
                   // z: sensor_angle_jitter   w: sensor_distance_jitter
    // misc2 had no spares left, so Radial Gravity is rule 2's "add a whole new
    // vec4" case again rather than a reclaimed lane. Gravity (Trails) then took
    // .y -- rule 2's "claim a reserved lane" case, as did Color Offset in .z
    // and Trail Weight in .w. No spares left.
    misc3: vec4f,  // x: radial_gravity(i)     y: gravity_trails
                   // z: color_offset          w: trail_weight
    // misc3 had no spares left, so the evolver's SECOND mutation voice is rule
    // 2's "add a whole new vec4" case. RUNTIME ONLY: never saved, always 0 in
    // a loaded state, so every saved state packs and behaves exactly as before.
    // Breathe mode's Orbit overlaps two breaths, and the fading one rides here.
    misc4: vec4f,  // x: mutation_scale_2      y: mutation_seed_2
                   // z: reserved              w: reserved
}  // 432 bytes

fn cfg_sensor_gain(c: ConfigData) -> f32     { return c.sensor.x; }
fn cfg_sensor_angle(c: ConfigData) -> f32    { return c.sensor.y; }
fn cfg_sensor_distance(c: ConfigData) -> f32 { return c.sensor.z; }
fn cfg_mutation_scale(c: ConfigData) -> f32  { return c.sensor.w; }

fn cfg_global_force_mult(c: ConfigData) -> f32 { return c.force.x; }
fn cfg_drag(c: ConfigData) -> f32              { return c.force.y; }
fn cfg_strafe_power(c: ConfigData) -> f32      { return c.force.z; }
fn cfg_axial_force(c: ConfigData) -> f32       { return c.force.w; }

fn cfg_lateral_force(c: ConfigData) -> f32 { return c.misc.x; }
fn cfg_hazard_rate(c: ConfigData) -> f32   { return c.misc.y; }
fn cfg_cohorts(c: ConfigData) -> i32       { return bitcast<i32>(c.misc.z); }
// Which random variation the rule mutation uses. Per-config rather than a
// uniform, so different particle populations can mutate differently.
fn cfg_mutation_seed(c: ConfigData) -> f32 { return c.misc.w; }
// A second, independent mutation layered on the first (evolver Orbit only).
// Scale 0 = absent. The seed is always used in stable mode (see mutate_rule).
fn cfg_mutation_scale_2(c: ConfigData) -> f32 { return c.misc4.x; }
fn cfg_mutation_seed_2(c: ConfigData) -> f32  { return c.misc4.y; }

// Uniform pull on the whole population, in the two motion channels the rest of
// the physics uses: _force feeds velocity, _strafe displaces position directly.
// Both are LINEAR -1..1 controls -- run them through gravity_expand() before
// use, never apply them raw.
fn cfg_gravity_force(c: ConfigData) -> f32  { return c.force2.x; }
fn cfg_gravity_strafe(c: ConfigData) -> f32 { return c.force2.y; }

// How this population is arranged on reset -- one of the IC_* modes above.
fn cfg_initial_conditions(c: ConfigData) -> i32 { return bitcast<i32>(c.force2.z); }
// Whether each particle is held near its own spawn point. ON/OFF ONLY: the
// fence RADIUS is derived from the grid cell size rather than stored, so
// cohorts just barely touch at any cohort count -- see the fence block in
// entity_update, which also explains why it applies to IC_GRID alone.
fn cfg_cohort_fences(c: ConfigData) -> bool { return bitcast<i32>(c.force2.w) != 0; }

// How strongly the brain's colour signal swings the hue. Read by the PARTICLE
// CAMERA, not by the physics -- entity_update only decides what raw signal to
// store, so this can be dragged without disturbing the simulation.
//
// NO SHADER CALLS THIS. The camera does not read the config buffer (rule 3);
// the value reaches cam_brush as a loose uniform instead. This accessor is the
// record of which lane holds it -- keep it.
fn cfg_color_sensitivity(c: ConfigData) -> f32 { return c.misc2.x; }
// Colour each population flat by its cohort instead of by its brain's output.
// A DISPLAY choice, read by the particle camera -- entity_update transmits both
// signals (col_params.x is the brain, .y the cohort) and picks neither, so this
// takes effect immediately, even while the simulation is paused.
//
// Also uncalled by any shader, for the same reason as cfg_color_sensitivity.
fn cfg_color_by_cohort(c: ConfigData) -> bool { return bitcast<i32>(c.misc2.y) != 0; }

// WHERE THIS POPULATION'S HUE SITS BEFORE THE SIGNAL MOVES IT. Sensitivity is
// the coefficient A and this is the bias B in \`hue = A * signal + B\`, so a
// config can be tuned to a corner of the wheel and its signal read as variation
// WITHIN that colour rather than across the whole spectrum.
//
// 0..1 spans the wheel exactly once. Hue is periodic, so the ends meet and no
// wrapping is needed anywhere -- see the fragment stage in cam_brush.
//
// IN A DIFFERENT LANE FROM cfg_color_sensitivity, which it belongs beside by
// meaning. misc2 was full; this is rule 2's "claim a reserved lane" case in
// misc3 rather than a fourth vec4 for one float. The accessors are written
// together here because that is where a reader looks for them -- the lane a
// value lives in is an allocation detail, which is exactly what the misc2
// comment above says.
//
// Uncalled by any shader, like the two above: the camera does not read the
// config buffer (rule 3), so this reaches cam_brush through the swatch table on
// its own uniform. The accessor is the record of which lane holds it.
fn cfg_color_offset(c: ConfigData) -> f32 { return c.misc3.z; }

// Random wobble added to each sensor reading, resampled EVERY PHYSICS STEP --
// a shimmer, not a fixed per-particle trait. Both are 0..1 controls scaled so
// that 1.0 spans the whole range of the parameter they perturb: angle covers
// its own -1..1 slider directly, distance covers SENSOR_DISTANCE_SPAN below.
// Applied in entity_update; 0 is off.
fn cfg_sensor_angle_jitter(c: ConfigData) -> f32    { return c.misc2.z; }
fn cfg_sensor_distance_jitter(c: ConfigData) -> f32 { return c.misc2.w; }

// Which direction the two gravity channels above pull in. False (the default,
// and what every config written before this existed means) is the fixed
// vec2(0,1) screen-down pull; true swings it to the particle's own position
// vector, so positive values fall inwards towards the origin and negative
// values blow outwards. Lives in misc3 rather than beside the gravity values
// because force2 and misc2 were both full -- read the lane comment, not the
// name.
fn cfg_radial_gravity(c: ConfigData) -> bool { return bitcast<i32>(c.misc3.x) != 0; }

// THE THIRD GRAVITY CHANNEL, and the only one that is not a motion.
//
// Force and Strafe above move the particle. This one moves what the particle
// BELIEVES: it is a constant bias added to every canvas sensor reading, in
// exactly the manner the user-drawn trails layer is added (see \`get_can\` in
// entityUpdate.wgsl). Nothing is pushed -- particles are told there is a trail
// downhill, and each rule decides for itself what to do about that. A rule that
// chases trails falls; a rule that avoids them rises. So unlike the other two,
// this channel's SIGN IS NOT ITS DIRECTION, and it does nothing whatsoever to a
// population whose rule ignores the sensors.
//
// LINEAR -1..1 like its siblings, expanded by the same gravity_expand() -- one
// curve for all three, so the feel of the three sliders matches.
fn cfg_gravity_trails(c: ConfigData) -> f32 { return c.misc3.y; }

// TRAIL WEIGHT: how heavily a config's trails count against OTHER configs'.
// Its deposits are multiplied by it and its reads of the swarm's trails divided
// by it (both in entityUpdate.wgsl), so a config alone is unaffected at any
// weight. Negative lays trails that point backwards, to everyone else.
//
// THE FLOOR IS LOAD-BEARING: reads divide by this. A stored value inside
// +-TRAIL_WEIGHT_MIN -- a hand-edited file, a typed 0 -- is pushed out to the
// floor on its own side, zero counting as positive. Mirrored by value in
// \`particleSystem/config.ts\` and pinned by a test.
const TRAIL_WEIGHT_MIN: f32 = 0.02;
fn cfg_trail_weight(c: ConfigData) -> f32 {
    let w = c.misc3.w;
    if (abs(w) >= TRAIL_WEIGHT_MIN) { return w; }
    return select(TRAIL_WEIGHT_MIN, -TRAIL_WEIGHT_MIN, w < 0.0);
}

// The width of the Sensor Distance slider (0..5), which is what a distance
// jitter of 1.0 spans. It lives here rather than being read from the slider
// bounds because the shader has no access to those -- MUST MATCH the \`hi\` of
// the sensor_distance entry in ui/settings_spec.py.
const SENSOR_DISTANCE_SPAN: f32 = 5.0;

// The speed below which a particle is considered STALLED and is given a random
// heading. See the rescue block in entityUpdate.wgsl for why one is needed: a
// particle's heading is its velocity, so at exactly zero it has no direction,
// its sensors collapse onto each other, and nothing can ever restore it.
//
// 5e-5 is \`reset()\`'s own spawn magnitude -- the number this codebase already
// picked for "slow, but moving enough to have a direction". Using the same value
// makes a rescued particle indistinguishable from a freshly reset one.
//
// A FLOOR, NOT AN EPSILON. It is deliberately far above fp32's denormal range:
// the failure is not underflow to exactly zero, it is a velocity too small for
// \`sample_dist\` to place the sensors on different texels, which happens long
// before the bits run out.
const MIN_VELOCITY: f32 = 5e-5;

// ---------------------------------------------------------------------------
// WorldData -- settings that are properties of the world, not of a particle.
//
// Set as a uniform, never per-entity. If a setting would be meaningless to
// vary between two particles sharing a canvas (trail decay, world scale), it
// belongs here rather than in ConfigData.
// ---------------------------------------------------------------------------
struct WorldData {
    trail: vec4f,  // x: persistence  y: diffusion  z: sqrt_world_size  w: config_count(i)
    // trail filled up, so this is rule 2's "add a whole new vec4" case.
    bounds: vec4f, // x: boundary_conditions(i)   yzw: reserved
}

fn world_trail_persistence(w: WorldData) -> f32 { return w.trail.x; }
fn world_trail_diffusion(w: WorldData) -> f32   { return w.trail.y; }
fn world_sqrt_world_size(w: WorldData) -> f32   { return w.trail.z; }
fn world_config_count(w: WorldData) -> i32      { return bitcast<i32>(w.trail.w); }

// What happens at the edge of the world -- one of the BC_* modes above. A
// world property rather than a per-config one: the trail field has to obey the
// same boundary as the particles do, and there is only one trail field.
fn world_boundary_conditions(w: WorldData) -> i32 { return bitcast<i32>(w.bounds.x); }

// ---------------------------------------------------------------------------
// Entity -- one particle. 32 bytes, 16-byte aligned.
//
// Lives in EntityBuffer (binding 0). Mirrored by no one: every shader that
// touches entities includes this file.
// ---------------------------------------------------------------------------
struct Entity {
    pos_vel: vec4f,  // xy: pos    zw: vel
    misc: vec4f,     // x: size    y: config_index(i)    zw: col_params
}

fn e_pos(e: Entity) -> vec2f          { return e.pos_vel.xy; }
fn e_vel(e: Entity) -> vec2f          { return e.pos_vel.zw; }
fn e_size(e: Entity) -> f32           { return e.misc.x; }
fn e_config_index(e: Entity) -> i32   { return bitcast<i32>(e.misc.y); }

// ---------------------------------------------------------------------------
// LIFETIME -- a negative config_index means the particle is DEAD.
//
// NO LAYOUT CHANGE. Entity is full at 32 bytes and every lane is spoken for, so
// a dead FLAG would have meant widening the struct and editing
// layout.fixture.json in lockstep. It is not needed: config_index is already an
// i32 riding a float lane, and no real config index is ever negative -- so the
// sign bit was free the whole time.
//
// EVERY READER MUST TEST THIS BEFORE THE CONFIG LOOKUP. \`entityUpdate\` clamps
// config_index into range (\`clamp(idx, 0, count-1)\`), which would quietly turn
// a dead particle into a config-0 particle rather than skipping it. The clamp is
// correct for its own purpose -- it makes a SHRUNK ConfigBuffer degrade
// gracefully -- so the dead test goes above it rather than replacing it.
//
// The studio produces these only through BC_KILL, and its reset frame brings
// them back (see the dead-particle note in entityUpdate's \`main\`).
// ---------------------------------------------------------------------------
// \`make_entity_dead\` is NOT here: it calls make_entity, which is declared below,
// and WGSL requires declaration before use. It sits under that function instead.
const DEAD_CONFIG: i32 = -1;

fn e_is_dead(e: Entity) -> bool { return e_config_index(e) < 0; }

// RAW OUTPUT FROM THE PARTICLE'S BRAIN, kept for rendering rather than physics.
// entity_update writes these; the particle camera turns them into a hue.
//
// .x is a raw force term from the black box -- deliberately arbitrary, tuned by
// eye, so nothing downstream should read meaning into its scale.
// .y is the particle's COHORT INDEX, which cam_brush reads when Color By
// Cohort is on.
//
// The RENDERER decides what these look like. Storing the raw signals instead of
// a finished hue is what lets Color Sensitivity be dragged without re-running
// the simulation, which is where the reference put it.
fn e_col_params(e: Entity) -> vec2f { return e.misc.zw; }

fn make_entity(pos: vec2f, vel: vec2f, size: f32, config_index: i32,
               col_params: vec2f) -> Entity {
    return Entity(vec4f(pos, vel),
                  vec4f(size, bitcast<f32>(config_index), col_params));
}

// Same, for the paths that have no colour signal to offer -- reset() runs
// before any behaviour is computed. Zero is a valid hue, so this is not a
// sentinel; the entity simply gets its colour on the next real step.
//
// RENAMED from the GLSL, which overloads \`make_entity\` on arity -- WGSL has no
// function overloading. The delegation is kept: this is the 5-arg form with a
// zero colour, not a second implementation.
fn make_entity_reset(pos: vec2f, vel: vec2f, size: f32,
                     config_index: i32) -> Entity {
    return make_entity(pos, vel, size, config_index, vec2f(0.0));
}

// A DEAD particle -- see the lifetime block above \`e_is_dead\`.
//
// Everything is zeroed rather than left stale: a readback of the buffer stays
// legible, and nothing downstream can be fooled by a plausible-looking position
// on a particle that is not there. A size of 0 means that even a consumer which
// somehow skipped the dead test would draw a zero-area sprite.
//
// DECLARED HERE, not beside e_is_dead, because it calls make_entity above and
// WGSL requires declaration before use.
fn make_entity_dead() -> Entity {
    return make_entity(vec2f(0.0), vec2f(0.0), 0.0, DEAD_CONFIG, vec2f(0.0));
}

// ---------------------------------------------------------------------------
// COORDINATE CONVENTION -- the one canonical implementation.
//
// World space is AREA-PRESERVING. With ca = canvas_res.x / canvas_res.y:
//
//     world = [-sqrt(ca), +sqrt(ca)]  x  [-1/sqrt(ca), +1/sqrt(ca)]
//
// so the world always has area 4 regardless of canvas aspect, and a circle in
// world space stays a circle on screen. On a square canvas ca == 1 and this
// reduces exactly to the familiar [-1,1] x [-1,1].
//
// NO OTHER FILE MAY WRITE ASPECT-RATIO MATH. Every world<->uv<->ndc
// conversion goes through the functions below (and their TypeScript mirrors in
// src/particleSystem/coords.ts). The reference implementation had six divergent
// copies of this math, at least one of which contradicted the others; that is
// the specific failure this rule exists to prevent.
//
// THE WORLD IS A TORUS ONLY IN BC_WRAP. The boundary mode decides the world's
// topology, so anything that crosses an edge must ask: world_wrap for wrap,
// world_bounce for bounce, and world_to_uv_bc for every texture read.
//
// SEVERAL FUNCTIONS BELOW HAVE NO EXTERNAL CALLER. world_half_extent,
// world_to_uv, uv_to_world, edge_fold, letterbox_scale and screen_ndc_to_world
// are each an internal composition step of one that does. They are load-bearing,
// not dead. WGSL does not warn about unused module-scope functions.
// ---------------------------------------------------------------------------

// Half-extent of world space on each axis, from canvas aspect ca = res.x/res.y.
fn world_half_extent(ca: f32) -> vec2f {
    let s = sqrt(ca);
    return vec2f(s, 1.0 / s);
}

fn world_half_extent_from_res(canvas_res: vec2f) -> vec2f {
    return world_half_extent(canvas_res.x / canvas_res.y);
}

// Scale a uv-space delta into the aspect-corrected metric -- literally
// world_half_extent applied as a scale, which is why it lives here rather than
// being its own piece of aspect math. World space is area-preserving, so a raw
// uv delta is anisotropic on a non-square canvas; brushes measured in this
// metric stay circular, and a ring drawn in it matches the brush that paints
// in it. Used by strafe_draw (painting) and frame_assembly (the reticle that
// must agree with it).
fn aspect_correct_uv(d: vec2f, canvas_res: vec2f) -> vec2f {
    return d * world_half_extent_from_res(canvas_res);
}

// World -> texture uv [0,1]. In BC_WRAP the canvas textures are sampled with a
// repeating sampler and the sampler does the wrapping, so uv is deliberately
// left unclamped. Every other boundary mode must go through world_to_uv_bc.
fn world_to_uv(p: vec2f, canvas_res: vec2f) -> vec2f {
    return p / (2.0 * world_half_extent_from_res(canvas_res)) + 0.5;
}

// World -> texture uv, honoring the boundary mode. Only BC_WRAP leaves uv free
// for the sampler's repeat to handle; the others clamp, so a sensor reaching
// past the edge reads the edge rather than the far side of the world.
fn world_to_uv_bc(p: vec2f, canvas_res: vec2f, bc: i32) -> vec2f {
    let uv = world_to_uv(p, canvas_res);
    // select(false_value, true_value, condition) -- the argument order is the
    // reverse of GLSL's \`cond ? a : b\`.
    return select(clamp(uv, vec2f(0.0), vec2f(1.0)), uv, bc == BC_WRAP);
}

fn uv_to_world(uv: vec2f, canvas_res: vec2f) -> vec2f {
    return (uv - 0.5) * 2.0 * world_half_extent_from_res(canvas_res);
}

// The corner of an instanced quad, in TRIANGLE-STRIP order, as a 0..1 uv:
// (0,0) (1,0) (0,1) (1,1) for vertex_id 0..3. The matching offset from the quad
// centre is \`(strip_corner(v) * 2.0 - 1.0) * half_size\`, which pairs uv and
// corner by construction -- they are the same value.
//
// ARITHMETIC, NOT A LOOKUP TABLE, and that is the reason this exists. The
// per-particle sprite shaders (camBrush.wgsl; the brush pass before it became
// a point splat) used \`var offsets = array<vec2f, 4>(...)\` indexed by vertex_id.
// A local array indexed by a non-constant is spilled to per-thread scratch
// memory by the browser's shader compilers (the same trap that made
// entityUpdate's by-value Rule so slow), and a sprite shader runs four times
// per particle. Do not turn this back into a table.
//
// Strip, not fan: WebGPU has no triangle-fan, and a strip over the desktop's
// fan order (brush.vert:25-36) draws a bowtie.
fn strip_corner(vertex_id: u32) -> vec2f {
    return vec2f(f32(vertex_id & 1u), f32(vertex_id >> 1u));
}

// World -> normalized device coords [-1,1] for rasterizing into the canvas.
fn world_to_ndc(p: vec2f, canvas_res: vec2f) -> vec2f {
    return p / world_half_extent_from_res(canvas_res);
}

// Wrap a world position into the world bounds. BC_WRAP only -- the world is a
// torus in that mode alone.
//
// DO NOT REWRITE fract() AS \`%\`. \`p\` here is freely signed (a world position
// past either edge), so \`p / size - 0.5\` is routinely negative, and WGSL's \`%\`
// is truncated where this needs floored behaviour. WGSL defines fract(x) as
// \`x - floor(x)\`, identical to GLSL, so it translates verbatim and correctly --
// the \`%\` "cleanup" would break wrap for every particle leaving the left or
// bottom edge.
fn world_wrap(p: vec2f, canvas_res: vec2f) -> vec2f {
    let extent = world_half_extent_from_res(canvas_res);
    let size = 2.0 * extent;
    return size * (fract(p / size - 0.5) - 0.5);
}

// Reflect a coordinate given in edge units back into [-1,1]. A triangle wave,
// so it is correct for ARBITRARY overshoot. The reference's single-fold version
// (sign(x)*(1-abs(1-abs(x)))) silently teleported a particle to the far side
// once it passed 2x the edge in one step, which heavy gravity reaches.
//
// GLSL's mod() is floored and WGSL's \`%\` is truncated, so they are NOT
// interchangeable in general. They agree here because the dividend is abs(x),
// non-negative BY CONSTRUCTION rather than by caller convention, and the
// divisor is a positive literal. That is what makes \`%\` safe -- if the abs()
// ever goes away, this needs a floored mod again.
fn edge_fold(x: f32) -> f32 {
    let t = abs(x) % 2.0;
    return sign(x) * (1.0 - abs(1.0 - t));
}

// What world_bounce returns. GLSL passed p and v as \`inout\`; WGSL has no
// inout, so the pair comes back as a struct. (A ptr<function, vec2f> parameter
// would also work, but a return struct reads better at the one call site.)
struct BounceResult {
    pos: vec2f,
    vel: vec2f,
}

// Reflect a position off the world bounds, flipping the velocity components
// that crossed. Position and velocity move together: reflecting the position
// without reversing the velocity would just re-trigger the bounce every frame,
// pinning the particle to the wall.
//
// THE ORDER BELOW IS LOAD-BEARING: the velocity flips are decided against the
// PRE-FOLD position, and only then is the position folded. Computing the folded
// position first and testing that would silently change the exact-boundary case.
fn world_bounce(p: vec2f, v: vec2f, canvas_res: vec2f) -> BounceResult {
    let extent = world_half_extent_from_res(canvas_res);
    var vel = v;
    if (abs(p.x) > extent.x) { vel.x = -vel.x; }
    if (abs(p.y) > extent.y) { vel.y = -vel.y; }
    let pos = vec2f(edge_fold(p.x / extent.x), edge_fold(p.y / extent.y)) * extent;
    return BounceResult(pos, vel);
}

// ---------------------------------------------------------------------------
// THE VIEW TRANSFORM -- world to screen, through camera and letterbox.
//
//     world  --/half_extent-->  canvas ndc
//            --(-pan, *zoom)->  view ndc
//            --*letterbox---->  screen ndc [-1,1]
//
// THREE INDEPENDENT ASPECT QUANTITIES, never conflate them:
//   canvas_res  simulation texture size; defines world space
//   window_res  framebuffer size in pixels; changes on resize
//   letterbox   derived fit of one into the other; never stored
//
// ZOOM: bigger = zoomed IN (a magnification factor). zoom=1 fits the world.
// PAN:  world units. pan is the world point at the center of the view.
// ---------------------------------------------------------------------------

// Scale fitting the canvas box into the window, preserving shape. The axis
// that would overflow shrinks; the other stays 1.0, and the slack is the
// letterbox bar. Fit, not fill: the whole canvas is always visible.
fn letterbox_scale(canvas_res: vec2f, window_res: vec2f) -> vec2f {
    if (window_res.x <= 0.0 || window_res.y <= 0.0) { return vec2f(1.0); }
    let canvas_aspect = canvas_res.x / canvas_res.y;
    let window_aspect = window_res.x / window_res.y;
    return select(
        vec2f(1.0, window_aspect / canvas_aspect),  // bars top/bottom
        vec2f(canvas_aspect / window_aspect, 1.0),  // bars left/right
        window_aspect > canvas_aspect);
}

fn world_to_screen_ndc(p: vec2f, canvas_res: vec2f, window_res: vec2f,
                       pan: vec2f, zoom: f32) -> vec2f {
    let ndc = world_to_ndc(p - pan, canvas_res) * zoom;
    return ndc * letterbox_scale(canvas_res, window_res);
}

fn screen_ndc_to_world(ndc: vec2f, canvas_res: vec2f, window_res: vec2f,
                       pan: vec2f, zoom: f32) -> vec2f {
    var v = ndc / letterbox_scale(canvas_res, window_res);
    if (zoom != 0.0) { v /= zoom; }
    return uv_to_world(v * 0.5 + 0.5, canvas_res) + pan;
}

// Screen ndc -> canvas uv, for the present pass sampling the canvas texture.
// Values outside [0,1] fall in the letterbox bars; the caller decides whether
// to clamp, wrap (tiling) or paint them black.
fn screen_ndc_to_canvas_uv(ndc: vec2f, canvas_res: vec2f, window_res: vec2f,
                           pan: vec2f, zoom: f32) -> vec2f {
    return world_to_uv(
        screen_ndc_to_world(ndc, canvas_res, window_res, pan, zoom),
        canvas_res);
}

// ==== end include: common.wgsl ====
// ==== begin include: rule.wgsl ====
// ============================================================================
// rule.wgsl -- how an entity's Rule is derived, and THE ONLY COPY of that.
//
// WHY THIS FILE EXISTS. Every shader that answers "what rule does cohort N of
// this config obey?" must answer it identically:
//
//   cohortRules.wgsl   derives it once per config slot, per upload, and bakes
//                      it into the config buffer. entityUpdate.wgsl and
//                      entityPick.wgsl read that baked rule; neither derives.
//   deriveRule.wgsl    derives it offline, to rebuild an adopted rule for the
//                      archive.
//
// On the desktop that question has THREE implementations: entity_update.glsl,
// entity_pick's caller, and particle_system/mutation.py -- a float32 host mirror
// that recomputes the rule so selection needs no GPU readback. The web port
// deletes the mirror (docs/WEB_PORT_PLAN.md Step 6) and derives on the GPU
// instead, precisely because a wrong adopted rule LOOKS LIKE A LEGITIMATE
// RESULT. Both callers share this file, so they cannot drift.
// ARCHITECTURE.md:715-718 records what happened the one time the desktop's
// copies did: selection adopted near-zero coefficients and the simulation
// appeared to die.
//
// WHY NOT common.wgsl. That file is included by camBrush.wgsl in a VERTEX
// stage, and its own rules 3 and 4 (common.wgsl:38-52) require it to
// hold pure, stage-agnostic code only. generate_random_centers is an 80-call
// hash loop that no vertex stage wants, and get_cohort below could not live
// there at all -- see its comment. This file is a SIBLING of the two shaders
// that include it; wgslInclude.ts resolves sibling-first (:125-141), so both
// find it with no build config.
//
// The include guard is per compilation unit (wgslInclude.ts:92-99), so the
// diamond entityUpdate -> {common, rule -> common} emits common.wgsl once.
// ============================================================================


//=========================================================================================
//------------------------------------RANDOM / HASH / NOISE--------------------------------
//====================================VVVVVVVVVVVVVVVVVVVVV================================

// pcg_hash, hash and hash4 MOVED TO \`shaders/hash.wgsl\`, and are included here
// rather than declared. They left because the sand modality's spawn brush needs
// the same generator and is not a sibling of this file -- including this one to
// reach \`hash\` would have dragged \`generate_random_centers\`, an 80-call hash
// loop, into a shader that wants three random numbers.
//
// Nothing about them changed in the move: the arithmetic is identical, so every
// rule derived before it is derived identically after. See that file's header.
// ==== begin include: hash.wgsl ====
// ============================================================================
// hash.wgsl -- the PCG hash family. THE ONLY COPY.
//
// WHY THIS FILE EXISTS. Three shaders now need the same random generator, and
// they sit in two different directories:
//
//   particleSystem/shaders/rule.wgsl  rule derivation (and through it,
//                                     entityUpdate and entityPick)
//   sand/shaders/spawn.wgsl           where a painted particle lands
//
// \`rule.wgsl\` held these and is a SIBLING of its two callers, which is what let
// them find it with no build config. The sand brushes are not siblings of it,
// and pulling the whole file in would drag \`generate_random_centers\` -- an
// 80-call hash loop -- into a shader that wants three random numbers. So the
// hash family moved here, to the shared directory every shader can reach, and
// \`rule.wgsl\` includes it like everyone else.
//
// WHY NOT common.wgsl. That file is included by vertex stages and its own rules
// 3 and 4 hold it to struct layout and coordinate math. A hash is neither, and
// keeping it out means a vertex shader that needs only the Entity layout does
// not also compile a hash it never calls.
//
// BIT-EXACTNESS IS THE POINT. The u32 multiplies wrap in WGSL exactly as they do
// in GLSL, so this is a verbatim translation of the desktop's. \`hash\` is chaotic
// by design: a 1-ULP difference in an input produces a COMPLETELY DIFFERENT
// output, which is why rule derivation had to move to the GPU rather than keep a
// JavaScript mirror. Do not "simplify" the arithmetic here.
//
// The include guard is per compilation unit, so the diamond
// entityUpdate -> {common, rule -> hash} emits each file once.
// ============================================================================

// PCG hash - bit-exact across all platforms.
fn pcg_hash(seed: u32) -> u32 {
    let state = seed * 747796405u + 2891336453u;
    let word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
    return (word >> 22u) ^ word;
}

// Two floats in, one pseudo-random float in [0,1) out.
//
// The inputs are BITCAST, not converted: the hash consumes the float's bit
// pattern, so two inputs that differ in the last mantissa bit are unrelated
// outputs. That is what makes \`hash(vec2f(f32(index), f32(frame)))\` a usable
// per-particle-per-frame draw.
fn hash(co: vec2f) -> f32 {
    let u_bits = vec2u(bitcast<u32>(co.x), bitcast<u32>(co.y));
    let h = pcg_hash(u_bits.x ^ pcg_hash(u_bits.y));
    return f32(h) / f32(0xffffffffu);
}

// Four decorrelated draws from one seed.
//
// Three implicit promotions in four lines on the GLSL side; the int literals
// became float literals here. Operand order is kept exactly, because the
// bitcast above makes \`co * -1.0 + 5.0\` and \`5.0 - co\` different seeds.
fn hash4(co: vec2f) -> vec4f {
    return vec4f(
        hash(co),
        hash(co * -1.0 + 5.0),
        hash(co.yx - 100.0),
        hash(co.yx * -1.0 + 25.0)
    );
}

// ==== end include: hash.wgsl ====

// Given a seed, return 10 random FourierCenters: enough for a Rule.
//
// DO NOT REWRITE \`pow(h, 2.0)\` AS \`h*h\`. \`freq_scale\` and \`frequency.x\` draw
// from the SAME hash lane (\`i*8+0\`), so frequency.x is \`(h*2-1) * (1+2*pow(h,2))\`.
// pow(h,2) and h*h differ by 1 ULP, and the chaotic hash amplifies that into a
// completely different rule -- measured on the desktop as seed 0.3088 vs 0.2605
// (see the comment at mutation.py:149, and entity_update.glsl:446-451).
//
// THIS IS NOW MORE LOAD-BEARING THAN IT WAS IN STEP 4, not less: the rule this
// produces is read back and adopted into the config when a user clicks a
// particle, so "simplifying" this line changes what selection gives you.
fn generate_random_centers(seed: f32) -> array<FourierCenter, 10> {
    var centers : array<FourierCenter, 10>;

    for (var i = 0; i < 10; i++) {
        // Generate frequency vectors
        // Bias towards lower frequencies for smoother base behaviors
        // Range: [-2, 2] with bias towards [-1, 1]
        let freq_scale = 1.0 + 2.0 * pow(hash(vec2f(seed, f32(i * 8 + 0))), 2.0);
        centers[i].frequency.x = (hash(vec2f(seed, f32(i * 8 + 0))) * 2.0 - 1.0) * freq_scale;
        centers[i].frequency.y = (hash(vec2f(seed, f32(i * 8 + 1))) * 2.0 - 1.0) * freq_scale;
        centers[i].frequency.z = (hash(vec2f(seed, f32(i * 8 + 2))) * 2.0 - 1.0) * freq_scale;
        centers[i].frequency.w = (hash(vec2f(seed, f32(i * 8 + 3))) * 2.0 - 1.0) * freq_scale;

        // Generate amplitude vectors
        // Range: [-1, 1]
        centers[i].amplitude.x = hash(vec2f(seed, f32(i * 8 + 4))) * 2.0 - 1.0;
        centers[i].amplitude.y = hash(vec2f(seed, f32(i * 8 + 5))) * 2.0 - 1.0;
        centers[i].amplitude.z = hash(vec2f(seed, f32(i * 8 + 6))) * 2.0 - 1.0;
        centers[i].amplitude.w = hash(vec2f(seed, f32(i * 8 + 7))) * 2.0 - 1.0;
    }

    return centers;
}

//=====================================^^^^^^^^^^^^^^^^^^==================================
//------------------------------------RANDOM / HASH / NOISE--------------------------------
//=========================================================================================

// Simply assigns each to a cohort based on its index.
// floor(get_cohort(index)) should be used for cohort equality tests.
//
// THE ENTITY COUNT IS A PARAMETER, and that is not a style choice. This file is
// included by two shaders that bind the entity array with DIFFERENT access
// qualifiers -- entityUpdate.wgsl as \`storage, read_write\`, entityPick.wgsl as
// \`storage, read\` -- so a function here may not name the binding at all.
// \`arrayLength(&entities)\` is therefore evaluated at the CALL SITE and handed
// in. (Reverting it to name the binding compiles in entityUpdate and fails only
// in entityPick, i.e. in a browser and not in \`npm test\`, so shaders.test.ts
// asserts it.)
//
// BOTH CALL SITES PASS arrayLength(&entities), never the host's entityCount
// uniform. The buffer is sized exactly entityCount * 32
// (particleSystem.ts:200-206) so the two are identical today -- but if that ever
// stopped being true, the physics and the picker must still divide by the SAME
// number or the rule the picker derives is not the rule the entity obeys.
fn get_cohort(index: u32, config: ConfigData, entity_count: u32) -> f32 {
    return f32(cfg_cohorts(config)) * f32(index) / f32(entity_count);
}

// Randomly change noise function parameters, scaled by parameter 'amount'.
// Each cohort gets a unique mutation for any given rule.
//
// GLSL took \`inout Rule\`; WGSL has no inout, so the mutated rule comes back as
// a return value and the call site assigns it.
//
// STABLE MODE (\`stable\`): the seed skips the hash of the rule and is the
// cohort seed alone. The usual seed hashes the rule's own coefficients, which
// is chaotic -- so a rule that is MOVING (the evolver blending between
// favorites) would draw a fresh twist every frame: flicker, not motion. With
// the hash left out, each cohort's twist is a fixed direction that holds while
// the rule moves. Only the evolver asks for it (see \`derive_entity_rule\`); for
// every saved state the branch below is not taken and the seed is computed
// exactly as before.
fn mutate_rule(current_rule: Rule, amount: f32, cohort: f32, stable: bool) -> Rule {
    var rule = current_rule;
    var rule_hash = 0.0;
    if (!stable) {
        rule_hash = hash(rule.centers[4].frequency.xy
                         + rule.centers[7].amplitude.yx
                         + rule.centers[1].frequency.zw);
    }
    let seed = rule_hash + cohort;

    for (var i = 0; i < 10; i++) {
        // Operand order kept as the GLSL writes it (\`-.5 + vec2(...)\`), since
        // reassociating a float add is not required to be value-preserving.
        let amp_mutation = amount * (-1.0 + 2.0 * hash4(-0.5 + vec2f(-f32(i) + seed, f32(i))));
        rule.centers[i].amplitude += amp_mutation;
        // FOUR DRAWS, one per component, like the amplitude above. The desktop
        // drew one scalar and scaled the whole vec4 by it, which only ever
        // stretched a frequency and never turned it. Factor range is
        // 1 +/- amount/2, double the old 1 +/- amount/4. \`.x\` is the old draw.
        let freq_mutation = amount * (hash4(vec2f(seed, f32(i))) - 0.5);
        rule.centers[i].frequency *= 1.0 + freq_mutation;
    }
    return rule;
}

// The rule an entity actually obeys: the generate-or-mutate branch, in one
// place. entity_update.glsl:439-460 on the desktop, mirrored there a THIRD time
// in mutation.py:208-236 -- which is exactly what Step 6 deletes.
//
// A GENERATED RULE IS NEVER MUTATED. It is already random, and the seed that
// produced it rerolls it wholesale, so Mutation Scale has nothing to add -- and
// letting it apply would mean that slider silently reshaping a rule the user
// never authored. \`entity_update\` therefore branches: generate *or* mutate,
// never both.
//
// On the desktop that also had a numerical reason: mutate_rule derives its own
// seed by HASHING the rule's coefficients, hash() is chaotic, and the GPU fuses
// a multiply-add in the generator that numpy cannot -- so mutating on top of a
// generated rule amplified a 1-ULP difference into a completely different rule,
// and the host mirror could not reproduce what the particle obeyed. THE WEB
// PORT HAS NO HOST MIRROR, so that argument does not apply here. The design
// reason above does, and it is sufficient on its own.
//
// GLSL's \`==\` on a vector is whole-vector equality returning a scalar bool;
// WGSL's is componentwise and returns vec4<bool>, hence all().
//
// A NEGATIVE MUTATION SEED MEANS STABLE MODE (see \`mutate_rule\`). Seeds are
// drawn from [0,1], so no saved state has one; the evolver writes -|seed| to
// ask for steady per-cohort twists while it blends the rule. The magnitude is
// what seeds both branches, so a non-negative seed behaves exactly as before.
fn derive_entity_rule(rule_in: Rule, cohort: f32, config: ConfigData) -> Rule {
    let raw_seed = cfg_mutation_seed(config);
    let stable = raw_seed < 0.0;
    let rule_seed = abs(raw_seed) + floor(cohort);

    // If a few arbitrary coefficients are exactly 0, then assume the rule is
    // all 0s (no target) and generate a random rule instead. Zeroing is how the
    // host asks for a new behaviour without reproducing this generator --
    // Randomize Behavior (\`B\`) does exactly that. See ARCHITECTURE.md
    // "Particle selection and history".
    if (all(rule_in.centers[0].frequency == vec4f(0.0))
        && all(rule_in.centers[5].amplitude == vec4f(0.0))) {
        return Rule(generate_random_centers(rule_seed));
    }

    // Each cohort gets a random mutation.
    var rule = mutate_rule(rule_in, cfg_mutation_scale(config), rule_seed, stable);

    // THE SECOND VOICE (evolver Orbit): a breath still fading out while the
    // next fades in. Layered on top of the first, its own seed, stable twists.
    // Scale 0 in every saved state, so this branch is never taken for them.
    let scale_2 = cfg_mutation_scale_2(config);
    if (scale_2 != 0.0) {
        rule = mutate_rule(rule, scale_2, abs(cfg_mutation_seed_2(config)) + floor(cohort), true);
    }
    return rule;
}

// ==== end include: rule.wgsl ====

@group(0) @binding(0) var<storage, read_write> configs : array<ConfigData>;

// Studio: slot i is cohort i. Sand: every slot is cohort 0 of its own config.
// Must match the same-named constant entityUpdate.wgsl is built with; both are
// set from one field in particleSystem.ts.
override CONFIG_PER_COHORT: bool = false;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3u) {
    let slot = gid.x;
    if (slot >= arrayLength(&configs)) { return; }
    let cohort = select(0.0, f32(slot), CONFIG_PER_COHORT);
    let config = configs[slot];
    configs[slot].rule = derive_entity_rule(config.rule, cohort, config);
}
`,Vs="rg16float";class oi{device;canvasSize;entityCount;sqrtWorldSize;physicsSteps;_frameCount=0;get frameCount(){return this._frameCount}configs;world;perCohort;slotCount=0;rulesDirty=!1;entityBuffer;configBuffer;splatBuffer;freeListBuffer;headStaging;headPhase="idle";freeListHead;highWaterMark;lifetimes;front;back;repeatSampler;clampSampler;dummyTexture;dummyTextureView;strafeFieldView;strafeFieldSize=[1,1];strafeFieldBound=!1;fieldStrengths=il;cameraFieldView;cameraStrengths=jn;entityUpdateUniforms;canvasUniforms;uniformSlots;entityUpdateStride;canvasStride;computePipeline=null;canvasPipeline=null;pickReducePipeline=null;pickDerivePipeline=null;cohortRulesPipeline=null;computeStateGroup=null;canvasUniformGroup=null;pickGroup=null;cohortRulesGroup=null;computeStateLayout=null;canvasUniformLayout=null;pickLayout=null;cohortRulesLayout=null;computeTextureLayout=null;canvasTextureLayout=null;pickResult;pickStaging;pickUniforms;pickPhase="idle";pickRadius=0;pickGeneration=0;computeTextureGroups=[];canvasTextureGroups=[];frontIsA=!0;canvasA;canvasB;constructor(e){this.device=e.device,this.canvasSize=e.canvasSize??Ya(),this.entityCount=e.entityCount??Bo,this.sqrtWorldSize=e.sqrtWorldSize??Math.sqrt(this.entityCount/ja),this.physicsSteps=e.physicsSteps??30,this.configs=[e.config],this.world=e.world,this.perCohort=!(e.lifetimes??!1);const t=this.device;this.entityBuffer=t.createBuffer({label:"EntityBuffer",size:this.entityCount*Ct,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC}),this.configBuffer=t.createBuffer({label:"ConfigBuffer",size:Gs(this.configs).byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),this.splatBuffer=t.createBuffer({label:"splat-accumulator",size:this.canvasSize[0]*this.canvasSize[1]*8,usage:GPUBufferUsage.STORAGE}),this.lifetimes=e.lifetimes??!1,this.freeListBuffer=t.createBuffer({label:this.lifetimes?"FreeList":"FreeList (dummy)",size:dn(this.lifetimes?this.entityCount:0),usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC}),this.freeListHead=this.lifetimes?this.entityCount:0,this.highWaterMark=this.lifetimes?0:this.entityCount,this.headStaging=t.createBuffer({label:"free-list-head-staging",size:4,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});const s=r=>{const o=t.createTexture({label:r,size:{width:this.canvasSize[0],height:this.canvasSize[1]},format:Vs,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.COPY_SRC|GPUTextureUsage.COPY_DST});return{texture:o,view:o.createView()}};this.canvasA=s("canvas-a"),this.canvasB=s("canvas-b"),this.front=this.canvasA,this.back=this.canvasB;const a={magFilter:"linear",minFilter:"linear"};this.repeatSampler=t.createSampler({label:"canvas-repeat",addressModeU:"repeat",addressModeV:"repeat",...a}),this.clampSampler=t.createSampler({label:"canvas-clamp",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge",...a}),this.dummyTexture=t.createTexture({label:"strafe-field-placeholder",size:{width:1,height:1},format:zt,usage:GPUTextureUsage.TEXTURE_BINDING}),this.dummyTextureView=this.dummyTexture.createView(),this.strafeFieldView=this.dummyTextureView,this.cameraFieldView=this.dummyTextureView;const i=t.limits.minUniformBufferOffsetAlignment;this.entityUpdateStride=Vt(Ln,i),this.canvasStride=Vt(On,i),this.uniformSlots=Math.max(1,Math.trunc(this.physicsSteps)),this.entityUpdateUniforms=this.makeUniformBuffer("entity-update-uniforms",this.entityUpdateStride),this.canvasUniforms=this.makeUniformBuffer("canvas-uniforms",this.canvasStride),this.pickResult=t.createBuffer({label:"PickResultBuffer",size:ke,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC}),this.pickStaging=t.createBuffer({label:"PickStagingBuffer",size:ke,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.pickUniforms=t.createBuffer({label:"pick-uniforms",size:Za,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.uploadConfigs()}static async create(e){const t=new oi(e);return await t.reload(),t}async reload(){const e=this.device,[t,s,a,i]=await Promise.all([$(e,"entityUpdate.wgsl",Nl),$(e,"canvas.wgsl",Pl),$(e,"entityPick.wgsl",kl),$(e,"cohortRules.wgsl",Dl)]),r={CONFIG_PER_COHORT:this.perCohort?1:0},o=e.createBindGroupLayout({label:"entity-update-state",entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:"read-only-storage"}},{binding:2,visibility:GPUShaderStage.COMPUTE,buffer:{type:"uniform",hasDynamicOffset:!0}},{binding:3,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:4,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}}]}),c=e.createBindGroupLayout({label:"entity-update-textures",entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,texture:{}},{binding:1,visibility:GPUShaderStage.COMPUTE,sampler:{}},{binding:2,visibility:GPUShaderStage.COMPUTE,texture:{}},{binding:3,visibility:GPUShaderStage.COMPUTE,sampler:{}},{binding:4,visibility:GPUShaderStage.COMPUTE,texture:{}}]});t!==null&&(this.computePipeline=e.createComputePipeline({label:"entity-update",layout:e.createPipelineLayout({bindGroupLayouts:[o,c]}),compute:{module:t,entryPoint:"main",constants:r}}),this.computeStateLayout=o);const l=e.createBindGroupLayout({label:"canvas-uniforms",entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,buffer:{type:"uniform",hasDynamicOffset:!0}},{binding:1,visibility:GPUShaderStage.FRAGMENT,buffer:{type:"storage"}}]}),d=e.createBindGroupLayout({label:"canvas-textures",entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:1,visibility:GPUShaderStage.FRAGMENT,sampler:{}}]});s!==null&&(this.canvasPipeline=e.createRenderPipeline({label:"canvas-update",layout:e.createPipelineLayout({bindGroupLayouts:[l,d]}),vertex:{module:s,entryPoint:"vs_main"},fragment:{module:s,entryPoint:"fs_main",targets:[{format:Vs}]},primitive:{topology:"triangle-strip"}}),this.canvasUniformLayout=l);const h=e.createBindGroupLayout({label:"entity-pick",entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:"read-only-storage"}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:"read-only-storage"}},{binding:2,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:3,visibility:GPUShaderStage.COMPUTE,buffer:{type:"uniform"}}]});if(a!==null){const w=e.createPipelineLayout({bindGroupLayouts:[h]});this.pickReducePipeline=e.createComputePipeline({label:"entity-pick-reduce",layout:w,compute:{module:a,entryPoint:"reduce",constants:r}}),this.pickDerivePipeline=e.createComputePipeline({label:"entity-pick-derive",layout:w,compute:{module:a,entryPoint:"derive",constants:r}}),this.pickLayout=h}const u=e.createBindGroupLayout({label:"cohort-rules",entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}}]});i!==null&&(this.cohortRulesPipeline=e.createComputePipeline({label:"cohort-rules",layout:e.createPipelineLayout({bindGroupLayouts:[u]}),compute:{module:i,entryPoint:"main",constants:r}}),this.cohortRulesLayout=u),this.computeTextureLayout=c,this.canvasTextureLayout=d,this.buildStateGroups(),this.buildTextureGroups()}setStrafeField(e,t){this.strafeFieldView=e,this.strafeFieldSize=t,this.strafeFieldBound=!0,this.buildTextureGroups()}setFieldStrengths(e){this.fieldStrengths=e}setCameraField(e){this.cameraFieldView=e,this.buildTextureGroups()}setCameraStrengths(e){this.cameraStrengths=e}buildStateGroups(){const e=this.device;this.computeStateLayout!==null&&(this.computeStateGroup=e.createBindGroup({label:"entity-update-state",layout:this.computeStateLayout,entries:[{binding:0,resource:{buffer:this.entityBuffer}},{binding:1,resource:{buffer:this.configBuffer}},{binding:2,resource:{buffer:this.entityUpdateUniforms,size:Ln}},{binding:3,resource:{buffer:this.freeListBuffer}},{binding:4,resource:{buffer:this.splatBuffer}}]})),this.canvasUniformLayout!==null&&(this.canvasUniformGroup=e.createBindGroup({label:"canvas-uniforms",layout:this.canvasUniformLayout,entries:[{binding:0,resource:{buffer:this.canvasUniforms,size:On}},{binding:1,resource:{buffer:this.splatBuffer}}]})),this.pickLayout!==null&&(this.pickGroup=e.createBindGroup({label:"entity-pick",layout:this.pickLayout,entries:[{binding:0,resource:{buffer:this.entityBuffer}},{binding:1,resource:{buffer:this.configBuffer}},{binding:2,resource:{buffer:this.pickResult}},{binding:3,resource:{buffer:this.pickUniforms}}]})),this.cohortRulesLayout!==null&&(this.cohortRulesGroup=e.createBindGroup({label:"cohort-rules",layout:this.cohortRulesLayout,entries:[{binding:0,resource:{buffer:this.configBuffer}}]}))}buildTextureGroups(){const e=this.device,t=[this.clampSampler,this.repeatSampler],s=[this.canvasA,this.canvasB];if(this.computeTextureLayout!==null){const a=this.computeTextureLayout;this.computeTextureGroups=t.map(i=>s.map(r=>e.createBindGroup({layout:a,entries:[{binding:0,resource:r.view},{binding:1,resource:i},{binding:2,resource:this.strafeFieldView},{binding:3,resource:i},{binding:4,resource:this.cameraFieldView}]})))}if(this.canvasTextureLayout!==null){const a=this.canvasTextureLayout;this.canvasTextureGroups=t.map(i=>s.map(r=>e.createBindGroup({layout:a,entries:[{binding:0,resource:r.view},{binding:1,resource:i}]})))}}textureGroupIndex(){return[this.world.boundaryConditions===Ne.WRAP?1:0,this.frontIsA?0:1]}uploadConfigs(){const e=Zr(this.configs,this.perCohort),t=Gs(e);this.slotCount=e.length,t.byteLength!==this.configBuffer.size&&(this.configBuffer.destroy(),this.configBuffer=this.device.createBuffer({label:"ConfigBuffer",size:t.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),this.buildStateGroups()),this.device.queue.writeBuffer(this.configBuffer,0,t),this.rulesDirty=!0}recordRuleBake(e){if(!this.rulesDirty||this.cohortRulesPipeline===null||this.cohortRulesGroup===null)return;const t=e.beginComputePass({label:"cohort-rules",timestampWrites:re("cohort-rules")});t.setPipeline(this.cohortRulesPipeline),t.setBindGroup(0,this.cohortRulesGroup),t.dispatchWorkgroups(Math.ceil(this.slotCount/64)),t.end(),this.rulesDirty=!1}worldConfig(){return Xr(this.world,this.sqrtWorldSize,this.slotCount)}applyProject(e,t){this.configs=e,this.world=t,this.uploadConfigs()}reset(){this._frameCount=0}resetLifetimes(){if(!this.lifetimes)return;const e=this.device.queue;e.writeBuffer(this.freeListBuffer,0,Sl(this.entityCount)),e.writeBuffer(this.entityBuffer,0,Al(this.entityCount)),this.highWaterMark=0}freeListBufferForSand(){return this.freeListBuffer}async migrateEntitiesTo(e){if(!this.lifetimes||!e.lifetimes)return;const t=Ct,s=this.device.createBuffer({label:"entity-migration-staging",size:this.entityCount*t,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});try{const a=this.device.createCommandEncoder({label:"entity-migration"});a.copyBufferToBuffer(this.entityBuffer,0,s,0,s.size),this.device.queue.submit([a.finish()]),await s.mapAsync(GPUMapMode.READ);const i=new Uint8Array(s.getMappedRange()),r=new Int32Array(i.buffer,i.byteOffset,i.byteLength/4),o=new Uint8Array(e.entityCount*t);let c=0;for(let d=0;d<this.entityCount&&c<e.entityCount;d++)r[d*8+5]<0||(o.set(i.subarray(d*t,(d+1)*t),c*t),c++);s.unmap();const l=new Int32Array(o.buffer,o.byteOffset,o.byteLength/4);for(let d=c;d<e.entityCount;d++)l[d*8+5]=ri;e.device.queue.writeBuffer(e.entityBuffer,0,o),e.device.queue.writeBuffer(e.freeListBuffer,0,Bs(e.entityCount,c)),e.freeListHead=e.entityCount-c,e.highWaterMark=c}finally{s.destroy()}}recordFreeListRead(e){this.lifetimes&&this.headPhase==="idle"&&(e.copyBufferToBuffer(this.freeListBuffer,0,this.headStaging,0,4),this.headPhase="recorded")}pollFreeListRead(){this.headPhase==="recorded"&&(this.headPhase="mapping",this.headStaging.mapAsync(GPUMapMode.READ).then(()=>{const e=new Uint32Array(this.headStaging.getMappedRange().slice(0))[0];this.headStaging.unmap(),e!==void 0&&e<=this.entityCount&&(this.freeListHead=e),this.headPhase="idle"},()=>{this.headPhase="idle"}))}get availableSlots(){return this.freeListHead}get activeEntityCount(){return this.highWaterMark}restoreHighWaterMark(e){this.lifetimes&&(this.highWaterMark=Math.max(0,Math.min(this.entityCount,Math.trunc(e))))}noteSpawned(e){!this.lifetimes||e<=0||(this.highWaterMark=Math.min(this.entityCount,this.highWaterMark+e))}noteSpawnReach(e){if(!this.lifetimes)return!1;const t=Ll(this.highWaterMark,e,this.entityCount);return t===this.highWaterMark?!1:(this.highWaterMark=t,!0)}noteCompactedMark(e,t){if(!this.lifetimes||t>0)return!1;const s=Math.max(0,Math.min(this.entityCount,Math.trunc(e)));return s>=this.highWaterMark?!1:(this.highWaterMark=s,this.freeListHead=this.entityCount-s,!0)}dropMarkIfEmpty(e){return!this.lifetimes||this.highWaterMark===0||!Il(this.freeListHead,this.entityCount,e)?!1:(this.highWaterMark=0,!0)}rebuildFreeListAbove(e){if(!this.lifetimes)return;const t=Math.max(0,Math.min(this.entityCount,Math.trunc(e)));this.device.queue.writeBuffer(this.freeListBuffer,0,Bs(this.entityCount,t)),this.freeListHead=this.entityCount-t}async packMarkTo(e,t=()=>!0){if(!this.lifetimes)return this.highWaterMark;const s=Math.max(0,Math.min(this.entityCount,Math.trunc(e))),a=this.highWaterMark;if(s>=a)return a;const i=Ct,r=(a-s)*i,o=this.device.createBuffer({label:"compact-confirm-staging",size:r,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});let c=s;try{const l=this.device.createCommandEncoder({label:"compact-confirm"});l.copyBufferToBuffer(this.entityBuffer,s*i,o,0,r),this.device.queue.submit([l.finish()]),await o.mapAsync(GPUMapMode.READ);const d=new Uint8Array(o.getMappedRange()),h=new Int32Array(d.buffer,d.byteOffset,d.byteLength/4);for(let u=a-s-1;u>=0;u--)if(h[u*8+5]>=0){c=s+u+1;break}o.unmap()}catch{return a}finally{o.destroy()}return t()?(this.highWaterMark=c,this.rebuildFreeListAbove(c),c):-1}async auditPoolNow(){const e=this.entityCount;if(!this.lifetimes)return Fs({liveFlags:new Array(e).fill(!0),poolSlots:[],mark:e,capacity:e});const t=Ct,s=this.device.createBuffer({label:"pool-audit-entities",size:e*t,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ}),a=this.device.createBuffer({label:"pool-audit-freelist",size:dn(e),usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});try{const i=this.device.createCommandEncoder({label:"pool-audit"});i.copyBufferToBuffer(this.entityBuffer,0,s,0,e*t),i.copyBufferToBuffer(this.freeListBuffer,0,a,0,a.size),this.device.queue.submit([i.finish()]),await Promise.all([s.mapAsync(GPUMapMode.READ),a.mapAsync(GPUMapMode.READ)]);const r=new Uint8Array(s.getMappedRange()),o=new Int32Array(r.buffer,r.byteOffset,r.byteLength/4),c=new Array(e);for(let w=0;w<e;w++)c[w]=o[w*8+5]>=0;s.unmap();const l=new Uint32Array(a.getMappedRange().slice(0));a.unmap();const d=l[0]??0,h=Math.min(d,l.length-1),u=Array.from(l.slice(1,1+h));return Fs({liveFlags:c,poolSlots:u,mark:this.highWaterMark,capacity:e,cachedHead:this.freeListHead})}finally{s.destroy(),a.destroy()}}async sortFreeListNow(){if(!this.lifetimes)return 0;const e=dn(this.entityCount),t=this.device.createBuffer({label:"freelist-sort-staging",size:e,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});try{const s=this.device.createCommandEncoder({label:"freelist-sort-read"});s.copyBufferToBuffer(this.freeListBuffer,0,t,0,e),this.device.queue.submit([s.finish()]),await t.mapAsync(GPUMapMode.READ);const a=new Uint32Array(t.getMappedRange().slice(0));t.unmap();const i=Rl(a);return this.device.queue.writeBuffer(this.freeListBuffer,0,i),i[0]??0}finally{t.destroy()}}entityBufferForSand(){return this.entityBuffer}setFrameCount(e){this._frameCount=Math.max(0,Math.trunc(e))}currentCanvasTexture(){return this.front.view}currentCanvasTextureObject(){return this.front.texture}entityBufferForReadback(){return this.entityBuffer}entityBufferForRendering(){return this.entityBuffer}requestPick(e,t,s=-1){if(this.pickReducePipeline===null||this.pickGroup===null)return;if(this.pickGeneration++,this.pickPhase==="ready")this.pickStaging.unmap(),this.pickPhase="idle";else if(this.pickPhase==="mapping")return;const a=this.device.queue;a.writeBuffer(this.pickResult,0,new Uint32Array([Xa])),a.writeBuffer(this.pickUniforms,0,ll(this.worldConfig(),e,t,s)),this.pickRadius=t,this.pickPhase="dispatched"}recordPick(e){if(this.pickPhase!=="dispatched"||(this.recordRuleBake(e),this.pickReducePipeline===null||this.pickDerivePipeline===null)||this.pickGroup===null)return;const t=e.beginComputePass({label:"entity-pick-reduce"});t.setPipeline(this.pickReducePipeline),t.setBindGroup(0,this.pickGroup),t.dispatchWorkgroups(zs(this.entityCount)),t.end();const s=e.beginComputePass({label:"entity-pick-derive"});s.setPipeline(this.pickDerivePipeline),s.setBindGroup(0,this.pickGroup),s.dispatchWorkgroups(1),s.end(),e.copyBufferToBuffer(this.pickResult,0,this.pickStaging,0,ke),this.pickPhase="recorded"}beginPickReadback(){if(this.pickPhase!=="recorded")return;const e=this.pickGeneration;this.pickPhase="mapping",this.pickStaging.mapAsync(GPUMapMode.READ).then(()=>{if(e!==this.pickGeneration){this.pickStaging.unmap(),this.pickPhase="idle";return}this.pickPhase="ready"},()=>{this.pickPhase="idle"})}retrievePick(){if(this.pickPhase!=="ready")return null;const e=this.pickStaging.getMappedRange().slice(0);return this.pickStaging.unmap(),this.pickPhase="idle",al(e,this.pickRadius)}get pickPending(){return this.pickPhase!=="idle"}runFrame(e,t=null,s){const a=Math.max(1,Math.trunc(this.physicsSteps));this.ensureUniformCapacity(a);const i=this.worldConfig(),r=this.canvasSize,o=new Uint8Array(this.entityUpdateStride*a),c=new Uint8Array(this.canvasStride*a);for(let d=0;d<a;d++){const h=this._frameCount+d;o.set(new Uint8Array(rl(i,r,this.strafeFieldSize,h,t,this.strafeFieldBound,this.fieldStrengths,this.cameraStrengths)),d*this.entityUpdateStride),c.set(new Uint8Array(ol(i,h)),d*this.canvasStride)}const l=this.device.queue;l.writeBuffer(this.entityUpdateUniforms,0,o),l.writeBuffer(this.canvasUniforms,0,c),this.recordRuleBake(e);for(let d=0;d<a;d++)this.advance(e,d),s?.(e,d);this._frameCount+=a}makeUniformBuffer(e,t){return this.device.createBuffer({label:e,size:t*this.uniformSlots,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST})}ensureUniformCapacity(e){e<=this.uniformSlots||(this.entityUpdateUniforms.destroy(),this.canvasUniforms.destroy(),this.uniformSlots=e,this.entityUpdateUniforms=this.makeUniformBuffer("entity-update-uniforms",this.entityUpdateStride),this.canvasUniforms=this.makeUniformBuffer("canvas-uniforms",this.canvasStride),this.buildStateGroups())}advance(e,t){this.updateEntities(e,t),this.updateCanvas(e,t)}updateEntities(e,t){if(this.computePipeline===null||this.computeStateGroup===null)return;const[s,a]=this.textureGroupIndex(),i=this.computeTextureGroups[s]?.[a];if(i===void 0)return;const r=e.beginComputePass({label:"entity-update",timestampWrites:re("entity-update")});r.setPipeline(this.computePipeline),r.setBindGroup(0,this.computeStateGroup,[t*this.entityUpdateStride]),r.setBindGroup(1,i),r.dispatchWorkgroups(zs(this.activeEntityCount)),r.end()}updateCanvas(e,t){if(this.canvasPipeline===null||this.canvasUniformGroup===null)return;const[s,a]=this.textureGroupIndex(),i=this.canvasTextureGroups[s]?.[a];if(i===void 0)return;const r=e.beginRenderPass({label:"canvas-update",timestampWrites:re("canvas-update"),colorAttachments:[{view:this.back.view,clearValue:{r:0,g:0,b:0,a:0},loadOp:"clear",storeOp:"store"}]});r.setPipeline(this.canvasPipeline),r.setBindGroup(0,this.canvasUniformGroup,[t*this.canvasStride]),r.setBindGroup(1,i),r.draw(4),r.end();const o=this.front;this.front=this.back,this.back=o,this.frontIsA=!this.frontIsA}destroy(){this.pickGeneration++,this.pickPhase="idle",this.pickStaging.unmap(),this.entityBuffer.destroy(),this.configBuffer.destroy(),this.canvasA.texture.destroy(),this.canvasB.texture.destroy(),this.entityUpdateUniforms.destroy(),this.canvasUniforms.destroy(),this.splatBuffer.destroy(),this.pickResult.destroy(),this.pickStaging.destroy(),this.pickUniforms.destroy(),this.dummyTexture.destroy(),this.freeListBuffer.destroy(),this.headPhase="idle",this.headStaging.destroy()}pipelineStatus(){return{entityUpdate:this.computePipeline!==null,canvas:this.canvasPipeline!==null,entityPickReduce:this.pickReducePipeline!==null,entityPickDerive:this.pickDerivePipeline!==null}}}const Ul=["walls","trails"],Ml={walls:3,trails:12},Gl={walls:0,trails:1},Bl=["diverge","converge","stroke","fixed"],Fl=Object.fromEntries(Bl.map((n,e)=>[n,e])),tm=1,li=64;function zl(n,e,t,s,a){const i=new ArrayBuffer(li),r=new Float32Array(i),o=new Int32Array(i);return r[0]=n[0],r[1]=n[1],r[4]=e[0],r[5]=e[1],r[6]=t[0],r[7]=t[1],r[8]=s.drawSize,r[9]=s.drawPower,o[10]=a?1:0,o[11]=Fl[s.mode],o[12]=Gl[s.layer],r[13]=s.drawAngle,r[14]=s.lineGain,i}const Vl=`// ============================================================================
// strafeDraw.wgsl -- the Strafe Field's airbrush pass.
//
// The WGSL translation of \`strafe_field/shaders/strafe_draw.frag\` (98 lines),
// plus \`shared/shaders/fullscreen_quad.vert\` (9), folded in here for the V FLIP
// described below.
//
// Runs once per RENDERED frame, never per physics sub-step: paint rate must not
// scale with the physics rate, or raising it would silently make the brush 30x
// stronger. The cadence is enforced by WHERE this is called from -- the
// Orchestrator's frame loop, above \`runFrame\` -- not by anything here.
//
// The field texture is never READ by this pass; each fragment writes only its
// own texel. That is what makes it safe to render in place with no ping-pong,
// unlike the canvas, which diffuses and must double-buffer.
//
// ----------------------------------------------------------------------------
// THE V FLIP, AND WHY THIS FILE DOES NOT USE fullscreenQuad.wgsl
// ----------------------------------------------------------------------------
// This pass RASTERIZES INTO a texture that \`entityUpdate.wgsl\` later SAMPLES
// through \`world_to_uv_bc\` (:184-188) -- the same Y-up mapping \`get_can\` uses to
// read the canvas. So the field falls on the same side of the port's rule as
// \`canvas.wgsl\` (and the brush pass that once rasterized splats into the canvas):
//
//     Rasterizing INTO the canvas -> flip.  Sampling it TO the screen -> no flip.
//
// \`fullscreenQuad.wgsl\`'s header (:12-18) excludes exactly this case, and its
// comment at :59 names \`frameAssembly.wgsl\` READING the strafe field as one of
// the two externally-observable no-flip sites. Reading, not writing. Both
// consumers agree the field is stored top-left-origin, same as the canvas.
//
// WITHOUT THE FLIP THE PICTURE IS NOT UPSIDE DOWN. Strokes would deflect
// particles in the MIRRORED direction, while the field overlay -- which samples
// with the same unflipped canvas uv the mouse produced -- draws the stroke
// exactly where you painted it. THE OVERLAY WOULD CONFIRM THE WRONG THING,
// which makes this worse than the canvas flips it mirrors: there, at least,
// nothing agreed with the bug.
// ============================================================================

// ==== begin include: common.wgsl ====
// ============================================================================
// common.wgsl -- shared struct definitions and coordinate math.
//
// THIS FILE IS THE SINGLE SOURCE OF TRUTH FOR GPU STRUCT LAYOUT. What the
// structs below declare is what the GPU reads.
//
// The layout is stated in ONE OTHER PLACE: \`src/particleSystem/layout.fixture.json\`,
// which is what the host packs against (\`pack.ts\`, guarded by \`assertLaneMap\`).
// Two hand-authored statements of one fact, so \`common.wgsl.test.ts\` checks the
// declarations below against that descriptor on every \`npm test\`. It is the
// shader-side counterpart of \`assertLaneMap\`; together they close the loop.
//
// If that test fails, the two have diverged and the GPU is reinterpreting memory
// the host packed to a different plan -- which does not crash, it just makes the
// simulation subtly wrong. CHANGE BOTH FILES IN THE SAME COMMIT.
//
// (The descriptor was originally generated by the Python desktop app's
// layout.py, which parsed the GLSL original of this file. That app is gone;
// there is no generator now and deliberately no replacement -- see layout.ts.)
//
// RULES FOR EDITING THIS FILE:
//
//  1. vec4-ONLY. Every member of every struct must be a vec4f, a fixed-size
//     array of vec4f, or another struct that obeys this rule. No bare f32,
//     no i32, no vec2f/vec3f. Scalars ride in vec4 lanes; ints ride in float
//     lanes via bitcast.
//
//     Why: std430 (GLSL) and WGSL do NOT agree on how to lay out structs with
//     mixed scalar types. An all-vec4 struct is 16-byte aligned with an
//     unambiguous stride in both, so this codebase translates between them
//     without a layout audit. Both layout.py and common.wgsl.test.ts enforce
//     this and will fail on anything else.
//
//  2. ADD A FIELD BY CLAIMING A RESERVED LANE, not by appending a scalar.
//     When the reserved lanes run out, add a whole new vec4.
//
//  3. NO uniforms and NO buffer/binding declarations in this file -- types and
//     pure functions only. Bindings belong to the shader that owns them.
//     (Binding assignments are recorded in the table below for coordination.)
//
//     This rule is MORE load-bearing on the web than on the desktop. GLSL
//     drivers strip unused uniforms and moderngl's tryset() tolerates the
//     result; WebGPU validates against an explicit bind group layout, so a
//     uniform declared here but unused by an including shader is a hard
//     pipeline-creation error rather than a warning.
//
//  4. NO \`#version\` line here (WGSL has none) and no entry points. This file is
//     included into compute, vertex AND fragment modules, so it must stay
//     stage-agnostic: no texture sampling, no discard, no derivatives
//     (fwidth/dpdx). It currently has none of those -- keep it that way.
//
// SSBO BINDING ASSIGNMENTS (project-wide, keep in sync):
//     binding = 0   EntityBuffer
//     binding = 1   ConfigBuffer
// ============================================================================

const PI: f32 = 3.1415926;

// \`STRAFE_FIELD_GAIN\` USED TO LIVE HERE, at 0.01, as the fixed rate at which the
// painted field displaced a particle. It is now a UNIFORM, because the Walls
// Field Strength preference multiplies it -- so the host owns the number
// (\`FIELD_STRENGTH_GAIN\` in \`prefs/preferences.ts\`) and packs \`strength * 0.01\`
// into the entity update's uniform.
//
// Moved rather than kept alongside the slider: two multipliers, one here and one
// host-side, is exactly the "second multiplier for the user to get lost between"
// that the original comment ruled out. At the default strength of 1.0 the product
// is 0.01 and every painted field behaves precisely as it did before.

// ---------------------------------------------------------------------------
// CANVAS VALUE SCALE -- the canvas is RG16F (see CANVAS_DTYPE in
// particle_system.py), and fp16's usable range starts at ~6.1e-5. At high
// Trail Persistence the splat premultiply (1-P)/P shrinks each deposit to
// ~1e-6, which is SUBNORMAL in fp16: blend units flush it and trails starve
// (measured: 40x dimmer at P=0.999). All stored canvas values therefore ride
// 512x above their physical meaning: the splat multiplies by this, every READER
// divides by it. canvas decay/diffuse is linear and scale-invariant, so it
// neither knows nor cares.
//
// 512 is chosen with both ends in view: it lifts a slow particle's deposit at
// P = 0.999 (~3.6e-6) to ~1.8e-3 -- comfortably normal -- while the largest
// legitimate single splat (fast particle at the P clamp floor) stays around
// 1e4, under fp16's 65504 ceiling. Readers: get_can() in entity_update,
// camera. Writers: the trail deposit (entityUpdate.wgsl \`deposit\`, drained
// into the canvas by canvas.wgsl).
const CANVAS_VALUE_SCALE: f32 = 512.0;

// THE SPLAT ACCUMULATOR'S FIXED POINT. WGSL atomics are integer-only, so each
// deposit rides in an i32 at this many counts per (already scaled) canvas unit.
//
// 2^14 matches fp16 at both ends. One count is 2^-14, fp16's smallest normal,
// so the accumulator resolves exactly the deposits a blended fp16 splat could;
// and +-2^31 counts span +-2^17, twice fp16's 65504 ceiling, so a pile-up
// saturates in the canvas pass's CANVAS_VALUE_MAX clamp before it can wrap.
// The deposit range this has to hold is CANVAS_VALUE_SCALE's, above.
const SPLAT_FIXED_SCALE: f32 = 16384.0;

// Saturation ceiling for stored (scaled) canvas values, applied by the canvas
// pass on every write. NEEDED BECAUSE OF fp16: a texel pushed past 65504 rounds
// to inf, and inf survives decay forever (inf * P == inf) -- one extreme splat
// pile-up would permanently poison the texel and NaN any particle that senses
// it. Saturating below the ceiling lets even an absurd pile-up decay back down.
// fp32 never needed this; do not remove it while the canvas is fp16.
const CANVAS_VALUE_MAX: f32 = 60000.0;

// Trail Persistence's legal range inside the shaders. The FLOOR is well below
// the slider (0.5..0.999) and below every known config (observed min 0.312);
// it exists for typed-in extremes. It was 1e-4, but (1-P)/P at 1e-4 is ~1e4,
// which times CANVAS_VALUE_SCALE would overflow fp16 on a single splat --
// 1e-2 caps the premultiply at ~99 and costs nothing anyone uses.
// The deposit and the canvas pass MUST clamp with the same bounds, or the
// splat premultiply and the decay would disagree about what P means.
const TRAIL_PERSISTENCE_MIN: f32 = 1e-2;
const TRAIL_PERSISTENCE_MAX: f32 = 0.999;

// ---------------------------------------------------------------------------
// MODE ENUMS -- the single definition. ui/settings_spec.py mirrors these BY
// VALUE in its DROPDOWN_MODES tuples, so the order of the options there is the
// order here. Change one, change both.
// ---------------------------------------------------------------------------

// What happens when a particle reaches the edge of the world. A WorldData
// setting: the trail field follows the same rule, so it cannot vary per config.
const BC_BOUNCE: i32 = 0;
const BC_WRAP: i32 = 1;
const BC_RESET: i32 = 2;
// Leaving the world KILLS the particle rather than respawning it: it is marked
// dead and its index pushed onto the free list. The sand modality's default,
// and the worked example of the sinks system -- BC_RESET's sibling, differing
// only in what happens to the particle that crossed.
//
// ADDED AS A FOURTH VALUE rather than by redefining BC_RESET, so the studio's
// three modes keep their exact meanings. A config that has never heard of this
// mode cannot select it, and nothing in the studio writes a 3.
const BC_KILL: i32 = 3;

// How particles are placed on reset. A ConfigData setting: different
// populations can seed differently.
const IC_GRID: i32 = 0;
const IC_RANDOM: i32 = 1;
// No shader compares against IC_CENTER -- it is the fall-through \`else\` branch
// of initial_position() in entity_update. It stays defined because it is a real
// mode, mirrored by value in ui/settings_spec.py's dropdown. Do not drop it as
// dead code.
const IC_CENTER: i32 = 2;
const IC_RING: i32 = 3;

// ---------------------------------------------------------------------------
// Rule -- the Fourier Feature Network coefficients that define particle behavior
// ---------------------------------------------------------------------------

// 4D input -> 4D output basis element.
struct FourierCenter {
    frequency: vec4f,
    amplitude: vec4f,
}

// 10 FourierCenters makes a Rule. 320 bytes, all vec4.
//
// This is the only array in the layout, and it is the case that usually bites:
// std430's array-of-struct stride here is 32 bytes, and WGSL's
// array<FourierCenter,10> stride is also 32 (alignment 16, size 32 -- already a
// multiple). No stride divergence. common.wgsl.test.ts asserts it rather than
// trusting this comment.
struct Rule {
    centers: array<FourierCenter, 10>,
}

// ---------------------------------------------------------------------------
// ConfigData -- everything a particle needs to know about how to behave.
//
// This unifies what used to be two separate systems: the Rule (behavior) and
// the physics parameters. They live together now because they are the same
// kind of thing -- per-particle-population settings -- and separating them is
// what made the reference implementation's parameter handling sprawl.
//
// Lives in ConfigBuffer (binding 1). Each entity selects its ConfigData via
// its own config_index, so different particles can obey different configs.
// ---------------------------------------------------------------------------
struct ConfigData {
    rule: Rule,      // 320 B -- behavior coefficients
    sensor: vec4f,   // x: gain          y: angle       z: distance    w: mutation_scale
    force: vec4f,    // x: global_mult   y: drag        z: strafe      w: axial
    misc: vec4f,     // x: lateral       y: hazard_rate z: cohorts(i)  w: mutation_seed
    // The first four vec4s filled up (misc.w went to mutation_seed), so this is
    // the "add a whole new vec4" case rule 2 describes rather than a reclaimed
    // lane. Two spares here for the next additions.
    force2: vec4f,   // x: gravity_force y: gravity_strafe z: initial_conditions(i) w: cohort_fences(i)
    // force2 filled up the same way misc did, so this is another whole new
    // vec4 rather than a reclaimed lane. This one's zw were the last two spares
    // in the struct, and the sensor jitters claimed them -- rule 2's "claim a
    // reserved lane" case. THERE ARE NO SPARE LANES LEFT: the next addition
    // needs a whole new vec4.
    //
    // NAMED FOR BEING AN OVERFLOW LANE, NOT FOR A THEME -- like \`misc\` and
    // \`force2\` above it. It was called \`appearance\` while it held only the two
    // colour settings; the sensor jitters are physics, so that name had become
    // a lie about half its contents. A lane is a place four floats fit, not a
    // category, and pretending otherwise makes the next addition agonize over
    // whether it belongs. Read the per-lane comment, not the name.
    misc2: vec4f,  // x: color_sensitivity     y: color_by_cohort(i)
                   // z: sensor_angle_jitter   w: sensor_distance_jitter
    // misc2 had no spares left, so Radial Gravity is rule 2's "add a whole new
    // vec4" case again rather than a reclaimed lane. Gravity (Trails) then took
    // .y -- rule 2's "claim a reserved lane" case, as did Color Offset in .z
    // and Trail Weight in .w. No spares left.
    misc3: vec4f,  // x: radial_gravity(i)     y: gravity_trails
                   // z: color_offset          w: trail_weight
    // misc3 had no spares left, so the evolver's SECOND mutation voice is rule
    // 2's "add a whole new vec4" case. RUNTIME ONLY: never saved, always 0 in
    // a loaded state, so every saved state packs and behaves exactly as before.
    // Breathe mode's Orbit overlaps two breaths, and the fading one rides here.
    misc4: vec4f,  // x: mutation_scale_2      y: mutation_seed_2
                   // z: reserved              w: reserved
}  // 432 bytes

fn cfg_sensor_gain(c: ConfigData) -> f32     { return c.sensor.x; }
fn cfg_sensor_angle(c: ConfigData) -> f32    { return c.sensor.y; }
fn cfg_sensor_distance(c: ConfigData) -> f32 { return c.sensor.z; }
fn cfg_mutation_scale(c: ConfigData) -> f32  { return c.sensor.w; }

fn cfg_global_force_mult(c: ConfigData) -> f32 { return c.force.x; }
fn cfg_drag(c: ConfigData) -> f32              { return c.force.y; }
fn cfg_strafe_power(c: ConfigData) -> f32      { return c.force.z; }
fn cfg_axial_force(c: ConfigData) -> f32       { return c.force.w; }

fn cfg_lateral_force(c: ConfigData) -> f32 { return c.misc.x; }
fn cfg_hazard_rate(c: ConfigData) -> f32   { return c.misc.y; }
fn cfg_cohorts(c: ConfigData) -> i32       { return bitcast<i32>(c.misc.z); }
// Which random variation the rule mutation uses. Per-config rather than a
// uniform, so different particle populations can mutate differently.
fn cfg_mutation_seed(c: ConfigData) -> f32 { return c.misc.w; }
// A second, independent mutation layered on the first (evolver Orbit only).
// Scale 0 = absent. The seed is always used in stable mode (see mutate_rule).
fn cfg_mutation_scale_2(c: ConfigData) -> f32 { return c.misc4.x; }
fn cfg_mutation_seed_2(c: ConfigData) -> f32  { return c.misc4.y; }

// Uniform pull on the whole population, in the two motion channels the rest of
// the physics uses: _force feeds velocity, _strafe displaces position directly.
// Both are LINEAR -1..1 controls -- run them through gravity_expand() before
// use, never apply them raw.
fn cfg_gravity_force(c: ConfigData) -> f32  { return c.force2.x; }
fn cfg_gravity_strafe(c: ConfigData) -> f32 { return c.force2.y; }

// How this population is arranged on reset -- one of the IC_* modes above.
fn cfg_initial_conditions(c: ConfigData) -> i32 { return bitcast<i32>(c.force2.z); }
// Whether each particle is held near its own spawn point. ON/OFF ONLY: the
// fence RADIUS is derived from the grid cell size rather than stored, so
// cohorts just barely touch at any cohort count -- see the fence block in
// entity_update, which also explains why it applies to IC_GRID alone.
fn cfg_cohort_fences(c: ConfigData) -> bool { return bitcast<i32>(c.force2.w) != 0; }

// How strongly the brain's colour signal swings the hue. Read by the PARTICLE
// CAMERA, not by the physics -- entity_update only decides what raw signal to
// store, so this can be dragged without disturbing the simulation.
//
// NO SHADER CALLS THIS. The camera does not read the config buffer (rule 3);
// the value reaches cam_brush as a loose uniform instead. This accessor is the
// record of which lane holds it -- keep it.
fn cfg_color_sensitivity(c: ConfigData) -> f32 { return c.misc2.x; }
// Colour each population flat by its cohort instead of by its brain's output.
// A DISPLAY choice, read by the particle camera -- entity_update transmits both
// signals (col_params.x is the brain, .y the cohort) and picks neither, so this
// takes effect immediately, even while the simulation is paused.
//
// Also uncalled by any shader, for the same reason as cfg_color_sensitivity.
fn cfg_color_by_cohort(c: ConfigData) -> bool { return bitcast<i32>(c.misc2.y) != 0; }

// WHERE THIS POPULATION'S HUE SITS BEFORE THE SIGNAL MOVES IT. Sensitivity is
// the coefficient A and this is the bias B in \`hue = A * signal + B\`, so a
// config can be tuned to a corner of the wheel and its signal read as variation
// WITHIN that colour rather than across the whole spectrum.
//
// 0..1 spans the wheel exactly once. Hue is periodic, so the ends meet and no
// wrapping is needed anywhere -- see the fragment stage in cam_brush.
//
// IN A DIFFERENT LANE FROM cfg_color_sensitivity, which it belongs beside by
// meaning. misc2 was full; this is rule 2's "claim a reserved lane" case in
// misc3 rather than a fourth vec4 for one float. The accessors are written
// together here because that is where a reader looks for them -- the lane a
// value lives in is an allocation detail, which is exactly what the misc2
// comment above says.
//
// Uncalled by any shader, like the two above: the camera does not read the
// config buffer (rule 3), so this reaches cam_brush through the swatch table on
// its own uniform. The accessor is the record of which lane holds it.
fn cfg_color_offset(c: ConfigData) -> f32 { return c.misc3.z; }

// Random wobble added to each sensor reading, resampled EVERY PHYSICS STEP --
// a shimmer, not a fixed per-particle trait. Both are 0..1 controls scaled so
// that 1.0 spans the whole range of the parameter they perturb: angle covers
// its own -1..1 slider directly, distance covers SENSOR_DISTANCE_SPAN below.
// Applied in entity_update; 0 is off.
fn cfg_sensor_angle_jitter(c: ConfigData) -> f32    { return c.misc2.z; }
fn cfg_sensor_distance_jitter(c: ConfigData) -> f32 { return c.misc2.w; }

// Which direction the two gravity channels above pull in. False (the default,
// and what every config written before this existed means) is the fixed
// vec2(0,1) screen-down pull; true swings it to the particle's own position
// vector, so positive values fall inwards towards the origin and negative
// values blow outwards. Lives in misc3 rather than beside the gravity values
// because force2 and misc2 were both full -- read the lane comment, not the
// name.
fn cfg_radial_gravity(c: ConfigData) -> bool { return bitcast<i32>(c.misc3.x) != 0; }

// THE THIRD GRAVITY CHANNEL, and the only one that is not a motion.
//
// Force and Strafe above move the particle. This one moves what the particle
// BELIEVES: it is a constant bias added to every canvas sensor reading, in
// exactly the manner the user-drawn trails layer is added (see \`get_can\` in
// entityUpdate.wgsl). Nothing is pushed -- particles are told there is a trail
// downhill, and each rule decides for itself what to do about that. A rule that
// chases trails falls; a rule that avoids them rises. So unlike the other two,
// this channel's SIGN IS NOT ITS DIRECTION, and it does nothing whatsoever to a
// population whose rule ignores the sensors.
//
// LINEAR -1..1 like its siblings, expanded by the same gravity_expand() -- one
// curve for all three, so the feel of the three sliders matches.
fn cfg_gravity_trails(c: ConfigData) -> f32 { return c.misc3.y; }

// TRAIL WEIGHT: how heavily a config's trails count against OTHER configs'.
// Its deposits are multiplied by it and its reads of the swarm's trails divided
// by it (both in entityUpdate.wgsl), so a config alone is unaffected at any
// weight. Negative lays trails that point backwards, to everyone else.
//
// THE FLOOR IS LOAD-BEARING: reads divide by this. A stored value inside
// +-TRAIL_WEIGHT_MIN -- a hand-edited file, a typed 0 -- is pushed out to the
// floor on its own side, zero counting as positive. Mirrored by value in
// \`particleSystem/config.ts\` and pinned by a test.
const TRAIL_WEIGHT_MIN: f32 = 0.02;
fn cfg_trail_weight(c: ConfigData) -> f32 {
    let w = c.misc3.w;
    if (abs(w) >= TRAIL_WEIGHT_MIN) { return w; }
    return select(TRAIL_WEIGHT_MIN, -TRAIL_WEIGHT_MIN, w < 0.0);
}

// The width of the Sensor Distance slider (0..5), which is what a distance
// jitter of 1.0 spans. It lives here rather than being read from the slider
// bounds because the shader has no access to those -- MUST MATCH the \`hi\` of
// the sensor_distance entry in ui/settings_spec.py.
const SENSOR_DISTANCE_SPAN: f32 = 5.0;

// The speed below which a particle is considered STALLED and is given a random
// heading. See the rescue block in entityUpdate.wgsl for why one is needed: a
// particle's heading is its velocity, so at exactly zero it has no direction,
// its sensors collapse onto each other, and nothing can ever restore it.
//
// 5e-5 is \`reset()\`'s own spawn magnitude -- the number this codebase already
// picked for "slow, but moving enough to have a direction". Using the same value
// makes a rescued particle indistinguishable from a freshly reset one.
//
// A FLOOR, NOT AN EPSILON. It is deliberately far above fp32's denormal range:
// the failure is not underflow to exactly zero, it is a velocity too small for
// \`sample_dist\` to place the sensors on different texels, which happens long
// before the bits run out.
const MIN_VELOCITY: f32 = 5e-5;

// ---------------------------------------------------------------------------
// WorldData -- settings that are properties of the world, not of a particle.
//
// Set as a uniform, never per-entity. If a setting would be meaningless to
// vary between two particles sharing a canvas (trail decay, world scale), it
// belongs here rather than in ConfigData.
// ---------------------------------------------------------------------------
struct WorldData {
    trail: vec4f,  // x: persistence  y: diffusion  z: sqrt_world_size  w: config_count(i)
    // trail filled up, so this is rule 2's "add a whole new vec4" case.
    bounds: vec4f, // x: boundary_conditions(i)   yzw: reserved
}

fn world_trail_persistence(w: WorldData) -> f32 { return w.trail.x; }
fn world_trail_diffusion(w: WorldData) -> f32   { return w.trail.y; }
fn world_sqrt_world_size(w: WorldData) -> f32   { return w.trail.z; }
fn world_config_count(w: WorldData) -> i32      { return bitcast<i32>(w.trail.w); }

// What happens at the edge of the world -- one of the BC_* modes above. A
// world property rather than a per-config one: the trail field has to obey the
// same boundary as the particles do, and there is only one trail field.
fn world_boundary_conditions(w: WorldData) -> i32 { return bitcast<i32>(w.bounds.x); }

// ---------------------------------------------------------------------------
// Entity -- one particle. 32 bytes, 16-byte aligned.
//
// Lives in EntityBuffer (binding 0). Mirrored by no one: every shader that
// touches entities includes this file.
// ---------------------------------------------------------------------------
struct Entity {
    pos_vel: vec4f,  // xy: pos    zw: vel
    misc: vec4f,     // x: size    y: config_index(i)    zw: col_params
}

fn e_pos(e: Entity) -> vec2f          { return e.pos_vel.xy; }
fn e_vel(e: Entity) -> vec2f          { return e.pos_vel.zw; }
fn e_size(e: Entity) -> f32           { return e.misc.x; }
fn e_config_index(e: Entity) -> i32   { return bitcast<i32>(e.misc.y); }

// ---------------------------------------------------------------------------
// LIFETIME -- a negative config_index means the particle is DEAD.
//
// NO LAYOUT CHANGE. Entity is full at 32 bytes and every lane is spoken for, so
// a dead FLAG would have meant widening the struct and editing
// layout.fixture.json in lockstep. It is not needed: config_index is already an
// i32 riding a float lane, and no real config index is ever negative -- so the
// sign bit was free the whole time.
//
// EVERY READER MUST TEST THIS BEFORE THE CONFIG LOOKUP. \`entityUpdate\` clamps
// config_index into range (\`clamp(idx, 0, count-1)\`), which would quietly turn
// a dead particle into a config-0 particle rather than skipping it. The clamp is
// correct for its own purpose -- it makes a SHRUNK ConfigBuffer degrade
// gracefully -- so the dead test goes above it rather than replacing it.
//
// The studio produces these only through BC_KILL, and its reset frame brings
// them back (see the dead-particle note in entityUpdate's \`main\`).
// ---------------------------------------------------------------------------
// \`make_entity_dead\` is NOT here: it calls make_entity, which is declared below,
// and WGSL requires declaration before use. It sits under that function instead.
const DEAD_CONFIG: i32 = -1;

fn e_is_dead(e: Entity) -> bool { return e_config_index(e) < 0; }

// RAW OUTPUT FROM THE PARTICLE'S BRAIN, kept for rendering rather than physics.
// entity_update writes these; the particle camera turns them into a hue.
//
// .x is a raw force term from the black box -- deliberately arbitrary, tuned by
// eye, so nothing downstream should read meaning into its scale.
// .y is the particle's COHORT INDEX, which cam_brush reads when Color By
// Cohort is on.
//
// The RENDERER decides what these look like. Storing the raw signals instead of
// a finished hue is what lets Color Sensitivity be dragged without re-running
// the simulation, which is where the reference put it.
fn e_col_params(e: Entity) -> vec2f { return e.misc.zw; }

fn make_entity(pos: vec2f, vel: vec2f, size: f32, config_index: i32,
               col_params: vec2f) -> Entity {
    return Entity(vec4f(pos, vel),
                  vec4f(size, bitcast<f32>(config_index), col_params));
}

// Same, for the paths that have no colour signal to offer -- reset() runs
// before any behaviour is computed. Zero is a valid hue, so this is not a
// sentinel; the entity simply gets its colour on the next real step.
//
// RENAMED from the GLSL, which overloads \`make_entity\` on arity -- WGSL has no
// function overloading. The delegation is kept: this is the 5-arg form with a
// zero colour, not a second implementation.
fn make_entity_reset(pos: vec2f, vel: vec2f, size: f32,
                     config_index: i32) -> Entity {
    return make_entity(pos, vel, size, config_index, vec2f(0.0));
}

// A DEAD particle -- see the lifetime block above \`e_is_dead\`.
//
// Everything is zeroed rather than left stale: a readback of the buffer stays
// legible, and nothing downstream can be fooled by a plausible-looking position
// on a particle that is not there. A size of 0 means that even a consumer which
// somehow skipped the dead test would draw a zero-area sprite.
//
// DECLARED HERE, not beside e_is_dead, because it calls make_entity above and
// WGSL requires declaration before use.
fn make_entity_dead() -> Entity {
    return make_entity(vec2f(0.0), vec2f(0.0), 0.0, DEAD_CONFIG, vec2f(0.0));
}

// ---------------------------------------------------------------------------
// COORDINATE CONVENTION -- the one canonical implementation.
//
// World space is AREA-PRESERVING. With ca = canvas_res.x / canvas_res.y:
//
//     world = [-sqrt(ca), +sqrt(ca)]  x  [-1/sqrt(ca), +1/sqrt(ca)]
//
// so the world always has area 4 regardless of canvas aspect, and a circle in
// world space stays a circle on screen. On a square canvas ca == 1 and this
// reduces exactly to the familiar [-1,1] x [-1,1].
//
// NO OTHER FILE MAY WRITE ASPECT-RATIO MATH. Every world<->uv<->ndc
// conversion goes through the functions below (and their TypeScript mirrors in
// src/particleSystem/coords.ts). The reference implementation had six divergent
// copies of this math, at least one of which contradicted the others; that is
// the specific failure this rule exists to prevent.
//
// THE WORLD IS A TORUS ONLY IN BC_WRAP. The boundary mode decides the world's
// topology, so anything that crosses an edge must ask: world_wrap for wrap,
// world_bounce for bounce, and world_to_uv_bc for every texture read.
//
// SEVERAL FUNCTIONS BELOW HAVE NO EXTERNAL CALLER. world_half_extent,
// world_to_uv, uv_to_world, edge_fold, letterbox_scale and screen_ndc_to_world
// are each an internal composition step of one that does. They are load-bearing,
// not dead. WGSL does not warn about unused module-scope functions.
// ---------------------------------------------------------------------------

// Half-extent of world space on each axis, from canvas aspect ca = res.x/res.y.
fn world_half_extent(ca: f32) -> vec2f {
    let s = sqrt(ca);
    return vec2f(s, 1.0 / s);
}

fn world_half_extent_from_res(canvas_res: vec2f) -> vec2f {
    return world_half_extent(canvas_res.x / canvas_res.y);
}

// Scale a uv-space delta into the aspect-corrected metric -- literally
// world_half_extent applied as a scale, which is why it lives here rather than
// being its own piece of aspect math. World space is area-preserving, so a raw
// uv delta is anisotropic on a non-square canvas; brushes measured in this
// metric stay circular, and a ring drawn in it matches the brush that paints
// in it. Used by strafe_draw (painting) and frame_assembly (the reticle that
// must agree with it).
fn aspect_correct_uv(d: vec2f, canvas_res: vec2f) -> vec2f {
    return d * world_half_extent_from_res(canvas_res);
}

// World -> texture uv [0,1]. In BC_WRAP the canvas textures are sampled with a
// repeating sampler and the sampler does the wrapping, so uv is deliberately
// left unclamped. Every other boundary mode must go through world_to_uv_bc.
fn world_to_uv(p: vec2f, canvas_res: vec2f) -> vec2f {
    return p / (2.0 * world_half_extent_from_res(canvas_res)) + 0.5;
}

// World -> texture uv, honoring the boundary mode. Only BC_WRAP leaves uv free
// for the sampler's repeat to handle; the others clamp, so a sensor reaching
// past the edge reads the edge rather than the far side of the world.
fn world_to_uv_bc(p: vec2f, canvas_res: vec2f, bc: i32) -> vec2f {
    let uv = world_to_uv(p, canvas_res);
    // select(false_value, true_value, condition) -- the argument order is the
    // reverse of GLSL's \`cond ? a : b\`.
    return select(clamp(uv, vec2f(0.0), vec2f(1.0)), uv, bc == BC_WRAP);
}

fn uv_to_world(uv: vec2f, canvas_res: vec2f) -> vec2f {
    return (uv - 0.5) * 2.0 * world_half_extent_from_res(canvas_res);
}

// The corner of an instanced quad, in TRIANGLE-STRIP order, as a 0..1 uv:
// (0,0) (1,0) (0,1) (1,1) for vertex_id 0..3. The matching offset from the quad
// centre is \`(strip_corner(v) * 2.0 - 1.0) * half_size\`, which pairs uv and
// corner by construction -- they are the same value.
//
// ARITHMETIC, NOT A LOOKUP TABLE, and that is the reason this exists. The
// per-particle sprite shaders (camBrush.wgsl; the brush pass before it became
// a point splat) used \`var offsets = array<vec2f, 4>(...)\` indexed by vertex_id.
// A local array indexed by a non-constant is spilled to per-thread scratch
// memory by the browser's shader compilers (the same trap that made
// entityUpdate's by-value Rule so slow), and a sprite shader runs four times
// per particle. Do not turn this back into a table.
//
// Strip, not fan: WebGPU has no triangle-fan, and a strip over the desktop's
// fan order (brush.vert:25-36) draws a bowtie.
fn strip_corner(vertex_id: u32) -> vec2f {
    return vec2f(f32(vertex_id & 1u), f32(vertex_id >> 1u));
}

// World -> normalized device coords [-1,1] for rasterizing into the canvas.
fn world_to_ndc(p: vec2f, canvas_res: vec2f) -> vec2f {
    return p / world_half_extent_from_res(canvas_res);
}

// Wrap a world position into the world bounds. BC_WRAP only -- the world is a
// torus in that mode alone.
//
// DO NOT REWRITE fract() AS \`%\`. \`p\` here is freely signed (a world position
// past either edge), so \`p / size - 0.5\` is routinely negative, and WGSL's \`%\`
// is truncated where this needs floored behaviour. WGSL defines fract(x) as
// \`x - floor(x)\`, identical to GLSL, so it translates verbatim and correctly --
// the \`%\` "cleanup" would break wrap for every particle leaving the left or
// bottom edge.
fn world_wrap(p: vec2f, canvas_res: vec2f) -> vec2f {
    let extent = world_half_extent_from_res(canvas_res);
    let size = 2.0 * extent;
    return size * (fract(p / size - 0.5) - 0.5);
}

// Reflect a coordinate given in edge units back into [-1,1]. A triangle wave,
// so it is correct for ARBITRARY overshoot. The reference's single-fold version
// (sign(x)*(1-abs(1-abs(x)))) silently teleported a particle to the far side
// once it passed 2x the edge in one step, which heavy gravity reaches.
//
// GLSL's mod() is floored and WGSL's \`%\` is truncated, so they are NOT
// interchangeable in general. They agree here because the dividend is abs(x),
// non-negative BY CONSTRUCTION rather than by caller convention, and the
// divisor is a positive literal. That is what makes \`%\` safe -- if the abs()
// ever goes away, this needs a floored mod again.
fn edge_fold(x: f32) -> f32 {
    let t = abs(x) % 2.0;
    return sign(x) * (1.0 - abs(1.0 - t));
}

// What world_bounce returns. GLSL passed p and v as \`inout\`; WGSL has no
// inout, so the pair comes back as a struct. (A ptr<function, vec2f> parameter
// would also work, but a return struct reads better at the one call site.)
struct BounceResult {
    pos: vec2f,
    vel: vec2f,
}

// Reflect a position off the world bounds, flipping the velocity components
// that crossed. Position and velocity move together: reflecting the position
// without reversing the velocity would just re-trigger the bounce every frame,
// pinning the particle to the wall.
//
// THE ORDER BELOW IS LOAD-BEARING: the velocity flips are decided against the
// PRE-FOLD position, and only then is the position folded. Computing the folded
// position first and testing that would silently change the exact-boundary case.
fn world_bounce(p: vec2f, v: vec2f, canvas_res: vec2f) -> BounceResult {
    let extent = world_half_extent_from_res(canvas_res);
    var vel = v;
    if (abs(p.x) > extent.x) { vel.x = -vel.x; }
    if (abs(p.y) > extent.y) { vel.y = -vel.y; }
    let pos = vec2f(edge_fold(p.x / extent.x), edge_fold(p.y / extent.y)) * extent;
    return BounceResult(pos, vel);
}

// ---------------------------------------------------------------------------
// THE VIEW TRANSFORM -- world to screen, through camera and letterbox.
//
//     world  --/half_extent-->  canvas ndc
//            --(-pan, *zoom)->  view ndc
//            --*letterbox---->  screen ndc [-1,1]
//
// THREE INDEPENDENT ASPECT QUANTITIES, never conflate them:
//   canvas_res  simulation texture size; defines world space
//   window_res  framebuffer size in pixels; changes on resize
//   letterbox   derived fit of one into the other; never stored
//
// ZOOM: bigger = zoomed IN (a magnification factor). zoom=1 fits the world.
// PAN:  world units. pan is the world point at the center of the view.
// ---------------------------------------------------------------------------

// Scale fitting the canvas box into the window, preserving shape. The axis
// that would overflow shrinks; the other stays 1.0, and the slack is the
// letterbox bar. Fit, not fill: the whole canvas is always visible.
fn letterbox_scale(canvas_res: vec2f, window_res: vec2f) -> vec2f {
    if (window_res.x <= 0.0 || window_res.y <= 0.0) { return vec2f(1.0); }
    let canvas_aspect = canvas_res.x / canvas_res.y;
    let window_aspect = window_res.x / window_res.y;
    return select(
        vec2f(1.0, window_aspect / canvas_aspect),  // bars top/bottom
        vec2f(canvas_aspect / window_aspect, 1.0),  // bars left/right
        window_aspect > canvas_aspect);
}

fn world_to_screen_ndc(p: vec2f, canvas_res: vec2f, window_res: vec2f,
                       pan: vec2f, zoom: f32) -> vec2f {
    let ndc = world_to_ndc(p - pan, canvas_res) * zoom;
    return ndc * letterbox_scale(canvas_res, window_res);
}

fn screen_ndc_to_world(ndc: vec2f, canvas_res: vec2f, window_res: vec2f,
                       pan: vec2f, zoom: f32) -> vec2f {
    var v = ndc / letterbox_scale(canvas_res, window_res);
    if (zoom != 0.0) { v /= zoom; }
    return uv_to_world(v * 0.5 + 0.5, canvas_res) + pan;
}

// Screen ndc -> canvas uv, for the present pass sampling the canvas texture.
// Values outside [0,1] fall in the letterbox bars; the caller decides whether
// to clamp, wrap (tiling) or paint them black.
fn screen_ndc_to_canvas_uv(ndc: vec2f, canvas_res: vec2f, window_res: vec2f,
                           pan: vec2f, zoom: f32) -> vec2f {
    return world_to_uv(
        screen_ndc_to_world(ndc, canvas_res, window_res, pan, zoom),
        canvas_res);
}

// ==== end include: common.wgsl ====

struct StrafeDrawUniforms {
    // xy: the FIELD's resolution   zw: reserved
    //
    // THE FIELD'S, NOT THE CANVAS'S. The GLSL names this \`canvas_resolution\`
    // because it shares \`aspect_correct_uv\` with the assembler, whose copy
    // really is fed the canvas; here it means "the texture I am drawing into"
    // (\`strafe_field.py:144-150\`). Renamed rather than carrying the misnomer,
    // because fed the canvas size the aspect correction computes against the
    // wrong ratio and the brush becomes an oval -- invisible at the default 1:1.
    field_res : vec4f,
    // xy: this frame's cursor in field uv   zw: the previous frame's
    //
    // THE LINE TOOL REUSES THIS UNCHANGED: it packs its anchor as the "previous"
    // point and the cursor as the current one, so a committed line is just a
    // segment whose endpoints did not come from consecutive frames. Nothing below
    // branches on which gesture produced it.
    stroke : vec4f,
    // x: draw_size (gaussian sigma)   y: draw_power   z: erase_mode(i)
    // w: brush_mode(i)
    brush : vec4f,
    // x: layer_index(i)  y: draw_angle (radians, 0 = up)  z: line_gain
    // w: reserved
    layer : vec4f,
}

@group(0) @binding(0) var<uniform> u : StrafeDrawUniforms;

fn field_res()  -> vec2f { return u.field_res.xy; }
fn mouse()      -> vec2f { return u.stroke.xy; }
fn prev_mouse() -> vec2f { return u.stroke.zw; }
fn draw_size()  -> f32   { return u.brush.x; }
fn draw_power() -> f32   { return u.brush.y; }
fn erase_mode() -> bool  { return bitcast<i32>(u.brush.z) != 0; }
fn brush_mode() -> i32   { return bitcast<i32>(u.brush.w); }
fn layer_index() -> i32  { return bitcast<i32>(u.layer.x); }
fn draw_angle() -> f32   { return u.layer.y; }
fn line_gain()  -> f32   { return u.layer.z; }

// Brush modes. MUST match \`BRUSH_MODES\` in \`fieldLayer.ts\`, which is the source
// of truth for the numbering -- that array's order IS this enum.
const MODE_DIVERGE  : i32 = 0;
const MODE_CONVERGE : i32 = 1;
const MODE_STROKE   : i32 = 2;
const MODE_FIXED    : i32 = 3;

struct VsOut {
    @builtin(position) clip : vec4f,
    @location(0) uv : vec2f,
}

// The fullscreen triangle-strip quad, from the vertex index alone. Strip order:
// (-1,-1) (1,-1) (-1,1) (1,1) -- the same order \`canvas.wgsl\` uses.
//
// NOTE THE V FLIP in \`out.uv\`, and see the file header for why it is here and
// not in the GLSL. It is the same expression \`canvas.wgsl:80\` carries.
@vertex
fn vs_main(@builtin(vertex_index) vi : u32) -> VsOut {
    var corners = array<vec2f, 4>(
        vec2f(-1.0, -1.0),
        vec2f( 1.0, -1.0),
        vec2f(-1.0,  1.0),
        vec2f( 1.0,  1.0),
    );
    let p = corners[vi];

    var out : VsOut;
    out.clip = vec4f(p, 0.0, 1.0);
    out.uv = vec2f(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);
    return out;
}

// \`dist_to_stroke\`'s two return values. GLSL used an \`out\` parameter
// (\`strafe_draw.frag:42\`); WGSL has none, so they come back together.
struct StrokeHit {
    // In the ASPECT-CORRECTED metric.
    dist : f32,
    // In RAW uv. THE ASYMMETRY WITH \`dist\` IS LOAD-BEARING -- see below.
    nearest : vec2f,
}

// Distance from \`p\` to the segment a->b, plus the nearest point on it.
//
// THE SEGMENT IS THE POINT OF THIS FUNCTION. Splatting a single gaussian at the
// current mouse position visibly breaks into dots on a fast drag, because
// nothing connects one frame's splat to the next. Painting the whole segment
// travelled since the last frame is what makes a stroke continuous at any drag
// speed.
fn dist_to_stroke(p: vec2f, a: vec2f, b: vec2f, res: vec2f) -> StrokeHit {
    let pa = aspect_correct_uv(p - a, res);
    let ba = aspect_correct_uv(b - a, res);
    let denom = dot(ba, ba);

    // denom == 0 on a stroke's first frame, where a == b and the segment
    // degenerates to a point. h = 0 then, which is exactly a point splat.
    //
    // \`var\` + \`if\`, NOT \`select()\`. select() evaluates BOTH arms, and the
    // discarded one here divides by zero. Same reasoning as \`safenorm\` in
    // common.wgsl -- this is the third site in the port with that note.
    var h = 0.0;
    if (denom > 0.0) {
        h = clamp(dot(pa, ba) / denom, 0.0, 1.0);
    }

    // \`dist\` IS CORRECTED AND \`nearest\` IS NOT, deliberately. The only consumer
    // of \`nearest\` re-corrects it:
    //
    //     away = aspect_correct_uv(uv - hit.nearest, res)
    //
    // Returning it already-corrected would DOUBLE-APPLY the correction and skew
    // the repel direction by the aspect ratio. That is correct on a square
    // canvas -- which is the default -- and silently wrong on every other,
    // making it the hardest version of this bug to notice.
    return StrokeHit(length(pa - ba * h), mix(a, b, h));
}

// The direction this fragment's vector points, as a UNIT vector (or exactly zero
// where the direction is undefined). Magnitude is applied by the caller, so every
// mode is guaranteed to respond identically to Brush Power and Brush Size -- a
// mode cannot accidentally be stronger than its neighbours.
//
// \`hit.nearest\` is in RAW uv and is corrected here; see \`dist_to_stroke\`'s note
// on why it is returned uncorrected.
fn brush_direction(p: vec2f, hit: StrokeHit, res: vec2f) -> vec2f {
    let mode = brush_mode();

    // FIXED: one direction everywhere, so the stroke's geometry does not enter
    // into it at all.
    //
    // ANGLE 0 IS UP, AND THIS IS \`+cos(a)\` WITH NO NEGATION. What this function
    // returns is not a position in this shader's flipped uv space -- it is a
    // VECTOR that \`entityUpdate\` adds to a world-space position (via \`get_walls\`)
    // or to a world-space sensor reading (via \`get_can\`). World space is y-up, so
    // "0 means up" is written plainly.
    //
    // THE V FLIP IN THIS FILE'S VERTEX STAGE IS A SEPARATE MATTER and does not
    // apply here: it decides WHICH TEXEL a fragment writes, not which way the
    // value stored in that texel points. Conflating the two negates every fixed
    // stroke -- the brush pushes down while the slider and the reticle both say
    // up, and nothing on screen contradicts it except the particles.
    if (mode == MODE_FIXED) {
        let a = draw_angle();
        return vec2f(sin(a), cos(a));
    }

    // STROKE: along the direction of travel. NORMALIZED, so a fast drag and a
    // slow one paint equally hard -- the alternative, scaling by the raw
    // per-frame delta, makes stroke weight depend on the frame rate, so the same
    // physical gesture paints half as hard at 120fps as at 60. Magnitude is Brush
    // Power's job and only Brush Power's.
    //
    // The LINE TOOL gets the correct answer from this with no special case: its
    // segment is anchor->cursor, so \`travel\` is the line's own direction.
    if (mode == MODE_STROKE) {
        let travel = aspect_correct_uv(mouse() - prev_mouse(), res);
        let len = length(travel);
        // A stroke that has not moved has no direction. Zero rather than a NaN,
        // for the reason spelled out below.
        if (len > 0.0) {
            return travel / len;
        }
        return vec2f(0.0);
    }

    // DIVERGE / CONVERGE: away from (or toward) the stroke. Measured from the
    // NEAREST POINT ON THE SEGMENT rather than from the mouse, so on a fast drag
    // the whole length of the stroke pushes outward instead of the tail pointing
    // back at wherever the cursor ended up. That is also exactly what makes these
    // two work unchanged for the line tool -- a line is just a longer segment.
    let away = aspect_correct_uv(p - hit.nearest, res);
    let len = length(away);

    // Exactly on the stroke the direction is undefined; contribute nothing
    // rather than a NaN.
    //
    // \`var\` + \`if\`, NOT \`select()\`, and here the stakes are higher than in
    // dist_to_stroke: select() would evaluate \`away / 0\`, and the target is FP16
    // UNDER ADDITIVE BLENDING. One NaN texel is PERMANENT -- it survives every
    // subsequent frame, renders as black in the overlay (indistinguishable from
    // empty), and poisons the physics every sub-step until a clear or an erase
    // happens to cover it.
    var dir = vec2f(0.0);
    if (len > 0.0) {
        dir = away / len;
    }
    // CONVERGE is literally the negation, which is the whole difference between
    // the two modes and is worth keeping visible as one sign flip.
    if (mode == MODE_CONVERGE) {
        return -dir;
    }
    return dir;
}

// Place a 2D vector into the half of the texel its layer owns.
//
// The COLOUR WRITE MASK on the pipeline is what actually protects the other half
// (see \`LAYER_WRITE_MASK\`); this only decides where to put the value. Both are
// needed: without the mask the untouched half would be written -- as zero under
// no blending, which is an erase -- and without this the vector would land in the
// wrong channels and the mask would discard it entirely.
fn place_in_layer(v: vec2f) -> vec4f {
    if (layer_index() == 0) {
        return vec4f(v, 0.0, 0.0);
    }
    return vec4f(0.0, 0.0, v);
}

@fragment
fn fs_main(in: VsOut) -> @location(0) vec4f {
    let res = field_res();
    let hit = dist_to_stroke(in.uv, prev_mouse(), mouse(), res);

    if (erase_mode()) {
        // Hard circle at 2*draw_size: the drawn gaussian's visible extent is
        // roughly 2 sigma, so the eraser matches what you can see -- and matches
        // the reticle, which is drawn at the same radius.
        //
        // THE ERASE PIPELINE HAS NO BLEND STATE, so writing zero here IS the
        // erase; every other fragment discards and keeps whatever it held. Both
        // halves are required: without the discard this would zero the whole
        // field on every erase frame.
        //
        // IT IS ALSO WRITE-MASKED TO ONE LAYER, which is what keeps the walls
        // eraser off the trails. Returning a full zero vec4f here is safe only
        // because of that mask -- the channels this pass does not own are never
        // written at all.
        if (hit.dist < draw_size() * 2.0) {
            return vec4f(0.0);
        }
        discard;
    }

    // A zero-power brush contributes nothing. Discarding rather than returning
    // zero matters because the DRAW pipeline blends additively -- a returned zero
    // is a no-op there too, but only by arithmetic accident, and the discard says
    // what is meant.
    if (draw_power() <= 0.0) {
        discard;
    }

    let dir = brush_direction(in.uv, hit, res);

    // Unnormalized gaussian, sigma = draw_size. No cutoff radius: distant
    // fragments contribute a denormal rather than nothing, which costs the same
    // fullscreen pass either way.
    //
    // SHARED BY ALL FOUR MODES, deliberately: the modes differ in direction and
    // in nothing else, so the falloff, the radius and the power response are
    // identical across them and switching mode mid-drawing does not change how
    // hard the brush feels.
    let kernel = exp(-hit.dist * hit.dist / (2.0 * draw_size() * draw_size()));

    // Dividing by draw_size keeps a small brush from feeling useless: per-texel
    // intensity rises as the footprint shrinks, so the total painted impulse
    // stays in the same range across the size slider. The /5.0 normalizes
    // draw_power against the top of its 0.1..5.0 range.
    //
    // \`line_gain\` is 1.0 for a freehand stroke and larger for a committed line --
    // a line deposits in ONE pass where a drag deposits once per frame, so without
    // it the same gesture reads as a faint ghost. See \`LINE_STROKE_GAIN\`.
    let v = dir * 0.01 * (draw_power() / 5.0) * kernel * line_gain() / draw_size();
    return place_in_layer(v);
}
`,Hl=4;class ci{device;size;texture;textureView;uniforms;drawPipelines={};erasePipelines={};uniformGroup=null;wrap=!1;constructor(e,t){this.device=e,this.size=zo(t),this.texture=e.createTexture({label:"strafe-field",size:{width:this.size[0],height:this.size[1]},format:zt,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.COPY_SRC|GPUTextureUsage.COPY_DST}),this.textureView=this.texture.createView(),this.uniforms=e.createBuffer({label:"strafe-draw-uniforms",size:li,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST})}static async create(e,t){const s=new ci(e,t);return await s.reload(),s}async reload(){const e=this.device,t=await $(e,"strafeDraw.wgsl",Vl);if(t===null){this.drawPipelines={},this.erasePipelines={};return}const s=e.createBindGroupLayout({label:"strafe-draw-uniforms",entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,buffer:{type:"uniform"}}]}),a=e.createPipelineLayout({bindGroupLayouts:[s]}),i=(o,c,l)=>e.createRenderPipeline({label:o,layout:a,vertex:{module:t,entryPoint:"vs_main"},fragment:{module:t,entryPoint:"fs_main",targets:[{format:zt,blend:c,writeMask:l}]},primitive:{topology:"triangle-strip"}}),r={color:{srcFactor:"one",dstFactor:"one",operation:"add"},alpha:{srcFactor:"one",dstFactor:"one",operation:"add"}};this.drawPipelines={},this.erasePipelines={};for(const o of Ul){const c=Ml[o];this.drawPipelines[o]=i(`strafe-draw-${o}`,r,c),this.erasePipelines[o]=i(`strafe-erase-${o}`,void 0,c)}this.uniformGroup=e.createBindGroup({label:"strafe-draw-uniforms",layout:s,entries:[{binding:0,resource:{buffer:this.uniforms}}]})}view(){return this.textureView}textureObject(){return this.texture}setWrap(e){this.wrap=e}get wrapping(){return this.wrap}draw(e,t,s,a){this.pass(e,t,s,a,!1)}erase(e,t,s,a){this.pass(e,t,s,a,!0)}pass(e,t,s,a,i){const r=i?this.erasePipelines[a.layer]:this.drawPipelines[a.layer];if(r===void 0||this.uniformGroup===null)return;this.device.queue.writeBuffer(this.uniforms,0,zl(this.size,t,s,a,i));const o=e.beginRenderPass({label:i?`strafe-erase-${a.layer}`:`strafe-draw-${a.layer}`,timestampWrites:re("strafe-draw"),colorAttachments:[{view:this.textureView,loadOp:"load",storeOp:"store"}]});o.setPipeline(r),o.setBindGroup(0,this.uniformGroup),o.draw(4),o.end()}clear(e,t){const s=[.5,.5];this.pass(e,s,s,{drawSize:Hl,drawPower:0,mode:"diverge",layer:t,drawAngle:0,lineGain:1},!0)}pipelineStatus(){return{strafeDraw:this.drawPipelines.walls!==void 0,strafeErase:this.erasePipelines.walls!==void 0}}release(){this.texture.destroy()}destroy(){this.release(),this.uniforms.destroy()}}const Wl="fluoddity",hi=2,Nn="configs",he="worlds";function di(n){n.objectStoreNames.contains(Nn)||n.createObjectStore(Nn,{keyPath:"id"}),n.objectStoreNames.contains(he)||n.createObjectStore(he,{keyPath:"name"})}function Ut(n){return new Promise((e,t)=>{n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error??new Error("IndexedDB request failed"))})}async function ql(){if(typeof indexedDB>"u")return console.warn("IndexedDB is unavailable; worlds cannot be saved."),null;try{return await new Promise((n,e)=>{const t=indexedDB.open(Wl,hi);t.onupgradeneeded=()=>di(t.result),t.onsuccess=()=>n(t.result),t.onerror=()=>e(t.error??new Error("open failed")),t.onblocked=()=>e(new Error("blocked by another tab"))})}catch(n){return console.warn(`IndexedDB could not be opened (${String(n)}); worlds are unavailable.`),null}}class Hs extends Error{constructor(){super("Saving worlds is unavailable: this browser denied access to local storage."),this.name="WorldStorageUnavailableError"}}class Mt{db;cachedNames=[];constructor(e,t){this.db=e,this.cachedNames=t}static async open(){const e=await ql();if(e===null)return new Mt(null,[]);let t=[];try{t=await un(e)}catch(s){console.warn(`Could not list saved worlds: ${String(s)}`)}return new Mt(e,t)}static forTesting(e=[]){return new Mt(null,e)}get writable(){return this.db!==null}names(){return this.cachedNames}has(e){return this.cachedNames.includes(e)}async read(e){if(this.db===null)return null;const t=this.db.transaction(he,"readonly");return await Ut(t.objectStore(he).get(e))??null}async save(e,t,s){if(this.db===null)throw new Hs;const a=this.db.transaction(he,"readwrite");await Ut(a.objectStore(he).put({name:e,document:t,scene:s,savedAt:Date.now()})),this.cachedNames=await un(this.db)}async remove(e){if(this.db===null)throw new Hs;const t=this.db.transaction(he,"readwrite");await Ut(t.objectStore(he).delete(e)),this.cachedNames=await un(this.db)}}async function un(n){const e=n.transaction(he,"readonly");return(await Ut(e.objectStore(he).getAllKeys())).filter(s=>typeof s=="string").sort((s,a)=>s.localeCompare(a))}const jl="fluoddity",Ce=Nn;function fn(n,e){return`${n}\0${e}`}function Xt(n){return new Promise((e,t)=>{n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error??new Error("IndexedDB request failed"))})}async function Yl(){if(typeof indexedDB>"u")return console.warn("IndexedDB is unavailable; saved configs will be read-only."),null;try{return await new Promise((n,e)=>{const t=indexedDB.open(jl,hi);t.onupgradeneeded=()=>di(t.result),t.onsuccess=()=>n(t.result),t.onerror=()=>e(t.error??new Error("open failed")),t.onblocked=()=>e(new Error("blocked by another tab"))})}catch(n){return console.warn(`IndexedDB could not be opened (${String(n)}); saves are unavailable.`),null}}async function Lt(n){const e=n.transaction(Ce,"readonly");return await Xt(e.objectStore(Ce).getAll())}async function $l(n,e){const t=n.transaction(Ce,"readonly");return await Xt(t.objectStore(Ce).get(e))}async function Kl(n,e){const t=n.transaction(Ce,"readwrite");await Xt(t.objectStore(Ce).put(e))}async function Xl(n,e){const t=n.transaction(Ce,"readwrite");await Xt(t.objectStore(Ce).delete(e))}const ui="configs/manifest.json";class de extends Error{constructor(e){super(e),this.name="ManifestError"}}function Ql(n,e){if(typeof n!="object"||n===null)throw new de(`${e}: not a JSON object`);const t=n.categories;if(!Array.isArray(t))throw new de(`${e}: missing "categories" array`);return{categories:t.map((a,i)=>{const r=a,o=r.name,c=r.entries;if(typeof o!="string"||!Array.isArray(c))throw new de(`${e}: categories[${i}] is malformed`);return{name:o,entries:c.map((l,d)=>{const h=l;if(typeof h.name!="string"||typeof h.path!="string")throw new de(`${e}: categories[${i}].entries[${d}] is malformed`);return{name:h.name,path:h.path}})}})}}async function Zl(n=ui){let e;try{e=await fetch(n,{cache:"no-cache"})}catch(s){throw new de(`Could not fetch ${n}: ${String(s)}`)}if(!e.ok)throw new de(`Could not fetch ${n}: HTTP ${e.status}`);let t;try{t=await e.json()}catch(s){throw new de(`${n} is not valid JSON: ${String(s)}`)}return Ql(t,n)}async function Jl(n,e=ui){const s=`${e.slice(0,e.lastIndexOf("/")+1)}${n}`;let a;try{a=await fetch(s,{cache:"no-cache"})}catch(i){throw new de(`Could not fetch ${s}: ${String(i)}`)}if(!a.ok)throw new de(`Could not fetch ${s}: HTTP ${a.status}`);try{return await a.json()}catch(i){throw new de(`${s} is not valid JSON: ${String(i)}`)}}const ec="Core",tc="Custom",Ws="Archive",nm="Etheric";class pn extends Error{constructor(){super("Saving is unavailable: this browser denied access to local storage."),this.name="StorageUnavailableError"}}class Pn{manifest;db;saved;constructor(e,t,s){this.manifest=e,this.db=t,this.saved=s}static async open(){const[e,t]=await Promise.all([Zl(),Yl()]);let s=[];if(t!==null)try{s=await Lt(t)}catch(a){console.warn(`Could not list saved configs: ${String(a)}`)}return new Pn(e,t,s)}static forTesting(e,t=[]){return new Pn(e,null,t)}get writable(){return this.db!==null}catalog(){const e=new Map;for(const r of this.manifest.categories)e.set(r.name,r.entries.map(o=>o.name));for(const r of this.saved){const o=e.get(r.category);o===void 0?e.set(r.category,[r.name]):o.push(r.name)}const t=r=>r===ec?0:r===Ws?2:1,s=[...e.entries()].filter(([,r])=>r.length>0).sort(([r],[o])=>t(r)-t(o)||r.localeCompare(o)),a={},i=[];for(const[r,o]of s){const c=[...o].sort((l,d)=>l.localeCompare(d));a[r]=Object.freeze(c),r!==Ws&&i.push(...c)}return{categories:Object.freeze(a),order:Object.freeze(i)}}entry(e,t){const s=this.saved.find(a=>a.category===e&&a.name===t);if(s!==void 0)return{name:s.name,category:s.category,source:"idb"};for(const a of this.manifest.categories){if(a.name!==e)continue;const i=a.entries.find(r=>r.name===t);if(i!==void 0)return{name:t,category:e,source:"manifest",path:i.path}}return null}entryByName(e){for(const t of Object.keys(this.catalog().categories)){const s=this.entry(t,e);if(s!==null)return s}return null}async read(e){const t=`${e.category}/${e.name}`;if(e.source==="manifest"){if(e.path===void 0)throw new Error(`${t}: manifest entry has no path`);return Ps(await Jl(e.path),t)}if(this.db===null)throw new pn;const s=await $l(this.db,fn(e.category,e.name));if(s===void 0)throw new Error(`${t}: no such saved config`);return Ps(s.document,t)}async savedDocuments(){return this.db===null?[]:(this.saved=await Lt(this.db),this.saved.filter(e=>e.category===tc).map(e=>({name:e.name,document:e.document})))}async savedNames(){return(await this.savedDocuments()).map(e=>e.name)}async write(e,t,s){if(this.db===null)throw new pn;await Kl(this.db,{id:fn(e,t),category:e,name:t,document:s,savedAt:Date.now()}),this.saved=await Lt(this.db)}async remove(e){if(e.source==="manifest")throw new Error(`${e.name} is a shipped preset and cannot be deleted.`);if(this.db===null)throw new pn;await Xl(this.db,fn(e.category,e.name)),this.saved=await Lt(this.db)}}const nc=["select","shove","walls","trails"];function sm(n){return nc.includes(n)?n:null}function sc(n){return n==="walls"?"walls":n==="trails"?"trails":null}function ac(n){return sc(n)!==null}function ic(n){return ac(n)||n==="shove"}function am(n,e){const t=ic(n);return!t&&!e?null:{centred:e,decorated:t}}const rc=.004,oc=30,qs=.75;function im(n,e){if(e.paused||e.mouseMode!=="shove")return null;const t=n.leftDragging,s=n.rightDragging&&!t;if(!t&&!s)return null;const a=Oe(n.mousePos,e.windowSize,e.canvasSize,e.pan,e.zoom),r=Math.max(1,Math.trunc(e.physicsSteps))**qs/oc**(qs-1);let o=rc*e.drawPower/r;return s&&(o=-o),{center:a,strength:o,size:Or(e.drawSize)}}const lc=`// ============================================================================
// cameraIngest.wgsl -- the camera picture into the field's space, as two
// scalars: brightness (r) and motion (g).
//
// Runs once per CAMERA frame (not per rendered frame, not per sub-step) into
// one of two ping-ponged CAMERA_FIELD_DIM-square rg16float targets; \`previous\`
// is the other one, which is what Motion is measured against.
//
// ----------------------------------------------------------------------------
// COORDINATES -- the whole reason this file needs a header
// ----------------------------------------------------------------------------
// The target is indexed by \`@builtin(position)\`, NOT by fullscreenQuad's \`uv\`.
// So texel row 0 is field v = 0 here, which is the convention every READER of
// these textures uses too (textureSample's v = 0 is row 0). That is the same
// space \`world_to_uv\` produces in entityUpdate.wgsl, where v = 0 is the BOTTOM
// of the world. One convention from end to end: no pass in webcam/ flips v
// between textures, so none of them can disagree about it.
//
// The flip happens exactly once, HERE, reading the camera: an image copied in
// by \`copyExternalImageToTexture\` has its TOP row at row 0. Field v = 0 (world
// bottom) must read image v = 1 (picture bottom), hence \`c.y = 1.0 - c.y\`.
// Without it the picture is upside down on the particles AND in the preview --
// at least the two would agree, which is why it is worth saying here.
//
// The field is square but the world is not: the field is STRETCHED over the
// world (entityUpdate reads it with the canvas's aspect). So the crop below
// covers the WORLD's aspect, not the texture's, and the camera is cropped to
// fill it -- never squashed, never letterboxed.
// ============================================================================

// ==== begin include: fullscreenQuad.wgsl ====
// The fullscreen quad, shared by every pass that covers the screen.
//
// The desktop's \`shared/shaders/fullscreen_quad.vert\` is shared across five
// consumers; this is that file. Consumers here:
//
//   camera/shaders/camera.wgsl              TRAIL present
//   camera/shaders/accumulate.wgsl          motion blur accumulation
//   assembler/shaders/bloomDownsample.wgsl  the mip chain, down
//   assembler/shaders/bloomUpsample.wgsl    the mip chain, up
//   assembler/shaders/frameAssembly.wgsl    bloom, tone curve, overlays
//   webcam/shaders/cameraPreview.wgsl       the Camera tab's thumbnail
//   webcam/shaders/camera{Ingest,Blur,Map}.wgsl -- the VERTEX only. They render
//                                           into textures the particles sample,
//                                           so they index by @builtin(position)
//                                           and ignore \`uv\`; see cameraIngest.
//
// NOT a consumer: \`particleSystem/shaders/canvas.wgsl\`. It needs the V FLIP
// (see its header) because it rasterizes into the canvas texture and every
// fragment must read the texel it is about to write; every consumer above needs
// NO flip. Merging the two behind a boolean parameter would put the single most
// dangerous decision in this port -- the one Step 4 lost the most time to --
// behind an argument that is easy to pass wrong and impossible to see in a
// diff. Two small definitions, each unconditionally correct, is the right shape.
//
// WHY NOT IN common.wgsl. That file declares no bindings and must stay
// stage-agnostic (its own editing rules 3 and 4), and a \`@vertex\` entry point
// is the opposite of stage-agnostic. It is also parsed by \`common.wgsl.test.ts\`
// against the generated layout descriptor, so unrelated additions there are
// noise in a file whose job is struct layout.
//
// NO VERTEX BUFFER. The quad comes from \`@builtin(vertex_index)\`, so there is
// nothing to allocate, bind or keep in sync. Drawn as \`draw(4)\` with
// \`topology: 'triangle-strip'\` -- TRIANGLE_FAN is not a WebGPU topology, which
// is why the corner order below is strip order rather than the desktop's fan.

struct FsQuadVsOut {
    @builtin(position) clip : vec4f,
    @location(0) uv : vec2f,
}

// Strip order: (-,-) (+,-) (-,+) (+,+). The same order \`canvas.wgsl\` and the
// deleted \`debugPresent.wgsl\` use, so all four agree by inspection.
fn fullscreen_corner(vi: u32) -> vec2f {
    var corners = array<vec2f, 4>(
        vec2f(-1.0, -1.0),
        vec2f( 1.0, -1.0),
        vec2f(-1.0,  1.0),
        vec2f( 1.0,  1.0),
    );
    return corners[vi];
}

// NO Y FLIP, for every consumer of this entry point.
//
// The canvas texture is stored TOP-LEFT-ORIGIN: the trail deposit
// (entityUpdate.wgsl) writes each pixel at the texture row \`get_can\` samples,
// and canvas.wgsl flips v to read back the texel it writes, so the stored image
// matches WebGPU's framebuffer convention. Sampling it straight therefore puts
// world +y at the top of the screen, matching the desktop. See \`web/README.md\`'s
// Y-flip section.
//
// The intermediate targets (hdr, accum, the bloom mips) are all WRITTEN by
// passes using this entry point and READ by passes using this entry point, so
// they are internally consistent whatever convention is chosen -- the only
// externally observable flips are \`camera.wgsl\` reading the canvas and
// \`frameAssembly.wgsl\` reading the strafe field, and both want none.
@vertex
fn fullscreen_vs(@builtin(vertex_index) vi : u32) -> FsQuadVsOut {
    let p = fullscreen_corner(vi);
    var out : FsQuadVsOut;
    out.clip = vec4f(p, 0.0, 1.0);
    out.uv = p * 0.5 + 0.5;
    return out;
}

// ==== end include: fullscreenQuad.wgsl ====

struct IngestUniforms {
    // xy: camera-uv span per field-uv span (the cover crop; <= 1 on each axis)
    // z:  mirror left-right (1) or not (0)
    // w:  primed (1) -- \`previous\` holds a real frame of THIS stream
    params : vec4f,
}

@group(0) @binding(0) var<uniform> u : IngestUniforms;
@group(0) @binding(1) var camera_image : texture_2d<f32>;
@group(0) @binding(2) var image_sampler : sampler;
@group(0) @binding(3) var previous : texture_2d<f32>;

// Camera sensors are noisy: two frames of a still scene differ by a percent or
// two per pixel. Below this, a difference is noise and counts as no motion.
const MOTION_FLOOR : f32 = 0.04;
// A hand crossing a plain wall changes brightness by ~0.2-0.5; this brings that
// to the 0.5-1 range the mapping expects of a strong feature.
const MOTION_GAIN : f32 = 3.0;
// How much of last frame's motion survives into this one. A short tail, so a
// moving hand leaves a smear for a few frames rather than flickering in and
// out between camera frames where it happened to be caught mid-blur.
const MOTION_DECAY : f32 = 0.8;

@fragment
fn ingest_fs(in : FsQuadVsOut) -> @location(0) vec4f {
    let texel = vec2i(in.clip.xy);
    let f = in.clip.xy / vec2f(textureDimensions(previous));

    var c = (f - 0.5) * u.params.xy + 0.5;
    if (u.params.z > 0.5) { c.x = 1.0 - c.x; }
    c.y = 1.0 - c.y;

    let rgb = textureSampleLevel(camera_image, image_sampler, c, 0.0).rgb;
    let lum = dot(rgb, vec3f(0.2126, 0.7152, 0.0722));

    // An unprimed \`previous\` is a different stream's last frame, or nothing --
    // differencing against it would light up the whole picture as "moved".
    var motion = 0.0;
    if (u.params.w > 0.5) {
        let prev = textureLoad(previous, texel, 0).rg;
        let fresh = max(abs(lum - prev.r) - MOTION_FLOOR, 0.0) * MOTION_GAIN;
        motion = min(max(fresh, prev.g * MOTION_DECAY), 1.0);
    }
    return vec4f(lum, motion, 0.0, 1.0);
}
`,cc=`// ============================================================================
// cameraBlur.wgsl -- one axis of a separable gaussian over both scalars.
//
// Run twice, horizontal then vertical, between ingest and map. For Motion the
// blur is load-bearing rather than cosmetic: the raw derivative of a
// camera frame is sensor grain, and particles chasing it jitter in place. A
// blur wide enough turns a hand into one smooth basin with a slope pointing at
// it, which is what "toward the moving thing" needs.
//
// FIXED TAP COUNT, VARIABLE SPACING. 25 taps whose spacing grows with sigma, so
// the cost is the same at every slider position and the kernel always spans
// +-3 sigma. At wide sigma the taps are several texels apart, which the linear
// sampler and the field's smoothness make invisible.
//
// Same coordinate convention as cameraIngest.wgsl: texels by position, v = 0 at
// row 0. A blur cannot flip anything, but it must not start to.
// ============================================================================

// ==== begin include: fullscreenQuad.wgsl ====
// The fullscreen quad, shared by every pass that covers the screen.
//
// The desktop's \`shared/shaders/fullscreen_quad.vert\` is shared across five
// consumers; this is that file. Consumers here:
//
//   camera/shaders/camera.wgsl              TRAIL present
//   camera/shaders/accumulate.wgsl          motion blur accumulation
//   assembler/shaders/bloomDownsample.wgsl  the mip chain, down
//   assembler/shaders/bloomUpsample.wgsl    the mip chain, up
//   assembler/shaders/frameAssembly.wgsl    bloom, tone curve, overlays
//   webcam/shaders/cameraPreview.wgsl       the Camera tab's thumbnail
//   webcam/shaders/camera{Ingest,Blur,Map}.wgsl -- the VERTEX only. They render
//                                           into textures the particles sample,
//                                           so they index by @builtin(position)
//                                           and ignore \`uv\`; see cameraIngest.
//
// NOT a consumer: \`particleSystem/shaders/canvas.wgsl\`. It needs the V FLIP
// (see its header) because it rasterizes into the canvas texture and every
// fragment must read the texel it is about to write; every consumer above needs
// NO flip. Merging the two behind a boolean parameter would put the single most
// dangerous decision in this port -- the one Step 4 lost the most time to --
// behind an argument that is easy to pass wrong and impossible to see in a
// diff. Two small definitions, each unconditionally correct, is the right shape.
//
// WHY NOT IN common.wgsl. That file declares no bindings and must stay
// stage-agnostic (its own editing rules 3 and 4), and a \`@vertex\` entry point
// is the opposite of stage-agnostic. It is also parsed by \`common.wgsl.test.ts\`
// against the generated layout descriptor, so unrelated additions there are
// noise in a file whose job is struct layout.
//
// NO VERTEX BUFFER. The quad comes from \`@builtin(vertex_index)\`, so there is
// nothing to allocate, bind or keep in sync. Drawn as \`draw(4)\` with
// \`topology: 'triangle-strip'\` -- TRIANGLE_FAN is not a WebGPU topology, which
// is why the corner order below is strip order rather than the desktop's fan.

struct FsQuadVsOut {
    @builtin(position) clip : vec4f,
    @location(0) uv : vec2f,
}

// Strip order: (-,-) (+,-) (-,+) (+,+). The same order \`canvas.wgsl\` and the
// deleted \`debugPresent.wgsl\` use, so all four agree by inspection.
fn fullscreen_corner(vi: u32) -> vec2f {
    var corners = array<vec2f, 4>(
        vec2f(-1.0, -1.0),
        vec2f( 1.0, -1.0),
        vec2f(-1.0,  1.0),
        vec2f( 1.0,  1.0),
    );
    return corners[vi];
}

// NO Y FLIP, for every consumer of this entry point.
//
// The canvas texture is stored TOP-LEFT-ORIGIN: the trail deposit
// (entityUpdate.wgsl) writes each pixel at the texture row \`get_can\` samples,
// and canvas.wgsl flips v to read back the texel it writes, so the stored image
// matches WebGPU's framebuffer convention. Sampling it straight therefore puts
// world +y at the top of the screen, matching the desktop. See \`web/README.md\`'s
// Y-flip section.
//
// The intermediate targets (hdr, accum, the bloom mips) are all WRITTEN by
// passes using this entry point and READ by passes using this entry point, so
// they are internally consistent whatever convention is chosen -- the only
// externally observable flips are \`camera.wgsl\` reading the canvas and
// \`frameAssembly.wgsl\` reading the strafe field, and both want none.
@vertex
fn fullscreen_vs(@builtin(vertex_index) vi : u32) -> FsQuadVsOut {
    let p = fullscreen_corner(vi);
    var out : FsQuadVsOut;
    out.clip = vec4f(p, 0.0, 1.0);
    out.uv = p * 0.5 + 0.5;
    return out;
}

// ==== end include: fullscreenQuad.wgsl ====

struct BlurUniforms {
    // xy: uv offset between adjacent taps (one axis is zero)
    // z:  1 to blur, 0 to pass through (sigma below half a texel)
    // w:  unused
    params : vec4f,
}

@group(0) @binding(0) var<uniform> u : BlurUniforms;
@group(0) @binding(1) var src : texture_2d<f32>;
@group(0) @binding(2) var src_sampler : sampler;

const TAPS_EACH_SIDE : i32 = 12;
// Sigma, in TAPS: 12 taps cover 3 sigma.
const SIGMA_TAPS : f32 = 4.0;

@fragment
fn blur_fs(in : FsQuadVsOut) -> @location(0) vec4f {
    let f = in.clip.xy / vec2f(textureDimensions(src));
    if (u.params.z < 0.5) {
        return vec4f(textureSampleLevel(src, src_sampler, f, 0.0).rg, 0.0, 1.0);
    }
    var sum = vec2f(0.0);
    var weight = 0.0;
    for (var i = -TAPS_EACH_SIDE; i <= TAPS_EACH_SIDE; i++) {
        let t = f32(i) / SIGMA_TAPS;
        let w = exp(-0.5 * t * t);
        sum += textureSampleLevel(src, src_sampler, f + f32(i) * u.params.xy, 0.0).rg * w;
        weight += w;
    }
    return vec4f(sum / weight, 0.0, 1.0);
}
`,hc=`// ============================================================================
// cameraMap.wgsl -- the blurred scalars into the vector field the particles read.
//
// The output IS the camera field: entityUpdate.wgsl's \`get_camera\` samples it
// and multiplies by the destination's strength, nothing more. So every number
// the particles see is decided here and in the gain arithmetic in
// \`webcamSettings.ts\` -- there is no third place.
//
// ----------------------------------------------------------------------------
// VECTORS ARE IN WORLD AXES, y UP
// ----------------------------------------------------------------------------
// Texel row increases with v, and v increases toward the TOP of the world (see
// cameraIngest.wgsl), so a difference taken along +row is a derivative along
// world +y with no sign fix. The vector this writes is added straight to a
// world position (walls) or to a sensed trail vector (trails), both y-up.
//
// ----------------------------------------------------------------------------
// THE STENCIL IS ISOTROPIC IN THE WORLD, NOT IN THE TEXTURE
// ----------------------------------------------------------------------------
// The field is square and the world usually is not, so a texel is wider than
// it is tall (or the reverse). Neighbours are therefore taken a fixed WORLD
// distance away -- \`radius\` along v, \`radius / aspect\` along u -- so a circle in
// the picture yields a symmetric gradient rather than one stretched along the
// world's long axis. The radius follows the blur (never under one texel on
// either axis -- the host guarantees it), which keeps every mapping's output
// O(1) at any blur: a difference ACROSS a blurred edge, not along a fraction of
// one.
//
// The index of each mapping is \`CAMERA_MAPPINGS\`' order in webcamSettings.ts.
// ============================================================================

// ==== begin include: fullscreenQuad.wgsl ====
// The fullscreen quad, shared by every pass that covers the screen.
//
// The desktop's \`shared/shaders/fullscreen_quad.vert\` is shared across five
// consumers; this is that file. Consumers here:
//
//   camera/shaders/camera.wgsl              TRAIL present
//   camera/shaders/accumulate.wgsl          motion blur accumulation
//   assembler/shaders/bloomDownsample.wgsl  the mip chain, down
//   assembler/shaders/bloomUpsample.wgsl    the mip chain, up
//   assembler/shaders/frameAssembly.wgsl    bloom, tone curve, overlays
//   webcam/shaders/cameraPreview.wgsl       the Camera tab's thumbnail
//   webcam/shaders/camera{Ingest,Blur,Map}.wgsl -- the VERTEX only. They render
//                                           into textures the particles sample,
//                                           so they index by @builtin(position)
//                                           and ignore \`uv\`; see cameraIngest.
//
// NOT a consumer: \`particleSystem/shaders/canvas.wgsl\`. It needs the V FLIP
// (see its header) because it rasterizes into the canvas texture and every
// fragment must read the texel it is about to write; every consumer above needs
// NO flip. Merging the two behind a boolean parameter would put the single most
// dangerous decision in this port -- the one Step 4 lost the most time to --
// behind an argument that is easy to pass wrong and impossible to see in a
// diff. Two small definitions, each unconditionally correct, is the right shape.
//
// WHY NOT IN common.wgsl. That file declares no bindings and must stay
// stage-agnostic (its own editing rules 3 and 4), and a \`@vertex\` entry point
// is the opposite of stage-agnostic. It is also parsed by \`common.wgsl.test.ts\`
// against the generated layout descriptor, so unrelated additions there are
// noise in a file whose job is struct layout.
//
// NO VERTEX BUFFER. The quad comes from \`@builtin(vertex_index)\`, so there is
// nothing to allocate, bind or keep in sync. Drawn as \`draw(4)\` with
// \`topology: 'triangle-strip'\` -- TRIANGLE_FAN is not a WebGPU topology, which
// is why the corner order below is strip order rather than the desktop's fan.

struct FsQuadVsOut {
    @builtin(position) clip : vec4f,
    @location(0) uv : vec2f,
}

// Strip order: (-,-) (+,-) (-,+) (+,+). The same order \`canvas.wgsl\` and the
// deleted \`debugPresent.wgsl\` use, so all four agree by inspection.
fn fullscreen_corner(vi: u32) -> vec2f {
    var corners = array<vec2f, 4>(
        vec2f(-1.0, -1.0),
        vec2f( 1.0, -1.0),
        vec2f(-1.0,  1.0),
        vec2f( 1.0,  1.0),
    );
    return corners[vi];
}

// NO Y FLIP, for every consumer of this entry point.
//
// The canvas texture is stored TOP-LEFT-ORIGIN: the trail deposit
// (entityUpdate.wgsl) writes each pixel at the texture row \`get_can\` samples,
// and canvas.wgsl flips v to read back the texel it writes, so the stored image
// matches WebGPU's framebuffer convention. Sampling it straight therefore puts
// world +y at the top of the screen, matching the desktop. See \`web/README.md\`'s
// Y-flip section.
//
// The intermediate targets (hdr, accum, the bloom mips) are all WRITTEN by
// passes using this entry point and READ by passes using this entry point, so
// they are internally consistent whatever convention is chosen -- the only
// externally observable flips are \`camera.wgsl\` reading the canvas and
// \`frameAssembly.wgsl\` reading the strafe field, and both want none.
@vertex
fn fullscreen_vs(@builtin(vertex_index) vi : u32) -> FsQuadVsOut {
    let p = fullscreen_corner(vi);
    var out : FsQuadVsOut;
    out.clip = vec4f(p, 0.0, 1.0);
    out.uv = p * 0.5 + 0.5;
    return out;
}

// ==== end include: fullscreenQuad.wgsl ====

struct MapUniforms {
    // x: mapping   0 edges across, 1 edges along, 2 motion, 3 motion gravity
    // y: sign      +1 toward, -1 away
    // z: aspect    world width / world height
    // w: radius    stencil distance, in field-v units (world-height fractions)
    params : vec4f,
}

@group(0) @binding(0) var<uniform> u : MapUniforms;
@group(0) @binding(1) var src : texture_2d<f32>;
@group(0) @binding(2) var src_sampler : sampler;
// Motion gravity's coarse pull, built by cameraGravity.wgsl. Bound always (the
// pipeline's layout includes it); only read while the mapping is 3.
@group(0) @binding(3) var gravity : texture_2d<f32>;

// Motion values are small next to brightness (a smear of 0.3 is a lot of
// movement), so its slope is scaled up to sit beside the others at one Gain.
const MOTION_SLOPE_GAIN : f32 = 3.0;
// A step from black to white scores 4 under the Sobel weights, so this puts
// the strongest edge a picture can hold at 1.
const SOBEL_FULL : f32 = 4.0;

// The channel this mapping reads: motion (g) for Motion, brightness (r) else.
fn scalar_at(uv : vec2f, channel : i32) -> f32 {
    let s = textureSampleLevel(src, src_sampler, uv, 0.0);
    return select(s.r, s.g, channel == 1);
}

@fragment
fn map_fs(in : FsQuadVsOut) -> @location(0) vec4f {
    let f = in.clip.xy / vec2f(textureDimensions(src));
    let mapping = i32(round(u.params.x));
    let dx = vec2f(u.params.w / u.params.z, 0.0);
    let dy = vec2f(0.0, u.params.w);

    var v = vec2f(0.0);
    if (mapping == 2) {
        // Motion: central differences of the motion scalar across the stencil,
        // so the vector points toward whatever is moving.
        let g = vec2f(scalar_at(f + dx, 1) - scalar_at(f - dx, 1),
                      scalar_at(f + dy, 1) - scalar_at(f - dy, 1));
        v = g * MOTION_SLOPE_GAIN;
    } else if (mapping == 3) {
        // Motion gravity: the long-range pull, already summed at 32^2 and
        // smooth, so a bilinear read is the whole of it.
        v = textureSampleLevel(gravity, src_sampler, f, 0.0).xy;
    } else {
        // Sobel: direction and strength kept apart, so a soft ramp steers as
        // firmly as a hard edge and Gain means the same thing for both.
        let tl = scalar_at(f - dx + dy, 0);
        let tc = scalar_at(f + dy, 0);
        let tr = scalar_at(f + dx + dy, 0);
        let ml = scalar_at(f - dx, 0);
        let mr = scalar_at(f + dx, 0);
        let bl = scalar_at(f - dx - dy, 0);
        let bc = scalar_at(f - dy, 0);
        let br = scalar_at(f + dx - dy, 0);
        let g = vec2f((tr + 2.0 * mr + br) - (tl + 2.0 * ml + bl),
                      (tl + 2.0 * tc + tr) - (bl + 2.0 * bc + br));
        let len = length(g);
        // An \`if\`, not select(): \`g / len\` at len == 0 is a NaN.
        var dir = vec2f(0.0);
        if (len > 1e-5) { dir = g / len; }
        let mag = clamp(len / SOBEL_FULL, 0.0, 1.0);
        v = dir * mag;
        // Along: a quarter turn, so particles trace the outline rather than
        // crossing it.
        if (mapping == 1) { v = vec2f(-v.y, v.x); }
    }

    v *= u.params.y;
    // Soft ceiling at length 1, so Gain alone decides how hard the strongest
    // feature pushes -- Motion's slope gain can otherwise overshoot on a fast
    // hand, and a slope steeper than one stencil can on a hard edge.
    v /= max(1.0, length(v));
    // The particles must never see a non-finite value; it would poison a
    // position for good.
    if (any(v != v) || any(abs(v) > vec2f(1e4))) { v = vec2f(0.0); }
    return vec4f(v, 0.0, 1.0);
}
`,dc=`// ============================================================================
// cameraGravity.wgsl -- Motion gravity: every moving area pulls on everything.
//
// The other mappings are LOCAL: each texel of the field looks only at its own
// stencil, so a particle across the screen from a waved hand feels nothing.
// Gravity is the opposite. The amount of motion at each spot is treated as
// mass, and the pull at a point is the sum of every mass's pull on it --
// stronger when closer and when there is more motion.
//
// Two passes, both into small GRAVITY_DIM-square targets, run only while the
// mapping is Motion gravity (see \`WebcamField.remap\`):
//
//   mass_fs     blurred scalars (256^2) -> motion mass per coarse cell (32^2)
//   gravity_fs  mass grid               -> the pull at each coarse cell (32^2)
//
// cameraMap.wgsl then samples the 32^2 pull bilinearly into the full field.
// A long-range pull is smooth by nature, so computing it coarsely loses
// nothing worth keeping, and it turns a 65k x 1k sum into a 1k x 1k one.
//
// ----------------------------------------------------------------------------
// THE LAW
// ----------------------------------------------------------------------------
//   pull = sum over cells of  mass * area * dir * (REFERENCE_DISTANCE / r)^falloff
// with r softened (SOFTENING) so a particle sitting on the motion is not flung.
// Writing the falloff relative to a reference distance keeps a Falloff change
// from also rescaling the overall strength: at REFERENCE_DISTANCE the pull is
// the same whatever the exponent, and only how it changes with distance moves.
// Falloff 0 pulls equally from anywhere; 1 is 2D gravity; 2 is 3D gravity.
//
// Like the other camera passes, positions come from in.clip.xy and rows run
// v-up, so a difference along +row is world +y with no sign fix.
// ============================================================================

// ==== begin include: fullscreenQuad.wgsl ====
// The fullscreen quad, shared by every pass that covers the screen.
//
// The desktop's \`shared/shaders/fullscreen_quad.vert\` is shared across five
// consumers; this is that file. Consumers here:
//
//   camera/shaders/camera.wgsl              TRAIL present
//   camera/shaders/accumulate.wgsl          motion blur accumulation
//   assembler/shaders/bloomDownsample.wgsl  the mip chain, down
//   assembler/shaders/bloomUpsample.wgsl    the mip chain, up
//   assembler/shaders/frameAssembly.wgsl    bloom, tone curve, overlays
//   webcam/shaders/cameraPreview.wgsl       the Camera tab's thumbnail
//   webcam/shaders/camera{Ingest,Blur,Map}.wgsl -- the VERTEX only. They render
//                                           into textures the particles sample,
//                                           so they index by @builtin(position)
//                                           and ignore \`uv\`; see cameraIngest.
//
// NOT a consumer: \`particleSystem/shaders/canvas.wgsl\`. It needs the V FLIP
// (see its header) because it rasterizes into the canvas texture and every
// fragment must read the texel it is about to write; every consumer above needs
// NO flip. Merging the two behind a boolean parameter would put the single most
// dangerous decision in this port -- the one Step 4 lost the most time to --
// behind an argument that is easy to pass wrong and impossible to see in a
// diff. Two small definitions, each unconditionally correct, is the right shape.
//
// WHY NOT IN common.wgsl. That file declares no bindings and must stay
// stage-agnostic (its own editing rules 3 and 4), and a \`@vertex\` entry point
// is the opposite of stage-agnostic. It is also parsed by \`common.wgsl.test.ts\`
// against the generated layout descriptor, so unrelated additions there are
// noise in a file whose job is struct layout.
//
// NO VERTEX BUFFER. The quad comes from \`@builtin(vertex_index)\`, so there is
// nothing to allocate, bind or keep in sync. Drawn as \`draw(4)\` with
// \`topology: 'triangle-strip'\` -- TRIANGLE_FAN is not a WebGPU topology, which
// is why the corner order below is strip order rather than the desktop's fan.

struct FsQuadVsOut {
    @builtin(position) clip : vec4f,
    @location(0) uv : vec2f,
}

// Strip order: (-,-) (+,-) (-,+) (+,+). The same order \`canvas.wgsl\` and the
// deleted \`debugPresent.wgsl\` use, so all four agree by inspection.
fn fullscreen_corner(vi: u32) -> vec2f {
    var corners = array<vec2f, 4>(
        vec2f(-1.0, -1.0),
        vec2f( 1.0, -1.0),
        vec2f(-1.0,  1.0),
        vec2f( 1.0,  1.0),
    );
    return corners[vi];
}

// NO Y FLIP, for every consumer of this entry point.
//
// The canvas texture is stored TOP-LEFT-ORIGIN: the trail deposit
// (entityUpdate.wgsl) writes each pixel at the texture row \`get_can\` samples,
// and canvas.wgsl flips v to read back the texel it writes, so the stored image
// matches WebGPU's framebuffer convention. Sampling it straight therefore puts
// world +y at the top of the screen, matching the desktop. See \`web/README.md\`'s
// Y-flip section.
//
// The intermediate targets (hdr, accum, the bloom mips) are all WRITTEN by
// passes using this entry point and READ by passes using this entry point, so
// they are internally consistent whatever convention is chosen -- the only
// externally observable flips are \`camera.wgsl\` reading the canvas and
// \`frameAssembly.wgsl\` reading the strafe field, and both want none.
@vertex
fn fullscreen_vs(@builtin(vertex_index) vi : u32) -> FsQuadVsOut {
    let p = fullscreen_corner(vi);
    var out : FsQuadVsOut;
    out.clip = vec4f(p, 0.0, 1.0);
    out.uv = p * 0.5 + 0.5;
    return out;
}

// ==== end include: fullscreenQuad.wgsl ====

struct GravityUniforms {
    // x: aspect   world width / world height
    // y: falloff  exponent, see THE LAW above
    // z, w: unused
    params : vec4f,
}

@group(0) @binding(0) var<uniform> u : GravityUniforms;
@group(0) @binding(1) var src : texture_2d<f32>;
@group(0) @binding(2) var src_sampler : sampler;
@group(0) @binding(3) var mass : texture_2d<f32>;

// Must match \`GRAVITY_DIM\` in webcamField.ts, which sizes the targets.
const GRAVITY_DIM : i32 = 32;
// Where Falloff stops mattering to strength: a quarter of the world's height.
const REFERENCE_DISTANCE : f32 = 0.25;
// Softens r near the motion itself, in world-height units (~1.5 cells).
const SOFTENING : f32 = 0.05;
// TUNED BY EYE, like the other camera gains: a hand-sized patch of motion
// (0.3 over a tenth of the world each way) pulls at about 0.5 from a quarter
// of the screen away, before the soft ceiling in cameraMap.wgsl.
const GRAVITY_GAIN : f32 = 150.0;
// Cells quieter than this are skipped: they pull next to nothing anyway.
const MASS_FLOOR : f32 = 1e-4;

// The motion channel averaged over this cell's block of the blurred field.
// Each bilinear tap lands on a texel corner and so averages a 2x2 group; 4x4
// such taps cover an 8x8 block exactly, so no motion falls between samples.
@fragment
fn mass_fs(in : FsQuadVsOut) -> @location(0) vec4f {
    let cell = floor(in.clip.xy);
    let src_dim = vec2f(textureDimensions(src));
    let block = src_dim / f32(GRAVITY_DIM);
    let origin = cell * block;
    let step = block / 4.0;
    var sum = 0.0;
    for (var j = 0; j < 4; j++) {
        for (var i = 0; i < 4; i++) {
            let texel = origin + (vec2f(f32(i), f32(j)) + 0.5) * step;
            sum += textureSampleLevel(src, src_sampler, texel / src_dim, 0.0).g;
        }
    }
    return vec4f(sum / 16.0, 0.0, 0.0, 1.0);
}

// The summed pull of every cell's mass on this one, in world axes.
@fragment
fn gravity_fs(in : FsQuadVsOut) -> @location(0) vec4f {
    let aspect = u.params.x;
    let falloff = u.params.y;
    let here = floor(in.clip.xy);
    // One cell's size in world units: the world is \`aspect\` wide, 1 tall.
    let cell = vec2f(aspect, 1.0) / f32(GRAVITY_DIM);
    let area = cell.x * cell.y;
    let s2 = SOFTENING * SOFTENING;
    var pull = vec2f(0.0);
    for (var j = 0; j < GRAVITY_DIM; j++) {
        for (var i = 0; i < GRAVITY_DIM; i++) {
            let m = textureLoad(mass, vec2i(i, j), 0).r;
            if (m < MASS_FLOOR) { continue; }
            let d = (vec2f(f32(i), f32(j)) - here) * cell;
            let r = sqrt(dot(d, d) + s2);
            pull += (m * area) * (d / r) * pow(REFERENCE_DISTANCE / r, falloff);
        }
    }
    var v = pull * GRAVITY_GAIN;
    // Never hand on a non-finite value; see cameraMap.wgsl.
    if (any(v != v) || any(abs(v) > vec2f(1e4))) { v = vec2f(0.0); }
    return vec4f(v, 0.0, 1.0);
}
`,uc=`// ============================================================================
// cameraPreview.wgsl -- the Camera tab's thumbnail: the field the particles
// read, NOT the camera picture.
//
// Direction as hue, strength as brightness -- the colouring camera.wgsl gives
// the trail canvas (\`atan2(y, x)\` around the wheel, saturation 0.75), so a
// camera vector and a trail pointing the same way are the same colour, and the
// thumbnail reads as "this is what the particles will be told". Raw RG would
// show two opposite vectors as much the same colour.
//
// THIS PASS DRAWS TO A SCREEN, so it uses fullscreenQuad's \`uv\` -- v = 1 at
// the top of the canvas -- to sample a texture whose v = 1 is the TOP of the
// world (see cameraIngest.wgsl). Up is up, with no flip, for the same reason
// sampling the trail canvas to the screen needs none.
// ============================================================================

// ==== begin include: fullscreenQuad.wgsl ====
// The fullscreen quad, shared by every pass that covers the screen.
//
// The desktop's \`shared/shaders/fullscreen_quad.vert\` is shared across five
// consumers; this is that file. Consumers here:
//
//   camera/shaders/camera.wgsl              TRAIL present
//   camera/shaders/accumulate.wgsl          motion blur accumulation
//   assembler/shaders/bloomDownsample.wgsl  the mip chain, down
//   assembler/shaders/bloomUpsample.wgsl    the mip chain, up
//   assembler/shaders/frameAssembly.wgsl    bloom, tone curve, overlays
//   webcam/shaders/cameraPreview.wgsl       the Camera tab's thumbnail
//   webcam/shaders/camera{Ingest,Blur,Map}.wgsl -- the VERTEX only. They render
//                                           into textures the particles sample,
//                                           so they index by @builtin(position)
//                                           and ignore \`uv\`; see cameraIngest.
//
// NOT a consumer: \`particleSystem/shaders/canvas.wgsl\`. It needs the V FLIP
// (see its header) because it rasterizes into the canvas texture and every
// fragment must read the texel it is about to write; every consumer above needs
// NO flip. Merging the two behind a boolean parameter would put the single most
// dangerous decision in this port -- the one Step 4 lost the most time to --
// behind an argument that is easy to pass wrong and impossible to see in a
// diff. Two small definitions, each unconditionally correct, is the right shape.
//
// WHY NOT IN common.wgsl. That file declares no bindings and must stay
// stage-agnostic (its own editing rules 3 and 4), and a \`@vertex\` entry point
// is the opposite of stage-agnostic. It is also parsed by \`common.wgsl.test.ts\`
// against the generated layout descriptor, so unrelated additions there are
// noise in a file whose job is struct layout.
//
// NO VERTEX BUFFER. The quad comes from \`@builtin(vertex_index)\`, so there is
// nothing to allocate, bind or keep in sync. Drawn as \`draw(4)\` with
// \`topology: 'triangle-strip'\` -- TRIANGLE_FAN is not a WebGPU topology, which
// is why the corner order below is strip order rather than the desktop's fan.

struct FsQuadVsOut {
    @builtin(position) clip : vec4f,
    @location(0) uv : vec2f,
}

// Strip order: (-,-) (+,-) (-,+) (+,+). The same order \`canvas.wgsl\` and the
// deleted \`debugPresent.wgsl\` use, so all four agree by inspection.
fn fullscreen_corner(vi: u32) -> vec2f {
    var corners = array<vec2f, 4>(
        vec2f(-1.0, -1.0),
        vec2f( 1.0, -1.0),
        vec2f(-1.0,  1.0),
        vec2f( 1.0,  1.0),
    );
    return corners[vi];
}

// NO Y FLIP, for every consumer of this entry point.
//
// The canvas texture is stored TOP-LEFT-ORIGIN: the trail deposit
// (entityUpdate.wgsl) writes each pixel at the texture row \`get_can\` samples,
// and canvas.wgsl flips v to read back the texel it writes, so the stored image
// matches WebGPU's framebuffer convention. Sampling it straight therefore puts
// world +y at the top of the screen, matching the desktop. See \`web/README.md\`'s
// Y-flip section.
//
// The intermediate targets (hdr, accum, the bloom mips) are all WRITTEN by
// passes using this entry point and READ by passes using this entry point, so
// they are internally consistent whatever convention is chosen -- the only
// externally observable flips are \`camera.wgsl\` reading the canvas and
// \`frameAssembly.wgsl\` reading the strafe field, and both want none.
@vertex
fn fullscreen_vs(@builtin(vertex_index) vi : u32) -> FsQuadVsOut {
    let p = fullscreen_corner(vi);
    var out : FsQuadVsOut;
    out.clip = vec4f(p, 0.0, 1.0);
    out.uv = p * 0.5 + 0.5;
    return out;
}

// ==== end include: fullscreenQuad.wgsl ====

@group(0) @binding(0) var field : texture_2d<f32>;
@group(0) @binding(1) var field_sampler : sampler;

fn hsv2rgb(c : vec3f) -> vec3f {
    let K = vec4f(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    let p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, vec3f(0.0), vec3f(1.0)), c.y);
}

@fragment
fn preview_fs(in : FsQuadVsOut) -> @location(0) vec4f {
    let v = textureSampleLevel(field, field_sampler, in.uv, 0.0).rg;
    let len = length(v);
    // Compressed, so a weak but real field is visible rather than black: the
    // map pass caps length at 1, and most of a picture sits far below that.
    let value = 1.0 - exp(-len * 4.0);
    var hue = 0.0;
    if (len > 1e-6) { hue = atan2(v.y, v.x) / 3.1415 / 2.0; }
    return vec4f(hsv2rgb(vec3f(hue, 0.75, value)), 1.0);
}
`,Ht=256;function fc(n,e){const[t,s]=n;if(!(t>0&&s>0&&e>0))return[1,1];const a=t/s;return a>e?[e/a,1]:[1,a/e]}function js(n,e,t){if(!(n>=.5)||!(e>0))return null;const s=n/Ht/4;return t==="y"?[0,s]:[s/e,0]}function pc(n,e){const t=e>0?e:1,s=Math.max(1,t)/Ht,a=Math.max(0,n)/Ht;return Math.max(s,a)}const Wt=["edgesAcross","edgesAlong","motion","motionGravity"],mc={gradient:"edgesAcross",curl:"edgesAlong"},Ys={edgesAcross:"Edges (across)",edgesAlong:"Edges (along)",motion:"Motion",motionGravity:"Motion gravity"},vc={edgesAcross:"Pushes across the outlines in the picture, toward their bright side (or away, with Direction set to Away) -- hardest where it changes fastest and not at all over flat areas.",edgesAlong:"Runs along the outlines in the picture, so particles trace them rather than crossing them.",motion:"Points toward whatever is moving, so a still scene does nothing and a waved hand draws particles in (or scatters them, with Direction set to Away).",motionGravity:"Moving areas act like mass and pull on particles across the whole screen, harder the closer they are and the more is moving. Falloff sets how fast the pull weakens with distance."},kn=["walls","trails"],$s={walls:"Walls",trails:"Trails"},gc={walls:"Shoves particles directly, like painted Walls: no rule can resist it.",trails:"Adds to the trails the particles sense, like painted Trails: each config's rule decides what to do about it."},fi=["user","environment"],wc={user:"Front",environment:"Back"},pi=["toward","away"],bc={toward:"Toward",away:"Away"},mi=8,vi=3,Ye=Object.freeze({mapping:"edgesAlong",destination:"trails",gain:1,blur:.3,falloff:1,direction:"toward",facing:"user",mirror:!0,preview:!0});function gi(n){return n==="user"}function yc(n,e){return e===n.facing?n:Object.freeze({...n,facing:e,mirror:gi(e)})}function _c(n){return Wt.indexOf(n)}const Ec=.01,xc=.05;function Tc(n,e){return n.destination==="walls"?{walls:n.gain*Ec,trails:0}:{walls:0,trails:n.gain*xc}}const Sc=16;function Ac(n){const e=Math.min(1,Math.max(0,n));return e*e*Sc}const rm="fluoddity.camera",om="fluoddity.sand.camera",wi="fluoddity.cameraShown";function Cc(n,e=Qt()){if(e===null)return Ye;let t;try{t=e.getItem(n)}catch{return Ye}if(t===null)return Ye;let s;try{s=JSON.parse(t)}catch{return console.warn("Could not read the camera settings; using the defaults."),Ye}return typeof s!="object"||s===null?Ye:bi(s)}function bi(n){const e=Ye,t=(r,o,c)=>{const l=n[r];return typeof l=="string"&&o.includes(l)?l:c},s=(r,o,c,l)=>{const d=n[r];return typeof d=="number"&&Number.isFinite(d)?Math.min(c,Math.max(o,d)):l},a=(r,o)=>{const c=n[r];return typeof c=="boolean"?c:o},i=t("facing",fi,e.facing);return Object.freeze({mapping:t("mapping",Wt,mc[String(n.mapping)]??e.mapping),destination:t("destination",kn,e.destination),gain:s("gain",0,mi,e.gain),blur:s("blur",0,1,e.blur),falloff:s("falloff",0,vi,e.falloff),direction:t("direction",pi,e.direction),facing:i,mirror:a("mirror",gi(i)),preview:a("preview",e.preview)})}function Rc(n,e,t=Qt()){if(t!==null)try{t.setItem(e,JSON.stringify(n))}catch(s){console.warn(`Could not write the camera settings: ${String(s)}`)}}function lm(n=Qt()){if(n===null)return!1;try{return n.getItem(wi)==="true"}catch{return!1}}function cm(n,e=Qt()){if(e!==null)try{e.setItem(wi,String(n))}catch(t){console.warn(`Could not write camera-tab visibility: ${String(t)}`)}}function Qt(){try{return typeof localStorage>"u"?null:localStorage}catch{return null}}const Ks="rg16float",Ic=16,Xs=32;class $n{device;field;view;scalars;current=0;primed=!1;uprightCanvas=null;uprightContext=null;blurTemp;blurred;gravityMass;gravityPull;image=null;sampler;ingestUniforms;blurXUniforms;blurYUniforms;mapUniforms;gravityUniforms;ingestPipeline=null;blurPipeline=null;mapPipeline=null;massPipeline=null;gravityPipeline=null;previewModule=null;previewPipelines=new Map;constructor(e){this.device=e;const t=(a,i=Ht)=>e.createTexture({label:a,size:{width:i,height:i},format:Ks,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.RENDER_ATTACHMENT});this.field=t("camera-field"),this.view=this.field.createView(),this.scalars=[t("camera-scalars-a"),t("camera-scalars-b")],this.blurTemp=t("camera-blur-temp"),this.blurred=t("camera-blurred"),this.gravityMass=t("camera-gravity-mass",Xs),this.gravityPull=t("camera-gravity-pull",Xs),this.sampler=e.createSampler({label:"camera",magFilter:"linear",minFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"});const s=a=>e.createBuffer({label:a,size:Ic,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});this.ingestUniforms=s("camera-ingest-uniforms"),this.blurXUniforms=s("camera-blur-x-uniforms"),this.blurYUniforms=s("camera-blur-y-uniforms"),this.mapUniforms=s("camera-map-uniforms"),this.gravityUniforms=s("camera-gravity-uniforms")}static async create(e){const t=new $n(e);return await t.compile(),t}async compile(){const e=this.device,[t,s,a,i,r]=await Promise.all([$(e,"cameraIngest.wgsl",lc),$(e,"cameraBlur.wgsl",cc),$(e,"cameraMap.wgsl",hc),$(e,"cameraGravity.wgsl",dc),$(e,"cameraPreview.wgsl",uc)]);this.previewModule=r;const o=(c,l,d)=>l===null?null:e.createRenderPipeline({label:c,layout:"auto",vertex:{module:l,entryPoint:"fullscreen_vs"},fragment:{module:l,entryPoint:d,targets:[{format:Ks}]},primitive:{topology:"triangle-strip"}});this.ingestPipeline=o("camera-ingest",t,"ingest_fs"),this.blurPipeline=o("camera-blur",s,"blur_fs"),this.mapPipeline=o("camera-map",a,"map_fs"),this.massPipeline=o("camera-gravity-mass",i,"mass_fs"),this.gravityPipeline=o("camera-gravity",i,"gravity_fs")}ingest(e,t,s,a,i){if(this.ingestPipeline===null)return!1;const r=this.ensureImage(s),o=this.upright(t,s);try{this.device.queue.copyExternalImageToTexture({source:o},{texture:r},{width:s[0],height:s[1]})}catch(u){return console.debug(`Camera frame skipped: ${String(u)}`),!1}const[c,l]=fc(s,a);this.device.queue.writeBuffer(this.ingestUniforms,0,new Float32Array([c,l,i.mirror?1:0,this.primed?1:0]));const d=this.scalars[this.current];this.current=1-this.current;const h=this.scalars[this.current];return this.draw(e,"camera-ingest",this.ingestPipeline,h,[{binding:0,resource:{buffer:this.ingestUniforms}},{binding:1,resource:r.createView()},{binding:2,resource:this.sampler},{binding:3,resource:d.createView()}]),this.primed=!0,this.remap(e,a,i),!0}upright(e,t){this.uprightCanvas===null&&(this.uprightCanvas=document.createElement("canvas"),this.uprightContext=this.uprightCanvas.getContext("2d",{alpha:!1}));const s=this.uprightCanvas,a=this.uprightContext;if(a===null)return e;(s.width!==t[0]||s.height!==t[1])&&(s.width=t[0],s.height=t[1]);try{a.drawImage(e,0,0,t[0],t[1])}catch{return e}return s}remap(e,t,s){if(this.blurPipeline===null||this.mapPipeline===null)return;const a=Ac(s.blur),i=js(a,t,"x"),r=js(a,t,"y");this.device.queue.writeBuffer(this.blurXUniforms,0,new Float32Array([i?.[0]??0,i?.[1]??0,i===null?0:1,0])),this.device.queue.writeBuffer(this.blurYUniforms,0,new Float32Array([r?.[0]??0,r?.[1]??0,r===null?0:1,0])),this.device.queue.writeBuffer(this.mapUniforms,0,new Float32Array([_c(s.mapping),s.direction==="away"?-1:1,t>0?t:1,pc(a,t)]));const o=this.scalars[this.current];this.draw(e,"camera-blur-x",this.blurPipeline,this.blurTemp,[{binding:0,resource:{buffer:this.blurXUniforms}},{binding:1,resource:o.createView()},{binding:2,resource:this.sampler}]),this.draw(e,"camera-blur-y",this.blurPipeline,this.blurred,[{binding:0,resource:{buffer:this.blurYUniforms}},{binding:1,resource:this.blurTemp.createView()},{binding:2,resource:this.sampler}]),s.mapping==="motionGravity"&&this.massPipeline!==null&&this.gravityPipeline!==null&&(this.device.queue.writeBuffer(this.gravityUniforms,0,new Float32Array([t>0?t:1,s.falloff,0,0])),this.draw(e,"camera-gravity-mass",this.massPipeline,this.gravityMass,[{binding:1,resource:this.blurred.createView()},{binding:2,resource:this.sampler}]),this.draw(e,"camera-gravity",this.gravityPipeline,this.gravityPull,[{binding:0,resource:{buffer:this.gravityUniforms}},{binding:3,resource:this.gravityMass.createView()}])),this.draw(e,"camera-map",this.mapPipeline,this.field,[{binding:0,resource:{buffer:this.mapUniforms}},{binding:1,resource:this.blurred.createView()},{binding:2,resource:this.sampler},{binding:3,resource:this.gravityPull.createView()}])}clear(e){for(const t of[this.field,...this.scalars,this.gravityPull])e.beginRenderPass({label:"camera-clear",colorAttachments:[{view:t.createView(),clearValue:{r:0,g:0,b:0,a:0},loadOp:"clear",storeOp:"store"}]}).end();this.primed=!1}renderPreview(e,t,s){const a=this.previewModule;if(a===null)return;let i=this.previewPipelines.get(s);i===void 0&&(i=this.device.createRenderPipeline({label:"camera-preview",layout:"auto",vertex:{module:a,entryPoint:"fullscreen_vs"},fragment:{module:a,entryPoint:"preview_fs",targets:[{format:s}]},primitive:{topology:"triangle-strip"}}),this.previewPipelines.set(s,i));let r;try{r=t.getCurrentTexture()}catch{return}const o=e.beginRenderPass({label:"camera-preview",colorAttachments:[{view:r.createView(),loadOp:"clear",storeOp:"store",clearValue:[0,0,0,1]}]});o.setPipeline(i),o.setBindGroup(0,this.device.createBindGroup({layout:i.getBindGroupLayout(0),entries:[{binding:0,resource:this.view},{binding:1,resource:this.sampler}]})),o.draw(4),o.end()}destroy(){for(const e of[this.field,...this.scalars,this.blurTemp,this.blurred,this.gravityMass,this.gravityPull])e.destroy();this.image?.destroy(),this.image=null;for(const e of[this.ingestUniforms,this.blurXUniforms,this.blurYUniforms,this.mapUniforms,this.gravityUniforms])e.destroy()}ensureImage(e){const t=this.image;return t!==null&&t.width===e[0]&&t.height===e[1]?t:(t?.destroy(),this.image=this.device.createTexture({label:"camera-image",size:{width:e[0],height:e[1]},format:"rgba8unorm",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT}),this.image)}draw(e,t,s,a,i){const r=e.beginRenderPass({label:t,colorAttachments:[{view:a.createView(),loadOp:"clear",storeOp:"store"}]});r.setPipeline(s),r.setBindGroup(0,this.device.createBindGroup({label:t,layout:s.getBindGroupLayout(0),entries:i})),r.draw(4),r.end()}}class Lc{video;_state="off";_error=null;stream=null;generation=0;delivered=0;consumed=0;frameHandle=null;lastTime=-1;constructor(){const e=document.createElement("video");e.muted=!0,e.playsInline=!0,e.autoplay=!0,e.setAttribute("playsinline",""),e.style.cssText="position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1;",e.setAttribute("aria-hidden","true"),document.body.append(e),this.video=e}get state(){return this._state}get error(){return this._error}get running(){return this._state==="on"}get size(){const e=this.video.videoWidth,t=this.video.videoHeight;return this._state!=="on"||e===0||t===0||this.video.readyState<2?null:[e,t]}async start(e){this.closeStream();const t=++this.generation;this._state="starting",this._error=null;const s=typeof navigator>"u"?void 0:navigator.mediaDevices;if(s===void 0||typeof s.getUserMedia!="function"){this.fail("Camera access needs a secure (https) page.");return}let a;try{a=await s.getUserMedia({audio:!1,video:{facingMode:{ideal:e},width:{ideal:640},height:{ideal:480},frameRate:{ideal:30}}})}catch(i){if(t!==this.generation)return;this.fail(Qs(i));return}if(t!==this.generation){for(const i of a.getTracks())i.stop();return}this.stream=a;for(const i of a.getVideoTracks())i.addEventListener("ended",()=>{t===this.generation&&(this.closeStream(),this.fail("The camera stopped."))});this.video.srcObject=a;try{await this.video.play()}catch(i){if(t!==this.generation)return;this.closeStream(),this.fail(`The camera could not play: ${Qs(i)}`);return}t===this.generation&&(this._state="on",this.delivered=0,this.consumed=0,this.lastTime=-1,this.watchFrames(t))}stop(){this.generation++,this.closeStream(),this._state="off",this._error=null}takeNewFrame(){if(this._state!=="on")return!1;if(typeof this.video.requestVideoFrameCallback=="function")return this.delivered===this.consumed?!1:(this.consumed=this.delivered,!0);const e=this.video.currentTime;return e===this.lastTime?!1:(this.lastTime=e,!0)}destroy(){this.stop(),this.video.remove()}watchFrames(e){const t=this.video;if(typeof t.requestVideoFrameCallback!="function")return;const s=()=>{e===this.generation&&(this.delivered++,this.frameHandle=t.requestVideoFrameCallback(s))};this.frameHandle=t.requestVideoFrameCallback(s)}closeStream(){if(this.frameHandle!==null&&(this.video.cancelVideoFrameCallback?.(this.frameHandle),this.frameHandle=null),this.stream!==null){for(const e of this.stream.getTracks())e.stop();this.stream=null}this.video.srcObject=null}fail(e){this._state="error",this._error=e}}function Qs(n){switch(typeof n=="object"&&n!==null&&"name"in n?String(n.name):""){case"NotAllowedError":case"SecurityError":return"Camera permission was denied. Allow it in the browser’s site settings.";case"NotFoundError":case"OverconstrainedError":return"No camera was found.";case"NotReadableError":case"AbortError":return"The camera is in use by another app, or could not be opened.";default:return n instanceof Error?n.message:String(n)}}class yi{device;storageKey;field;source=null;_settings;remapPending=!1;clearPending=!1;lastAspect=0;preview=null;previewStale=!1;suspended=!1;constructor(e,t,s){this.device=e,this.field=t,this.storageKey=s,this._settings=Cc(s),typeof document<"u"&&document.addEventListener("visibilitychange",this.onVisibilityChange)}onVisibilityChange=()=>{document.hidden?(this.state==="on"||this.state==="starting")&&(this.source?.stop(),this.suspended=!0,this.clearPending=!0,this.previewStale=!0):this.suspended&&(this.suspended=!1,this.start())};static async create(e,t){return new yi(e,await $n.create(e),t)}get fieldView(){return this.field.view}get settings(){return this._settings}get state(){return this.source?.state??"off"}get error(){return this.source?.error??null}get running(){return this.source?.running??!1}get worldAspect(){return this.lastAspect}update(e){const t=this._settings;let s=t;e.facing!==void 0&&(s=yc(s,e.facing));const{facing:a,...i}=e;s=bi({...s,...i}),this._settings=s,Rc(s,this.storageKey),this.remapPending=!0,this.previewStale=!0,s.facing!==t.facing&&this.state!=="off"&&this.start()}async start(){this.source??=new Lc,this.clearPending=!0,await this.source.start(this._settings.facing)}stop(){this.suspended=!1,this.source?.stop(),this.clearPending=!0,this.previewStale=!0}toggle(){this.state==="off"||this.state==="error"?this.start():this.stop()}strengths(){return this.running?Tc(this._settings):jn}attachPreview(e){if(e===null){this.preview=null;return}if(this.preview?.canvas===e)return;const t=e.getContext("webgpu");if(t===null){this.preview=null;return}const s=navigator.gpu.getPreferredCanvasFormat();t.configure({device:this.device,format:s,alphaMode:"opaque"}),this.preview={canvas:e,context:t,format:s},this.previewStale=!0}invalidatePreview(){this.previewStale=!0}record(e,t){const s=t[1]>0?t[0]/t[1]:1;s!==this.lastAspect&&(this.lastAspect=s,this.remapPending=!0);let a=!1;this.clearPending&&!this.running&&(this.field.clear(e),this.clearPending=!1,a=!0);const i=this.source,r=i?.size??null;i!==null&&r!==null&&i.takeNewFrame()&&(this.clearPending&&(this.field.clear(e),this.clearPending=!1),this.field.ingest(e,i.video,r,s,this._settings)&&(this.remapPending=!1,a=!0)),this.remapPending&&this.running&&(this.field.remap(e,s,this._settings),this.remapPending=!1,a=!0);const o=this.preview;o!==null&&this._settings.preview&&(a||this.previewStale)&&o.canvas.isConnected&&o.canvas.width>0&&o.canvas.height>0&&(this.field.renderPreview(e,o.context,o.format),this.previewStale=!1)}destroy(){typeof document<"u"&&document.removeEventListener("visibilitychange",this.onVisibilityChange),this.source?.destroy(),this.source=null,this.field.destroy()}}/*! Tweakpane 4.0.5 (c) 2016 cocopon, licensed under the MIT license. */function k(n){return n==null}function Kn(n){return n!==null&&typeof n=="object"}function Dn(n){return n!==null&&typeof n=="object"}function Oc(n,e){if(n.length!==e.length)return!1;for(let t=0;t<n.length;t++)if(n[t]!==e[t])return!1;return!0}function Ue(n,e){return Array.from(new Set([...Object.keys(n),...Object.keys(e)])).reduce((s,a)=>{const i=n[a],r=e[a];return Dn(i)&&Dn(r)?Object.assign(Object.assign({},s),{[a]:Ue(i,r)}):Object.assign(Object.assign({},s),{[a]:a in e?r:i})},{})}function Xn(n){return Kn(n)?"target"in n:!1}const Nc={alreadydisposed:()=>"View has been already disposed",invalidparams:n=>`Invalid parameters for '${n.name}'`,nomatchingcontroller:n=>`No matching controller for '${n.key}'`,nomatchingview:n=>`No matching view for '${JSON.stringify(n.params)}'`,notbindable:()=>"Value is not bindable",notcompatible:n=>`Not compatible with  plugin '${n.id}'`,propertynotfound:n=>`Property '${n.name}' not found`,shouldneverhappen:()=>"This error should never happen"};class z{static alreadyDisposed(){return new z({type:"alreadydisposed"})}static notBindable(){return new z({type:"notbindable"})}static notCompatible(e,t){return new z({type:"notcompatible",context:{id:`${e}.${t}`}})}static propertyNotFound(e){return new z({type:"propertynotfound",context:{name:e}})}static shouldNeverHappen(){return new z({type:"shouldneverhappen"})}constructor(e){var t;this.message=(t=Nc[e.type](e.context))!==null&&t!==void 0?t:"Unexpected error",this.name=this.constructor.name,this.stack=new Error(this.message).stack,this.type=e.type}toString(){return this.message}}class qt{constructor(e,t){this.obj_=e,this.key=t}static isBindable(e){return!(e===null||typeof e!="object"&&typeof e!="function")}read(){return this.obj_[this.key]}write(e){this.obj_[this.key]=e}writeProperty(e,t){const s=this.read();if(!qt.isBindable(s))throw z.notBindable();if(!(e in s))throw z.propertyNotFound(e);s[e]=t}}class V{constructor(){this.observers_={}}on(e,t,s){var a;let i=this.observers_[e];return i||(i=this.observers_[e]=[]),i.push({handler:t,key:(a=s?.key)!==null&&a!==void 0?a:t}),this}off(e,t){const s=this.observers_[e];return s&&(this.observers_[e]=s.filter(a=>a.key!==t)),this}emit(e,t){const s=this.observers_[e];s&&s.forEach(a=>{a.handler(t)})}}class Pc{constructor(e,t){var s;this.constraint_=t?.constraint,this.equals_=(s=t?.equals)!==null&&s!==void 0?s:((a,i)=>a===i),this.emitter=new V,this.rawValue_=e}get constraint(){return this.constraint_}get rawValue(){return this.rawValue_}set rawValue(e){this.setRawValue(e,{forceEmit:!1,last:!0})}setRawValue(e,t){const s=t??{forceEmit:!1,last:!0},a=this.constraint_?this.constraint_.constrain(e):e,i=this.rawValue_;this.equals_(i,a)&&!s.forceEmit||(this.emitter.emit("beforechange",{sender:this}),this.rawValue_=a,this.emitter.emit("change",{options:s,previousRawValue:i,rawValue:a,sender:this}))}}class kc{constructor(e){this.emitter=new V,this.value_=e}get rawValue(){return this.value_}set rawValue(e){this.setRawValue(e,{forceEmit:!1,last:!0})}setRawValue(e,t){const s=t??{forceEmit:!1,last:!0},a=this.value_;a===e&&!s.forceEmit||(this.emitter.emit("beforechange",{sender:this}),this.value_=e,this.emitter.emit("change",{options:s,previousRawValue:a,rawValue:this.value_,sender:this}))}}class Dc{constructor(e){this.emitter=new V,this.onValueBeforeChange_=this.onValueBeforeChange_.bind(this),this.onValueChange_=this.onValueChange_.bind(this),this.value_=e,this.value_.emitter.on("beforechange",this.onValueBeforeChange_),this.value_.emitter.on("change",this.onValueChange_)}get rawValue(){return this.value_.rawValue}onValueBeforeChange_(e){this.emitter.emit("beforechange",Object.assign(Object.assign({},e),{sender:this}))}onValueChange_(e){this.emitter.emit("change",Object.assign(Object.assign({},e),{sender:this}))}}function G(n,e){const t=e?.constraint,s=e?.equals;return!t&&!s?new kc(n):new Pc(n,e)}function Uc(n){return[new Dc(n),(e,t)=>{n.setRawValue(e,t)}]}class _{constructor(e){this.emitter=new V,this.valMap_=e;for(const t in this.valMap_)this.valMap_[t].emitter.on("change",()=>{this.emitter.emit("change",{key:t,sender:this})})}static createCore(e){return Object.keys(e).reduce((s,a)=>Object.assign(s,{[a]:G(e[a])}),{})}static fromObject(e){const t=this.createCore(e);return new _(t)}get(e){return this.valMap_[e].rawValue}set(e,t){this.valMap_[e].rawValue=t}value(e){return this.valMap_[e]}}class vt{constructor(e){this.values=_.fromObject({max:e.max,min:e.min})}constrain(e){const t=this.values.get("max"),s=this.values.get("min");return Math.min(Math.max(e,s),t)}}class Mc{constructor(e){this.values=_.fromObject({max:e.max,min:e.min})}constrain(e){const t=this.values.get("max"),s=this.values.get("min");let a=e;return k(s)||(a=Math.max(a,s)),k(t)||(a=Math.min(a,t)),a}}class Gc{constructor(e,t=0){this.step=e,this.origin=t}constrain(e){const t=this.origin%this.step,s=Math.round((e-t)/this.step);return t+s*this.step}}class Bc{constructor(e){this.text=e}evaluate(){return Number(this.text)}toString(){return this.text}}const Fc={"**":(n,e)=>Math.pow(n,e),"*":(n,e)=>n*e,"/":(n,e)=>n/e,"%":(n,e)=>n%e,"+":(n,e)=>n+e,"-":(n,e)=>n-e,"<<":(n,e)=>n<<e,">>":(n,e)=>n>>e,">>>":(n,e)=>n>>>e,"&":(n,e)=>n&e,"^":(n,e)=>n^e,"|":(n,e)=>n|e};class zc{constructor(e,t,s){this.left=t,this.operator=e,this.right=s}evaluate(){const e=Fc[this.operator];if(!e)throw new Error(`unexpected binary operator: '${this.operator}`);return e(this.left.evaluate(),this.right.evaluate())}toString(){return["b(",this.left.toString(),this.operator,this.right.toString(),")"].join(" ")}}const Vc={"+":n=>n,"-":n=>-n,"~":n=>~n};class Hc{constructor(e,t){this.operator=e,this.expression=t}evaluate(){const e=Vc[this.operator];if(!e)throw new Error(`unexpected unary operator: '${this.operator}`);return e(this.expression.evaluate())}toString(){return["u(",this.operator,this.expression.toString(),")"].join(" ")}}function Qn(n){return(e,t)=>{for(let s=0;s<n.length;s++){const a=n[s](e,t);if(a!=="")return a}return""}}function ht(n,e){var t;const s=n.substr(e).match(/^\s+/);return(t=s&&s[0])!==null&&t!==void 0?t:""}function Wc(n,e){const t=n.substr(e,1);return t.match(/^[1-9]$/)?t:""}function dt(n,e){var t;const s=n.substr(e).match(/^[0-9]+/);return(t=s&&s[0])!==null&&t!==void 0?t:""}function qc(n,e){const t=dt(n,e);if(t!=="")return t;const s=n.substr(e,1);if(e+=1,s!=="-"&&s!=="+")return"";const a=dt(n,e);return a===""?"":s+a}function Zn(n,e){const t=n.substr(e,1);if(e+=1,t.toLowerCase()!=="e")return"";const s=qc(n,e);return s===""?"":t+s}function _i(n,e){const t=n.substr(e,1);if(t==="0")return t;const s=Wc(n,e);return e+=s.length,s===""?"":s+dt(n,e)}function jc(n,e){const t=_i(n,e);if(e+=t.length,t==="")return"";const s=n.substr(e,1);if(e+=s.length,s!==".")return"";const a=dt(n,e);return e+=a.length,t+s+a+Zn(n,e)}function Yc(n,e){const t=n.substr(e,1);if(e+=t.length,t!==".")return"";const s=dt(n,e);return e+=s.length,s===""?"":t+s+Zn(n,e)}function $c(n,e){const t=_i(n,e);return e+=t.length,t===""?"":t+Zn(n,e)}const Kc=Qn([jc,Yc,$c]);function Xc(n,e){var t;const s=n.substr(e).match(/^[01]+/);return(t=s&&s[0])!==null&&t!==void 0?t:""}function Qc(n,e){const t=n.substr(e,2);if(e+=t.length,t.toLowerCase()!=="0b")return"";const s=Xc(n,e);return s===""?"":t+s}function Zc(n,e){var t;const s=n.substr(e).match(/^[0-7]+/);return(t=s&&s[0])!==null&&t!==void 0?t:""}function Jc(n,e){const t=n.substr(e,2);if(e+=t.length,t.toLowerCase()!=="0o")return"";const s=Zc(n,e);return s===""?"":t+s}function eh(n,e){var t;const s=n.substr(e).match(/^[0-9a-f]+/i);return(t=s&&s[0])!==null&&t!==void 0?t:""}function th(n,e){const t=n.substr(e,2);if(e+=t.length,t.toLowerCase()!=="0x")return"";const s=eh(n,e);return s===""?"":t+s}const nh=Qn([Qc,Jc,th]),sh=Qn([nh,Kc]);function ah(n,e){const t=sh(n,e);return e+=t.length,t===""?null:{evaluable:new Bc(t),cursor:e}}function ih(n,e){const t=n.substr(e,1);if(e+=t.length,t!=="(")return null;const s=xi(n,e);if(!s)return null;e=s.cursor,e+=ht(n,e).length;const a=n.substr(e,1);return e+=a.length,a!==")"?null:{evaluable:s.evaluable,cursor:e}}function rh(n,e){var t;return(t=ah(n,e))!==null&&t!==void 0?t:ih(n,e)}function Ei(n,e){const t=rh(n,e);if(t)return t;const s=n.substr(e,1);if(e+=s.length,s!=="+"&&s!=="-"&&s!=="~")return null;const a=Ei(n,e);return a?(e=a.cursor,{cursor:e,evaluable:new Hc(s,a.evaluable)}):null}function oh(n,e,t){t+=ht(e,t).length;const s=n.filter(a=>e.startsWith(a,t))[0];return s?(t+=s.length,t+=ht(e,t).length,{cursor:t,operator:s}):null}function lh(n,e){return(t,s)=>{const a=n(t,s);if(!a)return null;s=a.cursor;let i=a.evaluable;for(;;){const r=oh(e,t,s);if(!r)break;s=r.cursor;const o=n(t,s);if(!o)return null;s=o.cursor,i=new zc(r.operator,i,o.evaluable)}return i?{cursor:s,evaluable:i}:null}}const ch=[["**"],["*","/","%"],["+","-"],["<<",">>>",">>"],["&"],["^"],["|"]].reduce((n,e)=>lh(n,e),Ei);function xi(n,e){return e+=ht(n,e).length,ch(n,e)}function hh(n){const e=xi(n,0);return!e||e.cursor+ht(n,e.cursor).length!==n.length?null:e.evaluable}function we(n){var e;const t=hh(n);return(e=t?.evaluate())!==null&&e!==void 0?e:null}function Ti(n){if(typeof n=="number")return n;if(typeof n=="string"){const e=we(n);if(!k(e))return e}return 0}function dh(n){return String(n)}function J(n){return e=>e.toFixed(Math.max(Math.min(n,20),0))}function I(n,e,t,s,a){const i=(n-e)/(t-e);return s+i*(a-s)}function Zs(n){return String(n.toFixed(10)).split(".")[1].replace(/0+$/,"").length}function q(n,e,t){return Math.min(Math.max(n,e),t)}function Si(n,e){return(n%e+e)%e}function uh(n,e){return k(n.step)?Math.max(Zs(e),2):Zs(n.step)}function Ai(n){var e;return(e=n.step)!==null&&e!==void 0?e:1}function Ci(n,e){var t;const s=Math.abs((t=n.step)!==null&&t!==void 0?t:e);return s===0?.1:Math.pow(10,Math.floor(Math.log10(s))-1)}function Ri(n,e){return k(n.step)?null:new Gc(n.step,e)}function Ii(n){return!k(n.max)&&!k(n.min)?new vt({max:n.max,min:n.min}):!k(n.max)||!k(n.min)?new Mc({max:n.max,min:n.min}):null}function Li(n,e){var t,s,a;return{formatter:(t=n.format)!==null&&t!==void 0?t:J(uh(n,e)),keyScale:(s=n.keyScale)!==null&&s!==void 0?s:Ai(n),pointerScale:(a=n.pointerScale)!==null&&a!==void 0?a:Ci(n,e)}}function Oi(n){return{format:n.optional.function,keyScale:n.optional.number,max:n.optional.number,min:n.optional.number,pointerScale:n.optional.number,step:n.optional.number}}function Jn(n){return{constraint:n.constraint,textProps:_.fromObject(Li(n.params,n.initialValue))}}class Be{constructor(e){this.controller=e}get element(){return this.controller.view.element}get disabled(){return this.controller.viewProps.get("disabled")}set disabled(e){this.controller.viewProps.set("disabled",e)}get hidden(){return this.controller.viewProps.get("hidden")}set hidden(e){this.controller.viewProps.set("hidden",e)}dispose(){this.controller.viewProps.set("disposed",!0)}importState(e){return this.controller.importState(e)}exportState(){return this.controller.exportState()}}class Zt{constructor(e){this.target=e}}class gt extends Zt{constructor(e,t,s){super(e),this.value=t,this.last=s??!0}}class fh extends Zt{constructor(e,t){super(e),this.expanded=t}}class ph extends Zt{constructor(e,t){super(e),this.index=t}}class mh extends Zt{constructor(e,t){super(e),this.native=t}}class ut extends Be{constructor(e){super(e),this.onValueChange_=this.onValueChange_.bind(this),this.emitter_=new V,this.controller.value.emitter.on("change",this.onValueChange_)}get label(){return this.controller.labelController.props.get("label")}set label(e){this.controller.labelController.props.set("label",e)}get key(){return this.controller.value.binding.target.key}get tag(){return this.controller.tag}set tag(e){this.controller.tag=e}on(e,t){const s=t.bind(this);return this.emitter_.on(e,a=>{s(a)},{key:t}),this}off(e,t){return this.emitter_.off(e,t),this}refresh(){this.controller.value.fetch()}onValueChange_(e){const t=this.controller.value;this.emitter_.emit("change",new gt(this,t.binding.target.read(),e.options.last))}}class vh{constructor(e,t){this.onValueBeforeChange_=this.onValueBeforeChange_.bind(this),this.onValueChange_=this.onValueChange_.bind(this),this.binding=t,this.value_=e,this.value_.emitter.on("beforechange",this.onValueBeforeChange_),this.value_.emitter.on("change",this.onValueChange_),this.emitter=new V}get rawValue(){return this.value_.rawValue}set rawValue(e){this.value_.rawValue=e}setRawValue(e,t){this.value_.setRawValue(e,t)}fetch(){this.value_.rawValue=this.binding.read()}push(){this.binding.write(this.value_.rawValue)}onValueBeforeChange_(e){this.emitter.emit("beforechange",Object.assign(Object.assign({},e),{sender:this}))}onValueChange_(e){this.push(),this.emitter.emit("change",Object.assign(Object.assign({},e),{sender:this}))}}function gh(n){if(!("binding"in n))return!1;const e=n.binding;return Xn(e)&&"read"in e&&"write"in e}function wh(n,e){const s=Object.keys(e).reduce((a,i)=>{if(a===void 0)return;const r=e[i],o=r(n[i]);return o.succeeded?Object.assign(Object.assign({},a),{[i]:o.value}):void 0},{});return s}function bh(n,e){return n.reduce((t,s)=>{if(t===void 0)return;const a=e(s);if(!(!a.succeeded||a.value===void 0))return[...t,a.value]},[])}function yh(n){return n===null?!1:typeof n=="object"}function me(n){return e=>t=>{if(!e&&t===void 0)return{succeeded:!1,value:void 0};if(e&&t===void 0)return{succeeded:!0,value:void 0};const s=n(t);return s!==void 0?{succeeded:!0,value:s}:{succeeded:!1,value:void 0}}}function Js(n){return{custom:e=>me(e)(n),boolean:me(e=>typeof e=="boolean"?e:void 0)(n),number:me(e=>typeof e=="number"?e:void 0)(n),string:me(e=>typeof e=="string"?e:void 0)(n),function:me(e=>typeof e=="function"?e:void 0)(n),constant:e=>me(t=>t===e?e:void 0)(n),raw:me(e=>e)(n),object:e=>me(t=>{if(yh(t))return wh(t,e)})(n),array:e=>me(t=>{if(Array.isArray(t))return bh(t,e)})(n)}}const Un={optional:Js(!0),required:Js(!1)};function B(n,e){const t=e(Un),s=Un.required.object(t)(n);return s.succeeded?s.value:void 0}function ee(n,e,t,s){if(e&&!e(n))return!1;const a=B(n,t);return a?s(a):!1}function te(n,e){var t;return Ue((t=n?.())!==null&&t!==void 0?t:{},e)}function De(n){return"value"in n}function Ni(n){if(!Kn(n)||!("binding"in n))return!1;const e=n.binding;return Xn(e)}const ue="http://www.w3.org/2000/svg";function jt(n){n.offsetHeight}function _h(n,e){const t=n.style.transition;n.style.transition="none",e(),n.style.transition=t}function es(n){return n.ontouchstart!==void 0}function Eh(){return globalThis}function xh(){return Eh().document}function Th(n){const e=n.ownerDocument.defaultView;return e&&"document"in e?n.getContext("2d",{willReadFrequently:!0}):null}const Sh={check:'<path d="M2 8l4 4l8 -8"/>',dropdown:'<path d="M5 7h6l-3 3 z"/>',p2dpad:'<path d="M8 4v8"/><path d="M4 8h8"/><circle cx="12" cy="12" r="1.2"/>'};function Jt(n,e){const t=n.createElementNS(ue,"svg");return t.innerHTML=Sh[e],t}function Pi(n,e,t){n.insertBefore(e,n.children[t])}function ts(n){n.parentElement&&n.parentElement.removeChild(n)}function ki(n){for(;n.children.length>0;)n.removeChild(n.children[0])}function Ah(n){for(;n.childNodes.length>0;)n.removeChild(n.childNodes[0])}function Di(n){return n.relatedTarget?n.relatedTarget:"explicitOriginalTarget"in n?n.explicitOriginalTarget:null}function ge(n,e){n.emitter.on("change",t=>{e(t.rawValue)}),e(n.rawValue)}function fe(n,e,t){ge(n.value(e),t)}const Ch="tp";function C(n){return(t,s)=>[Ch,"-",n,"v",t?`_${t}`:"",s?`-${s}`:""].join("")}const it=C("lbl");function Rh(n,e){const t=n.createDocumentFragment();return e.split(`
`).map(a=>n.createTextNode(a)).forEach((a,i)=>{i>0&&t.appendChild(n.createElement("br")),t.appendChild(a)}),t}class Ui{constructor(e,t){this.element=e.createElement("div"),this.element.classList.add(it()),t.viewProps.bindClassModifiers(this.element);const s=e.createElement("div");s.classList.add(it("l")),fe(t.props,"label",i=>{k(i)?this.element.classList.add(it(void 0,"nol")):(this.element.classList.remove(it(void 0,"nol")),Ah(s),s.appendChild(Rh(e,i)))}),this.element.appendChild(s),this.labelElement=s;const a=e.createElement("div");a.classList.add(it("v")),this.element.appendChild(a),this.valueElement=a}}class Mi{constructor(e,t){this.props=t.props,this.valueController=t.valueController,this.viewProps=t.valueController.viewProps,this.view=new Ui(e,{props:t.props,viewProps:this.viewProps}),this.view.valueElement.appendChild(this.valueController.view.element)}importProps(e){return ee(e,null,t=>({label:t.optional.string}),t=>(this.props.set("label",t.label),!0))}exportProps(){return te(null,{label:this.props.get("label")})}}function Ih(){return["veryfirst","first","last","verylast"]}const ea=C(""),ta={veryfirst:"vfst",first:"fst",last:"lst",verylast:"vlst"};class en{constructor(e){this.parent_=null,this.blade=e.blade,this.view=e.view,this.viewProps=e.viewProps;const t=this.view.element;this.blade.value("positions").emitter.on("change",()=>{Ih().forEach(s=>{t.classList.remove(ea(void 0,ta[s]))}),this.blade.get("positions").forEach(s=>{t.classList.add(ea(void 0,ta[s]))})}),this.viewProps.handleDispose(()=>{ts(t)})}get parent(){return this.parent_}set parent(e){this.parent_=e,this.viewProps.set("parent",this.parent_?this.parent_.viewProps:null)}importState(e){return ee(e,null,t=>({disabled:t.required.boolean,hidden:t.required.boolean}),t=>(this.viewProps.importState(t),!0))}exportState(){return te(null,Object.assign({},this.viewProps.exportState()))}}class Me extends en{constructor(e,t){if(t.value!==t.valueController.value)throw z.shouldNeverHappen();const s=t.valueController.viewProps,a=new Mi(e,{blade:t.blade,props:t.props,valueController:t.valueController});super(Object.assign(Object.assign({},t),{view:new Ui(e,{props:t.props,viewProps:s}),viewProps:s})),this.labelController=a,this.value=t.value,this.valueController=t.valueController,this.view.valueElement.appendChild(this.valueController.view.element)}importState(e){return ee(e,t=>{var s,a,i;return super.importState(t)&&this.labelController.importProps(t)&&((i=(a=(s=this.valueController).importProps)===null||a===void 0?void 0:a.call(s,e))!==null&&i!==void 0?i:!0)},t=>({value:t.optional.raw}),t=>(t.value&&(this.value.rawValue=t.value),!0))}exportState(){var e,t,s;return te(()=>super.exportState(),Object.assign(Object.assign({value:this.value.rawValue},this.labelController.exportProps()),(s=(t=(e=this.valueController).exportProps)===null||t===void 0?void 0:t.call(e))!==null&&s!==void 0?s:{}))}}function na(n){const e=Object.assign({},n);return delete e.value,e}class Gi extends Me{constructor(e,t){super(e,t),this.tag=t.tag}importState(e){return ee(e,t=>super.importState(na(e)),t=>({tag:t.optional.string}),t=>(this.tag=t.tag,!0))}exportState(){return te(()=>na(super.exportState()),{binding:{key:this.value.binding.target.key,value:this.value.binding.target.read()},tag:this.tag})}}function Lh(n){return De(n)&&Ni(n.value)}class Oh extends Gi{importState(e){return ee(e,t=>super.importState(t),t=>({binding:t.required.object({value:t.required.raw})}),t=>(this.value.binding.inject(t.binding.value),this.value.fetch(),!0))}}function Nh(n){return De(n)&&gh(n.value)}function Bi(n,e){for(;n.length<e;)n.push(void 0)}function Ph(n){const e=[];return Bi(e,n),e}function kh(n){const e=n.indexOf(void 0);return e<0?n:n.slice(0,e)}function Dh(n,e){const t=[...kh(n),e];return t.length>n.length?t.splice(0,t.length-n.length):Bi(t,n.length),t}class Uh{constructor(e){this.emitter=new V,this.onTick_=this.onTick_.bind(this),this.onValueBeforeChange_=this.onValueBeforeChange_.bind(this),this.onValueChange_=this.onValueChange_.bind(this),this.binding=e.binding,this.value_=G(Ph(e.bufferSize)),this.value_.emitter.on("beforechange",this.onValueBeforeChange_),this.value_.emitter.on("change",this.onValueChange_),this.ticker=e.ticker,this.ticker.emitter.on("tick",this.onTick_),this.fetch()}get rawValue(){return this.value_.rawValue}set rawValue(e){this.value_.rawValue=e}setRawValue(e,t){this.value_.setRawValue(e,t)}fetch(){this.value_.rawValue=Dh(this.value_.rawValue,this.binding.read())}onTick_(){this.fetch()}onValueBeforeChange_(e){this.emitter.emit("beforechange",Object.assign(Object.assign({},e),{sender:this}))}onValueChange_(e){this.emitter.emit("change",Object.assign(Object.assign({},e),{sender:this}))}}function Mh(n){if(!("binding"in n))return!1;const e=n.binding;return Xn(e)&&"read"in e&&!("write"in e)}class Gh extends Gi{exportState(){return te(()=>super.exportState(),{binding:{readonly:!0}})}}function Bh(n){return De(n)&&Mh(n.value)}class Fh extends Be{get label(){return this.controller.labelController.props.get("label")}set label(e){this.controller.labelController.props.set("label",e)}get title(){var e;return(e=this.controller.buttonController.props.get("title"))!==null&&e!==void 0?e:""}set title(e){this.controller.buttonController.props.set("title",e)}on(e,t){const s=t.bind(this);return this.controller.buttonController.emitter.on(e,i=>{s(new mh(this,i.nativeEvent))}),this}off(e,t){return this.controller.buttonController.emitter.off(e,t),this}}function zh(n,e,t){t?n.classList.add(e):n.classList.remove(e)}function et(n,e){return t=>{zh(n,e,t)}}function ns(n,e){ge(n,t=>{e.textContent=t??""})}const mn=C("btn");class Vh{constructor(e,t){this.element=e.createElement("div"),this.element.classList.add(mn()),t.viewProps.bindClassModifiers(this.element);const s=e.createElement("button");s.classList.add(mn("b")),t.viewProps.bindDisabled(s),this.element.appendChild(s),this.buttonElement=s;const a=e.createElement("div");a.classList.add(mn("t")),ns(t.props.value("title"),a),this.buttonElement.appendChild(a)}}class Hh{constructor(e,t){this.emitter=new V,this.onClick_=this.onClick_.bind(this),this.props=t.props,this.viewProps=t.viewProps,this.view=new Vh(e,{props:this.props,viewProps:this.viewProps}),this.view.buttonElement.addEventListener("click",this.onClick_)}importProps(e){return ee(e,null,t=>({title:t.optional.string}),t=>(this.props.set("title",t.title),!0))}exportProps(){return te(null,{title:this.props.get("title")})}onClick_(e){this.emitter.emit("click",{nativeEvent:e,sender:this})}}class sa extends en{constructor(e,t){const s=new Hh(e,{props:t.buttonProps,viewProps:t.viewProps}),a=new Mi(e,{blade:t.blade,props:t.labelProps,valueController:s});super({blade:t.blade,view:a.view,viewProps:t.viewProps}),this.buttonController=s,this.labelController=a}importState(e){return ee(e,t=>super.importState(t)&&this.buttonController.importProps(t)&&this.labelController.importProps(t),()=>({}),()=>!0)}exportState(){return te(()=>super.exportState(),Object.assign(Object.assign({},this.buttonController.exportProps()),this.labelController.exportProps()))}}class Fi{constructor(e){const[t,s]=e.split("-"),a=t.split(".");this.major=parseInt(a[0],10),this.minor=parseInt(a[1],10),this.patch=parseInt(a[2],10),this.prerelease=s??null}toString(){const e=[this.major,this.minor,this.patch].join(".");return this.prerelease!==null?[e,this.prerelease].join("-"):e}}const tt=new Fi("2.0.5");function Q(n){return Object.assign({core:tt},n)}const Wh=Q({id:"button",type:"blade",accept(n){const e=B(n,t=>({title:t.required.string,view:t.required.constant("button"),label:t.optional.string}));return e?{params:e}:null},controller(n){return new sa(n.document,{blade:n.blade,buttonProps:_.fromObject({title:n.params.title}),labelProps:_.fromObject({label:n.params.label}),viewProps:n.viewProps})},api(n){return n.controller instanceof sa?new Fh(n.controller):null}});function qh(n,e){return n.addBlade(Object.assign(Object.assign({},e),{view:"button"}))}function jh(n,e){return n.addBlade(Object.assign(Object.assign({},e),{view:"folder"}))}function Yh(n,e){return n.addBlade(Object.assign(Object.assign({},e),{view:"tab"}))}function $h(n){return Kn(n)?"refresh"in n&&typeof n.refresh=="function":!1}function Kh(n,e){if(!qt.isBindable(n))throw z.notBindable();return new qt(n,e)}class Xh{constructor(e,t){this.onRackValueChange_=this.onRackValueChange_.bind(this),this.controller_=e,this.emitter_=new V,this.pool_=t,this.controller_.rack.emitter.on("valuechange",this.onRackValueChange_)}get children(){return this.controller_.rack.children.map(e=>this.pool_.createApi(e))}addBinding(e,t,s){const a=s??{},i=this.controller_.element.ownerDocument,r=this.pool_.createBinding(i,Kh(e,t),a),o=this.pool_.createBindingApi(r);return this.add(o,a.index)}addFolder(e){return jh(this,e)}addButton(e){return qh(this,e)}addTab(e){return Yh(this,e)}add(e,t){const s=e.controller;return this.controller_.rack.add(s,t),e}remove(e){this.controller_.rack.remove(e.controller)}addBlade(e){const t=this.controller_.element.ownerDocument,s=this.pool_.createBlade(t,e),a=this.pool_.createApi(s);return this.add(a,e.index)}on(e,t){const s=t.bind(this);return this.emitter_.on(e,a=>{s(a)},{key:t}),this}off(e,t){return this.emitter_.off(e,t),this}refresh(){this.children.forEach(e=>{$h(e)&&e.refresh()})}onRackValueChange_(e){const t=e.bladeController,s=this.pool_.createApi(t),a=Ni(t.value)?t.value.binding:null;this.emitter_.emit("change",new gt(s,a?a.target.read():t.value.rawValue,e.options.last))}}class ss extends Be{constructor(e,t){super(e),this.rackApi_=new Xh(e.rackController,t)}refresh(){this.rackApi_.refresh()}}class as extends en{constructor(e){super({blade:e.blade,view:e.view,viewProps:e.rackController.viewProps}),this.rackController=e.rackController}importState(e){return ee(e,t=>super.importState(t),t=>({children:t.required.array(t.required.raw)}),t=>this.rackController.rack.children.every((s,a)=>s.importState(t.children[a])))}exportState(){return te(()=>super.exportState(),{children:this.rackController.rack.children.map(e=>e.exportState())})}}function Mn(n){return"rackController"in n}class Qh{constructor(e){this.emitter=new V,this.items_=[],this.cache_=new Set,this.onSubListAdd_=this.onSubListAdd_.bind(this),this.onSubListRemove_=this.onSubListRemove_.bind(this),this.extract_=e}get items(){return this.items_}allItems(){return Array.from(this.cache_)}find(e){for(const t of this.allItems())if(e(t))return t;return null}includes(e){return this.cache_.has(e)}add(e,t){if(this.includes(e))throw z.shouldNeverHappen();const s=t!==void 0?t:this.items_.length;this.items_.splice(s,0,e),this.cache_.add(e);const a=this.extract_(e);a&&(a.emitter.on("add",this.onSubListAdd_),a.emitter.on("remove",this.onSubListRemove_),a.allItems().forEach(i=>{this.cache_.add(i)})),this.emitter.emit("add",{index:s,item:e,root:this,target:this})}remove(e){const t=this.items_.indexOf(e);if(t<0)return;this.items_.splice(t,1),this.cache_.delete(e);const s=this.extract_(e);s&&(s.allItems().forEach(a=>{this.cache_.delete(a)}),s.emitter.off("add",this.onSubListAdd_),s.emitter.off("remove",this.onSubListRemove_)),this.emitter.emit("remove",{index:t,item:e,root:this,target:this})}onSubListAdd_(e){this.cache_.add(e.item),this.emitter.emit("add",{index:e.index,item:e.item,root:this,target:e.target})}onSubListRemove_(e){this.cache_.delete(e.item),this.emitter.emit("remove",{index:e.index,item:e.item,root:this,target:e.target})}}function Zh(n,e){for(let t=0;t<n.length;t++){const s=n[t];if(De(s)&&s.value===e)return s}return null}function Jh(n){return Mn(n)?n.rackController.rack.bcSet_:null}class ed{constructor(e){var t,s;this.emitter=new V,this.onBladePositionsChange_=this.onBladePositionsChange_.bind(this),this.onSetAdd_=this.onSetAdd_.bind(this),this.onSetRemove_=this.onSetRemove_.bind(this),this.onChildDispose_=this.onChildDispose_.bind(this),this.onChildPositionsChange_=this.onChildPositionsChange_.bind(this),this.onChildValueChange_=this.onChildValueChange_.bind(this),this.onChildViewPropsChange_=this.onChildViewPropsChange_.bind(this),this.onRackLayout_=this.onRackLayout_.bind(this),this.onRackValueChange_=this.onRackValueChange_.bind(this),this.blade_=(t=e.blade)!==null&&t!==void 0?t:null,(s=this.blade_)===null||s===void 0||s.value("positions").emitter.on("change",this.onBladePositionsChange_),this.viewProps=e.viewProps,this.bcSet_=new Qh(Jh),this.bcSet_.emitter.on("add",this.onSetAdd_),this.bcSet_.emitter.on("remove",this.onSetRemove_)}get children(){return this.bcSet_.items}add(e,t){var s;(s=e.parent)===null||s===void 0||s.remove(e),e.parent=this,this.bcSet_.add(e,t)}remove(e){e.parent=null,this.bcSet_.remove(e)}find(e){return this.bcSet_.allItems().filter(e)}onSetAdd_(e){this.updatePositions_();const t=e.target===e.root;if(this.emitter.emit("add",{bladeController:e.item,index:e.index,root:t,sender:this}),!t)return;const s=e.item;if(s.viewProps.emitter.on("change",this.onChildViewPropsChange_),s.blade.value("positions").emitter.on("change",this.onChildPositionsChange_),s.viewProps.handleDispose(this.onChildDispose_),De(s))s.value.emitter.on("change",this.onChildValueChange_);else if(Mn(s)){const a=s.rackController.rack;if(a){const i=a.emitter;i.on("layout",this.onRackLayout_),i.on("valuechange",this.onRackValueChange_)}}}onSetRemove_(e){this.updatePositions_();const t=e.target===e.root;if(this.emitter.emit("remove",{bladeController:e.item,root:t,sender:this}),!t)return;const s=e.item;if(De(s))s.value.emitter.off("change",this.onChildValueChange_);else if(Mn(s)){const a=s.rackController.rack;if(a){const i=a.emitter;i.off("layout",this.onRackLayout_),i.off("valuechange",this.onRackValueChange_)}}}updatePositions_(){const e=this.bcSet_.items.filter(a=>!a.viewProps.get("hidden")),t=e[0],s=e[e.length-1];this.bcSet_.items.forEach(a=>{const i=[];a===t&&(i.push("first"),(!this.blade_||this.blade_.get("positions").includes("veryfirst"))&&i.push("veryfirst")),a===s&&(i.push("last"),(!this.blade_||this.blade_.get("positions").includes("verylast"))&&i.push("verylast")),a.blade.set("positions",i)})}onChildPositionsChange_(){this.updatePositions_(),this.emitter.emit("layout",{sender:this})}onChildViewPropsChange_(e){this.updatePositions_(),this.emitter.emit("layout",{sender:this})}onChildDispose_(){this.bcSet_.items.filter(t=>t.viewProps.get("disposed")).forEach(t=>{this.bcSet_.remove(t)})}onChildValueChange_(e){const t=Zh(this.find(De),e.sender);if(!t)throw z.alreadyDisposed();this.emitter.emit("valuechange",{bladeController:t,options:e.options,sender:this})}onRackLayout_(e){this.updatePositions_(),this.emitter.emit("layout",{sender:this})}onRackValueChange_(e){this.emitter.emit("valuechange",{bladeController:e.bladeController,options:e.options,sender:this})}onBladePositionsChange_(){this.updatePositions_()}}class is{constructor(e){this.onRackAdd_=this.onRackAdd_.bind(this),this.onRackRemove_=this.onRackRemove_.bind(this),this.element=e.element,this.viewProps=e.viewProps;const t=new ed({blade:e.root?void 0:e.blade,viewProps:e.viewProps});t.emitter.on("add",this.onRackAdd_),t.emitter.on("remove",this.onRackRemove_),this.rack=t,this.viewProps.handleDispose(()=>{for(let s=this.rack.children.length-1;s>=0;s--)this.rack.children[s].viewProps.set("disposed",!0)})}onRackAdd_(e){e.root&&Pi(this.element,e.bladeController.view.element,e.index)}onRackRemove_(e){e.root&&ts(e.bladeController.view.element)}}function nt(){return new _({positions:G([],{equals:Oc})})}class wt extends _{constructor(e){super(e)}static create(e){const t={completed:!0,expanded:e,expandedHeight:null,shouldFixHeight:!1,temporaryExpanded:null},s=_.createCore(t);return new wt(s)}get styleExpanded(){var e;return(e=this.get("temporaryExpanded"))!==null&&e!==void 0?e:this.get("expanded")}get styleHeight(){if(!this.styleExpanded)return"0";const e=this.get("expandedHeight");return this.get("shouldFixHeight")&&!k(e)?`${e}px`:"auto"}bindExpandedClass(e,t){const s=()=>{this.styleExpanded?e.classList.add(t):e.classList.remove(t)};fe(this,"expanded",s),fe(this,"temporaryExpanded",s)}cleanUpTransition(){this.set("shouldFixHeight",!1),this.set("expandedHeight",null),this.set("completed",!0)}}function td(n,e){let t=0;return _h(e,()=>{n.set("expandedHeight",null),n.set("temporaryExpanded",!0),jt(e),t=e.clientHeight,n.set("temporaryExpanded",null),jt(e)}),t}function aa(n,e){e.style.height=n.styleHeight}function rs(n,e){n.value("expanded").emitter.on("beforechange",()=>{if(n.set("completed",!1),k(n.get("expandedHeight"))){const t=td(n,e);t>0&&n.set("expandedHeight",t)}n.set("shouldFixHeight",!0),jt(e)}),n.emitter.on("change",()=>{aa(n,e)}),aa(n,e),e.addEventListener("transitionend",t=>{t.propertyName==="height"&&n.cleanUpTransition()})}class zi extends ss{constructor(e,t){super(e,t),this.emitter_=new V,this.controller.foldable.value("expanded").emitter.on("change",s=>{this.emitter_.emit("fold",new fh(this,s.sender.rawValue))}),this.rackApi_.on("change",s=>{this.emitter_.emit("change",s)})}get expanded(){return this.controller.foldable.get("expanded")}set expanded(e){this.controller.foldable.set("expanded",e)}get title(){return this.controller.props.get("title")}set title(e){this.controller.props.set("title",e)}get children(){return this.rackApi_.children}addBinding(e,t,s){return this.rackApi_.addBinding(e,t,s)}addFolder(e){return this.rackApi_.addFolder(e)}addButton(e){return this.rackApi_.addButton(e)}addTab(e){return this.rackApi_.addTab(e)}add(e,t){return this.rackApi_.add(e,t)}remove(e){this.rackApi_.remove(e)}addBlade(e){return this.rackApi_.addBlade(e)}on(e,t){const s=t.bind(this);return this.emitter_.on(e,a=>{s(a)},{key:t}),this}off(e,t){return this.emitter_.off(e,t),this}}const Vi=C("cnt");class nd{constructor(e,t){var s;this.className_=C((s=t.viewName)!==null&&s!==void 0?s:"fld"),this.element=e.createElement("div"),this.element.classList.add(this.className_(),Vi()),t.viewProps.bindClassModifiers(this.element),this.foldable_=t.foldable,this.foldable_.bindExpandedClass(this.element,this.className_(void 0,"expanded")),fe(this.foldable_,"completed",et(this.element,this.className_(void 0,"cpl")));const a=e.createElement("button");a.classList.add(this.className_("b")),fe(t.props,"title",l=>{k(l)?this.element.classList.add(this.className_(void 0,"not")):this.element.classList.remove(this.className_(void 0,"not"))}),t.viewProps.bindDisabled(a),this.element.appendChild(a),this.buttonElement=a;const i=e.createElement("div");i.classList.add(this.className_("i")),this.element.appendChild(i);const r=e.createElement("div");r.classList.add(this.className_("t")),ns(t.props.value("title"),r),this.buttonElement.appendChild(r),this.titleElement=r;const o=e.createElement("div");o.classList.add(this.className_("m")),this.buttonElement.appendChild(o);const c=e.createElement("div");c.classList.add(this.className_("c")),this.element.appendChild(c),this.containerElement=c}}class Gn extends as{constructor(e,t){var s;const a=wt.create((s=t.expanded)!==null&&s!==void 0?s:!0),i=new nd(e,{foldable:a,props:t.props,viewName:t.root?"rot":void 0,viewProps:t.viewProps});super(Object.assign(Object.assign({},t),{rackController:new is({blade:t.blade,element:i.containerElement,root:t.root,viewProps:t.viewProps}),view:i})),this.onTitleClick_=this.onTitleClick_.bind(this),this.props=t.props,this.foldable=a,rs(this.foldable,this.view.containerElement),this.rackController.rack.emitter.on("add",()=>{this.foldable.cleanUpTransition()}),this.rackController.rack.emitter.on("remove",()=>{this.foldable.cleanUpTransition()}),this.view.buttonElement.addEventListener("click",this.onTitleClick_)}get document(){return this.view.element.ownerDocument}importState(e){return ee(e,t=>super.importState(t),t=>({expanded:t.required.boolean,title:t.optional.string}),t=>(this.foldable.set("expanded",t.expanded),this.props.set("title",t.title),!0))}exportState(){return te(()=>super.exportState(),{expanded:this.foldable.get("expanded"),title:this.props.get("title")})}onTitleClick_(){this.foldable.set("expanded",!this.foldable.get("expanded"))}}const sd=Q({id:"folder",type:"blade",accept(n){const e=B(n,t=>({title:t.required.string,view:t.required.constant("folder"),expanded:t.optional.boolean}));return e?{params:e}:null},controller(n){return new Gn(n.document,{blade:n.blade,expanded:n.params.expanded,props:_.fromObject({title:n.params.title}),viewProps:n.viewProps})},api(n){return n.controller instanceof Gn?new zi(n.controller,n.pool):null}}),ad=C("");function ia(n,e){return et(n,ad(void 0,e))}class ye extends _{constructor(e){var t;super(e),this.onDisabledChange_=this.onDisabledChange_.bind(this),this.onParentChange_=this.onParentChange_.bind(this),this.onParentGlobalDisabledChange_=this.onParentGlobalDisabledChange_.bind(this),[this.globalDisabled_,this.setGlobalDisabled_]=Uc(G(this.getGlobalDisabled_())),this.value("disabled").emitter.on("change",this.onDisabledChange_),this.value("parent").emitter.on("change",this.onParentChange_),(t=this.get("parent"))===null||t===void 0||t.globalDisabled.emitter.on("change",this.onParentGlobalDisabledChange_)}static create(e){var t,s,a;const i=e??{};return new ye(_.createCore({disabled:(t=i.disabled)!==null&&t!==void 0?t:!1,disposed:!1,hidden:(s=i.hidden)!==null&&s!==void 0?s:!1,parent:(a=i.parent)!==null&&a!==void 0?a:null}))}get globalDisabled(){return this.globalDisabled_}bindClassModifiers(e){ge(this.globalDisabled_,ia(e,"disabled")),fe(this,"hidden",ia(e,"hidden"))}bindDisabled(e){ge(this.globalDisabled_,t=>{e.disabled=t})}bindTabIndex(e){ge(this.globalDisabled_,t=>{e.tabIndex=t?-1:0})}handleDispose(e){this.value("disposed").emitter.on("change",t=>{t&&e()})}importState(e){this.set("disabled",e.disabled),this.set("hidden",e.hidden)}exportState(){return{disabled:this.get("disabled"),hidden:this.get("hidden")}}getGlobalDisabled_(){const e=this.get("parent");return(e?e.globalDisabled.rawValue:!1)||this.get("disabled")}updateGlobalDisabled_(){this.setGlobalDisabled_(this.getGlobalDisabled_())}onDisabledChange_(){this.updateGlobalDisabled_()}onParentGlobalDisabledChange_(){this.updateGlobalDisabled_()}onParentChange_(e){var t;const s=e.previousRawValue;s?.globalDisabled.emitter.off("change",this.onParentGlobalDisabledChange_),(t=this.get("parent"))===null||t===void 0||t.globalDisabled.emitter.on("change",this.onParentGlobalDisabledChange_),this.updateGlobalDisabled_()}}const ra=C("tbp");class id{constructor(e,t){this.element=e.createElement("div"),this.element.classList.add(ra()),t.viewProps.bindClassModifiers(this.element);const s=e.createElement("div");s.classList.add(ra("c")),this.element.appendChild(s),this.containerElement=s}}const rt=C("tbi");class rd{constructor(e,t){this.element=e.createElement("div"),this.element.classList.add(rt()),t.viewProps.bindClassModifiers(this.element),fe(t.props,"selected",i=>{i?this.element.classList.add(rt(void 0,"sel")):this.element.classList.remove(rt(void 0,"sel"))});const s=e.createElement("button");s.classList.add(rt("b")),t.viewProps.bindDisabled(s),this.element.appendChild(s),this.buttonElement=s;const a=e.createElement("div");a.classList.add(rt("t")),ns(t.props.value("title"),a),this.buttonElement.appendChild(a),this.titleElement=a}}class od{constructor(e,t){this.emitter=new V,this.onClick_=this.onClick_.bind(this),this.props=t.props,this.viewProps=t.viewProps,this.view=new rd(e,{props:t.props,viewProps:t.viewProps}),this.view.buttonElement.addEventListener("click",this.onClick_)}onClick_(){this.emitter.emit("click",{sender:this})}}class Bn extends as{constructor(e,t){const s=new id(e,{viewProps:t.viewProps});super(Object.assign(Object.assign({},t),{rackController:new is({blade:t.blade,element:s.containerElement,viewProps:t.viewProps}),view:s})),this.onItemClick_=this.onItemClick_.bind(this),this.ic_=new od(e,{props:t.itemProps,viewProps:ye.create()}),this.ic_.emitter.on("click",this.onItemClick_),this.props=t.props,fe(this.props,"selected",a=>{this.itemController.props.set("selected",a),this.viewProps.set("hidden",!a)})}get itemController(){return this.ic_}importState(e){return ee(e,t=>super.importState(t),t=>({selected:t.required.boolean,title:t.required.string}),t=>(this.ic_.props.set("selected",t.selected),this.ic_.props.set("title",t.title),!0))}exportState(){return te(()=>super.exportState(),{selected:this.ic_.props.get("selected"),title:this.ic_.props.get("title")})}onItemClick_(){this.props.set("selected",!0)}}class ld extends ss{constructor(e,t){super(e,t),this.emitter_=new V,this.onSelect_=this.onSelect_.bind(this),this.pool_=t,this.rackApi_.on("change",s=>{this.emitter_.emit("change",s)}),this.controller.tab.selectedIndex.emitter.on("change",this.onSelect_)}get pages(){return this.rackApi_.children}addPage(e){const t=this.controller.view.element.ownerDocument,s=new Bn(t,{blade:nt(),itemProps:_.fromObject({selected:!1,title:e.title}),props:_.fromObject({selected:!1}),viewProps:ye.create()}),a=this.pool_.createApi(s);return this.rackApi_.add(a,e.index)}removePage(e){this.rackApi_.remove(this.rackApi_.children[e])}on(e,t){const s=t.bind(this);return this.emitter_.on(e,a=>{s(a)},{key:t}),this}off(e,t){return this.emitter_.off(e,t),this}onSelect_(e){this.emitter_.emit("select",new ph(this,e.rawValue))}}class cd extends ss{get title(){var e;return(e=this.controller.itemController.props.get("title"))!==null&&e!==void 0?e:""}set title(e){this.controller.itemController.props.set("title",e)}get selected(){return this.controller.props.get("selected")}set selected(e){this.controller.props.set("selected",e)}get children(){return this.rackApi_.children}addButton(e){return this.rackApi_.addButton(e)}addFolder(e){return this.rackApi_.addFolder(e)}addTab(e){return this.rackApi_.addTab(e)}add(e,t){this.rackApi_.add(e,t)}remove(e){this.rackApi_.remove(e)}addBinding(e,t,s){return this.rackApi_.addBinding(e,t,s)}addBlade(e){return this.rackApi_.addBlade(e)}}const oa=-1;class hd{constructor(){this.onItemSelectedChange_=this.onItemSelectedChange_.bind(this),this.empty=G(!0),this.selectedIndex=G(oa),this.items_=[]}add(e,t){const s=t??this.items_.length;this.items_.splice(s,0,e),e.emitter.on("change",this.onItemSelectedChange_),this.keepSelection_()}remove(e){const t=this.items_.indexOf(e);t<0||(this.items_.splice(t,1),e.emitter.off("change",this.onItemSelectedChange_),this.keepSelection_())}keepSelection_(){if(this.items_.length===0){this.selectedIndex.rawValue=oa,this.empty.rawValue=!0;return}const e=this.items_.findIndex(t=>t.rawValue);e<0?(this.items_.forEach((t,s)=>{t.rawValue=s===0}),this.selectedIndex.rawValue=0):(this.items_.forEach((t,s)=>{t.rawValue=s===e}),this.selectedIndex.rawValue=e),this.empty.rawValue=!1}onItemSelectedChange_(e){if(e.rawValue){const t=this.items_.findIndex(s=>s===e.sender);this.items_.forEach((s,a)=>{s.rawValue=a===t}),this.selectedIndex.rawValue=t}else this.keepSelection_()}}const ot=C("tab");class dd{constructor(e,t){this.element=e.createElement("div"),this.element.classList.add(ot(),Vi()),t.viewProps.bindClassModifiers(this.element),ge(t.empty,et(this.element,ot(void 0,"nop")));const s=e.createElement("div");s.classList.add(ot("t")),this.element.appendChild(s),this.itemsElement=s;const a=e.createElement("div");a.classList.add(ot("i")),this.element.appendChild(a);const i=e.createElement("div");i.classList.add(ot("c")),this.element.appendChild(i),this.contentsElement=i}}class la extends as{constructor(e,t){const s=new hd,a=new dd(e,{empty:s.empty,viewProps:t.viewProps});super({blade:t.blade,rackController:new is({blade:t.blade,element:a.contentsElement,viewProps:t.viewProps}),view:a}),this.onRackAdd_=this.onRackAdd_.bind(this),this.onRackRemove_=this.onRackRemove_.bind(this);const i=this.rackController.rack;i.emitter.on("add",this.onRackAdd_),i.emitter.on("remove",this.onRackRemove_),this.tab=s}add(e,t){this.rackController.rack.add(e,t)}remove(e){this.rackController.rack.remove(this.rackController.rack.children[e])}onRackAdd_(e){if(!e.root)return;const t=e.bladeController;Pi(this.view.itemsElement,t.itemController.view.element,e.index),t.itemController.viewProps.set("parent",this.viewProps),this.tab.add(t.props.value("selected"))}onRackRemove_(e){if(!e.root)return;const t=e.bladeController;ts(t.itemController.view.element),t.itemController.viewProps.set("parent",null),this.tab.remove(t.props.value("selected"))}}const Hi=Q({id:"tab",type:"blade",accept(n){const e=B(n,t=>({pages:t.required.array(t.required.object({title:t.required.string})),view:t.required.constant("tab")}));return!e||e.pages.length===0?null:{params:e}},controller(n){const e=new la(n.document,{blade:n.blade,viewProps:n.viewProps});return n.params.pages.forEach(t=>{const s=new Bn(n.document,{blade:nt(),itemProps:_.fromObject({selected:!1,title:t.title}),props:_.fromObject({selected:!1}),viewProps:ye.create()});e.add(s)}),e},api(n){return n.controller instanceof la?new ld(n.controller,n.pool):n.controller instanceof Bn?new cd(n.controller,n.pool):null}});function ud(n,e){const t=n.accept(e.params);if(!t)return null;const s=B(e.params,a=>({disabled:a.optional.boolean,hidden:a.optional.boolean}));return n.controller({blade:nt(),document:e.document,params:Object.assign(Object.assign({},t.params),{disabled:s?.disabled,hidden:s?.hidden}),viewProps:ye.create({disabled:s?.disabled,hidden:s?.hidden})})}class os extends ut{get options(){return this.controller.valueController.props.get("options")}set options(e){this.controller.valueController.props.set("options",e)}}class fd{constructor(){this.disabled=!1,this.emitter=new V}dispose(){}tick(){this.disabled||this.emitter.emit("tick",{sender:this})}}class pd{constructor(e,t){this.disabled_=!1,this.timerId_=null,this.onTick_=this.onTick_.bind(this),this.doc_=e,this.emitter=new V,this.interval_=t,this.setTimer_()}get disabled(){return this.disabled_}set disabled(e){this.disabled_=e,this.disabled_?this.clearTimer_():this.setTimer_()}dispose(){this.clearTimer_()}clearTimer_(){if(this.timerId_===null)return;const e=this.doc_.defaultView;e&&e.clearInterval(this.timerId_),this.timerId_=null}setTimer_(){if(this.clearTimer_(),this.interval_<=0)return;const e=this.doc_.defaultView;e&&(this.timerId_=e.setInterval(this.onTick_,this.interval_))}onTick_(){this.disabled_||this.emitter.emit("tick",{sender:this})}}class bt{constructor(e){this.constraints=e}constrain(e){return this.constraints.reduce((t,s)=>s.constrain(t),e)}}function Yt(n,e){if(n instanceof e)return n;if(n instanceof bt){const t=n.constraints.reduce((s,a)=>s||(a instanceof e?a:null),null);if(t)return t}return null}class yt{constructor(e){this.values=_.fromObject({options:e})}constrain(e){const t=this.values.get("options");return t.length===0||t.filter(a=>a.value===e).length>0?e:t[0].value}}function _t(n){var e;const t=Un;if(Array.isArray(n))return(e=B({items:n},s=>({items:s.required.array(s.required.object({text:s.required.string,value:s.required.raw}))})))===null||e===void 0?void 0:e.items;if(typeof n=="object")return t.required.raw(n).value}function ls(n){if(Array.isArray(n))return n;const e=[];return Object.keys(n).forEach(t=>{e.push({text:t,value:n[t]})}),e}function cs(n){return k(n)?null:new yt(ls(n))}const vn=C("lst");class md{constructor(e,t){this.onValueChange_=this.onValueChange_.bind(this),this.props_=t.props,this.element=e.createElement("div"),this.element.classList.add(vn()),t.viewProps.bindClassModifiers(this.element);const s=e.createElement("select");s.classList.add(vn("s")),t.viewProps.bindDisabled(s),this.element.appendChild(s),this.selectElement=s;const a=e.createElement("div");a.classList.add(vn("m")),a.appendChild(Jt(e,"dropdown")),this.element.appendChild(a),t.value.emitter.on("change",this.onValueChange_),this.value_=t.value,fe(this.props_,"options",i=>{ki(this.selectElement),i.forEach(r=>{const o=e.createElement("option");o.textContent=r.text,this.selectElement.appendChild(o)}),this.update_()})}update_(){const e=this.props_.get("options").map(t=>t.value);this.selectElement.selectedIndex=e.indexOf(this.value_.rawValue)}onValueChange_(){this.update_()}}class Re{constructor(e,t){this.onSelectChange_=this.onSelectChange_.bind(this),this.props=t.props,this.value=t.value,this.viewProps=t.viewProps,this.view=new md(e,{props:this.props,value:this.value,viewProps:this.viewProps}),this.view.selectElement.addEventListener("change",this.onSelectChange_)}onSelectChange_(e){const t=e.currentTarget;this.value.rawValue=this.props.get("options")[t.selectedIndex].value}importProps(e){return ee(e,null,t=>({options:t.required.custom(_t)}),t=>(this.props.set("options",ls(t.options)),!0))}exportProps(){return te(null,{options:this.props.get("options")})}}const ca=C("pop");class vd{constructor(e,t){this.element=e.createElement("div"),this.element.classList.add(ca()),t.viewProps.bindClassModifiers(this.element),ge(t.shows,et(this.element,ca(void 0,"v")))}}class Wi{constructor(e,t){this.shows=G(!1),this.viewProps=t.viewProps,this.view=new vd(e,{shows:this.shows,viewProps:this.viewProps})}}const ha=C("txt");class gd{constructor(e,t){this.onChange_=this.onChange_.bind(this),this.element=e.createElement("div"),this.element.classList.add(ha()),t.viewProps.bindClassModifiers(this.element),this.props_=t.props,this.props_.emitter.on("change",this.onChange_);const s=e.createElement("input");s.classList.add(ha("i")),s.type="text",t.viewProps.bindDisabled(s),this.element.appendChild(s),this.inputElement=s,t.value.emitter.on("change",this.onChange_),this.value_=t.value,this.refresh()}refresh(){const e=this.props_.get("formatter");this.inputElement.value=e(this.value_.rawValue)}onChange_(){this.refresh()}}class ft{constructor(e,t){this.onInputChange_=this.onInputChange_.bind(this),this.parser_=t.parser,this.props=t.props,this.value=t.value,this.viewProps=t.viewProps,this.view=new gd(e,{props:t.props,value:this.value,viewProps:this.viewProps}),this.view.inputElement.addEventListener("change",this.onInputChange_)}onInputChange_(e){const s=e.currentTarget.value,a=this.parser_(s);k(a)||(this.value.rawValue=a),this.view.refresh()}}function wd(n){return String(n)}function qi(n){return n==="false"?!1:!!n}function da(n){return wd(n)}function bd(n){return e=>n.reduce((t,s)=>t!==null?t:s(e),null)}const yd=J(0);function $t(n){return yd(n)+"%"}function ji(n){return String(n)}function Fn(n){return n}function st({primary:n,secondary:e,forward:t,backward:s}){let a=!1;function i(r){a||(a=!0,r(),a=!1)}n.emitter.on("change",r=>{i(()=>{e.setRawValue(t(n.rawValue,e.rawValue),r.options)})}),e.emitter.on("change",r=>{i(()=>{n.setRawValue(s(n.rawValue,e.rawValue),r.options)}),i(()=>{e.setRawValue(t(n.rawValue,e.rawValue),r.options)})}),i(()=>{e.setRawValue(t(n.rawValue,e.rawValue),{forceEmit:!1,last:!0})})}function Z(n,e){const t=n*(e.altKey?.1:1)*(e.shiftKey?10:1);return e.upKey?+t:e.downKey?-t:0}function pt(n){return{altKey:n.altKey,downKey:n.key==="ArrowDown",shiftKey:n.shiftKey,upKey:n.key==="ArrowUp"}}function be(n){return{altKey:n.altKey,downKey:n.key==="ArrowLeft",shiftKey:n.shiftKey,upKey:n.key==="ArrowRight"}}function _d(n){return n==="ArrowUp"||n==="ArrowDown"}function Yi(n){return _d(n)||n==="ArrowLeft"||n==="ArrowRight"}function gn(n,e){var t,s;const a=e.ownerDocument.defaultView,i=e.getBoundingClientRect();return{x:n.pageX-(((t=a&&a.scrollX)!==null&&t!==void 0?t:0)+i.left),y:n.pageY-(((s=a&&a.scrollY)!==null&&s!==void 0?s:0)+i.top)}}class Fe{constructor(e){this.lastTouch_=null,this.onDocumentMouseMove_=this.onDocumentMouseMove_.bind(this),this.onDocumentMouseUp_=this.onDocumentMouseUp_.bind(this),this.onMouseDown_=this.onMouseDown_.bind(this),this.onTouchEnd_=this.onTouchEnd_.bind(this),this.onTouchMove_=this.onTouchMove_.bind(this),this.onTouchStart_=this.onTouchStart_.bind(this),this.elem_=e,this.emitter=new V,e.addEventListener("touchstart",this.onTouchStart_,{passive:!1}),e.addEventListener("touchmove",this.onTouchMove_,{passive:!0}),e.addEventListener("touchend",this.onTouchEnd_),e.addEventListener("mousedown",this.onMouseDown_)}computePosition_(e){const t=this.elem_.getBoundingClientRect();return{bounds:{width:t.width,height:t.height},point:e?{x:e.x,y:e.y}:null}}onMouseDown_(e){var t;e.preventDefault(),(t=e.currentTarget)===null||t===void 0||t.focus();const s=this.elem_.ownerDocument;s.addEventListener("mousemove",this.onDocumentMouseMove_),s.addEventListener("mouseup",this.onDocumentMouseUp_),this.emitter.emit("down",{altKey:e.altKey,data:this.computePosition_(gn(e,this.elem_)),sender:this,shiftKey:e.shiftKey})}onDocumentMouseMove_(e){this.emitter.emit("move",{altKey:e.altKey,data:this.computePosition_(gn(e,this.elem_)),sender:this,shiftKey:e.shiftKey})}onDocumentMouseUp_(e){const t=this.elem_.ownerDocument;t.removeEventListener("mousemove",this.onDocumentMouseMove_),t.removeEventListener("mouseup",this.onDocumentMouseUp_),this.emitter.emit("up",{altKey:e.altKey,data:this.computePosition_(gn(e,this.elem_)),sender:this,shiftKey:e.shiftKey})}onTouchStart_(e){e.preventDefault();const t=e.targetTouches.item(0),s=this.elem_.getBoundingClientRect();this.emitter.emit("down",{altKey:e.altKey,data:this.computePosition_(t?{x:t.clientX-s.left,y:t.clientY-s.top}:void 0),sender:this,shiftKey:e.shiftKey}),this.lastTouch_=t}onTouchMove_(e){const t=e.targetTouches.item(0),s=this.elem_.getBoundingClientRect();this.emitter.emit("move",{altKey:e.altKey,data:this.computePosition_(t?{x:t.clientX-s.left,y:t.clientY-s.top}:void 0),sender:this,shiftKey:e.shiftKey}),this.lastTouch_=t}onTouchEnd_(e){var t;const s=(t=e.targetTouches.item(0))!==null&&t!==void 0?t:this.lastTouch_,a=this.elem_.getBoundingClientRect();this.emitter.emit("up",{altKey:e.altKey,data:this.computePosition_(s?{x:s.clientX-a.left,y:s.clientY-a.top}:void 0),sender:this,shiftKey:e.shiftKey})}}const ne=C("txt");class Ed{constructor(e,t){this.onChange_=this.onChange_.bind(this),this.props_=t.props,this.props_.emitter.on("change",this.onChange_),this.element=e.createElement("div"),this.element.classList.add(ne(),ne(void 0,"num")),t.arrayPosition&&this.element.classList.add(ne(void 0,t.arrayPosition)),t.viewProps.bindClassModifiers(this.element);const s=e.createElement("input");s.classList.add(ne("i")),s.type="text",t.viewProps.bindDisabled(s),this.element.appendChild(s),this.inputElement=s,this.onDraggingChange_=this.onDraggingChange_.bind(this),this.dragging_=t.dragging,this.dragging_.emitter.on("change",this.onDraggingChange_),this.element.classList.add(ne()),this.inputElement.classList.add(ne("i"));const a=e.createElement("div");a.classList.add(ne("k")),this.element.appendChild(a),this.knobElement=a;const i=e.createElementNS(ue,"svg");i.classList.add(ne("g")),this.knobElement.appendChild(i);const r=e.createElementNS(ue,"path");r.classList.add(ne("gb")),i.appendChild(r),this.guideBodyElem_=r;const o=e.createElementNS(ue,"path");o.classList.add(ne("gh")),i.appendChild(o),this.guideHeadElem_=o;const c=e.createElement("div");c.classList.add(C("tt")()),this.knobElement.appendChild(c),this.tooltipElem_=c,t.value.emitter.on("change",this.onChange_),this.value=t.value,this.refresh()}onDraggingChange_(e){if(e.rawValue===null){this.element.classList.remove(ne(void 0,"drg"));return}this.element.classList.add(ne(void 0,"drg"));const t=e.rawValue/this.props_.get("pointerScale"),s=t+(t>0?-1:t<0?1:0),a=q(-s,-4,4);this.guideHeadElem_.setAttributeNS(null,"d",[`M ${s+a},0 L${s},4 L${s+a},8`,`M ${t},-1 L${t},9`].join(" ")),this.guideBodyElem_.setAttributeNS(null,"d",`M 0,4 L${t},4`);const i=this.props_.get("formatter");this.tooltipElem_.textContent=i(this.value.rawValue),this.tooltipElem_.style.left=`${t}px`}refresh(){const e=this.props_.get("formatter");this.inputElement.value=e(this.value.rawValue)}onChange_(){this.refresh()}}class Et{constructor(e,t){var s;this.originRawValue_=0,this.onInputChange_=this.onInputChange_.bind(this),this.onInputKeyDown_=this.onInputKeyDown_.bind(this),this.onInputKeyUp_=this.onInputKeyUp_.bind(this),this.onPointerDown_=this.onPointerDown_.bind(this),this.onPointerMove_=this.onPointerMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.parser_=t.parser,this.props=t.props,this.sliderProps_=(s=t.sliderProps)!==null&&s!==void 0?s:null,this.value=t.value,this.viewProps=t.viewProps,this.dragging_=G(null),this.view=new Ed(e,{arrayPosition:t.arrayPosition,dragging:this.dragging_,props:this.props,value:this.value,viewProps:this.viewProps}),this.view.inputElement.addEventListener("change",this.onInputChange_),this.view.inputElement.addEventListener("keydown",this.onInputKeyDown_),this.view.inputElement.addEventListener("keyup",this.onInputKeyUp_);const a=new Fe(this.view.knobElement);a.emitter.on("down",this.onPointerDown_),a.emitter.on("move",this.onPointerMove_),a.emitter.on("up",this.onPointerUp_)}constrainValue_(e){var t,s;const a=(t=this.sliderProps_)===null||t===void 0?void 0:t.get("min"),i=(s=this.sliderProps_)===null||s===void 0?void 0:s.get("max");let r=e;return a!==void 0&&(r=Math.max(r,a)),i!==void 0&&(r=Math.min(r,i)),r}onInputChange_(e){const s=e.currentTarget.value,a=this.parser_(s);k(a)||(this.value.rawValue=this.constrainValue_(a)),this.view.refresh()}onInputKeyDown_(e){const t=Z(this.props.get("keyScale"),pt(e));t!==0&&this.value.setRawValue(this.constrainValue_(this.value.rawValue+t),{forceEmit:!1,last:!1})}onInputKeyUp_(e){Z(this.props.get("keyScale"),pt(e))!==0&&this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}onPointerDown_(){this.originRawValue_=this.value.rawValue,this.dragging_.rawValue=0}computeDraggingValue_(e){if(!e.point)return null;const t=e.point.x-e.bounds.width/2;return this.constrainValue_(this.originRawValue_+t*this.props.get("pointerScale"))}onPointerMove_(e){const t=this.computeDraggingValue_(e.data);t!==null&&(this.value.setRawValue(t,{forceEmit:!1,last:!1}),this.dragging_.rawValue=this.value.rawValue-this.originRawValue_)}onPointerUp_(e){const t=this.computeDraggingValue_(e.data);t!==null&&(this.value.setRawValue(t,{forceEmit:!0,last:!0}),this.dragging_.rawValue=null)}}const wn=C("sld");class xd{constructor(e,t){this.onChange_=this.onChange_.bind(this),this.props_=t.props,this.props_.emitter.on("change",this.onChange_),this.element=e.createElement("div"),this.element.classList.add(wn()),t.viewProps.bindClassModifiers(this.element);const s=e.createElement("div");s.classList.add(wn("t")),t.viewProps.bindTabIndex(s),this.element.appendChild(s),this.trackElement=s;const a=e.createElement("div");a.classList.add(wn("k")),this.trackElement.appendChild(a),this.knobElement=a,t.value.emitter.on("change",this.onChange_),this.value=t.value,this.update_()}update_(){const e=q(I(this.value.rawValue,this.props_.get("min"),this.props_.get("max"),0,100),0,100);this.knobElement.style.width=`${e}%`}onChange_(){this.update_()}}class Td{constructor(e,t){this.onKeyDown_=this.onKeyDown_.bind(this),this.onKeyUp_=this.onKeyUp_.bind(this),this.onPointerDownOrMove_=this.onPointerDownOrMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.value=t.value,this.viewProps=t.viewProps,this.props=t.props,this.view=new xd(e,{props:this.props,value:this.value,viewProps:this.viewProps}),this.ptHandler_=new Fe(this.view.trackElement),this.ptHandler_.emitter.on("down",this.onPointerDownOrMove_),this.ptHandler_.emitter.on("move",this.onPointerDownOrMove_),this.ptHandler_.emitter.on("up",this.onPointerUp_),this.view.trackElement.addEventListener("keydown",this.onKeyDown_),this.view.trackElement.addEventListener("keyup",this.onKeyUp_)}handlePointerEvent_(e,t){e.point&&this.value.setRawValue(I(q(e.point.x,0,e.bounds.width),0,e.bounds.width,this.props.get("min"),this.props.get("max")),t)}onPointerDownOrMove_(e){this.handlePointerEvent_(e.data,{forceEmit:!1,last:!1})}onPointerUp_(e){this.handlePointerEvent_(e.data,{forceEmit:!0,last:!0})}onKeyDown_(e){const t=Z(this.props.get("keyScale"),be(e));t!==0&&this.value.setRawValue(this.value.rawValue+t,{forceEmit:!1,last:!1})}onKeyUp_(e){Z(this.props.get("keyScale"),be(e))!==0&&this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}}const bn=C("sldtxt");class Sd{constructor(e,t){this.element=e.createElement("div"),this.element.classList.add(bn());const s=e.createElement("div");s.classList.add(bn("s")),this.sliderView_=t.sliderView,s.appendChild(this.sliderView_.element),this.element.appendChild(s);const a=e.createElement("div");a.classList.add(bn("t")),this.textView_=t.textView,a.appendChild(this.textView_.element),this.element.appendChild(a)}}class Kt{constructor(e,t){this.value=t.value,this.viewProps=t.viewProps,this.sliderC_=new Td(e,{props:t.sliderProps,value:t.value,viewProps:this.viewProps}),this.textC_=new Et(e,{parser:t.parser,props:t.textProps,sliderProps:t.sliderProps,value:t.value,viewProps:t.viewProps}),this.view=new Sd(e,{sliderView:this.sliderC_.view,textView:this.textC_.view})}get sliderController(){return this.sliderC_}get textController(){return this.textC_}importProps(e){return ee(e,null,t=>({max:t.required.number,min:t.required.number}),t=>{const s=this.sliderC_.props;return s.set("max",t.max),s.set("min",t.min),!0})}exportProps(){const e=this.sliderC_.props;return te(null,{max:e.get("max"),min:e.get("min")})}}function $i(n){return{sliderProps:new _({keyScale:n.keyScale,max:n.max,min:n.min}),textProps:new _({formatter:G(n.formatter),keyScale:n.keyScale,pointerScale:G(n.pointerScale)})}}const Ad={containerUnitSize:"cnt-usz"};function Ki(n){return`--${Ad[n]}`}function mt(n){return Oi(n)}function Te(n){if(Dn(n))return B(n,mt)}function ve(n,e){if(!n)return;const t=[],s=Ri(n,e);s&&t.push(s);const a=Ii(n);return a&&t.push(a),new bt(t)}function Cd(n){return n?n.major===tt.major:!1}function Xi(n){if(n==="inline"||n==="popup")return n}function xt(n,e){n.write(e)}const Ot=C("ckb");class Rd{constructor(e,t){this.onValueChange_=this.onValueChange_.bind(this),this.element=e.createElement("div"),this.element.classList.add(Ot()),t.viewProps.bindClassModifiers(this.element);const s=e.createElement("label");s.classList.add(Ot("l")),this.element.appendChild(s),this.labelElement=s;const a=e.createElement("input");a.classList.add(Ot("i")),a.type="checkbox",this.labelElement.appendChild(a),this.inputElement=a,t.viewProps.bindDisabled(this.inputElement);const i=e.createElement("div");i.classList.add(Ot("w")),this.labelElement.appendChild(i);const r=Jt(e,"check");i.appendChild(r),t.value.emitter.on("change",this.onValueChange_),this.value=t.value,this.update_()}update_(){this.inputElement.checked=this.value.rawValue}onValueChange_(){this.update_()}}class Id{constructor(e,t){this.onInputChange_=this.onInputChange_.bind(this),this.onLabelMouseDown_=this.onLabelMouseDown_.bind(this),this.value=t.value,this.viewProps=t.viewProps,this.view=new Rd(e,{value:this.value,viewProps:this.viewProps}),this.view.inputElement.addEventListener("change",this.onInputChange_),this.view.labelElement.addEventListener("mousedown",this.onLabelMouseDown_)}onInputChange_(e){const t=e.currentTarget;this.value.rawValue=t.checked,e.preventDefault(),e.stopPropagation()}onLabelMouseDown_(e){e.preventDefault()}}function Ld(n){const e=[],t=cs(n.options);return t&&e.push(t),new bt(e)}const Od=Q({id:"input-bool",type:"input",accept:(n,e)=>{if(typeof n!="boolean")return null;const t=B(e,s=>({options:s.optional.custom(_t),readonly:s.optional.constant(!1)}));return t?{initialValue:n,params:t}:null},binding:{reader:n=>qi,constraint:n=>Ld(n.params),writer:n=>xt},controller:n=>{const e=n.document,t=n.value,s=n.constraint,a=s&&Yt(s,yt);return a?new Re(e,{props:new _({options:a.values.value("options")}),value:t,viewProps:n.viewProps}):new Id(e,{value:t,viewProps:n.viewProps})},api(n){return typeof n.controller.value.rawValue!="boolean"?null:n.controller.valueController instanceof Re?new os(n.controller):null}}),Le=C("col");class Nd{constructor(e,t){this.element=e.createElement("div"),this.element.classList.add(Le()),t.foldable.bindExpandedClass(this.element,Le(void 0,"expanded")),fe(t.foldable,"completed",et(this.element,Le(void 0,"cpl")));const s=e.createElement("div");s.classList.add(Le("h")),this.element.appendChild(s);const a=e.createElement("div");a.classList.add(Le("s")),s.appendChild(a),this.swatchElement=a;const i=e.createElement("div");if(i.classList.add(Le("t")),s.appendChild(i),this.textElement=i,t.pickerLayout==="inline"){const r=e.createElement("div");r.classList.add(Le("p")),this.element.appendChild(r),this.pickerElement=r}else this.pickerElement=null}}function Pd(n,e,t){const s=q(n/255,0,1),a=q(e/255,0,1),i=q(t/255,0,1),r=Math.max(s,a,i),o=Math.min(s,a,i),c=r-o;let l=0,d=0;const h=(o+r)/2;return c!==0&&(d=c/(1-Math.abs(r+o-1)),s===r?l=(a-i)/c:a===r?l=2+(i-s)/c:l=4+(s-a)/c,l=l/6+(l<0?1:0)),[l*360,d*100,h*100]}function kd(n,e,t){const s=(n%360+360)%360,a=q(e/100,0,1),i=q(t/100,0,1),r=(1-Math.abs(2*i-1))*a,o=r*(1-Math.abs(s/60%2-1)),c=i-r/2;let l,d,h;return s>=0&&s<60?[l,d,h]=[r,o,0]:s>=60&&s<120?[l,d,h]=[o,r,0]:s>=120&&s<180?[l,d,h]=[0,r,o]:s>=180&&s<240?[l,d,h]=[0,o,r]:s>=240&&s<300?[l,d,h]=[o,0,r]:[l,d,h]=[r,0,o],[(l+c)*255,(d+c)*255,(h+c)*255]}function Dd(n,e,t){const s=q(n/255,0,1),a=q(e/255,0,1),i=q(t/255,0,1),r=Math.max(s,a,i),o=Math.min(s,a,i),c=r-o;let l;c===0?l=0:r===s?l=60*(((a-i)/c%6+6)%6):r===a?l=60*((i-s)/c+2):l=60*((s-a)/c+4);const d=r===0?0:c/r,h=r;return[l,d*100,h*100]}function Qi(n,e,t){const s=Si(n,360),a=q(e/100,0,1),i=q(t/100,0,1),r=i*a,o=r*(1-Math.abs(s/60%2-1)),c=i-r;let l,d,h;return s>=0&&s<60?[l,d,h]=[r,o,0]:s>=60&&s<120?[l,d,h]=[o,r,0]:s>=120&&s<180?[l,d,h]=[0,r,o]:s>=180&&s<240?[l,d,h]=[0,o,r]:s>=240&&s<300?[l,d,h]=[o,0,r]:[l,d,h]=[r,0,o],[(l+c)*255,(d+c)*255,(h+c)*255]}function Ud(n,e,t){const s=t+e*(100-Math.abs(2*t-100))/200;return[n,s!==0?e*(100-Math.abs(2*t-100))/s:0,t+e*(100-Math.abs(2*t-100))/200]}function Md(n,e,t){const s=100-Math.abs(t*(200-e)/100-100);return[n,s!==0?e*t/s:0,t*(200-e)/200]}function pe(n){return[n[0],n[1],n[2]]}function tn(n,e){return[n[0],n[1],n[2],e]}const Gd={hsl:{hsl:(n,e,t)=>[n,e,t],hsv:Ud,rgb:kd},hsv:{hsl:Md,hsv:(n,e,t)=>[n,e,t],rgb:Qi},rgb:{hsl:Pd,hsv:Dd,rgb:(n,e,t)=>[n,e,t]}};function Je(n,e){return[e==="float"?1:n==="rgb"?255:360,e==="float"?1:n==="rgb"?255:100,e==="float"?1:n==="rgb"?255:100]}function Bd(n,e){return n===e?e:Si(n,e)}function Zi(n,e,t){var s;const a=Je(e,t);return[e==="rgb"?q(n[0],0,a[0]):Bd(n[0],a[0]),q(n[1],0,a[1]),q(n[2],0,a[2]),q((s=n[3])!==null&&s!==void 0?s:1,0,1)]}function ua(n,e,t,s){const a=Je(e,t),i=Je(e,s);return n.map((r,o)=>r/a[o]*i[o])}function Ji(n,e,t){const s=ua(n,e.mode,e.type,"int"),a=Gd[e.mode][t.mode](...s);return ua(a,t.mode,"int",t.type)}class R{static black(){return new R([0,0,0],"rgb")}constructor(e,t){this.type="int",this.mode=t,this.comps_=Zi(e,t,this.type)}getComponents(e){return tn(Ji(pe(this.comps_),{mode:this.mode,type:this.type},{mode:e??this.mode,type:this.type}),this.comps_[3])}toRgbaObject(){const e=this.getComponents("rgb");return{r:e[0],g:e[1],b:e[2],a:e[3]}}}const _e=C("colp");class Fd{constructor(e,t){this.alphaViews_=null,this.element=e.createElement("div"),this.element.classList.add(_e()),t.viewProps.bindClassModifiers(this.element);const s=e.createElement("div");s.classList.add(_e("hsv"));const a=e.createElement("div");a.classList.add(_e("sv")),this.svPaletteView_=t.svPaletteView,a.appendChild(this.svPaletteView_.element),s.appendChild(a);const i=e.createElement("div");i.classList.add(_e("h")),this.hPaletteView_=t.hPaletteView,i.appendChild(this.hPaletteView_.element),s.appendChild(i),this.element.appendChild(s);const r=e.createElement("div");if(r.classList.add(_e("rgb")),this.textsView_=t.textsView,r.appendChild(this.textsView_.element),this.element.appendChild(r),t.alphaViews){this.alphaViews_={palette:t.alphaViews.palette,text:t.alphaViews.text};const o=e.createElement("div");o.classList.add(_e("a"));const c=e.createElement("div");c.classList.add(_e("ap")),c.appendChild(this.alphaViews_.palette.element),o.appendChild(c);const l=e.createElement("div");l.classList.add(_e("at")),l.appendChild(this.alphaViews_.text.element),o.appendChild(l),this.element.appendChild(o)}}get allFocusableElements(){const e=[this.svPaletteView_.element,this.hPaletteView_.element,this.textsView_.modeSelectElement,...this.textsView_.inputViews.map(t=>t.inputElement)];return this.alphaViews_&&e.push(this.alphaViews_.palette.element,this.alphaViews_.text.inputElement),e}}function zd(n){return n==="int"?"int":n==="float"?"float":void 0}function hs(n){return B(n,e=>({color:e.optional.object({alpha:e.optional.boolean,type:e.optional.custom(zd)}),expanded:e.optional.boolean,picker:e.optional.custom(Xi),readonly:e.optional.constant(!1)}))}function Ge(n){return n?.1:1}function er(n){var e;return(e=n.color)===null||e===void 0?void 0:e.type}class ds{constructor(e,t){this.type="float",this.mode=t,this.comps_=Zi(e,t,this.type)}getComponents(e){return tn(Ji(pe(this.comps_),{mode:this.mode,type:this.type},{mode:e??this.mode,type:this.type}),this.comps_[3])}toRgbaObject(){const e=this.getComponents("rgb");return{r:e[0],g:e[1],b:e[2],a:e[3]}}}const Vd={int:(n,e)=>new R(n,e),float:(n,e)=>new ds(n,e)};function us(n,e,t){return Vd[t](n,e)}function Hd(n){return n.type==="float"}function Wd(n){return n.type==="int"}function qd(n){const e=n.getComponents(),t=Je(n.mode,"int");return new R([Math.round(I(e[0],0,1,0,t[0])),Math.round(I(e[1],0,1,0,t[1])),Math.round(I(e[2],0,1,0,t[2])),e[3]],n.mode)}function jd(n){const e=n.getComponents(),t=Je(n.mode,"int");return new ds([I(e[0],0,t[0],0,1),I(e[1],0,t[1],0,1),I(e[2],0,t[2],0,1),e[3]],n.mode)}function X(n,e){if(n.type===e)return n;if(Wd(n)&&e==="float")return jd(n);if(Hd(n)&&e==="int")return qd(n);throw z.shouldNeverHappen()}function Yd(n,e){return n.alpha===e.alpha&&n.mode===e.mode&&n.notation===e.notation&&n.type===e.type}function ae(n,e){const t=n.match(/^(.+)%$/);return Math.min(t?parseFloat(t[1])*.01*e:parseFloat(n),e)}const $d={deg:n=>n,grad:n=>n*360/400,rad:n=>n*360/(2*Math.PI),turn:n=>n*360};function tr(n){const e=n.match(/^([0-9.]+?)(deg|grad|rad|turn)$/);if(!e)return parseFloat(n);const t=parseFloat(e[1]),s=e[2];return $d[s](t)}function nr(n){const e=n.match(/^rgb\(\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);if(!e)return null;const t=[ae(e[1],255),ae(e[2],255),ae(e[3],255)];return isNaN(t[0])||isNaN(t[1])||isNaN(t[2])?null:t}function Kd(n){const e=nr(n);return e?new R(e,"rgb"):null}function sr(n){const e=n.match(/^rgba\(\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);if(!e)return null;const t=[ae(e[1],255),ae(e[2],255),ae(e[3],255),ae(e[4],1)];return isNaN(t[0])||isNaN(t[1])||isNaN(t[2])||isNaN(t[3])?null:t}function Xd(n){const e=sr(n);return e?new R(e,"rgb"):null}function ar(n){const e=n.match(/^hsl\(\s*([0-9A-Fa-f.]+(?:deg|grad|rad|turn)?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);if(!e)return null;const t=[tr(e[1]),ae(e[2],100),ae(e[3],100)];return isNaN(t[0])||isNaN(t[1])||isNaN(t[2])?null:t}function Qd(n){const e=ar(n);return e?new R(e,"hsl"):null}function ir(n){const e=n.match(/^hsla\(\s*([0-9A-Fa-f.]+(?:deg|grad|rad|turn)?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);if(!e)return null;const t=[tr(e[1]),ae(e[2],100),ae(e[3],100),ae(e[4],1)];return isNaN(t[0])||isNaN(t[1])||isNaN(t[2])||isNaN(t[3])?null:t}function Zd(n){const e=ir(n);return e?new R(e,"hsl"):null}function rr(n){const e=n.match(/^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/);if(e)return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16)];const t=n.match(/^(?:#|0x)([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);return t?[parseInt(t[1],16),parseInt(t[2],16),parseInt(t[3],16)]:null}function Jd(n){const e=rr(n);return e?new R(e,"rgb"):null}function or(n){const e=n.match(/^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/);if(e)return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16),I(parseInt(e[4]+e[4],16),0,255,0,1)];const t=n.match(/^(?:#|0x)?([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);return t?[parseInt(t[1],16),parseInt(t[2],16),parseInt(t[3],16),I(parseInt(t[4],16),0,255,0,1)]:null}function eu(n){const e=or(n);return e?new R(e,"rgb"):null}function lr(n){const e=n.match(/^\{\s*r\s*:\s*([0-9A-Fa-f.]+%?)\s*,\s*g\s*:\s*([0-9A-Fa-f.]+%?)\s*,\s*b\s*:\s*([0-9A-Fa-f.]+%?)\s*\}$/);if(!e)return null;const t=[parseFloat(e[1]),parseFloat(e[2]),parseFloat(e[3])];return isNaN(t[0])||isNaN(t[1])||isNaN(t[2])?null:t}function tu(n){return e=>{const t=lr(e);return t?us(t,"rgb",n):null}}function cr(n){const e=n.match(/^\{\s*r\s*:\s*([0-9A-Fa-f.]+%?)\s*,\s*g\s*:\s*([0-9A-Fa-f.]+%?)\s*,\s*b\s*:\s*([0-9A-Fa-f.]+%?)\s*,\s*a\s*:\s*([0-9A-Fa-f.]+%?)\s*\}$/);if(!e)return null;const t=[parseFloat(e[1]),parseFloat(e[2]),parseFloat(e[3]),parseFloat(e[4])];return isNaN(t[0])||isNaN(t[1])||isNaN(t[2])||isNaN(t[3])?null:t}function nu(n){return e=>{const t=cr(e);return t?us(t,"rgb",n):null}}const su=[{parser:rr,result:{alpha:!1,mode:"rgb",notation:"hex"}},{parser:or,result:{alpha:!0,mode:"rgb",notation:"hex"}},{parser:nr,result:{alpha:!1,mode:"rgb",notation:"func"}},{parser:sr,result:{alpha:!0,mode:"rgb",notation:"func"}},{parser:ar,result:{alpha:!1,mode:"hsl",notation:"func"}},{parser:ir,result:{alpha:!0,mode:"hsl",notation:"func"}},{parser:lr,result:{alpha:!1,mode:"rgb",notation:"object"}},{parser:cr,result:{alpha:!0,mode:"rgb",notation:"object"}}];function au(n){return su.reduce((e,{parser:t,result:s})=>e||(t(n)?s:null),null)}function iu(n,e="int"){const t=au(n);return t?t.notation==="hex"&&e!=="float"?Object.assign(Object.assign({},t),{type:"int"}):t.notation==="func"?Object.assign(Object.assign({},t),{type:e}):null:null}function Tt(n){const e=[Jd,eu,Kd,Xd,Qd,Zd];e.push(tu("int"),nu("int"));const t=bd(e);return s=>{const a=t(s);return a?X(a,n):null}}function ru(n){const e=Tt("int");if(typeof n!="string")return R.black();const t=e(n);return t??R.black()}function hr(n){const e=q(Math.floor(n),0,255).toString(16);return e.length===1?`0${e}`:e}function fs(n,e="#"){const t=pe(n.getComponents("rgb")).map(hr).join("");return`${e}${t}`}function ps(n,e="#"){const t=n.getComponents("rgb"),s=[t[0],t[1],t[2],t[3]*255].map(hr).join("");return`${e}${s}`}function dr(n){const e=J(0),t=X(n,"int");return`rgb(${pe(t.getComponents("rgb")).map(a=>e(a)).join(", ")})`}function Gt(n){const e=J(2),t=J(0);return`rgba(${X(n,"int").getComponents("rgb").map((i,r)=>(r===3?e:t)(i)).join(", ")})`}function ou(n){const e=[J(0),$t,$t],t=X(n,"int");return`hsl(${pe(t.getComponents("hsl")).map((a,i)=>e[i](a)).join(", ")})`}function lu(n){const e=[J(0),$t,$t,J(2)];return`hsla(${X(n,"int").getComponents("hsl").map((a,i)=>e[i](a)).join(", ")})`}function ur(n,e){const t=J(e==="float"?2:0),s=["r","g","b"],a=X(n,e);return`{${pe(a.getComponents("rgb")).map((r,o)=>`${s[o]}: ${t(r)}`).join(", ")}}`}function cu(n){return e=>ur(e,n)}function fr(n,e){const t=J(2),s=J(e==="float"?2:0),a=["r","g","b","a"];return`{${X(n,e).getComponents("rgb").map((o,c)=>{const l=c===3?t:s;return`${a[c]}: ${l(o)}`}).join(", ")}}`}function hu(n){return e=>fr(e,n)}const du=[{format:{alpha:!1,mode:"rgb",notation:"hex",type:"int"},stringifier:fs},{format:{alpha:!0,mode:"rgb",notation:"hex",type:"int"},stringifier:ps},{format:{alpha:!1,mode:"rgb",notation:"func",type:"int"},stringifier:dr},{format:{alpha:!0,mode:"rgb",notation:"func",type:"int"},stringifier:Gt},{format:{alpha:!1,mode:"hsl",notation:"func",type:"int"},stringifier:ou},{format:{alpha:!0,mode:"hsl",notation:"func",type:"int"},stringifier:lu},...["int","float"].reduce((n,e)=>[...n,{format:{alpha:!1,mode:"rgb",notation:"object",type:e},stringifier:cu(e)},{format:{alpha:!0,mode:"rgb",notation:"object",type:e},stringifier:hu(e)}],[])];function pr(n){return du.reduce((e,t)=>e||(Yd(t.format,n)?t.stringifier:null),null)}const lt=C("apl");class uu{constructor(e,t){this.onValueChange_=this.onValueChange_.bind(this),this.value=t.value,this.value.emitter.on("change",this.onValueChange_),this.element=e.createElement("div"),this.element.classList.add(lt()),t.viewProps.bindClassModifiers(this.element),t.viewProps.bindTabIndex(this.element);const s=e.createElement("div");s.classList.add(lt("b")),this.element.appendChild(s);const a=e.createElement("div");a.classList.add(lt("c")),s.appendChild(a),this.colorElem_=a;const i=e.createElement("div");i.classList.add(lt("m")),this.element.appendChild(i),this.markerElem_=i;const r=e.createElement("div");r.classList.add(lt("p")),this.markerElem_.appendChild(r),this.previewElem_=r,this.update_()}update_(){const e=this.value.rawValue,t=e.getComponents("rgb"),s=new R([t[0],t[1],t[2],0],"rgb"),a=new R([t[0],t[1],t[2],255],"rgb"),i=["to right",Gt(s),Gt(a)];this.colorElem_.style.background=`linear-gradient(${i.join(",")})`,this.previewElem_.style.backgroundColor=Gt(e);const r=I(t[3],0,1,0,100);this.markerElem_.style.left=`${r}%`}onValueChange_(){this.update_()}}class fu{constructor(e,t){this.onKeyDown_=this.onKeyDown_.bind(this),this.onKeyUp_=this.onKeyUp_.bind(this),this.onPointerDown_=this.onPointerDown_.bind(this),this.onPointerMove_=this.onPointerMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.value=t.value,this.viewProps=t.viewProps,this.view=new uu(e,{value:this.value,viewProps:this.viewProps}),this.ptHandler_=new Fe(this.view.element),this.ptHandler_.emitter.on("down",this.onPointerDown_),this.ptHandler_.emitter.on("move",this.onPointerMove_),this.ptHandler_.emitter.on("up",this.onPointerUp_),this.view.element.addEventListener("keydown",this.onKeyDown_),this.view.element.addEventListener("keyup",this.onKeyUp_)}handlePointerEvent_(e,t){if(!e.point)return;const s=e.point.x/e.bounds.width,a=this.value.rawValue,[i,r,o]=a.getComponents("hsv");this.value.setRawValue(new R([i,r,o,s],"hsv"),t)}onPointerDown_(e){this.handlePointerEvent_(e.data,{forceEmit:!1,last:!1})}onPointerMove_(e){this.handlePointerEvent_(e.data,{forceEmit:!1,last:!1})}onPointerUp_(e){this.handlePointerEvent_(e.data,{forceEmit:!0,last:!0})}onKeyDown_(e){const t=Z(Ge(!0),be(e));if(t===0)return;const s=this.value.rawValue,[a,i,r,o]=s.getComponents("hsv");this.value.setRawValue(new R([a,i,r,o+t],"hsv"),{forceEmit:!1,last:!1})}onKeyUp_(e){Z(Ge(!0),be(e))!==0&&this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}}const We=C("coltxt");function pu(n){const e=n.createElement("select"),t=[{text:"RGB",value:"rgb"},{text:"HSL",value:"hsl"},{text:"HSV",value:"hsv"},{text:"HEX",value:"hex"}];return e.appendChild(t.reduce((s,a)=>{const i=n.createElement("option");return i.textContent=a.text,i.value=a.value,s.appendChild(i),s},n.createDocumentFragment())),e}class mu{constructor(e,t){this.element=e.createElement("div"),this.element.classList.add(We()),t.viewProps.bindClassModifiers(this.element);const s=e.createElement("div");s.classList.add(We("m")),this.modeElem_=pu(e),this.modeElem_.classList.add(We("ms")),s.appendChild(this.modeSelectElement),t.viewProps.bindDisabled(this.modeElem_);const a=e.createElement("div");a.classList.add(We("mm")),a.appendChild(Jt(e,"dropdown")),s.appendChild(a),this.element.appendChild(s);const i=e.createElement("div");i.classList.add(We("w")),this.element.appendChild(i),this.inputsElem_=i,this.inputViews_=t.inputViews,this.applyInputViews_(),ge(t.mode,r=>{this.modeElem_.value=r})}get modeSelectElement(){return this.modeElem_}get inputViews(){return this.inputViews_}set inputViews(e){this.inputViews_=e,this.applyInputViews_()}applyInputViews_(){ki(this.inputsElem_);const e=this.element.ownerDocument;this.inputViews_.forEach(t=>{const s=e.createElement("div");s.classList.add(We("c")),s.appendChild(t.element),this.inputsElem_.appendChild(s)})}}function vu(n){return J(n==="float"?2:0)}function gu(n,e,t){const s=Je(n,e)[t];return new vt({min:0,max:s})}function wu(n,e,t){return new Et(n,{arrayPosition:t===0?"fst":t===2?"lst":"mid",parser:e.parser,props:_.fromObject({formatter:vu(e.colorType),keyScale:Ge(!1),pointerScale:e.colorType==="float"?.01:1}),value:G(0,{constraint:gu(e.colorMode,e.colorType,t)}),viewProps:e.viewProps})}function bu(n,e){const t={colorMode:e.colorMode,colorType:e.colorType,parser:we,viewProps:e.viewProps};return[0,1,2].map(s=>{const a=wu(n,t,s);return st({primary:e.value,secondary:a.value,forward(i){return X(i,e.colorType).getComponents(e.colorMode)[s]},backward(i,r){const o=e.colorMode,l=X(i,e.colorType).getComponents(o);l[s]=r;const d=us(tn(pe(l),l[3]),o,e.colorType);return X(d,"int")}}),a})}function yu(n,e){const t=new ft(n,{parser:Tt("int"),props:_.fromObject({formatter:fs}),value:G(R.black()),viewProps:e.viewProps});return st({primary:e.value,secondary:t.value,forward:s=>new R(pe(s.getComponents()),s.mode),backward:(s,a)=>new R(tn(pe(a.getComponents(s.mode)),s.getComponents()[3]),s.mode)}),[t]}function _u(n){return n!=="hex"}class Eu{constructor(e,t){this.onModeSelectChange_=this.onModeSelectChange_.bind(this),this.colorType_=t.colorType,this.value=t.value,this.viewProps=t.viewProps,this.colorMode=G(this.value.rawValue.mode),this.ccs_=this.createComponentControllers_(e),this.view=new mu(e,{mode:this.colorMode,inputViews:[this.ccs_[0].view,this.ccs_[1].view,this.ccs_[2].view],viewProps:this.viewProps}),this.view.modeSelectElement.addEventListener("change",this.onModeSelectChange_)}createComponentControllers_(e){const t=this.colorMode.rawValue;return _u(t)?bu(e,{colorMode:t,colorType:this.colorType_,value:this.value,viewProps:this.viewProps}):yu(e,{value:this.value,viewProps:this.viewProps})}onModeSelectChange_(e){const t=e.currentTarget;this.colorMode.rawValue=t.value,this.ccs_=this.createComponentControllers_(this.view.element.ownerDocument),this.view.inputViews=this.ccs_.map(s=>s.view)}}const yn=C("hpl");class xu{constructor(e,t){this.onValueChange_=this.onValueChange_.bind(this),this.value=t.value,this.value.emitter.on("change",this.onValueChange_),this.element=e.createElement("div"),this.element.classList.add(yn()),t.viewProps.bindClassModifiers(this.element),t.viewProps.bindTabIndex(this.element);const s=e.createElement("div");s.classList.add(yn("c")),this.element.appendChild(s);const a=e.createElement("div");a.classList.add(yn("m")),this.element.appendChild(a),this.markerElem_=a,this.update_()}update_(){const e=this.value.rawValue,[t]=e.getComponents("hsv");this.markerElem_.style.backgroundColor=dr(new R([t,100,100],"hsv"));const s=I(t,0,360,0,100);this.markerElem_.style.left=`${s}%`}onValueChange_(){this.update_()}}class Tu{constructor(e,t){this.onKeyDown_=this.onKeyDown_.bind(this),this.onKeyUp_=this.onKeyUp_.bind(this),this.onPointerDown_=this.onPointerDown_.bind(this),this.onPointerMove_=this.onPointerMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.value=t.value,this.viewProps=t.viewProps,this.view=new xu(e,{value:this.value,viewProps:this.viewProps}),this.ptHandler_=new Fe(this.view.element),this.ptHandler_.emitter.on("down",this.onPointerDown_),this.ptHandler_.emitter.on("move",this.onPointerMove_),this.ptHandler_.emitter.on("up",this.onPointerUp_),this.view.element.addEventListener("keydown",this.onKeyDown_),this.view.element.addEventListener("keyup",this.onKeyUp_)}handlePointerEvent_(e,t){if(!e.point)return;const s=I(q(e.point.x,0,e.bounds.width),0,e.bounds.width,0,360),a=this.value.rawValue,[,i,r,o]=a.getComponents("hsv");this.value.setRawValue(new R([s,i,r,o],"hsv"),t)}onPointerDown_(e){this.handlePointerEvent_(e.data,{forceEmit:!1,last:!1})}onPointerMove_(e){this.handlePointerEvent_(e.data,{forceEmit:!1,last:!1})}onPointerUp_(e){this.handlePointerEvent_(e.data,{forceEmit:!0,last:!0})}onKeyDown_(e){const t=Z(Ge(!1),be(e));if(t===0)return;const s=this.value.rawValue,[a,i,r,o]=s.getComponents("hsv");this.value.setRawValue(new R([a+t,i,r,o],"hsv"),{forceEmit:!1,last:!1})}onKeyUp_(e){Z(Ge(!1),be(e))!==0&&this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}}const _n=C("svp"),fa=64;class Su{constructor(e,t){this.onValueChange_=this.onValueChange_.bind(this),this.value=t.value,this.value.emitter.on("change",this.onValueChange_),this.element=e.createElement("div"),this.element.classList.add(_n()),t.viewProps.bindClassModifiers(this.element),t.viewProps.bindTabIndex(this.element);const s=e.createElement("canvas");s.height=fa,s.width=fa,s.classList.add(_n("c")),this.element.appendChild(s),this.canvasElement=s;const a=e.createElement("div");a.classList.add(_n("m")),this.element.appendChild(a),this.markerElem_=a,this.update_()}update_(){const e=Th(this.canvasElement);if(!e)return;const s=this.value.rawValue.getComponents("hsv"),a=this.canvasElement.width,i=this.canvasElement.height,r=e.getImageData(0,0,a,i),o=r.data;for(let d=0;d<i;d++)for(let h=0;h<a;h++){const u=I(h,0,a,0,100),w=I(d,0,i,100,0),v=Qi(s[0],u,w),m=(d*a+h)*4;o[m]=v[0],o[m+1]=v[1],o[m+2]=v[2],o[m+3]=255}e.putImageData(r,0,0);const c=I(s[1],0,100,0,100);this.markerElem_.style.left=`${c}%`;const l=I(s[2],0,100,100,0);this.markerElem_.style.top=`${l}%`}onValueChange_(){this.update_()}}class Au{constructor(e,t){this.onKeyDown_=this.onKeyDown_.bind(this),this.onKeyUp_=this.onKeyUp_.bind(this),this.onPointerDown_=this.onPointerDown_.bind(this),this.onPointerMove_=this.onPointerMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.value=t.value,this.viewProps=t.viewProps,this.view=new Su(e,{value:this.value,viewProps:this.viewProps}),this.ptHandler_=new Fe(this.view.element),this.ptHandler_.emitter.on("down",this.onPointerDown_),this.ptHandler_.emitter.on("move",this.onPointerMove_),this.ptHandler_.emitter.on("up",this.onPointerUp_),this.view.element.addEventListener("keydown",this.onKeyDown_),this.view.element.addEventListener("keyup",this.onKeyUp_)}handlePointerEvent_(e,t){if(!e.point)return;const s=I(e.point.x,0,e.bounds.width,0,100),a=I(e.point.y,0,e.bounds.height,100,0),[i,,,r]=this.value.rawValue.getComponents("hsv");this.value.setRawValue(new R([i,s,a,r],"hsv"),t)}onPointerDown_(e){this.handlePointerEvent_(e.data,{forceEmit:!1,last:!1})}onPointerMove_(e){this.handlePointerEvent_(e.data,{forceEmit:!1,last:!1})}onPointerUp_(e){this.handlePointerEvent_(e.data,{forceEmit:!0,last:!0})}onKeyDown_(e){Yi(e.key)&&e.preventDefault();const[t,s,a,i]=this.value.rawValue.getComponents("hsv"),r=Ge(!1),o=Z(r,be(e)),c=Z(r,pt(e));o===0&&c===0||this.value.setRawValue(new R([t,s+o,a+c,i],"hsv"),{forceEmit:!1,last:!1})}onKeyUp_(e){const t=Ge(!1),s=Z(t,be(e)),a=Z(t,pt(e));s===0&&a===0||this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}}class Cu{constructor(e,t){this.value=t.value,this.viewProps=t.viewProps,this.hPaletteC_=new Tu(e,{value:this.value,viewProps:this.viewProps}),this.svPaletteC_=new Au(e,{value:this.value,viewProps:this.viewProps}),this.alphaIcs_=t.supportsAlpha?{palette:new fu(e,{value:this.value,viewProps:this.viewProps}),text:new Et(e,{parser:we,props:_.fromObject({pointerScale:.01,keyScale:.1,formatter:J(2)}),value:G(0,{constraint:new vt({min:0,max:1})}),viewProps:this.viewProps})}:null,this.alphaIcs_&&st({primary:this.value,secondary:this.alphaIcs_.text.value,forward:s=>s.getComponents()[3],backward:(s,a)=>{const i=s.getComponents();return i[3]=a,new R(i,s.mode)}}),this.textsC_=new Eu(e,{colorType:t.colorType,value:this.value,viewProps:this.viewProps}),this.view=new Fd(e,{alphaViews:this.alphaIcs_?{palette:this.alphaIcs_.palette.view,text:this.alphaIcs_.text.view}:null,hPaletteView:this.hPaletteC_.view,supportsAlpha:t.supportsAlpha,svPaletteView:this.svPaletteC_.view,textsView:this.textsC_.view,viewProps:this.viewProps})}get textsController(){return this.textsC_}}const En=C("colsw");class Ru{constructor(e,t){this.onValueChange_=this.onValueChange_.bind(this),t.value.emitter.on("change",this.onValueChange_),this.value=t.value,this.element=e.createElement("div"),this.element.classList.add(En()),t.viewProps.bindClassModifiers(this.element);const s=e.createElement("div");s.classList.add(En("sw")),this.element.appendChild(s),this.swatchElem_=s;const a=e.createElement("button");a.classList.add(En("b")),t.viewProps.bindDisabled(a),this.element.appendChild(a),this.buttonElement=a,this.update_()}update_(){const e=this.value.rawValue;this.swatchElem_.style.backgroundColor=ps(e)}onValueChange_(){this.update_()}}class Iu{constructor(e,t){this.value=t.value,this.viewProps=t.viewProps,this.view=new Ru(e,{value:this.value,viewProps:this.viewProps})}}class ms{constructor(e,t){this.onButtonBlur_=this.onButtonBlur_.bind(this),this.onButtonClick_=this.onButtonClick_.bind(this),this.onPopupChildBlur_=this.onPopupChildBlur_.bind(this),this.onPopupChildKeydown_=this.onPopupChildKeydown_.bind(this),this.value=t.value,this.viewProps=t.viewProps,this.foldable_=wt.create(t.expanded),this.swatchC_=new Iu(e,{value:this.value,viewProps:this.viewProps});const s=this.swatchC_.view.buttonElement;s.addEventListener("blur",this.onButtonBlur_),s.addEventListener("click",this.onButtonClick_),this.textC_=new ft(e,{parser:t.parser,props:_.fromObject({formatter:t.formatter}),value:this.value,viewProps:this.viewProps}),this.view=new Nd(e,{foldable:this.foldable_,pickerLayout:t.pickerLayout}),this.view.swatchElement.appendChild(this.swatchC_.view.element),this.view.textElement.appendChild(this.textC_.view.element),this.popC_=t.pickerLayout==="popup"?new Wi(e,{viewProps:this.viewProps}):null;const a=new Cu(e,{colorType:t.colorType,supportsAlpha:t.supportsAlpha,value:this.value,viewProps:this.viewProps});a.view.allFocusableElements.forEach(i=>{i.addEventListener("blur",this.onPopupChildBlur_),i.addEventListener("keydown",this.onPopupChildKeydown_)}),this.pickerC_=a,this.popC_?(this.view.element.appendChild(this.popC_.view.element),this.popC_.view.element.appendChild(a.view.element),st({primary:this.foldable_.value("expanded"),secondary:this.popC_.shows,forward:i=>i,backward:(i,r)=>r})):this.view.pickerElement&&(this.view.pickerElement.appendChild(this.pickerC_.view.element),rs(this.foldable_,this.view.pickerElement))}get textController(){return this.textC_}onButtonBlur_(e){if(!this.popC_)return;const t=this.view.element,s=e.relatedTarget;(!s||!t.contains(s))&&(this.popC_.shows.rawValue=!1)}onButtonClick_(){this.foldable_.set("expanded",!this.foldable_.get("expanded")),this.foldable_.get("expanded")&&this.pickerC_.view.allFocusableElements[0].focus()}onPopupChildBlur_(e){if(!this.popC_)return;const t=this.popC_.view.element,s=Di(e);s&&t.contains(s)||s&&s===this.swatchC_.view.buttonElement&&!es(t.ownerDocument)||(this.popC_.shows.rawValue=!1)}onPopupChildKeydown_(e){this.popC_?e.key==="Escape"&&(this.popC_.shows.rawValue=!1):this.view.pickerElement&&e.key==="Escape"&&this.swatchC_.view.buttonElement.focus()}}function Lu(n){return pe(n.getComponents("rgb")).reduce((e,t)=>e<<8|Math.floor(t)&255,0)}function Ou(n){return n.getComponents("rgb").reduce((e,t,s)=>{const a=Math.floor(s===3?t*255:t)&255;return e<<8|a},0)>>>0}function Nu(n){return new R([n>>16&255,n>>8&255,n&255],"rgb")}function Pu(n){return new R([n>>24&255,n>>16&255,n>>8&255,I(n&255,0,255,0,1)],"rgb")}function ku(n){return typeof n!="number"?R.black():Nu(n)}function Du(n){return typeof n!="number"?R.black():Pu(n)}function Bt(n,e){return typeof n!="object"||k(n)?!1:e in n&&typeof n[e]=="number"}function mr(n){return Bt(n,"r")&&Bt(n,"g")&&Bt(n,"b")}function vr(n){return mr(n)&&Bt(n,"a")}function gr(n){return mr(n)}function vs(n,e){if(n.mode!==e.mode||n.type!==e.type)return!1;const t=n.getComponents(),s=e.getComponents();for(let a=0;a<t.length;a++)if(t[a]!==s[a])return!1;return!0}function pa(n){return"a"in n?[n.r,n.g,n.b,n.a]:[n.r,n.g,n.b]}function Uu(n){const e=pr(n);return e?(t,s)=>{xt(t,e(s))}:null}function Mu(n){const e=n?Ou:Lu;return(t,s)=>{xt(t,e(s))}}function Gu(n,e,t){const a=X(e,t).toRgbaObject();n.writeProperty("r",a.r),n.writeProperty("g",a.g),n.writeProperty("b",a.b),n.writeProperty("a",a.a)}function Bu(n,e,t){const a=X(e,t).toRgbaObject();n.writeProperty("r",a.r),n.writeProperty("g",a.g),n.writeProperty("b",a.b)}function Fu(n,e){return(t,s)=>{n?Gu(t,s,e):Bu(t,s,e)}}function zu(n){var e;return!!(!((e=n?.color)===null||e===void 0)&&e.alpha)}function Vu(n){return n?e=>ps(e,"0x"):e=>fs(e,"0x")}function Hu(n){return"color"in n||n.view==="color"}const Wu=Q({id:"input-color-number",type:"input",accept:(n,e)=>{if(typeof n!="number"||!Hu(e))return null;const t=hs(e);return t?{initialValue:n,params:Object.assign(Object.assign({},t),{supportsAlpha:zu(e)})}:null},binding:{reader:n=>n.params.supportsAlpha?Du:ku,equals:vs,writer:n=>Mu(n.params.supportsAlpha)},controller:n=>{var e,t;return new ms(n.document,{colorType:"int",expanded:(e=n.params.expanded)!==null&&e!==void 0?e:!1,formatter:Vu(n.params.supportsAlpha),parser:Tt("int"),pickerLayout:(t=n.params.picker)!==null&&t!==void 0?t:"popup",supportsAlpha:n.params.supportsAlpha,value:n.value,viewProps:n.viewProps})}});function qu(n,e){if(!gr(n))return X(R.black(),e);if(e==="int"){const t=pa(n);return new R(t,"rgb")}if(e==="float"){const t=pa(n);return new ds(t,"rgb")}return X(R.black(),"int")}function ju(n){return vr(n)}function Yu(n){return e=>{const t=qu(e,n);return X(t,"int")}}function $u(n,e){return t=>n?fr(t,e):ur(t,e)}const Ku=Q({id:"input-color-object",type:"input",accept:(n,e)=>{var t;if(!gr(n))return null;const s=hs(e);return s?{initialValue:n,params:Object.assign(Object.assign({},s),{colorType:(t=er(e))!==null&&t!==void 0?t:"int"})}:null},binding:{reader:n=>Yu(n.params.colorType),equals:vs,writer:n=>Fu(ju(n.initialValue),n.params.colorType)},controller:n=>{var e,t;const s=vr(n.initialValue);return new ms(n.document,{colorType:n.params.colorType,expanded:(e=n.params.expanded)!==null&&e!==void 0?e:!1,formatter:$u(s,n.params.colorType),parser:Tt("int"),pickerLayout:(t=n.params.picker)!==null&&t!==void 0?t:"popup",supportsAlpha:s,value:n.value,viewProps:n.viewProps})}}),Xu=Q({id:"input-color-string",type:"input",accept:(n,e)=>{if(typeof n!="string"||e.view==="text")return null;const t=iu(n,er(e));if(!t)return null;const s=pr(t);if(!s)return null;const a=hs(e);return a?{initialValue:n,params:Object.assign(Object.assign({},a),{format:t,stringifier:s})}:null},binding:{reader:()=>ru,equals:vs,writer:n=>{const e=Uu(n.params.format);if(!e)throw z.notBindable();return e}},controller:n=>{var e,t;return new ms(n.document,{colorType:n.params.format.type,expanded:(e=n.params.expanded)!==null&&e!==void 0?e:!1,formatter:n.params.stringifier,parser:Tt("int"),pickerLayout:(t=n.params.picker)!==null&&t!==void 0?t:"popup",supportsAlpha:n.params.format.alpha,value:n.value,viewProps:n.viewProps})}});class gs{constructor(e){this.components=e.components,this.asm_=e.assembly}constrain(e){const t=this.asm_.toComponents(e).map((s,a)=>{var i,r;return(r=(i=this.components[a])===null||i===void 0?void 0:i.constrain(s))!==null&&r!==void 0?r:s});return this.asm_.fromComponents(t)}}const ma=C("pndtxt");class Qu{constructor(e,t){this.textViews=t.textViews,this.element=e.createElement("div"),this.element.classList.add(ma()),this.textViews.forEach(s=>{const a=e.createElement("div");a.classList.add(ma("a")),a.appendChild(s.element),this.element.appendChild(a)})}}function Zu(n,e,t){return new Et(n,{arrayPosition:t===0?"fst":t===e.axes.length-1?"lst":"mid",parser:e.parser,props:e.axes[t].textProps,value:G(0,{constraint:e.axes[t].constraint}),viewProps:e.viewProps})}class ws{constructor(e,t){this.value=t.value,this.viewProps=t.viewProps,this.acs_=t.axes.map((s,a)=>Zu(e,t,a)),this.acs_.forEach((s,a)=>{st({primary:this.value,secondary:s.value,forward:i=>t.assembly.toComponents(i)[a],backward:(i,r)=>{const o=t.assembly.toComponents(i);return o[a]=r,t.assembly.fromComponents(o)}})}),this.view=new Qu(e,{textViews:this.acs_.map(s=>s.view)})}get textControllers(){return this.acs_}}class Ju extends ut{get max(){return this.controller.valueController.sliderController.props.get("max")}set max(e){this.controller.valueController.sliderController.props.set("max",e)}get min(){return this.controller.valueController.sliderController.props.get("min")}set min(e){this.controller.valueController.sliderController.props.set("min",e)}}function ef(n,e){const t=[],s=Ri(n,e);s&&t.push(s);const a=Ii(n);a&&t.push(a);const i=cs(n.options);return i&&t.push(i),new bt(t)}const tf=Q({id:"input-number",type:"input",accept:(n,e)=>{if(typeof n!="number")return null;const t=B(e,s=>Object.assign(Object.assign({},Oi(s)),{options:s.optional.custom(_t),readonly:s.optional.constant(!1)}));return t?{initialValue:n,params:t}:null},binding:{reader:n=>Ti,constraint:n=>ef(n.params,n.initialValue),writer:n=>xt},controller:n=>{const e=n.value,t=n.constraint,s=t&&Yt(t,yt);if(s)return new Re(n.document,{props:new _({options:s.values.value("options")}),value:e,viewProps:n.viewProps});const a=Li(n.params,e.rawValue),i=t&&Yt(t,vt);return i?new Kt(n.document,Object.assign(Object.assign({},$i(Object.assign(Object.assign({},a),{keyScale:G(a.keyScale),max:i.values.value("max"),min:i.values.value("min")}))),{parser:we,value:e,viewProps:n.viewProps})):new Et(n.document,{parser:we,props:_.fromObject(a),value:e,viewProps:n.viewProps})},api(n){return typeof n.controller.value.rawValue!="number"?null:n.controller.valueController instanceof Kt?new Ju(n.controller):n.controller.valueController instanceof Re?new os(n.controller):null}});class Ae{constructor(e=0,t=0){this.x=e,this.y=t}getComponents(){return[this.x,this.y]}static isObject(e){if(k(e))return!1;const t=e.x,s=e.y;return!(typeof t!="number"||typeof s!="number")}static equals(e,t){return e.x===t.x&&e.y===t.y}toObject(){return{x:this.x,y:this.y}}}const wr={toComponents:n=>n.getComponents(),fromComponents:n=>new Ae(...n)},qe=C("p2d");class nf{constructor(e,t){this.element=e.createElement("div"),this.element.classList.add(qe()),t.viewProps.bindClassModifiers(this.element),ge(t.expanded,et(this.element,qe(void 0,"expanded")));const s=e.createElement("div");s.classList.add(qe("h")),this.element.appendChild(s);const a=e.createElement("button");a.classList.add(qe("b")),a.appendChild(Jt(e,"p2dpad")),t.viewProps.bindDisabled(a),s.appendChild(a),this.buttonElement=a;const i=e.createElement("div");if(i.classList.add(qe("t")),s.appendChild(i),this.textElement=i,t.pickerLayout==="inline"){const r=e.createElement("div");r.classList.add(qe("p")),this.element.appendChild(r),this.pickerElement=r}else this.pickerElement=null}}const Ee=C("p2dp");class sf{constructor(e,t){this.onFoldableChange_=this.onFoldableChange_.bind(this),this.onPropsChange_=this.onPropsChange_.bind(this),this.onValueChange_=this.onValueChange_.bind(this),this.props_=t.props,this.props_.emitter.on("change",this.onPropsChange_),this.element=e.createElement("div"),this.element.classList.add(Ee()),t.layout==="popup"&&this.element.classList.add(Ee(void 0,"p")),t.viewProps.bindClassModifiers(this.element);const s=e.createElement("div");s.classList.add(Ee("p")),t.viewProps.bindTabIndex(s),this.element.appendChild(s),this.padElement=s;const a=e.createElementNS(ue,"svg");a.classList.add(Ee("g")),this.padElement.appendChild(a),this.svgElem_=a;const i=e.createElementNS(ue,"line");i.classList.add(Ee("ax")),i.setAttributeNS(null,"x1","0"),i.setAttributeNS(null,"y1","50%"),i.setAttributeNS(null,"x2","100%"),i.setAttributeNS(null,"y2","50%"),this.svgElem_.appendChild(i);const r=e.createElementNS(ue,"line");r.classList.add(Ee("ax")),r.setAttributeNS(null,"x1","50%"),r.setAttributeNS(null,"y1","0"),r.setAttributeNS(null,"x2","50%"),r.setAttributeNS(null,"y2","100%"),this.svgElem_.appendChild(r);const o=e.createElementNS(ue,"line");o.classList.add(Ee("l")),o.setAttributeNS(null,"x1","50%"),o.setAttributeNS(null,"y1","50%"),this.svgElem_.appendChild(o),this.lineElem_=o;const c=e.createElement("div");c.classList.add(Ee("m")),this.padElement.appendChild(c),this.markerElem_=c,t.value.emitter.on("change",this.onValueChange_),this.value=t.value,this.update_()}get allFocusableElements(){return[this.padElement]}update_(){const[e,t]=this.value.rawValue.getComponents(),s=this.props_.get("max"),a=I(e,-s,+s,0,100),i=I(t,-s,+s,0,100),r=this.props_.get("invertsY")?100-i:i;this.lineElem_.setAttributeNS(null,"x2",`${a}%`),this.lineElem_.setAttributeNS(null,"y2",`${r}%`),this.markerElem_.style.left=`${a}%`,this.markerElem_.style.top=`${r}%`}onValueChange_(){this.update_()}onPropsChange_(){this.update_()}onFoldableChange_(){this.update_()}}function va(n,e,t){return[Z(e[0],be(n)),Z(e[1],pt(n))*(t?1:-1)]}class af{constructor(e,t){this.onPadKeyDown_=this.onPadKeyDown_.bind(this),this.onPadKeyUp_=this.onPadKeyUp_.bind(this),this.onPointerDown_=this.onPointerDown_.bind(this),this.onPointerMove_=this.onPointerMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.props=t.props,this.value=t.value,this.viewProps=t.viewProps,this.view=new sf(e,{layout:t.layout,props:this.props,value:this.value,viewProps:this.viewProps}),this.ptHandler_=new Fe(this.view.padElement),this.ptHandler_.emitter.on("down",this.onPointerDown_),this.ptHandler_.emitter.on("move",this.onPointerMove_),this.ptHandler_.emitter.on("up",this.onPointerUp_),this.view.padElement.addEventListener("keydown",this.onPadKeyDown_),this.view.padElement.addEventListener("keyup",this.onPadKeyUp_)}handlePointerEvent_(e,t){if(!e.point)return;const s=this.props.get("max"),a=I(e.point.x,0,e.bounds.width,-s,+s),i=I(this.props.get("invertsY")?e.bounds.height-e.point.y:e.point.y,0,e.bounds.height,-s,+s);this.value.setRawValue(new Ae(a,i),t)}onPointerDown_(e){this.handlePointerEvent_(e.data,{forceEmit:!1,last:!1})}onPointerMove_(e){this.handlePointerEvent_(e.data,{forceEmit:!1,last:!1})}onPointerUp_(e){this.handlePointerEvent_(e.data,{forceEmit:!0,last:!0})}onPadKeyDown_(e){Yi(e.key)&&e.preventDefault();const[t,s]=va(e,[this.props.get("xKeyScale"),this.props.get("yKeyScale")],this.props.get("invertsY"));t===0&&s===0||this.value.setRawValue(new Ae(this.value.rawValue.x+t,this.value.rawValue.y+s),{forceEmit:!1,last:!1})}onPadKeyUp_(e){const[t,s]=va(e,[this.props.get("xKeyScale"),this.props.get("yKeyScale")],this.props.get("invertsY"));t===0&&s===0||this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}}class rf{constructor(e,t){var s,a;this.onPopupChildBlur_=this.onPopupChildBlur_.bind(this),this.onPopupChildKeydown_=this.onPopupChildKeydown_.bind(this),this.onPadButtonBlur_=this.onPadButtonBlur_.bind(this),this.onPadButtonClick_=this.onPadButtonClick_.bind(this),this.value=t.value,this.viewProps=t.viewProps,this.foldable_=wt.create(t.expanded),this.popC_=t.pickerLayout==="popup"?new Wi(e,{viewProps:this.viewProps}):null;const i=new af(e,{layout:t.pickerLayout,props:new _({invertsY:G(t.invertsY),max:G(t.max),xKeyScale:t.axes[0].textProps.value("keyScale"),yKeyScale:t.axes[1].textProps.value("keyScale")}),value:this.value,viewProps:this.viewProps});i.view.allFocusableElements.forEach(r=>{r.addEventListener("blur",this.onPopupChildBlur_),r.addEventListener("keydown",this.onPopupChildKeydown_)}),this.pickerC_=i,this.textC_=new ws(e,{assembly:wr,axes:t.axes,parser:t.parser,value:this.value,viewProps:this.viewProps}),this.view=new nf(e,{expanded:this.foldable_.value("expanded"),pickerLayout:t.pickerLayout,viewProps:this.viewProps}),this.view.textElement.appendChild(this.textC_.view.element),(s=this.view.buttonElement)===null||s===void 0||s.addEventListener("blur",this.onPadButtonBlur_),(a=this.view.buttonElement)===null||a===void 0||a.addEventListener("click",this.onPadButtonClick_),this.popC_?(this.view.element.appendChild(this.popC_.view.element),this.popC_.view.element.appendChild(this.pickerC_.view.element),st({primary:this.foldable_.value("expanded"),secondary:this.popC_.shows,forward:r=>r,backward:(r,o)=>o})):this.view.pickerElement&&(this.view.pickerElement.appendChild(this.pickerC_.view.element),rs(this.foldable_,this.view.pickerElement))}get textController(){return this.textC_}onPadButtonBlur_(e){if(!this.popC_)return;const t=this.view.element,s=e.relatedTarget;(!s||!t.contains(s))&&(this.popC_.shows.rawValue=!1)}onPadButtonClick_(){this.foldable_.set("expanded",!this.foldable_.get("expanded")),this.foldable_.get("expanded")&&this.pickerC_.view.allFocusableElements[0].focus()}onPopupChildBlur_(e){if(!this.popC_)return;const t=this.popC_.view.element,s=Di(e);s&&t.contains(s)||s&&s===this.view.buttonElement&&!es(t.ownerDocument)||(this.popC_.shows.rawValue=!1)}onPopupChildKeydown_(e){this.popC_?e.key==="Escape"&&(this.popC_.shows.rawValue=!1):this.view.pickerElement&&e.key==="Escape"&&this.view.buttonElement.focus()}}function of(n){return Ae.isObject(n)?new Ae(n.x,n.y):new Ae}function lf(n,e){n.writeProperty("x",e.x),n.writeProperty("y",e.y)}function cf(n,e){return new gs({assembly:wr,components:[ve(Object.assign(Object.assign({},n),n.x),e.x),ve(Object.assign(Object.assign({},n),n.y),e.y)]})}function ga(n,e){var t,s;if(!k(n.min)||!k(n.max))return Math.max(Math.abs((t=n.min)!==null&&t!==void 0?t:0),Math.abs((s=n.max)!==null&&s!==void 0?s:0));const a=Ai(n);return Math.max(Math.abs(a)*10,Math.abs(e)*10)}function hf(n,e){var t,s;const a=ga(Ue(n,(t=n.x)!==null&&t!==void 0?t:{}),e.x),i=ga(Ue(n,(s=n.y)!==null&&s!==void 0?s:{}),e.y);return Math.max(a,i)}function df(n){if(!("y"in n))return!1;const e=n.y;return e&&"inverted"in e?!!e.inverted:!1}const uf=Q({id:"input-point2d",type:"input",accept:(n,e)=>{if(!Ae.isObject(n))return null;const t=B(e,s=>Object.assign(Object.assign({},mt(s)),{expanded:s.optional.boolean,picker:s.optional.custom(Xi),readonly:s.optional.constant(!1),x:s.optional.custom(Te),y:s.optional.object(Object.assign(Object.assign({},mt(s)),{inverted:s.optional.boolean}))}));return t?{initialValue:n,params:t}:null},binding:{reader:()=>of,constraint:n=>cf(n.params,n.initialValue),equals:Ae.equals,writer:()=>lf},controller:n=>{var e,t;const s=n.document,a=n.value,i=n.constraint,r=[n.params.x,n.params.y];return new rf(s,{axes:a.rawValue.getComponents().map((o,c)=>{var l;return Jn({constraint:i.components[c],initialValue:o,params:Ue(n.params,(l=r[c])!==null&&l!==void 0?l:{})})}),expanded:(e=n.params.expanded)!==null&&e!==void 0?e:!1,invertsY:df(n.params),max:hf(n.params,a.rawValue),parser:we,pickerLayout:(t=n.params.picker)!==null&&t!==void 0?t:"popup",value:a,viewProps:n.viewProps})}});class Qe{constructor(e=0,t=0,s=0){this.x=e,this.y=t,this.z=s}getComponents(){return[this.x,this.y,this.z]}static isObject(e){if(k(e))return!1;const t=e.x,s=e.y,a=e.z;return!(typeof t!="number"||typeof s!="number"||typeof a!="number")}static equals(e,t){return e.x===t.x&&e.y===t.y&&e.z===t.z}toObject(){return{x:this.x,y:this.y,z:this.z}}}const br={toComponents:n=>n.getComponents(),fromComponents:n=>new Qe(...n)};function ff(n){return Qe.isObject(n)?new Qe(n.x,n.y,n.z):new Qe}function pf(n,e){n.writeProperty("x",e.x),n.writeProperty("y",e.y),n.writeProperty("z",e.z)}function mf(n,e){return new gs({assembly:br,components:[ve(Object.assign(Object.assign({},n),n.x),e.x),ve(Object.assign(Object.assign({},n),n.y),e.y),ve(Object.assign(Object.assign({},n),n.z),e.z)]})}const vf=Q({id:"input-point3d",type:"input",accept:(n,e)=>{if(!Qe.isObject(n))return null;const t=B(e,s=>Object.assign(Object.assign({},mt(s)),{readonly:s.optional.constant(!1),x:s.optional.custom(Te),y:s.optional.custom(Te),z:s.optional.custom(Te)}));return t?{initialValue:n,params:t}:null},binding:{reader:n=>ff,constraint:n=>mf(n.params,n.initialValue),equals:Qe.equals,writer:n=>pf},controller:n=>{const e=n.value,t=n.constraint,s=[n.params.x,n.params.y,n.params.z];return new ws(n.document,{assembly:br,axes:e.rawValue.getComponents().map((a,i)=>{var r;return Jn({constraint:t.components[i],initialValue:a,params:Ue(n.params,(r=s[i])!==null&&r!==void 0?r:{})})}),parser:we,value:e,viewProps:n.viewProps})}});class Ze{constructor(e=0,t=0,s=0,a=0){this.x=e,this.y=t,this.z=s,this.w=a}getComponents(){return[this.x,this.y,this.z,this.w]}static isObject(e){if(k(e))return!1;const t=e.x,s=e.y,a=e.z,i=e.w;return!(typeof t!="number"||typeof s!="number"||typeof a!="number"||typeof i!="number")}static equals(e,t){return e.x===t.x&&e.y===t.y&&e.z===t.z&&e.w===t.w}toObject(){return{x:this.x,y:this.y,z:this.z,w:this.w}}}const yr={toComponents:n=>n.getComponents(),fromComponents:n=>new Ze(...n)};function gf(n){return Ze.isObject(n)?new Ze(n.x,n.y,n.z,n.w):new Ze}function wf(n,e){n.writeProperty("x",e.x),n.writeProperty("y",e.y),n.writeProperty("z",e.z),n.writeProperty("w",e.w)}function bf(n,e){return new gs({assembly:yr,components:[ve(Object.assign(Object.assign({},n),n.x),e.x),ve(Object.assign(Object.assign({},n),n.y),e.y),ve(Object.assign(Object.assign({},n),n.z),e.z),ve(Object.assign(Object.assign({},n),n.w),e.w)]})}const yf=Q({id:"input-point4d",type:"input",accept:(n,e)=>{if(!Ze.isObject(n))return null;const t=B(e,s=>Object.assign(Object.assign({},mt(s)),{readonly:s.optional.constant(!1),w:s.optional.custom(Te),x:s.optional.custom(Te),y:s.optional.custom(Te),z:s.optional.custom(Te)}));return t?{initialValue:n,params:t}:null},binding:{reader:n=>gf,constraint:n=>bf(n.params,n.initialValue),equals:Ze.equals,writer:n=>wf},controller:n=>{const e=n.value,t=n.constraint,s=[n.params.x,n.params.y,n.params.z,n.params.w];return new ws(n.document,{assembly:yr,axes:e.rawValue.getComponents().map((a,i)=>{var r;return Jn({constraint:t.components[i],initialValue:a,params:Ue(n.params,(r=s[i])!==null&&r!==void 0?r:{})})}),parser:we,value:e,viewProps:n.viewProps})}});function _f(n){const e=[],t=cs(n.options);return t&&e.push(t),new bt(e)}const Ef=Q({id:"input-string",type:"input",accept:(n,e)=>{if(typeof n!="string")return null;const t=B(e,s=>({readonly:s.optional.constant(!1),options:s.optional.custom(_t)}));return t?{initialValue:n,params:t}:null},binding:{reader:n=>ji,constraint:n=>_f(n.params),writer:n=>xt},controller:n=>{const e=n.document,t=n.value,s=n.constraint,a=s&&Yt(s,yt);return a?new Re(e,{props:new _({options:a.values.value("options")}),value:t,viewProps:n.viewProps}):new ft(e,{parser:i=>i,props:_.fromObject({formatter:Fn}),value:t,viewProps:n.viewProps})},api(n){return typeof n.controller.value.rawValue!="string"?null:n.controller.valueController instanceof Re?new os(n.controller):null}}),St={monitor:{defaultInterval:200,defaultRows:3}},wa=C("mll");class xf{constructor(e,t){this.onValueUpdate_=this.onValueUpdate_.bind(this),this.formatter_=t.formatter,this.element=e.createElement("div"),this.element.classList.add(wa()),t.viewProps.bindClassModifiers(this.element);const s=e.createElement("textarea");s.classList.add(wa("i")),s.style.height=`calc(var(${Ki("containerUnitSize")}) * ${t.rows})`,s.readOnly=!0,t.viewProps.bindDisabled(s),this.element.appendChild(s),this.textareaElem_=s,t.value.emitter.on("change",this.onValueUpdate_),this.value=t.value,this.update_()}update_(){const e=this.textareaElem_,t=e.scrollTop===e.scrollHeight-e.clientHeight,s=[];this.value.rawValue.forEach(a=>{a!==void 0&&s.push(this.formatter_(a))}),e.textContent=s.join(`
`),t&&(e.scrollTop=e.scrollHeight)}onValueUpdate_(){this.update_()}}class bs{constructor(e,t){this.value=t.value,this.viewProps=t.viewProps,this.view=new xf(e,{formatter:t.formatter,rows:t.rows,value:this.value,viewProps:this.viewProps})}}const ba=C("sgl");class Tf{constructor(e,t){this.onValueUpdate_=this.onValueUpdate_.bind(this),this.formatter_=t.formatter,this.element=e.createElement("div"),this.element.classList.add(ba()),t.viewProps.bindClassModifiers(this.element);const s=e.createElement("input");s.classList.add(ba("i")),s.readOnly=!0,s.type="text",t.viewProps.bindDisabled(s),this.element.appendChild(s),this.inputElement=s,t.value.emitter.on("change",this.onValueUpdate_),this.value=t.value,this.update_()}update_(){const e=this.value.rawValue,t=e[e.length-1];this.inputElement.value=t!==void 0?this.formatter_(t):""}onValueUpdate_(){this.update_()}}class ys{constructor(e,t){this.value=t.value,this.viewProps=t.viewProps,this.view=new Tf(e,{formatter:t.formatter,value:this.value,viewProps:this.viewProps})}}const Sf=Q({id:"monitor-bool",type:"monitor",accept:(n,e)=>{if(typeof n!="boolean")return null;const t=B(e,s=>({readonly:s.required.constant(!0),rows:s.optional.number}));return t?{initialValue:n,params:t}:null},binding:{reader:n=>qi},controller:n=>{var e;return n.value.rawValue.length===1?new ys(n.document,{formatter:da,value:n.value,viewProps:n.viewProps}):new bs(n.document,{formatter:da,rows:(e=n.params.rows)!==null&&e!==void 0?e:St.monitor.defaultRows,value:n.value,viewProps:n.viewProps})}});class Af extends ut{get max(){return this.controller.valueController.props.get("max")}set max(e){this.controller.valueController.props.set("max",e)}get min(){return this.controller.valueController.props.get("min")}set min(e){this.controller.valueController.props.set("min",e)}}const xe=C("grl");class Cf{constructor(e,t){this.onCursorChange_=this.onCursorChange_.bind(this),this.onValueUpdate_=this.onValueUpdate_.bind(this),this.element=e.createElement("div"),this.element.classList.add(xe()),t.viewProps.bindClassModifiers(this.element),this.formatter_=t.formatter,this.props_=t.props,this.cursor_=t.cursor,this.cursor_.emitter.on("change",this.onCursorChange_);const s=e.createElementNS(ue,"svg");s.classList.add(xe("g")),s.style.height=`calc(var(${Ki("containerUnitSize")}) * ${t.rows})`,this.element.appendChild(s),this.svgElem_=s;const a=e.createElementNS(ue,"polyline");this.svgElem_.appendChild(a),this.lineElem_=a;const i=e.createElement("div");i.classList.add(xe("t"),C("tt")()),this.element.appendChild(i),this.tooltipElem_=i,t.value.emitter.on("change",this.onValueUpdate_),this.value=t.value,this.update_()}get graphElement(){return this.svgElem_}update_(){const{clientWidth:e,clientHeight:t}=this.element,s=this.value.rawValue.length-1,a=this.props_.get("min"),i=this.props_.get("max"),r=[];this.value.rawValue.forEach((h,u)=>{if(h===void 0)return;const w=I(u,0,s,0,e),v=I(h,a,i,t,0);r.push([w,v].join(","))}),this.lineElem_.setAttributeNS(null,"points",r.join(" "));const o=this.tooltipElem_,c=this.value.rawValue[this.cursor_.rawValue];if(c===void 0){o.classList.remove(xe("t","a"));return}const l=I(this.cursor_.rawValue,0,s,0,e),d=I(c,a,i,t,0);o.style.left=`${l}px`,o.style.top=`${d}px`,o.textContent=`${this.formatter_(c)}`,o.classList.contains(xe("t","a"))||(o.classList.add(xe("t","a"),xe("t","in")),jt(o),o.classList.remove(xe("t","in")))}onValueUpdate_(){this.update_()}onCursorChange_(){this.update_()}}class _r{constructor(e,t){if(this.onGraphMouseMove_=this.onGraphMouseMove_.bind(this),this.onGraphMouseLeave_=this.onGraphMouseLeave_.bind(this),this.onGraphPointerDown_=this.onGraphPointerDown_.bind(this),this.onGraphPointerMove_=this.onGraphPointerMove_.bind(this),this.onGraphPointerUp_=this.onGraphPointerUp_.bind(this),this.props=t.props,this.value=t.value,this.viewProps=t.viewProps,this.cursor_=G(-1),this.view=new Cf(e,{cursor:this.cursor_,formatter:t.formatter,rows:t.rows,props:this.props,value:this.value,viewProps:this.viewProps}),!es(e))this.view.element.addEventListener("mousemove",this.onGraphMouseMove_),this.view.element.addEventListener("mouseleave",this.onGraphMouseLeave_);else{const s=new Fe(this.view.element);s.emitter.on("down",this.onGraphPointerDown_),s.emitter.on("move",this.onGraphPointerMove_),s.emitter.on("up",this.onGraphPointerUp_)}}importProps(e){return ee(e,null,t=>({max:t.required.number,min:t.required.number}),t=>(this.props.set("max",t.max),this.props.set("min",t.min),!0))}exportProps(){return te(null,{max:this.props.get("max"),min:this.props.get("min")})}onGraphMouseLeave_(){this.cursor_.rawValue=-1}onGraphMouseMove_(e){const{clientWidth:t}=this.view.element;this.cursor_.rawValue=Math.floor(I(e.offsetX,0,t,0,this.value.rawValue.length))}onGraphPointerDown_(e){this.onGraphPointerMove_(e)}onGraphPointerMove_(e){if(!e.data.point){this.cursor_.rawValue=-1;return}this.cursor_.rawValue=Math.floor(I(e.data.point.x,0,e.data.bounds.width,0,this.value.rawValue.length))}onGraphPointerUp_(){this.cursor_.rawValue=-1}}function zn(n){return k(n.format)?J(2):n.format}function Rf(n){var e;return n.value.rawValue.length===1?new ys(n.document,{formatter:zn(n.params),value:n.value,viewProps:n.viewProps}):new bs(n.document,{formatter:zn(n.params),rows:(e=n.params.rows)!==null&&e!==void 0?e:St.monitor.defaultRows,value:n.value,viewProps:n.viewProps})}function If(n){var e,t,s;return new _r(n.document,{formatter:zn(n.params),rows:(e=n.params.rows)!==null&&e!==void 0?e:St.monitor.defaultRows,props:_.fromObject({max:(t=n.params.max)!==null&&t!==void 0?t:100,min:(s=n.params.min)!==null&&s!==void 0?s:0}),value:n.value,viewProps:n.viewProps})}function ya(n){return n.view==="graph"}const Lf=Q({id:"monitor-number",type:"monitor",accept:(n,e)=>{if(typeof n!="number")return null;const t=B(e,s=>({format:s.optional.function,max:s.optional.number,min:s.optional.number,readonly:s.required.constant(!0),rows:s.optional.number,view:s.optional.string}));return t?{initialValue:n,params:t}:null},binding:{defaultBufferSize:n=>ya(n)?64:1,reader:n=>Ti},controller:n=>ya(n.params)?If(n):Rf(n),api:n=>n.controller.valueController instanceof _r?new Af(n.controller):null}),Of=Q({id:"monitor-string",type:"monitor",accept:(n,e)=>{if(typeof n!="string")return null;const t=B(e,s=>({multiline:s.optional.boolean,readonly:s.required.constant(!0),rows:s.optional.number}));return t?{initialValue:n,params:t}:null},binding:{reader:n=>ji},controller:n=>{var e;const t=n.value;return t.rawValue.length>1||n.params.multiline?new bs(n.document,{formatter:Fn,rows:(e=n.params.rows)!==null&&e!==void 0?e:St.monitor.defaultRows,value:t,viewProps:n.viewProps}):new ys(n.document,{formatter:Fn,value:t,viewProps:n.viewProps})}});class Nf{constructor(){this.map_=new Map}get(e){var t;return(t=this.map_.get(e))!==null&&t!==void 0?t:null}has(e){return this.map_.has(e)}add(e,t){return this.map_.set(e,t),e.viewProps.handleDispose(()=>{this.map_.delete(e)}),t}}class Pf{constructor(e){this.target=e.target,this.reader_=e.reader,this.writer_=e.writer}read(){return this.reader_(this.target.read())}write(e){this.writer_(this.target,e)}inject(e){this.write(this.reader_(e))}}function kf(n,e){var t;const s=n.accept(e.target.read(),e.params);if(k(s))return null;const a={target:e.target,initialValue:s.initialValue,params:s.params},i=B(e.params,h=>({disabled:h.optional.boolean,hidden:h.optional.boolean,label:h.optional.string,tag:h.optional.string})),r=n.binding.reader(a),o=n.binding.constraint?n.binding.constraint(a):void 0,c=new Pf({reader:r,target:e.target,writer:n.binding.writer(a)}),l=new vh(G(r(s.initialValue),{constraint:o,equals:n.binding.equals}),c),d=n.controller({constraint:o,document:e.document,initialValue:s.initialValue,params:s.params,value:l,viewProps:ye.create({disabled:i?.disabled,hidden:i?.hidden})});return new Oh(e.document,{blade:nt(),props:_.fromObject({label:"label"in e.params?(t=i?.label)!==null&&t!==void 0?t:null:e.target.key}),tag:i?.tag,value:l,valueController:d})}class Df{constructor(e){this.target=e.target,this.reader_=e.reader}read(){return this.reader_(this.target.read())}}function Uf(n,e){return e===0?new fd:new pd(n,e??St.monitor.defaultInterval)}function Mf(n,e){var t,s,a;const i=n.accept(e.target.read(),e.params);if(k(i))return null;const r={target:e.target,initialValue:i.initialValue,params:i.params},o=B(e.params,u=>({bufferSize:u.optional.number,disabled:u.optional.boolean,hidden:u.optional.boolean,interval:u.optional.number,label:u.optional.string})),c=n.binding.reader(r),l=(s=(t=o?.bufferSize)!==null&&t!==void 0?t:n.binding.defaultBufferSize&&n.binding.defaultBufferSize(i.params))!==null&&s!==void 0?s:1,d=new Uh({binding:new Df({reader:c,target:e.target}),bufferSize:l,ticker:Uf(e.document,o?.interval)}),h=n.controller({document:e.document,params:i.params,value:d,viewProps:ye.create({disabled:o?.disabled,hidden:o?.hidden})});return h.viewProps.bindDisabled(d.ticker),h.viewProps.handleDispose(()=>{d.ticker.dispose()}),new Gh(e.document,{blade:nt(),props:_.fromObject({label:"label"in e.params?(a=o?.label)!==null&&a!==void 0?a:null:e.target.key}),value:d,valueController:h})}class Gf{constructor(e){this.pluginsMap_={blades:[],inputs:[],monitors:[]},this.apiCache_=e}getAll(){return[...this.pluginsMap_.blades,...this.pluginsMap_.inputs,...this.pluginsMap_.monitors]}register(e,t){if(!Cd(t.core))throw z.notCompatible(e,t.id);t.type==="blade"?this.pluginsMap_.blades.unshift(t):t.type==="input"?this.pluginsMap_.inputs.unshift(t):t.type==="monitor"&&this.pluginsMap_.monitors.unshift(t)}createInput_(e,t,s){return this.pluginsMap_.inputs.reduce((a,i)=>a??kf(i,{document:e,target:t,params:s}),null)}createMonitor_(e,t,s){return this.pluginsMap_.monitors.reduce((a,i)=>a??Mf(i,{document:e,params:s,target:t}),null)}createBinding(e,t,s){const a=t.read();if(k(a))throw new z({context:{key:t.key},type:"nomatchingcontroller"});const i=this.createInput_(e,t,s);if(i)return i;const r=this.createMonitor_(e,t,s);if(r)return r;throw new z({context:{key:t.key},type:"nomatchingcontroller"})}createBlade(e,t){const s=this.pluginsMap_.blades.reduce((a,i)=>a??ud(i,{document:e,params:t}),null);if(!s)throw new z({type:"nomatchingview",context:{params:t}});return s}createInputBindingApi_(e){const t=this.pluginsMap_.inputs.reduce((s,a)=>{var i,r;return s||((r=(i=a.api)===null||i===void 0?void 0:i.call(a,{controller:e}))!==null&&r!==void 0?r:null)},null);return this.apiCache_.add(e,t??new ut(e))}createMonitorBindingApi_(e){const t=this.pluginsMap_.monitors.reduce((s,a)=>{var i,r;return s||((r=(i=a.api)===null||i===void 0?void 0:i.call(a,{controller:e}))!==null&&r!==void 0?r:null)},null);return this.apiCache_.add(e,t??new ut(e))}createBindingApi(e){if(this.apiCache_.has(e))return this.apiCache_.get(e);if(Nh(e))return this.createInputBindingApi_(e);if(Bh(e))return this.createMonitorBindingApi_(e);throw z.shouldNeverHappen()}createApi(e){if(this.apiCache_.has(e))return this.apiCache_.get(e);if(Lh(e))return this.createBindingApi(e);const t=this.pluginsMap_.blades.reduce((s,a)=>s??a.api({controller:e,pool:this}),null);if(!t)throw z.shouldNeverHappen();return this.apiCache_.add(e,t)}}const Bf=new Nf;function Ff(){const n=new Gf(Bf);return[uf,vf,yf,Ef,tf,Xu,Ku,Wu,Od,Sf,Of,Lf,Wh,sd,Hi].forEach(e=>{n.register("core",e)}),n}class zf extends Be{constructor(e){super(e),this.emitter_=new V,this.controller.value.emitter.on("change",t=>{this.emitter_.emit("change",new gt(this,t.rawValue))})}get label(){return this.controller.labelController.props.get("label")}set label(e){this.controller.labelController.props.set("label",e)}get options(){return this.controller.valueController.props.get("options")}set options(e){this.controller.valueController.props.set("options",e)}get value(){return this.controller.value.rawValue}set value(e){this.controller.value.rawValue=e}on(e,t){const s=t.bind(this);return this.emitter_.on(e,a=>{s(a)},{key:t}),this}off(e,t){return this.emitter_.off(e,t),this}}class Vf extends Be{}class Hf extends Be{constructor(e){super(e),this.emitter_=new V,this.controller.value.emitter.on("change",t=>{this.emitter_.emit("change",new gt(this,t.rawValue))})}get label(){return this.controller.labelController.props.get("label")}set label(e){this.controller.labelController.props.set("label",e)}get max(){return this.controller.valueController.sliderController.props.get("max")}set max(e){this.controller.valueController.sliderController.props.set("max",e)}get min(){return this.controller.valueController.sliderController.props.get("min")}set min(e){this.controller.valueController.sliderController.props.set("min",e)}get value(){return this.controller.value.rawValue}set value(e){this.controller.value.rawValue=e}on(e,t){const s=t.bind(this);return this.emitter_.on(e,a=>{s(a)},{key:t}),this}off(e,t){return this.emitter_.off(e,t),this}}class Wf extends Be{constructor(e){super(e),this.emitter_=new V,this.controller.value.emitter.on("change",t=>{this.emitter_.emit("change",new gt(this,t.rawValue))})}get label(){return this.controller.labelController.props.get("label")}set label(e){this.controller.labelController.props.set("label",e)}get formatter(){return this.controller.valueController.props.get("formatter")}set formatter(e){this.controller.valueController.props.set("formatter",e)}get value(){return this.controller.value.rawValue}set value(e){this.controller.value.rawValue=e}on(e,t){const s=t.bind(this);return this.emitter_.on(e,a=>{s(a)},{key:t}),this}off(e,t){return this.emitter_.off(e,t),this}}const qf=(function(){return{id:"list",type:"blade",core:tt,accept(n){const e=B(n,t=>({options:t.required.custom(_t),value:t.required.raw,view:t.required.constant("list"),label:t.optional.string}));return e?{params:e}:null},controller(n){const e=new yt(ls(n.params.options)),t=G(n.params.value,{constraint:e}),s=new Re(n.document,{props:new _({options:e.values.value("options")}),value:t,viewProps:n.viewProps});return new Me(n.document,{blade:n.blade,props:_.fromObject({label:n.params.label}),value:t,valueController:s})},api(n){return!(n.controller instanceof Me)||!(n.controller.valueController instanceof Re)?null:new zf(n.controller)}}})();class jf extends zi{constructor(e,t){super(e,t)}get element(){return this.controller.view.element}}class Yf extends Gn{constructor(e,t){super(e,{expanded:t.expanded,blade:t.blade,props:t.props,root:!0,viewProps:t.viewProps})}}const _a=C("spr");class $f{constructor(e,t){this.element=e.createElement("div"),this.element.classList.add(_a()),t.viewProps.bindClassModifiers(this.element);const s=e.createElement("hr");s.classList.add(_a("r")),this.element.appendChild(s)}}class Ea extends en{constructor(e,t){super(Object.assign(Object.assign({},t),{view:new $f(e,{viewProps:t.viewProps})}))}}const Kf={id:"separator",type:"blade",core:tt,accept(n){const e=B(n,t=>({view:t.required.constant("separator")}));return e?{params:e}:null},controller(n){return new Ea(n.document,{blade:n.blade,viewProps:n.viewProps})},api(n){return n.controller instanceof Ea?new Vf(n.controller):null}},Xf={id:"slider",type:"blade",core:tt,accept(n){const e=B(n,t=>({max:t.required.number,min:t.required.number,view:t.required.constant("slider"),format:t.optional.function,label:t.optional.string,value:t.optional.number}));return e?{params:e}:null},controller(n){var e,t;const s=(e=n.params.value)!==null&&e!==void 0?e:0,a=new vt({max:n.params.max,min:n.params.min}),i=G(s,{constraint:a}),r=new Kt(n.document,Object.assign(Object.assign({},$i({formatter:(t=n.params.format)!==null&&t!==void 0?t:dh,keyScale:G(1),max:a.values.value("max"),min:a.values.value("min"),pointerScale:Ci(n.params,s)})),{parser:we,value:i,viewProps:n.viewProps}));return new Me(n.document,{blade:n.blade,props:_.fromObject({label:n.params.label}),value:i,valueController:r})},api(n){return!(n.controller instanceof Me)||!(n.controller.valueController instanceof Kt)?null:new Hf(n.controller)}},Qf=(function(){return{id:"text",type:"blade",core:tt,accept(n){const e=B(n,t=>({parse:t.required.function,value:t.required.raw,view:t.required.constant("text"),format:t.optional.function,label:t.optional.string}));return e?{params:e}:null},controller(n){var e;const t=G(n.params.value),s=new ft(n.document,{parser:n.params.parse,props:_.fromObject({formatter:(e=n.params.format)!==null&&e!==void 0?e:(a=>String(a))}),value:t,viewProps:n.viewProps});return new Me(n.document,{blade:n.blade,props:_.fromObject({label:n.params.label}),value:t,valueController:s})},api(n){return!(n.controller instanceof Me)||!(n.controller.valueController instanceof ft)?null:new Wf(n.controller)}}})();function Zf(n){const e=n.createElement("div");return e.classList.add(C("dfw")()),n.body&&n.body.appendChild(e),e}function Jf(n,e,t){if(n.querySelector(`style[data-tp-style=${e}]`))return;const s=n.createElement("style");s.dataset.tpStyle=e,s.textContent=t,n.head.appendChild(s)}class hm extends jf{constructor(e){var t,s;const a=e??{},i=(t=a.document)!==null&&t!==void 0?t:xh(),r=Ff(),o=new Yf(i,{expanded:a.expanded,blade:nt(),props:_.fromObject({title:a.title}),viewProps:ye.create()});super(o,r),this.pool_=r,this.containerElem_=(s=a.container)!==null&&s!==void 0?s:Zf(i),this.containerElem_.appendChild(this.element),this.doc_=i,this.usesDefaultWrapper_=!a.container,this.setUpDefaultPlugins_()}get document(){if(!this.doc_)throw z.alreadyDisposed();return this.doc_}dispose(){const e=this.containerElem_;if(!e)throw z.alreadyDisposed();if(this.usesDefaultWrapper_){const t=e.parentElement;t&&t.removeChild(e)}this.containerElem_=null,this.doc_=null,super.dispose()}registerPlugin(e){e.css&&Jf(this.document,`plugin-${e.id}`,e.css),("plugin"in e?[e.plugin]:"plugins"in e?e.plugins:[]).forEach(s=>{this.pool_.register(e.id,s)})}setUpDefaultPlugins_(){this.registerPlugin({id:"default",css:'.tp-tbiv_b,.tp-coltxtv_ms,.tp-colswv_b,.tp-ckbv_i,.tp-sglv_i,.tp-mllv_i,.tp-grlv_g,.tp-txtv_i,.tp-p2dpv_p,.tp-colswv_sw,.tp-rotv_b,.tp-fldv_b,.tp-p2dv_b,.tp-btnv_b,.tp-lstv_s{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:rgba(0,0,0,0);border-width:0;font-family:inherit;font-size:inherit;font-weight:inherit;margin:0;outline:none;padding:0}.tp-p2dv_b,.tp-btnv_b,.tp-lstv_s{background-color:var(--btn-bg);border-radius:var(--bld-br);color:var(--btn-fg);cursor:pointer;display:block;font-weight:bold;height:var(--cnt-usz);line-height:var(--cnt-usz);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tp-p2dv_b:hover,.tp-btnv_b:hover,.tp-lstv_s:hover{background-color:var(--btn-bg-h)}.tp-p2dv_b:focus,.tp-btnv_b:focus,.tp-lstv_s:focus{background-color:var(--btn-bg-f)}.tp-p2dv_b:active,.tp-btnv_b:active,.tp-lstv_s:active{background-color:var(--btn-bg-a)}.tp-p2dv_b:disabled,.tp-btnv_b:disabled,.tp-lstv_s:disabled{opacity:.5}.tp-rotv_c>.tp-cntv.tp-v-lst,.tp-tbpv_c>.tp-cntv.tp-v-lst,.tp-fldv_c>.tp-cntv.tp-v-lst{margin-bottom:calc(-1*var(--cnt-vp))}.tp-rotv_c>.tp-fldv.tp-v-lst .tp-fldv_c,.tp-tbpv_c>.tp-fldv.tp-v-lst .tp-fldv_c,.tp-fldv_c>.tp-fldv.tp-v-lst .tp-fldv_c{border-bottom-left-radius:0}.tp-rotv_c>.tp-fldv.tp-v-lst .tp-fldv_b,.tp-tbpv_c>.tp-fldv.tp-v-lst .tp-fldv_b,.tp-fldv_c>.tp-fldv.tp-v-lst .tp-fldv_b{border-bottom-left-radius:0}.tp-rotv_c>*:not(.tp-v-fst),.tp-tbpv_c>*:not(.tp-v-fst),.tp-fldv_c>*:not(.tp-v-fst){margin-top:var(--cnt-usp)}.tp-rotv_c>.tp-sprv:not(.tp-v-fst),.tp-tbpv_c>.tp-sprv:not(.tp-v-fst),.tp-fldv_c>.tp-sprv:not(.tp-v-fst),.tp-rotv_c>.tp-cntv:not(.tp-v-fst),.tp-tbpv_c>.tp-cntv:not(.tp-v-fst),.tp-fldv_c>.tp-cntv:not(.tp-v-fst){margin-top:var(--cnt-vp)}.tp-rotv_c>.tp-sprv+*:not(.tp-v-hidden),.tp-tbpv_c>.tp-sprv+*:not(.tp-v-hidden),.tp-fldv_c>.tp-sprv+*:not(.tp-v-hidden),.tp-rotv_c>.tp-cntv+*:not(.tp-v-hidden),.tp-tbpv_c>.tp-cntv+*:not(.tp-v-hidden),.tp-fldv_c>.tp-cntv+*:not(.tp-v-hidden){margin-top:var(--cnt-vp)}.tp-rotv_c>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,.tp-tbpv_c>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,.tp-fldv_c>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,.tp-rotv_c>.tp-cntv:not(.tp-v-hidden)+.tp-cntv,.tp-tbpv_c>.tp-cntv:not(.tp-v-hidden)+.tp-cntv,.tp-fldv_c>.tp-cntv:not(.tp-v-hidden)+.tp-cntv{margin-top:0}.tp-tbpv_c>.tp-cntv,.tp-fldv_c>.tp-cntv{margin-left:4px}.tp-tbpv_c>.tp-fldv>.tp-fldv_b,.tp-fldv_c>.tp-fldv>.tp-fldv_b{border-top-left-radius:var(--bld-br);border-bottom-left-radius:var(--bld-br)}.tp-tbpv_c>.tp-fldv.tp-fldv-expanded>.tp-fldv_b,.tp-fldv_c>.tp-fldv.tp-fldv-expanded>.tp-fldv_b{border-bottom-left-radius:0}.tp-tbpv_c .tp-fldv>.tp-fldv_c,.tp-fldv_c .tp-fldv>.tp-fldv_c{border-bottom-left-radius:var(--bld-br)}.tp-tbpv_c>.tp-cntv+.tp-fldv>.tp-fldv_b,.tp-fldv_c>.tp-cntv+.tp-fldv>.tp-fldv_b{border-top-left-radius:0}.tp-tbpv_c>.tp-cntv+.tp-tabv>.tp-tabv_t,.tp-fldv_c>.tp-cntv+.tp-tabv>.tp-tabv_t{border-top-left-radius:0}.tp-tbpv_c>.tp-tabv>.tp-tabv_t,.tp-fldv_c>.tp-tabv>.tp-tabv_t{border-top-left-radius:var(--bld-br)}.tp-tbpv_c .tp-tabv>.tp-tabv_c,.tp-fldv_c .tp-tabv>.tp-tabv_c{border-bottom-left-radius:var(--bld-br)}.tp-rotv_b,.tp-fldv_b{background-color:var(--cnt-bg);color:var(--cnt-fg);cursor:pointer;display:block;height:calc(var(--cnt-usz) + 4px);line-height:calc(var(--cnt-usz) + 4px);overflow:hidden;padding-left:var(--cnt-hp);padding-right:calc(4px + var(--cnt-usz) + var(--cnt-hp));position:relative;text-align:left;text-overflow:ellipsis;white-space:nowrap;width:100%;transition:border-radius .2s ease-in-out .2s}.tp-rotv_b:hover,.tp-fldv_b:hover{background-color:var(--cnt-bg-h)}.tp-rotv_b:focus,.tp-fldv_b:focus{background-color:var(--cnt-bg-f)}.tp-rotv_b:active,.tp-fldv_b:active{background-color:var(--cnt-bg-a)}.tp-rotv_b:disabled,.tp-fldv_b:disabled{opacity:.5}.tp-rotv_m,.tp-fldv_m{background:linear-gradient(to left, var(--cnt-fg), var(--cnt-fg) 2px, transparent 2px, transparent 4px, var(--cnt-fg) 4px);border-radius:2px;bottom:0;content:"";display:block;height:6px;right:calc(var(--cnt-hp) + (var(--cnt-usz) + 4px - 6px)/2 - 2px);margin:auto;opacity:.5;position:absolute;top:0;transform:rotate(90deg);transition:transform .2s ease-in-out;width:6px}.tp-rotv.tp-rotv-expanded .tp-rotv_m,.tp-fldv.tp-fldv-expanded>.tp-fldv_b>.tp-fldv_m{transform:none}.tp-rotv_c,.tp-fldv_c{box-sizing:border-box;height:0;opacity:0;overflow:hidden;padding-bottom:0;padding-top:0;position:relative;transition:height .2s ease-in-out,opacity .2s linear,padding .2s ease-in-out}.tp-rotv.tp-rotv-cpl:not(.tp-rotv-expanded) .tp-rotv_c,.tp-fldv.tp-fldv-cpl:not(.tp-fldv-expanded)>.tp-fldv_c{display:none}.tp-rotv.tp-rotv-expanded .tp-rotv_c,.tp-fldv.tp-fldv-expanded>.tp-fldv_c{opacity:1;padding-bottom:var(--cnt-vp);padding-top:var(--cnt-vp);transform:none;overflow:visible;transition:height .2s ease-in-out,opacity .2s linear .2s,padding .2s ease-in-out}.tp-txtv_i,.tp-p2dpv_p,.tp-colswv_sw{background-color:var(--in-bg);border-radius:var(--bld-br);box-sizing:border-box;color:var(--in-fg);font-family:inherit;height:var(--cnt-usz);line-height:var(--cnt-usz);min-width:0;width:100%}.tp-txtv_i:hover,.tp-p2dpv_p:hover,.tp-colswv_sw:hover{background-color:var(--in-bg-h)}.tp-txtv_i:focus,.tp-p2dpv_p:focus,.tp-colswv_sw:focus{background-color:var(--in-bg-f)}.tp-txtv_i:active,.tp-p2dpv_p:active,.tp-colswv_sw:active{background-color:var(--in-bg-a)}.tp-txtv_i:disabled,.tp-p2dpv_p:disabled,.tp-colswv_sw:disabled{opacity:.5}.tp-lstv,.tp-coltxtv_m{position:relative}.tp-lstv_s{padding:0 20px 0 4px;width:100%}.tp-lstv_m,.tp-coltxtv_mm{bottom:0;margin:auto;pointer-events:none;position:absolute;right:2px;top:0}.tp-lstv_m svg,.tp-coltxtv_mm svg{bottom:0;height:16px;margin:auto;position:absolute;right:0;top:0;width:16px}.tp-lstv_m svg path,.tp-coltxtv_mm svg path{fill:currentColor}.tp-sglv_i,.tp-mllv_i,.tp-grlv_g{background-color:var(--mo-bg);border-radius:var(--bld-br);box-sizing:border-box;color:var(--mo-fg);height:var(--cnt-usz);scrollbar-color:currentColor rgba(0,0,0,0);scrollbar-width:thin;width:100%}.tp-sglv_i::-webkit-scrollbar,.tp-mllv_i::-webkit-scrollbar,.tp-grlv_g::-webkit-scrollbar{height:8px;width:8px}.tp-sglv_i::-webkit-scrollbar-corner,.tp-mllv_i::-webkit-scrollbar-corner,.tp-grlv_g::-webkit-scrollbar-corner{background-color:rgba(0,0,0,0)}.tp-sglv_i::-webkit-scrollbar-thumb,.tp-mllv_i::-webkit-scrollbar-thumb,.tp-grlv_g::-webkit-scrollbar-thumb{background-clip:padding-box;background-color:currentColor;border:rgba(0,0,0,0) solid 2px;border-radius:4px}.tp-pndtxtv,.tp-coltxtv_w{display:flex}.tp-pndtxtv_a,.tp-coltxtv_c{width:100%}.tp-pndtxtv_a+.tp-pndtxtv_a,.tp-coltxtv_c+.tp-pndtxtv_a,.tp-pndtxtv_a+.tp-coltxtv_c,.tp-coltxtv_c+.tp-coltxtv_c{margin-left:2px}.tp-rotv{--bs-bg: var(--tp-base-background-color, hsl(230, 7%, 17%));--bs-br: var(--tp-base-border-radius, 6px);--bs-ff: var(--tp-base-font-family, Roboto Mono, Source Code Pro, Menlo, Courier, monospace);--bs-sh: var(--tp-base-shadow-color, rgba(0, 0, 0, 0.2));--bld-br: var(--tp-blade-border-radius, 2px);--bld-hp: var(--tp-blade-horizontal-padding, 4px);--bld-vw: var(--tp-blade-value-width, 160px);--btn-bg: var(--tp-button-background-color, hsl(230, 7%, 70%));--btn-bg-a: var(--tp-button-background-color-active, #d6d7db);--btn-bg-f: var(--tp-button-background-color-focus, #c8cad0);--btn-bg-h: var(--tp-button-background-color-hover, #bbbcc4);--btn-fg: var(--tp-button-foreground-color, hsl(230, 7%, 17%));--cnt-bg: var(--tp-container-background-color, rgba(187, 188, 196, 0.1));--cnt-bg-a: var(--tp-container-background-color-active, rgba(187, 188, 196, 0.25));--cnt-bg-f: var(--tp-container-background-color-focus, rgba(187, 188, 196, 0.2));--cnt-bg-h: var(--tp-container-background-color-hover, rgba(187, 188, 196, 0.15));--cnt-fg: var(--tp-container-foreground-color, hsl(230, 7%, 75%));--cnt-hp: var(--tp-container-horizontal-padding, 4px);--cnt-vp: var(--tp-container-vertical-padding, 4px);--cnt-usp: var(--tp-container-unit-spacing, 4px);--cnt-usz: var(--tp-container-unit-size, 20px);--in-bg: var(--tp-input-background-color, rgba(187, 188, 196, 0.1));--in-bg-a: var(--tp-input-background-color-active, rgba(187, 188, 196, 0.25));--in-bg-f: var(--tp-input-background-color-focus, rgba(187, 188, 196, 0.2));--in-bg-h: var(--tp-input-background-color-hover, rgba(187, 188, 196, 0.15));--in-fg: var(--tp-input-foreground-color, hsl(230, 7%, 75%));--lbl-fg: var(--tp-label-foreground-color, rgba(187, 188, 196, 0.7));--mo-bg: var(--tp-monitor-background-color, rgba(0, 0, 0, 0.2));--mo-fg: var(--tp-monitor-foreground-color, rgba(187, 188, 196, 0.7));--grv-fg: var(--tp-groove-foreground-color, rgba(187, 188, 196, 0.1))}.tp-btnv_b{width:100%}.tp-btnv_t{text-align:center}.tp-ckbv_l{display:block;position:relative}.tp-ckbv_i{left:0;opacity:0;position:absolute;top:0}.tp-ckbv_w{background-color:var(--in-bg);border-radius:var(--bld-br);cursor:pointer;display:block;height:var(--cnt-usz);position:relative;width:var(--cnt-usz)}.tp-ckbv_w svg{display:block;height:16px;inset:0;margin:auto;opacity:0;position:absolute;width:16px}.tp-ckbv_w svg path{fill:none;stroke:var(--in-fg);stroke-width:2}.tp-ckbv_i:hover+.tp-ckbv_w{background-color:var(--in-bg-h)}.tp-ckbv_i:focus+.tp-ckbv_w{background-color:var(--in-bg-f)}.tp-ckbv_i:active+.tp-ckbv_w{background-color:var(--in-bg-a)}.tp-ckbv_i:checked+.tp-ckbv_w svg{opacity:1}.tp-ckbv.tp-v-disabled .tp-ckbv_w{opacity:.5}.tp-colv{position:relative}.tp-colv_h{display:flex}.tp-colv_s{flex-grow:0;flex-shrink:0;width:var(--cnt-usz)}.tp-colv_t{flex:1;margin-left:4px}.tp-colv_p{height:0;margin-top:0;opacity:0;overflow:hidden;transition:height .2s ease-in-out,opacity .2s linear,margin .2s ease-in-out}.tp-colv.tp-colv-expanded.tp-colv-cpl .tp-colv_p{overflow:visible}.tp-colv.tp-colv-expanded .tp-colv_p{margin-top:var(--cnt-usp);opacity:1}.tp-colv .tp-popv{left:calc(-1*var(--cnt-hp));right:calc(-1*var(--cnt-hp));top:var(--cnt-usz)}.tp-colpv_h,.tp-colpv_ap{margin-left:6px;margin-right:6px}.tp-colpv_h{margin-top:var(--cnt-usp)}.tp-colpv_rgb{display:flex;margin-top:var(--cnt-usp);width:100%}.tp-colpv_a{display:flex;margin-top:var(--cnt-vp);padding-top:calc(var(--cnt-vp) + 2px);position:relative}.tp-colpv_a::before{background-color:var(--grv-fg);content:"";height:2px;left:calc(-1*var(--cnt-hp));position:absolute;right:calc(-1*var(--cnt-hp));top:0}.tp-colpv.tp-v-disabled .tp-colpv_a::before{opacity:.5}.tp-colpv_ap{align-items:center;display:flex;flex:3}.tp-colpv_at{flex:1;margin-left:4px}.tp-svpv{border-radius:var(--bld-br);outline:none;overflow:hidden;position:relative}.tp-svpv.tp-v-disabled{opacity:.5}.tp-svpv_c{cursor:crosshair;display:block;height:calc(var(--cnt-usz)*4);width:100%}.tp-svpv_m{border-radius:100%;border:rgba(255,255,255,.75) solid 2px;box-sizing:border-box;filter:drop-shadow(0 0 1px rgba(0, 0, 0, 0.3));height:12px;margin-left:-6px;margin-top:-6px;pointer-events:none;position:absolute;width:12px}.tp-svpv:focus .tp-svpv_m{border-color:#fff}.tp-hplv{cursor:pointer;height:var(--cnt-usz);outline:none;position:relative}.tp-hplv.tp-v-disabled{opacity:.5}.tp-hplv_c{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAABCAYAAABubagXAAAAQ0lEQVQoU2P8z8Dwn0GCgQEDi2OK/RBgYHjBgIpfovFh8j8YBIgzFGQxuqEgPhaDOT5gOhPkdCxOZeBg+IDFZZiGAgCaSSMYtcRHLgAAAABJRU5ErkJggg==);background-position:left top;background-repeat:no-repeat;background-size:100% 100%;border-radius:2px;display:block;height:4px;left:0;margin-top:-2px;position:absolute;top:50%;width:100%}.tp-hplv_m{border-radius:var(--bld-br);border:rgba(255,255,255,.75) solid 2px;box-shadow:0 0 2px rgba(0,0,0,.1);box-sizing:border-box;height:12px;left:50%;margin-left:-6px;margin-top:-6px;position:absolute;top:50%;width:12px}.tp-hplv:focus .tp-hplv_m{border-color:#fff}.tp-aplv{cursor:pointer;height:var(--cnt-usz);outline:none;position:relative;width:100%}.tp-aplv.tp-v-disabled{opacity:.5}.tp-aplv_b{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:4px 4px;background-position:0 0,2px 2px;border-radius:2px;display:block;height:4px;left:0;margin-top:-2px;overflow:hidden;position:absolute;top:50%;width:100%}.tp-aplv_c{inset:0;position:absolute}.tp-aplv_m{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:12px 12px;background-position:0 0,6px 6px;border-radius:var(--bld-br);box-shadow:0 0 2px rgba(0,0,0,.1);height:12px;left:50%;margin-left:-6px;margin-top:-6px;overflow:hidden;position:absolute;top:50%;width:12px}.tp-aplv_p{border-radius:var(--bld-br);border:rgba(255,255,255,.75) solid 2px;box-sizing:border-box;inset:0;position:absolute}.tp-aplv:focus .tp-aplv_p{border-color:#fff}.tp-colswv{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:10px 10px;background-position:0 0,5px 5px;border-radius:var(--bld-br);overflow:hidden}.tp-colswv.tp-v-disabled{opacity:.5}.tp-colswv_sw{border-radius:0}.tp-colswv_b{cursor:pointer;display:block;height:var(--cnt-usz);left:0;position:absolute;top:0;width:var(--cnt-usz)}.tp-colswv_b:focus::after{border:rgba(255,255,255,.75) solid 2px;border-radius:var(--bld-br);content:"";display:block;inset:0;position:absolute}.tp-coltxtv{display:flex;width:100%}.tp-coltxtv_m{margin-right:4px}.tp-coltxtv_ms{border-radius:var(--bld-br);color:var(--lbl-fg);cursor:pointer;height:var(--cnt-usz);line-height:var(--cnt-usz);padding:0 18px 0 4px}.tp-coltxtv_ms:hover{background-color:var(--in-bg-h)}.tp-coltxtv_ms:focus{background-color:var(--in-bg-f)}.tp-coltxtv_ms:active{background-color:var(--in-bg-a)}.tp-coltxtv_mm{color:var(--lbl-fg)}.tp-coltxtv.tp-v-disabled .tp-coltxtv_mm{opacity:.5}.tp-coltxtv_w{flex:1}.tp-dfwv{position:absolute;top:8px;right:8px;width:256px}.tp-fldv{position:relative}.tp-fldv_t{padding-left:4px}.tp-fldv_b:disabled .tp-fldv_m{display:none}.tp-fldv_c{padding-left:4px}.tp-fldv_i{bottom:0;color:var(--cnt-bg);left:0;overflow:hidden;position:absolute;top:calc(var(--cnt-usz) + 4px);width:max(var(--bs-br),4px)}.tp-fldv_i::before{background-color:currentColor;bottom:0;content:"";left:0;position:absolute;top:0;width:4px}.tp-fldv_b:hover+.tp-fldv_i{color:var(--cnt-bg-h)}.tp-fldv_b:focus+.tp-fldv_i{color:var(--cnt-bg-f)}.tp-fldv_b:active+.tp-fldv_i{color:var(--cnt-bg-a)}.tp-fldv.tp-v-disabled>.tp-fldv_i{opacity:.5}.tp-grlv{position:relative}.tp-grlv_g{display:block;height:calc(var(--cnt-usz)*3)}.tp-grlv_g polyline{fill:none;stroke:var(--mo-fg);stroke-linejoin:round}.tp-grlv_t{margin-top:-4px;transition:left .05s,top .05s;visibility:hidden}.tp-grlv_t.tp-grlv_t-a{visibility:visible}.tp-grlv_t.tp-grlv_t-in{transition:none}.tp-grlv.tp-v-disabled .tp-grlv_g{opacity:.5}.tp-grlv .tp-ttv{background-color:var(--mo-fg)}.tp-grlv .tp-ttv::before{border-top-color:var(--mo-fg)}.tp-lblv{align-items:center;display:flex;line-height:1.3;padding-left:var(--cnt-hp);padding-right:var(--cnt-hp)}.tp-lblv.tp-lblv-nol{display:block}.tp-lblv_l{color:var(--lbl-fg);flex:1;-webkit-hyphens:auto;hyphens:auto;overflow:hidden;padding-left:4px;padding-right:16px}.tp-lblv.tp-v-disabled .tp-lblv_l{opacity:.5}.tp-lblv.tp-lblv-nol .tp-lblv_l{display:none}.tp-lblv_v{align-self:flex-start;flex-grow:0;flex-shrink:0;width:var(--bld-vw)}.tp-lblv.tp-lblv-nol .tp-lblv_v{width:100%}.tp-lstv_s{padding:0 20px 0 var(--bld-hp);width:100%}.tp-lstv_m{color:var(--btn-fg)}.tp-sglv_i{padding-left:var(--bld-hp);padding-right:var(--bld-hp)}.tp-sglv.tp-v-disabled .tp-sglv_i{opacity:.5}.tp-mllv_i{display:block;height:calc(var(--cnt-usz)*3);line-height:var(--cnt-usz);padding-left:var(--bld-hp);padding-right:var(--bld-hp);resize:none;white-space:pre}.tp-mllv.tp-v-disabled .tp-mllv_i{opacity:.5}.tp-p2dv{position:relative}.tp-p2dv_h{display:flex}.tp-p2dv_b{height:var(--cnt-usz);margin-right:4px;position:relative;width:var(--cnt-usz)}.tp-p2dv_b svg{display:block;height:16px;left:50%;margin-left:-8px;margin-top:-8px;position:absolute;top:50%;width:16px}.tp-p2dv_b svg path{stroke:currentColor;stroke-width:2}.tp-p2dv_b svg circle{fill:currentColor}.tp-p2dv_t{flex:1}.tp-p2dv_p{height:0;margin-top:0;opacity:0;overflow:hidden;transition:height .2s ease-in-out,opacity .2s linear,margin .2s ease-in-out}.tp-p2dv.tp-p2dv-expanded .tp-p2dv_p{margin-top:var(--cnt-usp);opacity:1}.tp-p2dv .tp-popv{left:calc(-1*var(--cnt-hp));right:calc(-1*var(--cnt-hp));top:var(--cnt-usz)}.tp-p2dpv{padding-left:calc(var(--cnt-usz) + 4px)}.tp-p2dpv_p{cursor:crosshair;height:0;overflow:hidden;padding-bottom:100%;position:relative}.tp-p2dpv.tp-v-disabled .tp-p2dpv_p{opacity:.5}.tp-p2dpv_g{display:block;height:100%;left:0;pointer-events:none;position:absolute;top:0;width:100%}.tp-p2dpv_ax{opacity:.1;stroke:var(--in-fg);stroke-dasharray:1}.tp-p2dpv_l{opacity:.5;stroke:var(--in-fg);stroke-dasharray:1}.tp-p2dpv_m{border:var(--in-fg) solid 1px;border-radius:50%;box-sizing:border-box;height:4px;margin-left:-2px;margin-top:-2px;position:absolute;width:4px}.tp-p2dpv_p:focus .tp-p2dpv_m{background-color:var(--in-fg);border-width:0}.tp-popv{background-color:var(--bs-bg);border-radius:var(--bs-br);box-shadow:0 2px 4px var(--bs-sh);display:none;max-width:var(--bld-vw);padding:var(--cnt-vp) var(--cnt-hp);position:absolute;visibility:hidden;z-index:1000}.tp-popv.tp-popv-v{display:block;visibility:visible}.tp-sldv.tp-v-disabled{opacity:.5}.tp-sldv_t{box-sizing:border-box;cursor:pointer;height:var(--cnt-usz);margin:0 6px;outline:none;position:relative}.tp-sldv_t::before{background-color:var(--in-bg);border-radius:1px;content:"";display:block;height:2px;inset:0;margin:auto;position:absolute}.tp-sldv_k{height:100%;left:0;position:absolute;top:0}.tp-sldv_k::before{background-color:var(--in-fg);border-radius:1px;content:"";display:block;height:2px;inset:0;margin-bottom:auto;margin-top:auto;position:absolute}.tp-sldv_k::after{background-color:var(--btn-bg);border-radius:var(--bld-br);bottom:0;content:"";display:block;height:12px;margin-bottom:auto;margin-top:auto;position:absolute;right:-6px;top:0;width:12px}.tp-sldv_t:hover .tp-sldv_k::after{background-color:var(--btn-bg-h)}.tp-sldv_t:focus .tp-sldv_k::after{background-color:var(--btn-bg-f)}.tp-sldv_t:active .tp-sldv_k::after{background-color:var(--btn-bg-a)}.tp-sldtxtv{display:flex}.tp-sldtxtv_s{flex:2}.tp-sldtxtv_t{flex:1;margin-left:4px}.tp-tabv{position:relative}.tp-tabv_t{align-items:flex-end;color:var(--cnt-bg);display:flex;overflow:hidden;position:relative}.tp-tabv_t:hover{color:var(--cnt-bg-h)}.tp-tabv_t:has(*:focus){color:var(--cnt-bg-f)}.tp-tabv_t:has(*:active){color:var(--cnt-bg-a)}.tp-tabv_t::before{background-color:currentColor;bottom:0;content:"";height:2px;left:0;pointer-events:none;position:absolute;right:0}.tp-tabv.tp-v-disabled .tp-tabv_t::before{opacity:.5}.tp-tabv.tp-tabv-nop .tp-tabv_t{height:calc(var(--cnt-usz) + 4px);position:relative}.tp-tabv.tp-tabv-nop .tp-tabv_t::before{background-color:var(--cnt-bg);bottom:0;content:"";height:2px;left:0;position:absolute;right:0}.tp-tabv_i{bottom:0;color:var(--cnt-bg);left:0;overflow:hidden;position:absolute;top:calc(var(--cnt-usz) + 4px);width:max(var(--bs-br),4px)}.tp-tabv_i::before{background-color:currentColor;bottom:0;content:"";left:0;position:absolute;top:0;width:4px}.tp-tabv_t:hover+.tp-tabv_i{color:var(--cnt-bg-h)}.tp-tabv_t:has(*:focus)+.tp-tabv_i{color:var(--cnt-bg-f)}.tp-tabv_t:has(*:active)+.tp-tabv_i{color:var(--cnt-bg-a)}.tp-tabv.tp-v-disabled>.tp-tabv_i{opacity:.5}.tp-tbiv{flex:1;min-width:0;position:relative}.tp-tbiv+.tp-tbiv{margin-left:2px}.tp-tbiv+.tp-tbiv.tp-v-disabled::before{opacity:.5}.tp-tbiv_b{display:block;padding-left:calc(var(--cnt-hp) + 4px);padding-right:calc(var(--cnt-hp) + 4px);position:relative;width:100%}.tp-tbiv_b:disabled{opacity:.5}.tp-tbiv_b::before{background-color:var(--cnt-bg);content:"";inset:0 0 2px;pointer-events:none;position:absolute}.tp-tbiv_b:hover::before{background-color:var(--cnt-bg-h)}.tp-tbiv_b:focus::before{background-color:var(--cnt-bg-f)}.tp-tbiv_b:active::before{background-color:var(--cnt-bg-a)}.tp-tbiv_t{color:var(--cnt-fg);height:calc(var(--cnt-usz) + 4px);line-height:calc(var(--cnt-usz) + 4px);opacity:.5;overflow:hidden;position:relative;text-overflow:ellipsis}.tp-tbiv.tp-tbiv-sel .tp-tbiv_t{opacity:1}.tp-tbpv_c{padding-bottom:var(--cnt-vp);padding-left:4px;padding-top:var(--cnt-vp)}.tp-txtv{position:relative}.tp-txtv_i{padding-left:var(--bld-hp);padding-right:var(--bld-hp)}.tp-txtv.tp-txtv-fst .tp-txtv_i{border-bottom-right-radius:0;border-top-right-radius:0}.tp-txtv.tp-txtv-mid .tp-txtv_i{border-radius:0}.tp-txtv.tp-txtv-lst .tp-txtv_i{border-bottom-left-radius:0;border-top-left-radius:0}.tp-txtv.tp-txtv-num .tp-txtv_i{text-align:right}.tp-txtv.tp-txtv-drg .tp-txtv_i{opacity:.3}.tp-txtv_k{cursor:pointer;height:100%;left:calc(var(--bld-hp) - 5px);position:absolute;top:0;width:12px}.tp-txtv_k::before{background-color:var(--in-fg);border-radius:1px;bottom:0;content:"";height:calc(var(--cnt-usz) - 4px);left:50%;margin-bottom:auto;margin-left:-1px;margin-top:auto;opacity:.1;position:absolute;top:0;transition:border-radius .1s,height .1s,transform .1s,width .1s;width:2px}.tp-txtv_k:hover::before,.tp-txtv.tp-txtv-drg .tp-txtv_k::before{opacity:1}.tp-txtv.tp-txtv-drg .tp-txtv_k::before{border-radius:50%;height:4px;transform:translateX(-1px);width:4px}.tp-txtv_g{bottom:0;display:block;height:8px;left:50%;margin:auto;overflow:visible;pointer-events:none;position:absolute;top:0;visibility:hidden;width:100%}.tp-txtv.tp-txtv-drg .tp-txtv_g{visibility:visible}.tp-txtv_gb{fill:none;stroke:var(--in-fg);stroke-dasharray:1}.tp-txtv_gh{fill:none;stroke:var(--in-fg)}.tp-txtv .tp-ttv{margin-left:6px;visibility:hidden}.tp-txtv.tp-txtv-drg .tp-ttv{visibility:visible}.tp-ttv{background-color:var(--in-fg);border-radius:var(--bld-br);color:var(--bs-bg);padding:2px 4px;pointer-events:none;position:absolute;transform:translate(-50%, -100%)}.tp-ttv::before{border-color:var(--in-fg) rgba(0,0,0,0) rgba(0,0,0,0) rgba(0,0,0,0);border-style:solid;border-width:2px;box-sizing:border-box;content:"";font-size:.9em;height:4px;left:50%;margin-left:-2px;position:absolute;top:100%;width:4px}.tp-rotv{background-color:var(--bs-bg);border-radius:var(--bs-br);box-shadow:0 2px 4px var(--bs-sh);font-family:var(--bs-ff);font-size:11px;font-weight:500;line-height:1;text-align:left}.tp-rotv_b{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br);border-top-left-radius:var(--bs-br);border-top-right-radius:var(--bs-br);padding-left:calc(4px + var(--cnt-usz) + var(--cnt-hp));text-align:center}.tp-rotv.tp-rotv-expanded .tp-rotv_b{border-bottom-left-radius:0;border-bottom-right-radius:0;transition-delay:0s;transition-duration:0s}.tp-rotv.tp-rotv-not>.tp-rotv_b{display:none}.tp-rotv_b:disabled .tp-rotv_m{display:none}.tp-rotv_c>.tp-fldv.tp-v-lst>.tp-fldv_c{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br)}.tp-rotv_c>.tp-fldv.tp-v-lst>.tp-fldv_i{border-bottom-left-radius:var(--bs-br)}.tp-rotv_c>.tp-fldv.tp-v-lst:not(.tp-fldv-expanded)>.tp-fldv_b{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br)}.tp-rotv_c>.tp-fldv.tp-v-lst.tp-fldv-expanded>.tp-fldv_b{transition-delay:0s;transition-duration:0s}.tp-rotv_c .tp-fldv.tp-v-vlst:not(.tp-fldv-expanded)>.tp-fldv_b{border-bottom-right-radius:var(--bs-br)}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-fldv.tp-v-fst{margin-top:calc(-1*var(--cnt-vp))}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-fldv.tp-v-fst>.tp-fldv_b{border-top-left-radius:var(--bs-br);border-top-right-radius:var(--bs-br)}.tp-rotv_c>.tp-tabv.tp-v-lst>.tp-tabv_c{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br)}.tp-rotv_c>.tp-tabv.tp-v-lst>.tp-tabv_i{border-bottom-left-radius:var(--bs-br)}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-tabv.tp-v-fst{margin-top:calc(-1*var(--cnt-vp))}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-tabv.tp-v-fst>.tp-tabv_t{border-top-left-radius:var(--bs-br);border-top-right-radius:var(--bs-br)}.tp-rotv.tp-v-disabled,.tp-rotv .tp-v-disabled{pointer-events:none}.tp-rotv.tp-v-hidden,.tp-rotv .tp-v-hidden{display:none}.tp-sprv_r{background-color:var(--grv-fg);border-width:0;display:block;height:2px;margin:0;width:100%}.tp-sprv.tp-v-disabled .tp-sprv_r{opacity:.5}',plugins:[qf,Kf,Xf,Hi,Qf]})}}new Fi("4.0.5");const xn="Stores all the settings on the project panel and current particle behavior (including mutations)",Nt={select:"Click to select a cohort, allowing you to generate children with similar behavior and conduct artificial selection",shove:"Left mouse to push particles away. Right mouse to attract them",walls:"Draw barriers that repel particles",trails:"Draw trails like the ones particles leave behind, but permanent"},ep="Give each cohort a randomly generated brain: Offers a clean slate where each cohort is completely unrelated to the others",tp="Generate a new set of children from the same parent.",dm="This will set the current parent to the chosen cohort. The simulation will reset and each cohort will become a (mutated) child of the one you chose.",np="Clear the trail map and place particles in their initial conditions",sp="Show/Hide the project and preferences control panels",ap="Pause/Resume the simulation. Particles and trails hold exactly where they are",um={"Save...":`Save the current project. ${xn}`,"Copy Link to This Project":"Copy a url to the clipboard that opens Fluoddity.com to the current project. Encodes all the settings on the project panel and current particle behavior (including mutations)","Load Project from Clipboard":"Decode a fluoddity permalink or QR-code containing screenshot and load it as the current project. Equivalent to paste/ctrl-V","Copy Screenshot…":"Select a region of the canvas and copy it to your clipboard","Copy Screenshot with QR Code…":'Select a region of the canvas to generate a screenshot, stamped with a QR code containing a permalink to this project. Generates the same url as "Copy Link to This Project"',"Export Saves as JSON...":"Download the contents of your custom saves as a folder of json files.","Import Saves from JSON...":"Upload json files in a folder to your custom saves","Project Link Settings":"Choose what a copied link asks the recipient to adopt — your world size, brightness and the rest. They are prompted before anything is applied.","Video Export Controls":"Open the recording control panel for creating and downloading mp4 videos of your Fluoddities","Camera Controls":"Open the camera panel, where a webcam or phone camera can push or steer the particles. The camera only turns on when you press Start there.","Set Checkpoint":`Checkpoints let you create/restore quicksaves within a session. ${xn}`,"Load Latest Checkpoint":`Checkpoints let you create/restore quicksaves within a session. ${xn}`,"Revert to Saved":"Equivalent to File->Load <Filename>",Select:Nt.select,Shove:Nt.shove,Walls:Nt.walls,Trails:Nt.trails,"Toggle Trail-Map View":"View the trails left behind by particles instead of the particles themselves. Hue indicates trail direction: Yellow-Green is up, Red is right, Purple is down, and Cyan is left","Reset View":"Return the camera to the default location/zoom","Reset Editor Preferences...":"Restore Fluoddity to factory settings. Equivalent to visiting the website for the first time","Toggle UI Panels":`${sp}. Equivalent to pressing the gear button`,"Pause / Resume":ap,Reset:np,"Randomize Behavior":ep,"Reroll Mutations":tp};function Pt(n,e){const t={};for(const s of n)t[e[s]]=s;return t}function ip(n,e,t,s){const a={...e.settings};let i=!1;const r=(f,b)=>{f.dataset.setting=`camera.${b}`},o=n.addButton({title:"Start Camera"});r(o.element,"start"),o.on("click",()=>{e.toggle()}),t(o.element,"Start / Stop Camera","Turn the camera on or off. It is always off when the page opens, and stays on while this tab is hidden.");const c=document.createElement("div");c.style.cssText="font-size:11px;line-height:1.4;padding:2px 8px 6px;opacity:0.75;";const l=[],d=(f,b,p,S,U)=>{const M=n.addBinding(a,f,b);return r(M.element,f),t(M.element,p,S),M.on("change",H=>{i||U(H.value)}),l.push(M),M.element};d("facing",{label:"Camera",options:Pt(fi,wc)},"Camera","Which camera to use on a phone or tablet. A computer with one webcam uses it either way.",f=>e.update({facing:f})),d("mirror",{label:"Mirror"},"Mirror","Flip the picture left to right. On by default for the front camera, so moving your right hand moves the particles on the right.",f=>e.update({mirror:f})),d("mapping",{label:"Mapping",options:Pt(Wt,Ys)},"Mapping",Wt.map(f=>`${Ys[f]}: ${vc[f]}`).join(`

`),f=>e.update({mapping:f})),d("direction",{label:"Direction",options:Pt(pi,bc)},"Direction","Toward follows the mapping; Away reverses it -- particles flee the bright side of edges, or motion, instead of seeking it, and run along outlines the other way.",f=>e.update({direction:f})),d("destination",{label:"Destination",options:Pt(kn,$s)},"Destination",kn.map(f=>`${$s[f]}: ${gc[f]}`).join(`

`),f=>e.update({destination:f})),d("gain",{label:"Gain",min:0,max:mi,step:.05},"Gain","How strongly the camera acts on every config at once.",f=>e.update({gain:f})),d("blur",{label:"Blur",min:0,max:1,step:.01},"Blur","Smooth the picture before reading it. Motion wants a wide blur, so a hand becomes one region rather than a ridge of noise; Edges want little.",f=>e.update({blur:f}));const h=d("falloff",{label:"Falloff",min:0,max:vi,step:.05},"Falloff","How fast Motion gravity weakens with distance. 0 pulls as hard from across the screen as from up close; 1 is gentle (2D gravity); 2 is everyday gravity; 3 keeps the pull close to the motion.",f=>e.update({falloff:f})),u=d("preview",{label:"Show Field"},"Show Field","Preview the field the particles read: direction as colour (the trail map’s colours), strength as brightness. Not the camera picture.",f=>e.update({preview:f})),w=document.createElement("div");w.style.cssText="position:relative;margin:4px 8px 8px;";const v=document.createElement("canvas");v.dataset.setting="camera.previewCanvas",v.style.cssText="display:block;margin:0 auto;border-radius:4px;background:#000;border:1px solid rgba(255,255,255,0.12);";const m=document.createElement("div");m.style.cssText="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;opacity:0.6;pointer-events:none;",w.append(v,m),xa(o.element,c),xa(u,w),s!==void 0&&o.element.parentElement?.insertBefore(rp(s),o.element);let E=!1,g=0,N=0;const P=180;function x(){const f=e.settings.preview;if(w.style.display=f?"":"none",!f)return;const b=e.worldAspect>0?e.worldAspect:1,p=w.clientWidth;if(p>0&&(p!==N||b!==g)){N=p,g=b;const S=Math.round(Math.min(p/b,P)),U=Math.round(S*b);v.style.width=`${U}px`,v.style.height=`${S}px`;const M=typeof devicePixelRatio=="number"?devicePixelRatio:1;v.width=Math.max(1,Math.round(U*M)),v.height=Math.max(1,Math.round(S*M)),e.invalidatePreview()}!E&&v.isConnected&&(e.attachPreview(v),E=!0),m.textContent=e.running?"":"Camera off"}function T(){const f=e.settings,b=f.mapping==="motionGravity"?"":"none";h.style.display!==b&&(h.style.display=b);let p=!1;for(const H of Object.keys(a))a[H]!==f[H]&&(a[H]=f[H],p=!0);if(p){i=!0;try{for(const H of l)H.refresh()}finally{i=!1}}const S=e.state,U=S==="on"?"Stop Camera":S==="starting"?"Cancel":"Start Camera";o.title!==U&&(o.title=U);const M=S==="error"?e.error??"The camera could not be opened.":S==="starting"?"Waiting for the camera — your browser may ask for permission.":S==="on"?"Camera on.":"Camera off. Nothing here is saved with projects.";c.textContent!==M&&(c.textContent=M),x()}return T(),{refresh:T,dispose:()=>{E&&e.attachPreview(null),E=!1}}}function fm(n,e,t,s){const a=ip(n,s.webcam,(i,r,o)=>{t.tooltip.attach(i,{title:r,body:o})},{lead:"Attention!",text:"Camera input works best with random initial conditions and a high hazard rate.",action:"Click here to enable them",onClick:s.onSetupForCamera});return{bindings:[],refresh:()=>a.refresh(),dispose:()=>a.dispose()}}function rp(n){const e=document.createElement("button");e.type="button",e.dataset.setting="camera.notice",e.style.cssText="display:block;width:calc(100% - 8px);margin:4px 4px 8px;padding:8px 10px;text-align:left;cursor:pointer;font:600 12px/1.45 system-ui,sans-serif;color:#e8e8ea;background:rgba(138,180,248,0.14);border:1px solid rgba(138,180,248,0.55);border-radius:6px;";const t=document.createElement("span");t.textContent=`${n.lead} `,t.style.color="#8ab4f8";const s=document.createElement("span");return s.textContent=n.action,s.style.textDecoration="underline",e.append(t,`${n.text} `,s),e.addEventListener("click",()=>{n.onClick()}),e}function xa(n,e){n.parentElement?.insertBefore(e,n.nextSibling)}async function pm(n){if(navigator.clipboard===void 0)return!1;try{return await navigator.clipboard.writeText(n),!0}catch{return!1}}async function mm(){if(navigator.clipboard?.readText===void 0)return null;try{return await navigator.clipboard.readText()}catch{return null}}const op=`
  position: fixed;
  inset: 0;
  z-index: 9000;
  cursor: crosshair;
  background: rgba(0, 0, 0, 0.35);
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
`,lp=`
  position: absolute;
  border: 1px solid #fff;
  box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.45);
  pointer-events: none;
`,cp=`
  position: absolute;
  border: 2px dashed rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.14);
  pointer-events: none;
  box-sizing: border-box;
`,hp=`
  position: absolute;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  font: 12px system-ui, sans-serif;
  white-space: nowrap;
  pointer-events: none;
`,dp=`
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 14px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.82);
  color: #fff;
  font: 13px system-ui, sans-serif;
  pointer-events: none;
`,up="rgba(255, 96, 96, 0.95)",Ta="rgba(255, 214, 82, 0.95)",fp="Large images may be downsampled when posted to social media, corrupting the QR code",pp="may be downsampled, corrupting the QR code";function vm(n){return new Promise(e=>{const t=window.devicePixelRatio||1,s=n.minDevicePx/t,a=n.stampDevicePx/t,i=n.insetDevicePx/t,r=document.createElement("div");r.style.cssText=op;const o=document.createElement("div");o.style.cssText=lp,o.style.display="none";const c=document.createElement("div");c.style.cssText=cp,c.style.display="none";const l=document.createElement("div");l.style.cssText=hp,l.style.display="none";const d=n.circle??null,h=d!==null?d.instruction:s>0?`Drag to choose the shareable area — at least ${Math.ceil(s)}px on each side. Esc to cancel.`:"Drag to choose the area to capture. Esc to cancel.",u=document.createElement("div");u.style.cssText=dp,u.textContent=h,r.append(o,c,l),document.body.append(r,u);let w=0,v=0,m=!1,E=null,g=null;const N=(p,S)=>{if(d!==null){const U=Math.hypot(p-w,S-v);return{x:w-U,y:v-U,width:2*U,height:2*U}}return P(p,S)},P=(p,S)=>({x:Math.min(w,p),y:Math.min(v,S),width:Math.abs(p-w),height:Math.abs(S-v)}),x=p=>{const S=Math.round(p.width*t),U=Math.round(p.height*t),M=d!==null?p.width/2<d.minRadiusCss:p.width<s||p.height<s,H=n.warnAboveDevicePx>0&&(S>n.warnAboveDevicePx||U>n.warnAboveDevicePx),sn=M?up:H?Ta:"#fff";o.style.display="block",o.style.borderRadius=d!==null?"50%":"",o.style.left=`${p.x}px`,o.style.top=`${p.y}px`,o.style.width=`${p.width}px`,o.style.height=`${p.height}px`,o.style.borderColor=sn;const _s=a>0&&p.width>=a+i&&p.height>=a+i;c.style.display=_s?"block":"none",_s&&(c.style.left=`${p.x+p.width-a-i}px`,c.style.top=`${p.y+p.height-a-i}px`,c.style.width=`${a}px`,c.style.height=`${a}px`,c.style.borderColor=sn),l.style.display="block",l.textContent=d!==null?M?"too small — release to cancel":`${S} px across`:M?`${S} x ${U} — too small, will grow to ${n.minDevicePx}`:H?`${S} x ${U} — ${pp}`:`${S} x ${U}`,l.style.color=sn;const Es=p.y-24;l.style.left=`${p.x}px`,l.style.top=`${Es<4?p.y+p.height+6:Es}px`,u.textContent=H?fp:h,u.style.color=H?Ta:"#fff"},T=p=>{const S=Math.max(p.width,s),U=Math.max(p.height,s);let M=p.x-(S-p.width)/2,H=p.y-(U-p.height)/2;return M=Math.max(0,Math.min(window.innerWidth-S,M)),H=Math.max(0,Math.min(window.innerHeight-U,H)),{x:M,y:H,width:S,height:U}},f=p=>{const S=m;if(g!==null&&r.hasPointerCapture(g)&&r.releasePointerCapture(g),g=null,m=!1,r.remove(),u.remove(),window.removeEventListener("keydown",b,!0),window.getSelection()?.removeAllRanges(),S){const U=H=>H.preventDefault(),M=()=>{document.removeEventListener("selectstart",U,!0),window.removeEventListener("pointerup",M,!0),window.removeEventListener("pointercancel",M,!0),window.getSelection()?.removeAllRanges()};document.addEventListener("selectstart",U,!0),window.addEventListener("pointerup",M,!0),window.addEventListener("pointercancel",M,!0)}e(p)};function b(p){p.key==="Escape"&&(p.preventDefault(),p.stopPropagation(),f(null))}r.addEventListener("pointerdown",p=>{if(p.preventDefault(),p.button!==0){f(null);return}m=!0,w=p.clientX,v=p.clientY,r.setPointerCapture(p.pointerId),g=p.pointerId,x(N(p.clientX,p.clientY))}),r.addEventListener("pointermove",p=>{m&&(E=N(p.clientX,p.clientY),x(E))}),r.addEventListener("pointerup",p=>{if(!m)return;m=!1;const S=N(p.clientX,p.clientY);if(d!==null){f(S.width/2<d.minRadiusCss?null:S);return}if(S.width<8&&S.height<8){f(null);return}f(T(S))}),window.addEventListener("keydown",b,!0)})}class nn extends Error{constructor(e){super(e),this.name="CaptureError"}}async function gm(n,e){return await new Promise(t=>{requestAnimationFrame(()=>requestAnimationFrame(()=>t()))}),mp(n,e)}function mp(n,e){const t=n.getBoundingClientRect(),s=n.width/t.width,a=n.height/t.height,i=Math.round(e.x*s),r=Math.round(e.y*a),o=Math.round(e.width*s),c=Math.round(e.height*a),l=Math.max(0,Math.min(n.width-1,i)),d=Math.max(0,Math.min(n.height-1,r)),h=Math.max(1,Math.min(n.width-l,o)),u=Math.max(1,Math.min(n.height-d,c)),w=document.createElement("canvas");w.width=h,w.height=u;const v=w.getContext("2d",{willReadFrequently:!0});if(v===null)throw new nn("could not get a 2D context to read into");v.fillStyle="#000",v.fillRect(0,0,h,u),v.drawImage(n,l,d,h,u,0,0,h,u);const m=v.getImageData(0,0,h,u);return{width:h,height:u,data:m.data}}function vp(n){const e=document.createElement("canvas");e.width=n.width,e.height=n.height;const t=e.getContext("2d");if(t===null)throw new nn("could not get a 2D context to write into");const s=t.createImageData(n.width,n.height);return s.data.set(n.data),t.putImageData(s,0,0),e}async function Er(n){const e=vp(n),t=await new Promise(s=>{e.toBlob(s,"image/png")});if(t===null)throw new nn("the browser would not encode a PNG");return t}async function wm(n){if(typeof ClipboardItem>"u"||navigator.clipboard?.write===void 0)return!1;try{return await navigator.clipboard.write([new ClipboardItem({"image/png":Er(n)})]),!0}catch{return!1}}async function bm(n,e){const t=await Er(n),s=URL.createObjectURL(t),a=document.createElement("a");a.href=s,a.download=e,a.click(),setTimeout(()=>URL.revokeObjectURL(s),1e4)}async function xr(n){const e=await createImageBitmap(n);try{const t=document.createElement("canvas");t.width=e.width,t.height=e.height;const s=t.getContext("2d",{willReadFrequently:!0});if(s===null)throw new nn("could not get a 2D context to read into");s.drawImage(e,0,0);const a=s.getImageData(0,0,e.width,e.height);return{width:e.width,height:e.height,data:a.data}}finally{e.close()}}async function ym(){if(navigator.clipboard?.read===void 0)return null;try{const n=await navigator.clipboard.read();for(const e of n){const t=e.types.find(s=>s.startsWith("image/"));if(t!==void 0)return await xr(await e.getType(t))}}catch{}return null}async function _m(n){const e=n.clipboardData?.items;if(e===void 0)return null;for(const t of e)if(t.kind==="file"&&t.type.startsWith("image/")){const s=t.getAsFile();if(s!==null)return await xr(s)}return null}export{Ws as $,Ja as A,Ne as B,Ft as C,nm as D,Oe as E,Ap as F,Qp as G,Kp as H,$e as I,tc as J,He as K,tm as L,Op as M,jn as N,zp as O,Y as P,Bp as Q,As as R,ci as S,Mp as T,Io as U,bp as V,je as W,yp as X,_p as Y,Rp as Z,Cp as _,qp as a,Vs as a$,nc as a0,Gr as a1,Rt as a2,No as a3,qn as a4,qa as a5,Us as a6,F as a7,Ms as a8,cn as a9,xr as aA,mm as aB,ym as aC,Np as aD,cm as aE,Pp as aF,an as aG,Tp as aH,xp as aI,Sp as aJ,Ro as aK,yi as aL,rm as aM,rn as aN,Up as aO,wp as aP,Ep as aQ,Wa as aR,Ct as aS,Vn as aT,Or as aU,Zp as aV,za as aW,Va as aX,Ia as aY,Xo as aZ,$ as a_,ce as aa,um as ab,ec as ac,ep as ad,sm as ae,Nt as af,np as ag,sp as ah,ap as ai,dm as aj,tp as ak,ic as al,Wp as am,fm as an,gp as ao,ho as ap,lm as aq,hm as ar,Dp as as,pm as at,vm as au,gm as av,wm as aw,bm as ax,_m as ay,kp as az,D as b,zt as b0,em as b1,Xr as b2,rc as b3,qs as b4,oc as b5,vp as b6,ip as b7,Hp as b8,om as b9,Mt as ba,Jp as bb,Cl as bc,kr as bd,Dr as be,ln as c,Fp as d,Pn as e,Ps as f,Go as g,oi as h,Ya as i,Vp as j,Yp as k,Gp as l,Kr as m,ii as n,Ip as o,Xp as p,sc as q,im as r,jp as s,Lp as t,$p as u,ti as v,Ko as w,ac as x,am as y,Bl as z};
