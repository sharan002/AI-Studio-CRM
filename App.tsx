
import React, { useState, useEffect, useMemo } from 'react';
import { Lead, User, ApiResponse } from './types';
import { apiService } from './services/api';
import { Icons } from './components/Icons';
import LeadFormModal from './components/LeadFormModal';
import LeadDetails from './components/LeadDetails';
import FilterPanel from './components/FilterPanel';

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

const App: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await apiService.fetchAllData();
      setLeads(data.leads);
      setUsers(data.users);
      if (selectedLead) {
        const updatedSelected = data.leads.find(l => l._id === selectedLead._id);
        if (updatedSelected) setSelectedLead(updatedSelected);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.userNumber.includes(searchQuery);
      
      const matchesCourse = filters.courses.length === 0 || (lead.course && filters.courses.includes(lead.course));
      const matchesType = filters.programTypes.length === 0 || (lead.programType && filters.programTypes.includes(lead.programType));
      const matchesProfession = filters.professions.length === 0 || (lead.profession && filters.professions.includes(lead.profession));
      const matchesSource = filters.sources.length === 0 || filters.sources.includes(lead.leadfrom);
      const matchesStatus = filters.statuses.length === 0 || filters.statuses.includes(lead.status);
      const matchesPipeline = filters.pipelines.length === 0 || filters.pipelines.includes(lead.pipeline);
      const matchesAssigned = filters.assignedUsers.length === 0 || (lead.assignedto && filters.assignedUsers.includes(lead.assignedto));
      
      const leadDate = new Date(lead.datecreated).getTime();
      const matchesFromDate = !filters.fromDate || leadDate >= new Date(filters.fromDate).getTime();
      const matchesToDate = !filters.toDate || leadDate <= new Date(filters.toDate).getTime() + 86400000;

      return matchesSearch && matchesCourse && matchesType && matchesProfession && 
             matchesSource && matchesStatus && matchesPipeline && matchesAssigned && 
             matchesFromDate && matchesToDate;
    });
  }, [leads, searchQuery, filters]);

  const reminders = useMemo(() => {
    return leads
      .filter(l => l.reminder)
      .sort((a, b) => new Date(a.reminder!).getTime() - new Date(b.reminder!).getTime());
  }, [leads]);

  const stats = useMemo(() => {
    return {
      total: leads.length,
      cold: leads.filter(l => l.status === 'Cold').length,
      warm: leads.filter(l => l.status === 'Warm').length,
      hot: leads.filter(l => l.status === 'Hot').length,
    };
  }, [leads]);

  const handleAddLead = async (leadData: Partial<Lead>) => {
    try {
      await apiService.addLead(leadData);
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to add lead');
    }
  };

  const handleEditLead = async (leadData: Partial<Lead>) => {
    try {
      await apiService.editLeadDetails(leadData);
      setIsEditModalOpen(false);
      setEditingLead(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to edit lead');
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await apiService.deleteLead(id);
      if (selectedLead?._id === id) setSelectedLead(null);
      fetchData();
    } catch (err) {
      alert('Failed to delete lead');
    }
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads(prev => prev.map(l => l._id === updatedLead._id ? updatedLead : l));
    if (selectedLead?._id === updatedLead._id) setSelectedLead(updatedLead);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      // Basic logout simulation
      window.location.reload();
    }
  };

  const getDaysRemaining = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    return `${days} day${days > 1 ? 's' : ''} left`;
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Icons.Settings className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">EduLead CRM</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${currentView === 'dashboard' ? 'bg-blue-600/10 text-blue-400 border-blue-600/20' : 'text-slate-400 border-transparent hover:bg-slate-800'}`}
          >
            <Icons.User className="w-5 h-5" />
            <span className="font-medium">Leads Dashboard</span>
          </button>
          <button 
            onClick={() => setCurrentView('reminders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${currentView === 'reminders' ? 'bg-blue-600/10 text-blue-400 border-blue-600/20' : 'text-slate-400 border-transparent hover:bg-slate-800'}`}
          >
            <div className="relative">
              <Icons.Calendar className="w-5 h-5" />
              {reminders.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
            </div>
            <span className="font-medium">Reminders</span>
          </button>
        </nav>
        
        <div className="p-4 space-y-3 border-t border-slate-800">
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase font-bold mb-2">Logged in as</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0">AD</div>
              <div className="text-sm overflow-hidden">
                <p className="font-semibold truncate">Sharan Admin</p>
                <p className="text-slate-500 text-xs truncate">sharan@demo.com</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-red-600/20 hover:border-red-600/30 transition-all font-semibold text-sm"
          >
            <Icons.X className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
            {currentView === 'dashboard' && (
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold ${isFilterOpen ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <Icons.Filter className="w-5 h-5" />
                <span>Filters</span>
                {(Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f !== '')) && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-shadow shadow hover:shadow-lg active:scale-95"
            >
              <Icons.Plus className="w-4 h-4" />
              <span>Add Lead</span>
            </button>
          </div>
        </header>

        {currentView === 'dashboard' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 shrink-0">
              {[
                { label: 'Total Leads', val: stats.total, color: 'bg-slate-100 text-slate-600' },
                { label: 'Cold', val: stats.cold, color: 'bg-blue-50 text-blue-600' },
                { label: 'Warm', val: stats.warm, color: 'bg-orange-50 text-orange-600' },
                { label: 'Hot', val: stats.hot, color: 'bg-red-50 text-red-600' },
              ].map((s, i) => (
                <div key={i} className={`${s.color} p-4 rounded-2xl border border-current/10 shadow-sm flex flex-col items-center md:items-start`}>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-60">{s.label}</span>
                  <span className="text-2xl font-black">{s.val}</span>
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row p-6 pt-0 gap-6">
              <div className={`flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-sm transition-all ${selectedLead ? 'hidden lg:block lg:flex-1' : 'block w-full'}`}>
                {loading ? (
                  <div className="flex items-center justify-center h-full space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-100"></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-200"></div>
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
                    <Icons.Search className="w-16 h-16 opacity-10 mb-4" />
                    <p className="text-xl font-medium">No leads match filters</p>
                    <p className="text-sm">Try resetting your filters</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Lead Details</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Course & Source</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredLeads.map((lead) => (
                        <tr
                          key={lead._id}
                          onClick={() => setSelectedLead(lead)}
                          className={`group hover:bg-slate-50 cursor-pointer transition-colors ${selectedLead?._id === lead._id ? 'bg-blue-50/50' : ''}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                lead.status === 'Hot' ? 'bg-red-100 text-red-600' : 
                                lead.status === 'Warm' ? 'bg-orange-100 text-orange-600' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                                {lead.userName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{lead.userName}</p>
                                <p className="text-xs text-slate-500">{lead.userNumber}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="font-semibold text-slate-700 truncate max-w-[150px]">{lead.course || 'Unspecified'}</p>
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Icons.Phone className="w-2 h-2" /> {lead.leadfrom}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              lead.status === 'Hot' ? 'bg-red-100 text-red-700' :
                              lead.status === 'Warm' ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                               {lead.assignedto ? (
                                 <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">{lead.assignedto}</span>
                               ) : (
                                 <span className="text-xs text-slate-300 italic">Unassigned</span>
                               )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-slate-500">{new Date(lead.datecreated).toLocaleDateString()}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">{lead.conversations.length} Messages</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {selectedLead && (
                <div className="w-full lg:w-96 lg:shrink-0 h-full overflow-hidden rounded-2xl shadow-xl border border-slate-200">
                  <LeadDetails
                    lead={selectedLead}
                    users={users}
                    onUpdate={handleUpdateLead}
                    onDelete={handleDeleteLead}
                    onEdit={(lead) => {
                      setEditingLead(lead);
                      setIsEditModalOpen(true);
                    }}
                    onClose={() => setSelectedLead(null)}
                  />
                </div>
              )}
            </div>
            <FilterPanel 
              isOpen={isFilterOpen} 
              onClose={() => setIsFilterOpen(false)} 
              filters={filters} 
              users={users}
              onFilterChange={setFilters} 
              onReset={() => setFilters(initialFilters)}
            />
          </>
        )}

        {currentView === 'reminders' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Follow-up Reminders</h2>
                <p className="text-slate-500">Upcoming tasks and student follow-ups</p>
              </div>
              <div className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full font-bold text-sm">
                {reminders.length} Active Reminders
              </div>
            </div>

            {reminders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Icons.Calendar className="w-16 h-16 opacity-10 mb-4" />
                <p className="text-xl font-medium">No reminders scheduled</p>
                <p>Add reminders to leads to see them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {reminders.map(lead => (
                  <div 
                    key={lead._id}
                    onClick={() => {
                      setSelectedLead(lead);
                      setCurrentView('dashboard');
                    }}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          {lead.userName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{lead.userName}</h3>
                          <p className="text-xs text-slate-500">{lead.userNumber}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        new Date(lead.reminder!).getTime() < new Date().getTime() 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {getDaysRemaining(lead.reminder!)}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Icons.Calendar className="w-4 h-4 text-slate-400" />
                        <span>{new Date(lead.reminder!).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Icons.Search className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{lead.course || 'General Enquiry'}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status: {lead.status}</span>
                      <button className="text-blue-600 text-sm font-bold hover:underline">View Lead Details →</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <LeadFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddLead}
        title="Register New Lead"
      />

      <LeadFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingLead(null);
        }}
        onSubmit={handleEditLead}
        initialData={editingLead}
        title="Edit Lead Details"
      />
    </div>
  );
};

export default App;
