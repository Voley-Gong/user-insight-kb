const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG_PATH = path.join(__dirname, 'auto-content-config.json');
const KNOWLEDGE_DIR = path.join(__dirname, '..', 'src', 'content', 'knowledge');
const TEMPLATE_PATH = path.join(KNOWLEDGE_DIR, '_template.md');

const MODULES = [
  { dir: '01-motivation', title: '动机与需求', icon: '🎯', description: '玩家为什么玩？理解驱动行为的底层需求' },
  { dir: '02-cognition', title: '认知与决策', icon: '🧠', description: '玩家如何思考？认知负荷、注意力、记忆、偏差' },
  { dir: '03-behavior', title: '行为与成瘾', icon: '⚡', description: '玩家如何形成习惯？强化、心流、峰终体验' },
  { dir: '04-emotion', title: '情感与体验', icon: '💫', description: '玩家感受如何？情感设计、享乐适应、情绪模型' },
  { dir: '05-social', title: '社会与群体', icon: '👥', description: '多人场景下玩家行为？社会认同、比较、群体动力' },
  { dir: '06-data', title: '数据与验证', icon: '📊', description: '如何用数据验证洞察？行为分析、A/B测试、用户画像' },
  { dir: '07-neuroscience', title: '神经科学基础', icon: '🔬', description: '大脑层面的解释：多巴胺、镜像神经元、压力系统' },
  { dir: '08-patterns', title: '设计模式库', icon: '🏗️', description: '可复用的设计模板：留存、付费、难度、社交' },
];

function loadConfig() {
  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
  return JSON.parse(raw);
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

function countCards(moduleDir) {
  const dir = path.join(KNOWLEDGE_DIR, moduleDir);
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('_')).length;
}

function getCurrentModule(config) {
  for (const mod of MODULES) {
    const count = countCards(mod.dir);
    if (count < config.targetCardsPerModule) {
      return { ...mod, currentCount: count };
    }
  }
  return null;
}

function getExistingCardIds() {
  const ids = [];
  for (const mod of MODULES) {
    const dir = path.join(KNOWLEDGE_DIR, mod.dir);
    if (!fs.existsSync(dir)) continue;
    fs.readdirSync(dir)
      .filter(f => f.endsWith('.md') && !f.startsWith('_'))
      .forEach(f => ids.push(f.replace('.md', '')));
  }
  return ids;
}

function getDifficultyDistribution(currentCount, target) {
  if (currentCount < 20) return '基础';
  if (currentCount < 40) return '进阶';
  return '高级';
}

function buildPrompt(mod, difficulty, existingIds, existingCards) {
  const existingList = existingCards.slice(-5).map(c =>
    `- ${c.id}: ${c.title} (${c.difficulty})`
  ).join('\n');

  return `你是一个游戏设计知识库的内容创作者。请为"${mod.title}"模块创建一篇知识卡片。

## 模块信息
- 模块名称: ${mod.title}
- 模块描述: ${mod.description}
- 当前进度: ${mod.currentCount}/${50} 篇
- 本次难度级别: ${difficulty}

## 最近已有卡片（避免重复）
${existingList || '暂无'}

## 输出要求

请严格按照以下格式输出，不要添加任何额外内容：

---
id: "唯一英文id"
title: "中文标题"
module: "${mod.title}"
tags: ["标签1", "标签2", "标签3"]
difficulty: "${difficulty}"
prerequisites: []
related: []
status: "published"
author: "auto-agent"
date: "${new Date().toISOString().split('T')[0]}"
---

## 🎯 这个理论解决什么问题？

> "用一句反直觉或有冲击力的话描述这个问题"

## 📐 核心理论

**先给一句话结论**，再展开。避免罗列式定义。

## ⚙️ 底层机制

用类比解释机制，而不是抽象流程图。

## 🎮 游戏设计应用

**先讲一个真实踩坑故事**，再给设计手段。用表格总结。

## ✅ 设计检查清单

精简到 3-5 条。

## 📊 数据验证方法

只列最关键的 2-3 个指标。

## 📖 新概念解析

| 概念 | 一句话定义 | 应用场景 |
|---|---|---|

## 🔗 延伸阅读

- [相关卡片](/card/卡片id) — 一句话说明

## 💡 个人洞察

有态度的观点。

## 🔭 下次玩游戏时观察

给读者一个可执行的观察任务。

---

要求：
1. id 必须是英文小写+连字符，如 "intrinsic-motivation"
2. 内容要有深度，不是泛泛而谈
3. 游戏案例要真实（原神、王者荣耀、英雄联盟等）
4. 个人洞察要有态度，敢于表达观点
5. 不要用教科书风格，要像有趣的博客文章
6. 如果有前置依赖，填写 prerequisites 数组`;
}

async function callAI(config, prompt) {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API Error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function extractId(content) {
  const match = content.match(/^id:\s*["'](.+?)["']/m);
  return match ? match[1] : null;
}

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : null;
}

function saveCard(moduleDir, filename, content) {
  const dir = path.join(KNOWLEDGE_DIR, moduleDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, content, 'utf-8');
  return filepath;
}

function validate() {
  try {
    execSync('node scripts/validate-cards.cjs', {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
    });
    return true;
  } catch (e) {
    return false;
  }
}

function gitCommit(filename, moduleDir) {
  try {
    execSync(`git add src/content/knowledge/${moduleDir}/${filename}`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
    });
    execSync(`git commit -m "feat(${moduleDir}): auto-add ${filename.replace('.md', '')} knowledge card"`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
    });
    return true;
  } catch (e) {
    console.error('Git commit failed:', e.message);
    return false;
  }
}

async function main() {
  console.log('=== 自动内容生成任务启动 ===');
  console.log(`时间: ${new Date().toLocaleString('zh-CN')}`);

  const config = loadConfig();

  if (config.apiKey === 'YOUR_API_KEY_HERE') {
    console.error('❌ 请先配置 API Key！编辑 scripts/auto-content-config.json');
    process.exit(1);
  }

  const currentModule = getCurrentModule(config);
  if (!currentModule) {
    console.log('✅ 所有模块已达到目标篇数！');
    process.exit(0);
  }

  console.log(`📚 当前模块: ${currentModule.title} (${currentModule.currentCount}/${config.targetCardsPerModule})`);

  const difficulty = getDifficultyDistribution(currentModule.currentCount, config.targetCardsPerModule);
  console.log(`📊 本次难度: ${difficulty}`);

  const existingIds = getExistingCardIds();
  console.log(`📋 已有卡片: ${existingIds.length} 张`);

  const existingCards = existingIds.slice(-10).map(id => {
    const parts = id.split('/');
    const filename = parts[parts.length - 1] + '.md';
    const dir = parts.length > 1 ? parts[0] : null;
    let filepath;
    if (dir) {
      filepath = path.join(KNOWLEDGE_DIR, dir, filename);
    } else {
      filepath = path.join(KNOWLEDGE_DIR, currentModule.dir, filename);
    }
    if (fs.existsSync(filepath)) {
      const content = fs.readFileSync(filepath, 'utf-8');
      const titleMatch = content.match(/^title:\s*["'](.+?)["']/m);
      const diffMatch = content.match(/^difficulty:\s*["'](.+?)["']/m);
      return {
        id: id,
        title: titleMatch ? titleMatch[1] : filename,
        difficulty: diffMatch ? diffMatch[1] : '基础',
      };
    }
    return { id, title: filename, difficulty: '基础' };
  });

  const prompt = buildPrompt(currentModule, difficulty, existingIds, existingCards);

  console.log('🤖 正在调用 AI 生成内容...');

  try {
    const content = await callAI(config, prompt);

    const cardId = extractId(content);
    if (!cardId) {
      console.error('❌ 无法从 AI 响应中提取卡片 ID');
      console.log('AI 响应前 500 字符:', content.substring(0, 500));
      process.exit(1);
    }

    if (existingIds.includes(cardId)) {
      console.error(`❌ 卡片 ID "${cardId}" 已存在，请重新生成`);
      process.exit(1);
    }

    const filename = `${cardId}.md`;
    const filepath = saveCard(currentModule.dir, filename, content);
    console.log(`✅ 卡片已保存: ${filepath}`);

    console.log('🔍 运行校验...');
    if (validate()) {
      console.log('✅ 校验通过');
    } else {
      console.error('❌ 校验失败，请检查卡片格式');
      process.exit(1);
    }

    console.log('📝 提交到 Git...');
    if (gitCommit(filename, currentModule.dir)) {
      console.log('✅ Git 提交成功');
    }

    console.log(`\n🎉 完成！新卡片: ${cardId}`);
    console.log(`📊 ${currentModule.title} 进度: ${currentModule.currentCount + 1}/${config.targetCardsPerModule}`);

  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    process.exit(1);
  }
}

main();
