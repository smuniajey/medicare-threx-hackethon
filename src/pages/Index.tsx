import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Heart, Shield, Stethoscope, QrCode, Activity, Users } from 'lucide-react';

const Index: React.FC = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && role) {
      navigate(role === 'admin' ? '/admin' : '/doctor');
    }
  }, [user, role, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="gradient-primary">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-white">MediCare</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button className="bg-white text-primary hover:bg-white/90">
                Login
              </Button>
            </Link>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
            Digital Health Records
            <br />
            for Migrant Workers
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Secure, portable, and accessible healthcare documentation system.
            Track medical history across providers with a simple QR scan.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/login">
              <Button size="xl" className="bg-white text-primary hover:bg-white/90">
                Login to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A seamless workflow designed for healthcare providers and administrators
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="healthcare-card text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Register Workers</h3>
              <p className="text-muted-foreground">
                Admins register migrant workers and generate unique QR codes for instant identification
              </p>
            </div>

            <div className="healthcare-card text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Scan & Access</h3>
              <p className="text-muted-foreground">
                Doctors scan QR codes to instantly access complete medical history and patient details
              </p>
            </div>

            <div className="healthcare-card text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Record Visits</h3>
              <p className="text-muted-foreground">
                Document symptoms, diagnoses, and treatments to build comprehensive health records
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Built for Healthcare Teams
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="healthcare-card">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Administrator</h3>
                  <p className="text-muted-foreground">System management</p>
                </div>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Register and manage workers
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Create doctor accounts
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Generate and print QR codes
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  View system analytics
                </li>
              </ul>
            </div>

            <div className="healthcare-card">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
                  <Stethoscope className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Doctor</h3>
                  <p className="text-muted-foreground">Healthcare provider</p>
                </div>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Scan worker QR codes
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  View complete medical history
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Record new medical visits
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Track patient consultations
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-primary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Login to access the MediCare healthcare management system.
            Demo accounts available for testing.
          </p>
          <Link to="/login">
            <Button size="xl" className="bg-white text-primary hover:bg-white/90">
              Login Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-foreground">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-background">MediCare</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Digital Health Records for Migrant Workers • Built for Hackathon Demo
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
