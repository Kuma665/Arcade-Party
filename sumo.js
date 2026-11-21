/* ===== Sumo-Arena (2-8 Spieler, Bots, schrumpfende Plattform, A = Dash, B = Block) ===== */
(function(){
const W=1280,H=720,CX=640,CY=400,R0=290,PR=24,SPD=225,DV=640,DDUR=.24,DCD=1.1,BDUR=.5,BCD=1.5,PERF=.17,
 STG=[[9,252],[19,214],[29,180],[39,150],[49,124],[59,102]],SPF=[1.3,1,.75],BSK=[.7,1,1.25],rnd=Math.random,hyp=Math.hypot;
let SM=null;

/* --- Helfer --- */
const fx=(x,y,n,col,sp,life)=>{for(let i=0;i<n;i++){const a=rnd()*6.283,v=(.3+rnd())*(sp||200);SM.pa.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:life||.5,L:life||.5,c:col,s:3+rnd()*4})}};
const pop=(x,y,s,c)=>SM.tx.push({x,y,s,c:c||'#ffc83d',t:1.1});
const banner=s=>{SM.bn={s,t:2.3}};
const alive=()=>SM.pl.filter(q=>q.al);

/* --- Aktionen --- */
function doDash(q){if(!q||!q.al||q.dcd>0||q.stun>0||q.blk>0||q.dash>0)return;
 q.dash=DDUR;q.dcd=DCD;q.kx=q.fx*DV;q.ky=q.fy*DV;q.vx=q.vy=0;q.an.sq=-.7;fx(q.x,q.y+PR,8,'#ffffff',170,.3);beep(cfgG.sfx,0,740)}
function doBlock(q){if(!q||!q.al||q.bcd>0||q.stun>0||q.dash>0||q.blk>0)return;
 q.blk=BDUR;q.bcd=BCD;q.an.sq=.8;q.kx*=.3;q.ky*=.3;beep(cfgG.sfx,1,300)}
function act(id,k){const B=SM;if(!B||B.cd>0||B.end!=null||B.pz)return;const q=B.pl.find(q=>q.p.id===id);if(k===4)doDash(q);else doBlock(q)}
function emo(q,e){if(q.bot||!q.al||(SM&&SM.pz)||(q.em&&q.em.t>1.8))return;q.em={e:e||EMOS[0],t:2.2};beep(cfgG.sfx,0)}
window.smEmoji=(id,e)=>{const q=SM&&SM.pl.find(q=>q.p.id===id);if(!q)return;if(q.al)emo(q,e);else emoFloat(q.p,e)};

function out(q,quiet){const B=SM;if(!q.al)return;q.al=0;q.dt=B.t;stb(q.p,'d');
 if(quiet)return;padBuzz(q.p);
 const lh=q.lh;if(lh&&lh.q!==q&&B.t-lh.t<4){stb(lh.q.p,'k');pop(q.x,Math.max(120,q.y-60),'🎯 '+lh.q.p.name.slice(0,8),'#ffffff')}
 B.fa.push({spr:q.spr,x:q.x,y:q.y,vx:q.vx+q.kx,vy:q.vy+q.ky,t:0,r:0,tv:(rnd()<.5?-1:1)*(4+rnd()*4)});
 B.sh=Math.max(B.sh,.55);fx(q.x,q.y,16,pcol(q.p),260,.7);beep(cfgG.sfx,0,440);setTimeout(()=>beep(cfgG.sfx,0,220),120)}

/* --- Treffer --- */
function hit(a,b,nx,ny){const B=SM;const cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;
 if(b.blk>0){const pf=b.blk>BDUR-PERF;
  a.dash=0;a.stun=pf?1.1:.35;a.kx=-nx*(pf?560:360);a.ky=-ny*(pf?560:360);b.kx+=nx*40;b.ky+=ny*40;
  fx(cx,cy,pf?24:12,pf?'#ffffff':'#7ff2ff',pf?340:220,.45);pop(cx,cy-40,pf?'PARADE!':'Geblockt!',pf?'#ffffff':'#7ff2ff');
  B.sh=Math.max(B.sh,pf?.55:.3);if(pf){B.hs=.09;a.an.sq=1;stb(b.p,'s')}beep(cfgG.sfx,1,pf?520:260);return}
 const m=1+b.dmg/70;b.kx=nx*620*m;b.ky=ny*620*m;b.vx=b.vy=0;b.dmg=Math.min(300,b.dmg+17);b.stun=.3;b.an.sq=1;b.lh={q:a,t:B.t};
 a.dash=0;a.kx=nx*70;a.ky=ny*70;a.an.sq=-.3;
 B.hs=.08;B.sh=Math.max(B.sh,.4+Math.min(.5,b.dmg/300));fx(cx,cy,18,'#ffc83d',320,.5);fx(cx,cy,8,'#ffffff',200,.3);
 pop(b.x,b.y-70,Math.round(b.dmg)+'%',b.dmg>120?'#ff4d4d':'#ffc83d');stb(a.p,'s');padBuzz(b.p);beep(cfgG.sfx,1,100+rnd()*40)}

function pair(a,b,first){const dx=b.x-a.x,dy=b.y-a.y,d=hyp(dx,dy)||.01,ov=2*PR-d;if(ov<=0)return;
 const nx=dx/d,ny=dy/d,ma=a.blk>0?7:1,mb=b.blk>0?7:1,ta=ma+mb;
 a.x-=nx*ov*mb/ta;a.y-=ny*ov*mb/ta;b.x+=nx*ov*ma/ta;b.y+=ny*ov*ma/ta;
 if(!first)return;
 const same=tkey(a.p)===tkey(b.p),ah=!same&&a.dash>0&&(a.kx*nx+a.ky*ny)>150,bh=!same&&b.dash>0&&-(b.kx*nx+b.ky*ny)>150;
 if(ah&&bh){a.dash=b.dash=0;a.kx=-nx*480;a.ky=-ny*480;b.kx=nx*480;b.ky=ny*480;a.stun=b.stun=.25;fx((a.x+b.x)/2,(a.y+b.y)/2,20,'#ffffff',330,.45);
  pop((a.x+b.x)/2,(a.y+b.y)/2-40,'Zusammenprall!','#ffffff');SM.sh=Math.max(SM.sh,.5);beep(cfgG.sfx,1,200);return}
 if(ah){hit(a,b,nx,ny);return}if(bh){hit(b,a,-nx,-ny);return}
 const rv=(b.vx+b.kx-a.vx-a.kx)*nx+(b.vy+b.ky-a.vy-a.ky)*ny;
 if(rv<0){const j=-rv*.6;a.kx-=nx*j*mb/ta;a.ky-=ny*j*mb/ta;b.kx+=nx*j*ma/ta;b.ky+=ny*j*ma/ta}}

/* --- Bots --- */
function ai(q,dt){q.at-=dt;if(q.at>0)return;q.at=.07+rnd()*.06;const B=SM,dist=hyp(q.x-CX,q.y-CY),eff=B.warn?Math.min(B.R,B.Rt):B.R,rel=eff-dist,mg=Math.min(55,eff*.35);
 let tg=null,bd=1e9;for(const o of B.pl)if(o.al&&o!==q&&tkey(o.p)!==tkey(q.p)){const d=hyp(o.x-q.x,o.y-q.y);if(d<bd){bd=d;tg=o}}
 let mx=CX-q.x,my=CY-q.y;
 if(rel>mg&&tg){mx=tg.x-q.x;my=tg.y-q.y}
 if(rel>mg&&tg&&q.blk<=0&&bd<95&&q.dcd>0&&eff>110){mx=-mx;my=-my}
 const l=hyp(mx,my)||1,e=(1-q.sk)*.5;q.mv=[mx/l+(rnd()-.5)*e,my/l+(rnd()-.5)*e];
 if(!tg)return;
 let thr=false;for(const o of B.pl)if(o.al&&o!==q&&o.dash>0&&tkey(o.p)!==tkey(q.p)&&hyp(o.x-q.x,o.y-q.y)<150&&(o.kx*(q.x-o.x)+o.ky*(q.y-o.y))>0)thr=true;
 if(thr&&q.bcd<=0&&rnd()<.55*q.sk){doBlock(q);return}
 if(q.dcd<=0&&q.stun<=0&&q.blk<=0&&bd<170&&rel>mg*.9&&rnd()<.4*q.sk){
  let fxv=tg.x-q.x,fyv=tg.y-q.y;const ll=hyp(fxv,fyv)||1;fxv/=ll;fyv/=ll;
  const rg=Math.min(215,bd+20),ex=q.x+fxv*rg,ey=q.y+fyv*rg;
  if(eff-hyp(ex-CX,ey-CY)>Math.min(16,eff*.2)){q.fx=fxv;q.fy=fyv;doDash(q)}}}

/* --- Update --- */
function upd(dt){const B=SM,S=B.pl;B.sh=Math.max(0,B.sh-dt*1.8);
 for(const p of B.pa){p.x+=p.vx*dt;p.y+=p.vy*dt;const f=Math.pow(.02,dt);p.vx*=f;p.vy*=f;p.t-=dt}B.pa=B.pa.filter(p=>p.t>0);
 for(const t of B.tx){t.y-=dt*50;t.t-=dt}B.tx=B.tx.filter(t=>t.t>0);
 for(const t of B.tr)t.t-=dt;B.tr=B.tr.filter(t=>t.t>0);
 if(B.bn&&(B.bn.t-=dt)<=0)B.bn=null;
 for(const f of B.fa){f.t+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;const k=Math.pow(.3,dt);f.vx*=k;f.vy*=k;f.r+=f.tv*dt}B.fa=B.fa.filter(f=>f.t<1);
 for(const q of S){if(q.em&&(q.em.t-=dt)<=0)q.em=null;q.an.sq*=Math.exp(-dt*9)}
 if(B.cd>0){B.cd-=dt;cdTick(Math.max(0,Math.ceil(B.cd)));return}
 B.t+=dt;
 /* Plattform schrumpft in Stufen, vorher blinkt der Rand rot */
 if(B.si<B.stg.length){const[ts,rs]=B.stg[B.si];
  if(!B.warn&&B.t>=ts-2.4){B.warn=1;B.Rt=rs;banner('⚠ Der Rand bricht weg!');beep(cfgG.sfx,1,330);setTimeout(()=>beep(cfgG.sfx,1,330),180)}
  if(B.t>=ts){B.warn=0;B.shr=1;B.si++;B.sh=Math.max(B.sh,.5);beep(cfgG.sfx,1,110)}}
 else if(B.end==null){B.R=Math.max(16,B.R-(B.R>70?5:8)*dt);B.Rt=B.R;if(!B.sd){B.sd=1;banner('🔥 SUDDEN DEATH!')}}
 if(B.shr){B.R=Math.max(B.Rt,B.R-110*dt);if(B.R<=B.Rt)B.shr=0;
  for(let i=0;i<3;i++){const a=rnd()*6.283;B.pa.push({x:CX+Math.cos(a)*B.R,y:CY+Math.sin(a)*B.R,vx:(rnd()-.5)*60,vy:60+rnd()*140,t:.7,L:.7,c:'#7a6cff',s:4+rnd()*5})}}
 /* Spieler */
 for(const q of S){if(!q.al)continue;
  q.dash=Math.max(0,q.dash-dt);q.dcd=Math.max(0,q.dcd-dt);q.bcd=Math.max(0,q.bcd-dt);q.blk=Math.max(0,q.blk-dt);q.stun=Math.max(0,q.stun-dt);
  if(q.bot)ai(q,dt);
  let dx,dy;
  if(q.bot){dx=q.mv[0];dy=q.mv[1]}
  else{const b=(P[q.p.id]||{b:0}).b;dx=b&1?-1:b&2?1:0;dy=b&32?-1:b&64?1:0;const l=hyp(dx,dy);if(l){dx/=l;dy/=l}}
  const can=q.stun<=0&&q.dash<=0&&q.blk<=0;
  if(can&&(dx||dy)){const l=hyp(dx,dy);q.fx=dx/l;q.fy=dy/l}
  const tx=can?dx*SPD:0,ty=can?dy*SPD:0,ac=Math.min(1,dt*(can?8:5));
  q.vx+=(tx-q.vx)*ac;q.vy+=(ty-q.vy)*ac;
  const kd=Math.exp(-dt*(q.dash>0?2.2:q.blk>0?9:3.4));q.kx*=kd;q.ky*=kd;
  q.x+=(q.vx+q.kx)*dt;q.y+=(q.vy+q.ky)*dt;
  const sp=hyp(q.vx,q.vy);if(sp>20)q.an.wt+=dt*(6+sp*.04);
  if(q.dash>0)B.tr.push({x:q.x,y:q.y,t:.2,c:pcol(q.p)})}
 for(let it=0;it<2;it++)for(let i=0;i<S.length;i++)for(let j=i+1;j<S.length;j++)if(S[i].al&&S[j].al)pair(S[i],S[j],!it);
 for(const q of S)if(q.al&&hyp(q.x-CX,q.y-CY)>B.R+4)out(q);
 if(B.end==null&&new Set(alive().map(q=>tkey(q.p))).size<=1){B.end=3.4;B.slo=1;const w=alive()[0];if(w)pop(w.x,w.y-100,'🏆 SIEGER!','#ffc83d');jingle()}
 if(B.end!=null&&(B.end-=dt)<=0)fin()}

function fin(){const B=SM;B.done=1;
 award(B.pl.map(q=>({p:q.p,v:q.al?1e6:q.dt,txt:q.al?'🏆 Sieger':Math.round(q.dt)+' s'})),T?'':stAw().join(' · '),null,'max')}

/* --- Pause / Eingabe --- */
const lost=()=>SM?SM.pl.filter(q=>q.al&&!q.bot&&(/^gp/.test(q.p.id)?!P[q.p.id]:!fixed(q.p.id)&&(!P[q.p.id]||Date.now()-P[q.p.id].seen>4000))):[];
const PZ=makePause({obj:()=>SM,zone:'spz',note:'spn',rows:'spr',click:'smPzClick',lost,autoPause:B=>B.end==null,
 drop:()=>lost().forEach(q=>out(q,1)),restart:()=>launch(lastG==null?2:lastG)});
window.smPzClick=i=>PZ.click(i);
GS.sm={input(p,dn){if(!SM)return;if(SM.pz)PZ.input(dn);else if(dn(16))PZ.pause(1,p.name);else if(dn(4))act(p.id,4);else if(dn(8)||dn(128))act(p.id,8)},
 pauseKey:r=>PZ.toggle(r),blur:()=>PZ.blur()};

/* --- Musik: treibende Taiko-Bassline, wird mit der Zeit schneller --- */
const MU={next:0,step:0,g:null,nz:null},AR=[0,3,7,10,12,10,7,3],CH=[0,-4,-2,-5];
function mn(f,t0,d,ty,v){const o=bc.createOscillator(),g=bc.createGain();o.type=ty;o.frequency.setValueAtTime(f,t0);g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(v,t0+.012);g.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(g);g.connect(MU.g);o.start(t0);o.stop(t0+d+.03)}
function mdrum(t0,f0,f1,v,d){const o=bc.createOscillator(),g=bc.createGain();o.frequency.setValueAtTime(f0,t0);o.frequency.exponentialRampToValueAtTime(f1,t0+d*.8);g.gain.setValueAtTime(v,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(g);g.connect(MU.g);o.start(t0);o.stop(t0+d+.02)}
function mhat(t0,v){if(!MU.nz){const n=bc.sampleRate*.05|0,b=bc.createBuffer(1,n,bc.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(rnd()*2-1)*(1-i/n);MU.nz=b}
 const s=bc.createBufferSource(),f=bc.createBiquadFilter(),g=bc.createGain();s.buffer=MU.nz;f.type='highpass';f.frequency.value=7000;g.gain.value=v;s.connect(f);f.connect(g);g.connect(MU.g);s.start(t0)}
function mus(){const B=SM;if(!B||B.done||B.pz||B.end!=null||cfgG.mus<=0||gvol(2)<=0){MU.next=0;return}
 try{bc=bc||new(window.AudioContext||window.webkitAudioContext)();if(bc.state==='suspended')bc.resume();if(bc.state!=='running')return;
  if(!MU.g){MU.g=bc.createGain();MU.g.connect(bc.destination)}
  MU.g.gain.value=.5*cfgG.mus/100*gvol(2);
  const now=bc.currentTime;if(!MU.next||MU.next<now-.3)MU.next=now+.05;
  const pr=Math.min(1,B.t/60),bpm=108+60*pr,sd=60/bpm/2;
  while(MU.next<now+.25){const s=MU.step++,k=s&7,t0=MU.next,ch=CH[(s>>3)&3],r=65.41*Math.pow(2,ch/12);
   if(k===0||k===3||k===4||k===6)mn(k===6?r*2:r,t0,sd*1.6,'triangle',.28);
   if(k===0||k===4||(pr>.4&&(k===2||k===6)))mdrum(t0,150,48,.38,.16);
   if(k===3||k===7)mdrum(t0,k===7?260:200,110,.18,.14);
   mn(261.63*Math.pow(2,(ch+AR[k])/12),t0,sd*.8,'square',.026+.02*pr);
   if(pr>.25&&(k&1))mhat(t0,.05);
   MU.next+=sd}}catch(e){}}
function jingle(){if(cfgG.mus<=0||!bc||bc.state!=='running'||!MU.g)return;const t=bc.currentTime+.05;[0,4,7,12,16].forEach((n,i)=>mn(329.63*Math.pow(2,n/12),t+i*.11,.4,'square',.07))}

/* --- Zeichnen --- */
function draw(){const B=SM,cv=$('smc'),sc=Math.min(innerWidth/W,innerHeight/H);
 if(cv.width!==W){cv.width=W;cv.height=H}cv.style.width=W*sc+'px';cv.style.height=H*sc+'px';
 const c=cv.getContext('2d'),now=performance.now()/1000,G=(col,b)=>{c.shadowColor=col;c.shadowBlur=b};
 const dis=(x,y,r)=>{c.beginPath();c.arc(x,y,r,0,7)};
 c.clearRect(0,0,W,H);c.textBaseline='middle';
 const bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#07051a');bg.addColorStop(1,'#1a0b3d');c.fillStyle=bg;c.fillRect(0,0,W,H);
 for(const s of B.stars){c.globalAlpha=.3+.5*Math.abs(Math.sin(now*s.f+s.p));c.fillStyle='#fff';c.fillRect(s.x,s.y,2,2)}c.globalAlpha=1;
 c.save();if(B.sh>0)c.translate((rnd()-.5)*B.sh*16,(rnd()-.5)*B.sh*16);
 const R=B.R,gl=c.createRadialGradient(CX,CY+30,R*.5,CX,CY+30,R*1.6);gl.addColorStop(0,'rgba(255,45,149,.2)');gl.addColorStop(1,'rgba(255,45,149,0)');c.fillStyle=gl;c.fillRect(0,0,W,H);
 /* Plattform mit Dicke */
 c.fillStyle='#0e0829';dis(CX,CY+20,R);c.fill();c.fillStyle='#160d3f';dis(CX,CY+12,R);c.fill();
 const pg=c.createRadialGradient(CX,CY-R*.25,R*.1,CX,CY,R);pg.addColorStop(0,'#3a2e95');pg.addColorStop(1,'#1d1660');c.fillStyle=pg;dis(CX,CY,R);c.fill();
 c.strokeStyle='#ffffff12';c.lineWidth=2;for(let r=R-44;r>30;r-=48){dis(CX,CY,r);c.stroke()}
 c.beginPath();for(let k=0;k<12;k++){const a=k*.5236+now*.04;c.moveTo(CX+Math.cos(a)*40,CY+Math.sin(a)*40);c.lineTo(CX+Math.cos(a)*(R-3),CY+Math.sin(a)*(R-3))}c.stroke();
 c.strokeStyle='#ff2d95';c.lineWidth=4;G('#ff2d95',10);dis(CX,CY,34);c.stroke();G('transparent',0);
 G('#18c9e8',18);c.strokeStyle='#18c9e8';c.lineWidth=6;dis(CX,CY,R);c.stroke();G('transparent',0);
 if(B.warn){const a=.35+.35*Math.sin(now*14);c.fillStyle=`rgba(255,40,60,${a*.4})`;c.beginPath();c.arc(CX,CY,R,0,7);c.moveTo(CX+B.Rt,CY);c.arc(CX,CY,B.Rt,0,7,true);c.fill();
  c.strokeStyle=`rgba(255,80,80,${a+.3})`;c.lineWidth=7;c.setLineDash([18,14]);dis(CX,CY,B.Rt);c.stroke();c.setLineDash([])}
 /* Staubspur beim Dash */
 for(const t of B.tr){c.globalAlpha=t.t/.2*.35;c.fillStyle=t.c;dis(t.x,t.y+10,PR*.9);c.fill()}c.globalAlpha=1;
 const live=[...B.pl].filter(q=>q.al).sort((a,b)=>a.y-b.y),k=.52;
 for(const q of live){c.fillStyle='#0005';c.beginPath();c.ellipse(q.x,q.y+PR*.6+1,PR*.95,8,0,0,7);c.fill();
  if(TMON&&q.p.tm){c.beginPath();c.ellipse(q.x,q.y+PR*.6+1,PR*1.2,10,0,0,7);c.strokeStyle='#fff';c.lineWidth=7;c.stroke();c.strokeStyle=TC[q.p.tm-1];c.lineWidth=4;c.stroke()}
  const rd=1-q.dcd/DCD,rb=1-q.bcd/BCD;c.fillStyle='#0008';c.fillRect(q.x-19,q.y+PR+8,17,5);c.fillRect(q.x+2,q.y+PR+8,17,5);
  c.fillStyle=rd>=1?'#18c9e8':'#18c9e888';c.fillRect(q.x-19,q.y+PR+8,17*Math.min(1,rd),5);c.fillStyle=rb>=1?'#ff2d95':'#ff2d9588';c.fillRect(q.x+2,q.y+PR+8,17*Math.min(1,rb),5)}
 for(const f of B.fa){const s=Math.max(0,1-f.t);c.save();c.globalAlpha=s;c.translate(f.x,f.y+PR*.6+f.t*f.t*170);c.rotate(f.r);c.scale(s,s);c.drawImage(f.spr,14,2,116,158,-58*k,-152*k,116*k,158*k);c.restore()}
 for(const q of live){const A=q.an,hop=Math.abs(Math.sin(A.wt))*3*(hyp(q.vx,q.vy)>20?1:0),sq=A.sq,vxt=q.vx+q.kx;
  if(q.blk>0){const pf=q.blk>BDUR-PERF;c.fillStyle=pf?'rgba(255,255,255,.35)':'rgba(120,255,255,.2)';c.strokeStyle=pf?'#fff':'rgba(130,255,255,.9)';c.lineWidth=4;c.beginPath();c.ellipse(q.x,q.y-8,PR*1.55,PR*1.9,0,0,7);c.fill();c.stroke()}
  if(q.dash>0){c.strokeStyle='#ffffff99';c.lineWidth=3;c.beginPath();for(let i=-1;i<=1;i++){c.moveTo(q.x-q.fx*20+i*9*q.fy,q.y-q.fy*20-i*9*q.fx);c.lineTo(q.x-q.fx*56+i*9*q.fy,q.y-q.fy*56-i*9*q.fx)}c.stroke()}
  c.save();c.translate(q.x,q.y+PR*.6-hop);c.rotate(Math.max(-.3,Math.min(.3,vxt*.0006))+Math.sin(A.wt)*.05*(hop?1:0));c.scale(1+.22*sq,1-.22*sq);
  if(q.stun>0&&Math.floor(now*20)%2)c.globalAlpha=.6;
  c.drawImage(q.spr,14,2,116,158,-58*k,-152*k,116*k,158*k);c.restore();
  if(q.stun>0){c.font='26px sans-serif';c.textAlign='center';c.fillStyle='#fff';c.fillText('💫',q.x+Math.sin(now*9)*8,q.y-78)}
  if(q.dmg>0){c.font='700 22px Rajdhani,sans-serif';c.textAlign='center';c.lineWidth=5;c.strokeStyle='#0b0820';const t=Math.round(q.dmg)+'%';c.strokeText(t,q.x,q.y-(q.stun>0?100:78));c.fillStyle=q.dmg>120?'#ff4d4d':q.dmg>50?'#ffc83d':'#fff';c.fillText(t,q.x,q.y-(q.stun>0?100:78))}}
 for(const q of live)if(q.em){const el=2.2-q.em.t,pp=Math.min(1,el*7),s=.6+.4*pp,X=Math.max(50,Math.min(W-50,q.x));let Y=q.y-120-Math.min(el,.6)*14;if(Y<110)Y=q.y+110;
  c.globalAlpha=Math.min(1,q.em.t*3);c.fillStyle='#0b0820ea';c.strokeStyle=pcol(q.p);c.lineWidth=4;dis(X,Y,34*s);c.fill();c.stroke();c.fillStyle='#fff';c.font=`${50*s}px sans-serif`;c.textAlign='center';c.fillText(q.em.e,X,Y+2);c.globalAlpha=1}
 for(const p of B.pa){c.globalAlpha=Math.max(0,Math.min(1,p.t/p.L*1.5));c.fillStyle=p.c;c.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s)}c.globalAlpha=1;
 c.font='700 40px Bungee,sans-serif';c.textAlign='center';c.lineWidth=7;c.strokeStyle='#0b0820';for(const t of B.tx){c.globalAlpha=Math.min(1,t.t*2);c.font=`700 ${t.s.length>6?30:38}px Bungee,sans-serif`;c.strokeText(t.s,t.x,t.y);c.fillStyle=t.c;c.fillText(t.s,t.x,t.y)}c.globalAlpha=1;
 c.restore();
 /* HUD */
 B.pl.forEach((q,i)=>{const x=14+i*158;c.globalAlpha=q.al?1:.45;c.fillStyle=pcol(q.p);dis(x+12,24,10);c.fill();
  c.fillStyle='#f6f3ff';c.textAlign='left';c.font='700 22px Rajdhani,sans-serif';c.fillText((q.al?'':'☠ ')+(TMON&&q.p.tm?TG[q.p.tm-1]+' ':'')+q.p.name.slice(0,8),x+28,20);
  c.font='700 17px Rajdhani,sans-serif';c.fillStyle='#b5aee6';c.fillText(q.al?Math.round(q.dmg)+' %':'raus',x+28,42)});c.globalAlpha=1;
 c.textAlign='center';c.fillStyle='#ffc83d';G('#ff2d95',12);
 if(B.cd>0){c.font='170px Bungee,sans-serif';c.fillText(Math.ceil(B.cd),W/2,H/2);G('transparent',0);c.font='700 30px Rajdhani,sans-serif';c.fillStyle='#f6f3ff';c.fillText('A = Dash · B = Block (kurz vor dem Treffer = Parade!) · Wer runterfällt, ist raus',W/2,H-34)}
 if(B.bn){c.globalAlpha=Math.min(1,B.bn.t*2);c.font='46px Bungee,sans-serif';c.fillText(B.bn.s,W/2,100);c.globalAlpha=1}
 if(B.end!=null){const w=alive()[0];c.font='60px Bungee,sans-serif';c.fillStyle='#ffc83d';c.fillText(w?'🏆 '+(TMON&&w.p.tm?TN[w.p.tm-1]:w.p.name):'Unentschieden',W/2,H/2)}
 G('transparent',0)}

/* --- Start --- */
function loop(now){if(st!=='sm'||!SM||SM.done)return;const dt0=Math.min(.05,(now-SM.last)/1000);SM.last=now;let dt=dt0;
 if(SM.hs>0){SM.hs-=dt0;dt=dt0*.12}else if(SM.slo>0){SM.slo-=dt0;dt=dt0*.4}
 PZ.watch();if(!SM.pz)upd(dt);mus();if(!SM.done&&st==='sm'){draw();requestAnimationFrame(loop)}}

window.startSumo=function(){let l=list();if(!l.length)return;if(l.length<2){addBot();l=list()}if(l.length<2){msg('Sumo braucht mindestens 2 Spieler.');return}
 if(!T)ST={};cdL=-1;const n=l.length,o=gset[2]||{},f=SPF[o.sp!=null?o.sp:1],bs=BSK[o.bots!=null?o.bots:1];
 const pl=l.map((p,i)=>{const a=-Math.PI/2+i*6.283/n,x=CX+Math.cos(a)*150,y=CY+Math.sin(a)*150,spr=document.createElement('canvas');spr.width=144;spr.height=184;
  drawPv(spr,TMON&&p.tm?Object.assign({},p,{trgb:TRGB[p.tm-1]}):p);
  return{p,bot:p.id.startsWith('bot'),x,y,vx:0,vy:0,kx:0,ky:0,fx:-Math.cos(a),fy:-Math.sin(a),al:1,dmg:0,dash:0,dcd:0,bcd:0,blk:0,stun:0,dt:0,spr,em:null,lh:null,mv:[0,0],at:rnd()*.2,
   sk:bs*(.8+rnd()*.3),an:{sq:0,wt:0}}});
 const stars=[];for(let i=0;i<70;i++)stars.push({x:rnd()*W,y:rnd()*H,f:1+rnd()*2,p:rnd()*6});
 SM={pl,pa:[],tx:[],tr:[],fa:[],stars,bn:null,sh:0,hs:0,slo:0,R:R0,Rt:R0,warn:0,shr:0,si:0,sd:0,stg:STG.map(([t,r])=>[t*f,r]),t:0,cd:3,end:null,done:0,pz:0,pzi:0,last:performance.now()};
 show('sm');requestAnimationFrame(loop)};
})();
