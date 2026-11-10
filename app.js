/* Libreria Carte - app.js */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const key=n=>String(n).trim().toLowerCase();
const nat=(a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true});
let db={cards:[]},deck=[],sel=-1,cache={};
function warn(m){const b=$('#errb');if(b){b.textContent=m+' - tocca per chiudere';b.style.display='block'}}
/* Archivio locale: IndexedDB (spazioso, salva in background), con passaggio automatico dai dati in localStorage */
const IDB={db:null};
function idbOpen(){return new Promise((ok,ko)=>{if(typeof indexedDB=='undefined')return ko(new Error('IndexedDB assente'));const r=indexedDB.open('libreria',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>ok(r.result);r.onerror=()=>ko(r.error)})}
function idbGet(k){return new Promise((ok,ko)=>{const q=IDB.db.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>ok(q.result);q.onerror=()=>ko(q.error)})}
function idbPut(k,v){return new Promise((ok,ko)=>{const tx=IDB.db.transaction('kv','readwrite');tx.objectStore('kv').put(v,k);tx.oncomplete=()=>ok();tx.onerror=()=>ko(tx.error);tx.onabort=()=>ko(tx.error)})}
const dbReady=(async()=>{
  try{
    IDB.db=await idbOpen();
    let v=await idbGet('lib');
    if(!v){const old=localStorage.getItem('lib');if(old){await idbPut('lib',old);v=old}}  /* una volta sola: la vecchia copia resta come riserva */
    if(v){const d=typeof v=='string'?JSON.parse(v):v;if(d&&d.cards)db=d}
  }catch(e){IDB.db=null;try{db=JSON.parse(localStorage.getItem('lib'))||db}catch(_){}}
  try{if(typeof navigator!='undefined'&&navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
})();
let pst=null;
function persistNow(){
  pst=null;const s=JSON.stringify(db);
  if(IDB.db)idbPut('lib',s).catch(()=>warn('Non riesco a salvare sul dispositivo: le ultime modifiche restano solo nel cloud, se collegato'));
  else{try{localStorage.setItem('lib',s)}catch(e){warn('Memoria del browser piena: le ultime modifiche NON sono salvate su questo dispositivo')}}
}
const persist=()=>{clearTimeout(pst);pst=setTimeout(persistNow,400)};
if(typeof addEventListener=='function'){
  addEventListener('pagehide',()=>{if(pst){clearTimeout(pst);persistNow()}});
  addEventListener('visibilitychange',()=>{if(document.visibilityState=='hidden'&&pst){clearTimeout(pst);persistNow()}});
}
const save=()=>{db.updatedAt=Date.now();persist();autoUp()};
const ssi=s=>s?`<i class="ss ss-${esc(String(s).toLowerCase())} ss-fw"></i>`:'';
const CI={Creatura:'creature',Planeswalker:'planeswalker',Terra:'land',Istantaneo:'instant',Stregoneria:'sorcery',Artefatto:'artifact',Incantesimo:'enchantment'};
const cti=k=>CI[k]?`<i class="ms ms-${CI[k]}"></i>`:'';
const owned=n=>{const k=key(n),f=key(n.split(' // ')[0]);return db.cards.filter(c=>{const x=key(c.name);return x===k||x===f})};
const sameEd=(c,w)=>(c.set||'').toUpperCase()==w.set&&(!w.num||String(c.num)==w.num);
const hit=d=>{const all=owned(d.name);if(!d.set)return{rows:all,alt:false};const ex=all.filter(c=>sameEd(c,d));return ex.length?{rows:ex,alt:false}:{rows:all,alt:all.length>0}};
const L=d=>[...new Set(hit(d).rows.map(c=>c.loc||'?'))].sort(nat);
const locs=n=>[...new Set(owned(n).map(c=>c.loc||'?'))].sort(nat);

/* Schede */
let curTab='home';
const H=typeof history!='undefined'&&history.pushState?history:null;
function go(t,fromPop){
  if(!fromPop&&t!==curTab&&H)H.pushState({t},'');
  curTab=t;
  document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t==t));
  document.querySelectorAll('section').forEach(e=>e.classList.toggle('on',e.id==t));
  dbReady.then(()=>{
    if(t=='col')renderCol();
    if(t=='home')renderHome();
    if(t=='lab')renderLab(true);
    if(t=='cld'&&typeof renderBk=='function')renderBk();
  });
  if(window.scrollTo)window.scrollTo(0,0);
}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>go(b.dataset.t));

/* Scryfall */
async function fetchCard(n){
  const k=key(n);if(cache[k])return cache[k];
  try{const r=await fetch('https://api.scryfall.com/cards/named?fuzzy='+encodeURIComponent(n));
    if(!r.ok)return null;return cache[k]=await r.json()}catch(e){return null}
}
async function show(n,el,want){
  const draw=c=>{
    const nm=c?c.name:n,isW=x=>want&&want.set&&sameEd(x,want)?1:0,o=(owned(nm).length?owned(nm):owned(n)).slice().sort((a,b)=>isW(b)-isW(a));
    const gen=c&&(c.image_uris||(c.card_faces&&c.card_faces[0].image_uris));
    const one=x=>{
      const i=(db.info||{})[ik(x)],src=(i&&i.i?i.i.replace('/small/','/normal/'):'')||(gen?gen.normal:'');
      return `<div style="width:min(100%,260px)">${src?`<img class="card" src="${esc(src)}" alt="">`:''}<div><b class="loc">${esc(x.loc||'?')}</b> · ${x.qty}× · ${ssi(x.set)} ${esc((db.sn||{})[x.set]||x.set)}${x.num?' #'+esc(x.num):''}${x.foil?' ✦'+x.foil:''}${isW(x)?' · <b style="color:var(--ac)">richiesta</b>':''}</div></div>`};
    el.innerHTML=`<h3>${esc(nm)}</h3>`+(want&&want.set&&o.length&&!o.some(isW)?`<p class="no">Edizione richiesta (${esc(want.set)}) non posseduta: ti mostro le altre.</p>`:'')+
      (o.length?`<div style="display:flex;flex-wrap:wrap;gap:14px">${o.map(one).join('')}</div>`
        :(gen?`<img class="card" src="${gen.normal}" alt="">`:'')+`<p class="no"><b>${c?'Non in collezione':'Nome non riconosciuto da Scryfall: prova con il nome inglese'}</b></p>`)+
      (c?`<p>${esc(c.type_line||'')}</p><small>${esc((c.oracle_text||'').replace(/\n/g,' / '))}</small>`:'');
  };
  if(owned(n).length)draw(null);else el.innerHTML='<small>Carico…</small>';
  draw(await fetchCard(n));
}
let t;
function ac(inp){clearTimeout(t);t=setTimeout(async()=>{
  if(inp.value.length<3)return;
  try{const r=await(await fetch('https://api.scryfall.com/cards/autocomplete?q='+encodeURIComponent(inp.value))).json();
    $('#ac').innerHTML=r.data.map(n=>`<option value="${esc(n)}">`).join('')}catch(e){}
},250)}
