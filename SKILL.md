---
name: gh-daily-trending
description: "Fetches GitHub trending repositories (daily/weekly/monthly) using Playwright and generates a formatted markdown table with stars, language, description and repository links. Use when the user asks about GitHub trending, top repositories today, or wants a daily tech trending report."
version: "2.0"
author: Judy (朱迪)
license: MIT
---

# GitHub Daily Trending

Fetches GitHub trending repositories using Playwright (headless Chromium), parses article elements, and outputs a clean markdown table with repository info and direct links.

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

## Workflow

### Step 1: Check Playwright

Verify Playwright is available before running. If not available, install it following the Playwright documentation.

### Step 2: Fetch Trending

Use Playwright to navigate to GitHub Trending page and extract repository data.

The page URL is: https://github.com/trending (with optional `?since=daily|weekly|monthly`)

### Step 3: Output Format

Present the data as a formatted markdown table:

```markdown
**🌞 GitHub 今日 Trending · YYYY-MM-DD**

| # | 仓库 | 语言 | ⭐ | 链接 |
|---|---|---|---|---|
| 1 | owner/repo | Language | 1,234 | https://github.com/owner/repo |
...

---
数据来源: github.com/trending
```

## Example Output (daily)

**🌞 GitHub 今日 Trending · 2026-04-26**

| # | 仓库 | 语言 | ⭐ | 链接 |
|---|---|---|---|---|
| 1 | codecrafters-io/build-your-own-x | Markdown | 495,793 | https://github.com/codecraftars-io/build-your-own-x |
...

## Troubleshooting

- **Playwright missing**: Ensure Playwright and Chromium are installed on the system
- **Empty results**: GitHub may have changed the page structure; check if `article` elements are still present
- **Timeout**: Increase the page load timeout
