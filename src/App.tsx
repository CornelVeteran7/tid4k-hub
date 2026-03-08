import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { GroupProvider } from "@/contexts/GroupContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ExternalLinkProvider } from "@/contexts/ExternalLinkContext";
import { ModuleConfigProvider } from "@/config/moduleConfig";
import { AppLayout } from "@/components/layout/AppLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Documents from "./pages/Documents";
import Messages from "./pages/Messages";
import Announcements from "./pages/Announcements";
import Schedule from "./pages/Schedule";
import ScheduleCancelarie from "./pages/ScheduleCancelarie";
import WeeklyMenu from "./pages/WeeklyMenu";
import Stories from "./pages/Stories";
import Reports from "./pages/Reports";
import AdminPanel from "./pages/AdminPanel";
import SponsorAdmin from "./pages/SponsorAdmin";
import Infodisplay from "./pages/Infodisplay";
import SocialMediaFacebook from "./pages/SocialMediaFacebook";
import SocialMediaWhatsapp from "./pages/SocialMediaWhatsapp";
import ConstructionDashboard from "./pages/ConstructionDashboard";
import ConstructionWorker from "./pages/ConstructionWorker";
import InventoryPage from "./pages/Inventory";
import SSMPage from "./pages/SSM";
import MagazinePage from "./pages/Magazine";
import SurtitlesPage from "./pages/Surtitles";
import VideoGenerationPage from "./pages/VideoGeneration";
import QueueAdmin from "./pages/QueueAdmin";
import QueueTicket from "./pages/QueueTicket";
import Contributions from "./pages/Contributions";
import NotFound from "./pages/NotFound";
import SettingsPage from "./pages/Settings";
import MyProfile from "./pages/MyProfile";
import PublicDisplay from "./pages/PublicDisplay";
import QRCancelarie from "./pages/QRCancelarie";
import SurtitleAudiencePage from "./pages/SurtitleAudience";
import SuperAdmin from "./pages/SuperAdmin";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <GroupProvider>
      <NotificationProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/prezenta" element={<Attendance />} />
            <Route path="/documente" element={<Documents />} />
            <Route path="/mesaje" element={<Messages />} />
            <Route path="/anunturi" element={<Announcements />} />
            <Route path="/orar" element={<Schedule />} />
            <Route path="/orar-cancelarie" element={<ScheduleCancelarie />} />
            <Route path="/meniu" element={<WeeklyMenu />} />
            <Route path="/povesti" element={<Stories />} />
            <Route path="/rapoarte" element={<Reports />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/utilizatori" element={<Navigate to="/admin" replace />} />
            <Route path="/configurari" element={<SettingsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/sponsori" element={<SponsorAdmin />} />
            <Route path="/sponsor-dashboard" element={<Navigate to="/sponsori" replace />} />
            <Route path="/infodisplay" element={<Infodisplay />} />
            <Route path="/social-facebook" element={<SocialMediaFacebook />} />
            <Route path="/social-whatsapp" element={<SocialMediaWhatsapp />} />
            <Route path="/profil" element={<MyProfile />} />
            <Route path="/santiere" element={<ConstructionDashboard />} />
            <Route path="/santiere/worker" element={<ConstructionWorker />} />
            <Route path="/inventar" element={<InventoryPage />} />
            <Route path="/ssm" element={<SSMPage />} />
            <Route path="/revista" element={<MagazinePage />} />
            <Route path="/supratitrare" element={<SurtitlesPage />} />
            <Route path="/video" element={<VideoGenerationPage />} />
            <Route path="/coada" element={<QueueAdmin />} />
            <Route path="/contributii" element={<Contributions />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </NotificationProvider>
    </GroupProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ModuleConfigProvider>
        <ExternalLinkProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<LoginRoute />} />
                <Route path="/login/:orgSlug" element={<LoginRoute />} />
                {/* Public routes — no auth required */}
                <Route path="/display/:orgSlug" element={<PublicDisplay />} />
                <Route path="/qr/:orgSlug" element={<QRCancelarie />} />
                <Route path="/surtitle/:orgSlug" element={<SurtitleAudiencePage />} />
                <Route path="/queue/:orgSlug" element={<QueueTicket />} />
                <Route path="/*" element={<ProtectedRoutes />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </ExternalLinkProvider>
      </ModuleConfigProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

function LoginRoute() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Login />;
}

export default App;
