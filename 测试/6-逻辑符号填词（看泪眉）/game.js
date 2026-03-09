const SYMBOLS = [
  { id: 1, name: '看', src: './img/kan.png' },
  { id: 2, name: '泪', src: './img/lei.png' },
  { id: 3, name: '眉', src: './img/mei.png' }
];

const INITIAL_BOARD = [
  [0, 2, 3],
  [3, 1, 0],
  [2, 0, 1]
];

const BOARD_SIZE = INITIAL_BOARD.length;
const EMPTY_VALUE = 0;
const EDITABLE_TOTAL = INITIAL_BOARD.flat().filter((value) => value === EMPTY_VALUE).length;

function cloneBoard(board) {
  return JSON.parse(JSON.stringify(board));
}

let currentBoard = cloneBoard(INITIAL_BOARD);
let lastFocusedCell = null;

function buildLegend() {
  const wrap = document.getElementById('legend');
  wrap.innerHTML = '';

  SYMBOLS.forEach((symbol) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<img src="${symbol.src}" alt="${symbol.name}"><span>${symbol.name}</span>`;
    wrap.appendChild(item);
  });
}

function getFilledCount() {
  let count = 0;
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (INITIAL_BOARD[row][col] === EMPTY_VALUE && currentBoard[row][col] !== EMPTY_VALUE) {
        count += 1;
      }
    }
  }
  return count;
}

function updateProgress() {
  const progress = document.getElementById('progressMsg');
  progress.textContent = `已填写 ${getFilledCount()} / ${EDITABLE_TOTAL} 个空位`;
}

function setStatus(text, tone = 'normal') {
  const el = document.getElementById('statusMsg');
  el.textContent = text;
  el.className = `status-msg${tone === 'error' ? ' error' : tone === 'success' ? ' success' : ''}`;
}

function getSymbolName(symbolId) {
  if (symbolId === EMPTY_VALUE) return '空白';
  return SYMBOLS.find((item) => item.id === symbolId)?.name ?? '未知';
}

function getRowValues(row) {
  return currentBoard[row];
}

function getColumnValues(col) {
  return currentBoard.map((row) => row[col]);
}

function hasDuplicate(values) {
  const filtered = values.filter((value) => value !== EMPTY_VALUE);
  return new Set(filtered).size !== filtered.length;
}

function isBoardComplete() {
  return currentBoard.every((row) => row.every((value) => value !== EMPTY_VALUE));
}

function toggleRules(forceOpen) {
  const panel = document.getElementById('rulesPanel');
  const button = document.getElementById('toggleRules');
  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !panel.classList.contains('open');

  panel.classList.toggle('open', shouldOpen);
  panel.setAttribute('aria-hidden', String(!shouldOpen));
  button.setAttribute('aria-expanded', String(shouldOpen));
}

function renderBoard() {
  const grid = document.getElementById('puzzleGrid');
  grid.innerHTML = '';

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'grid-cell';
      cell.dataset.r = String(row);
      cell.dataset.c = String(col);
      cell.setAttribute('role', 'gridcell');

      const isFixed = INITIAL_BOARD[row][col] !== EMPTY_VALUE;
      const symbolId = currentBoard[row][col];
      const symbolName = getSymbolName(symbolId);
      const labelPrefix = `第 ${row + 1} 行，第 ${col + 1} 列`;

      if (isFixed) {
        cell.classList.add('fixed');
        cell.disabled = true;
        cell.setAttribute('aria-label', `${labelPrefix}，固定符号 ${symbolName}`);
      } else {
        cell.classList.add('editable');
        cell.setAttribute('aria-label', `${labelPrefix}，当前为 ${symbolName}，点击切换符号`);
      }

      if (lastFocusedCell && lastFocusedCell.row === row && lastFocusedCell.col === col) {
        cell.classList.add('active');
      }

      if (symbolId !== EMPTY_VALUE) {
        const symbol = SYMBOLS.find((item) => item.id === symbolId);
        const img = document.createElement('img');
        img.src = symbol.src;
        img.alt = symbol.name;
        cell.appendChild(img);
      } else {
        cell.classList.add('empty');
      }

      cell.addEventListener('click', () => handleCellClick(row, col));
      grid.appendChild(cell);
    }
  }

  updateProgress();
}

function openWinOverlay() {
  const overlay = document.getElementById('winOverlay');
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeWinOverlay() {
  const overlay = document.getElementById('winOverlay');
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
}

function checkBoardState(row, col) {
  const rowValues = getRowValues(row);
  const colValues = getColumnValues(col);

  if (hasDuplicate(rowValues)) {
    setStatus(`第 ${row + 1} 行有重复符号，再检查一下。`, 'error');
    return;
  }

  if (hasDuplicate(colValues)) {
    setStatus(`第 ${col + 1} 列有重复符号，再检查一下。`, 'error');
    return;
  }

  if (!isBoardComplete()) {
    setStatus('这一行和这一列目前没冲突，继续填其它空位。');
    return;
  }

  setStatus('答对了！每一行、每一列都正好有一个“看、泪、眉”。', 'success');
  window.setTimeout(openWinOverlay, 180);
}

function handleCellClick(row, col) {
  if (INITIAL_BOARD[row][col] !== EMPTY_VALUE) return;

  currentBoard[row][col] = (currentBoard[row][col] + 1) % (SYMBOLS.length + 1);
  lastFocusedCell = { row, col };
  renderBoard();

  if (currentBoard[row][col] === EMPTY_VALUE) {
    setStatus('这个空位已清空，再试试看。');
    return;
  }

  const symbol = SYMBOLS.find((item) => item.id === currentBoard[row][col]);
  setStatus(`你放入了“${symbol.name}”，继续检查这一行和这一列。`);
  checkBoardState(row, col);
}

function resetGame() {
  currentBoard = cloneBoard(INITIAL_BOARD);
  lastFocusedCell = null;
  closeWinOverlay();
  toggleRules(false);
  setStatus('点击空白圆圈开始填词。');
  renderBoard();
}

function initRules() {
  const toggle = document.getElementById('toggleRules');
  const panel = document.getElementById('rulesPanel');

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleRules();
  });

  panel.addEventListener('click', (event) => event.stopPropagation());

  document.addEventListener('click', () => {
    toggleRules(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      toggleRules(false);
      closeWinOverlay();
    }
  });
}

function initButtons() {
  document.getElementById('resetBtn').addEventListener('click', resetGame);
  document.getElementById('playAgainBtn').addEventListener('click', resetGame);
  document.getElementById('winCloseBtn').addEventListener('click', closeWinOverlay);
}

function initGame() {
  buildLegend();
  initRules();
  initButtons();
  renderBoard();
}

document.addEventListener('DOMContentLoaded', initGame);
