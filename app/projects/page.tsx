// Prevent static generation - this page needs runtime data
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, Loader2, LogOut, UserCircle, 
  FolderOpen, Plus, Clock, CheckCircle, 
  AlertCircle, Search
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Project {
  id: number;
  user_id: string;
  solution_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  solution?: {
    name: string;
    name_he: string;
    icon: string | null;
    color: string | null;
  };
}

export default function ProjectsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'client'>('client');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push('/auth/signin');
        return;
      }
      
      setUser(session.user);
      const role = session.user.user_metadata?.role || 'client';
      setUserRole(role);
      
      await fetchProjects(session.user.id);
      setLoading(false);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchProjects = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_solutions')
        .select(`
          id,
          user_id,
          solution_id,
          status,
          created_at,
          solutions:solution_id (
            name,
            name_he,
            icon,
            color
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProjects = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        solution_id: item.solution_id,
        status: item.status as 'pending' | 'approved' | 'rejected',
        created_at: item.created_at,
        solution: Array.isArray(item.solutions) ? item.solutions[0] : item.solutions
      }));

      setProjects(formattedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Filter and search projects
  const filteredProjects = projects.filter(project => {
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      project.solution?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.solution?.name_he?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/30 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/30 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white transition-all duration-300 flex flex-col fixed h-full z-30 border-r border-gray-200`}>
        {/* User Info at Top */}
        <div className="p-6 border-b border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-900 truncate">Mind Channel</h2>
                <p className="text-xs text-gray-500">Workspace</p>
              </div>
            </div>
          ) : (
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link 
            href="/solutions"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors ${!sidebarOpen && 'justify-center px-3'}`}
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">New Solution</span>}
          </Link>

          <Link 
            href="/dashboard"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors ${!sidebarOpen && 'justify-center px-3'}`}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Dashboard</span>}
          </Link>
          
          <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl bg-green-500 text-white ${!sidebarOpen && 'justify-center px-3'}`}>
            <FolderOpen className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">My Projects</span>}
          </div>

          <Link 
            href="/profile"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors ${!sidebarOpen && 'justify-center px-3'}`}
          >
            <UserCircle className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Profile</span>}
          </Link>
        </nav>

        {/* Logout at Bottom */}
        <div className="p-6 border-t border-gray-200">
          {sidebarOpen ? (
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          ) : (
            <button 
              onClick={handleLogout}
              className="w-full p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
                <p className="text-gray-600 mt-1">Track and manage your solution requests</p>
              </div>
              <Link
                href="/solutions"
                className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Request
              </Link>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{projects.length}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setFilterStatus('approved')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {projects.filter(p => p.status === 'approved').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setFilterStatus('pending')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">
                    {projects.filter(p => p.status === 'pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setFilterStatus('rejected')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {projects.filter(p => p.status === 'rejected').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl border border-gray-200 p-4 mb-6"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('approved')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === 'approved'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Approved
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === 'pending'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilterStatus('rejected')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === 'rejected'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Rejected
                </button>
              </div>
            </div>
          </motion.div>

          {/* Projects List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {filteredProjects.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery || filterStatus !== 'all' ? 'No projects found' : 'No Projects Yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Try adjusting your filters or search query'
                    : 'Start by requesting your first solution'}
                </p>
                {!searchQuery && filterStatus === 'all' && (
                  <Link
                    href="/solutions"
                    className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Request Solution
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Project Icon */}
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ 
                            background: project.status === 'approved' 
                              ? `linear-gradient(135deg, ${project.solution?.color || '#10b981'} 0%, ${project.solution?.color || '#10b981'}dd 100%)`
                              : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)'
                          }}
                        >
                          {project.solution?.icon ? (
                            <span className="text-2xl">{project.solution.icon}</span>
                          ) : (
                            <FolderOpen className="w-6 h-6 text-white" />
                          )}
                        </div>

                        {/* Project Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                {project.solution?.name_he || 'Unknown Solution'}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {project.solution?.name || project.solution_id}
                              </p>
                            </div>
                            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                              {getStatusIcon(project.status)}
                              <span className="capitalize">{project.status}</span>
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-500 mb-4">
                            Requested on {new Date(project.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>

                          {/* Action Buttons */}
                          {project.status === 'approved' && (
                            <Link
                              href={`/solutions/${project.solution_id}`}
                              className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                            >
                              Open Solution
                              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
