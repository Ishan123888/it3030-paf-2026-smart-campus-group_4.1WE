import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import OAuthCallback from './pages/OAuthCallback';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Contact from './pages/Contact';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: "#060812" }}>
          <Navbar />
          <main style={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/oauth-callback" element={<OAuthCallback />} />
              <Route path="/contact" element={<Contact />} />

              {/* ✅ Dashboard is now PUBLIC (Internal logic handles Guest vs User) */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* 🔒 Admin Panel is still PROTECTED */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="ROLE_ADMIN">
                  <AdminPanel />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;