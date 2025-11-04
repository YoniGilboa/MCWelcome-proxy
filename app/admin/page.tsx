'use client';

// Prevent static generation - this page needs runtime data
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, Package, Loader2, Shield, Home, Bell, Menu, X, LogOut,
  Activity, UserPlus, Zap, ArrowUpRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSolutions: number;
  pendingApprovals: number;
  usersGrowth: number;
  solutionsGrowth: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalSolutions: 0,
    pendingApprovals: 0,
    usersGrowth: 0,
    solutionsGrowth: 0,
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        router.push('/auth/signin');
        return;
      }
      
      // Check if user is admin
      const userRole = session.user.user_metadata?.role || 'client';
      if (userRole !== 'admin') {
        router.push('/solutions');
        return;
      }
      
      await fetchDashboardStats();
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

  const fetchDashboardStats = async () => {
    try {
      // Fetch total users from auth.users
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch solutions
      const { data: solutions } = await supabase
        .from('solutions')
        .select('*')
        .eq('is_active', true);

      // Fetch user solutions
      const { data: userSolutions } = await supabase
        .from('user_solutions')
        .select('*');

      // Calculate active users (users with at least one approved solution)
      const activeUserIds = new Set(
        userSolutions?.filter((us: any) => us.status === 'approved').map((us: any) => us.user_id) || []
      );

      // Count pending approvals
      const pendingCount = userSolutions?.filter((us: any) => us.status === 'pending').length || 0;

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUserIds.size,
        totalSolutions: solutions?.length || 0,
        pendingApprovals: pendingCount,
        usersGrowth: 12.5, // Mock data - calculate from actual data later
        solutionsGrowth: 8.3,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

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
        {/* Logo */}
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

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-green-50 text-green-600 ${!sidebarOpen && 'justify-center'}`}>
            <Home className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Dashboard</span>}
          </div>
          
          <Link href="/admin/users" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${!sidebarOpen && 'justify-center'}`}>
            <Users className="w-5 h-5" />
            {sidebarOpen && <span>Users</span>}
          </Link>
          
          <Link href="/admin/solutions" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${!sidebarOpen && 'justify-center'}`}>
            <Package className="w-5 h-5" />
            {sidebarOpen && <span>Solutions</span>}
          </Link>
        </nav>

        {/* User Profile */}
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
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.email?.split('@')[0]}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              {stats.pendingApprovals > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center text-xs font-medium text-green-600">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  {stats.usersGrowth}%
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalUsers}</h3>
              <p className="text-sm text-gray-600">Total Users</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex items-center text-xs font-medium text-green-600">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  {stats.usersGrowth}%
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.activeUsers}</h3>
              <p className="text-sm text-gray-600">Active Users</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex items-center text-xs font-medium text-green-600">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  {stats.solutionsGrowth}%
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalSolutions}</h3>
              <p className="text-sm text-gray-600">Total Solutions</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                {stats.pendingApprovals > 0 ? (
                  <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full">
                    Needs Attention
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-semibold rounded-full">
                    All Clear
                  </span>
                )}
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.pendingApprovals}</h3>
              <p className="text-sm text-gray-600">Pending Approvals</p>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/admin/users?action=add"
                  className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <UserPlus className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Add New User</p>
                      <p className="text-xs text-gray-500">Create a new user account</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </Link>

                <Link
                  href="/admin/solutions?action=add"
                  className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <Package className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Add New Solution</p>
                      <p className="text-xs text-gray-500">Create a new business solution</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </Link>

                <Link
                  href="/admin/users"
                  className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Manage Users</p>
                      <p className="text-xs text-gray-500">View and manage all users</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4">System Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">User Activation Rate</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Solutions Active</span>
                  <span className="text-sm font-semibold text-gray-900">{stats.totalSolutions}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Pending Requests</span>
                  <span className="text-sm font-semibold text-gray-900">{stats.pendingApprovals}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Platform Status</span>
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                    Operational
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              <Link href="/admin/users" className="text-sm text-green-600 hover:text-green-700 font-medium">
                View All
              </Link>
            </div>
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No recent activity to display</p>
              <p className="text-gray-400 text-xs mt-1">Activity will appear here as users interact with the platform</p>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
