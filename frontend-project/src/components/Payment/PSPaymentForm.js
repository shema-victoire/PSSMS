import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { carService, psPaymentService } from '../../services/api';

const PSPaymentForm = () => {
  const { paymentNumber } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!paymentNumber;
  
  const PARKING_FEE = 500; // Fixed parking fee in RWF
  
  const [formData, setFormData] = useState({
    PlateNumber: '',
    AmountPaid: PARKING_FEE
  });
  
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const carsResponse = await carService.getAll();
        setCars(carsResponse.data);
        
        if (isEditMode) {
          const paymentResponse = await psPaymentService.getById(paymentNumber);
          setFormData({
            PlateNumber: paymentResponse.data.PlateNumber,
            AmountPaid: paymentResponse.data.AmountPaid
          });
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error fetching data');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchData();
  }, [paymentNumber, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // If changing plate number, reset amount to fixed fee
    if (name === 'PlateNumber' && !isEditMode) {
      setFormData({ ...formData, [name]: value, AmountPaid: PARKING_FEE });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      if (isEditMode) {
        await psPaymentService.update(paymentNumber, formData);
        setSuccessMessage('Payment updated successfully');
      } else {
        await psPaymentService.create(formData);
        setSuccessMessage('Payment created successfully');
        setFormData({
          PlateNumber: '',
          AmountPaid: PARKING_FEE
        });
      }
      setTimeout(() => {
        navigate('/pspayments');
      }, 2000);
    } catch (err) {
      setError('Error saving payment');
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
      <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Parking Payment' : 'Add New Parking Payment'}</h1>
      
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
          <p className="font-bold">Parking Fee Information</p>
          <p>The standard parking fee is {PARKING_FEE.toLocaleString()} RWF per slot.</p>
        </div>
        
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
                disabled={isEditMode}
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
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="AmountPaid">
              Amount Paid (RWF)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="AmountPaid"
              type="number"
              name="AmountPaid"
              value={formData.AmountPaid}
              onChange={handleChange}
              placeholder="Enter amount in RWF"
              min="0"
              required
              readOnly={!isEditMode}
            />
            {!isEditMode && (
              <p className="text-sm text-gray-500 mt-1">Fixed parking fee of {PARKING_FEE} RWF</p>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading || cars.length === 0}
            >
              {loading ? 'Saving...' : isEditMode ? 'Update Payment' : 'Add Payment'}
            </button>
            <button
              className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={() => navigate('/pspayments')}
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

export default PSPaymentForm; 