import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { parkingSlotService } from '../../services/api';

const ParkingSlotForm = () => {
  const { slotNumber } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!slotNumber;
  
  const [formData, setFormData] = useState({
    SlotStatus: 'available'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchSlotDetails();
    }
  }, [slotNumber]);

  const fetchSlotDetails = async () => {
    try {
      setLoading(true);
      const response = await parkingSlotService.getById(slotNumber);
      setFormData({
        SlotStatus: response.data.SlotStatus
      });
      setLoading(false);
    } catch (err) {
      setError('Error fetching parking slot details');
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
        await parkingSlotService.update(slotNumber, formData);
        setSuccessMessage('Parking slot updated successfully');
      } else {
        await parkingSlotService.create(formData);
        setSuccessMessage('Parking slot created successfully');
      }
      setTimeout(() => {
        navigate('/parkingslots');
      }, 2000);
    } catch (err) {
      setError('Error saving parking slot');
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
      <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Parking Slot' : 'Add New Parking Slot'}</h1>
      
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <form onSubmit={handleSubmit}>
          {isEditMode && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Slot Number
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                type="text"
                value={slotNumber}
                disabled
              />
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="SlotStatus">
              Slot Status
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="SlotStatus"
              name="SlotStatus"
              value={formData.SlotStatus}
              onChange={handleChange}
              required
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditMode ? 'Update Slot' : 'Add Slot'}
            </button>
            <button
              className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={() => navigate('/parkingslots')}
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

export default ParkingSlotForm; 