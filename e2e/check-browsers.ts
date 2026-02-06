/**
 * 检查并安装 Playwright 浏览器
 *
 * 用于在运行 e2e 测试前确保浏览器已安装
 */

import { $ } from 'bun';

const BROWSER = 'chromium';

async function ensureBrowserInstalled() {
    console.log(`Checking Playwright browser (${BROWSER})...`);

    try {
        await $`bunx playwright install ${BROWSER}`.quiet();
        console.log('Browser ready!');
    } catch (error) {
        console.error('Failed to install browser:', error);
        process.exit(1);
    }
}

ensureBrowserInstalled();
