/* Libreria Carte - cloud.js */
/* 4. Cloud: Firebase (Realtime Database + accesso con email e password). Una riga per carta, vince la modifica più recente. */
const meta=()=>{try{return JSON.parse(localStorage.getItem('libmeta'))||{}}catch(e){return{}}};
const setMeta=o=>{try{localStorage.setItem('libmeta',JSON.stringify({...meta(),...o}))}catch(e){}};
const gmsg=t=>{$('#gst').textContent=t};
const FBCFG={apiKey:'AIzaSyDASqHvt6sh2zLf62n6s1GHOyEDZ0iWMQ0',authDomain:'libreria-mtg.firebaseapp.com',databaseURL:'https://libreria-mtg-default-rtdb.europe-west1.firebasedatabase.app',projectId:'libreria-mtg',appId:'1:595973958368:web:6604b3c3e9fb2c94e43e85'};
const fb={on:false,uid:null,ref:null,off:0,conn:true};
let sent={},pt,rt,fbReady=false;
const fbNow=()=>Date.now()+(fb.off||0);
const cardKey=c=>c.sid||c.id||(c.id='m'+Math.random().toString(36).slice(2,9)+Date.now().toString(36));
const toRec=c=>({n:c.name,s:c.set||'',u:String(c.num||''),q:c.qty||1,f:c.foil||0,l:c.loc||'',i:c.sid||'',t:((db.info||{})[ik(c)]||{}).t||'',z:(db.sn||{})[c.set]||''});
const recStr=r=>JSON.stringify([r.n,r.s,r.u,r.q,r.f,r.l,r.i,r.t,r.z]);
function fromRec(n,k,r){
  n.name=r.n;n.set=r.s||'';n.num=r.u||'';n.qty=r.q||1;n.foil=r.f||0;n.loc=r.l||'';
  if(r.i)n.sid=r.i;else n.id=k;
  n.upd=r.up||0;
  if(r.i&&r.t){db.info=db.info||{};db.info[r.i]={t:r.t,i:`https://cards.scryfall.io/small/front/${r.i[0]}/${r.i[1]}/${r.i}.jpg`}}
  if(r.s&&r.z){db.sn=db.sn||{};db.sn[r.s]=r.z}
}
function stat(extra){gmsg((fb.on?(fb.conn?'Collegato al cloud':'Offline: le modifiche partiranno al ritorno della connessione'):'Non collegato')+(extra?' · '+extra:''))}
function later(){clearTimeout(rt);rt=setTimeout(()=>{renderHome();renderCol();if(deck.length)renderDeck()},250)}
function applyRemote(k,r,idx){
  if(!r)return;
  const rs=r.d?'D':recStr(r);
  if(sent[k]===rs)return;
  const c=idx?idx.get(k):db.cards.find(x=>cardKey(x)==k);
  if(c&&(c.upd||0)>(r.up||0))return;
  if(r.d){if(c){picked.delete(c);db.cards.splice(db.cards.indexOf(c),1);if(idx)idx.delete(k)}}
  else{const n=c||{loc:''};fromRec(n,k,r);if(!c){db.cards.push(n);if(idx)idx.set(k,n)}}
  sent[k]=rs;if(!idx){persist();later()}
}
function autoUp(){if(fb.on){clearTimeout(pt);pt=setTimeout(()=>push(),1500)}}
async function push(first){
  if(!fb.on)return;
  const up={},now=fbNow(),seen=new Set();
  db.cards.forEach(c=>{const k=cardKey(c);seen.add(k);const r=toRec(c),s=recStr(r);
    if(sent[k]!==s){c.upd=now;up[k]={...r,up:now};sent[k]=s}});
  Object.keys(sent).forEach(k=>{if(!seen.has(k)&&sent[k]!=='D'){up[k]={d:1,up:now};sent[k]='D'}});
  const ks=Object.keys(up);if(!ks.length)return;
  persist();
  try{
    for(let i=0;i<ks.length;i+=3000){const part={};ks.slice(i,i+3000).forEach(k=>part[k]=up[k]);await fb.ref.update(part)}
    stat(`${db.cards.length} righe, inviate ${ks.length} modifiche`);
  }catch(e){ks.forEach(k=>delete sent[k]);gmsg(fbErr(e));clearTimeout(pt);pt=setTimeout(()=>push(),10000)}
}
function fbStart(user){
  if(fb.on&&fb.uid==user.uid)return Promise.resolve();
  if(fb.p&&fb.puid==user.uid)return fb.p;
  fb.puid=user.uid;
  fb.p=fbStart0(user).finally(()=>{fb.p=null});
  return fb.p;
}
async function fbStart0(user){
  await dbReady;
  fb.uid=user.uid;fb.ref=firebase.database().ref('users/'+user.uid+'/cards');
  gmsg('Collego il cloud…');
  const remote=(await withTimeout(fb.ref.once('value'),25000,'Il cloud non risponde: controlla la connessione e le regole del database.')).val()||{};
  sent={};
  const conf=db.cards.filter(c=>{if(c.upd)return false;const r=remote[cardKey(c)];return r&&!r.d&&recStr(r)!==recStr(toRec(c))});
  if(conf.length&&confirm(`${conf.length} carte di questo dispositivo sono diverse da quelle nel cloud.\n\nOK = tengo le MIE (aggiorno il cloud)\nAnnulla = tengo quelle del CLOUD`)){const n=fbNow();conf.forEach(c=>{c.upd=n})}
  const idx=new Map();db.cards.forEach(c=>idx.set(cardKey(c),c));
  Object.keys(remote).forEach(k=>applyRemote(k,remote[k],idx));
  persist();
  fb.on=true;
  fb.ref.on('child_added',x=>applyRemote(x.key,x.val()));
  fb.ref.on('child_changed',x=>applyRemote(x.key,x.val()));
  await push(true);
  later();stat(db.cards.length+' righe');
  autoBackup();renderBk();
}
const withTimeout=(p,ms,msg)=>Promise.race([p,new Promise((_,no)=>setTimeout(()=>no(new Error(msg)),ms))]);
const fbErr=e=>{const c=String((e&&e.code)||'')+' '+String((e&&e.message)||'');
  return /invalid-credential|wrong-password|user-not-found|invalid-email/.test(c)?'Email o password non corrette.':/network/i.test(c)?'Nessuna connessione.':/PERMISSION_DENIED|permission/i.test(c)?'Permesso negato: controlla le regole del database e che l\'utente sia quello giusto.':(e&&e.message)||'Errore sconosciuto.'};
function loadJs(u){return new Promise((ok,ko)=>{const sc=document.createElement('script');sc.src=u;sc.onload=ok;sc.onerror=()=>ko(new Error('Impossibile caricare Firebase: controlla la connessione.'));document.head.appendChild(sc)})}
async function fbLoad(){if(window.firebase&&firebase.database)return;for(const m of['app','auth','database'])await withTimeout(loadJs(`https://www.gstatic.com/firebasejs/10.14.1/firebase-${m}-compat.js`),20000,'Firebase non si carica: controlla la connessione.')}
async function fbInit(cfg){
  await fbLoad();
  if(!firebase.apps.length)firebase.initializeApp(cfg);
  if(fbReady)return;fbReady=true;
  firebase.database().ref('.info/serverTimeOffset').on('value',x=>{fb.off=x.val()||0});
  firebase.database().ref('.info/connected').on('value',x=>{fb.conn=!!x.val();if(fb.on)stat()});
  firebase.auth().onAuthStateChanged(u=>{
    if(u)fbStart(u).catch(e=>gmsg(fbErr(e)));
    else{fb.on=false;fb.uid=null;if(fb.ref)fb.ref.off();stat()}
  });
}
function parseCfg(t){const o={};for(const m of t.matchAll(/([A-Za-z]\w*)\s*:\s*["']([^"']+)["']/g))o[m[1]]=m[2];return o}
$('#fbcfg').value=meta().fbt||'';$('#fbem').value=meta().fbe||'';
$('#fbin').onclick=async()=>{try{
  const t=$('#fbcfg').value.trim(),cfg=t?parseCfg(t):FBCFG;
  if(!cfg.apiKey||!cfg.projectId)throw new Error('Configurazione incompleta: incolla il blocco firebaseConfig, con apiKey e projectId.');
  if(!cfg.databaseURL)throw new Error('Manca databaseURL: copialo dalla pagina Realtime Database di Firebase e aggiungilo alla configurazione.');
  const em=$('#fbem').value.trim(),pw=$('#fbpw').value;
  if(!em||!pw)throw new Error('Inserisci email e password.');
  setMeta({fbt:t,fbe:em});gmsg('Accesso in corso…');
  await fbInit(cfg);
  const cr=await withTimeout(firebase.auth().signInWithEmailAndPassword(em,pw),30000,'Il server di accesso non risponde: controlla la connessione.');
  await fbStart(cr.user);stat(db.cards.length+' righe');
}catch(e){gmsg(fbErr(e))}};
$('#fbout').onclick=async()=>{try{if(window.firebase&&firebase.apps.length)await firebase.auth().signOut()}catch(e){}fb.on=false;stat()};
if(meta().fbe&&!/[?&]safe=1/.test(location.search))fbInit(meta().fbt?parseCfg(meta().fbt):FBCFG).catch(e=>gmsg(fbErr(e)));

/* Backup automatici nel cloud: una copia al giorno, si tengono gli ultimi 7 */
const bkRef=p=>firebase.database().ref('users/'+fb.uid+'/'+p);
const itDate=d=>d.split('-').reverse().join('/');
async function autoBackup(force){
  if(!fb.on)return;
  const day=new Date().toISOString().slice(0,10);
  if(!force&&meta().bkDay===day)return;
  try{
    await withTimeout(bkRef('bk/'+day).set(JSON.stringify(db)),30000,'Backup non riuscito: connessione lenta.');
    await bkRef('bkidx/'+day).set({at:Date.now(),n:db.cards.length});
    setMeta({bkDay:day});
    const idx=(await bkRef('bkidx').once('value')).val()||{};
    for(const d of Object.keys(idx).sort().slice(0,-7)){await bkRef('bk/'+d).remove();await bkRef('bkidx/'+d).remove()}
    if(force)gmsg('Backup del '+itDate(day)+' salvato nel cloud.');
    renderBk();
  }catch(e){if(force)gmsg(fbErr(e));else console.warn('backup',e)}
}
async function renderBk(){
  const el=$('#bklist');if(!el)return;
  if(!fb.on){el.innerHTML='<small>Collegati al cloud per vedere i backup.</small>';return}
  try{
    const idx=(await bkRef('bkidx').once('value')).val()||{},ds=Object.keys(idx).sort().reverse();
    el.innerHTML=ds.length?ds.map(d=>`<div class="item"><span class="n">${itDate(d)} · ${(idx[d].n||0).toLocaleString('it-IT')} righe</span><button data-day="${esc(d)}">Ripristina</button></div>`).join(''):'<small>Ancora nessun backup.</small>';
  }catch(e){el.innerHTML='<small>'+esc(fbErr(e))+'</small>'}
}
$('#bknow').onclick=()=>autoBackup(true);
$('#bklist').onclick=async e=>{
  const d=e.target.dataset&&e.target.dataset.day;if(!d)return;
  if(!confirm(`Riporto la collezione com'era il ${itDate(d)}? Le modifiche fatte dopo vanno perse, anche sugli altri dispositivi.`))return;
  try{
    const v=(await withTimeout(bkRef('bk/'+d).once('value'),30000,'Il cloud non risponde.')).val();
    const x=typeof v=='string'?JSON.parse(v):v;if(!x||!x.cards)throw new Error('Backup non valido.');
    db=x;picked.clear();save();later();gmsg('Collezione riportata al '+itDate(d)+'.');
  }catch(e){gmsg(fbErr(e))}
};
