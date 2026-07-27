const scene=document.querySelector('#scene');
const assets=document.querySelector('#assets');
const start=document.querySelector('#start');
const intro=document.querySelector('#intro');
const scanner=document.querySelector('#scanner');
const bar=document.querySelector('#chapterbar');
const title=document.querySelector('#chapter-title');
const kicker=document.querySelector('#chapter-kicker');
const statusEl=document.querySelector('#status');
const interact=document.querySelector('#interact');
const calibration=document.querySelector('#calibration');

const chapters=[
  {key:'版',name:'木版工坊',action:'点亮木版'},
  {key:'印',name:'墨色剧场',action:'开印'},
  {key:'画',name:'年画戏台',action:'拆色 / 合色'},
  {key:'生',name:'当代街区',action:'点亮街区'}
];

let ar=null,current=-1,started=false,huaOpen=false,shengLit=false;

function updateViewportBottom(){
  const vv=window.visualViewport;
  let bottom=12;
  if(vv){
    bottom=Math.max(12, window.innerHeight - vv.height - vv.offsetTop + 10);
  }
  document.documentElement.style.setProperty('--hud-bottom', bottom+'px');
}
updateViewportBottom();
window.addEventListener('resize',updateViewportBottom);
window.visualViewport?.addEventListener('resize',updateViewportBottom);
window.visualViewport?.addEventListener('scroll',updateViewportBottom);

function animateRoot(i){
  const root=document.querySelector('#root'+i);
  root.removeAttribute('animation__scale');
  root.removeAttribute('animation__rise');
  root.setAttribute('scale','0.01 0.01 0.01');
  root.setAttribute('position','0 -0.07 0.01');
  requestAnimationFrame(()=>{
    root.setAttribute('animation__scale','property:scale; from:0.01 0.01 0.01; to:1 1 1; dur:820; easing:easeOutBack');
    root.setAttribute('animation__rise','property:position; from:0 -0.07 0.01; to:0 0 0.035; dur:900; easing:easeOutCubic');
  });
  setTimeout(()=>chapterIntro(i),720);
}

function chapterIntro(i){
  if(i===0){
    const h=document.querySelector('#banHeroWrap');
    h.removeAttribute('animation__hero');
    h.setAttribute('position','0 -0.04 0.07');
    requestAnimationFrame(()=>h.setAttribute('animation__hero','property:position; from:0 -0.04 0.07; to:0 -0.04 0.19; dur:700; easing:easeOutBack'));
    const g=document.querySelector('#banGlow');
    g.setAttribute('animation__spin','property:rotation; to:0 0 360; dur:7000; loop:true; easing:linear');
  }
  if(i===1){runPrint();}
  if(i===2){setHua(true);setTimeout(()=>setHua(false),1700);}
  if(i===3){floatSigns();}
}

function runPrint(){
  const r=document.querySelector('#rollerWrap');
  const p=document.querySelector('#printWrap');
  r.removeAttribute('animation__move');
  p.removeAttribute('animation__show');
  r.setAttribute('position','-0.29 0.10 0.25');
  p.setAttribute('scale','0.01 0.01 0.01');
  requestAnimationFrame(()=>{
    r.setAttribute('animation__move','property:position; from:-0.29 0.10 0.25; to:0.29 -0.14 0.25; dur:1450; easing:easeInOutCubic');
    p.setAttribute('animation__show','property:scale; from:0.01 0.01 0.01; to:1 1 1; delay:500; dur:900; easing:easeOutCubic');
  });
}

function setHua(open){
  huaOpen=open;
  const ids=['wingR','wingG','wingB','wingI'];
  const openPos=[[-0.26,0.02,0.18],[-0.09,0.08,0.23],[0.09,0.08,0.28],[0.26,0.02,0.33]];
  const closed=[[-0.14,-0.02,0.16],[-0.05,0.00,0.19],[0.05,0.00,0.22],[0.14,-0.02,0.25]];
  ids.forEach((id,j)=>{
    const el=document.querySelector('#'+id);
    const p=(open?openPos:closed)[j];
    el.setAttribute('animation__spread',`property:position; to:${p[0]} ${p[1]} ${p[2]}; dur:650; easing:easeOutCubic`);
  });
}

function floatSigns(){
  [['sign0',-0.26,0.08,0.43],['sign1',0.26,0.08,0.40],['sign2',0,0.23,0.54]].forEach((x,i)=>{
    const el=document.querySelector('#'+x[0]);
    el.setAttribute('animation__float',`property:position; from:${x[1]} ${x[2]} ${x[3]}; to:${x[1]} ${x[2]+0.045} ${x[3]+0.025}; dur:${1400+i*260}; dir:alternate; loop:true; easing:easeInOutSine`);
  });
}

function showChapter(i){
  current=i;
  title.textContent=`${chapters[i].key} · ${chapters[i].name}`;
  kicker.textContent=`AR CHAPTER 0${i+1}`;
  interact.textContent=chapters[i].action;
  bar.classList.remove('hidden');
  scanner.classList.add('hidden');
  statusEl.textContent='已识别 '+chapters[i].key;
  animateRoot(i);
  if(calibrationEnabled) renderCalibration(i);
}
function hideChapter(i){
  if(current===i){
    bar.classList.add('hidden');
    scanner.classList.remove('hidden');
    statusEl.textContent='寻找识别卡';
  }
}

assets.addEventListener('loaded',()=>{
  statusEl.textContent='场景已加载';
  if(scene.hasLoaded){
    ar=scene.systems['mindar-image-system'];
    start.disabled=false;
    start.textContent='开启 AR';
  }
});
scene.addEventListener('loaded',()=>{
  ar=scene.systems['mindar-image-system'];
  if(assets.hasLoaded){
    start.disabled=false;
    start.textContent='开启 AR';
  }
});

start.addEventListener('click',async()=>{
  try{
    start.disabled=true;
    start.textContent='正在启动摄像头…';
    await ar.start();
    started=true;
    intro.classList.add('hidden');
    scanner.classList.remove('hidden');
    statusEl.textContent='寻找识别卡';
  }catch(err){
    start.disabled=false;
    start.textContent='重新开启 AR';
    statusEl.textContent='摄像头启动失败';
    console.error(err);
  }
});

[0,1,2,3].forEach(i=>{
  const t=document.querySelector('#target'+i);
  t.addEventListener('targetFound',()=>showChapter(i));
  t.addEventListener('targetLost',()=>hideChapter(i));
});

document.querySelector('#replay').addEventListener('click',()=>{if(current>=0)animateRoot(current)});
interact.addEventListener('click',()=>{
  if(current===0){
    const h=document.querySelector('#banHeroWrap');
    h.setAttribute('animation__tap','property:rotation; from:0 -8 0; to:0 8 0; dur:700; dir:alternate; loop:2; easing:easeInOutSine');
  }else if(current===1){
    runPrint();
  }else if(current===2){
    setHua(!huaOpen);
  }else if(current===3){
    shengLit=!shengLit;
    ['sign0','sign1','sign2'].forEach((id,j)=>{
      const el=document.querySelector('#'+id);
      el.setAttribute('animation__pulse',`property:scale; from:1 1 1; to:${shengLit?1.18:1} ${shengLit?1.18:1} ${shengLit?1.18:1}; dur:500; easing:easeOutBack`);
    });
  }
});

// Calibration mode: add ?calibrate=1 to URL
const calibrationEnabled=new URLSearchParams(location.search).get('calibrate')==='1';
const defaults=[
 {x:0,y:0,z:0.035,s:1,rx:0},
 {x:0,y:0,z:0.035,s:1,rx:0},
 {x:0,y:0,z:0.035,s:1,rx:0},
 {x:0,y:0,z:0.035,s:1,rx:0},
];
const saved=JSON.parse(localStorage.getItem('banxing-calibration')||'null')||defaults;

function applyCal(i){
  const root=document.querySelector('#root'+i);
  const v=saved[i];
  root.setAttribute('position',`${v.x} ${v.y} ${v.z}`);
  root.setAttribute('scale',`${v.s} ${v.s} ${v.s}`);
  root.setAttribute('rotation',`${v.rx} 0 0`);
}
[0,1,2,3].forEach(applyCal);

function renderCalibration(i){
  calibration.classList.remove('hidden');
  const v=saved[i];
  calibration.innerHTML=`<b>校准：${chapters[i].key}</b>
  ${slider('x','左右',v.x,-0.25,0.25,0.005)}
  ${slider('y','上下',v.y,-0.25,0.25,0.005)}
  ${slider('z','离卡',v.z,0.0,0.35,0.005)}
  ${slider('s','缩放',v.s,0.5,1.5,0.01)}
  ${slider('rx','倾角',v.rx,-35,35,1)}
  <div class="cal-actions"><button id="calSave">保存</button><button id="calCopy">复制参数</button><button id="calClose">关闭</button></div>`;
  ['x','y','z','s','rx'].forEach(k=>{
    document.querySelector('#cal-'+k).addEventListener('input',e=>{
      saved[i][k]=Number(e.target.value);
      document.querySelector('#val-'+k).textContent=e.target.value;
      applyCal(i);
    });
  });
  document.querySelector('#calSave').onclick=()=>localStorage.setItem('banxing-calibration',JSON.stringify(saved));
  document.querySelector('#calCopy').onclick=async()=>navigator.clipboard?.writeText(JSON.stringify(saved[i]));
  document.querySelector('#calClose').onclick=()=>calibration.classList.add('hidden');
}
function slider(k,label,val,min,max,step){
 return `<div class="cal-row"><label>${label}</label><input id="cal-${k}" type="range" min="${min}" max="${max}" step="${step}" value="${val}"><span id="val-${k}">${val}</span></div>`;
}
