// Email templates
export const emailTemplates = {
  verification: (data) => ({
    subject: 'تایید ایمیل - کرایه موتر',
    html: `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تایید ایمیل شما</title>
        <style>
          body {
            font-family: 'Inter', 'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.8;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
            direction: rtl;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #95122C, #100C08);
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
            text-align: right;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #95122C, #100C08);
            color: #fff;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 500;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
          }
          .link {
            background: #f3f4f6;
            padding: 16px;
            border-radius: 12px;
            font-family: monospace;
            word-break: break-all;
            color: #2563eb;
            margin: 20px 0;
            direction: ltr;
            text-align: left;
          }
          .footer {
            padding: 30px;
            text-align: center;
            background: #f9f9f9;
            color: #6b7280;
            font-size: 14px;
          }
          .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e5e7eb, transparent);
            margin: 30px 0;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #2563eb;
            direction: ltr;
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 به موترهای کریمی خوش آمدید، ${data.name}!</h1>
          </div>
          <div class="content">
            <p style="font-size: 18px; color: #374151;">از ثبت نام شما سپاسگزاریم! ما از همراهی شما خوشحالیم.</p>
            
            <p style="color: #6b7280;">برای شروع کرایه موترهای عالی، لطفاً ایمیل خود را تایید کنید:</p>

            <p>لطفاً با استفاده از یکی از گزینه‌های زیر ایمیل خود را تایید کنید:</p>

            <h3>🔐 کد تایید شما:</h3>
            <div>
              <span class="otp-code">${data.otp}</span>
            </div>

            <hr/>
            
            <div style="text-align: center; color: white;">
              <a href="${data.link}" class="button">تایید ایمیل</a>
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #6b7280; font-size: 14px;">یا لینک زیر را در مرورگر خود کپی کنید:</p>
            <div class="link">${data.link}</div>
            
            <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
              این لینک تا ۲۴ ساعت معتبر است. اگر شما درخواست ایجاد حساب نداده‌اید، لطفاً این ایمیل را نادیده بگیرید.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} موترهای کرایی کریمی. تمام حقوق محفوظ است.</p>
            <p style="font-size: 12px;">کابل، افغانستان</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  welcome: (data) => ({
    subject: 'به سایت موترهای کرایی خوش آمدید!',
    html: `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>به سایت موترهای کرایی خوش آمدید</title>
        <style>
          body {
            font-family: 'Inter', 'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.8;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
            direction: rtl;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #059669, #047857);
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
            text-align: right;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #059669, #047857);
            color: #fff;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 500;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s;
          }
          .features {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 30px 0;
          }
          .feature {
            text-align: center;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 16px;
          }
          .feature-emoji {
            font-size: 32px;
            margin-bottom: 10px;
          }
          .feature-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 5px;
          }
          .feature-desc {
            font-size: 13px;
            color: #6b7280;
          }
          .footer {
            padding: 30px;
            text-align: center;
            background: #f9f9f9;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 خوش آمدید، ${data.name}!</h1>
          </div>
          <div class="content">
            <p style="font-size: 18px; color: #374151;">ایمیل شما موفقانه تایید شد!</p>
            
            <p style="color: #6b7280;">اکنون شما میتوانید که از مجموعه موترهای لوکس ما انتخاب کنید.</p>
            
            <div class="features">
              <div class="feature">
                <div class="feature-emoji">🔍</div>
                <div class="feature-title">جستجوی موترها</div>
                <div class="feature-desc">جستجو در مجموعه متنوع ما</div>
              </div>
              <div class="feature">
                <div class="feature-emoji">📅</div>
                <div class="feature-title">رزرو آسان</div>
                <div class="feature-desc">تنها با چند کلیک رزرو کنید</div>
              </div>
              <div class="feature">
                <div class="feature-emoji">💎</div>
                <div class="feature-title">خدمات عالی</div>
                <div class="feature-desc">پشتیبانی ۲۴ ساعته</div>
              </div>
              <div class="feature">
                <div class="feature-emoji">⭐</div>
                <div class="feature-title">بهترین قیمت‌ها</div>
                <div class="feature-desc">قیمت‌های رقابتی</div>
              </div>
            </div>
            
            <div style="text-align: center; color: white">
              <a href="${data.loginLink}" class="button">شروع سفر</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} کریمی تمام حقوق محفوظ است.</p>
            <p style="font-size: 12px;">رویاهای خود را با ما برانید! 🌟</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  passwordReset: (data) => ({
    subject: 'بازنشانی رمز عبور - موترهای کرایی کریمی',
    html: `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>بازنشانی رمز عبور</title>
      <style>
        body {
          font-family: 'Inter', 'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.8;
          color: #1a1a1a;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
          direction: rtl;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
          text-align: right;
        }
        .warning-box {
          background: #fff3cd;
          border: 1px solid #ffeeba;
          color: #856404;
          padding: 16px;
          border-radius: 12px;
          margin: 20px 0;
          font-size: 14px;
          text-align: right;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 500;
          font-size: 16px;
          margin: 20px 0;
          transition: transform 0.2s;
        }
        .button:hover {
          transform: translateY(-2px);
        }
        .link {
          background: #f3f4f6;
          padding: 16px;
          border-radius: 12px;
          font-family: monospace;
          word-break: break-all;
          color: #dc2626;
          margin: 20px 0;
          direction: ltr;
          text-align: left;
        }
        .footer {
          padding: 30px;
          text-align: center;
          background: #f9f9f9;
          color: #6b7280;
          font-size: 14px;
        }
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #e5e7eb, transparent);
          margin: 30px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 بازنشانی رمز عبور</h1>
        </div>
        <div class="content">
          <p style="font-size: 18px; color: #374151;">سلام ${data.name}،</p>
          
          <p style="color: #6b7280;">ما درخواست بازنشانی رمز عبور حساب موترهای کرایی کریمی شما را دریافت کردیم. برای تنظیم رمز عبور جدید روی دکمه زیر کلیک کنید:</p>
          
          <div style="text-align: center; color: white;">
            <a href="${data.link}" class="button">بازنشانی رمز عبور</a>
          </div>
          
          <div class="warning-box">
            <strong>⚠️ مهم:</strong> این لینک بازنشانی رمز عبور تا ۱۰ دقیقه معتبر است. اگر شما درخواست بازنشانی رمز عبور نداده‌اید، لطفاً این ایمیل را نادیده بگیرید یا در صورت نگرانی با پشتیبانی تماس بگیرید.
          </div>
          
          <div class="divider"></div>
          
          <p style="color: #6b7280; font-size: 14px;">یا لینک زیر را در مرورگر خود کپی کنید:</p>
          <div class="link">${data.link}</div>
          
          <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
            به دلایل امنیتی، این لینک فقط یک بار قابل استفاده است. اگر نیاز به بازنشانی مجدد رمز عبور دارید، لطفاً درخواست جدیدی ارسال کنید.
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} موترهای کرایی کریمی. تمام حقوق محفوظ است.</p>
          <p style="font-size: 12px;">کابل، افغانستان</p>
        </div>
      </div>
    </body>
    </html>
  `,
  }),

  passwordResetSuccess: (data) => ({
    subject: 'رمز عبور شما بازنشانی شد - موترهای کرایی کریمی',
    html: `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>بازنشانی رمز عبور موفق</title>
      <style>
        body {
          font-family: 'Inter', 'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.8;
          color: #1a1a1a;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
          direction: rtl;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #059669, #047857);
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
          text-align: right;
        }
        .success-icon {
          font-size: 64px;
          text-align: center;
          margin-bottom: 20px;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background: linear-gradient(135deg, #059669, #047857);
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 500;
          font-size: 16px;
          margin: 20px 0;
          transition: transform 0.2s;
        }
        .security-tip {
          background: #e8f5e9;
          padding: 20px;
          border-radius: 12px;
          margin: 20px 0;
          text-align: right;
        }
        .footer {
          padding: 30px;
          text-align: center;
          background: #f9f9f9;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ بازنشانی رمز عبور موفق</h1>
        </div>
        <div class="content">
          <div class="success-icon">🔒</div>
          
          <p style="font-size: 18px; color: #374151;">سلام ${data.name}،</p>
          
          <p style="color: #6b7280;">رمز عبور شما موفقانه بازنشانی شد. اکنون می‌توانید با رمز عبور جدید خود وارد حساب شوید.</p>
          
          <div style="text-align: center; color: white;">
            <a href="${data.loginLink}" class="button">ورود به حساب</a>
          </div>
          
          <div class="security-tip">
            <strong>🔐 نکته امنیتی:</strong>
            <p style="margin-top: 8px; font-size: 14px;">برای امنیت خود، به یاد داشته باشید:</p>
            <ul style="font-size: 14px; margin-top: 4px; padding-right: 20px;">
              <li>از رمز عبور منحصر به فرد برای این حساب استفاده کنید</li>
              <li>هرگز رمز عبور خود را با کسی به اشتراک نگذارید</li>
              <li>در صورت موجود بودن، تایید دو مرحله‌ای را فعال کنید</li>
            </ul>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">
            اگر شما این بازنشانی رمز عبور را انجام نداده‌اید، لطفاً فوراً با تیم پشتیبانی ما تماس بگیرید.
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} موترهای کرایی کریمی. تمام حقوق محفوظ است.</p>
          <p style="font-size: 12px;">رویاهای خود را با ما برانید! 🌟</p>
        </div>
      </div>
    </body>
    </html>
  `,
  }),
};

export default emailTemplates;
