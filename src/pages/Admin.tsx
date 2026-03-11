import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Users, Mail, Phone, Calendar, CheckCircle, Clock, LayoutDashboard, Settings, LogOut, LogIn } from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '../firebase';

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
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Listen for real-time updates from Firestore
    const qLeads = query(collection(db, 'leads'), orderBy('date', 'desc'));
    const unsubscribeLeads = onSnapshot(qLeads, (snapshot) => {
      const leadsData: Lead[] = [];
      snapshot.forEach((doc) => {
        leadsData.push({ id: doc.id, ...doc.data() } as Lead);
      });
      setLeads(leadsData);
    }, (error) => {
      console.error('Firestore Error (Leads):', error);
    });

    return () => {
      unsubscribeLeads();
    };
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'leads', id), { status });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const newLeadsCount = leads.filter(l => l.status === 'new').length;

  if (authLoading) {
    return <div className="min-h-screen bg-limestone flex items-center justify-center text-slate-500">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-limestone flex items-center justify-center font-sans">
        <div className="bg-white p-10 rounded-sm shadow-xl max-w-md w-full text-center border border-slate-200">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center">
              <Droplet className="text-teal fill-teal" size={32} />
            </div>
          </div>
          <h1 className="font-display text-2xl font-black text-slate900 mb-2">Admin Login</h1>
          <p className="text-slate-500 mb-8">Sign in with your authorized Google account to access the dashboard.</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-midnight hover:bg-slate-800 text-white px-6 py-3 rounded-sm font-bold flex items-center justify-center gap-3 transition-colors"
          >
            <LogIn size={20} />
            Sign in with Google
          </button>
          <button 
            onClick={() => navigate('/')}
            className="mt-6 text-sm text-slate-500 hover:text-teal font-semibold transition-colors"
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
            <Droplet className="text-teal fill-teal" size={20} />
            IRONFLOW <span className="text-teal font-mono text-xs ml-1">ADMIN</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            className="w-full flex items-center justify-between px-4 py-3 rounded-sm transition-colors bg-teal/10 text-teal"
          >
            <div className="flex items-center gap-3 font-semibold">
              <LayoutDashboard size={18} />
              Service Leads
            </div>
            {newLeadsCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{newLeadsCount}</span>
            )}
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
            Service Requests
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
          </div>

        </div>
      </main>
    </div>
  );
}
