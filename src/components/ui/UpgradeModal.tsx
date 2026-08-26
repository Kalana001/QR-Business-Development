'use client';

import React from 'react';
import { Crown, CheckCircle2, Zap, Phone, MessageSquare, ExternalLink } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SUBSCRIPTION_PLANS_META, SubscriptionPlan } from '@/lib/types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: SubscriptionPlan;
  reason?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  currentPlan = 'free',
  reason,
}) => {
  const plans = [SUBSCRIPTION_PLANS_META.pro, SUBSCRIPTION_PLANS_META.enterprise];

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

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between relative transition-all ${
                plan.id === 'pro'
                  ? 'border-teal-500 bg-teal-500/5 shadow-md'
                  : 'border-slate-900 bg-slate-950 text-white shadow-xl'
              }`}
            >
              {/* Badge */}
              <div className="absolute top-4 right-4">
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
                  <span className={`text-3xl font-extrabold ${plan.id === 'pro' ? 'text-slate-900' : 'text-white'}`}>
                    LKR {plan.priceLKR.toLocaleString()}
                  </span>
                  <span className={`text-xs ${plan.id === 'pro' ? 'text-slate-500' : 'text-slate-400'}`}>
                    {' '}/ month
                  </span>
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
                  href={`https://wa.me/?text=Hello%20Admin,%20I%20want%20to%20upgrade%20my%20business%20catalog%20to%20${encodeURIComponent(plan.name)}%20(LKR%20${plan.priceLKR}/mo).`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                    plan.id === 'pro'
                      ? 'bg-teal-500 hover:bg-teal-400 text-slate-950'
                      : 'bg-white hover:bg-slate-100 text-slate-950'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" /> Request Activation
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Admin Payment Activation Notice */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-500" /> Subscription Payment & Approval Process
          </div>
          <p>
            After selecting your package, submit payment via bank transfer or direct contact. Your Super Admin will activate your subscription for 1 full month upon payment verification.
          </p>
        </div>
      </div>
    </Modal>
  );
};
