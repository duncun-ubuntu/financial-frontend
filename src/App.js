import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FinancialManager from './components/FinancialManager/FinancialManager';
import Dashboard from './components/FinancialManager/Dashboard';
import Budgets from './components/FinancialManager/Budgets';
import Transactions from './components/FinancialManager/Transactions';
import Profile from './components/FinancialManager/Profile';
import Documents from './components/FinancialManager/Documents';
import Invoices from './components/FinancialManager/Invoices';
import Login from './components/FinancialManager/Login';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/financial-manager"
          element={
            <ProtectedRoute>
              <FinancialManager />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="documents" element={<Documents />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;