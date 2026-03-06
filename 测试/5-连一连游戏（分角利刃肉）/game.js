'use strict';

// ────── 游戏数据 ──────
const BASE_ITEMS = [
    { id: "item1", topImg: "./img/fen_2.png", bottomImg: "./img/fen_1.png", alt: "分", color: "#ff6b6b" },
    { id: "item2", topImg: "./img/jiao_2.png", bottomImg: "./img/jiao_1.png", alt: "角", color: "#4d96ff" },
    { id: "item3", topImg: "./img/li_2.png", bottomImg: "./img/li_1.png", alt: "利", color: "#6bcb77" },
    { id: "item4", topImg: "./img/ren_2.png", bottomImg: "./img/ren_1.png", alt: "刃", color: "#ffd93d" },
    { id: "item5", topImg: "./img/rou_2.png", bottomImg: "./img/rou_1.png", alt: "肉", color: "#a78bfa" }
];

const LAYOUTS = [
    [
        { startX: 120, endX: 480, path: "M 120 150 C 120 400, 600 300, 500 500 C 400 700, 120 600, 250 750 C 300 850, 480 750, 480 850" },
        { startX: 260, endX: 120, path: "M 260 150 C 260 350, 80 250, 180 450 C 280 650, 650 550, 500 750 C 400 850, 120 750, 120 850" },
        { startX: 400, endX: 680, path: "M 400 150 C 400 350, 800 300, 680 550 C 560 800, 200 650, 350 750 C 450 850, 680 750, 680 850" },
        { startX: 540, endX: 260, path: "M 540 150 C 540 450, 280 350, 380 550 C 480 750, 800 650, 600 800 C 500 850, 260 800, 260 850" },
        { startX: 680, endX: 400, path: "M 680 150 C 680 400, 200 400, 300 550 C 400 700, 700 600, 550 750 C 450 850, 400 750, 400 850" }
    ],
    [
        { startX: 120, endX: 680, path: "M 120 150 C 120 400, 750 350, 650 550 C 550 750, 200 650, 400 750 C 550 850, 680 750, 680 850" },
        { startX: 260, endX: 260, path: "M 260 150 C 260 450, 80 300, 200 500 C 350 700, 750 600, 550 750 C 400 850, 260 750, 260 850" },
        { startX: 400, endX: 120, path: "M 400 150 C 400 350, 180 300, 280 550 C 380 800, 600 650, 450 750 C 300 850, 120 750, 120 850" },
        { startX: 540, endX: 540, path: "M 540 150 C 540 400, 350 450, 450 600 C 550 750, 100 700, 250 800 C 350 850, 540 750, 540 850" },
        { startX: 680, endX: 400, path: "M 680 150 C 680 450, 300 350, 400 550 C 500 750, 800 650, 600 800 C 500 850, 400 800, 400 850" }
    ],
    [
        { startX: 120, endX: 260, path: "M 120 150 C 120 350, 480 250, 380 450 C 280 650, 700 600, 550 750 C 400 850, 260 750, 260 850" },
        { startX: 260, endX: 680, path: "M 260 150 C 260 400, 80 350, 180 550 C 280 750, 400 600, 500 700 C 600 800, 680 750, 680 850" },
        { startX: 400, endX: 400, path: "M 400 150 C 400 450, 800 350, 680 550 C 560 750, 150 650, 300 750 C 400 850, 400 750, 400 850" },
        { startX: 540, endX: 120, path: "M 540 150 C 540 350, 280 300, 380 500 C 480 700, 80 600, 180 750 C 230 850, 120 750, 120 850" },
        { startX: 680, endX: 540, path: "M 680 150 C 680 400, 350 450, 450 600 C 550 750, 200 650, 350 750 C 450 850, 540 750, 540 850" }
    ],
    [
        { startX: 120, endX: 120, path: "M 120 150 C 120 450, 480 300, 380 500 C 280 700, 600 650, 450 750 C 300 850, 120 750, 120 850" },
        { startX: 260, endX: 540, path: "M 260 150 C 260 350, 80 300, 200 550 C 350 800, 750 600, 600 750 C 500 850, 540 750, 540 850" },
        { startX: 400, endX: 680, path: "M 400 150 C 400 400, 180 350, 330 550 C 480 750, 800 650, 680 750 C 580 850, 680 750, 680 850" },
        { startX: 540, endX: 260, path: "M 540 150 C 540 350, 800 450, 600 600 C 400 750, 120 650, 220 750 C 280 850, 260 750, 260 850" },
        { startX: 680, endX: 400, path: "M 680 150 C 680 450, 300 350, 400 550 C 500 750, 150 650, 300 750 C 380 850, 400 750, 400 850" }
    ]
];

// ────── 常量 ──────
const VIEWBOX_W = 800;
const VIEWBOX_H = 1000;
const SVG_NS = "http://www.w3.org/2000/svg";
const NUM_SAMPLES = 300;        // 每条路径的采样点数
const WIN_BACK = 10;            // 向后搜索窗口（允许少量回退）
const WIN_FWD = 20;             // 向前搜索窗口，限速：每次最多推进 20/300 ≈ 6.7%
const MAX_DEV_SQ = 100 * 100;  // 手指离路径超过 100 SVG 单位则冻结进度
const END_DIST_SQ = 90 * 90;   // 距终点 90 SVG 单位内触发完成
const MIN_PROGRESS = 0.75;      // 至少走完 75% 才允许触发终点检测

// ────── 游戏状态 ──────
let layoutIndex = Math.floor(Math.random() * LAYOUTS.length);
let solvedIds = new Set();
let sampledPaths = {};  // itemId -> { points: [{x, y, len}], totalLength }

// 当前拖拽状态（null 表示无拖拽）
// { item, floatingEl, trailEl, progress: Number, pointerId: Number }
let drag = null;

// 暂停在路径中途的头像（松手后保留原位）
// paused[itemId] = { floatingEl, trailEl, progress }
let paused = {};

const refs = {
    topRow: null,
    bottomRow: null,
    pathLayer: null,
    gameStage: null,
    statusMsg: null,
    progressMsg: null,
    rulesPanel: null,
    winOverlay: null
};

// ────── 工具函数 ──────

function getGameData() {
    return BASE_ITEMS.map((item, i) => ({ ...item, ...LAYOUTS[layoutIndex][i] }));
}

/**
 * 把一条 SVG 路径字符串采样为等间隔点数组。
 * 路径元素需临时挂入 DOM 才能调用 getTotalLength()。
 */
function samplePath(pathD) {
    const el = document.createElementNS(SVG_NS, "path");
    el.setAttribute("d", pathD);
    refs.pathLayer.appendChild(el);
    const totalLength = el.getTotalLength();
    const points = [];
    for (let i = 0; i <= NUM_SAMPLES; i++) {
        const len = (i / NUM_SAMPLES) * totalLength;
        const p = el.getPointAtLength(len);
        points.push({ x: p.x, y: p.y, len });
    }
    refs.pathLayer.removeChild(el);
    return { points, totalLength };
}

/** 将屏幕坐标转换为 SVG viewBox 坐标 */
function clientToSvg(cx, cy) {
    const r = refs.pathLayer.getBoundingClientRect();
    return {
        x: ((cx - r.left) / r.width) * VIEWBOX_W,
        y: ((cy - r.top) / r.height) * VIEWBOX_H
    };
}

/**
 * 在采样点数组的窗口内找离 (sx,sy) 最近的索引。
 * 如果最近点距离超过 MAX_DEV_SQ，则返回 curIdx （冻结）。
 * 这样用户无法拖着头像走直线，必须跟着弯路生走。
 */
function findBestPoint(points, sx, sy, curIdx) {
    const lo = Math.max(0, curIdx - WIN_BACK);
    const hi = Math.min(points.length - 1, curIdx + WIN_FWD);
    let best = curIdx;
    let bestD = Infinity;
    for (let i = lo; i <= hi; i++) {
        const dx = points[i].x - sx;
        const dy = points[i].y - sy;
        const d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = i; }
    }
    // 手指偶离路径超过阈値，冻结在当前位置
    if (bestD > MAX_DEV_SQ) return curIdx;
    return best;
}

function setStatus(text, tone = "normal") {
    refs.statusMsg.textContent = text;
    refs.statusMsg.className = "status-msg"
        + (tone === "error" ? " error" : tone === "success" ? " success" : "");
}

function updateProgress() {
    refs.progressMsg.textContent = `已完成 ${solvedIds.size}/${BASE_ITEMS.length}`;
}

// ────── 构建 DOM ──────

function buildPaths() {
    refs.pathLayer.innerHTML = "";
    sampledPaths = {};
    const data = getGameData();

    data.forEach(item => {
        // 阴影层 & 底色层
        const shadow = document.createElementNS(SVG_NS, "path");
        shadow.setAttribute("d", item.path);
        shadow.setAttribute("class", "path-shadow");
        refs.pathLayer.appendChild(shadow);

        const base = document.createElementNS(SVG_NS, "path");
        base.setAttribute("d", item.path);
        base.setAttribute("class", "path-base");
        refs.pathLayer.appendChild(base);

        // 已完成项直接渲染完整彩色路径
        if (solvedIds.has(item.id)) {
            const solved = document.createElementNS(SVG_NS, "path");
            solved.setAttribute("d", item.path);
            solved.setAttribute("class", "path-solved");
            solved.setAttribute("stroke", item.color);
            refs.pathLayer.appendChild(solved);
        }

        // 采样路径数据，供后续拖拽贴合使用
        sampledPaths[item.id] = samplePath(item.path);
    });
}

function buildButtons() {
    refs.topRow.innerHTML = "";
    refs.bottomRow.innerHTML = "";
    const data = getGameData();

    data.forEach(item => {
        // 上方图标按钮（可拖动起点）
        const topBtn = document.createElement("button");
        topBtn.type = "button";
        topBtn.className = "pick-btn top-btn";
        topBtn.dataset.id = item.id;
        topBtn.innerHTML = `<img class="pick-asset pick-asset-top" src="${item.topImg}" alt="${item.alt}">`;
        topBtn.style.left = `${(item.startX / VIEWBOX_W) * 100}%`;
        if (solvedIds.has(item.id)) topBtn.classList.add("solved");
        topBtn.addEventListener("pointerdown", e => onTopPointerDown(e, item));
        refs.topRow.appendChild(topBtn);

        // 下方文字按钮（目标，仅展示）
        const botBtn = document.createElement("button");
        botBtn.type = "button";
        botBtn.className = "pick-btn bottom-btn";
        botBtn.dataset.id = item.id;
        botBtn.innerHTML = `<img class="pick-asset pick-asset-bottom" src="${item.bottomImg}" alt="${item.alt}">`;
        botBtn.style.left = `${(item.endX / VIEWBOX_W) * 100}%`;
        if (solvedIds.has(item.id)) botBtn.classList.add("solved");
        refs.bottomRow.appendChild(botBtn);
    });
}

// ────── 拖拽核心 ──────

/** 把一个浮动头像元素绑定为「暂停继续」入口 */
function attachResumeListener(floatingEl, item) {
    floatingEl.onpointerdown = (e) => {
        if (solvedIds.has(item.id) || drag) return;
        e.preventDefault();
        e.stopPropagation();
        resumePaused(e, item);
    };
}

/** 从暂停状态恢复拖拽 */
function resumePaused(e, item) {
    const state = paused[item.id];
    if (!state) return;

    const { floatingEl, trailEl, progress } = state;
    delete paused[item.id];

    floatingEl.onpointerdown = null; // 移除恢复监听，避免重复触发
    floatingEl.classList.remove("paused");
    floatingEl.classList.add("dragging");

    drag = { item, floatingEl, trailEl, progress, pointerId: e.pointerId };

    // 重新捕获指针，确保 move/up 事件都到 gameStage
    refs.gameStage.setPointerCapture(e.pointerId);

    setStatus("继续跟着线走到底部！");
}

function onTopPointerDown(e, item) {
    if (solvedIds.has(item.id)) return;
    if (drag) return; // 同一时刻只允许拖一条路径

    e.preventDefault();
    e.stopPropagation();

    const sampled = sampledPaths[item.id];
    if (!sampled) return;

    // 原始按钮变幽灵（半透明 + 禁交互），表示"已被拿起"
    const origBtn = refs.topRow.querySelector(`[data-id="${item.id}"]`);
    if (origBtn) origBtn.classList.add("ghost");

    // 创建可自由移动的浮动头像
    const floatingEl = document.createElement("div");
    floatingEl.className = "pick-btn top-btn dragging floating-avatar";
    floatingEl.innerHTML = `<img class="pick-asset pick-asset-top" src="${item.topImg}" alt="${item.alt}">`;
    const startPt = sampled.points[0];
    floatingEl.style.left = `${(startPt.x / VIEWBOX_W) * 100}%`;
    floatingEl.style.top = `${(startPt.y / VIEWBOX_H) * 100}%`;
    refs.gameStage.appendChild(floatingEl);

    // 彩色进度轨迹路径（随拖动动态延伸）
    const trailEl = document.createElementNS(SVG_NS, "path");
    trailEl.setAttribute("d", item.path);
    trailEl.setAttribute("class", "path-trail");
    trailEl.setAttribute("stroke", item.color);
    trailEl.setAttribute("stroke-dasharray", sampled.totalLength);
    trailEl.style.strokeDashoffset = sampled.totalLength;
    refs.pathLayer.appendChild(trailEl);

    drag = { item, floatingEl, trailEl, progress: 0, pointerId: e.pointerId };

    // 捕获指针：手指移出舞台也不丢失事件
    refs.gameStage.setPointerCapture(e.pointerId);

    setStatus("跟着线把上面的图连到底部的字！");
}

function onPointerMove(e) {
    if (!drag || drag.pointerId !== e.pointerId) return;
    e.preventDefault();

    const sampled = sampledPaths[drag.item.id];
    const svgPos = clientToSvg(e.clientX, e.clientY);

    // 在有限窗口内找最近点，超过偏离阈值则冻结
    const newIdx = findBestPoint(sampled.points, svgPos.x, svgPos.y, drag.progress);
    drag.progress = newIdx;

    const pt = sampled.points[newIdx];

    // 检测手指是否偏离路径（用于视觉反馈）
    const devDx = svgPos.x - pt.x;
    const devDy = svgPos.y - pt.y;
    const isOffPath = (devDx * devDx + devDy * devDy) > MAX_DEV_SQ;

    // 头像吸附到路径上的最近点
    drag.floatingEl.style.left = `${(pt.x / VIEWBOX_W) * 100}%`;
    drag.floatingEl.style.top = `${(pt.y / VIEWBOX_H) * 100}%`;

    // 偏离路径时：头像加抖动样式 + 提示
    if (isOffPath) {
        drag.floatingEl.classList.add("off-path");
        setStatus("跟着弯路走，别走捷径！");
    } else {
        drag.floatingEl.classList.remove("off-path");
    }

    // 彩色轨迹随进度动态延伸
    drag.trailEl.style.strokeDashoffset = sampled.totalLength - pt.len;

    // 已走 75% 以上 + 距终点足够近 → 触发完成
    if (newIdx / NUM_SAMPLES >= MIN_PROGRESS) {
        const endPt = sampled.points[NUM_SAMPLES];
        const dx = svgPos.x - endPt.x;
        const dy = svgPos.y - endPt.y;
        if (dx * dx + dy * dy < END_DIST_SQ) {
            finishDrag(true);
        }
    }
}

function onPointerUp(e) {
    if (!drag || drag.pointerId !== e.pointerId) return;
    finishDrag(false);
}

/**
 * pointercancel：浏览器接管了触摸（系统手势/菜单等），暂停保留头像。
 */
function onPointerCancel(e) {
    if (!drag || drag.pointerId !== e.pointerId) return;
    const { item, floatingEl, trailEl } = drag;
    const progressIdx = drag.progress;
    drag = null;

    floatingEl.classList.remove("dragging", "off-path");
    floatingEl.classList.add("paused");
    paused[item.id] = { floatingEl, trailEl, progress: progressIdx };
    attachResumeListener(floatingEl, item); // 绑定按住继续监听器

    setStatus("已暂停——再次按住头像继续");
}

/**
 * 结束拖拽。
 * success=true：吸附终点，标记完成，轨迹亮起；
 * success=false：头像就地暂停，保留已走轨迹，等待再次按住继续。
 */
function finishDrag(success) {
    if (!drag) return;
    const { item, floatingEl, trailEl } = drag;
    const sampled = sampledPaths[item.id];
    const progressIdx = drag.progress;
    drag = null; // 先清空，防止回调内重复触发

    const origBtn = refs.topRow.querySelector(`[data-id="${item.id}"]`);
    const botBtn  = refs.bottomRow.querySelector(`[data-id="${item.id}"]`);

    if (success) {
        // ── 成功：吸附到终点，轨迹补全亮起 ──
        const endPt = sampled.points[NUM_SAMPLES];
        floatingEl.classList.remove("dragging", "off-path", "paused");
        floatingEl.classList.add("solved", "floating-snap");
        floatingEl.style.left = `${(endPt.x / VIEWBOX_W) * 100}%`;
        floatingEl.style.top  = `${(endPt.y / VIEWBOX_H) * 100}%`;

        trailEl.classList.add("path-trail-solved");
        trailEl.style.strokeDashoffset = 0;

        solvedIds.add(item.id);
        if (origBtn) { origBtn.classList.remove("ghost"); origBtn.classList.add("solved"); }
        if (botBtn) botBtn.classList.add("solved");

        setTimeout(() => {
            if (floatingEl.parentNode) floatingEl.parentNode.removeChild(floatingEl);
        }, 700);

        setStatus("太棒了！继续下一条", "success");
        updateProgress();

        if (solvedIds.size === BASE_ITEMS.length) {
            setStatus("全部完成，挑战成功！", "success");
            setTimeout(() => refs.winOverlay.classList.add("show"), 900);
        }

    } else {
        // ── 未完成：就地暂停，保留已走轨迹等待继续 ──
        floatingEl.classList.remove("dragging", "off-path");
        floatingEl.classList.add("paused");

        paused[item.id] = { floatingEl, trailEl, progress: progressIdx };        attachResumeListener(floatingEl, item); // 绑定按住继续监听器
        if (progressIdx < 5) {
            setStatus("按住图标，跟着弯路走到底部");
        } else {
            setStatus("已暂停——再次按住头像继续");
        }
    }
}

// ────── 重置 / 换局 ──────

function cleanupDrag() {
    if (!drag) return;
    const { floatingEl, trailEl } = drag;
    drag = null;
    if (floatingEl.parentNode) floatingEl.parentNode.removeChild(floatingEl);
    if (trailEl.parentNode) trailEl.parentNode.removeChild(trailEl);
}

function cleanupPaused() {
    Object.values(paused).forEach(({ floatingEl, trailEl }) => {
        if (floatingEl.parentNode) floatingEl.parentNode.removeChild(floatingEl);
        if (trailEl.parentNode) trailEl.parentNode.removeChild(trailEl);
    });
    paused = {};
}

function resetRound() {
    cleanupDrag();
    cleanupPaused();
    // 防御性清理：移除所有残留浮动头像
    refs.gameStage.querySelectorAll(".floating-avatar").forEach(el => el.remove());
    solvedIds = new Set();
    refs.winOverlay.classList.remove("show");
    buildPaths();
    buildButtons();
    setStatus("按住上方图标，跟着弯路走到底部");
    updateProgress();
}

function nextLayout() {
    layoutIndex = Math.floor(Math.random() * LAYOUTS.length);
    resetRound();
}

// ────── 规则面板 ──────

function bindRulesPanel() {
    document.getElementById("toggleRules").addEventListener("click", e => {
        e.stopPropagation();
        refs.rulesPanel.classList.toggle("open");
    });
    refs.rulesPanel.addEventListener("click", e => e.stopPropagation());
    document.addEventListener("click", () => refs.rulesPanel.classList.remove("open"));
}

// ────── 初始化 ──────

function init() {
    refs.topRow = document.getElementById("topRow");
    refs.bottomRow = document.getElementById("bottomRow");
    refs.pathLayer = document.getElementById("pathLayer");
    refs.gameStage = document.querySelector(".game-stage");
    refs.statusMsg = document.getElementById("statusMsg");
    refs.progressMsg = document.getElementById("progressMsg");
    refs.rulesPanel = document.getElementById("rulesPanel");
    refs.winOverlay = document.getElementById("winOverlay");

    // 指针事件挂载到舞台（捕获后离开也不丢失）
    refs.gameStage.addEventListener("pointermove", onPointerMove, { passive: false });
    refs.gameStage.addEventListener("pointerup", onPointerUp);
    refs.gameStage.addEventListener("pointercancel", onPointerCancel);

    // 阻止长按弹出系统菜单（Android），CSS -webkit-touch-callout 负责 iOS
    refs.gameStage.addEventListener("contextmenu", e => e.preventDefault());

    document.getElementById("resetBtn").addEventListener("click", resetRound);
    document.getElementById("nextLayoutBtn").addEventListener("click", nextLayout);
    document.getElementById("winReplayBtn").addEventListener("click", resetRound);
    document.getElementById("closeWin").addEventListener("click", () => {
        refs.winOverlay.classList.remove("show");
    });

    bindRulesPanel();
    buildPaths();
    buildButtons();
    setStatus("按住上方图标，跟着弯路走到底部");
    updateProgress();
}

document.addEventListener("DOMContentLoaded", init);
