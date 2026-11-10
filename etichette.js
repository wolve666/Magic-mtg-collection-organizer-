/* Libreria Carte - etichette.js: loghi 1x1 cm e separatori 4x0,9 cm con i simboli Keyrune */
const labSel=new Set();
const labPrinted=()=>{try{return JSON.parse(localStorage.getItem('liblab'))||{}}catch(e){return{}}};
const setName=s=>(db.sn||{})[s]||s;
function boxSets(){
  const m={};
  db.cards.forEach(c=>{const l=c.loc||'';if(!l||!c.set)return;(m[l]=m[l]||new Set()).add(c.set)});
  const o={};
  Object.keys(m).sort(nat).forEach(l=>{o[l]=[...m[l]].sort((a,b)=>nat(setName(a),setName(b)))});
  return o;
}
function labChanged(bs){const p=labPrinted();return Object.keys(bs).filter(l=>(p[l]||[]).join(',')!==bs[l].join(','))}
const lsym=s=>`<i class="ss ss-${esc(String(s).toLowerCase())}" data-c="${esc(s)}"></i>`;
function fixSym(){
  /* se Keyrune non ha il simbolo di un set, al suo posto si stampa il codice */
  const run=()=>document.querySelectorAll('#labPrev i.ss').forEach(i=>{
    if(i.getBoundingClientRect&&i.getBoundingClientRect().width<1){const sp=document.createElement('span');sp.className='lb-code';sp.textContent=i.dataset.c;i.replaceWith(sp)}});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(run);else run();
}
function renderLab(fresh){
  const bs=boxSets(),keys=Object.keys(bs),ch=new Set(labChanged(bs));
  if(fresh){labSel.clear();ch.forEach(l=>labSel.add(l))}
  [...labSel].forEach(l=>{if(!bs[l])labSel.delete(l)});
  $('#labBoxes').innerHTML=keys.length?keys.map(l=>`<label class="lbx"><input type="checkbox" data-l="${esc(l)}" ${labSel.has(l)?'checked':''}><span class="plate">${esc(l)}</span><span>${bs[l].map(ssi).join(' ')} <small>${bs[l].length} espansion${bs[l].length==1?'e':'i'}${ch.has(l)?' · nuova o cambiata':''}</small></span></label>`).join(''):'<small>Assegna prima una posizione alle carte: le scatole compaiono qui.</small>';
  const sel=keys.filter(l=>labSel.has(l)),L=$('#labL').checked,S=$('#labS').checked;
  let h='';
  if(L&&sel.length){
    h+='<div class="lb-h">Loghi per scatola (1 × 1 cm)</div>';
    sel.forEach(l=>{h+=`<div class="lb-h" style="font-weight:600;margin-top:2mm">Scatola ${esc(l)}</div><div class="lb-row">${bs[l].map(s=>`<div class="lb-logo">${lsym(s)}</div>`).join('')}</div>`});
  }
  if(S&&sel.length){
    h+='<div class="lb-h" style="margin-top:5mm">Separatori (4 × 0,9 cm)</div><div class="lb-row">'+
      sel.map(l=>bs[l].map(s=>{const n=setName(s);return `<div class="lb-sep">${lsym(s)}<span class="${n.length>30?'sm':''}">${esc(n)}</span></div>`}).join('')).join('')+'</div>';
  }
  $('#labPrev').innerHTML=h||'<small style="color:#555">Seleziona almeno una scatola e un tipo di etichetta.</small>';
  $('#labPrint').disabled=!h;
  fixSym();
}
$('#labBoxes').onchange=e=>{const l=e.target.dataset.l;if(l==null)return;e.target.checked?labSel.add(l):labSel.delete(l);renderLab()};
['#labL','#labS'].forEach(x=>$(x).onchange=()=>renderLab());
$('#labNew').onclick=()=>renderLab(true);
$('#labAll').onclick=()=>{Object.keys(boxSets()).forEach(l=>labSel.add(l));renderLab()};
$('#labNone').onclick=()=>{labSel.clear();renderLab()};
$('#labPrint').onclick=()=>{
  const bs=boxSets(),p=labPrinted();
  $('#lab-print').innerHTML=$('#labPrev').innerHTML;
  if(window.print)window.print();
  labSel.forEach(l=>{if(bs[l])p[l]=bs[l]});
  try{localStorage.setItem('liblab',JSON.stringify(p))}catch(e){}
  renderLab();renderHome();
};
$('#labgo').onclick=()=>go('lab');
