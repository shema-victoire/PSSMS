import axios from 'axios';
import authService from './auth';

const API_URL = 'http://localhost:5000/api/';

// Create axios instance
const API = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
API.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Car API services
const carService = {
  getAll: () => API.get('cars'),
  getById: (plateNumber) => API.get(`cars/${plateNumber}`),
  create: (data) => API.post('cars', data),
  update: (plateNumber, data) => API.put(`cars/${plateNumber}`, data),
  delete: (plateNumber) => API.delete(`cars/${plateNumber}`),
};

// Parking Slot API services
const parkingSlotService = {
  getAll: () => API.get('parkingslots'),
  getAvailable: () => API.get('parkingslots/available'),
  getOccupied: () => API.get('parkingslots/occupied'),
  getById: (slotNumber) => API.get(`parkingslots/${slotNumber}`),
  create: (data) => API.post('parkingslots', data),
  update: (slotNumber, data) => API.put(`parkingslots/${slotNumber}`, data),
  delete: (slotNumber) => API.delete(`parkingslots/${slotNumber}`),
};

// Parking Record API services
const parkingRecordService = {
  getAll: () => API.get('parkingrecords'),
  getActive: () => API.get('parkingrecords/active'),
  getById: (parkingId) => API.get(`parkingrecords/${parkingId}`),
  create: (data) => API.post('parkingrecords', data),
  recordExit: (parkingId) => API.put(`parkingrecords/${parkingId}/exit`),
  delete: (parkingId) => API.delete(`parkingrecords/${parkingId}`),
};

// Parking Payment API services
const psPaymentService = {
  getAll: () => API.get('pspayments'),
  getById: (paymentNumber) => API.get(`pspayments/${paymentNumber}`),
  getByPlateNumber: (plateNumber) => API.get(`pspayments/car/${plateNumber}`),
  create: (data) => API.post('pspayments', data),
  update: (paymentNumber, data) => API.put(`pspayments/${paymentNumber}`, data),
  delete: (paymentNumber) => API.delete(`pspayments/${paymentNumber}`),
};

// Report API services
const reportService = {
  getReport: (fromDate, toDate) => API.get(`reports?fromDate=${fromDate}&toDate=${toDate}`),
  getParkingReport: (fromDate, toDate) => API.get(`reports/parking?fromDate=${fromDate}&toDate=${toDate}`)
};

export {
  carService,
  parkingSlotService,
  parkingRecordService,
  psPaymentService,
  reportService
}; 