import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, ShieldCheck, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | QuickMenu Catalog',
  description: 'Learn about QuickMenu Catalog subscription cancellations, refunds, payment issues, and order-related refund responsibilities.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-teal-500 selection:text-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <Link href="/">
            <Button variant="ghost" className="text-slate-400 hover:text-white text-xs gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <RotateCcw className="w-4 h-4" /> Refund Policy
          </div>
        </div>

        {/* Title & Effective Dates */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Refund &amp; Cancellation Policy
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
            <span>Effective Date: 5 September 2026</span>
            <span className="hidden sm:inline">•</span>
            <span>Last Updated: 5 September 2026</span>
          </div>
        </div>

        {/* Document Content */}
        <div className="space-y-8 text-sm sm:text-base text-slate-300 leading-relaxed">
          
          <p>
            This Refund &amp; Cancellation Policy explains how cancellations, refunds, subscription payments, and order-related refunds are handled when using QuickMenu Catalog (&ldquo;QuickMenu&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
          </p>
          <p>
            By subscribing to a paid QuickMenu plan or using QuickMenu&apos;s services, you acknowledge and agree to this policy.
          </p>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              1. About QuickMenu
            </h2>
            <p>
              QuickMenu Catalog is a digital business catalog and QR menu platform that enables businesses to create and manage digital catalogs, menus, products, services, QR codes, and related business features.
            </p>
            <p>
              QuickMenu provides the software platform and technology. Businesses using QuickMenu remain responsible for the products, food, services, prices, availability, orders, and customer transactions they offer through their catalogs.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              2. Subscription Plans
            </h2>
            <p>
              QuickMenu may offer free and paid subscription plans, including:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-200">
              <li><strong>Starter</strong> &ndash; Free</li>
              <li><strong>Pro Growth</strong> &ndash; LKR 2,000/month</li>
              <li><strong>Business Plus</strong> &ndash; LKR 3,500/month</li>
            </ul>
            <p>
              Plan features, limits, prices, and benefits may change from time to time. The applicable plan and price presented at the time of purchase will apply to that subscription period, subject to our Terms &amp; Conditions.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              3. Cancellation of Subscription
            </h2>
            <p>
              You may request cancellation of your paid QuickMenu subscription at any time.
            </p>
            <p>When you cancel:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-200">
              <li>Your current subscription will normally remain active until the end of the period that you have already paid for.</li>
              <li>Cancellation will normally prevent the subscription from renewing for the next billing period.</li>
              <li>Cancellation does not automatically create an entitlement to a refund for the unused portion of the current billing period.</li>
              <li>Your account and catalog data may remain stored according to our data-retention practices and applicable policies.</li>
            </ul>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs sm:text-sm">
              <strong className="text-teal-400 font-semibold block">Example:</strong>
              <p className="text-slate-300">
                If you purchase Pro Growth on 5 September and cancel on 20 September, your paid access may continue until the end of the applicable billing period. The subscription will not normally renew after cancellation.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              4. Refund Policy
            </h2>
            <p>
              Paid QuickMenu subscription fees are generally non-refundable.
            </p>
            <p>
              Because QuickMenu provides a digital software service that becomes available after subscription activation, we generally do not provide refunds simply because a customer:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-300">
              <li>Changes their mind</li>
              <li>Does not use the service</li>
              <li>Uses the service less than expected</li>
              <li>No longer requires the service</li>
              <li>Cancels after the billing period has started</li>
              <li>Does not use all available features</li>
              <li>Does not use all available catalog/item limits</li>
            </ul>
            <p>
              However, we may provide a refund or another appropriate remedy in the circumstances described below.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              5. Situations Where a Refund May Be Considered
            </h2>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-white">5.1 Duplicate Payment</h3>
              <p>
                If you have been charged more than once for the same subscription due to a verified payment or technical error, we will investigate the duplicate transaction. If the duplicate payment is confirmed, the duplicate amount may be refunded.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-white">5.2 Incorrect Payment</h3>
              <p>
                If you were charged an incorrect amount due to a verified technical or billing error on our side, we will investigate the transaction and, where appropriate, refund the incorrectly charged amount.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-white">5.3 Payment After Cancellation</h3>
              <p>
                If a subscription was successfully cancelled before a renewal but you were nevertheless charged for the subsequent renewal due to a verified technical or billing error, the charge may be refunded.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-white">5.4 Significant Service Failure</h3>
              <p>
                If a significant technical problem caused by QuickMenu prevents you from accessing an essential paid service for a substantial period, we may, at our discretion:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-slate-300">
                <li>Extend your subscription;</li>
                <li>Provide account credit;</li>
                <li>Provide a partial refund; or</li>
                <li>Provide another reasonable remedy.</li>
              </ul>
              <p className="text-xs sm:text-sm text-slate-400">
                The appropriate remedy will depend on the circumstances and duration of the issue.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              6. Refunds Are Not Guaranteed
            </h2>
            <p>
              Submitting a refund request does not automatically mean that a refund will be approved.
            </p>
            <p>Each request may be reviewed based on:</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-300">
              <li>The reason for the request</li>
              <li>Payment history</li>
              <li>Subscription status</li>
              <li>Account activity</li>
              <li>Technical issues</li>
              <li>Whether the payment was duplicated or incorrect</li>
              <li>Any applicable legal requirements</li>
            </ul>
            <p>
              QuickMenu reserves the right to determine the appropriate remedy where permitted by applicable law.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              7. No Prorated Refunds
            </h2>
            <p>
              Unless otherwise required by applicable law or specifically approved by QuickMenu, we do not generally provide prorated refunds for unused days remaining in a billing period.
            </p>
            <p>
              For example, if a customer pays LKR 2,000 for a monthly subscription and cancels after using the service for 10 days, the remaining unused days will not normally be refunded.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              8. Subscription Expiry and Downgrading
            </h2>
            <p>
              If a paid subscription expires or is cancelled and the paid period ends, the account may be moved to the applicable free plan or otherwise restricted according to the plan rules in effect at that time.
            </p>
            <p>
              If your catalog contains more items, categories, or features than permitted under the free plan:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
              <li>Existing data may be retained where technically possible.</li>
              <li>Features exceeding the free-plan limits may become unavailable.</li>
              <li>You may upgrade again to regain access to the applicable paid features.</li>
            </ul>
            <p>
              QuickMenu will not intentionally delete customer data merely because a subscription expires, except where deletion is permitted or required under our applicable policies.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              9. Business Orders and Customer Inquiries
            </h2>
            <p>
              QuickMenu may provide businesses with tools that allow customers to browse catalogs and, where enabled, submit orders or requests.
            </p>
            <p>
              QuickMenu is not necessarily the seller or supplier of the products or services displayed in a business&apos;s catalog.
            </p>
            <p>
              The individual business using QuickMenu is responsible for:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2 text-slate-300">
              <div>• Products</div>
              <div>• Food and beverages</div>
              <div>• Services</div>
              <div>• Prices</div>
              <div>• Product descriptions</div>
              <div>• Availability</div>
            </div>
            <p className="pt-2">
              Therefore, if you view or select a product, food item, or service from a business through a QuickMenu-powered catalog, any questions, inquiries, or requests regarding product details, menu options, pricing, and availability should be directed to the respective business.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              10. Returns and Exchanges
            </h2>
            <p>
              QuickMenu does not directly accept physical product returns unless QuickMenu itself is the seller of that product.
            </p>
            <p>
              For purchases made from a business using QuickMenu, the business&apos;s own return, exchange, cancellation, and refund policies will generally apply, together with any rights provided to customers under applicable law.
            </p>
            <p>
              Businesses are responsible for communicating their applicable policies to their customers.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              11. Food and Restaurant Orders
            </h2>
            <p>
              For restaurants, cafés, and food businesses using QuickMenu, customers should contact the relevant restaurant or food business regarding:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-300">
              <li>Incorrect orders</li>
              <li>Missing items</li>
              <li>Damaged orders</li>
              <li>Food-quality complaints</li>
              <li>Order cancellations</li>
              <li>Delivery problems</li>
              <li>Refund requests</li>
              <li>Replacement requests</li>
            </ul>
            <p>
              QuickMenu provides the digital catalog technology and is not responsible for the preparation, quality, packaging, or delivery of food supplied by an independent business.
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              12. Book, Retail, Jewelry and Other Physical Products
            </h2>
            <p>
              For businesses selling physical products through their QuickMenu catalog, the relevant business is responsible for handling:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-300">
              <li>Product returns</li>
              <li>Exchanges</li>
              <li>Damaged products</li>
              <li>Incorrect products</li>
              <li>Product warranties</li>
              <li>Refunds</li>
              <li>Delivery issues</li>
              <li>Customer complaints</li>
            </ul>
            <p>
              Customers should contact the business from which the product was purchased.
            </p>
          </section>

          {/* Section 13 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              13. Digital Services Provided by QuickMenu
            </h2>
            <p>
              If the issue concerns a QuickMenu subscription or QuickMenu software service itself, customers should contact QuickMenu support.
            </p>
            <p>Examples include:</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-300">
              <li>Paid features not being activated</li>
              <li>Incorrect subscription charges</li>
              <li>Duplicate charges</li>
              <li>Significant inability to access the platform</li>
              <li>Verified technical problems affecting essential paid functionality</li>
            </ul>
          </section>

          {/* Section 14 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              14. Refund Request Period
            </h2>
            <p>
              Where a customer believes they have a valid reason for requesting a refund, we recommend contacting QuickMenu as soon as possible.
            </p>
            <p>
              For billing-related issues, refund requests should normally be submitted within <strong>7 days</strong> of the relevant payment or discovery of the billing issue.
            </p>
            <p className="text-xs sm:text-sm text-slate-400">
              This does not limit any rights that cannot legally be excluded or restricted under applicable law.
            </p>
          </section>

          {/* Section 15 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              15. How to Request a Refund
            </h2>
            <p>
              To request a refund, contact QuickMenu through the official support/contact method provided on our website.
            </p>
            <p>Please provide:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
              <li>Business/account name</li>
              <li>Registered email address</li>
              <li>Payment date</li>
              <li>Amount paid</li>
              <li>Transaction/reference number, if available</li>
              <li>Reason for the refund request</li>
              <li>Relevant screenshots or supporting information, where applicable</li>
            </ul>
            <p>
              Providing complete information helps us investigate the request more quickly.
            </p>
          </section>

          {/* Section 16 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              16. Refund Investigation
            </h2>
            <p>
              After receiving a refund request, QuickMenu may review:
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-2 text-slate-300">
              <li>The payment transaction</li>
              <li>Subscription status</li>
              <li>Account activity</li>
              <li>Cancellation history</li>
              <li>Relevant technical records</li>
              <li>Any supporting information provided</li>
            </ol>
            <p>
              We may contact you if additional information is required.
            </p>
          </section>

          {/* Section 17 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              17. Refund Processing
            </h2>
            <p>
              If a refund is approved, we will generally attempt to process the refund using the original payment method where possible.
            </p>
            <p>
              The time required for the refunded amount to appear in your account may depend on:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-300">
              <li>The payment gateway</li>
              <li>Bank or card provider</li>
              <li>Financial institution</li>
              <li>Payment processing network</li>
            </ul>
            <p>
              QuickMenu cannot guarantee the exact time required for a financial institution to display an approved refund.
            </p>
          </section>

          {/* Section 18 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              18. Payment Gateway Charges
            </h2>
            <p>
              Where a payment provider or financial institution has charged a non-recoverable transaction fee, the treatment of such fees may depend on the circumstances of the refund and the applicable payment provider rules.
            </p>
            <p>
              QuickMenu will communicate any applicable deductions before processing a refund where such deductions are legally and contractually permitted.
            </p>
          </section>

          {/* Section 19 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              19. Promotional Offers and Discounts
            </h2>
            <p>
              Promotional prices, discounts, special offers, free trials, promotional credits, or other incentives may have additional conditions.
            </p>
            <p>Unless otherwise stated:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
              <li>Promotional offers cannot be exchanged for cash.</li>
              <li>Promotional credits may not be refundable.</li>
              <li>Discounts may not be applied retroactively to previous purchases.</li>
              <li>Cancelling a subscription does not necessarily restore an expired promotional offer.</li>
            </ul>
            <p>
              Specific promotional terms will apply where provided.
            </p>
          </section>

          {/* Section 20 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              20. Free Plans
            </h2>
            <p>
              The Starter Free plan does not require payment and therefore does not qualify for monetary refunds.
            </p>
            <p>
              If additional paid services are purchased separately, the payment for those services will be governed by this policy and the applicable purchase terms.
            </p>
          </section>

          {/* Section 21 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              21. Account Termination Due to Policy Violations
            </h2>
            <p>
              If an account is suspended or terminated because the customer violates QuickMenu&apos;s Terms &amp; Conditions, acceptable-use requirements, or applicable laws, the customer may not automatically be entitled to a refund.
            </p>
            <p>
              Any refund will be considered according to the circumstances and applicable law.
            </p>
          </section>

          {/* Section 22 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              22. Changes to Pricing or Plans
            </h2>
            <p>
              QuickMenu may change subscription prices, features, limits, or plans from time to time.
            </p>
            <p>
              Where appropriate, customers will be notified of significant changes before they affect a future renewal.
            </p>
            <p>
              Changes to a future billing period will not normally create a refund entitlement for a previous completed billing period.
            </p>
          </section>

          {/* Section 23 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              23. Legal Rights
            </h2>
            <p>
              Nothing in this Refund &amp; Cancellation Policy is intended to remove, restrict, or override any rights or protections that customers may have under applicable law.
            </p>
            <p>
              Where applicable law provides a customer with a right to a refund, cancellation, return, replacement, or other remedy that cannot legally be excluded, that right will continue to apply.
            </p>
          </section>

          {/* Section 24 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              24. Policy Changes
            </h2>
            <p>
              QuickMenu may update this Refund &amp; Cancellation Policy from time to time.
            </p>
            <p>
              When changes are made, the updated policy will be published on our website with a revised Last Updated date.
            </p>
            <p>
              Your continued use of QuickMenu after the updated policy becomes effective may be subject to the updated policy, to the extent permitted by applicable law.
            </p>
          </section>

          {/* Section 25 */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              25. Contact Us
            </h2>
            <p>
              If you have a question regarding a subscription cancellation, payment, refund, or QuickMenu service issue, please contact us through our official support channel:
            </p>
            <div className="space-y-2 text-sm text-slate-300">
              <div><strong className="text-white">QuickMenu Catalog</strong> &ndash; QR Digital Menu &amp; Business Catalog SaaS</div>
              <div><strong className="text-white">Website:</strong> <a href="https://qr-business-development.vercel.app" className="text-teal-400 hover:underline">https://qr-business-development.vercel.app</a></div>
            </div>
            <div className="pt-2">
              <a
                href="https://wa.me/94764689907?text=Hello%20QuickMenu%20Support%2C%20I%20have%20an%20inquiry%20regarding%20a%20Refund%20or%20Cancellation."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
              >
                <MessageSquare className="w-4 h-4" /> Reach Support on WhatsApp (+94 76 468 9907)
              </a>
            </div>
          </section>

        </div>

        {/* Footer Links */}
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-wrap items-center justify-center gap-4">
          <Link href="/terms" className="text-teal-400 hover:underline font-semibold">
            Terms of Service
          </Link>
          <span>•</span>
          <Link href="/privacy" className="text-teal-400 hover:underline font-semibold">
            Privacy Policy
          </Link>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-teal-400" /> PostgreSQL RLS Secured
          </span>
        </div>

      </div>
    </div>
  );
}
