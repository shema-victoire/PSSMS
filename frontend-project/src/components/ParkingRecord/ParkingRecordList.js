import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { parkingRecordService } from '../../services/api';

const ParkingRecordList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await parkingRecordService.getAll();
      setRecords(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching parking records');
      setLoading(false);
      console.error(err);
    }
  };

  const confirmDelete = (parkingId) => {
    setDeleteConfirmation(parkingId);
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleDelete = async (parkingId) => {
    try {
      await parkingRecordService.delete(parkingId);
      setRecords(records.filter(record => record.ParkingID !== parkingId));
      setDeleteConfirmation(null);
    } catch (err) {
      setError('Error deleting parking record');
      console.error(err);
    }
  };

  const handleRecordExit = async (parkingId) => {
    try {
      await parkingRecordService.recordExit(parkingId);
      // Refresh the records after recording exit
      fetchRecords();
    } catch (err) {
      setError('Error recording exit');
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'In progress';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} minutes`;
    } else if (mins === 0) {
      return `${hours} hours`;
    } else {
      return `${hours} hours, ${mins} minutes`;
    }
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
        <h1 className="text-2xl font-bold">Parking Records</h1>
        <Link 
          to="/parkingrecords/add" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Register New Parking
        </Link>
      </div>

      <div className="mb-6 flex">
        <Link 
          to="/parkingrecords/active" 
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2"
        >
          View Active Parkings
        </Link>
      </div>

      {records.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <p>No parking records found. Register a new parking to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Plate Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Slot Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Entry Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Exit Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record.ParkingID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.ParkingID}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.PlateNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.SlotNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(record.EntryTime)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(record.ExitTime)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDuration(record.Duration)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.ExitTime ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                      {record.ExitTime ? 'Completed' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {!record.ExitTime && (
                        <button
                          onClick={() => handleRecordExit(record.ParkingID)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Record Exit
                        </button>
                      )}
                      <button
                        onClick={() => confirmDelete(record.ParkingID)}
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
                  Are you sure you want to delete this parking record? This action cannot be undone.
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

export default ParkingRecordList; 