import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Users, Mail, Phone, Calendar, CheckCircle, Clock, LayoutDashboard, Settings, LogOut } from 'lucide-react';

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

interface Subscriber {
  id: string;
  email: string;
  date: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [activeTab, setActiveTab] = useState<'leads' | 'subscribers'>('leads');

  useEffect(() => {
    // Basic auth check
    if (localStorage.getItem('ironflow_admin') !== 'true') {
      navigate('/');
      return;
    }
    fetchLeads();
    fetchSubscribers();

    // Listen for real-time updates
    const eventSource = new EventSource('/api/events');
    eventSource.onmessage = () => {
      fetchLeads();
      fetchSubscribers();
    };

    return () => {
      eventSource.close();
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('ironflow_admin');
    navigate('/');
  };

  const fetchLeads = async () => {
    const res = await fetch('/api/leads');
    const data = await res.json();
    setLeads(data);
  };

  const fetchSubscribers = async () => {
    const res = await fetch('/api/subscribers');
    const data = await res.json();
    setSubscribers(data);
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchLeads(); // Refresh
  };

  const newLeadsCount = leads.filter(l => l.status === 'new').length;

  return (
    <div className="min-h-screen bg-limestone flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-midnight text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 font-display font-black text-xl tracking-tight">
            <Droplet className="text-teal fill-teal" size={20} />
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
          
          <button 
            onClick={() => setActiveTab('subscribers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-semibold transition-colors ${activeTab === 'subscribers' ? 'bg-teal/10 text-teal' : 'text-steel hover:bg-white/5 hover:text-white'}`}
          >
            <Mail size={18} />
            Subscribers
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-sm font-semibold text-steel hover:bg-white/5 hover:text-white transition-colors">
            <Settings size={18} />
            Settings
          </button>
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
          <h1 className="font-display text-2xl font-bold text-slate900">
            {activeTab === 'leads' ? 'Service Requests' : 'Newsletter Subscribers'}
          </h1>
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
        <div className="flex-1 overflow-auto p-8">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

            <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center">
                <Mail className="text-teal" size={24} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Subscribers</div>
                <div className="text-3xl font-display font-black text-slate900">{subscribers.length}</div>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden">
            {activeTab === 'leads' ? (
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
                        <select 
                          value={lead.status}
                          onChange={(e) => updateStatus(lead.id, e.target.value)}
                          className="bg-white border border-slate-300 text-sm rounded-sm px-3 py-1.5 outline-none focus:border-teal font-semibold text-slate-700"
                        >
                          <option value="new">Mark New</option>
                          <option value="contacted">Mark Contacted</option>
                          <option value="resolved">Mark Resolved</option>
                        </select>
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
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Date Subscribed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subscribers.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-semibold text-slate900 flex items-center gap-2">
                        <Mail size={16} className="text-slate-400" />
                        {sub.email}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {new Date(sub.date).toLocaleDateString()} at {new Date(sub.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                    </tr>
                  ))}
                  {subscribers.length === 0 && (
                    <tr>
                      <td colSpan={2} className="p-8 text-center text-slate-500">No subscribers yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
