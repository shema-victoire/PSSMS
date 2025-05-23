import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/api';

const ReportPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], // Default to 30 days ago
    toDate: new Date().toISOString().split('T')[0] // Default to today
  });
  const [reportData, setReportData] = useState({
    carWashing: {
      totalServices: 0,
      totalRevenue: 0,
      servicesByPackage: []
    },
    parking: {
      totalParkings: 0,
      totalRevenue: 0,
      activeParking: 0,
      avgDuration: 0
    }
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { fromDate, toDate } = dateRange;
      const response = await reportService.getReport(fromDate, toDate);
      
      setReportData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching report data');
      setLoading(false);
      console.error(err);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value
    });
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReportData();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Business Performance Report</h1>
      
      {/* Date Filter Form */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fromDate">
              From Date
            </label>
            <input
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="fromDate"
              type="date"
              name="fromDate"
              value={dateRange.fromDate}
              onChange={handleDateChange}
              max={dateRange.toDate}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="toDate">
              To Date
            </label>
            <input
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="toDate"
              type="date"
              name="toDate"
              value={dateRange.toDate}
              onChange={handleDateChange}
              min={dateRange.fromDate}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="mb-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Generate Report'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Car Washing Summary */}
          <div className="bg-white shadow-md rounded p-6">
            <h2 className="text-xl font-bold mb-4">Car Washing Summary</h2>
            
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Total Services</p>
                  <p className="text-2xl font-bold">{reportData.carWashing.totalServices}</p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold">{parseInt(reportData.carWashing.totalRevenue).toLocaleString()} RWF</p>
                </div>
              </div>
            </div>
            
            <h3 className="font-bold mb-2">Services by Package</h3>
            {reportData.carWashing.servicesByPackage.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Package</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Count</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Revenue (RWF)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.carWashing.servicesByPackage.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{item.packageName}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{item.count}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{parseInt(item.revenue).toLocaleString()} RWF</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No services recorded in this period</p>
            )}
          </div>
          
          {/* Parking Summary */}
          <div className="bg-white shadow-md rounded p-6">
            <h2 className="text-xl font-bold mb-4">Parking Summary</h2>
            
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Total Parkings</p>
                  <p className="text-2xl font-bold">{reportData.parking.totalParkings}</p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold">{parseInt(reportData.parking.totalRevenue).toLocaleString()} RWF</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Active Parkings</p>
                  <p className="text-2xl font-bold">{reportData.parking.activeParking}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Avg. Duration (min)</p>
                  <p className="text-2xl font-bold">{reportData.parking.avgDuration}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Overall Business Summary */}
          <div className="bg-white shadow-md rounded p-6 lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Overall Business Summary</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-indigo-50 p-4 rounded">
                <p className="text-sm text-gray-500">Total Transactions</p>
                <p className="text-2xl font-bold">{reportData.carWashing.totalServices + reportData.parking.totalParkings}</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {parseInt(reportData.carWashing.totalRevenue + reportData.parking.totalRevenue).toLocaleString()} RWF
                </p>
              </div>
              <div className="bg-indigo-50 p-4 rounded">
                <p className="text-sm text-gray-500">Car Washing %</p>
                <p className="text-2xl font-bold">
                  {reportData.carWashing.totalRevenue + reportData.parking.totalRevenue > 0 
                    ? Math.round((reportData.carWashing.totalRevenue / (reportData.carWashing.totalRevenue + reportData.parking.totalRevenue)) * 100)
                    : 0}%
                </p>
              </div>
              <div className="bg-indigo-50 p-4 rounded">
                <p className="text-sm text-gray-500">Parking %</p>
                <p className="text-2xl font-bold">
                  {reportData.carWashing.totalRevenue + reportData.parking.totalRevenue > 0 
                    ? Math.round((reportData.parking.totalRevenue / (reportData.carWashing.totalRevenue + reportData.parking.totalRevenue)) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPage; 