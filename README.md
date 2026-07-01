# 用户洞察知识库

从心理学理论到游戏设计实践，以**问题驱动**的方式系统化积累用户洞察。

## 快速开始

```bash
npm install
npm run dev          # 启动开发服务器 http://localhost:4321
npm run build        # 构建生产版本
npm run validate     # 校验所有知识卡片格式
```

## 知识卡片结构

每张卡片统一遵循五段式结构：

```
🎯 问题 → 📐 理论 → ⚙️ 机制 → 🎮 应用 → ✅ 验证
```

### 卡片模板

复制 `src/content/knowledge/_template.md` 到对应模块目录，填写内容：

```markdown
---
id: "your-card-id"
title: "知识卡片标题"
module: "模块名称"
tags: ["标签1", "标签2"]
difficulty: "基础"  # 基础 | 进阶 | 高级
prerequisites: []   # 前置知识卡片 id
related: []         # 相关卡片 id
status: "draft"     # draft | review | published
author: "your-name"
date: 2024-01-01
---
```

## 模块目录

| 目录 | 模块 | 说明 |
|---|---|---|
| `01-motivation/` | 动机与需求 | 玩家为什么玩？ |
| `02-cognition/` | 认知与决策 | 玩家如何思考？ |
| `03-behavior/` | 行为与成瘾 | 玩家如何形成习惯？ |
| `04-emotion/` | 情感与体验 | 玩家感受如何？ |
| `05-social/` | 社会与群体 | 多人场景下玩家行为？ |
| `06-data/` | 数据与验证 | 如何用数据验证洞察？ |
| `07-neuroscience/` | 神经科学基础 | 大脑层面的解释 |
| `08-patterns/` | 设计模式库 | 可复用的设计模板 |

## Agent 添加内容流程

1. 读取模板：`src/content/knowledge/_template.md`
2. 按五段式结构填写内容
3. 写入对应模块目录（如 `02-cognition/attention.md`）
4. 运行 `npm run validate` 校验格式
5. Git commit + PR
6. GitHub Actions 自动构建部署

## 部署

项目配置了 GitHub Actions 自动部署到 GitHub Pages：

1. 推送到 `main` 分支
2. 自动运行校验脚本
3. 自动构建静态站点
4. 自动部署到 GitHub Pages

## 技术栈

- [Astro](https://astro.build/) - 静态站点生成器
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架
- [Markdown](https://www.markdownguide.org/) - 内容格式
- [GitHub Pages](https://pages.github.com/) - 部署平台
