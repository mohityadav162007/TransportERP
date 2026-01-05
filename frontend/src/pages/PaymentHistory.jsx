import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { formatCurrency } from "../utils/format";

export default function PaymentHistory() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        type: "ALL",
        fromDate: "",
        toDate: "",
        vehicle: ""
    });

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.type !== "ALL") params.append("type", filters.type);
            if (filters.fromDate) params.append("fromDate", filters.fromDate);
            if (filters.toDate) params.append("toDate", filters.toDate);
            if (filters.vehicle) params.append("vehicle", filters.vehicle);

            const res = await api.get(`/payment-history?${params.toString()}`);
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to fetch payment history:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const applyFilters = () => {
        fetchHistory();
    };

    const clearFilters = () => {
        setFilters({
            type: "ALL",
            fromDate: "",
            toDate: "",
            vehicle: ""
        });
        setTimeout(() => fetchHistory(), 100);
    };

    const exportToExcel = () => {
        const params = new URLSearchParams();
        if (filters.type !== "ALL") params.append("type", filters.type);
        if (filters.fromDate) params.append("fromDate", filters.fromDate);
        if (filters.toDate) params.append("toDate", filters.toDate);
        if (filters.vehicle) params.append("vehicle", filters.vehicle);

        const token = localStorage.getItem("token");
        params.append("token", token);

        window.open(`${import.meta.env.VITE_API_URL}/payment-history/export?${params.toString()}`, "_blank");
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB");
    };

    const formatDateWithParentheses = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `(${day} ${month} ${year})`;
    };

    if (loading) {
        return <div className="p-6">Loading payment history...</div>;
    }

    return (
        <div className="max-w-7xl space-y-6">
            <h1 className="text-2xl font-bold">Payment History</h1>

            {/* Filters */}
            <div className="bg-white border rounded p-5">
                <h2 className="font-semibold mb-4">Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm mb-1">Transaction Type</label>
                        <select
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            className="input w-full"
                        >
                            <option value="ALL">All</option>
                            <option value="CREDIT">Credit</option>
                            <option value="DEBIT">Debit</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">From Date</label>
                        <input
                            type="date"
                            name="fromDate"
                            value={filters.fromDate}
                            onChange={handleFilterChange}
                            className="input w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">To Date</label>
                        <input
                            type="date"
                            name="toDate"
                            value={filters.toDate}
                            onChange={handleFilterChange}
                            className="input w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Vehicle Number</label>
                        <input
                            type="text"
                            name="vehicle"
                            value={filters.vehicle}
                            onChange={handleFilterChange}
                            placeholder="Search vehicle..."
                            className="input w-full"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-4">
                    <button
                        onClick={applyFilters}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Apply Filters
                    </button>
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 border rounded hover:bg-gray-50"
                    >
                        Clear
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Export to Excel
                    </button>
                </div>
            </div>

            {/* Payment History Cards */}
            <div className="space-y-3">
                {history.length === 0 ? (
                    <div className="bg-white border rounded p-8 text-center text-gray-500">
                        No payment history found
                    </div>
                ) : (
                    history.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => navigate(`/trips/${item.trip_id}`)}
                            className="bg-white border rounded p-4 cursor-pointer hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-900">
                                            {item.payment_type} - {item.vehicle_number}
                                        </span>
                                        <span className="text-gray-600">
                                            {formatDateWithParentheses(item.loading_date)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-700 mb-1">
                                        {item.trip_code}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {formatDate(item.transaction_date)}
                                    </div>
                                </div>
                                <div className={`text-xl font-bold ${item.transaction_type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    ₹{formatCurrency(item.amount)}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
