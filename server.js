// 5 10K 联机版服务器（Express + Socket.IO）：node server.js
const express=require('express'),http=require('http'),os=require('os'),{Server}=require('socket.io'),{pt,key,ana,beats,cands,layout}=require('./game.js');
const app=express(),server=http.createServer(app),io=new Server(server);
app.use(express.static(__dirname));
const PORT=process.env.PORT||2567,R={},TN=['红队','蓝队'];
const room=id=>{id=String(id||'').replace(/[^\w\u4e00-\u9fa5]/g,'').slice(0,12)||'main';return R[id]||(R[id]={id,seats:[null,null,null,null],cl:new Set(),S:null,C:[0,0],T:[0,0],DR:0,RN:0,LD:null,tc:[0,0,0,0],tl:{},t:Date.now()})};
const online=(r,t)=>[...r.cl].some(c=>c.data.tok==t),seatOf=(r,t)=>r.seats.findIndex(s=>s&&s.tok==t),isBot=(r,p)=>!r.seats[p]||!online(r,r.seats[p].tok);
const nm=(r,p)=>`${p+1}号位${r.seats[p]?'('+r.seats[p].name+')':'(电脑)'}`;
function view(r,tok){const S=r.S,me=seatOf(r,tok);return{room:r.id,me,tc:r.tc,seats:r.seats.map(s=>s&&{n:s.name,on:online(r,s.tok)}),C:r.C,T:r.T,DR:r.DR,RN:r.RN,
g:S&&{cnt:S.h.map(h=>h.length),hand:me>=0?S.h[me]:[],lc:S.last?S.lastCs:[],turn:S.turn,lastBy:S.lastBy,pts:S.pts,fin:S.fin,tp:S.tp,tr:S.tr,hist:S.hist,cap:S.cap,pl:S.pl,say:S.say,tip:S.tip,busy:S.busy,over:S.over,res:S.res,fo:S.fo}}}
const bc=r=>r.cl.forEach(c=>c.emit('state',view(r,c.data.tok)));
const nextActive=(S,p)=>{for(let i=1;i<5;i++){const q=(p+i)%4;if(S.h[q].length)return q}return -1};
function deal(r){let d=[],id=0;for(let k=0;k<2;k++){for(let s=0;s<4;s++)for(let q=0;q<13;q++)d.push({id:id++,r:q,s});d.push({id:id++,r:13,s:4},{id:id++,r:14,s:4})}
for(let i=107;i>0;i--){const j=Math.random()*(i+1)|0;[d[i],d[j]]=[d[j],d[i]]}
r.RN++;if(r.RN==1)r.tc=[0,0,0,0];r.S={h:[0,1,2,3].map(i=>d.slice(i*27,i*27+27)),turn:r.LD==null?Math.random()*4|0:r.LD,last:null,lastBy:-1,lastCs:[],pts:0,passes:0,fin:[],say:{},tp:[0,0],tr:[],hist:[],cap:[[],[]],pl:[],tip:'第'+r.RN+'把开始',busy:0,over:0,ending:0,wt:0};step(r)}
function step(r){const S=r.S;bc(r);clearTimeout(r.tm);if(!S||S.over||S.busy)return;const p=S.turn;
if(isBot(r,p))r.tm=setTimeout(()=>{if(r.S===S&&S.turn==p&&!S.over&&!S.busy&&isBot(r,p))ai(r,p)},700)}
function play(r,p,cs){const S=r.S;S.h[p]=S.h[p].filter(c=>!cs.includes(c));S.last=ana(cs);S.lastCs=cs;S.lastBy=p;S.say[p]=S.last.t;S.passes=0;S.tip='';S.pts+=cs.reduce((a,c)=>a+pt(c),0);S.tr.push({p,cs});S.pl.push(...cs);
if(S.ending&&p%2!=S.wt)return endTrick(r,p);
if(!S.h[p].length){S.fin.push(p);if(S.fin.includes((p+2)%4)){S.ending=1;S.wt=p%2}}
S.turn=nextActive(S,p);step(r)}
function pass(r,p){const S=r.S;S.say[p]='不要';S.tr.push({p,cs:null});S.tip='';S.passes++;
if(S.passes>=S.h.filter((h,i)=>h.length&&i!=S.lastBy).length)return endTrick(r,S.lastBy);
S.turn=nextActive(S,p);step(r)}
function endTrick(r,w){const S=r.S;S.cap[w%2].push(...S.tr.flatMap(x=>x.cs||[]).filter(pt));S.hist.push({w,pts:S.pts,tr:S.tr});S.tp[w%2]+=S.pts;
S.tip=`${nm(r,w)}收 ${S.pts} 分${S.h[w].length||!S.h[(w+2)%4].length?'':'，'+nm(r,(w+2)%4)+'接风，自由出牌'}`;S.busy=1;bc(r);
setTimeout(()=>{if(r.S!==S)return;S.busy=0;S.pts=0;S.last=null;S.lastCs=[];S.say={};S.tip='';S.tr=[];if(S.ending)return endRound(r);
S.turn=S.h[w].length?w:S.h[(w+2)%4].length?(w+2)%4:nextActive(S,w);step(r)},1200)}
function endRound(r){const S=r.S,W=S.wt,Ls=1-W;
const stuck=S.h.reduce((a,h,i)=>a+(i%2==Ls?h.reduce((x,c)=>x+pt(c),0):0),0),bonus=S.fin[0]%2==W?20:0,add=[...S.tp];add[W]+=bonus;add[Ls]-=bonus+2*stuck;
r.C[0]+=add[0];r.C[1]+=add[1];if(Math.max(...r.C)>=200)r.DR=1;if(r.DR&&r.C[0]!=r.C[1])r.T[r.C[0]<r.C[1]?0:1]++;
S.over=1;S.fo=r.T[0]>=7||r.T[1]>=7?1:0;r.LD=S.fo?null:S.fin[0];
S.res=TN[W]+'先走完。<br>'+[0,1].map(t=>`${TN[t]}：收分 ${S.tp[t]}${t==W?(bonus?' + 头游奖励 '+bonus:''):(bonus?' − 头游奖励 '+bonus:'')+(stuck?' − 闷牌 '+stuck+'×2':'')} = <b>${add[t]}</b>`).join('<br>')+'<br>'+(r.DR?'已开画乌龟，':'')+(S.fo?`${TN[r.T[0]>=7?0:1]}的乌龟画完了，本场结束！`:'');step(r)}
function ai(r,p){const S=r.S,h=S.h[p],L=S.last,g={};h.forEach(c=>(g[c.r]=g[c.r]||[]).push(c));
// 受保护的牌：已成型的五十K和王炸，机器人不会为了出普通牌去拆
const prot=new Set(layout(h).filter(x=>/五十K|王/.test(x.n)).flatMap(x=>x.cs.map(c=>c.id)));
const ok=cands(h).filter(o=>beats(o.k,L)).sort((a,b)=>key(a.k)-key(b.k)),ps=o=>o.cs.reduce((s,c)=>s+pt(c),0);
// 估算：没出现过、比我这手更大的牌有多少（越少越不容易被压）
const un=q=>(q>12?2:8)-S.pl.filter(c=>c.r==q).length-(g[q]||[]).length;
const hiN=o=>{let n=0;if(o.k.t=='单')for(let q=o.k.v+1;q<15;q++)n+=Math.max(0,un(q));else if(o.k.t=='对子'){for(let q=o.k.v+1;q<13;q++)if(un(q)>=2)n+=2;if(o.k.v<13&&un(13)>0&&un(14)>0)n+=2}return n};
const opps=[(p+1)%4,(p+3)%4].filter(q=>S.h[q].length),nearOut=opps.some(q=>S.h[q].length<=4);
const risky=o=>ps(o)>0&&opps.some(q=>S.h[q].length>=o.cs.length)&&hiN(o)>=2;
const pl=ok.filter(o=>!o.k.x&&g[o.cs[0].r].length<3&&!o.cs.some(c=>prot.has(c.id))),np=pl.filter(o=>!ps(o)),sp=ok.filter(o=>o.k.x);
if(!L){// 自由出牌：先清不带分的低价值散牌；分牌尽量单张、挑不容易被压的；最后才动炸弹/五十K
 const o=np[0]||[...pl].sort((a,b)=>(risky(a)-risky(b))||ps(a)-ps(b)||a.k.v-b.k.v)[0];
 if(o){const pr=!ps(o)&&o.cs[0].r<13&&o.cs.length==1&&pl.find(x=>x.k.t=='对子'&&x.cs[0].r==o.cs[0].r);return play(r,p,(pr||o).cs)}
 return play(r,p,sp.length?sp[0].cs:ok[0].cs)}
if(S.lastBy==(p+2)%4)return pass(r,p);// 队友在大，不压
// 压牌：先用不带分的小牌；桌面没分时不浪费大牌
let c=np.find(x=>S.ending||S.pts>0||x.k.v<10||h.length<=8||nearOut);
// 必须带分才能压时：只有出得起、不容易被压回来，或桌面分明显更多时才出，且一次最多送10分
if(!c)c=pl.find(x=>ps(x)>0&&(S.ending||(ps(x)<=10&&(!risky(x)||(S.pts>=20&&ps(x)<=5)))));
if(c)return play(r,p,c.cs);
// 炸弹/五十K：普通炸弹和假五十K桌面分够多才用；真五十K、王炸、6炸以上更要等大分或对手快走完
const q=sp.find(o=>S.ending||(o.k.pw>=5?(S.pts>=25||(nearOut&&S.pts>=10)||h.length<=4):(S.pts>=15||nearOut||h.length<=6)));
if(q)return play(r,p,q.cs);
pass(r,p)}
function act(r,tok,a){const S=r.S,p=seatOf(r,tok);r.t=Date.now();
if(a.t=='sit'){const i=+a.seat;if(p>=0||!(i>=0&&i<4))return;if(r.seats[i]&&online(r,r.seats[i].tok))return;r.seats[i]={tok,name:String(a.name||'玩家').slice(0,8)};return step(r)}
if(p<0)return;
if(a.t=='tomato'){const to=+a.to,now=Date.now();if(!(to>=0&&to<4)||to==p||now-(r.tl[tok]||0)<1500)return;r.tl[tok]=now;r.tc[to]++;bc(r);r.cl.forEach(c=>c.emit('tomato',{from:p,to}));return}
if(a.t=='leave'){r.seats[p]=null;return step(r)}
if(a.t=='start'){if(!S)deal(r);return}
if(a.t=='next'){if(S&&S.over){if(S.fo){r.C=[0,0];r.T=[0,0];r.DR=0;r.RN=0;r.LD=null}deal(r)}return}
if(!S||S.over||S.busy||p!=S.turn)return;
if(a.t=='pass'){if(S.last)pass(r,p);return}
if(a.t=='play'){const ids=a.ids||[],cs=S.h[p].filter(c=>ids.includes(c.id)),k=ana(cs);if(cs.length!=ids.length||!k||!beats(k,S.last))return;play(r,p,cs)}}
io.on('connection',c=>{let r=null;
c.on('join',a=>{r=room(a&&a.room);c.data.tok=String(a&&a.tok||'').slice(0,40);r.cl.add(c);step(r)});
c.on('act',a=>{if(r&&a)try{act(r,c.data.tok,a)}catch(e){console.log(e)}});
c.on('disconnect',()=>{if(r){r.cl.delete(c);step(r)}})});
server.listen(PORT,'0.0.0.0',()=>{console.log('5 10K 联机版已启动，请让玩家在浏览器打开：');console.log('  http://localhost:'+PORT);
Object.values(os.networkInterfaces()).flat().filter(i=>i.family=='IPv4'&&!i.internal).forEach(i=>console.log('  http://'+i.address+':'+PORT))});
setInterval(()=>{for(const k in R)if(!R[k].cl.size&&Date.now()-R[k].t>36e5)delete R[k]},6e5);
