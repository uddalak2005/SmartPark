import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Stats from "./pages/Stats";
import CarDetails from "./pages/CarDetails";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import RunningSession from "./pages/RunningSession"
import {APIProvider} from '@vis.gl/react-google-maps';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <APIProvider apiKey={'AIzaSyDfFS0GwdZ-E3pxaYa4CuvUMxgMXDf2g3g'} onLoad={() => console.log('Maps API has loaded.')}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/stats" element={<Stats />} />
          <Route path="/dashboard/car" element={<CarDetails />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/session" element={<RunningSession />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </APIProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
