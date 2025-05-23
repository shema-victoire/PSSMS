import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/auth';

// Components
import Menubar from './components/Menubar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

// Car Components
import CarList from './components/Car/CarList';
import CarForm from './components/Car/CarForm';

// Package Components
import PackageList from './components/Package/PackageList';
import PackageForm from './components/Package/PackageForm';

// Service Components
import ServiceList from './components/Service/ServiceList';
import ServiceForm from './components/Service/ServiceForm';

// Parking Slot Components
import ParkingSlotList from './components/ParkingSlot/ParkingSlotList';
import ParkingSlotForm from './components/ParkingSlot/ParkingSlotForm';

// Parking Record Components
import ParkingRecordList from './components/ParkingRecord/ParkingRecordList';
import ParkingRecordForm from './components/ParkingRecord/ParkingRecordForm';

// Payment Components
import PSPaymentList from './components/Payment/PSPaymentList';
import PSPaymentForm from './components/Payment/PSPaymentForm';

// Report Component
import ReportPage from './components/Report/ReportPage';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Protected Route component
const AdminRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

// Root path redirect component
const RootRedirect = () => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-100">
        <Menubar />
        <div className="py-4">
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Car Routes */}
            <Route path="/cars" element={
              <ProtectedRoute>
                <CarList />
              </ProtectedRoute>
            } />
            <Route path="/cars/add" element={
              <ProtectedRoute>
                <CarForm />
              </ProtectedRoute>
            } />
            <Route path="/cars/edit/:plateNumber" element={
              <ProtectedRoute>
                <CarForm />
              </ProtectedRoute>
            } />
            
            {/* Package Routes */}
            <Route path="/packages" element={
              <ProtectedRoute>
                <PackageList />
              </ProtectedRoute>
            } />
            <Route path="/packages/add" element={
              <ProtectedRoute>
                <PackageForm />
              </ProtectedRoute>
            } />
            <Route path="/packages/edit/:packageNumber" element={
              <ProtectedRoute>
                <PackageForm />
              </ProtectedRoute>
            } />
            
            {/* Service Routes */}
            <Route path="/services" element={
              <ProtectedRoute>
                <ServiceList />
              </ProtectedRoute>
            } />
            <Route path="/services/add" element={
              <ProtectedRoute>
                <ServiceForm />
              </ProtectedRoute>
            } />
            
            {/* Parking Slot Routes */}
            <Route path="/parkingslots" element={
              <ProtectedRoute>
                <ParkingSlotList />
              </ProtectedRoute>
            } />
            <Route path="/parkingslots/add" element={
              <ProtectedRoute>
                <ParkingSlotForm />
              </ProtectedRoute>
            } />
            <Route path="/parkingslots/edit/:slotNumber" element={
              <ProtectedRoute>
                <ParkingSlotForm />
              </ProtectedRoute>
            } />
            
            {/* Parking Record Routes */}
            <Route path="/parkingrecords" element={
              <ProtectedRoute>
                <ParkingRecordList />
              </ProtectedRoute>
            } />
            <Route path="/parkingrecords/add" element={
              <ProtectedRoute>
                <ParkingRecordForm />
              </ProtectedRoute>
            } />
            
            {/* Parking Payment Routes */}
            <Route path="/pspayments" element={
              <ProtectedRoute>
                <PSPaymentList />
              </ProtectedRoute>
            } />
            <Route path="/pspayments/add" element={
              <ProtectedRoute>
                <PSPaymentForm />
              </ProtectedRoute>
            } />
            <Route path="/pspayments/edit/:paymentNumber" element={
              <ProtectedRoute>
                <PSPaymentForm />
              </ProtectedRoute>
            } />
            
            {/* Report Route */}
            <Route path="/reports" element={
              <ProtectedRoute>
                <ReportPage />
              </ProtectedRoute>
            } />
            
            {/* Fallback route */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
