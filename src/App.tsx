import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
import AdManagement from "./pages/admin/AdManagement";
import ServicesManagement from "./pages/admin/ServicesManagement";
import ProspectsManagement from "./pages/admin/ProspectsManagement";
import InspectsManagement from "./pages/admin/InspectsManagement";
import PerspectsManagement from "./pages/admin/PerspectsManagement";
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
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Auth />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Navigate to="/lists" replace />} />
              <Route path="/people" element={
                <ProtectedRoute requiredSection="prospects">
                  <PeopleIntelligence />
                </ProtectedRoute>
              } />
              <Route path="/prospects/for-sales" element={
                <ProtectedRoute requiredSection="prospects" requiredSubsection="for_sales">
                  <ProspectsForSales />
                </ProtectedRoute>
              } />
              <Route path="/prospects/for-hiring" element={
                <ProtectedRoute requiredSection="prospects" requiredSubsection="for_hiring">
                  <ProspectsForHiring />
                </ProtectedRoute>
              } />
              <Route path="/prospects/for-growth" element={
                <ProtectedRoute requiredSection="prospects" requiredSubsection="for_growth">
                  <ProspectsForGrowth />
                </ProtectedRoute>
              } />
              <Route path="/inspects" element={
                <ProtectedRoute requiredSection="inspects">
                  <CompanyIntelligence />
                </ProtectedRoute>
              } />
              <Route path="/perspects" element={
                <ProtectedRoute requiredSection="perspects">
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
              <Route path="/admin/services" element={
                <ProtectedRoute requireAdmin>
                  <ServicesManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/prospects" element={
                <ProtectedRoute requireAdmin>
                  <ProspectsManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/ads" element={
                <ProtectedRoute requireAdmin>
                  <AdManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/inspects" element={
                <ProtectedRoute requireAdmin>
                  <InspectsManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/perspects" element={
                <ProtectedRoute requireAdmin>
                  <PerspectsManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/*" element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
