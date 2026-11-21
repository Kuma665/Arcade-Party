/* ===== Boss-Rush: alle zusammen gegen den Drachen. Rollen: Schild / Angriff / Heilung ===== */
(function(){
const W=1280,H=720,FY=610,rnd=Math.random,hyp=Math.hypot,
 ROLE=['🛡 Schild','🏹 Bogen','⚔ Schwert'],RIC=['🛡','🏹','⚔'],
 BSK=[.65,1,1.3],DIF=[.75,1,1.3],CHG=1.3,SW0=.72,SW1=.95,PERF=.35,SMAX=100,SDR=38,SRG=24;
let BO=null;

/* --- Helfer --- */
const alive=()=>BO.pl.filter(q=>q.hp>0);
const fx=(x,y,n,col,sp,life)=>{for(let i=0;i<n;i++){const a=rnd()*6.283,v=(.3+rnd())*(sp||200);BO.pa.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:life||.5,L:life||.5,c:col,s:3+rnd()*4})}};
const pop=(x,y,s,c)=>BO.tx.push({x,y,s,c:c||'#ffc83d',t:1.1});
const banner=s=>{BO.bn={s,t:2.3}};
const phase=()=>BO.hp>BO.mx*.66?0:BO.hp>BO.mx*.33?1:2;
const shielding=()=>BO.pl.filter(q=>q.role===0&&q.hp>0&&q.hold&&q.sl<=0&&q.sta>0);

/* --- Aktionen --- */
function hurtBoss(q,d,txt){const B=BO;if(B.stun>0)d*=1.5;d=Math.round(d);B.hp=Math.max(0,B.hp-d);B.hf=.18;q.dmg+=d;
 B.bolts.push({x:q.x,y:q.y-90,t:.22,c:pcol(q.p)});pop(B.bx+(rnd()-.5)*120,B.by+40,(txt?txt+' ':'')+d,txt?'#ff2d95':'#fff');fx(B.bx,B.by+30,txt?14:7,txt?'#ffc83d':pcol(q.p),230,.4);
 if(B.hp<=0&&B.end==null)win()}
function hurt(q,d){if(q.hp<=0)return;q.hp=Math.max(0,q.hp-d);q.hf=.25;pop(q.x,q.y-110,'-'+Math.round(d),'#ff4d4d');fx(q.x,q.y-50,8,'#ff4d4d',180,.4);padBuzz(q.p);beep(cfgG.sfx,1,180);
 if(q.hp<=0){q.fl=1;stb(q.p,'d');fx(q.x,q.y-50,18,pcol(q.p),260,.7);pop(q.x,q.y-130,'☠','#fff');if(!alive().length&&BO.end==null)lose()}}
function heal(q,t,n){const a=Math.min(n,100-t.hp);if(a<=0)return 0;t.hp+=a;q.heal+=a;pop(t.x,t.y-110,'+'+Math.round(a),'#4dff9d');fx(t.x,t.y-60,4,'#4dff9d',90,.4);return a}
function out(q){q.gone=1;q.hp=0;q.fl=1;q.hold=0;q.ch=0;if(!alive().length&&BO.end==null)lose()}

/* --- Update --- */
function upd(dt){const B=BO,S=B.pl;B.sh=Math.max(0,B.sh-dt*1.8);B.hf=Math.max(0,B.hf-dt);B.t0+=dt;
 for(const p of B.pa){p.x+=p.vx*dt;p.y+=p.vy*dt;const f=Math.pow(.02,dt);p.vx*=f;p.vy*=f;p.t-=dt}B.pa=B.pa.filter(p=>p.t>0);
 for(const t of B.tx){t.y-=dt*50;t.t-=dt}B.tx=B.tx.filter(t=>t.t>0);
 for(const b of B.bolts)b.t-=dt;B.bolts=B.bolts.filter(b=>b.t>0);
 if(B.bn&&(B.bn.t-=dt)<=0)B.bn=null;
 for(const q of S){if(q.hf>0)q.hf-=dt;if(q.fl)q.fl+=dt}
 if(B.sel){selTick(dt);return}
 if(B.cd>0){B.cd-=dt;cdTick(Math.max(0,Math.ceil(B.cd)));return}
 if(B.end!=null){if((B.end-=dt)<=0)fin();return}
 B.t+=dt;
 for(const q of S){q.hcd=Math.max(0,q.hcd-dt);q.bcd=Math.max(0,q.bcd-dt);q.acd=Math.max(0,q.acd-dt);q.sl=Math.max(0,q.sl-dt);
  if(q.hp<=0){q.hold=false;q.ch=0;continue}
  arMove(q,dt,B)}
 arShots(dt,B);arBoss(dt,B);
 /* Boss */
 if(B.stun>0)B.stun-=dt;
 const ph=phase();if(ph>B.ph){B.ph=ph;banner(ph===1?'🔥 Der Drache wird wütend!':'💢 WUTANFALL!');beep(cfgG.sfx,1,110);B.sh=.8}}
function win(){const B=BO;B.end=3.4;B.won=1;B.atk=null;B.bn=null;B.tm=Math.round(B.t*10)/10;banner('🏆 BOSS BESIEGT!');jingle()}
function lose(){const B=BO;B.end=3.4;B.won=0;B.atk=null;banner('💀 Der Drache hat gewonnen')}
function fin(){const B=BO;B.done=1;
 const rows=B.pl.map(q=>({p:q.p,v:Math.round(q.dmg+q.blk*1.2+q.heal*1.5),txt:'⚔ '+Math.round(q.dmg)+' Schaden'}));
 const hr=B.pl.filter(q=>!q.bot),rec=B.won&&hr.length&&B.dfi>0?{gi:4,v:Math.round(B.t),who:hr.map(q=>q.p.name).join(' + ').slice(0,24),low:1}:null;
 award(rows,(B.won?'🏆 Boss besiegt in '+Math.round(B.t)+' s':'💀 Niederlage')+(T||!stAw().length?'':' · '+stAw().join(' · ')),rec,'max')}

/* --- Pause / Eingabe --- */
const lost=()=>BO?BO.pl.filter(q=>q.hp>0&&!q.bot&&(/^gp/.test(q.p.id)?!P[q.p.id]:!fixed(q.p.id)&&(!P[q.p.id]||Date.now()-P[q.p.id].seen>4000))):[];
const PZ=makePause({obj:()=>BO,zone:'opz',note:'opn',rows:'opr',click:'boPzClick',lost,autoPause:B=>B.end==null,
 drop:()=>lost().forEach(q=>out(q)),restart:()=>launch(lastG==null?4:lastG)});
window.boPzClick=i=>PZ.click(i);
/* --- Arena: laufen, springen, schießen --- */
const SPC=.8;
function arMove(q,dt,B){let l=0,r=0,j=0,bh=false;
 if(q.bot){if(q.hp>0){const tx=q.role!==1?B.bx-185-(q.i%3)*14:B.bx-340-(q.i%4)*46;if(Math.abs(q.x-tx)>12){if(q.x<tx)r=1;else l=1}
  if(q.on&&rnd()<dt*.4/q.sk)j=1;q.at-=dt;if(q.at<=0&&Math.abs(q.x-tx)<60){if(q.scd<=0&&rnd()<.22)useSpecial(q);else useMain(q);q.at=.4+rnd()*.5/q.sk}
  for(const f of B.fb)if(f.x>q.x&&f.x-q.x<240&&f.y>FY-120&&q.on)j=1;
  for(const w of B.wv)if(w.x>q.x&&w.x-q.x<200&&q.on&&rnd()<.75*q.sk+.2)j=1;
  for(const m of B.mt)if(Math.abs(m.x-q.x)<85&&m.t<m.W+.5){if(q.x<=m.x){l=1;r=0}else{r=1;l=0}}}}
 else{const pp=P[q.p.id],b=pp?pp.b:0;l=b&1;r=b&2;j=b&(32|4);bh=!!(b&(8|128));
  if(bh&&!q.bh)useMain(q);
  if(bh)q.chg=Math.min(1.6,q.chg+dt);else{if(q.bh&&q.chg>=SPC)useSpecial(q);q.chg=0}
  q.bh=bh}
 q.scd=Math.max(0,q.scd-dt);q.inv=Math.max(0,q.inv-dt);
 q.vx=((r?1:0)-(l?1:0))*270;if(q.vx)q.dir=q.vx>0?1:-1;else if(q.bot)q.dir=1;
 q.x=Math.max(30,Math.min(B.bx-115,q.x+q.vx*dt));
 if(j&&q.on){q.vy=-950;q.on=0}
 q.vy+=2600*dt;q.y+=q.vy*dt;if(q.y>=FY+8){q.y=FY+8;q.vy=0;q.on=1}
 if(q.spin>0){q.spin-=dt;if(!q.sh&&B.end==null&&Math.abs(q.x-B.bx)<235&&Math.abs(q.y-50-B.by)<190){q.sh=1;bossHit(q,90)}}}
function arrow(q,vy,d){(BO.sht=BO.sht||[]).push({x:q.x+q.dir*30,y:q.y-75,vx:q.dir*760,vy,q,t:0,d,k:'a'})}
function melee(q,reach,d,col){const B=BO;(B.sl=B.sl||[]).push({x:q.x,y:q.y-55,dir:q.dir,t:.18,col,rc:reach});
 if(B.end==null&&q.dir>0&&q.x<B.bx&&B.bx-105-q.x<=reach&&Math.abs(q.y-55-B.by)<190)bossHit(q,d)}
function useMain(q){const B=BO;if(!B||B.sel||B.cd>0||B.end!=null||q.hp<=0||q.acd>0||q.spin>0)return;
 if(q.role===1){q.acd=.35;arrow(q,0,20);beep(cfgG.sfx*.4,0,880+rnd()*120)}
 else if(q.role===2){q.acd=.45;melee(q,95,35,'255,255,255');beep(cfgG.sfx*.5,0,300)}
 else{q.acd=.5;melee(q,75,15,'127,255,255');beep(cfgG.sfx*.5,1,260)}}
function useSpecial(q){const B=BO;if(!B||B.sel||B.cd>0||B.end!=null||q.hp<=0||q.scd>0||q.spin>0)return;q.scd=.3;q.acd=.5;
 if(q.role===1){arrow(q,-120,25);arrow(q,0,25);arrow(q,120,25);beep(cfgG.sfx*.7,0,1100)}
 else if(q.role===2){q.spin=.6;q.sh=0;q.vy=-1150;q.on=0;beep(cfgG.sfx*.7,0,500)}
 else{(B.sht=B.sht||[]).push({x:q.x+q.dir*40,y:q.y-65,vx:q.dir*560,vy:0,q,t:0,d:40,k:'s',stun:1.6});beep(cfgG.sfx*.7,1,330)}}
function bossHit(q,d){const B=BO;if(B.stun>0)d=Math.round(d*1.5);B.hp=Math.max(0,B.hp-d);B.hf=.18;q.dmg+=d;if(d>=40)B.sh=Math.max(B.sh,.3);
 pop(B.bx+(rnd()-.5)*120,B.by-60,''+d,d>=40?'#ffc83d':'#fff');fx(B.bx-60,B.by,5,pcol(q.p),230,.35);if(B.hp<=0&&B.end==null)win()}
function arShots(dt,B){const a=B.sht;
 if(a)for(let i=a.length-1;i>=0;i--){const s=a[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.t+=dt;
  if(B.end==null&&Math.abs(s.x-B.bx)<105&&Math.abs(s.y-B.by)<115){a.splice(i,1);bossHit(s.q,s.d);if(s.stun){B.stun=Math.max(B.stun,s.stun);banner('💫 Betäubt! 1,5× Schaden')}continue}
  if(s.x<-30||s.x>W+30||s.t>2)a.splice(i,1)}
 const l=B.sl;if(l)for(let i=l.length-1;i>=0;i--){l[i].t-=dt;if(l[i].t<=0)l.splice(i,1)}}

/* --- Drachenangriffe --- */
function arHit(B,x,y,rx,ry,d){let h=0;for(const q of B.pl){if(q.hp<=0||q.inv>0)continue;
 if(Math.abs(q.x-x)<rx+18&&Math.abs(q.y-47-y)<ry+46){h=1;q.inv=1;hurt(q,Math.round(d));if(q.hp<=0){q.y=FY+8;q.vy=0;q.chg=0;q.spin=0}else{q.vy=-350;q.on=0}}}return h}
function arStart(B){const ph=phase(),r=rnd(),T=[.9,.8,.7][ph];
 const ty=ph===0?(r<.55?'fire':'wave'):(r<.35?'fire':r<.7?'wave':'rain');beep(cfgG.sfx,1,260);
 if(ty==='fire'){const n=Math.min(3,1+ph);B.cur={ty,t:0,T,k:0,n,hs:Array.from({length:n},()=>rnd()<.5?FY-30:FY-200)}}
 else if(ty==='wave')B.cur={ty,t:0,T:[1,.9,.8][ph],k:0,n:ph>=2?2:1};
 else{const n=3+ph;for(let i=0;i<n;i++)B.mt.push({x:80+rnd()*(B.bx-300),t:0,W:.9+i*.3,y:-60});B.nx=[2.4,1.8,1.3][ph]+1.2}}
function arBoss(dt,B){const pr=B.df**.5,ph=phase();
 for(let i=B.fb.length-1;i>=0;i--){const f=B.fb[i];f.x-=520*dt;if(arHit(B,f.x,f.y,26,26,20*pr)||f.x<-60)B.fb.splice(i,1)}
 for(let i=B.wv.length-1;i>=0;i--){const w=B.wv[i];w.x-=480*dt;arHit(B,w.x,FY-14,18,22,25*pr);if(w.x<-40)B.wv.splice(i,1)}
 for(let i=B.mt.length-1;i>=0;i--){const m=B.mt[i];m.t+=dt;if(m.t<m.W)continue;m.y=-60+(m.t-m.W)*1500;
  if(m.y>=FY+4){B.mt.splice(i,1);B.sh=Math.max(B.sh,.25);fx(m.x,FY,16,'#ff8a2d',320,.6);beep(cfgG.sfx,1,90);arHit(B,m.x,FY-30,62,40,28*pr)}
  else arHit(B,m.x,m.y,30,30,28*pr)}
 if(B.stun>0){B.cur=null;B.nx=Math.max(B.nx,.9);return}
 if(B.cur){const a=B.cur;a.t+=dt;
  if(a.ty==='fire')while(a.k<a.n&&a.t>=a.T+a.k*.5){B.fb.push({x:B.bx-100,y:a.hs[a.k]});a.k++;B.sh=Math.max(B.sh,.15);beep(cfgG.sfx,1,200)}
  else while(a.k<a.n&&a.t>=a.T+a.k*.9){B.wv.push({x:B.bx-110});a.k++;B.sh=Math.max(B.sh,.35);beep(cfgG.sfx,1,90)}
  if(a.k>=a.n){B.cur=null;B.nx=([2.4,1.8,1.3][ph]+rnd()*.8)/pr}}
 else if((B.nx-=dt)<=0)arStart(B)}
function arDraw(c,B,now,G){if(B.end!=null)return;const a=B.cur,bl=.45+.35*Math.sin(now*22);c.save();c.textAlign='center';
 if(a){if(a.ty==='fire'){for(let k=a.k;k<a.n;k++){const y=a.hs[k];c.strokeStyle='rgba(255,90,60,'+bl+')';c.lineWidth=4;c.setLineDash([18,12]);c.beginPath();c.moveTo(B.bx-120,y);c.lineTo(0,y);c.stroke();c.setLineDash([]);c.font='34px sans-serif';c.fillStyle='#fff';c.fillText('⚠',46,y)}
   G('#ff8a2d',30);c.fillStyle='rgba(255,140,40,'+(.3+bl*.5)+')';c.beginPath();c.arc(B.bx-110,B.by-40,34,0,7);c.fill();G('transparent',0)}
  else{c.fillStyle='rgba(255,50,60,'+(bl*.35+.08)+')';c.fillRect(0,FY-40,B.bx-110,50);c.font='34px sans-serif';c.fillStyle='#fff';c.fillText('⚠',46,FY-60)}}
 c.font='60px sans-serif';for(const f of B.fb)c.fillText('🔥',f.x,f.y);
 for(const w of B.wv){G('#ff4d4d',18);c.fillStyle='#ff6a3d';c.beginPath();c.roundRect(w.x-18,FY-36,36,44,10);c.fill();G('transparent',0)}
 for(const m of B.mt){if(m.t<m.W){c.strokeStyle='rgba(255,70,70,'+(.35+bl)+')';c.lineWidth=4;c.beginPath();c.ellipse(m.x,FY+4,52,12,0,0,7);c.stroke()}else{c.font='64px sans-serif';c.fillText('☄️',m.x,m.y)}}
 c.restore()}

/* --- Ausrüstung wählen (vor jedem Kampf) --- */
const EQ=[{r:2,ic:'⚔',n:'Schwert',d:'Nahkampf'},{r:1,ic:'🏹',n:'Bogen',d:'aus der Ferne'},{r:0,ic:'🛡',n:'Schild',d:'stoßen & betäuben'}],LEQ={};
function eqSet(q,i){q.pi=(i+EQ.length)%EQ.length;q.role=EQ[q.pi].r}
function selIn(p,dn){const q=BO.pl.find(q=>q.p.id===p.id);if(!q)return;
 if(dn(8)||dn(128)){q.ok=0;return}
 if(q.ok)return;
 if(dn(1)||dn(32)){eqSet(q,q.pi-1);beep(cfgG.sfx*.5,0,520)}
 else if(dn(2)||dn(64)){eqSet(q,q.pi+1);beep(cfgG.sfx*.5,0,520)}
 else if(dn(4)){q.ok=1;beep(cfgG.sfx,0,740)}}
function selTick(dt){const B=BO;B.selT-=dt;
 for(const q of B.pl)if(q.bot&&!q.ok&&(q.bw-=dt)<=0)q.ok=1;
 if(B.selT>0&&!B.pl.every(q=>q.ok))return;
 B.pl.forEach(q=>{q.ok=1;LEQ[q.p.id]=q.pi});
 B.mx=B.hp=Math.round(3000*B.pl.length*B.df/10)*10;B.pl.forEach((q,i)=>{q.x=90+i*Math.min(110,520/Math.max(1,B.pl.length-1));q.y=FY+8;q.vy=0;q.on=1});
 B.sel=0;B.cd=3}
function drawSel(c,B){c.save();c.textAlign='center';c.lineWidth=5;c.strokeStyle='#0b0820';
 c.font='56px Bungee,sans-serif';c.strokeText('Ausrüstung wählen',W/2,70);c.fillStyle='#ffc83d';c.fillText('Ausrüstung wählen',W/2,70);
 c.font='700 26px Rajdhani,sans-serif';c.fillStyle='#f6f3ff';c.strokeText('◀ ▶ wählen · A bestätigen · B ändern',W/2,108);c.fillText('◀ ▶ wählen · A bestätigen · B ändern',W/2,108);
 const k=B.pl.length>6?.5:.62;
 for(const q of B.pl){const e=EQ[q.pi],x=q.x,y=q.y-152*k-70;
  c.fillStyle=q.ok?'#14472d':'#1c1546';c.strokeStyle=q.ok?'#4dff9d':'#ffc83d';c.lineWidth=3;c.beginPath();c.roundRect(x-58,y-62,116,126,12);c.fill();c.stroke();
  c.fillStyle='#fff';c.font='44px sans-serif';c.fillText(e.ic,x,y-14);
  c.font='700 22px Rajdhani,sans-serif';c.fillText(e.n,x,y+14);
  c.font='500 15px Rajdhani,sans-serif';c.fillStyle='#cfc8ff';c.fillText(e.d,x,y+33);
  c.font='700 18px Rajdhani,sans-serif';c.fillStyle=q.ok?'#4dff9d':'#ffc83d';c.fillText(q.ok?'✔ bereit':'◀      ▶',x,y+54)}
 c.font='700 26px Rajdhani,sans-serif';c.fillStyle='#f6f3ff';c.fillText(Math.ceil(B.selT)+' s',W/2,H-20);c.restore()}
window.boRole=id=>{const q=BO&&BO.pl.find(q=>q.p.id===id);return q?(BO.sel?(q.ok?5:4):q.role+1):0};
GS.bo={input(p,dn){if(!BO)return;if(BO.pz)PZ.input(dn);else if(dn(16))PZ.pause(1,p.name);else if(BO.sel)selIn(p,dn);},
 pauseKey:r=>PZ.toggle(r),blur:()=>PZ.blur()};

/* --- Musik (leichter, düsterer Beat, wird mit den Phasen schneller) --- */
const MU={next:0,step:0,g:null};
function mn(f,t0,d,ty,v){const o=bc.createOscillator(),g=bc.createGain();o.type=ty;o.frequency.setValueAtTime(f,t0);g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(v,t0+.012);g.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(g);g.connect(MU.g);o.start(t0);o.stop(t0+d+.03)}
function mdrum(t0,f0,f1,v,d){const o=bc.createOscillator(),g=bc.createGain();o.frequency.setValueAtTime(f0,t0);o.frequency.exponentialRampToValueAtTime(f1,t0+d*.8);g.gain.setValueAtTime(v,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(g);g.connect(MU.g);o.start(t0);o.stop(t0+d+.02)}
function mus(){const B=BO;if(!B||B.done||B.pz||B.end!=null||cfgG.mus<=0||gvol(2)<=0){MU.next=0;return}
 try{bc=bc||new(window.AudioContext||window.webkitAudioContext)();if(bc.state==='suspended')bc.resume();if(bc.state!=='running')return;
  if(!MU.g){MU.g=bc.createGain();MU.g.connect(bc.destination)}
  MU.g.gain.value=.5*cfgG.mus/100*gvol(2);
  const now=bc.currentTime;if(!MU.next||MU.next<now-.3)MU.next=now+.05;
  const ph=B.ph,bpm=96+22*ph,sd=60/bpm/2,AR=[0,0,3,0,5,3,7,3],CH=[0,-2,-4,-2];
  while(MU.next<now+.25){const s=MU.step++,k=s&7,t0=MU.next,ch=CH[(s>>3)&3],r=55*Math.pow(2,ch/12);
   if(k===0||k===3||k===4||k===6)mn(r,t0,sd*1.5,'sawtooth',.12);
   if(k===0||k===4)mdrum(t0,140,45,.4,.18);
   if(ph>0&&(k===2||k===6))mdrum(t0,200,90,.16,.12);
   if(ph>1||k%2===0)mn(220*Math.pow(2,(ch+AR[k])/12),t0,sd*.7,'square',.02+.01*ph);
   MU.next+=sd}}catch(e){}}
function jingle(){if(cfgG.mus<=0||!bc||bc.state!=='running'||!MU.g)return;const t=bc.currentTime+.05;[0,4,7,12,16].forEach((n,i)=>mn(329.63*Math.pow(2,n/12),t+i*.11,.4,'square',.07))}

/* --- Zeichnen --- */
function draw(){const B=BO,cv=$('boc'),sc=Math.min(innerWidth/W,innerHeight/H);
 if(cv.width!==W){cv.width=W;cv.height=H}cv.style.width=W*sc+'px';cv.style.height=H*sc+'px';
 const c=cv.getContext('2d'),now=performance.now()/1000,G=(col,b)=>{c.shadowColor=col;c.shadowBlur=b},ph=B.ph;
 const dis=(x,y,r)=>{c.beginPath();c.arc(x,y,r,0,7)};
 c.clearRect(0,0,W,H);c.textBaseline='middle';
 const bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,ph===2?'#2a0612':ph===1?'#1c0a28':'#07051a');bg.addColorStop(1,'#1a0b3d');c.fillStyle=bg;c.fillRect(0,0,W,H);
 for(const s of B.stars){c.globalAlpha=.3+.5*Math.abs(Math.sin(now*s.f+s.p));c.fillStyle='#fff';c.fillRect(s.x,s.y,2,2)}c.globalAlpha=1;
 c.save();if(B.sh>0)c.translate((rnd()-.5)*B.sh*16,(rnd()-.5)*B.sh*16);
 /* Boden */
 const gr=c.createLinearGradient(0,FY-20,0,H);gr.addColorStop(0,'#241466');gr.addColorStop(1,'#0e0829');c.fillStyle=gr;c.fillRect(0,FY-6,W,H-FY+6);
 c.strokeStyle='#18c9e8';c.lineWidth=4;G('#18c9e8',14);c.beginPath();c.moveTo(0,FY-6);c.lineTo(W,FY-6);c.stroke();G('transparent',0);
 /* Boss */
 const bob=Math.sin(now*2)*8,bx=B.bx,by=B.by+bob,a=B.atk;
 c.save();c.translate(bx,by);
 const sz=B.won?200*Math.max(0,B.end/3.4):230+(a&&!a.done?18*Math.sin(a.t*18):0);
 if(B.stun>0)c.rotate(Math.sin(now*10)*.06);
 c.globalAlpha=B.hf>0&&Math.floor(now*30)%2?.45:1;G(ph===2?'#ff2d2d':ph===1?'#ff9d2d':'#ff2d95',30+10*Math.sin(now*4));
 c.font=`${Math.max(10,sz)}px sans-serif`;c.textAlign='center';c.fillText('🐲',0,0);G('transparent',0);c.globalAlpha=1;c.restore();
 if(B.stun>0){c.font='44px sans-serif';c.textAlign='center';for(let i=0;i<3;i++)c.fillText('💫',bx+Math.cos(now*6+i*2.1)*90,by-104+Math.sin(now*6+i*2.1)*14)}
 arDraw(c,B,now,G);
 /* Telegraph */
 const alv=B.pl.filter(q=>q.hp>0);
 if(a&&!a.done&&B.end==null){const p=Math.min(1,a.t/a.T),bl=.35+.35*Math.sin(now*22);
  if(a.ty==='slam'){c.fillStyle=`rgba(255,40,60,${bl*.35*p+.08})`;c.fillRect(0,FY-150,W,170);c.strokeStyle=`rgba(255,90,90,${.5+bl})`;c.lineWidth=6;c.setLineDash([22,14]);c.strokeRect(6,FY-148,W-12,166);c.setLineDash([])}
  else if(a.ty==='beam'&&a.tg.hp>0){c.strokeStyle=`rgba(255,60,80,${.35+bl})`;c.lineWidth=4+p*26;G('#ff2d2d',18);c.beginPath();c.moveTo(bx,by+60);c.lineTo(a.tg.x,a.tg.y-90);c.stroke();G('transparent',0);
   c.font='34px sans-serif';c.textAlign='center';c.fillText('🎯',a.tg.x,a.tg.y-150)}
  else if(a.ty==='pulse'){c.font='30px sans-serif';c.textAlign='center';c.fillText('⚡⚡⚡',bx,by+150)}
  c.font='700 28px Rajdhani,sans-serif';c.fillStyle='#fff';c.textAlign='center';c.lineWidth=5;c.strokeStyle='#0b0820';const tt=a.ty==='slam'?'⚠ SCHOCKWELLE – 🛡 A halten!':a.ty==='beam'?'⚠ STRAHL – 🛡 A halten!':'⚠ BLITZE – 🛡 A halten!';c.strokeText(tt,W/2,FY-218);c.fillText(tt,W/2,FY-218)}
 /* Schild-Kuppel */
 const sh=B.end==null?shielding():[];
 if(sh.length){const xs=B.pl.filter(q=>q.hp>0).map(q=>q.x),x0=Math.min(...xs)-70,x1=Math.max(...xs)+70;
  c.fillStyle='rgba(110,255,255,.12)';c.strokeStyle='rgba(130,255,255,.9)';c.lineWidth=5;G('#7fffff',20);c.beginPath();c.ellipse((x0+x1)/2,FY+10,(x1-x0)/2,190,0,Math.PI,0);c.fill();c.stroke();G('transparent',0)}
 /* Spieler */
 const n=B.pl.length,k=n>6?.5:.62;
 for(const q of B.pl){const x=q.x,y=FY+8,jy=q.y-y,dead=q.hp<=0;
  c.fillStyle='#0005';c.beginPath();c.ellipse(x,y+4,32,8,0,0,7);c.fill();
  if(TMON&&q.p.tm){c.beginPath();c.ellipse(x,y+4,38,10,0,0,7);c.strokeStyle=TC[q.p.tm-1];c.lineWidth=4;c.stroke()}
  c.save();c.translate(x,y+jy);if(dead){c.rotate(Math.min(1.45,q.fl*5));c.globalAlpha=.55}
  else{c.translate(0,-Math.abs(Math.sin(now*3+q.i))*(q.hold?0:2));if((q.hf>0||q.inv>0)&&Math.floor(now*30)%2)c.globalAlpha=.5}
  try{const w=$('fl').contentWindow,S=k*4;c.save();c.scale(S,S);c.translate(-13,-38);w.PA.drawRacer(c,q.p.co,q.p.ch,q.p.hat,q.vx,q.vy,q.on,q.dir,0,TMON&&q.p.tm?TRGB[q.p.tm-1]:null);c.restore()}catch(_){c.drawImage(q.spr,14,2,116,158,-58*k,-152*k,116*k,158*k);}c.restore();c.globalAlpha=1;
  /* Rollen-Symbol + Name */
  c.textAlign='center';c.font='28px sans-serif';c.fillStyle=dead?'#ffffff66':['#7fffff','#ffc83d','#4dff9d'][q.role];c.fillText(RIC[q.role],x,y+jy-152*k-22);
  c.font='700 20px Rajdhani,sans-serif';c.lineWidth=4;c.strokeStyle='#0b0820';const nm=(TMON&&q.p.tm?TG[q.p.tm-1]+' ':'')+q.p.name.slice(0,8);c.strokeText(nm,x,y+30);c.fillStyle=pcol(q.p);c.fillText(nm,x,y+30);
  /* Lebensbalken */
  c.fillStyle='#0008';c.fillRect(x-34,y+46,68,9);c.fillStyle=q.hp>50?'#4dff9d':q.hp>25?'#ffc83d':'#ff4d4d';c.fillRect(x-34,y+46,68*q.hp/100,9);
  if(q.chg>.12){const cr=q.chg>=SPC;c.strokeStyle=cr?(Math.floor(now*14)%2?'#ffffff':'#ffc83d'):'#18c9e8';c.lineWidth=5;G(c.strokeStyle,cr?18:8);c.beginPath();c.arc(x,y+jy-48,46,-Math.PI/2,-Math.PI/2+6.283*Math.min(1,q.chg/SPC));c.stroke();G('transparent',0)}
  if(q.spin>0){c.strokeStyle='#fff';c.lineWidth=7;c.lineCap='round';for(let h=0;h<2;h++){c.beginPath();c.arc(x,y+jy-50,66,now*18+h*Math.PI,now*18+h*Math.PI+2.2);c.stroke()}c.lineCap='butt'}
  /* Rollenanzeige */
  if(0){c.fillStyle='#0008';c.fillRect(x-34,y+60,68,8);
   if(q.role===0){c.fillStyle=q.sl>0?'#888':'#7fffff';c.fillRect(x-34,y+60,68*q.sta/SMAX,8)}
   else if(q.role===1){c.fillStyle=q.ch>1?'#ff4d4d':'#18c9e8';c.fillRect(x-34,y+60,68*Math.min(1,q.ch),8);c.fillStyle='#4dff9daa';c.fillRect(x-34+68*SW0,y+58,68*(SW1-SW0),12);c.strokeStyle='#fff';c.lineWidth=2;c.strokeRect(x-34,y+60,68,8)}
   else{c.fillStyle=q.bcd>0?'#888':'#4dff9d';c.fillRect(x-34,y+60,68*(1-q.bcd/12),8)}}
  if(q.role===1&&q.ch>0){const r=q.ch;c.strokeStyle=r>=SW0&&r<=SW1?'#4dff9d':r>1?'#ff4d4d':'#18c9e8';c.lineWidth=6;G(c.strokeStyle,14);c.beginPath();c.arc(x,y-70,40,-Math.PI/2,-Math.PI/2+6.283*Math.min(1,r));c.stroke();G('transparent',0)}
  if(q.role===1&&q.ch>0&&q.ch<=1){c.strokeStyle='#4dff9d';c.lineWidth=2;c.beginPath();c.arc(x,y-70,46,-Math.PI/2+6.283*SW0,-Math.PI/2+6.283*SW1);c.stroke()}}
 /* Schüsse */
 for(const s of B.sht||[]){const cl=pcol(s.q.p);if(s.k==='s'){c.fillStyle='#7fffff';G('#7fffff',16);c.beginPath();c.roundRect(s.x-14,s.y-20,28,40,8);c.fill()}else{c.fillStyle=cl;G(cl,12);c.beginPath();c.ellipse(s.x,s.y,14,5,0,0,7);c.fill()}G('transparent',0)}
 for(const z of B.sl||[]){c.globalAlpha=Math.max(0,z.t/.18);c.strokeStyle='rgb('+z.col+')';c.lineWidth=9;c.lineCap='round';const a0=z.dir>0?-1.1:Math.PI-1.1;c.beginPath();c.arc(z.x+z.dir*20,z.y,z.rc*.7,a0,a0+2.2);c.stroke();c.lineCap='butt';c.globalAlpha=1}
 /* Bolzen */
 for(const b of B.bolts){const p=1-b.t/.22;c.fillStyle=b.c;G(b.c,14);dis(b.x+(B.bx-b.x)*p,b.y+(B.by-b.y)*p,10);c.fill();G('transparent',0)}
 for(const p of B.pa){c.globalAlpha=Math.max(0,Math.min(1,p.t/p.L*1.5));c.fillStyle=p.c;c.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s)}c.globalAlpha=1;
 c.lineWidth=7;c.strokeStyle='#0b0820';c.textAlign='center';for(const t of B.tx){c.globalAlpha=Math.min(1,t.t*2);c.font=`700 ${t.s.length>6?30:36}px Bungee,sans-serif`;c.strokeText(t.s,t.x,t.y);c.fillStyle=t.c;c.fillText(t.s,t.x,t.y)}c.globalAlpha=1;
 c.restore();
 /* HUD: Boss-Lebensbalken */
 const bw=700,bxx=(W-bw)/2;c.fillStyle='#0009';c.fillRect(bxx-4,16,bw+8,30);c.fillStyle=ph===2?'#ff2d2d':ph===1?'#ff9d2d':'#ff2d95';c.fillRect(bxx,20,bw*B.hp/B.mx,22);
 c.strokeStyle='#fff';c.lineWidth=2;c.strokeRect(bxx,20,bw,22);c.beginPath();c.moveTo(bxx+bw*.33,18);c.lineTo(bxx+bw*.33,44);c.moveTo(bxx+bw*.66,18);c.lineTo(bxx+bw*.66,44);c.stroke();
 c.font='700 22px Rajdhani,sans-serif';c.textAlign='left';c.fillStyle='#f6f3ff';c.fillText('🐲 DRACHE',bxx,62);c.textAlign='right';c.fillText(Math.ceil(B.hp)+' / '+B.mx,bxx+bw,62);
 c.textAlign='left';c.fillStyle='#b5aee6';c.fillText('⏱ '+Math.floor(B.t)+' s',16,30);
 c.textAlign='center';c.fillStyle='#ffc83d';G('#ff2d95',12);
 if(B.sel)drawSel(c,B);else if(B.cd>0){c.font='170px Bungee,sans-serif';c.fillText(Math.ceil(B.cd),W/2,H/2-40);G('transparent',0);c.font='700 28px Rajdhani,sans-serif';c.fillStyle='#f6f3ff';c.fillText('◀ ▶ laufen · A springen · B Angriff · B halten = Spezial',W/2,H/2+70)}
 if(B.bn){c.globalAlpha=Math.min(1,B.bn.t*2);c.font='46px Bungee,sans-serif';c.fillText(B.bn.s,W/2,150);c.globalAlpha=1}
 G('transparent',0)}

function loop(now){if(st!=='bo'||!BO||BO.done)return;const dt=Math.min(.05,(now-BO.last)/1000);BO.last=now;
 PZ.watch();if(!BO.pz)upd(dt);mus();if(!BO.done&&st==='bo'){draw();requestAnimationFrame(loop)}}

window.startBoss=function(){let l=list();if(!l.length)return;while(l.length<3&&l.length<8){const c=l.length;addBot();l=list();if(l.length===c)break}
 if(!T)ST={};cdL=-1;const o=gset[4]||{},bs=BSK[o.bots!=null?o.bots:1],df=DIF[o.diff!=null?o.diff:1],n=l.length,RO=[1,0,2];
 const pl=l.map((p,i)=>{const pi0=p.id.startsWith('bot')?Math.floor(rnd()*3):LEQ[p.id]!=null?LEQ[p.id]:i%3;const spr=document.createElement('canvas');spr.width=144;spr.height=184;drawPv(spr,TMON&&p.tm?Object.assign({},p,{trgb:TRGB[p.tm-1]}):p);
  return{p,i,bot:p.id.startsWith('bot'),role:EQ[pi0].r,pi:pi0,ok:0,bw:.6+rnd()*2,x:W*(i+1)/(n+1),y:FY+8,vx:0,vy:0,on:1,dir:1,chg:0,bh:0,spin:0,scd:0,inv:0,hp:100,fl:0,hf:0,hold:false,ph:0,ht:9,sta:SMAX,sl:0,ch:0,acd:0,hcd:0,bcd:0,go:0,tg:.8,at:rnd()*.4,dmg:0,blk:0,heal:0,spr,sk:bs*(.85+rnd()*.25)}});
 const na=Math.max(1,pl.filter(q=>q.role===1).length),mx=Math.round(5500*na*df/10)*10;
 const stars=[];for(let i=0;i<70;i++)stars.push({x:rnd()*W,y:rnd()*H,f:1+rnd()*2,p:rnd()*6});
 BO={sel:1,selT:25,dfi:o.diff!=null?o.diff:1,pl,pa:[],tx:[],bolts:[],stars,bn:null,sh:0,hf:0,bx:W-210,by:480,hp:mx,mx,df,ph:0,atk:null,cdn:1e9,nx:2.5,cur:null,fb:[],wv:[],mt:[],stun:0,t:0,t0:0,cd:3,end:null,won:0,done:0,pz:0,pzi:0,last:performance.now()};
 show('bo');requestAnimationFrame(loop)};
})();
