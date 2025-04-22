import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Auth from './pages/Auth';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AccountSettings from './pages/AccountSettings';
import Deploy from './pages/Deploy';

import Header from './components/Header';
import Footer from './components/Footer';
import FallBack from './pages/FallBack';
import WelcomePage from './pages/WelcomePage';
import PrivateRoute from './components/PrivateRoute';

const AppLayout = () => {
  const location = useLocation();
  const hideLayout = location.pathname === '/auth' || location.pathname === '/'; // Hide Header & Footer on auth page
  const { user } = useSelector((state) => state.user);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
      {!hideLayout && <Header />}

      <main className="flex-1">
        <Routes>
          {/* WelcomePage as the home page */}
          <Route path="/" element={user ? <Navigate to="/home" replace /> : <WelcomePage />} />

          {/* Protected Routes */}
          <Route path="/home" element={<PrivateRoute element={<Home />} />} />
          <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/account-settings" element={<PrivateRoute element={<AccountSettings />} />} />
          <Route path="/deploy/:username/:repo" element={<PrivateRoute element={<Deploy />} />} />

          {/* Auth Route */}
          <Route path="/auth" element={<Auth />} />

          {/* Fallback for any undefined route */}
          <Route path="*" element={<PrivateRoute element={<FallBack />} />} />
        </Routes>
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
