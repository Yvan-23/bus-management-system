import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Ticket, Calendar, Map, CheckCircle, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../api/client';
import { scheduleService, busService, routeService } from '../api/services';
import Modal from '../components/Modal';

const ticketService = {
    getAll: () => api.get('/Tickets'), // Admin probably
    getMyTickets: () => api.get('/Tickets/my-tickets'),
    purchase: (data) => api.post('/Tickets/purchase', data)
};

export default function Tickets() {
    const [tickets, setTickets] = useState([]);
    const [schedules, setSchedules] = useState([]); // Available schedules for purchase
    const [loading, setLoading] = useState(true);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);

    // Auxiliary data for display
    const [routes, setRoutes] = useState([]);

    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        fetchMyTickets();
    }, []);

    const fetchMyTickets = async () => {
        try {
            const res = await ticketService.getMyTickets();
            setTickets(res.data.data);

            // Also fetch auxiliary data to show route details if not in ticket object
            // Swagger response schema for Ticket isn't fully detailed in 800 lines but usually contains ID or nested object.
            // We will assume it returns basics and we might need to fetch Routes/Schedules to map IDs if needed.
            // But for "Purchase" we need to list Schedules.
        } catch (error) {
            console.error("Failed to fetch tickets", error);
            if (error.response && error.response.status === 403) {
                // Admin might not have "my tickets" if they are not a passenger?
                // Or token is valid but role is wrong.
                console.warn("User does not have permission to view tickets (403).");
            }
        } finally {
            setLoading(false);
        }
    };

    const openPurchaseModal = async () => {
        setIsPurchaseModalOpen(true);
        // Fetch available schedules
        try {
            const [schedRes, routeRes] = await Promise.all([
                scheduleService.getAll(),
                routeService.getAll()
            ]);
            setSchedules(schedRes.data.data);
            setRoutes(routeRes.data.data);
        } catch (e) {
            console.error("Failed to load schedules", e);
        }
    };

    const handlePurchase = async () => {
        if (!selectedSchedule) return;
        try {
            await ticketService.purchase({ scheduleId: selectedSchedule.scheduleId });
            toast.success("Ticket Purchased Successfully!");
            setIsPurchaseModalOpen(false);
            fetchMyTickets();
        } catch (e) {
            console.error("Purchase failed", e);
            toast.error(e.response?.data?.message || "Failed to purchase ticket.");
        }
    };

    const downloadTicket = (ticket) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(79, 70, 229); // Indigo-600
        doc.text("Bus Ticket", 105, 20, { align: "center" });

        // Ticket Details Box
        doc.setDrawColor(200, 200, 200);
        doc.rect(20, 30, 170, 100);

        // Ticket Info
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        doc.setFont("helvetica", "bold");
        doc.text("Ticket Number:", 30, 45);
        doc.setFont("helvetica", "normal");
        doc.text(`#${ticket.ticketNumber || ticket.ticketId}`, 80, 45);

        doc.setFont("helvetica", "bold");
        doc.text("Date Issued:", 120, 45);
        doc.setFont("helvetica", "normal");
        doc.text(format(new Date(ticket.dateIssued), 'P'), 160, 45);

        // Line
        doc.setDrawColor(230, 230, 230);
        doc.line(30, 50, 180, 50);

        // Route
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(`${ticket.origin}  -->  ${ticket.destination}`, 105, 65, { align: "center" });

        // Details
        doc.setFontSize(12);

        doc.setFont("helvetica", "bold");
        doc.text("Passenger:", 30, 85);
        doc.setFont("helvetica", "normal");
        doc.text(ticket.clientName || "N/A", 80, 85);

        doc.setFont("helvetica", "bold");
        doc.text("Bus Number:", 30, 95);
        doc.setFont("helvetica", "normal");
        doc.text(ticket.busNumber || "N/A", 80, 95);

        doc.setFont("helvetica", "bold");
        doc.text("Departure:", 30, 105);
        doc.setFont("helvetica", "normal");
        doc.text(format(new Date(ticket.departureTime), 'PP p'), 80, 105);

        doc.setFont("helvetica", "bold");
        doc.text("Status:", 120, 85);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(ticket.status === 'Active' ? 0 : 100, ticket.status === 'Active' ? 150 : 0, 0);
        doc.text(ticket.status || "Booked", 160, 85);

        // Price
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(`RWF ${ticket.pricePaid.toFixed(2)}`, 160, 115, { align: "right" });

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("Thank you for traveling with us!", 105, 125, { align: "center" });

        const filename = `BusTicket_${Date.now()}`;
        doc.save(`${filename}.pdf`);
    };

    // Helper to get route info for a schedule
    const getRouteInfo = (routeId) => {
        const r = routes.find(x => x.routeId === routeId);
        return r ? `${r.origin} → ${r.destination} ($${r.price})` : `Route #${routeId}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Tickets</h1>
                    <p className="text-slate-500">View your bookings and purchase new tickets.</p>
                </div>
                <button
                    onClick={openPurchaseModal}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Ticket size={20} />
                    <span>Buy Ticket</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-slate-500">Loading tickets...</div>
                ) : tickets.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                <Ticket size={32} />
                            </div>
                            <p>You haven't purchased any tickets yet.</p>
                            <button onClick={openPurchaseModal} className="text-indigo-600 hover:text-indigo-700 font-medium">Browse Schedules</button>
                        </div>
                    </div>
                ) : (
                    tickets.map(ticket => (
                        <div key={ticket.ticketId} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Ticket size={120} />
                            </div>

                            <div className="flex justify-between items-start z-10">
                                <div>
                                    <div className="text-xs font-bold text-indigo-600 tracking-wider uppercase mb-1">Ticket #{ticket.ticketNumber}</div>
                                    <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                                        <span>{ticket.origin}</span>
                                        <div className="text-slate-400">→</div>
                                        <span>{ticket.destination}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">Bus: {ticket.busNumber}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-indigo-600">RWF {ticket.pricePaid.toFixed(2)}</div>
                                    <div className="text-xs text-slate-500">{ticket.status}</div>
                                </div>
                            </div>

                            <div className="space-y-3 border-t border-slate-100 pt-4 z-10">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Calendar size={18} className="text-indigo-400" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400 uppercase font-semibold">Departure</span>
                                        <span className="text-sm font-medium">{format(new Date(ticket.departureTime), 'PPP p')}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Map size={18} className="text-indigo-400" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400 uppercase font-semibold">Traveler</span>
                                        <span className="text-sm font-medium">{ticket.clientName}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-4 flex items-center justify-between z-10">
                                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                    <CheckCircle size={16} />
                                    <span>Issued {format(new Date(ticket.dateIssued), 'P')}</span>
                                </div>
                                <button
                                    onClick={() => downloadTicket(ticket)}
                                    className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium"
                                    title="Download PDF"
                                >
                                    <Download size={16} />
                                    <span>Download</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal isOpen={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)} title="Select a Trip">
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {schedules.length === 0 ? <p className="text-slate-500">No schedules available.</p> :
                        schedules.map(schedule => {
                            const route = routes.find(r => r.routeId === schedule.routeId);
                            if (!route) return null;
                            return (
                                <div
                                    key={schedule.scheduleId}
                                    onClick={() => setSelectedSchedule(schedule)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedSchedule?.scheduleId === schedule.scheduleId ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-indigo-300'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-slate-900">{route.origin} <span className="text-slate-400">→</span> {route.destination}</span>
                                        <span className="font-bold text-indigo-600">RWF {route.price}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Calendar size={14} />
                                        <span>{format(new Date(schedule.departureTime), 'Pp')}</span>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                    <button
                        onClick={() => setIsPurchaseModalOpen(false)}
                        className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePurchase}
                        disabled={!selectedSchedule}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Purchase Ticket
                    </button>
                </div>
            </Modal>
        </div>
    );
}
