
import React from 'react';
import { AppState } from '../types';

interface Props {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
}

const TenantManager: React.FC<Props> = ({ state }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Tenants</h2>
          <p className="text-slate-500">Manage student profiles and lease terms</p>
        </div>
        <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2">
          <i className="fas fa-user-plus"></i> New Tenant
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Tenant</th>
                <th className="px-6 py-4">Assignment</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Lease Period</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {state.tenants.map(tenant => {
                const property = state.properties.find(p => p.id === tenant.propertyId);
                const room = state.rooms.find(r => r.id === tenant.roomId);
                
                return (
                  <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                          {tenant.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-bold text-slate-700">{tenant.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-slate-800">{property?.name}</p>
                        <p className="text-slate-500 text-xs">Room {room?.roomNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2 text-slate-600">
                          <i className="fas fa-envelope text-xs opacity-50"></i>
                          <span>{tenant.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <i className="fas fa-phone text-xs opacity-50"></i>
                          <span>{tenant.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-medium px-2 py-1 rounded bg-slate-100 text-slate-600 inline-block">
                        {tenant.startDate} to {tenant.endDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Edit">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg" title="Archive">
                          <i className="fas fa-archive"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TenantManager;
