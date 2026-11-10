/* Libreria Carte - home.js */
/* Home: numeri e scatole */
let memWarned=false;
function memInfo(){
  let ch=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);ch+=k.length+(localStorage.getItem(k)||'').length}}catch(e){}
  let mine=0;try{mine=(localStorage.getItem('lib')||'').length}catch(e){}
  const LIM=5e6,rows=db.cards.length,per=rows?mine/rows:0;
  return{pct:Math.round(ch/LIM*100),mb:ch/1e6,left:per?Math.max(0,Math.floor((LIM-ch)/per)):0};
}
function renderHome(){
  const cs=db.cards,n=cs.reduce((a,c)=>a+c.qty,0),sets=new Set(cs.map(c=>c.set).filter(Boolean)),box={};
  let free=0;
  cs.forEach(c=>{const l=c.loc||'';if(!l)free+=c.qty;const b=box[l]=box[l]||{q:0};b.q+=c.qty});
  const named=Object.keys(box).filter(k=>k).sort(nat),mx=Math.max(1,...Object.values(box).map(b=>b.q)),f=v=>v.toLocaleString('it-IT');
  $('#hn').textContent=f(n);
  $('#hs').innerHTML=[['Stampe diverse',cs.length],['Espansioni',sets.size],['Scatole',named.length],['Senza posizione',free]].map(([l,v])=>`<div class="stat"><b>${f(v)}</b><span>${l}</span></div>`).join('')+(()=>{const m=memInfo();if(m.pct>=70&&!memWarned){memWarned=true;warn('La memoria del browser è al '+m.pct+'%: conviene passare presto al salvataggio più capiente')}return `<div class="stat"><b style="color:${m.pct>=80?'var(--bad)':m.pct>=60?'var(--warn)':'inherit'}">${m.pct}%</b><span>Memoria locale · ${m.mb.toFixed(1).replace('.',',')} MB, ancora ~${f(m.left)} righe</span></div>`})();
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
