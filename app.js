
const chapters = [
  {
    key: "版",
    title: "一块版",
    copy: "图像先藏在木头与刻痕之中。识别后，木版从平面抬升，刻痕层被数字光线重新唤醒。",
    detail: "“版”强调图像的物质起点：木纹、刀痕与版面结构。AR内容采用轻量几何体表现厚度和光层，减少移动端加载压力。"
  },
  {
    key: "印",
    title: "一层墨",
    copy: "墨色经过版面，图像第一次从木头来到纸上。",
    detail: "“印”用滚动与墨层显影表现版、墨、纸、图之间的关系。重点是视觉理解，而不是操作教学。"
  },
  {
    key: "画",
    title: "一幅画",
    copy: "综合色彩并不是一次出现，而由多个视觉层逐步建立。",
    detail: "“画”把综合色层拆成空间中的四个悬浮层。扫描后依次展开，让观众直观看到分层与合成关系。"
  },
  {
    key: "生",
    title: "一个世界",
    copy: "当年画进入产品、空间、活动与分享，它开始参与今天的生活。",
    detail: "“生”把技艺认知转向当代应用，以微型数字展陈和文创舞台表达展馆、课堂、文创店与巡展等真实场景。"
  }
];

const targetIds = ["t0","t1","t2","t3"];
const dots = [...document.querySelectorAll("#progress span")];

const intro = document.querySelector("#intro");
const enterButton = document.querySelector("#enter");
const scanner = document.querySelector("#scanner");
const story = document.querySelector("#story");
const chapter = document.querySelector("#chapter");
const storyTitle = document.querySelector("#story-title");
const storyCopy = document.querySelector("#story-copy");

const modal = document.querySelector("#modal");
const modalKicker = document.querySelector("#modal-kicker");
const modalTitle = document.querySelector("#modal-title");
const modalCopy = document.querySelector("#modal-copy");

const errorScreen = document.querySelector("#error-screen");
const errorCopy = document.querySelector("#error-copy");

const scene = document.querySelector("#ar-scene");

let arSystem = null;
let current = -1;
let started = false;

function setStory(index) {
  current = index;
  dots[index].classList.add("done");

  chapter.textContent = `AR CHAPTER ${String(index + 1).padStart(2, "0")} · ${chapters[index].key}`;
  storyTitle.textContent = chapters[index].title;
  storyCopy.textContent = chapters[index].copy;

  story.classList.remove("hidden");
  scanner.classList.add("hidden");

  replay(index);
}

function clearStory(index) {
  if (current === index) {
    story.classList.add("hidden");
    scanner.classList.remove("hidden");
  }
}

function replay(index) {
  if (index === 0) {
    document.querySelector("#ban-block")?.emit("replay0");
  }

  if (index === 1) {
    document.querySelector("#roller")?.emit("replay1");
    document.querySelector("#ink-sheet")?.emit("replay1");
  }

  if (index === 2) {
    ["c0","c1","c2","c3"].forEach((id) => {
      document.querySelector(`#${id}`)?.emit("replay2");
    });
  }
}

async function startAR() {
  if (!arSystem || started) return;

  try {
    enterButton.disabled = true;
    enterButton.textContent = "正在启动摄像头…";
    errorScreen.classList.add("hidden");

    await arSystem.start();
    started = true;

    intro.classList.add("hidden");
    scanner.classList.remove("hidden");
  } catch (error) {
    enterButton.disabled = false;
    enterButton.textContent = "开启 AR";

    errorCopy.textContent = "AR 启动失败。请确认摄像头权限、HTTPS/localhost 环境，以及 tracking/targets.mind 是否存在。";
    errorScreen.classList.remove("hidden");

    console.error(error);
  }
}

scene.addEventListener("loaded", () => {
  arSystem = scene.systems["mindar-image-system"];

  enterButton.disabled = false;
  enterButton.textContent = "开启 AR";
});

scene.addEventListener("arReady", () => {
  intro.classList.add("hidden");
  scanner.classList.remove("hidden");
});

scene.addEventListener("arError", () => {
  errorCopy.textContent = "MindAR 初始化失败。请确认浏览器允许摄像头访问，并检查 targets.mind 与识别图是否匹配。";
  errorScreen.classList.remove("hidden");
});

targetIds.forEach((id, index) => {
  const target = document.querySelector(`#${id}`);

  target.addEventListener("targetFound", () => setStory(index));
  target.addEventListener("targetLost", () => clearStory(index));
});

enterButton.addEventListener("click", startAR);

document.querySelector("#retry").addEventListener("click", async () => {
  errorScreen.classList.add("hidden");

  if (arSystem && started) {
    arSystem.stop();
    started = false;
  }

  await startAR();
});

document.querySelector("#replay").addEventListener("click", () => {
  if (current >= 0) replay(current);
});

document.querySelector("#more").addEventListener("click", () => {
  if (current < 0) return;

  modalKicker.textContent = `${chapters[current].key} · AR CONTENT`;
  modalTitle.textContent = chapters[current].title;
  modalCopy.textContent = chapters[current].detail;

  modal.classList.remove("hidden");
});

document.querySelector("#close").addEventListener("click", () => {
  modal.classList.add("hidden");
});
