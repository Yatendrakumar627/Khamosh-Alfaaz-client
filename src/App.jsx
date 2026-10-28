import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from './context/SessionContext';
import { routes } from './routes';
import { MainLayout } from './layouts/MainLayout';
import { VisitorLayout } from './layouts/VisitorLayout';
import { Welcome } from './pages/Welcome';
import { VisitorHome } from './pages/VisitorHome';
import { PublicEntry } from './pages/PublicEntry';
import { PublicQuotes } from './pages/PublicQuotes';
import { PublicCategories } from './pages/PublicCategories';
import { About } from './pages/About';
import { NotFound } from './pages/NotFound';

import { SplashScreen } from './components/ui/SplashScreen';

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

// Visitor Mode — not signed in (redirects writers to their dashboard)
const VisitorOnlyRoute = ({ children }) => {
  const { isAuthenticated, sessionChecked } = useSession();

  if (sessionChecked && isAuthenticated) return <Navigate to="/dashboard" replace />;

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Welcome /></PublicRoute>} />

        <Route element={<VisitorOnlyRoute><VisitorLayout /></VisitorOnlyRoute>}>
          <Route path="/" element={<VisitorHome />} />
          <Route path="/explore" element={<VisitorHome />} />
          <Route path="/quotes" element={<Navigate to="/explore/quotes" replace />} />
          <Route path="/explore/quotes" element={<PublicQuotes />} />
          <Route path="/explore/categories" element={<PublicCategories />} />
          <Route path="/explore/:id" element={<PublicEntry />} />
          <Route path="/about" element={<About />} />
          <Route path="/404" element={<NotFound />} />
        </Route>

        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          {routes.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        {/* Catch-all 404 Route */}
        <Route element={<VisitorLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
