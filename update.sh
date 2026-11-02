#!/bin/bash
# ==============================================================================
# اسکریپت خودکار بروزرسانی پروژه پسته (AgriManage) از گیت‌هاب برای دامنه avinia.ir
# ==============================================================================
set -e

echo "--------------------------------------------------------"
echo "  شروع فرآیند بروزرسانی سامانه پسته (AgriManage)..."
echo "--------------------------------------------------------"

# دریافت آخرین تغییرات از گیت‌هاب
echo " [۱/۵] دریافت آخرین کدهای پروژه از GitHub..."
git fetch --all
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
git reset --hard "origin/$CURRENT_BRANCH" 2>/dev/null || git pull origin "$CURRENT_BRANCH"

# نصب وابستگی‌ها و بیلد فرانت‌اند و بک‌اند
echo " [۲/۵] نصب پکیج‌ها و بیلد پروژه (npm run build)..."
npm install --no-audit --no-fund
npm run build

# اصلاح پرمیشن‌ها جهت جلوگیری از خطای 403 Forbidden و خطای MIME Type در LiteSpeed
echo " [۳/۵] تنظیم سطح دسترسی امن (پوشه‌ها 755 و فایل‌ها 644)..."
chmod 755 .
chmod -R 755 dist
find dist -type f -exec chmod 644 {} +

# انتقال فایل‌های بیلد شده به پوشه دامنه avinia.ir
echo " [۴/۵] بررسی و انتقال خروجی به پوشه اختصاصی دامنه avinia.ir..."
DEPLOY_TARGET=""
if [ -d "/home/$USER/public_html/avinia.ir" ]; then
  DEPLOY_TARGET="/home/$USER/public_html/avinia.ir"
elif [ -d "/home/$USER/avinia.ir" ]; then
  DEPLOY_TARGET="/home/$USER/avinia.ir"
else
  # اگر پوشه هنوز ساخته نشده باشد
  DEPLOY_TARGET="/home/$USER/public_html/avinia.ir"
  mkdir -p "$DEPLOY_TARGET"
fi

echo " -> مسیر هدف: $DEPLOY_TARGET"
cp -R dist/* "$DEPLOY_TARGET/"
cp .htaccess "$DEPLOY_TARGET/" 2>/dev/null || true
chmod -R 755 "$DEPLOY_TARGET/assets" 2>/dev/null || true
find "$DEPLOY_TARGET" -type f -exec chmod 644 {} + 2>/dev/null || true

# راه‌اندازی مجدد سرور نودجی‌اس (LiteSpeed / Passenger)
echo " [۵/۵] ارسال دستور ری‌استارت به وب‌سرور لایت‌اسپید..."
mkdir -p tmp && touch tmp/restart.txt

echo "--------------------------------------------------------"
echo "  ✓ بروزرسانی با موفقیت به پایان رسید!"
echo "  سایت https://avinia.ir اکنون به آخرین نسخه بروزرسانی شد."
echo "--------------------------------------------------------"
