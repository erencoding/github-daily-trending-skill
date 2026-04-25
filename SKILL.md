---
name: gh-weekly-trending
description: Fetches GitHub trending repositories for the week using Playwright and generates a formatted markdown table with stars, language, and repository links. Use when the user asks about weekly GitHub trending, top repositories this week, or wants a weekly tech trending report.
version: "1.0"
author: Judy (朱迪)
license: MIT
---

# GitHub Weekly Trending

Fetches GitHub weekly trending repositories using Playwright (headless Chromium), parses article elements, and outputs a clean markdown table with repository info and direct links.

## Usage

```
本周GitHubTrending
github weekly trending
GitHub本周趋势
```

## Workflow

Run the fetcher script:
```bash
node /root/.openclaw/workspace/.agents/skills/gh-weekly-trending/scripts/fetch_trending.js
```

## Output Format

The script returns a formatted markdown table:

```markdown
**📅 GitHub 本周 Trending · YYYY-MM-DD**

| # | 仓库 | 语言 | ⭐ | 链接 |
|---|---|---|---|---|
| 1 | owner/repo | Language | 1,234 | https://github.com/owner/repo |
...

---
数据来源: github.com/trending (weekly)
```
