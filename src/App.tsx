import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { SecurityWrapper } from "@/components/SecurityWrapper";
import { useEffect } from "react";
import { FluidFadeIn } from "@/components/FluidAnimation";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Service worker registration is handled by VitePWA plugin
    // Just handle service worker messages for notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
          // Handle notification click
          window.focus();
          if (event.data.url) {
            window.location.href = event.data.url;
          }
        }
      });
    }
  }, []);

  return (
    <SecurityWrapper>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <FluidFadeIn>
                <Routes>
                  <Route path="/" element={<Index />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </FluidFadeIn>
            </BrowserRouter>
            <PWAInstallPrompt />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SecurityWrapper>
  );
};

export default App;
