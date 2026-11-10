/* Libreria Carte - collezione.js */
/* 2. Collezione */
['#cn','#sq'].forEach(s=>$(s).addEventListener('input',e=>ac(e.target)));
$('#add').onclick=()=>{
  const n=$('#cn').value.trim();if(!n)return;
  const s=$('#cs').value.trim().toUpperCase(),nu=$('#cnu').value.trim(),l=$('#cl').value.trim(),q=+$('#cq').value||1;
  const e=db.cards.find(c=>key(c.name)==key(n)&&c.set==s&&(c.num||'')==nu&&c.loc==l);
  e?e.qty+=q:db.cards.push({name:n,set:s,num:nu,qty:q,loc:l});
  save();$('#cn').value='';$('#cs').value='';$('#cnu').value='';renderCol();$('#cn').focus();
};
const CATS=['Creatura','Planeswalker','Battaglia','Terra','Istantaneo','Stregoneria','Artefatto','Incantesimo','Altro','Non classificata'];
const ik=c=>c.sid||(c.name+'|'+(c.set||''));
function cat(t){t=(t||'').split(' // ')[0];
  return /Creature/.test(t)?'Creatura':/Planeswalker/.test(t)?'Planeswalker':/Battle/.test(t)?'Battaglia':/Land/.test(t)?'Terra':/Instant/.test(t)?'Istantaneo':/Sorcery/.test(t)?'Stregoneria':/Artifact/.test(t)?'Artefatto':/Enchantment/.test(t)?'Incantesimo':'Altro'}
const picked=new Set();let shown=[];
let colView='g',colAnim=true;try{colView=localStorage.getItem('libview')||'g'}catch(e){}
function updSel(){
  const q=[...picked].reduce((s,c)=>s+c.qty,0),on=picked.size>0;
  $('#selc').textContent=on?`${picked.size} selezionate (${q} carte)`:'';
  $('#selbar').style.display=on?'flex':'none';
  if(document.body)document.body.style.paddingBottom=on?'150px':'';
}
function renderCol(){
  const f=key($('#cf').value),Nn=key($('#cfn').value),L=$('#cfl').value,E=$('#cfe').value,K=$('#cfc').value,G=$('#cg').value;
  {const nf=[L,E,K,G].filter(Boolean).length,b=$('#fcount');b.textContent=nf||'';b.style.display=nf?'':'none'}
  const inf=c=>(db.info||{})[ik(c)]||{};
  const ct=c=>inf(c).t||'Non classificata';
  const sname=s=>(db.sn||{})[s]||s||'(senza set)';
  const fill=(el,all,fn,pref,cur,lab,sf)=>{
    const m={};db.cards.forEach(c=>{const k=fn(c);m[k]=(m[k]||0)+c.qty});
    el.innerHTML=`<option value="">${all}</option>`+Object.keys(m).sort(sf).map(k=>`<option value="${pref}${esc(k)}" ${pref+k==cur?'selected':''}>${esc(lab(k))} · ${m[k]}</option>`).join('')};
  fill($('#cfl'),'Tutte le posizioni',c=>c.loc||'','L:',L,k=>k||'(senza posizione)',nat);
  fill($('#cfe'),'Tutte le espansioni',c=>c.set||'','S:',E,k=>k?`${sname(k)} (${k})`:'(senza set)',(a,b)=>nat(sname(a),sname(b)));
  fill($('#cfc'),'Tutte le categorie',ct,'C:',K,k=>k,(a,b)=>CATS.indexOf(a)-CATS.indexOf(b));
  const rows=db.cards.map((c,i)=>({c,i})).filter(({c})=>key(c.name).includes(f)&&(!Nn||String(c.num||'').toLowerCase()==Nn)&&(!L||L=='L:'+(c.loc||''))&&(!E||E=='S:'+(c.set||''))&&(!K||K=='C:'+ct(c)));
  const gk=c=>G=='e'?sname(c.set):G=='c'?ct(c):G=='l'?(c.loc||'(senza posizione)'):'';
  if(G)rows.sort((a,b)=>{const x=gk(a.c),y=gk(b.c);return(G=='c'?CATS.indexOf(x)-CATS.indexOf(y):nat(x,y))||key(a.c.name).localeCompare(key(b.c.name))});
  const cnt={};if(G)rows.forEach(r=>{const g=gk(r.c);cnt[g]=(cnt[g]||0)+r.c.qty});
  const miss=db.cards.filter(c=>!c.name.startsWith('Carta sconosciuta')&&!inf(c).t).length;
  shown=rows.map(r=>r.c);{const all=new Set(db.cards);picked.forEach(c=>{if(!all.has(c))picked.delete(c)})}
  const V=colView,LIM=V=='g'?600:1000;
  let h='',last=null;
  rows.slice(0,LIM).forEach(({c,i},k)=>{
    if(G){const g=gk(c);if(g!==last){last=g;h+=V=='g'?`<div class="gh">${G=='e'?ssi(c.set):G=='c'?cti(g):''} ${esc(g)} · ${cnt[g]} carte</div>`:`<tr><th colspan="7" style="text-align:left;padding:12px 4px 4px;color:var(--ac)">${G=='e'?ssi(c.set):G=='c'?cti(g):''} ${esc(g)} · ${cnt[g]} carte</th></tr>`}}
    const im=inf(c).i,ck=picked.has(c)?'checked':'';
    h+=V=='g'
      ?`<div class="cc ${ck?'on':''}${colAnim?' in':''}" style="--d:${Math.min(k,24)}"><div class="art" data-p="${i}">${im?`<img src="${esc(im)}" loading="lazy" alt="">`:''}${c.qty>1?`<span class="qb">×${c.qty}</span>`:''}<input type="checkbox" class="pk" data-i="${i}" ${ck} aria-label="Seleziona"></div><div class="cl"><span class="plate">${esc(c.loc||'–')}</span><span class="cn" data-p="${i}">${esc(c.name)}</span></div><div class="cm">${ssi(c.set)} ${esc(c.set)}${c.num?' #'+esc(c.num):''}${c.foil?' ✦'+c.foil:''} ${cti(ct(c))}</div></div>`
      :`<tr><td style="width:30px"><input type="checkbox" class="pk" data-i="${i}" ${ck}></td><td data-p="${i}" style="width:44px;cursor:pointer">${im?`<img src="${esc(im)}" loading="lazy" width="38" alt="" style="border-radius:3px;display:block">`:'🂠'}</td>
      <td data-p="${i}" style="cursor:pointer">${esc(c.name)}</td><td>${ssi(c.set)} ${esc(c.set)}${c.num?' #'+esc(c.num):''}${c.foil?' ✦'+c.foil:''}</td><td>${c.qty}×</td>
      <td><input class="le" size="6" value="${esc(c.loc)}" data-i="${i}"></td><td><button data-d="${i}">✕</button></td></tr>`;
  });
  $('#vg').className=V=='g'?'on':'';$('#vl').className=V=='g'?'':'on';
  $('#ct').innerHTML=`<small>${rows.length} righe · ${rows.reduce((s,r)=>s+r.c.qty,0)} carte${rows.length>LIM?` (mostro le prime ${LIM})`:''}${miss?` · ${miss} senza categoria/anteprima: tocca "Aggiorna info"`:''}</small>`+(V=='g'?`<div class="gridc">${h}</div>`:`<div class="tw"><table>${h}</table></div>`);
  updSel();colAnim=false;
}
async function enrich(){
  db.info=db.info||{};db.sn=db.sn||{};
  const need=db.cards.filter(c=>!c.name.startsWith('Carta sconosciuta')&&!db.info[ik(c)]);
  const uniq=[...new Map(need.map(c=>[ik(c),c])).values()];
  for(let b=0;b<uniq.length;b+=75){
    const part=uniq.slice(b,b+75);
    $('#prog').textContent=`Scarico categorie e anteprime… ${Math.min(b+75,uniq.length)}/${uniq.length}`;
    let r;
    try{r=await fetch('https://api.scryfall.com/cards/collection',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({identifiers:part.map(c=>c.set?{name:c.name,set:c.set.toLowerCase()}:{name:c.name})})})}catch(e){r=null}
    if(!r||!r.ok){save();throw new Error('Scaricamento interrotto: riprova, riparte da dove era arrivato.')}
    const j=await r.json();
    part.forEach(c=>{
      const m=j.data.find(x=>key(x.name)==key(c.name)&&(!c.set||x.set==c.set.toLowerCase()));
      if(m){const im=m.image_uris||(m.card_faces&&m.card_faces[0].image_uris);
        db.info[ik(c)]={t:cat(m.type_line),i:im?im.small:''};db.sn[m.set.toUpperCase()]=m.set_name}
      else db.info[ik(c)]={t:'Non classificata',i:''};
    });
    save();await new Promise(z=>setTimeout(z,120));
  }
  $('#prog').textContent=uniq.length?'Categorie e anteprime aggiornate.':'';
}
async function preview(i){
  const c=db.cards[i];if(!c)return;
  const inf=(db.info||{})[ik(c)],box=$('#pv');
  box.style.display='flex';box.innerHTML='<small>Carico…</small>';
  if(H&&!(H.state&&H.state.pv))H.pushState({t:curTab,pv:1},'');
  if(document.body)document.body.style.overflow='hidden';
  let src=inf&&inf.i?inf.i.replace('/small/','/normal/'):null;
  if(!src){const x=await fetchCard(c.name),im=x&&(x.image_uris||(x.card_faces&&x.card_faces[0].image_uris));src=im&&im.normal}
  box.innerHTML=(src?`<div class="tilt" id="tl"><img src="${esc(src)}" alt="">${c.foil?'<span class="foilfx"></span>':''}<span class="glare"></span></div>`:'<p>Anteprima non disponibile</p>')+
    `<div style="margin-top:14px;font-size:18px;font-weight:700">${esc(c.name)} · ${c.qty}× · ${esc(c.loc?'Posizione '+c.loc:'senza posizione')}</div><div style="margin-top:4px;font-size:14px;opacity:.85">${ssi(c.set)} ${esc((db.sn||{})[c.set]||c.set)}${c.num?' #'+esc(c.num):''}${c.foil?' · foil':''}</div>`;
}
function closePv(byTap){
  const b=$('#pv');if(!b.style.display||b.style.display=='none')return;
  b.style.display='none';b.innerHTML='';if(document.body)document.body.style.overflow='';
  if(byTap&&H&&H.state&&H.state.pv)H.back();
}
$('#pv').onclick=()=>closePv(true);
if(typeof addEventListener=='function')addEventListener('popstate',e=>{
  if(openSh){closeSheet(false);return}
  const b=$('#pv');
  if(b.style.display&&b.style.display!='none'){closePv(false);return}
  const t=(e.state&&e.state.t)||'home';
  if(t!==curTab)go(t,true);
});
$('#pv').onpointermove=e=>{
  const t=$('#tl');if(!t||!t.getBoundingClientRect)return;
  const r=t.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  t.style.transform=`rotateY(${(x-.5)*26}deg) rotateX(${(.5-y)*26}deg)`;
  t.style.setProperty('--gx',x*100+'%');t.style.setProperty('--gy',y*100+'%');t.style.setProperty('--fx',x*100+'%');
};
$('#pv').onpointerleave=$('#pv').onpointerup=()=>{const t=$('#tl');if(t)t.style.transform=''};
['#cf','#cfn'].forEach(x=>$(x).oninput=renderCol);
['#cfl','#cfe','#cfc','#cg'].forEach(x=>$(x).onchange=renderCol);
$('#enr').onclick=async()=>{try{await enrich();renderCol()}catch(x){alert(x.message)}};
$('#ct').onchange=e=>{
  if(e.target.className=='le'){db.cards[+e.target.dataset.i].loc=e.target.value.trim();save()}
  else if(e.target.className=='pk'){const c=db.cards[+e.target.dataset.i];e.target.checked?picked.add(c):picked.delete(c);const cc=e.target.closest&&e.target.closest('.cc');if(cc)cc.classList.toggle('on',e.target.checked);updSel()}
};
$('#selall').onclick=()=>{shown.forEach(c=>picked.add(c));closeSheet(true);renderCol()};
$('#selnone').onclick=()=>{picked.clear();renderCol()};
$('#ba').onclick=()=>{
  const l=$('#bl').value.trim();
  if(!picked.size){alert('Seleziona prima qualche carta.');return}
  if(!l&&!confirm('Posizione vuota: tolgo la posizione alle carte selezionate?'))return;
  const had=[...picked].filter(c=>c.loc&&c.loc!=l).length;
  if(had&&!confirm(`${had} righe selezionate hanno già un'altra posizione. Le sposto in "${l||'nessuna'}"?`))return;
  picked.forEach(c=>c.loc=l);
  const n=picked.size;picked.clear();save();renderCol();
  $('#prog').textContent=`Posizione "${l||'(vuota)'}" assegnata a ${n} righe.`;
};
$('#ct').onclick=e=>{if(e.target.type=='checkbox')return;const p=e.target.closest('[data-p]');if(p){preview(+p.dataset.p);return}const d=e.target.dataset.d;if(d!=null&&confirm('Eliminare questa riga?')){picked.delete(db.cards[+d]);db.cards.splice(+d,1);save();renderCol()}};
$('#clr').onclick=()=>{
  if(!confirm('Cancellare TUTTA la collezione, le posizioni e i dati scaricati?\nSe ti serve un backup, premi prima Esporta.\nCon il cloud collegato vengono cancellate anche sugli altri dispositivi.'))return;
  if(!confirm('Sei sicuro? Non si può annullare.'))return;
  db={cards:[]};picked.clear();save();$('#prog').textContent='';renderCol();
};
$('#exp').onclick=()=>{
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(db)],{type:'application/json'}));
  a.download='libreria.json';a.click();
};
$('#imp').onchange=async e=>{
  const f=e.target.files[0];if(!f)return;const txt=await f.text();
  try{
    if(f.name.endsWith('.json')){if(!confirm('Sostituire la collezione attuale?'))return;db=JSON.parse(txt);if(!db.cards)throw 0}
    else importCsv(txt);
    save();renderCol();
  }catch(x){alert(x&&x.message?x.message:'File non valido o colonne non riconosciute (serve almeno "Name").')}
  e.target.value='';
};
function importCsv(t){
  t=t.replace(/^\uFEFF/,'');
  const rows=[];let r=[],c='',q=false;
  for(const ch of t+'\n'){
    if(q){ch=='"'?q=false:c+=ch}
    else if(ch=='"')q=true;
    else if(ch==','){r.push(c);c=''}
    else if(ch=='\n'){r.push(c.replace(/\r$/,''));c='';if(r.some(x=>x))rows.push(r);r=[]}
    else c+=ch;
  }
  if(rows.length&&rows[0].length==1&&/^sep=/i.test(rows[0][0]))rows.shift();
  const h=rows.shift().map(x=>x.trim().toLowerCase());
  const H=k=>h.indexOf(k);
  if(H('scryfall id')>=0&&H('count')>=0)return importUrza(rows,H);
  const ix=k=>h.findIndex(x=>k.some(y=>x.includes(y)));
  const N=ix(['name']),Q=ix(['quantity','count','qty']);
  let S=ix(['set code','edition code']);if(S<0)S=ix(['set','edition']);
  if(N<0)throw 0;
  rows.forEach(r=>{if(r[N])db.cards.push({name:r[N].trim(),set:(S>=0?r[S]:'').trim().toUpperCase(),qty:parseInt(Q>=0?r[Q]:1)||1,loc:''})});
}
/* CSV di UrzaGatherer: ogni riga ha l'ID Scryfall, quindi nome, categoria e anteprima arrivano dal file */
function importUrza(rows,H){
  const g=(r,k)=>H(k)>=0?(r[H(k)]||'').trim():'';
  db.info=db.info||{};db.sn=db.sn||{};
  db.cards=db.cards.filter(c=>!c.cm);delete db.cm;
  const seen=new Set();let n=0;
  rows.forEach(r=>{
    const s=g(r,'scryfall id').toLowerCase(),name=g(r,'name (english)')||g(r,'name'),qty=parseInt(g(r,'count'))||0;
    if(!s||!name||qty<1||seen.has(s))return;
    seen.add(s);
    const set=g(r,'set code').toUpperCase();
    const row={sid:s,name,set,qty,foil:(parseInt(g(r,'foil count'))||0)+(parseInt(g(r,'special foil count'))||0),num:g(r,'number')};
    db.info[s]={t:cat(g(r,'type')),i:`https://cards.scryfall.io/small/front/${s[0]}/${s[1]}/${s}.jpg`};
    if(set&&g(r,'set'))db.sn[set]=g(r,'set');
    const e=db.cards.find(c=>c.sid==s);
    e?Object.assign(e,row):db.cards.push({...row,loc:''});
    n++;
  });
  $('#prog').textContent=`Importate ${n} carte diverse (le facce posteriori delle carte doppie sono unite alla frontale).`;
}

/* Fogli a scomparsa: filtri, aggiunta carta, altre azioni (il tasto indietro li chiude) */
let openSh=null;
function openSheet(id){
  closeSheet(false);openSh=id;$('#shbg').classList.add('on');$('#'+id).classList.add('on');
  if(H)H.pushState({t:curTab,sh:id},'');
}
function closeSheet(byTap){
  if(!openSh)return;
  $('#'+openSh).classList.remove('on');$('#shbg').classList.remove('on');openSh=null;
  if(byTap&&H&&H.state&&H.state.sh)H.back();
}
$('#fbtn').onclick=()=>openSheet('shFilt');
$('#addbtn').onclick=()=>{openSheet('shAdd');setTimeout(()=>{try{$('#cn').focus()}catch(e){}},300)};
$('#morebtn').onclick=()=>openSheet('shMore');
$('#shbg').onclick=()=>closeSheet(true);
$('#fdone').onclick=()=>closeSheet(true);
document.querySelectorAll('.shx').forEach(b=>b.onclick=()=>closeSheet(true));
$('#freset').onclick=()=>{['#cfe','#cfc','#cfl','#cg','#cf','#cfn'].forEach(x=>{$(x).value=''});colAnim=true;renderCol()};
['#enr','#exp','#clr'].forEach(x=>$(x).addEventListener('click',()=>closeSheet(true)));
$('#imp').addEventListener('change',()=>closeSheet(true));
['#cfl','#cfe','#cfc','#cg'].forEach(x=>$(x).addEventListener('change',()=>{colAnim=true}));
