import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import './App.css';
import LoginSignup from './components/LoginSignup';
import Dashboard from './components/Dashboard';
import ExpenseBreakdown from './components/ExpenseBreakdown';  // Import ExpenseBreakdown
import ProtectedRoute from './components/ProtectedRoute';
import Assets from './components/Assets'; // Import the new component
import AIIntegration from './components/AIIntegration';

function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleGetStarted = () => {
    if (token) {
      navigate('/dashboard');  // If logged in, go to Dashboard
    } else {
      navigate('/login-signup');  // Otherwise, go to Login/Signup page
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 animate-gradient-xy"></div>

      {/* Navigation Bar */}
      <nav className="w-full flex justify-end p-5 space-x-4 fixed top-0 right-0 z-10">
        <button
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300"
          onClick={handleGetStarted}
        >
          {token ? 'Go to Dashboard' : 'Get Started'}
        </button>
      </nav>

      <motion.h1
        className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-pink-300 to-purple-400 mb-4 drop-shadow-lg z-10"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        Finance Dashboard Insights
      </motion.h1>

      <motion.p
        className="text-xl text-white max-w-xl mb-10 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
      >
        Take control of your finances with real-time insights. Effortlessly monitor your bank balance, optimize investments, and receive personalized advice—turning every transaction into a step toward financial growth and prosperity.
      </motion.p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login-signup" element={<LoginSignup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expense-breakdown"
          element={
            <ProtectedRoute>
              <ExpenseBreakdown />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-insights"
          element={
            <ProtectedRoute>
              <AIIntegration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets"
          element={
            <ProtectedRoute>
              <Assets />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
export default App;
