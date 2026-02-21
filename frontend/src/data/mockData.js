export const vehicles = [
    { id: 'V001', regNo: 'GJ-01-AA-1234', make: 'Tata Motors', model: 'Ace Gold', year: 2022, type: 'Light Truck', capacity: 750, fuelType: 'Diesel', status: 'available', odometer: 34200, lastService: '2025-11-10', nextService: '2026-05-10' },
    { id: 'V002', regNo: 'GJ-01-BB-5678', make: 'Mahindra', model: 'Bolero Pik-Up', year: 2021, type: 'Pickup', capacity: 1000, fuelType: 'Diesel', status: 'in_use', odometer: 67800, lastService: '2025-09-22', nextService: '2026-03-22' },
    { id: 'V003', regNo: 'GJ-01-CC-9012', make: 'Ashok Leyland', model: 'DOST+', year: 2023, type: 'Light Truck', capacity: 1250, fuelType: 'Diesel', status: 'maintenance', odometer: 22100, lastService: '2026-01-05', nextService: '2026-07-05' },
    { id: 'V004', regNo: 'GJ-06-DD-3456', make: 'Eicher', model: 'Pro 2059', year: 2020, type: 'Medium Truck', capacity: 5000, fuelType: 'Diesel', status: 'available', odometer: 112500, lastService: '2025-12-01', nextService: '2026-06-01' },
    { id: 'V005', regNo: 'GJ-06-EE-7890', make: 'BharatBenz', model: '1617R', year: 2019, type: 'Heavy Truck', capacity: 16000, fuelType: 'Diesel', status: 'available', odometer: 234000, lastService: '2025-10-18', nextService: '2026-04-18' },
    { id: 'V006', regNo: 'GJ-01-FF-2345', make: 'Force Motors', model: 'Trump 40', year: 2022, type: 'Mini Bus', capacity: 2000, fuelType: 'CNG', status: 'in_use', odometer: 45600, lastService: '2025-08-30', nextService: '2026-02-28' },
    { id: 'V007', regNo: 'GJ-07-GG-6789', make: 'Tata Motors', model: 'LPT 1412', year: 2021, type: 'Medium Truck', capacity: 9000, fuelType: 'Diesel', status: 'available', odometer: 88300, lastService: '2025-11-25', nextService: '2026-05-25' },
    { id: 'V008', regNo: 'GJ-07-HH-0123', make: 'Mahindra', model: 'FuRIO 7S', year: 2023, type: 'Light Truck', capacity: 700, fuelType: 'Diesel', status: 'maintenance', odometer: 12400, lastService: '2026-02-01', nextService: '2026-08-01' },
];

export const drivers = [
    { id: 'D001', name: 'Rajesh Patel', contact: '+91 98765 43210', licenseNo: 'GJ0120190012345', licenseExpiry: '2026-04-15', status: 'available', tripsCompleted: 142, rating: 4.8, joiningDate: '2019-03-10' },
    { id: 'D002', name: 'Amit Shah', contact: '+91 87654 32109', licenseNo: 'GJ0120210054321', licenseExpiry: '2026-03-02', status: 'on_trip', tripsCompleted: 89, rating: 4.5, joiningDate: '2021-07-15' },
    { id: 'D003', name: 'Suresh Kumar', contact: '+91 76543 21098', licenseNo: 'GJ0620180098765', licenseExpiry: '2025-12-20', status: 'off_duty', tripsCompleted: 201, rating: 4.2, joiningDate: '2018-01-22' },
    { id: 'D004', name: 'Vikram Chauhan', contact: '+91 65432 10987', licenseNo: 'GJ0120220076543', licenseExpiry: '2027-08-30', status: 'available', tripsCompleted: 67, rating: 4.9, joiningDate: '2022-11-05' },
    { id: 'D005', name: 'Pradeep Nair', contact: '+91 54321 09876', licenseNo: 'GJ0620170034567', licenseExpiry: '2026-02-10', status: 'on_trip', tripsCompleted: 312, rating: 4.7, joiningDate: '2017-06-18' },
    { id: 'D006', name: 'Harish Mehta', contact: '+91 43210 98765', licenseNo: 'GJ0720210067890', licenseExpiry: '2028-01-14', status: 'available', tripsCompleted: 54, rating: 4.3, joiningDate: '2021-04-02' },
    { id: 'D007', name: 'Dinesh Rao', contact: '+91 32109 87654', licenseNo: 'GJ0120160056789', licenseExpiry: '2025-11-05', status: 'off_duty', tripsCompleted: 178, rating: 3.9, joiningDate: '2016-09-28' },
];

export const trips = [
    { id: 'T001', vehicleId: 'V002', driverId: 'D005', origin: 'Ahmedabad Depot', destination: 'Surat Warehouse', cargoWeight: 850, status: 'in_progress', startDate: '2026-02-21', endDate: null, distanceKm: 265, fuelUsed: null, notes: 'Fragile goods – handle carefully' },
    { id: 'T002', vehicleId: 'V006', driverId: 'D002', origin: 'Vadodara Hub', destination: 'Rajkot Distribution', cargoWeight: 1600, status: 'in_progress', startDate: '2026-02-21', endDate: null, distanceKm: 218, fuelUsed: null, notes: '' },
    { id: 'T003', vehicleId: 'V001', driverId: 'D001', origin: 'Ahmedabad Depot', destination: 'Gandhinagar Office', cargoWeight: 320, status: 'completed', startDate: '2026-02-20', endDate: '2026-02-20', distanceKm: 32, fuelUsed: 4.8, notes: '' },
    { id: 'T004', vehicleId: 'V004', driverId: 'D004', origin: 'Surat Warehouse', destination: 'Mumbai Port', cargoWeight: 4200, status: 'completed', startDate: '2026-02-19', endDate: '2026-02-20', distanceKm: 284, fuelUsed: 68.5, notes: 'Customs cleared' },
    { id: 'T005', vehicleId: 'V007', driverId: 'D006', origin: 'Ahmedabad Depot', destination: 'Bhavnagar Factory', cargoWeight: 7500, status: 'completed', startDate: '2026-02-18', endDate: '2026-02-19', distanceKm: 198, fuelUsed: 42.2, notes: '' },
    { id: 'T006', vehicleId: 'V005', driverId: 'D001', origin: 'Rajkot Distribution', destination: 'Jamnagar Port', cargoWeight: 12000, status: 'scheduled', startDate: '2026-02-22', endDate: null, distanceKm: 87, fuelUsed: null, notes: 'Priority shipment' },
    { id: 'T007', vehicleId: 'V001', driverId: 'D004', origin: 'Gandhinagar Office', destination: 'Mehsana Depot', cargoWeight: 450, status: 'scheduled', startDate: '2026-02-22', endDate: null, distanceKm: 56, fuelUsed: null, notes: '' },
    { id: 'T008', vehicleId: 'V004', driverId: 'D006', origin: 'Ahmedabad Depot', destination: 'Anand Warehouse', cargoWeight: 3800, status: 'cancelled', startDate: '2026-02-17', endDate: null, distanceKm: 72, fuelUsed: null, notes: 'Client cancelled order' },
];

export const maintenance = [
    { id: 'M001', vehicleId: 'V003', driverId: 'D001', type: 'Engine Overhaul', description: 'Full engine inspection and component replacement', status: 'in_progress', scheduledDate: '2026-02-15', completedDate: null, cost: 28000, workshop: 'Ashok Leyland Service Center, Ahmedabad', technician: 'N/A', reportedByDriver: true, reimbursementStatus: 'pending', billUrl: null, billFileName: null },
    { id: 'M002', vehicleId: 'V008', driverId: 'D001', type: 'Brake Replacement', description: 'Front and rear brake pad replacement', status: 'in_progress', scheduledDate: '2026-02-18', completedDate: null, cost: 8500, workshop: 'Mahindra Authorized Service, Surat', technician: 'N/A', reportedByDriver: true, reimbursementStatus: 'pending', billUrl: null, billFileName: null },
    { id: 'M003', vehicleId: 'V001', driverId: 'D001', type: 'Oil & Filter Change', description: 'Routine 10,000 km service', status: 'completed', scheduledDate: '2025-11-10', completedDate: '2025-11-10', cost: 3200, workshop: 'Tata ExPress Fleet, Ahmedabad', technician: 'N/A', reportedByDriver: true, reimbursementStatus: 'approved', billUrl: null, billFileName: null },
    { id: 'M004', vehicleId: 'V002', driverId: 'D001', type: 'Tyre Rotation', description: 'All four tyres rotated and balanced', status: 'completed', scheduledDate: '2025-09-22', completedDate: '2025-09-22', cost: 1800, workshop: 'MRF Tyre Point, Vadodara', technician: 'N/A', reportedByDriver: true, reimbursementStatus: 'rejected', billUrl: null, billFileName: null },
    { id: 'M005', vehicleId: 'V005', driverId: 'D001', type: 'Suspension Check', description: 'Full suspension system inspection', status: 'scheduled', scheduledDate: '2026-03-05', completedDate: null, cost: 15000, workshop: 'BharatBenz Fleet Care, Surat', technician: 'N/A', reportedByDriver: true, reimbursementStatus: 'pending', billUrl: null, billFileName: null },
];

export const expenses = [
    { id: 'E001', vehicleId: 'V002', tripId: 'T001', category: 'fuel', amount: 4250, liters: 45.7, pricePerLiter: 93.0, date: '2026-02-21', description: 'Diesel fill – Ahmedabad Petrol Pump', recordedBy: 'Amit Shah' },
    { id: 'E002', vehicleId: 'V004', tripId: 'T004', category: 'fuel', amount: 6383, liters: 68.6, pricePerLiter: 93.0, date: '2026-02-20', description: 'Diesel fill – Surat NH48', recordedBy: 'Vikram Chauhan' },
    { id: 'E003', vehicleId: 'V007', tripId: 'T005', category: 'fuel', amount: 3925, liters: 42.2, pricePerLiter: 93.0, date: '2026-02-19', description: 'Diesel fill – Bhavnagar Highway', recordedBy: 'Harish Mehta' },
    { id: 'E004', vehicleId: 'V003', tripId: null, category: 'maintenance', amount: 28000, liters: null, pricePerLiter: null, date: '2026-02-15', description: 'Engine overhaul – Ashok Leyland SC', recordedBy: 'Admin' },
    { id: 'E005', vehicleId: 'V008', tripId: null, category: 'maintenance', amount: 8500, liters: null, pricePerLiter: null, date: '2026-02-18', description: 'Brake pad replacement – Mahindra SC', recordedBy: 'Admin' },
    { id: 'E006', vehicleId: 'V001', tripId: 'T003', category: 'fuel', amount: 446, liters: 4.8, pricePerLiter: 93.0, date: '2026-02-20', description: 'Diesel fill – Gandhinagar', recordedBy: 'Rajesh Patel' },
    { id: 'E007', vehicleId: 'V005', tripId: null, category: 'toll', amount: 850, liters: null, pricePerLiter: null, date: '2026-02-20', description: 'Highway toll Surat-Mumbai', recordedBy: 'Rajesh Patel' },
    { id: 'E008', vehicleId: 'V001', tripId: null, category: 'maintenance', amount: 3200, liters: null, pricePerLiter: null, date: '2025-11-10', description: 'Oil and filter change – Tata SC', recordedBy: 'Admin' },
    { id: 'E009', vehicleId: 'V002', tripId: null, category: 'maintenance', amount: 1800, liters: null, pricePerLiter: null, date: '2025-09-22', description: 'Tyre rotation – MRF Tyre Point', recordedBy: 'Admin' },
    { id: 'E010', vehicleId: 'V004', tripId: null, category: 'maintenance', amount: 12500, liters: null, pricePerLiter: null, date: '2025-12-01', description: 'Transmission service – Eicher SC', recordedBy: 'Admin' },
];

export const weeklyTrips = [
    { day: 'Mon', trips: 8 }, { day: 'Tue', trips: 12 }, { day: 'Wed', trips: 7 },
    { day: 'Thu', trips: 15 }, { day: 'Fri', trips: 11 }, { day: 'Sat', trips: 9 }, { day: 'Sun', trips: 4 },
];

export const monthlyExpenses = [
    { month: 'Sep', fuel: 32000, maintenance: 8500, toll: 2100 },
    { month: 'Oct', fuel: 38500, maintenance: 4200, toll: 1800 },
    { month: 'Nov', fuel: 41000, maintenance: 15700, toll: 2400 },
    { month: 'Dec', fuel: 35000, maintenance: 26000, toll: 1950 },
    { month: 'Jan', fuel: 44000, maintenance: 9800, toll: 2700 },
    { month: 'Feb', fuel: 15004, maintenance: 36500, toll: 850 },
];

export const utilizationData = [
    { month: 'Sep', utilization: 62 }, { month: 'Oct', utilization: 71 },
    { month: 'Nov', utilization: 68 }, { month: 'Dec', utilization: 55 },
    { month: 'Jan', utilization: 79 }, { month: 'Feb', utilization: 82 },
];

export const getVehicleById = (id) => vehicles.find(v => v.id === id);
export const getDriverById = (id) => drivers.find(d => d.id === id);

export const getDaysUntilExpiry = (dateStr) => {
    const today = new Date('2026-02-21');
    const expiry = new Date(dateStr);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};
