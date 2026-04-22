import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import PasswordGate from "./components/PasswordGate";
import Landing from "./pages/Landing";
import PreferencePortal from "./pages/PreferencePortal";
import PreferencePortalCanvas from "./pages/PreferencePortalCanvas";
import MobileSwipe from "./pages/MobileSwipe";
import SquadManagement from "./pages/SquadManagement";
import AdminDashboard from "./pages/AdminDashboard";
import CheckIn from "./pages/CheckIn";
import TicketCheckout from "./pages/TicketCheckout";
import VirtualConcierge from "./pages/VirtualConcierge";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/preferences" component={PreferencePortal} />
      <Route path="/preferences-canvas" component={PreferencePortalCanvas} />
      <Route path="/swipe" component={MobileSwipe} />
      <Route path="/squad" component={SquadManagement} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/checkin" component={CheckIn} />
      <Route path="/checkout" component={TicketCheckout} />
      <Route path="/concierge" component={VirtualConcierge} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                borderRadius: "2px",
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
              },
              classNames: {
                success: "!bg-success !text-success-foreground !border-transparent",
                error: "!bg-destructive !text-destructive-foreground !border-transparent",
                warning: "!bg-warning !text-warning-foreground !border-transparent",
                info: "!bg-info !text-info-foreground !border-transparent",
              },
            }}
          />
          <PasswordGate>
            <Router />
          </PasswordGate>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
