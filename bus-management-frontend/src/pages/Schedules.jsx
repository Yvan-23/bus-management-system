import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, Calendar, Search, ArrowRight, Bus as BusIcon } from 'lucide-react';
import { format } from 'date-fns';
import { scheduleService, busService, routeService } from '../api/services';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

export default function Schedules() {
    const [schedules, setSchedules] = useState([]);
    const [buses, setBuses] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [schedRes, busRes, routeRes] = await Promise.all([
                scheduleService.getAll(),
                busService.getAll(),
                routeService.getAll()
            ]);
            setSchedules(schedRes.data.data);
            setBuses(busRes.data.data);
            setRoutes(routeRes.data.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
            toast.error('Failed to load schedule data');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            data.busId = parseInt(data.busId);
            data.routeId = parseInt(data.routeId);
            // Ensure dates are in ISO format if needed, input type datetime-local produces YYYY-MM-DDTHH:mm
            data.departureTime = new Date(data.departureTime).toISOString();
            data.arrivalTime = new Date(data.arrivalTime).toISOString();

            if (editingSchedule) {
                await scheduleService.update(editingSchedule.scheduleId, data);
            } else {
                await scheduleService.create(data);
            }
            fetchData(); // Refresh all data
            closeModal();
            toast.success(editingSchedule ? 'Schedule updated successfully' : 'Schedule created successfully');
        } catch (error) {
            console.error('Failed to save schedule', error);
            toast.error('Failed to save schedule');
        }
    };

    const openAddModal = () => {
        setEditingSchedule(null);
        reset({ busId: '', routeId: '', departureTime: '', arrivalTime: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (schedule) => {
        setEditingSchedule(schedule);
        setValue('busId', schedule.busId);
        setValue('routeId', schedule.routeId);
        // Format for datetime-local: YYYY-MM-DDTHH:mm
        setValue('departureTime', new Date(schedule.departureTime).toISOString().slice(0, 16));
        setValue('arrivalTime', new Date(schedule.arrivalTime).toISOString().slice(0, 16));
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSchedule(null);
        reset();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this schedule?')) {
            try {
                await scheduleService.delete(id);
                toast.success('Schedule deleted successfully');
                fetchData();
            } catch (error) {
                console.error('Failed to delete schedule', error);
                toast.error('Failed to delete schedule');
            }
        }
    };

    // Helper to find related data
    const getBusNumber = (id) => buses.find(b => b.busId === id)?.busNumber || 'Unknown Bus';
    const getRouteDetails = (id) => {
        const route = routes.find(r => r.routeId === id);
        return route ? `${route.origin} → ${route.destination}` : 'Unknown Route';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Schedule Management</h1>
                    <p className="text-slate-500">Plan and manage trip schedules.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    <span>Add New Schedule</span>
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Route</th>
                                <th className="px-6 py-4">Bus</th>
                                <th className="px-6 py-4">Departure</th>
                                <th className="px-6 py-4">Arrival</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading schedules...</td></tr>
                            ) : schedules.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No schedules found.</td></tr>
                            ) : (
                                schedules.map((schedule) => (
                                    <tr key={schedule.scheduleId} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {getRouteDetails(schedule.routeId)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                <BusIcon size={12} />
                                                {getBusNumber(schedule.busId)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {format(new Date(schedule.departureTime), 'PP p')}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {format(new Date(schedule.arrivalTime), 'PP p')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(schedule)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(schedule.scheduleId)}
                                                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingSchedule ? 'Edit Schedule' : 'Create Schedule'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Route</label>
                        <select
                            {...register('routeId', { required: 'Route is required' })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            <option value="">Select a route...</option>
                            {routes.map(r => (
                                <option key={r.routeId} value={r.routeId}>{r.origin} - {r.destination} (RWF {r.price})</option>
                            ))}
                        </select>
                        {errors.routeId && <p className="text-sm text-red-600 mt-1">{errors.routeId.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Bus</label>
                        <select
                            {...register('busId', { required: 'Bus is required' })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            <option value="">Select a bus...</option>
                            {buses.map(b => (
                                <option key={b.busId} value={b.busId}>{b.busNumber} ({b.model})</option>
                            ))}
                        </select>
                        {errors.busId && <p className="text-sm text-red-600 mt-1">{errors.busId.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Departure Time</label>
                            <input
                                type="datetime-local"
                                {...register('departureTime', { required: 'Departure time is required' })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            {errors.departureTime && <p className="text-sm text-red-600 mt-1">{errors.departureTime.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Arrival Time</label>
                            <input
                                type="datetime-local"
                                {...register('arrivalTime', { required: 'Arrival time is required' })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            {errors.arrivalTime && <p className="text-sm text-red-600 mt-1">{errors.arrivalTime.message}</p>}
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
                            {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
