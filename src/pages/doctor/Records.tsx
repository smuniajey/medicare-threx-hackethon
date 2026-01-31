import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Input } from '@/components/ui/input';
import { Search, Activity, Calendar, User } from 'lucide-react';

const Records: React.FC = () => {
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  const { data: visits, isLoading } = useQuery({
    queryKey: ['my-visits', user?.id, search],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('medical_visits')
        .select(`
          *,
          workers (full_name, worker_id, age, gender)
        `)
        .eq('doctor_id', user.id)
        .order('visit_date', { ascending: false });

      if (search) {
        // We need to search in related workers table
        const { data: workers } = await supabase
          .from('workers')
          .select('id')
          .or(`full_name.ilike.%${search}%,worker_id.ilike.%${search}%`);

        if (workers && workers.length > 0) {
          const workerIds = workers.map((w: any) => w.id);
          query = query.in('worker_id', workerIds);
        } else {
          query = query.ilike('diagnosis', `%${search}%`);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <DashboardLayout>
      <PageHeader
        title="My Medical Records"
        description="View all your recorded medical visits"
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by patient name, ID, or diagnosis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>
      </div>

      {/* Records */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : visits && visits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visits.map((visit: any) => (
            <div key={visit.id} className="healthcare-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {visit.workers?.full_name}
                    </h3>
                    <p className="text-sm font-mono text-muted-foreground">
                      {visit.workers?.worker_id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {new Date(visit.visit_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="medical-badge medical-badge-primary mb-2 inline-block">
                    {visit.diagnosis}
                  </span>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    Symptoms
                  </span>
                  <p className="text-sm text-foreground mt-1">{visit.symptoms}</p>
                </div>
                {visit.notes && (
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      Notes
                    </span>
                    <p className="text-sm text-foreground mt-1">{visit.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {visit.workers?.age} years • {visit.workers?.gender}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="healthcare-card text-center py-12">
          <Activity className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            {search ? 'No records matching your search' : 'No medical records yet'}
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Records;
