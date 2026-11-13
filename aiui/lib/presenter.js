import {createController, pageOf} from './report.js';
import {demoSource} from './demo.js';
export function bindReport(view, size) {
  let report = {rows: []}; let page = 0;
  const render = state => {
    report = state.report;
    const selection = pageOf(report, page, size); page = selection.page;
    view.setData({...state, ...selection, updatedAt: report.updatedAt || '尚未更新', running: report.running, blocked: report.blocked, pageLabel: `${page + 1}/${selection.pages}`});
  };
  const controller = createController({source: demoSource, publish: render});
  return {...controller, next() { page = pageOf(report, page + 1, size).page; view.setData({...pageOf(report, page, size), pageLabel: `${page + 1}/${pageOf(report, page, size).pages}`}); }, previous() { page = pageOf(report, page - 1, size).page; view.setData({...pageOf(report, page, size), pageLabel: `${page + 1}/${pageOf(report, page, size).pages}`}); }};
}
