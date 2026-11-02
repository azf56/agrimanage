#!/bin/bash
# ==============================================================================
# اسکریپت خودکار بروزرسانی پروژه پسته (AgriManage) از گیت‌هاب برای دامنه avinia.ir
# این اسکریپت در محیط اختصاصی CloudLinux Node.js 22 اجرا می‌شود.
# ==============================================================================
set -e

echo "--------------------------------------------------------"
echo "  شروع فرآیند بروزرسانی سامانه پسته (AgriManage)..."
echo "--------------------------------------------------------"

# ۱. فعال‌سازی محیط اختصاصی Node.js نسخه 22 در cPanel (CloudLinux nodevenv)
NVENV_ACTIVATE="/home/mjzgukzg/nodevenv/repositories/agrimanage/22/bin/activate"

if [ ! -f "$NVENV_ACTIVATE" ] && [ -n "$HOME" ]; then
  NVENV_ACTIVATE="$HOME/nodevenv/repositories/agrimanage/22/bin/activate"
fi

if [ -f "$NVENV_ACTIVATE" ]; then
  echo " [۱/۶] در حال فعال‌سازی محیط اختصاصی Node.js 22 (nodevenv)..."
  # shellcheck source=/dev/null
  source "$NVENV_ACTIVATE"
else
  echo " [!] فایل فعال‌سازی در $NVENV_ACTIVATE یافت نشد؛ از نود پیش‌فرض استفاده می‌شود."
fi

# ۲. ورود به پوشه مخزن پروژه در سی‌پنل
REPO_DIR="/home/mjzgukzg/repositories/agrimanage"
if [ ! -d "$REPO_DIR" ] && [ -n "$HOME" ]; then
  REPO_DIR="$HOME/repositories/agrimanage"
fi

if [ -d "$REPO_DIR" ]; then
  cd "$REPO_DIR"
fi

echo " -> پوشه جاری: $(pwd)"
echo " -> نسخه نود فعال: $(node -v 2>/dev/null || echo 'یافت نشد')"
echo " -> نسخه npm فعال: $(npm -v 2>/dev/null || echo 'یافت نشد')"

# ۳. دریافت آخرین تغییرات از گیت‌هاب
echo " [۲/۶] دریافت آخرین کدهای پروژه از GitHub..."
git fetch --all
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
git reset --hard "origin/$CURRENT_BRANCH" 2>/dev/null || git pull origin "$CURRENT_BRANCH"

# مجدداً در صورت تغییر اسکریپت یا محیط، اطمینان از اکتیو بودن نود ۲۲
if [ -f "$NVENV_ACTIVATE" ]; then
  # shellcheck source=/dev/null
  source "$NVENV_ACTIVATE"
fi

# ۴. نصب وابستگی‌ها و بیلد فرانت‌اند و بک‌اند با Node 22
echo " [۳/۶] نصب پکیج‌ها و اجرای بیلد اختصاصی پروژه (npm run build)..."
export NODE_ENV=development
export PATH="$(pwd)/node_modules/.bin:$PATH"

npm install --include=dev --no-audit --no-fund

if [ -f "./node_modules/.bin/vite" ] && [ -f "./node_modules/.bin/esbuild" ]; then
  echo " -> اجرای Vite و esbuild از پوشه محلی node_modules/.bin..."
  ./node_modules/.bin/vite build
  ./node_modules/.bin/esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs
else
  echo " -> اجرای npm run build پیش‌فرض..."
  npm run build
fi

export NODE_ENV=production

# ۵. تنظیم پرمیشن‌ها برای جلوگیری از خطای 403 Forbidden و strict MIME check در LiteSpeed
echo " [۴/۶] تنظیم سطح دسترسی امن (پوشه‌ها 755 و فایل‌ها 644)..."
chmod 755 . 2>/dev/null || true
chmod -R 755 dist 2>/dev/null || true
find dist -type f -exec chmod 644 {} + 2>/dev/null || true

# ۶. انتقال فایل‌های بیلد شده به ریشه دامنه avinia.ir
echo " [۵/۶] بررسی و انتقال خروجی بیلد به دامنه avinia.ir..."
DEPLOY_TARGET=""
if [ -d "/home/mjzgukzg/public_html/avinia.ir" ]; then
  DEPLOY_TARGET="/home/mjzgukzg/public_html/avinia.ir"
elif [ -n "$USER" ] && [ -d "/home/$USER/public_html/avinia.ir" ]; then
  DEPLOY_TARGET="/home/$USER/public_html/avinia.ir"
elif [ -n "$USER" ] && [ -d "/home/$USER/avinia.ir" ]; then
  DEPLOY_TARGET="/home/$USER/avinia.ir"
else
  DEPLOY_TARGET="/home/mjzgukzg/public_html/avinia.ir"
  mkdir -p "$DEPLOY_TARGET" 2>/dev/null || true
fi

echo " -> مسیر هدف برای استقرار: $DEPLOY_TARGET"
if [ -d "$DEPLOY_TARGET" ]; then
  cp -R dist/* "$DEPLOY_TARGET/"
  cp .htaccess "$DEPLOY_TARGET/" 2>/dev/null || true
  chmod -R 755 "$DEPLOY_TARGET/assets" 2>/dev/null || true
  find "$DEPLOY_TARGET" -type f -exec chmod 644 {} + 2>/dev/null || true
fi

# ۷. ارسال دستور راه‌اندازی مجدد به وب‌سرور لایت‌اسپید (LiteSpeed Node Passenger)
echo " [۶/۶] ارسال سیگنال ری‌استارت به وب‌سرور لایت‌اسپید..."
mkdir -p tmp && touch tmp/restart.txt

echo "--------------------------------------------------------"
echo "  ✓ بروزرسانی و بیلد پروژه با موفقیت به پایان رسید!"
echo "  سایت https://avinia.ir اکنون به آخرین نسخه گیت‌هاب مجهز شد."
echo "--------------------------------------------------------"
