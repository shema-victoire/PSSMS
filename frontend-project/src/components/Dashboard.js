import React, { useState, useEffect } from 'react';
import { parkingSlotService, parkingRecordService, psPaymentService } from '../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalSlots: 0,
    availableSlots: 0,
    occupiedSlots: 0,
    activeParkings: 0,
    psRevenue: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch slots data
        const slotsRes = await parkingSlotService.getAll();
        const availableSlotsRes = await parkingSlotService.getAvailable();
        const occupiedSlotsRes = await parkingSlotService.getOccupied();
        
        // Fetch active parking records
        const activeParkingsRes = await parkingRecordService.getActive();
        
        // Fetch payment data
        const psPaymentsRes = await psPaymentService.getAll();
        
        // Calculate revenues
        const psRevenue = psPaymentsRes.data.reduce((total, payment) => total + parseFloat(payment.AmountPaid), 0);
        
        setDashboardData({
          totalSlots: slotsRes.data.length,
          availableSlots: availableSlotsRes.data.length,
          occupiedSlots: occupiedSlotsRes.data.length,
          activeParkings: activeParkingsRes.data.length,
          psRevenue,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData({
          ...dashboardData,
          loading: false,
          error: 'Failed to load dashboard data'
        });
      }
    };

    fetchDashboardData();
  }, []);

  if (dashboardData.loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {dashboardData.error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">SmartPark Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Parking Stats */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-green-800">Parking</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Slots:</span>
              <span className="font-semibold">{dashboardData.totalSlots}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Available Slots:</span>
              <span className="font-semibold text-green-600">{dashboardData.availableSlots}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Occupied Slots:</span>
              <span className="font-semibold text-red-600">{dashboardData.occupiedSlots}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Parkings:</span>
              <span className="font-semibold">{dashboardData.activeParkings}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue:</span>
              <span className="font-semibold">{dashboardData.psRevenue.toLocaleString()} RWF</span>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Quick Actions</h2>
          <div className="space-y-2">
            <a href="/parkingslots/add" className="block w-full text-center py-2 px-4 rounded bg-blue-600 text-white hover:bg-blue-700">Add New Parking Slot</a>
            <a href="/parkingrecords/add" className="block w-full text-center py-2 px-4 rounded bg-yellow-600 text-white hover:bg-yellow-700">Register Parking</a>
            <a href="/pspayments/add" className="block w-full text-center py-2 px-4 rounded bg-green-600 text-white hover:bg-green-700">Process Payment</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 