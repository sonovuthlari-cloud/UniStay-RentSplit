
import React, { useState } from 'react';
import { AppState, Payment, PaymentStatus, Tenant, PlanType } from '../types';
import { generateReminderMessage } from '../services/geminiService';
import { Link } from 'react-router-dom';

interface Props {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
}

const PaymentTracker: React.FC<Props> = ({ state, updateState }) => {
  const [filter, setFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [selectedReminder, setSelectedReminder] = useState<{tenant: Tenant, message: string} | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  const filteredPayments = state.payments.filter(p => filter === 'ALL' || p.status === filter);

  const planAiLimits = {
    [PlanType.BASIC]: 5,
    [PlanType.STANDARD]: 50,
    [PlanType.PRO]: Infinity,
  };

  const currentPlan = state.subscription.plan;
  const currentUsed = state.subscription.aiRemindersUsed;
  const currentLimit = planAiLimits[currentPlan];
  const hasAiAccess = currentUsed < currentLimit;

  const toggleStatus = (paymentId: string) => {
    const updatedPayments = state.payments.map(p => {
      if (p.id === paymentId) {
        let newStatus = PaymentStatus.PENDING;
        if (p.status === PaymentStatus.PENDING) newStatus = PaymentStatus.PAID;
        else if (p.status === PaymentStatus.PAID) newStatus = PaymentStatus.OVERDUE;
        else newStatus = PaymentStatus.PENDING;
        
        return { 
          ...p, 
          status: newStatus,
          paidDate: newStatus === PaymentStatus.PAID ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return p;
    });
    updateState({ payments: updatedPayments });
  };

  const handleSendReminder = async (payment: Payment) => {
    const tenant = state.tenants.find(t => t.id === payment.tenantId);
    if (!tenant || !hasAiAccess) return;

    setIsGenerating(payment.id);
    const message = await generateReminderMessage(tenant, payment);
    setIsGenerating(null);
    setSelectedReminder({ tenant, message });
  };

  const finalizeSend = () => {
    if (!selectedReminder) return;
    
    // Track usage
    updateState({
      subscription: {
        ...state.subscription,
        aiRemindersUsed: state.subscription.aiRemindersUsed + 1
      }
    });

    alert(`Reminder sent to ${selectedReminder.tenant.name}!`);
    setSelectedReminder(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Rent Payments</h2>
          <p className="text-slate-500">Track collections and follow up on overdue rent</p>
        </div>
        <div className="flex bg-white rounded-xl shadow-sm border border-slate-100 p-1">
          {['ALL', PaymentStatus.PAID, PaymentStatus.PENDING, PaymentStatus.OVERDUE].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s as any)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === s ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Tenant & Room</th>
                <th className="px-6 py-4">Amount Due</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPayments.map(payment => {
                const tenant = state.tenants.find(t => t.id === payment.tenantId);
                const room = state.rooms.find(r => r.id === tenant?.roomId);
                
                const statusStyles = {
                  [PaymentStatus.PAID]: 'bg-emerald-100 text-emerald-700',
                  [PaymentStatus.PENDING]: 'bg-amber-100 text-amber-700',
                  [PaymentStatus.OVERDUE]: 'bg-rose-100 text-rose-700',
                };

                return (
                  <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-700">{tenant?.name}</p>
                        <p className="text-xs text-slate-400 font-medium">Room {room?.roomNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700">R{payment.amount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-600">{payment.dueDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStatus(payment.id)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${statusStyles[payment.status]}`}
                      >
                        {payment.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payment.status !== PaymentStatus.PAID && (
                        hasAiAccess ? (
                          <button 
                            disabled={!!isGenerating}
                            onClick={() => handleSendReminder(payment)}
                            className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center gap-2 disabled:opacity-50"
                          >
                            {isGenerating === payment.id ? (
                              <i className="fas fa-circle-notch fa-spin"></i>
                            ) : (
                              <i className="fas fa-robot"></i>
                            )}
                            Send AI Reminder
                          </button>
                        ) : (
                          <Link 
                            to="/subscription"
                            className="text-xs font-bold text-slate-400 hover:text-indigo-600 px-3 py-1.5 rounded-lg flex items-center gap-2"
                          >
                            <i className="fas fa-lock"></i>
                            AI Reminder (Upgrade)
                          </Link>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Reminder Modal */}
      {selectedReminder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-zoomIn">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <i className="fas fa-robot"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Review Reminder</h3>
                  <p className="text-xs text-slate-500">Draft for {selectedReminder.tenant.name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedReminder(null)} className="text-slate-400 hover:text-slate-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6">
              <textarea 
                className="w-full h-48 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                value={selectedReminder.message}
                onChange={(e) => setSelectedReminder({ ...selectedReminder, message: e.target.value })}
              />
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={finalizeSend}
                  className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-paper-plane"></i> Send Now
                </button>
                <button 
                  onClick={() => setSelectedReminder(null)}
                  className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTracker;
