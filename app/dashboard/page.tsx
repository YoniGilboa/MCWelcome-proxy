// Prevent static generation - this page needs runtime data
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, Loader2, LogOut, UserCircle, 
  Lock, Users, Video, FileText, Sparkles, Plus, FolderOpen,
  TrendingUp, Clock, CheckCircle, Activity, ArrowUpRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
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
  has_access?: boolean;
}

interface Project {
  id: number;
  solution_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'client'>('client');
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
      
      await fetchSolutions(session.user.id);
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

  const fetchSolutions = async (userId: string) => {
    try {
      const { data: allSolutions, error: solutionsError } = await supabase
        .from('solutions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (solutionsError) throw solutionsError;

      const { data: userSolutions, error: userSolutionsError } = await supabase
        .from('user_solutions')
        .select('solution_id')
        .eq('user_id', userId)
        .eq('status', 'approved');

      if (userSolutionsError) throw userSolutionsError;

      const approvedSolutionIds = userSolutions?.map((us: any) => us.solution_id) || [];

      const combinedSolutions = (allSolutions || []).map((solution: any) => ({
        ...solution,
        has_access: approvedSolutionIds.includes(solution.solution_id),
      }));

      setSolutions(combinedSolutions);
    } catch (error) {
      console.error('Error fetching solutions:', error);
    }
  };

  const fetchProjects = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_solutions')
        .select('id, solution_id, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSolutionClick = (solution: Solution) => {
    if (solution.has_access) {
      router.push(`/solutions/${solution.solution_id}`);
    }
  };

  const getIconForSolution = (iconString: string | null, solutionId: string) => {
    if (iconString && iconString !== '') {
      return <span className="text-4xl">{iconString}</span>;
    }
    
    switch (solutionId) {
      case 'customer-database':
        return <Users className="w-10 h-10" />;
      case 'reels-creation':
        return <Video className="w-10 h-10" />;
      case 'reports-forms':
        return <FileText className="w-10 h-10" />;
      default:
        return <Sparkles className="w-10 h-10" />;
    }
  };

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

          <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl bg-green-500 text-white ${!sidebarOpen && 'justify-center px-3'}`}>
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Dashboard</span>}
          </div>
          
          <Link 
            href="/projects"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors ${!sidebarOpen && 'justify-center px-3'}`}
          >
            <FolderOpen className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">My Projects</span>}
          </Link>

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
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.email?.split('@')[0]}!</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Role</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                userRole === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {userRole === 'admin' ? '👑 Admin' : '👤 Client'}
              </span>
            </div>
          </div>
        </div>

        <div className="px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Active
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{solutions.filter(s => s.has_access).length}</h3>
              <p className="text-sm text-gray-500">Active Solutions</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Total</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{projects.length}</h3>
              <p className="text-sm text-gray-500">Total Projects</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">Pending</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{projects.filter(p => p.status === 'pending').length}</h3>
              <p className="text-sm text-gray-500">Pending Approval</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                  {solutions.length > 0 ? `${Math.round((solutions.filter(s => s.has_access).length / solutions.length) * 100)}%` : '0%'}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{solutions.length}</h3>
              <p className="text-sm text-gray-500">Available Solutions</p>
            </motion.div>
          </div>

          {/* Main Grid - Solutions and Recent Activity */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Solutions - Takes 2 columns */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Solutions</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {solutions.filter(s => s.has_access).length} of {solutions.length} unlocked
                      </p>
                    </div>
                    <Link
                      href="/projects"
                      className="text-sm font-semibold text-green-600 hover:text-green-700 flex items-center"
                    >
                      View All
                      <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>

                <div className="p-6">
                  {solutions.length === 0 ? (
                    <div className="text-center py-12">
                      <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No solutions available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {solutions.slice(0, 5).map((solution) => (
                        <div
                          key={solution.id}
                          onClick={() => handleSolutionClick(solution)}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                            solution.has_access
                              ? 'border-gray-100 hover:border-green-200 hover:bg-green-50/50 cursor-pointer'
                              : 'border-gray-100 bg-gray-50/50 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                              style={{
                                background: solution.has_access
                                  ? `linear-gradient(135deg, ${solution.color || '#10b981'} 0%, ${solution.color || '#10b981'}dd 100%)`
                                  : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)'
                              }}
                            >
                              {solution.icon ? (
                                <span className="text-white">{solution.icon}</span>
                              ) : (
                                <Sparkles className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{solution.name_he}</h3>
                              <p className="text-xs text-gray-500">{solution.name}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            {solution.has_access ? (
                              <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Unlocked
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full flex items-center">
                                <Lock className="w-3 h-3 mr-1" />
                                Locked
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Recent Projects - Takes 1 column */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Recent Projects</h2>
                      <p className="text-sm text-gray-500 mt-1">Your latest activity</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {projects.length === 0 ? (
                    <div className="text-center py-12">
                      <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 mb-4">No projects yet</p>
                      <Link
                        href="/projects"
                        className="text-sm font-semibold text-green-600 hover:text-green-700"
                      >
                        Create your first project
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projects.slice(0, 5).map((project) => {
                        const solution = solutions.find(s => s.solution_id === project.solution_id);
                        return (
                          <div key={project.id} className="flex items-start space-x-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                              style={{
                                background: solution?.color
                                  ? `linear-gradient(135deg, ${solution.color} 0%, ${solution.color}dd 100%)`
                                  : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)'
                              }}
                            >
                              {solution?.icon || '📁'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {solution?.name_he || project.solution_id}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(project.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
                              project.status === 'approved'
                                ? 'bg-green-50 text-green-600'
                                : project.status === 'pending'
                                ? 'bg-yellow-50 text-yellow-600'
                                : 'bg-red-50 text-red-600'
                            }`}>
                              {project.status}
                            </span>
                          </div>
                        );
                      })}
                      <Link
                        href="/projects"
                        className="block text-center text-sm font-semibold text-green-600 hover:text-green-700 pt-2"
                      >
                        View all projects →
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
