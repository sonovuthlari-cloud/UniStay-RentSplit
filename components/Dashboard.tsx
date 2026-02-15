
import React from 'react';
import { AppState, PaymentStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Link } from 'react-router-dom';

interface Props {
  state: AppState;
}

const Dashboard: React.FC<Props> = ({ state }) => {
  const overduePayments = state.payments.filter(p => p.status === PaymentStatus.OVERDUE);
  
  // Calculate aggregate stats
  const totalRentCollected = state.payments
    .filter(p => p.status === PaymentStatus.PAID)
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingRent = state.payments
    .filter(p => p.status === PaymentStatus.PENDING)
    .reduce((sum, p) => sum + p.amount, 0);

  const overdueRent = overduePayments
    .reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    { label: 'Lifetime Collected', value: `R${totalRentCollected.toLocaleString()}`, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'fa-check-circle' },
    { label: 'Current Pending', value: `R${pendingRent.toLocaleString()}`, color: 'text-amber-600', bg: 'bg-amber-50', icon: 'fa-clock' },
    { label: 'Current Overdue', value: `R${overdueRent.toLocaleString()}`, color: 'text-rose-600', bg: 'bg-rose-50', icon: 'fa-exclamation-triangle' },
    { label: 'Active Tenants', value: state.tenants.length, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: 'fa-user-graduate' },
  ];

  // Logic to calculate last 6 months revenue for the chart
  const getMonthlyRevenue = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const monthPrefix = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      
      const monthlyTotal = state.payments
        .filter(p => p.status === PaymentStatus.PAID && p.dueDate.startsWith(monthPrefix))
        .reduce((sum, p) => sum + p.amount, 0);
        
      data.push({ name: monthLabel, revenue: monthlyTotal });
    }
    return data;
  };

  const chartData = getMonthlyRevenue();

  const propertyData = state.properties.map(p => {
    const propertyRooms = state.rooms.filter(r => r.propertyId === p.id);
    const occupiedCount = state.tenants.filter(t => t.propertyId === p.id).length;
    return {
      name: p.name,
      occupancy: Math.round((occupiedCount / propertyRooms.length) * 100) || 0,
      rooms: propertyRooms.length,
      occupied: occupiedCount
    };
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">Portfolio Overview</h2>
        <p className="text-slate-500">Summary of your student accommodation performance</p>
      </header>

      {/* Visual Highlight for Overdue Payments */}
      {overduePayments.length > 0 && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-6 rounded-r-2xl shadow-sm animate-pulse-subtle">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <i className="fas fa-exclamation-circle text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-rose-900">Attention Required</h3>
              <p className="text-rose-700 text-sm">{overduePayments.length} payments are currently overdue</p>
            </div>
            <Link to="/payments" className="ml-auto bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors">
              Manage Payments
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overduePayments.slice(0, 3).map(payment => {
              const tenant = state.tenants.find(t => t.id === payment.tenantId);
              return (
                <div key={payment.id} className="bg-white/80 p-3 rounded-xl border border-rose-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{tenant?.name}</p>
                    <p className="text-xs text-rose-500 font-medium">Due: {payment.dueDate}</p>
                  </div>
                  <span className="font-bold text-rose-600">R{payment.amount}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-xl`}>
              <i className={`fas ${stat.icon}`}></i>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Monthly Revenue Trend</h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Last 6 Months</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `R${value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`R${value}`, 'Revenue']}
                />
                <Bar 
                  dataKey="revenue" 
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === chartData.length - 1 ? '#6366f1' : '#cbd5e1'} 
                      className="transition-all duration-300 hover:fill-indigo-500"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Occupancy by Property</h3>
          <div className="space-y-6">
            {propertyData.map((data, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-700">{data.name}</span>
                  <span className="text-slate-500">{data.occupied} / {data.rooms} Rooms ({data.occupancy}%)</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                    style={{ width: `${data.occupancy}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-slate-50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Avg. Portfolio Occupancy</span>
              <span className="text-indigo-600 font-bold">
                {Math.round(propertyData.reduce((acc, curr) => acc + curr.occupancy, 0) / propertyData.length)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
