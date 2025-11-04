'use client';

// Prevent static generation - this page needs runtime data
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Package, Shield, Home, Bell, Menu, X, LogOut, Users,
  Plus, Loader2, Trash2, Search
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Solution {
  id: number;
  solution_id: string;
  name: string;
  name_he: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  created_at: string;
}

export default function SolutionsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSolution, setNewSolution] = useState({
    solution_id: '',
    name: '',
    name_he: '',
    description: '',
    icon: '📦',
    color: '#10b981',
  });
  const [addingSolution, setAddingSolution] = useState(false);
  const [deletingSolutionId, setDeletingSolutionId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        router.push('/auth/signin');
        return;
      }
      
      const userRole = session.user.user_metadata?.role || 'client';
      if (userRole !== 'admin') {
        router.push('/solutions');
        return;
      }
      
      await fetchSolutions();
      setLoading(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchSolutions = async () => {
    try {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSolutions(data || []);
    } catch (error) {
      console.error('Error fetching solutions:', error);
    }
  };

  const handleAddSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingSolution(true);

    try {
      const { error } = await supabase
        .from('solutions')
        .insert([{
          solution_id: newSolution.solution_id,
          name: newSolution.name,
          name_he: newSolution.name_he,
          description: newSolution.description || null,
          icon: newSolution.icon,
          color: newSolution.color,
          is_active: true,
        }]);

      if (error) throw error;

      alert('Solution created successfully!');
      setShowAddModal(false);
      setNewSolution({
        solution_id: '',
        name: '',
        name_he: '',
        description: '',
        icon: '📦',
        color: '#10b981',
      });
      await fetchSolutions();
    } catch (error: any) {
      alert(error.message || 'Error creating solution');
    } finally {
      setAddingSolution(false);
    }
  };

  const handleDeleteSolution = async (id: number) => {
    if (!confirm('Are you sure you want to delete this solution? This will also remove all user access to this solution.')) {
      return;
    }

    setDeletingSolutionId(id);
    try {
      // First delete all user_solutions entries
      await supabase
        .from('user_solutions')
        .delete()
        .eq('solution_id', solutions.find(s => s.id === id)?.solution_id);

      // Then delete the solution
      const { error } = await supabase
        .from('solutions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      alert('Solution deleted successfully!');
      await fetchSolutions();
    } catch (error: any) {
      alert(error.message || 'Error deleting solution');
    } finally {
      setDeletingSolutionId(null);
    }
  };

  const toggleSolutionStatus = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('solutions')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      await fetchSolutions();
    } catch (error: any) {
      alert(error.message || 'Error updating solution status');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const filteredSolutions = solutions.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name_he.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.solution_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed h-full z-30`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          {sidebarOpen && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">Admin Panel</span>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link href="/admin" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${!sidebarOpen && 'justify-center'}`}>
            <Home className="w-5 h-5" />
            {sidebarOpen && <span>Dashboard</span>}
          </Link>
          
          <Link href="/admin/users" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${!sidebarOpen && 'justify-center'}`}>
            <Users className="w-5 h-5" />
            {sidebarOpen && <span>Users</span>}
          </Link>
          
          <div className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-green-50 text-green-600 ${!sidebarOpen && 'justify-center'}`}>
            <Package className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Solutions</span>}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogout}
              className="w-full p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Solutions Management</h1>
            <p className="text-sm text-gray-500">Manage available solutions</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs text-gray-500 font-medium">TOTAL</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{solutions.length}</h3>
              <p className="text-sm text-gray-600">Total Solutions</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 bg-green-50 rounded-lg">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs text-gray-500 font-medium">ACTIVE</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {solutions.filter(s => s.is_active).length}
              </h3>
              <p className="text-sm text-gray-600">Active Solutions</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Package className="w-6 h-6 text-gray-600" />
                </div>
                <span className="text-xs text-gray-500 font-medium">INACTIVE</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {solutions.filter(s => !s.is_active).length}
              </h3>
              <p className="text-sm text-gray-600">Inactive Solutions</p>
            </motion.div>
          </div>

          {/* Search and Add */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search solutions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Solution
            </button>
          </div>

          {/* Solutions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSolutions.map((solution, index) => (
              <motion.div
                key={solution.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${solution.color}20` }}
                    >
                      {solution.icon || '📦'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{solution.name}</h3>
                      <p className="text-sm text-gray-500">{solution.name_he}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleSolutionStatus(solution.id, solution.is_active)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      solution.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {solution.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {solution.description || 'No description provided'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    ID: {solution.solution_id}
                  </span>
                  
                  <button
                    onClick={() => handleDeleteSolution(solution.id)}
                    disabled={deletingSolutionId === solution.id}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete Solution"
                  >
                    {deletingSolutionId === solution.id ? (
                      <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-red-600" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredSolutions.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No solutions found</p>
            </div>
          )}
        </main>
      </div>

      {/* Add Solution Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Solution</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSolution} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solution ID *
                  </label>
                  <input
                    type="text"
                    value={newSolution.solution_id}
                    onChange={(e) => setNewSolution({ ...newSolution, solution_id: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="customer-database"
                  />
                  <p className="mt-1 text-xs text-gray-500">Use lowercase with hyphens</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name (English) *
                  </label>
                  <input
                    type="text"
                    value={newSolution.name}
                    onChange={(e) => setNewSolution({ ...newSolution, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="Customer Database"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name (Hebrew) *
                  </label>
                  <input
                    type="text"
                    value={newSolution.name_he}
                    onChange={(e) => setNewSolution({ ...newSolution, name_he: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="מאגר לקוחות"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newSolution.description}
                    onChange={(e) => setNewSolution({ ...newSolution, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="Brief description of the solution..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon (Emoji)
                    </label>
                    <input
                      type="text"
                      value={newSolution.icon}
                      onChange={(e) => setNewSolution({ ...newSolution, icon: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      placeholder="📦"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      value={newSolution.color}
                      onChange={(e) => setNewSolution({ ...newSolution, color: e.target.value })}
                      className="w-full h-12 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingSolution}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {addingSolution ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Solution'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
