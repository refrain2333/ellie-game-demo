# Ellie Game Demo 项目规范

## 默认 Skill 约定（重要）

本项目默认设计与还原相关工作，优先使用 `lanhu-to-game` skill 作为统一规范来源。

适用范围包括但不限于：
- 蓝湖设计稿还原与静态页转交互游戏
- 配色选择与主题变量规范
- 框架图/白框图层级判断（内层 `.grid-cell` vs 外层容器）
- 响应式断点与横屏布局调试
- 浏览器截图回归验证（Puppeteer / browser-use）
- 用户反馈“撤回”时的最小回滚策略

执行要求：
1. 遇到上述任务，默认先按 `~/.claude/skills/lanhu-to-game/SKILL.md` 执行。
2. 配色优先参考 `~/.claude/skills/lanhu-to-game/references/color-palette.md`。
3. 布局与白框素材引用优先参考 `~/.claude/skills/lanhu-to-game/references/layout-template.md`。
4. 每次前端修改后都要做截图验证，不跳过可视回归。

## 开发服务器

```bash
cd /Users/edy/项目/杂乱其他/ellie-game-demo
python3 -m http.server 8080
```

访问地址：http://192.168.2.6:8080

## 前端预览

每次修改前端文件后，使用 `browser-use` 检查渲染效果：

```bash
# 打开页面
browser-use open "http://192.168.2.6:8080/测试/迷宫游戏/index.html"

# 截图查看
browser-use screenshot /tmp/preview.png && open /tmp/preview.png
```

## 截图沉淀规范（重要）

所有回归截图统一沉淀到：

`/Users/edy/项目/杂乱其他/ellie-game-demo/Z-截图检测`

目录结构与命名规则：

```text
Z-截图检测/
└── <游戏文件夹名>/
    ├── web.jpg
    ├── web-修改.jpg
    ├── turn.jpg
    └── turn-修改.jpg
```

执行规则（每次新截图都必须遵守）：
1. 截图子目录名必须与对应游戏目录名完全一致（例如：`测试/1-涂一涂游戏` 对应 `Z-截图检测/1-涂一涂游戏/`）。
2. `web.jpg` 表示桌面端（常规 Web 端）截图；`turn.jpg` 表示手机横屏截图。
3. 若已有旧的 `web.jpg`，先重命名为 `web-修改.jpg`，再写入新的 `web.jpg`。
4. 若已有旧的 `turn.jpg`，先重命名为 `turn-修改.jpg`，再写入新的 `turn.jpg`。
5. 每种类型仅保留“修改版 + 新版”两张，禁止累积历史冗余图。
6. 新游戏目录命名优先用序号：`1-xxx游戏`、`2-xxx游戏`、`3-xxx游戏`。

## 项目结构

```
测试/
├── lanhu_44renxiawu41356/   # 逻辑符号解谜游戏
│   ├── index.html
│   ├── index.css
│   ├── game.js
│   └── img/
└── 迷宫游戏/
    ├── index.html
    ├── index.css
    └── game.js
```

## Git 提交规范

本地提交为主，提交信息格式：

```bash
git add .
git commit -m "描述内容"
```
