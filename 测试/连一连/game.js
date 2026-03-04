const BASE_ITEMS = [
    { id: "item1", icon: "🙂", bottomText: "牙", color: "#ff6b6b" },
    { id: "item2", icon: "💧", bottomText: "尿尿", color: "#4d96ff" },
    { id: "item3", icon: "👶", bottomText: "宝宝", color: "#6bcb77" },
    { id: "item4", icon: "💨", bottomText: "臭臭", color: "#ffd93d" },
    { id: "item5", icon: "🦷", bottomText: "齿", color: "#a78bfa" }
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

const VIEWBOX_WIDTH = 800;
const SVG_NS = "http://www.w3.org/2000/svg";

let layoutIndex = Math.floor(Math.random() * LAYOUTS.length);
let selectedTop = null;
let selectedBottom = null;
let solvedIds = new Set();
let renderedSolvedIds = new Set();
let wrongBottomId = null;
let wrongTimerId = null;
let statusText = "请选择一个上方图标开始";
let statusTone = "normal";

const refs = {
    topRow: null,
    bottomRow: null,
    pathLayer: null,
    statusMsg: null,
    progressMsg: null,
    rulesPanel: null,
    winOverlay: null
};

function getGameData() {
    return BASE_ITEMS.map((item, index) => ({
        ...item,
        ...LAYOUTS[layoutIndex][index]
    }));
}

function setStatus(text, tone = "normal") {
    statusText = text;
    statusTone = tone;
    renderStatus();
}

function renderStatus() {
    refs.statusMsg.textContent = statusText;
    refs.statusMsg.classList.remove("error", "success");
    if (statusTone === "error") {
        refs.statusMsg.classList.add("error");
    }
    if (statusTone === "success") {
        refs.statusMsg.classList.add("success");
    }
}

function renderProgress() {
    refs.progressMsg.textContent = `已完成 ${solvedIds.size}/${BASE_ITEMS.length}`;
}

function createPath(pathData, className, strokeColor = "") {
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", pathData);
    path.setAttribute("class", className);
    if (strokeColor) {
        path.setAttribute("stroke", strokeColor);
    }
    return path;
}

function renderPaths(gameData) {
    gameData.forEach((item) => {
        if (solvedIds.has(item.id) && !renderedSolvedIds.has(item.id)) {
            const solvedPath = createPath(item.path, "path-solved", item.color);
            refs.pathLayer.appendChild(solvedPath);
            renderedSolvedIds.add(item.id);
        }
    });
}

function renderTopButtons(gameData) {
    refs.topRow.innerHTML = "";

    gameData.forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "pick-btn top-btn";
        if (selectedTop === item.id) {
            button.classList.add("selected");
        }
        if (solvedIds.has(item.id)) {
            button.classList.add("solved");
        }
        button.style.left = `${(item.startX / VIEWBOX_WIDTH) * 100}%`;
        button.textContent = item.icon;
        button.addEventListener("click", () => handleTopClick(item.id));
        refs.topRow.appendChild(button);
    });
}

function renderBottomButtons(gameData) {
    refs.bottomRow.innerHTML = "";

    gameData.forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "pick-btn bottom-btn";
        if (selectedBottom === item.id) {
            button.classList.add("selected");
        }
        if (solvedIds.has(item.id)) {
            button.classList.add("solved");
        }
        if (wrongBottomId === item.id) {
            button.classList.add("wrong");
        }
        button.style.left = `${(item.endX / VIEWBOX_WIDTH) * 100}%`;
        button.textContent = item.bottomText;
        button.addEventListener("click", () => handleBottomClick(item.id));
        refs.bottomRow.appendChild(button);
    });
}

function render() {
    const gameData = getGameData();
    renderTopButtons(gameData);
    renderBottomButtons(gameData);
    renderPaths(gameData);
    renderStatus();
    renderProgress();
}

function clearWrongStateLater() {
    if (wrongTimerId !== null) {
        window.clearTimeout(wrongTimerId);
    }
    wrongTimerId = window.setTimeout(() => {
        wrongBottomId = null;
        render();
    }, 420);
}

function handleMatch(topId, bottomId) {
    if (topId === bottomId) {
        solvedIds.add(topId);
        selectedTop = null;
        selectedBottom = null;
        wrongBottomId = null;

        if (solvedIds.size === BASE_ITEMS.length) {
            setStatus("全部匹配完成，挑战成功", "success");
            setTimeout(() => {
                refs.winOverlay.classList.add("show");
            }, 800);
        } else {
            setStatus("匹配正确，继续下一组", "success");
        }

        render();
        return;
    }

    selectedTop = null;
    selectedBottom = null;
    wrongBottomId = bottomId;
    setStatus("匹配错误，请重试", "error");
    render();
    clearWrongStateLater();
}

function handleTopClick(topId) {
    if (solvedIds.has(topId)) {
        return;
    }

    if (selectedBottom !== null) {
        handleMatch(topId, selectedBottom);
        return;
    }

    selectedTop = selectedTop === topId ? null : topId;
    if (selectedTop === null) {
        setStatus("请选择一个上方图标开始");
    } else {
        setStatus("已选中图标，请点击下方文字");
    }
    render();
}

function handleBottomClick(bottomId) {
    if (solvedIds.has(bottomId)) {
        return;
    }

    if (selectedTop !== null) {
        handleMatch(selectedTop, bottomId);
        return;
    }

    selectedBottom = selectedBottom === bottomId ? null : bottomId;
    if (selectedBottom === null) {
        setStatus("请选择一个上方图标开始");
    } else {
        setStatus("已选中文字，请点击上方图标");
    }
    render();
}

function resetRound() {
    selectedTop = null;
    selectedBottom = null;
    solvedIds = new Set();
    renderedSolvedIds = new Set();
    wrongBottomId = null;
    if (wrongTimerId !== null) {
        window.clearTimeout(wrongTimerId);
        wrongTimerId = null;
    }
    refs.winOverlay.classList.remove("show");
    setStatus("请选择一个上方图标开始");

    const gameData = getGameData();
    refs.pathLayer.innerHTML = "";
    gameData.forEach((item) => {
        refs.pathLayer.appendChild(createPath(item.path, "path-shadow"));
        refs.pathLayer.appendChild(createPath(item.path, "path-base"));
    });

    render();
}

function nextLayout() {
    layoutIndex = Math.floor(Math.random() * LAYOUTS.length);
    resetRound();
}

function bindRulesPanel() {
    const toggleButton = document.getElementById("toggleRules");
    toggleButton.addEventListener("click", (event) => {
        event.stopPropagation();
        refs.rulesPanel.classList.toggle("open");
    });

    refs.rulesPanel.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    document.addEventListener("click", () => {
        refs.rulesPanel.classList.remove("open");
    });
}

function bindControls() {
    document.getElementById("resetBtn").addEventListener("click", resetRound);
    document.getElementById("nextLayoutBtn").addEventListener("click", nextLayout);
    document.getElementById("winReplayBtn").addEventListener("click", resetRound);
    document.getElementById("closeWin").addEventListener("click", () => {
        refs.winOverlay.classList.remove("show");
    });
}

function init() {
    refs.topRow = document.getElementById("topRow");
    refs.bottomRow = document.getElementById("bottomRow");
    refs.pathLayer = document.getElementById("pathLayer");
    refs.statusMsg = document.getElementById("statusMsg");
    refs.progressMsg = document.getElementById("progressMsg");
    refs.rulesPanel = document.getElementById("rulesPanel");
    refs.winOverlay = document.getElementById("winOverlay");

    const gameData = getGameData();
    gameData.forEach((item) => {
        refs.pathLayer.appendChild(createPath(item.path, "path-shadow"));
        refs.pathLayer.appendChild(createPath(item.path, "path-base"));
    });

    bindRulesPanel();
    bindControls();
    render();
}

document.addEventListener("DOMContentLoaded", init);
