/* ===== Hindernisrennen (Fall-Guys-Stil, 2D, bis 8 Spieler) ===== */
const RW=1280,RH=720,RFIN=7800,RGY=560,RCP=[[300,560],[1100,560],[1980,560],[3000,560],[3920,560],[4620,560],[5620,560],[6140,440],[6560,540],[7400,560]],
RZN=[[1000,'🕳️ Lücken-Hüpfer'],[1950,'🌀 Drehbalken'],[3100,'🎈 Wackel-Plattformen'],[3860,'⬅️ Laufband'],[4560,'🔨 Hammer-Halle'],[5700,'🪜 Himmelstreppe'],[6660,'⚠️ Wackel-Brücke'],[7340,'🏆 Endspurt']];
let RC=null;
function rcLevel(){const S=[],
 gr=(x,w,cv)=>S.push({x,y:RGY,w,h:RH-RGY,k:'g',cv:cv||0,dx:0}),
 pf=(x,y,w)=>S.push({x,y,w,h:22,k:'p',cv:0,dx:0}),
 mp=(x,y,w,amp,sp,ph)=>S.push({bx:x,x,y,w,h:22,k:'m',amp,sp,ph,cv:0,dx:0}),
 ft=(x,w)=>S.push({x,y:RGY,by:RGY,w,h:22,k:'f',st:0,tm:0,vy:0,cv:0,dx:0});
 /* 1 Start · 2 Lücken-Hüpfer · 3 Drehbalken · 4 Wackel-Plattformen · 5 Laufband · 6 Hammer-Halle · 7 Himmelstreppe · 8 Wackel-Brücke · 9 Endspurt */
 gr(0,950);gr(1040,230);gr(1360,210);gr(1660,200);gr(1950,1080);
 mp(3130,560,120,40,1.5,0);mp(3390,520,110,60,1.2,2);mp(3650,480,110,60,1.6,4);
 gr(3860,700,-130);gr(4560,1100);
 pf(5750,540,110);pf(5930,490,110);pf(6110,440,110);mp(6300,480,100,40,1.4,0);pf(6510,540,110);
 ft(6690,110);ft(6840,110);ft(6990,110);ft(7140,110);gr(7340,760);
 return{S,B:[{x:2300,y:430,L:130,w:1.7,a0:0},{x:2580,y:430,L:130,w:-2,a0:1.5},{x:2860,y:430,L:130,w:1.9,a0:3},{x:4200,y:430,L:130,w:1.8,a0:0},{x:7500,y:430,L:130,w:2.1,a0:0},{x:7660,y:430,L:130,w:-2.3,a0:1}],
  H:[4810,5040,5270,5500].map((x,i)=>({x,y:130,L:400,A:1,T:2.6,ph:i*1.5}))}}
const rcFx=(x,y,n,c,sp,L)=>{for(let i=0;i<n;i++){const a=Math.random()*6.283,v=(.3+Math.random())*sp*60;RC.pa.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-120,t:L||.6,L:L||.6,c,s:3+Math.random()*4})}};
const rcPop=(x,y,s,c)=>RC.tx.push({x,y,s,c:c||'#ffc83d',t:1.6})
const RZ=2.2;/* maximales Rauszoomen: 2.2-fache Bildbreite */
function rcKo(q){const R=RC;q.out=1;q.ko=1;padBuzz(q.p);const x=R.cam+60,y=Math.max(120,Math.min(620,q.y));rcFx(x,y,14,'#ff2d95',6,.6);rcPop(x,y,'💨 '+q.p.name.slice(0,8)+' ist raus!','#ff7ab8');beep(cfgG.sfx,0)};
function rcSeg(px,py,x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1,t=Math.max(0,Math.min(1,((px-x1)*dx+(py-y1)*dy)/(dx*dx+dy*dy)));return Math.hypot(px-x1-t*dx,py-y1-t*dy)}
function rcHit(q,dx,pw,up){if(q.inv>0||q.st>.25||q.fin)return;q.vx=dx*pw;q.vy=-up;q.st=.7;q.on=false;q.ground=null;q.inv=.5;padBuzz(q.p);rcFx(q.x+13,q.y+19,10,'#ffffff',5);beep(cfgG.sfx,1)}
function rcShove(q){const R=RC;rcFx(q.x+13+q.dir*18,q.y+19,6,'#ffc83d',4,.3);beep(cfgG.sfx,0);
 for(const o of R.pl){if(o===q||o.out||o.fin)continue;const dx=(o.x-q.x)*q.dir,dy=Math.abs(o.y-q.y);
  if(dx>0&&dx<58&&dy<46){o.vx=q.dir*440;o.vy=-280;stb(q.p,'s');padBuzz(o.p);o.st=.55;o.on=false;o.ground=null;o.inv=Math.max(o.inv,.2);rcFx(o.x+13,o.y+19,8,'#ffffff',5);rcPop(o.x,o.y-20,'💥')}}}
function rcRespawn(q,left){const R=RC;let k=q.cp,c=RCP[k];
 const ref=Math.max(c[0],...R.pl.filter(z=>z!==q&&!z.out&&!z.fin).map(z=>z.x));
 if(ref-(c[0]-70)+90>RW*RZ)return rcKo(q);
 q.gr=1.4;q.x=c[0]-13+(q.p.slot-3.5)*6;q.y=c[1]-38-160;q.vx=0;q.vy=0;q.st=0;q.inv=1.6;q.on=false;q.ground=null;q.cp=Math.max(q.cp,k);
 rcFx(q.x+13,q.y+19,12,'#18c9e8',5,.5);if(!left)rcPop(q.x,q.y+60,'Plumps!','#ff7ab8')}
function rcBot(q,dt){const R=RC;q.at-=dt;
 if(q.at<=0){q.at=.08;const f=q.y+38,cx=q.x+13,ahead=x=>{let b=1e9;for(const s of R.S){if(s.k==='f'&&s.st>=2)continue;if(x>s.x&&x<s.x+s.w&&s.y>=f-30&&s.y<b)b=s.y}return b};
  const g1=ahead(cx+46);q.ai.j=(g1>1e8||g1-f>110)?1:0;
  for(const b of R.B)if(Math.abs(b.x-cx)<190&&Math.random()<.2)q.ai.j=1;
  for(const h of R.H)if(Math.abs(h.x-cx)<190&&Math.random()<.2)q.ai.j=1;
  q.ai.s=0;if(Math.random()<.05)for(const o of R.pl)if(o!==q&&!o.out&&!o.fin&&(o.x-q.x)>0&&(o.x-q.x)<50&&Math.abs(o.y-q.y)<40)q.ai.s=1}
 return{l:0,r:1,j:q.ai.j|0,s:q.ai.s|0}}
function rcPlayer(q,dt){const R=RC,f=q.fin,b=q.bot?0:((P[q.p.id]||{}).b|0),
 inp=f?{l:0,r:0,j:0,s:0}:q.bot?rcBot(q,dt):{l:b&1,r:b&2,j:(b&4)||(b&32),s:(b&8)||(b&128)};
 q.inv=Math.max(0,q.inv-dt);q.gr=Math.max(0,(q.gr||0)-dt);q.cdS=Math.max(0,q.cdS-dt);q.st=Math.max(0,q.st-dt);q.sq*=Math.exp(-dt*9);
 if(q.on&&q.ground)q.x+=q.ground.dx+q.ground.cv*dt;
 const ctl=q.st<=0&&!f;
 if(ctl){q.bst=Math.max(0,(q.bst||0)-dt);const rb=1+Math.min(.12,Math.max(0,((R.ref||0)-q.x-350)/4500))+(q.bst>0?.25:0),tv=((inp.r?1:0)-(inp.l?1:0))*235*(q.bot?q.sk:1)*rb;if(tv)q.dir=Math.sign(tv);q.vx+=(tv-q.vx)*Math.min(1,dt*(q.on?16:6))}
 else q.vx*=Math.exp(-dt*(q.on?3.5:.8));
 q.rot=q.st>0?q.rot+dt*13*(q.vx<0?-1:1):0;
 if(inp.j&&!q.jh)q.buf=.12;else q.buf=Math.max(0,q.buf-dt);q.jh=inp.j;
 q.coy=q.on?.1:Math.max(0,q.coy-dt);
 if(ctl&&q.buf>0&&q.coy>0){q.vy=-570;stb(q.p,'j');q.buf=0;q.coy=0;q.on=false;q.ground=null;q.sq=-1}
 else if(!inp.j&&q.vy<-220)q.vy+=2200*dt;
 if(ctl&&inp.s&&!q.sh&&q.cdS<=0){q.cdS=.8;q.vx+=q.dir*140;rcShove(q)}q.sh=inp.s;
 q.vy=Math.min(q.vy+1500*dt,900);q.x+=q.vx*dt;
 const pf=q.y+38;let ny=q.y+q.vy*dt,landed=null;
 if(q.vy>=0){let bt=1e9;for(const s of R.S){if(s.k==='f'&&s.st>=2)continue;if(q.x+24>s.x+2&&q.x+2<s.x+s.w-2&&pf<=s.y+8&&ny+38>=s.y&&s.y<bt){bt=s.y;landed=s}}}
 if(landed){ny=landed.y-38;if(!q.on&&q.vy>300){q.sq=1;rcFx(q.x+13,landed.y,5,'#c8bef0',3,.4)}q.vy=0;q.on=true;q.ground=landed;q.coy=.1;if(landed.k==='f'&&landed.st===0){landed.st=1;landed.tm=.55}}
 else{q.on=false;q.ground=null}
 q.y=ny;
 if(q.on&&q.ground&&q.ground.k!=='f'){let k=-1;for(let i=0;i<RCP.length;i++)if(RCP[i][0]<=q.x+13)k=i;if(k>q.cp)q.cp=k}
 if(q.y>800){stb(q.p,'f');return rcRespawn(q,0)}
 if(q.x<0){q.x=0;if(q.vx<0)q.vx=0}
 if(q.x+26<R.cam-10&&!(q.gr>0)&&R.t>5)return rcKo(q);
 if(q.x>R.cam+R.vw-28){q.x=R.cam+R.vw-28;if(q.vx>0)q.vx=0}
 if(!f&&q.x+13>=RFIN){q.fin=1;q.ft=R.t;R.order.push(q);if(R.fT==null)R.fT=R.t;beep(cfgG.sfx,0);if(!(R.slo>0)&&R.pl.some(z=>z!==q&&!z.fin&&!z.out&&!z.ko&&z.x+13>=RFIN-110)){R.slo=1.6;rcPop(q.x,q.y-70,'📸 Fotofinish!','#ffc83d')}
  rcPop(q.x,q.y-30,'🏁 '+R.order.length+'.',pcol(q.p));for(let i=0;i<30;i++)rcFx(q.x+13,q.y,1,COL[Math.random()*COL.length|0],7,1.4)}}
function rcPush(){const a=RC.pl.filter(q=>!q.out&&!q.fin);
 for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){const A=a[i],B=a[j],dx=B.x-A.x;
  if(Math.abs(dx)<24&&Math.abs(B.y-A.y)<26){const o=(24-Math.abs(dx))/2,s=dx>=0?1:-1;A.x-=s*o;B.x+=s*o}}}
function rcUpd(dt){const R=RC;R.tt+=dt;
 for(const p of R.pa){p.vy+=700*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.t-=dt}R.pa=R.pa.filter(p=>p.t>0);
 for(const t of R.tx){t.y-=dt*40;t.t-=dt}R.tx=R.tx.filter(t=>t.t>0);
 if(R.cd>0){R.cd-=dt;cdTick(Math.max(0,Math.ceil(R.cd)));if(R.cd<=0){R.go=1;beep(cfgG.sfx,1)}return}
 R.t+=dt;
 for(const s of R.S){const ox=s.x;
  if(s.k==='m')s.x=s.bx+s.amp*Math.sin(R.t*s.sp+s.ph);
  else if(s.k==='f'){if(s.st===1){if((s.tm-=dt)<=0){s.st=2;s.vy=0}}else if(s.st===2){s.vy+=1800*dt;s.y+=s.vy*dt;if(s.y>900){s.st=3;s.tm=3.5}}else if(s.st===3){if((s.tm-=dt)<=0){s.st=0;s.y=s.by}}}
  s.dx=s.x-ox}
 for(const q of R.pl)if(!q.out)rcPlayer(q,dt);
 rcPush();
 for(const q of R.pl){if(q.out||q.fin)continue;const cx=q.x+13,cy=q.y+19;
  for(const b of R.B){const a=b.a0+b.w*R.t,dx=Math.cos(a)*b.L,dy=Math.sin(a)*b.L;if(rcSeg(cx,cy,b.x-dx,b.y-dy,b.x+dx,b.y+dy)<26)rcHit(q,cx>=b.x?1:-1,430,380)}
  for(const h of R.H){const ph=Math.PI*2*R.t/h.T+h.ph,th=h.A*Math.sin(ph),hx=h.x+Math.sin(th)*h.L,hy=h.y+Math.cos(th)*h.L;
   if(Math.hypot(cx-hx,cy-hy)<52)rcHit(q,Math.sign(Math.cos(ph))||1,560,300)}}
 const act=R.pl.filter(q=>!q.out&&!q.fin),set=act.length?act:R.pl.filter(q=>!q.out);
 for(const q of R.pl){if(!q.out||q.bot)continue;const bb=(P[q.p.id]||{}).b|0,dnA=(bb&4)&&!q.fh;q.fh=!!(bb&4);q.fcd=Math.max(0,(q.fcd||0)-dt);if(dnA&&q.fcd<=0&&act.length&&R.go){const t=act.reduce((a,z)=>z.x<a.x?z:a);t.bst=2;q.fcd=6;rcPop(t.x,t.y-50,'🌬️ Rückenwind von '+q.p.name.slice(0,8),'#7fe3ff');padBuzz(q.p);beep(cfgG.sfx,0,660)}}
 if(set.length){const ref=Math.max(...set.map(q=>q.x)),rear=Math.min(...set.map(q=>q.x));R.ref=ref;
  if(R.zi==null)R.zi=0;while(R.zi<RZN.length&&ref>RZN[R.zi][0]){rcPop(R.cam+R.vw/2-13,RH-(RH-120)*R.vw/RW,RZN[R.zi][1],'#ffc83d');R.zi++}
  /* Erst rauszoomen: die Bildbreite wächst mit dem Abstand zwischen Erstem und Letztem (bis RZ). Erst wenn das nicht mehr reicht, fliegt der Letzte raus. */
  const vt=Math.max(RW*1.15,Math.min(RW*RZ,ref-rear+160));R.vw+=(vt-R.vw)*Math.min(1,dt*(vt>R.vw?6:1.5));
  const VW=R.vw,lo=ref-VW+90,hi=rear-70,pref=ref-VW*.5;
  let tg=Math.max(lo,Math.min(hi,pref));tg=Math.max(0,Math.min(tg,8100-VW));R.cam+=(tg-R.cam)*Math.min(1,dt*5)}
 if(R.end==null){if(R.fT!=null)R.tl=15-(R.t-R.fT);
  if((R.fT!=null&&R.tl<=0)||!act.length||R.t>180){R.end=3;bmJingle()}}
 else if((R.end-=dt)<=0)rcFin()}
function rcFin(){const R=RC;if(R.done)return;R.done=1;$('rpz').classList.remove('on');
 const rows=R.pl.filter(q=>!q.out||q.fin||q.ko).map(q=>({p:q.p,v:q.fin?1e6-q.ft:Math.max(0,q.x),txt:q.fin?(R.order.indexOf(q)+1)+'. im Ziel · '+q.ft.toFixed(1)+' s':q.ko?'raus · '+Math.min(99,Math.round(q.x/RFIN*100))+' % geschafft':'nicht im Ziel'})),
  hum=R.order.filter(q=>!q.bot);let rec=null;
 if(hum.length){const w=hum.reduce((a,q)=>q.ft<a.ft?q:a,hum[0]);rec={gi:3,v:+w.ft.toFixed(1),who:w.p.name,low:1}}
 award(rows,T?'':stAw().join(' · '),rec,'sum')}
const rcLost=()=>RC?RC.pl.filter(q=>!q.out&&!q.fin&&!q.bot&&(/^gp/.test(q.p.id)?!P[q.p.id]:!fixed(q.p.id)&&(!P[q.p.id]||Date.now()-P[q.p.id].seen>4000))):[];
const rcPZ=makePause({obj:()=>RC,zone:'rpz',note:'rpn',rows:'rpr',click:'rcPzClick',lost:rcLost,autoPause:B=>B.end==null,
 drop:()=>rcLost().forEach(q=>q.out=1),restart:()=>launch(lastG==null?3:lastG)});
const rcPause=(v,by)=>rcPZ.pause(v,by),rcPzClick=i=>rcPZ.click(i);
GS.rc={input(p,dn){if(RC&&RC.pz)rcPZ.input(dn);else if(dn(16))rcPause(1,p.name)},pauseKey:r=>rcPZ.toggle(r),blur:()=>rcPZ.blur()};
function rcMus(){const R=RC;if(!R||R.done||R.pz||R.end!=null||cfgG.mus<=0||gvol(3)<=0){BMU.next=0;return}
 try{bc=bc||new(window.AudioContext||window.webkitAudioContext)();if(bc.state==='suspended')bc.resume();if(bc.state!=='running')return;
  if(!BMU.g){BMU.g=bc.createGain();BMU.g.connect(bc.destination)}
  BMU.g.gain.value=.5*cfgG.mus/100*gvol(3);
  const now=bc.currentTime;if(!BMU.next||BMU.next<now-.3)BMU.next=now+.05;
  const sd=60/(128+Math.min(24,R.t/6))/2;
  while(BMU.next<now+.25){const s=BMU.step++,k=s&7,t0=BMU.next,c=BMP[(s>>3)&3],r=110*Math.pow(2,c[0]/12);
   if(!(k&1))bmNote(r,t0,sd*1.5,'triangle',.26);
   bmNote(r*4*Math.pow(2,c[1][BMA[k]]/12),t0,sd*.8,'square',.035);
   if(k===0||k===4)bmKick(t0);
   if(k===2||k===6)bmHat(t0,.08,6000);
   BMU.next+=sd}}catch(e){}}
function rcPl(c,q){const w=$('fl').contentWindow;
 c.save();c.translate(q.x+13,q.y+38);c.scale(1+.25*q.sq,1-.25*q.sq);c.translate(0,-19);c.rotate(q.rot||0);c.translate(-13,-19);
 try{w.PA.drawRacer(c,q.p.co,q.p.ch,q.p.hat,q.vx,q.vy,q.on,q.dir,q.inv,TMON&&q.p.tm?TRGB[q.p.tm-1]:null)}
 catch(e){c.fillStyle=COL[q.p.co];c.beginPath();c.roundRect(0,0,26,38,10);c.fill()}
 c.restore()}
function rcDraw(){const R=RC,cv=$('rcv'),sc=Math.min(innerWidth/RW,innerHeight/RH),cw=Math.floor(RW*sc),ch=Math.floor(RH*sc);
 if(cv.width!==cw||cv.height!==ch){cv.width=cw;cv.height=ch}
 const c=cv.getContext('2d'),cam=Math.round(R.cam),VW=R.vw||RW,zk=RW/VW,
  T=(s,x,y,f,col,al)=>{c.font=f;c.textAlign=al||'left';c.lineWidth=5;c.strokeStyle='rgba(10,0,30,.75)';c.strokeText(s,x,y);c.fillStyle=col;c.fillText(s,x,y)};
 c.setTransform(sc,0,0,sc,0,0);c.clearRect(0,0,RW,RH);c.textBaseline='alphabetic';
 const g=c.createLinearGradient(0,0,0,RH);g.addColorStop(0,'#2b1760');g.addColorStop(.6,'#17123a');g.addColorStop(1,'#0f2a4a');c.fillStyle=g;c.fillRect(0,0,RW,RH);
 for(const s of R.stars){const x=((s[0]-cam*.12)%RW+RW)%RW;c.fillStyle='rgba(255,255,255,'+s[3]+')';c.fillRect(x,s[1],s[2],s[2])}
 [[.25,470,70,'rgba(155,107,255,.14)'],[.5,540,50,'rgba(24,201,232,.12)']].forEach(([f,base,amp,col])=>{c.fillStyle=col;c.beginPath();c.moveTo(0,RH);for(let x=0;x<=RW;x+=16){const wx=x+cam*f;c.lineTo(x,base-Math.abs(Math.sin(wx/170))*amp-Math.sin(wx/53)*8)}c.lineTo(RW,RH);c.fill()});
 c.save();c.translate(0,RH);c.scale(zk,zk);c.translate(-cam,-RH);
 for(let i=0;i<RCP.length;i++){const[x,y]=RCP[i];if(x<cam-40||x>cam+VW+40)continue;const on=R.pl.some(q=>q.cp>=i&&!q.out);
  c.fillStyle='#ffffff99';c.fillRect(x-1,y-64,3,64);c.fillStyle=on?'#3ddc6a':'#ffc83d';c.beginPath();c.moveTo(x+2,y-64);c.lineTo(x+26,y-55);c.lineTo(x+2,y-46);c.fill()}
 for(const s of R.S){if(s.x>cam+VW+50||s.x+s.w<cam-50||(s.k==='f'&&s.st===3))continue;
  const sh=s.k==='f'&&s.st===1?Math.sin(R.tt*60)*2:0;
  if(s.k==='g'){c.fillStyle='#1b1556';c.fillRect(s.x,s.y,s.w,s.h);c.fillStyle='#ffffff0d';for(let x=Math.ceil(s.x/60)*60;x<s.x+s.w;x+=60)c.fillRect(x,s.y+10,2,s.h);
   c.fillStyle=s.cv?'#ffc83d':'#18c9e8';c.fillRect(s.x,s.y,s.w,8);
   if(s.cv){c.fillStyle='#1a1030';const d=Math.sign(s.cv),x0=s.x+((R.tt*s.cv)%32+32)%32-32;for(let x=x0;x+16<=s.x+s.w;x+=32){if(x<s.x)continue;c.beginPath();c.moveTo(x+(d<0?14:4),s.y+1);c.lineTo(x+(d<0?4:14),s.y+4);c.lineTo(x+(d<0?14:4),s.y+7);c.fill()}}}
  else{c.fillStyle=s.k==='m'?'#18c9e8':s.k==='f'?(s.st===1?'#ff4a2e':'#ff8c28'):'#ff2d95';c.beginPath();c.roundRect(s.x+sh,s.y,s.w,s.h,8);c.fill();c.fillStyle='#ffffff55';c.fillRect(s.x+6+sh,s.y+3,s.w-12,4)}}
 for(const b of R.B){if(b.x<cam-200||b.x>cam+VW+200)continue;const a=b.a0+b.w*R.t,dx=Math.cos(a)*b.L,dy=Math.sin(a)*b.L;
  c.lineCap='round';c.strokeStyle='#ff2d95';c.lineWidth=16;c.beginPath();c.moveTo(b.x-dx,b.y-dy);c.lineTo(b.x+dx,b.y+dy);c.stroke();c.strokeStyle='#ffc83d';c.lineWidth=6;c.stroke();c.lineCap='butt';
  c.fillStyle='#fff';c.beginPath();c.arc(b.x,b.y,9,0,7);c.fill()}
 for(const h of R.H){if(h.x<cam-450||h.x>cam+VW+450)continue;const th=h.A*Math.sin(Math.PI*2*R.t/h.T+h.ph),hx=h.x+Math.sin(th)*h.L,hy=h.y+Math.cos(th)*h.L;
  c.fillStyle='#4b3f8f';c.fillRect(h.x-14,h.y-14,28,14);c.strokeStyle='#c8bef0';c.lineWidth=5;c.beginPath();c.moveTo(h.x,h.y);c.lineTo(hx,hy);c.stroke();
  c.shadowColor='#ff2d95';c.shadowBlur=16;c.fillStyle='#ff2d95';c.beginPath();c.arc(hx,hy,36,0,7);c.fill();c.shadowBlur=0;c.fillStyle='#ffffff55';c.beginPath();c.arc(hx-10,hy-12,10,0,7);c.fill();
  c.strokeStyle='#ffc83d';c.lineWidth=4;c.beginPath();c.arc(hx,hy,36,0,7);c.stroke()}
 {const x=RFIN;c.fillStyle='#fff';c.fillRect(x-60,330,10,230);c.fillRect(x+50,330,10,230);
  for(let i=0;i<12;i++)for(let j=0;j<2;j++){c.fillStyle=(i+j)%2?'#fff':'#1a1030';c.fillRect(x-60+i*10,330+j*20,10,20)}
  c.fillStyle='#ffc83d44';c.fillRect(x-1,370,3,190);T('ZIEL',x,322,'34px Bungee,sans-serif','#ffc83d','center')}
 for(const q of R.pl){if(q.out)continue;rcPl(c,q);T((TMON&&q.p.tm?TG[q.p.tm-1]:'')+q.p.name.slice(0,8),q.x+13,q.y-8,'700 '+Math.round(15/Math.sqrt(zk))+'px Rajdhani,sans-serif',pcol(q.p),'center')}
 for(const p of R.pa){c.globalAlpha=Math.max(0,Math.min(1,p.t/p.L*1.6));c.fillStyle=p.c;c.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s)}c.globalAlpha=1;
 for(const t of R.tx){c.globalAlpha=Math.min(1,t.t*2);T(t.s,t.x+13,t.y,'700 26px Rajdhani,sans-serif',t.c,'center')}c.globalAlpha=1;
 c.restore();
 const tx0=60,tw=RW-120;c.fillStyle='#ffffff22';c.fillRect(tx0,22,tw,6);
 for(const[x]of RCP){c.fillStyle='#ffffff44';c.fillRect(tx0+x/RFIN*tw-1,18,2,14)}
 c.fillStyle='#ffc83d';c.fillRect(tx0+tw-2,14,4,22);
 for(const q of R.pl){if(q.out)continue;c.fillStyle=pcol(q.p);c.strokeStyle='#0b0820';c.lineWidth=3;c.beginPath();c.arc(tx0+Math.min(1,Math.max(0,(q.x+13)/RFIN))*tw,25,9,0,7);c.stroke();c.fill()}
 T(R.t.toFixed(1)+' s',24,70,'700 34px Rajdhani,sans-serif','#fff');
 if(R.fT!=null&&R.end==null)T('⏱ noch '+Math.max(0,Math.ceil(R.tl))+' s',24,102,'700 26px Rajdhani,sans-serif','#ffc83d');
 R.order.forEach((q,i)=>T((i+1)+'. '+q.p.name.slice(0,8)+'  '+q.ft.toFixed(1)+' s',RW-24,70+i*28,'700 24px Rajdhani,sans-serif',pcol(q.p),'right'));
 if(R.cd>0){T(Math.ceil(R.cd),RW/2,RH/2+60,'180px Bungee,sans-serif','#ffc83d','center');T('A = Springen · B = Schubsen',RW/2,RH-30,'700 26px Rajdhani,sans-serif','#f6f3ff','center')}
 else if(R.t<1.2)T('LOS!',RW/2,RH/2+40,'120px Bungee,sans-serif','#3ddc6a','center');
 if(R.end!=null)T('🏁 ZIEL!',RW/2,RH/2,'100px Bungee,sans-serif','#ffc83d','center')}
function startRace(){if(!T)ST={};cdL=-1;const l=list();if(!l.length)return;const lv=rcLevel();
 const pl=l.map(p=>({p,bot:p.id.startsWith('bot'),x:60+p.slot*44,y:RGY-38,vx:0,vy:0,on:true,ground:null,dir:1,st:0,inv:0,cdS:0,sq:0,rot:0,sh:0,jh:0,buf:0,coy:.1,cp:0,fin:0,ft:0,out:0,sk:(.82+Math.random()*.16)*[.86,1,1.1][gset[3].bots],at:0,ai:{}}));
 RC={S:lv.S,B:lv.B,H:lv.H,pl,order:[],pa:[],tx:[],cam:0,vw:RW,cd:3,t:0,tt:0,fT:null,tl:15,end:null,done:0,pz:0,pzi:0,go:0,last:performance.now(),
  stars:Array.from({length:90},()=>[Math.random()*RW,Math.random()*420,1+Math.random()*2,.2+Math.random()*.6])};
 show('rc');requestAnimationFrame(rcLoop)}
function rcLoop(now){if(st!=='rc'||!RC||RC.done)return;const dt0=Math.min(.05,(now-RC.last)/1000);RC.last=now;let dt=dt0;if(RC.slo>0){RC.slo-=dt0;dt=dt0*.3}
 rcPZ.watch();
 if(!RC.pz){rcUpd(dt);if(dt<dt0&&!(RC.cd>0))RC.t+=dt0-dt}rcMus();if(!RC.done&&st==='rc'){rcDraw();requestAnimationFrame(rcLoop)}}
