import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UserPlus, Search, Trash2, Stethoscope, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';

interface Doctor {
  id: string;
  user_id: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

const DoctorsList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors', search],
    queryFn: async (): Promise<Doctor[]> => {
      // Use raw RPC call to get doctors list
      const { data, error } = await supabase.rpc('get_doctors_list' as never);

      if (error) {
        console.error('Error fetching doctors:', error);
        return [];
      }
      
      let result = (data as Doctor[]) || [];
      
      // Apply search filter client-side
      if (search) {
        const searchLower = search.toLowerCase();
        result = result.filter((d) => 
          d.full_name.toLowerCase().includes(searchLower)
        );
      }
      
      return result;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (doctorId: string) => {
      const { error } = await supabase.from('profiles').delete().eq('id', doctorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast.success('Doctor removed successfully');
    },
    onError: () => {
      toast.error('Failed to remove doctor');
    },
  });

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use edge function to create doctor (admin only)
      const { data, error } = await supabase.functions.invoke('create-doctor', {
        body: {
          email: newDoctor.email,
          password: newDoctor.password,
          fullName: newDoctor.fullName,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success('Doctor account created successfully');
      setShowAddDialog(false);
      setNewDoctor({ fullName: '', email: '', password: '' });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create doctor account';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (doctor: Doctor) => {
    if (window.confirm(`Are you sure you want to remove ${doctor.full_name}?`)) {
      deleteMutation.mutate(doctor.id);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Doctors"
        description="Manage healthcare providers"
        action={
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="healthcare">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Doctor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Doctor</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddDoctor} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="Dr. John Smith"
                      value={newDoctor.fullName}
                      onChange={(e) => setNewDoctor({ ...newDoctor, fullName: e.target.value })}
                      className="pl-11"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="doctor@example.com"
                      value={newDoctor.email}
                      onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                      className="pl-11"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={newDoctor.password}
                      onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                      className="pl-11"
                      minLength={6}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" variant="healthcare" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Doctor Account'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search doctors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>
      </div>

      {/* Doctors Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : doctors && doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="healthcare-card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{doctor.full_name}</h3>
                    <p className="text-sm text-muted-foreground">Doctor</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(doctor)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Joined {new Date(doctor.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="healthcare-card text-center py-12">
          <Stethoscope className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-4">No doctors registered yet</p>
          <Button variant="healthcare" onClick={() => setShowAddDialog(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add First Doctor
          </Button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorsList;
