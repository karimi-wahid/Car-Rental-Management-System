import { useRef } from "react";
import { motion } from "motion/react";
import { Download, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.svg";
import { formatCurrency, formatDate } from "@/lib/utils";

const COMPANY = {
  name: import.meta.env.VITE_COMPANY_NAME || "موتر کرایه لوکس",
  address: "کابل، ناحیه هشتم، سرک کابل جلال آباد، شرکت حبیب گلزار",
  phone: "+93 766 303 465",
  email: "info@luxcar.af",
  taxId: "TIN-AF-20240001",
};

const diffDays = (start, end) =>
  Math.max(1, Math.ceil((new Date(end) - new Date(start)) / 86400000));

export const BookingInvoice = ({ booking, onClose }) => {
  const printRef = useRef(null);

  if (!booking) return null;

  const { user, car, startDate, endDate, totalPrice, _id, createdAt } = booking;
  const days = diffDays(startDate, endDate);
  const pricePerDay = car?.pricePerDay || Math.round(totalPrice / days);
  const subtotal = pricePerDay * days;
  const bookingNumber = `#${_id.slice(-6).toUpperCase()}`;
  const invoiceNumber = `INV-${_id?.slice(-8).toUpperCase()}`;

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="UTF-8" />
        <title>فاکتور ${invoiceNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Vazirmatn', sans-serif; direction: rtl; background: #fff; color: #1a1a1a; }
          .invoice-wrap { max-width: 800px; margin: 0 auto; padding: 48px 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #1a1a1a; padding-bottom: 24px; }
          .logo { height: 48px; }
          .company-info { text-align: left; font-size: 12px; line-height: 1.8; color: #555; }
          .invoice-title { font-size: 36px; font-weight: 700; letter-spacing: -1px; margin-bottom: 4px; }
          .invoice-meta { font-size: 13px; color: #666; }
          .section { margin-bottom: 32px; }
          .section-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 6px; }
          .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
          .party-label { font-size: 11px; color: #999; margin-bottom: 4px; }
          .party-name { font-size: 16px; font-weight: 600; margin-bottom: 2px; }
          .party-detail { font-size: 13px; color: #555; line-height: 1.7; }
          table { width: 100%; border-collapse: collapse; }
          th { font-size: 11px; font-weight: 600; color: #999; text-align: right; padding: 10px 12px; border-bottom: 2px solid #1a1a1a; }
          th:last-child { text-align: left; }
          td { padding: 14px 12px; font-size: 14px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
          td:last-child { text-align: left; font-variant-numeric: tabular-nums; }
          .totals { margin-top: 16px; }
          .total-row { display: flex; justify-content: space-between; padding: 6px 12px; font-size: 14px; }
          .total-final { font-size: 18px; font-weight: 700; background: #1a1a1a; color: #fff; padding: 14px 12px; border-radius: 6px; display: flex; justify-content: space-between; margin-top: 8px; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 48px; }
          .sig-box { border-top: 1.5px solid #1a1a1a; padding-top: 12px; }
          .sig-label { font-size: 12px; color: #666; }
          .sig-space { height: 56px; }
          .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #eee; font-size: 11px; color: #aaa; text-align: center; }
          .status-badge { display: inline-block; background: #d4f7e7; color: #0a6640; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
        </style>
      </head>
      <body><div class="invoice-wrap">${printContents}</div></body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 5000);
  };

  const handleDownload = () => handlePrint();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl w-full max-w-2xl my-8"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {invoiceNumber}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 ml-1" />
              چاپ
            </Button>
            <Button size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 ml-1" />
              دانلود PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <div
          ref={printRef}
          className="p-8 font-['Vazirmatn',sans-serif]"
          dir="rtl"
        >
          {/* Header */}
          <div className="header flex justify-between items-start mb-10 pb-6 border-b-2 border-zinc-900 dark:border-zinc-100">
            <div>
              <img src={logo} alt={COMPANY.name} className="logo h-12 mb-3" />
              <div className="company-info text-xs text-zinc-500 leading-relaxed">
                <div>{COMPANY.address}</div>
                <div>{COMPANY.phone}</div>
                <div>{COMPANY.email}</div>
              </div>
            </div>
            <div className="text-left">
              <div className="invoice-title text-2xl font-bold tracking-tight text-zinc-900 mb-2 dark:text-white">
                فاکتور
              </div>
              <div className="invoice-meta text-sm text-zinc-500 mt-1 space-y-0.5">
                <div>
                  شماره:{" "}
                  <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
                    {invoiceNumber}
                  </span>
                </div>
                <div>
                  شماره رزور:{" "}
                  <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
                    {bookingNumber}
                  </span>
                </div>
                <div>تاریخ صدور: {formatDate(createdAt)}</div>
                <div className="mt-2">
                  <span className="status-badge inline-block bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full">
                    تایید شده
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="parties grid grid-cols-2 gap-8 mb-8">
            <div>
              <div className="section-title text-xs font-semibold text-zinc-400 tracking-widest uppercase mb-3 pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
                فروشنده
              </div>
              <div className="party-name text-base font-semibold text-zinc-900 dark:text-white mb-1">
                {COMPANY.name}
              </div>
              <div className="party-detail text-sm text-zinc-500 leading-relaxed">
                <div>{COMPANY.address}</div>
                <div>{COMPANY.phone}</div>
                <div>{COMPANY.email}</div>
              </div>
            </div>
            <div>
              <div className="section-title text-xs font-semibold text-zinc-400 tracking-widest uppercase mb-3 pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
                مشتری
              </div>
              <div className="party-name text-base font-semibold text-zinc-900 dark:text-white mb-1">
                {user?.name || "—"}
              </div>
              <div className="party-detail text-sm text-zinc-500 leading-relaxed">
                {user?.email && <div>{user.email}</div>}
                {user?.phone && <div>{user.phone}</div>}
                {user?.address && <div>{user.address}</div>}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="section mb-6">
            <div className="section-title text-xs font-semibold text-zinc-400 tracking-widest uppercase mb-3 pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
              جزئیات خدمات
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-zinc-900 dark:border-zinc-100">
                  <th className="text-right text-xs font-semibold text-zinc-400 pb-3 pr-2">
                    شرح
                  </th>
                  <th className="text-center text-xs font-semibold text-zinc-400 pb-3">
                    روزها
                  </th>
                  <th className="text-center text-xs font-semibold text-zinc-400 pb-3">
                    قیمت فی روز
                  </th>
                  <th className="text-left text-xs font-semibold text-zinc-400 pb-3 pl-2">
                    مجموع
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-4 pr-2 align-top">
                    <div className="font-medium text-zinc-900 dark:text-white">
                      {car?.brand} {car?.model} {car?.year && `(${car.year})`}
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      از {formatDate(startDate)} تا {formatDate(endDate)}
                    </div>
                    {car?.location && (
                      <div className="text-xs text-zinc-400">
                        موقعیت: {car.location}
                      </div>
                    )}
                  </td>
                  <td className="py-4 text-center text-zinc-700 dark:text-zinc-300 font-mono">
                    {days}
                  </td>
                  <td className="py-4 text-center text-zinc-700 dark:text-zinc-300 font-mono">
                    {formatCurrency(pricePerDay)}
                  </td>
                  <td className="py-4 pl-2 text-left font-mono font-medium text-zinc-900 dark:text-white">
                    {formatCurrency(subtotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="totals flex flex-col items-end gap-1 mb-10">
            <div className="total-row flex justify-between w-64 text-sm text-zinc-500 py-1.5 px-3">
              <span>جمع فرعی</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between w-64 text-xs text-zinc-400 py-1 px-3 border-t border-zinc-100 dark:border-zinc-800">
              <span>مالیات</span>
              <span>شامل نمی‌شود</span>
            </div>
            <div className="total-final flex justify-between w-64 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg px-4 py-3.5 mt-2">
              <span className="font-semibold">مجموع کل</span>
              <span className="font-bold font-mono">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>

          {/* Signatures */}
          <div className="signatures grid grid-cols-2 gap-12 mt-12">
            <div>
              <div className="sig-space h-14" />
              <div className="sig-box border-t-2 border-zinc-900 dark:border-zinc-100 pt-3">
                <div className="sig-label text-xs text-zinc-500">
                  امضای مدیر / ادمین
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  {COMPANY.name}
                </div>
              </div>
            </div>
            <div>
              <div className="sig-space h-14" />
              <div className="sig-box border-t-2 border-zinc-900 dark:border-zinc-100 pt-3">
                <div className="sig-label text-xs text-zinc-500">
                  امضای مشتری
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  {user?.name || "مشتری"}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="footer mt-12 pt-5 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-400">
            <p>این فاکتور به صورت الکترونیکی صادر شده و معتبر می‌باشد.</p>
            <p className="mt-1">
              {COMPANY.name} · {COMPANY.phone} · {COMPANY.email}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
