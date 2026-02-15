
import React from 'react';
import { AppState, PlanType } from '../types';

interface Props {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
}

const Subscription: React.FC<Props> = ({ state, updateState }) => {
  const currentPlan = state.subscription.plan;

  const plans = [
    {
      type: PlanType.BASIC,
      price: 'R29',
      description: 'Ideal for small scale private student accommodation.',
      features: ['Up to 2 Properties', 'Up to 10 Tenants', 'Standard Dashboard', 'Email Support'],
      limits: { properties: 2, tenants: 10, ai: 5 }
    },
    {
      type: PlanType.STANDARD,
      price: 'R59',
      description: 'The standard for growing student housing hosts.',
      features: ['Up to 5 Properties', 'Up to 50 Tenants', '50 AI Reminders/mo', 'Revenue Analytics'],
      limits: { properties: 5, tenants: 50, ai: 50 },
      recommended: true
    },
    {
      type: PlanType.PRO,
      price: 'R99',
      description: 'Elite management for extensive student portfolios.',
      features: ['10+ Properties', 'Unlimited Tenants', 'Unlimited AI Reminders', 'Priority 24/7 Support'],
      limits: { properties: 999, tenants: 9999, ai: 9999 }
    }
  ];

  const handleUpgrade = (planType: PlanType) => {
    updateState({
      subscription: {
        ...state.subscription,
        plan: planType
      }
    });
    alert(`Successfully switched to the ${planType} plan!`);
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit > 900) return 0;
    return Math.min(100, (current / limit) * 100);
  };

  const planConfig = plans.find(p => p.type === currentPlan)!;

  return (
    <div className="space-y-12 animate-fadeIn pb-20">
      <header className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-4xl font-extrabold text-slate-800">Choose Your Plan</h2>
        <p className="text-slate-500">Manage your student housing more effectively with professional tools.</p>
      </header>

      {/* Usage Tracker */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-4xl mx-auto">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <i className="fas fa-chart-line text-indigo-500"></i>
          Active Plan Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-slate-500">Properties</span>
              <span className="text-slate-800">{state.properties.length} / {planConfig.limits.properties > 900 ? '10+' : planConfig.limits.properties}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${getUsagePercentage(state.properties.length, planConfig.limits.properties)}%` }}
              ></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-slate-500">Tenants</span>
              <span className="text-slate-800">{state.tenants.length} / {planConfig.limits.tenants > 900 ? 'Unlimited' : planConfig.limits.tenants}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${getUsagePercentage(state.tenants.length, planConfig.limits.tenants)}%` }}
              ></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-slate-500">AI Tokens</span>
              <span className="text-slate-800">{state.subscription.aiRemindersUsed} / {planConfig.limits.ai > 900 ? '∞' : planConfig.limits.ai}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${getUsagePercentage(state.subscription.aiRemindersUsed, planConfig.limits.ai)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.type} 
            className={`relative p-8 rounded-3xl border transition-all duration-300 ${
              plan.recommended 
                ? 'bg-indigo-900 text-white shadow-2xl shadow-indigo-200 border-indigo-900 scale-105 z-10' 
                : 'bg-white text-slate-800 border-slate-100 shadow-sm hover:shadow-xl'
            }`}
          >
            {plan.recommended && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-400 text-amber-950 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Best Value
              </div>
            )}
            <div className="mb-8">
              <h3 className="text-lg font-bold uppercase tracking-widest mb-1">{plan.type}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className={`text-sm ${plan.recommended ? 'text-indigo-300' : 'text-slate-400'}`}>/month</span>
              </div>
              <p className={`mt-4 text-sm leading-relaxed ${plan.recommended ? 'text-indigo-100' : 'text-slate-500'}`}>
                {plan.description}
              </p>
            </div>
            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <i className={`fas fa-check-circle ${plan.recommended ? 'text-indigo-300' : 'text-indigo-500'}`}></i>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade(plan.type)}
              disabled={currentPlan === plan.type}
              className={`w-full py-4 rounded-2xl font-bold transition-all ${
                currentPlan === plan.type
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : plan.recommended
                  ? 'bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-lg shadow-indigo-900/50'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
              }`}
            >
              {currentPlan === plan.type ? 'Current Plan' : `Upgrade to ${plan.type}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscription;
