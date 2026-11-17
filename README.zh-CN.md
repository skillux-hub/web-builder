# Web Builder

[English](README.md) | **简体中文**

面向 AI 编程代理的业务网站构建技能：从业务需求出发，按**网站类型 × 功能模块**确定范围，再通过 Skillux 选择设计模板、生成应用基础、接通业务流程并验证交付。

适合模板式网站创建，以及继续维护由本技能创建的项目。技能入口是 [SKILL.md](SKILL.md)，可执行选型配置位于 [config/catalog.json](config/catalog.json)。

## 工作方式

**Skillux 登录 → 业务需求 → 网站类型 → 功能模块 → 前台/后台模板 → 实现与集成 → 验证与交付**

- 按实际业务流程选择模块，支持混合类型，不给所有网站默认加入商城或会员。
- 按需生成后台；不需要后台时，跳过管理页面、管理接口、管理员表和管理员凭据。
- 模板选型包含预览、授权检查和版本记录；已生成的项目可以读取记录继续工作。
- 短信按用户/商户所属国家与收件国家推荐 SDK；物流结合商户国家、发货仓和收货地推荐 SDK/API。
- 实现状态与验证结果分别记录，区分待实现、已有脚手架、已验证及受配置阻塞的工作。

## 安装与开始使用

通过 Skills CLI 安装，并按提示选择代理和安装范围：

```bash
npx skills add https://github.com/skillux-hub/web-builder --skill web-builder
```

也可以克隆仓库，按照所用代理的技能安装方式放置完整目录；保留 `SKILL.md`、`references`、`config`、`scripts` 和 `assets` 的相对结构。

安装后可使用这样的需求：

```text
使用 $web-builder 为一家面向英国市场的维修公司建站。
网站使用英语，需要服务介绍、案例、预约和客户询盘，以及管理后台。
帮我选择前台和后台模板，完成业务实现并验证，先交付本地项目。
```

已有项目可以直接说明修改目标。代理会先读取 `.web-builder/project.json` 和现有代码，复用已确定的语言、模板、模块与服务商选择。

## 11 类网站

| 类型 ID | 适用流程 |
| --- | --- |
| `landing` | 单页展示、活动宣传、产品发布 |
| `business` | 企业官网、服务介绍、案例及多页作品集 |
| `commerce` | 单一经营方的商品销售与订单履约 |
| `content` | 博客、资讯、知识内容与作品发布 |
| `booking` | 时段预约、日期区间预订、活动名额 |
| `education` | 课程展示、报名管理、在线学习 |
| `directory` | 分类目录、信息列表、发现与联系 |
| `dashboard` | 数据看板、运营后台与工作空间 |
| `tool` | 计算器、AI 工具、文件转换与任务结果 |
| `community` | 论坛、问答、成员内容与审核 |
| `marketplace` | 多商家入驻、交易、佣金与结算 |

详细边界、模块映射和验收场景见 [网站类型索引](references/website-types.md)。例如，目录展示不等于多商家交易；课程展示也不默认包含完整在线教学系统。

## 26 个功能模块

| 能力组 | 模块 ID |
| --- | --- |
| 管理与身份 | `admin`、`authentication`、`tenancy` |
| 内容与组织 | `content`、`taxonomy`、`search`、`seo` |
| 列表与资源 | `lists`、`media`、`files` |
| 交易与服务 | `commerce`、`payments`、`shipping`、`after-sales` |
| 客户与学习 | `inquiries`、`bookings`、`learning` |
| 周期与权益 | `subscriptions`、`entitlements` |
| 通知与通道 | `notifications`、`sms` |
| 平台与执行 | `directory`、`execution`、`community`、`marketplace`、`analytics` |

[模块索引](references/modules.md)说明每个模块的适用条件、依赖和验收规则。分类与标签使用 `taxonomy`；支付处理交易，订阅管理周期，访问权益决定实际可访问的功能、内容或额度。

服务商选型参考：[短信 SDK 推荐](references/sms-providers.md) · [物流 SDK/API 推荐](references/shipping-providers.md)。推荐候选不等于账户已开通、路线已覆盖或服务已经接入。

## 当前可执行能力

| 内容 | 当前范围 |
| --- | --- |
| 组合解析 | 网站类型、显式模块、依赖、排除项、别名及后台决策；支持只预览计划 |
| `standard` 基础 | Next.js、TypeScript、Prisma、SQLite、站点设置，以及按需加入的后台基础 |
| `commerce` 基础 | 示例商品、SKU、库存、购物车、订单、访问密钥和模拟支付；按需加入后台 |
| Skillux 工具 | 模板目录查询、下载授权检查、选定模板下载及版本记录 |
| 其余业务模块 | 按需加载的实施规范；由代理继续实现和验证，不是已经完成的插件包 |

**选择模块不等于实现模块，生成基础不等于完成网站。** 所选模板仍需要真实迁移；支付、短信、邮件、物流等外部服务仍需要有效配置与验证。模拟支付不会真实扣款。多商家隔离、结算、预约引擎等不由基础生成器自动提供。

## 开发者快速使用

基础生成工具需要 Python 3.10+；生成应用需要 Node.js 22.12+、npm，以及运行 SQLite 原生依赖的环境。额外接入的 SDK 可能有更高的运行时要求，应按实际选择核对。

```bash
git clone https://github.com/skillux-hub/web-builder.git
cd web-builder
```

在仓库外保存需求文件，例如 `../brief.json`：

```json
{
  "brand": "Example Services",
  "business": "服务展示、案例和客户询盘",
  "locale": "zh-CN",
  "region": "China",
  "websiteType": "business",
  "adminRequired": true,
  "adminRequirementSource": "user",
  "modules": ["services", "cases", "inquiries", "categories"]
}
```

在仓库根目录先通过登录检查，预览组合，再生成到仓库外的空目录。使用选定模板时，需先确认对应下载权限通过：

```bash
python scripts/skillux.py login
python scripts/composition.py --brief ../brief.json
python scripts/create_project.py ../example-site --brief ../brief.json
```

```bash
cd ../example-site
npm install
npm run setup
npm run dev
```

打开终端显示的本地地址。启用后台时可访问 `/admin`，凭据位于生成项目的 `LOCAL_ACCESS.md`；该文件与 `.env` 应保持私有。

需要电商基础时，在需求中明确包含 `orders` 和三位币种代码 `currency`，并给预览/生成命令加上 `--foundation commerce`。单独选择 `websiteType: "commerce"` 不会切换生成基础。单页网站需要明确 `adminRequired`；设为 `false` 可生成无后台项目。

生成器不会覆盖非空目录，也不会自动迁移已有应用。完整输入规则与续做方式见 [组合配置](references/composition.md)和[实现说明](references/implementation.md)。

## 模板选型与授权

Web Builder 开始前先校验 Skillux 登录；未登录或登录失效时主动打开官方授权页，等待授权并通过服务端复核后再继续。选定模板若被确认没有权限，会打开详情页提示购买模板或适用会员，权限复核通过后再进入下一步。底层公开模板目录 API 仍支持匿名查询：

```bash
python scripts/skillux.py login
python scripts/skillux.py catalog --role frontend --industry services
python scripts/skillux.py catalog --role admin
python scripts/skillux.py check <template-slug>
python scripts/skillux.py fetch <template-slug> --role frontend --project ../example-site
```

无需后台时跳过后台模板。登录凭据由 Skillux CLI 管理，不写入需求或项目记录。下载包保存在项目私有目录中；本仓库不包含远程模板库，也不自动购买模板。详情见 [Skillux 选型与授权](references/skillux.md)。

## 项目记录与验证

`.web-builder/project.json` 保存原始需求、组合计划、实际模板版本、实现状态和检查结果。`pending` 表示待实现，`scaffolded` 表示已有基础；业务实现与模板集成只有通过对应验证后才能标记完成。

在技能仓库运行 Python 检查：

```bash
python -B -m unittest discover -s tests -v
```

在生成项目运行应用检查：

```bash
npm run typecheck
npm test
npm run build
```

关键业务仍需验证用户操作、服务端结果、数据持久化、权限和失败场景，构建成功不代表业务流程全部可用。HTTP 检查仅用于隔离的本地测试项目；外部服务优先使用沙箱或本地测试接收端。完整要求见 [验证说明](references/verification.md)。默认交付本地项目，部署与真实外部操作按用户要求执行。

## 仓库结构

```text
web-builder/
├── SKILL.md              技能入口与路由
├── agents/               代理界面元数据
├── config/               网站类型、模块依赖及资产层配置
├── references/           类型、模块、实现与服务商指南
├── assets/               core / standard / commerce / 可选 admin 资产层
├── scripts/              组合预览、项目生成、Skillux 工具
└── tests/                组合与本地 HTTP 检查
```

## 许可证

本仓库采用 [MIT License](LICENSE)。另行取得的模板、图片、字体及第三方组件遵循其各自的授权条款，仓库许可证不会替代这些授权。
