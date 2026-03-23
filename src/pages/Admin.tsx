import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Wrench, Users, Mail, Phone, Calendar, Clock, LayoutDashboard, LogOut, LogIn, Trash2, AlertTriangle, CheckCircle, RefreshCw, Bell, BellOff, ChevronRight, Search, Filter } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  address: string;
  email?: string;
  phone?: string;
  service: string;
  message: string;
  status: 'new' | 'contacted' | 'resolved';
  date: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<{show: boolean, id: string | 'all'}>({ show: false, id: '' });
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'contacted' | 'resolved'>('all');
  
  const prevNewLeadsCount = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  const safeFetch = async (url: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(url, options);
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        let errorText = '';
        if (contentType && contentType.includes("application/json")) {
          const err = await response.json();
          errorText = err.message || err.error || `Error ${response.status}`;
        } else {
          errorText = await response.text();
          errorText = `Server Error (${response.status}): ${errorText.substring(0, 100)}...`;
        }
        throw new Error(errorText);
      }

      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }
      return await response.text();
    } catch (error) {
      console.error(`Fetch error for ${url}:`, error);
      throw error;
    }
  };

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  useEffect(() => {
    const savedAuth = localStorage.getItem('admin_auth');
    if (savedAuth === 'PASCUAL:PASCUAL') {
      setIsLoggedIn(true);
    }
    setAuthLoading(false);
  }, []);

  const getAuthHeader = () => {
    return localStorage.getItem('admin_auth') || '';
  };

  const fetchLeads = async () => {
    try {
      const data = await safeFetch('/api/admin/leads', {
        headers: { 'x-admin-auth': getAuthHeader() }
      });
      setLeads(data);
      
      const newLeads = data.filter((l: Lead) => l.status === 'new').length;
      
      // Notification logic
      if (newLeads > prevNewLeadsCount.current) {
        if (notificationsEnabled && audioRef.current) {
          audioRef.current.play().catch(e => console.log('Audio play blocked:', e));
        }
      }
      
      prevNewLeadsCount.current = newLeads;
      
      // Update tab title
      if (newLeads > 0) {
        document.title = `(${newLeads}) IronFlow Admin`;
      } else {
        document.title = `IronFlow Admin`;
      }
      
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchLeads();
      const interval = setInterval(fetchLeads, 5000); // Poll every 5 seconds for faster notifications
      return () => {
        clearInterval(interval);
        document.title = 'IronFlow Plumbing';
      };
    }
  }, [isLoggedIn, notificationsEnabled]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'PASCUAL' && loginForm.password === 'PASCUAL') {
      localStorage.setItem('admin_auth', 'PASCUAL:PASCUAL');
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    setIsLoggedIn(false);
    document.title = 'IronFlow Plumbing';
    navigate('/');
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-auth': getAuthHeader()
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) fetchLeads();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-auth': getAuthHeader() }
      });
      if (response.ok) {
        fetchLeads();
        setShowConfirmDelete({ show: false, id: '' });
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const deleteAllLeads = async () => {
    setIsDeletingAll(true);
    try {
      const response = await fetch('/api/admin/leads', {
        method: 'DELETE',
        headers: { 'x-admin-auth': getAuthHeader() }
      });
      if (response.ok) {
        fetchLeads();
        setShowConfirmDelete({ show: false, id: '' });
      }
    } catch (error) {
      console.error('Error deleting all leads:', error);
    } finally {
      setIsDeletingAll(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.service.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || lead.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const newLeadsCount = leads.filter(l => l.status === 'new').length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-limestone flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal/20 border-t-teal rounded-full animate-spin mb-4" />
        <div className="font-display font-black text-xs uppercase tracking-widest text-slate-400">Initializing Admin...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-limestone flex items-center justify-center font-sans p-6 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(0,229,255,0.1),transparent_40%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(217,119,54,0.1),transparent_40%)] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white p-10 md:p-12 rounded-3xl shadow-strong max-w-md w-full border border-slate-200 relative z-10"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-midnight rounded-t-3xl" />
          
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-teal rounded-2xl flex items-center justify-center shadow-strong rotate-3">
              <Wrench className="text-midnight" size={40} strokeWidth={2.5} />
            </div>
          </div>
          
          <h1 className="font-display text-4xl font-black text-slate900 mb-2 text-center tracking-tighter uppercase">Admin Access</h1>
          <p className="text-slate-500 mb-10 text-center font-medium">Enter credentials to manage service leads.</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Username</label>
              <input 
                type="text" 
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-teal focus:bg-white transition-all font-sans font-semibold text-slate-900"
                placeholder="Enter username"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
              <input 
                type="password" 
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-teal focus:bg-white transition-all font-sans font-semibold text-slate-900"
                placeholder="Enter password"
                required
              />
            </div>
            
            <AnimatePresence>
              {loginError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-600 text-xs font-bold bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-2"
                >
                  <AlertTriangle size={16} />
                  {loginError}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-midnight text-white px-8 py-5 rounded-2xl font-display font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-strong"
            >
              <LogIn size={20} strokeWidth={2.5} />
              Log In
            </motion.button>
          </form>

          <button 
            onClick={() => navigate('/')}
            className="w-full mt-8 text-xs text-slate-400 hover:text-teal font-black uppercase tracking-widest transition-colors text-center"
          >
            &larr; Back to Website
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-limestone flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-midnight text-white flex flex-col relative z-20 shadow-strong">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 font-display font-black text-2xl tracking-tighter">
            <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center shadow-[4px_4px_0px_rgba(255,255,255,0.1)]">
              <Wrench className="text-midnight" size={20} strokeWidth={3} />
            </div>
            IRONFLOW <span className="text-teal text-[10px] font-mono tracking-widest ml-1 opacity-50">ADMIN</span>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-3">
          <motion.button 
            whileHover={{ x: 5 }}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all bg-teal/10 text-teal border border-teal/20`}
          >
            <div className="flex items-center gap-4 font-display font-black text-xs uppercase tracking-widest">
              <LayoutDashboard size={18} strokeWidth={2.5} />
              Service Leads
            </div>
            {newLeadsCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full animate-pulse">{newLeadsCount}</span>
            )}
          </motion.button>

          <motion.button 
            whileHover={{ x: 5 }}
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-display font-black text-xs uppercase tracking-widest transition-all text-slate-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10`}
          >
            {notificationsEnabled ? <Bell size={18} strokeWidth={2.5} /> : <BellOff size={18} strokeWidth={2.5} />}
            {notificationsEnabled ? 'Alerts On' : 'Alerts Off'}
          </motion.button>
        </nav>

        <div className="p-6 border-t border-white/5">
          <motion.button 
            whileHover={{ x: 5 }}
            onClick={handleLogout} 
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-display font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
          >
            <LogOut size={18} strokeWidth={2.5} />
            Sign Out
          </motion.button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(0,229,255,0.03),transparent_40%)] pointer-events-none" />

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-10 py-8 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-8">
            <h1 className="font-display text-4xl font-black text-slate900 tracking-tighter uppercase">
              Service Requests
            </h1>
            <div className="flex items-center gap-3">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchLeads}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-teal bg-teal/5 hover:bg-teal/10 rounded-full border border-teal/20 transition-all"
              >
                <RefreshCw size={14} strokeWidth={2.5} />
                Refresh
              </motion.button>
              {leads.length > 0 && (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowConfirmDelete({ show: true, id: 'all' })}
                  className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 hover:bg-red-100 rounded-full border border-red-200 transition-all"
                >
                  <Trash2 size={14} strokeWidth={2.5} />
                  Clear All
                </motion.button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <div className="font-display font-black text-slate900 text-lg tracking-tight">Marcus Delgado</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Master Plumber</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-midnight flex items-center justify-center text-teal font-display font-black text-xl shadow-strong rotate-3">
              MD
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-10 relative z-10">
          {/* Status Messages */}
          <AnimatePresence>
            {statusMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: -20, x: 20 }}
                className={`fixed top-24 right-10 z-[100] flex items-center gap-4 px-8 py-5 rounded-2xl shadow-strong border backdrop-blur-xl ${
                  statusMessage.type === 'success' ? 'bg-green-50/90 border-green-200 text-green-800' : 'bg-red-50/90 border-red-200 text-red-800'
                }`}
              >
                {statusMessage.type === 'success' ? <CheckCircle size={24} strokeWidth={2.5} /> : <AlertTriangle size={24} strokeWidth={2.5} />}
                <span className="font-display font-black text-sm uppercase tracking-widest">{statusMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {[
              { label: 'Total Leads', value: leads.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'New Requests', value: newLeadsCount, icon: Clock, color: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Conversion', value: leads.length > 0 ? Math.round((leads.filter(l => l.status === 'resolved').length / leads.length) * 100) + '%' : '0%', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-soft flex items-center gap-6 group hover:shadow-strong transition-all duration-500"
              >
                <div className={`w-16 h-16 rounded-2xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className={stat.color} size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</div>
                  <div className="text-4xl font-display font-black text-slate900 tracking-tighter">{stat.value}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-6 mb-8 items-center justify-between">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal transition-colors" size={20} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads..."
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-teal focus:ring-4 focus:ring-teal/5 outline-none transition-all font-sans font-semibold text-slate-900 shadow-soft"
              />
            </div>
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-soft">
              {['all', 'new', 'contacted', 'resolved'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-6 py-2.5 rounded-xl font-display font-black text-[10px] uppercase tracking-widest transition-all ${
                    filterStatus === status 
                      ? 'bg-midnight text-white shadow-strong' 
                      : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Data Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-[2rem] border border-slate-200 shadow-strong overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
                    <th className="p-8">Status</th>
                    <th className="p-8">Customer Details</th>
                    <th className="p-8">Service Needed</th>
                    <th className="p-8">Date Received</th>
                    <th className="p-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead, i) => (
                    <motion.tr 
                      key={lead.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (i * 0.05) }}
                      className="group hover:bg-slate-50/50 transition-all duration-300"
                    >
                      <td className="p-8">
                        {lead.status === 'new' && (
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-100">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> New
                          </span>
                        )}
                        {lead.status === 'contacted' && (
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Contacted
                          </span>
                        )}
                        {lead.status === 'resolved' && (
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest border border-green-100">
                            <CheckCircle size={12} strokeWidth={3} /> Resolved
                          </span>
                        )}
                      </td>
                      <td className="p-8">
                        <div className="font-display font-black text-slate-900 text-lg tracking-tight group-hover:text-teal transition-colors">{lead.name}</div>
                        <div className="text-sm text-slate-500 mt-1 font-medium">{lead.address}</div>
                        <div className="flex flex-wrap gap-4 mt-3">
                          {lead.email && (
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                              <Mail size={12} strokeWidth={2.5} /> {lead.email}
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                              <Phone size={12} strokeWidth={2.5} /> {lead.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="font-display font-black text-slate-900 uppercase text-xs tracking-widest">{lead.service}</div>
                        {lead.message && (
                          <div className="text-sm text-slate-400 mt-2 max-w-xs font-medium italic line-clamp-2" title={lead.message}>
                            "{lead.message}"
                          </div>
                        )}
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-2 text-xs font-black text-slate-900 tracking-tight">
                          <Calendar size={14} className="text-teal" />
                          {new Date(lead.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">
                          <Clock size={12} />
                          {new Date(lead.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <div className="relative">
                            <select 
                              value={lead.status}
                              onChange={(e) => updateStatus(lead.id, e.target.value)}
                              className="appearance-none bg-slate-50 border border-slate-200 text-[10px] font-black uppercase tracking-widest rounded-xl pl-4 pr-10 py-2.5 outline-none focus:border-teal focus:bg-white transition-all cursor-pointer"
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="resolved">Resolved</option>
                            </select>
                            <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" strokeWidth={3} />
                          </div>
                          <motion.button 
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowConfirmDelete({ show: true, id: lead.id })}
                            className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-100"
                            title="Delete Request"
                          >
                            <Trash2 size={18} strokeWidth={2.5} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {filteredLeads.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center">
                            <Search size={40} className="text-slate-200" />
                          </div>
                          <div className="font-display font-black text-xl text-slate-300 uppercase tracking-tighter">No matching leads found</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmDelete.show && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-midnight/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-strong max-w-md w-full p-12 border border-slate-200 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
              
              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 mb-8">
                  <AlertTriangle size={40} strokeWidth={2.5} />
                </div>
                <h3 className="font-display text-4xl font-black text-slate900 tracking-tighter uppercase mb-4">Are you sure?</h3>
                <p className="font-sans text-slate-500 font-medium leading-relaxed">
                  {showConfirmDelete.id === 'all' 
                    ? "This will permanently delete ALL service requests from the database. This action cannot be undone."
                    : "This will permanently delete this service request. This action cannot be undone."}
                </p>
              </div>
              
              <div className="flex flex-col gap-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => showConfirmDelete.id === 'all' ? deleteAllLeads() : deleteLead(showConfirmDelete.id)}
                  disabled={isDeletingAll}
                  className="w-full py-5 bg-red-600 text-white font-display font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-strong disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isDeletingAll ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 size={18} strokeWidth={2.5} />
                      Confirm Deletion
                    </>
                  )}
                </motion.button>
                <button 
                  onClick={() => setShowConfirmDelete({ show: false, id: '' })}
                  className="w-full py-5 text-slate-400 hover:text-slate-900 font-display font-black text-xs uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
