import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import QRScanner from '@/components/qr/QRScanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User, Calendar, Activity, Plus, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const ScanQR: React.FC = () => {
  const [scannedWorkerId, setScannedWorkerId] = useState<string | null>(null);
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [visitForm, setVisitForm] = useState({
    symptoms: '',
    diagnosis: '',
    notes: '',
    visit_date: new Date().toISOString().split('T')[0],
  });
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch worker details
  const { data: worker, isLoading: workerLoading, error: workerError } = useQuery({
    queryKey: ['worker', scannedWorkerId],
    queryFn: async () => {
      if (!scannedWorkerId) return null;
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('worker_id', scannedWorkerId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!scannedWorkerId,
  });

  // Fetch medical history
  const { data: medicalHistory } = useQuery({
    queryKey: ['medical-history', worker?.id],
    queryFn: async () => {
      if (!worker) return [];
      const { data, error } = await supabase
        .from('medical_visits')
        .select('*')
        .eq('worker_id', worker.id)
        .order('visit_date', { ascending: false });
      if (error) throw error;
      
      // Fetch doctor names for each visit
      if (data && data.length > 0) {
        const doctorIds = [...new Set(data.map(v => v.doctor_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', doctorIds);
        
        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
        
        return data.map(visit => ({
          ...visit,
          doctor_name: profileMap.get(visit.doctor_id) || 'Unknown'
        }));
      }
      
      return data;
    },
    enabled: !!worker,
  });

  // Add visit mutation
  const addVisitMutation = useMutation({
    mutationFn: async (visitData: typeof visitForm & { worker_id: string; doctor_id: string }) => {
      const { error } = await supabase.from('medical_visits').insert(visitData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-history', worker?.id] });
      toast.success('Medical visit recorded successfully!');
      setShowAddVisit(false);
      setVisitForm({
        symptoms: '',
        diagnosis: '',
        notes: '',
        visit_date: new Date().toISOString().split('T')[0],
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record visit');
    },
  });

  const handleScan = (workerId: string) => {
    setScannedWorkerId(workerId);
  };

  const handleAddVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!worker || !user) return;

    addVisitMutation.mutate({
      ...visitForm,
      worker_id: worker.id,
      doctor_id: user.id,
    });
  };

  const handleReset = () => {
    setScannedWorkerId(null);
    setShowAddVisit(false);
  };

  // Show scanner if no worker scanned
  if (!scannedWorkerId) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Scan Worker QR"
          description="Scan a worker's QR code to view or update their medical records"
        />
        <div className="max-w-2xl mx-auto">
          <div className="healthcare-card">
            <QRScanner onScan={handleScan} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show worker not found
  if (workerError) {
    return (
      <DashboardLayout>
        <PageHeader title="Scan Worker QR" />
        <div className="max-w-2xl mx-auto">
          <div className="healthcare-card text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Worker Not Found</h2>
            <p className="text-muted-foreground mb-6">
              No worker found with ID: <span className="font-mono">{scannedWorkerId}</span>
            </p>
            <Button variant="outline" onClick={handleReset}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Scan Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Worker Medical Record"
        action={
          <Button variant="outline" onClick={handleReset}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Scan New QR
          </Button>
        }
      />

      {workerLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : worker ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Worker Profile Card */}
          <div className="healthcare-card">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">{worker.full_name}</h2>
              <p className="text-sm font-mono text-muted-foreground bg-muted px-3 py-1 rounded-lg mt-2">
                {worker.worker_id}
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-border space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age</span>
                <span className="font-medium">{worker.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gender</span>
                <span className="font-medium capitalize">{worker.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registered</span>
                <span className="font-medium">
                  {new Date(worker.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Visits</span>
                <span className="medical-badge medical-badge-primary">
                  {medicalHistory?.length || 0}
                </span>
              </div>
            </div>

            <Button
              className="w-full mt-6"
              variant="healthcare"
              onClick={() => setShowAddVisit(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Medical Visit
            </Button>
          </div>

          {/* Medical History */}
          <div className="lg:col-span-2">
            <div className="healthcare-card">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Medical History
              </h3>

              {medicalHistory && medicalHistory.length > 0 ? (
                <div className="space-y-4">
                  {medicalHistory.map((visit: any) => (
                    <div
                      key={visit.id}
                      className="p-4 rounded-xl bg-muted/50 border border-border"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {new Date(visit.visit_date).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="medical-badge medical-badge-success">
                          <CheckCircle className="w-3 h-3" />
                          {visit.diagnosis}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs uppercase tracking-wider text-muted-foreground">
                            Symptoms
                          </span>
                          <p className="text-sm text-foreground">{visit.symptoms}</p>
                        </div>
                        {visit.notes && (
                          <div>
                            <span className="text-xs uppercase tracking-wider text-muted-foreground">
                              Notes
                            </span>
                            <p className="text-sm text-foreground">{visit.notes}</p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          By Dr. {visit.doctor_name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">No medical history recorded</p>
                  <Button variant="healthcare" onClick={() => setShowAddVisit(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Record First Visit
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Add Visit Dialog */}
      <Dialog open={showAddVisit} onOpenChange={setShowAddVisit}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Medical Visit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddVisit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="visit_date">Visit Date</Label>
              <Input
                id="visit_date"
                type="date"
                value={visitForm.visit_date}
                onChange={(e) => setVisitForm({ ...visitForm, visit_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symptoms">Symptoms</Label>
              <Textarea
                id="symptoms"
                placeholder="Describe the patient's symptoms..."
                value={visitForm.symptoms}
                onChange={(e) => setVisitForm({ ...visitForm, symptoms: e.target.value })}
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Input
                id="diagnosis"
                placeholder="Enter diagnosis"
                value={visitForm.diagnosis}
                onChange={(e) => setVisitForm({ ...visitForm, diagnosis: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes or prescriptions..."
                value={visitForm.notes}
                onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                rows={2}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddVisit(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="healthcare"
                className="flex-1"
                disabled={addVisitMutation.isPending}
              >
                {addVisitMutation.isPending ? 'Saving...' : 'Save Visit'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ScanQR;
