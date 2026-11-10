/* Libreria Carte - ui.js */
/* Installazione dell'app (Android e Chrome su PC) */
let instEv=null;
if(typeof addEventListener=='function'){
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();instEv=e;$('#inst').style.display='inline-block'});
  addEventListener('appinstalled',()=>{instEv=null;$('#inst').style.display='none'});
}
$('#inst').onclick=async()=>{if(!instEv)return;instEv.prompt();try{await instEv.userChoice}catch(e){}instEv=null;$('#inst').style.display='none'};
/* Aspetto: tema chiaro/scuro e vista a griglia */
function applyTheme(m){
  try{localStorage.setItem('libtheme',m)}catch(e){}
  const r=document.documentElement;if(r){m=='auto'?r.removeAttribute('data-theme'):r.setAttribute('data-theme',m)}
  $('#thm').textContent={auto:'Auto',light:'Chiaro',dark:'Scuro'}[m];
}
let thm='auto';try{thm=localStorage.getItem('libtheme')||'auto'}catch(e){}
applyTheme(thm);
$('#thm').onclick=()=>{thm={auto:'light',light:'dark',dark:'auto'}[thm];applyTheme(thm)};
['g','l'].forEach(v=>$('#v'+v).onclick=()=>{colView=v;try{localStorage.setItem('libview',v)}catch(e){}renderCol()});
function setTop(){const t=$('#top');if(t&&t.offsetHeight&&document.documentElement)document.documentElement.style.setProperty('--topH',t.offsetHeight+'px')}
setTimeout(()=>{const sp=$('#splash');if(sp&&sp.remove)sp.remove()},1600);
setTop();if(typeof addEventListener=='function')addEventListener('resize',setTop);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(setTop);

if(H)H.replaceState({t:'home'},'');
renderHome();renderCol();
if(typeof navigator!=='undefined'&&'serviceWorker' in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{});
