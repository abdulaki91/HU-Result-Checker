# 🔒 SSL/HTTPS Setup Guide for Telegram Bot

## **Why HTTPS is Required**

Telegram requires HTTPS for webhook URLs in production. Your bot won't receive updates without SSL.

## **Option 1: Enable SSL in cPanel (Recommended)**

### **Step 1: Check if SSL is Available**

1. **Login to cPanel**
2. **Look for "SSL/TLS" section**
3. **Check "SSL/TLS Status"**
4. **See if your domain `checkresultbot.abdiko.com` has SSL**

### **Step 2: Enable Let's Encrypt (Free SSL)**

Most cPanel hosts support Let's Encrypt:

1. **Go to SSL/TLS → Let's Encrypt**
2. **Select your domain**: `checkresultbot.abdiko.com`
3. **Click "Issue"** to get free SSL certificate
4. **Wait for installation** (usually takes a few minutes)

### **Step 3: Force HTTPS Redirect**

1. **Go to SSL/TLS → Force HTTPS Redirect**
2. **Enable redirect** for `checkresultbot.abdiko.com`
3. **This ensures all HTTP traffic redirects to HTTPS**

### **Step 4: Test SSL**

Visit: `https://checkresultbot.abdiko.com`

- Should show secure connection (lock icon)
- No certificate warnings

## **Option 2: Use Cloudflare (Free SSL)**

### **Step 1: Sign up for Cloudflare**

1. **Go to cloudflare.com**
2. **Add your domain**: `checkresultbot.abdiko.com`
3. **Follow setup instructions**

### **Step 2: Change DNS**

1. **Update nameservers** to Cloudflare's
2. **Wait for DNS propagation** (up to 24 hours)

### **Step 3: Enable SSL**

1. **In Cloudflare dashboard**
2. **Go to SSL/TLS → Overview**
3. **Set to "Flexible" or "Full"**

## **Option 3: Use Polling Mode (Temporary Solution)**

If you can't get SSL immediately, use polling mode for testing:

### **Create polling version:**

```javascript
// Create bot-polling.js
const StudentResultsBot = require("./src/bot/StudentResultsBot");

async function startPollingBot() {
  console.log("🔄 Starting bot in polling mode (no HTTPS required)");

  const bot = new StudentResultsBot(false); // false = polling mode
  await bot.initialize();

  console.log("✅ Bot running in polling mode");
  console.log(
    "⚠️  Remember to switch to webhook mode with HTTPS for production",
  );
}

startPollingBot().catch(console.error);
```

### **Use polling temporarily:**

```bash
# Instead of webhook mode
node bot-polling.js
```

## **Option 4: Contact Your Hosting Provider**

### **Ask your cPanel host about:**

1. **Free SSL certificates** (Let's Encrypt)
2. **SSL installation** for your domain
3. **AutoSSL** features
4. **SSL support** for subdomains

## **After Getting SSL Certificate**

### **Step 1: Update Configuration**

Your `.env` is already updated to use HTTPS:

```env
PROTOCOL=https
BOT_BASE_URL=https://checkresultbot.abdiko.com
```

### **Step 2: Test HTTPS URLs**

Visit these URLs to confirm HTTPS works:

- https://checkresultbot.abdiko.com/repositories/telegram-student-results-bot/
- https://checkresultbot.abdiko.com/repositories/telegram-student-results-bot/status

### **Step 3: Setup Webhook with HTTPS**

```bash
node setup-webhook-cpanel.js
```

This will now use:
`https://checkresultbot.abdiko.com/repositories/telegram-student-results-bot/webhook`

### **Step 4: Test Bot**

1. **Send `/start`** to your bot on Telegram
2. **Check webhook** is receiving updates
3. **Monitor logs** for any SSL issues

## **Troubleshooting SSL Issues**

### **Mixed Content Errors**

If you get mixed content errors, ensure all resources use HTTPS.

### **Certificate Errors**

- **Self-signed certificates** won't work with Telegram
- **Use trusted certificates** (Let's Encrypt, commercial SSL)

### **Webhook Verification Failed**

- **Check certificate chain** is complete
- **Verify domain matches** certificate
- **Test with SSL checker tools**

## **SSL Verification Tools**

### **Test your SSL:**

- **SSL Labs**: https://www.ssllabs.com/ssltest/
- **SSL Checker**: https://www.sslshopper.com/ssl-checker.html

### **Check webhook URL:**

```bash
curl -I https://checkresultbot.abdiko.com/repositories/telegram-student-results-bot/webhook
```

Should return `200 OK` or `404 Not Found` (both are fine, means HTTPS works)

## **Quick SSL Setup Checklist**

- [ ] SSL certificate installed for `checkresultbot.abdiko.com`
- [ ] HTTPS redirect enabled
- [ ] Test HTTPS URLs work
- [ ] Update `.env` to use `https://`
- [ ] Setup webhook with HTTPS URL
- [ ] Test bot receives messages
- [ ] Monitor for SSL errors

## **Your HTTPS URLs (After SSL Setup)**

- **Bot Home**: https://checkresultbot.abdiko.com/repositories/telegram-student-results-bot/
- **Status**: https://checkresultbot.abdiko.com/repositories/telegram-student-results-bot/status
- **Health**: https://checkresultbot.abdiko.com/repositories/telegram-student-results-bot/health
- **Logs**: https://checkresultbot.abdiko.com/repositories/telegram-student-results-bot/logs
- **Webhook**: https://checkresultbot.abdiko.com/repositories/telegram-student-results-bot/webhook

## **Priority Actions**

1. **Check cPanel for SSL options** (Let's Encrypt)
2. **Enable SSL** for your domain
3. **Test HTTPS URLs**
4. **Setup webhook** with HTTPS
5. **Test bot functionality**

Most cPanel hosts offer free SSL certificates through Let's Encrypt - check your cPanel SSL section first!
