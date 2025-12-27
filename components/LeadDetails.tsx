
import React, { useState } from 'react';
import { Lead, User } from '../types';
import { Icons } from './Icons';
import { apiService } from '../services/api';

interface LeadDetailsProps {
  lead: Lead;
  users: User[];
  currentUserRole?: string;
  onUpdate: (updatedLead: Lead) => void;
  onDelete: (id: string) => void;
  onEdit: (lead: Lead) => void;
  onClose: () => void;
}

const LeadDetails: React.FC<LeadDetailsProps> = ({ lead, users, currentUserRole, onUpdate, onDelete, onEdit, onClose }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'chat' | 'remarks'>('info');
  const [loading, setLoading] = useState(false);
  const [newRemark, setNewRemark] = useState('');
  const isAdmin = currentUserRole === 'admin';

  const parseMongoDate = (date: any): string => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    if (date.$date) return date.$date;
    return '';
  };

  const handleAssign = async (username: string) => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const updated = await apiService.updateLead({ _id: lead._id, assignedto: username });
      onUpdate(updated);
    } catch (err) { alert('Assignment failed'); } finally { setLoading(false); }
  };

  const handleStatusChange = async (status: string) => {
    try {
      setLoading(true);
      const updated = await apiService.updateLead({ _id: lead._id, status });
      onUpdate(updated);
    } catch (err) { alert('Status update failed'); } finally { setLoading(false); }
  };

  const handleReminderChange = async (date: string) => {
    try {
      setLoading(true);
      const updated = await apiService.updateLead({ _id: lead._id, reminder: date || null });
      onUpdate(updated);
    } catch (err) { alert('Reminder update failed'); } finally { setLoading(false); }
  };

  const handleAddRemark = async () => {
    if (!newRemark.trim()) return;
    try {
      setLoading(true);
      const updated = await apiService.addRemark(lead._id, newRemark);
      onUpdate(updated);
      setNewRemark('');
    } catch (err) { alert('Failed to add remark'); } finally { setLoading(false); }
  };

  const handleDeleteRemark = async (remarkId: string) => {
    try {
      setLoading(true);
      const updated = await apiService.deleteRemark(lead._id, remarkId);
      onUpdate(updated);
    } catch (err) { alert('Failed to delete remark'); } finally { setLoading(false); }
  };

  const formatDate = (date: any) => {
    const d = parseMongoDate(date);
    if (!d) return 'N/A';
    return new Date(d).toLocaleString();
  };

  return (
    <div className="flex flex-col h-full bg-white border rounded-2xl shadow-lg overflow-hidden text-left animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b bg-slate-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg uppercase">
            {lead.userName.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h2 className="font-bold text-slate-800 truncate max-w-[120px]">{lead.userName}</h2>
            <p className="text-[10px] text-slate-500 font-medium">{lead.userNumber}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(lead)} className="p-2 hover:bg-white rounded-lg text-slate-600 transition-colors" title="Edit"><Icons.Edit className="w-4 h-4" /></button>
          {isAdmin && <button onClick={() => onDelete(lead._id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Delete"><Icons.Trash className="w-4 h-4" /></button>}
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg text-slate-400 transition-colors" title="Close"><Icons.X className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex border-b bg-slate-50/50">
        {[
          { id: 'info', label: 'Info' },
          { id: 'chat', label: 'History' },
          { id: 'remarks', label: 'Remarks' }
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveTab(t.id as any)} 
            className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab === t.id ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'info' && (
          <div className="space-y-5">
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Staff</label>
               <select 
                 disabled={!isAdmin} 
                 value={lead.assignedto || ''} 
                 onChange={e => handleAssign(e.target.value)} 
                 className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-700 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 outline-none"
               >
                 <option value="">Unassigned</option>
                 {users.map(u => <option key={u.username} value={u.username}>{u.username}</option>)}
               </select>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                  <select 
                    value={lead.status} 
                    onChange={e => handleStatusChange(e.target.value)} 
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Hot">Hot</option>
                    <option value="Warm">Warm</option>
                    <option value="Cold">Cold</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Program Type</label>
                  <div className="p-2.5 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 border">{lead.programType || 'N/A'}</div>
                </div>
             </div>

             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Follow-up Reminder</label>
               <div className="relative">
                 <input 
                   type="datetime-local"
                   value={lead.reminder ? new Date(parseMongoDate(lead.reminder)).toISOString().slice(0, 16) : ''}
                   onChange={(e) => handleReminderChange(e.target.value)}
                   className="w-full p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none"
                 />
                 <Icons.Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" />
               </div>
             </div>

             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Course of Interest</p>
                 <p className="text-sm font-bold text-slate-800">{lead.course || 'General Enquiry'}</p>
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Source</p>
                 <p className="text-sm font-semibold text-slate-600">{lead.leadfrom || 'Manual'}</p>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-4">
            {lead.conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 italic text-xs">
                <Icons.Chat className="w-10 h-10 mb-2 opacity-10" />
                <p>No conversation history found</p>
              </div>
            ) : (
              lead.conversations.map((c, i) => (
                <div key={i} className="space-y-2 pb-3 border-b border-slate-50 last:border-0">
                  <div className="flex flex-col items-end">
                    <div className="bg-blue-600 text-white p-2.5 rounded-2xl rounded-tr-none text-xs max-w-[90%] shadow-sm leading-relaxed">
                      {c.userMsg}
                    </div>
                  </div>
                  <div className="flex flex-col items-start">
                    <div className="bg-slate-100 text-slate-700 p-2.5 rounded-2xl rounded-tl-none text-xs max-w-[90%] border border-slate-200 shadow-sm leading-relaxed">
                      {(c.botReply || '').split('\n').map((l, j) => <p key={j} className="mb-1 last:mb-0">{l}</p>)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'remarks' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="New remark..."
                value={newRemark}
                onChange={e => setNewRemark(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={handleAddRemark}
                disabled={!newRemark.trim() || loading}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Icons.Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {lead.remarks.length === 0 ? (
                <p className="text-center text-slate-400 text-xs italic py-10">No remarks yet</p>
              ) : (
                [...lead.remarks].reverse().map(r => (
                  <div key={r._id} className="group p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between gap-3 items-start transition-all hover:border-blue-200">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-700 leading-normal">{r.remark}</p>
                      <p className="text-[9px] text-slate-400 mt-1 font-bold">{formatDate(r.timestamp)}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteRemark(r._id)}
                      className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Icons.Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t bg-slate-50 shrink-0">
        <button onClick={onClose} className="w-full py-2.5 bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-300 transition-all active:scale-[0.98]">
          Close Details
        </button>
      </div>
    </div>
  );
};

export default LeadDetails;
