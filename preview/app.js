import {createController, pageOf} from '/report.js';
import {demoSource} from '/demo.js';
let offline=false, empty=false, report={rows:[]}, page=0;
const $=id=>document.getElementById(id);
function draw(state) {
  report=state.report;
  const selected=pageOf(report,page,2);page=selected.page;
  $('summary').textContent=`进行中 ${report.running} · 受阻 ${report.blocked}`;
  $('status').textContent=state.loading?'更新中…':state.error || (state.stale?'数据可能过期':'已更新');
  $('updated').textContent=`更新时间：${report.updatedAt || '尚未更新'}`;
  $('rows').replaceChildren();
  for(const row of selected.rows){const a=document.createElement('article');const heading=document.createElement('strong');heading.textContent=`${row.project} · ${row.title}`;a.append(heading);const p=document.createElement('p');p.textContent=row.reason || '进行中';a.append(p);$('rows').append(a);}
  if(!selected.rows.length)$('rows').textContent='暂无进行中或受阻事项';
  $('page').textContent=`${page+1}/${selected.pages}`;$('previous').disabled=page===0;$('next').disabled=page+1>=selected.pages;
}
let lastState;
const controller=createController({source:async()=>{if(offline)throw Error('offline');const data=await demoSource();if(empty)data.tasks=[];return data;},publish:s=>{lastState=s;draw(s);}});
$('next').onclick=()=>{page++;draw(lastState);};$('previous').onclick=()=>{page--;draw(lastState);};$('refresh').onclick=()=>controller.refresh();
$('offline').onclick=()=>{offline=!offline;$('offline').textContent=offline?'恢复网络':'模拟断网';controller.refresh();};
$('empty').onclick=()=>{empty=!empty;controller.refresh();};$('update').onclick=()=>controller.invalidate();
$('attach').onclick=()=>controller.attach();$('detach').onclick=()=>{controller.detach();$('status').textContent='组件已隐藏，停止刷新';};
document.addEventListener('visibilitychange',()=>document.hidden?controller.detach():controller.attach());controller.attach();
