import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Mail, Lock, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingDemo, setCreatingDemo] = useState(false);
  const { signIn, role, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && role) {
      navigate(role === 'admin' ? '/admin' : '/doctor');
    }
  }, [user, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    toast.success('Welcome back!');
    setLoading(false);
  };

  const handleCreateDemoAccounts = async () => {
    setCreatingDemo(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-demo-accounts');

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        toast.success('Demo accounts created! You can now login.');
        setEmail('admin@medicare.demo');
        setPassword('admin123');
      } else {
        setError(data?.message || 'Failed to create demo accounts');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create demo accounts';
      setError(message);
    } finally {
      setCreatingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-white/20 flex items-center justify-center">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-4">
            MediCare
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Digital Health Records for Migrant Workers
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3 text-white/90">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">1</span>
              </div>
              <p>Register workers and generate unique QR codes</p>
            </div>
            <div className="flex items-start gap-3 text-white/90">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">2</span>
              </div>
              <p>Doctors scan QR codes to access health records</p>
            </div>
            <div className="flex items-start gap-3 text-white/90">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">3</span>
              </div>
              <p>Track medical history across healthcare providers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">MediCare</h1>
          </div>

          <div className="healthcare-card">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              Welcome back
            </h2>
            <p className="text-muted-foreground mb-6">
              Sign in to your account to continue
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 input-healthcare"
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 input-healthcare"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                variant="healthcare"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo Account Info */}
            <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-2">Demo Credentials</p>
                  <div className="space-y-1 text-muted-foreground">
                    <p><strong>Admin:</strong> admin@medicare.demo / admin123</p>
                    <p><strong>Doctor:</strong> doctor1@medicare.demo / doctor123</p>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="px-0 h-auto mt-2 text-primary"
                    onClick={handleCreateDemoAccounts}
                    disabled={creatingDemo}
                  >
                    {creatingDemo ? 'Creating...' : 'Click here to create demo accounts'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
