import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatsCard from '@/components/shared/StatsCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { QrCode, Activity, Users, Clock } from 'lucide-react';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['doctor-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const [myVisitsRes, todayVisitsRes, totalWorkersRes] = await Promise.all([
        supabase
          .from('medical_visits')
          .select('id', { count: 'exact' })
          .eq('doctor_id', user.id),
        supabase
          .from('medical_visits')
          .select('id', { count: 'exact' })
          .eq('doctor_id', user.id)
          .gte('visit_date', new Date().toISOString().split('T')[0]),
        supabase.from('workers').select('id', { count: 'exact' }),
      ]);

      return {
        myVisits: myVisitsRes.count || 0,
        todayVisits: todayVisitsRes.count || 0,
        totalWorkers: totalWorkersRes.count || 0,
      };
    },
    enabled: !!user,
  });

  const { data: recentVisits } = useQuery({
    queryKey: ['doctor-recent-visits', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data } = await supabase
        .from('medical_visits')
        .select(`
          id,
          visit_date,
          symptoms,
          diagnosis,
          workers (full_name, worker_id)
        `)
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      return data || [];
    },
    enabled: !!user,
  });

  return (
    <DashboardLayout>
      <PageHeader
        title="Doctor Dashboard"
        description="Manage patient consultations"
        action={
          <Link to="/doctor/scan">
            <Button variant="healthcare" size="lg">
              <QrCode className="w-5 h-5 mr-2" />
              Scan Worker QR
            </Button>
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="My Consultations"
          value={isLoading ? '...' : stats?.myVisits || 0}
          icon={Activity}
          description="Total visits recorded"
        />
        <StatsCard
          title="Today's Visits"
          value={isLoading ? '...' : stats?.todayVisits || 0}
          icon={Clock}
          description={new Date().toLocaleDateString()}
        />
        <StatsCard
          title="Total Workers"
          value={isLoading ? '...' : stats?.totalWorkers || 0}
          icon={Users}
          description="In system"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link to="/doctor/scan" className="block">
          <div className="healthcare-card hover:border-primary/50 transition-colors cursor-pointer h-full">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
                <QrCode className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Scan QR Code</h3>
                <p className="text-muted-foreground">Scan a worker's QR to view or add medical records</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/doctor/records" className="block">
          <div className="healthcare-card hover:border-primary/50 transition-colors cursor-pointer h-full">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                <Activity className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">View Records</h3>
                <p className="text-muted-foreground">Browse all your medical visit records</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Visits */}
      <div className="healthcare-card">
        <h2 className="text-xl font-display font-semibold text-foreground mb-6">
          My Recent Visits
        </h2>

        {recentVisits && recentVisits.length > 0 ? (
          <div className="space-y-4">
            {recentVisits.map((visit: any) => (
              <div
                key={visit.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{visit.workers?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {visit.symptoms.substring(0, 50)}...
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="medical-badge medical-badge-primary">
                    {visit.diagnosis}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(visit.visit_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">No visits recorded yet</p>
            <Link to="/doctor/scan">
              <Button variant="healthcare">
                <QrCode className="w-4 h-4 mr-2" />
                Start Your First Consultation
              </Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
