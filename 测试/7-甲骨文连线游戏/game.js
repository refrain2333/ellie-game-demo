const TARGET_ITEMS = [
  { char: '面', img: './img/mian_1.png' },
  { char: '看', img: './img/kan_1.png' },
  { char: '泪', img: './img/lei_1.png' },
  { char: '见', img: './img/jian_1.png' },
  { char: '眉', img: './img/mei_1.png' }
];

const ORACLE_BONES = [
  { id: 1, char: '面', img: './img/mian_2.png', x: 22, y: 42 },
  { id: 2, char: '看', img: './img/kan_2.png', x: 50, y: 18 },
  { id: 3, char: '泪', img: './img/lei_2.png', x: 78, y: 42 },
  { id: 4, char: '见', img: './img/jian_2.png', x: 34, y: 78 },
  { id: 5, char: '眉', img: './img/mei_2.png', x: 66, y: 78 }
];

let connections = [];
let targetElements = {};
let oracleElements = {};
let currentDrag = null;
let hoveredOracleId = null;

const LINE_COLORS = {
  面: '#c9745d',
  看: '#8b6fb3',
  泪: '#4f8f9d',
  见: '#7ba05b',
  眉: '#d0a64a'
};

function getLineColor(char) {
  return LINE_COLORS[char] ?? '#7a7369';
}


function updateProgress() {
  const progress = document.getElementById('progressMsg');
  progress.textContent = `已完成 ${connections.length} / ${ORACLE_BONES.length} 个连接`;
}

function setStatus(text, tone = 'normal') {
  const el = document.getElementById('statusMsg');
  el.textContent = text;
  el.className = `status-msg${tone === 'error' ? ' error' : tone === 'success' ? ' success' : ''}`;
}

function toggleRules(forceOpen) {
  const panel = document.getElementById('rulesPanel');
  const button = document.getElementById('toggleRules');
  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !panel.classList.contains('open');

  panel.classList.toggle('open', shouldOpen);
  panel.setAttribute('aria-hidden', String(!shouldOpen));
  button.setAttribute('aria-expanded', String(shouldOpen));
}

function showWinOverlay() {
  const overlay = document.getElementById('winOverlay');
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeWinOverlay() {
  const overlay = document.getElementById('winOverlay');
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
}

function syncSvg(svgId) {
  const svg = document.getElementById(svgId);
  const gameArea = document.querySelector('.game-area');
  const rect = gameArea.getBoundingClientRect();

  svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
  svg.setAttribute('width', String(rect.width));
  svg.setAttribute('height', String(rect.height));
}

function syncCanvases() {
  syncSvg('lineCanvas');
  syncSvg('dragCanvas');
}

function buildCurvePath(x1, y1, x2, y2) {
  const verticalGap = Math.max(42, Math.abs(y2 - y1) * 0.28);
  const controlY1 = y1 + verticalGap;
  const controlY2 = y2 - Math.min(32, verticalGap * 0.45);
  return `M ${x1} ${y1} C ${x1} ${controlY1}, ${x2} ${controlY2}, ${x2} ${y2}`;
}

function appendCurve(svg, x1, y1, x2, y2, options = {}) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', buildCurvePath(x1, y1, x2, y2));
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', options.stroke ?? '#7a7369');
  path.setAttribute('stroke-width', String(options.strokeWidth ?? 3));
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  if (options.opacity) path.setAttribute('opacity', String(options.opacity));
  if (options.dasharray) path.setAttribute('stroke-dasharray', options.dasharray);
  svg.appendChild(path);

  const startDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  startDot.setAttribute('cx', x1);
  startDot.setAttribute('cy', y1);
  startDot.setAttribute('r', String(options.dotRadius ?? 3));
  startDot.setAttribute('fill', options.stroke ?? '#7a7369');
  svg.appendChild(startDot);

  const endDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  endDot.setAttribute('cx', x2);
  endDot.setAttribute('cy', y2);
  endDot.setAttribute('r', String(options.dotRadius ?? 3));
  endDot.setAttribute('fill', options.stroke ?? '#7a7369');
  svg.appendChild(endDot);
}

function getElementAnchorWithinGameArea(element, anchor = 'center') {
  const gameAreaRect = document.querySelector('.game-area').getBoundingClientRect();
  const rect = element.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2 - gameAreaRect.left;
  const centerY = rect.top + rect.height / 2 - gameAreaRect.top;

  if (anchor === 'bottom-center') {
    return {
      x: centerX,
      y: rect.bottom - gameAreaRect.top
    };
  }

  return {
    x: centerX,
    y: centerY
  };
}

function redrawConnections() {
  syncCanvases();
  const svg = document.getElementById('lineCanvas');
  svg.innerHTML = '';

  connections.forEach((connection) => {
    const targetElement = targetElements[connection.char];
    const oracleElement = oracleElements[connection.oracleId];
    if (!targetElement || !oracleElement) return;

    const start = getElementAnchorWithinGameArea(targetElement, 'bottom-center');
    const end = getElementAnchorWithinGameArea(oracleElement, 'center');
    appendCurve(svg, start.x, start.y, end.x, end.y, {
      stroke: getLineColor(connection.char),
      strokeWidth: 3,
      dotRadius: 3,
      opacity: 0.88
    });
  });
}

function clearActiveDrag() {
  const dragSvg = document.getElementById('dragCanvas');
  dragSvg.innerHTML = '';

  if (currentDrag?.targetElement) {
    currentDrag.targetElement.classList.remove('dragging');
  }

  currentDrag = null;
  setHoveredOracle(null);
}

function renderActiveDrag(pointerX, pointerY) {
  if (!currentDrag) return;

  const dragSvg = document.getElementById('dragCanvas');
  dragSvg.innerHTML = '';
  appendCurve(dragSvg, currentDrag.start.x, currentDrag.start.y, pointerX, pointerY, {
    stroke: getLineColor(currentDrag.char),
    strokeWidth: 4,
    dotRadius: 4,
    dasharray: '8 7'
  });
}

function setHoveredOracle(oracleId) {
  if (hoveredOracleId && oracleElements[hoveredOracleId]) {
    oracleElements[hoveredOracleId].classList.remove('drag-hover');
  }

  hoveredOracleId = oracleId;

  if (hoveredOracleId && oracleElements[hoveredOracleId]) {
    oracleElements[hoveredOracleId].classList.add('drag-hover');
  }
}

function getOracleFromPoint(clientX, clientY) {
  const element = document.elementFromPoint(clientX, clientY);
  return element?.closest('.oracle-item') ?? null;
}

function renderTargetChars() {
  const container = document.getElementById('targetChars');
  container.innerHTML = '';
  targetElements = {};

  TARGET_ITEMS.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'target-char';
    button.dataset.char = item.char;
    button.setAttribute('aria-label', `目标字 ${item.char}`);

    const img = document.createElement('img');
    img.src = item.img;
    img.alt = item.char;
    button.appendChild(img);

    button.addEventListener('pointerdown', (event) => startDragFromTarget(event, item.char, button));
    container.appendChild(button);
    targetElements[item.char] = button;
  });
}

function renderOracleItems() {
  const container = document.getElementById('oracleItems');
  container.innerHTML = '';
  oracleElements = {};

  ORACLE_BONES.forEach((oracle) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'oracle-item';
    button.dataset.id = String(oracle.id);
    button.dataset.char = oracle.char;
    button.style.left = `${oracle.x}%`;
    button.style.top = `${oracle.y}%`;
    button.setAttribute('aria-label', `甲骨文符号，可能对应 ${oracle.char}`);

    const img = document.createElement('img');
    img.src = oracle.img;
    img.alt = oracle.char;
    button.appendChild(img);

    container.appendChild(button);
    oracleElements[oracle.id] = button;
  });
}

function startDragFromTarget(event, char, targetElement) {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  event.preventDefault();
  syncCanvases();

  const start = getElementAnchorWithinGameArea(targetElement, 'bottom-center');
  currentDrag = {
    char,
    pointerId: event.pointerId,
    targetElement,
    start
  };

  targetElement.classList.add('dragging');
  renderActiveDrag(start.x, start.y);
  setStatus(`正在拖动“${char}”，请拖到对应的甲骨文符号上。`);
}

function handleDragMove(event) {
  if (!currentDrag || event.pointerId !== currentDrag.pointerId) return;
  event.preventDefault();

  const gameAreaRect = document.querySelector('.game-area').getBoundingClientRect();
  const pointerX = event.clientX - gameAreaRect.left;
  const pointerY = event.clientY - gameAreaRect.top;
  renderActiveDrag(pointerX, pointerY);

  const oracleElement = getOracleFromPoint(event.clientX, event.clientY);
  setHoveredOracle(oracleElement ? Number(oracleElement.dataset.id) : null);
}

function connectToOracle(oracleId) {
  const oracle = ORACLE_BONES.find((item) => item.id === oracleId);
  const oracleElement = oracleElements[oracleId];

  if (!oracle || !oracleElement || !currentDrag) return;

  if (oracleElement.classList.contains('connected')) {
    setStatus('这个甲骨文已经连接过了，请换一个。', 'error');
    return;
  }

  if (oracle.char !== currentDrag.char) {
    oracleElement.classList.add('drag-hover');
    window.setTimeout(() => oracleElement.classList.remove('drag-hover'), 220);
    setStatus(`拖错了，这个甲骨文对应的是“${oracle.char}”。`, 'error');
    return;
  }

  oracleElement.classList.add('connected');
  connections.push({
    char: currentDrag.char,
    oracleId
  });

  redrawConnections();
  updateProgress();

  if (connections.length === ORACLE_BONES.length) {
    setStatus('全部拖对了，太棒了！', 'success');
    window.setTimeout(showWinOverlay, 260);
    return;
  }

  setStatus(`成功把“${currentDrag.char}”连到了对应甲骨文。`, 'success');
}

function handleDragEnd(event) {
  if (!currentDrag || event.pointerId !== currentDrag.pointerId) return;
  event.preventDefault();

  const oracleElement = getOracleFromPoint(event.clientX, event.clientY);
  const draggedChar = currentDrag.char;

  if (oracleElement) {
    connectToOracle(Number(oracleElement.dataset.id));
  } else {
    setStatus(`“${draggedChar}”没有拖到甲骨文上，再试试看。`, 'error');
  }

  clearActiveDrag();
}

function handleDragCancel(event) {
  if (!currentDrag || event.pointerId !== currentDrag.pointerId) return;
  clearActiveDrag();
  setStatus('拖动已取消，请重新开始。');
}

function resetGame() {
  connections = [];
  Object.values(oracleElements).forEach((element) => {
    element.classList.remove('connected', 'drag-hover');
  });
  clearActiveDrag();
  redrawConnections();
  closeWinOverlay();
  toggleRules(false);
  updateProgress();
  setStatus('按住顶部字卡，拖到对应的甲骨文符号上。');
}

function initRules() {
  const toggle = document.getElementById('toggleRules');
  const panel = document.getElementById('rulesPanel');

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleRules();
  });

  panel.addEventListener('click', (event) => event.stopPropagation());
  document.addEventListener('click', () => toggleRules(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      toggleRules(false);
      closeWinOverlay();
      clearActiveDrag();
    }
  });
}

function initButtons() {
  document.getElementById('resetBtn').addEventListener('click', resetGame);
  document.getElementById('playAgainBtn').addEventListener('click', resetGame);
  document.getElementById('winCloseBtn').addEventListener('click', closeWinOverlay);
}

function initPointerDrag() {
  window.addEventListener('pointermove', handleDragMove, { passive: false });
  window.addEventListener('pointerup', handleDragEnd, { passive: false });
  window.addEventListener('pointercancel', handleDragCancel, { passive: false });
}

function initResponsiveCanvas() {
  window.addEventListener('resize', redrawConnections);
  window.addEventListener('orientationchange', redrawConnections);
  window.setTimeout(redrawConnections, 0);
}

function initGame() {
  renderTargetChars();
  renderOracleItems();
  initRules();
  initButtons();
  initPointerDrag();
  initResponsiveCanvas();
  updateProgress();
  setStatus('按住顶部字卡，拖到对应的甲骨文符号上。');
}

document.addEventListener('DOMContentLoaded', initGame);
