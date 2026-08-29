import React, { useEffect, useState } from 'react';
import { Crown, CheckCircle2, Zap, Phone, MessageSquare, ExternalLink } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SUBSCRIPTION_PLANS_META, SubscriptionPlan, BillingInterval, calculatePackageDiscount } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: SubscriptionPlan;
  reason?: string;
  businessName?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  currentPlan = 'free',
  reason,
  businessName: initialBusinessName,
}) => {
  const plans = [SUBSCRIPTION_PLANS_META.pro, SUBSCRIPTION_PLANS_META.enterprise];
  const [bizName, setBizName] = useState<string>(initialBusinessName || '');
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('annual');

  useEffect(() => {
    if (initialBusinessName) {
      setBizName(initialBusinessName);
      return;
    }
    async function fetchCurrentBusiness() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from('businesses')
          .select('name')
          .eq('owner_id', user.id)
          .single();
        if (data?.name) {
          setBizName(data.name);
        }
      } catch (err) {
        console.error('Error fetching business for upgrade modal:', err);
      }
    }
    if (isOpen) {
      fetchCurrentBusiness();
    }
  }, [isOpen, initialBusinessName]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upgrade Your Business Package"
      maxWidth="lg"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close & Return to Dashboard
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Banner Alert */}
        <div className="p-4 bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-indigo-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
          <div className="p-2 bg-amber-500 text-slate-950 rounded-xl shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {reason || 'Unlock Higher Catalog Limits & Premium Features'}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Select a premium package below to expand your menu items, categories, and business capabilities.
            </p>
          </div>
        </div>

        {/* Monthly | Annual Billing Switch Selector */}
        <div className="flex justify-center">
          <div className="p-1 bg-slate-100 border border-slate-200 rounded-2xl inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => setBillingInterval('monthly')}
              className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                billingInterval === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingInterval('annual')}
              className={`px-5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                billingInterval === 'annual'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950 text-teal-300">
                SAVE UP TO 14.3%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const isAnnual = billingInterval === 'annual';
            const price = isAnnual ? plan.priceAnnualLKR : plan.priceLKR;
            const discount = calculatePackageDiscount(plan.priceLKR, plan.priceAnnualLKR);

            const messageText = `Business:\n${bizName || 'My Business'}\n\nRequested Plan:\n${plan.name}\n\nBilling:\n${isAnnual ? 'Annual' : 'Monthly'}\n\nAmount:\nLKR ${price.toLocaleString()}\n\nDuration:\n${isAnnual ? '12 months' : '1 month'}`;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-6 flex flex-col justify-between relative transition-all ${
                  plan.id === 'pro'
                    ? 'border-teal-500 bg-teal-500/5 shadow-md'
                    : 'border-slate-900 bg-slate-950 text-white shadow-xl'
                }`}
              >
                {/* Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  {isAnnual && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                      Save {discount.formattedDiscount}
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    plan.id === 'pro'
                      ? 'bg-teal-500 text-slate-950'
                      : 'bg-indigo-500 text-white'
                  }`}>
                    {plan.badge}
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className={`text-lg font-extrabold ${plan.id === 'pro' ? 'text-slate-900' : 'text-white'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-xs ${plan.id === 'pro' ? 'text-slate-600' : 'text-slate-400'}`}>
                    {plan.description}
                  </p>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-extrabold ${plan.id === 'pro' ? 'text-slate-900' : 'text-white'}`}>
                        LKR {price.toLocaleString()}
                      </span>
                      <span className={`text-xs ${plan.id === 'pro' ? 'text-slate-500' : 'text-slate-400'}`}>
                        / {isAnnual ? 'year' : 'month'}
                      </span>
                      {isAnnual && (
                        <span className="text-xs text-slate-400 line-through">
                          LKR {discount.originalAnnualized.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {isAnnual && (
                      <div className={`text-xs font-bold mt-1 ${plan.id === 'pro' ? 'text-teal-700' : 'text-teal-400'}`}>
                        Equivalent to LKR {discount.monthlyEquivalent.toLocaleString()}/month
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200/20 space-y-2">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs">
                        <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 ${
                            plan.id === 'pro' ? 'text-teal-600' : 'text-teal-400'
                          }`} />
                        </div>
                        <span className={plan.id === 'pro' ? 'text-slate-700 font-medium' : 'text-slate-300'}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <a
                    href={`https://wa.me/94712220731?text=${encodeURIComponent(messageText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                      plan.id === 'pro'
                        ? 'bg-teal-500 hover:bg-teal-400 text-slate-950'
                        : 'bg-white hover:bg-slate-100 text-slate-950'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" /> Request Activation ({isAnnual ? 'Annual' : 'Monthly'})
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Admin Payment Activation Notice */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-500" /> Subscription Payment & Approval Process
          </div>
          <p>
            After selecting your package and interval, submit payment via bank transfer or direct contact. Your Super Admin will activate your subscription for 1 month or 12 months upon payment verification.
          </p>
        </div>
      </div>
    </Modal>
  );
};
