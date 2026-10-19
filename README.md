# EmailJS 留言通道 · 配置说明

访客在官网填的留言，通过 EmailJS 直接发到公司邮箱，**不需要后端服务器**，纯静态站即可用。
配置一次约 10 分钟，之后留言进邮箱，手机上也能收到。

---

## 一、成本与限制（先看这个）

| 项目 | 情况 |
|---|---|
| 免费额度 | **每月 200 封请求**，2 个邮件模板，单次请求 ≤50KB |
| 信用卡 | 免费版不需要 |
| 超出后 | 请求被丢弃，后台会发提醒邮件；官网留言量一般远低于 200 封/月 |
| 安全 | Public Key 设计上就是放前端的；邮箱授权码（密码）只存在 EmailJS 服务端，前端拿不到 |

> 注意：200 封/月是**请求数**，不是成功送达数。若担心被刷，在 EmailJS 后台配置来源域名白名单，
> 前端也已内置节流（默认 8 秒 1 次）与无头浏览器拦截。

---

## 二、四步配置

### 第 1 步：注册 EmailJS

1. 打开 https://www.emailjs.com/ → Sign Up（可用 Google / GitHub / 邮箱注册）；
2. 去邮箱点验证链接，完成注册。

### 第 2 步：接一个发件邮箱（推荐 QQ / 163 / 腾讯企业邮）

**先去邮箱开 SMTP 并拿授权码：**

- **QQ 邮箱**：mail.qq.com → 设置 → 账户 → 找到「POP3/IMAP/SMTP 服务」→ 开启 **POP3/SMTP 服务**
  → 按提示用密保手机发短信 → 得到 **16 位授权码**（不是 QQ 登录密码，关页面就看不到了，先复制下来）。
- **163 邮箱**：mail.163.com → 设置 → POP3/SMTP/IMAP → 开启 → 手机验证 → 拿客户端授权码。
- **腾讯企业邮**（有自己域名时更体面）：exmail.qq.com 免费版，SMTP 默认开启，直接用邮箱密码即可。

**再回到 EmailJS 接上：**

1. 左侧 **Email Services** → **Add New Service**；
2. 选 **SMTP server**（不要选 Gmail，国内连不上）；
3. 按下面填：

| 字段 | 值（QQ 邮箱 · 实测可用） |
|---|---|
| Name | 巨石官网 |
| Service ID | 自定义，如 `jushi_site`（记下来） |
| Host | `smtp.qq.com`（163 填 `smtp.163.com`，企业邮填 `smtp.exmail.qq.com`） |
| Port | `465` |
| User | 完整邮箱地址，如 `123456@qq.com` |
| Password | 刚拿到的 **16 位授权码** |
| Use TLS / SSL | **不选**（465 是隐式 SSL，勾了会报 SSL 版本错） |

> 端口与加密必须成对，交叉填会报
> `SSL routines: tls_validate_record_header: wrong version number`：
>
> | 端口 | Use TLS |
> |---|---|
> | **465**（推荐，QQ 邮箱实测可用） | **不勾选** |
> | 587 | 勾选（STARTTLS） |

4. 保存后点 **Test Service** 发一封测试邮件，收到就说明通了；
5. 复制 **Service ID**（形如 `service_xxxxxxx`）。

### 第 3 步：建邮件模板

1. 左侧 **Email Templates** → **Create New Template**；
2. **Subject** 填：

```
【官网留言】{{need}} - {{from_name}} {{phone}}
```

3. **Content** 填（变量用双花括号）：

```html
<h3>收到一条官网留言</h3>
<p><b>需求类型：</b>{{need}}</p>
<p><b>联系人：</b>{{from_name}}</p>
<p><b>单位：</b>{{org}}</p>
<p><b>电话：</b>{{phone}}</p>
<p><b>邮箱：</b>{{reply_to}}</p>
<p><b>留言内容：</b></p>
<p>{{message}}</p>
<hr>
<p style="color:#888;font-size:12px;">
  凭证：{{token}} | 来源页：{{page}} | 时间：{{time}}
</p>
```

4. 右侧 **To Email** 填公司收件邮箱（如 `service@公司域名.com`）；
   **From Name** 可填 `巨石官网留言`；
   若要用访客邮箱直接回复，把 **Reply To** 设为 `{{reply_to}}`；
5. 保存，复制 **Template ID**（形如 `template_xxxxxxx`）。

### 第 4 步：取 Public Key

右上角头像 → **Account** → **General**（或 API Keys）→ 复制 **Public Key**（形如 `user_xxxxxxxx` 或一串字符）。

---

## 三、填回网站

打开 `assets/js/config.js`：

```js
emailjs: {
  enabled: true,                   // ★改成 true
  serviceId: 'service_xxxxxxx',    // 第 2 步的 Service ID
  templateId: 'template_xxxxxxx',  // 第 3 步的 Template ID
  publicKey: 'xxxxxxxxxxxxxxxx',   // 第 4 步的 Public Key
  toEmail: 'service@example.com',  // 公司收件邮箱（仅展示用）
  throttle: 8000,
  blockHeadless: true
}
```

保存 → 提交 → 推送，页面刷新即可生效。

---

## 四、安全加固（建议做）

### 先弄清一件事：授权码不是共享给访客的

那个 16 位 SMTP 授权码**只填在 EmailJS 后台的 SMTP 配置页里**，存在 EmailJS 服务端，
**不会出现在你的网站代码里，访客也拿不到**。整套关系是这样：

| 东西 | 放哪里 | 谁看得到 |
|---|---|---|
| SMTP 授权码（邮箱发信凭证） | 只在 EmailJS 后台 | 只有你 |
| Service ID / Template ID | 前端 `config.js` | 公开可见，无害 |
| Public Key | 前端 `config.js` | 公开可见，设计如此 |

访客在网页上提交留言时，浏览器只发一句"请帮我触发这个模板"，
真正的发信动作是 EmailJS 在服务端用你的授权码完成的。
所以访客**不能**改收件人、不能拿你的邮箱去发别的邮件、看不到授权码。

### 真正的风险只有一条：额度被刷

Public Key 公开可见，理论上别人可以把它放到自己站点上反复调用，把你每月 200 封额度用光
（表现为留言突然发不出去了）。对策：

1. **来源域名白名单（必做）**：EmailJS 后台 → **Account → Security** → Allowed Origins
   只填你的站点域名（如 `https://xxx.github.io`、自有域名），不在白名单的站点调用会被拒绝；
2. **节流与拦机器人**：已内置在 `config.js` 的 `throttle`（8 秒 1 次）与 `blockHeadless`，一般不用改；
3. **关掉邮件历史**（可选，涉及访客电话等个人信息）：模板设置里可关闭 Email History 留存。

### 邮箱本身的三条建议

1. **单独注册一个发件邮箱**：别用你日常收发的主邮箱。这个邮箱的定位是"官网自动发信专用"，
   万一出问题影响面小；
2. **授权码等同于发信密码**：不要写进代码、不要截图发群里、不要提交到公开 Git 仓库
   （它只在 EmailJS 后台，本来就不会进代码）；
3. **注意发信上限**：QQ 免费邮箱单日对外发信约 50 封，官网留言量远低于此，够用；
   若量大可用腾讯免费企业邮（单账号日发 100 封）。

---

## 五、在哪里看留言

- **主渠道：收件邮箱**，留言一到就收到，手机邮箱 App 也能看；
- **EmailJS 后台 → Email History**：7 天内（免费版）发送记录与变量内容可查；
- **本机记录**：访客浏览器 localStorage 里另有计数（键名见 `config.js` 的 `storage`），仅用于防重复提交，公司侧看不到。

建议同时在收件邮箱里设一条规则：主题含「【官网留言】」的邮件加星标/转手机，避免漏看。

---

## 六、常见问题

**Q：页面提示「邮件通道未启用，留言暂记本机」？**
`enabled` 还是 false，或三个 ID 仍带 `xxxxxxx` 占位。改完刷新页面。

**Q：提交后提示「邮件发送失败」？**
按提示的报错排查：
- `The service is not available` / 连接失败 → SMTP 配置里 Host、Port、授权码是否正确，去 EmailJS 后台 Test Service 再发一次；
- `Invalid template ID` → Template ID 填错；
- `Public key is invalid` → Public Key 复制不全或新旧版本混淆；
- 国内网络偶发连不上 EmailJS 的 API，换个网络重试即可。

**Q：SMTP 保存时报 `412` 或 `wrong version number`？**
端口与加密方式不匹配。**实测结论：QQ 邮箱用 465 + 不勾选 SSL/TLS 可成功**，
587 + 勾选 STARTTLS 是另一组可用组合，两者不能交叉。改完先点 Test Service 验证。

**Q：免费版 200 封不够怎么办？**
官网留言一般够用。若确实不够，可升 Personal（$9/月，2000 封），
或在页面加一个「留言过多时请直接电话联系」的提示兜底。

**Q：Public Key 放在前端安全吗？**
这是 EmailJS 的设计用法：前端只有触发模板的权利，看不到邮箱授权码，也改不了收件人。
真正的风险是被他人盗用额度，靠上面的**来源白名单**控制。
