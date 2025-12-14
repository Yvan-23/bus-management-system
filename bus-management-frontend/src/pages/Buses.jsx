import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, Bus as BusIcon, Search } from 'lucide-react';
import { busService } from '../api/services';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

export default function Buses() {
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBus, setEditingBus] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        fetchBuses();
    }, []);

    const fetchBuses = async () => {
        try {
            const response = await busService.getAll();
            setBuses(response.data.data);
        } catch (error) {
            console.error('Failed to fetch buses', error);
            toast.error('Failed to load buses');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            // Ensure capacity is integer
            data.capacity = parseInt(data.capacity);

            if (editingBus) {
                await busService.update(editingBus.busId, data);
            } else {
                await busService.create(data);
            }
            fetchBuses();
            closeModal();
            toast.success(editingBus ? 'Bus updated successfully' : 'Bus created successfully');
        } catch (error) {
            console.error('Failed to save bus', error);
            toast.error('Failed to save bus');
        }
    };

    const openAddModal = () => {
        setEditingBus(null);
        reset({ busNumber: '', model: '', capacity: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (bus) => {
        setEditingBus(bus);
        setValue('busNumber', bus.busNumber);
        setValue('model', bus.model);
        setValue('capacity', bus.capacity);
        setValue('status', bus.status);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBus(null);
        reset();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this bus?')) {
            try {
                await busService.delete(id);
                toast.success('Bus deleted successfully');
                fetchBuses();
            } catch (error) {
                console.error('Failed to delete bus', error);
                toast.error('Failed to delete bus');
            }
        }
    };

    const filteredBuses = buses.filter(bus =>
        bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Bus Fleet</h1>
                    <p className="text-slate-500">Manage your buses and their status.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
                >
                    <Plus size={20} />
                    <span>Add New Bus</span>
                </button>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by bus number or model..."
                        className="pl-10 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Bus Details</th>
                                <th className="px-6 py-4">Capacity</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
                            ) : filteredBuses.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No buses found.</td></tr>
                            ) : (
                                filteredBuses.map((bus) => (
                                    <tr key={bus.busId} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <BusIcon size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">{bus.busNumber}</div>
                                                    <div className="text-slate-500">{bus.model}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                {bus.capacity} seats
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bus.status?.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {bus.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(bus)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(bus.busId)}
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

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingBus ? 'Edit Bus' : 'Add New Bus'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Bus Number</label>
                        <input
                            {...register('busNumber', { required: 'Bus Number is required' })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g. BUS-001"
                        />
                        {errors.busNumber && <p className="text-sm text-red-600 mt-1">{errors.busNumber.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                        <input
                            {...register('model', { required: 'Model is required' })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g. Mercedes Benz"
                        />
                        {errors.model && <p className="text-sm text-red-600 mt-1">{errors.model.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                        <input
                            type="number"
                            {...register('capacity', { required: 'Capacity is required', min: 1, max: 100 })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="50"
                        />
                        {errors.capacity && <p className="text-sm text-red-600 mt-1">{errors.capacity.message}</p>}
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
                            {editingBus ? 'Update Bus' : 'Create Bus'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
