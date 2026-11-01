import { chromium } from '/root/rerasa-motion/showcase-ui/node_modules/playwright-core';

const VIEWPORTS = [
  { name: 'iPhone SE (375x667)', width: 375, height: 667 },
  { name: 'Android Standard (390x844)', width: 390, height: 844 },
  { name: 'Tablet Portrait (768x1024)', width: 768, height: 1024 },
];

const ROUTES = [
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/', name: 'Kasir POS' },
  { path: '/inventory', name: 'Monitoring Stok' },
  { path: '/transfers', name: 'Mutasi Barang' },
];

async function runAudit() {
  console.log('=== STARTING AUDIT FOR POS-MULTICABANG ===');

  // Spawn preview server or check build
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/local/bin/chromium',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  // Start Vite dev server on port 4173 with API plugin
  const proc = Bun.spawn(['bun', 'run', 'dev', '--port', '4173', '--host', '127.0.0.1'], {
    cwd: '/root/pos-multicabang',
    stdout: 'inherit',
    stderr: 'inherit',
  });

  // Wait up to 10s for server to be responsive
  let started = false;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:4173/api/health');
      if (res.ok) {
        started = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  if (!started) console.log('Warning: Server did not respond to health check in time');

  let hasErrors = false;

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n--- Viewport: ${vp.name} ---`);
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.width < 768,
      });
      const page = await ctx.newPage();

      for (const r of ROUTES) {
        const url = `http://localhost:4173${r.path}`;
        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 8000 });
          await page.waitForTimeout(300);

          const overflow = await page.evaluate(() => {
            const doc = document.documentElement;
            const body = document.body;
            const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
            const clientW = doc.clientWidth;
            return {
              scrollW,
              clientW,
              hasLeak: scrollW > clientW + 2,
            };
          });

          const status = overflow.hasLeak ? '❌ LEAK' : '✓ OK';
          console.log(`  [${r.name}] ${status} (scroll: ${overflow.scrollW}px, client: ${overflow.clientW}px)`);
          if (overflow.hasLeak) hasErrors = true;
        } catch (e: any) {
          console.log(`  [${r.name}] ⚠️ Error: ${e.message}`);
        }
      }
      await ctx.close();
    }
  } finally {
    proc.kill();
    await browser.close();
  }

  console.log('\n=== AUDIT FINISHED ===');
}

runAudit().catch(console.error);
