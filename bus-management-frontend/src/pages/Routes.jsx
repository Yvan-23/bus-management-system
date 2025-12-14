import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, Map, Search, ArrowRight } from 'lucide-react';
import { routeService, assignmentService, scheduleService } from '../api/services';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Routes() {
    const { user } = useAuth();
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            const response = await routeService.getAll();
            let allRoutes = response.data.data || response.data;

            if (user && (user.userType === 'Driver' || user.role === 'Driver')) {
                const [assignRes, schedRes] = await Promise.all([
                    assignmentService.getAll(),
                    scheduleService.getAll()
                ]);

                const assignments = assignRes.data.data;
                const schedules = schedRes.data.data;

                // 1. Find buses assigned to this driver
                // Check both id and userId properties for robustness
                const myBusIds = assignments
                    .filter(a => (a.driverId === user.userId || a.driverId === user.id))
                    .map(a => a.busId);

                // 2. Find schedules for these buses
                const myRouteIds = schedules
                    .filter(s => myBusIds.includes(s.busId))
                    .map(s => s.routeId);

                // 3. Filter routes
                allRoutes = allRoutes.filter(r => myRouteIds.includes(r.routeId));
            }

            setRoutes(allRoutes);
        } catch (error) {
            console.error('Failed to fetch routes', error);
            toast.error("Failed to load routes");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            // Ensure specific types
            data.distance = parseFloat(data.distance);
            data.price = parseFloat(data.price);

            if (editingRoute) {
                await routeService.update(editingRoute.routeId, data);
            } else {
                await routeService.create(data);
            }
            fetchRoutes();
            closeModal();
            toast.success(editingRoute ? 'Route updated successfully' : 'Route created successfully');
        } catch (error) {
            console.error('Failed to save route', error);
            toast.error('Failed to save route');
        }
    };

    const openAddModal = () => {
        setEditingRoute(null);
        reset({ origin: '', destination: '', distance: '', price: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (route) => {
        setEditingRoute(route);
        setValue('origin', route.origin);
        setValue('destination', route.destination);
        setValue('distance', route.distance);
        setValue('price', route.price);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRoute(null);
        reset();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this route?')) {
            try {
                await routeService.delete(id);
                toast.success('Route deleted successfully');
                fetchRoutes();
            } catch (error) {
                console.error('Failed to delete route', error);
                toast.error('Failed to delete route');
            }
        }
    };

    const filteredRoutes = routes.filter(route =>
        route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Route Management</h1>
                    <p className="text-slate-500">Create and manage travel routes.</p>
                </div>
                {(user?.userType === 'Admin' || user?.role === 'Admin') && (
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        <span>Add New Route</span>
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by origin or destination..."
                        className="pl-10 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid of Routes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-slate-500">Loading routes...</div>
                ) : filteredRoutes.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-500">No routes found.</div>
                ) : (
                    filteredRoutes.map((route) => (
                        <div key={route.routeId} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Map size={24} />
                                </div>
                                {(user?.userType === 'Admin' || user?.role === 'Admin') && (
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEditModal(route)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(route.routeId)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-slate-900 font-semibold text-lg mb-2">
                                <span>{route.origin}</span>
                                <ArrowRight size={20} className="text-slate-400" />
                                <span>{route.destination}</span>
                            </div>

                            <div className="flex items-center justify-between text-sm text-slate-500 mt-4 pt-4 border-t border-slate-100">
                                <span>{route.distance} km</span>
                                <span className="font-semibold text-slate-900">RWF {route.price}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingRoute ? 'Edit Route' : 'Create Route'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Origin</label>
                            <input
                                {...register('origin', { required: 'Origin is required' })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="From City"
                            />
                            {errors.origin && <p className="text-sm text-red-600 mt-1">{errors.origin.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
                            <input
                                {...register('destination', { required: 'Destination is required' })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="To City"
                            />
                            {errors.destination && <p className="text-sm text-red-600 mt-1">{errors.destination.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Distance (km)</label>
                            <input
                                type="number" step="0.1"
                                {...register('distance', { required: 'Distance is required', min: 0.1 })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="0.0"
                            />
                            {errors.distance && <p className="text-sm text-red-600 mt-1">{errors.distance.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price (RWF)</label>
                            <input
                                type="number" step="0.01"
                                {...register('price', { required: 'Price is required', min: 0.01 })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="0.00"
                            />
                            {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>}
                        </div>
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
                            {editingRoute ? 'Update Route' : 'Create Route'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
