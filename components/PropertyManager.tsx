
import React, { useState } from 'react';
import { AppState, Property, Room, Tenant, PaymentStatus, Payment, PlanType } from '../types';
import { Link } from 'react-router-dom';

interface Props {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
}

const PropertyManager: React.FC<Props> = ({ state, updateState }) => {
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [newProp, setNewProp] = useState({ name: '', address: '' });
  
  const [selectedRoom, setSelectedRoom] = useState<{ property: Property, room: Room } | null>(null);
  const [addingRoomTo, setAddingRoomTo] = useState<string | null>(null);
  const [newRoomDetails, setNewRoomDetails] = useState({ roomNumber: '', baseRent: 500 });
  
  const [newTenant, setNewTenant] = useState({
    name: '',
    email: '',
    phone: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  });

  const planLimits = {
    [PlanType.BASIC]: { properties: 2, tenants: 10 },
    [PlanType.STANDARD]: { properties: 5, tenants: 50 },
    [PlanType.PRO]: { properties: 999, tenants: 9999 },
  };

  const currentLimits = planLimits[state.subscription.plan];
  const canAddProperty = state.properties.length < currentLimits.properties;
  const canAddTenant = state.tenants.length < currentLimits.tenants;

  const addProperty = () => {
    if (!newProp.name || !newProp.address || !canAddProperty) return;
    const property: Property = {
      id: 'p' + Math.random().toString(36).substr(2, 9),
      name: newProp.name,
      address: newProp.address
    };
    updateState({ properties: [...state.properties, property] });
    setNewProp({ name: '', address: '' });
    setIsAddingProperty(false);
  };

  const addRoom = (propertyId: string) => {
    if (!newRoomDetails.roomNumber) return;
    const room: Room = {
      id: 'r' + Math.random().toString(36).substr(2, 9),
      propertyId,
      roomNumber: newRoomDetails.roomNumber,
      baseRent: newRoomDetails.baseRent
    };
    updateState({ rooms: [...state.rooms, room] });
    setAddingRoomTo(null);
    setNewRoomDetails({ roomNumber: '', baseRent: 500 });
  };

  const handleAssignTenant = () => {
    if (!selectedRoom || !newTenant.name || !newTenant.email || !canAddTenant) return;

    const tenantId = 't' + Math.random().toString(36).substr(2, 9);
    const tenant: Tenant = {
      id: tenantId,
      propertyId: selectedRoom.property.id,
      roomId: selectedRoom.room.id,
      name: newTenant.name,
      email: newTenant.email,
      phone: newTenant.phone,
      startDate: newTenant.startDate,
      endDate: newTenant.endDate
    };

    const initialPayment: Payment = {
      id: 'pay' + Math.random().toString(36).substr(2, 9),
      tenantId: tenantId,
      amount: selectedRoom.room.baseRent,
      dueDate: newTenant.startDate,
      status: PaymentStatus.PENDING
    };

    updateState({ 
      tenants: [...state.tenants, tenant],
      payments: [...state.payments, initialPayment]
    });

    setNewTenant({
      name: '',
      email: '',
      phone: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    });
    setSelectedRoom(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Properties</h2>
          <p className="text-slate-500">Manage your student accommodations and room inventory</p>
        </div>
        {canAddProperty ? (
          <button 
            onClick={() => setIsAddingProperty(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> Add Property
          </button>
        ) : (
          <Link 
            to="/subscription"
            className="bg-amber-100 text-amber-700 px-5 py-2.5 rounded-xl font-bold border border-amber-200 hover:bg-amber-200 transition-all flex items-center gap-2"
          >
            <i className="fas fa-crown"></i> Upgrade for More
          </Link>
        )}
      </header>

      {!canAddProperty && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold">
            !
          </div>
          <p className="text-amber-800 text-sm font-medium">
            You've reached your property limit for the <span className="font-bold">{state.subscription.plan}</span> plan. 
            <Link to="/subscription" className="ml-2 underline hover:text-amber-950">Unlock more property slots &rarr;</Link>
          </p>
        </div>
      )}

      {isAddingProperty && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 animate-slideDown">
          <h3 className="text-lg font-bold mb-4">New Property Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input 
              type="text" 
              placeholder="Property Name (e.g. Campus Heights)" 
              className="px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newProp.name}
              onChange={e => setNewProp(prev => ({ ...prev, name: e.target.value }))}
            />
            <input 
              type="text" 
              placeholder="Full Address" 
              className="px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newProp.address}
              onChange={e => setNewProp(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setIsAddingProperty(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg">Cancel</button>
            <button onClick={addProperty} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium">Save Property</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {state.properties.map(p => {
          const propertyRooms = state.rooms.filter(r => r.propertyId === p.id);
          return (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-slate-800">{p.name}</h3>
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {propertyRooms.length} Rooms
                  </span>
                </div>
                <p className="text-slate-500 text-sm flex items-center gap-2">
                  <i className="fas fa-map-marker-alt text-slate-400"></i> {p.address}
                </p>
              </div>
              <div className="p-6">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Room List</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {propertyRooms.map(r => {
                    const occupant = state.tenants.find(t => t.roomId === r.id);
                    return (
                      <div 
                        key={r.id} 
                        className={`p-4 rounded-xl border transition-all ${
                          occupant 
                            ? 'bg-emerald-50 border-emerald-100' 
                            : 'bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-white cursor-pointer group/room'
                        }`}
                        onClick={() => !occupant && setSelectedRoom({ property: p, room: r })}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-bold text-slate-700">Room {r.roomNumber}</p>
                            <p className="text-xs text-indigo-600 font-medium">R{r.baseRent}/mo</p>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                            occupant ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {occupant ? 'Occupied' : 'Vacant'}
                          </span>
                        </div>
                        <div className="mt-3">
                          {occupant ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                                {occupant.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="text-xs font-semibold text-slate-700 truncate">{occupant.name}</span>
                            </div>
                          ) : (
                            <div className="text-xs text-indigo-500 font-bold opacity-0 group-hover/room:opacity-100 transition-opacity flex items-center gap-1">
                              <i className="fas fa-plus-circle"></i> Assign Tenant
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {addingRoomTo === p.id ? (
                    <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 animate-fadeIn">
                      <div className="space-y-2">
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="No." 
                          className="w-full text-xs px-2 py-1.5 rounded border border-slate-200"
                          value={newRoomDetails.roomNumber}
                          onChange={e => setNewRoomDetails({...newRoomDetails, roomNumber: e.target.value})}
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">R</span>
                          <input 
                            type="number" 
                            className="w-full text-xs px-2 py-1.5 rounded border border-slate-200"
                            value={newRoomDetails.baseRent}
                            onChange={e => setNewRoomDetails({...newRoomDetails, baseRent: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div className="flex gap-1 pt-1">
                          <button onClick={() => addRoom(p.id)} className="flex-1 bg-indigo-600 text-white text-[10px] font-bold py-1.5 rounded">Add</button>
                          <button onClick={() => setAddingRoomTo(null)} className="flex-1 bg-slate-200 text-slate-600 text-[10px] font-bold py-1.5 rounded">Cancel</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setAddingRoomTo(p.id)}
                      className="border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-400 transition-all py-6 min-h-[90px]"
                    >
                      <i className="fas fa-plus text-sm mr-2"></i> Add Room
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fully Functional Tenant Assignment Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-zoomIn">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Assign Tenant</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                  {selectedRoom.property.name} • Room {selectedRoom.room.roomNumber}
                </p>
              </div>
              <button onClick={() => setSelectedRoom(null)} className="text-slate-400 hover:text-slate-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
            {canAddTenant ? (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Full Name</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newTenant.name}
                      onChange={e => setNewTenant({ ...newTenant, name: e.target.value })}
                      placeholder="e.g. Sipho Zulu"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Email</label>
                    <input 
                      type="email"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newTenant.email}
                      onChange={e => setNewTenant({ ...newTenant, email: e.target.value })}
                      placeholder="student@uni.ac.za"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Phone</label>
                    <input 
                      type="tel"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newTenant.phone}
                      onChange={e => setNewTenant({ ...newTenant, phone: e.target.value })}
                      placeholder="071 234 5678"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Lease Start</label>
                    <input 
                      type="date"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      value={newTenant.startDate}
                      onChange={e => setNewTenant({ ...newTenant, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Lease End</label>
                    <input 
                      type="date"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      value={newTenant.endDate}
                      onChange={e => setNewTenant({ ...newTenant, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={handleAssignTenant}
                    className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                  >
                    Create Lease
                  </button>
                  <button 
                    onClick={() => setSelectedRoom(null)}
                    className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl border border-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-2xl mx-auto">
                  <i className="fas fa-user-lock"></i>
                </div>
                <h4 className="text-xl font-bold text-slate-800">Tenant Limit Reached</h4>
                <p className="text-slate-500 text-sm">You have reached the maximum of {planLimits[state.subscription.plan].tenants} tenants allowed on your current plan.</p>
                <Link 
                  to="/subscription" 
                  onClick={() => setSelectedRoom(null)}
                  className="block w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all"
                >
                  Upgrade Now
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManager;
