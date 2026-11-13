<script setup>
import {bindReport} from '../../lib/presenter.js';
export default {
  data: {rows: [], running: 0, blocked: 0, loading: false, stale: true, error: '', updatedAt: '尚未更新', pageLabel: '1/1'},
  onLoad() { this.reportController = bindReport(this, 3); },
  onShow() { this.reportController.attach(); },
  onHide() { this.reportController.detach(); },
  onUnload() { this.reportController.detach(); },
  refresh() { this.reportController.refresh(); },
  next() { this.reportController.next(); },
  previous() { this.reportController.previous(); }
};
</script>
<page>
  <view class="panel">
    <text class="title">知序 · 演示数据</text>
    <text>进行中 {{running}} · 受阻 {{blocked}}</text>
    <text ink:if="{{loading}}">更新中…</text>
    <text ink:if="{{stale}}">数据可能过期</text>
    <text ink:if="{{error}}">{{error}}</text>
    <view ink:for="{{rows}}" ink:key="key"><text>{{item.project}} · {{item.title}}</text><text>{{item.reason}}</text></view>
    <text ink:if="{{rows.length === 0}}">暂无进行中或受阻事项</text>
    <text class="time">{{updatedAt}}</text>
    <view class="controls"><text bindtap="previous">上一项</text><text>{{pageLabel}}</text><text bindtap="next">下一项</text><text bindtap="refresh">刷新</text></view>
  </view>
</page>
<style>
.panel { padding: 12px; color: #fff; background: #000; display: flex; flex-direction: column; gap: 8px; } .title { font-size: 24px; } .time { font-size: 14px; } .controls { display: flex; justify-content: space-between; }
</style>
