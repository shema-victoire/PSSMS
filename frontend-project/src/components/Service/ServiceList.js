import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { servicePackageService } from '../../services/api';

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await servicePackageService.getAll();
      setServices(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching services');
      setLoading(false);
      console.error(err);
    }
  };

  const confirmDelete = (recordNumber) => {
    setDeleteConfirmation(recordNumber);
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleDelete = async (recordNumber) => {
    try {
      await servicePackageService.delete(recordNumber);
      setServices(services.filter(service => service.RecordNumber !== recordNumber));
      setDeleteConfirmation(null);
    } catch (err) {
      setError('Error deleting service');
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Car Washing Services</h1>
        <Link 
          to="/services/add" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Service
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <p>No services found. Add a new service to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Record Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Service Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Plate Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Package</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Price (RWF)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {services.map((service) => (
                <tr key={service.RecordNumber} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.RecordNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(service.ServiceDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.PlateNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.DriverName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.PackageName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parseInt(service.PackagePrice).toLocaleString()} RWF</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link 
                        to={`/services/view/${service.RecordNumber}`} 
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => confirmDelete(service.RecordNumber)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Confirm Delete</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this service record? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center mt-4 gap-4">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmation)}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceList; 