# 实施治理规则

## 权威来源

以下文件是项目实现的正式依据：

- `docs/research/react-lynx-gap-analysis.md`
- `docs/architecture/vue-lynx-technical-plan.md`
- `docs/architecture/implementation-governance.md`

中文对应参考版本：

- `docs/zh-CN/research/react-lynx-gap-analysis.md`
- `docs/zh-CN/architecture/vue-lynx-technical-plan.md`
- `docs/zh-CN/architecture/implementation-governance.md`

## 规则

1. 先调研，再定方案，最后写代码。
2. 如果实现过程中发现当前方案有误，必须先更新调研和方案文档，再修改代码。
3. 没有自动化测试和明确使用路径的包，不视为可发布。
4. 原生与 Web 行为允许差异，但差异必须是有意设计并写进文档。

## 验收标准

- demo 必须同时能构建 Lynx 原生和 Web。
- Web SSR 必须能完成服务端渲染和 hydration。
- `@pgg/*` 公开 API 必须至少有包级测试或 demo 覆盖。
