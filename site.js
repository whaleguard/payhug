/* Payhug — site.js v3 */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const won=n=>Math.round(n).toLocaleString('ko-KR');
const mqMobile=matchMedia('(max-width:760px)');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- theme (시안 1/2/3) ---------- */
const THEMES={'1':'light','2':'forest','3':'ivory'};
function setTheme(k){
  if(!THEMES[k]) k='2';
  document.documentElement.dataset.theme=THEMES[k];
  $$('.ts-btn').forEach(b=>b.classList.toggle('on',b.dataset.t===k));
  try{const u=new URL(location.href);u.searchParams.set('t',k);history.replaceState(null,'',u)}catch(e){}
}
const ts=$('#themeSwitch');
if(ts){ts.addEventListener('click',e=>{const b=e.target.closest('.ts-btn');if(b)setTheme(b.dataset.t)});}
setTheme(new URLSearchParams(location.search).get('t')||document.documentElement.dataset.default||'2');

/* ---------- header / drawer ---------- */
const hd=$('#hd');
const onScroll=()=>{
  const y=scrollY;
  if(hd) hd.classList.toggle('solid', y>40 || document.body.classList.contains('lp'));
  const show=y>innerHeight*.6;
  $('#qfix')?.classList.toggle('show',show);
  $('.fab')?.classList.toggle('show',show);
};
addEventListener('scroll',onScroll,{passive:true});onScroll();
const drawer=$('#drawer');
const openDrawer=o=>{if(!drawer)return;drawer.classList.toggle('open',o);drawer.setAttribute('aria-hidden',!o);document.body.style.overflow=o?'hidden':''};
$$('[data-drawer-open]').forEach(b=>b.addEventListener('click',()=>openDrawer(true)));
$$('[data-drawer-close]').forEach(b=>b.addEventListener('click',()=>openDrawer(false)));
$$('#drawer nav a, #drawer .drawer-cta a').forEach(a=>a.addEventListener('click',()=>openDrawer(false)));

/* ---------- reveal ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
$$('.rv').forEach((el,i)=>{el.style.transitionDelay=((i%4)*70)+'ms';io.observe(el)});

/* ---------- videos: hero picks orientation, others lazy ---------- */
const hv=$('#heroVideo');
function heroSrc(){return (mqMobile.matches||innerHeight>innerWidth)?'v-hero-tall.mp4':'v-hero-wide.mp4'}
function loadHero(){
  if(!hv||reduce) return;
  const s=heroSrc(); if(hv.dataset.cur===s) return;
  hv.dataset.cur=s; hv.src=s; hv.load();
  const p=hv.play(); if(p) p.then(()=>hv.parentElement.classList.add('has-video')).catch(()=>{});
}
if(hv){hv.addEventListener('playing',()=>hv.parentElement.classList.add('has-video'));loadHero();addEventListener('resize',()=>{clearTimeout(loadHero.t);loadHero.t=setTimeout(loadHero,300)});}
const vio=new IntersectionObserver(es=>es.forEach(e=>{
  const v=e.target;
  if(e.isIntersecting){ if(!v.src&&v.dataset.src&&!reduce){v.src=v.dataset.src;} v.play&&v.play().catch(()=>{}); }
  else if(v.src){ v.pause(); }
}),{rootMargin:'200px'});
$$('video[data-src]').forEach(v=>vio.observe(v));

/* ---------- hero live engine ---------- */
const alerts=$('#alerts'), balAmt=$('#balAmt'), bal=$('#bal'), balDelta=$('#balDelta');
const rowCard=$('#rowCard'), rowApp=$('#rowApp'), soundBtn=$('#soundBtn');
let balance=426048, card=322690, app=103358, soundOn=false, actx=null;
const FEED=[
  {src:'카드 매출',ch:'card',amt:184200},{src:'배달의민족',ch:'app',amt:61200},
  {src:'쿠팡이츠',ch:'app',amt:42158},{src:'카드 매출',ch:'card',amt:97250},
  {src:'요기요',ch:'app',amt:28900},{src:'카드 매출',ch:'card',amt:233480},
  {src:'배달의민족',ch:'app',amt:75300},{src:'카드 매출',ch:'card',amt:128400}
];
let fi=0;
const TALK='<svg viewBox="0 0 24 24"><path d="M12 4C6.5 4 2 7.5 2 11.8c0 2.8 1.9 5.2 4.7 6.6L5.8 22l4-2.6c.7.1 1.4.2 2.2.2 5.5 0 10-3.5 10-7.8S17.5 4 12 4z" fill="#3A1D1D"/></svg>';
function ding(){
  if(!soundOn) return;
  try{
    actx=actx||new (window.AudioContext||window.webkitAudioContext)();
    const t0=actx.currentTime;
    [[1318.5,0],[1046.5,.18]].forEach(([f,d])=>{
      const o=actx.createOscillator(),g=actx.createGain(),o2=actx.createOscillator(),g2=actx.createGain();
      o.type='sine';o.frequency.value=f;o2.type='sine';o2.frequency.value=f*2.01;
      g.gain.setValueAtTime(0,t0+d);g.gain.linearRampToValueAtTime(.32,t0+d+.012);g.gain.exponentialRampToValueAtTime(.0008,t0+d+1.1);
      g2.gain.setValueAtTime(0,t0+d);g2.gain.linearRampToValueAtTime(.08,t0+d+.01);g2.gain.exponentialRampToValueAtTime(.0005,t0+d+.5);
      o.connect(g).connect(actx.destination);o2.connect(g2).connect(actx.destination);
      o.start(t0+d);o.stop(t0+d+1.2);o2.start(t0+d);o2.stop(t0+d+.6);
    });
  }catch(e){}
}
function countTo(el,from,to,ms){
  if(!el) return; const t0=performance.now();
  (function step(t){const k=Math.min(1,(t-t0)/ms);const e=1-Math.pow(1-k,3);el.textContent=won(from+(to-from)*e);if(k<1)requestAnimationFrame(step)})(t0);
}
const bars=$$('.bal-bars i');
function shiftBars(){
  if(!bars.length) return;
  const h=bars.map(b=>parseFloat(b.style.height)||30);h.shift();h.push(45+Math.random()*55);
  bars.forEach((b,i)=>b.style.height=h[i]+'%');
}
bars.forEach(b=>b.style.height=(25+Math.random()*50)+'%');
function now(){const d=new Date();return (d.getHours()<12?'오전 ':'오후 ')+((d.getHours()%12)||12)+':'+String(d.getMinutes()).padStart(2,'0')}
function pushAlert(){
  if(!alerts) return;
  const f=FEED[fi++%FEED.length];
  const el=document.createElement('div');el.className='alert';
  el.innerHTML=`<span class="talk">${TALK}</span><div class="tx"><div class="t"><span>페이허그 입금 안내</span><em>지금</em></div><p>${f.src} 정산금 <b class="amt num">+${won(f.amt)}원</b>이<br>사장님 계좌로 입금되었습니다.</p></div>`;
  alerts.prepend(el);
  const max=mqMobile.matches?2:3;
  const items=$$('.alert',alerts);
  items.slice(max).forEach(x=>{x.classList.add('out');setTimeout(()=>x.remove(),450)});
  ding();
  setTimeout(()=>{
    const from=balance;balance+=f.amt;
    if(f.ch==='card'){countTo(rowCard,card,card+f.amt,900);card+=f.amt}else{countTo(rowApp,app,app+f.amt,900);app+=f.amt}
    if(rowCard) rowCard.textContent=won(card)+'원'; if(rowApp) rowApp.textContent=won(app)+'원';
    countTo(balAmt,from,balance,1100);
    if(balDelta){balDelta.textContent='+'+won(f.amt)+'원';balDelta.classList.add('on');setTimeout(()=>balDelta.classList.remove('on'),1600)}
    bal&&(bal.classList.remove('bump'),void bal.offsetWidth,bal.classList.add('bump'));
    shiftBars();
    if(balance>3200000){setTimeout(()=>{const b=balance;balance=426048;card=322690;app=103358;countTo(balAmt,b,balance,800);if(rowCard)rowCard.textContent=won(card)+'원';if(rowApp)rowApp.textContent=won(app)+'원'},2200)}
  },350);
}
let liveTimer=null;
function startLive(){if(liveTimer||!alerts)return;pushAlert();liveTimer=setInterval(pushAlert,3200)}
function stopLive(){clearInterval(liveTimer);liveTimer=null}
if(alerts){
  const hio=new IntersectionObserver(es=>es.forEach(e=>{e.isIntersecting&&!document.hidden?startLive():stopLive()}),{threshold:.15});
  hio.observe($('#top'));
  document.addEventListener('visibilitychange',()=>{document.hidden?stopLive():(scrollY<innerHeight&&startLive())});
  setTimeout(()=>soundBtn&&!soundOn&&soundBtn.classList.add('nudge'),2600);
}
if(soundBtn){
  soundBtn.addEventListener('click',()=>{
    soundOn=!soundOn;soundBtn.setAttribute('aria-pressed',soundOn);
    $('span',soundBtn).textContent=soundOn?'띵동 소리 켜짐':'띵동 소리 켜기';
    if(soundOn){actx=actx||new (window.AudioContext||window.webkitAudioContext)();actx.resume&&actx.resume();ding()}
  });
}

/* ---------- key number count ---------- */
const kio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;const to=+el.dataset.count;if(to>0)countTo(el,0,to,900);kio.unobserve(el)}),{threshold:.6});
$$('[data-count]').forEach(el=>kio.observe(el));

/* ---------- race ---------- */
const race=$('#race');
if(race){const rio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){race.classList.add('go');rio.disconnect()}}),{threshold:.4});rio.observe(race)}

/* ---------- scrolly phone ---------- */
const scr=$('#scr');
if(scr){
  const sio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){$$('.sstep').forEach(s=>s.classList.toggle('on',s===e.target));scr.dataset.step=e.target.dataset.i}}),{rootMargin:'-45% 0px -45% 0px'});
  $$('.sstep').forEach(s=>sio.observe(s));
}

/* ---------- calculator ---------- */
const cs=$('#calcSales'), cd=$('#calcDays');
function calc(){
  if(!cs) return;
  const v=+(cs.value.replace(/[^\d]/g,''))||0, d=Math.min(31,+(cd.value.replace(/[^\d]/g,''))||0);
  const fee=v*.01, day=d*300;
  $('#calcTotal').textContent=won(fee+day); $('#calcFee').textContent=won(fee)+'원'; $('#calcDay').textContent=won(day)+'원'; $('#calcD').textContent=d;
  $$('#calc .chips button').forEach(b=>b.classList.toggle('on',+b.dataset.v===v));
}
if(cs){
  cs.addEventListener('input',()=>{const raw=cs.value.replace(/[^\d]/g,'').slice(0,11);cs.value=raw?won(+raw):'';calc()});
  cd.addEventListener('input',()=>{cd.value=cd.value.replace(/[^\d]/g,'').slice(0,2);calc()});
  $$('#calc .chips button').forEach(b=>b.addEventListener('click',()=>{cs.value=won(+b.dataset.v);calc()}));
  calc();
}

/* ---------- eligibility quiz ---------- */
const QS=[
  {q:'사업자등록이 되어 있나요?',s:'개인·법인 사업자 모두 가능합니다.',o:['네, 있습니다','아직 없습니다'],ok:0},
  {q:'카드나 배달앱 매출이 있나요?',s:'카드·배민·쿠팡이츠·요기요 중 하나면 됩니다.',o:['카드 매출이 있어요','배달앱 매출이 있어요','둘 다 있어요','아직 없어요'],ok:[0,1,2]},
  {q:'영업을 시작한 지 얼마나 됐나요?',s:'신규 사업자도 상담 가능합니다.',o:['3개월 미만','3개월~1년','1년 이상'],ok:[0,1,2]}
];
const qwrap=$('#qwrap'), qbarI=$('#qbarI');
let qi=0;
function renderQ(){
  if(!qwrap) return;
  qbarI.style.width=(qi/QS.length*100)+'%';
  if(qi>=QS.length){
    qwrap.innerHTML=`<div class="qres"><div class="ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M5 12l5 5 9-10"/></svg></div><h4>페이허그 가입 대상입니다</h4><p>지금 가입하면 다음 날부터 매출이 먼저 들어옵니다.</p><div class="row"><a class="btn btn-lime" href="#join">가입 시작하기</a><button class="btn btn-line" data-consult>상담으로 진행</button></div></div>`;return;
  }
  const Q=QS[qi];
  qwrap.innerHTML=`<div class="qstep"><p class="q">${Q.q}</p><p class="qs">${Q.s}</p><div class="qopts">${Q.o.map((o,i)=>`<button type="button" data-i="${i}">${o}</button>`).join('')}</div></div>`;
}
if(qwrap){
  qwrap.addEventListener('click',e=>{
    const b=e.target.closest('.qopts button'); if(!b) return;
    const Q=QS[qi], i=+b.dataset.i, ok=Array.isArray(Q.ok)?Q.ok.includes(i):Q.ok===i;
    if(!ok){qbarI.style.width='100%';qwrap.innerHTML=`<div class="qres"><h4>상담으로 먼저 확인해 드릴게요</h4><p>조건에 따라 가입 방법이 달라질 수 있습니다. 상담사가 가능 여부를 바로 알려 드립니다.</p><div class="row"><button class="btn btn-lime" data-consult>30초 상담신청</button><button class="btn btn-line" type="button" id="qReset">처음부터</button></div></div>`;return}
    qi++;renderQ();
  });
  qwrap.addEventListener('click',e=>{if(e.target.id==='qReset'){qi=0;renderQ()}});
  renderQ();
}

/* ---------- FAQ ---------- */
const faqQ=$('#faqQ'), cats=$('#faqCats');
let cat='all';
function filterFaq(){
  const q=(faqQ?.value||'').trim().replace(/\s+/g,'');
  let n=0;
  $$('#faqList .qa').forEach(d=>{
    const t=d.textContent.replace(/\s+/g,'');
    const show=(cat==='all'||d.dataset.c===cat)&&(!q||t.includes(q)||q.split('').filter(ch=>/[가-힣a-z0-9]/i.test(ch)).length>1&&[...q.matchAll(/[가-힣]{2,}/g)].some(m=>t.includes(m[0])));
    d.classList.toggle('hide',!show); if(show)n++;
  });
  const em=$('#faqEmpty'); if(em) em.style.display=n?'none':'block';
}
if(cats) cats.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;cat=b.dataset.c;$$('button',cats).forEach(x=>x.classList.toggle('on',x===b));filterFaq()});
faqQ&&faqQ.addEventListener('input',filterFaq);
$('#qsearch')?.addEventListener('submit',e=>{
  e.preventDefault();const v=$('#qsInput').value.trim();
  if(faqQ){faqQ.value=v.replace(/[?？]/g,'');cat='all';$$('#faqCats button').forEach(x=>x.classList.toggle('on',x.dataset.c==='all'));filterFaq();}
  $('#faq').scrollIntoView({behavior:'smooth'});
  const first=$('#faqList .qa:not(.hide)'); if(first){setTimeout(()=>{first.open=true;first.classList.add('flash')},600)}
});

/* ---------- consult sheet ---------- */
const sheet=$('#sheet'), sbg=$('#sheetBg'), form=$('#cform');
let lastFocus=null, ctype='consult';
function openSheet(type){
  if(!sheet) return; ctype=type||'consult'; lastFocus=document.activeElement;
  sheet.classList.remove('is-done'); sheet.classList.add('open'); sbg.classList.add('open'); sheet.setAttribute('aria-hidden','false');
  $('#sheetT').textContent=ctype==='partner'?'파트너 문의':'30초 상담신청';
  document.body.style.overflow='hidden'; setTimeout(()=>$('#cName').focus({preventScroll:true}),350);
}
function closeSheet(){if(!sheet)return;sheet.classList.remove('open');sbg.classList.remove('open');sheet.setAttribute('aria-hidden','true');document.body.style.overflow='';lastFocus&&lastFocus.focus&&lastFocus.focus({preventScroll:true})}
document.addEventListener('click',e=>{
  const c=e.target.closest('[data-consult]'); if(c){e.preventDefault();openDrawer(false);openSheet(c.dataset.type);return}
  if(e.target.closest('[data-sheet-close]')){closeSheet()}
});
sbg&&sbg.addEventListener('click',closeSheet);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeSheet();openDrawer(false)}});
$$('#cform .chips').forEach(g=>g.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('button',g).forEach(x=>x.classList.toggle('on',x===b));g.closest('.fld').classList.remove('bad')}));
const tel=$('#cTel');
tel&&tel.addEventListener('input',()=>{let d=tel.value.replace(/\D/g,'').slice(0,11);tel.value=d.length<4?d:d.length<8?d.slice(0,3)+'-'+d.slice(3):d.slice(0,3)+'-'+d.slice(3,d.length-4)+'-'+d.slice(-4)});
$('#cName')?.addEventListener('input',e=>e.target.closest('.fld').classList.remove('bad'));
form&&form.addEventListener('submit',async e=>{
  e.preventDefault();
  const name=$('#cName').value.trim(), t=tel.value.replace(/\D/g,'');
  const biz=$('[data-name=biz] .on')?.textContent, sales=$('[data-name=sales] .on')?.textContent;
  let ok=true;
  const bad=(id,b)=>{$(id).closest('.fld').classList.toggle('bad',b);if(b)ok=false};
  bad('#cName',name.length<2); bad('#cTel',!/^01[016789]\d{7,8}$/.test(t));
  bad('#eBiz',!biz); bad('#eSales',!sales);
  if(!$('#cAgree').checked){ok=false;$('#cAgree').closest('.agree').animate([{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'none'}],{duration:300})}
  if(!ok) return;
  const btn=$('#cSubmit'); btn.disabled=true; btn.textContent='접수 중…';
  const data={type:ctype,name,tel:t,biz,sales,page:location.pathname,at:new Date().toISOString()};
  try{
    if(window.PAYHUG_CONSULT_ENDPOINT){await fetch(window.PAYHUG_CONSULT_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})}
    try{const k='payhug_consults';const a=JSON.parse(localStorage.getItem(k)||'[]');a.push(data);localStorage.setItem(k,JSON.stringify(a.slice(-20)))}catch(_){}
  }catch(err){}
  btn.disabled=false; btn.textContent='상담 신청하기'; form.reset(); $$('#cform .chips .on').forEach(x=>x.classList.remove('on'));
  sheet.classList.add('is-done');
});

/* ---------- marquee duplicate ---------- */
const mq=$('#mqTrack'); if(mq){mq.innerHTML+=mq.innerHTML;$$('img',mq).forEach((im,i)=>{if(i>=mq.children.length/2)im.alt=''})}

/* ---------- footer pSEO links ---------- */
const seo=$('#seoLinks');
if(seo&&window.PAYHUG_SEO){seo.innerHTML=window.PAYHUG_SEO.map(([h,t])=>`<a href="${h}">${t}</a>`).join('')}
})();
