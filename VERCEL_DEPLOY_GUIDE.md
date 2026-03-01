# Vercel 部署指南 - 逐步操作

## ✅ 已完成步骤

### 1. GitHub 仓库创建 ✅
- 仓库：https://github.com/wocao233/crossborder-tee-shop
- 代码已推送成功

### 2. 代码推送 ✅
- 远程仓库已配置
- 所有代码已推送到 GitHub

## 🚀 第3步：Vercel 部署

### 方法A：通过Vercel Dashboard（推荐）
1. **访问**：https://vercel.com/new
2. **点击**："Import Git Repository"
3. **选择**：`wocao233/crossborder-tee-shop`
4. **配置**：
   - Project Name: `crossborder-tee-shop`（自动）
   - Framework: Next.js（自动检测）
   - Root Directory: `.`
5. **点击**："Deploy"

### 方法B：通过Vercel CLI
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel --prod
```

## 🔧 第4步：配置环境变量

部署完成后，在 Vercel 项目设置中添加环境变量：

### 访问路径：
1. 登录 Vercel Dashboard
2. 点击 `crossborder-tee-shop` 项目
3. 点击 "Settings" → "Environment Variables"

### 必需环境变量：
复制并粘贴以下变量：

```
DATABASE_URL=postgresql://username:password@host:port/database?schema=public
NEXT_PUBLIC_APP_URL=https://crossborder-tee-shop.vercel.app
STRIPE_SECRET_KEY=sk_test_51Pq3XqP2nHxYVw3p8KjLmN9oA7bC6dFgHjKlMnOpQrStUvWxYz1234567890
STRIPE_PUBLISHABLE_KEY=pk_test_51Pq3XqP2nHxYVw3p8KjLmN9oA7bC6dFgHjKlMnOpQrStUvWxYz1234567890
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef1234567890abcdef
SHIPPO_API_KEY=shippo_test_1234567890abcdef1234567890abcdef
RESEND_API_KEY=re_1234567890abcdef1234567890abcdef
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_1234567890abcdef1234567890abcdef
CLERK_SECRET_KEY=sk_test_1234567890abcdef1234567890abcdef
EXCHANGERATE_API_KEY=1234567890abcdef1234567890abcdef
```

### 可选环境变量：
```
PAYPAL_CLIENT_ID=test_client_id_1234567890
PAYPAL_CLIENT_SECRET=test_client_secret_1234567890
ALIPAY_APP_ID=2021000123456789
WECHAT_APP_ID=wx1234567890abcdef
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-TEST12345
NEXT_PUBLIC_POSTHOG_KEY=phc_test_1234567890abcdef1234567890abcdef
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

## 🔗 第5步：配置 Stripe Webhook

### 1. 获取您的 Vercel 部署链接
部署完成后，您将获得类似以下的链接：
```
https://crossborder-tee-shop.vercel.app
```

### 2. 配置 Stripe Webhook
1. **访问**：https://dashboard.stripe.com/test/webhooks
2. **点击**："Add endpoint"
3. **端点 URL**：`https://crossborder-tee-shop.vercel.app/api/webhook/stripe`
   （替换为您的实际 Vercel 链接）
4. **选择事件**：
   - [x] `payment_intent.succeeded`
   - [x] `payment_intent.payment_failed`
   - [x] `payment_intent.canceled`
   - [x] `charge.succeeded`
   - [x] `charge.refunded`
5. **点击**："Add endpoint"
6. **复制**："Signing secret"（以 `whsec_` 开头）
7. **更新 Vercel 环境变量**：
   - 将 `STRIPE_WEBHOOK_SECRET` 的值替换为复制的签名密钥

## 🌐 第6步：访问您的网站

部署完成后，您的网站将在以下地址运行：

```
https://crossborder-tee-shop.vercel.app
```

### 支持的语言：
- 英语：https://crossborder-tee-shop.vercel.app/en
- 中文：https://crossborder-tee-shop.vercel.app/zh

## 🧪 第7步：测试流程

### 测试支付（使用 Stripe 测试卡）：
```
卡号：4242 4242 4242 4242
有效期：12/34
CVC：567
邮编：12345
```

### 完整测试流程：
1. 访问网站
2. 选择语言（右上角）
3. 添加商品到购物车
4. 点击购物车图标
5. 填写地址信息
6. 选择物流方式
7. 使用测试卡支付
8. 检查订单确认邮件

## ⚠️ 常见问题解决

### 1. 部署失败
- 检查 Vercel 部署日志
- 验证环境变量格式
- 确保 `package.json` 中的脚本正确

### 2. 支付失败
- 验证 Stripe 测试密钥
- 检查 Webhook 配置
- 查看 Stripe Dashboard 日志

### 3. 物流计算失败
- 验证 Shippo API 密钥
- 检查地址格式
- 查看 API 响应

### 4. 邮件发送失败
- 验证 Resend API 密钥
- 检查发件人邮箱配置
- 查看 Resend Dashboard

## 📊 监控和日志

### Vercel 日志：
- 访问：Vercel Dashboard → 项目 → "Deployments" → 点击部署 → "Logs"

### Stripe 日志：
- 访问：https://dashboard.stripe.com/test/logs

### 应用日志：
- 检查浏览器控制台（F12）
- 查看网络请求

## 🔄 更新和重新部署

### 代码更新后：
```bash
# 本地修改代码
git add .
git commit -m "Update description"
git push

# Vercel 会自动重新部署
```

### 环境变量更新：
1. 在 Vercel Dashboard 更新环境变量
2. 重新部署项目

## 📞 技术支持

### 遇到问题？
1. **查看日志**：Vercel、Stripe、浏览器控制台
2. **检查配置**：环境变量、API 密钥、Webhook
3. **测试步骤**：逐步测试每个功能模块

### 获取帮助：
- Vercel 支持：https://vercel.com/support
- Stripe 支持：https://support.stripe.com
- GitHub Issues：报告代码问题

---

## 🎉 部署完成检查清单

- [ ] Vercel 部署成功
- [ ] 获得部署链接
- [ ] 配置所有环境变量
- [ ] 配置 Stripe Webhook
- [ ] 测试网站访问
- [ ] 测试支付流程
- [ ] 测试物流计算
- [ ] 测试邮件通知

---

## 🚀 立即行动

1. **访问**：https://vercel.com/new
2. **导入仓库**：`wocao233/crossborder-tee-shop`
3. **部署**：点击 "Deploy"
4. **配置**：按照上述步骤配置环境变量和 Webhook
5. **测试**：完整测试购物流程

**预计完成时间**：10-15分钟

**完成后您将拥有**：
- 🌐 全球可访问的跨境电商网站
- 💳 完整的支付系统
- 📦 实时物流计算
- 🌍 多语言支持
- 📧 自动邮件通知

**开始部署吧！** 🚀