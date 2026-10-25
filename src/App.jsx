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
          <Route path="/explore/quotes" element={<PublicQuotes />} />
          <Route path="/explore/categories" element={<PublicCategories />} />
          <Route path="/explore/:id" element={<PublicEntry />} />
          <Route path="/about" element={<About />} />
        </Route>

        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          {routes.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;