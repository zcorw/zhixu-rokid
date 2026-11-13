// Synthetic data only. Never replace this with embedded credentials or private reports.
export async function demoSource() {
  return {updatedAt: new Date().toISOString(), projects: [{id: 'demo', name: '演示项目'}], features: [], issues: [], tasks: [
    {id: '1', projectId: 'demo', title: '报告组件开发', status: 'in_progress'},
    {id: '2', projectId: 'demo', title: '眼镜真机验收', status: 'blocked', description: '等待设备与运行时版本确认'},
    {id: '3', projectId: 'demo', title: '离线恢复验证', status: 'in_progress'},
    {id: '4', projectId: 'demo', title: '推送服务接入', status: 'blocked', description: '需服务端授权接口，未连接真实数据'}
  ]};
}
