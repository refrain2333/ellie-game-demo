const tiger = document.getElementById("tiger");
const stage = document.getElementById("mazeStage");
const pathLayer = document.getElementById("pathLayer");
const pathBack = document.getElementById("pathBack");
const pathMainGlow = document.getElementById("pathMainGlow");
const pathMain = document.getElementById("pathMain");
const pathMainInner = document.getElementById("pathMainInner");
const pathMainDetail = document.getElementById("pathMainDetail");
const pathBranchGlow = document.getElementById("pathBranchGlow");
const pathBranch = document.getElementById("pathBranch");
const pathBranchInner = document.getElementById("pathBranchInner");
const zoneShape = document.getElementById("zoneShape");
const meatIcon = document.getElementById("meatIcon");
const exitFlag = document.getElementById("exitFlag");
const statusMsg = document.getElementById("statusMsg");
const progressMsg = document.getElementById("progressMsg");
const winOverlay = document.getElementById("winOverlay");
const rulesPanel = document.getElementById("rulesPanel");
const stepMeat = document.getElementById("stepMeat");
const stepExit = document.getElementById("stepExit");
const startNode = document.getElementById("startNode");

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 620;
const SVG_NS = "http://www.w3.org/2000/svg";
const NUM_SAMPLES = 180;
const WIN_BACK = 16;
const WIN_FWD = 24;
const JUNCTION_WINDOW = 28;
const SWITCH_WINDOW = 56;
const MAX_DEV_SQ = 84 * 84;
const SWITCH_BIAS = 1.35;
const NODE_SWITCH_SQ = 40 * 40;

const ZONE_SHAPE_D = "M 518 24 C 680 38 812 132 866 278 C 920 422 908 556 826 596 C 726 644 572 630 450 574 C 326 516 226 428 186 318 C 150 204 178 92 274 42 C 366 -6 460 12 518 24 Z";

const NODES = {
  start: { x: 498, y: 92 },
  a: { x: 486, y: 184 },
  b: { x: 356, y: 214 },
  c: { x: 256, y: 348 },
  d: { x: 332, y: 514 },
  e: { x: 478, y: 468 },
  m: { x: 606, y: 430 },
  f: { x: 720, y: 340 },
  g: { x: 804, y: 240 },
  h: { x: 880, y: 348 },
  i: { x: 820, y: 504 },
  j: { x: 688, y: 500 },
  meat: { x: 792, y: 144 },
  exit: { x: 920, y: 510 },
  k: { x: 138, y: 412 },
  n: { x: 956, y: 334 },
};

const SEGMENTS = [
  { id: "s1", from: "start", to: "a", d: "M 498 92 C 492 122 486 154 486 184", kind: "main" },
  { id: "s2", from: "a", to: "b", d: "M 486 184 C 432 170 388 182 356 214", kind: "main" },
  { id: "s3", from: "b", to: "c", d: "M 356 214 C 290 248 254 292 256 348", kind: "main" },
  { id: "s4", from: "c", to: "d", d: "M 256 348 C 242 432 270 496 332 514", kind: "main" },
  { id: "s5", from: "d", to: "e", d: "M 332 514 C 390 526 444 504 478 468", kind: "main" },
  { id: "s6", from: "e", to: "a", d: "M 478 468 C 546 392 548 260 486 184", kind: "main" },
  { id: "s7", from: "d", to: "m", d: "M 332 514 C 392 474 468 430 606 430", kind: "main" },
  { id: "s8", from: "m", to: "f", d: "M 606 430 C 662 420 708 392 720 340", kind: "main" },
  { id: "s9", from: "f", to: "g", d: "M 720 340 C 728 292 758 254 804 240", kind: "main" },
  { id: "s10", from: "g", to: "h", d: "M 804 240 C 864 236 904 284 880 348", kind: "main" },
  { id: "s11", from: "h", to: "i", d: "M 880 348 C 886 424 864 484 820 504", kind: "main" },
  { id: "s12", from: "i", to: "j", d: "M 820 504 C 780 514 728 516 688 500", kind: "main" },
  { id: "s13", from: "j", to: "m", d: "M 688 500 C 646 506 610 482 606 430", kind: "main" },
  { id: "s14", from: "j", to: "exit", d: "M 688 500 C 782 488 862 494 920 510", kind: "main" },
  { id: "l1", from: "g", to: "meat", d: "M 804 240 C 808 206 804 172 792 144", kind: "branch" },
  { id: "l2", from: "c", to: "k", d: "M 256 348 C 212 372 176 396 138 412", kind: "branch" },
  { id: "l3", from: "h", to: "n", d: "M 880 348 C 912 336 936 324 956 334", kind: "branch" },
  ];

const BADGE_CONFIGS = [
  { selector: ".badge.b1", segmentId: "l2", t: 0.7 },
  { selector: ".badge.b3", segmentId: "s5", t: 0.5 },
  { selector: ".badge.b4", segmentId: "s8", t: 0.44 },
  { selector: ".badge.b5", segmentId: "l3", t: 0.56 },
  { selector: ".badge.b6", segmentId: "s7", t: 0.52 },
];

const SEGMENT_BY_ID = Object.fromEntries(SEGMENTS.map((segment) => [segment.id, segment]));
const DECOR_POINTS = {
  startFlag: { x: 462, y: 74 },
  exitFlag: { x: 918, y: 512 },
  meat: { x: 792, y: 144 },
};
const DISPLAY_LEFT_D = "M 498 92 C 492 122 486 154 486 184 C 432 170 388 182 356 214 C 290 248 254 292 256 348 C 242 432 270 496 332 514 C 390 526 444 504 478 468 C 546 392 548 260 486 184";
const DISPLAY_CONNECTOR_D = "M 332 514 C 392 474 468 430 606 430 C 662 420 708 392 720 340";
const DISPLAY_RIGHT_D = "M 720 340 C 728 292 758 254 804 240 C 864 236 904 284 880 348 C 886 424 864 484 820 504 C 780 514 728 516 688 500 C 646 506 610 482 606 430";
const DISPLAY_EXIT_D = "M 688 500 C 782 488 862 494 920 510";
const DISPLAY_BRANCH_D = "M 804 240 C 808 206 804 172 792 144 M 256 348 C 212 372 176 396 138 412 M 880 348 C 912 336 936 324 956 334";

let sampledSegments = {};
let adjacency = {};
let routeDefs = null;
let routeGroup = null;
let displayGroup = null;
let cachedStageRect = null;
let dragState = null;
let currentTrack = { segmentId: "s1", pointIdx: 0 };
let tigerPos = { x: NODES.start.x / VIEWBOX_WIDTH, y: NODES.start.y / VIEWBOX_HEIGHT };
let hasMeat = false;
let gameWon = false;

function init() {
  initPaths();
  positionNodes();
  positionBadges();
  initRulesPanel();
  initButtons();
  initStage();
  syncSteps();
  resetStatus();
  startNode.classList.add("done");
}

function initPaths() {
  zoneShape.setAttribute("d", ZONE_SHAPE_D);
  [pathBack, pathMainGlow, pathMain, pathMainInner, pathMainDetail, pathBranchGlow, pathBranch, pathBranchInner].forEach((element) => {
    element.setAttribute("d", "");
  });

  if (routeDefs) routeDefs.remove();
  if (routeGroup) routeGroup.remove();
  if (displayGroup) displayGroup.remove();

  routeDefs = createRouteDefs();
  pathLayer.appendChild(routeDefs);

  routeGroup = document.createElementNS(SVG_NS, "g");
  routeGroup.setAttribute("id", "routeGroup");
  routeGroup.setAttribute("class", "logic-guides");
  pathLayer.appendChild(routeGroup);

  displayGroup = document.createElementNS(SVG_NS, "g");
  displayGroup.setAttribute("id", "displayGroup");
  pathLayer.appendChild(displayGroup);

  sampledSegments = {};
  adjacency = {};

  SEGMENTS.forEach((segment) => {
    registerAdjacency(segment.from, segment.id);
    registerAdjacency(segment.to, segment.id);

    const guide = makePath(segment.d, "logic-guide");
    routeGroup.appendChild(guide);

    sampledSegments[segment.id] = {
      ...samplePathElement(guide),
      from: segment.from,
      to: segment.to,
      kind: segment.kind,
    };
  });

  renderDisplayPaths();
}

function registerAdjacency(nodeId, segmentId) {
  if (!adjacency[nodeId]) adjacency[nodeId] = [];
  adjacency[nodeId].push(segmentId);
}

function makePath(d, className) {
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", d);
  path.setAttribute("class", className);
  return path;
}

function createGradient(id, x1, y1, x2, y2, stops) {
  const gradient = document.createElementNS(SVG_NS, "linearGradient");
  gradient.setAttribute("id", id);
  gradient.setAttribute("gradientUnits", "userSpaceOnUse");
  gradient.setAttribute("x1", String(x1));
  gradient.setAttribute("y1", String(y1));
  gradient.setAttribute("x2", String(x2));
  gradient.setAttribute("y2", String(y2));

  stops.forEach(([offset, color]) => {
    const stop = document.createElementNS(SVG_NS, "stop");
    stop.setAttribute("offset", offset);
    stop.setAttribute("stop-color", color);
    gradient.appendChild(stop);
  });

  return gradient;
}

function createRouteDefs() {
  const defs = document.createElementNS(SVG_NS, "defs");

  [
    createGradient("mazeGradientLeft", 240, 500, 560, 180, [
      ["0%", "#F1D38A"],
      ["50%", "#EFCB72"],
      ["100%", "#E7C36B"],
    ]),
    createGradient("mazeGradientConnector", 330, 500, 760, 360, [
      ["0%", "#D98C5D"],
      ["50%", "#D47E56"],
      ["100%", "#CC6F4D"],
    ]),
    createGradient("mazeGradientRight", 700, 520, 900, 250, [
      ["0%", "#965130"],
      ["55%", "#8A492B"],
      ["100%", "#7C4127"],
    ]),
    createGradient("mazeGradientExit", 680, 500, 930, 510, [
      ["0%", "#BA5D3D"],
      ["50%", "#B45639"],
      ["100%", "#A84A31"],
    ]),
    createGradient("mazeGradientBranch", 120, 360, 960, 220, [
      ["0%", "#F0D5C1"],
      ["50%", "#E8CCB6"],
      ["100%", "#DFC1A7"],
    ]),
  ].forEach((gradient) => defs.appendChild(gradient));

  return defs;
}


function renderDisplayPaths() {
  [
    { d: DISPLAY_LEFT_D, cls: "maze-route-under left" },
    { d: DISPLAY_CONNECTOR_D, cls: "maze-route-under connector" },
    { d: DISPLAY_RIGHT_D, cls: "maze-route-under right" },
    { d: DISPLAY_EXIT_D, cls: "maze-route-under exit" },
    { d: DISPLAY_BRANCH_D, cls: "maze-route-under branch" },
    { d: DISPLAY_LEFT_D, cls: "maze-route-stroke left" },
    { d: DISPLAY_CONNECTOR_D, cls: "maze-route-stroke connector" },
    { d: DISPLAY_RIGHT_D, cls: "maze-route-stroke right" },
    { d: DISPLAY_EXIT_D, cls: "maze-route-stroke exit" },
    { d: DISPLAY_BRANCH_D, cls: "maze-route-stroke branch" },
  ].forEach(({ d, cls }) => {
    displayGroup.appendChild(makePath(d, cls));
  });
}

function samplePathElement(pathEl) {
  const totalLength = pathEl.getTotalLength();
  const points = [];
  for (let index = 0; index <= NUM_SAMPLES; index += 1) {
    const len = (index / NUM_SAMPLES) * totalLength;
    const point = pathEl.getPointAtLength(len);
    points.push({ x: point.x, y: point.y, len });
  }
  return { points, totalLength };
}

function positionNodes() {
  placeElement(startNode, DECOR_POINTS.startFlag);
  placeElement(meatIcon, DECOR_POINTS.meat);
  placeElement(exitFlag, DECOR_POINTS.exitFlag);
}

function placeElement(element, point) {
  element.style.left = `${((point.x / VIEWBOX_WIDTH) * 100).toFixed(2)}%`;
  element.style.top = `${((point.y / VIEWBOX_HEIGHT) * 100).toFixed(2)}%`;
}

function positionBadges() {
  BADGE_CONFIGS.forEach(({ selector, segmentId, t }) => {
    const element = document.querySelector(selector);
    const sampled = sampledSegments[segmentId];
    if (!element || !sampled) return;
    const point = sampled.points[Math.round(clamp(t, 0, 1) * NUM_SAMPLES)];
    placeElement(element, point);
    requestAnimationFrame(() => element.classList.add("ready"));
  });
}

function initRulesPanel() {
  document.getElementById("toggleRules").addEventListener("click", (event) => {
    event.stopPropagation();
    rulesPanel.classList.toggle("open");
  });

  rulesPanel.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", () => {
    rulesPanel.classList.remove("open");
  });
}

function initButtons() {
  document.getElementById("resetBtn").addEventListener("click", resetGame);
  document.getElementById("playAgainBtn").addEventListener("click", resetGame);
  document.getElementById("winClose").addEventListener("click", () => {
    winOverlay.classList.remove("show");
  });
}

function initStage() {
  tiger.addEventListener("pointerdown", onTigerDown);
  stage.addEventListener("pointermove", onPointerMove, { passive: false });
  stage.addEventListener("pointerup", onPointerUp);
  stage.addEventListener("pointercancel", onPointerUp);
  stage.addEventListener("contextmenu", (event) => event.preventDefault());
  window.addEventListener("resize", () => {
    cachedStageRect = null;
  });

  updateTigerPosition();
}

function onTigerDown(event) {
  if (gameWon) return;
  event.preventDefault();

  dragState = { pointerId: event.pointerId };
  tiger.classList.add("dragging");
  stage.setPointerCapture(event.pointerId);
  cachedStageRect = stage.getBoundingClientRect();

  if (!hasMeat) {
    setStatus("先绕到右上支线吃肉，再去找出口。颜色相通的路才能走。", "normal");
  } else {
    setStatus("已经吃到肉了，沿右下大回环去找出口。", "normal");
  }
}

function onPointerMove(event) {
  if (!dragState || dragState.pointerId !== event.pointerId || gameWon) return;
  event.preventDefault();

  const svgPos = clientToSvg(event.clientX, event.clientY);
  const bestTrack = findBestTrack(svgPos.x, svgPos.y);

  if (bestTrack.distanceSq > MAX_DEV_SQ) {
    tiger.classList.add("off-track");
    setStatus("在大弯和路口处慢一点，贴线走。", "error");
    return;
  }

  const sampled = sampledSegments[bestTrack.segmentId];
  const point = sampled.points[bestTrack.pointIdx];
  currentTrack = { segmentId: bestTrack.segmentId, pointIdx: bestTrack.pointIdx };
  tiger.classList.remove("off-track");
  tigerPos = { x: point.x / VIEWBOX_WIDTH, y: point.y / VIEWBOX_HEIGHT };
  updateTigerPosition();
  checkMilestones();
}

function onPointerUp(event) {
  if (!dragState || dragState.pointerId !== event.pointerId) return;
  dragState = null;
  tiger.classList.remove("dragging", "off-track");

  if (gameWon) return;
  if (!hasMeat) {
    setStatus("先吃到肉，再往右下角出口走。近路不一定是路，注意颜色相通。", "normal");
  } else {
    setStatus("肉已经拿到，沿右侧回环继续找出口。", "normal");
  }
}

function findBestTrack(sx, sy) {
  const currentSegment = sampledSegments[currentTrack.segmentId];
  const currentRange = {
    segmentId: currentTrack.segmentId,
    lo: Math.max(0, currentTrack.pointIdx - WIN_BACK),
    hi: Math.min(NUM_SAMPLES, currentTrack.pointIdx + WIN_FWD),
  };

  const ranges = [currentRange];
  const switchNodes = [];

  if (currentTrack.pointIdx <= JUNCTION_WINDOW) {
    switchNodes.push(currentSegment.from);
    addSwitchRanges(ranges, currentSegment.from, currentTrack.segmentId);
  }
  if (currentTrack.pointIdx >= NUM_SAMPLES - JUNCTION_WINDOW) {
    switchNodes.push(currentSegment.to);
    addSwitchRanges(ranges, currentSegment.to, currentTrack.segmentId);
  }

  const currentBest = findBestInRange(currentRange, sx, sy);
  let best = currentBest;

  ranges.slice(1).forEach((range) => {
    const candidate = findBestInRange(range, sx, sy);
    if (candidate.distanceSq < best.distanceSq) best = candidate;
  });

  const nearSwitchNode = switchNodes.some((nodeId) => distanceSqToNode(nodeId, sx, sy) <= NODE_SWITCH_SQ);
  if (best.segmentId !== currentTrack.segmentId && !nearSwitchNode && best.distanceSq > currentBest.distanceSq * SWITCH_BIAS) {
    return currentBest;
  }

  return best;
}

function addSwitchRanges(ranges, nodeId, excludeSegmentId) {
  (adjacency[nodeId] || []).forEach((segmentId) => {
    if (segmentId === excludeSegmentId) return;
    const segment = SEGMENT_BY_ID[segmentId];
    if (segment.from === nodeId) {
      ranges.push({ segmentId, lo: 0, hi: Math.min(NUM_SAMPLES, SWITCH_WINDOW) });
    } else {
      ranges.push({ segmentId, lo: Math.max(0, NUM_SAMPLES - SWITCH_WINDOW), hi: NUM_SAMPLES });
    }
  });
}

function findBestInRange(range, sx, sy) {
  const sampled = sampledSegments[range.segmentId];
  let bestPointIdx = range.lo;
  let bestDistanceSq = Infinity;

  for (let pointIdx = range.lo; pointIdx <= range.hi; pointIdx += 1) {
    const point = sampled.points[pointIdx];
    const dx = point.x - sx;
    const dy = point.y - sy;
    const distanceSq = dx * dx + dy * dy;
    if (distanceSq < bestDistanceSq) {
      bestDistanceSq = distanceSq;
      bestPointIdx = pointIdx;
    }
  }

  return { segmentId: range.segmentId, pointIdx: bestPointIdx, distanceSq: bestDistanceSq };
}

function distanceSqToNode(nodeId, sx, sy) {
  const node = NODES[nodeId];
  if (!node) return Infinity;
  const dx = node.x - sx;
  const dy = node.y - sy;
  return dx * dx + dy * dy;
}

function clientToSvg(clientX, clientY) {
  const rect = cachedStageRect || (cachedStageRect = stage.getBoundingClientRect());
  return {
    x: ((clientX - rect.left) / rect.width) * VIEWBOX_WIDTH,
    y: ((clientY - rect.top) / rect.height) * VIEWBOX_HEIGHT,
  };
}

function updateTigerPosition() {
  tiger.style.left = `${(tigerPos.x * 100).toFixed(3)}%`;
  tiger.style.top = `${(tigerPos.y * 100).toFixed(3)}%`;
}

function checkMilestones() {
  if (!hasMeat && isNearElement(meatIcon, "target")) {
    hasMeat = true;
    meatIcon.classList.add("done");
    setStatus("吃到肉了！沿回环折回，再去找出口。", "success");
    syncSteps();
  }

  if (hasMeat && isNearElement(exitFlag, "exit")) {
    gameWon = true;
    exitFlag.classList.add("done");
    setStatus("成功！老虎已经带着肉安全出迷宫。", "success");
    syncSteps();
    winOverlay.classList.add("show");
  }
}

function syncSteps() {
  stepMeat.classList.remove("active", "done");
  stepExit.classList.remove("active", "done");

  if (!hasMeat) {
    stepMeat.classList.add("active");
    updateProgress();
    return;
  }

  stepMeat.classList.add("done");

  if (!gameWon) {
    stepExit.classList.add("active");
    updateProgress();
    return;
  }

  stepExit.classList.add("done");
  updateProgress();
}

function updateProgress() {
  const finished = Number(hasMeat) + Number(gameWon);
  progressMsg.textContent = `已完成 ${finished}/2`;
}

function setStatus(text, tone = "normal") {
  statusMsg.textContent = text;
  statusMsg.className = `status-msg${tone === "error" ? " error" : tone === "success" ? " success" : ""}`;
}

function resetStatus() {
  setStatus("拖动老虎，沿大弯路径出发。颜色相通的路才能走，有时候近路不是路，远路才是路。", "normal");
  updateProgress();
}

function isNearElement(element, type) {
  const tigerRect = tiger.getBoundingClientRect();
  const targetRect = element.getBoundingClientRect();
  const tigerX = tigerRect.left + tigerRect.width / 2;
  const tigerY = tigerRect.top + tigerRect.height / 2;
  const targetX = targetRect.left + targetRect.width / 2;
  const targetY = targetRect.top + targetRect.height / 2;
  const distance = Math.hypot(targetX - tigerX, targetY - tigerY);

  const base = type === "exit" ? 42 : 38;
  const byElement = Math.max(targetRect.width, targetRect.height) * (type === "exit" ? 0.52 : 0.5);
  const byTiger = Math.max(tigerRect.width, tigerRect.height) * 0.4;
  return distance <= Math.max(base, byElement + byTiger);
}

function resetGame() {
  dragState = null;
  cachedStageRect = null;
  hasMeat = false;
  gameWon = false;
  currentTrack = { segmentId: "s1", pointIdx: 0 };
  tigerPos = { x: NODES.start.x / VIEWBOX_WIDTH, y: NODES.start.y / VIEWBOX_HEIGHT };

  winOverlay.classList.remove("show");
  meatIcon.classList.remove("done");
  exitFlag.classList.remove("done");
  tiger.classList.remove("dragging", "off-track");

  syncSteps();
  updateTigerPosition();
  resetStatus();
  startNode.classList.remove("done");
  startNode.classList.add("done");
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

document.addEventListener("DOMContentLoaded", init);
