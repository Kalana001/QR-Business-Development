'use client';

import React, { useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Printer, MessageSquare, Copy, Check, ShieldCheck, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { SUBSCRIPTION_PLANS_META, SubscriptionPlan } from '@/lib/types';

export interface PaymentTransaction {
  id: string;
  business_id: string;
  plan: SubscriptionPlan;
  billing_interval: 'monthly' | 'annual';
  amount: number;
  currency?: string;
  payment_reference?: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
  approved_by?: string;
  businesses?: {
    name: string;
    slug: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    currency?: string;
  } | null;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentTransaction | null;
}

function formatPaymentMethod(ref?: string | null): string {
  if (!ref || ref === 'Super Admin Manual Approval' || ref === 'Super Admin Activation' || ref === 'Approval') {
    return 'Bank Transfer (Admin Approval)';
  }
  return ref;
}

export function ReceiptModal({ isOpen, onClose, payment }: ReceiptModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!payment) return null;

  const planMeta = SUBSCRIPTION_PLANS_META[payment.plan] || {
    name: payment.plan.toUpperCase(),
    priceLKR: payment.amount,
    priceAnnualLKR: payment.amount,
  };

  const receiptNo = `RCP-${new Date(payment.created_at).getFullYear()}-${payment.id.slice(0, 6).toUpperCase()}`;
  const paymentDate = new Date(payment.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const startDateFormatted = new Date(payment.start_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const endDateFormatted = new Date(payment.end_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const businessName = payment.businesses?.name || 'Customer Business';
  const businessSlug = payment.businesses?.slug || '';
  const businessPhone = payment.businesses?.phone || 'N/A';
  const businessEmail = payment.businesses?.email || 'N/A';
  const businessAddress = payment.businesses?.address || 'N/A';

  const currency = payment.currency || payment.businesses?.currency || 'LKR';
  const isFreeTrial = payment.plan === 'enterprise_gift' || payment.amount === 0;

  // Dedicated Bulletproof 1-Page Isolated Print Handler
  const handlePrint = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const formattedAmount = formatCurrency(payment.amount, currency);
    const methodStr = formatPaymentMethod(payment.payment_reference);

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${receiptNo}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .receipt-card {
              width: 100%;
              max-width: 680px;
              margin: 0 auto;
              border: 1px solid #cbd5e1;
              border-radius: 16px;
              padding: 24px;
              background: #ffffff;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 16px;
              margin-bottom: 18px;
            }
            .brand-logo {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .logo-badge {
              width: 34px;
              height: 34px;
              background: #0f172a;
              color: #ffffff;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 900;
              font-size: 13px;
            }
            .brand-title {
              font-size: 17px;
              font-weight: 800;
              color: #0f172a;
            }
            .brand-sub {
              font-size: 11px;
              color: #64748b;
            }
            .badge-official {
              display: inline-block;
              padding: 3px 10px;
              border-radius: 9999px;
              font-size: 10px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              background: #ecfdf5;
              color: #065f46;
              border: 1px solid #a7f3d0;
              margin-bottom: 3px;
            }
            .badge-trial {
              display: inline-block;
              padding: 3px 10px;
              border-radius: 9999px;
              font-size: 10px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              background: #f5f3ff;
              color: #5b21b6;
              border: 1px solid #ddd6fe;
              margin-bottom: 3px;
            }
            .receipt-id {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              font-weight: 700;
              font-size: 12px;
              color: #0f172a;
            }
            .receipt-date {
              font-size: 11px;
              color: #64748b;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 14px;
              margin-bottom: 18px;
            }
            .meta-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 12px 14px;
              font-size: 12px;
            }
            .meta-title {
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #64748b;
              margin-bottom: 4px;
            }
            .meta-val-bold {
              font-weight: 800;
              font-size: 13px;
              color: #0f172a;
            }
            .meta-row {
              color: #334155;
              margin-top: 2px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              overflow: hidden;
              margin-bottom: 16px;
              font-size: 12px;
            }
            th {
              background: #f1f5f9;
              padding: 10px 14px;
              text-align: left;
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #475569;
              border-bottom: 1px solid #e2e8f0;
            }
            td {
              padding: 12px 14px;
              border-bottom: 1px solid #f1f5f9;
              vertical-align: top;
            }
            .total-section {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 16px;
            }
            .total-box {
              width: 220px;
              font-size: 12px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              color: #64748b;
              margin-bottom: 4px;
            }
            .total-row.final {
              border-top: 1px solid #cbd5e1;
              padding-top: 6px;
              font-size: 13px;
              font-weight: 900;
              color: #0f172a;
            }
            .final-val {
              color: #0f766e;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            }
            .footer-note {
              border-top: 1px solid #e2e8f0;
              padding-top: 12px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              color: #64748b;
            }
            .verified-tag {
              color: #0f766e;
              font-weight: 700;
            }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header">
              <div class="brand-logo">
                <div class="logo-badge">QR</div>
                <div>
                  <div class="brand-title">QR Business Suite</div>
                  <div class="brand-sub">Digital Catalog Management &amp; Invoicing</div>
                </div>
              </div>
              <div style="text-align: right;">
                <div class="${isFreeTrial ? 'badge-trial' : 'badge-official'}">
                  ${isFreeTrial ? '✓ COMPLIMENTARY TRIAL' : '✓ OFFICIAL RECEIPT'}
                </div>
                <div class="receipt-id">${receiptNo}</div>
                <div class="receipt-date">Issued: ${paymentDate}</div>
              </div>
            </div>

            <div class="meta-grid">
              <div class="meta-box">
                <div class="meta-title">Billed To (Client):</div>
                <div class="meta-val-bold">${businessName}</div>
                <div class="meta-row" style="font-family: monospace; font-size: 11px;">URL Slug: /c/${businessSlug}</div>
                ${businessPhone !== 'N/A' ? `<div class="meta-row">Phone: ${businessPhone}</div>` : ''}
                ${businessEmail !== 'N/A' ? `<div class="meta-row">Email: ${businessEmail}</div>` : ''}
                ${businessAddress !== 'N/A' ? `<div class="meta-row">Address: ${businessAddress}</div>` : ''}
              </div>

              <div class="meta-box">
                <div class="meta-title">Payment Information:</div>
                <div class="meta-row"><strong>Method:</strong> ${methodStr}</div>
                <div class="meta-row"><strong>Billing Interval:</strong> <span style="text-transform: capitalize;">${payment.billing_interval}</span></div>
                <div class="meta-row"><strong>Payment Status:</strong> <strong style="color: ${isFreeTrial ? '#6b21a8' : '#047857'}; text-transform: uppercase;">${isFreeTrial ? 'Free' : 'PAID IN FULL ✓'}</strong></div>
                <div class="meta-row"><strong>Currency:</strong> ${currency}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Subscription Item Description</th>
                  <th style="text-align: center;">Duration</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong style="color: #0f172a; font-size: 13px;">${planMeta.name} Plan Activation</strong>
                    <div style="color: #64748b; font-size: 11px; margin-top: 2px;">
                      Full workspace access, digital QR catalog hosting, printable flyers, and analytics.
                    </div>
                    <div style="color: #0f766e; font-size: 11px; margin-top: 4px;">
                      Coverage: <strong>${startDateFormatted}</strong> to <strong>${endDateFormatted}</strong>
                    </div>
                  </td>
                  <td style="text-align: center; color: #334155; font-weight: 600;">
                    ${payment.billing_interval === 'annual' ? '12 Months (1 Year)' : '1 Month'}
                  </td>
                  <td style="text-align: right; font-weight: 800; font-family: monospace; font-size: 13px;">
                    ${formattedAmount}
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="total-section">
              <div class="total-box">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span style="font-family: monospace;">${formattedAmount}</span>
                </div>
                <div class="total-row">
                  <span>Taxes / Fees:</span>
                  <span style="font-family: monospace;">LKR 0.00</span>
                </div>
                <div class="total-row final">
                  <span>Total Paid:</span>
                  <span class="final-val">${formattedAmount}</span>
                </div>
              </div>
            </div>

            <div class="footer-note">
              <div class="verified-tag">✓ Verified Payment &bull; PostgreSQL RLS Secured</div>
              <div>Thank you for choosing QR Business Development!</div>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2500);
    }, 250);
  };

  const whatsappReceiptMessage = encodeURIComponent(
    `🧾 *PAYMENT RECEIPT & INVOICE*\n` +
    `--------------------------------\n` +
    `*Receipt No:* ${receiptNo}\n` +
    `*Business:* ${businessName}\n` +
    `*Package:* ${planMeta.name} (${payment.billing_interval === 'annual' ? 'Annual Billing' : 'Monthly Billing'})\n` +
    `*Amount Paid:* ${formatCurrency(payment.amount, currency)}\n` +
    `*Active Period:* ${startDateFormatted} to ${endDateFormatted}\n` +
    `*Status:* ${isFreeTrial ? 'Free' : 'PAID IN FULL ✓'}\n` +
    `*Live Catalog:* https://qr-business-development.vercel.app/c/${businessSlug}\n\n` +
    `Thank you for powering your business with QR Business Catalog!`
  );

  const cleanPhone = businessPhone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappReceiptMessage}`;

  const handleCopySummary = () => {
    const text = 
      `Receipt No: ${receiptNo}\n` +
      `Business: ${businessName}\n` +
      `Plan: ${planMeta.name} (${payment.billing_interval})\n` +
      `Amount: ${formatCurrency(payment.amount, currency)}\n` +
      `Period: ${startDateFormatted} - ${endDateFormatted}\n` +
      `Status: ${isFreeTrial ? 'Free' : 'PAID IN FULL ✓'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Payment Receipt — ${receiptNo}`}
      maxWidth="lg"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
              className="gap-1.5 text-xs text-slate-300 border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Summary'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {cleanPhone && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Send WhatsApp
              </a>
            )}

            <Button
              type="button"
              onClick={handlePrint}
              size="sm"
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs gap-1.5 border-none"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </Button>
          </div>
        </div>
      }
    >
      {/* On-Screen Receipt Preview */}
      <div 
        id="printable-receipt" 
        className="p-6 sm:p-8 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-sm space-y-6 select-text"
      >
        {/* Receipt Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                QR
              </div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">QR Business Suite</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Digital Catalog Management &amp; Invoicing</p>
          </div>

          <div className="text-left sm:text-right space-y-0.5">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border inline-block mb-1 ${
              isFreeTrial ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}>
              {isFreeTrial ? '✓ COMPLIMENTARY TRIAL' : '✓ OFFICIAL RECEIPT'}
            </span>
            <div className="text-xs font-mono font-bold text-slate-900">{receiptNo}</div>
            <div className="text-[11px] text-slate-500">Issued: {paymentDate}</div>
          </div>
        </div>

        {/* Billed To & Payment Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Billed To (Client):</span>
            <div className="font-bold text-slate-900 text-sm">{businessName}</div>
            <div className="text-slate-600 font-mono text-[11px]">URL Slug: /c/{businessSlug}</div>
            {businessPhone !== 'N/A' && <div className="text-slate-600">Phone: {businessPhone}</div>}
            {businessEmail !== 'N/A' && <div className="text-slate-600">Email: {businessEmail}</div>}
            {businessAddress !== 'N/A' && <div className="text-slate-600">Address: {businessAddress}</div>}
          </div>

          <div className="space-y-1 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Information:</span>
            <div className="font-semibold text-slate-800">
              Method: <span className="font-bold">{formatPaymentMethod(payment.payment_reference)}</span>
            </div>
            <div className="font-semibold text-slate-800">
              Billing Interval: <span className="capitalize font-bold">{payment.billing_interval}</span>
            </div>
            <div className="font-semibold text-slate-800">
              Payment Status: {isFreeTrial ? (
                <span className="text-purple-700 font-extrabold uppercase">Free</span>
              ) : (
                <span className="text-emerald-700 font-extrabold uppercase">Paid in Full ✓</span>
              )}
            </div>
            <div className="font-semibold text-slate-800">
              Currency: <span className="font-bold">{currency}</span>
            </div>
          </div>
        </div>

        {/* Itemized Line Items Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Subscription Item Description</th>
                <th className="p-3 text-center">Duration</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3">
                  <div className="font-bold text-slate-900">{planMeta.name} Plan Activation</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Full workspace access, digital QR catalog hosting, printable flyers, and analytics.
                  </div>
                  <div className="text-[11px] text-teal-700 font-medium mt-1">
                    Coverage: <strong>{startDateFormatted}</strong> to <strong>{endDateFormatted}</strong>
                  </div>
                </td>
                <td className="p-3 text-center font-medium text-slate-700">
                  {payment.billing_interval === 'annual' ? '12 Months (1 Year)' : '1 Month'}
                </td>
                <td className="p-3 text-right font-bold text-slate-900 font-mono">
                  {formatCurrency(payment.amount, currency)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total Summary */}
        <div className="flex justify-end pt-2">
          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span className="font-mono">{formatCurrency(payment.amount, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Taxes / Fees:</span>
              <span className="font-mono">LKR 0.00</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-300 font-extrabold text-sm text-slate-900">
              <span>Total Paid:</span>
              <span className="font-mono text-teal-700">{formatCurrency(payment.amount, currency)}</span>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1 text-teal-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            Verified Payment &bull; PostgreSQL RLS Secured
          </div>
          <div>Thank you for choosing QR Business Development!</div>
        </div>
      </div>
    </Modal>
  );
}
