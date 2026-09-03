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
  const receiptRef = useRef<HTMLDivElement>(null);

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

  const handlePrint = () => {
    window.print();
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
      `Status: PAID IN FULL ✓`;
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
            {/* Dedicated Print Media Styles for 1-Page Crisp Clean Output */}
      <style jsx global>{`
        @media print {
          /* Hide everything in the document */
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            height: auto !important;
            overflow: visible !important;
          }
          
          body * {
            visibility: hidden !important;
          }
          
          /* Only display the receipt container and its children */
          #printable-receipt,
          #printable-receipt * {
            visibility: visible !important;
          }
          
          #printable-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 12px !important;
            background: #ffffff !important;
            color: #0f172a !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /* Hide scrollbars, dialog shadows, and buttons */
          ::-webkit-scrollbar {
            display: none !important;
          }

          @page {
            size: A4 portrait;
            margin: 12mm;
          }
        }
      `}</style>

      {/* Printable Receipt Container */}
      <div 
        ref={receiptRef}
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
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 inline-block mb-1">
              ✓ OFFICIAL RECEIPT
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
