
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppState, PaymentStatus, PlanType } from './types';
import Dashboard from './components/Dashboard';
import PropertyManager from './components/PropertyManager';
import TenantManager from './components/TenantManager';
import PaymentTracker from './components/PaymentTracker';
import Subscription from './components/Subscription';

const INITIAL_STATE: AppState = {
  properties: [
    { id: 'p1', name: 'University Heights', address: '123 Scholar Lane' },
    { id: 'p2', name: 'West End Dorms', address: '45 Varsity Blvd' }
  ],
  rooms: [
    { id: 'r1', propertyId: 'p1', roomNumber: '101A', baseRent: 650 },
    { id: 'r2', propertyId: 'p1', roomNumber: '101B', baseRent: 650 },
    { id: 'r3', propertyId: 'p1', roomNumber: '102A', baseRent: 700 },
    { id: 'r4', propertyId: 'p2', roomNumber: 'B201', baseRent: 550 },
    { id: 'r5', propertyId: 'p2', roomNumber: 'B202', baseRent: 550 }
  ],
  tenants: [
    { id: 't1', propertyId: 'p1', roomId: 'r1', name: 'Alice Smith', email: 'alice@student.edu', phone: '555-0101', startDate: '2023-08-01', endDate: '2024-06-30' },
    { id: 't2', propertyId: 'p1', roomId: 'r2', name: 'Bob Jones', email: 'bob@student.edu', phone: '555-0102', startDate: '2023-08-01', endDate: '2024-06-30' },
    { id: 't3', propertyId: 'p2', roomId: 'r4', name: 'Charlie Brown', email: 'charlie@student.edu', phone: '555-0201', startDate: '2023-09-01', endDate: '2024-06-30' }
  ],
  payments: [
    { id: 'h1', tenantId: 't1', amount: 650, dueDate: '2023-08-01', status: PaymentStatus.PAID, paidDate: '2023-07-30' },
    { id: 'h2', tenantId: 't2', amount: 650, dueDate: '2023-08-01', status: PaymentStatus.PAID, paidDate: '2023-08-02' },
    { id: 'pay1', tenantId: 't1', amount: 650, dueDate: '2023-12-01', status: PaymentStatus.PAID, paidDate: '2023-11-30' },
    { id: 'pay2', tenantId: 't1', amount: 650, dueDate: '2023-12-15', status: PaymentStatus.OVERDUE },
    { id: 'pay3', tenantId: 't2', amount: 650, dueDate: '2023-12-01', status: PaymentStatus.PENDING }
  ],
  subscription: {
    plan: PlanType.BASIC,
    aiRemindersUsed: 0
  }
};

const Navigation = ({ plan }: { plan: PlanType }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const links = [
    { path: '/', label: 'Dashboard', icon: 'fa-chart-pie' },
    { path: '/properties', label: 'Properties', icon: 'fa-building' },
    { path: '/tenants', label: 'Tenants', icon: 'fa-users' },
    { path: '/payments', label: 'Payments', icon: 'fa-wallet' },
    { path: '/subscription', label: 'Subscription', icon: 'fa-star' },
  ];

  return (
    <nav className="bg-indigo-900 text-white w-64 min-h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <i className="fas fa-graduation-cap text-indigo-400"></i>
          UniStay
        </h1>
        <div className="mt-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
            plan === PlanType.PRO ? 'bg-amber-400 text-amber-900' : 
            plan === PlanType.STANDARD ? 'bg-indigo-400 text-indigo-950' : 
            'bg-slate-500 text-slate-100'
          }`}>
            {plan} PLAN
          </span>
        </div>
      </div>
      <div className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive(link.path) 
                ? 'bg-indigo-700 text-white shadow-lg' 
                : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
            }`}
          >
            <i className={`fas ${link.icon} w-5`}></i>
            <span className="font-medium">{link.label}</span>
          </Link>
        ))}
      </div>
      <Link 
        to="/subscription"
        className="p-6 border-t border-indigo-800 hover:bg-indigo-800/50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white shadow group-hover:scale-105 transition-transform">
            JS
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">John Smith</p>
            <p className="text-xs text-indigo-400 group-hover:text-amber-400 transition-colors">
              {plan === PlanType.PRO ? 'Elite Host' : 'Upgrade Plan'}
            </p>
          </div>
          <i className="fas fa-chevron-right text-[10px] text-indigo-500 group-hover:translate-x-1 transition-transform"></i>
        </div>
      </Link>
    </nav>
  );
};

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  const updateState = (newState: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  return (
    <HashRouter>
      <div className="flex min-h-screen">
        <Navigation plan={state.subscription.plan} />
        <main className="flex-1 ml-64 p-8 bg-slate-50">
          <Routes>
            <Route path="/" element={<Dashboard state={state} />} />
            <Route path="/properties" element={<PropertyManager state={state} updateState={updateState} />} />
            <Route path="/tenants" element={<TenantManager state={state} updateState={updateState} />} />
            <Route path="/payments" element={<PaymentTracker state={state} updateState={updateState} />} />
            <Route path="/subscription" element={<Subscription state={state} updateState={updateState} />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
