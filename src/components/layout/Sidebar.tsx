import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  QrCode, 
  FileText, 
  LogOut, 
  Heart,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Sidebar: React.FC = () => {
  const { role, signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/workers', icon: Users, label: 'Workers' },
    { to: '/admin/doctors', icon: Stethoscope, label: 'Doctors' },
    { to: '/admin/register-worker', icon: UserPlus, label: 'Register Worker' },
  ];

  const doctorLinks = [
    { to: '/doctor', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/doctor/scan', icon: QrCode, label: 'Scan QR' },
    { to: '/doctor/records', icon: FileText, label: 'Records' },
  ];

  const links = role === 'admin' ? adminLinks : doctorLinks;

  return (
    <div className="fixed left-0 top-0 h-screen w-64 gradient-sidebar flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary/20 flex items-center justify-center">
            <Heart className="w-6 h-6 text-sidebar-primary" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-sidebar-foreground">MediCare</h1>
            <p className="text-xs text-sidebar-foreground/60">Health Records</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin' || link.to === '/doctor'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              )
            }
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="mb-3 px-4">
          <p className="text-sm font-medium text-sidebar-foreground truncate">
            {user?.email}
          </p>
          <p className="text-xs text-sidebar-foreground/60 capitalize">{role}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
