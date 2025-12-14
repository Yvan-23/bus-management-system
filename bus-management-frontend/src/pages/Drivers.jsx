import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Users, Bus as BusIcon } from 'lucide-react';
import api from '../api/client'; // assignments endpoint is unique, maybe add to services later
import { busService, userService, assignmentService } from '../api/services';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

// Assignments might need a dedicated service, but for now using client

export default function Drivers() {
    const [assignments, setAssignments] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    // Form for registration
    const {
        register: registerDriver,
        handleSubmit: handleSubmitDriver,
        reset: resetDriver,
        formState: { errors: driverErrors }
    } = useForm();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [assignRes, busRes, userRes] = await Promise.all([
                assignmentService.getAll(),
                busService.getAll(),
                userService.getAll()
            ]);
            setAssignments(assignRes.data.data);
            setBuses(busRes.data.data);
            // Filter only users with userType 'Driver'
            const allUsers = userRes.data.data || [];
            const driverUsers = allUsers.filter(u => u.userType === 'Driver');
            setDrivers(driverUsers);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            const busIdInt = parseInt(data.busId);
            const driverIdInt = parseInt(data.driverId);

            if (isNaN(busIdInt) || isNaN(driverIdInt)) {
                toast.error("Invalid Bus or Driver selection");
                return;
            }

            const payload = {
                busId: busIdInt,
                driverId: driverIdInt
            };

            await assignmentService.create(payload);
            toast.success("Driver assigned successfully");
            fetchData();
            closeModal();
        } catch (error) {
            console.error('Failed to assign driver', error);
            // Handle expected 400 Bad Request with custom message
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to assign driver. Check if driver/bus is already assigned.');
            }
        }
    };

    const openAddModal = () => {
        reset({ busId: '', driverId: '' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Unassign this driver?')) {
            try {
                await assignmentService.delete(id);
                fetchData();
            } catch (error) {
                console.error('Failed to unassign', error);
            }
        }
    };

    const getDriverName = (id) => drivers.find(d => (d.id || d.userId) === id)?.name || `Driver #${id}`;
    const getBusNumber = (id) => buses.find(b => b.busId === id)?.busNumber || `Bus #${id}`;

    const onRegisterDriver = async (data) => {
        try {
            const payload = { ...data, userType: 'Driver' };
            await api.post('/Auth/register', payload);
            toast.success("Driver created successfully!");
            setIsRegisterModalOpen(false);
            resetDriver();
            fetchData(); // Refresh lists
        } catch (error) {
            console.error("Failed to register driver", error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to register driver. Email might be taken.");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Driver Assignments</h1>
                    <p className="text-slate-500">Manage drivers and their bus assignments.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsRegisterModalOpen(true)}
                        className="flex items-center gap-2 bg-white text-indigo-600 border border-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        <span>New Driver</span>
                    </button>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        <span>Assign Bus</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* ... assignments map ... */}
                {loading ? (
                    <div className="col-span-full py-12 text-center text-slate-500">Loading assignments...</div>
                ) : assignments.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-500">No active assignments found.</div>
                ) : (
                    assignments.map((assignment) => (
                        <div key={assignment.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900">{getDriverName(assignment.driverId)}</div>
                                        <div className="text-xs text-slate-500">Driver</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(assignment.id)}
                                    className="text-slate-400 hover:text-red-600 transition-colors"
                                    title="Unassign"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg text-indigo-900">
                                <BusIcon size={20} className="text-indigo-600" />
                                <span className="font-medium">{getBusNumber(assignment.busId)}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title="Assign Driver to Bus">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Driver</label>
                        <select
                            {...register('driverId', { required: 'Driver is required' })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            <option value="">Select a driver...</option>
                            {drivers.map(d => (
                                <option key={d.id || d.userId} value={d.id || d.userId}>{d.name} ({d.email})</option>
                            ))}
                        </select>
                        {errors.driverId && <p className="text-sm text-red-600 mt-1">{errors.driverId.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Bus</label>
                        <select
                            {...register('busId', { required: 'Bus is required' })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            <option value="">Select a bus...</option>
                            {buses.map(b => (
                                <option key={b.busId} value={b.busId}>{b.busNumber}</option>
                            ))}
                        </select>
                        {errors.busId && <p className="text-sm text-red-600 mt-1">{errors.busId.message}</p>}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Assign
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} title="Register New Driver">
                <form onSubmit={handleSubmitDriver(onRegisterDriver)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Full Name</label>
                        <input {...registerDriver('name', { required: 'Name is required' })} className="w-full px-4 py-2 border rounded-lg" placeholder="John Doe" />
                        {driverErrors.name && <p className="text-sm text-red-600">{driverErrors.name.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Email</label>
                        <input {...registerDriver('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } })} className="w-full px-4 py-2 border rounded-lg" placeholder="driver@example.com" />
                        {driverErrors.email && <p className="text-sm text-red-600">{driverErrors.email.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Phone</label>
                        <input {...registerDriver('phone', { required: 'Phone is required' })} className="w-full px-4 py-2 border rounded-lg" placeholder="+1234567890" />
                        {driverErrors.phone && <p className="text-sm text-red-600">{driverErrors.phone.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Licence Number</label>
                        <input {...registerDriver('licenceNumber', { required: 'Licence is required' })} className="w-full px-4 py-2 border rounded-lg" placeholder="LIC-123456" />
                        {driverErrors.licenceNumber && <p className="text-sm text-red-600">{driverErrors.licenceNumber.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Password</label>
                        <input type="password" {...registerDriver('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 chars' } })} className="w-full px-4 py-2 border rounded-lg" />
                        {driverErrors.password && <p className="text-sm text-red-600">{driverErrors.password.message}</p>}
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={() => setIsRegisterModalOpen(false)} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create Driver</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
