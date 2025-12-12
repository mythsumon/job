import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { BottomNavigation } from "@/components/mobile/bottom-navigation";
import Home from "@/pages/home";
import Jobs from "@/pages/jobs";
import JobDetail from "@/pages/job-detail";
import Companies from "@/pages/companies";
import CompanyDetail from "@/pages/company-detail";
import Career from "@/pages/career";
import Feed from "@/pages/feed";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Chat from "@/pages/chat";
import UserChat from "@/pages/user/chat";
import UserProfile from "@/pages/user/profile";
import UserSettings from "@/pages/user/settings";
import UserResumes from "@/pages/user/resumes";
import UserApplications from "@/pages/user/applications";
import SavedJobs from "@/pages/user/saved-jobs";
import UserNotifications from "@/pages/user/notifications";
import UserHome from "@/pages/user/home";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { AuthGuard } from "@/components/common/AuthGuard";
import { RoleGuard } from "@/components/common/RoleGuard";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminCompanies from "@/pages/admin/companies";
import AdminRoles from "@/pages/admin/roles";
import AdminMonitoring from "@/pages/admin/monitoring";
import AdminSettlements from "@/pages/admin/settlements";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminSettings from "@/pages/admin/settings";
import AdminBanners from "@/pages/admin/banners";
import AdminJobOptions from "@/pages/admin/job-options";
import AdminChat from "@/pages/admin/chat";
import AdminCommunity from "@/pages/admin/community";
import AdminCompanyDetail from "@/pages/admin/company-detail";
import AdminPreferredIndustries from "@/pages/admin/preferred-industries";
import AdminCareer from "@/pages/admin/career";
import AdminJobs from "@/pages/admin/jobs";
import AdminSkills from "@/pages/admin/skills";
import AdminReports from "@/pages/admin/reports";

import CompanyDashboard from "@/pages/company/dashboard";
import CompanyApplications from "@/pages/company/applications";
import CompanyPipeline from "@/pages/company/pipeline";
import CompanyJobs from "@/pages/company/jobs";
import CompanyInterviews from "@/pages/company/interviews";
import CompanyRecommendations from "@/pages/company/recommendations";
import CompanyAnalytics from "@/pages/company/analytics";
import CompanyBranding from "@/pages/company/branding";
import CompanySettings from "@/pages/company/settings";
import CompanyEmployees from "@/pages/company/employees";
import CompanyTalents from "@/pages/company/talents";
import CompanyChat from "@/pages/company/chat";
import CompanyProfile from "@/pages/company/profile";
import CompanyInfo from "@/pages/company/info";
import CompanyNotifications from "@/pages/company/notifications";
import Pricing from "@/pages/pricing";
import NotFound from "@/pages/not-found";

// Scroll restoration component
function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

// Clean up old mock tokens on app initialization
function AppInitializer() {
  useEffect(() => {
    // Remove old auto-generated mock tokens that were created before the fix
    const token = localStorage.getItem('auth_token');
    if (token === 'mock-token-123') {
      // This is an old auto-generated token, check if user actually logged in
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          // Only keep if it's from a real login (not auto-generated)
          // Since we can't distinguish, we'll clear it to be safe
          // User will need to log in again if they want
          console.log('[APP] Clearing old auto-generated mock token');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        } catch (e) {
          // Invalid user data, clear everything
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
      }
    }
  }, []);

  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <AppInitializer />
      <Switch>
        {/* Landing/Public Routes - Anyone can access */}
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/pricing" component={Pricing} />
        
        {/* User Routes - All users can access (both logged in and guests) */}
        <Route path="/user" component={() => { window.location.href = "/user/home"; return null; }} />
        <Route path="/user/home" component={() => 
          <RoleGuard allowedUserTypes={['candidate']}>
            <ProtectedPage><UserHome /></ProtectedPage>
          </RoleGuard>
        } />
        <Route path="/user/jobs" component={Jobs} />
        <Route path="/user/jobs/:id" component={JobDetail} />
        <Route path="/user/companies" component={Companies} />
        <Route path="/user/companies/:id" component={CompanyDetail} />
        <Route path="/user/career" component={Career} />
        <Route path="/user/feed" component={Feed} />
        
        {/* Protected User Routes - Only authenticated users can access */}
        <Route path="/user/chat" component={() => 
          <RoleGuard allowedUserTypes={['candidate', 'employer', 'admin']}>
            <UserChat />
          </RoleGuard>
        } />
        <Route path="/user/profile" component={() => 
          <RoleGuard allowedUserTypes={['candidate', 'employer', 'admin']}>
            <ProtectedPage><UserProfile /></ProtectedPage>
          </RoleGuard>
        } />
        <Route path="/user/settings" component={() => 
          <RoleGuard allowedUserTypes={['candidate', 'employer', 'admin']}>
            <ProtectedPage><UserSettings /></ProtectedPage>
          </RoleGuard>
        } />
        <Route path="/user/resumes" component={() => 
          <RoleGuard allowedUserTypes={['candidate']}>
            <ProtectedPage><UserResumes /></ProtectedPage>
          </RoleGuard>
        } />
        <Route path="/user/applications" component={() => 
          <RoleGuard allowedUserTypes={['candidate']}>
            <ProtectedPage><UserApplications /></ProtectedPage>
          </RoleGuard>
        } />
        <Route path="/user/saved-jobs" component={() => 
          <RoleGuard allowedUserTypes={['candidate']}>
            <ProtectedPage><SavedJobs /></ProtectedPage>
          </RoleGuard>
        } />
        <Route path="/user/notifications" component={() => 
          <RoleGuard allowedUserTypes={['candidate', 'employer', 'admin']}>
            <ProtectedPage><UserNotifications /></ProtectedPage>
          </RoleGuard>
        } />
        
        {/* Company Routes - Only employers can access */}
        <Route path="/company" component={() => { window.location.href = "/company/dashboard"; return null; }} />
        <Route path="/company/dashboard" component={() => 
          <RoleGuard allowedUserTypes={['employer']}>
            <ProtectedPage><CompanyDashboard /></ProtectedPage>
          </RoleGuard>
        } />
        <Route path="/company/jobs" component={() => 
          <RoleGuard allowedUserTypes={['employer']}>
            <ProtectedPage><CompanyJobs /></ProtectedPage>
          </RoleGuard>
        } />
        <Route path="/company/applications" component={() => 
          <RoleGuard allowedUserTypes={['employer']}>
            <ProtectedPage><CompanyApplications /></ProtectedPage>
          </RoleGuard>
        } />
        <Route path="/company/pipeline" component={() => 
          <RoleGuard allowedUserTypes={['employer']}>
            <ProtectedPage><CompanyPipeline /></ProtectedPage>
          </RoleGuard>
        } />
        <Route path="/company/interviews" component={() => 
          <RoleGuard allowedUserTypes={['employer']}>
            <ProtectedPage><CompanyInterviews /></ProtectedPage>
          </RoleGuard>
        } />
        <Route path="/company/recommendations" component={() => 
          <RoleGuard allowedUserTypes={['employer']}>
            <ProtectedPage><CompanyRecommendations /></ProtectedPage>
          </RoleGuard>
        } />
        <Route path="/company/analytics" component={() => 
          <RoleGuard allowedUserTypes={['employer']}>
            <ProtectedPage><CompanyAnalytics /></ProtectedPage>
          </RoleGuard>
        } />
        <Route path="/company/employees" component={() => 
          <RoleGuard allowedUserTypes={['employer']}>
            <ProtectedPage><CompanyEmployees /></ProtectedPage>
          </RoleGuard>
        } />
        <Route path="/company/talents" component={() => 
          <RoleGuard allowedUserTypes={['employer']}>
            <ProtectedPage><CompanyTalents /></ProtectedPage>
          </RoleGuard>
        } />
        <Route path="/company/chat" component={() => 
          <RoleGuard allowedUserTypes={['employer']}>
            <ProtectedPage><CompanyChat /></ProtectedPage>
          </RoleGuard>
        } />
        <Route path="/company/branding" component={() => 
          <RoleGuard allowedUserTypes={['employer']}>
            <ProtectedPage><CompanyBranding /></ProtectedPage>
          </RoleGuard>
        } />
        <Route path="/company/settings" component={() => 
          <RoleGuard allowedUserTypes={['employer']}>
            <ProtectedPage><CompanySettings /></ProtectedPage>
          </RoleGuard>
        } />
        <Route path="/company/profile" component={() => {
          window.location.href = "/company/info";
          return null;
        }} />
        <Route path="/company/info" component={() => 
          <RoleGuard allowedUserTypes={['employer']}>
            <ProtectedPage><CompanyInfo /></ProtectedPage>
          </RoleGuard>
        } />
        <Route path="/company/notifications" component={() => 
          <RoleGuard allowedUserTypes={['employer']}>
            <CompanyNotifications />
          </RoleGuard>
        } />
        
        {/* Admin Routes - Only admins can access */}
        <Route path="/admin" component={() => { window.location.href = "/admin/dashboard"; return null; }} />
        <Route path="/admin/dashboard" component={() => 
          <RoleGuard allowedUserTypes={['admin']}>
            <AdminDashboard />
          </RoleGuard>
        } />
        <Route path="/admin/users" component={() => 
          <RoleGuard allowedUserTypes={['admin']}>
            <AdminUsers />
          </RoleGuard>
        } />
        <Route path="/admin/companies" component={() => 
          <RoleGuard allowedUserTypes={['admin']}>
            <AdminCompanies />
          </RoleGuard>
        } />
        <Route path="/admin/companies/:id" component={() => 
          <RoleGuard allowedUserTypes={['admin']}>
            <AdminCompanyDetail />
          </RoleGuard>
        } />
        <Route path="/admin/jobs" component={() => 
          <RoleGuard allowedUserTypes={['admin']}>
            <AdminJobs />
          </RoleGuard>
        } />
        <Route path="/admin/reports" component={() => 
          <RoleGuard allowedUserTypes={['admin']}>
            <AdminReports />
          </RoleGuard>
        } />
        <Route path="/admin/roles" component={() => 
          <RoleGuard allowedUserTypes={['admin']}>
            <AdminRoles />
          </RoleGuard>
        } />
        <Route path="/admin/monitoring" component={() => 
          <RoleGuard allowedUserTypes={['admin']}>
            <AdminMonitoring />
          </RoleGuard>
        } />
        <Route path="/admin/settlements" component={() => 
          <RoleGuard allowedUserTypes={['admin']}>
            <AdminSettlements />
          </RoleGuard>
        } />
        <Route path="/admin/analytics" component={() => 
          <RoleGuard allowedUserTypes={['admin']}>
            <AdminAnalytics />
          </RoleGuard>
        } />
        <Route path="/admin/settings" component={() => 
          <RoleGuard allowedUserTypes={['admin']}>
            <AdminSettings />
          </RoleGuard>
        } />
        <Route path="/admin/banners" component={() => 
          <RoleGuard allowedUserTypes={['admin']}>
            <AdminBanners />
          </RoleGuard>
        } />
        <Route path="/admin/job-options" component={() => 
          <RoleGuard allowedUserTypes={['admin']}>
            <AdminJobOptions />
          </RoleGuard>
        } />
        <Route path="/admin/preferred-industries" component={() => 
          <RoleGuard allowedUserTypes={['admin']}>
            <AdminPreferredIndustries />
          </RoleGuard>
        } />
        <Route path="/admin/career" component={() => 
          <RoleGuard allowedUserTypes={['admin']}>
            <AdminCareer />
          </RoleGuard>
        } />
        <Route path="/admin/skills" component={() => 
          <RoleGuard allowedUserTypes={['admin']}>
            <AdminSkills />
          </RoleGuard>
        } />
        <Route path="/admin/chat" component={() => 
          <RoleGuard allowedUserTypes={['admin']}>
            <AdminChat />
          </RoleGuard>
        } />
        <Route path="/admin/community" component={() => 
          <RoleGuard allowedUserTypes={['admin']}>
            <AdminCommunity />
          </RoleGuard>
        } />
        
        {/* Legacy redirects for backward compatibility */}
        <Route path="/jobs" component={() => { window.location.href = "/user/jobs"; return null; }} />
        <Route path="/jobs/:id" component={JobDetail} />
        <Route path="/companies" component={() => { window.location.href = "/user/companies"; return null; }} />
        <Route path="/companies/:id" component={CompanyDetail} />
        <Route path="/talent" component={() => { window.location.href = "/company/talents"; return null; }} />
        <Route path="/career" component={() => { window.location.href = "/user/career"; return null; }} />
        <Route path="/feed" component={() => { window.location.href = "/user/feed"; return null; }} />
        <Route path="/chat" component={() => { window.location.href = "/user/chat"; return null; }} />
        <Route path="/employment" component={() => { window.location.href = "/company/employees"; return null; }} />
        
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Router />
      <BottomNavigation />
    </div>
  );
}

export default App;