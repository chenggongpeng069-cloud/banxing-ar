const chapters=[
 {key:"版",title:"木刻觉醒",copy:"木版从纸面抬升，刻痕与浮雕结构被重新照亮。",action:"查看刀痕"},
 {key:"印",title:"墨生万象",copy:"3D滚轮越过卡面，墨层随轨迹显影。",action:"再印一次"},
 {key:"画",title:"四色成画",copy:"综合色层从同一画面拆开，再重新合版。",action:"拆版 / 合版"},
 {key:"生",title:"进入生活",copy:"年画进入微型文创展台，成为可使用、可展示的当代产品。",action:"旋转展台"}
];
const targetIds=["t0","t1","t2","t3"];
const dots=[...document.querySelectorAll("#progress span")];
const scene=document.querySelector("#ar-scene");
const intro=document.querySelector("#intro");
const enter=document.querySelector("#enter");
const scanner=document.querySelector("#scanner");
const story=document.querySelector("#story");
const chapter=document.querySelector("#chapter");
const storyTitle=document.querySelector("#story-title");
const storyCopy=document.querySelector("#story-copy");
const action=document.querySelector("#action");
const errorScreen=document.querySelector("#error-screen");
const errorCopy=document.querySelector("#error-copy");
let arSystem=null,current=-1,started=false,huaOpen=false,minimized=false;

function replay(i){
 if(i===0){document.querySelector("#ban3d")?.emit("replay0")}
 if(i===1){document.querySelector("#roller3d")?.emit("replay1");document.querySelector("#inkReveal")?.emit("replay1")}
 if(i===2){setHua(true);setTimeout(()=>setHua(false),1800)}
}
function setHua(open){
 huaOpen=open;
 const cfg=open?[
  [-.18,.18,.17,-7],[-.06,.06,.25,-2],[.06,-.06,.33,3],[.18,-.18,.41,8]
 ]:[[0,0,.08,0],[0,0,.10,0],[0,0,.12,0],[0,0,.14,0]];
 ["h0","h1","h2","h3"].forEach((id,j)=>{
   const el=document.querySelector("#"+id);
   el.setAttribute("animation__move",`property:position; to:${cfg[j][0]} ${cfg[j][1]} ${cfg[j][2]}; dur:650; easing:easeOutCubic`);
   el.setAttribute("animation__rot",`property:rotation; to:0 0 ${cfg[j][3]}; dur:650; easing:easeOutCubic`);
 });
}
function showStory(i){
 current=i;dots[i].classList.add("done");
 chapter.textContent=`AR CHAPTER ${String(i+1).padStart(2,"0")} · ${chapters[i].key}`;
 storyTitle.textContent=chapters[i].title;storyCopy.textContent=chapters[i].copy;action.textContent=chapters[i].action;
 scanner.classList.add("hidden");story.classList.remove("hidden");story.classList.remove("min");
 replay(i);
}
function hideStory(i){if(current===i){story.classList.add("hidden");scanner.classList.remove("hidden")}}
scene.addEventListener("loaded",()=>{arSystem=scene.systems["mindar-image-system"];enter.disabled=false;enter.textContent="开启 AR"});
scene.addEventListener("arError",()=>{errorCopy.textContent="AR初始化失败，请检查摄像头权限、HTTPS以及targets.mind。";errorScreen.classList.remove("hidden")});
targetIds.forEach((id,i)=>{const t=document.querySelector("#"+id);t.addEventListener("targetFound",()=>showStory(i));t.addEventListener("targetLost",()=>hideStory(i))});
enter.addEventListener("click",async()=>{try{enter.disabled=true;await arSystem.start();started=true;intro.classList.add("hidden");scanner.classList.remove("hidden")}catch(e){enter.disabled=false;errorCopy.textContent="摄像头启动失败，请允许浏览器摄像头权限。";errorScreen.classList.remove("hidden")}});
document.querySelector("#retry").addEventListener("click",async()=>{errorScreen.classList.add("hidden");if(arSystem&&started){arSystem.stop();started=false}enter.disabled=false;enter.click()});
document.querySelector("#replay").addEventListener("click",()=>{if(current>=0)replay(current)});
action.addEventListener("click",()=>{
 if(current===0) replay(0);
 if(current===1) replay(1);
 if(current===2) setHua(!huaOpen);
 if(current===3){
   const s=document.querySelector("#stage3d");
   s.setAttribute("animation__spin","property:rotation; from:0 -18 0; to:0 342 0; dur:2600; easing:easeInOutCubic");
 }
});
document.querySelector("#minimize").addEventListener("click",()=>{
 minimized=!minimized;
 storyCopy.style.display=minimized?"none":"";
 document.querySelector(".btns").style.display=minimized?"none":"";
 document.querySelector("#minimize").textContent=minimized?"+":"－";
});
