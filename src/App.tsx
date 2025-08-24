import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AnalyticsProvider } from "@/hooks/useAnalytics"; // Import AnalyticsProvider
import Header from "./components/Header";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CreateListing from "./pages/CreateListing";
import NotFound from "./pages/NotFound";
import CompleteProfile from "./pages/CompleteProfile";
import Profile from "./pages/Profile";
import Logout from "./pages/Logout";
import ChatPage from "./pages/ChatPage";
import LoginWall from "./components/LoginWall";
import MigrationPage from "./pages/MigrationPage"; // Import the new page

const queryClient = new QueryClient();

const MainLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-1 container px-0 py-8">
      <Outlet />
    </main>
  </div>
);

const ChatLayout = () => (
  <div className="flex flex-col h-screen">
    <Header />
    <main className="flex-1 overflow-y-auto">
      <Outlet />
    </main>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AnalyticsProvider> {/* Add AnalyticsProvider here */}
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route element={<MainLayout />}>
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/sell" element={<LoginWall><CreateListing /></LoginWall>} />
                <Route path="/sell/:productId" element={<LoginWall><CreateListing /></LoginWall>} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              <Route element={<ChatLayout />}>
                <Route path="/chat" element={<ChatPage />} />
              </Route>

              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />
              <Route path="/logout" element={<Logout />} />

              {/* Conditionally render the migration route only in development */}
              {import.meta.env.DEV && (
                <Route path="/migrate" element={<MigrationPage />} />
              )}

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AnalyticsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
