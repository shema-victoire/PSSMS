import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { carService } from '../../services/api';

const CarForm = () => {
  const { plateNumber } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!plateNumber;

  const [formData, setFormData] = useState({
    PlateNumber: '',
    CarType: '',
    CarSize: '',
    DriverName: '',
    PhoneNumber: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchCar = async () => {
        try {
          setLoading(true);
          const response = await carService.getById(plateNumber);
          setFormData(response.data);
          setError(null);
        } catch (err) {
          setError('Failed to fetch car details. Please try again later.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchCar();
    }
  }, [isEditMode, plateNumber]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmitSuccess(false);

    try {
      if (isEditMode) {
        await carService.update(plateNumber, formData);
      } else {
        await carService.create(formData);
        setFormData({
          PlateNumber: '',
          CarType: '',
          CarSize: '',
          DriverName: '',
          PhoneNumber: ''
        });
      }
      setSubmitSuccess(true);
      setTimeout(() => {
        if (isEditMode) {
          navigate('/cars');
        }
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
      setError(errorMessage);
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Car' : 'Add New Car'}</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {submitSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">
            {isEditMode ? 'Car updated successfully!' : 'Car added successfully!'}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="PlateNumber">
            Plate Number
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="PlateNumber"
            type="text"
            placeholder="e.g., ABC123"
            name="PlateNumber"
            value={formData.PlateNumber}
            onChange={handleChange}
            required
            disabled={isEditMode}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="DriverName">
            Driver Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="DriverName"
            type="text"
            placeholder="Full Name"
            name="DriverName"
            value={formData.DriverName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="CarType">
            Car Type
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="CarType"
            type="text"
            placeholder="e.g., Sedan, SUV, etc."
            name="CarType"
            value={formData.CarType}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="CarSize">
            Car Size
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="CarSize"
            name="CarSize"
            value={formData.CarSize}
            onChange={handleChange}
            required
          >
            <option value="">Select Car Size</option>
            <option value="Small">Small</option>
            <option value="Medium">Medium</option>
            <option value="Large">Large</option>
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="PhoneNumber">
            Phone Number
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="PhoneNumber"
            type="tel"
            placeholder="e.g., 0123456789"
            name="PhoneNumber"
            value={formData.PhoneNumber}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Processing...' : isEditMode ? 'Update Car' : 'Add Car'}
          </button>
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={() => navigate('/cars')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CarForm; 