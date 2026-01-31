import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import WorkersList from "./pages/admin/WorkersList";
import DoctorsList from "./pages/admin/DoctorsList";
import RegisterWorker from "./pages/admin/RegisterWorker";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import ScanQR from "./pages/doctor/ScanQR";
import Records from "./pages/doctor/Records";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/workers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <WorkersList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/doctors"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DoctorsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/register-worker"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <RegisterWorker />
                </ProtectedRoute>
              }
            />

            {/* Doctor Routes */}
            <Route
              path="/doctor"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/scan"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <ScanQR />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/records"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <Records />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
