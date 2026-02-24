import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import PeopleIntelligence from "./pages/PeopleIntelligence";
import CompanyIntelligence from "./pages/CompanyIntelligence";
import Perspects from "./pages/Perspects";
import Lists from "./pages/Lists";
import ProspectsForSales from "./pages/ProspectsForSales";
import ProspectsForHiring from "./pages/ProspectsForHiring";
import ProspectsForGrowth from "./pages/ProspectsForGrowth";
import CaseStudies from "./pages/CaseStudies";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersManagement from "./pages/admin/UsersManagement";
import DataManagement from "./pages/admin/DataManagement";
import AdManagement from "./pages/admin/AdManagement";
import ServicesManagement from "./pages/admin/ServicesManagement";
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Navigate to="/people" replace />} />
            <Route path="/people" element={
              <ProtectedRoute>
                <PeopleIntelligence />
              </ProtectedRoute>
            } />
            <Route path="/prospects/for-sales" element={
              <ProtectedRoute>
                <ProspectsForSales />
              </ProtectedRoute>
            } />
            <Route path="/prospects/for-hiring" element={
              <ProtectedRoute>
                <ProspectsForHiring />
              </ProtectedRoute>
            } />
            <Route path="/prospects/for-growth" element={
              <ProtectedRoute>
                <ProspectsForGrowth />
              </ProtectedRoute>
            } />
            <Route path="/inspects" element={
              <ProtectedRoute>
                <CompanyIntelligence />
              </ProtectedRoute>
            } />
            <Route path="/perspects" element={
              <ProtectedRoute>
                <Perspects />
              </ProtectedRoute>
            } />
            <Route path="/lists" element={
              <ProtectedRoute>
                <Lists />
              </ProtectedRoute>
            } />
            <Route path="/case-studies" element={
              <ProtectedRoute>
                <CaseStudies />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/services" element={
              <ProtectedRoute>
                <Services />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requireAdmin>
                <UsersManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/data" element={
              <ProtectedRoute requireAdmin>
                <DataManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/services" element={
              <ProtectedRoute requireAdmin>
                <ServicesManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/ads" element={
              <ProtectedRoute requireAdmin>
                <AdManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/*" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
