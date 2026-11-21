/* ===== Turnier (Rundenmodus) ===== */
const THINT={0:'Gemeinsam überleben, das Wasser steigt!',1:'A = Bombe. Der letzte Überlebende gewinnt.',3:'A / ▲ springen · B schubsen. Wer zuerst im Ziel ist, gewinnt.',d:'Tippe A so schnell du kannst!'};
function tourClear(){clearInterval(tTm);clearTimeout(tTm);tTm=null}
const tourRows=()=>list().map(p=>({p,v:p.pts-((T&&T.s[p.id])||0)})).sort((a,b)=>b.v-a.v);
const tourRank=rows=>rows.map(r=>1+rows.findIndex(x=>x.v===r.v));
function startTourney(){const l=list();if(!l.length){msg('Zum Turnier braucht es mindestens einen Spieler.');return}
 const o=gset[11],n=[3,5,7][o.n]||5,pool=o.pool===1?[0,1,3,2,4,5,6,7]:[0,1,3],seq=[];
 while(seq.length<n){const b=pool.slice().sort(()=>Math.random()-.5);if(seq.length&&b[0]===seq[seq.length-1]&&b.length>1)b.push(b.shift());seq.push(...b)}
 seq.length=n;T={list:seq,r:0,s:{},t0:0,cd:0,h:{}};ST={};l.forEach(p=>T.s[p.id]=p.pts);tourNext()}
function tourHist(){const rows=tourRows(),rk=tourRank(rows);rows.forEach((r,i)=>{if(r.p.id.startsWith('bot'))return;const e=T.h[r.p.id]||(T.h[r.p.id]={n:r.p.name,pl:[],ls:[],rk:[]});e.rk[T.r-1]=rk[i]})}
function tourTitles(){const H=Object.values(T.h||{}),o=[];if(!H.length)return o;
 const best=(f,min,fmt)=>{let m=null,v=0;H.forEach(e=>{const x=f(e);if(x>v){v=x;m=e}});if(m&&v>=min)o.push(fmt(m,v))};
 best(e=>e.pl.filter(x=>x===1).length,2,(m,v)=>`🥇 Meiste Rundensiege: ${esc(m.n)} (${v}×)`);
 best(e=>e.pl.filter(x=>x===2).length,2,(m,v)=>`🥈 Dauer-Zweiter: ${esc(m.n)} (${v}×)`);
 best(e=>e.ls.filter(Boolean).length,2,(m,v)=>`🪦 Pechvogel: ${esc(m.n)} (${v}× Letzter)`);
 best(e=>{const r=e.rk.filter(x=>x!=null);return r.length<2?0:Math.max(...r.slice(0,-1))-r[r.length-1]},2,(m,v)=>`📈 Comeback-König: ${esc(m.n)} (+${v} Plätze)`);return o}
function tourNext(){if(!T)return;tourClear();if(T.r>0)tourHist();if(T.r>=T.list.length)return tourFinish();
 const g=T.list[T.r],rows=tourRows(),rk=tourRank(rows);
 $('trh').textContent='Runde '+(T.r+1)+' von '+T.list.length;
 $('trg').textContent=GAMES[g][2]+' '+GAMES[g][0];
 $('trt').textContent=THINT[g]||THINT.d;
 $('trq').innerHTML=T.list.map((x,i)=>`<span class="${i===T.r?'cur':i<T.r?'dn':''}">${GAMES[x][2]}</span>`).join('');
 $('trz').textContent=T.r?'Zwischenstand':'';
 $('trl').style.display=T.r?'':'none';
 $('trl').innerHTML=rows.map((r,i)=>`<li style="--c:${COL[r.p.co]}"><span class="n">${rk[i]}.</span>${av(r.p)}${esc(r.p.name)}${tmb(r.p)}<b>${r.v}</b></li>`).join('');
 T.cd=T.r?10:8;T.t0=Date.now();TIP={sel:{},pick:{}};
 show('trn');tipRender();
 tTm=setInterval(()=>{if(!T||st!=='trn')return tourClear();T.cd--;if(T.cd<=0)tourGo();else trsTxt()},1000)}
function tourGo(){if(!T||st!=='trn'||Date.now()-T.t0<1500)return;tourClear();const g=T.list[T.r];T.r++;launch(g)}
function tourCancel(){tourClear();T=null;show('menu')}
let cfT=0;
function confetti(){let cv=$('cf');if(!cv){cv=document.createElement('canvas');cv.id='cf';cv.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:30';document.body.appendChild(cv)}
 const dpr=Math.min(2,devicePixelRatio||1),W=cv.width=innerWidth*dpr,H=cv.height=innerHeight*dpr,c=cv.getContext('2d'),cols=['#ffc83d','#ff2d95','#18c9e8','#7dff7a','#ffffff'],id=++cfT,P=[];
 const add=n=>{for(let i=0;i<n;i++)P.push({x:Math.random()*W,y:-Math.random()*H*.25,vx:(Math.random()-.5)*160*dpr,vy:(140+Math.random()*240)*dpr,s:(7+Math.random()*8)*dpr,r:Math.random()*6,vr:(Math.random()-.5)*12,c:cols[i%cols.length],w:Math.random()*6})};
 add(120);cv.style.display='';let t0=0,last=0;
 const f=now=>{if(!t0)t0=last=now;const e=(now-t0)/1000,dt=Math.min(.05,(now-last)/1000);last=now;
  if(id!==cfT||st!=='tfin'||(e>3.5&&!P.length)){c.clearRect(0,0,W,H);cv.style.display='none';return}
  if(e<3.5)add(4);c.clearRect(0,0,W,H);
  for(let i=P.length-1;i>=0;i--){const p=P[i];p.w+=dt*4;p.x+=(p.vx+Math.sin(p.w)*60*dpr)*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;if(p.y>H+20){P.splice(i,1);continue}
   c.save();c.translate(p.x,p.y);c.rotate(p.r);c.scale(1,Math.cos(p.w*1.7));c.fillStyle=p.c;c.fillRect(-p.s/2,-p.s/3,p.s,p.s*.66);c.restore()}
  requestAnimationFrame(f)};
 requestAnimationFrame(f)}
function tourFinish(){const rows=tourRows(),rk=tourRank(rows),top=rows.length?rows[0].v:0,win=rows.filter(r=>r.v===top);const tt=tourTitles(),rr=(T.rr||[]).slice(),hist=T.h||{},gap=(()=>{const s=rows.find(r=>r.v<top&&!r.p.id.startsWith('bot')),d=s?top-s.v:0;return win.length===1&&s&&d<=3?`😬 Knapp geschlagen: ${esc(s.p.name)} (${d} ${d===1?'Punkt':'Punkte'} hinter dem Sieger)`:''})();T=null;tourClear();if(top>0&&tipHum().length>1)setCrown(win.filter(r=>!r.p.id.startsWith('bot')).map(r=>r.p.id));
 const one=win.length>1&&TMON&&win[0].p.tm&&new Set(win.map(r=>tkey(r.p))).size===1;$('tfh').textContent=one?'🏆 Turniersieger: '+TN[win[0].p.tm-1]:win.length>1?'🤝 Unentschieden!':'🏆 Turniersieger';
 $('tfw').innerHTML=win.map(r=>`<div class="tw" style="--c:${COL[r.p.co]}">${av(r.p)}<div>${esc(r.p.name)}</div>${tmb(r.p)}</div>`).join('');
 $('tfl').innerHTML=rows.map((r,i)=>`<li style="--c:${COL[r.p.co]}"><span class="n">${['🥇','🥈','🥉'][rk[i]-1]||rk[i]+'.'}</span>${av(r.p)}${esc(r.p.name)}${tmb(r.p)}${(()=>{const e=hist[r.p.id],v=e?(e.rk||[]).filter(x=>x!=null):[];return v.length>1?'<small class="vl">Platz: '+v.join(' → ')+'</small>':''})()}<b>${r.v}</b></li>`).join('');
 {const a=(gap?[gap]:[]).concat(tt,stAw());$('tfs').innerHTML=a.map(x=>`<span>${x}</span>`).join('');$('tfs').style.display=a.length?'':'none'}$('tfl').querySelectorAll('li').forEach((li,i)=>li.style.animationDelay=(.6+i*.09)+'s');$('tfs').querySelectorAll('span').forEach((x,i)=>x.style.animationDelay=(1+i*.12)+'s');
 {const tr=$('tfr');tr.innerHTML=rr.map((x,i)=>x&&GAMES[x.g]?`<span>${i+1}. ${GAMES[x.g][2]} ${x.w.length?esc(x.w.join(' + ')):'–'}</span>`:'').join('');tr.style.display=tr.innerHTML?'':'none';tr.querySelectorAll('span').forEach((x,i)=>x.style.animationDelay=(.8+i*.1)+'s')}
 tfT=Date.now();show('tfin');beep(cfgG.sfx,1);[0,4,7,12].forEach((n,i)=>setTimeout(()=>{if(st==='tfin')beep(cfgG.sfx,0,523*Math.pow(2,n/12))},250+i*140));setTimeout(()=>{if(st==='tfin')confetti()},400);
 win.forEach(r=>[0,1,2].forEach(k=>setTimeout(()=>{if(st==='tfin')emoFloat(r.p,'🏆')},500+k*500)));
 tTm=setTimeout(()=>{if(st==='tfin')show('menu')},15000)}

