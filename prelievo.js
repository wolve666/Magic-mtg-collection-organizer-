/* Libreria Carte - prelievo.js */
/* 1. Prelievo */
$('#load').onclick=async()=>{
  deck=$('#list').value.split('\n').map(l=>l.trim())
    .filter(l=>l&&!/^(\/\/|#|sideboard|deck|commander|mainboard)/i.test(l))
    .map(l=>{const m=l.match(/^(\d+)\s*x?\s+(.+?)(?:\s+[\(\[]([\w-]+)[\)\]](?:\s+(?!\*)(\S+))?.*)?$/i);
      return{name:m?m[2]:l,qty:m?+m[1]:1,set:m&&m[3]?m[3].toUpperCase():'',num:m&&m[4]?m[4]:'',taken:false}});
  sel=-1;
  const miss=deck.filter(d=>!owned(d.name).length);
  for(let i=0;i<miss.length;i++){
    $('#dl').innerHTML=`<small>Controllo i nomi… ${i+1}/${miss.length}</small>`;
    const c=await fetchCard(miss[i].name);
    if(c)miss[i].name=c.name;else miss[i].unk=true;
    await new Promise(z=>setTimeout(z,90));
  }
  deck.sort((a,b)=>nat(L(a)[0]||'~',L(b)[0]||'~'));
  renderDeck();
};
let popIdx=-1;
function renderDeck(){
  const t=deck.filter(d=>d.taken).length;
  $('#dl').innerHTML=deck.length?`<small>${t}/${deck.length} prese · ordinate per posizione</small>`+deck.map((d,i)=>{
    const h=hit(d),q=h.rows.reduce((s,c)=>s+c.qty,0);
    const ed=d.set?` <small>(${esc(d.set)}${d.num?' '+esc(d.num):''})</small>`:'';
    return `<div class="item ${i==sel?'sel':''} ${d.taken?'done':''} ${i==popIdx&&d.taken?'pop':''}" data-i="${i}">
      <input type="checkbox" ${d.taken?'checked':''}>
      <span class="n">${d.qty}× ${esc(d.name)}${ed}</span>
      ${q?`<span class="loc">${esc(L(d).join(', '))}</span>${h.alt?` <small>(${esc([...new Set(h.rows.map(c=>c.set))].join(', '))})</small>`:''}${q<d.qty?`<small class="no">ne hai ${q}</small>`:''}<span class="st ${d.taken?'ok':h.alt?'alt':'no'}">${d.taken?'presa':h.alt?'altra edizione':'da prendere'}</span>`:`<span class="no">${d.unk?'nome non riconosciuto':'non posseduta'}</span>`}
    </div>`}).join(''):'';
}
$('#dl').onclick=e=>{
  const it=e.target.closest('.item');if(!it)return;
  const i=+it.dataset.i;
  if(e.target.type=='checkbox'){deck[i].taken=e.target.checked;popIdx=i}
  else{sel=i;show(deck[i].name,$('#dd'),deck[i])}
  renderDeck();popIdx=-1;
};
