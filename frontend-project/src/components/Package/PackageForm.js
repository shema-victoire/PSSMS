import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { packageService } from '../../services/api';

const PackageForm = () => {
  const { packageNumber } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!packageNumber;
  
  const [formData, setFormData] = useState({
    PackageName: '',
    PackageDescription: '',
    PackagePrice: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchPackageDetails();
    }
  }, [packageNumber]);

  const fetchPackageDetails = async () => {
    try {
      setLoading(true);
      const response = await packageService.getById(packageNumber);
      setFormData({
        PackageName: response.data.PackageName,
        PackageDescription: response.data.PackageDescription,
        PackagePrice: response.data.PackagePrice
      });
      setLoading(false);
    } catch (err) {
      setError('Error fetching package details');
      setLoading(false);
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      if (isEditMode) {
        await packageService.update(packageNumber, formData);
        setSuccessMessage('Package updated successfully');
      } else {
        await packageService.create(formData);
        setSuccessMessage('Package created successfully');
        setFormData({
          PackageName: '',
          PackageDescription: '',
          PackagePrice: ''
        });
      }
      setTimeout(() => {
        navigate('/packages');
      }, 2000);
    } catch (err) {
      setError('Error saving package');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Package' : 'Add New Package'}</h1>
      
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="PackageName">
              Package Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="PackageName"
              type="text"
              name="PackageName"
              value={formData.PackageName}
              onChange={handleChange}
              placeholder="Enter package name"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="PackageDescription">
              Package Description
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="PackageDescription"
              name="PackageDescription"
              value={formData.PackageDescription}
              onChange={handleChange}
              placeholder="Enter package description"
              rows="4"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="PackagePrice">
              Package Price (RWF)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="PackagePrice"
              type="number"
              name="PackagePrice"
              value={formData.PackagePrice}
              onChange={handleChange}
              placeholder="Enter price in RWF"
              min="0"
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditMode ? 'Update Package' : 'Add Package'}
            </button>
            <button
              className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={() => navigate('/packages')}
            >
              Cancel
            </button>
          </div>
        </form>
        
        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        
        {successMessage && (
          <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> {successMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageForm; 