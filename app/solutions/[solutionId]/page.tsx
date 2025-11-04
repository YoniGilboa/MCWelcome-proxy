// Prevent static generation - this page needs runtime data
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function SolutionPage() {
  const params = useParams();
  const router = useRouter();
  const solutionId = params.solutionId as string;
  
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [solution, setSolution] = useState<any>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push('/auth/signin');
        return;
      }

      setUser(session.user);

      // Fetch solution details
      const { data: solutionData } = await supabase
        .from('solutions')
        .select('*')
        .eq('solution_id', solutionId)
        .single();

      if (solutionData) {
        setSolution(solutionData);
      }

      // Check if user has access
      const { data: userSolution } = await supabase
        .from('user_solutions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('solution_id', solutionId)
        .eq('status', 'approved')
        .single();

      setHasAccess(!!userSolution);
      setLoading(false);
    };

    checkAccess();
  }, [solutionId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/30 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/30 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">
            You don't have access to this solution. Please contact your administrator to request access.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-700 hover:text-green-600 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-12">
          <div className="text-center mb-12">
            {solution && (
              <>
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl"
                  style={{ backgroundColor: `${solution.color}20` }}
                >
                  {solution.icon || '📦'}
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{solution.name_he}</h1>
                <p className="text-xl text-gray-600">{solution.name}</p>
                {solution.description && (
                  <p className="text-gray-500 mt-4 max-w-2xl mx-auto">{solution.description}</p>
                )}
              </>
            )}
          </div>

          <div className="border-t border-gray-200 pt-12">
            <div className="max-w-3xl mx-auto text-center">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon!</h2>
                <p className="text-gray-600 text-lg">
                  The {solution?.name || 'solution'} workspace is currently under development. 
                  We're working hard to bring you an amazing experience.
                </p>
                <div className="mt-6">
                  <div className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-sm">
                    <span className="text-sm font-medium text-gray-700">Expected launch:</span>
                    <span className="text-sm font-bold text-green-600">Coming Soon</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-3xl mb-3">🚀</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Fast & Efficient</h3>
                  <p className="text-sm text-gray-600">Streamlined workflows to boost your productivity</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-3xl mb-3">🤖</div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
                  <p className="text-sm text-gray-600">Advanced AI to automate your tasks</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-3xl mb-3">📊</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
                  <p className="text-sm text-gray-600">Real-time insights and reporting</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
