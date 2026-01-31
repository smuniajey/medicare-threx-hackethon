import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatsCard from '@/components/shared/StatsCard';
import { Users, Stethoscope, Activity, Calendar } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [workersRes, doctorsRes, visitsRes] = await Promise.all([
        supabase.from('workers').select('id', { count: 'exact' }),
        supabase.rpc('get_doctors_list' as never),
        supabase.from('medical_visits').select('id', { count: 'exact' }),
      ]);

      const doctorsList = (doctorsRes.data as { id: string }[]) || [];

      return {
        workers: workersRes.count || 0,
        doctors: doctorsList.length,
        visits: visitsRes.count || 0,
      };
    },
  });

  const { data: recentVisits } = useQuery({
    queryKey: ['recent-visits'],
    queryFn: async () => {
      const { data } = await supabase
        .from('medical_visits')
        .select(`
          id,
          visit_date,
          symptoms,
          diagnosis,
          workers (full_name, worker_id)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  return (
    <DashboardLayout>
      <PageHeader
        title="Admin Dashboard"
        description="Overview of your healthcare system"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Workers"
          value={isLoading ? '...' : stats?.workers || 0}
          icon={Users}
          description="Registered in system"
        />
        <StatsCard
          title="Active Doctors"
          value={isLoading ? '...' : stats?.doctors || 0}
          icon={Stethoscope}
          description="Healthcare providers"
        />
        <StatsCard
          title="Medical Visits"
          value={isLoading ? '...' : stats?.visits || 0}
          icon={Activity}
          description="Total consultations"
        />
        <StatsCard
          title="This Month"
          value={new Date().toLocaleString('default', { month: 'short' })}
          icon={Calendar}
          description={new Date().getFullYear().toString()}
        />
      </div>

      {/* Recent Activity */}
      <div className="healthcare-card">
        <h2 className="text-xl font-display font-semibold text-foreground mb-6">
          Recent Medical Visits
        </h2>
        
        {recentVisits && recentVisits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="healthcare-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Worker ID</th>
                  <th>Date</th>
                  <th>Symptoms</th>
                  <th>Diagnosis</th>
                </tr>
              </thead>
              <tbody>
                {recentVisits.map((visit: any) => (
                  <tr key={visit.id}>
                    <td className="font-medium">{visit.workers?.full_name}</td>
                    <td>
                      <span className="font-mono text-sm text-muted-foreground">
                        {visit.workers?.worker_id}
                      </span>
                    </td>
                    <td>{new Date(visit.visit_date).toLocaleDateString()}</td>
                    <td className="max-w-xs truncate">{visit.symptoms}</td>
                    <td>
                      <span className="medical-badge medical-badge-primary">
                        {visit.diagnosis}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No medical visits recorded yet</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
