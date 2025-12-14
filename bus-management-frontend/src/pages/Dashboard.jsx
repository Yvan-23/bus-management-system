import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { busService, routeService, scheduleService, userService, assignmentService } from '../api/services';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { Bus, Map, Calendar, Users, TrendingUp, AlertCircle, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// --- Admin Dashboard Component ---
const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        buses: [],
        routes: [],
        schedules: [],
        users: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [busRes, routeRes, schedRes, userRes] = await Promise.all([
                    busService.getAll(),
                    routeService.getAll(),
                    scheduleService.getAll(),
                    userService.getAll()
                ]);

                setStats({
                    buses: busRes.data.data || [],
                    routes: routeRes.data.data || [],
                    schedules: schedRes.data.data || [],
                    users: userRes.data.data || []
                });
            } catch (error) {
                console.error("Dashboard data fetch failed", error);
                toast.error("Failed to load dashboard analytics");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="text-center py-12 text-indigo-600">Loading Analytics...</div>;

    // Charts Data
    const busStatusData = [
        { name: 'Active', value: stats.buses.filter(b => b.status === 'Active' || !b.status).length },
        { name: 'Maintenance', value: stats.buses.filter(b => b.status === 'Maintenance').length },
        { name: 'Inactive', value: stats.buses.filter(b => b.status === 'Inactive').length }
    ].filter(d => d.value > 0);
    const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

    const routeScheduleCounts = stats.routes.map(r => ({
        name: r.origin.substring(0, 3) + '-' + r.destination.substring(0, 3),
        fullRoute: `${r.origin} → ${r.destination}`,
        count: stats.schedules.filter(s => s.routeId === r.routeId).length
    })).sort((a, b) => b.count - a.count).slice(0, 10);

    const routeEconomics = stats.routes.map(r => ({
        name: r.destination,
        price: r.price,
        distance: r.distance
    })).sort((a, b) => a.distance - b.distance);

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-500">System overview and analytics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Bus size={24} /></div>
                    <div><div className="text-sm text-slate-500">Total Buses</div><div className="text-2xl font-bold text-slate-900">{stats.buses.length}</div></div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg"><Map size={24} /></div>
                    <div><div className="text-sm text-slate-500">Total Routes</div><div className="text-2xl font-bold text-slate-900">{stats.routes.length}</div></div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Calendar size={24} /></div>
                    <div><div className="text-sm text-slate-500">Scheduled Trips</div><div className="text-2xl font-bold text-slate-900">{stats.schedules.length}</div></div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><Users size={24} /></div>
                    <div><div className="text-sm text-slate-500">Total Users</div><div className="text-2xl font-bold text-slate-900">{stats.users.length}</div></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[300px]">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Bus Fleet Status</h3>
                    <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={busStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{busStatusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[300px]">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Popular Routes</h3>
                    <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={routeScheduleCounts} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={80} /><Tooltip /><Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Trips" /></BarChart></ResponsiveContainer></div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[300px] lg:col-span-2">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Price vs Distance</h3>
                    <div className="h-64"><ResponsiveContainer width="100%" height="100%"><AreaChart data={routeEconomics}><defs><linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="distance" /><YAxis /><CartesianGrid strokeDasharray="3 3" /><Tooltip /><Area type="monotone" dataKey="price" stroke="#8b5cf6" fill="url(#colorPrice)" /></AreaChart></ResponsiveContainer></div>
                </div>
            </div>
        </div>
    );
};

// --- Driver Dashboard Component ---
const DriverDashboard = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [myAssignments, setMyAssignments] = useState([]);
    const [mySchedules, setMySchedules] = useState([]);
    const [myBuses, setMyBuses] = useState([]);

    useEffect(() => {
        const fetchDriverData = async () => {
            try {
                const [assignRes, busRes, schedRes, routeRes] = await Promise.all([
                    assignmentService.getAll(),
                    busService.getAll(),
                    scheduleService.getAll(),
                    routeService.getAll()
                ]);

                const allAssignments = assignRes.data.data || [];
                const allBuses = busRes.data.data || [];
                const allSchedules = schedRes.data.data || [];
                const allRoutes = routeRes.data.data || [];

                // Filter assignments for this driver
                const myAssigns = allAssignments.filter(a => (a.driverId === user.id || a.driverId === user.userId));
                setMyAssignments(myAssigns);

                // Derived Buses
                const myBusIds = myAssigns.map(a => a.busId);
                const busses = allBuses.filter(b => myBusIds.includes(b.busId));
                setMyBuses(busses);

                // Derived Schedules
                const schedules = allSchedules.filter(s => myBusIds.includes(s.busId));

                // Enhance Schedules with Route Info
                const enhancedSchedules = schedules.map(s => {
                    const r = allRoutes.find(route => route.routeId === s.routeId);
                    return { ...s, route: r };
                });

                setMySchedules(enhancedSchedules);

            } catch (error) {
                console.error("Driver data fetch failed", error);
                toast.error("Failed to load your dashboard");
            } finally {
                setLoading(false);
            }
        };
        fetchDriverData();
    }, [user]);

    if (loading) return <div className="text-center py-12 text-indigo-600">Loading Your Dashboard...</div>;

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Welcome, {user.name}</h1>
                <p className="text-slate-500">Here are your assigned buses and upcoming trips.</p>
            </div>

            {/* Buses Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {myBuses.length === 0 ? (
                    <div className="col-span-full bg-yellow-50 p-4 rounded-lg text-yellow-700 flex items-center gap-2">
                        <AlertCircle size={20} />
                        <span>You are not currently assigned to any buses.</span>
                    </div>
                ) : (
                    myBuses.map(bus => (
                        <div key={bus.busId} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm border-l-4 border-l-indigo-600">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Assigned Bus</span>
                                <Bus size={20} className="text-slate-400" />
                            </div>
                            <div className="text-2xl font-bold text-slate-900">{bus.busNumber}</div>
                            <div className="text-sm text-slate-500 mt-1">{bus.model} • {bus.capacity} Seats</div>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${bus.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {bus.status || 'Active'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Upcoming Schedules Section */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Calendar size={24} className="text-indigo-600" />
                    Upcoming Trips
                </h2>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {mySchedules.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No upcoming schedules found for your buses.</div>
                    ) : (
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Route</th>
                                    <th className="px-6 py-4">Departure</th>
                                    <th className="px-6 py-4">Arrival</th>
                                    <th className="px-6 py-4">Assigned Bus</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {mySchedules.map(schedule => (
                                    <tr key={schedule.scheduleId} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {schedule.route ? (
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={16} className="text-indigo-500" />
                                                    {schedule.route.origin} → {schedule.route.destination}
                                                </div>
                                            ) : 'Unknown Route'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {format(new Date(schedule.departureTime), 'PP p')}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {format(new Date(schedule.arrivalTime), 'PP p')}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {myBuses.find(b => b.busId === schedule.busId)?.busNumber || `#${schedule.busId}`}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Container ---
export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;
        // Redirect only non-admin and non-driver
        if (user.userType !== 'Admin' && user.role !== 'Admin' && user.userType !== 'Driver' && user.role !== 'Driver') {
            navigate('/tickets');
        }
    }, [user, navigate]);

    if (!user) return null;

    if (user.userType === 'Driver' || user.role === 'Driver') {
        return <DriverDashboard user={user} />;
    }

    return <AdminDashboard />;
}
