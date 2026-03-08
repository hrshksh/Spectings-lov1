import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DynamicFavicon } from "@/components/DynamicFavicon";
import { SlugRedirect } from "@/components/SlugRedirect";
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
import LogoManagement from "./pages/admin/LogoManagement";
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
          <DynamicFavicon />
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Auth />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<SlugRedirect to="/lists" />} />

              {/* Legacy non-slug routes → redirect to slug-prefixed */}
              <Route path="/lists" element={<SlugRedirect to="/lists" />} />
              <Route path="/people" element={<SlugRedirect to="/people" />} />
              <Route path="/prospects/for-sales" element={<SlugRedirect to="/prospects/for-sales" />} />
              <Route path="/prospects/for-hiring" element={<SlugRedirect to="/prospects/for-hiring" />} />
              <Route path="/prospects/for-growth" element={<SlugRedirect to="/prospects/for-growth" />} />
              <Route path="/inspects" element={<SlugRedirect to="/inspects" />} />
              <Route path="/perspects" element={<SlugRedirect to="/perspects" />} />
              <Route path="/case-studies" element={<SlugRedirect to="/case-studies" />} />
              <Route path="/settings" element={<SlugRedirect to="/settings" />} />
              <Route path="/services" element={<SlugRedirect to="/services" />} />
              <Route path="/profile" element={<SlugRedirect to="/profile" />} />

              {/* Slug-prefixed user routes */}
              <Route path="/:slug/people" element={
                <ProtectedRoute requiredSection="prospects">
                  <PeopleIntelligence />
                </ProtectedRoute>
              } />
              <Route path="/:slug/prospects/for-sales" element={
                <ProtectedRoute requiredSection="prospects" requiredSubsection="for_sales">
                  <ProspectsForSales />
                </ProtectedRoute>
              } />
              <Route path="/:slug/prospects/for-hiring" element={
                <ProtectedRoute requiredSection="prospects" requiredSubsection="for_hiring">
                  <ProspectsForHiring />
                </ProtectedRoute>
              } />
              <Route path="/:slug/prospects/for-growth" element={
                <ProtectedRoute requiredSection="prospects" requiredSubsection="for_growth">
                  <ProspectsForGrowth />
                </ProtectedRoute>
              } />
              <Route path="/:slug/inspects" element={
                <ProtectedRoute requiredSection="inspects">
                  <CompanyIntelligence />
                </ProtectedRoute>
              } />
              <Route path="/:slug/perspects" element={
                <ProtectedRoute requiredSection="perspects">
                  <Perspects />
                </ProtectedRoute>
              } />
              <Route path="/:slug/lists" element={
                <ProtectedRoute>
                  <Lists />
                </ProtectedRoute>
              } />
              <Route path="/:slug/case-studies" element={
                <ProtectedRoute>
                  <CaseStudies />
                </ProtectedRoute>
              } />
              <Route path="/:slug/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/:slug/services" element={
                <ProtectedRoute>
                  <Services />
                </ProtectedRoute>
              } />
              <Route path="/:slug/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* Admin routes (no slug) */}
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
              <Route path="/admin/logo" element={
                <ProtectedRoute requireAdmin>
                  <LogoManagement />
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
