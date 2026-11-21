/* ===== Bomberman: Chaos-Edition (bis 8 Spieler, 25x13, Bots, Items, Flüche, Meteore, Geister-Rache) ===== */
const BW=25,BH=13,BSP=[[1,1],[23,11],[23,1],[1,11],[12,1],[12,11],[1,6],[23,6]];let BM=null;
const ITN=['','💣','🔥','👟','👢','🛡️'],N4=[[1,0],[-1,0],[0,1],[0,-1]];
const bmPick=()=>[1,1,1,1,2,2,2,2,3,3,3,4,5,5][Math.random()*14|0];
const bmFx=(x,y,n,col,sp,life)=>{for(let i=0;i<n;i++){const a=Math.random()*6.283,v=(.3+Math.random())*(sp||4);BM.pa.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-2,t:life||.7,L:life||.7,c:col,s:.08+Math.random()*.1})}};
const bmPop=(x,y,s,c)=>BM.tx.push({x,y,s,c:c||'#ffc83d',t:1.4});
const bmBanner=s=>{BM.bn={s,t:2.4}};
const bmSol=(x,y,q)=>x<0||y<0||x>=BW||y>=BH||BM.g[y*BW+x]>0||BM.bo.some(b=>(b.x|0)===x&&(b.y|0)===y&&!b.pass.includes(q));
const bmBlk=(q,x,y)=>[-.38,.38].some(i=>[-.38,.38].some(j=>bmSol(Math.floor(x+i),Math.floor(y+j),q)));
function bmMv(q,a,d,s){const c=q.c,n=[c[0],c[1]];n[a]+=d*s;
 if(!bmBlk(q,n[0],n[1])){c[0]=n[0];c[1]=n[1];return}
 const k=Math.floor(c[a]),m=Math.floor(c[1-a]),o=c[1-a]-m-.5,sd=o>0?1:-1,ah=k+d,fr=r=>!bmSol(a?r:ah,a?ah:r,q);
 if(q.kick&&Math.abs(o)<.3){const b=BM.bo.find(b=>(b.x|0)===(a?m:ah)&&(b.y|0)===(a?ah:m));if(b&&!b.v&&!b.pass.includes(q)){b.v=a?[0,d]:[d,0];if(q.an){q.an.lg=.2;q.an.lgx=a?0:d;q.an.sq=.35}beep(cfgG.sfx,0)}}
 let t=null;if(fr(m))t=m+.5;else if(fr(m+sd)&&Math.abs(o)>.2)t=m+sd+.5;
 if(t!==null&&Math.abs(c[1-a]-t)<.55)c[1-a]+=Math.sign(t-c[1-a])*Math.min(s,Math.abs(t-c[1-a]));
 else c[a]=d>0?Math.max(c[a],Math.min(n[a],k+.619)):Math.min(c[a],Math.max(n[a],k+.381))}
function bmSlide(b,s){const[vx,vy]=b.v,nx=b.x+vx*s,ny=b.y+vy*s,ex=Math.floor(nx+vx*.5),ey=Math.floor(ny+vy*.5),cx=b.x|0,cy=b.y|0;
 if((ex!==cx||ey!==cy)&&(ex<0||ey<0||ex>=BW||ey>=BH||BM.g[ey*BW+ex]>0||BM.bo.some(o=>o!==b&&(o.x|0)===ex&&(o.y|0)===ey)||BM.pl.some(o=>o.al&&Math.abs(o.c[0]-ex-.5)<.88&&Math.abs(o.c[1]-ey-.5)<.88))){b.v=null;b.x=cx+.5;b.y=cy+.5}else{b.x=nx;b.y=ny}}
function bmExp(b){const ix=BM.bo.indexOf(b);if(ix>=0)BM.bo.splice(ix,1);b.o.nb--;const cx=b.x|0,cy=b.y|0,add=(x,y)=>BM.fl.push({x,y,t:.6,o:b.o});add(cx,cy);beep(cfgG.sfx,1);
 BM.sh=Math.max(BM.sh,.3);bmFx(cx+.5,cy+.5,12,'#ffc83d',6);
 if(BM.g[cy*BW+cx]===2){BM.g[cy*BW+cx]=0;BM.cr.push({x:cx,y:cy,t:.28,r:Math.random()<.5?-1:1});bmFx(cx+.5,cy+.5,8,'#ff2d95',5)}
 for(const[dx,dy]of N4)for(let i=1;i<=b.r;i++){const x=cx+dx*i,y=cy+dy*i,k=y*BW+x;
  if(x<0||y<0||x>=BW||y>=BH||BM.g[k]===1)break;add(x,y);
  if(BM.g[k]===2){BM.g[k]=0;BM.cr.push({x,y,t:.28,r:Math.random()<.5?-1:1});bmFx(x+.5,y+.5,9,'#ff2d95',5);if(Math.random()<.42)BM.it[k]=bmPick();break}
  if(BM.it[k]){BM.it[k]=0;bmFx(x+.5,y+.5,8,'#fff',4);break}
  const o=BM.bo.find(o=>(o.x|0)===x&&(o.y|0)===y);if(o){o.t=0;break}}}
function bmBomb(id){const B=BM;if(!B||B.cd>0)return;const q=B.pl.find(q=>q.p.id===id);if(!q||!q.al||q.nb>=q.bo)return;const x=q.c[0]|0,y=q.c[1]|0;
 if(B.g[y*BW+x]>0||B.bo.some(b=>(b.x|0)===x&&(b.y|0)===y))return;
 if(q.an){q.an.sq=.8;bmFx(q.c[0],q.c[1]+.42,5,'#c8bef0',2,.35)}B.bo.push({x:x+.5,y:y+.5,t:3,a:0,o:q,r:q.fi,v:null,pass:B.pl.filter(o=>o.al&&Math.abs(o.c[0]-x-.5)<.88&&Math.abs(o.c[1]-y-.5)<.88)});q.nb++;stb(q.p,'b')}
function bmEmo(q,e){if(q.bot||!q.al||(BM&&BM.pz)||(q.em&&q.em.t>1.8))return;q.em={e:e||EMOS[0],t:2.2};beep(cfgG.sfx,0)}
function bmEmoji(id,e){const q=BM&&BM.pl.find(q=>q.p.id===id);if(!q)return;if(q.al)bmEmo(q,e);else emoFloat(q.p,e)}
function bmAct(id,k){const B=BM;if(!B||B.cd>0||B.done||B.pz)return;const q=B.pl.find(q=>q.p.id===id);if(!q||!q.al)return;if(k===4)bmBomb(id)}
function bmDanger(x0){const B=BM,d=new Set(B.fl.map(f=>f.y*BW+f.x));
 for(const b of x0?[...B.bo,x0]:B.bo){const cx=b.x|0,cy=b.y|0;d.add(cy*BW+cx);for(const[dx,dy]of N4)for(let i=1;i<=b.r;i++){const x=cx+dx*i,y=cy+dy*i;if(x<0||y<0||x>=BW||y>=BH||B.g[y*BW+x]>0)break;d.add(y*BW+x)}}
 for(const m of B.mt){d.add(m.y*BW+m.x);for(const[dx,dy]of N4){const x=m.x+dx,y=m.y+dy;if(x>=0&&y>=0&&x<BW&&y<BH&&B.g[y*BW+x]!==1)d.add(y*BW+x)}}return d}
function bmPath(q,ok,goal){const s=(q.c[1]|0)*BW+(q.c[0]|0),prev={[s]:-1},Q=[s];
 while(Q.length){const k=Q.shift(),x=k%BW,y=k/BW|0;if(k!==s&&goal(k,x,y)){let c=k;while(prev[c]!==s)c=prev[c];return[c%BW-s%BW,(c/BW|0)-(s/BW|0)]}
  for(const[dx,dy]of N4){const nx=x+dx,ny=y+dy,n=ny*BW+nx;if(nx<0||ny<0||nx>=BW||ny>=BH||n in prev||!ok(n,nx,ny))continue;prev[n]=k;Q.push(n)}}return null}
function bmAI(q,dt){q.at=(q.at||0)-dt;if(q.at>0)return;q.at=.1;const B=BM,k=(q.c[1]|0)*BW+(q.c[0]|0),dg=bmDanger(),
 pass=(n,x,y)=>!B.g[n]&&!B.bo.some(b=>(b.x|0)===x&&(b.y|0)===y&&!b.pass.includes(q)),
 foe=(x,y)=>B.g[y*BW+x]===2||B.pl.some(o=>o!==q&&o.al&&tkey(o.p)!==tkey(q.p)&&(o.c[0]|0)===x&&(o.c[1]|0)===y);
 q.mv=null;
 if(dg.has(k)){q.mv=bmPath(q,(n,x,y)=>pass(n,x,y)&&!B.fl.some(f=>f.y*BW+f.x===n),n=>!dg.has(n))||[0,0];return}
 if(q.nb<q.bo&&N4.some(([a,b])=>foe((k%BW)+a,(k/BW|0)+b))){const d2=bmDanger({x:q.c[0],y:q.c[1],r:q.fi});
  if(bmPath(q,pass,n=>!d2.has(n))){bmBomb(q.p.id);return}}
 q.mv=bmPath(q,(n,x,y)=>pass(n,x,y)&&!dg.has(n),(n,x,y)=>!dg.has(n)&&N4.some(([a,b])=>foe(x+a,y+b)))||[0,0]}
function bmGet(q,i){const x=q.c[0],y=q.c[1]-.8;if(q.an)q.an.hj=.38;
 if(i===1){q.bo=Math.min(8,q.bo+1);bmPop(x,y,'+💣')}else if(i===2){q.fi=Math.min(9,q.fi+1);bmPop(x,y,'+🔥')}else if(i===3){q.sp=Math.min(5,q.sp+1);bmPop(x,y,'+👟')}
 else if(i===4){q.kick=1;bmPop(x,y,'👢 Kick!')}else if(i===5){q.sh=1;bmPop(x,y,'🛡️ Schild!','#7ff')}
 bmFx(q.c[0],q.c[1],8,'#ffc83d',4);beep(cfgG.sfx,0)}
function bmDie(q,force){const B=BM;if(!force){if(q.inv>0)return;if(q.sh){q.sh=0;q.inv=1.4;if(q.an){q.an.lv+=(Math.random()<.5?-1:1)*7;q.an.sq=.5}bmPop(q.c[0],q.c[1]-.8,'Schild kaputt!','#7ff');bmFx(q.c[0],q.c[1],16,'#7ff',6);B.sh=Math.max(B.sh,.3);return}}
 q.al=0;stb(q.p,'d');padBuzz(q.p);bmGhost(q);q.dt=B.t;q.mc=2.5;B.sh=.5;bmFx(q.c[0],q.c[1],26,pcol(q.p),8,1);bmPop(q.c[0],q.c[1]-.8,'💀','#fff');beep(cfgG.sfx,1)}
function bmEvent(){const B=BM,ev=[1,2].filter(e=>e!==B.evl),e=ev[Math.random()*ev.length|0];B.evl=e;
 if(e===0){}
 else if(e===1){bmBanner('🎁 GESCHENKE-REGEN!');let n=0;for(let tr=0;tr<300&&n<7;tr++){const x=1+(Math.random()*(BW-2)|0),y=1+(Math.random()*(BH-2)|0),k=y*BW+x;
   if(!B.g[k]&&!B.it[k]&&!B.fl.some(f=>f.x===x&&f.y===y)&&!B.bo.some(b=>(b.x|0)===x&&(b.y|0)===y)){B.it[k]=bmPick();n++;bmFx(x+.5,y+.5,8,'#ffc83d',4)}}}
 else{bmBanner('🎉 BOMBENPARTY! Alle +💣 +🔥');for(const q of B.pl)if(q.al){q.bo=Math.min(8,q.bo+1);q.fi=Math.min(9,q.fi+1);bmFx(q.c[0],q.c[1],12,'#ff2d95',5)}}
 beep(cfgG.sfx,1)}
/* --- Animationen (Fall-Guys-Stil): Watscheln, Squash & Stretch, Hüpfer, Wackeln, Ausscheide-Salto --- */
const bmBack=p=>{p=Math.max(0,Math.min(1,p));return 1+2.70158*Math.pow(p-1,3)+1.70158*Math.pow(p-1,2)};
function bmAnim(q,dt,B){const i=B.pl.indexOf(q),A=q.an||(q.an={px:q.c[0],py:q.c[1],v:0,wt:0,fs:0,sq:0,la:0,lv:0,hj:0,pop:.45,dl:i*.07,lg:0,lgx:0,ww:0,ph:i*1.7,hop:0,sx:1,sy:1,lean:0,pp:0});
 if(dt<=0)return;
 const vx=(q.c[0]-A.px)/dt,vy=(q.c[1]-A.py)/dt,sp=Math.min(12,Math.hypot(vx,vy)),now=performance.now()/1000;A.px=q.c[0];A.py=q.c[1];
 A.v+=(sp-A.v)*Math.min(1,dt*14);const mk=Math.min(1,A.v/3.3),mv=A.v>.8;
 if(mv)A.wt+=dt*(8+A.v*1.1);
 const fs=Math.floor(A.wt/Math.PI);if(mv&&fs!==A.fs){A.fs=fs;bmFx(q.c[0]+(Math.random()-.5)*.2,q.c[1]+.42,2,'#8f86c8',1.2,.3)}
 A.sq*=Math.exp(-dt*9);A.lv+=(-240*A.la-13*A.lv)*dt;A.la+=A.lv*dt;A.lg=Math.max(0,A.lg-dt);
 if(A.dl>0)A.dl-=dt;else A.pop=Math.max(0,A.pop-dt);
 A.pp=A.dl>0?0:bmBack(1-A.pop/.45);
 let hp=0,st=0,ln=0;
 if(A.hj>0){A.hj=Math.max(0,A.hj-dt);const u=1-A.hj/.38;hp+=Math.sin(Math.PI*u)*.35;st+=Math.cos(Math.PI*u)*.12;if(A.hj===0){A.sq=.5;bmFx(q.c[0],q.c[1]+.42,4,'#c8bef0',2,.35)}}
 const em=q.em&&2.2-q.em.t<.8?2.2-q.em.t:-1;if(em>=0){hp+=Math.abs(Math.sin(em*Math.PI*3.4))*.2*(1-em/.8);ln+=Math.sin(em*16)*.1*(1-em/.8)}
 if(B.end!=null){A.ww+=dt*9;const s=Math.abs(Math.sin(A.ww));hp+=s*.32;st+=(s-.5)*.14;ln+=Math.sin(A.ww*.5)*.1}
 A.hop=hp;
 A.lean=Math.sin(A.wt+A.ph)*.09*mk+((vx>0?1:vx<0?-1:0)*(Math.abs(vx)>Math.abs(vy)?1:0))*.07*mk+A.la+A.lgx*.35*(A.lg/.2)+ln;
 A.sx=1+.22*A.sq-st*.5-Math.cos(A.wt*2)*.02*mk-Math.sin(now*3+A.ph)*.01*(1-mk);
 A.sy=1-.22*A.sq+st+Math.cos(A.wt*2)*.03*mk+Math.sin(now*3+A.ph)*.012*(1-mk)}
function bmGhost(q){const B=BM;B.gh.push({spr:q.spr,x:q.c[0],y:q.c[1],vx:(Math.random()-.5)*5,vy:-7-Math.random()*2,rot:0,tv:(Math.random()<.5?-1:1)*(9+Math.random()*5),t:1,L:1})}
function bmUpd(dt){const B=BM,S=B.pl;B.sh=Math.max(0,B.sh-dt);
 for(const p of B.pa){p.vy+=9*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.t-=dt}B.pa=B.pa.filter(p=>p.t>0);
 for(const t of B.tx){t.y-=dt*1.1;t.t-=dt}B.tx=B.tx.filter(t=>t.t>0);if(B.bn&&(B.bn.t-=dt)<=0)B.bn=null;
 for(const q of S){if(q.em&&(q.em.t-=dt)<=0)q.em=null}
 for(const q of S)if(q.al)bmAnim(q,dt,B);
 for(const g of B.gh){g.vy+=18*dt;g.x+=g.vx*dt;g.y+=g.vy*dt;g.rot+=g.tv*dt;g.t-=dt}B.gh=B.gh.filter(g=>g.t>0);
 for(const c of B.cr)c.t-=dt;B.cr=B.cr.filter(c=>c.t>0);for(const k in B.wa)if((B.wa[k]+=dt)>.3)delete B.wa[k];
 if(B.cd>0){B.cd-=dt;cdTick(Math.max(0,Math.ceil(B.cd)));return}B.t+=dt;
 for(const q of S){if(!q.al)continue;
  q.inv=Math.max(0,q.inv-dt);
  if(q.bot)bmAI(q,dt);const b=q.bot?0:(P[q.p.id]||{b:0}).b;let dx=q.bot?(q.mv?q.mv[0]:0):b&1?-1:b&2?1:0,dy=q.bot?(q.mv?q.mv[1]:0):b&32?-1:b&64?1:0;
  const spd=3.3+q.sp*.55;
  if(dx||dy)bmMv(q,dx?0:1,dx||dy,spd*dt);
  const k=(q.c[1]|0)*BW+(q.c[0]|0),i=B.it[k];
  if(i&&!B.fl.some(f=>f.y*BW+f.x===k)){B.it[k]=0;bmGet(q,i)}}
 for(const b of B.bo){b.pass=b.pass.filter(o=>o.al&&Math.abs(o.c[0]-b.x)<.88&&Math.abs(o.c[1]-b.y)<.88);if(b.v)bmSlide(b,6.5*dt);b.t-=dt;b.a=(b.a||0)+dt}
 for(let b;(b=B.bo.find(b=>b.t<=0));)bmExp(b);
 for(const m of B.mt)m.t-=dt;
 for(let i=B.mt.length;i--;)if(B.mt[i].t<=0){const m=B.mt.splice(i,1)[0];bmExp({x:m.x+.5,y:m.y+.5,r:1,o:{nb:1}})}
 B.fl=B.fl.filter(f=>(f.t-=dt)>0);
 for(const q of S)if(q.al&&B.fl.some(f=>f.x===(q.c[0]|0)&&f.y===(q.c[1]|0))){const was=q.al,fo=B.fl.find(f=>f.x===(q.c[0]|0)&&f.y===(q.c[1]|0));bmDie(q);if(was&&!q.al&&fo&&fo.o&&fo.o!==q)stb(fo.o.p,'k')}
 if(B.end==null){
  if(B.t>=B.nev){B.nev+=28+Math.random()*8;if(B.t<B.sd-12)bmEvent()}
  if(B.rain){B.rain.t-=dt;if(B.rain.t<=0){B.rain.t=.45;B.rain.n--;const al=S.filter(q=>q.al);let x,y;
   if(B.rain.n%3===0&&al.length){const q=al[Math.random()*al.length|0];x=q.c[0]|0;y=q.c[1]|0}else{x=1+(Math.random()*(BW-2)|0);y=1+(Math.random()*(BH-2)|0)}
   if(B.g[y*BW+x]!==1)B.mt.push({x,y,t:1.3});if(B.rain.n<=0)B.rain=null}}
  if(!B.w10&&B.t>B.sd-10){B.w10=1;bmBanner('⚠️ In 10 s kommt die Mauer!');beep(cfgG.sfx,1)}
  if(!B.w0&&B.t>B.sd){B.w0=1;bmBanner('🧱 SUDDEN DEATH!');B.sh=.6}}
 if(B.t>B.sd){B.sdT-=dt;while(B.sdT<=0&&B.si<B.spi.length){B.sdT+=.18;const[x,y]=B.spi[B.si++],k=y*BW+x;if(B.g[k]===1)continue;B.g[k]=1;B.wa[k]=0;B.it[k]=0;
  B.bo=B.bo.filter(b=>{if((b.x|0)===x&&(b.y|0)===y){b.o.nb--;return 0}return 1});bmFx(x+.5,y+.5,5,'#18c9e8',4);
  for(const q of S)if(q.al&&Math.abs(q.c[0]-x-.5)<.88&&Math.abs(q.c[1]-y-.5)<.88)bmDie(q,1)}}
 if(B.end==null&&new Set(S.filter(q=>q.al).map(q=>tkey(q.p))).size<=(S.length>1?1:0)){B.end=3.6;B.slo=S.length>1?1.2:0;B.mt=[];B.rain=null;bmJingle();const w=S.find(q=>q.al);if(w)bmPop(w.c[0],w.c[1]-1,'🏆 SIEGER!','#ffc83d')}
 if(B.end!=null){for(let i=0;i<2;i++)B.pa.push({x:Math.random()*BW,y:-.3,vx:(Math.random()-.5)*2,vy:Math.random()*2,t:3,L:3,c:COL[Math.random()*COL.length|0],s:.12+Math.random()*.12});
  if((B.end-=dt)<=0)bmFin()}}
function bmFin(){const B=BM;B.done=1;award(B.pl.map(q=>({p:q.p,v:q.al?1e6:q.dt,txt:q.al?'🏆 Sieger':Math.round(q.dt)+' s'})),T?'':stAw().join(' · '),null,'max')}
const bmLost=()=>BM?BM.pl.filter(q=>q.al&&!q.bot&&(/^gp/.test(q.p.id)?!P[q.p.id]:!fixed(q.p.id)&&(!P[q.p.id]||Date.now()-P[q.p.id].seen>4000))):[];
const bmPZ=makePause({obj:()=>BM,zone:'bpz',note:'bpn',rows:'bpr',click:'bmPzClick',lost:bmLost,autoPause:B=>B.end==null,
 drop:()=>bmLost().forEach(q=>bmDie(q,1)),restart:()=>launch(lastG==null?1:lastG)});
const bmPause=(v,by)=>bmPZ.pause(v,by),bmPzClick=i=>bmPZ.click(i);
GS.bm={input(p,dn){if(BM&&BM.pz)bmPZ.input(dn);else if(dn(16))bmPause(1,p.name);else if(dn(4))bmAct(p.id,4)},pauseKey:r=>bmPZ.toggle(r),blur:()=>bmPZ.blur()};
const BMU={next:0,step:0,g:null,nz:null},BMP=[[0,[0,3,7]],[-4,[0,4,7]],[3,[0,4,7]],[-2,[0,4,7]]],BMA=[0,2,1,2,0,2,1,2];
function bmNote(f,t0,d,ty,v){const o=bc.createOscillator(),g=bc.createGain();o.type=ty;o.frequency.setValueAtTime(f,t0);g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(v,t0+.012);g.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(g);g.connect(BMU.g);o.start(t0);o.stop(t0+d+.03)}
function bmKick(t0){const o=bc.createOscillator(),g=bc.createGain();o.frequency.setValueAtTime(140,t0);o.frequency.exponentialRampToValueAtTime(45,t0+.12);g.gain.setValueAtTime(.4,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+.15);o.connect(g);g.connect(BMU.g);o.start(t0);o.stop(t0+.17)}
function bmHat(t0,v,fr){if(!BMU.nz){const n=bc.sampleRate*.06|0,b=bc.createBuffer(1,n,bc.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);BMU.nz=b}
 const s=bc.createBufferSource(),f=bc.createBiquadFilter(),g=bc.createGain();s.buffer=BMU.nz;f.type='highpass';f.frequency.value=fr;g.gain.value=v;s.connect(f);f.connect(g);g.connect(BMU.g);s.start(t0)}
function bmMus(){const B=BM;if(!B||B.done||B.pz||B.end!=null||cfgG.mus<=0||gvol(1)<=0){BMU.next=0;return}
 try{bc=bc||new(window.AudioContext||window.webkitAudioContext)();if(bc.state==='suspended')bc.resume();if(bc.state!=='running')return;
  if(!BMU.g){BMU.g=bc.createGain();BMU.g.connect(bc.destination)}
  BMU.g.gain.value=.5*cfgG.mus/100*gvol(1);
  const now=bc.currentTime;if(!BMU.next||BMU.next<now-.3)BMU.next=now+.05;
  const pr=Math.min(1,B.t/B.sd),bpm=118+62*pr+(B.t>B.sd?16:0),sd=60/bpm/2;
  while(BMU.next<now+.25){const s=BMU.step++,k=s&7,t0=BMU.next,c=BMP[(s>>3)&3],r=82.41*Math.pow(2,c[0]/12);
   if(k!==1&&k!==3&&k!==5)bmNote(k===7?r*2:r,t0,sd*1.7,'triangle',.26);
   bmNote(r*4*Math.pow(2,c[1][BMA[k]]/12),t0,sd*.85,'square',.03+.02*pr);
   if(pr>.5&&(k===0||k===3||k===5))bmNote(r*8*Math.pow(2,c[1][(k+1)%3]/12),t0,sd*1.2,'square',.028);
   if(k===0||k===4||(pr>.5&&!(k&1)))bmKick(t0);
   if(pr>.2&&(k===2||k===6))bmHat(t0,.1,1800);
   if(pr>.35&&(k&1||pr>.7))bmHat(t0,.05,7000);
   BMU.next+=sd}}catch(e){}}
function bmJingle(){if(cfgG.mus<=0||!bc||bc.state!=='running'||!BMU.g)return;const t=bc.currentTime+.05;[0,4,7,12,16].forEach((n,i)=>bmNote(329.63*Math.pow(2,n/12),t+i*.11,.4,'square',.07))}
function bmLoop(now){if(st!=='bm'||!BM||BM.done)return;const dt0=Math.min(.05,(now-BM.last)/1000);BM.last=now;let dt=dt0;if(BM.slo>0){BM.slo-=dt0;dt=dt0*.3}
 bmPZ.watch();
 if(!BM.pz){bmUpd(dt);if(dt<dt0&&!(BM.cd>0))BM.t+=dt0-dt}bmMus();if(!BM.done&&st==='bm'){bmDraw();requestAnimationFrame(bmLoop)}}
function startBomber(){const l=list();if(!l.length)return;if(!T)ST={};cdL=-1;
 const g=[];for(let y=0;y<BH;y++)for(let x=0;x<BW;x++)g[y*BW+x]=(x===0||y===0||x===BW-1||y===BH-1||(x%2===0&&y%2===0))?1:Math.random()<.75?2:0;
 const pl=l.map(p=>{const[sx,sy]=BSP[p.slot];for(const[a,b]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]]){const k=(sy+b)*BW+sx+a;if(g[k]===2)g[k]=0}
  const spr=document.createElement('canvas');spr.width=144;spr.height=184;drawPv(spr,TMON&&p.tm?Object.assign({},p,{trgb:TRGB[p.tm-1]}):p);
  return{p,bot:p.id.startsWith('bot'),c:[sx+.5,sy+.5],al:1,bo:1,fi:2,sp:0,kick:0,nb:0,dt:0,spr,sh:0,inv:0,mc:0,em:null,ab:0,at:Math.random()*.1}});
 const spi=[],seen={};let x=1,y=1,dx=1,dy=0;for(let i=0;i<(BW-2)*(BH-2);i++){spi.push([x,y]);seen[x+','+y]=1;let nx=x+dx,ny=y+dy;
  if(nx<1||ny<1||nx>BW-2||ny>BH-2||seen[nx+','+ny]){[dx,dy]=[-dy,dx];nx=x+dx;ny=y+dy}x=nx;y=ny}
 BM={g,it:new Array(BW*BH).fill(0),pl,bo:[],fl:[],mt:[],pa:[],tx:[],gh:[],cr:[],wa:{},bn:null,sh:0,rain:null,evl:-1,nev:24,t:0,cd:3,sd:100,sdT:0,si:0,spi,end:null,done:0,pz:0,pzi:0,last:performance.now()};
 show('bm');requestAnimationFrame(bmLoop)}
function bmDraw(){const B=BM,cv=$('bc'),TF=Math.floor(Math.min(innerWidth/BW,innerHeight/(BH+1.3))),T=Math.min(TF,40),W=BW*T,oy=Math.round(T*1.3),H=oy+BH*T,now=performance.now()/1000;
 if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}cv.style.width=BW*TF+'px';cv.style.height=H*TF/T+'px';
 const c=cv.getContext('2d'),rr=(x,y,w,h,r)=>{c.beginPath();c.roundRect(x,y,w,h,r)},G=(col,b)=>{c.shadowColor=col;c.shadowBlur=b},em=(s,x,y,f)=>{c.font=`${T*f}px sans-serif`;c.fillText(s,x,y)};
 c.clearRect(0,0,W,H);c.textBaseline='middle';
 B.pl.forEach((q,i)=>{const x=T*(.3+i*2.6);c.globalAlpha=q.al?1:.5;c.fillStyle=pcol(q.p);c.beginPath();c.arc(x+T*.3,T*.5,T*.27,0,7);c.fill();
  c.fillStyle='#f6f3ff';c.textAlign='left';c.font=`700 ${T*.34}px Rajdhani,sans-serif`;c.fillText((q.al?'':'☠ ')+(TMON&&q.p.tm?TG[q.p.tm-1]+' ':'')+q.p.name.slice(0,8),x+T*.68,T*.4);
  c.font=`700 ${T*.24}px Rajdhani,sans-serif`;c.fillStyle='#b5aee6';
  c.fillText(q.al?`💣${q.bo} 🔥${q.fi} 👟${q.sp+1}${q.kick?'👢':''}${q.sh?'🛡️':''}`:'ausgeschieden',x+T*.68,T*.88)});
 c.globalAlpha=1;const sl=Math.max(0,B.sd-B.t);c.font=`${T*.5}px Bungee,sans-serif`;c.fillStyle='#ffc83d';c.textAlign='right';G('#ff2d95',T*.2);
 c.fillText(sl>0?Math.floor(sl/60)+':'+String(Math.floor(sl%60)).padStart(2,'0'):'⚠',W-T*.2,T*.6);G('transparent',0);c.textAlign='center';
 c.save();c.translate(0,oy);if(B.sh>0)c.translate((Math.random()-.5)*T*.6*B.sh,(Math.random()-.5)*T*.6*B.sh);
 c.fillStyle='#120d33';rr(0,0,W,BH*T,T*.15);c.fill();
 for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){const k=y*BW+x,g=B.g[k],X=x*T,Y=y*T;
  if(g!==1){c.fillStyle=(x+y)%2?'#1c1658':'#221a66';c.fillRect(X,Y,T,T)}
  if(g===1){const wa=B.wa[k];if(wa!==undefined){c.save();c.translate(0,-T*4*Math.pow(1-wa/.3,2))}c.fillStyle='#2b2a78';rr(X+T*.04,Y+T*.04,T*.92,T*.92,T*.14);c.fill();c.strokeStyle='#18c9e8';c.lineWidth=T*.05;c.stroke();c.fillStyle='#ffffff18';rr(X+T*.16,Y+T*.14,T*.68,T*.2,T*.08);c.fill();if(wa!==undefined)c.restore()}
  else if(g===2){c.fillStyle='#ff2d95';rr(X+T*.07,Y+T*.07,T*.86,T*.86,T*.16);c.fill();c.fillStyle='#ff8ac4';rr(X+T*.14,Y+T*.12,T*.72,T*.18,T*.08);c.fill();c.strokeStyle='#a3115f';c.lineWidth=T*.05;c.beginPath();c.moveTo(X+T*.5,Y+T*.3);c.lineTo(X+T*.5,Y+T*.9);c.moveTo(X+T*.1,Y+T*.6);c.lineTo(X+T*.9,Y+T*.6);c.stroke()}
  else if(B.it[k]){const bob=Math.sin(now*5+x*1.7+y)*T*.04;c.fillStyle='#ffffff22';rr(X+T*.12,Y+T*.12+bob,T*.76,T*.76,T*.2);c.fill();c.strokeStyle='#ffc83d';c.lineWidth=T*.04;c.stroke();c.fillStyle='#fff';em(ITN[B.it[k]],X+T*.5,Y+T*.54+bob,.5)}}
 for(const m of B.mt){const X=m.x*T,Y=m.y*T,pl=.22+.2*Math.sin(now*18);c.fillStyle=`rgba(255,60,60,${pl})`;for(const[dx,dy]of[[0,0],...N4]){if(B.g[(m.y+dy)*BW+m.x+dx]===1||m.x+dx<0||m.y+dy<0||m.x+dx>=BW||m.y+dy>=BH)continue;c.fillRect(X+dx*T+T*.06,Y+dy*T+T*.06,T*.88,T*.88)}
  em('🎯',X+T*.5,Y+T*.5,.7);em('☄️',X+T*.5+m.t*T*1.5,Y+T*.5-m.t*T*5,1.1)}
 for(const cr of B.cr){const p=1-cr.t/.28,X=cr.x*T+T/2,Y=cr.y*T+T/2,sc=1-p*.55;c.save();c.globalAlpha=1-p;c.translate(X,Y+p*T*.15);c.rotate(cr.r*p*.6);c.scale(sc,sc);c.fillStyle='#ff2d95';rr(-T*.43,-T*.43,T*.86,T*.86,T*.16);c.fill();c.fillStyle='#ff8ac4';rr(-T*.36,-T*.38,T*.72,T*.18,T*.08);c.fill();c.restore()}
 for(const f of B.fl){const a=Math.min(1,f.t*3),X=f.x*T,Y=f.y*T;c.globalAlpha=a;c.fillStyle='#ff2d95';rr(X+T*.06,Y+T*.06,T*.88,T*.88,T*.2);c.fill();c.fillStyle='#ffc83d';rr(X+T*.2,Y+T*.2,T*.6,T*.6,T*.15);c.fill();c.fillStyle='#fff7c2';rr(X+T*.34,Y+T*.34,T*.32,T*.32,T*.1);c.fill();c.globalAlpha=1}
 for(const b of B.bo){const p=1+Math.sin(b.t*10)*.07,hot=b.t<.8&&(b.t*10|0)%2,X0=b.x*T,Y=b.y*T,ac=hot?'#ff2d95':'#18c9e8',ba=b.a||0,ps=ba<.25?Math.max(.01,bmBack(ba/.25)):1,jt=b.t<.8?Math.sin(now*70)*T*.016*(1.2-b.t):0,X=X0+jt,sxv=b.v?(b.v[0]?1.18:.88):1,syv=b.v?(b.v[0]?.88:1.18):1;c.save();c.translate(X,Y+T*.4);c.scale(ps*sxv,ps*syv);c.translate(-X,-Y-T*.4);c.fillStyle='#0b1226';c.beginPath();c.arc(X,Y+T*.04,T*.36*p,0,7);c.fill();c.strokeStyle=ac;c.lineWidth=T*.06;c.stroke();
  c.fillStyle='#ffffff55';c.beginPath();c.arc(X-T*.2,Y-T*.14,T*.06,0,7);c.fill();
  for(const s of[-1,1]){c.fillStyle='#fff';c.beginPath();c.arc(X+s*T*.12,Y+T*.02,T*.09,0,7);c.fill();c.fillStyle=hot?'#ff2d95':'#0b1226';c.beginPath();c.arc(X+s*T*.12,Y+T*(.03+(b.t<1?.03:0)),T*.045,0,7);c.fill()}
  c.fillStyle='#ffc83d';c.fillRect(X+T*.08,Y-T*.46,T*.08,T*.14);c.beginPath();c.arc(X+T*.12,Y-T*.5,T*(.05+.03*Math.sin(now*30)),0,7);c.fill();c.restore()}
 const k=T*1.05/92;for(const q of[...B.pl].sort((a,b)=>a.c[1]-b.c[1]))if(q.al){const A=q.an,X=q.c[0]*T,Y=q.c[1]*T,hp=A?A.hop:0,pp=A?A.pp:1,shw=pp*(1-hp*.5);
  c.fillStyle='#0004';c.beginPath();c.ellipse(X,Y+T*.42,T*.3*shw,T*.1*shw,0,0,7);c.fill();if(TMON&&q.p.tm){c.beginPath();c.ellipse(X,Y+T*.42,T*.38,T*.14,0,0,7);c.strokeStyle='#fff';c.lineWidth=T*.13;c.stroke();c.strokeStyle=TC[q.p.tm-1];c.lineWidth=T*.07;c.stroke()}
  if(q.inv>0&&Math.floor(now*14)%2)continue;
  if(pp<.02)continue;
  c.save();c.translate(X,Y+T*.45-hp*T);if(A){c.scale(A.sx*pp,A.sy*pp);c.rotate(A.lean)}c.drawImage(q.spr,14,2,116,158,-58*k,-152*k,116*k,158*k);c.restore();
  if(q.sh){c.strokeStyle=`rgba(120,255,255,${.6+.3*Math.sin(now*8)})`;c.fillStyle='#7ff2';c.lineWidth=T*.06;c.beginPath();c.ellipse(X,Y-T*.2-(q.an?q.an.hop*T:0),T*.5,T*.78,0,0,7);c.fill();c.stroke()}
  }
 for(const g of B.gh){c.save();c.globalAlpha=Math.max(0,Math.min(1,g.t/.35));c.translate(g.x*T,g.y*T+T*.45-73*k);c.rotate(g.rot);const gs=1-(1-g.t/g.L)*.3;c.scale(gs,gs);c.drawImage(g.spr,14,2,116,158,-58*k,-79*k,116*k,158*k);c.restore()}
 for(const q of B.pl)if(q.al&&q.em){const el=2.2-q.em.t,pop=Math.min(1,el*7),k=.6+.4*pop+Math.sin(el*10)*.05*(1-pop),X=Math.max(T,Math.min(W-T,q.c[0]*T));let Y=q.c[1]*T-T*1.75-Math.min(el,.6)*T*.3;if(Y<T*.2)Y=q.c[1]*T+T*1.75;
 c.globalAlpha=Math.min(1,q.em.t*3);c.fillStyle='#0b0820ea';c.strokeStyle=pcol(q.p);c.lineWidth=T*.09;c.beginPath();c.arc(X,Y,T*.98*k,0,7);c.fill();c.stroke();c.fillStyle='#fff';em(q.em.e,X,Y+T*.05,1.45*k);c.globalAlpha=1}
 for(const p of B.pa){c.globalAlpha=Math.max(0,Math.min(1,p.t/p.L*1.6));c.fillStyle=p.c;c.fillRect((p.x-p.s/2)*T,(p.y-p.s/2)*T,p.s*T,p.s*T)}c.globalAlpha=1;
 c.font=`${T*.42}px Bungee,sans-serif`;for(const t of B.tx){c.globalAlpha=Math.min(1,t.t*2);c.fillStyle=t.c;G('#000',T*.15);c.fillText(t.s,t.x*T,t.y*T)}G('transparent',0);c.globalAlpha=1;
 c.restore();c.textAlign='center';c.fillStyle='#ffc83d';G('#ff2d95',T*.3);
 if(B.cd>0){c.font=`${T*5}px Bungee,sans-serif`;c.fillText(Math.ceil(B.cd),W/2,H/2);G('transparent',0);c.font=`700 ${T*.5}px Rajdhani,sans-serif`;c.fillStyle='#f6f3ff';c.fillText('A = 💣 Bombe',W/2,H-T*.6)}
 if(B.bn){c.globalAlpha=Math.min(1,B.bn.t*2);c.font=`${T*1.05}px Bungee,sans-serif`;c.fillStyle='#ffc83d';G('#ff2d95',T*.4);c.fillText(B.bn.s,W/2,oy+T*2.2);c.globalAlpha=1}
 if(B.end!=null){const w=B.pl.find(q=>q.al);c.font=`${T*1.1}px Bungee,sans-serif`;c.fillStyle='#ffc83d';c.fillText(w?'🏆 '+(TMON&&w.p.tm?TN[w.p.tm-1]:w.p.name):'Unentschieden',W/2,H/2)}G('transparent',0)}
