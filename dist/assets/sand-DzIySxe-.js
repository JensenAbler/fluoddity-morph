import{l as Ss,Q as Ta,aR as xa,aS as Q,aT as Ts,i as Jt,g as yt,aU as xs,aV as As,f as Aa,t as Ra,K as Rs,aW as Ia,aX as Qt,aY as en,aZ as Is,a_ as $,F as We,a$ as Ls,b0 as Ns,b1 as Cs,j as kn,h as zt,S as La,N as Os,b2 as ks,b3 as Pn,q as Ps,L as Ds,u as Us,b4 as Dn,b5 as Ws,af as Un,ao as Ms,au as Bs,av as zs,b6 as Gs,ar as Fs,b7 as Hs,a4 as Nt,P as Vs,a6 as Ys,O as $s,b as Wn,c as Mn,b8 as qs,a9 as js,aa as Ks,a8 as Xs,aH as Na,aI as Zs,aJ as Js,e as Qs,m as ei,B as ti,D as Bn,aL as ni,b9 as ai,k as si,n as ii,o as ri,A as oi,ba as li,bb as zn,bc as ci,J as Gn,aB as hi,az as di,bd as ui,be as fi}from"./shareCapture-BIpPWkSJ.js";const Gt="fluoddity.sand.preferences";function Ft(n){return{getItem:()=>n.getItem(Gt),setItem:(e,t)=>n.setItem(Gt,t)}}function pi(n,e=xa()){if(e===null)return n;let t=null;try{t=e.getItem(Gt)}catch{t=null}return t!==null?Ss(Ft(e)):(Ta(n,Ft(e)),n)}function Ca(n,e=xa()){e!==null&&Ta(n,Ft(e))}const X=Q,dt=2,ut=4;function Pe(n){if(n==="rg16float")return 2;if(n==="rgba16float")return 4;throw new Error(`No stamp layer layout for texture format ${n}`)}function mi(n){return Math.floor(n.particles.byteLength/X)}function bt(n){return{width:0,height:0,channels:n,data:new Float32Array(0)}}function Ve(n){return n.width<=0||n.height<=0||n.data.length===0}function Fn(n){return n.width<0||n.height<0||!Number.isInteger(n.width)||!Number.isInteger(n.height)?!1:n.data.length===n.width*n.height*n.channels}function Oa(n){if(n.particles.byteLength%X!==0)return`particle block is ${n.particles.byteLength} bytes, not a multiple of the ${X}-byte entity stride`;if(n.canvas.channels!==dt||n.field.channels!==ut)return`layers have ${n.canvas.channels} and ${n.field.channels} channels; expected ${dt} (canvas) and ${ut} (field)`;if(!Fn(n.canvas))return`canvas layer claims ${n.canvas.width}x${n.canvas.height} but holds ${n.canvas.data.length} floats`;if(!Fn(n.field))return`field layer claims ${n.field.width}x${n.field.height} but holds ${n.field.data.length} floats`;const[e,t]=[n.box.max[0]-n.box.min[0],n.box.max[1]-n.box.min[1]];return!Number.isFinite(e)||!Number.isFinite(t)?"box has a non-finite extent":e<0||t<0?`box is inverted (${e} x ${t}); min must be <= max on both axes`:null}const Ht=1,Vt="FWLDSTMP",we=8,le=we+4+4;class M extends Error{constructor(e){super(e),this.name="StampFormatError"}}function wi(n){if(Number.isNaN(n))return 32256;if(n===1/0)return 31744;if(n===-1/0)return 64512;if(n===0)return Object.is(n,-0)?32768:0;const e=n<0?32768:0,t=Math.abs(n);if(t>=65520)return e|31744;if(t<2**-24)return e;if(t<2**-14){const o=t/5960464477539063e-23,h=Hn(o);return e|h}const a=Math.floor(Math.log2(t)),s=t/2**a-1;let r=Hn(s*1024),i=a;return r===1024&&(r=0,i+=1),i>15?e|31744:e|i+15<<10|r}function Hn(n){const e=Math.floor(n),t=n-e;return t>.5?e+1:t<.5||e%2===0?e:e+1}function ka(n){const e=(n&32768)!==0?-1:1,t=n>>10&31,a=n&1023;return t===0?a===0?e*0:e*a*2**-24:t===31?a===0?e*(1/0):NaN:e*(1+a/1024)*2**(t-15)}function Yt(n){const e=new Uint16Array(new ArrayBuffer(n.length*2));for(let t=0;t<n.length;t++)e[t]=wi(n[t]??0);return e}function gi(n){const e=new Float32Array(new ArrayBuffer(n.length*4));for(let t=0;t<n.length;t++)e[t]=ka(n[t]??0);return e}function De(n){return n+3&-4}function Pa(n){const e=Oa(n);if(e!==null)throw new M(`refusing to encode a malformed stamp: ${e}`);const t=Yt(n.canvas.data),a=Yt(n.field.data);let s=0;const r={offset:s,bytes:n.particles.byteLength};s=De(s+r.bytes);const i={offset:s,bytes:t.byteLength};s=De(s+i.bytes);const o={offset:s,bytes:a.byteLength};s=De(s+o.bytes);const h=s,c={box:{min:[n.box.min[0],n.box.min[1]],max:[n.box.max[0],n.box.max[1]]},particles:r,canvas:{width:n.canvas.width,height:n.canvas.height,block:i},field:{width:n.field.width,height:n.field.height,block:o},palette:n.palette.map(b=>({slot:b.slot,name:b.name}))},u=new TextEncoder().encode(JSON.stringify(c)),f=De(u.length),m=le+f+h,g=new ArrayBuffer(m),w=new Uint8Array(g),y=new DataView(g);for(let b=0;b<we;b++)w[b]=Vt.charCodeAt(b);y.setUint32(we,Ht,!0),y.setUint32(we+4,u.length,!0),w.set(u,le);const E=le+f;return w.set(new Uint8Array(n.particles),E+r.offset),w.set(new Uint8Array(t.buffer),E+i.offset),w.set(new Uint8Array(a.buffer),E+o.offset),g}function Vn(n,e,t){if(typeof n!="object"||n===null)throw new M(`${e}: "${t}" block reference is missing`);const a=n,s=a.offset,r=a.bytes;if(typeof s!="number"||typeof r!="number"||!Number.isInteger(s)||!Number.isInteger(r)||s<0||r<0)throw new M(`${e}: "${t}" block reference is not a pair of non-negative integers`);return{offset:s,bytes:r}}function Yn(n,e,t){if(!Array.isArray(n)||n.length!==2||typeof n[0]!="number"||typeof n[1]!="number"||!Number.isFinite(n[0])||!Number.isFinite(n[1]))throw new M(`${e}: "${t}" is not a pair of finite numbers`);return[n[0],n[1]]}function Ct(n,e="stamp"){if(n.byteLength<le)throw new M(`${e}: too short to be a stamp (${n.byteLength} bytes)`);const t=new Uint8Array(n),a=new DataView(n);for(let T=0;T<we;T++)if(t[T]!==Vt.charCodeAt(T))throw new M(`${e}: not a ${Vt} file`);const s=a.getUint32(we,!0);if(s!==Ht)throw new M(`${e}: unrecognized stamp version ${s}; expected ${Ht}`);const r=a.getUint32(we+4,!0),i=le+r;if(i>n.byteLength)throw new M(`${e}: header claims ${r} bytes but the file holds ${n.byteLength-le} after the preamble`);let o;try{const T=new TextDecoder().decode(t.subarray(le,i)),R=JSON.parse(T);if(typeof R!="object"||R===null||Array.isArray(R))throw new Error("not a JSON object");o=R}catch(T){throw new M(`${e}: header is not readable JSON (${String(T)})`)}const h=o.box;if(typeof h!="object"||h===null)throw new M(`${e}: missing "box"`);const c=h,u={min:Yn(c.min,e,"box.min"),max:Yn(c.max,e,"box.max")},f=le+De(r),m=(T,R)=>{const P=f+T.offset,U=P+T.bytes;if(U>n.byteLength)throw new M(`${e}: ${R} block runs to byte ${U} but the file is ${n.byteLength} bytes — it is truncated`);return n.slice(P,U)},g=Vn(o.particles,e,"particles"),w=m(g,"particle"),y=T=>{const R=o[T];if(typeof R!="object"||R===null)throw new M(`${e}: missing "${T}" layer`);const P=R,U=P.width,p=P.height;if(typeof U!="number"||typeof p!="number"||!Number.isInteger(U)||!Number.isInteger(p)||U<0||p<0)throw new M(`${e}: "${T}" has non-integer dimensions`);const se=Vn(P.block,e,`${T}.block`),j=T==="canvas"?dt:ut;if(U===0||p===0)return bt(j);const G=m(se,T),K=U*p*j*2;if(G.byteLength!==K)throw new M(`${e}: "${T}" is ${U}x${p} and should hold ${K} bytes of half-float, but its block is ${G.byteLength}`);return{width:U,height:p,channels:j,data:gi(new Uint16Array(G))}},E=o.palette,b=[];if(Array.isArray(E))for(const T of E){if(typeof T!="object"||T===null)continue;const R=T,P=R.slot;typeof P!="number"||!Number.isInteger(P)||P<0||b.push({slot:P,name:typeof R.name=="string"?R.name:""})}const A={box:u,particles:w,canvas:y("canvas"),field:y("field"),palette:b},L=Oa(A);if(L!==null)throw new M(`${e}: ${L}`);return A}const vi=2.5,yi=.8,nt=9,bi=1e-4,tn=0,nn=1,$n=2,qn=3,jn=4;function an(n,e){if(Ve(n.canvas))return null;const t=n.box.max[0]-n.box.min[0];if(!(t>0))return null;const a=n.canvas.width/t,s=e??n.box,r=Math.round((s.max[0]-s.min[0])*a),i=Math.round((s.max[1]-s.min[1])*a);return r>0&&i>0?{frame:s,ppu:a,width:r,height:i,ox:Math.round((n.box.min[0]-s.min[0])*a),oy:Math.round((n.box.min[1]-s.min[1])*a)}:null}function $t(n,e=null){const t=an(n,e);if(t===null)return null;const{ppu:a,width:s,height:r}=t;let i=1/0,o=1/0,h=-1/0,c=-1/0;const u=(w,y,E,b)=>{i=Math.min(i,w),o=Math.min(o,y),h=Math.max(h,E),c=Math.max(c,b)},f=new DataView(n.particles),m=Math.floor(n.particles.byteLength/X);for(let w=0;w<m;w++){const y=w*X,E=(f.getFloat32(y+tn*4,!0)-t.frame.min[0])*a,b=(f.getFloat32(y+nn*4,!0)-t.frame.min[1])*a;!Number.isFinite(E)||!Number.isFinite(b)||u(Math.floor(E),Math.floor(b),Math.floor(E)+1,Math.floor(b)+1)}const g=n.field;if(!Ve(g)){const w=n.canvas.width/g.width,y=n.canvas.height/g.height;for(let E=0;E<g.height;E++)for(let b=0;b<g.width;b++){const A=(E*g.width+b)*g.channels;let L=!1;for(let T=0;T<g.channels;T++)Math.abs(g.data[A+T]??0)>bi&&(L=!0);L&&u(t.ox+Math.floor(b*w),t.oy+Math.floor(E*y),t.ox+Math.ceil((b+1)*w),t.oy+Math.ceil((E+1)*y))}}return h>i&&c>o?{x0:Math.max(0,i-nt),y0:Math.max(0,o-nt),x1:Math.min(s,h+nt),y1:Math.min(r,c+nt)}:null}function xe(n,e){return Jt(e,yt(n)[1])}function Kn(n,e,t,a,s=vi,r=yi){const i=b=>b[0]>=n&&b[1]>=e,o=xe(a,t);if(i(o))return{worldSize:a,aspect:t,canvas:o,step:"fits"};const h=a*s,c=Math.max(n/o[0],e/o[1]);let u=a*c*c;for(let b=0;b<40&&u<=h&&!i(xe(u,t));b++)u*=1.002;if(u<=h&&i(xe(u,t)))return{worldSize:u,aspect:t,canvas:xe(u,t),step:"grown"};const f=t*r,m=t/r,g=yt(h)[1],w=Math.max(f,(n/g)**2),y=Math.min(m,(g/e)**2);if(w<=y){const b=Math.min(y,Math.max(w,t));for(const A of[b,w*1.002,y/1.002,(w+y)/2]){if(A<w||A>y)continue;const L=xe(h,A);if(i(L))return{worldSize:h,aspect:A,canvas:L,step:"letterboxed"}}}const E=Math.min(m,Math.max(f,n/e));return{worldSize:h,aspect:E,canvas:xe(h,E),step:"cropped"}}function Xn(n,e,t,a){return e>=n||t===0&&a>0?0:a===0&&t>0?n-e:Math.floor((n-e)/2)}function Zn(n,e,t){if(n<=0)return 0;const a=e+t;return a>0?Math.round(n*e/a):Math.floor(n/2)}function Jn(n,e,t,a=null){const s=an(n,a),[r,i]=t,o=e.x1-e.x0,h=e.y1-e.y0,c=Math.min(o,r),u=Math.min(h,i);if(s===null||c<=0||u<=0)return{stamp:{...n,particles:new ArrayBuffer(0)},cropped:!1};const{width:f,height:m,ppu:g}=s,w=e.x0,y=f-e.x1,E=e.y0,b=m-e.y1,A=e.x0+Xn(o,c,w,y),L=e.y0+Xn(h,u,E,b),T=Zn(r-c,w,y),R=Zn(i-u,E,b),[P,U]=Ts(t),p=F=>(F/r-.5)*2*P,se=F=>(F/i-.5)*2*U,j=.001*2*P/r,G=.001*2*U/i,K={min:[p(T)+j,se(R)+G],max:[p(T+c)-j,se(R+u)-G]},k=2*P/r*g,Le=Da(n,s,A,L,c,u,(F,ce,Y,ie,re,H)=>{ie.setFloat32(Y+tn*4,p(F-A+T),!0),ie.setFloat32(Y+nn*4,se(ce-L+R),!0),ie.setFloat32(Y+$n*4,H.getFloat32(re+$n*4,!0)*k,!0),ie.setFloat32(Y+qn*4,H.getFloat32(re+qn*4,!0)*k,!0),ie.setFloat32(Y+jn*4,H.getFloat32(re+jn*4,!0)*k,!0)});return{stamp:{box:K,particles:Le,canvas:Ua(n.canvas,A-s.ox,L-s.oy,c,u),field:Wa(n,A-s.ox,L-s.oy,c,u),palette:n.palette},cropped:c<o||u<h}}function _i(n){const e=an(n,null),t=$t(n,null);if(e===null||t===null)return null;const{x0:a,y0:s,x1:r,y1:i}=t,o=r-a,h=i-s;return{stamp:{box:{min:[e.frame.min[0]+a/e.ppu,e.frame.min[1]+s/e.ppu],max:[e.frame.min[0]+r/e.ppu,e.frame.min[1]+i/e.ppu]},particles:Da(n,e,a,s,o,h,()=>{}),canvas:Ua(n.canvas,a,s,o,h),field:Wa(n,a,s,o,h),palette:n.palette},frame:e.frame}}function Da(n,e,t,a,s,r,i){const o=new DataView(n.particles),h=new Uint8Array(n.particles),c=Math.floor(n.particles.byteLength/X),u=new Uint8Array(c*X),f=new DataView(u.buffer);let m=0;for(let g=0;g<c;g++){const w=g*X,y=(o.getFloat32(w+tn*4,!0)-e.frame.min[0])*e.ppu,E=(o.getFloat32(w+nn*4,!0)-e.frame.min[1])*e.ppu;if(!(y>=t&&y<t+s&&E>=a&&E<a+r))continue;const b=m*X;u.set(h.subarray(w,w+X),b),i(y,E,b,f,w,o),m++}return u.buffer.slice(0,m*X)}function Ua(n,e,t,a,s){const r=n.channels;if(Ve(n)||a<=0||s<=0)return bt(r);const i=new Float32Array(a*s*r),o=Math.max(0,-e),h=Math.min(a,n.width-e);if(h<=o)return{width:a,height:s,channels:r,data:i};for(let c=0;c<s;c++){const u=t+c;if(u<0||u>=n.height)continue;const f=(u*n.width+e+o)*r,m=(h-o)*r;i.set(n.data.subarray(f,f+m),(c*a+o)*r)}return{width:a,height:s,channels:r,data:i}}function Wa(n,e,t,a,s){const r=n.field,i=r.channels;if(Ve(r)||a<=0||s<=0)return bt(i);const o=r.width/n.canvas.width,h=r.height/n.canvas.height,c=Math.max(1,Math.round(a*o)),u=Math.max(1,Math.round(s*h)),f=new Float32Array(c*u*i);for(let m=0;m<u;m++){const g=Math.floor((t+(m+.5)*s/u)*h);if(!(g<0||g>=r.height))for(let w=0;w<c;w++){const y=Math.floor((e+(w+.5)*a/c)*o);if(y<0||y>=r.width)continue;const E=(g*r.width+y)*i,b=(m*c+w)*i;for(let A=0;A<i;A++)f[b+A]=r.data[E+A]??0}}return{width:c,height:u,channels:i,data:f}}const me="spawn",ge="erase",ne="config",Me=["brush","erase","shove","walls","stamp"],Ma="brush",Re={brush:"Brush",erase:"Erase",shove:"Shove",walls:"Walls",trails:"Trails",stamp:"Stamp"};function Ei(n){return n!=="stamp"}function Si(n,e){const t=Me.length,s=((Me.indexOf(n)+e)%t+t)%t;return Me[s]??n}function Ti(n){return n==="walls"||n==="trails"}function xi(n){return n==="brush"}function Ai(n){return n!=="erase"}function Ri(n,e){return e===null?null:n==="brush"?e===me?me:ge:n==="erase"?ge:null}const ot=["walls+particles","particles","walls"],_t="walls+particles",Ii={"walls+particles":"Walls+Particles",walls:"Walls",particles:"Particles"};function Li(n){return typeof n=="string"&&ot.includes(n)?n:_t}function Ni(n){const e=ot.indexOf(n);return ot[(e+1)%ot.length]??_t}function Ci(n){return n!=="particles"}function Qn(n){return n!=="walls"}const Oi=.8,ki=.618033988749895;function ft(n){return{hue:n*ki%1,saturation:Oi}}function Pi(n){return Array.from({length:Math.max(0,Math.trunc(n))},(e,t)=>ft(t))}function Ba(n){if(typeof n!="object"||n===null||Array.isArray(n))return null;const e=n,t=e.hue,a=e.saturation;return typeof t!="number"||!Number.isFinite(t)||typeof a!="number"||!Number.isFinite(a)?null:{hue:(t%1+1)%1,saturation:Math.max(0,Math.min(1,a))}}function qt(n){const[e,t,a]=Ui(n.hue,n.saturation,1),s=r=>Math.round(r*255).toString(16).padStart(2,"0");return`#${s(e)}${s(t)}${s(a)}`}function Di(n){const e=/^#([0-9a-f]{6})$/i.exec(n.trim());if(e===null)return null;const t=Number.parseInt(e[1],16),a=(t>>16&255)/255,s=(t>>8&255)/255,r=(t&255)/255,i=Math.max(a,s,r),o=Math.min(a,s,r),h=i-o;if(h===0)return{hue:0,saturation:0};let c;return i===a?c=(s-r)/h%6:i===s?c=(r-a)/h+2:c=(a-s)/h+4,c/=6,c<0&&(c+=1),{hue:c,saturation:h/i}}function Ui(n,e,t){const a=s=>{const r=(s+n*6)%6;return t-t*e*Math.max(0,Math.min(Math.min(r,4-r),1))};return[a(5),a(3),a(1)]}const W=40,Et=30,jt=5,Kt=10,q=4,Z=0,at={tool:ne,config:null,world:null,name:""};function Wi(n){return n.config!==null}function za(n){return Number.isFinite(n)?Math.max(jt,Math.min(W,Math.trunc(n))):Et}function Mi(n){return n==="0"?Kt-1:n>="1"&&n<="9"?Number(n)-1:null}function Bi(n,e,t){const a=Math.max(1,Math.min(W,Math.trunc(t)));return((n+e)%a+a)%a}function Ga(n){return n<0||n>=Kt?"":n===Kt-1?"0":String(n+1)}class zi{slots=Array.from({length:W},()=>at);generations=Array.from({length:W},()=>0);colors=Pi(W);_selected=0;_visibleCount=Et;get selected(){return this._selected}get visibleCount(){return this._visibleCount}setVisibleCount(e){this._visibleCount=za(e),this._selected>=this._visibleCount&&(this._selected=this._visibleCount-1)}get master(){return this.slots[Z]??at}at(e){return this.slots[e]??at}all(){return this.slots}firstEmpty(){for(let e=0;e<this._visibleCount;e++)if(e!==Z&&this.slots[e]?.config==null)return e;return null}set(e,t){e<0||e>=W||(this.slots[e]=t,this.generations[e]=(this.generations[e]??0)+1)}edit(e,t,a){if(e<0||e>=W)return;const s=this.slots[e];s===void 0||s.config===null||(this.slots[e]={...s,config:t,world:a})}generationOf(e){return this.generations[e]??0}colorOf(e){return this.colors[e]??ft(e)}setColor(e,t){e<0||e>=W||(this.colors[e]=t)}colorsForUpload(){return this.colors}appearanceForUpload(){return this.colors.map((e,t)=>{const a=this.slots[t]?.config??null;return{hue:e.hue,saturation:e.saturation,colorSensitivity:a?.colorSensitivity??0,colorOffset:a?.colorOffset??0}})}clear(e){e!==Z&&this.set(e,at)}setIcon(e,t){const a=this.slots[e];if(a===void 0||a.config===null)return;const{icon:s,...r}=a;this.slots[e]=t===null?r:{...r,icon:t}}select(e){e<0||e>=W||(this._selected=e)}configsForUpload(e){return this.slots.map(t=>t.config??e)}get isEmpty(){return this.slots.every(e=>e.config===null)}}const Gi=.65,Ae=[.01,.025,.05,.1].map(n=>n*Gi),fe=2;function pt(n){return typeof n=="number"&&Number.isInteger(n)&&n>=0&&n<Ae.length}function ea(n){return n!=="stamp"}function sn(){return{brush:fe,erase:fe,shove:fe,walls:fe,trails:fe}}const Fi=24e4,ue=1;function rn(){return{brush:ue,erase:ue,shove:ue,walls:ue,trails:ue,stamp:ue}}class Hi{sizes=sn();previous=null;strengths=rn();tool="brush";get weight(){return this.strengths[this.tool]}strengthFor(e){return this.strengths[e]}allStrengths(){return{...this.strengths}}setStrength(e,t){!Number.isFinite(t)||t<=0||(this.strengths[e]=t)}restoreStrengths(e){for(const[t,a]of Object.entries(e))typeof a=="number"&&this.setStrength(t,a)}get radius(){return Ae[this.sizeSlot??fe]??Ae[fe]??.05}get reticleRadius(){return 2*this.radius}get worldRadius(){return xs(this.reticleRadius)}get sizeSlot(){return ea(this.tool)?this.sizes[this.tool]:null}setSize(e){!ea(this.tool)||!pt(e)||(this.sizes[this.tool]=e)}allSizes(){return{...this.sizes}}restoreSizes(e){for(const[t,a]of Object.entries(e))t in this.sizes&&pt(a)&&(this.sizes[t]=a)}release(){this.previous=null}frame(e,t,a,s,r=!0){if(e===null||t===null)return this.release(),null;const i=this.previous??e;this.previous=e;const o={from:i,to:e,radius:this.worldRadius};if(t===ge)return{action:t,stroke:o,count:0};if(!r)return null;const h=As(this.worldRadius,Fi*this.weight,a,s);return h<=0?null:{action:t,stroke:o,count:h}}}const on="behavior",ln="cohort",cn="swatch",Fa=[on,ln,cn],Ye=on,Vi={[on]:"Behavior",[ln]:"Cohort",[cn]:"Swatch"};function Yi(n){return n===ln?1:n===cn?2:0}function hn(n){return typeof n=="string"&&Fa.includes(n)?n:Ye}const $i=128,qi=192,ji=.85,Ki=12,Xi=512*1024,Zi=/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/,Ji=/^https?:\/\/[^\x00-\x20\x7f"'\\]+$/,Ha=/^[A-Za-z0-9][A-Za-z0-9._-]*\.(?:jpe?g|png|webp)$/;function Ie(n){return typeof n!="string"||n===""||n.length>Xi?null:Zi.test(n)||Ji.test(n)||Ha.test(n)?n:null}function Qi(n){return Ha.test(n)}function Ce(n,e){return Qi(n)?new URL(n,e).href:n}function ta(n){return`url("${n}")`}function er(n){return n==="image/png"?"png":n==="image/webp"?"webp":"jpg"}const dn="fluoddity.sand.session",O=-1,pe={slots:[],selected:0,brushSizes:sn(),tool:Ma,strengths:rn(),eraseMode:_t,visibleCount:Et,maxParticles:null,theme:"",worldRefs:[],selectedWorld:O,autoCompact:!1,compactionPaused:!1,auditAfterSweep:!1,colorMode:Ye,worldIcon:null};function un(){try{const n=globalThis.localStorage,e="__fluoddity_probe__";return n.setItem(e,"1"),n.removeItem(e),n}catch{return null}}function na(n,e){return n===null||e===null?null:Ra([n],e)}function Ue(n){if(n==null)return null;try{const e=Aa(n,"session");return e.configs[0]===void 0?null:e}catch{return null}}const aa={name:"",document:null};function Va(n){if(typeof n!="object"||n===null)return aa;const e=n,t=e.tool;if(typeof t=="string"&&t!==ne)return aa;const a=Ba(e.color),s=e.document??null,r=s===null?null:Ie(e.icon);return{name:typeof e.name=="string"?e.name:"",document:s,...a===null?{}:{color:a},...r===null?{}:{icon:r}}}function tr(n){return typeof n=="string"&&n in Re?n:Ma}function nr(n,e){const t=rn();if(e!==null&&(t.brush=e),typeof n=="object"&&n!==null)for(const[a,s]of Object.entries(n))a in Re&&typeof s=="number"&&Number.isFinite(s)&&s>0&&(t[a]=s);return t}function ar(n,e){const t=sn();if(pt(e))for(const a of Object.keys(t))t[a]=e;if(typeof n=="object"&&n!==null)for(const[a,s]of Object.entries(n))a in t&&pt(s)&&(t[a]=s);return t}function Ya(n){let e;try{e=JSON.parse(n)}catch{return pe}if(typeof e!="object"||e===null)return pe;const t=e,s=(Array.isArray(t.slots)?t.slots:[]).slice(0,W).map(Va),r=(c,u)=>{const f=t[c];return typeof f=="number"&&Number.isFinite(f)?f:u},i=t.maxParticles,o=t.weight,h=typeof o=="number"&&Number.isFinite(o)&&o>0?o:null;return{slots:s,selected:Math.max(0,Math.min(W-1,Math.trunc(r("selected",0)))),brushSizes:ar(t.brushSizes,t.brushSize),tool:tr(t.tool),strengths:nr(t.strengths,h),eraseMode:Li(t.eraseMode),visibleCount:za(r("visibleCount",Et)),maxParticles:typeof i=="number"&&Number.isFinite(i)&&i>=1?Math.trunc(i):null,theme:typeof t.theme=="string"?t.theme:"",worldRefs:sr(t),selectedWorld:ir(t.selectedWorld),autoCompact:Ot(t.autoCompact,pe.autoCompact),compactionPaused:Ot(t.compactionPaused,pe.compactionPaused),auditAfterSweep:Ot(t.auditAfterSweep,pe.auditAfterSweep),colorMode:hn(t.colorMode),worldIcon:Ie(t.worldIcon)}}function sr(n){const e=n.worldRefs;if(Array.isArray(e))return e.slice(0,q).map(a=>typeof a=="string"?a:null);const t=n.worlds;return Array.isArray(t)?t.slice(0,q).map(a=>typeof a=="string"&&a!==""?a:null):[]}function Ot(n,e){return typeof n=="boolean"?n:e}function ir(n){if(typeof n!="number"||!Number.isFinite(n))return O;const e=Math.trunc(n);return e<0?O:e<q?e:O}function rr(n=un()){if(n===null)return!1;try{return n.getItem(dn)!==null}catch{return!1}}function or(n=un(),e=pe){if(n===null)return e;try{const t=n.getItem(dn);return t===null?e:Ya(t)}catch{return e}}function sa(n,e=un()){if(e!==null)try{e.setItem(dn,JSON.stringify(n))}catch{}}const lr=1,cr=.15,$a=["theme","visibleCount","colorMode","brushSizes","tool","strengths","eraseMode","maxParticles","autoCompact","compactionPaused","auditAfterSweep"];function hr(n){const e=typeof n=="object"&&n!==null?n:{},t={...Rs,worldSize:cr},a=[],s=e.preferences;if(typeof s=="object"&&s!==null)for(const[c,u]of Object.entries(s)){if(!Ia(c))continue;const f=Qt(c,u);f===null?a.push(c):t[c]=f}a.length>0&&console.warn(`sandDefaults.json: ignoring unusable preferences: ${a.join(", ")}`);const r=e.session,i={};if(typeof r=="object"&&r!==null)for(const c of $a){const u=r[c];u!==void 0&&(i[c]=u)}const o={...pe};if(typeof r=="object"&&r!==null&&i.brushSizes===void 0){const c=r.brushSize;c!==void 0&&(delete o.brushSizes,i.brushSize=c)}const h=Ya(JSON.stringify({...o,...i}));return{preferences:Object.freeze(t),session:h}}function dr(n,e){const t={};for(const a of $a)t[a]=e[a];return JSON.stringify({version:lr,preferences:n,session:t},null,2)+`
`}const ur={brightness:2,physicsSteps:5,tonemapSoftness:2.5,motionBlurSamples:1,showFpsCounter:!0,physicsSliderOpen:!0,showPhysicsSlider:!0,bloomEnabled:!0,bloomThreshold:.2,bloomIntensity:.1,bloomRadius:1,drawSize:.01,drawPower:2.5,brushMode:0,drawAngle:0,wallsStrength:1,trailsStrength:1,fieldOpacity:.1,fieldAlwaysShow:!1,trailsAlwaysShow:!1,showReticle:!0,resetOnBehaviorChange:!0,oneClickSelection:!1,strongLogging:!1,worldSize:.15,canvasAspect:1,advancedProject:!1,advancedPreferences:!1,advancedDrawing:!1,mobileMode:0,calibrationVersion:0},fr={theme:"darkroom",visibleCount:30,colorMode:"behavior",tool:"brush",strengths:{brush:1,erase:1,shove:1,walls:1,trails:1,stamp:1},brushSizes:{brush:2,erase:2,shove:2,walls:2,trails:2},eraseMode:"walls+particles",maxParticles:null,autoCompact:!1,compactionPaused:!1,auditAfterSweep:!1},pr={preferences:ur,session:fr},ae=en/4,qa=en+32,ja=en+32;function Ka(n,e){const t=new ArrayBuffer(e);return new Uint8Array(t).set(new Uint8Array(Is(n)),0),{buffer:t,f32:new Float32Array(t),i32:new Int32Array(t)}}function Xa(n,e){n[ae+0]=e.from[0],n[ae+1]=e.from[1],n[ae+2]=e.to[0],n[ae+3]=e.to[1]}function mr(n,e,t,a,s){const{buffer:r,f32:i,i32:o}=Ka(n,qa);return Xa(i,e),o[ae+4]=Math.max(0,Math.trunc(t)),i[ae+5]=e.radius,o[ae+6]=Math.trunc(a),o[ae+7]=Math.trunc(s),r}function wr(n,e){const{buffer:t,f32:a}=Ka(n,ja);return Xa(a,e),a[ae+4]=e.radius,t}const Za=16;function gr(n,e){const t=new ArrayBuffer(Za),a=new Uint32Array(t);return a[0]=n===0?0:1,a[1]=Math.max(0,Math.trunc(e)),t}const vr=64,yr=256,br=256,_r=16384;function kt(n,e){return Math.max(0,Math.ceil(n/e))}const Er=`// ============================================================================
// spawn.wgsl -- the particle-creation brush.
//
// Runs ONCE PER RENDERED FRAME, never per physics sub-step. That is the same
// cadence \`strafe_draw\` paints at, and for the same reason: at the default
// physics rate a per-sub-step brush would deposit 30x the material and the
// Physics Rate slider would silently become a density slider. See
// ARCHITECTURE.md's brush section.
//
// ---------------------------------------------------------------------------
// HOW MANY, AND WHICH
// ---------------------------------------------------------------------------
// These are two different questions with two different answers, and conflating
// them is what makes this design want an atomic it does not need:
//
//   HOW MANY   the CPU decides. \`spawnCountFor()\` turns brush radius, rate and
//              dt into a count, and the dispatch is sized to cover it. One
//              invocation per particle to create, so the test below is a plain
//              bounds check -- no atomic, no contention.
//
//   WHICH      the free list decides, via one atomicSub per invocation. This is
//              the only place contention exists, and it is unavoidable: the
//              dead indices are scattered and only the pool knows where.
//
// The head moves MONOTONICALLY DOWN across this pass, which is what makes the
// reservation safe to act on. Nothing may return a slot while this runs -- see
// the header of freeList.wgsl.
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
// \`hash\` -- the project's own generator, so spawn scatter is drawn from the same
// family as every other random decision in the simulation. NOT \`rule.wgsl\`,
// which also holds an 80-call center generator this pass has no use for.
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
// THE STRUCT ONLY -- its operations name the binding below, so they follow it.
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

@group(0) @binding(0) var<storage, read_write> entities : array<Entity>;
@group(0) @binding(1) var<storage, read_write> freelist : FreeList;

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

// ---------------------------------------------------------------------------
// THE HIGHEST SLOT THIS PASS TOOK, plus one. The host reads it back and raises
// the mark to it.
//
// ## Why the host cannot compute this from the spawn count
//
// It used to try: \`noteSpawned(count)\` did \`mark = mark + count\`, which is
// correct only if the brush takes CONTIGUOUS indices starting at the mark.
// That holds in a fresh world -- \`initialFreeList\` fills descending, so the
// pool hands out 0, 1, 2, ... -- and it stops holding the moment the eraser
// runs. \`free_list_give\` pushes freed indices in whatever order the GPU retires
// them, so an erased pool is an arbitrary scatter and the next stroke takes
// high indices while the mark rises by a mere count.
//
// The symptom is live particles sitting ABOVE the mark: skipped by every pass,
// drawn by nothing, still occupying their slots. The audit names it exactly --
// "179 live particles sit at or above the mark (451076)" with the highest live
// index at 451,254.
//
// \`freeListSort.wgsl\` exists to slow this down and explicitly cannot prevent
// it: it is a budgeted PARTIAL sort that converges over many frames, and the
// host skips it entirely on any frame that spawned -- which is every frame of
// a drag, precisely when the scatter is being consumed.
//
// So the bound has to be measured rather than inferred. Only the GPU learns
// which slot the reservation handed out, so only the GPU can report it.
// ---------------------------------------------------------------------------
@group(0) @binding(3) var<storage, read_write> high_water : atomic<u32>;

struct SpawnUniforms {
    world : WorldData,
    // xy: stroke start (world)   zw: stroke end (world)
    //
    // A SEGMENT, NOT A POINT. Each frame paints from last frame's cursor to this
    // one, so a fast drag lays a continuous stream rather than one clump per
    // frame. This is the same fix \`strafe_draw\` makes with distance-to-segment;
    // the reference splats a single point per frame and visibly breaks into dots.
    stroke : vec4f,
    // x: spawn_count(i)   y: radius (world)   z: config_index(i)   w: frame(i)
    params : vec4f,
}
@group(0) @binding(2) var<uniform> u : SpawnUniforms;

fn spawn_count() -> u32 { return u32(max(0, bitcast<i32>(u.params.x))); }
fn brush_radius() -> f32 { return u.params.y; }
fn spawn_config() -> i32 { return bitcast<i32>(u.params.z); }
fn frame() -> f32 { return f32(bitcast<i32>(u.params.w)); }

// WORKGROUP SIZE 64, not the entity update's 256.
//
// This dispatch is sized to the SPAWN COUNT, which is typically a few hundred --
// at 256 a 100-particle brush would launch one workgroup with 156 invocations
// returning immediately. 64 wastes less on the small dispatches that are the
// common case here. \`SPAWN_WORKGROUP_SIZE\` in sandPasses.ts must match;
// sandShaders.test.ts asserts it.
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3u) {
    let i = gid.x;
    // The whole of "how many": everything past the CPU's count returns.
    if (i >= spawn_count()) { return; }

    // Reserve a dead index. Empty pool is NORMAL -- a full world with a brush
    // still down hits it every frame -- so this fails quietly rather than
    // clamping onto a live particle.
    let index = free_list_take();
    if (index == NO_SLOT) { return; }

    // --- where ------------------------------------------------------------
    // Three independent draws per particle, decorrelated by offsetting the hash
    // input rather than by chaining: \`hash\` is pcg-based, so nearby seeds give
    // unrelated outputs and there is no need to feed one result into the next.
    let seed = vec2f(f32(i), frame());
    let t = hash(seed);                       // where along the stroke
    let angle = hash(seed + 11.0) * 2.0 * PI; // direction within the disc
    // sqrt() IS LOAD-BEARING: sampling radius uniformly would pile two thirds of
    // the particles into the middle third of the disc, because area grows as r^2.
    // The sqrt makes the scatter uniform over the AREA, which is what "paint a
    // disc of material" means.
    let r = sqrt(hash(seed + 23.0)) * brush_radius();

    let center = mix(u.stroke.xy, u.stroke.zw, t);
    let pos = center + vec2f(cos(angle), sin(angle)) * r;

    // --- what -------------------------------------------------------------
    // Size matches \`reset()\` in entityUpdate.wgsl, including its 1/sqrt_world_size
    // scaling, so a painted particle is the same size as a studio-spawned one at
    // the same world size. Duplicated rather than shared because \`reset\` writes
    // the entity buffer itself and takes a ConfigData this pass has no reason to
    // read.
    let size = 0.0015 / world_sqrt_world_size(u.world);

    // Born at rest. A spawn velocity would be an arbitrary choice the brush has
    // no basis for, and the physics gives them motion on the very next step --
    // the sensors read the canvas regardless of how fast the particle is moving.
    entities[index] = make_entity_reset(pos, vec2f(0.0), size, spawn_config());

    // RECORD HOW FAR UP THE BUFFER THIS WENT -- see the binding's note.
    //
    // \`index + 1\` because the mark is an EXCLUSIVE bound: every pass covers
    // [0, mark), so a particle at \`index\` needs a mark of at least \`index + 1\`.
    // Recording the bare index would leave the topmost particle just outside the
    // bound, which is worse than being wildly wrong: one invisible particle
    // looks like nothing is wrong at all.
    //
    // AFTER the entity write, so any observer of this value is guaranteed the
    // particle it describes already exists.
    atomicMax(&high_water, index + 1u);
}
`,Sr=`// ============================================================================
// kill.wgsl -- the eraser.
//
// Every live particle inside the brush radius is marked dead and its index
// returned to the pool. Runs ONCE PER RENDERED FRAME, after the sub-steps, and
// in its own pass so that the free list's head moves monotonically UP while it
// runs -- see the header of freeList.wgsl for why that separation is what makes
// the atomic reservation safe rather than merely atomic.
//
// ---------------------------------------------------------------------------
// WHY THIS DISPATCHES OVER EVERY PARTICLE
// ---------------------------------------------------------------------------
// Unlike spawning, the CPU cannot know how many particles are in the brush --
// that is a property of where they have drifted to, which only the GPU knows.
// So the dispatch covers the whole buffer and each invocation tests its own
// particle. Dead particles return on the first branch, so an empty world costs
// one read each, exactly as in the entity update.
//
// This is the same shape \`entityPick\` uses to find the nearest particle, and it
// is why erasing is a once-per-frame act rather than a per-sub-step one.
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
// THE STRUCT ONLY -- its operations name the binding below, so they follow it.
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

@group(0) @binding(0) var<storage, read_write> entities : array<Entity>;
@group(0) @binding(1) var<storage, read_write> freelist : FreeList;

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

struct KillUniforms {
    world : WorldData,
    // xy: stroke start (world)   zw: stroke end (world). A SEGMENT, matching the
    // spawn brush, so a fast right-drag erases a continuous swathe rather than
    // leaving untouched gaps between frames.
    stroke : vec4f,
    // x: radius (world)   yzw: reserved
    params : vec4f,
}
@group(0) @binding(2) var<uniform> u : KillUniforms;

fn brush_radius() -> f32 { return u.params.x; }

// Distance from p to the segment ab -- the same measure \`strafe_draw\` erases
// with, so the eraser's reach matches the reticle exactly at any drag speed.
fn distance_to_segment(p: vec2f, a: vec2f, b: vec2f) -> f32 {
    let ab = b - a;
    let denom = dot(ab, ab);
    // A zero-length segment is a point, which is the common case: a click that
    // has not moved yet. Guarded rather than divided, because 0/0 is NaN and a
    // NaN distance compares false against every radius -- the eraser would
    // silently do nothing on a stationary click.
    if (denom <= 0.0) { return length(p - a); }
    let t = clamp(dot(p - a, ab) / denom, 0.0, 1.0);
    return length(p - (a + ab * t));
}

// WORKGROUP SIZE 256 -- matches the entity update, because this dispatches over
// the same buffer at the same scale. \`KILL_WORKGROUP_SIZE\` in sandPasses.ts must
// match; sandShaders.test.ts asserts it.
@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid: vec3u) {
    let index = gid.x;
    if (index >= arrayLength(&entities)) { return; }

    let e = entities[index];
    // Already dead: nothing to erase, and pushing its index again would be a
    // DOUBLE FREE -- the same slot handed to two future brushes. This branch is
    // the only thing preventing that, since the eraser is dragged over the same
    // ground repeatedly by nature.
    if (e_is_dead(e)) { return; }

    if (distance_to_segment(e_pos(e), u.stroke.xy, u.stroke.zw) > brush_radius()) {
        return;
    }

    // Push BEFORE zeroing, matching the BC_KILL branch in entityUpdate: a reader
    // racing this sees either a live particle or a dead one, never a live index
    // sitting on the free list.
    free_list_give(index);
    entities[index] = make_entity_dead();
}
`,Tr=`// ============================================================================
// freeListSort.wgsl -- keeping the dead-index pool ordered, a little per frame.
//
// TIER 1 COMPACTION. This pass moves NO PARTICLES and changes no particle's
// liveness. It only permutes the free list so that the LOWEST available index
// sits on top of the stack and is handed out next.
//
// ---------------------------------------------------------------------------
// WHY ORDERING THE POOL IS WORTH A PASS
// ---------------------------------------------------------------------------
// The high-water mark is an upper bound on the highest live index, and it only
// creeps up when a brush is handed a HIGH index while low ones are free. A fresh
// pool hands out 0, 1, 2, ... in order (\`initialFreeList\` fills descending), but
// the ERASER destroys that: \`free_list_give\` pushes freed indices in whatever
// order the GPU retires them, so after a few erase strokes the top of the stack
// is an arbitrary scatter. Paint again and the live particles spread across the
// whole range -- and the mark can never come down.
//
// Sorting the pool is the cheap half of the fix. It does not compact anything
// that has already scattered (that is Tier 2, which moves entities), but it
// stops the scatter from happening in the first place.
//
// ---------------------------------------------------------------------------
// THE HEAD IS READ, NEVER MOVED -- THIS IS THE WHOLE SAFETY ARGUMENT
// ---------------------------------------------------------------------------
// \`freeList.wgsl\` builds everything on the head moving MONOTONICALLY within a
// pass: creation only decreases it, deletion only increases it, and mixing the
// two in one pass could hand the same slot to two particles.
//
// This pass sidesteps that invariant rather than joining it. It calls neither
// \`free_list_take\` nor \`free_list_give\`, does not touch \`head\` at all, and only
// permutes \`slots[0 .. head)\`. A permutation of the available region hands out
// exactly the same set of indices in a different ORDER, so it cannot create or
// destroy a slot no matter how it interleaves.
//
// It is still NOT safe to run alongside the spawn pass: spawn pops
// \`slots[head-1]\` while this is rewriting that entry, so a particle could be
// created at an index this pass simultaneously moves elsewhere -- a genuine
// double-alloc. The host is what prevents this, by skipping the pass entirely on
// any frame that recorded a spawn. See \`sortFreeList\` in sandPasses.ts.
//
// Kill IS safe to overlap: it only appends at \`slots[head]\` and upward, which is
// outside the region this touches.
//
// ---------------------------------------------------------------------------
// ODD-EVEN TRANSPOSITION, AND WHY A PARTIAL RUN IS STILL CORRECT
// ---------------------------------------------------------------------------
// One phase compares disjoint neighbouring pairs and swaps those out of order.
// Every pair is independent, so there is no cross-invocation coordination, no
// shared memory, and no barrier -- which is what lets this dispatch over a
// bounded WINDOW of the pool rather than all of it.
//
// A full sort needs O(n) phases. THIS PASS NEVER RUNS THEM ALL. It does one
// phase per frame over a budgeted window, and that is fine, because a phase that
// is interrupted or never followed up leaves a valid pool that is merely LESS
// SORTED than it could be. There is no half-finished state to clean up: the
// pool is a permutation after every single swap. Ordering improves over frames
// and the cost per frame is flat.
//
// DESCENDING, because the stack pops from the top. Sorting descending puts the
// smallest index at \`slots[head-1]\`, which is the one taken next. This is the
// same direction \`freeListAfterMigration\` writes for the same reason.
// ============================================================================

// THE STRUCT ONLY -- its operations name the binding below, so they follow it.
// This pass calls none of them, but the include is what defines \`FreeList\`.
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

@group(0) @binding(0) var<storage, read_write> freelist : FreeList;

struct SortUniforms {
    // x: phase parity (0 = compare pairs starting at even indices, 1 = odd)
    // y: window length in slots -- how much of the pool this dispatch covers
    // zw: reserved
    params : vec4u,
}
@group(0) @binding(1) var<uniform> u : SortUniforms;

fn parity() -> u32 { return u.params.x; }
fn window_len() -> u32 { return u.params.y; }

// WORKGROUP SIZE 256, matching the kill pass: this dispatches over a region of
// the pool at entity scale rather than at brush scale. \`SORT_WORKGROUP_SIZE\` in
// sandDispatch.ts must match; sandShaders.test.ts asserts it.
@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid: vec3u) {
    // One invocation per PAIR, so the slot index is doubled. The parity offset
    // is what alternates which pairs are compared between frames -- without it
    // the same disjoint pairs would be compared forever and elements could never
    // migrate past their neighbour.
    let a = gid.x * 2u + parity();
    let b = a + 1u;

    // The window bounds the work. Reading \`head\` here rather than trusting the
    // host's stale copy is deliberate: the host's is a frame or two old, and a
    // window computed from it could reach past the real head into slots that are
    // LIVE indices. Those must never be reordered -- see the test in
    // compaction.test.ts about residue above the head.
    let head = atomicLoad(&freelist.head);
    let limit = min(window_len(), head);
    if (b >= limit) { return; }

    // A plain read-compare-write, with no atomics. Safe because the pairs a
    // single dispatch compares are DISJOINT -- invocation i touches only slots
    // 2i and 2i+1 -- so no two invocations in this pass address the same slot.
    let x = freelist.slots[a];
    let y = freelist.slots[b];
    // Descending: the larger index belongs lower in the stack, so the smaller
    // one floats toward the top and pops first.
    if (x < y) {
        freelist.slots[a] = y;
        freelist.slots[b] = x;
    }
}
`;class Be{device;system;spawnPipeline=null;killPipeline=null;sortPipeline=null;spawnGroup=null;killGroup=null;sortGroup=null;spawnUniforms;killUniforms;sortUniforms;highWater;highWaterStaging;highWaterPhase="idle";pendingHighWater=null;sortParity=0;constructor(e,t){this.device=e,this.system=t,this.spawnUniforms=e.createBuffer({label:"spawn-uniforms",size:qa,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.killUniforms=e.createBuffer({label:"kill-uniforms",size:ja,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.sortUniforms=e.createBuffer({label:"freelist-sort-uniforms",size:Za,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.highWater=e.createBuffer({label:"spawn-high-water",size:4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),this.highWaterStaging=e.createBuffer({label:"spawn-high-water-staging",size:4,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ})}static async create(e,t){const a=new Be(e,t);return await a.reload(),a}async reload(){const e=this.device,t=e.createBindGroupLayout({label:"sand-brush",entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:2,visibility:GPUShaderStage.COMPUTE,buffer:{type:"uniform"}}]}),a=e.createPipelineLayout({bindGroupLayouts:[t]}),s=e.createBindGroupLayout({label:"sand-spawn",entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:2,visibility:GPUShaderStage.COMPUTE,buffer:{type:"uniform"}},{binding:3,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}}]}),r=e.createPipelineLayout({bindGroupLayouts:[s]}),i=e.createBindGroupLayout({label:"freelist-sort",entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:"uniform"}}]}),o=e.createPipelineLayout({bindGroupLayouts:[i]}),[h,c,u]=await Promise.all([$(e,"spawn",Er),$(e,"kill",Sr),$(e,"freeListSort",Tr)]),f=this.system.entityBufferForSand(),m=this.system.freeListBufferForSand();h!==null&&(this.spawnPipeline=e.createComputePipeline({label:"spawn",layout:r,compute:{module:h,entryPoint:"main"}}),this.spawnGroup=e.createBindGroup({label:"spawn",layout:s,entries:[{binding:0,resource:{buffer:f}},{binding:1,resource:{buffer:m}},{binding:2,resource:{buffer:this.spawnUniforms}},{binding:3,resource:{buffer:this.highWater}}]})),c!==null&&(this.killPipeline=e.createComputePipeline({label:"kill",layout:a,compute:{module:c,entryPoint:"main"}}),this.killGroup=e.createBindGroup({label:"kill",layout:t,entries:[{binding:0,resource:{buffer:f}},{binding:1,resource:{buffer:m}},{binding:2,resource:{buffer:this.killUniforms}}]})),u!==null&&(this.sortPipeline=e.createComputePipeline({label:"freelist-sort",layout:o,compute:{module:u,entryPoint:"main"}}),this.sortGroup=e.createBindGroup({label:"freelist-sort",layout:i,entries:[{binding:0,resource:{buffer:m}},{binding:1,resource:{buffer:this.sortUniforms}}]}))}spawn(e,t,a,s,r,i){if(this.spawnPipeline===null||this.spawnGroup===null||s<=0)return;this.device.queue.writeBuffer(this.spawnUniforms,0,mr(t,a,s,r,i)),this.device.queue.writeBuffer(this.highWater,0,new Uint32Array([0]));const o=e.beginComputePass({label:"spawn"});o.setPipeline(this.spawnPipeline),o.setBindGroup(0,this.spawnGroup),o.dispatchWorkgroups(kt(s,vr)),o.end(),this.highWaterPhase==="idle"&&(e.copyBufferToBuffer(this.highWater,0,this.highWaterStaging,0,4),this.highWaterPhase="recorded")}pollHighWater(){this.highWaterPhase==="recorded"&&(this.highWaterPhase="mapping",this.highWaterStaging.mapAsync(GPUMapMode.READ).then(()=>{const e=new Uint32Array(this.highWaterStaging.getMappedRange().slice(0));this.highWaterStaging.unmap(),this.pendingHighWater=e[0]??null,this.highWaterPhase="idle"},()=>{this.highWaterPhase="idle"}))}takeHighWater(){const e=this.pendingHighWater;return this.pendingHighWater=null,e}kill(e,t,a){if(this.killPipeline===null||this.killGroup===null||a.radius<=0)return;this.device.queue.writeBuffer(this.killUniforms,0,wr(t,a));const s=e.beginComputePass({label:"kill"});s.setPipeline(this.killPipeline),s.setBindGroup(0,this.killGroup),s.dispatchWorkgroups(kt(this.system.entityCount,yr)),s.end()}sortFreeList(e,t){if(this.sortPipeline===null||this.sortGroup===null||t||this.system.entityCount<=1)return;const a=Math.min(_r,this.system.entityCount);this.device.queue.writeBuffer(this.sortUniforms,0,gr(this.sortParity,a)),this.sortParity=this.sortParity===0?1:0;const s=e.beginComputePass({label:"freelist-sort"});s.setPipeline(this.sortPipeline),s.setBindGroup(0,this.sortGroup),s.dispatchWorkgroups(kt(a/2,br)),s.end()}destroy(){this.spawnUniforms.destroy(),this.killUniforms.destroy(),this.sortUniforms.destroy(),this.highWater.destroy(),this.highWaterPhase="mapping",this.highWaterStaging.destroy()}}const fn=256,xr=fn;function ve(n){return n<=0?0:Math.ceil(n/xr)}const Ja=fn*2;function ye(n){const e=[];let t=n;for(;t>1;)e.push(t),t=Math.ceil(t/Ja);return e}function Qa(n){const t=ye(ve(n)).reduce((a,s)=>a+s,0);return Math.max(1,t+1)}function es(n){return ye(ve(n)).reduce((t,a)=>t+a,0)}function ts(n){const e=ye(ve(n)),t=[];let a=0;for(const s of e)t.push(a),a+=s;return t}function lt(n){return Math.max(0,Math.ceil(n/fn))}function ns(n){return Math.max(0,Math.ceil(n/Ja))}function Ar(n,e,t=Ir,a=Rr){return e<t||e<=0?!1:n/e<a}const Rr=.7,Ir=65536,Lr=2e3;function Nr(n){return!n.enabled||!n.idle||!Ar(n.live,n.mark)?!1:n.now-n.lastCompactedAt>=(n.cooldownMs??Lr)}const Cr=`// ============================================================================
// compactCount.wgsl -- pass 1 of 4. How many live entities per workgroup.
//
// Each workgroup tallies its own 256 entities and writes one number. The SCAN
// pass turns those tallies into running offsets, and the SCATTER pass uses an
// offset plus a within-group rank to place each live entity at a unique
// destination.
//
// ---------------------------------------------------------------------------
// WHY A PREFIX SUM AND NOT THE PROBE-AND-CLAIM THIS REPLACES
// ---------------------------------------------------------------------------
// The previous compaction found destinations by probing for dead slots with an
// atomic cursor. It worked, in the sense that particles ended up somewhere -- but
// it consumed free-list slots without ever telling the free list, so every
// relocation leaked one slot. At 158k live particles the audit found 69,184 dead
// indices missing from the pool, which surfaced as particles that could not be
// erased and a mark that would not come down.
//
// That was not a bug in the probing; it was a bug in the DESIGN. The pool had
// two writers -- GPU passes pushing and popping, and a host periodically
// overwriting it from a stale snapshot -- and no way for either to know what the
// other had done.
//
// A prefix sum removes the need to know. The destination of every entity is a
// pure function of how many live entities precede it, so the scatter assigns
// each index exactly once with no shared mutable state, no probing, and no
// coordination. The free list is then whatever is left over, which is exact by
// construction rather than by argument.
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

@group(0) @binding(0) var<storage, read>       entities : array<Entity>;
// One u32 per workgroup. Sized by \`partialCount()\` host-side.
@group(0) @binding(1) var<storage, read_write> partials : array<u32>;

struct CompactUniforms {
    // x: entity count   yzw: reserved
    params : vec4u,
}
@group(0) @binding(2) var<uniform> u : CompactUniforms;

fn entity_count() -> u32 { return u.params.x; }

// Scratch for the reduction. 256 u32 -- one per invocation.
var<workgroup> tally : array<u32, 256>;

// WORKGROUP SIZE 256. \`COMPACT_WORKGROUP_SIZE\` in compactPlan.ts must match,
// and so must the scatter pass: the scatter reads the offset THIS workgroup
// produced, so a different partition would send it to the wrong partial and
// pack particles on top of each other. compactShaders.test.ts asserts all three.
@compute @workgroup_size(256)
fn main(
    @builtin(global_invocation_id) gid : vec3u,
    @builtin(local_invocation_id)  lid : vec3u,
    @builtin(workgroup_id)         wid : vec3u,
) {
    let index = gid.x;
    let local = lid.x;

    // Out-of-range invocations contribute zero rather than returning: every
    // invocation must reach the barriers below, and a \`return\` before a
    // \`workgroupBarrier\` is undefined behaviour in WGSL. The last workgroup of
    // a ragged buffer is exactly this case, so it is not a corner.
    var live = 0u;
    if (index < entity_count() && !e_is_dead(entities[index])) {
        live = 1u;
    }
    tally[local] = live;

    // Standard halving reduction. Every invocation executes every iteration and
    // every barrier; only the WRITE is conditional, which is what keeps the
    // barriers uniformly reached.
    for (var stride = 128u; stride > 0u; stride >>= 1u) {
        workgroupBarrier();
        if (local < stride) {
            tally[local] = tally[local] + tally[local + stride];
        }
    }
    workgroupBarrier();

    if (local == 0u) {
        partials[wid.x] = tally[0];
    }
}
`,as=`// ============================================================================
// compactScan.wgsl -- pass 2 of 4. Exclusive prefix sum over the partials.
//
// Turns "how many live entities each workgroup holds" into "how many live
// entities come BEFORE each workgroup", which is the destination offset the
// scatter pass needs.
//
// ---------------------------------------------------------------------------
// RUN ONCE PER LEVEL, NOT ONCE
// ---------------------------------------------------------------------------
// One workgroup scans 512 elements. A 6M entity cap produces 23,438 partials,
// so a single dispatch cannot see them all -- it would scan the first 512 and
// every particle beyond that would be scattered to an offset computed from a
// truncated total, piling them on top of each other. Silently: no error, just
// most of a large world disappearing the first time it is compacted.
//
// So the host dispatches this repeatedly, each level scanning the previous
// level's per-group totals, until one group covers what remains. \`scanLevels()\`
// in compactPlan.ts computes how many, and its tests pin the 6M case
// specifically because that is the configuration the arithmetic was wrong for.
//
// Each dispatch does two things:
//   * writes the exclusive prefix sum of its slice back over that slice
//   * writes its slice's TOTAL to the next level's buffer
//
// A later ADD pass folds the higher level's offsets back down. That is
// \`compactScanAdd\` below -- the same shader with a different entry point, so
// the two cannot disagree about layout.
// ============================================================================

struct ScanUniforms {
    // x: element count at this level
    // y: offset (in u32s) of this level's slice within the scratch buffer
    // z: offset of the NEXT level's slice, where group totals go
    // w: 1 when this is the last level (no next slice to write)
    params : vec4u,
}
@group(0) @binding(0) var<storage, read_write> scratch : array<u32>;
@group(0) @binding(1) var<uniform> u : ScanUniforms;

fn count()       -> u32 { return u.params.x; }
fn base()        -> u32 { return u.params.y; }
fn next_base()   -> u32 { return u.params.z; }
fn is_last()     -> bool { return u.params.w != 0u; }

// 512 = 256 threads x 2 elements. \`SCAN_ELEMENTS_PER_GROUP\` must match.
var<workgroup> temp : array<u32, 512>;

// Blelloch exclusive scan over 512 elements.
//
// EVERY INVOCATION REACHES EVERY BARRIER. The conditional work is inside the
// \`if\`, never around the barrier -- a barrier that only some invocations reach
// is undefined behaviour, and on a ragged final group that is the normal case
// rather than a corner.
@compute @workgroup_size(256)
fn main(
    @builtin(local_invocation_id) lid : vec3u,
    @builtin(workgroup_id)        wid : vec3u,
) {
    let local = lid.x;
    let group = wid.x;
    let start = group * 512u;

    // Load two elements each, zero-padding past the end so the scan is exact
    // for a ragged tail rather than summing whatever was in scratch.
    let i0 = start + local * 2u;
    let i1 = i0 + 1u;
    temp[local * 2u]      = select(0u, scratch[base() + i0], i0 < count());
    temp[local * 2u + 1u] = select(0u, scratch[base() + i1], i1 < count());

    // --- up-sweep: build the sum tree in place -----------------------------
    var offset = 1u;
    for (var d = 256u; d > 0u; d >>= 1u) {
        workgroupBarrier();
        if (local < d) {
            let ai = offset * (2u * local + 1u) - 1u;
            let bi = offset * (2u * local + 2u) - 1u;
            temp[bi] = temp[bi] + temp[ai];
        }
        offset = offset * 2u;
    }

    // The total for this group, saved before the root is cleared.
    workgroupBarrier();
    let total = temp[511];

    // --- down-sweep: turn the sum tree into an exclusive scan --------------
    if (local == 0u) { temp[511] = 0u; }
    for (var d = 1u; d < 512u; d = d * 2u) {
        offset = offset >> 1u;
        workgroupBarrier();
        if (local < d) {
            let ai = offset * (2u * local + 1u) - 1u;
            let bi = offset * (2u * local + 2u) - 1u;
            let t = temp[ai];
            temp[ai] = temp[bi];
            temp[bi] = temp[bi] + t;
        }
    }
    workgroupBarrier();

    // Write the scanned slice back. Out-of-range lanes are dropped rather than
    // clamped: writing them would corrupt the next level's slice, which lives
    // immediately after this one in the same buffer.
    if (i0 < count()) { scratch[base() + i0] = temp[local * 2u]; }
    if (i1 < count()) { scratch[base() + i1] = temp[local * 2u + 1u]; }

    // This group's total feeds the next level.
    //
    // THE LAST LEVEL WRITES THE GRAND TOTAL TO ITS OWN DEDICATED SLOT. An
    // exclusive scan DISCARDS the total -- the last element's output is the sum
    // of everything before it, not including itself -- so without this the live
    // count would simply not exist anywhere, and the scatter and finalize
    // passes both need it. \`total\` was saved before the down-sweep cleared the
    // root, which is the only moment it is available.
    //
    // The slot is \`next_base()\` on the last level, which the host points at a
    // reserved word past every level's slice. See \`scanScratchSlots\`, whose
    // "+1" is exactly this word.
    if (local == 0u) {
        if (is_last()) {
            scratch[next_base()] = total;
        } else {
            scratch[next_base() + group] = total;
        }
    }
}

// ---------------------------------------------------------------------------
// The fold-down. Adds a level's scanned group offsets back into the level
// below it, completing the multi-level scan.
//
// Dispatched over the LOWER level's elements, one invocation each. Separate
// entry point rather than a separate file so the two cannot drift about which
// slice is which.
// ---------------------------------------------------------------------------
@compute @workgroup_size(256)
fn add_offsets(@builtin(global_invocation_id) gid : vec3u) {
    let i = gid.x;
    if (i >= count()) { return; }
    // Which group of 512 this element fell into -- the same partition the scan
    // used, so the offset it adds is the one computed for exactly this slice.
    let group = i / 512u;
    scratch[base() + i] = scratch[base() + i] + scratch[next_base() + group];
}
`,Or=`// ============================================================================
// compactScatter.wgsl -- pass 3 of 4. The permutation.
//
// Every live entity is written to its packed destination; every index that ends
// up unused is written to the free list. One invocation per source index, each
// writing exactly one place.
//
// ---------------------------------------------------------------------------
// THIS IS WHERE THE OLD DESIGN'S BUG BECAME IMPOSSIBLE
// ---------------------------------------------------------------------------
// The previous compaction claimed destinations from an atomic cursor and never
// told the free list, leaking one slot per relocation -- 69,184 of them in the
// audit that finally caught it.
//
// Here the free list is not PATCHED, it is WRITTEN FROM SCRATCH. Index i below
// \`live_count\` receives a live entity; index i at or above it is free and is
// written into the pool at a position derived the same way. Every index is
// assigned exactly once, so:
//
//   * no live index can be in the pool -- the pool only receives indices at or
//     above live_count, and every entity there is dead by construction;
//   * no index can appear twice -- each invocation writes one slot at one
//     position computed from its own rank;
//   * nothing can leak -- the two ranges partition [0, entity_count).
//
// Those are the audit's first three invariants, and they hold by CONSTRUCTION
// rather than by argument. The fourth (nothing live at or above the mark) is
// definitional once the output is packed.
//
// ---------------------------------------------------------------------------
// WHY THE DESTINATION IS A SEPARATE BUFFER
// ---------------------------------------------------------------------------
// Writing in place races: an entity moving from 500 to 12 collides with another
// invocation reading 12 as its source, and dispatches have no internal
// ordering. The host copies \`dst\` back over the entity buffer afterwards, which
// keeps the entity buffer OBJECT stable so every bind group in the program
// stays valid. See the long note in compactPlan.ts.
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

@group(0) @binding(0) var<storage, read>       src      : array<Entity>;
@group(0) @binding(1) var<storage, read_write> dst      : array<Entity>;
@group(0) @binding(2) var<storage, read_write> freelist : FreeList;
// The scanned partials: element w is the number of live entities in workgroups
// before w.
@group(0) @binding(3) var<storage, read>       offsets  : array<u32>;

struct ScatterUniforms {
    // x: entity count
    // y: index in \`offsets\` holding the GRAND TOTAL of live entities
    // zw: reserved
    params : vec4u,
}
@group(0) @binding(4) var<uniform> u : ScatterUniforms;

fn entity_count() -> u32 { return u.params.x; }

// THE LIVE COUNT IS READ FROM THE SCAN, NOT PASSED IN.
//
// The host does not know it and must not guess: every past attempt to have the
// host infer a live count -- from a boundary, a stale head, a spawn tally --
// produced a number that disagreed with the buffer, and those disagreements are
// this subsystem's entire bug history. The scan computed it on this same
// submission, so reading it here is exact by construction.
fn live_count() -> u32 { return min(offsets[u.params.y], entity_count()); }

// Rank of this invocation's entity among the live ones in its own workgroup.
// Computed by the same halving pattern the count pass uses, so the two agree
// about what a workgroup contains.
var<workgroup> flags : array<u32, 256>;

@compute @workgroup_size(256)
fn main(
    @builtin(global_invocation_id) gid : vec3u,
    @builtin(local_invocation_id)  lid : vec3u,
    @builtin(workgroup_id)         wid : vec3u,
) {
    let index = gid.x;
    let local = lid.x;

    // Liveness, with out-of-range treated as dead. Every invocation must reach
    // the barriers below, so this is a value rather than an early return.
    var live = 0u;
    if (index < entity_count() && !e_is_dead(src[index])) {
        live = 1u;
    }
    flags[local] = live;
    workgroupBarrier();

    // Exclusive prefix sum within the workgroup, by the simplest correct means:
    // each invocation sums the flags before it. 256 reads per invocation is
    // more work than a tree scan, but it is obviously right, and this pass is
    // dominated by the 32-byte entity copy below rather than by this loop.
    var rank = 0u;
    for (var i = 0u; i < local; i++) {
        rank = rank + flags[i];
    }
    // How many live entities precede this whole workgroup.
    let group_offset = offsets[wid.x];

    if (index >= entity_count()) { return; }

    // EVERY INVOCATION WRITES ITS OWN SLOT IN \`dst\`, live or dead.
    //
    // THE TAIL IS NOT IMPLICITLY DEAD. \`dst\` is a scratch buffer, and an
    // unwritten entity is 32 zero bytes -- which is not a dead particle, it is
    // a LIVE one on config 0. \`deadEntityBytes\` documents this trap at length:
    // "a naively zeroed buffer is a buffer full of LIVE particles stacked at
    // the origin".
    //
    // The first version of this pass wrote only the live destinations and left
    // the rest untouched. The audit was unambiguous: live 6,000,000 of
    // 6,000,000, with the entire tail above the mark reading as alive and
    // sitting in the free list at the same time. The scan and the mark were
    // both correct; only the tail was garbage.
    //
    // THE TWO WRITES NEVER TARGET THE SAME SLOT, which is what makes this safe
    // without any ordering between invocations. A live entity always lands
    // BELOW \`live_count()\` (its rank among the live is less than their total),
    // and the tail clear only touches indices at or above it. The ranges
    // partition the buffer, so no slot is written twice and none is left out.
    //
    // Ordering between invocations would be unavailable anyway: a dispatch has
    // none internally, so a design where two invocations raced for one slot
    // could not be fixed by reordering the lines here.
    if (index >= live_count()) {
        dst[index] = make_entity_dead();
    }

    if (live == 1u) {
        // A LIVE ENTITY lands at its global rank, which is unique: no two
        // invocations share both a workgroup offset and a within-group rank.
        dst[group_offset + rank] = src[index];
    }

    // --- the free list ----------------------------------------------------
    //
    // THE POOL DESCRIBES THE BUFFER AFTER COMPACTION, NOT BEFORE IT.
    //
    // This pass first pushed the dead SOURCE indices -- the slots that were
    // empty before the packing. That is the wrong set, and the audit said so
    // precisely: the counts were right (live + pool = capacity) but 43,202
    // indices were in the wrong half. Index 4 was dead beforehand and so got
    // listed as free, while a relocated particle had just been written into it.
    //
    // Once the live entities are packed into [0, live_count), the free set is
    // simply everything above them. It does not depend on where the holes used
    // to be, so no dead ranking is needed at all -- each invocation at or above
    // the live count contributes exactly itself.
    //
    // This is the same range the invocation clears as tail above, which is not
    // a coincidence: a slot is free precisely because nothing was packed into
    // it, so the entity write and the pool entry describe one fact.
    if (index >= live_count()) {
        // DESCENDING, so the LOWEST free index sits on top of the stack and is
        // handed out first. \`freeList.ts\` is emphatic about this: the stack
        // pops slots[head-1], and allocating upward from the bottom is what
        // keeps the high-water mark from creeping. An ascending fill would
        // quietly undo that and the mark would climb again on the next stroke.
        //
        // Position: index \`live_count\` is the lowest free one and must land at
        // the TOP of the stack (slots[free_total - 1]), so the offset from the
        // bottom of the free range is inverted.
        let free_total = entity_count() - live_count();
        let free_rank = index - live_count();
        freelist.slots[free_total - 1u - free_rank] = index;
    }
}
`,kr=`// ============================================================================
// compactFinalize.wgsl -- pass 4 of 4. Publish the head and the mark.
//
// One invocation. It reads the grand total the scan produced and writes the two
// numbers that describe the compacted world:
//
//   * the free-list HEAD -- how many slots the scatter placed in the pool
//   * the MARK -- how far every pass must sweep, which for a packed buffer is
//     exactly the live count
//
// ---------------------------------------------------------------------------
// WHY THE MARK IS WRITTEN HERE AND READ BACK, RATHER THAN COMPUTED HOST-SIDE
// ---------------------------------------------------------------------------
// The host cannot know the live count without asking the GPU, and every past
// attempt to have it INFER one -- from a boundary, from a stale head, from a
// spawn tally -- produced a number that disagreed with the buffer. Those
// disagreements are the entire bug history of this subsystem.
//
// So the GPU states it. The host reads it back asynchronously, a frame or two
// late, and uses it only to size dispatches. That lag is harmless in one
// direction and dangerous in the other, which is a rule the host enforces and
// this shader cannot: a stale mark that is too HIGH costs wasted invocations,
// while one that is too LOW hides live particles. See \`noteCompactedMark\` in
// particleSystem.ts for the guard.
//
// ---------------------------------------------------------------------------
// SEPARATE FROM THE SCATTER, AND THAT IS NOT OPTIONAL
// ---------------------------------------------------------------------------
// The head must not change while the scatter is still writing slots, or a
// spawn racing the tail of the compaction could pop an index the scatter has
// not written yet. Passes within a submission are ordered and barriered by
// WebGPU; dispatches inside one pass are not. This is the same reasoning
// \`entityPick\` gives for splitting its reduce and derive.
// ============================================================================

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

@group(0) @binding(0) var<storage, read_write> freelist : FreeList;
@group(0) @binding(1) var<storage, read>       scratch  : array<u32>;
// Two u32: the mark, and a generation counter the host uses to tell a fresh
// readback from a stale one.
@group(0) @binding(2) var<storage, read_write> result   : array<u32>;

struct FinalizeUniforms {
    // x: entity count
    // y: index in \`scratch\` holding the grand total of live entities
    // z: generation to stamp, so a readback can be matched to its compaction
    // w: reserved
    params : vec4u,
}
@group(0) @binding(3) var<uniform> u : FinalizeUniforms;

@compute @workgroup_size(1)
fn main() {
    let entity_count = u.params.x;
    let live = min(scratch[u.params.y], entity_count);

    // The pool holds every index the scatter did not give to a live entity.
    atomicStore(&freelist.head, entity_count - live);

    // THE MARK IS THE LIVE COUNT, exactly. The scatter packed the live entities
    // into [0, live), so nothing at or above it is alive -- the bound is not an
    // estimate here, which is the whole point of doing this on the GPU.
    result[0] = live;
    result[1] = u.params.z;
}
`,Pr=16,Pt=2;class ze{device;system;countPipeline=null;scanPipeline=null;addPipeline=null;scatterPipeline=null;finalizePipeline=null;countGroup=null;scatterGroup=null;finalizeGroup=null;scanGroupsPerLevel=[];addGroupsPerLevel=[];scratchEntities;scanScratch;result;resultStaging;countUniforms;scatterUniforms;finalizeUniforms;scanUniforms=[];readbackPhase="idle";generation=0;appliedGeneration=-1;pendingMark=null;constructor(e,t){this.device=e,this.system=t;const a=t.entityCount;this.scratchEntities=e.createBuffer({label:"compact-scratch-entities",size:Math.max(Q,a*Q),usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC}),this.scanScratch=e.createBuffer({label:"compact-scan-scratch",size:Qa(a)*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),this.result=e.createBuffer({label:"compact-result",size:Pt*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),this.resultStaging=e.createBuffer({label:"compact-result-staging",size:Pt*4,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});const s=r=>e.createBuffer({label:r,size:Pr,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});this.countUniforms=s("compact-count-uniforms"),this.scatterUniforms=s("compact-scatter-uniforms"),this.finalizeUniforms=s("compact-finalize-uniforms");for(let r=0;r<ye(ve(a)).length;r++)this.scanUniforms.push(s(`compact-scan-uniforms-${r}`))}static async create(e,t){const a=new ze(e,t);return await a.reload(),a}get ready(){return this.countPipeline!==null&&this.scanPipeline!==null&&this.addPipeline!==null&&this.scatterPipeline!==null&&this.finalizePipeline!==null}async reload(){const e=this.device,t=y=>({binding:y,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}}),a=y=>({binding:y,visibility:GPUShaderStage.COMPUTE,buffer:{type:"read-only-storage"}}),s=y=>({binding:y,visibility:GPUShaderStage.COMPUTE,buffer:{type:"uniform"}}),r=e.createBindGroupLayout({label:"compact-count",entries:[a(0),t(1),s(2)]}),i=e.createBindGroupLayout({label:"compact-scan",entries:[t(0),s(1)]}),o=e.createBindGroupLayout({label:"compact-scatter",entries:[a(0),t(1),t(2),a(3),s(4)]}),h=e.createBindGroupLayout({label:"compact-finalize",entries:[t(0),a(1),t(2),s(3)]}),[c,u,f,m]=await Promise.all([$(e,"compactCount",Cr),$(e,"compactScan",as),$(e,"compactScatter",Or),$(e,"compactFinalize",kr)]),g=this.system.entityBufferForSand(),w=this.system.freeListBufferForSand();if(c!==null&&(this.countPipeline=e.createComputePipeline({label:"compact-count",layout:e.createPipelineLayout({bindGroupLayouts:[r]}),compute:{module:c,entryPoint:"main"}}),this.countGroup=e.createBindGroup({label:"compact-count",layout:r,entries:[{binding:0,resource:{buffer:g}},{binding:1,resource:{buffer:this.scanScratch}},{binding:2,resource:{buffer:this.countUniforms}}]})),u!==null){const y=e.createPipelineLayout({bindGroupLayouts:[i]});this.scanPipeline=e.createComputePipeline({label:"compact-scan",layout:y,compute:{module:u,entryPoint:"main"}}),this.addPipeline=e.createComputePipeline({label:"compact-scan-add",layout:y,compute:{module:u,entryPoint:"add_offsets"}}),this.scanGroupsPerLevel=this.scanUniforms.map((E,b)=>e.createBindGroup({label:`compact-scan-${b}`,layout:i,entries:[{binding:0,resource:{buffer:this.scanScratch}},{binding:1,resource:{buffer:E}}]})),this.addGroupsPerLevel=this.scanGroupsPerLevel}f!==null&&(this.scatterPipeline=e.createComputePipeline({label:"compact-scatter",layout:e.createPipelineLayout({bindGroupLayouts:[o]}),compute:{module:f,entryPoint:"main"}}),this.scatterGroup=e.createBindGroup({label:"compact-scatter",layout:o,entries:[{binding:0,resource:{buffer:g}},{binding:1,resource:{buffer:this.scratchEntities}},{binding:2,resource:{buffer:w}},{binding:3,resource:{buffer:this.scanScratch}},{binding:4,resource:{buffer:this.scatterUniforms}}]})),m!==null&&(this.finalizePipeline=e.createComputePipeline({label:"compact-finalize",layout:e.createPipelineLayout({bindGroupLayouts:[h]}),compute:{module:m,entryPoint:"main"}}),this.finalizeGroup=e.createBindGroup({label:"compact-finalize",layout:h,entries:[{binding:0,resource:{buffer:w}},{binding:1,resource:{buffer:this.scanScratch}},{binding:2,resource:{buffer:this.result}},{binding:3,resource:{buffer:this.finalizeUniforms}}]}))}record(e){if(!this.ready)return!1;const t=this.system.entityCount;if(t<=0)return!1;const a=ve(t),s=ye(a),r=ts(t),i=this.device.queue;this.generation++,i.writeBuffer(this.countUniforms,0,new Uint32Array([t,0,0,0]));const o=es(t);for(let f=0;f<s.length;f++){const m=f===s.length-1;i.writeBuffer(this.scanUniforms[f],0,new Uint32Array([s[f],r[f],m?o:r[f+1],m?1:0]))}const h=e.beginComputePass({label:"compact-count"});h.setPipeline(this.countPipeline),h.setBindGroup(0,this.countGroup),h.dispatchWorkgroups(lt(t)),h.end();for(let f=0;f<s.length;f++){const m=e.beginComputePass({label:`compact-scan-${f}`});m.setPipeline(this.scanPipeline),m.setBindGroup(0,this.scanGroupsPerLevel[f]),m.dispatchWorkgroups(ns(s[f])),m.end()}for(let f=s.length-2;f>=0;f--){const m=e.beginComputePass({label:`compact-scan-add-${f}`});m.setPipeline(this.addPipeline),m.setBindGroup(0,this.addGroupsPerLevel[f]),m.dispatchWorkgroups(lt(s[f])),m.end()}i.writeBuffer(this.scatterUniforms,0,new Uint32Array([t,o,0,0])),i.writeBuffer(this.finalizeUniforms,0,new Uint32Array([t,o,this.generation,0]));const c=e.beginComputePass({label:"compact-scatter"});c.setPipeline(this.scatterPipeline),c.setBindGroup(0,this.scatterGroup),c.dispatchWorkgroups(lt(t)),c.end();const u=e.beginComputePass({label:"compact-finalize"});return u.setPipeline(this.finalizePipeline),u.setBindGroup(0,this.finalizeGroup),u.dispatchWorkgroups(1),u.end(),e.copyBufferToBuffer(this.scratchEntities,0,this.system.entityBufferForSand(),0,t*Q),this.readbackPhase==="idle"&&(e.copyBufferToBuffer(this.result,0,this.resultStaging,0,Pt*4),this.readbackPhase="recorded"),!0}poll(){this.readbackPhase==="recorded"&&(this.readbackPhase="mapping",this.resultStaging.mapAsync(GPUMapMode.READ).then(()=>{const e=new Uint32Array(this.resultStaging.getMappedRange().slice(0));this.resultStaging.unmap();const t=e[0],a=e[1];t!==void 0&&a!==void 0&&(this.pendingMark={mark:t,generation:a}),this.readbackPhase="idle"},()=>{this.readbackPhase="idle"}))}takeMark(){const e=this.pendingMark;return e===null||e.generation<=this.appliedGeneration?null:(this.appliedGeneration=e.generation,this.pendingMark=null,e.mark)}destroy(){this.scratchEntities.destroy(),this.scanScratch.destroy(),this.result.destroy(),this.countUniforms.destroy(),this.scatterUniforms.destroy(),this.finalizeUniforms.destroy();for(const e of this.scanUniforms)e.destroy();this.readbackPhase="mapping",this.resultStaging.destroy()}}function Dt(n){const e=n[0]/n[1],t=Math.sqrt(e);return{min:[-t,-1/t],max:[t,1/t]}}function Dr(n){return[Math.max(0,n.max[0]-n.min[0]),Math.max(0,n.max[1]-n.min[1])]}function ss(n){const[e,t]=Dr(n);return e<=0||t<=0}function mt(n,e){const[t,a]=e,s=We(n.min,e),r=We(n.max,e),i=Math.floor(s[0]*t),o=Math.ceil(r[0]*t),h=Math.floor(s[1]*a),c=Math.ceil(r[1]*a),u=st(i,0,t),f=st(o,0,t),m=st(h,0,a),g=st(c,0,a);return{x:u,y:m,width:Math.max(0,f-u),height:Math.max(0,g-m)}}function st(n,e,t){return Number.isFinite(n)?Math.max(e,Math.min(t,Math.trunc(n))):e}const Xt=256,Ur=256,ia=256;function Ge(n,e=Xt){return!Number.isFinite(n)||n<=0||!Number.isFinite(e)||e<=0?0:Math.ceil(n/e)}function ra(n,e){const t=Number.isFinite(n)?Math.max(0,Math.trunc(n)):0;return Math.max(1,t)*e}const oa=256;function Wr(n,e){const t=Math.max(0,Math.trunc(n))*e;return Math.ceil(t/oa)*oa}function Mr(n,e,t,a,s){const r=Math.max(0,Math.trunc(e)),i=Math.max(0,Math.trunc(t));if(r===0||i===0)return new Float32Array(new ArrayBuffer(0));const o=r*a,h=s/4,c=new Float32Array(new ArrayBuffer(o*i*4));for(let u=0;u<i;u++){const f=u*h;c.set(n.subarray(f,f+o),u*o)}return c}const Br=`// ============================================================================
// stampCount.wgsl -- pass 1 of 3. How many particles each workgroup contributes.
//
// The same shape as \`compactCount.wgsl\`, with ONE DIFFERENCE: the predicate is
// "live AND inside the box" rather than "live". Everything else -- the
// workgroup size, the partition, the reduction -- is identical, because the
// scan that consumes these partials is literally the same shader and the same
// host-side arithmetic (\`compactPlan.ts\`).
//
// ---------------------------------------------------------------------------
// WHY A COUNT PASS AT ALL, RATHER THAN AN ATOMIC COUNTER
// ---------------------------------------------------------------------------
// An atomic append would be one pass instead of three and would produce the
// particles in NON-DETERMINISTIC ORDER: workgroups finish in whatever order the
// hardware schedules them.
//
// For a stamp that is not a cosmetic concern. The whole-scene capture is meant
// to round-trip bit-identically -- save a world, load it, get the same scene --
// and an order that varies per capture means the same world saved twice
// produces two different files. It also makes a diff between two world saves
// meaningless, and makes the restore path untestable by comparison.
//
// A prefix sum gives each particle a destination determined entirely by its
// source index, so the output is a deterministic function of the input. That is
// worth two extra passes over a buffer the compaction already sweeps four times.
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
// ==== begin include: stampBox.wgsl ====
// ============================================================================
// stampBox.wgsl -- the box test, and the uniform block every stamp pass shares.
//
// INCLUDED BY count, scatter, paste and clear. It exists so the predicate that
// decides "is this particle in the stamp" is written ONCE: the count pass and
// the scatter pass must agree about it exactly, or the scan produces offsets
// for one set of particles while the scatter writes a different set -- which
// packs particles on top of each other with no error anywhere.
//
// ---------------------------------------------------------------------------
// THE TEST IS HALF-OPEN, AND MIRRORS \`boxContains\` IN stampBox.ts
// ---------------------------------------------------------------------------
// \`>= min\` and \`< max\`, so two boxes sharing an edge partition the points on it
// rather than both claiming them. A cut-and-paste of two adjacent halves must
// not duplicate the particles along the seam.
//
// \`stampBox.test.ts\` asserts the host's version on these same edge cases. The
// two are a pair; changing one without the other means the host reports a
// different particle count than the GPU actually wrote.
// ============================================================================

struct StampUniforms {
    // The SOURCE box in world space: xy = min, zw = max.
    src_box    : vec4f,
    // The DESTINATION box in world space: xy = min, zw = max.
    //
    // Equal to \`src_box\` for a whole-scene restore, which is the case the host
    // short-circuits -- see \`remap_point\` below on why that matters.
    dst_box    : vec4f,
    // x: entity count        y: index of the grand-total slot in \`offsets\`
    // z: particle capacity of the destination block
    // w: reserved
    params     : vec4u,
}

fn stamp_src_min(u : StampUniforms) -> vec2f { return u.src_box.xy; }
fn stamp_src_max(u : StampUniforms) -> vec2f { return u.src_box.zw; }
fn stamp_dst_min(u : StampUniforms) -> vec2f { return u.dst_box.xy; }
fn stamp_dst_max(u : StampUniforms) -> vec2f { return u.dst_box.zw; }

// Half-open containment. See the header.
fn stamp_box_contains(lo : vec2f, hi : vec2f, p : vec2f) -> bool {
    return p.x >= lo.x && p.x < hi.x && p.y >= lo.y && p.y < hi.y;
}

// ---------------------------------------------------------------------------
// THE IDENTITY EARLY-OUT IS LOAD-BEARING, NOT AN OPTIMIZATION.
//
// \`(p - src_min) / src_extent * dst_extent + dst_min\` is algebraically the
// identity when the two boxes match, and is NOT the identity in f32: it
// round-trips through a divide and a multiply, so a coordinate comes back
// changed by an ulp.
//
// That drift is CUMULATIVE. A whole-scene restore is the common case -- every
// R press, every world load -- and an ulp per restore means a scene creeps
// across the world over a session of iterating on it. The host hit exactly this
// in \`remapPoint\` (stampBox.ts), where a unit test caught 0.3 coming back as
// 0.30000000000000004; this is the same guard on the GPU side, and the reason
// both exist is the same.
//
// Comparing the boxes for exact equality is the right test: the host passes the
// same f32s through the uniform in the restore case, so they compare equal
// bit-for-bit rather than approximately.
// ---------------------------------------------------------------------------
fn stamp_remap_point(u : StampUniforms, p : vec2f) -> vec2f {
    let src_lo = stamp_src_min(u);
    let src_hi = stamp_src_max(u);
    let dst_lo = stamp_dst_min(u);
    let dst_hi = stamp_dst_max(u);

    if (all(src_lo == dst_lo) && all(src_hi == dst_hi)) {
        return p;
    }

    let src_extent = src_hi - src_lo;
    let dst_extent = dst_hi - dst_lo;
    // A degenerate source box maps everything to the destination's min corner
    // rather than producing NaN. NaN in a position is invisible: the particle
    // simply vanishes and no error is raised anywhere.
    let frac = select(
        vec2f(0.0, 0.0),
        (p - src_lo) / src_extent,
        src_extent > vec2f(0.0, 0.0),
    );
    return dst_lo + frac * dst_extent;
}

// ==== end include: stampBox.wgsl ====

@group(0) @binding(0) var<storage, read>       entities : array<Entity>;
@group(0) @binding(1) var<storage, read_write> partials : array<u32>;
@group(0) @binding(2) var<uniform>             u        : StampUniforms;

fn entity_count() -> u32 { return u.params.x; }

var<workgroup> tally : array<u32, 256>;

@compute @workgroup_size(256)
fn main(
    @builtin(global_invocation_id) gid : vec3u,
    @builtin(local_invocation_id)  lid : vec3u,
    @builtin(workgroup_id)         wid : vec3u,
) {
    let index = gid.x;
    let local = lid.x;

    // A VALUE, NOT AN EARLY RETURN: every invocation must reach the barriers
    // below, and a workgroup whose tail returned early would deadlock on them.
    var hit = 0u;
    if (index < entity_count()) {
        let e = entities[index];
        // DEAD FIRST. \`e_is_dead\` must be tested before anything reads the
        // particle's position as meaningful -- a dead slot's position is
        // whatever was left there, and could easily fall inside the box.
        if (!e_is_dead(e) && stamp_box_contains(stamp_src_min(u), stamp_src_max(u), e_pos(e))) {
            hit = 1u;
        }
    }
    tally[local] = hit;

    // THE HALVING REDUCTION, byte-for-byte the shape \`compactCount.wgsl\` uses.
    // Every invocation executes every iteration and every barrier; only the
    // WRITE is conditional, which is what keeps the barriers uniformly reached.
    // A \`return\` before a \`workgroupBarrier\` is undefined behaviour in WGSL,
    // and the last workgroup of a ragged buffer hits that path every time.
    for (var stride = 128u; stride > 0u; stride >>= 1u) {
        workgroupBarrier();
        if (local < stride) {
            tally[local] = tally[local] + tally[local + stride];
        }
    }
    workgroupBarrier();

    if (local == 0u) {
        partials[wid.x] = tally[0];
    }
}
`,zr=`// ============================================================================
// stampScatter.wgsl -- pass 3 of 3. Copy the matched particles into the stamp.
//
// One invocation per source index. Each particle inside the box is written to
// its packed destination in the stamp block; everything else writes nothing.
//
// ---------------------------------------------------------------------------
// THIS PASS ONLY READS THE WORLD. IT IS NOT A CUT.
// ---------------------------------------------------------------------------
// \`entities\` is bound READ-ONLY here, deliberately. A copy must not disturb the
// scene: the free list is untouched, no particle is killed, and the high-water
// mark does not move. A cut is this pass followed by a SEPARATE region clear,
// which is what makes cut/copy/paste three composable operations rather than
// three near-duplicate shaders.
//
// That split is also what makes the initial-conditions capture safe to run on
// the frame the user presses go: capturing the scene cannot perturb the scene
// it is capturing.
//
// ---------------------------------------------------------------------------
// THE DESTINATION IS BOUNDED, AND THE BOUND IS NOT PARANOIA
// ---------------------------------------------------------------------------
// The stamp block is sized from a count the HOST read back, which is a frame or
// more old by the time this runs -- the world may have gained particles since.
// Without the bound, a stamp taken while painting would write past the end of
// its block. WebGPU does bounds-check storage writes, so this would not corrupt
// memory, but the write would be silently dropped and the stamp would be short
// by however many the buffer was over -- a stamp that quietly loses its last
// few particles, which is the kind of thing nobody notices for months.
//
// Clamping here makes the overflow VISIBLE instead: the host compares the
// packed count against the capacity it allocated and can say the stamp was
// truncated. See \`StampCopier.copy\`.
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
// ==== begin include: stampBox.wgsl ====
// ============================================================================
// stampBox.wgsl -- the box test, and the uniform block every stamp pass shares.
//
// INCLUDED BY count, scatter, paste and clear. It exists so the predicate that
// decides "is this particle in the stamp" is written ONCE: the count pass and
// the scatter pass must agree about it exactly, or the scan produces offsets
// for one set of particles while the scatter writes a different set -- which
// packs particles on top of each other with no error anywhere.
//
// ---------------------------------------------------------------------------
// THE TEST IS HALF-OPEN, AND MIRRORS \`boxContains\` IN stampBox.ts
// ---------------------------------------------------------------------------
// \`>= min\` and \`< max\`, so two boxes sharing an edge partition the points on it
// rather than both claiming them. A cut-and-paste of two adjacent halves must
// not duplicate the particles along the seam.
//
// \`stampBox.test.ts\` asserts the host's version on these same edge cases. The
// two are a pair; changing one without the other means the host reports a
// different particle count than the GPU actually wrote.
// ============================================================================

struct StampUniforms {
    // The SOURCE box in world space: xy = min, zw = max.
    src_box    : vec4f,
    // The DESTINATION box in world space: xy = min, zw = max.
    //
    // Equal to \`src_box\` for a whole-scene restore, which is the case the host
    // short-circuits -- see \`remap_point\` below on why that matters.
    dst_box    : vec4f,
    // x: entity count        y: index of the grand-total slot in \`offsets\`
    // z: particle capacity of the destination block
    // w: reserved
    params     : vec4u,
}

fn stamp_src_min(u : StampUniforms) -> vec2f { return u.src_box.xy; }
fn stamp_src_max(u : StampUniforms) -> vec2f { return u.src_box.zw; }
fn stamp_dst_min(u : StampUniforms) -> vec2f { return u.dst_box.xy; }
fn stamp_dst_max(u : StampUniforms) -> vec2f { return u.dst_box.zw; }

// Half-open containment. See the header.
fn stamp_box_contains(lo : vec2f, hi : vec2f, p : vec2f) -> bool {
    return p.x >= lo.x && p.x < hi.x && p.y >= lo.y && p.y < hi.y;
}

// ---------------------------------------------------------------------------
// THE IDENTITY EARLY-OUT IS LOAD-BEARING, NOT AN OPTIMIZATION.
//
// \`(p - src_min) / src_extent * dst_extent + dst_min\` is algebraically the
// identity when the two boxes match, and is NOT the identity in f32: it
// round-trips through a divide and a multiply, so a coordinate comes back
// changed by an ulp.
//
// That drift is CUMULATIVE. A whole-scene restore is the common case -- every
// R press, every world load -- and an ulp per restore means a scene creeps
// across the world over a session of iterating on it. The host hit exactly this
// in \`remapPoint\` (stampBox.ts), where a unit test caught 0.3 coming back as
// 0.30000000000000004; this is the same guard on the GPU side, and the reason
// both exist is the same.
//
// Comparing the boxes for exact equality is the right test: the host passes the
// same f32s through the uniform in the restore case, so they compare equal
// bit-for-bit rather than approximately.
// ---------------------------------------------------------------------------
fn stamp_remap_point(u : StampUniforms, p : vec2f) -> vec2f {
    let src_lo = stamp_src_min(u);
    let src_hi = stamp_src_max(u);
    let dst_lo = stamp_dst_min(u);
    let dst_hi = stamp_dst_max(u);

    if (all(src_lo == dst_lo) && all(src_hi == dst_hi)) {
        return p;
    }

    let src_extent = src_hi - src_lo;
    let dst_extent = dst_hi - dst_lo;
    // A degenerate source box maps everything to the destination's min corner
    // rather than producing NaN. NaN in a position is invisible: the particle
    // simply vanishes and no error is raised anywhere.
    let frac = select(
        vec2f(0.0, 0.0),
        (p - src_lo) / src_extent,
        src_extent > vec2f(0.0, 0.0),
    );
    return dst_lo + frac * dst_extent;
}

// ==== end include: stampBox.wgsl ====

@group(0) @binding(0) var<storage, read>       src      : array<Entity>;
@group(0) @binding(1) var<storage, read_write> dst      : array<Entity>;
// The scanned partials: element w is the number of matched particles in all
// workgroups before w.
@group(0) @binding(2) var<storage, read>       offsets  : array<u32>;
@group(0) @binding(3) var<uniform>             u        : StampUniforms;

fn entity_count() -> u32 { return u.params.x; }
fn dst_capacity() -> u32 { return u.params.z; }

// THE GRAND TOTAL OF MATCHED PARTICLES, read from the scan rather than passed
// in. The host does not know it: only the GPU has counted, and every past
// attempt in this codebase to have the host infer a live count produced a
// number that disagreed with the buffer. See \`compactScatter.wgsl\`, which takes
// the identical approach for the identical reason.
fn matched_count() -> u32 { return min(offsets[u.params.y], dst_capacity()); }

var<workgroup> flags : array<u32, 256>;

@compute @workgroup_size(256)
fn main(
    @builtin(global_invocation_id) gid : vec3u,
    @builtin(local_invocation_id)  lid : vec3u,
    @builtin(workgroup_id)         wid : vec3u,
) {
    let index = gid.x;
    let local = lid.x;

    // THE SAME PREDICATE THE COUNT PASS USED, via the same shared function.
    // If these two ever disagreed, the scan would produce offsets for one set of
    // particles while this wrote a different set -- packing them on top of each
    // other with no error anywhere. That is why the test lives in
    // \`stampBox.wgsl\` rather than being written out twice.
    var hit = 0u;
    if (index < entity_count()) {
        let e = src[index];
        if (!e_is_dead(e) && stamp_box_contains(stamp_src_min(u), stamp_src_max(u), e_pos(e))) {
            hit = 1u;
        }
    }
    flags[local] = hit;
    workgroupBarrier();

    // Exclusive prefix sum within the workgroup: each invocation sums the flags
    // before it. 256 reads per invocation is more work than a tree scan and is
    // obviously right; this pass is dominated by the 32-byte entity copy below.
    // \`compactScatter.wgsl\` makes the same trade for the same reason.
    var rank = 0u;
    for (var i = 0u; i < local; i++) {
        rank = rank + flags[i];
    }
    let group_offset = offsets[wid.x];

    if (index >= entity_count()) { return; }

    // ---------------------------------------------------------------------
    // THE TAIL IS NOT IMPLICITLY DEAD, AND THAT IS NOT A THEORETICAL CONCERN
    // ---------------------------------------------------------------------
    // The block is REUSED across captures and sized to the whole entity buffer,
    // so whatever the previous capture left above this one's match count is
    // still sitting there. Capture a thousand particles, erase most of them,
    // capture ten: slots 10..999 still hold the first capture's particles.
    //
    // Nothing downstream can tell the difference. The paste dispatches over the
    // whole block and skips dead entries -- so those stale particles are not
    // stale to it, they are live ones to place, and a restore would resurrect a
    // scene the user erased.
    //
    // \`compactScatter.wgsl\` hit exactly this and documents it: a naively unwritten
    // tail is not empty, it is "a buffer full of LIVE particles". There the
    // symptom was an audit reporting live 6,000,000 of 6,000,000; here it would
    // be a reset key that brings back deleted particles.
    //
    // THE TWO WRITES NEVER TARGET THE SAME SLOT, which is what makes this safe
    // with no ordering between invocations: a matched particle always lands
    // BELOW \`matched_count()\` (its rank among the matched is less than their
    // total), and the tail clear only touches indices at or above it. The ranges
    // partition the block.
    if (index >= matched_count() && index < dst_capacity()) {
        dst[index] = make_entity_dead();
    }

    if (hit == 0u) { return; }

    let destination = group_offset + rank;
    // See the header: silently dropping the write would make the stamp short.
    if (destination >= dst_capacity()) { return; }

    // VERBATIM. The particle's position is NOT remapped here -- a stamp stores
    // world coordinates exactly as they sat in the entity buffer, and the
    // remap happens on PASTE, where the destination box is known. Doing it here
    // would bake the source box into the stored bytes and make a stamp
    // re-pastable only into the box it came from.
    //
    // It also keeps this a pure 32-byte copy, so a captured scene restored into
    // an unchanged world is bit-identical rather than arithmetically close.
    dst[destination] = src[index];
}
`,la=48,Gr=2;class wt{device;system;field;countPipeline=null;scanPipeline=null;addPipeline=null;scatterPipeline=null;countGroup=null;scatterGroup=null;scanGroupsPerLevel=[];scanScratch;block;blockCapacity;uniforms;scanUniforms=[];countStaging;vramCanvas=null;vramField=null;constructor(e,t,a){this.device=e,this.system=t,this.field=a;const s=t.entityCount;this.scanScratch=e.createBuffer({label:"stamp-scan-scratch",size:Qa(s)*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC}),this.blockCapacity=s,this.block=e.createBuffer({label:"stamp-block",size:ra(s,Q),usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC}),this.uniforms=e.createBuffer({label:"stamp-uniforms",size:la,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.countStaging=e.createBuffer({label:"stamp-count-staging",size:4,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});for(let r=0;r<ye(ve(s)).length;r++)this.scanUniforms.push(e.createBuffer({label:`stamp-scan-uniforms-${r}`,size:16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}))}static async create(e,t,a){const s=new wt(e,t,a);return await s.reload(),s}get ready(){return this.countPipeline!==null&&this.scanPipeline!==null&&this.addPipeline!==null&&this.scatterPipeline!==null}async reload(){const e=this.device,t=m=>({binding:m,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}}),a=m=>({binding:m,visibility:GPUShaderStage.COMPUTE,buffer:{type:"read-only-storage"}}),s=m=>({binding:m,visibility:GPUShaderStage.COMPUTE,buffer:{type:"uniform"}}),r=e.createBindGroupLayout({label:"stamp-count",entries:[a(0),t(1),s(2)]}),i=e.createBindGroupLayout({label:"stamp-scan",entries:[t(0),s(1)]}),o=e.createBindGroupLayout({label:"stamp-scatter",entries:[a(0),t(1),a(2),s(3)]}),[h,c,u]=await Promise.all([$(e,"stampCount",Br),$(e,"compactScan",as),$(e,"stampScatter",zr)]),f=this.system.entityBufferForSand();if(h!==null&&(this.countPipeline=e.createComputePipeline({label:"stamp-count",layout:e.createPipelineLayout({bindGroupLayouts:[r]}),compute:{module:h,entryPoint:"main"}}),this.countGroup=e.createBindGroup({label:"stamp-count",layout:r,entries:[{binding:0,resource:{buffer:f}},{binding:1,resource:{buffer:this.scanScratch}},{binding:2,resource:{buffer:this.uniforms}}]})),c!==null){const m=e.createPipelineLayout({bindGroupLayouts:[i]});this.scanPipeline=e.createComputePipeline({label:"stamp-scan",layout:m,compute:{module:c,entryPoint:"main"}}),this.addPipeline=e.createComputePipeline({label:"stamp-scan-add",layout:m,compute:{module:c,entryPoint:"add_offsets"}}),this.scanGroupsPerLevel=this.scanUniforms.map((g,w)=>e.createBindGroup({label:`stamp-scan-${w}`,layout:i,entries:[{binding:0,resource:{buffer:this.scanScratch}},{binding:1,resource:{buffer:g}}]}))}u!==null&&(this.scatterPipeline=e.createComputePipeline({label:"stamp-scatter",layout:e.createPipelineLayout({bindGroupLayouts:[o]}),compute:{module:u,entryPoint:"main"}}),this.rebuildScatterGroup(o)),this.scatterLayout=o}scatterLayout=null;rebuildScatterGroup(e){this.scatterGroup=this.device.createBindGroup({label:"stamp-scatter",layout:e,entries:[{binding:0,resource:{buffer:this.system.entityBufferForSand()}},{binding:1,resource:{buffer:this.block}},{binding:2,resource:{buffer:this.scanScratch}},{binding:3,resource:{buffer:this.uniforms}}]})}record(e,t){if(!this.ready||this.scatterLayout===null||ss(t))return!1;const a=this.system.entityCount;if(a<=0)return!1;this.ensureBlock(a);const s=ye(ve(a)),r=ts(a),i=es(a),o=this.device.queue;o.writeBuffer(this.uniforms,0,this.packUniforms(t,t,a,i));for(let u=0;u<s.length;u++){const f=u===s.length-1;o.writeBuffer(this.scanUniforms[u],0,new Uint32Array([s[u],r[u],f?i:r[u+1],f?1:0]))}const h=e.beginComputePass({label:"stamp-count"});h.setPipeline(this.countPipeline),h.setBindGroup(0,this.countGroup),h.dispatchWorkgroups(Ge(a,Xt)),h.end();for(let u=0;u<s.length;u++){const f=e.beginComputePass({label:`stamp-scan-${u}`});f.setPipeline(this.scanPipeline),f.setBindGroup(0,this.scanGroupsPerLevel[u]),f.dispatchWorkgroups(ns(s[u])),f.end()}for(let u=s.length-2;u>=0;u--){const f=e.beginComputePass({label:`stamp-scan-add-${u}`});f.setPipeline(this.addPipeline),f.setBindGroup(0,this.scanGroupsPerLevel[u]),f.dispatchWorkgroups(lt(s[u])),f.end()}const c=e.beginComputePass({label:"stamp-scatter"});return c.setPipeline(this.scatterPipeline),c.setBindGroup(0,this.scatterGroup),c.dispatchWorkgroups(Ge(a,Xt)),c.end(),e.copyBufferToBuffer(this.scanScratch,i*4,this.countStaging,0,4),!0}async readCount(){await this.countStaging.mapAsync(GPUMapMode.READ);const e=new Uint32Array(this.countStaging.getMappedRange().slice(0));return this.countStaging.unmap(),Math.min(e[0]??0,this.blockCapacity)}stageTextures(e,t){return{canvas:this.stageOne(e,t,this.system.currentCanvasTextureObject(),this.system.canvasSize,"canvas"),field:this.stageOne(e,t,this.field.textureObject(),this.field.size,"field")}}stageTexturesInVram(e,t){this.vramCanvas=this.copyLayerToVram(e,t,this.system.currentCanvasTextureObject(),this.system.canvasSize,Ls,this.vramCanvas,"canvas"),this.vramField=this.copyLayerToVram(e,t,this.field.textureObject(),this.field.size,Ns,this.vramField,"field")}get capturedCanvas(){return this.vramCanvas}get capturedField(){return this.vramField}get capturedBlock(){return this.block}copyLayerToVram(e,t,a,s,r,i,o){const h=mt(t,s);if(h.width<=0||h.height<=0)return i;let c=i;return(c===null||c.rect.width!==h.width||c.rect.height!==h.height)&&(c?.texture.destroy(),c={rect:h,texture:this.device.createTexture({label:`stamp-${o}-vram`,size:{width:h.width,height:h.height},format:r,usage:GPUTextureUsage.COPY_SRC|GPUTextureUsage.COPY_DST})}),e.copyTextureToTexture({texture:a,origin:{x:h.x,y:h.y}},{texture:c.texture},{width:h.width,height:h.height}),{rect:h,texture:c.texture}}stageOne(e,t,a,s,r){const i=mt(t,s);if(i.width<=0||i.height<=0)return null;const o=Pe(a.format),h=Wr(i.width,o*Gr),c=this.device.createBuffer({label:`stamp-${r}-staging`,size:h*i.height,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});return e.copyTextureToBuffer({texture:a,origin:{x:i.x,y:i.y}},{buffer:c,bytesPerRow:h,rowsPerImage:i.height},{width:i.width,height:i.height}),{rect:i,buffer:c,bytesPerRow:h,channels:o}}async readLayer(e,t){if(e===null)return bt(t);await e.buffer.mapAsync(GPUMapMode.READ);const a=new Uint16Array(e.buffer.getMappedRange().slice(0));e.buffer.unmap(),e.buffer.destroy();const{rect:s,bytesPerRow:r,channels:i}=e,o=new Float32Array(a.length);for(let c=0;c<a.length;c++)o[c]=ka(a[c]??0);const h=Mr(o,s.width,s.height,i,r*2);return{width:s.width,height:s.height,channels:i,data:h}}async readParticles(e){if(e<=0)return new ArrayBuffer(0);const t=e*Q,a=this.device.createBuffer({label:"stamp-particle-staging",size:t,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ}),s=this.device.createCommandEncoder({label:"stamp-particle-read"});s.copyBufferToBuffer(this.block,0,a,0,t),this.device.queue.submit([s.finish()]),await a.mapAsync(GPUMapMode.READ);const r=a.getMappedRange().slice(0);return a.unmap(),a.destroy(),r}ensureBlock(e){e<=this.blockCapacity&&this.scatterGroup!==null||(this.block.destroy(),this.blockCapacity=e,this.block=this.device.createBuffer({label:"stamp-block",size:ra(e,Q),usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC}),this.scatterLayout!==null&&this.rebuildScatterGroup(this.scatterLayout))}packUniforms(e,t,a,s){const r=new ArrayBuffer(la),i=new Float32Array(r),o=new Uint32Array(r);return i[0]=e.min[0],i[1]=e.min[1],i[2]=e.max[0],i[3]=e.max[1],i[4]=t.min[0],i[5]=t.min[1],i[6]=t.max[0],i[7]=t.max[1],o[8]=a,o[9]=s,o[10]=this.blockCapacity,o[11]=0,r}static paletteRefsFor(e,t){const r=new Int32Array(e),i=new Set;for(let o=0;o*8<r.length;o++){const h=r[o*8+5]??-1;h>=0&&i.add(h)}return[...i].sort((o,h)=>o-h).map(o=>({slot:o,name:t(o)}))}destroy(){this.scanScratch.destroy(),this.block.destroy(),this.uniforms.destroy(),this.countStaging.destroy(),this.vramCanvas?.texture.destroy(),this.vramField?.texture.destroy();for(const e of this.scanUniforms)e.destroy()}}const Fr=`// ============================================================================
// stampClear.wgsl -- kill every particle inside a box and return its slot.
//
// The particle half of a region clear. The texture halves are render passes
// (see \`StampClearer\`), because a texture region is cleared by drawing over it
// rather than by a compute pass.
//
// ---------------------------------------------------------------------------
// WHAT THIS IS FOR
// ---------------------------------------------------------------------------
// Two things, and having one operation serve both is the point:
//
//   CUT      copy the region, then clear it.
//   REPLACE  clear the region, then paste into it.
//
// The initial-conditions restore is the second: clear the whole world, paste
// the captured stamp. That composition is why \`stampPaste.wgsl\` has no replace
// mode -- a mode flag there would duplicate this pass's job and the two could
// disagree about which particles are "in" the box.
//
// ---------------------------------------------------------------------------
// THE CADENCE RULE THIS INHERITS FROM kill.wgsl
// ---------------------------------------------------------------------------
// This pass ONLY EVER GIVES SLOTS BACK, so the head moves monotonically UP
// across it -- the same direction edge-death moves it inside \`advance()\`, which
// is why the two compose. It must NOT be recorded on a frame that also spawns
// or pastes, both of which take: a head moving both ways within one pass is
// precisely the interleaving the free-list protocol forbids.
//
// \`StampClearer\` enforces that by recording the clear and the paste into
// separate passes on the same encoder, which WebGPU orders and barriers between.
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
// THE STRUCT ONLY -- operations follow the binding. See \`freeList.wgsl\`.
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
// ==== begin include: stampBox.wgsl ====
// ============================================================================
// stampBox.wgsl -- the box test, and the uniform block every stamp pass shares.
//
// INCLUDED BY count, scatter, paste and clear. It exists so the predicate that
// decides "is this particle in the stamp" is written ONCE: the count pass and
// the scatter pass must agree about it exactly, or the scan produces offsets
// for one set of particles while the scatter writes a different set -- which
// packs particles on top of each other with no error anywhere.
//
// ---------------------------------------------------------------------------
// THE TEST IS HALF-OPEN, AND MIRRORS \`boxContains\` IN stampBox.ts
// ---------------------------------------------------------------------------
// \`>= min\` and \`< max\`, so two boxes sharing an edge partition the points on it
// rather than both claiming them. A cut-and-paste of two adjacent halves must
// not duplicate the particles along the seam.
//
// \`stampBox.test.ts\` asserts the host's version on these same edge cases. The
// two are a pair; changing one without the other means the host reports a
// different particle count than the GPU actually wrote.
// ============================================================================

struct StampUniforms {
    // The SOURCE box in world space: xy = min, zw = max.
    src_box    : vec4f,
    // The DESTINATION box in world space: xy = min, zw = max.
    //
    // Equal to \`src_box\` for a whole-scene restore, which is the case the host
    // short-circuits -- see \`remap_point\` below on why that matters.
    dst_box    : vec4f,
    // x: entity count        y: index of the grand-total slot in \`offsets\`
    // z: particle capacity of the destination block
    // w: reserved
    params     : vec4u,
}

fn stamp_src_min(u : StampUniforms) -> vec2f { return u.src_box.xy; }
fn stamp_src_max(u : StampUniforms) -> vec2f { return u.src_box.zw; }
fn stamp_dst_min(u : StampUniforms) -> vec2f { return u.dst_box.xy; }
fn stamp_dst_max(u : StampUniforms) -> vec2f { return u.dst_box.zw; }

// Half-open containment. See the header.
fn stamp_box_contains(lo : vec2f, hi : vec2f, p : vec2f) -> bool {
    return p.x >= lo.x && p.x < hi.x && p.y >= lo.y && p.y < hi.y;
}

// ---------------------------------------------------------------------------
// THE IDENTITY EARLY-OUT IS LOAD-BEARING, NOT AN OPTIMIZATION.
//
// \`(p - src_min) / src_extent * dst_extent + dst_min\` is algebraically the
// identity when the two boxes match, and is NOT the identity in f32: it
// round-trips through a divide and a multiply, so a coordinate comes back
// changed by an ulp.
//
// That drift is CUMULATIVE. A whole-scene restore is the common case -- every
// R press, every world load -- and an ulp per restore means a scene creeps
// across the world over a session of iterating on it. The host hit exactly this
// in \`remapPoint\` (stampBox.ts), where a unit test caught 0.3 coming back as
// 0.30000000000000004; this is the same guard on the GPU side, and the reason
// both exist is the same.
//
// Comparing the boxes for exact equality is the right test: the host passes the
// same f32s through the uniform in the restore case, so they compare equal
// bit-for-bit rather than approximately.
// ---------------------------------------------------------------------------
fn stamp_remap_point(u : StampUniforms, p : vec2f) -> vec2f {
    let src_lo = stamp_src_min(u);
    let src_hi = stamp_src_max(u);
    let dst_lo = stamp_dst_min(u);
    let dst_hi = stamp_dst_max(u);

    if (all(src_lo == dst_lo) && all(src_hi == dst_hi)) {
        return p;
    }

    let src_extent = src_hi - src_lo;
    let dst_extent = dst_hi - dst_lo;
    // A degenerate source box maps everything to the destination's min corner
    // rather than producing NaN. NaN in a position is invisible: the particle
    // simply vanishes and no error is raised anywhere.
    let frac = select(
        vec2f(0.0, 0.0),
        (p - src_lo) / src_extent,
        src_extent > vec2f(0.0, 0.0),
    );
    return dst_lo + frac * dst_extent;
}

// ==== end include: stampBox.wgsl ====

@group(0) @binding(0) var<storage, read_write> entities : array<Entity>;
// MUST be named exactly \`freelist\` -- see \`freeListOps.wgsl\`.
@group(0) @binding(1) var<storage, read_write> freelist : FreeList;
@group(0) @binding(2) var<uniform>             u        : StampUniforms;

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

fn entity_count() -> u32 { return u.params.x; }

// WORKGROUP SIZE 256, matching \`kill.wgsl\`: this sweeps the whole entity buffer
// rather than a small brush-sized dispatch, so the larger group is the right
// shape. \`STAMP_CLEAR_WORKGROUP_SIZE\` in stampDispatch.ts must match, and
// \`stampShaders.test.ts\` asserts it.
@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid : vec3u) {
    let index = gid.x;
    if (index >= entity_count()) { return; }

    let e = entities[index];
    // ALREADY DEAD SLOTS ARE LEFT ALONE. Returning one that is already in the
    // pool would be a double-free: the same index offered to two brushes, which
    // is the single worst failure the pool has. \`e_is_dead\` first, always.
    if (e_is_dead(e)) { return; }

    if (!stamp_box_contains(stamp_src_min(u), stamp_src_max(u), e_pos(e))) { return; }

    // PUSH BEFORE ZEROING, matching \`kill.wgsl\` and the BC_KILL branch in
    // entityUpdate. A reader racing this sees either a live particle or a dead
    // one, never a live index sitting on the free list. Doing it the other way
    // round opens exactly that window.
    free_list_give(index);
    entities[index] = make_entity_dead();
}
`,Hr=`// ============================================================================
// stampPaste.wgsl -- add a stamp's particles to the world.
//
// One invocation per particle in the stamp. Each takes a slot from the free
// list, remaps its position into the destination box, and writes it live.
//
// ---------------------------------------------------------------------------
// PASTE IS ALWAYS ADDITIVE. REPLACE IS clear-region THEN paste.
// ---------------------------------------------------------------------------
// There is no "replace" mode here and there should not be one. An additive
// paste plus a separate region clear composes into replace, and the same clear
// composes with a copy into cut -- so three operations cover cut, copy, paste
// and replace, where a mode flag on each would have been four shaders that can
// disagree.
//
// The initial-conditions restore is therefore \`clearRegion(world)\` followed by
// \`paste(stamp)\`, and it exercises exactly the same code path the stamp tool
// will use. That is deliberate: the reset key runs it every session, so the
// paste path cannot rot between here and the stamp UI landing.
//
// ---------------------------------------------------------------------------
// THE RESERVATION PROTOCOL
// ---------------------------------------------------------------------------
// This pass ONLY TAKES from the free list, which is what makes it safe to run
// beside nothing else that touches the pool. \`free_list_take\` is the same
// atomic reservation the spawn pass uses, and it refuses to underflow: a paste
// into a world with too few free slots places as many particles as it can and
// silently drops the rest.
//
// SILENTLY IS CORRECT HERE, and it is the same call \`spawnCountFor\` makes for
// the brush: the alternative is refusing the entire paste because the pool is
// one slot short, which loses the user's whole stamp rather than its tail. The
// HOST reports the shortfall -- it knows the stamp's count and can read the
// pool -- so the outcome is visible without this pass needing to fail.
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
// THE STRUCT ONLY -- its operations name the \`freelist\` binding directly, so
// they must follow it. See the long note in \`freeList.wgsl\`.
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
// ==== begin include: stampBox.wgsl ====
// ============================================================================
// stampBox.wgsl -- the box test, and the uniform block every stamp pass shares.
//
// INCLUDED BY count, scatter, paste and clear. It exists so the predicate that
// decides "is this particle in the stamp" is written ONCE: the count pass and
// the scatter pass must agree about it exactly, or the scan produces offsets
// for one set of particles while the scatter writes a different set -- which
// packs particles on top of each other with no error anywhere.
//
// ---------------------------------------------------------------------------
// THE TEST IS HALF-OPEN, AND MIRRORS \`boxContains\` IN stampBox.ts
// ---------------------------------------------------------------------------
// \`>= min\` and \`< max\`, so two boxes sharing an edge partition the points on it
// rather than both claiming them. A cut-and-paste of two adjacent halves must
// not duplicate the particles along the seam.
//
// \`stampBox.test.ts\` asserts the host's version on these same edge cases. The
// two are a pair; changing one without the other means the host reports a
// different particle count than the GPU actually wrote.
// ============================================================================

struct StampUniforms {
    // The SOURCE box in world space: xy = min, zw = max.
    src_box    : vec4f,
    // The DESTINATION box in world space: xy = min, zw = max.
    //
    // Equal to \`src_box\` for a whole-scene restore, which is the case the host
    // short-circuits -- see \`remap_point\` below on why that matters.
    dst_box    : vec4f,
    // x: entity count        y: index of the grand-total slot in \`offsets\`
    // z: particle capacity of the destination block
    // w: reserved
    params     : vec4u,
}

fn stamp_src_min(u : StampUniforms) -> vec2f { return u.src_box.xy; }
fn stamp_src_max(u : StampUniforms) -> vec2f { return u.src_box.zw; }
fn stamp_dst_min(u : StampUniforms) -> vec2f { return u.dst_box.xy; }
fn stamp_dst_max(u : StampUniforms) -> vec2f { return u.dst_box.zw; }

// Half-open containment. See the header.
fn stamp_box_contains(lo : vec2f, hi : vec2f, p : vec2f) -> bool {
    return p.x >= lo.x && p.x < hi.x && p.y >= lo.y && p.y < hi.y;
}

// ---------------------------------------------------------------------------
// THE IDENTITY EARLY-OUT IS LOAD-BEARING, NOT AN OPTIMIZATION.
//
// \`(p - src_min) / src_extent * dst_extent + dst_min\` is algebraically the
// identity when the two boxes match, and is NOT the identity in f32: it
// round-trips through a divide and a multiply, so a coordinate comes back
// changed by an ulp.
//
// That drift is CUMULATIVE. A whole-scene restore is the common case -- every
// R press, every world load -- and an ulp per restore means a scene creeps
// across the world over a session of iterating on it. The host hit exactly this
// in \`remapPoint\` (stampBox.ts), where a unit test caught 0.3 coming back as
// 0.30000000000000004; this is the same guard on the GPU side, and the reason
// both exist is the same.
//
// Comparing the boxes for exact equality is the right test: the host passes the
// same f32s through the uniform in the restore case, so they compare equal
// bit-for-bit rather than approximately.
// ---------------------------------------------------------------------------
fn stamp_remap_point(u : StampUniforms, p : vec2f) -> vec2f {
    let src_lo = stamp_src_min(u);
    let src_hi = stamp_src_max(u);
    let dst_lo = stamp_dst_min(u);
    let dst_hi = stamp_dst_max(u);

    if (all(src_lo == dst_lo) && all(src_hi == dst_hi)) {
        return p;
    }

    let src_extent = src_hi - src_lo;
    let dst_extent = dst_hi - dst_lo;
    // A degenerate source box maps everything to the destination's min corner
    // rather than producing NaN. NaN in a position is invisible: the particle
    // simply vanishes and no error is raised anywhere.
    let frac = select(
        vec2f(0.0, 0.0),
        (p - src_lo) / src_extent,
        src_extent > vec2f(0.0, 0.0),
    );
    return dst_lo + frac * dst_extent;
}

// ==== end include: stampBox.wgsl ====

@group(0) @binding(0) var<storage, read_write> entities : array<Entity>;
// MUST be named exactly \`freelist\`: \`freeListOps.wgsl\` names it rather than
// taking a pointer, because a storage pointer parameter needs a language
// feature that is not baseline WebGPU.
@group(0) @binding(1) var<storage, read_write> freelist : FreeList;
// The stamp's particles, exactly as they were captured: world-space positions
// in the SOURCE box's frame.
@group(0) @binding(2) var<storage, read>       stamp    : array<Entity>;
@group(0) @binding(3) var<uniform>             u        : StampUniforms;
// ---------------------------------------------------------------------------
// THE HIGHEST SLOT THIS PASTE ACTUALLY WROTE, plus one. The host reads it back
// and raises the mark to it.
//
// WHY THE HOST CANNOT COMPUTE THIS ITSELF, which is the bug this binding fixes:
// the host knows how many particles it pasted, and that number says nothing
// about WHERE they went. \`free_list_give\` pushes freed indices in whatever
// order the GPU happens to schedule its invocations, so after a region clear
// the pool's top is an arbitrary permutation -- and a paste that pops it
// scatters particles across the whole buffer. A 150k-particle restore was
// landing at indices up to 599,999 while the host set the mark to 150,598.
//
// Every particle above that mark was then skipped by every pass and drawn by
// nothing: invisible, but still occupying its slot, so the brush appeared to
// paint nothing or to paint somewhere else. The audit named it exactly --
// "150598 live particles sit at or above the mark (150598)".
//
// An atomic max is the only honest answer, because only the GPU learns which
// slots the reservation handed out.
// ---------------------------------------------------------------------------
@group(0) @binding(4) var<storage, read_write> high_water : atomic<u32>;

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

/// How many particles the stamp holds. Reuses \`params.x\`, which for this pass
/// counts the STAMP rather than the world -- the world's entity count is
/// irrelevant here, since the free list decides where anything lands.
fn stamp_count() -> u32 { return u.params.x; }

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid : vec3u) {
    let index = gid.x;
    if (index >= stamp_count()) { return; }

    let source = stamp[index];
    // A stamp should hold no dead particles -- the copy pass filtered them --
    // but a hand-edited or truncated file could. Skipping costs one branch and
    // keeps a corrupt save from spawning garbage at the origin.
    if (e_is_dead(source)) { return; }

    // TAKE A SLOT. Refuses to underflow; see the header on why running out is
    // handled by placing fewer rather than by failing.
    let slot = free_list_take();
    if (slot == NO_SLOT) { return; }

    var placed = source;
    // THE REMAP, and the one arithmetic step in the whole paste path. It is the
    // identity when the boxes match -- see \`stamp_remap_point\`, where that
    // early-out is load-bearing rather than an optimization.
    let pos = stamp_remap_point(u, e_pos(source));
    placed.pos_vel = vec4f(pos, e_vel(source));

    entities[slot] = placed;

    // RECORD HOW FAR UP THE BUFFER THIS WENT. The mark is an exclusive bound --
    // every pass covers [0, mark) -- so a particle at \`slot\` requires a mark of
    // at least \`slot + 1\`.
    //
    // AFTER the entity write, so a host that observes this value is guaranteed
    // the particle it describes is already in memory. The two are in the same
    // dispatch and the host only reads the result after the submission
    // completes, so the ordering is not strictly required -- but stating the
    // bound only once the thing it bounds exists is the invariant worth keeping
    // even when the schedule makes it free.
    atomicMax(&high_water, slot + 1u);
}
`,is=48;class pn{device;system;field;clearPipeline=null;pastePipeline=null;clearGroup=null;pasteLayout=null;clearUniforms;pasteUniforms;upload=null;uploadCapacity=0;highWater;highWaterStaging;highWaterPhase="idle";constructor(e,t,a){this.device=e,this.system=t,this.field=a;const s=r=>e.createBuffer({label:r,size:is,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});this.clearUniforms=s("stamp-clear-uniforms"),this.pasteUniforms=s("stamp-paste-uniforms"),this.highWater=e.createBuffer({label:"stamp-high-water",size:4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),this.highWaterStaging=e.createBuffer({label:"stamp-high-water-staging",size:4,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ})}static async create(e,t,a){const s=new pn(e,t,a);return await s.reload(),s}get ready(){return this.clearPipeline!==null&&this.pastePipeline!==null}async reload(){const e=this.device,t=f=>({binding:f,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}}),a=f=>({binding:f,visibility:GPUShaderStage.COMPUTE,buffer:{type:"read-only-storage"}}),s=f=>({binding:f,visibility:GPUShaderStage.COMPUTE,buffer:{type:"uniform"}}),r=e.createBindGroupLayout({label:"stamp-clear",entries:[t(0),t(1),s(2)]}),i=e.createBindGroupLayout({label:"stamp-paste",entries:[t(0),t(1),a(2),s(3),t(4)]});this.pasteLayout=i;const[o,h]=await Promise.all([$(e,"stampClear",Fr),$(e,"stampPaste",Hr)]),c=this.system.entityBufferForSand(),u=this.system.freeListBufferForSand();o!==null&&(this.clearPipeline=e.createComputePipeline({label:"stamp-clear",layout:e.createPipelineLayout({bindGroupLayouts:[r]}),compute:{module:o,entryPoint:"main"}}),this.clearGroup=e.createBindGroup({label:"stamp-clear",layout:r,entries:[{binding:0,resource:{buffer:c}},{binding:1,resource:{buffer:u}},{binding:2,resource:{buffer:this.clearUniforms}}]})),h!==null&&(this.pastePipeline=e.createComputePipeline({label:"stamp-paste",layout:e.createPipelineLayout({bindGroupLayouts:[i]}),compute:{module:h,entryPoint:"main"}}))}clearParticles(e,t){if(this.clearPipeline===null||this.clearGroup===null||ss(t))return!1;const a=this.system.entityCount;if(a<=0)return!1;this.device.queue.writeBuffer(this.clearUniforms,0,Ut(t,t,a,0,0));const s=e.beginComputePass({label:"stamp-clear"});return s.setPipeline(this.clearPipeline),s.setBindGroup(0,this.clearGroup),s.dispatchWorkgroups(Ge(a,Ur)),s.end(),!0}pasteParticles(e,t,a){if(this.pastePipeline===null||this.pasteLayout===null)return!1;const s=mi(t);if(s<=0||(this.ensureUpload(s),this.upload===null))return!1;this.device.queue.writeBuffer(this.upload,0,t.particles),this.device.queue.writeBuffer(this.pasteUniforms,0,Ut(t.box,a,s,0,0)),this.device.queue.writeBuffer(this.highWater,0,new Uint32Array([0]));const r=this.device.createBindGroup({label:"stamp-paste",layout:this.pasteLayout,entries:[{binding:0,resource:{buffer:this.system.entityBufferForSand()}},{binding:1,resource:{buffer:this.system.freeListBufferForSand()}},{binding:2,resource:{buffer:this.upload}},{binding:3,resource:{buffer:this.pasteUniforms}},{binding:4,resource:{buffer:this.highWater}}]}),i=e.beginComputePass({label:"stamp-paste"});return i.setPipeline(this.pastePipeline),i.setBindGroup(0,r),i.dispatchWorkgroups(Ge(s,ia)),i.end(),this.system.restoreHighWaterMark(this.system.entityCount),this.highWaterPhase==="idle"&&(e.copyBufferToBuffer(this.highWater,0,this.highWaterStaging,0,4),this.highWaterPhase="recorded"),!0}clearTextures(e){this.zeroRegion(e,this.system.currentCanvasTextureObject(),this.system.canvasSize),this.zeroRegion(e,this.field.textureObject(),this.field.size)}zeroRegion(e,t,a){const s=mt(e,a);if(s.width<=0||s.height<=0)return;const r=s.width*s.height*Pe(t.format);this.writeRegion(t,s.x,s.y,s.width,s.height,new Float32Array(r))}writeRegion(e,t,a,s,r,i){if(s<=0||r<=0)return;const o=Yt(i),h=s*Pe(e.format)*2;this.device.queue.writeTexture({texture:e,origin:{x:t,y:a}},o,{bytesPerRow:h,rowsPerImage:r},{width:s,height:r})}pasteTextures(e,t){this.pasteLayer(e.canvas,t,this.system.currentCanvasTextureObject(),this.system.canvasSize),this.pasteLayer(e.field,t,this.field.textureObject(),this.field.size)}pasteLayer(e,t,a,s){if(Ve(e))return;if(e.channels!==Pe(a.format)){console.error(`Stamp layer has ${e.channels} channels; ${a.label} has ${Pe(a.format)}. Not pasted.`);return}const r=e.channels,i=mt(t,s);if(i.width<=0||i.height<=0)return;if(i.width===e.width&&i.height===e.height){this.writeRegion(a,i.x,i.y,i.width,i.height,e.data);return}const o=new Float32Array(i.width*i.height*r);for(let h=0;h<i.height;h++){const c=Math.min(e.height-1,Math.floor((h+.5)/i.height*e.height));for(let u=0;u<i.width;u++){const f=Math.min(e.width-1,Math.floor((u+.5)/i.width*e.width)),m=(c*e.width+f)*r,g=(h*i.width+u)*r;for(let w=0;w<r;w++)o[g+w]=e.data[m+w]??0}}this.writeRegion(a,i.x,i.y,i.width,i.height,o)}restore(e,t,a){return this.restoreInto(e,t,a,a)}restoreInto(e,t,a,s){return this.ready?(this.clearParticles(e,a),this.clearTextures(a),this.pasteTextures(t,s),this.pasteParticles(e,t,s),!0):!1}restoreFromVram(e,t,a){return this.ready?(this.clearParticles(e,a),this.copyLayerBack(e,t.capturedCanvas,this.system.currentCanvasTextureObject()),this.copyLayerBack(e,t.capturedField,this.field.textureObject()),this.pasteParticlesFrom(e,t.capturedBlock,a),!0):!1}restoreFieldFromVram(e,t){return!this.ready||t.capturedField===null?!1:(this.copyLayerBack(e,t.capturedField,this.field.textureObject()),!0)}restoreField(e,t,a){return this.ready?(this.zeroRegion(t,this.field.textureObject(),this.field.size),this.pasteLayer(e.field,a,this.field.textureObject(),this.field.size),!0):!1}copyLayerBack(e,t,a){t!==null&&e.copyTextureToTexture({texture:t.texture},{texture:a,origin:{x:t.rect.x,y:t.rect.y}},{width:t.rect.width,height:t.rect.height})}pasteParticlesFrom(e,t,a){if(this.pastePipeline===null||this.pasteLayout===null)return!1;const s=Math.floor(t.size/Q);if(s<=0)return!1;this.device.queue.writeBuffer(this.pasteUniforms,0,Ut(a,a,s,0,0)),this.device.queue.writeBuffer(this.highWater,0,new Uint32Array([0]));const r=this.device.createBindGroup({label:"stamp-paste-vram",layout:this.pasteLayout,entries:[{binding:0,resource:{buffer:this.system.entityBufferForSand()}},{binding:1,resource:{buffer:this.system.freeListBufferForSand()}},{binding:2,resource:{buffer:t}},{binding:3,resource:{buffer:this.pasteUniforms}},{binding:4,resource:{buffer:this.highWater}}]}),i=e.beginComputePass({label:"stamp-paste-vram"});return i.setPipeline(this.pastePipeline),i.setBindGroup(0,r),i.dispatchWorkgroups(Ge(s,ia)),i.end(),this.system.restoreHighWaterMark(this.system.entityCount),this.highWaterPhase==="idle"&&(e.copyBufferToBuffer(this.highWater,0,this.highWaterStaging,0,4),this.highWaterPhase="recorded"),!0}poll(){this.highWaterPhase==="recorded"&&(this.highWaterPhase="mapping",this.highWaterStaging.mapAsync(GPUMapMode.READ).then(()=>{const e=new Uint32Array(this.highWaterStaging.getMappedRange().slice(0));this.highWaterStaging.unmap(),this.pendingHighWater=e[0]??null,this.highWaterPhase="idle"},()=>{this.highWaterPhase="idle"}))}takeHighWater(){const e=this.pendingHighWater;return this.pendingHighWater=null,e}pendingHighWater=null;ensureUpload(e){this.upload!==null&&e<=this.uploadCapacity||(this.upload?.destroy(),this.uploadCapacity=e,this.upload=this.device.createBuffer({label:"stamp-upload",size:Math.max(Q,e*Q),usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}))}destroy(){this.clearUniforms.destroy(),this.pasteUniforms.destroy(),this.upload?.destroy(),this.highWater.destroy(),this.highWaterPhase="mapping",this.highWaterStaging.destroy()}}function Ut(n,e,t,a,s){const r=new ArrayBuffer(is),i=new Float32Array(r),o=new Uint32Array(r);return i[0]=n.min[0],i[1]=n.min[1],i[2]=n.max[0],i[3]=n.max[1],i[4]=e.min[0],i[5]=e.min[1],i[6]=e.max[0],i[7]=e.max[1],o[8]=t,o[9]=a,o[10]=s,o[11]=0,r}const Wt=1;class Fe{device;system;copier;paster;captured=!1;box=null;pendingStamp=null;constructor(e,t,a,s){this.device=e,this.system=t,this.copier=a,this.paster=s}static async create(e,t,a){const[s,r]=await Promise.all([wt.create(e,t,a),pn.create(e,t,a)]);return new Fe(e,t,s,r)}get hasSnapshot(){return this.captured}get ready(){return this.copier.ready&&this.paster.ready}capture(e){if(!this.ready)return;const t=Dt(this.system.canvasSize);this.copier.record(e,t)&&(this.copier.stageTexturesInVram(e,t),this.box=t,this.captured=!0,this.pendingStamp=null)}restore(e){if(!this.captured||this.box===null||!this.ready)return!1;const t=this.pendingStamp;return t!==null?this.paster.restoreInto(e,t,this.box,t.box):this.paster.restoreFromVram(e,this.copier,this.box)}restoreField(e){if(!this.captured||this.box===null||!this.ready)return!1;const t=this.pendingStamp;return t!==null?this.paster.restoreField(t,this.box,t.box):this.paster.restoreFieldFromVram(e,this.copier)}poll(){this.paster.poll()}takeHighWater(){return this.paster.takeHighWater()}async exportScene(e){if(!this.ready)return null;const t=Dt(this.system.canvasSize),a=this.device.createCommandEncoder({label:"stamp-export"});if(!this.copier.record(a,t))return null;const s=this.copier.stageTextures(a,t);this.device.queue.submit([a.finish()]);const r=await this.copier.readCount(),i=await this.copier.readParticles(r),o=await this.copier.readLayer(s.canvas,dt),h=await this.copier.readLayer(s.field,ut);return Pa({box:t,particles:i,canvas:o,field:h,palette:wt.paletteRefsFor(i,c=>e.at(c).name)})}adoptScene(e){return this.ready?(this.pendingStamp=e,this.box=Dt(this.system.canvasSize),this.captured=!0,!0):!1}invalidate(){this.captured=!1,this.box=null,this.pendingStamp=null}destroy(){this.invalidate(),this.copier.destroy(),this.paster.destroy()}}class mn{system;palette=new zi;brush=new Hi;device;camera;assembler;field;targets;webcam;passes;compactor;initial;_paused=!0;restorePending=!1;wallsRestorePending=!1;shovePull=!1;eraseMode=_t;pendingWorldOp=null;captureArmed=!0;capturePending=!1;get availableEstimate(){return Math.max(0,this.system.availableSlots-this.spawnedSinceRead)}spawnedSinceRead=0;lastSeenHead=-1;spawnSeed=0;compactionPaused=!1;markDropHeld=!1;compactRequested=!1;compactedThisFrame=!1;autoCompact=!1;lastCompactedAt=-1/0;spawnedSinceCompact=0;spawnsAwaitingHighWater=0;spawnedSinceRestore=Number.MAX_SAFE_INTEGER;get justCompacted(){return this.compactedThisFrame}maxParticles=null;get maxParticlesSetting(){return this.maxParticles}setMaxParticlesSetting(e){this.maxParticles=e}strokePrevUv=null;lineAnchor=null;constructor(e){this.device=e.device,this.webcam=e.webcam,this.system=e.system,this.camera=e.camera,this.assembler=e.assembler,this.field=e.field,this.targets=e.targets,this.passes=e.passes,this.compactor=e.compactor,this.initial=e.initial}static async create(e){const t=await Be.create(e.device,e.system),a=await ze.create(e.device,e.system),s=await Fe.create(e.device,e.system,e.field),r=new mn({...e,passes:t,compactor:a,initial:s,webcam:e.webcam??null});return r.startEmpty(),r}get paused(){return this._paused}get hasInitialConditions(){return this.initial.hasSnapshot}get editingInitialConditions(){return this._paused&&this.captureArmed}get liveEstimate(){return this.system.entityCount-this.availableEstimate}get compactionStats(){const e=this.system.entityCount,t=this.system.activeEntityCount,a=Math.max(0,Math.min(e,this.liveEstimate));return{live:a,mark:t,capacity:e,occupancy:Cs(a,t),paused:this.compactionPaused,compactPending:this.compactRequested,autoCompact:this.autoCompact}}async auditPool(){return this.system.auditPoolNow()}setAutoCompact(e){this.autoCompact=e}considerAutoCompact(){if(this.compactionPaused||!this.compactor.ready)return;const e=this.compactionStats;Nr({enabled:this.autoCompact,idle:!this.compactRequested,live:e.live,mark:e.mark,now:performance.now(),lastCompactedAt:this.lastCompactedAt})&&(this.compactRequested=!0)}setCompactionPaused(e){this.compactionPaused=e,e&&(this.compactRequested=!1)}get compactPending(){return this.compactRequested}requestCompaction(){return this.compactionPaused?{queued:!1,reason:"compaction is paused"}:this.compactRequested?{queued:!1,reason:"already queued"}:this.compactor.ready?this.compactionStats.mark===0?{queued:!1,reason:"the world is empty"}:(this.compactRequested=!0,{queued:!0,reason:""}):{queued:!1,reason:"the compaction passes did not compile"}}startEmpty(){this.system.resetLifetimes(),this.system.setFrameCount(Wt),this.spawnedSinceRead=0,this._paused=!0,this.captureArmed=!0}togglePause(){this._paused=!this._paused}setPaused(e){this._paused=e}restoreWalls(){return this.initial.hasSnapshot?(this.wallsRestorePending=!0,!0):!1}reset(){return this.editingInitialConditions?!1:this.initial.hasSnapshot?(this.restorePending=!0,this._paused=!0,this.captureArmed=!0,!0):(this.startEmpty(),!0)}setInitialConditions(){return!this._paused||this.captureArmed?!1:(this.capturePending=!0,this.captureArmed=!0,!0)}applyPalette(e,t){const s=this.palette.master.world??t;this.system.applyProject(this.palette.configsForUpload(e),s),this.field.setWrap(!1)}applyPreferences(e){this.system.physicsSteps=e.physicsSteps,this.system.setFieldStrengths(kn(e))}async applyWorldSize(e,t,a){const[s,r]=yt(e.worldSize),i=Jt(e.canvasAspect,r),o=this.maxParticles??s,h=await zt.create({device:this.device,config:t,world:this.palette.master.world??a,canvasSize:i,entityCount:o,sqrtWorldSize:Math.sqrt(e.worldSize),physicsSteps:e.physicsSteps,lifetimes:!0});h.resetLifetimes(),h.setFieldStrengths(kn(e));const c=await La.create(this.device,i);c.setWrap(!1),h.setStrafeField(c.view(),c.size),this.webcam!==null&&h.setCameraField(this.webcam.fieldView),h.applyProject(this.palette.configsForUpload(t),this.palette.master.world??a),h.setFrameCount(Wt);const[u,f,m]=await Promise.all([Be.create(this.device,h),ze.create(this.device,h),Fe.create(this.device,h,c)]),g=this.system,w=this.field,y=this.passes,E=this.compactor,b=this.initial;this.system=h,this.field=c,this.assembler.setStrafeField(c.view()),this.passes=u,this.compactor=f,this.initial=m,y.destroy(),E.destroy(),b.destroy(),this._paused=!0,this.captureArmed=!0,this.capturePending=!1,this.spawnedSinceRead=0,this.lastSeenHead=-1,this.strokePrevUv=null,this.lineAnchor=null,g.destroy(),w.destroy()}invalidateInitialConditions(){this.initial.invalidate(),this.captureArmed=!0}runFrame(e,t,a){this.targets.ensure(e.windowSize)&&(this.camera.invalidateTargets(),this.assembler.invalidateTargets()),this.spawnSeed++;const s=this.device.createCommandEncoder({label:"sand-frame"});this.pendingWorldOp==="clear"&&(this.system.resetLifetimes(),this.spawnedSinceRead=0,this.compactRequested=!1,this.spawnedSinceCompact=Number.MAX_SAFE_INTEGER,this.spawnedSinceRestore=Number.MAX_SAFE_INTEGER),this.pendingWorldOp=null,this.restorePending&&(this.restorePending=!1,this.initial.restore(s)&&(this.system.setFrameCount(Wt),this.spawnedSinceRead=0,this.markDropHeld=!0,this.lastSeenHead=this.system.availableSlots,this.spawnedSinceRestore=0,this.compactRequested=!1,this.spawnedSinceCompact=Number.MAX_SAFE_INTEGER)),this.wallsRestorePending&&(this.wallsRestorePending=!1,this.initial.restoreField(s)),this.webcam?.record(s,this.system.canvasSize),this.system.setCameraStrengths(this.webcam?.strengths()??Os),this.considerAutoCompact();const r=this.compactRequested&&this.compactor.ready;this.compactedThisFrame=!1;const i=this.brush.tool,o=this.palette.at(this.palette.selected),h=Ri(i,e.action),c=this.brush.frame(e.cursor,h,e.dt,this.availableEstimate,xi(i)&&Wi(o)),u=ks(this.palette.master.world??this.currentWorld(),this.system.sqrtWorldSize,this.palette.all().length);!r&&c!==null&&c.action===me&&(this.passes.spawn(s,u,c.stroke,c.count,this.palette.selected,this.spawnSeed),this.spawnedSinceRead+=c.count,this.spawnedSinceCompact+=c.count,this.spawnsAwaitingHighWater+=c.count,this.spawnedSinceRestore+=c.count,this.system.noteSpawned(c.count)),this.paintField(s,i,e),(this.capturePending||!this._paused&&this.captureArmed)&&(this.capturePending=!1,this.captureArmed=this._paused,this.initial.capture(s)),!this._paused&&!r&&this.system.runFrame(s,this.shoveFor(i,e));const f=i!=="erase"||Qn(this.eraseMode);!r&&c!==null&&c.action===ge&&f&&this.passes.kill(s,u,c.stroke),!this.compactionPaused&&!r&&this.passes.sortFreeList(s,c!==null&&c.action===me),r&&(this.compactedThisFrame=this.compactor.record(s),this.compactRequested=!1,this.lastCompactedAt=performance.now(),this.markDropHeld=!0,this.spawnedSinceRead=0,this.spawnedSinceCompact=0),this.system.recordFreeListRead(s),this.renderInto(s,t,a,e.cursor),this.device.queue.submit([s.finish()]),this.system.pollFreeListRead(),this.compactor.poll(),this.passes.pollHighWater(),this.initial.poll();const m=this.system.availableSlots;m!==this.lastSeenHead&&(this.lastSeenHead=m,this.spawnedSinceRead=0,this.markDropHeld=!1);const g=this.compactor.takeMark();g!==null&&this.system.noteCompactedMark(g,this.spawnedSinceCompact);const w=this.initial.takeHighWater();w!==null&&this.system.noteCompactedMark(w,this.spawnedSinceRestore);const y=this.passes.takeHighWater();return y!==null&&(this.system.noteSpawnReach(y),this.spawnsAwaitingHighWater=0),!this.compactionPaused&&!this.markDropHeld&&this.system.dropMarkIfEmpty(this.spawnedSinceRead),!0}shoveFor(e,t){if(t.cursor===null||t.action===null||e==="erase"&&t.action!==ge||e!=="shove"&&e!=="erase"||e==="erase"&&!Qn(this.eraseMode))return null;const s=Math.max(1,Math.trunc(this.system.physicsSteps))**Dn/Ws**(Dn-1);let i=(e==="erase"?Pn:Pn*this.brush.weight)/s,o=t.action===ge;return e==="shove"&&this.shovePull&&(o=!o),o&&(i=-i),{center:t.cursor,strength:i,size:this.brush.worldRadius}}paintField(e,t,a){const s=t==="erase",r=s?Ci(this.eraseMode)?"walls":null:Ti(t)?Ps(t):null;if(r===null){this.lineAnchor=null;return}if(a.cursor===null){this.strokePrevUv=null;return}const i=We(a.cursor,this.field.size);if(a.shift&&this.strokePrevUv===null){if(a.action===null){this.lineAnchor??=i;return}const c=this.lineAnchor??i,u=this.fieldBrush(r,!0);!s&&a.action===me?this.field.draw(e,i,c,u):this.field.erase(e,i,c,u),this.lineAnchor=i;return}if(a.action===null){this.strokePrevUv=null,a.shift||(this.lineAnchor=null);return}const o=this.strokePrevUv??i;this.strokePrevUv=i,this.lineAnchor=null;const h=this.fieldBrush(r,!1);!s&&a.action===me?this.field.draw(e,i,o,h):this.field.erase(e,i,o,h)}fieldBrush(e,t){return{drawSize:this.brush.radius,drawPower:this.brush.tool==="erase"?ue:this.brush.weight,mode:"diverge",layer:e,drawAngle:0,lineGain:t?Ds:1}}async exportScene(){return this.initial.exportScene(this.palette)}importScene(e){return this.initial.adoptScene(e)?(this.restorePending=!0,this._paused=!0,this.captureArmed=!0,!0):!1}clearField(e){const t=this.device.createCommandEncoder({label:"sand-clear-field"});this.field.clear(t,e),this.device.queue.submit([t.finish()])}clearParticles(){this.pendingWorldOp="clear",this.restorePending=!1}async resizeEntities(e,t,a){const s=Math.max(1,Math.trunc(e));if(this.maxParticles=s,s===this.system.entityCount)return;const r=await zt.create({device:this.device,config:t,world:this.palette.master.world??a,canvasSize:this.system.canvasSize,entityCount:s,sqrtWorldSize:this.system.sqrtWorldSize,physicsSteps:this.system.physicsSteps,lifetimes:!0});r.resetLifetimes(),r.setStrafeField(this.field.view(),this.field.size),this.webcam!==null&&r.setCameraField(this.webcam.fieldView),r.applyProject(this.palette.configsForUpload(t),this.palette.master.world??a),await this.system.migrateEntitiesTo(r),r.setFrameCount(this.system.frameCount);const i=this.system;this.system=r,this.passes.destroy(),this.passes=await Be.create(this.device,r),this.compactor.destroy(),this.compactor=await ze.create(this.device,r),this.initial.destroy(),this.initial=await Fe.create(this.device,r,this.field),this.captureArmed=!0,this.capturePending=!1,this.spawnedSinceRead=0,this.lastSeenHead=-1,i.destroy()}currentWorld(){return this.palette.master.world??this.fallbackWorld}fallbackWorld;colorMode=Ye;toggleCameraMode(){return this.camera.state.toggleMode(),this.camera.state.mode}renderInto(e,t,a,s){const r=this.targets.size;if(r===null)return;const i={canvas:this.system.currentCanvasTexture(),canvasSize:this.system.canvasSize,windowSize:r,entities:this.system.entityBufferForRendering(),entityCount:this.system.activeEntityCount,colorMode:Yi(this.colorMode),swatchColors:this.palette.appearanceForUpload()};this.camera.beginFrame(i,1),this.camera.clearAccumulator(e),this.camera.render(e,i);const o=this.camera.state,h={canvasSize:this.system.canvasSize,windowSize:r,pan:o.pan,zoom:o.zoom},c={...Us,showField:t.fieldOpacity>0,showTrails:t.fieldOpacity>0,reticleCenter:s===null?[0,0]:We(s,this.system.canvasSize),reticleRadius:s===null?0:this.brush.reticleRadius,linePreview:this.lineAnchor===null||s===null?null:{from:this.lineAnchor,to:We(s,this.system.canvasSize)}};this.assembler.present(e,this.camera.result(),a,h,t,c)}destroy(){this.initial.destroy()}}const Vr=.12;function ca(n,e){const t=1-n.trailPersistence,a=1-e.trailPersistence,s=Math.max(t,a);return s<=0?!0:Math.abs(t-a)<=Vr*s}const rs="fluoddity.sand.loaderCollapsed";function ha(n=os()){if(n===null)return new Set;try{const e=JSON.parse(n.getItem(rs)??"[]");return Array.isArray(e)?new Set(e.filter(t=>typeof t=="string")):new Set}catch{return new Set}}function Yr(n,e=os()){if(e!==null)try{e.setItem(rs,JSON.stringify([...n].sort()))}catch{}}function os(){try{return typeof localStorage>"u"?null:localStorage}catch{return null}}const da=.75,$r=.5,ua=45,qr=500,jr=10,Kr="http://www.w3.org/2000/svg";function Xr(n){switch(n){case"brush":return"Paint the selected swatch  ·  right-drag erases";case"erase":return"Rub out particles and walls  ·  right-drag also pulls them in  ·  Shift for line tool";case"stamp":return"Stamp is not built yet";case"shove":return`${Un.shove}  ·  right-drag does the opposite of Push/Pull`;default:return`${Un[n]}  ·  right to erase  ·  Shift for line tool`}}const Zr={brush:'<path d="M17 3l4 4-9 9-4-4z"/><path d="M8 12l4 4-2 3a4 4 0 01-5 1 4 4 0 001-5z"/>',erase:'<path d="M4 16l8-8a2 2 0 013 0l4 4a2 2 0 010 3l-5 5H7z"/><path d="M9 21h12"/>',shove:'<path d="M12 4v16"/><path d="M8 8l4-4 4 4"/><path d="M8 16l4 4 4-4"/><path d="M3 12h4"/><path d="M17 12h4"/>',walls:'<path d="M3 6h18v12H3z"/><path d="M3 12h18"/><path d="M9 6v6"/><path d="M15 12v6"/>',trails:'<path d="M3 17c4-8 14 2 18-6"/>',stamp:'<path d="M8 3h8v5l2 4H6l2-4z"/><path d="M5 16h14v5H5z"/>'},Jr='<path class="fill" d="M8 5.5v13l10.5-6.5z"/>',Qr='<path class="fill" d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z"/>',eo='<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4 4v4.5h4.5"/>',fa=["radial-gradient(circle at 35% 35%, #b7e07a, #3f8a4a 55%, #173a22)","conic-gradient(from 0deg, #5fb0e8, #1b2f5c, #b78be0, #1b2f5c, #5fb0e8)","linear-gradient(160deg, #f0c078, #a5601a 50%, #3a2210)","radial-gradient(circle at 60% 40%, #f08a7a, #4fc3b8 55%, #103a44)"],it="conic-gradient(from 45deg, #3a3f4a, #6b7280, #3a3f4a, #6b7280, #3a3f4a)",to=["radial-gradient(circle at 30% 35%, #e8a33d 0 18%, transparent 19%), radial-gradient(circle at 65% 60%, #5fb0e8 0 22%, transparent 23%), #1d2027","repeating-linear-gradient(45deg, #7cc27a 0 5px, #1d2027 5px 11px)"],no={erase:[{id:"clear-particles",label:"Clear all particles",tint:"red"},{id:"erase-mode",label:"Mode",tint:"yellow"},{id:"clear-walls",label:"Clear all walls",tint:"white"}],shove:[{id:"push",label:"Push",tint:"red"},{id:"pull",label:"Pull",tint:"white"}],walls:[{id:"clear-walls",label:"Clear all walls",tint:"red"},{id:"restore-walls",label:"Restore initial walls",tint:"white"}]};function pa(n){return n==="erase"||n==="shove"||n==="walls"}class ao{store;callbacks;palette=null;root=document.documentElement;shell;canvas;side;simSection;toolbox;toolboxLabel;bar;swatchesEl;statusEl;bannerEl;setIcButton;worldPick;worldGrid;loaderEl;loaderSlotEl;loaderListEl;toolButtons=[];sizeButtons=[];pushPull=[];eraseModeButtons=[];eraseMode=null;playButton;pauseButton;loadingInto=null;worldMenuOpen=!1;displayed=[];builtSignature="";fitting=0;uiScale=1;suppressClickUntil=0;worldSignature=null;paintedIcons=new WeakMap;constructor(e,t){this.store=e,this.callbacks=t;const a=i=>{const o=document.getElementById(i);if(o===null)throw new Error(`sand.html is missing #${i}`);return o};this.shell=a("shell"),this.canvas=a("app"),this.side=a("side"),this.simSection=a("simsec"),this.toolbox=a("toolbox"),this.toolboxLabel=a("toolbox-label"),this.bar=a("bar"),this.swatchesEl=a("swatches"),this.statusEl=a("sand-status"),this.bannerEl=a("ic-banner"),this.setIcButton=a("ic-set"),this.setIcButton.addEventListener("click",()=>this.callbacks.onSetInitialConditions()),this.worldPick=a("wpick"),this.worldGrid=a("wgrid"),this.loaderEl=a("loader"),this.loaderSlotEl=a("loader-slot"),this.loaderListEl=a("loader-list"),this.buildTools(a("tools")),this.buildSizes(a("sizes")),this.buildSizes(a("sizes-band")),this.buildSim(a("simrow"),a("reset-slot")),this.buildActions(),this.buildStamps(),this.buildWorlds([]),a("wtrig").addEventListener("click",()=>this.setWorldMenu(!this.worldMenuOpen));let s=null;document.addEventListener("pointerdown",i=>{this.worldMenuOpen&&(i.target instanceof Node&&this.worldPick.contains(i.target)||(this.setWorldMenu(!1),i.target===this.canvas&&(s=i.pointerId,i.stopPropagation(),i.preventDefault())))},{capture:!0}),document.addEventListener("pointermove",i=>{i.pointerId===s&&i.stopPropagation()},{capture:!0});const r=i=>{i.pointerId===s&&(s=null,i.stopPropagation())};document.addEventListener("pointerup",r,{capture:!0}),document.addEventListener("pointercancel",r,{capture:!0}),this.loaderEl.addEventListener("click",i=>{i.target===this.loaderEl&&this.closeLoader()}),this.renderSwatches([0]),new ResizeObserver(()=>this.relayout()).observe(this.shell),this.relayout()}attach(e){this.palette=e,this.builtSignature=""}get loaderOpen(){return this.loadingInto!==null}canvasAspect(){const e=this.canvas.clientWidth,t=this.canvas.clientHeight;return e>0&&t>0?e/t:1}displayedSlots(){return this.displayed}applyTheme(e){this.root.dataset.theme=e.id,this.relayout()}setStatus(e){this.statusEl.textContent=e}token(e,t){const a=parseFloat(getComputedStyle(this.root).getPropertyValue(e));return Number.isFinite(a)?a:t}relayout(){const e=this.shell.clientWidth,t=this.shell.clientHeight;if(e<=0||t<=0)return;const a=t>e?"band":"sidebar";this.shell.dataset.plan=a,this.shell.dataset.box="off";const s=f=>{this.root.style.setProperty("--ui",String(f))},r=f=>(s(f),this.canvas.clientWidth*this.canvas.clientHeight/(e*t)),i=f=>{s(f);const m=this.simSection.offsetTop+this.simSection.offsetHeight-this.side.offsetTop;return this.side.clientHeight-m>=(this.token("--box-h",170)+this.token("--pad",5))*f},o=f=>(s(f),this.side.scrollHeight>this.side.clientHeight+1),h=(f,m,g)=>{for(let w=0;w<12;w++){const y=(f+m)/2;g(y)?f=y:m=y}return[f,m]},c=this.token("--ui-base",1.25);let u=c;if(r(c)>da&&(u=h(c,c*4,f=>r(f)>da)[1],a==="sidebar")){let f=null;i(c)?f=i:o(c)||(f=m=>!o(m)),f!==null&&!f(u)&&(u=h(c,u,f)[0])}s(u),this.uiScale=u,a==="sidebar"&&i(u)&&(this.shell.dataset.box="on"),this.layoutSwatches()}layoutSwatches(){const e=this.uiScale,t=this.token("--sw-d",44),a=this.token("--sw-gap",5),s=this.swatchesEl.clientWidth;if(s<=0)return;const r=[...this.swatchesEl.children],i=Math.max(1,Math.floor((s+.5)/((t+a)*e)));this.fitting=Math.min(r.length,i),r.forEach((u,f)=>{u.hidden=f>=this.fitting});let o=a;const h=s*$r,c=Math.max(1,this.fitting);c*(t+o)*e<h&&ua>o&&(o=Math.min(ua,Math.max(o,h/(c*e)-t))),this.bar.style.setProperty("--sw-gap",String(o))}icon(e,t="0 0 24 24"){const a=document.createElementNS(Kr,"svg");return a.setAttribute("viewBox",t),a.setAttribute("aria-hidden","true"),a.innerHTML=e,a}button(e,t,a){const s=document.createElement("button");return s.type="button",s.className=e,s.title=t,s.addEventListener("click",a),s}buildTools(e){for(const t of Me){const a=this.button("b tool",Xr(t),()=>this.callbacks.onTool(t));a.dataset.tool=t;const s=document.createElement("span");s.textContent=Re[t],a.append(this.icon(Zr[t]),s),e.append(a),this.toolButtons.push(a)}}buildSizes(e){const t=Ae[Ae.length-1]??1;Ae.forEach((a,s)=>{const r=this.button("b size",`Brush size ${s+1}`,()=>this.callbacks.onBrushSize(s));r.dataset.size=String(s);const i=document.createElement("span");i.style.setProperty("--dot",(4+12*Math.sqrt(a/t)).toFixed(2)),r.append(i),e.append(r),this.sizeButtons.push(r)})}buildSim(e,t){this.playButton=this.button("b round","Play  ·  Space",()=>this.callbacks.onPlay()),this.playButton.setAttribute("aria-label","Play"),this.playButton.append(this.icon(Jr)),this.pauseButton=this.button("b round","Pause  ·  Space",()=>this.callbacks.onPause()),this.pauseButton.setAttribute("aria-label","Pause"),this.pauseButton.append(this.icon(Qr)),e.append(this.playButton,this.pauseButton);const a=this.button("b reset","Restore the initial conditions  ·  R",()=>this.callbacks.onReset()),s=document.createElement("span");s.textContent="Reset",a.append(this.icon(eo),s),t.replaceWith(a)}actionButton(e){const t=this.button(`b act ${e.tint}`,e.label,()=>this.runAction(e));return t.textContent=e.label,t.dataset.action=e.id,e.todo===!0&&(t.dataset.todo="true",t.title=`${e.label} — not built yet`),(e.id==="push"||e.id==="pull")&&(t.classList.add("pp"),this.pushPull.push(t)),e.id==="erase-mode"&&(t.title="What the eraser takes — click to change",this.eraseModeButtons.push(t)),t}runAction(e){switch(e.id){case"clear-particles":this.callbacks.onClearParticles();break;case"clear-walls":this.callbacks.onClearWalls();break;case"restore-walls":this.callbacks.onRestoreWalls();break;case"push":this.callbacks.onShoveDirection(!1);break;case"pull":this.callbacks.onShoveDirection(!0);break;case"erase-mode":this.eraseMode!==null&&this.callbacks.onEraseMode(Ni(this.eraseMode));break}}buildActions(){for(const e of["erase","shove","walls"]){const t=document.createElement("div");t.className="acts",t.dataset.for=e;const a=document.createElement("div");a.className="boxacts",a.dataset.for=e;for(const s of no[e])t.append(this.actionButton(s)),a.append(this.actionButton(s));this.bar.append(t),this.toolbox.append(a)}}buildStamps(){const e=document.createElement("div");e.className="acts",e.dataset.for="stamp";const t=document.createElement("div");t.className="stamps";const a=document.createElement("div");a.className="sgroup";const s=this.button("b act newstamp","New stamp — not built yet",()=>this.callbacks.onNotBuilt("New stamp"));s.textContent="New stamp",s.dataset.todo="true",a.append(s),to.forEach((r,i)=>{const o=document.createElement("div");o.className="sw st";const h=document.createElement("span");h.className="sw-name",h.textContent=" ";const c=this.button("swb",`Stamp ${i+1} — not built yet`,()=>this.callbacks.onNotBuilt("Stamps"));c.style.setProperty("--p",r),o.append(h,c),a.append(o)}),t.append(a),e.append(t),this.bar.append(e)}buildWorlds(e){this.worldGrid.replaceChildren();for(const t of[...e,O]){const a=document.createElement("div");a.className="wsw",a.dataset.world=String(t);const s=document.createElement("span");s.className="wl";const r=this.button("wswb","",()=>{this.setWorldMenu(!1),this.callbacks.onSelectWorld(t)});r.style.setProperty("--g",t===O?it:fa[t]??it),t===O&&(s.textContent="Custom…",r.title="The editable world: no initial conditions, and a palette you build yourself. The Dev tab’s swatch count governs this one."),a.append(s,r),this.worldGrid.append(a)}}setWorldMenu(e){this.worldMenuOpen=e,this.worldPick.dataset.open=String(e)}paintIcon(e,t,a,s){this.paintedIcons.has(e)&&this.paintedIcons.get(e)===a||(this.paintedIcons.set(e,a),a!==null?e.style.setProperty(t,ta(a)):s!==null?e.style.setProperty(t,s):e.style.removeProperty(t))}refreshWorlds(e,t,a){const s=[];for(let i=0;i<q;i++)(e[i]?.name??"")!==""&&s.push(i);const r=s.join(",");r!==this.worldSignature&&(this.worldSignature=r,this.buildWorlds(s));for(const i of this.worldGrid.children){if(!(i instanceof HTMLElement))continue;const o=Number(i.dataset.world);i.dataset.selected=String(o===t);const h=i.querySelector("button");if(h===null)continue;const c=o===O,u=c?void 0:e[o];if(this.paintIcon(h,"--g",c?a:u?.icon??null,c?it:fa[o]??it),c)continue;const f=u?.name??"",m=i.querySelector(".wl");m!==null&&(m.textContent!==f&&(m.textContent=f),u?.present===!0?(delete i.dataset.missing,h.title=`Load ${f}. Picking it again resets the scene to this world’s initial conditions.`):(i.dataset.missing="true",h.title=`"${f}" was deleted. Reassign it on the Dev tab.`))}}computeDisplayed(e,t){const a=[];for(let s=0;s<e.visibleCount;s++)(t||e.at(s).config!==null)&&a.push(s);return a}renderSwatches(e){this.swatchesEl.replaceChildren();for(const t of e){const a=document.createElement("div");a.className="sw",a.dataset.slot=String(t);const s=document.createElement("span");s.className="sw-name",s.textContent=" ";const r=document.createElement("button");r.type="button",r.className="swb",a.append(s,r),this.wireSwatch(r,t),this.swatchesEl.append(a)}}wireSwatch(e,t){e.addEventListener("click",()=>{performance.now()<this.suppressClickUntil||this.callbacks.onSelect(t)}),e.addEventListener("contextmenu",o=>{o.preventDefault(),this.openLoader(t)});let a=null,s=0,r=0;const i=()=>{a!==null&&clearTimeout(a),a=null};e.addEventListener("pointerdown",o=>{o.pointerType!=="mouse"&&(s=o.clientX,r=o.clientY,i(),a=setTimeout(()=>{a=null,this.suppressClickUntil=performance.now()+800,this.openLoader(t)},qr))}),e.addEventListener("pointermove",o=>{a!==null&&Math.hypot(o.clientX-s,o.clientY-r)>jr&&i()}),e.addEventListener("pointerup",i),e.addEventListener("pointercancel",i),e.addEventListener("pointerleave",i)}refresh(e){const t=this.palette;if(t===null)return;const a=e.selectedWorld===O;this.displayed=this.computeDisplayed(t,a);const s=`${a}|${this.displayed.join(",")}`;s!==this.builtSignature&&(this.builtSignature=s,this.renderSwatches(this.displayed),this.layoutSwatches());for(const h of this.swatchesEl.children){if(!(h instanceof HTMLElement))continue;const c=Number(h.dataset.slot),u=t.at(c),f=u.config===null;h.dataset.selected=String(c===t.selected),h.dataset.empty=String(f);const m=h.firstElementChild,g=f?"empty":u.name;m!==null&&m.textContent!==g&&(m.textContent=g);const w=h.lastElementChild;if(w instanceof HTMLElement){const y=Ga(this.displayed.indexOf(c));w.title=f?"Empty — right-click or long-press to load a config":`${u.name}${y===""?"":`  ·  ${y}`}${c===Z?"  (master — grounds the world settings)":""}`,w.style.setProperty("--swatch-color",qt(t.colorOf(c))),this.paintIcon(w,"--swatch-icon",f?null:u.icon??null,null)}}for(const h of this.toolButtons)h.dataset.selected=String(h.dataset.tool===e.tool);for(const h of this.sizeButtons)h.dataset.selected=String(Number(h.dataset.size)===e.brushSize);this.playButton.dataset.selected=String(!e.paused),this.pauseButton.dataset.selected=String(e.paused);for(const h of this.pushPull){const c=h.dataset.action==="pull";h.dataset.selected=String(c===e.shovePull)}if(this.eraseMode!==e.eraseMode){this.eraseMode=e.eraseMode;for(const h of this.eraseModeButtons)h.textContent=`Mode: ${Ii[e.eraseMode]}`}const r=this.shell.dataset.box==="on";let i="none";e.tool==="stamp"?i="stamp":pa(e.tool)&&!r&&(i=e.tool),this.bar.dataset.show!==i&&(this.bar.dataset.show=i);const o=pa(e.tool)?e.tool:"erase";this.toolbox.dataset.for!==o&&(this.toolbox.dataset.for=o,this.toolboxLabel.textContent=Re[o]),this.refreshWorlds(e.worlds,e.selectedWorld,e.customIcon),this.canvas.dataset.editing=String(e.editingInitialConditions),this.bannerEl.dataset.visible=String(e.editingInitialConditions),this.setIcButton.dataset.visible=String(e.paused&&!e.editingInitialConditions)}openLoader(e){this.loadingInto!==e&&(this.loadingInto=e,this.loaderSlotEl.textContent=`#${e+1}`+(e===Z?" (master)":""),this.loaderEl.dataset.open="true",this.fillLoader(e))}closeLoader(){this.loadingInto=null,this.loaderEl.dataset.open="false"}async fillLoader(e){this.loaderListEl.replaceChildren();const t=this.palette;if(t===null)return;if(t.at(e).config!==null){const o=document.createElement("button");o.type="button",o.className="entry",o.dataset.capture="true",o.textContent="Capture swatch icon…",o.title="Drag a circle on the canvas to picture this swatch. Esc, or a tap, clears the icon back to the flat colour.",o.addEventListener("click",()=>{this.closeLoader(),this.callbacks.onCaptureSlotIcon(e)}),this.loaderListEl.append(o);const h=document.createElement("button");h.type="button",h.className="entry",h.dataset.rename="true",h.textContent="Rename…",h.title="Give this swatch a new name. Its settings are unchanged.",h.addEventListener("click",()=>{this.closeLoader(),this.callbacks.onRenameSlot(e)}),this.loaderListEl.append(h)}const a=document.createElement("button");if(a.type="button",a.className="entry",a.dataset.paste="true",a.textContent="Paste from link…",a.title="Load a Fluoddity share link or config from the clipboard",a.addEventListener("click",()=>{this.closeLoader(),this.callbacks.onPasteLink(e)}),this.loaderListEl.append(a),e!==Z){const o=document.createElement("button");o.type="button",o.className="entry",o.dataset.none="true",o.textContent="None — clear this swatch",o.addEventListener("click",()=>{this.closeLoader(),this.callbacks.onClearSlot(e)}),this.loaderListEl.append(o)}const s=this.store.catalog(),r=t.master.world,i=ha();for(const[o,h]of Object.entries(s.categories)){if(h.length===0)continue;const c=document.createElement("h3"),u=document.createElement("button");u.type="button",u.className="category-toggle",u.dataset.category=o,u.textContent=o,c.append(u);const f=document.createElement("div");this.loaderListEl.append(c,f);const m=[],g=w=>{if(f.hidden=!w,u.dataset.expanded=String(w),w)for(const y of m.splice(0))y()};u.addEventListener("click",()=>{const w=f.hidden;g(w);const y=ha();w?y.delete(o):y.add(o),Yr(y)});for(const w of h){const y=this.store.entry(o,w);if(y===null)continue;const E=document.createElement("button");E.type="button",E.className="entry",E.textContent=w,E.addEventListener("click",()=>{this.closeLoader(),this.callbacks.onLoad(e,y)}),f.append(E),r!==null&&m.push(()=>void this.markCompatible(E,y,r))}g(!i.has(o))}this.fillWorldSources(e,r)}fillWorldSources(e,t){const a=this.callbacks.swatchSources();if(a.length===0)return;const s=document.createElement("h3");s.textContent="Worlds",this.loaderListEl.append(s);for(const r of a){const i=document.createElement("button");i.type="button",i.className="entry",i.dataset.source=r.key,i.dataset.expanded="false",i.textContent=r.label,i.title="Show this palette’s swatches";const o=document.createElement("div");o.className="source-swatches",o.hidden=!0;let h=!1;i.addEventListener("click",()=>{const c=o.hidden;o.hidden=!c,i.dataset.expanded=String(c),!(!c||h)&&(h=!0,o.textContent="Loading…",this.callbacks.readSwatchSource(r.key).then(u=>{!o.isConnected||this.loadingInto!==e||this.fillSourceSwatches(o,e,u,t)}))}),this.loaderListEl.append(i,o)}}fillSourceSwatches(e,t,a,s){if(e.replaceChildren(),a===null||a.length===0){const r=document.createElement("div");r.className="source-note",r.textContent=a===null?"Could not read this world.":"No swatches.",e.append(r);return}for(const r of a){const i=document.createElement("button");i.type="button",i.className="entry",i.dataset.swatch=String(r.slot);const o=document.createElement("span");o.className="source-dot",r.icon!==void 0?o.style.backgroundImage=ta(r.icon):r.color!==void 0&&(o.style.background=qt(r.color));const h=document.createElement("span");h.textContent=r.name===""?"Untitled":r.name;const c=document.createElement("span");if(c.className="source-index",c.textContent=`#${r.slot+1}`,i.append(o,h,c),i.addEventListener("click",()=>{this.closeLoader(),this.callbacks.onLoadSwatch(t,r)}),s!==null){const u=Ue(r.document);u!==null&&(i.dataset.compatible=String(ca(u.world,s)))}e.append(i)}}async markCompatible(e,t,a){try{const s=await this.store.read(t);e.dataset.compatible=String(ca(s.world,a))}catch{}}}const ct=1,so="worlds/default/";class ma extends Error{constructor(e){super(e),this.name="WorldPackError"}}const io=/^[a-z0-9][a-z0-9-]*$/,Zt=/^[A-Za-z0-9][A-Za-z0-9._-]*$/;function ro(n,e="world pack"){if(typeof n!="object"||n===null||Array.isArray(n))throw new ma(`${e}: not a JSON object`);const t=n;if(t.version!==ct)throw new ma(`${e}: unrecognized pack version ${String(t.version)}; expected ${ct}`);const a=[],s=new Set;if(Array.isArray(t.worlds))for(const f of t.worlds){if(typeof f!="object"||f===null)continue;const m=f,g=m.id,w=m.document,y=m.scene,E=wa(m.icon);typeof g!="string"||!io.test(g)||s.has(g)||typeof w!="string"||!Zt.test(w)||y!==null&&(typeof y!="string"||!Zt.test(y))||(s.add(g),a.push({id:g,name:typeof m.name=="string"&&m.name!==""?m.name:g,document:w,scene:y,icon:E}))}const r=Array.isArray(t.assignments)?t.assignments:[],i=Array.from({length:q},(f,m)=>{const g=r[m];return typeof g=="string"&&s.has(g)?g:""}),o=t.selectedWorld,h=typeof o=="number"&&Number.isInteger(o)&&o>=0&&o<q&&i[o]!==""?o:-1,u=(Array.isArray(t.customSlots)?t.customSlots:[]).slice(0,W).map(Va);return{version:ct,worlds:a,assignments:i,selectedWorld:h,customSlots:u,customIcon:wa(t.customIcon)}}function wa(n){return typeof n=="string"&&Zt.test(n)?n:null}function oo(n){return JSON.stringify({version:ct,worlds:n.worlds,assignments:n.assignments,selectedWorld:n.selectedWorld,customSlots:n.customSlots,customIcon:n.customIcon},null,2)+`
`}function lo(n,e){const t=n.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40)||"world";if(!e.has(t))return t;for(let a=2;;a++){const s=`${t}-${a}`;if(!e.has(s))return s}}function Mt(n,e,t){return`${n}.${e}.${t}`}function co(n){return n.length>=2&&n[0]===31&&n[1]===139}const ht=1;class ga extends Error{constructor(e){super(e),this.name="WorldFormatError"}}const wn=["worldSize","canvasAspect","physicsSteps","brightness","tonemapSoftness","bloomEnabled","bloomThreshold","bloomIntensity","bloomRadius","fieldOpacity","fieldAlwaysShow","trailsAlwaysShow","showReticle"];function ho(n){const e=[];n.slots.forEach((a,s)=>{a.document===null||a.document===void 0||e.push({slot:s,name:a.name,document:a.document,...a.color===void 0?{}:{color:a.color},...a.icon===void 0?{}:{icon:a.icon}})});const t={};for(const a of wn)t[a]=n.preferences[a];return{version:ht,notes:n.notes??"",slots:e,preferences:t,visibleCount:n.visibleCount,colorMode:n.colorMode??Ye,sceneFrame:n.sceneFrame??null,icon:n.icon??null}}function uo(n){if(typeof n!="object"||n===null)return null;const e=n,t=r=>Array.isArray(r)&&r.length===2&&typeof r[0]=="number"&&typeof r[1]=="number"&&Number.isFinite(r[0])&&Number.isFinite(r[1])?[r[0],r[1]]:null,a=t(e.min),s=t(e.max);return a===null||s===null||!(s[0]>a[0]&&s[1]>a[1])?null:{min:a,max:s}}function va(n,e="world"){if(typeof n!="object"||n===null||Array.isArray(n))throw new ga(`${e}: not a JSON object`);const t=n,a=t.version;if(a!==ht)throw new ga(`${e}: unrecognized world version ${String(a)}; expected ${ht}`);const s=[],r=t.slots;if(Array.isArray(r))for(const u of r){if(typeof u!="object"||u===null)continue;const f=u,m=f.slot;if(typeof m!="number"||!Number.isInteger(m)||m<0||m>=W||f.document===void 0||f.document===null)continue;const g=Ba(f.color),w=Ie(f.icon);s.push({slot:m,name:typeof f.name=="string"?f.name:"",document:f.document,...g===null?{}:{color:g},...w===null?{}:{icon:w}})}const i={},o=t.preferences;if(typeof o=="object"&&o!==null)for(const[u,f]of Object.entries(o)){if(!Ia(u)||!fo(u))continue;const m=Qt(u,f);m!==null&&(i[u]=m)}const h=t.visibleCount,c=typeof h=="number"&&Number.isFinite(h)?Math.trunc(h):0;return{version:ht,notes:typeof t.notes=="string"?t.notes:"",slots:s,preferences:i,visibleCount:c,colorMode:hn(t.colorMode),sceneFrame:uo(t.sceneFrame),icon:Ie(t.icon)}}async function gt(n,e){if(typeof n!="object"||n===null||Array.isArray(n))return n;const t={...n},a=async s=>{const r=Ie(s.icon);if(r===null){delete s.icon;return}const i=await e(r);i===null?delete s.icon:s.icon=i};return t.icon!==void 0&&t.icon!==null&&await a(t),Array.isArray(t.slots)&&(t.slots=await Promise.all(t.slots.map(async s=>{if(typeof s!="object"||s===null)return s;const r={...s};return r.icon!==void 0&&await a(r),r}))),t}function fo(n){return wn.includes(n)}function po(n,e){const t={...n};for(const a of wn){const s=e[a];if(s===void 0)continue;const r=Qt(a,s);r!==null&&(t[a]=r)}return Object.freeze(t)}class gn{pack;base;absoluteBase;constructor(e,t){this.base=t,this.absoluteBase=new URL(t,document.baseURI).href,this.pack={...e,customSlots:e.customSlots.map(a=>a.icon===void 0?a:{...a,icon:Ce(a.icon,this.absoluteBase)}),customIcon:e.customIcon===null?null:Ce(e.customIcon,this.absoluteBase)}}static async load(e=so){try{const t=await fetch(`${e}manifest.json`,{cache:"no-cache"});return t.ok?new gn(ro(await t.json(),`${e}manifest.json`),e):null}catch(t){return console.info(`No default world pack: ${String(t)}`),null}}find(e){return this.pack.worlds.find(t=>t.id===e)??null}iconUrl(e){const t=this.find(e)?.icon??null;return t===null?null:Ce(t,this.absoluteBase)}async readDocument(e){const t=this.find(e);if(t===null)return null;try{const a=await fetch(this.base+t.document);if(!a.ok)throw new Error(`${t.document}: HTTP ${a.status}`);return await gt(await a.json(),s=>Ce(s,this.absoluteBase))}catch(a){return console.error(`Could not fetch the built-in world "${e}": ${String(a)}`),null}}async read(e){const t=this.find(e);if(t===null)return null;try{const a=await fetch(this.base+t.document);if(!a.ok)throw new Error(`${t.document}: HTTP ${a.status}`);const s=await gt(await a.json(),i=>Ce(i,this.absoluteBase));let r=null;if(t.scene!==null){const i=await fetch(this.base+t.scene);if(!i.ok)throw new Error(`${t.scene}: HTTP ${i.status}`);r=await mo(await i.arrayBuffer())}return{document:s,scene:r}}catch(a){return console.error(`Could not fetch the built-in world "${e}": ${String(a)}`),null}}}async function mo(n){if(!co(new Uint8Array(n)))return n;const e=new Blob([n]).stream().pipeThrough(new DecompressionStream("gzip"));return new Response(e).arrayBuffer()}async function wo(n){const e={},t=async(m,g)=>{const w=await fetch(g);if(!w.ok)throw new Error(`could not read an icon of "${m}": HTTP ${w.status}`);const y=await w.blob(),E=new Uint8Array(await y.arrayBuffer()),b=Mt(m,await Bt(E),er(y.type));return e[b]=E,b},a=[],s=new Map,r=new Set,i=[];for(const m of n.buttons){if(m===null){i.push("");continue}let g=s.get(m.key);if(g===void 0){g=lo(m.name,r),r.add(g),s.set(m.key,g);const w=g,y=await gt(m.record.document,R=>t(w,R)),E=y?.icon,b=typeof E=="string"?E:null,A=new TextEncoder().encode(JSON.stringify(y)),L=Mt(g,await Bt(A),"json");e[L]=A;let T=null;if(m.record.scene!==null){const R=await go(new Uint8Array(m.record.scene));T=Mt(g,await Bt(R),"fwldz"),e[T]=R}a.push({id:g,name:m.name,document:L,scene:T,icon:b})}i.push(g)}const o=n.selectedWorld>=0&&(i[n.selectedWorld]??"")!==""?n.selectedWorld:-1,h=[];for(const m of n.customSlots)h.push(m.icon===void 0?m:{...m,icon:await t("custom",m.icon)});const c=n.customIcon===null?null:await t("custom",n.customIcon);e["manifest.json"]=new TextEncoder().encode(oo({worlds:a,assignments:i,selectedWorld:o,customSlots:h,customIcon:c}));const{zipSync:u}=await Ms(async()=>{const{zipSync:m}=await import("./browser-DgjYhU_s.js");return{zipSync:m}},[],import.meta.url),f=u(e,{level:0});return new Blob([f],{type:"application/zip"})}async function Bt(n){const e=new Uint8Array(await crypto.subtle.digest("SHA-256",n));return Array.from(e.slice(0,4),t=>t.toString(16).padStart(2,"0")).join("")}async function go(n){const e=new Blob([n]).stream().pipeThrough(new CompressionStream("gzip"));return new Uint8Array(await new Response(e).arrayBuffer())}const He="builtin:";function Oe(n){if(n==="")return null;if(n.startsWith(He)){const e=n.slice(He.length);return e===""?null:{kind:"builtin",id:e}}return{kind:"library",name:n}}function rt(n){return n===""?"":`${He}${n}`}function vo(n){return n.startsWith(He)}class yo{store;callbacks;rootEl;titleEl;listEl;open=!1;constructor(e,t){this.store=e,this.callbacks=t;const a=s=>{const r=document.getElementById(s);if(r===null)throw new Error(`sand.html is missing #${s}`);return r};this.rootEl=a("world-loader"),this.titleEl=a("world-loader-title"),this.listEl=a("world-loader-list"),this.rootEl.addEventListener("click",s=>{s.target===this.rootEl&&this.close()})}get isOpen(){return this.open}show(e="Load world"){this.open=!0,this.titleEl.textContent=e,this.rootEl.dataset.open="true",this.fill()}close(){this.open=!1,this.rootEl.dataset.open="false"}fill(){this.listEl.replaceChildren();const e=this.store.names();if(e.length===0){const t=document.createElement("div");t.className="world-empty",t.textContent=this.store.writable?'No saved worlds yet. Use "Save world as…" on the Dev tab.':"Worlds are unavailable: this browser denied local storage.",this.listEl.append(t);return}for(const t of e)this.listEl.append(this.buildRow(t))}buildRow(e){const t=document.createElement("div");t.className="world-row",t.title=`Load ${e}`;const a=document.createElement("span");a.className="world-row-name",a.textContent=e,t.append(a);const s=document.createElement("button");return s.type="button",s.className="world-row-delete",s.textContent="×",s.title=`Delete ${e}`,s.addEventListener("click",r=>{r.stopPropagation(),window.confirm(`Delete the world "${e}"? This cannot be undone.`)&&(this.callbacks.onDelete(e),this.fill())}),t.append(s),t.addEventListener("click",()=>{this.close(),this.callbacks.onLoad(e)}),t}}const ls="open",cs="custom";function ya(n){const e=[];return n.forEach((t,a)=>{t==null||t.document===null||t.document===void 0||e.push({slot:a,name:t.name,document:t.document,...t.color===void 0?{}:{color:t.color},...t.icon===void 0?{}:{icon:t.icon}})}),e}function bo(n){return[...n.slots].sort((e,t)=>e.slot-t.slot).map(e=>({slot:e.slot,name:e.name,document:e.document,...e.color===void 0?{}:{color:e.color},...e.icon===void 0?{}:{icon:e.icon}}))}function _o(n){return`world:${n}`}function Eo(n){return n.startsWith("world:")?n.slice(6):null}function So(n){const e=[{key:ls,label:`${n.openLabel} (open)`}];!n.customIsOpen&&n.customAvailable&&e.push({key:cs,label:"Custom"});for(const{ref:t,label:a}of n.worlds)t!==n.openRef&&e.push({key:_o(t),label:a});return e}async function To(n,e,t){const a=await Bs({minDevicePx:0,stampDevicePx:0,insetDevicePx:0,warnAboveDevicePx:0,circle:{minRadiusCss:Ki,instruction:t}});if(a===null)return null;const s=n.getBoundingClientRect(),r=a.x-s.left,i=a.y-s.top,o=Math.max(0,r),h=Math.max(0,i),c=Math.min(s.width,r+a.width),u=Math.min(s.height,i+a.height),f=document.createElement("canvas");f.width=e,f.height=e;const m=f.getContext("2d");if(m===null)throw new Error("could not get a 2D context for the icon");if(m.fillStyle="#000",m.fillRect(0,0,e,e),c>o&&u>h){const g=await zs(n,{x:o,y:h,width:c-o,height:u-h}),w=e/a.width;m.imageSmoothingEnabled=!0,m.imageSmoothingQuality="high",m.beginPath(),m.arc(e/2,e/2,e/2,0,Math.PI*2),m.clip(),m.drawImage(Gs(g),(o-r)*w,(h-i)*w,(c-o)*w,(u-h)*w)}return f.toDataURL("image/jpeg",ji)}async function xo(n){if(n.startsWith("data:"))return n;try{const e=await fetch(n);if(!e.ok)return n;const t=await e.blob();return await new Promise((a,s)=>{const r=new FileReader;r.onload=()=>a(String(r.result)),r.onerror=()=>s(r.error??new Error("read failed")),r.readAsDataURL(t)})}catch{return n}}const vt=[{id:"darkroom",label:"Darkroom",note:"Near-black ground, cool neutrals, a single amber accent. Photo-software calm."},{id:"system7",label:"System 7",note:"1-bit monochrome, hard square edges, inverted selection. The literal MacPaint reading."},{id:"blueprint",label:"Blueprint",note:"Indigo drafting paper, cyan hairlines, monospace labels."}],Ao=vt[0];function hs(n){return vt.find(e=>e.id===n)??Ao}const Ro=new Set(["resetOnBehaviorChange","oneClickSelection","strongLogging","showPhysicsSlider","motionBlurSamples","mobileMode","canvasAspect"]),Io={worldSize:"Target world size"},Lo={worldSize:"The world size sand builds at. A loaded world whose scene needs more room may grow the world past this, up to 2.5x. Separate from the studio’s."},No="",ke="pack";class Co{pane;palette;callbacks;prefValues;committed;configPage;configValues={};shownSlot=-1;shownGeneration=-1;devValues;committedMaxParticles;colorValues={mode:Ye,swatch:"#ffffff"};colorFolder=null;colorBlade=null;shownColorSlot=-1;poolValues={live:"—",mark:"—",occupancy:"—",sweep:"idle",autoCompact:!1,compactionPaused:!1,auditAfterSweep:!1};poolFolder=null;worldValues={};worldFolder=null;worldBlades=[];worldChoices;cameraControls=null;constructor(e,t,a,s,r){this.committed=e,this.committedMaxParticles=a,this.devValues={maxParticles:a,theme:s.theme,visibleCount:s.visibleCount},this.poolValues.autoCompact=s.autoCompact,this.poolValues.compactionPaused=s.compactionPaused,this.poolValues.auditAfterSweep=s.auditAfterSweep,this.colorValues.mode=s.colorMode,this.palette=t,this.callbacks=r,this.prefValues={...e},this.worldChoices=s.worldChoices,this.setWorldValues(s.worlds),this.pane=new Fs({title:"Fluoddity Sand",expanded:!0});const i=this.pane.element.parentElement;i!==null&&(i.style.position="fixed",i.style.top="8px",i.style.right="8px",i.style.width="280px",i.style.maxHeight="calc(100vh - 16px)",i.style.overflowY="auto",i.style.zIndex="5");const o=this.pane.addTab({pages:[{title:"Prefs"},{title:"Config"},{title:"Dev"},{title:"UI leftovers"},...s.webcam!==null?[{title:"Camera"}]:[]]}),[h,c,u,f,m]=o.pages;if(h===void 0||c===void 0||u===void 0||f===void 0)throw new Error("Tweakpane did not build the expected four pages.");this.configPage=c,this.buildPrefs(h),this.buildDev(u),this.buildLeftovers(f,s.strengths),m!==void 0&&s.webcam!==null&&(this.cameraControls=Hs(m,s.webcam,(g,w,y)=>{g.title=`${w}

${y}`})),this.syncConfig()}syncCamera(){this.cameraControls?.refresh()}buildLeftovers(e,t){const a={};for(const s of Me){if(!Ai(s)||!Ei(s))continue;a[s]=t[s];const r=e.addBinding(a,s,{label:`${Re[s]} strength`,min:.01,step:.01});r.element.title=`${Re[s]}'s strength. Each tool keeps its own.`,r.on("change",()=>{const i=Number(a[s]);Number.isFinite(i)&&i>0&&this.callbacks.onStrength(s,i)})}}buildPrefs(e){const t=new Map;for(const a of Nt){if(a.source!==Vs||Ro.has(a.field))continue;let s=t.get(a.group);s===void 0&&(s=e.addFolder({title:a.group}),t.set(a.group,s)),this.bindPref(s,a)}}bindPref(e,t){const a=_a(t),s=e.addBinding(this.prefValues,t.field,{...a,label:Io[t.field]??t.label});s.element.title=Lo[t.field]??t.help;const r=t.kind===Ys;s.on("change",i=>{if(r&&!i.last)return;const o={...this.committed,[t.field]:this.prefValues[t.field]},h=$s(o,this.committed);this.committed=o,Ca(o),h?this.callbacks.onRestartRequired(o):this.callbacks.onChange(o)})}buildDev(e){const t=e.addButton({title:"Export settings as defaults"});t.element.title="Download every sand setting as sandDefaults.json. Put it at src/sand/sandDefaults.json and commit it, and new visitors start with these settings. Returning visitors keep their own.",t.on("click",()=>this.callbacks.onExportSettings());const a=e.addBinding(this.devValues,"theme",{label:"UI style",options:Object.fromEntries(vt.map(h=>[h.label,h.id]))});a.element.title=vt.map(h=>`${h.label}: ${h.note}`).join(`
`),a.on("change",()=>{this.callbacks.onTheme(hs(String(this.devValues.theme)))});const s=e.addBinding(this.devValues,"visibleCount",{label:"Swatches",min:jt,max:W,step:1});s.element.title=`How many swatch buttons the tray shows, ${jt}-${W}. Display only: configs in hidden slots keep running and keep their particles. Lowering this does not delete anything.`,s.on("change",()=>{this.callbacks.onVisibleCount(Number(this.devValues.visibleCount))});const r=e.addBinding(this.devValues,"maxParticles",{label:"Max Particles",format:h=>String(Math.round(h))});r.element.title="Overrides the world-size-derived particle cap. Applied on Enter: the entity buffer is rebuilt and live particles are carried across, truncated if the new buffer is smaller.",r.on("change",h=>{if(!h.last)return;const c=Math.round(Number(this.devValues.maxParticles));if(!Number.isFinite(c)||c<1){this.devValues.maxParticles=this.committedMaxParticles,this.pane.refresh();return}c!==this.committedMaxParticles&&(this.committedMaxParticles=c,this.callbacks.onMaxParticles(c))});const i=h=>h==="trail"?"View: Trail map":"View: Particles",o=e.addButton({title:i("particles")});o.element.title="Switch between the particle camera and the trail map. Useful for checking that a world’s trails were restored. Not saved.",o.on("click",()=>{o.title=i(this.callbacks.onToggleView())}),this.buildColor(e),this.buildWorlds(e),this.buildPool(e)}buildColor(e){const t=e.addFolder({title:"Colour",expanded:!0});this.colorFolder=t;const a=t.addBinding(this.colorValues,"mode",{label:"Colour by",options:Object.fromEntries(Fa.map(r=>[Vi[r],r]))});a.element.title=`How each particle is coloured.
Behavior: hue from the rule’s own output — the original look.
Cohort: hue by sub-population, for telling one config’s cohorts apart.
Swatch: the colour set below, for telling MATERIALS apart.

Behavior and Cohort read each config’s own Color Sensitivity and Color Offset (Config tab) as hue = Sensitivity × signal + Offset. Swatch uses neither — its colour was chosen outright, below.

A display choice: it applies immediately, including while paused.`,a.on("change",()=>{this.callbacks.onColorMode(hn(this.colorValues.mode))});const s=t.addBinding(this.colorValues,"swatch",{label:"Swatch colour",view:"color"});this.colorBlade=s,s.element.title="The colour particles painted from the SELECTED swatch render in, under Colour by: Swatch. Saved with the world. Value is ignored — brightness belongs to the frame, not to one material — so a dark pick returns its hue and saturation at full value.",s.on("change",()=>{const r=Di(String(this.colorValues.swatch));if(r===null)return;const i=this.palette.colorOf(this.palette.selected),o=r.saturation===0?{hue:i.hue,saturation:0}:r;this.callbacks.onSwatchColor(this.palette.selected,o)})}syncSwatchColor(){const e=this.palette.selected,t=qt(this.palette.colorOf(e));if(t===this.colorValues.swatch&&e===this.shownColorSlot)return;this.shownColorSlot=e,this.colorValues.swatch=t;const a=Ga(e),s=this.colorBlade;s!==null&&(s.label=`Swatch ${a===""?`#${e+1}`:a}`),this.colorFolder?.refresh()}setHidden(e){const t=this.pane.element.parentElement;t!==null&&(t.style.visibility=e?"hidden":"")}adoptColorMode(e){this.colorValues.mode=e,this.colorFolder?.refresh()}buildWorlds(e){const t=e.addFolder({title:"Worlds",expanded:!0});this.worldFolder=t;const a=t.addButton({title:"Save world as…"});a.element.title="Save the palette, the preferences and the current initial conditions as a named world. Saving over an existing name asks first.",a.on("click",()=>this.promptSaveWorld());const s=t.addButton({title:"Load world"});s.element.title="Open the world library. Loading one replaces the palette, the preferences and the initial conditions — it is how a world is edited. Worlds are deleted from here too.",s.on("click",()=>this.callbacks.onOpenWorldLibrary());const r=t.addButton({title:"Export world setup"});r.element.title="Download the world buttons, the worlds they load and Custom’s swatches as a world pack. Empty public/worlds/default/, unzip it there and commit, and new visitors start with this setup.",r.on("click",()=>this.callbacks.onExportWorldSetup());const i=t.addButton({title:"Capture world swatch icon"});i.element.title="Drag a circle on the canvas to picture the current world in the World menu. Esc, or a tap, clears it back to the stand-in. Like a palette edit, it is kept by saving the world.",i.on("click",()=>this.callbacks.onCaptureWorldIcon()),this.buildWorldSlots(t)}buildWorldSlots(e){const t=this.worldChoices;for(let a=0;a<q;a++){const s=ba(a),r=t.packDefaults[a]??"",i={[`Default (${r===""?"none":r})`]:ke,None:No};for(const c of t.builtins)i[`${c.label} (built-in)`]=c.ref;for(const c of t.library)i[c]=c;const o=this.worldValues[s]??ke;Object.values(i).includes(o)||(i[`${o} (missing)`]=o);const h=e.addBinding(this.worldValues,s,{label:`World ${a+1}`,options:i});h.element.title=`Which world the panel's World ${a+1} button loads. Default follows the shipped world pack, so it changes when the pack does; None leaves the button empty.`,h.on("change",()=>{const c=String(this.worldValues[s]??ke);this.callbacks.onAssignWorld(a,c===ke?null:c)}),this.worldBlades.push(h)}}setWorldValues(e){for(let t=0;t<q;t++)this.worldValues[ba(t)]=e[t]??ke}refreshWorlds(e,t){this.worldChoices=e,this.setWorldValues(t);const a=this.worldFolder;if(a!==null){for(const s of this.worldBlades)s.dispose();this.worldBlades=[],this.buildWorldSlots(a)}}promptSaveWorld(){const e=window.prompt("Save world as:","");if(e===null)return;const t=e.trim();if(t!==""){if(vo(t)){window.alert(`A world name may not start with "${He}".`);return}this.worldChoices.library.includes(t)&&!window.confirm(`"${t}" already exists. Replace it?`)||this.callbacks.onSaveWorld(t)}}buildPool(e){const t=e.addFolder({title:"Particle pool",expanded:!1});this.poolFolder=t;const a=t.addBinding(this.poolValues,"live",{label:"Live",readonly:!0});a.element.title="Particles currently alive, from the free-list head. A frame or two stale — the head is read back asynchronously, never synchronously.";const s=t.addBinding(this.poolValues,"mark",{label:"Mark",readonly:!0});s.element.title="The high-water mark: how far every pass over the entities actually sweeps. THIS is what a large particle cap costs, not the live count. It rises as particles are painted and only falls when the pool empties completely or you compact.";const r=t.addBinding(this.poolValues,"occupancy",{label:"Occupancy",readonly:!0});r.element.title="Live ÷ Mark — the fraction of the swept range that is doing any work. 100% is packed. A low value means the passes are sweeping mostly dead slots, which is what compaction exists to fix.";const i=t.addBinding(this.poolValues,"sweep",{label:"Sweep",readonly:!0});i.element.title="Compaction packs the live particles to the front of the buffer so the mark can fall. It runs entirely on the GPU in a single frame, which that frame gives up its physics step for. Nothing can interrupt it.";const o=t.addBinding(this.poolValues,"autoCompact",{label:"Auto compact"});o.element.title="Compact automatically when the buffer falls below 70% occupancy. Costs one frame, which skips its physics step, and waits two seconds between compactions so painting cannot trigger a run of them.",o.on("change",()=>{this.callbacks.onAutoCompact(!!this.poolValues.autoCompact)});const h=t.addBinding(this.poolValues,"compactionPaused",{label:"Pause compaction"});h.element.title="Stop the per-frame pool ordering and the automatic mark drop. For telling whether odd behaviour is compaction or something else. Compact Now still works while this is on.",h.on("change",()=>{this.callbacks.onCompactionPaused(!!this.poolValues.compactionPaused)});const c=t.addButton({title:"Compact now"});c.element.title="Pack the live particles to the front of the buffer and rebuild the free list, so every pass stops sweeping dead slots. Runs on the GPU in one frame, which skips its physics step. No readback, nothing to interrupt.",c.on("click",()=>this.callbacks.onCompactNow());const u=t.addBinding(this.poolValues,"auditAfterSweep",{label:"Audit after sweep"});u.element.title="Run the audit automatically whenever a sweep ends, aborted or completed, and log the result. Catches a violation at the moment it appears instead of minutes later. Costs one pipeline stall per sweep.",u.on("change",()=>{this.callbacks.onAuditAfterSweep(!!this.poolValues.auditAfterSweep)});const f=t.addButton({title:"Audit pool"});f.element.title="Read the entity buffer and the free list and check that they agree: no live index offered as free, no double frees, no leaked dead slots, and nothing alive above the mark. Full report in the console. STALLS THE PIPELINE — it is a diagnostic, not a frame-path operation.",f.on("click",()=>this.callbacks.onAuditPool())}setCompactionStats(e){const t=e.compactPending?"queued":"idle",a=e.live.toLocaleString(),s=`${e.mark.toLocaleString()} / ${e.capacity.toLocaleString()}`,r=`${Math.round(e.occupancy*100)}%`;a===this.poolValues.live&&s===this.poolValues.mark&&r===this.poolValues.occupancy&&t===this.poolValues.sweep&&e.autoCompact===this.poolValues.autoCompact&&e.paused===this.poolValues.compactionPaused||(this.poolValues.live=a,this.poolValues.mark=s,this.poolValues.occupancy=r,this.poolValues.sweep=t,this.poolValues.autoCompact=e.autoCompact,this.poolValues.compactionPaused=e.paused,this.poolFolder?.refresh())}syncConfig(){this.syncSwatchColor();const e=this.palette.selected,t=this.palette.generationOf(e);e===this.shownSlot&&t===this.shownGeneration||(this.shownSlot=e,this.shownGeneration=t,this.rebuildConfig())}rebuildConfig(){for(const s of[...this.configPage.children])s.dispose();const e=this.shownSlot,t=this.palette.at(e);if(t.config===null||t.world===null){this.configPage.addBlade({view:"text",label:"Empty",parse:s=>s,value:"Right-click a square to load",disabled:!0});return}this.configValues={...t.config,...t.world};const a=new Map;for(const s of Nt){if(s.source!==Wn&&s.source!==Mn||!(s.field in this.configValues))continue;let r=a.get(s.group);r===void 0&&(r=this.configPage.addFolder({title:s.group,expanded:!1}),a.set(s.group,r)),this.bindConfig(r,s,e)}e!==Z&&this.configPage.addBlade({view:"text",label:"Note",parse:s=>s,value:"Trail Persistence/Stiffness and Boundary apply from the master square only",disabled:!0}).element.setAttribute("title","This square is not the master element, so its Trail Persistence, Trail Stiffness and Boundary settings are saved with it but do not govern the scene. Trail Weight is its own."),this.configPage.addButton({title:"Save As…"}).on("click",()=>this.promptSave(e))}bindConfig(e,t,a){const s=e.addBinding(this.configValues,t.field,_a(t));t.help!==""&&(s.element.title=t.help),s.on("change",()=>{const r=this.palette.at(a);if(r.config===null||r.world===null)return;const i=this.configValues[t.field];if(typeof i=="number"){const c=qs(t,i);c!==i&&(this.configValues[t.field]=c,s.refresh())}const o={...r.config},h={...r.world};for(const c of Nt)c.field in this.configValues&&(c.source===Wn?o[c.field]=this.configValues[c.field]:c.source===Mn&&(h[c.field]=this.configValues[c.field]));this.callbacks.onConfigEdit(a,o,h)})}promptSave(e){const t=this.palette.at(e).name||"Untitled",a=window.prompt("Save config as:",t);if(a===null)return;const s=a.trim();s!==""&&this.callbacks.onSaveConfig(e,s)}get preferences(){return this.committed}adoptPreferences(e){this.committed=e;for(const[t,a]of Object.entries(e))this.prefValues[t]=a;this.pane.refresh()}dispose(){this.cameraControls?.dispose(),this.pane.dispose()}}function ba(n){return`world${n+1}`}function _a(n){const e={label:n.label};if(n.kind===js&&n.options.length>0){const t={};return n.options.forEach((a,s)=>{t[a]=s}),e.options=t,e}return n.kind===Ks||(e.min=n.lo,e.max=n.hi,n.kind===Xs&&(e.step=1)),e}const Ea=hr(pr);function Oo(n){const e=n.catalog();for(const t of e.order){const a=e.categories[t]?.[0];if(a!==void 0){const s=n.entry(t,a);if(s!==null)return s}}return null}async function ko(){const n=document.getElementById("app");if(!(n instanceof HTMLCanvasElement))throw new Error('No <canvas id="app"> in the document.');const e=gn.load(),{device:t}=await Zs(l=>{Na("GPU device lost",l.message||String(l.reason),!0)}),a=Js(n,t);let s=pi(Ea.preferences);const r=or(void 0,Ea.session),i=await e,o=i!==null&&!rr()?{...r,slots:i.pack.customSlots,selectedWorld:i.pack.selectedWorld,worldIcon:i.pack.customIcon}:r,h=await Qs.open(),c=new ao(h,{onSelect:l=>{_e(l)},onBrushSize:l=>{p.brush.setSize(l),I()},onTool:l=>{p.brush.tool=l,I()},onPasteLink:l=>{In(l)},onClearSlot:l=>{p.palette.clear(l),p.applyPalette(b,w),I()},onCaptureSlotIcon:l=>{Rn($i,`Drag a circle to picture swatch ${l+1}. Esc or a tap clears its icon.`,d=>(p.palette.setIcon(l,d),d===null?`Swatch ${l+1} is back to its colour`:`Captured an icon for swatch ${l+1}`))},onRenameSlot:l=>{const d=p.palette.at(l);if(d.config===null)return;const v=window.prompt(`Rename swatch ${l+1}:`,d.name);if(v===null)return;const _=v.trim();_===""||_===d.name||(p.palette.set(l,{...d,name:_}),I(),S(`Renamed swatch ${l+1} to "${_}"`))},swatchSources:()=>{const l=k===O?null:K(k);return So({openLabel:l===null?"Custom":oe(l),customIsOpen:l===null,customAvailable:(F??[]).some(d=>d.document!==null),worlds:[...(i?.pack.worlds??[]).map(d=>({ref:rt(d.id),label:d.name})),...H.names().map(d=>({ref:d,label:d}))],openRef:l})},readSwatchSource:async l=>{if(l===ls)return ya(re());if(l===cs)return ya(F??[]);const d=$e.get(l);if(d!==void 0)return d;const v=Oe(Eo(l)??"");if(v===null)return null;let _=null;try{const x=v.kind==="builtin"?await(i?.readDocument(v.id)??null):(await H.read(v.name))?.document;x!=null&&(_=bo(va(x,`world "${l}"`)))}catch(x){console.error(`Could not read the swatches of ${l}: ${String(x)}`)}return $e.set(l,_),_},onLoadSwatch:(l,d)=>{const v=Ue(d.document);if(v===null||v.configs[0]===void 0){S(`Could not read "${d.name}"`);return}p.palette.set(l,{tool:ne,config:v.configs[0],world:v.world,name:d.name,...d.icon===void 0?{}:{icon:d.icon}}),d.color!==void 0&&p.palette.setColor(l,d.color),p.applyPalette(b,w),_e(l),S(`Loaded "${d.name}" into swatch ${l+1}`)},onSelectWorld:l=>{bs(l)},onLoad:(l,d)=>{(async()=>{try{const v=await h.read(d);if(v.configs[0]===void 0)return;p.palette.set(l,{tool:ne,config:v.configs[0],world:v.world,name:d.name}),p.applyPalette(b,w),_e(l)}catch(v){console.error(`Could not load ${d.name}: ${String(v)}`)}})()},onPlay:()=>Sn(),onPause:()=>Tn(),onReset:()=>{p.reset()||S("Already editing the initial conditions — nothing to reset to")},onClearParticles:()=>{ee=!0,p.clearParticles(),S("Cleared all particles")},onClearWalls:()=>{ee=!0,p.clearField("walls"),S("Cleared all walls")},onRestoreWalls:()=>{ee=!0,S(p.restoreWalls()?"Restored the initial walls":"No initial conditions yet — they are set when you first press Play")},onShoveDirection:l=>{p.shovePull=l},onEraseMode:l=>{p.eraseMode=l,I()},onSetInitialConditions:()=>ms(),onNotBuilt:l=>S(`${l} is not built yet`)}),[u,f]=yt(s.worldSize),m=Jt(c.canvasAspect(),f),g=o.maxParticles??u,w=ei({boundaryConditions:ti.KILL}),y=h.entryByName(Bn)??Oo(h),E=y===null?null:await h.read(y).catch(()=>null);if(E===null||E.configs[0]===void 0)throw new Error("No configs available to seed the palette.");const b=E.configs[0],A=await zt.create({device:t,config:b,world:w,canvasSize:m,entityCount:g,sqrtWorldSize:Math.sqrt(s.worldSize),physicsSteps:s.physicsSteps,lifetimes:!0}),L=await La.create(t,A.canvasSize);L.setWrap(!1),A.setStrafeField(L.view(),L.size);const T=await ni.create(t,ai);A.setCameraField(T.fieldView);const R=new si(t),P=await ii.create(t,new ri,R),U=await oi.create(t,R,a.format);U.setStrafeField(L.view());const p=await mn.create({device:t,system:A,camera:P,assembler:U,field:L,targets:R,webcam:T});p.fallbackWorld=w,c.attach(p.palette);let se=!1;o.slots.forEach((l,d)=>{l.color!==void 0&&p.palette.setColor(d,l.color);const v=Ue(l.document);v===null||v.configs[0]===void 0||(p.palette.set(d,{tool:ne,config:v.configs[0],world:v.world,name:l.name,...l.icon===void 0?{}:{icon:l.icon}}),se=!0)}),!se&&p.palette.at(0).config===null&&p.palette.set(0,{tool:ne,config:b,world:E.world,name:y?.name??Bn}),p.palette.setVisibleCount(o.visibleCount),p.palette.select(o.selected),p.brush.restoreSizes(o.brushSizes),p.brush.tool=o.tool,p.brush.restoreStrengths(o.strengths),p.eraseMode=o.eraseMode,p.setMaxParticlesSetting(o.maxParticles),p.setAutoCompact(o.autoCompact),p.setCompactionPaused(o.compactionPaused),p.colorMode=o.colorMode,p.applyPalette(b,w),p.applyPreferences(s);let j=hs(o.theme);const G=Array.from({length:q},(l,d)=>o.worldRefs[d]??null),K=l=>G[l]??rt(i?.pack.assignments[l]??"");let k=o.selectedWorld,Le=o.visibleCount,F=o.selectedWorld===O?null:o.slots,ce=null,Y=o.worldIcon;o.selectedWorld===O&&(ce=Y);const ie=l=>{ce=l,k===O&&(Y=l)},re=()=>p.palette.all().map((l,d)=>({name:l.name,document:na(l.config,l.world),color:p.palette.colorOf(d),...l.icon===void 0?{}:{icon:l.icon}})),H=await li.open(),$e=new Map,oe=l=>{const d=Oe(l);return d===null?"":d.kind==="builtin"?i?.find(d.id)?.name??d.id:d.name},St=l=>{const d=Oe(l);return d===null?!1:d.kind==="builtin"?(i?.find(d.id)??null)!==null:H.names().includes(d.name)},be=new Map,vn=l=>typeof l=="object"&&l!==null?Ie(l.icon):null,ds=l=>{const d=Oe(l);return d===null?null:d.kind==="builtin"?i?.iconUrl(d.id)??null:be.has(d.name)?be.get(d.name)??null:(be.set(d.name,null),H.read(d.name).then(v=>be.set(d.name,vn(v?.document))).catch(()=>{}),null)},yn=async l=>{const d=Oe(l);return d===null?null:d.kind==="builtin"?i===null?null:i.read(d.id):H.read(d.name)},Tt=()=>({builtins:(i?.pack.worlds??[]).map(l=>({ref:rt(l.id),label:l.name})),library:H.names(),packDefaults:Array.from({length:q},(l,d)=>oe(rt(i?.pack.assignments[d]??"")))}),xt=()=>({slots:F??re(),selected:p.palette.selected,brushSizes:p.brush.allSizes(),tool:p.brush.tool,strengths:p.brush.allStrengths(),eraseMode:p.eraseMode,visibleCount:Le,maxParticles:p.maxParticlesSetting,theme:j.id,worldRefs:[...G],selectedWorld:k,autoCompact:p.compactionStats.autoCompact,compactionPaused:p.compactionStats.paused,auditAfterSweep:Ze,colorMode:p.colorMode,worldIcon:Y});let he=null;const I=()=>{he!==null&&clearTimeout(he),he=setTimeout(()=>{he=null,sa(xt())},400)};window.addEventListener("pagehide",()=>{he!==null&&(clearTimeout(he),he=null,sa(xt()))});const _e=l=>{p.palette.select(l),p.brush.tool="brush",I()};c.applyTheme(j);let B=s,qe={worldSize:s.worldSize,worldAspect:m[0]/m[1],screenAspect:c.canvasAspect()},At=Promise.resolve();const bn=l=>(At=At.then(async()=>{try{await l()}catch(d){console.error(`Could not rebuild the world: ${String(d)}`),S(`World rebuild failed: ${String(d)}`)}}),At),Rt=async l=>{const d=c.canvasAspect(),v=l?.worldSize??B.worldSize,_=l?.aspect??d,x={...B,worldSize:v,canvasAspect:_};await p.applyWorldSize(x,b,w),qe={worldSize:v,worldAspect:_,screenAspect:d}},us=(l,d)=>bn(async()=>{await Rt(d)});let J=null;const fs=()=>new Promise(l=>requestAnimationFrame(()=>requestAnimationFrame(()=>l()))),ps=async()=>{const l=async()=>{const d=await En();return d===null?null:{stamp:Ct(d,"scene"),frame:null}};return p.editingInitialConditions?J!==null&&!ee?J:l():p.hasInitialConditions?J!==null?J:(p.reset(),await fs(),l()):null},_n=l=>bn(async()=>{const d=await ps(),v=d===null?null:$t(d.stamp,d.frame);if(d===null||v===null){await Rt(),S(`World ${l} — the scene was cleared`);return}const _=Kn(v.x1-v.x0,v.y1-v.y0,c.canvasAspect(),B.worldSize);await Rt({worldSize:_.worldSize,aspect:_.aspect});const x=Jn(d.stamp,v,p.system.canvasSize,d.frame);p.importScene(x.stamp),J=d,ee=!1,S(x.cropped?`World ${l} — initial conditions cropped to fit`:`World ${l} — initial conditions put back`)});let je=Promise.resolve(),Ke=0;const En=()=>{Ke++;const l=je.then(()=>p.exportScene()).finally(()=>{Ke--});return je=l.catch(()=>null),l};let ee=!1,Ee=!1;const Sn=()=>{if(!Ee){if(p.editingInitialConditions&&ee&&(J=null),Ke===0){p.setPaused(!1);return}Ee=!0,je.finally(()=>{Ee&&(Ee=!1,p.setPaused(!1))})}},ms=()=>{const l=()=>{p.setInitialConditions()&&(J=null,ee=!1,S("Set as initial conditions"))};Ke===0?l():je.finally(l)},Tn=()=>{Ee=!1,p.setPaused(!0)},ws=300,gs=.01;let Xe=null;new ResizeObserver(()=>{Xe!==null&&clearTimeout(Xe),Xe=setTimeout(()=>{Xe=null,!(Math.abs(c.canvasAspect()/qe.screenAspect-1)<gs)&&_n("reshaped")},ws)}).observe(n);const vs=4e3;let Ne=null;const S=l=>{Ne={text:l,until:performance.now()+vs},c.setStatus(l)};let Se=null,Ze=o.auditAfterSweep;const te=new Co(s,p.palette,g,{theme:j.id,visibleCount:p.palette.visibleCount,worlds:G,worldChoices:Tt(),autoCompact:o.autoCompact,compactionPaused:o.compactionPaused,auditAfterSweep:Ze,colorMode:p.colorMode,strengths:p.brush.allStrengths(),webcam:T},{onStrength:(l,d)=>{p.brush.setStrength(l,d),I()},onSaveWorld:l=>{ys(l)},onOpenWorldLibrary:()=>{et.show()},onAssignWorld:(l,d)=>{G[l]=d,I();const v=oe(K(l));S(d===null?`World ${l+1} follows the world pack${v===""?"":` → "${v}"`}`:d===""?`World ${l+1} unassigned`:`World ${l+1} → "${v}"`)},onExportWorldSetup:()=>{_s()},onCaptureWorldIcon:()=>{Rn(qi,"Drag a circle to picture this world. Esc or a tap clears its icon.",l=>(ie(l),l===null?"World icon cleared — back to the stand-in":k===O?"Captured Custom’s icon — saving it as a world carries it along":"Captured the world icon — save the world to keep it"))},onTheme:l=>{j=l,c.applyTheme(l),I()},onColorMode:l=>{p.colorMode=l,I()},onSwatchColor:(l,d)=>{p.palette.setColor(l,d),I()},onVisibleCount:l=>{p.palette.setVisibleCount(l),Le=l,I()},onChange:l=>{B=l,p.applyPreferences(l)},onRestartRequired:l=>{B=l,_n("rebuilt")},onConfigEdit:(l,d,v)=>{p.palette.edit(l,d,v),p.applyPalette(b,w),I()},onSaveConfig:(l,d)=>{(async()=>{const v=p.palette.at(l);if(!(v.config===null||v.world===null))try{await h.write(Gn,d,Ra([v.config],v.world)),p.palette.set(l,{...v,name:d}),I(),S(`Saved "${d}" to ${Gn}`)}catch(_){console.error(`Could not save ${d}: ${String(_)}`),S(`Save failed: ${String(_)}`)}})()},onMaxParticles:l=>{(async()=>{try{S(`Resizing to ${l.toLocaleString()} particles…`),await p.resizeEntities(l,b,w),I(),S(`Max particles: ${l.toLocaleString()}`)}catch(d){console.error(`Could not resize to ${l}: ${String(d)}`),S(`Resize failed: ${String(d)}`)}})()},onAutoCompact:l=>{p.setAutoCompact(l),I(),S(l?"Auto compact on — below 70% occupancy, at most once every 2s":"Auto compact off")},onCompactionPaused:l=>{p.setCompactionPaused(l),I(),S(l?"Compaction paused":"Compaction resumed")},onAuditAfterSweep:l=>{Ze=l,I(),S(l?"Auditing after every sweep":"Sweep auditing off")},onToggleView:()=>{const l=p.toggleCameraMode();return S(l==="trail"?"Showing the trail map":"Showing particles"),l},onExportSettings:()=>{const l=dr(B,xt());Sa(new Blob([l],{type:"application/json"}),"sandDefaults.json"),S("Exported sandDefaults.json — put it at src/sand/sandDefaults.json")},onAuditPool:()=>{(async()=>{try{const l=await p.auditPool(),d=zn(l);l.ok?console.log(d):console.error(d),S(ci(l))}catch(l){console.error(`Pool audit failed: ${String(l)}`),S(`Pool audit failed: ${String(l)}`)}})()},onCompactNow:()=>{Se=p.compactionStats.mark;const{queued:l,reason:d}=p.requestCompaction();l?S("Compacting…"):(Se=null,S(`Not compacting — ${d}`))}});let Te=null,de=0,Je=!1,Qe=!1;n.addEventListener("pointermove",l=>{Te={x:l.clientX,y:l.clientY},de=l.buttons}),n.addEventListener("pointerdown",l=>{ee=!0,n.setPointerCapture(l.pointerId),Te={x:l.clientX,y:l.clientY},de=l.buttons});const xn=l=>{de=l.buttons,de===0&&p.brush.release()};n.addEventListener("pointerup",xn),n.addEventListener("pointercancel",xn),n.addEventListener("pointerleave",()=>{Te=null,de=0,p.brush.release()}),n.addEventListener("contextmenu",l=>l.preventDefault()),n.addEventListener("wheel",l=>{if(c.loaderOpen||et.isOpen||l.deltaY===0)return;l.preventDefault();const d=l.deltaY>0?1:-1;if(l.shiftKey){p.brush.tool=Si(p.brush.tool,d),I();return}const v=c.displayedSlots();if(v.length===0)return;const _=Math.max(0,v.indexOf(p.palette.selected)),x=v[Bi(_,d,v.length)];x!==void 0&&_e(x)},{passive:!1}),window.addEventListener("keyup",l=>{Je=l.shiftKey}),window.addEventListener("blur",()=>{Je=!1}),window.addEventListener("keydown",l=>{if(Je=l.shiftKey,Qe||l.target instanceof HTMLInputElement)return;if(l.key==="Escape"){c.closeLoader(),c.setWorldMenu(!1),et.close();return}if(c.loaderOpen||et.isOpen)return;if(l.shiftKey&&(l.key==="v"||l.key==="V")){l.preventDefault(),Es();return}const d=Mi(l.key);if(d!==null){const v=c.displayedSlots()[d];v!==void 0&&_e(v);return}l.key===" "?(l.preventDefault(),p.paused&&!Ee?Sn():Tn()):(l.key==="r"||l.key==="R")&&(p.reset()||S("Already editing the initial conditions — nothing to reset to"))});async function ys(l){try{S(`Saving "${l}"…`);const d=await En(),v=d===null?null:_i(Ct(d,"scene")),_=v===null?null:Pa(v.stamp),x=ho({sceneFrame:v?.frame??null,slots:p.palette.all().map((C,V)=>({name:C.name,document:na(C.config,C.world),color:p.palette.colorOf(V),...C.icon===void 0?{}:{icon:C.icon}})),icon:ce,preferences:B,visibleCount:p.palette.visibleCount,colorMode:p.colorMode}),D=await gt(x,xo);await H.save(l,D,_),be.set(l,vn(D)),$e.clear(),te.refreshWorlds(Tt(),G),S(_===null?`Saved "${l}" — no initial conditions yet`:`Saved "${l}"`)}catch(d){console.error(`Could not save the world "${l}": ${String(d)}`),S(`Save failed: ${String(d)}`)}}async function It(l){const d=oe(l),v=await yn(l);if(v===null)return S(`"${d}" is missing — it may have been deleted`),!1;let _;try{_=va(v.document,d)}catch(N){return console.error(`Could not read the world "${d}": ${String(N)}`),S(`"${d}" could not be read`),!1}const x={...po(B,_.preferences),worldSize:B.worldSize,canvasAspect:B.canvasAspect};B=x,s=x,Ca(x),te.adoptPreferences(x),p.applyPreferences(x);let D=null,C=!1;if(v.scene!==null)try{D=Ct(v.scene,"world")}catch(N){console.error(`Could not read the scene of "${d}": ${String(N)}`),C=!0}const V=_.sceneFrame,z=D===null?null:$t(D,V),Cn=c.canvasAspect(),On=z===null?null:Kn(z.x1-z.x0,z.y1-z.y0,Cn,B.worldSize),Lt={worldSize:On?.worldSize??B.worldSize,aspect:On?.aspect??Cn};(Lt.worldSize!==qe.worldSize||Math.abs(Lt.aspect/qe.worldAspect-1)>1e-6)&&(S(`Loading "${d}" — rebuilding the world…`),await us(null,Lt));for(let N=0;N<W;N++)N!==Z&&p.palette.clear(N),p.palette.setColor(N,ft(N));for(const N of _.slots){const tt=Ue(N.document);tt===null||tt.configs[0]===void 0||(p.palette.set(N.slot,{tool:ne,config:tt.configs[0],world:tt.world,name:N.name,...N.icon===void 0?{}:{icon:N.icon}}),N.color!==void 0&&p.palette.setColor(N.slot,N.color))}if(_.visibleCount>0&&p.palette.setVisibleCount(_.visibleCount),p.palette.select(Z),p.colorMode=_.colorMode,te.adoptColorMode(_.colorMode),ie(_.icon),p.applyPalette(b,w),D!==null&&z!==null){const N=Jn(D,z,p.system.canvasSize,V);J={stamp:D,frame:V},ee=!1,p.importScene(N.stamp)?N.cropped?S(`Loaded "${d}" — cropped to fit this screen`):S(`Loaded "${d}"`):S(`"${d}" loaded, but its scene could not be placed`)}else J=null,p.invalidateInitialConditions(),p.clearParticles(),p.clearField("walls"),S(C?`"${d}" loaded, but its scene could not be read`:`Loaded "${d}" — no initial conditions`);return I(),!0}async function bs(l){if(l===O){if(k===O)return;k=O,An(),I(),S("Custom — your own palette and scene");return}const d=K(l);if(d!==""){if(!St(d)){S(`"${oe(d)}" is missing — reassign World ${l+1} on the Dev tab`);return}k===O&&(F=re()),k=l,await It(d)}}function An(){const l=F;if(F=null,l!==null){for(let d=0;d<W;d++)d!==Z&&p.palette.clear(d),p.palette.setColor(d,l[d]?.color??ft(d));l.forEach((d,v)=>{const _=Ue(d.document);_===null||_.configs[0]===void 0||p.palette.set(v,{tool:ne,config:_.configs[0],world:_.world,name:d.name,...d.icon===void 0?{}:{icon:d.icon}})}),ce=Y,p.palette.setVisibleCount(Le),p.palette.select(Z),p.applyPalette(b,w),J=null,p.invalidateInitialConditions(),p.clearParticles(),p.clearField("walls")}}async function _s(){try{S("Exporting world setup…");const l=[];for(let v=0;v<q;v++){const _=K(v);if(_===""){l.push(null);continue}const x=await yn(_);if(x===null){S(`World ${v+1}: "${oe(_)}" could not be read — nothing exported`);return}l.push({key:_,name:oe(_),record:x})}const d=await wo({buttons:l,selectedWorld:k,customSlots:F??re(),customIcon:Y});Sa(d,"default-worlds.zip"),S("Exported default-worlds.zip — empty public/worlds/default/ and unzip it there")}catch(l){console.error(`Could not export the world setup: ${String(l)}`),S(`Export failed: ${String(l)}`)}}const et=new yo(H,{onLoad:l=>{It(l)},onDelete:l=>{(async()=>{try{await H.remove(l),$e.clear(),be.delete(l),te.refreshWorlds(Tt(),G),S(`Deleted "${l}"`)}catch(d){console.error(`Could not delete "${l}": ${String(d)}`),S(`Delete failed: ${String(d)}`)}})()}});async function Rn(l,d,v){if(!Qe){Qe=!0,te.setHidden(!0);try{const _=await To(n,l,d);S(v(_)),I()}catch(_){console.error(`Icon capture failed: ${String(_)}`),S(`Icon capture failed: ${String(_)}`)}finally{te.setHidden(!1),Qe=!1}}}async function Es(){const l=p.palette.firstEmpty();if(l===null){S("No empty swatch — right-click one to load into it");return}await In(l)}async function In(l){const d=await hi(),v=d!==null&&d.trim()!==""?d:window.prompt("Paste a Fluoddity share link or config:")??"";if(v.trim()==="")return;let _;try{const D=di(v);if(D===null){S("That does not look like a Fluoddity config");return}_=Aa(D,"clipboard")}catch(D){S("That config could not be read — it may have been truncated"),console.warn(`Rejected a pasted config: ${String(D)}`);return}const x=_.configs[0];if(x===void 0){S("That config held no elements");return}p.palette.set(l,{tool:ne,config:x,world:_.world,name:"Pasted"}),p.applyPalette(b,w),_e(l),S(`Loaded into swatch ${l+1}`)}let Ln=performance.now();const Nn=l=>{const d=Math.min(.1,Math.max(0,(l-Ln)/1e3));Ln=l;const v=a.size();let _=null;if(Te!==null){const C=n.getBoundingClientRect(),V=[(Te.x-C.left)/C.width*v[0],(Te.y-C.top)/C.height*v[1]],z=P.state;_=ui(fi(V,v),A.canvasSize,v,z.pan,z.zoom)}let x=null;(de&1)!==0?x=me:(de&2)!==0&&(x=ge),p.runFrame({cursor:_,action:x,windowSize:v,dt:d,shift:Je},B,a.context.getCurrentTexture().createView()),te.syncConfig(),te.syncCamera();const D=p.compactionStats;if(te.setCompactionStats(D),Se!==null&&D.mark<Se){const C=Se;Se=null,S(`Compacted — mark ${C.toLocaleString()} → ${D.mark.toLocaleString()}`)}p.justCompacted&&Ze&&(async()=>{const C=await p.auditPool(),V=`[after compaction] ${zn(C)}`;C.ok?console.log(V):console.error(V)})().catch(C=>console.error(`Audit failed: ${String(C)}`)),c.refresh({tool:p.brush.tool,brushSize:p.brush.sizeSlot,paused:p.paused,editingInitialConditions:p.editingInitialConditions,worlds:Array.from({length:q},(C,V)=>{const z=K(V);return{name:oe(z),present:St(z),icon:V===k?ce:ds(z)}}),selectedWorld:k,customIcon:Y,shovePull:p.shovePull,eraseMode:p.eraseMode}),Ne!==null&&performance.now()<Ne.until?c.setStatus(Ne.text):(Ne=null,c.setStatus(`${p.paused?"PAUSED — arrange, then SPACE":"running"}  ·  ~${p.liveEstimate.toLocaleString()} particles  ·  ${p.hasInitialConditions?"R restores":"no initial conditions yet"}`)),requestAnimationFrame(Nn)};if(requestAnimationFrame(Nn),k!==O){const l=K(k);(l===""||!St(l)||!await It(l))&&(k=O,An(),I())}}function Sa(n,e){const t=URL.createObjectURL(n),a=document.createElement("a");a.href=t,a.download=e,a.click(),setTimeout(()=>URL.revokeObjectURL(t),1e3)}ko().catch(n=>{console.error(n),Na("Could not start Fluoddity Sand",String(n))});
