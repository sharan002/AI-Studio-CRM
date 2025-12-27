
import React, { useState, useEffect, useMemo } from 'react';
import { Lead, User, DashboardResponse } from './types';
import { apiService } from './services/api';
import { Icons } from './components/Icons';
import LeadFormModal from './components/LeadFormModal';
import LeadDetails from './components/LeadDetails';
import FilterPanel from './components/FilterPanel';
import Login from './components/Login';

type View = 'dashboard' | 'reminders';

export interface FilterState {
  courses: string[];
  programTypes: string[];
  professions: string[];
  sources: string[];
  statuses: string[];
  pipelines: string[];
  assignedUsers: string[];
  fromDate: string;
  toDate: string;
}

const initialFilters: FilterState = {
  courses: [],
  programTypes: [],
  professions: [],
  sources: [],
  statuses: [],
  pipelines: [],
  assignedUsers: [],
  fromDate: '',
  toDate: '',
};

const parseMongoDate = (date: any): string => {
  if (!date) return new Date().toISOString();
  if (typeof date === 'string') return date;
  if (date.$date) return date.$date;
  return new Date().toISOString();
};

const normalizeLead = (lead: any): Lead => ({
  _id: lead._id?.$oid || lead._id || Math.random().toString(36).substr(2, 9),
  userName: lead.userName || lead.username || 'Unknown Student',
  userNumber: lead.userNumber || '0000000000',
  course: lead.course || lead.courseofintrest || lead.courseTitle || null,
  leadfrom: lead.leadfrom || lead.source || 'Manual',
  status: lead.status || 'Cold',
  pipeline: lead.pipeline || 'New',
  conversations: Array.isArray(lead.conversations) ? lead.conversations : [],
  remarks: Array.isArray(lead.remarks) ? lead.remarks : [],
  datecreated: parseMongoDate(lead.datecreated),
  lastInteracted: parseMongoDate(lead.lastInteracted),
  followUpCount: lead.followUpCount || 0,
  respondedAfterFollowUp: !!lead.respondedAfterFollowUp,
  lastFollowUpSentAt: lead.lastFollowUpSentAt ? parseMongoDate(lead.lastFollowUpSentAt) : null,
  reminder: lead.reminder ? parseMongoDate(lead.reminder) : null,
  profession: lead.profession || null,
  location: lead.location || lead.city || null,
  programType: lead.programType || lead.program_type || lead.programtype || null,
  assignedto: lead.assignedto || undefined,
});

const App: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('crm_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(JSON.parse(localStorage.getItem('crm_user') || 'null'));

  const fetchDashboardData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await apiService.fetchDashboardData(currentUser.username);
      if (data.success) {
        setLeads(data.leads.map(normalizeLead));
        if (data.staffs) setUsers(data.staffs);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      handleLogout(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchDashboardData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const ws = new WebSocket('wss://nonveracious-conveniently-jacques.ngrok-free.dev/ws');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_user' && data.user) {
          const freshLead = normalizeLead(data.user);
          setLeads(prev => {
            const exists = prev.some(l => l._id === freshLead._id);
            if (exists) return prev;
            if (currentUser?.role === 'admin' || freshLead.assignedto === currentUser?.username) {
              return [freshLead, ...prev];
            }
            return prev;
          });
        }
      } catch (e) { console.error('WS Error:', e); }
    };
    return () => ws.close();
  }, [isAuthenticated, currentUser]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = (lead.userName || '').toLowerCase().includes(q) || (lead.userNumber || '').includes(q);
      
      const matchesCourse = filters.courses.length === 0 || (lead.course && filters.courses.some(c => c.toLowerCase() === lead.course?.toLowerCase()));
      const matchesStatus = filters.statuses.length === 0 || filters.statuses.some(s => s.toLowerCase() === (lead.status || '').toLowerCase());
      const matchesAssigned = filters.assignedUsers.length === 0 || (lead.assignedto && filters.assignedUsers.includes(lead.assignedto));
      const matchesProgram = filters.programTypes.length === 0 || (lead.programType && filters.programTypes.some(p => p.toLowerCase() === lead.programType?.toLowerCase()));
      const matchesSource = filters.sources.length === 0 || filters.sources.some(s => (lead.leadfrom || '').toLowerCase().includes(s.toLowerCase()));
      const matchesProfession = filters.professions.length === 0 || (lead.profession && filters.professions.some(p => p.toLowerCase() === lead.profession?.toLowerCase()));
      const matchesPipeline = filters.pipelines.length === 0 || filters.pipelines.some(p => p.toLowerCase() === (lead.pipeline || '').toLowerCase());

      const leadDate = new Date(parseMongoDate(lead.datecreated)).getTime();
      const matchesFromDate = !filters.fromDate || leadDate >= new Date(filters.fromDate).getTime();
      const matchesToDate = !filters.toDate || leadDate <= new Date(filters.toDate).getTime() + 86400000;

      return matchesSearch && matchesCourse && matchesStatus && matchesAssigned && 
             matchesProgram && matchesSource && matchesProfession && matchesPipeline &&
             matchesFromDate && matchesToDate;
    });
  }, [leads, searchQuery, filters]);

  const remindersList = useMemo(() => {
    return leads
      .filter(l => l.reminder)
      .sort((a, b) => new Date(parseMongoDate(a.reminder)).getTime() - new Date(parseMongoDate(b.reminder)).getTime());
  }, [leads]);

  const stats = useMemo(() => {
    return {
      total: filteredLeads.length,
      cold: filteredLeads.filter(l => (l.status || '').toLowerCase() === 'cold').length,
      warm: filteredLeads.filter(l => (l.status || '').toLowerCase() === 'warm').length,
      hot: filteredLeads.filter(l => (l.status || '').toLowerCase() === 'hot').length,
    };
  }, [filteredLeads]);

  const handleUpdateReminder = async (leadId: string, date: string | null) => {
    try {
      const updated = await apiService.updateLead({ _id: leadId, reminder: date });
      const norm = normalizeLead(updated);
      setLeads(prev => prev.map(l => l._id === leadId ? norm : l));
      if (selectedLead?._id === leadId) setSelectedLead(norm);
    } catch (err) {
      alert('Failed to update reminder');
    }
  };

  const handleLogin = (user: User, token: string) => {
    localStorage.setItem('crm_token', token);
    localStorage.setItem('crm_user', JSON.stringify(user));
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = (confirm = true) => {
    if (confirm && !window.confirm('Logout?')) return;
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLeads([]);
  };

  const handleAddLead = async (leadData: Partial<Lead>) => {
    try {
      await apiService.addLead(leadData);
      setIsAddModalOpen(false);
      fetchDashboardData();
    } catch (err: any) { alert(err.message); }
  };

  const handleDeleteLead = async (id: string) => {
    if (currentUser?.role !== 'admin') return alert('Only admins can delete leads');
    if (!confirm('Delete this lead?')) return;
    try {
      await apiService.deleteLead(id);
      setSelectedLead(null);
      fetchDashboardData();
    } catch (err) { alert('Delete failed'); }
  };

  const getDaysRemaining = (dateStr: string) => {
    try {
      const targetDate = new Date(dateStr);
      const now = new Date();
      targetDate.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      
      const diffTime = targetDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return { text: `${Math.abs(diffDays)}d Overdue`, color: 'text-red-600 bg-red-50' };
      if (diffDays === 0) return { text: 'Today', color: 'text-orange-600 bg-orange-50' };
      return { text: `${diffDays}d Left`, color: 'text-blue-600 bg-blue-50' };
    } catch (e) {
      return { text: 'Invalid', color: 'text-slate-400' };
    }
  };

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  const hasActiveFilters = Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f !== '');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg"><Icons.Settings className="w-6 h-6 text-white" /></div>
          <h1 className="text-xl font-bold tracking-tight">EduLead CRM</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => setCurrentView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${currentView === 'dashboard' ? 'bg-blue-600/10 text-blue-400 border-blue-600/20' : 'text-slate-400 border-transparent hover:bg-slate-800'}`}>
            <Icons.User className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>
          <button onClick={() => setCurrentView('reminders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all relative ${currentView === 'reminders' ? 'bg-blue-600/10 text-blue-400 border-blue-600/20' : 'text-slate-400 border-transparent hover:bg-slate-800'}`}>
            <Icons.Calendar className="w-5 h-5" />
            <span className="font-medium">Reminders</span>
            {remindersList.length > 0 && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {remindersList.length}
              </span>
            )}
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800 text-left">
           <p className="text-xs text-slate-500 uppercase font-bold mb-2">Signed in as</p>
           <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">
                {currentUser?.username.slice(0, 2).toUpperCase()}
             </div>
             <div className="text-sm overflow-hidden"><p className="font-semibold truncate">{currentUser?.username}</p><p className="text-slate-500 text-xs capitalize">{currentUser?.role}</p></div>
           </div>
           <button onClick={() => handleLogout()} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-red-600 transition-all text-sm font-bold">Logout</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-lg font-bold text-slate-800 capitalize hidden sm:block">{currentView}</h2>
            <div className="relative w-full max-w-md">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search leads..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
            {currentView === 'dashboard' && (
              <button 
                onClick={() => setIsFilterOpen(true)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${hasActiveFilters ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <Icons.Filter className="w-4 h-4" />
                <span className="hidden md:inline">Filters</span>
                {hasActiveFilters && <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>}
              </button>
            )}
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:shadow-lg active:scale-95 transition-all">
            <Icons.Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Lead</span>
          </button>
        </header>

        {currentView === 'dashboard' ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 shrink-0">
              {[{ label: 'Results Found', val: stats.total, color: 'bg-slate-100 text-slate-600' }, { label: 'Hot Leads', val: stats.hot, color: 'bg-red-50 text-red-600' }, { label: 'Warm Leads', val: stats.warm, color: 'bg-orange-50 text-orange-600' }, { label: 'Cold Leads', val: stats.cold, color: 'bg-blue-50 text-blue-600' }].map((s, i) => (
                <div key={i} className={`${s.color} p-4 rounded-2xl border border-current/10 shadow-sm text-left`}>
                  <span className="text-[10px] font-bold uppercase opacity-60 tracking-wider leading-none">{s.label}</span>
                  <span className="text-2xl font-black block leading-none mt-1.5">{s.val}</span>
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row p-6 pt-0 gap-6 text-left">
              <div className={`flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-sm transition-all ${selectedLead ? 'hidden lg:block' : 'block'}`}>
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 border-b z-10">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Lead Details</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Program Info</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredLeads.map(lead => (
                      <tr key={lead._id} onClick={() => setSelectedLead(lead)} className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedLead?._id === lead._id ? 'bg-blue-50/50' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{lead.userName}</div>
                          <div className="text-xs text-slate-500">{lead.userNumber}</div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="text-sm font-semibold text-slate-700 truncate max-w-[180px]">{lead.course || 'General'}</div>
                           <div className="text-[10px] text-slate-400 font-bold uppercase">{lead.programType || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${lead.status.toLowerCase() === 'hot' ? 'bg-red-100 text-red-700' : lead.status.toLowerCase() === 'warm' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{lead.status}</span></td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-600">{lead.assignedto || <span className="text-slate-300 italic">Unassigned</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {selectedLead && (
                <div className="w-full lg:w-96 lg:shrink-0 h-full">
                  <LeadDetails 
                    lead={selectedLead} 
                    users={users} 
                    currentUserRole={currentUser?.role} 
                    onUpdate={(l) => { 
                      const norm = normalizeLead(l);
                      setLeads(prev => prev.map(p => p._id === norm._id ? norm : p)); 
                      setSelectedLead(norm); 
                    }} 
                    onDelete={handleDeleteLead} 
                    onEdit={(l) => { setEditingLead(l); setIsEditModalOpen(true); }} 
                    onClose={() => setSelectedLead(null)} 
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
             <div className="flex items-center justify-between mb-2">
                <div className="text-left">
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">Follow-up Dashboard</h3>
                  <p className="text-sm text-slate-500">Scheduled reminders for students across the institute.</p>
                </div>
                <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                  {remindersList.length} Reminders
                </div>
             </div>

             {remindersList.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                  <Icons.Calendar className="w-16 h-16 opacity-10 mb-4" />
                  <p className="text-lg font-medium">No active follow-ups</p>
                  <p className="text-sm">Set a reminder from the lead details to track it here.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {remindersList.map(lead => {
                    const diff = getDaysRemaining(parseMongoDate(lead.reminder));
                    return (
                      <div 
                        key={lead._id} 
                        onClick={() => { setSelectedLead(lead); setCurrentView('dashboard'); }}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col group text-left cursor-pointer"
                      >
                        <div className="p-5 flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                {lead.userName.charAt(0)}
                              </div>
                              <div className="overflow-hidden">
                                <h4 className="font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{lead.userName}</h4>
                                <p className="text-[10px] text-slate-500 font-bold">{lead.userNumber}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${diff.color}`}>
                              {diff.text}
                            </span>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                               <Icons.Calendar className="w-4 h-4 text-slate-400" />
                               <span className="font-bold">{new Date(parseMongoDate(lead.reminder)).toLocaleDateString()}</span>
                               <span className="text-slate-400">at</span>
                               <span className="font-bold">{new Date(parseMongoDate(lead.reminder)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                               <Icons.Settings className="w-4 h-4 text-slate-400" />
                               <span className="truncate font-semibold">{lead.course || 'General Enquiry'}</span>
                            </div>
                            {lead.assignedto && (
                              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <Icons.User className="w-3.5 h-3.5" />
                                <span className="font-medium">Assigned to: {lead.assignedto}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="p-4 border-t bg-slate-50 flex items-center justify-between rounded-b-2xl">
                           <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 group-hover:underline">
                             Open Lead Details
                           </span>
                           <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                             <button 
                               onClick={() => {
                                 const currentVal = lead.reminder ? new Date(parseMongoDate(lead.reminder)).toISOString().slice(0, 16) : '';
                                 const newDate = prompt('Update Follow-up Date (YYYY-MM-DDTHH:MM)', currentVal);
                                 if (newDate) handleUpdateReminder(lead._id, newDate);
                               }}
                               className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-slate-800 transition-colors"
                             >
                               <Icons.Edit className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={() => { if(confirm('Clear this reminder?')) handleUpdateReminder(lead._id, null); }}
                               className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                             >
                               <Icons.Trash className="w-4 h-4" />
                             </button>
                           </div>
                        </div>
                      </div>
                    );
                  })}
               </div>
             )}
          </div>
        )}
      </main>

      <FilterPanel 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        filters={filters} 
        users={users} 
        onFilterChange={setFilters} 
        onReset={() => setFilters(initialFilters)} 
      />

      <LeadFormModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddLead} title="Register New Lead" />
      <LeadFormModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingLead(null); }} onSubmit={async (d) => { await apiService.editLeadDetails(d); setIsEditModalOpen(false); fetchDashboardData(); }} initialData={editingLead} title="Edit Lead Details" />
    </div>
  );
};

export default App;
