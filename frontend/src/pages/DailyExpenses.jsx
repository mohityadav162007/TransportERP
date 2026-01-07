import { useEffect, useState } from "react";
import api from "../services/api";
import { formatCurrency } from "../utils/format";

export default function DailyExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        category: "",
        amount: "",
        vehicle_number: "",
        notes: ""
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = () => {
        api.get("/expenses")
            .then(res => setExpenses(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await api.post("/expenses", form);
            // Reset form (keep date)
            setForm({ ...form, category: "", amount: "", vehicle_number: "", notes: "" });
            fetchExpenses();
        } catch (err) {
            alert("Failed to add expense");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/expenses/${id}`);
            fetchExpenses();
        } catch (err) {
            alert("Failed to delete");
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">Daily Expenses</h1>

            {/* ADD FORM */}
            <div className="bg-white p-6 rounded shadow">
                <h2 className="font-semibold mb-4">Add New Expense</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Date</label>
                        <input type="date" name="date" required value={form.date} onChange={handleChange} className="input w-full" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Category</label>
                        <input name="category" required placeholder="Fuel, Repair, etc." value={form.category} onChange={handleChange} className="input w-full" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Amount</label>
                        <input type="number" name="amount" required placeholder="0.00" value={form.amount} onChange={handleChange} className="input w-full" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Vehicle (Opt)</label>
                        <input name="vehicle_number" placeholder="Vehicle No." value={form.vehicle_number} onChange={handleChange} className="input w-full" />
                    </div>
                    <div>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700">Add</button>
                    </div>
                </form>
                <div className="mt-3">
                    <input name="notes" placeholder="Additional Notes..." value={form.notes} onChange={handleChange} className="input w-full" />
                </div>
            </div>

            {/* LIST */}
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3">Date</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Vehicle</th>
                            <th className="p-3">Notes</th>
                            <th className="p-3 text-right">Amount</th>
                            <th className="p-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {expenses.map(ex => (
                            <tr key={ex.id} className="hover:bg-gray-50">
                                <td className="p-3">{new Date(ex.date).toLocaleDateString()}</td>
                                <td className="p-3 font-medium">{ex.category}</td>
                                <td className="p-3">{ex.vehicle_number || "-"}</td>
                                <td className="p-3 text-gray-500">{ex.notes}</td>
                                <td className="p-3 text-right font-bold">₹{formatCurrency(ex.amount)}</td>
                                <td className="p-3 text-right">
                                    <button onClick={() => handleDelete(ex.id)} className="text-red-500 hover:text-red-700">×</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
