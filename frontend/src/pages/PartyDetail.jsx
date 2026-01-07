import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { formatCurrency } from "../utils/format";

export default function PartyDetail() {
    const { id } = useParams(); // This assumes we use ID. But Analytics passes name? 
    // Requirement: "When a user clicks on any specific Party row... open dedicated page"
    // Analytics currently has names. Link should use ID ideally.
    // But wait, my implementation plan said "/analytics/party/:name" or ID.
    // My backend logic added `searchParty` and `getParty(id)`.
    // If I link by name, I need a "getPartyByName" or use search.
    // To keep it robust, let's stick to Name or ID. 
    // Since Analytics only has the name available (from trips), 
    // I will use NAME in the URL and fetch by searching/filtering.
    // OR, better: The Analytics page should fetch the ID if possible?
    // No, `trips` table stores `party_name`. It doesn't store `party_id`.
    // So I MUST use name.

    const { name } = useParams();
    const navigate = useNavigate();
    const [party, setParty] = useState(null);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [name]);

    const loadData = async () => {
        try {
            // 1. Fetch Party Details (Mobile) -> search by name
            // Use the search API
            const pRes = await api.get(`/masters/parties?name=${encodeURIComponent(name)}`);
            // Find exact match
            const pMatch = pRes.data.find(p => p.name.toLowerCase() === name.toLowerCase());
            setParty(pMatch || { name: name, mobile: "N/A" });

            // 2. Fetch Trips for this party
            const tRes = await api.get("/trips");
            const partyTrips = tRes.data.filter(t => t.party_name.toLowerCase() === name.toLowerCase());
            setTrips(partyTrips);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="space-y-6">
            {/* TOP SECTION: Summary */}
            <div className="bg-white p-6 rounded shadow flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">{name}</h1>
                    <p className="text-gray-500">Party</p>
                </div>
                <div className="text-right">
                    <div className="text-lg font-semibold">Total Trips: {trips.length}</div>
                </div>
            </div>

            {/* MIDDLE SECTION: Personal Details */}
            <div className="bg-white p-6 rounded shadow">
                <h2 className="font-semibold mb-4 border-b pb-2">Details</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-500 block">Name</label>
                        <div className="font-medium">{party?.name}</div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500 block">Mobile</label>
                        <div className="font-medium">{party?.mobile || "-"}</div>
                    </div>
                </div>
            </div>

            {/* BOTTOM SECTION: Trips List */}
            <div className="bg-white rounded shadow overflow-hidden">
                <h2 className="font-semibold p-4 border-b bg-gray-50">Trip History</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3">Date</th>
                                <th className="p-3">Trip Code</th>
                                <th className="p-3">Route</th>
                                <th className="p-3">Vehicle</th>
                                <th className="p-3 text-right">Freight</th>
                                <th className="p-3 text-right">Balance</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {trips.length === 0 ? (
                                <tr><td colSpan="7" className="p-4 text-center text-gray-500">No trips found.</td></tr>
                            ) : (
                                trips.map(t => (
                                    <tr key={t.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/trips/${t.id}`)}>
                                        <td className="p-3">{new Date(t.loading_date).toLocaleDateString()}</td>
                                        <td className="p-3 font-medium text-blue-600">{t.trip_code || t.id}</td>
                                        <td className="p-3">{t.from_location} → {t.to_location}</td>
                                        <td className="p-3">{t.vehicle_number}</td>
                                        <td className="p-3 text-right">₹{formatCurrency(t.party_freight)}</td>
                                        <td className="p-3 text-right font-semibold text-red-600">₹{formatCurrency(t.party_balance)}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${(t.party_payment_status || t.payment_status) === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {t.party_payment_status || t.payment_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
