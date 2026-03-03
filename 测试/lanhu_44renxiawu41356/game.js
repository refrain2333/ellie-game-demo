const SYMBOLS = [
  { id: 1, name: '工', src: './img/11868dd7e029e0c84c43c42ee4a05a44.png' },
  { id: 2, name: '匀', src: './img/75751ed542189c0a097a4b36985c78f5.png' },
  { id: 3, name: '中', src: './img/99a786f070468cfc2ee2fe2d3b2749c8.png' },
  { id: 4, name: '夫', src: './img/02743ce3e1d7806aec6c18836c1edfb5.png' }
];

// 初始布局：0为可点击空格，正数为固定符号
const INITIAL_BOARD = [
  [1, 2, 0, 4],
  [2, 0, 4, 3],
  [3, 4, 1, 0],
  [0, 3, 2, 0]
];

let currentBoard = JSON.parse(JSON.stringify(INITIAL_BOARD));

function initGame() {
  const grid = document.getElementById('game-grid');
  grid.innerHTML = '';

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      if (INITIAL_BOARD[r][c] !== 0) {
        cell.classList.add('fixed');
      }

      const symbolId = currentBoard[r][c];
      if (symbolId !== 0) {
        const img = document.createElement('img');
        img.src = SYMBOLS.find(s => s.id === symbolId).src;
        cell.appendChild(img);
      }

      cell.onclick = () => handleCellClick(r, c);
      grid.appendChild(cell);
    }
  }
}

function handleCellClick(r, c) {
  if (INITIAL_BOARD[r][c] !== 0) return; // 固定格不可点

  // 循环切换：0 -> 1 -> 2 -> 3 -> 4 -> 0
  currentBoard[r][c] = (currentBoard[r][c] + 1) % 5;

  renderBoard();
  checkWin();
}

function renderBoard() {
  const cells = document.querySelectorAll('.grid-cell');
  currentBoard.flat().forEach((val, i) => {
    cells[i].innerHTML = '';
    if (val !== 0) {
      const img = document.createElement('img');
      img.src = SYMBOLS.find(s => s.id === val).src;
      cells[i].appendChild(img);
    }
  });
}

function checkWin() {
  // 检查是否填满
  if (currentBoard.flat().includes(0)) return;

  // 检查行/列重复
  for (let i = 0; i < 4; i++) {
    const row = currentBoard[i];
    const col = currentBoard.map(r => r[i]);
    if (new Set(row).size !== 4 || new Set(col).size !== 4) {
      return;
    }
  }

  setTimeout(() => {
    document.getElementById('winOverlay').classList.add('show');
  }, 100);
}

document.addEventListener('DOMContentLoaded', initGame);
