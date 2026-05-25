#!/usr/bin/env node
/**
 * GitHub Trending Fetcher
 * Fetches trending repositories from github.com/trending using Playwright
 *
 * Usage:
 *   node fetch_trending.js --since daily              # markdown table (legacy)
 *   node fetch_trending.js --since weekly
 *   node fetch_trending.js --since monthly
 *   node fetch_trending.js --since daily --json       # JSON output (for LLM enrichment)
 */

const { chromium } = require('/usr/lib/node_modules/playwright');

const args = process.argv.slice(2);
function getArg(name, fallback) {
  const eq = args.find(a => a.startsWith(`--${name}=`));
  if (eq) return eq.split('=')[1];
  const idx = args.indexOf(`--${name}`);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) return args[idx + 1];
  return fallback;
}
const since = ['daily', 'weekly', 'monthly'].includes(getArg('since')) ? getArg('since') : 'daily';
const asJson = args.includes('--json');

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

    if (asJson) {
      console.log(JSON.stringify({ date, since, label, count: repos.length, repos }, null, 2));
      return;
    }

    const ICON_POOL = ['🚀','✨','🔥','⚡','💎','🌟','🎯','🛠️','🧩','🧠','🤖','📦','🔧','🔬','🧪','🪄','🛸','🦾','🦄','🐙','🐍','🦊','🐳','🪐','🌈','🎨','📡','🧭','🗺️','🧰','⚙️','🪛','🔭','🧬','🪶','🔮','💡','📊','🛰️','🧱','🏗️','🎮','📚','🎬','🎼','🌐','🎭','🪙','🧮','🛎️'];
    function shuffled(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    let icons = shuffled(ICON_POOL);
    function nextIcon() {
      if (icons.length === 0) icons = shuffled(ICON_POOL);
      return icons.pop();
    }

    console.log(`**${label} GitHub Trending · ${date}**\n`);
    repos.forEach((r, i) => {
      const desc = (r.desc || '').slice(0, 200);
      const icon = nextIcon();
      console.log(`${i+1}. ${icon} **${r.name}** · \`${r.lang}\` · ⭐ ${r.stars}`);
      if (desc) console.log(`   📝 ${desc}`);
      console.log(`   🔗 ${r.href}`);
      console.log('');
    });
    console.log(`---\n数据来源: github.com/trending (${since})`);
    console.log(`\n__REPOS_COUNT__:${repos.length}`);

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
