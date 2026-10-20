# 上线替换清单

按下面的顺序改完即可发布。绝大多数改动集中在 **`assets/js/config.js` 一个文件**，
HTML 里的联系方式会自动跟着变，不用逐个改页面。

---

## ✅ 已完成（真实信息，无需再动）

| 字段 | 当前值 |
|---|---|
| `contact.phone` / `mobile` | `15982018405` / `159 8201 8405` |
| `contact.contactPerson` / `wechat` / `qq` | 许经理 / x15308217061 / 472128809 |
| `contact.email` | `472128809@qq.com` |
| `legal.icp` | 蜀ICP备18013136号 |
| `company.foundYear` | 2016 |
| `qualifications` | 雷电防护装置检测资质（1 条，真实持证） |
| `emailjs.*` | 已启用，三个 ID 已填 |
| `site.url` | `https://jsfl.sumstc.com` |

## ★ 唯一还需要你填的：工程案例

`assets/js/cases-data.js` 中的 `CASES` 数组**当前为空**，
页面会显示「案例正在整理归档」的提示，不会展示任何虚构项目。

这是刻意的：列出编造的项目在防雷这类强资质行业风险极高。
请把真实项目按下面的模板填进去（文件内有完整字段说明）：

```js
{
  id: 'case-01',
  category: 'factory',
  title: '项目名称（建议含行业与地点）',
  location: '四川 · 成都',
  year: '2026',
  scale: '项目规模',
  cover: 'assets/img/case-01.png',
  summary: '背景与实施内容概述',
  scope: ['施工内容 1', '施工内容 2'],
  result: '检测结果或验收结论',
  tags: ['工厂防雷', '避雷带'],
  gallery: []
}
```

填完执行 `node build.js`，会自动生成独立案例页并更新 sitemap.xml。

### 文件 2：`assets/js/cases-data.js`（案例）

当前为空数组，页面显示「案例正在整理」提示。填入真实项目后执行 `node build.js` 即可。

---

## ○ 建议改（影响可信度）

| 文件 | 位置 | 说明 |
|---|---|---|
| `assets/js/config.js` | `company.intro` | 公司简介，改写成自己的实际业务范围与年限 |
| `assets/js/config.js` | `contact.contactPerson` / `wechat` / `qq` | 选填，建议至少填一个微信或联系人 |
| `assets/js/config.js` | `products[].specs` | 设备参数是通用描述，有真实型号/参数请替换 |
| `index.html` | `<meta name="keywords">` `<meta name="description">` | 已按业务填好，可微调 |
| `index.html` | `<title>` | 已含「四川巨石防雷科技有限公司」，确认无误即可 |

---

## △ 可暂缓（不影响上线）

- `standards`（规范清单）：已列 8 项现行国标，可按实际增减；
- `mainBusiness` / `subBusiness` / `solutions` / `highlights` / `process`：文案已贴合业务，可后续微调；
- 图片 `assets/img/*.png`：11 张示意图，有现场实拍图后逐张替换同名文件即可，不用改代码。

---

## 上线前 5 分钟自检

```bash
cd jushi-site
# 1) 查还有没有漏网的占位值（改对了就应该没有输出）
grep -rn "0000 0000\|138 0000\|example.com\|00000000号\|xxxxxxx" assets/js/config.js

# 2) 本地起服务看效果
python3 -m http.server 8080
```

浏览器打开 `http://localhost:8080`，逐项确认：

- [ ] 页脚、联系我们区的电话和邮箱是真实号码，点击能拨号 / 拉起邮件客户端；
- [x] 资质区没有「按实际填写」这类占位字样；
- [ ] 案例区已填入真实项目（当前为空，显示「整理中」提示）；
- [ ] 改完 `site.url` 后已执行 `node build.js`，`cases/` 下生成了对应数量的案例页；
- [ ] 打开 `sitemap.xml` 确认域名已替换为正式域名（不是 example.com）；
- [ ] 点开一个案例，能正常进入 `cases/case-01.html` 这类独立页且图片显示正常；
- [ ] 填一条测试留言 → **收件邮箱收到主题含「【官网留言】」的邮件**（最关键的一步）；
- [ ] 同一页面再提交一次 → 被拦截并提示凭证已使用；
- [ ] 手机模式下菜单、图片、表单不溢出。

SEO 相关（详见 `SEO.md`）：
- [ ] F12 搜索 `application/ld+json`，确认结构化数据已输出；
- [ ] 已到百度 / 必应 / Google 站长平台提交 `sitemap.xml`；
- [ ] 已认领百度地图商户中心，且名称、地址、电话与官网完全一致。

---

## 发布后立刻做（决定有没有流量）

站点上线只是第一步，不做下面这些，搜索引擎根本不知道你存在。

### 1. DNS 与 Pages 配置

- 域名解析加一条 **CNAME 记录**：`jsfl` → `你的用户名.github.io`
- GitHub 仓库 Settings → Pages → Custom domain 填 `jsfl.sumstc.com`，等 HTTPS 证书自动签发
- 访问 `https://jsfl.sumstc.com/robots.txt` 和 `/sitemap.xml` 确认能打开

### 2. 提交给搜索引擎（必做，否则收录极慢）

| 平台 | 地址 | 提交内容 |
|---|---|---|
| 百度搜索资源平台 | ziyuan.baidu.com | 验证站点 → 提交 `sitemap.xml` → 用「主动推送」提交首页和案例页 |
| Bing Webmaster Tools | bing.com/webmasters | 可从 GSC 一键导入，提交 sitemap |
| Google Search Console | search.google.com/search-console | 提交 sitemap |

百度新站收录通常要 **2 周到 2 个月**，要有心理准备。

### 3. 本地服务最关键的一步：百度地图商户中心

防雷是强地域性生意。去百度地图商户中心免费认领，确保
**公司名、地址、电话与官网完全一致**（差一个空格都影响），上传营业执照和现场照片。

## 发布

```bash
git add .
git commit -m "site: 巨石防雷官网上线版"
git push origin main
```

仓库 Settings → Pages → Source 选 `main` / `root`，等一两分钟即可访问。

自定义域名的话，在仓库根目录加一个 `CNAME` 文件（内容为你的域名），并在域名解析里加一条 CNAME 指向 `你的用户名.github.io`。

---

## 别忘了这两件事

1. **EmailJS 域名白名单**：后台 Account → Security → Allowed Origins 只填你的站点域名，否则额度可能被别人刷光；
2. **收件邮箱规则**：给主题含「【官网留言】」的邮件设加星标 / 转手机推送，避免漏看客户留言。
