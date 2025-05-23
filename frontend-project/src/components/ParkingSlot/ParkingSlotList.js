import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { parkingSlotService } from '../../services/api';

const ParkingSlotList = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await parkingSlotService.getAll();
      setSlots(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching parking slots');
      setLoading(false);
      console.error(err);
    }
  };

  const confirmDelete = (slotNumber) => {
    setDeleteConfirmation(slotNumber);
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleDelete = async (slotNumber) => {
    try {
      await parkingSlotService.delete(slotNumber);
      setSlots(slots.filter(slot => slot.SlotNumber !== slotNumber));
      setDeleteConfirmation(null);
    } catch (err) {
      setError('Error deleting parking slot');
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    return status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
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
        <h1 className="text-2xl font-bold">Parking Slots</h1>
        <Link 
          to="/parkingslots/add" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Slot
        </Link>
      </div>

      <div className="mb-6 flex justify-between">
        <div className="flex items-center">
          <div className="bg-green-100 text-green-800 p-2 rounded mr-2">Available: {slots.filter(slot => slot.SlotStatus === 'available').length}</div>
          <div className="bg-red-100 text-red-800 p-2 rounded">Occupied: {slots.filter(slot => slot.SlotStatus === 'occupied').length}</div>
        </div>
      </div>

      {slots.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <p>No parking slots found. Add a new parking slot to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Slot Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {slots.map((slot) => (
                <tr key={slot.SlotNumber} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{slot.SlotNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(slot.SlotStatus)}`}>
                      {slot.SlotStatus.charAt(0).toUpperCase() + slot.SlotStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link 
                        to={`/parkingslots/edit/${slot.SlotNumber}`} 
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => confirmDelete(slot.SlotNumber)}
                        className="text-red-600 hover:text-red-900"
                        disabled={slot.SlotStatus === 'occupied'}
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
                  Are you sure you want to delete this parking slot? This action cannot be undone.
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

export default ParkingSlotList; 