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
import UserProfileViews from "@/pages/user/profile-views";
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
import AdminCommunity from "@/pages/admin/community";
import AdminCompanyDetail from "@/pages/admin/company-detail";
import AdminCareer from "@/pages/admin/career";
import AdminJobs from "@/pages/admin/jobs";
import AdminReports from "@/pages/admin/reports";
import AdminRecruitmentMaster from "@/pages/admin/recruitment-master";

import CompanyDashboard from "@/pages/company/dashboard";
import CompanyApplications from "@/pages/company/applications";
import CompanyPipeline from "@/pages/company/pipeline";
import CompanyJobs from "@/pages/company/jobs";
import CompanyInterviews from "@/pages/company/interviews";
import CompanyRecommendations from "@/pages/company/recommendations";
import CompanyAnalytics from "@/pages/company/analytics";
import CompanySettings from "@/pages/company/settings";
import CompanyEmployees from "@/pages/company/employees";
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
    if (token === 'mock-token-123' || token === 'mock-token-john-doe') {
      // These are old auto-generated tokens, clear them to allow guest access
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          // Clear auto-generated tokens - user must log in properly
          console.log('[APP] Clearing old auto-generated mock token');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        } catch (e) {
          // Invalid user data, clear everything
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
      } else {
        // No user data but token exists, clear token
        localStorage.removeItem('auth_token');
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
        {/* Public routes for guests */}
        <Route path="/career" component={Career} />
        <Route path="/feed" component={Feed} />
        
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
        <Route path="/user/profile-views" component={() => 
          <RoleGuard allowedUserTypes={['candidate']}>
            <ProtectedPage><UserProfileViews /></ProtectedPage>
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
        {/* Redirect /company/talents to /company/recommendations */}
        <Route path="/company/talents" component={() => { window.location.href = "/company/recommendations"; return null; }} />
        <Route path="/company/chat" component={() => 
          <RoleGuard allowedUserTypes={['employer']}>
            <ProtectedPage><CompanyChat /></ProtectedPage>
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
        <Route path="/admin/recruitment-master" component={() => 
          <RoleGuard allowedUserTypes={['admin']}>
            <AdminRecruitmentMaster />
          </RoleGuard>
        } />
        <Route path="/admin/career" component={() => 
          <RoleGuard allowedUserTypes={['admin']}>
            <AdminCareer />
          </RoleGuard>
        } />
        <Route path="/admin/community" component={() => 
          <RoleGuard allowedUserTypes={['admin']}>
            <AdminCommunity />
          </RoleGuard>
        } />
        
        {/* Public job and company routes */}
        <Route path="/jobs" component={Jobs} />
        <Route path="/jobs/:id" component={JobDetail} />
        <Route path="/companies" component={Companies} />
        <Route path="/companies/:id" component={CompanyDetail} />
        <Route path="/talent" component={() => { window.location.href = "/company/talents"; return null; }} />
        {/* Career and Feed routes - already handled above */}
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