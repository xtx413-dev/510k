// 5 10K 共用牌规则（服务器和浏览器都用）
(function(e){
const N=['4','5','6','7','8','9','10','J','Q','K','A','2','3','小王','大王'],SU=['♠','♥','♣','♦'];
const pt=c=>c.r==1?5:c.r==6||c.r==9?10:0,key=k=>k.x?100+k.pw*20+k.v:k.v;
function ana(cs){const n=cs.length,rs=cs.map(c=>c.r),jk=cs.filter(c=>c.r>12);if(!n)return null;
if(n==1)return{t:'单',x:0,v:rs[0]};
if(n==2){if(rs[0]==rs[1])return rs[0]>12?{t:rs[0]==13?'双小王':'双大王',x:1,pw:rs[0]==13?5:13,v:0}:{t:'对子',x:0,v:rs[0]};return jk.length==2?{t:'对子',x:0,v:13}:null}
if(jk.length||n>8)return null;
if(n==3&&new Set(rs).size==3&&[1,6,9].every(r=>rs.includes(r))){const re=cs.every(c=>c.s==cs[0].s);return re?{t:'真五十K'+SU[cs[0].s],x:1,pw:9-cs[0].s,v:0}:{t:'假五十K',x:1,pw:3,v:0}}
return rs.every(r=>r==rs[0])?{t:n+'炸',x:1,pw:[0,0,0,1,2,4,10,11,12][n],v:rs[0]}:null}
function beats(a,b){if(!b)return true;if(a.x)return!b.x||a.pw>b.pw||(a.pw==b.pw&&a.v>b.v);return!b.x&&a.t==b.t&&a.v>b.v}
function cands(h){const g={},o=[];h.forEach(c=>(g[c.r]=g[c.r]||[]).push(c));
for(const r in g){const a=g[r];o.push([a[0]]);if(r<13){if(a.length>1)o.push(a.slice(0,2));for(let n=3;n<=a.length;n++)o.push(a.slice(0,n))}}
if(g[13]&&g[14])o.push([g[13][0],g[14][0]]);
[13,14].forEach(r=>g[r]&&g[r].length>1&&o.push(g[r].slice(0,2)));
for(const a of g[1]||[])for(const b of g[6]||[])for(const c of g[9]||[])o.push([a,b,c]);
return o.map(cs=>({cs,k:ana(cs)})).filter(x=>x.k)}
function layout(h){const g={},B=[],J=[],Rr=[],Ff=[],u=new Set();h.forEach(c=>(g[c.r]=g[c.r]||[]).push(c));
const mark=a=>a.forEach(c=>u.add(c.id)),pk=(r,s)=>h.find(c=>!u.has(c.id)&&c.r==r&&(s==null||c.s==s));
[14,13].forEach(r=>{if(g[r]&&g[r].length>1){const a=g[r].slice(0,2);J.push({n:r>13?'双大王':'双小王',cs:a});mark(a)}});
const bombs=m=>{const q={};h.filter(c=>!u.has(c.id)&&c.r<13).forEach(c=>(q[c.r]=q[c.r]||[]).push(c));Object.keys(q).filter(r=>q[r].length>=m).forEach(r=>{B.push({n:q[r].length+'炸',cs:q[r]});mark(q[r])})};
bombs(5);
for(let s=0;s<4;s++)for(let a,b,c;(a=pk(1,s))&&(b=pk(6,s))&&(c=pk(9,s));){Rr.push({n:'真五十K'+SU[s],cs:[a,b,c]});mark([a,b,c])}
for(let a,b,c;(a=pk(1))&&(b=pk(6))&&(c=pk(9));){Ff.push({n:'假五十K',cs:[a,b,c]});mark([a,b,c])}
bombs(3);B.sort((x,y)=>y.cs.length-x.cs.length||y.cs[0].r-x.cs[0].r);
return[...J,...Rr,...Ff,...B,{n:'',cs:h.filter(c=>!u.has(c.id)).sort((a,b)=>b.r-a.r||a.s-b.s)}]}
Object.assign(e,{N,SU,pt,key,ana,beats,cands,layout});
})(typeof module!='undefined'?module.exports:window);
