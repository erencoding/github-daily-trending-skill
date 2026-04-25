#!/usr/bin/env node
/**
 * GitHub Trending Fetcher
 * Fetches trending repositories from github.com/trending using Playwright
 * 
 * Usage:
 *   node fetch_trending.js --since daily    # today's trending
 *   node fetch_trending.js --since weekly   # this week's trending
 *   node fetch_trending.js --since monthly  # this month's trending
 */

const { chromium } = require('/usr/lib/node_modules/playwright');
const path = require('path');

const since = process.argv.includes('--since=weekly') ? 'weekly'
  : process.argv.includes('--since=monthly') ? 'monthly'
  : 'daily';

const url = `https://github.com/trending${since !== 'daily' ? `?since=${since}` : ''}`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });

  try {
    await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(3000);

    const repos = await page.evaluate(() => {
      const articles = document.querySelectorAll('article');
      return Array.from(articles).map(el => {
        const h2 = el.querySelector('h2');
        const name = h2 ? h2.textContent.trim().replace(/\s+/g, ' ') : '';
        const lang = el.querySelector('[itemprop="programmingLanguage"]')
          ? el.querySelector('[itemprop="programmingLanguage"]').textContent.trim()
          : '—';
        const starsLink = el.querySelector('a[href*="stargazers"]');
        const stars = starsLink ? starsLink.textContent.trim() : '0';
        const desc = el.querySelector('p') ? el.querySelector('p').textContent.trim() : '';
        const linkEl = el.querySelector('h2 a');
        const href = linkEl ? 'https://github.com' + linkEl.getAttribute('href') : '';
        return { name, lang, stars, desc, href };
      }).filter(r => r.name);
    });

    const date = new Date().toISOString().split('T')[0];
    const labels = { daily: '今日', weekly: '本周', monthly: '本月' };
    const label = labels[since];

    console.log(`**${label} GitHub Trending · ${date}**\n`);
    console.log(`| # | 仓库 | 语言 | ⭐ | 链接 |`);
    console.log(`|---|---|---|---|---|`);
    repos.forEach((r, i) => {
      console.log(`| ${i+1} | ${r.name} | ${r.lang} | ${r.stars} | ${r.href} |`);
    });
    console.log(`\n---\n数据来源: github.com/trending (${since})`);
    console.log(`\n__REPOS_COUNT__:${repos.length}`);

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
