---
name: gh-daily-trending
description: Fetches GitHub trending repositories (daily/weekly/monthly) using Playwright and renders an LLM-enriched list with random icons, stars, language, description, 作用 / 应用场景 / 安装评分. Use when the user asks about GitHub trending, top repositories today, or wants a daily tech trending report.
version: "1.2"
author: Judy (朱迪)
license: MIT
---

# GitHub Daily Trending

Fetches GitHub trending repositories using Playwright (headless Chromium), parses article elements, and either prints a formatted list directly or emits structured JSON for LLM enrichment.

## Usage

```
今日GitHubTrending
今日GitHub趋势
github trending
本周GitHubTrending
本月GitHubTrending
```

## Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--since` | Time range: `daily`, `weekly`, `monthly` | `daily` |
| `--json`  | Output structured JSON instead of list | off |

## Workflow

### Step 1: Check Playwright

```bash
playwright --version
node -e "require('/usr/lib/node_modules/playwright')" 2>/dev/null && echo "OK"
```

### Step 2: Fetch Trending

**Always use background mode** — Playwright Chromium launch + page load can exceed the 600s foreground limit. Set proxy env vars first.

```bash
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890

# JSON mode (recommended — feeds clean data to the agent for enrichment)
node /root/.hermes/skills/gh-daily-trending/scripts/fetch_trending.js --since daily --json

# List mode (basic markdown list, no enrichment)
node /root/.hermes/skills/gh-daily-trending/scripts/fetch_trending.js --since daily
```

### Step 3: Enrich and render the list

When called via cron / agent, parse the JSON, then for each repo derive four fields from `name + desc + lang`:

- **作用** (function): a one-line summary of what the repo *does* (technical role).
- **应用场景** (use case): typical scenarios where you'd actually pull this in.
- **安装评分** (install score, 1–10): how worthwhile it is to install into the *current* agent. Anchors:
  - 9–10: directly extends agent capabilities (skills, MCP servers, tools, CLIs the agent can run).
  - 7–8: high-quality library / framework relevant to agent's stack (Node/Python/LLM/automation).
  - 5–6: notable project, learnable, but not directly installable.
  - 3–4: niche / unrelated language / no agent integration path.
  - 1–2: course material, awesome-list, decorative repo, or duplicate of something already installed.
- **安装建议** (install verdict): a clear go / no-go decision derived from the score, formatted as one of:
  - `✅ 安装` (评分 ≥ 7 或对当前 agent 有直接集成路径)
  - `🤔 观望` (评分 4–6，值得了解但不急于安装)
  - `❌ 跳过` (评分 ≤ 3，不相关 / 无集成 / 已有替代)

  Pair the verdict with a one-line **决策理由** (≤30 chars, 中文) that says *why* — focus on the integration path or the blocker, not on what the repo does.

### Step 4: Random icon pool

Pick a random icon **for each repo** from this pool (do NOT reuse the same icon across the whole list — shuffle, then assign):

```
🚀 ✨ 🔥 ⚡ 💎 🌟 🎯 🛠️ 🧩 🧠 🤖 📦 🔧 🔬 🧪 🪄 🛸 🦾 🦄 🐙 🐍 🦊 🐳 🪐 🌈 🎨 📡 🧭 🗺️ 🧰 ⚙️ 🪛 🔭 🧬 🪶 🔮 💡 📊 🛰️ 🧱 🏗️ 🎮 📚 🎬 🎼 🌐 🎭 🪙 🧮 🛎️
```

If the pool runs out, re-shuffle.

### Step 5: Render Markdown list

Format each repo as a numbered block with the icon leading. Keep it scannable, not crowded.

```markdown
**🌞 GitHub 今日 Trending · YYYY-MM-DD**

1. 🚀 **owner/repo** · `Python` · ⭐ 1,234 · **8/10** · ✅ 安装
   📝 <英文原简介>
   🎯 作用：<一句话作用>
   💼 应用场景：<典型应用场景>
   📌 建议：<决策理由>
   🔗 https://github.com/owner/repo

2. 🧠 **owner/repo2** · `TypeScript` · ⭐ 5,678 · **6/10** · 🤔 观望
   📝 …
   🎯 作用：…
   💼 应用场景：…
   📌 建议：…
   🔗 …

---
数据来源: github.com/trending (daily)
```

Notes when rendering:
- The leading icon (1st emoji on the title line) is the random one from the pool. The line-prefix icons (📝 🎯 💼 📌 🔗) are fixed labels — keep them as shown.
- The verdict on the title line (`✅ 安装` / `🤔 观望` / `❌ 跳过`) must match the score band exactly.
- 简介 stays in the original language (usually English) — truncate to ≤140 chars.
- 作用 / 应用场景 / 建议 in 中文, ≤30 chars each.
- 安装评分 format: `N/10` bold, integer 1–10.
- Use a blank line between items so Feishu renders the spacing cleanly.

## Maintenance

Rendering rules in this SKILL.md are duplicated inside two cron prompts that consume this skill:

- `每日GitHub Trending` (id `9b210043f81d`, daily 06:10) — `--since daily`
- `每周GitHub Trending` (id `501b9d1b0366`, weekly Mon 06:00) — `--since weekly`

Whenever the **render format changes** (icons, columns, list vs table, field labels), update **all three** in the same change to avoid drift:
1. This SKILL.md (Step 5 / render block)
2. The default markdown branch in `scripts/fetch_trending.js`
3. Both cron prompts via `cronjob action=update job_id=… prompt=…` — keep `skills=["gh-daily-trending"]` linked

The `--json` schema (`{ date, since, label, count, repos }`) is the stable contract — don't rename keys; add new ones if enrichment fields need to be carried through.

## Troubleshooting

- **Foreground timeout**: always run with `background=true` + `notify_on_complete=true`, then `process wait`.
- **"Module not found"**: `npm install -g playwright` and ensure chromium is installed.
- **Empty results**: GitHub may have changed page structure; check `article` elements still exist.
- **Network unreachable**: terminal does not pick up system proxy by default — export `HTTP_PROXY` / `HTTPS_PROXY` to `http://127.0.0.1:7890`. Verify with `curl -s -o /dev/null -w "%{http_code}" -x http://127.0.0.1:7890 https://github.com`. Clash must be running with GLOBAL/Auto mode.
