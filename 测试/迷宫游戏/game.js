const icons = [
    `<svg viewBox="0 0 100 100"><path d="M10,50 Q50,10 90,50 Q50,90 10,50 M35,50 A15,15 0 1,1 65,50 A15,15 0 1,1 35,50" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="50" r="6" fill="currentColor"/></svg>`,
    `<svg viewBox="0 0 100 100"><path d="M15,40 Q50,5 85,40 Q50,75 15,40 M40,40 A10,10 0 1,1 60,40 A10,10 0 1,1 40,40" fill="none" stroke="currentColor" stroke-width="4"/><path d="M30,70 Q35,60 40,70 T50,70 T70,70" fill="none" stroke="currentColor" stroke-width="3"/><path d="M35,75 L35,85 M50,75 L50,90 M65,75 L65,85" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
    `<svg viewBox="0 0 100 100"><path d="M40,10 Q70,50 40,90 M60,10 Q30,50 60,90" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="45" r="8" fill="currentColor"/><path d="M45,70 Q50,85 55,70" fill="none" stroke="currentColor" stroke-width="4"/></svg>`,
    `<svg viewBox="0 0 100 100"><path d="M20,60 Q50,30 80,60 Q50,90 20,60" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="60" r="10" fill="none" stroke="currentColor" stroke-width="3"/><path d="M35,25 L30,15 M50,20 L50,10 M65,25 L70,15" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`
];

const names = ["面", "泪", "见", "眉"];

const mapData = [
    [-3, 3, 1, 3, 2, 1, -3],
    [-1, 0, 1, 3, 1, 3, -2],
    [0, 2, 2, 1, 3, 1, 2],
    [1, 0, 3, 0, 3, 0, 0],
    [3, 3, 0, 3, 2, 1, 3],
    [1, 0, 1, 3, 1, 2, 2],
    [2, 1, 2, 3, 0, 3, 1],
    [-3, 1, 0, 3, 2, 2, -3]
];

const styleMap = [
    [0, 2, 3, 3, 2, 2, 0],
    [0, 3, 2, 1, 3, 2, 0],
    [2, 2, 1, 1, 1, 3, 2],
    [2, 2, 3, 3, 2, 1, 2],
    [1, 2, 1, 1, 2, 3, 3],
    [2, 1, 1, 3, 1, 2, 2],
    [1, 2, 2, 3, 1, 2, 0],
    [0, 2, 2, 3, 1, 2, 0]
];

let currentPos = null;
let nextIconIndex = 0;
let pathHistory = [];
let gameWon = false;

function init() {
    console.log('init called');
    const legend = document.getElementById('legend');
    if (!legend) {
        console.error('legend element not found!');
        return;
    }
    names.forEach((name, i) => {
        const div = document.createElement('div');
        div.className = 'seq-item';
        div.innerHTML = icons[i] + '<div class="label">' + name + '</div>';
        legend.appendChild(div);
        if(i < 3) {
            const arrow = document.createElement('div');
            arrow.className = 'seq-arrow';
            arrow.innerText = '->';
            legend.appendChild(arrow);
        }
    });
    renderMaze();
}

function renderMaze() {
    const mazeDiv = document.getElementById('maze');
    mazeDiv.innerHTML = '';

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 7; c++) {
            const val = mapData[r][c];
            if (val === -3) {
                const spacer = document.createElement('div');
                mazeDiv.appendChild(spacer);
                continue;
            }

            const tile = document.createElement('div');
            tile.className = 'tile bg-' + styleMap[r][c];
            tile.dataset.r = r;
            tile.dataset.c = c;

            if (val === -1) {
                tile.innerHTML = '<div class="label">入口<br>-></div>';
            } else if (val === -2) {
                tile.innerHTML = '<div class="label">出口<br>^</div>';
            } else {
                tile.innerHTML = icons[val];
                tile.style.color = (styleMap[r][c] === 3) ? '#54675c' : '#6f8478';
            }

            tile.onclick = function() { handleTileClick(r, c); };
            mazeDiv.appendChild(tile);
        }
    }

    // 添加 SVG 连线层
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('path-svg');
    svg.id = 'pathSvg';
    const tileSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--tile-size'));
    const svgW = 7 * tileSize + 6 * 2;
    const svgH = 8 * tileSize + 7 * 2;
    svg.setAttribute('viewBox', '0 0 ' + svgW + ' ' + svgH);
    svg.setAttribute('preserveAspectRatio', 'none');
    mazeDiv.appendChild(svg);
}

function handleTileClick(r, c) {
    if (gameWon) return;

    const val = mapData[r][c];
    const msg = document.getElementById('status-msg');

    // 检查是否点击了已走过的路径（用于退回）
    const visitedIndex = pathHistory.findIndex(function(p) { return p.r === r && p.c === c; });
    if (visitedIndex !== -1 && visitedIndex < pathHistory.length - 1) {
        pathHistory = pathHistory.slice(0, visitedIndex + 1);
        currentPos = {r: r, c: c};
        nextIconIndex = pathHistory[visitedIndex].iconIdx;
        updatePathVisuals();
        highlightTile(r, c);
        msg.innerText = '已退回，当前寻找"' + names[nextIconIndex] + '"';
        msg.style.color = 'var(--text-color)';
        return;
    }

    if (val === -1) {
        resetState();
        currentPos = {r: r, c: c};
        pathHistory = [{r: r, c: c, iconIdx: 0}];
        nextIconIndex = 0;
        highlightTile(r, c);
        updatePathVisuals();
        msg.innerText = '已进入，请寻找"面"';
        return;
    }

    if (!currentPos) {
        msg.innerText = '请先点击入口!';
        return;
    }

    const isAdjacent = Math.abs(currentPos.r - r) + Math.abs(currentPos.c - c) === 1;
    if (!isAdjacent) {
        msg.innerText = '只能移动到相邻的方块哦!';
        return;
    }

    if (val === -2) {
        if (pathHistory.length < 5) {
            msg.innerText = '还没找完一轮图标，不能出去哦！';
            msg.style.color = 'red';
            return;
        }
        pathHistory.push({r: r, c: c, iconIdx: nextIconIndex});
        highlightTile(r, c);
        updatePathVisuals();
        gameWon = true;
        msg.innerText = '恭喜你！成功走出迷宫！';
        msg.style.color = 'green';
        // 显示胜利弹窗
        setTimeout(() => {
            document.getElementById('winOverlay').classList.add('show');
        }, 300);
        return;
    }

    if (val === nextIconIndex) {
        nextIconIndex = (nextIconIndex + 1) % 4;
        currentPos = {r: r, c: c};
        pathHistory.push({r: r, c: c, iconIdx: nextIconIndex});
        highlightTile(r, c);
        updatePathVisuals();
        msg.innerText = '正确！接下来找"' + names[nextIconIndex] + '"';
        msg.style.color = 'var(--text-color)';
    } else {
        msg.innerText = '顺序不对！应该是"' + names[nextIconIndex] + '"';
        msg.style.color = 'red';
    }
}

function updatePathVisuals() {
    document.querySelectorAll('.tile').forEach(function(t) {
        t.classList.remove('visited', 'visited-start', 'visited-end');
    });

    const svg = document.getElementById('pathSvg');
    svg.innerHTML = '';

    if (pathHistory.length < 2) {
        pathHistory.forEach(function(pos, index) {
            const tile = document.querySelector('.tile[data-r="' + pos.r + '"][data-c="' + pos.c + '"]');
            if (tile) {
                tile.classList.add('visited');
                if (index === 0) tile.classList.add('visited-start');
            }
        });
        return;
    }

    pathHistory.forEach(function(pos, index) {
        const tile = document.querySelector('.tile[data-r="' + pos.r + '"][data-c="' + pos.c + '"]');
        if (tile) {
            tile.classList.add('visited');
            if (index === 0) tile.classList.add('visited-start');
            if (index === pathHistory.length - 1) tile.classList.add('visited-end');
        }

        if (index < pathHistory.length - 1) {
            const nextPos = pathHistory[index + 1];
            void nextPos;
        }
    });
}

function highlightTile(r, c) {
    document.querySelectorAll('.tile').forEach(function(t) { t.classList.remove('active'); });
    const target = document.querySelector('.tile[data-r="' + r + '"][data-c="' + c + '"]');
    if (target) target.classList.add('active');
}

function resetState() {
    currentPos = null;
    nextIconIndex = 0;
    pathHistory = [];
    gameWon = false;
    document.getElementById('status-msg').style.color = 'var(--text-color)';
    document.getElementById('winOverlay').classList.remove('show');
}

function resetGame() {
    resetState();
    renderMaze();
    document.getElementById('status-msg').innerText = '游戏已重置，点击"入口"开始';
}

function undoStep() {
    if (pathHistory.length <= 1) {
        if (pathHistory.length === 1) {
            pathHistory = [];
            currentPos = null;
            nextIconIndex = 0;
            document.querySelectorAll('.tile').forEach(function(t) {
                t.classList.remove('active', 'visited', 'visited-start', 'visited-end');
            });
            document.getElementById('status-msg').innerText = '已退回到入口，请重新开始';
            document.getElementById('status-msg').style.color = 'var(--text-color)';
        } else {
            document.getElementById('status-msg').innerText = '还没有开始移动，无法后退';
        }
        return;
    }

    pathHistory.pop();
    const lastPos = pathHistory[pathHistory.length - 1];
    currentPos = {r: lastPos.r, c: lastPos.c};
    nextIconIndex = lastPos.iconIdx;

    updatePathVisuals();
    highlightTile(currentPos.r, currentPos.c);
    document.getElementById('status-msg').innerText = '已退回上一步，当前寻找"' + names[nextIconIndex] + '"';
    document.getElementById('status-msg').style.color = 'var(--text-color)';
}

document.addEventListener('DOMContentLoaded', init);
