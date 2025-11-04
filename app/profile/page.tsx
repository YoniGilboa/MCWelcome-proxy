// Prevent static generation - this page needs runtime data
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, Loader2, LogOut, UserCircle, 
  Menu, X, Shield, Mail, Calendar, 
  Key, Save, ArrowLeft, FolderOpen, Plus, User, Phone, Building, Edit2,
  Check, Camera, Bell, Globe, Lock as LockIcon
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'client'>('client');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  
  // User profile states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [company, setCompany] = useState('');
  
  // Password change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
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
      
      // Fetch user profile data
      await fetchUserProfile(session.user.id);
      
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

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('full_name, phone_number, company')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setFullName(data.full_name || '');
        setPhoneNumber(data.phone_number || '');
        setCompany(data.company || '');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          phone_number: phoneNumber,
          company: company,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditingProfile(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update password' });
    } finally {
      setSaving(false);
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

          <Link 
            href="/dashboard"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors ${!sidebarOpen && 'justify-center px-3'}`}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Dashboard</span>}
          </Link>
          
          <Link 
            href="/projects"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors ${!sidebarOpen && 'justify-center px-3'}`}
          >
            <FolderOpen className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">My Projects</span>}
          </Link>

          <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl bg-green-500 text-white ${!sidebarOpen && 'justify-center px-3'}`}>
            <UserCircle className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Profile</span>}
          </div>
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
          
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="border-b border-gray-200 bg-white rounded-t-2xl">
              <nav className="flex space-x-8 px-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                    activeTab === 'profile'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Profile Information</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                    activeTab === 'security'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Security</span>
                  </div>
                </button>
              </nav>
            </div>
          </motion.div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Main Profile Form */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                        <p className="text-sm text-gray-500 mt-1">Update your personal details</p>
                      </div>
                      {!isEditingProfile && (
                        <button
                          onClick={() => {
                            setIsEditingProfile(true);
                            setMessage(null);
                          }}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center space-x-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>

                    <div className="p-6">
                      {/* Message Display */}
                      {message && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
                            message.type === 'success' 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {message.type === 'success' ? (
                            <Check className="w-5 h-5 flex-shrink-0" />
                          ) : (
                            <X className="w-5 h-5 flex-shrink-0" />
                          )}
                          <p className="font-medium">{message.text}</p>
                        </motion.div>
                      )}

                      <form onSubmit={handleProfileUpdate} className="space-y-6">
                        {/* Full Name */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            disabled={!isEditingProfile}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-600"
                            placeholder="Enter your full name"
                          />
                        </div>

                        {/* Email (Read Only) */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                          />
                          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>

                        {/* Phone Number */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            disabled={!isEditingProfile}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-600"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>

                        {/* Company */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Company
                          </label>
                          <input
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            disabled={!isEditingProfile}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-600"
                            placeholder="Your company name"
                          />
                        </div>

                        {/* Action Buttons */}
                        {isEditingProfile && (
                          <div className="flex items-center space-x-3 pt-4">
                            <button
                              type="submit"
                              disabled={saving}
                              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                              {saving ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  <span>Saving...</span>
                                </>
                              ) : (
                                <>
                                  <Save className="w-5 h-5" />
                                  <span>Save Changes</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingProfile(false);
                                fetchUserProfile(user!.id);
                                setMessage(null);
                              }}
                              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </form>
                    </div>
                  </div>
                </div>

                {/* Sidebar Info Cards */}
                <div className="space-y-6">
                  {/* Account Status */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Account Status</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Active
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Role</span>
                        <span className="text-sm font-semibold text-gray-900 capitalize">{userRole}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Member Since</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setActiveTab('security')}
                        className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                      >
                        <Key className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Change Password</span>
                      </button>
                      <Link
                        href="/chat"
                        className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Mail className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Contact Support</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-3xl"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                    <p className="text-sm text-gray-500 mt-1">Update your password to keep your account secure</p>
                  </div>

                  <form onSubmit={handlePasswordChange} className="p-6 space-y-6">
                    {/* Message Display */}
                    {message && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl flex items-center space-x-3 ${
                          message.type === 'success' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {message.type === 'success' ? (
                          <Check className="w-5 h-5 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 flex-shrink-0" />
                        )}
                        <p className="font-medium">{message.text}</p>
                      </motion.div>
                    )}

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Enter new password"
                        required
                        minLength={6}
                      />
                      <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Confirm new password"
                        required
                        minLength={6}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={saving || !newPassword || !confirmPassword}
                      className="w-full flex items-center justify-center px-6 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Updating Password...
                        </>
                      ) : (
                        <>
                          <LockIcon className="w-5 h-5 mr-2" />
                          Update Password
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Security Tips */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-3">Security Tips</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Use a strong password with at least 8 characters</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Include uppercase, lowercase, numbers, and special characters</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Don't reuse passwords from other accounts</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Change your password regularly</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
