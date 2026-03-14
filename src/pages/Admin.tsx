import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Users, Mail, Phone, Calendar, Clock, LayoutDashboard, LogOut, LogIn, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

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
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leads' | 'recipients'>('leads');
  const [recipients, setRecipients] = useState<{id: string, email: string}[]>([]);
  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [isAddingRecipient, setIsAddingRecipient] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<{show: boolean, id: string | 'all'}>({ show: false, id: '' });
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

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
      setIsSuperAdmin(false);
    } else if (savedAuth === 'SWORD:ROSES') {
      setIsLoggedIn(true);
      setIsSuperAdmin(true);
    }
    setAuthLoading(false);
  }, []);

  const getAuthHeader = () => {
    return localStorage.getItem('admin_auth') || '';
  };

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/admin/leads', {
        headers: { 'x-admin-auth': getAuthHeader() }
      });
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const fetchRecipients = async () => {
    if (!isSuperAdmin) return;
    try {
      const response = await fetch('/api/admin/recipients', {
        headers: { 'x-admin-auth': 'SWORD:ROSES' }
      });
      if (response.ok) {
        const data = await response.json();
        setRecipients(data);
      }
    } catch (error) {
      console.error('Error fetching recipients:', error);
    }
  };

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch('/api/ping');
        if (!res.ok) console.error('Server ping failed:', res.status);
      } catch (err) {
        console.error('Server unreachable:', err);
      }
    };
    checkServer();

    if (isLoggedIn) {
      fetchLeads();
      const interval = setInterval(fetchLeads, 10000);
      
      if (isSuperAdmin && activeTab === 'recipients') {
        fetchRecipients();
      }
      
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, isSuperAdmin, activeTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'PASCUAL' && loginForm.password === 'PASCUAL') {
      localStorage.setItem('admin_auth', 'PASCUAL:PASCUAL');
      setIsLoggedIn(true);
      setIsSuperAdmin(false);
      setLoginError('');
    } else if (loginForm.username === 'SWORD' && loginForm.password === 'ROSES') {
      localStorage.setItem('admin_auth', 'SWORD:ROSES');
      setIsLoggedIn(true);
      setIsSuperAdmin(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Please try again.');
    }
  };

  const addRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipientEmail || isAddingRecipient) return;
    setIsAddingRecipient(true);
    try {
      const response = await fetch('/api/admin/recipients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-auth': 'SWORD:ROSES'
        },
        body: JSON.stringify({ email: newRecipientEmail })
      });
      if (response.ok) {
        setNewRecipientEmail('');
        setStatusMessage({ type: 'success', text: 'Recipient added successfully!' });
        fetchRecipients();
      } else {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const err = await response.json();
          setStatusMessage({ type: 'error', text: err.error || 'Failed to add recipient' });
        } else {
          const text = await response.text();
          setStatusMessage({ type: 'error', text: `Server Error (${response.status}): ${text.substring(0, 50)}...` });
        }
      }
    } catch (error) {
      console.error('Detailed Add Recipient Error:', error);
      setStatusMessage({ 
        type: 'error', 
        text: `Connection Error: ${error instanceof Error ? error.message : 'Unknown'}. Please check if the server is reachable.` 
      });
    } finally {
      setIsAddingRecipient(false);
    }
  };

  const removeRecipient = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/recipients/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-auth': 'SWORD:ROSES' }
      });
      if (response.ok) fetchRecipients();
    } catch (error) {
      console.error('Error removing recipient:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    setIsLoggedIn(false);
    setIsSuperAdmin(false);
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

  const newLeadsCount = leads.filter(l => l.status === 'new').length;

  if (authLoading) {
    return <div className="min-h-screen bg-limestone flex items-center justify-center text-slate-500">Loading...</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-limestone flex items-center justify-center font-sans">
        <div className="bg-white p-10 rounded-sm shadow-xl max-w-md w-full border border-slate-200">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center">
              <Wrench className="text-teal fill-teal" size={32} />
            </div>
          </div>
          <h1 className="font-display text-2xl font-black text-slate900 mb-2 text-center">Admin Access</h1>
          <p className="text-slate-500 mb-8 text-center text-sm">Enter the shared credentials to access the dashboard.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Username</label>
              <input 
                type="text" 
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-teal transition-colors"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
              <input 
                type="password" 
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-teal transition-colors"
                placeholder="Enter password"
                required
              />
            </div>
            
            {loginError && (
              <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-sm border border-red-100">
                {loginError}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-midnight hover:bg-slate-800 text-white px-6 py-3 rounded-sm font-bold flex items-center justify-center gap-3 transition-colors"
            >
              <LogIn size={20} />
              Log In
            </button>
          </form>

          <button 
            onClick={() => navigate('/')}
            className="w-full mt-6 text-sm text-slate-500 hover:text-teal font-semibold transition-colors text-center"
          >
            &larr; Back to Website
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-limestone flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-midnight text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 font-display font-black text-xl tracking-tight">
            <Wrench className="text-teal fill-teal" size={20} />
            IRONFLOW <span className="text-teal font-mono text-xs ml-1">ADMIN</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('leads')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-sm transition-colors ${activeTab === 'leads' ? 'bg-teal/10 text-teal' : 'text-steel hover:bg-white/5 hover:text-white'}`}
          >
            <div className="flex items-center gap-3 font-semibold">
              <LayoutDashboard size={18} />
              Service Leads
            </div>
            {newLeadsCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{newLeadsCount}</span>
            )}
          </button>

          {isSuperAdmin && (
            <button 
              onClick={() => setActiveTab('recipients')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-semibold transition-colors ${activeTab === 'recipients' ? 'bg-teal/10 text-teal' : 'text-steel hover:bg-white/5 hover:text-white'}`}
            >
              <Mail size={18} />
              Email Recipients
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-sm font-semibold text-steel hover:bg-white/5 hover:text-white transition-colors">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="font-display text-2xl font-bold text-slate900">
              Service Requests
            </h1>
            {leads.length > 0 && (
              <button 
                onClick={() => setShowConfirmDelete({ show: true, id: 'all' })}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-sm border border-red-200 transition-colors"
              >
                <Trash2 size={14} />
                Delete All
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-bold text-slate900">Marcus Delgado</div>
              <div className="text-xs text-slate-500">Master Plumber</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-teal/20 flex items-center justify-center text-teal font-bold">
              MD
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8 relative">
          {/* Status Messages */}
          {statusMessage && (
            <div className={`fixed top-24 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-sm shadow-lg border animate-in fade-in slide-in-from-top-4 duration-300 ${
              statusMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {statusMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
              <span className="font-bold">{statusMessage.text}</span>
            </div>
          )}
          
          {activeTab === 'leads' ? (
            <>
              {/* Note about email copy */}
              <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-sm flex items-start gap-3">
                <Mail className="text-blue-500 mt-0.5" size={18} />
                <p className="text-sm text-blue-700 font-medium">
                  Note: A copy of every service request is automatically sent to the registered business owner email addresses.
                </p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                    <Users className="text-blue-500" size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Leads</div>
                    <div className="text-3xl font-display font-black text-slate900">{leads.length}</div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                    <Clock className="text-red-500" size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">New Requests</div>
                    <div className="text-3xl font-display font-black text-slate900">{newLeadsCount}</div>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                      <th className="p-4">Status</th>
                      <th className="p-4">Customer Details</th>
                      <th className="p-4">Service Needed</th>
                      <th className="p-4">Date Received</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leads.map(lead => (
                      <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          {lead.status === 'new' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> New</span>}
                          {lead.status === 'contacted' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Contacted</span>}
                          {lead.status === 'resolved' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Resolved</span>}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate900">{lead.name}</div>
                          <div className="text-sm text-slate-700 mt-1">{lead.address}</div>
                          {lead.email && (
                            <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                              <Mail size={14} /> {lead.email}
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                              <Phone size={14} /> {lead.phone}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-700">{lead.service}</div>
                          {lead.message && (
                            <div className="text-sm text-slate-500 mt-1 max-w-xs truncate" title={lead.message}>
                              "{lead.message}"
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Calendar size={14} />
                            {new Date(lead.date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {new Date(lead.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <select 
                              value={lead.status}
                              onChange={(e) => updateStatus(lead.id, e.target.value)}
                              className="bg-white border border-slate-300 text-sm rounded-sm px-3 py-1.5 outline-none focus:border-teal font-semibold text-slate-700"
                            >
                              <option value="new">Mark New</option>
                              <option value="contacted">Mark Contacted</option>
                              <option value="resolved">Mark Resolved</option>
                            </select>
                            <button 
                              onClick={() => setShowConfirmDelete({ show: true, id: lead.id })}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                              title="Delete Request"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {leads.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">No service requests yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="max-w-2xl">
              <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-8 mb-8">
                <h2 className="font-display text-xl font-bold text-slate900 mb-6 flex items-center gap-2">
                  <Mail className="text-teal" size={20} />
                  Manage Notification Recipients
                </h2>
                
                <form onSubmit={addRecipient} className="flex gap-3 mb-8">
                  <input 
                    type="email" 
                    value={newRecipientEmail}
                    onChange={(e) => setNewRecipientEmail(e.target.value)}
                    placeholder="Enter business owner email"
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-teal transition-colors"
                    required
                  />
                  <button 
                    type="submit"
                    disabled={isAddingRecipient}
                    className="bg-teal hover:bg-teal/90 text-midnight px-6 py-3 rounded-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAddingRecipient ? (
                      <>
                        <Clock className="animate-spin" size={18} />
                        Adding...
                      </>
                    ) : (
                      'Add Recipient'
                    )}
                  </button>
                </form>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Recipients</h3>
                  {recipients.length > 0 ? (
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-sm">
                      {recipients.map(recipient => (
                        <div key={recipient.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center text-teal">
                              <Mail size={14} />
                            </div>
                            <span className="font-semibold text-slate-700">{recipient.email}</span>
                          </div>
                          <button 
                            onClick={() => removeRecipient(recipient.id)}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                            title="Remove Recipient"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-sm text-slate-500 border border-dashed border-slate-200">
                      No recipients added yet. Notifications will go to the default address.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmDelete.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-midnight/60 backdrop-blur-sm">
          <div className="bg-white rounded-sm shadow-2xl max-w-md w-full p-8 border border-slate-200">
            <div className="flex items-center gap-4 mb-6 text-red-600">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>
              <h3 className="font-display text-xl font-bold">Confirm Deletion</h3>
            </div>
            
            <p className="text-slate-600 mb-8 leading-relaxed">
              {showConfirmDelete.id === 'all' 
                ? "Are you absolutely sure you want to delete ALL service requests? This action cannot be undone."
                : "Are you sure you want to delete this service request? This action cannot be undone."}
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmDelete({ show: false, id: '' })}
                className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => showConfirmDelete.id === 'all' ? deleteAllLeads() : deleteLead(showConfirmDelete.id)}
                disabled={isDeletingAll}
                className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeletingAll ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
