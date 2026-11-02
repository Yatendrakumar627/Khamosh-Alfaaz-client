import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from './context/SessionContext';
import { routes } from './routes';
import { MainLayout } from './layouts/MainLayout';
import { VisitorLayout } from './layouts/VisitorLayout';
import { SplashScreen } from './components/ui/SplashScreen';

const Welcome = lazy(() => import('./pages/Welcome').then(m => ({ default: m.Welcome || m.default })));
const VisitorHome = lazy(() => import('./pages/VisitorHome').then(m => ({ default: m.VisitorHome || m.default })));
const PublicEntry = lazy(() => import('./pages/PublicEntry').then(m => ({ default: m.PublicEntry || m.default })));
const PublicQuotes = lazy(() => import('./pages/PublicQuotes').then(m => ({ default: m.PublicQuotes || m.default })));
const PublicCategories = lazy(() => import('./pages/PublicCategories').then(m => ({ default: m.PublicCategories || m.default })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About || m.default })));
const Explore = lazy(() => import('./pages/Explore').then(m => ({ default: m.Explore || m.default })));
import { NotFound } from './pages/NotFound';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, sessionChecked } = useSession();

  if (!sessionChecked) return <SplashScreen message="Opening your diary..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, sessionChecked } = useSession();

  if (!sessionChecked) return <SplashScreen message="Opening your diary..." />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return children;
};

// Visitor Mode — only root "/" redirects authenticated writers to their dashboard
const VisitorLandingRoute = () => {
  const { isAuthenticated, sessionChecked } = useSession();

  if (sessionChecked && isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <VisitorHome />;
};

// Explore route: authenticated writers get the internal Explore dashboard; visitors get public Explore feed
const ExploreRoute = () => {
  const { isAuthenticated, sessionChecked } = useSession();

  if (!sessionChecked) {
    return <SplashScreen message="Opening your sanctuary..." />;
  }

  if (isAuthenticated) {
    return (
      <MainLayout>
        <Explore />
      </MainLayout>
    );
  }

  return (
    <VisitorLayout>
      <Explore />
    </VisitorLayout>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<SplashScreen message="Opening your sanctuary..." />}>
        <Routes>
          <Route path="/login" element={<PublicRoute><Welcome /></PublicRoute>} />

          {/* Public Visitor Layout Routes (Accessible by all, zero false redirects) */}
          <Route element={<VisitorLayout />}>
            <Route path="/" element={<VisitorLandingRoute />} />
            <Route path="/quotes" element={<Navigate to="/explore/quotes" replace />} />
            <Route path="/explore/quotes" element={<PublicQuotes />} />
            <Route path="/explore/categories" element={<PublicCategories />} />
            <Route path="/explore/:id" element={<PublicEntry />} />
            <Route path="/about" element={<About />} />
            <Route path="/404" element={<NotFound />} />
          </Route>

          {/* Dynamic Explore Route for both writers and visitors */}
          <Route path="/explore" element={<ExploreRoute />} />

          {/* Protected Authenticated Writer Routes */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            {routes.filter(r => r.path !== 'explore').map(route => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
          </Route>

          {/* Catch-all 404 Route */}
          <Route element={<VisitorLayout />}>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
