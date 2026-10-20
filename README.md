# 四川巨石防雷科技有限公司 · 静态宣传站模板

纯静态站点（HTML + CSS + 原生 JS，无框架、无构建、无动画特效），可直接上传到 GitHub Pages / Gitee Pages / 任意静态托管使用。

## 目录结构

```
jushi-site/
├── index.html                  # 首页
├── cases.html                  # 工程案例中心（独立页面）
├── assets/
│   ├── css/style.css           # 全站样式（无动画、无动态特效）
│   ├── js/config.js            # ★ 公司信息 / 联系方式 / 规范 / EmailJS 配置（模板替换入口）
│   ├── js/cases-data.js        # ★ 案例数据（持续更新现场图片与描述）
│   ├── js/main.js              # 内容渲染（主营、业务分类、设备、亮点、案例…）
│   ├── js/message.js           # 留言模块（EmailJS + 本地记录 + Token 防重复）
│   └── img/                    # 全部 PNG 原始图（11 张）
├── cases/                      # 案例独立静态页（由 build.js 生成，每个项目一个 URL）
├── build.js                    # ★ 构建脚本：生成案例页 + sitemap.xml + robots.txt
├── robots.txt / sitemap.xml    # 由 build.js 自动生成，不要手动改
├── 404.html                    # 404 页
├── emailjs/README.md           # ★ EmailJS 留言通道配置步骤
├── SEO.md                      # 搜索曝光与推广说明
├── SEO-ANALYSIS.md             # ★ 效果分析方法与工具
├── seo-check.js                # ★ 本地 SEO 体检脚本（node seo-check.js）
├── CHECKLIST.md                # ★ 上线替换清单
└── README.md
```

## 构建脚本（新增或修改案例后必须跑一次）

```bash
node build.js      # 纯 Node，无需 npm install
```

它会做三件事：

1. 为 `cases-data.js` 里每个案例生成独立静态页 `cases/<id>.html`（**每个项目一个 URL，利于搜索引擎收录**）；
2. 生成 `sitemap.xml`（自动包含首页、案例中心与全部案例页）；
3. 生成 `robots.txt`（域名自动取自 `config.js` 的 `site.url`，并已显式放行 AI 爬虫）。

**以下情况都要重跑**：改了正式域名、新增/修改了案例。

## 本地预览

```bash
cd jushi-site
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

## 部署到 GitHub Pages

```bash
git add . && git commit -m "site: 巨石防雷官网首版"
git push origin main
# 仓库 Settings → Pages → Source 选择 main / root，等待发布
```

## 需要替换的内容（上线前必做）

全部集中在 `assets/js/config.js`，改完刷新页面即可生效：

| 配置项 | 说明 |
|---|---|
| `contact.address` | 经营地址（已填：四川省成都市天府新区麓山大道） |
| `contact.phone` / `phoneHref` | 联系电话与拨号链接（已填 `15982018405`） |
| `contact.mobile` / `mobileHref` | 手机号与拨号链接（已填 `159 8201 8405`） |
| `contact.email` / `emailHref` | 邮箱（已填 `472128809@qq.com`） |
| `company.foundYear` / `stats` | 成立年份（2016）与首页数据条（已填） |
| `qualifications` | 资质（已填「雷电防护装置检测资质」） |
| `legal.icp` | ICP 备案号（已填 蜀ICP备18013136号） |
| `emailjs.*` | 留言邮箱通道：serviceId / templateId / publicKey，并把 `enabled` 改为 `true` |

页面中公司名、地址、电话、邮箱、页脚版权均通过 `data-field` 自动读取配置，无需逐个改 HTML。

## 更新工程案例

1. 把现场施工照片放入 `assets/img/`（建议 1280×720 左右，PNG/JPG 均可）；
2. 在 `assets/js/cases-data.js` 的 `CASES` 数组里追加一条：

```js
{
  id: 'case-09',
  category: 'factory',            // factory / building / charging / special / smart
  title: '项目名称',
  location: '四川 · 成都',
  year: '2026',
  scale: '项目规模描述',
  cover: 'assets/img/case-09.png',
  summary: '一句话概述',
  scope: ['施工内容 1', '施工内容 2'],
  result: '成效描述',
  tags: ['工厂防雷', '避雷带'],
  gallery: []                     // 可选：多张现场图
}
```

3. 在项目根目录执行 `node build.js`，生成该案例的独立页面 `cases/case-09.html`；
4. 提交发布。首页案例区、案例中心页会自动出现新案例，独立页也会被写进 `sitemap.xml`。

## 留言模块说明

- **随机会话凭证**：每次打开页面生成一个随机 token（会话级），提交成功后该 token 立即作废，同一 token 不能重复提交；重新打开页面才会获得新凭证。
- **本地记录**：留言次数、已用 token、留言流水写入 `localStorage`（键名见 `config.js` 的 `storage`），留言内容不在页面展示。
- **前端检测**：姓名、联系电话（手机号 / 带区号固话）、留言字数、同意项、token 重复性均在前端校验后再提交。
- **提交成功提示**：页面只显示「提交成功 + 编号 + 本机累计次数」，不展示留言列表。
- **失败如实提示**：邮件发送失败时会明确报错并给出拨打电话的兜底，不会让访客误以为已送达。

### 接入 EmailJS（留言直接进邮箱）

完整图文步骤见 **`emailjs/README.md`**（注册、接 SMTP 邮箱、建模板、取 Public Key、安全加固）。

1. 注册 https://www.emailjs.com/（免费版每月 200 封，够用）；
2. 在邮箱（QQ / 163 / 腾讯企业邮）开启 SMTP 拿到**授权码**；
3. EmailJS → Email Services → Add New Service → 选 **SMTP server** → 填 Host / Port 587 / 授权码；
4. EmailJS → Email Templates → 建模板，变量用 `{{from_name}} {{phone}} {{message}}` 等（README 里有现成模板）；
5. EmailJS → Account → General 复制 **Public Key**；
6. 在 `config.js` 的 `emailjs` 中填写并把 `enabled` 改成 `true`：

```js
emailjs: {
  enabled: true,
  serviceId: 'service_469nzys',
  templateId: 'template_dq4um08',
  publicKey: '6_Hpo9S0G0Ynl6T_R',
  toEmail: '472128809@qq.com'
}
```

7. 未启用时（`enabled: false`）不影响页面使用：留言记入访客本机，页面会明确标注「邮件通道未启用」，
   不会让访客误以为公司已收到。建议在此期间保留电话等直联通道。

### 查看留言

- **收件邮箱**：留言一到就收到，建议在邮箱里给主题「【官网留言】」设规则加星标 / 转手机；
- **EmailJS 后台 → Email History**：7 天内（免费版）发送记录与变量内容可查；
- 首页与案例中心页的留言走同一模板，看一处即可。

## 图片说明

`assets/img/` 共 11 张原始 PNG，均按防雷基本常识绘制：避雷针保护范围按锥形覆盖表达、避雷带为闭合网格、接地与等电位同步呈现、SPD 装于配电柜内。

| 文件 | 用途 |
|---|---|
| `hero-main.png` | 首页主视觉 |
| `biz-factory.png` / `biz-building.png` / `biz-charging.png` / `biz-special.png` | 工厂 / 建筑 / 充电站 / 特殊站点业务分类 |
| `product-spd.png` / `product-cabinet.png` | SPD 防雷器、防雷配电柜 |
| `smart-monitor.png` | 智能防雷与嵌入式监测 |
| `service-testing.png` / `case-construction.png` / `case-datacenter.png` | 检测现场、施工现场、机房案例 |

如需进一步压缩体积，可安装 `pngquant` 后执行：

```bash
pngquant --quality 70-85 --ext .png --force assets/img/*.png
```

## 设计规范参考

首页「资质与规范」区块默认列出（可在 `config.js` 的 `standards` 中增删）：

GB 50057-2010、GB 50343-2012、GB/T 21431-2015、GB/T 18802.1-2020、GB 50650-2011、GB 50966-2014、DL/T 620-1997、GB/T 21714.3-2015。
