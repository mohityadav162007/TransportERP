import { useEffect, useState } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Menu, X, LogOut, User } from "lucide-react";

export default function Header() {
  const [status, setStatus] = useState("CHECKING");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkHealth = () => {
      api.get("/health")
        .then(() => setStatus("ONLINE"))
        .catch(() => setStatus("OFFLINE"));
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000); // every 10s

    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { name: "Dashboard", path: "/" },
    { name: "Trips", path: "/trips" },
    { name: "Analytics", path: "/analytics" },
    { name: "Reports", path: "/reports" },
    { name: "Payment History", path: "/payment-history" },
    { name: "Daily Expenses", path: "/expenses" },
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="px-6 py-3 flex items-center justify-between">

        {/* Left: Logo & Navigation */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            {location.pathname !== "/" && (
              <button
                onClick={() => navigate(-1)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                title="Go Back"
              >
                <span className="text-xl">←</span>
              </button>
            )}
            <div className="font-bold text-xl text-gray-800 tracking-tight">
              Transport ERP
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                    ? "bg-slate-100 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right: System Status & User Profile */}
        <div className="flex items-center gap-6">
          {/* System Status */}
          <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === "ONLINE" ? "bg-green-400" : status === "OFFLINE" ? "bg-red-400" : "bg-gray-400"
                }`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status === "ONLINE" ? "bg-green-500" : status === "OFFLINE" ? "bg-red-500" : "bg-gray-500"
                }`}></span>
            </span>
            <span
              className={`text-xs font-semibold ${status === "OFFLINE" ? "text-red-600" : "text-gray-700"
                }`}
            >
              {status === "ONLINE"
                ? "System Online"
                : status === "OFFLINE"
                  ? "Database Down"
                  : "Checking..."}
            </span>
          </div>

          {/* User Profile */}
          {user && (
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-gray-800 leading-tight">Admin</span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
