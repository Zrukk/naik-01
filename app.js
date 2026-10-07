// Logika aplikasi.
var LV=["Ringan","Sedang","Menantang"],KEY="naik01",S=null,msg="";
try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){S=null}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function key(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function today(){return key(new Date())}
function count(){return Object.keys(S.days).length}
function streak(){var d=new Date(),n=0;if(!S.days[key(d)])d.setDate(d.getDate()-1);while(S.days[key(d)]){n++;d.setDate(d.getDate()-1)}return n}
function newTask(){
  var list=T[S.area].t[S.level],i,last=S.cur?S.cur.i:-1,tries=0;
  do{i=Math.floor(Math.random()*list.length);tries++}while(i===last&&tries<20);
  S.cur={d:today(),i:i,l:S.level};save();
}
function start(a){S={area:a,level:0,days:{},cur:null,run:0};newTask();msg="";render()}
function finish(){
  if(S.days[today()])return;
  S.days[today()]=1;S.run=(S.run||0)+1;msg="";
  if(S.run>=3&&S.level<2){S.level++;S.run=0;msg="Tiga hari berturut-turut. Besok tugasmu naik ke level "+LV[S.level]+"."}
  save();render();
}
function swap(){if(S.days[today()])return;S.level=S.cur.l;newTask();msg="";render()}
function hard(){
  if(S.days[today()])return;
  var prev=S.cur.l;
  S.level=Math.max(0,prev-1);S.run=0;newTask();
  msg=prev===0?"Sudah level paling ringan. Mulai dari yang kecil, itu cukup.":"Tugas diturunkan ke level "+LV[S.level]+".";
  render();
}
function pick(){if(confirm("Ganti bidang? Progresmu tetap tersimpan."))
  {var o=S;S=null;window._old=o;render()}}
function back(a){S=window._old;S.area=a;S.level=0;S.run=0;newTask();msg="";render()}
function reset(){if(confirm("Hapus semua progres dan mulai dari awal?")){S=null;window._old=null;try{localStorage.removeItem(KEY)}catch(e){}render()}}
function render(){
  var el=document.getElementById("app"),h="";
  if(!S){
    var fn=window._old?"back":"start";
    h='<p class="lbl">Naik 0,1% setiap hari</p><h1 class="big" style="font-size:2.4rem;line-height:1.1">Pilih satu bidang untuk diperbaiki dulu.</h1><div class="opts">';
    for(var k in T)h+='<button onclick="'+fn+"('"+k+"')\">"+T[k].n+"<small>"+T[k].d+"</small></button>";
    h+='</div><p class="note">Satu tugas kecil per hari. Hasilnya tersimpan di perangkat ini.</p>';
    el.innerHTML=h;return;
  }
  if(!S.cur||S.cur.d!==today()){newTask()}
  var c=count(),score=100*Math.pow(1.001,c),done=!!S.days[today()],task=T[S.area].t[S.cur.l][S.cur.i];
  h='<p class="lbl">Nilai kamu</p><div class="big">'+score.toFixed(2).replace(".",",")+'</div>'
   +'<p class="sub">Mulai dari 100. Tiap hari selesai dikali 1,001. Sudah '+c+' hari.</p>';
  h+='<section class="card"><span class="tag">'+T[S.area].n+', level '+LV[S.cur.l]+'</span>';
  if(done){
    h+='<h2>'+task+'</h2><p class="done">Selesai. Sampai besok.</p><p class="sub">Tugas baru muncul besok.</p>';
  }else{
    h+='<h2>'+task+'</h2><div class="row"><button class="p" onclick="finish()">Sudah kukerjakan</button><button onclick="swap()">Ganti tugas</button></div>'
     +'<div style="margin-top:10px"><button class="link" onclick="hard()">Terlalu sulit hari ini</button></div>';
  }
  h+='</section><div class="msg" role="status">'+msg+'</div>';
  h+='<div class="stats"><div><b>'+streak()+'</b><span class="lbl">hari beruntun</span></div><div><b>'+LV[S.level]+'</b><span class="lbl">level sekarang</span></div></div>';
  h+='<p class="lbl" style="margin-top:28px">14 hari terakhir</p><div class="grid">';
  for(var i=13;i>=0;i--){var d=new Date();d.setDate(d.getDate()-i);h+='<i class="'+(S.days[key(d)]?"on":"")+(i===0?" today":"")+'"></i>'}
  h+='</div><div class="foot"><button class="link" onclick="pick()">Ganti bidang</button><button class="link" onclick="reset()">Mulai dari awal</button></div>';
  el.innerHTML=h;
}
render();

// Daftarkan service worker supaya aplikasi bisa di-install dan jalan offline.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  });
  }
                         
