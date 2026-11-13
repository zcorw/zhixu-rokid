import {chromium} from 'playwright';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';
const server=spawn(process.execPath,['preview/server.js'],{stdio:'inherit'});let browser;
try{for(let i=0;i<50;i++){try{if((await fetch('http://127.0.0.1:4173')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:360,height:640}});let errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>document.querySelector('#status').textContent==='已更新');assert.match(await page.locator('#summary').textContent(),/进行中 2 · 受阻 2/);
 await page.getByRole('button',{name:'下一页'}).click();assert.equal(await page.locator('#page').textContent(),'2/2');await page.getByRole('button',{name:'上一页'}).click();
 await page.getByRole('button',{name:'模拟断网'}).click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('更新失败'));assert.equal(await page.locator('article').count(),2);
 await page.getByRole('button',{name:'恢复网络'}).click();await page.waitForFunction(()=>document.querySelector('#status').textContent==='已更新');
 await page.getByRole('button',{name:'隐藏组件'}).click();await page.getByRole('button',{name:'模拟更新事件'}).click();assert.match(await page.locator('#status').textContent(),/已隐藏/);await page.getByRole('button',{name:'显示组件'}).click();await page.waitForFunction(()=>document.querySelector('#status').textContent==='已更新');
 await page.getByRole('button',{name:'空报告'}).click();await page.waitForFunction(()=>document.querySelector('#rows').textContent.includes('暂无'));assert.equal(await page.locator('#page').textContent(),'1/1');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);console.log('Browser preview: pagination, offline recovery, lifecycle, empty state and narrow layout passed.');
}finally{if(browser)await browser.close();server.kill();}
