// ==============================================================
// cPanel LiteSpeed / Passenger Node.js Entry Point (app.js)
// Compatible with /usr/local/lsws/fcgi-bin/lsnode.js
// ==============================================================
const fs = require('fs');
const path = require('path');

const distServer = path.join(__dirname, 'dist', 'server.cjs');

if (fs.existsSync(distServer)) {
  console.log('[AgriManage cPanel] Loading compiled server from dist/server.cjs...');
  require(distServer);
} else {
  console.warn('[AgriManage cPanel] dist/server.cjs not found yet. Starting bootstrap diagnostic server.');
  const http = require('http');
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>سامانه جامع مدیریت باغات پسته (AgriManage)</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Tahoma", sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
          .card { background: #1e293b; max-width: 650px; width: 100%; border-radius: 16px; border: 1px solid #334155; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); text-align: right; }
          .badge { display: inline-flex; align-items: center; gap: 6px; background: #14532d; color: #4ade80; border: 1px solid #16a34a; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
          h2 { color: #ffffff; font-size: 22px; margin: 0 0 12px 0; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.7; margin: 0 0 16px 0; }
          .code-box { background: #0b0f19; border: 1px solid #1e293b; border-radius: 10px; padding: 16px; margin: 16px 0; direction: ltr; text-align: left; font-family: monospace; font-size: 14px; color: #38bdf8; overflow-x: auto; }
          .step { background: rgba(51, 65, 85, 0.4); border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; border-right: 4px solid #10b981; }
          .step-title { font-weight: bold; color: #f1f5f9; font-size: 14px; margin-bottom: 4px; }
          .step-desc { font-size: 13px; color: #94a3b8; margin: 0; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">
            <span>●</span> نودجی‌اس روی هاست LiteSpeed فعال است
          </div>
          <h2>نیازمند اجرای یک‌بار بیلد (Build)</h2>
          <p>موتور نودجی‌اس با موفقیت بالا آمده است، اما فایل‌های کامپایل‌شده کلاینت و سرور هنوز ساخته نشده‌اند.</p>
          
          <div class="step">
            <div class="step-title">گام ۱: باز کردن ترمینال cPanel</div>
            <p class="step-desc">وارد کنترل‌پنل cPanel خود شوید و ابزار <strong>Terminal</strong> را باز کنید.</p>
          </div>

          <div class="step">
            <div class="step-title">گام ۲: اجرای دستورات نصب و ساخت</div>
            <p class="step-desc">دستورات زیر را به ترتیب کپی و در ترمینال اجرا نمایید:</p>
            <div class="code-box">
cd ~/repositories/agrimanage
npm install
npm run build
            </div>
          </div>

          <div class="step">
            <div class="step-title">گام ۳: ریستارت برنامه در cPanel</div>
            <p class="step-desc">به صفحه <strong>Setup Node.js App</strong> برگردید و روی دکمه <strong>Restart</strong> کلیک فرمایید.</p>
          </div>
        </div>
      </body>
      </html>
    `);
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[AgriManage cPanel] Fallback listener active on port ${PORT}`);
  });
}
