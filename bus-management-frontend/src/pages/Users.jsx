import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Edit2, Shield, User, Trash2 } from 'lucide-react';
import { userService } from '../api/services';
import Modal from '../components/Modal';
import api from '../api/client';
import toast from 'react-hot-toast';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    // Permission management
    const [permissions, setPermissions] = useState([]);
    const [isPermModalOpen, setIsPermModalOpen] = useState(false);
    const [selectedUserForPerms, setSelectedUserForPerms] = useState(null);
    const [selectedPerms, setSelectedPerms] = useState([]);

    useEffect(() => {
        fetchUsers();
        fetchPermissions();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await userService.getAll();
            setUsers(response.data.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            const res = await api.get('/Users/permissions/available');
            if (res.data.data && Array.isArray(res.data.data)) {
                setPermissions(res.data.data);
            } else if (Array.isArray(res.data)) {
                // Fallback if not wrapped
                setPermissions(res.data);
            }
        } catch (e) {
            console.error("Failed to load permissions", e);
        }
    };

    const onDelete = async (id) => {
        if (window.confirm("Delete this user?")) {
            try {
                await userService.delete(id);
                toast.success('User deleted successfully');
                fetchUsers();
            } catch (error) {
                console.error('Failed to delete user', error);
                toast.error('Failed to delete user');
            }
        }
    }

    const onUpdate = async (data) => {
        try {
            await userService.update(editingUser.id, data);
            fetchUsers();
            closeModal();
            toast.success('User updated successfully');
        } catch (e) {
            console.error("Update failed", e);
            toast.error('Update failed');
        }
    };

    const managePermissions = (user) => {
        setSelectedUserForPerms(user);
        setSelectedPerms(user.permissions || []);
        setIsPermModalOpen(true);
    };

    const savePermissions = async () => {
        try {
            const userId = selectedUserForPerms.id || selectedUserForPerms.userId;
            await api.put(`/Users/${userId}/permissions`, { permissions: selectedPerms });
            fetchUsers();
            setIsPermModalOpen(false);
            toast.success('Permissions updated successfully');
        } catch (e) {
            console.error("Failed to save permissions", e);
            toast.error('Failed to save permissions');
        }
    };

    const togglePerm = (permName) => {
        if (selectedPerms.includes(permName)) {
            setSelectedPerms(selectedPerms.filter(p => p !== permName));
        } else {
            setSelectedPerms([...selectedPerms, permName]);
        }
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setValue('name', user.name);
        setValue('phone', user.phone);
        setValue('isActive', user.isActive);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                <p className="text-slate-500">Manage users and permissions.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role / Type</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{user.name}</div>
                                            <div className="text-slate-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                        {user.userType}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => managePermissions(user)} className="p-2 text-slate-400 hover:text-indigo-600" title="Permissions">
                                            <Shield size={18} />
                                        </button>
                                        <button onClick={() => openEditModal(user)} className="p-2 text-slate-400 hover:text-indigo-600">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => onDelete(user.id)} className="p-2 text-slate-400 hover:text-red-600">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit User Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title="Edit User">
                <form onSubmit={handleSubmit(onUpdate)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Name</label>
                        <input {...register('name')} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Phone</label>
                        <input {...register('phone')} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" {...register('isActive')} id="isActive" className="rounded border-slate-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                        <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active Account</label>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
                    </div>
                </form>
            </Modal>

            {/* Permissions Modal */}
            {isPermModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                        <h3 className="text-xl font-bold mb-4">Manage Permissions for {selectedUserForPerms?.name}</h3>
                        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                            {permissions.length === 0 ? <p className="text-slate-500">No permissions available.</p> :
                                permissions.map(p => (
                                    <div key={p.name} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded">
                                        <input
                                            type="checkbox"
                                            checked={selectedPerms.includes(p.name)}
                                            onChange={() => togglePerm(p.name)}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <div>
                                            <span className="font-medium block text-slate-900">{p.name}</span>
                                            <span className="text-xs text-slate-500">{p.description}</span>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsPermModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                            <button onClick={savePermissions} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Permissions</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
