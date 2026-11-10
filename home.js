/* Libreria Carte - home.js */
/* Home: numeri e scatole */
let memWarned=false;
function memInfo(){
  let ch=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);ch+=k.length+(localStorage.getItem(k)||'').length}}catch(e){}
  let mine=0;try{mine=(localStorage.getItem('lib')||'').length}catch(e){}
  const LIM=5e6,rows=db.cards.length,per=rows?mine/rows:0;
  return{pct:Math.round(ch/LIM*100),mb:ch/1e6,left:per?Math.max(0,Math.floor((LIM-ch)/per)):0};
}
function updMem(){
  const el=$('#hmem');if(!el)return;
  const show=(pct,txt)=>{el.innerHTML=`<b style="color:${pct>=80?'var(--bad)':pct>=60?'var(--warn)':'inherit'}">${pct}%</b><span>${txt}</span>`;if(pct>=70&&!memWarned){memWarned=true;warn('Lo spazio di archivio sul dispositivo è al '+pct+'%')}};
  const fmt=v=>v.toFixed(1).replace('.',',');
  if(IDB.db&&typeof navigator!='undefined'&&navigator.storage&&navigator.storage.estimate)
    navigator.storage.estimate().then(e=>show(e.quota?Math.round(e.usage/e.quota*100):0,`Archivio locale · ${fmt(e.usage/1e6)} MB usati su ${fmt(e.quota/1e9)} GB`)).catch(()=>{});
  else{const m=memInfo();show(m.pct,`Memoria locale · ${fmt(m.mb)} MB, ancora ~${m.left.toLocaleString('it-IT')} righe`)}
}
function renderHome(){
  const cs=db.cards,n=cs.reduce((a,c)=>a+c.qty,0),sets=new Set(cs.map(c=>c.set).filter(Boolean)),box={};
  let free=0;
  cs.forEach(c=>{const l=c.loc||'';if(!l)free+=c.qty;const b=box[l]=box[l]||{q:0};b.q+=c.qty});
  const named=Object.keys(box).filter(k=>k).sort(nat),mx=Math.max(1,...Object.values(box).map(b=>b.q)),f=v=>v.toLocaleString('it-IT');
  $('#hn').textContent=f(n);
  $('#hs').innerHTML=[['Stampe diverse',cs.length],['Espansioni',sets.size],['Scatole',named.length],['Senza posizione',free]].map(([l,v])=>`<div class="stat"><b>${f(v)}</b><span>${l}</span></div>`).join('')+'<div class="stat" id="hmem"><b>…</b><span>Archivio locale</span></div>';updMem();
  const tile=k=>`<button class="box" data-loc="${esc(k)}"><span class="plate">${esc(k||'–')}</span><span class="bq">${f(box[k].q)} carte${k?'':' senza scatola'}</span><span class="fill"><i style="width:${Math.round(box[k].q/mx*100)}%"></i></span></button>`;
  $('#hshelf').innerHTML=cs.length?named.map(tile).join('')+(box['']?tile(''):''):'<small>Importa o aggiungi delle carte per vedere le scatole.</small>';
  if(typeof boxSets=='function'){const n=labChanged(boxSets()).length;$('#labgo').textContent='Etichette'+(n?' ('+n+' da stampare)':'')}
}
$('#hshelf').onclick=e=>{
  const b=e.target.closest('.box');if(!b)return;
  ['#cf','#cfn'].forEach(x=>{$(x).value=''});
  go('col');
  $('#cfe').value='';$('#cfc').value='';$('#cg').value='';
  $('#cfl').value='L:'+b.dataset.loc;renderCol();
};
$('#fix').onclick=async()=>{
  try{
    if(navigator.serviceWorker){const rs=await navigator.serviceWorker.getRegistrations();for(const r of rs)if(r.scope==location.origin+location.pathname.replace(/[^\/]*$/,''))await r.unregister()}
    if(window.caches){for(const k of await caches.keys())if(k.indexOf('libreria-')==0)await caches.delete(k)}
  }catch(e){}
  location.reload();
};
