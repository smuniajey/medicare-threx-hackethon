import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import QRCodeDisplay from '@/components/qr/QRCodeDisplay';
import { User, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const RegisterWorker: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [registeredWorker, setRegisteredWorker] = useState<any>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: async (workerData: { full_name: string; age: number; gender: string; created_by: string }) => {
      // Generate worker ID
      const { data: workerIdData, error: idError } = await supabase.rpc('generate_worker_id');
      if (idError) throw idError;

      const { data, error } = await supabase
        .from('workers')
        .insert({
          ...workerData,
          worker_id: workerIdData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setRegisteredWorker(data);
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      toast.success('Worker registered successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to register worker');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    registerMutation.mutate({
      full_name: fullName,
      age: parseInt(age),
      gender,
      created_by: user.id,
    });
  };

  const handleRegisterAnother = () => {
    setRegisteredWorker(null);
    setFullName('');
    setAge('');
    setGender('male');
  };

  if (registeredWorker) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto">
          <div className="healthcare-card text-center animate-scale-in">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              Worker Registered!
            </h2>
            <p className="text-muted-foreground mb-8">
              {registeredWorker.full_name} has been successfully registered
            </p>

            <div className="bg-muted/50 rounded-2xl p-8 mb-8">
              <QRCodeDisplay
                workerId={registeredWorker.worker_id}
                workerName={registeredWorker.full_name}
                size={180}
              />
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={handleRegisterAnother}>
                Register Another
              </Button>
              <Link to="/admin/workers">
                <Button variant="healthcare">View All Workers</Button>
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto">
        <PageHeader
          title="Register Worker"
          description="Add a new migrant worker to the system"
        />

        <div className="healthcare-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="fullName"
                  placeholder="Enter worker's full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="pl-11"
                  min="18"
                  max="100"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Gender</Label>
              <RadioGroup
                value={gender}
                onValueChange={setGender}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className="cursor-pointer">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className="cursor-pointer">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="cursor-pointer">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              variant="healthcare"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Registering...' : 'Register Worker & Generate QR'}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RegisterWorker;
