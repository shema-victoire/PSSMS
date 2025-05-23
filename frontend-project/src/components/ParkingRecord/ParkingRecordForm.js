import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { carService, parkingSlotService, parkingRecordService } from '../../services/api';

const ParkingRecordForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    PlateNumber: '',
    SlotNumber: ''
  });
  
  const [cars, setCars] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carsResponse, slotsResponse] = await Promise.all([
          carService.getAll(),
          parkingSlotService.getAvailable()
        ]);
        
        setCars(carsResponse.data);
        setAvailableSlots(slotsResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching data');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchData();
  }, []);

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
      await parkingRecordService.create(formData);
      setSuccessMessage('Parking registered successfully');
      setFormData({
        PlateNumber: '',
        SlotNumber: ''
      });
      setTimeout(() => {
        navigate('/parkingrecords');
      }, 2000);
    } catch (err) {
      setError('Error registering parking');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Register New Parking</h1>
      
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="PlateNumber">
              Car
            </label>
            {cars.length === 0 ? (
              <div className="mb-4">
                <p className="text-yellow-600">No cars available. Please add a car first.</p>
                <button
                  type="button"
                  onClick={() => navigate('/cars/add')}
                  className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Add Car
                </button>
              </div>
            ) : (
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="PlateNumber"
                name="PlateNumber"
                value={formData.PlateNumber}
                onChange={handleChange}
                required
              >
                <option value="">Select a car</option>
                {cars.map((car) => (
                  <option key={car.PlateNumber} value={car.PlateNumber}>
                    {car.PlateNumber} - {car.DriverName} ({car.CarType})
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="SlotNumber">
              Parking Slot
            </label>
            {availableSlots.length === 0 ? (
              <div className="mb-4">
                <p className="text-yellow-600">No available parking slots. Please add a slot first or wait for a slot to become available.</p>
                <button
                  type="button"
                  onClick={() => navigate('/parkingslots/add')}
                  className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Add Parking Slot
                </button>
              </div>
            ) : (
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="SlotNumber"
                name="SlotNumber"
                value={formData.SlotNumber}
                onChange={handleChange}
                required
              >
                <option value="">Select a parking slot</option>
                {availableSlots.map((slot) => (
                  <option key={slot.SlotNumber} value={slot.SlotNumber}>
                    Slot #{slot.SlotNumber}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading || cars.length === 0 || availableSlots.length === 0}
            >
              {loading ? 'Saving...' : 'Register Parking'}
            </button>
            <button
              className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={() => navigate('/parkingrecords')}
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

export default ParkingRecordForm; 