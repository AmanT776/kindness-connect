import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ComplaintsProvider } from "@/contexts/ComplaintsContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SubmitComplaint from "./pages/SubmitComplaint";
import TrackComplaint from "./pages/TrackComplaint";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminRoles from "./pages/AdminRoles";
import AdminCategories from "./pages/AdminCategories";
import AdminOrganizationalUnits from "./pages/AdminOrganizationalUnits";
import AdminUnitTypes from "./pages/AdminUnitTypes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ComplaintsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner richColors position="top-right" />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/submit" element={<SubmitComplaint />} />
              <Route path="/track" element={<TrackComplaint />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['student', 'staff', 'admin']}>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff"
                element={
                  <ProtectedRoute allowedRoles={['staff']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/user"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/roles"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminRoles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/category"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminCategories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/organizational-unit"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminOrganizationalUnits />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/organizational-unit-type"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUnitTypes />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ComplaintsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
