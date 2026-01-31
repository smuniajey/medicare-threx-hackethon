import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import QRCodeDisplay from '@/components/qr/QRCodeDisplay';
import { UserPlus, Search, QrCode, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const WorkersList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: workers, isLoading } = useQuery({
    queryKey: ['workers', search],
    queryFn: async () => {
      let query = supabase
        .from('workers')
        .select(`
          *,
          medical_visits (count)
        `)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,worker_id.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (workerId: string) => {
      const { error } = await supabase.from('workers').delete().eq('id', workerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      toast.success('Worker deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete worker');
    },
  });

  const handleViewQR = (worker: any) => {
    setSelectedWorker(worker);
    setShowQRDialog(true);
  };

  const handleDelete = (worker: any) => {
    if (window.confirm(`Are you sure you want to delete ${worker.full_name}?`)) {
      deleteMutation.mutate(worker.id);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Workers"
        description="Manage registered migrant workers"
        action={
          <Link to="/admin/register-worker">
            <Button variant="healthcare">
              <UserPlus className="w-4 h-4 mr-2" />
              Register Worker
            </Button>
          </Link>
        }
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name or worker ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>
      </div>

      {/* Workers Table */}
      <div className="healthcare-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : workers && workers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="healthcare-table">
              <thead>
                <tr>
                  <th>Worker ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Visits</th>
                  <th>Registered</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker: any) => (
                  <tr key={worker.id}>
                    <td>
                      <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                        {worker.worker_id}
                      </span>
                    </td>
                    <td className="font-medium">{worker.full_name}</td>
                    <td>{worker.age}</td>
                    <td className="capitalize">{worker.gender}</td>
                    <td>
                      <span className="medical-badge medical-badge-primary">
                        {worker.medical_visits?.[0]?.count || 0} visits
                      </span>
                    </td>
                    <td>{new Date(worker.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewQR(worker)}
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(worker)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">No workers registered yet</p>
            <Link to="/admin/register-worker">
              <Button variant="healthcare">
                <UserPlus className="w-4 h-4 mr-2" />
                Register First Worker
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Worker QR Code</DialogTitle>
          </DialogHeader>
          {selectedWorker && (
            <div className="flex flex-col items-center py-6">
              <h3 className="text-lg font-semibold mb-2">{selectedWorker.full_name}</h3>
              <QRCodeDisplay
                workerId={selectedWorker.worker_id}
                workerName={selectedWorker.full_name}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default WorkersList;
