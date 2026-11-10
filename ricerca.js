/* Libreria Carte - ricerca.js */
/* 3. Ricerca: una riga per ogni stampa posseduta */
function ricerca(){
  const f=key($('#sq').value),S=$('#ss').value.trim().toUpperCase(),N=$('#sn').value.trim().toLowerCase();
  const inf=c=>(db.info||{})[ik(c)]||{};
  let m=[];
  if(f.length>=2||S||N)m=db.cards.filter(c=>key(c.name).includes(f)&&(!S||(c.set||'').toUpperCase()==S)&&(!N||String(c.num||'').toLowerCase()==N));
  m.sort((a,b)=>key(a.name).localeCompare(key(b.name))||String(a.set||'').localeCompare(String(b.set||''))||nat(a.num||'',b.num||''));
  let h=m.slice(0,40).map(c=>`<div class="item" data-i="${db.cards.indexOf(c)}">${inf(c).i?`<img src="${esc(inf(c).i)}" loading="lazy" width="34" alt="" style="border-radius:3px">`:''}<span class="n">${esc(c.name)}<br><small>${ssi(c.set)} ${esc(c.set)}${c.num?' #'+esc(c.num):''}${c.foil?' ✦':''} · ${c.qty}×</small></span><span class="loc">${esc(c.loc||'?')}</span></div>`).join('');
  if(m.length>40)h+=`<small>…altre ${m.length-40} stampe: restringi la ricerca</small>`;
  if(!m.length&&(f.length>1||S||N))h='<p class="no">Nessuna corrispondenza in collezione</p>';
  $('#sl').innerHTML=h;
}
['#sq','#ss','#sn'].forEach(x=>$(x).oninput=ricerca);
$('#sq').onchange=e=>{
  const v=e.target.value.trim();if(!v)return;
  const S=$('#ss').value.trim().toUpperCase();
  show(v,$('#sd'),S?{set:S,num:$('#sn').value.trim()}:undefined);
};
$('#sl').onclick=e=>{
  const it=e.target.closest('.item');if(!it)return;
  const c=db.cards[+it.dataset.i];
  show(c.name,$('#sd'),{set:(c.set||'').toUpperCase(),num:c.num||''});
};
