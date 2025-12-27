
import React, { useState } from 'react';
import { Lead, User, Remark } from '../types';
import { Icons } from './Icons';
import { apiService } from '../services/api';

interface LeadDetailsProps {
  lead: Lead;
  users: User[];
  onUpdate: (updatedLead: Lead) => void;
  onDelete: (id: string) => void;
  onEdit: (lead: Lead) => void;
  onClose: () => void;
}

const LeadDetails: React.FC<LeadDetailsProps> = ({ lead, users, onUpdate, onDelete, onEdit, onClose }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'chat' | 'remarks'>('info');
  const [newRemark, setNewRemark] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAssign = async (username: string) => {
    try {
      setLoading(true);
      const updated = await apiService.updateLead({ _id: lead._id, assignedto: username });
      onUpdate(updated);
    } catch (err) {
      alert('Failed to assign lead');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldUpdate = async (field: keyof Lead, value: any) => {
    try {
      setLoading(true);
      const updated = await apiService.updateLead({ _id: lead._id, [field]: value });
      onUpdate(updated);
    } catch (err) {
      alert(`Failed to update ${field}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRemark = async () => {
    if (!newRemark.trim()) return;
    try {
      setLoading(true);
      const updated = await apiService.addRemark(lead._id, newRemark);
      onUpdate(updated);
      setNewRemark('');
    } catch (err) {
      alert('Failed to add remark');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRemark = async (remarkId: string) => {
    try {
      setLoading(true);
      const updated = await apiService.deleteRemark(lead._id, remarkId);
      onUpdate(updated);
    } catch (err) {
      alert('Failed to delete remark');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not Set';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInputDateFormat = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 16);
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl uppercase">
            {lead.userName?.charAt(0) || '?'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 truncate max-w-[120px]">{lead.userName}</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Icons.Phone className="w-3 h-3" /> {lead.userNumber}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => onEdit(lead)} 
            title="Edit Lead"
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          >
            <Icons.Edit className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onDelete(lead._id)} 
            title="Delete Lead"
            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
          >
            <Icons.Trash className="w-5 h-5" />
          </button>
          <button 
            onClick={onClose} 
            title="Close Panel"
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-colors"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 bg-slate-50/50 shrink-0">
        {[
          { id: 'info', label: 'Lead Info' },
          { id: 'chat', label: 'Chat' },
          { id: 'remarks', label: 'Remarks' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white p-6">
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className="text-xs uppercase font-bold text-slate-400 tracking-wider">Lead Status</label>
                <select
                  value={lead.status}
                  onChange={(e) => handleFieldUpdate('status', e.target.value)}
                  className="w-full mt-1 bg-transparent text-sm font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="Hot">Hot</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                </select>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className="text-xs uppercase font-bold text-slate-400 tracking-wider">Pipeline Stage</label>
                <select
                  value={lead.pipeline}
                  onChange={(e) => handleFieldUpdate('pipeline', e.target.value)}
                  className="w-full mt-1 bg-transparent text-sm font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Asked Time">Asked Time</option>
                  <option value="Not Interested">Not Interested</option>
                </select>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 col-span-2">
                <label className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-2">Set Follow-up Reminder</label>
                <div className="flex items-center gap-3">
                  <Icons.Calendar className="w-5 h-5 text-blue-500" />
                  <input
                    type="datetime-local"
                    value={getInputDateFormat(lead.reminder)}
                    onChange={(e) => handleFieldUpdate('reminder', e.target.value)}
                    className="bg-white border border-slate-200 rounded px-2 py-1 text-sm text-slate-700 w-full"
                  />
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 col-span-2">
                <label className="text-xs uppercase font-bold text-slate-400 tracking-wider">Assigned To</label>
                <select
                  value={lead.assignedto || ''}
                  onChange={(e) => handleAssign(e.target.value)}
                  className="w-full mt-1 bg-transparent text-sm font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u._id} value={u.username}>{u.username}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 border-b pb-2">Course Details</h3>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <p className="text-slate-400">Course</p>
                  <p className="font-medium">{lead.course || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Source</p>
                  <p className="font-medium">{lead.leadfrom}</p>
                </div>
                <div>
                  <p className="text-slate-400">Profession</p>
                  <p className="font-medium">{lead.profession || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Location</p>
                  <p className="font-medium">{lead.location || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-6">
            {lead.conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 italic">
                <Icons.Chat className="w-12 h-12 mb-2 opacity-20" />
                <p>No chat history available</p>
              </div>
            ) : (
              lead.conversations.map((chat, idx) => (
                <div key={idx} className="space-y-3 pb-6 border-b border-slate-50 last:border-0">
                  <div className="flex flex-col items-end gap-1">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-none text-sm max-w-[85%] shadow-sm">
                      {chat.userMsg}
                    </div>
                    <span className="text-[10px] text-slate-400">{formatDate(chat.timestamp)}</span>
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <div className="bg-slate-100 text-slate-700 px-4 py-2 rounded-2xl rounded-tl-none text-sm max-w-[85%] shadow-sm border border-slate-200">
                      {chat.botReply.split('\n').map((line, i) => (
                        <p key={i} className={line.startsWith('ℹ️') || line.startsWith('🎓') || line.startsWith('💼') || line.startsWith('💰') ? 'mt-2 font-semibold' : ''}>
                          {line}
                        </p>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400">AI Assistant</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'remarks' && (
          <div className="flex flex-col h-full gap-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add remark..."
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddRemark}
                disabled={!newRemark.trim() || loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Icons.Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {lead.remarks.length === 0 ? (
                <div className="text-center text-slate-400 py-12 italic">
                  No remarks yet.
                </div>
              ) : (
                [...lead.remarks].reverse().map((r) => (
                  <div key={r._id} className="group flex justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-all">
                    <div className="space-y-1 flex-1">
                      <p className="text-sm text-slate-700 font-medium">{r.remark}</p>
                      <p className="text-[10px] text-slate-400 tracking-wider">{formatDate(r.timestamp)}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteRemark(r._id)}
                      className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Icons.Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Close Button */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
        <button 
          onClick={onClose}
          className="w-full py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-300 transition-all active:scale-95"
        >
          Cancel / Close Details
        </button>
      </div>
    </div>
  );
};

export default LeadDetails;
