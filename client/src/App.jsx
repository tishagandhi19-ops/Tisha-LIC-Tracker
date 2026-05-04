import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import {
  Search, Users, LogOut, FileSpreadsheet, Trash2,
  ArrowLeft, CheckCircle2, Circle, RefreshCw,
  ChevronDown, Activity, AlertCircle, Calendar,
  Plus, X, Edit, LayoutDashboard, Menu, Wallet,
  TrendingUp, CreditCard, ChevronRight, UserCircle,
  Briefcase,
  Download,
  Phone,
  Mail, 
} from 'lucide-react';

// --- API Configuration ---
const BASE_URL = 'https://lic-tracker-vlp3.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
});

// Interceptor to inject token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// --- Shared UI Components ---
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-24 text-blue-600">
    <RefreshCw className="animate-spin mb-4" size={32} />
    <p className="text-slate-500 font-medium text-sm animate-pulse">Loading data...</p>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 p-6 rounded-xl flex flex-col items-center justify-center text-center max-w-md mx-auto my-8">
    <AlertCircle className="text-red-500 mb-3" size={36} />
    <p className="text-red-700 font-medium mb-5">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="px-5 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg font-medium transition-colors text-sm shadow-sm">
        Try Again
      </button>
    )}
  </div>
);

// --- 0. Auth Page ---
const AuthPage = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
     if (isLoginMode) {
        const res = await axios.post(`${BASE_URL}/login`, { email, password });

        // Save the token
        localStorage.setItem('token', res.data.token);

        // Save the user details (convert object to string first)
        localStorage.setItem('user', JSON.stringify(res.data.admin));

        onLogin();
      } else {
        await axios.post(`${BASE_URL}/register`, { email, password });
        setSuccessMsg('Registration successful! You can now log in.');
        setIsLoginMode(true);
        setPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || `${isLoginMode ? 'Login' : 'Registration'} failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Activity className="text-white" size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
          {isLoginMode ? 'Welcome Back' : 'Create an Account'}
        </h2>
        <p className="text-center text-slate-500 mb-8 text-sm">
          {isLoginMode ? 'Enter your credentials to access the dashboard.' : 'Register to start managing policies.'}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3.5 rounded-lg mb-5 text-sm flex items-start gap-2.5 border border-red-100">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 text-green-700 p-3.5 rounded-lg mb-5 text-sm flex items-start gap-2.5 border border-green-100">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input
              type="email" required
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-slate-800 bg-slate-50/50"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <input
              type="password" required
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-slate-800 bg-slate-50/50"
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-70 flex justify-center items-center gap-2 mt-2 shadow-sm shadow-blue-600/20"
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : (isLoginMode ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => { setIsLoginMode(!isLoginMode); setError(''); setSuccessMsg(''); }}
            className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            {isLoginMode ? 'Register here' : 'Log in here'}
          </button>
        </div>
      </div>
    </div>
  );
};



const DashboardPage = () => {
  const [metrics, setMetrics] = useState({ totalUsers: 0, totalInvestment: 0, totalLeft: 0, activePolicies: 0 });
  const [loading, setLoading] = useState(true);
  const [animateChart, setAnimateChart] = useState(false);
  const [policyCount, setPolicyCount] = useState(0);
useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/users');
      const users = res.data;
    

      let inv = 0;
      let left = 0;

      users.forEach(u => {
        inv += (u.totalInvestmentAmount || 0);
        left += (u.leftInvestmentAmount || 0);
      });

      setMetrics(prev => ({
        ...prev,
        totalUsers: users.length,
        totalInvestment: inv,
        totalLeft: left,
      }));

    } catch (err) {
      console.error("Dashboard data fetch error", err);
    } finally {
      setLoading(false);
      setTimeout(() => setAnimateChart(true), 100);
    }
  };

  fetchDashboardData();
}, []);

useEffect(() => {
  fetchPolicesCount();
}, []);

const fetchPolicesCount = async () => { 
  try {
    const res = await api.get('/policiesCount');

    setPolicyCount(res.data.totalPolicies);

    // ✅ FIX HERE
    setMetrics(prev => ({
      ...prev,
      activePolicies: res.data.totalPolicies
    }));

  } catch (err) {
    console.error("Error fetching policies count:", err);
  }
};

  if (loading) return <LoadingSpinner />;

  // --- Calculations ---
  const totalAmount = metrics.totalInvestment + metrics.totalLeft;
  const investmentPercent = totalAmount > 0 ? (metrics.totalInvestment / totalAmount) * 100 : 0;
  const leftPercent = totalAmount > 0 ? (metrics.totalLeft / totalAmount) * 100 : 0;
  const avgInvestmentPerUser = metrics.totalUsers > 0 ? (metrics.totalInvestment / metrics.totalUsers) : 0;

  // SVG properties for Donut Chart
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const invDashValue = (investmentPercent / 100) * circumference;
  const leftDashValue = (leftPercent / 100) * circumference;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back. Here's what's happening with your accounts today.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Account Holders</p>
              <h3 className="text-3xl font-bold text-slate-800">{metrics.totalUsers}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={22} /></div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
            <TrendingUp size={16} className="mr-1" /> +12% from last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Investment</p>
              <h3 className="text-3xl font-bold text-slate-800">₹{(metrics.totalInvestment / 100000).toFixed(2)}L</h3>
            </div>
            <div className="p-3 bg-violet-50 text-violet-600 rounded-xl"><Wallet size={22} /></div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
            <TrendingUp size={16} className="mr-1" /> Stable growth
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Pending Collections</p>
              <h3 className="text-3xl font-bold text-slate-800">₹{(metrics.totalLeft / 100000).toFixed(2)}L</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><Briefcase size={22} /></div>
          </div>
          <div className="mt-4 flex items-center text-sm text-slate-500">
            Across all active policies
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Active Policies</p>
              <h3 className="text-3xl font-bold text-slate-800">{metrics.activePolicies}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Activity size={22} /></div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
            <TrendingUp size={16} className="mr-1" /> +3 new this week
          </div>
        </div>
      </div>

      {/* Charts & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Chart - Donut Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Investment Distribution</h3>
            <select className="text-sm border-slate-200 rounded-lg text-slate-600 bg-slate-50 py-1.5 pl-3 pr-8 focus:ring-blue-600 focus:border-blue-600 outline-none cursor-pointer">
              <option>All Time</option>
              <option>This Year</option>
            </select>
          </div>

          <div className="flex-1 min-h-[250px] flex flex-col sm:flex-row items-center justify-center gap-10 pt-4 pb-2">
            {/* Donut Chart SVG Container */}
            <div className="relative w-56 h-56 flex-shrink-0">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle cx="100" cy="100" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="22" />

                {/* Investment Slice (Blue) */}
                <circle
                  cx="100" cy="100" r={radius} fill="transparent" stroke="#3b82f6" strokeWidth="22"
                  strokeDasharray={circumference}
                  strokeDashoffset={animateChart ? circumference - invDashValue : circumference}
                  className="transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />

                {/* Remaining Slice (Amber) */}
                <circle
                  cx="100" cy="100" r={radius} fill="transparent" stroke="#f59e0b" strokeWidth="22"
                  strokeDasharray={circumference}
                  strokeDashoffset={animateChart ? circumference - leftDashValue : circumference}
                  transform={`rotate(${(investmentPercent / 100) * 360} 100 100)`}
                  className="transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-slate-800">{metrics.totalUsers}</span>
                <span className="text-sm text-slate-500 font-medium mt-1">Total Users</span>
              </div>
            </div>

            {/* Legend / Details */}
            <div className="flex flex-col gap-6 justify-center">
              <div className="flex items-center gap-4">
                <div className="w-4 h-10 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Collected Investment</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-slate-800">₹{(metrics.totalInvestment / 100000).toFixed(2)}L</p>
                    <span className="text-sm text-blue-600 font-semibold">{investmentPercent.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-4 h-10 rounded-full bg-amber-500 shadow-sm shadow-amber-200"></div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Remaining Amount</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-slate-800">₹{(metrics.totalLeft / 100000).toFixed(2)}L</p>
                    <span className="text-sm text-amber-600 font-semibold">{leftPercent.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Insights (Replaced Quick Actions) */}
        <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <div>
            <h3 className="text-lg font-bold mb-5 text-white relative z-10 flex items-center gap-2">
              Portfolio Insights
            </h3>

            <div className="space-y-4 relative z-10">
              {/* Insight 1: Collection Progress */}
              <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-xl">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Overall Completion</p>
                  <span className="text-blue-400 text-xs font-bold">{investmentPercent.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: animateChart ? `${investmentPercent}%` : '0%' }}
                  ></div>
                </div>
              </div>

              {/* Insight 2: Average Investment per User */}
              <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Avg. Per Account</p>
                  <h4 className="text-xl font-bold text-white">₹{avgInvestmentPerUser.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
                </div>
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Users size={18} />
                </div>
              </div>

              {/* Insight 3: Total Goal */}
              <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Target Portfolio</p>
                  <h4 className="text-xl font-bold text-white">₹{(totalAmount / 100000).toFixed(2)}L</h4>
                </div>
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <Wallet size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800/80 relative z-10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 font-medium">System Status</span>
              <span className="flex items-center text-emerald-400 font-semibold gap-2 bg-emerald-400/10 px-2.5 py-1 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live & Synced
              </span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};



// --- 1. Users Page (Account Holders) ---
const UsersPage = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  const initialUserForm = {
    firstName: '', secondName: '', email:'', mobileNumber: '', nomineeName: '', accountType: 'First Slot'
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const currentMonth = MONTH_NAMES[new Date().getMonth()];
  const currentYear = new Date().getFullYear();

  const [exportMonth, setExportMonth] = useState(currentMonth);
  const [exportYear, setExportYear] = useState(currentYear);
  const [isExporting, setIsExporting] = useState(false);

  // Generate an array of years (e.g., from 5 years ago to 5 years in the future)
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const handleExportReport = async () => {
    try {
      setIsExporting(true);
      
      // Make the API call with responseType 'blob' to handle binary file data
      const response = await api.get('/export/monthly', {
        params: { month: exportMonth, year: exportYear },
        responseType: 'blob' 
      });

      // Create a blob link to trigger the browser download
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Monthly_Report_${exportMonth}_${exportYear}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up memory
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to download report. Please try again.');
      console.error('Export Error:', err);
    } finally {
      setIsExporting(false);
    }
  };
  // ------------------------------------

  useEffect(() => {
    fetchUsers(true);
  }, []);

  const fetchUsers = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const openAddModal = () => {
    setUserForm(initialUserForm);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setUserForm(user);
    setIsModalOpen(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (userForm._id) {
        await api.put(`/users/${userForm._id}`, userForm);
      } else {
        await api.post('/users', userForm);
      }
      setIsModalOpen(false);
      fetchUsers(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (e, userId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this user? All associated policies and installments will be permanently deleted.')) return;
    try {
      await api.delete(`/users/${userId}`);
      fetchUsers(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.nomineeName && user.nomineeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.mobileNumber && user.mobileNumber.includes(searchQuery));

      const matchesFilter = filterType === 'All' || user.accountType === filterType;

      return matchesSearch && matchesFilter;
    });
  }, [users, searchQuery, filterType]);

  if (loading && !isModalOpen) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => fetchUsers(true)} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Account Holders</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all user accounts, policies, and details.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text" placeholder="Search accounts..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none shadow-sm text-sm transition-all"
            />
          </div>
          <div className="relative">
            <select
              value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none w-full sm:w-36 bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none cursor-pointer shadow-sm text-sm font-medium text-slate-700 transition-all"
            >
              <option value="All">All Types</option>
              <option value="First Slot">First Slot</option>
              <option value="Second Slot">Second Slot</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition-all shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={18} /> Add Account
          </button>
        </div>
      </div>

      {/* MONTHLY REPORT EXPORT PANEL */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-50 text-green-600 rounded-xl border border-green-100">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Export Monthly Report</h3>
            <p className="text-xs text-slate-500">Download installment records in Excel format</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <select
              value={exportMonth}
              onChange={(e) => setExportMonth(e.target.value)}
              className="appearance-none w-full sm:w-36 bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 focus:ring-2 focus:ring-green-600/20 focus:border-green-600 outline-none cursor-pointer text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100"
            >
              {MONTH_NAMES.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>

          <div className="relative flex-1 sm:flex-none">
            <select
              value={exportYear}
              onChange={(e) => setExportYear(Number(e.target.value))}
              className="appearance-none w-full sm:w-28 bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 focus:ring-2 focus:ring-green-600/20 focus:border-green-600 outline-none cursor-pointer text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>

          <button
            onClick={handleExportReport}
            disabled={isExporting}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-sm shadow-green-600/20 flex items-center justify-center gap-2 text-sm"
          >
            {isExporting ? <RefreshCw className="animate-spin" size={16} /> : <Download size={16} />}
            {isExporting ? 'Exporting...' : 'Download'}
          </button>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="flex flex-col items-center justify-center">
            <Users size={40} className="text-slate-300 mb-3" />
            <p className="text-base font-medium text-slate-700 mb-1">No accounts found</p>
            <p className="text-sm">Adjust your search or filters to find what you're looking for.</p>
          </div>
        </div>
      )}

      {/* MOBILE VIEW: Card Layout */}
      {filteredUsers.length > 0 && (
        <div className="md:hidden flex flex-col gap-4">
          {filteredUsers.map(user => (
            <div key={user._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 relative">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100">
                    {user.firstName.charAt(0)}{user.secondName?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-lg">{user.firstName} {user.secondName}</div>
                    <div className="text-xs text-slate-500 font-medium">{user.mobileNumber || 'No number'} • {user.accountType || 'No Slot'}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); openEditModal(user); }} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg"><Edit size={16} /></button>
                  <button onClick={(e) => handleDeleteUser(e, user._id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>

              

              <div className="flex justify-between items-center text-sm pt-2">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Total Invested</span>
                  <span className="font-bold text-slate-800">₹{user.totalInvestmentAmount?.toLocaleString() || 0}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Remaining</span>
                  <span className="font-bold text-amber-600">₹{user.leftInvestmentAmount?.toLocaleString() || 0}</span>
                </div>
              </div>

              <button
                onClick={() => onSelectUser(user)}
                className="w-full mt-2 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-300 font-semibold rounded-xl text-sm transition-all"
              >
                View Account Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* DESKTOP VIEW: Data Table */}
      {filteredUsers.length > 0 && (
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4 pl-6">Account Holder</th>
                  <th className="p-4">Contact Info</th>
                 
                  <th className="p-4">Investment Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
           <tbody className="divide-y divide-slate-100 text-sm">
  {filteredUsers.map((user) => (
    <tr
      key={user._id}
      onClick={() => onSelectUser(user)}
      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
    >
      {/* USER INFO */}
      <td className="p-4 pl-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
            {(user.firstName?.charAt(0) || "")}
            {(user.secondName?.charAt(0) || "")}
          </div>

          <div className="flex flex-col">
            <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
              {user.firstName || "N/A"} {user.secondName || ""}
            </div>

            <div className="text-xs text-slate-500 mt-0.5">
              Nominee: {user.nomineeName || "N/A"}
            </div>
          </div>
        </div>
      </td>

      {/* CONTACT + TYPE */}
      <td className="p-4">
        <div className="text-slate-800">
          {user.mobileNumber || "No number provided"}
        </div>

        <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
          {user.accountType || "No Slot"}
        </div>
      </td>

      {/* INVESTMENT */}
      <td className="p-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Total:</span>
            <span className="font-semibold text-slate-800">
              ₹{(user.totalInvestmentAmount || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Remaining:</span>
            <span className="font-semibold text-amber-600">
              ₹{(user.leftInvestmentAmount || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </td>

      {/* ACTIONS */}
      <td className="p-4 pr-6 text-right">
        <div className="flex items-center justify-end gap-2 relative z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectUser(user);
            }}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-lg text-xs font-medium transition-all"
          >
            View
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(user);
            }}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>

          <button
            onClick={(e) => handleDeleteUser(e, user._id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD/EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">
                {userForm._id ? 'Edit Account Holder' : 'Add New Account Holder'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition p-1.5">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUserSubmit} className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                  <input type="text" required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                    value={userForm.firstName} onChange={e => setUserForm({ ...userForm, firstName: e.target.value })} placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last Name</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                    value={userForm.secondName} onChange={e => setUserForm({ ...userForm, secondName: e.target.value })} placeholder="Doe" />
                </div>
                   <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                    value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} placeholder="example@gmail.com" />
                </div>
               

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mobile Number</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                    value={userForm.mobileNumber} onChange={e => setUserForm({ ...userForm, mobileNumber: e.target.value })} placeholder="9365478901" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nominee Name <span className="text-red-500">*</span></label>
                  <input type="text" required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                    value={userForm.nomineeName} onChange={e => setUserForm({ ...userForm, nomineeName: e.target.value })} placeholder="Jane Doe" />
                </div>

                <div >
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Type</label>
                  <select
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all bg-white"
                    value={userForm.accountType} onChange={e => setUserForm({ ...userForm, accountType: e.target.value })}
                  >
                    <option value="First Slot">First Slot</option>
                    <option value="Second Slot">Second Slot</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium text-sm">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-medium text-sm flex items-center gap-2 shadow-sm shadow-blue-600/20">
                  {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : (userForm._id ? 'Update Account' : 'Save Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 2. Policies Page ---
const PoliciesPage = ({ user, onBack, onSelectPolicy }) => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const initialPolicyForm = {
     monthlyAmount: '', totalInvestmentAmount: '', maturityAmount: '',accountNumber: '',
    policyOpendate: '', PolicyCloseDate: '',nameOfPolicyHolder: '',RelationWithAccountHolder:''
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [policyForm, setPolicyForm] = useState(initialPolicyForm);

  useEffect(() => {
    fetchPolicies(true);
  }, [user._id]);

  const fetchPolicies = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await api.get(`/users/${user._id}/policies`);
      setPolicies(res.data);
      console.log('Fetched policies:', res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch policies');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const openAddPolicy = () => {
    setPolicyForm(initialPolicyForm);
    setIsModalOpen(true);
  };

  const openEditPolicy = (policy) => {
    setPolicyForm(policy);
    setIsModalOpen(true);
  };

  const handlePolicySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (policyForm._id) {
        await api.put(`/policies/${policyForm._id}`, policyForm);
      } else {
        const payload = {
          ...policyForm,
          userId: user._id,
          leftInvestmentAmount: policyForm.totalInvestmentAmount
        };
        await api.post('/policies', payload);
      }
      setIsModalOpen(false);
      fetchPolicies(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePolicy = async (policyId) => {
    if (!window.confirm('Are you sure you want to delete this policy and all its installments?')) return;
    try {
      await api.delete(`/policies/${policyId}`);
      fetchPolicies(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete policy');
    }
  };

  const handleDownloadExcel = async (policyId) => {
    try {
      const response = await api.get(`/export/excel/${policyId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Policy_${policyId}_Report.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download Excel report');
    }
  };

  if (loading && !isModalOpen) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => fetchPolicies(true)} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm">
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Back to Directory</span><span className="sm:hidden">Back</span>
        </button>
        <button
          onClick={openAddPolicy}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Add Policy</span><span className="sm:hidden">Add</span>
        </button>
      </div>

     {/* Profile Details Card - Improved SaaS Style */}
<div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
  
  {/* Header */}
  <div className="bg-slate-900 px-6 sm:px-8 py-6 flex items-center justify-between">
    <div className="flex items-center gap-4 sm:gap-5">
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-500/20 rounded-full border border-blue-500/30 flex items-center justify-center text-blue-400">
        <UserCircle size={36} className="sm:w-10 sm:h-10" />
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {user.firstName} {user.secondName}
        </h1>

        <p className="text-blue-400 text-xs sm:text-sm mt-0.5 font-medium flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
          {user.accountType || 'Standard Account'}
        </p>
      </div>
    </div>

    <div className="text-right hidden sm:block">
      <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">
        Total Investment
      </p>
      <p className="text-2xl font-bold text-white">
        ₹{user.totalInvestmentAmount?.toLocaleString() || 0}
      </p>
    </div>
  </div>

  {/* Details Section */}
  <div className="px-6 sm:px-8 py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 text-sm bg-white">

    {/* Email */}
    <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition">
      <Mail className="text-blue-500 mt-1" size={18} />
      <div>
        <p className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-wider font-semibold mb-1">
          Email
        </p>
        <p className="font-semibold text-slate-800 break-words">
          {user.email || 'N/A'}
        </p>
      </div>
    </div>

    {/* Contact */}
    <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-green-200 hover:bg-green-50/40 transition">
      <Phone className="text-green-500 mt-1" size={18} />
      <div>
        <p className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-wider font-semibold mb-1">
          Contact
        </p>
        <p className="font-semibold text-slate-800 break-words">
          {user.mobileNumber || 'N/A'}
        </p>
      </div>
    </div>

    {/* Nominee */}
    <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/40 transition">
      <Users className="text-purple-500 mt-1" size={18} />
      <div>
        <p className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-wider font-semibold mb-1">
          Nominee
        </p>
        <p className="font-semibold text-slate-800 break-words">
          {user.nomineeName || 'N/A'}
        </p>
      </div>
    </div>

    {/* Account Type */}
    <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/40 transition">
      <Briefcase className="text-amber-500 mt-1" size={18} />
      <div>
        <p className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-wider font-semibold mb-1">
          Account Type
        </p>
        <p className="font-semibold text-slate-800 break-words">
          {user.accountType || 'Standard'}
        </p>
      </div>
    </div>

    {/* Mobile View Investment */}
    <div className="sm:hidden col-span-1 mt-2 pt-4 border-t border-slate-100">
      <p className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold mb-1">
        Total Investment
      </p>
      <p className="text-xl font-bold text-slate-800">
        ₹{user.totalInvestmentAmount?.toLocaleString() || 0}
      </p>
    </div>

  </div>
</div>

      <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">Active Policies</h3>

 {/* Policies Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
  {policies.length === 0 ? (
    <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
      <Briefcase size={40} className="text-slate-300 mx-auto mb-3" />
      <p className="text-base font-medium text-slate-700 mb-1">No policies found</p>
      <p className="text-sm text-slate-500">Create a new policy to start tracking installments.</p>
      <button onClick={openAddPolicy} className="mt-4 text-blue-600 font-medium hover:underline text-sm">
        + Add First Policy
      </button>
    </div>
  ) : (
    policies.map(policy => (
      <div key={policy._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200 group flex flex-col">
        
        <div className="p-5 sm:p-6 flex-1">
          
          <div className="flex justify-between items-start sm:items-center mb-5 gap-3">
            <div className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-100 whitespace-nowrap">
              <Calendar size={14} className="shrink-0" />
              <span> {new Date(policy.policyOpendate).toLocaleDateString('en-GB') .replace(/\//g, '-')}</span>
              <span className="text-blue-300 mx-1 shrink-0">→</span>
              <span>{new Date(policy.PolicyCloseDate).toLocaleDateString('en-GB') .replace(/\//g, '-')}</span>
            </div>

            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
              <button onClick={() => openEditPolicy(policy)} className="p-2 sm:p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 sm:bg-transparent hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                <Edit size={16} className="sm:w-3.5 sm:h-3.5" />
              </button>

              <button onClick={() => handleDeletePolicy(policy._id)} className="p-2 sm:p-1.5 text-slate-400 hover:text-red-600 bg-slate-50 sm:bg-transparent hover:bg-red-50 rounded-md transition-colors" title="Delete">
                <Trash2 size={16} className="sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>

          {/* Policy Holder Information (UPDATED) */}
          {(policy.nameOfPolicyHolder || policy.relationWithAccountHolder || policy.accountNumber) && (
            <div className="mb-5 flex justify-between items-center">
              
              <div className="flex flex-col">
                {policy.nameOfPolicyHolder && (
                  <h3 className="text-base font-bold text-slate-800 leading-tight mb-1.5">
                    {policy.nameOfPolicyHolder}
                  </h3>
                )}

                {/* ✅ Account Number Added */}
                {policy.accountNumber && (
                  <span className="text-xs text-slate-500 font-medium">
                    A/C: {policy.accountNumber}
                  </span>
                )}
              </div>

              {policy.relationWithAccountHolder && (
                <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200">
                  {policy.relationWithAccountHolder}
                </span>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-slate-100 pb-3">
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Monthly</p>
                <p className="text-lg font-bold text-slate-800">₹{policy.monthlyAmount?.toLocaleString()}</p>
              </div>

              <div className="text-right">
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Target</p>
                <p className="text-lg font-bold text-slate-800">₹{policy.totalInvestmentAmount?.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-between items-end pt-1">
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Remaining</p>
                <p className="text-sm font-bold text-amber-500">₹{policy.leftInvestmentAmount?.toLocaleString()}</p>
              </div>

              <div className="text-right">
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Maturity</p>
                <p className="text-sm font-bold text-green-600">₹{policy.maturityAmount?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-row gap-2">
          <button
            onClick={() => onSelectPolicy(policy)}
            className="flex-1 bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700 font-semibold py-2.5 px-3 rounded-xl transition-all text-xs text-center shadow-sm"
          >
            Manage Installments
          </button>

          <button
            onClick={() => handleDownloadExcel(policy._id)}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-green-600 hover:border-green-300 rounded-xl transition-all shadow-sm flex items-center justify-center"
            title="Export Excel"
          >
            <FileSpreadsheet size={18} />
          </button>
        </div>
       
      </div>
    ))
  )}
</div>
      {/* ADD/EDIT POLICY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">
                {policyForm._id ? 'Edit Policy' : 'Create Policy'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition p-1.5">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePolicySubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name Of Policy Holder<span className="text-red-500">*</span></label>
                <input type="text" required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-mono"
                  value={policyForm.nameOfPolicyHolder} onChange={e => setPolicyForm({ ...policyForm, nameOfPolicyHolder: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Number<span className="text-red-500">*</span></label>
                <input type="text" required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-mono"
                  value={policyForm.accountNumber} onChange={e => setPolicyForm({ ...policyForm, accountNumber: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Relation With Account Holder<span className="text-red-500">*</span></label>
                <input type="text" required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-mono"
                  value={policyForm.relationWithAccountHolder} onChange={e => setPolicyForm({ ...policyForm, relationWithAccountHolder: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Monthly Amount (₹) <span className="text-red-500">*</span></label>
                <input type="number" required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-mono"
                  value={policyForm.monthlyAmount} onChange={e => setPolicyForm({ ...policyForm, monthlyAmount: Number(e.target.value) })} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Investment Target (₹) <span className="text-red-500">*</span></label>
                <input type="number" required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-mono"
                  value={policyForm.totalInvestmentAmount} onChange={e => setPolicyForm({ ...policyForm, totalInvestmentAmount: Number(e.target.value) })} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Maturity Amount (₹) <span className="text-red-500">*</span></label>
                <input type="number" required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-mono"
                  value={policyForm.maturityAmount} onChange={e => setPolicyForm({ ...policyForm, maturityAmount: Number(e.target.value) })} />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date <span className="text-red-500">*</span></label>
                  <input
                    type="date" required
                    disabled={policyForm._id && policyForm.installmentsGenerated}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                    value={policyForm.policyOpendate} onChange={e => setPolicyForm({ ...policyForm, policyOpendate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Maturity Date <span className="text-red-500">*</span></label>
                  <input
                    type="date" required
                    disabled={policyForm._id && policyForm.installmentsGenerated}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                    value={policyForm.PolicyCloseDate} onChange={e => setPolicyForm({ ...policyForm, PolicyCloseDate: e.target.value })}
                  />
                </div>
              </div>

              {policyForm._id && policyForm.installmentsGenerated && (
                <div className="flex items-start gap-2 text-xs text-amber-700 mt-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <p>Dates are locked because installments have been generated. Delete installments to edit dates.</p>
                </div>
              )}

              <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium text-sm">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-medium text-sm flex items-center gap-2 shadow-sm shadow-blue-600/20">
                  {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : (policyForm._id ? 'Update Policy' : 'Create Policy')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 3. Installments Page ---
const InstallmentsPage = ({ policy, user, onBack }) => {
  const [installments, setInstallments] = useState([]);
  const [localPolicy, setLocalPolicy] = useState(policy);
  const [loading, setLoading] = useState(true);
  const [updateLoading,setUpdateLoading] = useState(false)
  const [activeId, setActiveId] = useState(null);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [editAmount, setEditAmount] = useState({});

  useEffect(() => {
    fetchInstallmentsAndPolicy(true);
  }, [policy._id]);

  const fetchInstallmentsAndPolicy = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const [instRes, polRes] = await Promise.all([
        api.get(`/installments/policy/${policy._id}`),
        api.get(`/policies/${policy._id}`)
      ]);

      const sortedInstallments = instRes.data.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return MONTH_NAMES.indexOf(a.month) - MONTH_NAMES.indexOf(b.month);
      });

      setInstallments(sortedInstallments);
      setLocalPolicy(polRes.data);

      const amounts = {};
      sortedInstallments.forEach(inst => amounts[inst._id] = inst.amount);
      setEditAmount(amounts);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch installments');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setActionLoading(true);
      await api.post(`/installments/generate/${policy._id}`);
      fetchInstallmentsAndPolicy(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate installments');
      setActionLoading(false);
    }finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete all installments? This will unlock policy dates.')) return;
    try {
      setActionLoading(true);
      await api.delete(`/installments/policy/${policy._id}`);
      fetchInstallmentsAndPolicy(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete installments');
      setActionLoading(false);
    }finally {      setActionLoading(false);
    }
  };

  const handleUpdate = async (id, payload) => {
    try {
      setUpdateLoading(true)
      setActiveId(id.toString()); // 👈 track which button clicked
      await api.put(`/installments/${id}`, payload);
      fetchInstallmentsAndPolicy(false);
      setUpdateLoading(false)
      setActiveId(id); // 👈 track which button clicked
    } catch (err) {
      setUpdateLoading(false)
      setActiveId(null);

      alert(err.response?.data?.message || 'Failed to update installment');
    }
  };

  const togglePaid = (inst) => {
    handleUpdate(inst._id, { paid: !inst.paid });
  };

  const updateAmount = (id) => {
    const amount = Number(editAmount[id]);
    if (isNaN(amount)) return alert('Invalid amount');
    handleUpdate(id, { amount });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={onBack} className="p-2 sm:p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-sm shrink-0">
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight truncate">Payment Schedule</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 truncate">Policy for <span className="text-slate-700">{user.firstName} {user.secondName}</span></p>
          </div>
        </div>

        <div className="flex gap-3">
          {installments.length === 0 ? (
            <button
              onClick={handleGenerate} disabled={actionLoading}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm text-sm"
            >
              {actionLoading ? <RefreshCw className="animate-spin" size={16} /> : 'Generate Schedule'}
            </button>
          ) : (
            <button
              onClick={handleDeleteAll} disabled={actionLoading}
              className="w-full sm:w-auto bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 px-5 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm text-sm"
            >
              {actionLoading ? <RefreshCw className="animate-spin" size={16} /> : <><Trash2 size={16} /> Delete Schedule</>}
            </button>
          )}
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Expected</p>
          <p className="text-lg sm:text-xl font-bold text-slate-800 font-mono break-all">₹{localPolicy.monthlyAmount?.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Target</p>
          <p className="text-lg sm:text-xl font-bold text-slate-800 font-mono break-all">₹{localPolicy.totalInvestmentAmount?.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-amber-400">
          <p className="text-[10px] sm:text-[11px] font-bold text-amber-500 uppercase tracking-widest mb-1">Remaining</p>
          <p className="text-lg sm:text-xl font-bold text-amber-600 font-mono transition-colors break-all">₹{localPolicy.leftInvestmentAmount?.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Timeline</p>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-1">{new Date(localPolicy.policyOpendate)
    .toLocaleDateString('en-GB')
    .replace(/\//g, '-')} <br className="hidden sm:block" /><span className="text-slate-400 font-normal sm:hidden"> to </span><span className="hidden sm:inline text-slate-400 font-normal">to</span> {new Date(localPolicy.PolicyCloseDate)
    .toLocaleDateString('en-GB')
    .replace(/\//g, '-')}</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => fetchInstallmentsAndPolicy(true)} />}

      {/* MOBILE VIEW: Cards for Installments */}
      {installments.length > 0 && (
        <div className="md:hidden flex flex-col gap-3">
          {installments.map((inst) => (
            <div key={inst._id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-xs">
                    <span className="font-bold text-slate-700 leading-tight">{inst.month.substring(0, 3)}</span>
                    <span className="text-[10px] text-slate-500 leading-tight">{inst.year}</span>
                  </div>
                  <span className="font-bold text-slate-800 text-sm">{inst.month} {inst.year}</span>
                </div>
               <button
  onClick={() => togglePaid(inst)}
  disabled={updateLoading && activeId === inst._id}
  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors border shadow-sm ${
    inst.paid
      ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
      : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
  }`}
>
  {updateLoading && activeId === inst._id ? (
    // 🔄 Spinner
    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
  ) : inst.paid ? (
    <CheckCircle2 size={14} />
  ) : (
    <Circle size={14} />
  )}

  {updateLoading && activeId === inst._id
    ? 'UPDATING...'
    : inst.paid
    ? 'PAID'
    : 'PENDING'}
</button>
              </div>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    className={`w-full border rounded-xl pl-7 pr-3 py-2.5 outline-none font-mono font-medium text-sm transition-all ${inst.paid
                        ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-white border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 shadow-inner'
                      }`}
                    value={editAmount[inst._id] ?? ''}
                    onChange={(e) => setEditAmount({ ...editAmount, [inst._id]: e.target.value })}
                    disabled={inst.paid}
                  />
                </div>
                <button
                  onClick={() => updateAmount(inst._id)}
                  disabled={Number(editAmount[inst._id]) === inst.amount || inst.paid}
                  className="bg-blue-50 border border-blue-100 text-blue-700 hover:bg-blue-100 px-4 py-2.5 rounded-xl font-bold transition-all disabled:opacity-40 disabled:bg-slate-50 disabled:border-slate-200 disabled:text-slate-400 text-xs uppercase tracking-wider"
                >
                  Update
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DESKTOP VIEW: Data Table */}
      {installments.length > 0 && (
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6 w-1/4">Period</th>
                  <th className="p-4 w-1/4">Status</th>
                  <th className="p-4 w-1/4">Amount</th>
                  <th className="p-4 pr-6 text-right w-1/4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {installments.map((inst) => (
                  <tr key={inst._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-xs">
                          <span className="font-bold text-slate-700 leading-tight">{inst.month.substring(0, 3)}</span>
                          <span className="text-[10px] text-slate-500 leading-tight">{inst.year}</span>
                        </div>
                        <span className="hidden lg:inline">{inst.month} {inst.year}</span>
                      </div>
                    </td>
                    <td className="p-4">
                     <button
  onClick={() => togglePaid(inst)}
  disabled={updateLoading && activeId === inst._id}
  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-xs transition-colors border shadow-sm ${
    inst.paid
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-amber-50 text-amber-700 border-amber-200'
  }`}
>
  {updateLoading && activeId === inst._id.toString() ? (
    // 🔄 Spinner
    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
  ) : inst.paid ? (
    <CheckCircle2 size={14} />
  ) : (
    <Circle size={14} />
  )}

  {updateLoading && activeId === inst._id.toString() ? 'UPDATING...' : inst.paid ? 'PAID' : 'PENDING'}
</button>
                    </td>
                    <td className="p-4">
                      <div className="relative max-w-[150px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          className={`w-full border rounded-lg pl-8 pr-3 py-2 outline-none font-mono font-medium transition-all ${inst.paid
                              ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                              : 'bg-white border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 shadow-inner'
                            }`}
                          value={editAmount[inst._id] ?? ''}
                          onChange={(e) => setEditAmount({ ...editAmount, [inst._id]: e.target.value })}
                          disabled={inst.paid}
                        />
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => updateAmount(inst._id)}
                        disabled={Number(editAmount[inst._id]) === inst.amount || inst.paid}
                        className="bg-white border border-slate-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50 px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-200 disabled:cursor-not-allowed shadow-sm text-xs uppercase tracking-wider"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App Component (Layout & Routing) ---
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  // Navigation State
  const [currentView, setCurrentView] = useState('DASHBOARD'); // 'DASHBOARD', 'USERS', 'POLICIES', 'INSTALLMENTS'
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setUser(localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCurrentView('DASHBOARD');
    setSelectedUser(null);
    setSelectedPolicy(null);
    setIsDropdownOpen(false);
  };

  if (!isAuthenticated) {
    return <AuthPage onLogin={() => setIsAuthenticated(true)} />;
  }

  const navigateTo = (view) => {
    setCurrentView(view);
    if (view === 'DASHBOARD' || view === 'USERS') {
      setSelectedUser(null);
      setSelectedPolicy(null);
    }
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Dark Navy Palette */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 z-30 transform transition-transform duration-300 lg:relative lg:translate-x-0 border-r border-slate-800 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-lg shadow-blue-600/20">
              <Activity size={20} />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">Policy Manager</span>
          </div>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Menu</p>

          <button
            onClick={() => navigateTo('DASHBOARD')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${currentView === 'DASHBOARD'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
              : 'hover:bg-slate-800 hover:text-white'
              }`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>

          <button
            onClick={() => navigateTo('USERS')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${['USERS', 'POLICIES', 'INSTALLMENTS'].includes(currentView)
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
              : 'hover:bg-slate-800 hover:text-white'
              }`}
          >
            <Users size={18} /> Account Holders
          </button>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50 shrink-0 lg:hidden">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-colors shadow-sm"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            {/* Dynamic Breadcrumbs */}
            <div className="hidden sm:flex items-center text-sm font-medium text-slate-500">
              <span className={currentView === 'DASHBOARD' ? 'text-slate-800 font-bold' : ''}>Overview</span>
              {['USERS', 'POLICIES', 'INSTALLMENTS'].includes(currentView) && (
                <>
                  <ChevronRight size={14} className="mx-2" />
                  <span className={currentView === 'USERS' ? 'text-slate-800 font-bold' : ''}>Directory</span>
                </>
              )}
              {['POLICIES', 'INSTALLMENTS'].includes(currentView) && selectedUser && (
                <>
                  <ChevronRight size={14} className="mx-2" />
                  <span className={currentView === 'POLICIES' ? 'text-slate-800 font-bold' : ''}>{selectedUser.firstName}</span>
                </>
              )}
              {currentView === 'INSTALLMENTS' && (
                <>
                  <ChevronRight size={14} className="mx-2" />
                  <span className="text-slate-800 font-bold">Installments</span>
                </>
              )}
            </div>

            {/* Mobile simplified breadcrumbs */}
            <div className="sm:hidden font-bold text-slate-800 truncate max-w-[150px]">
              {currentView === 'DASHBOARD' ? 'Dashboard' :
                currentView === 'USERS' ? 'Accounts' :
                  currentView === 'POLICIES' && selectedUser ? selectedUser.firstName :
                    'Installments'}
            </div>
          </div>

          {/* User Profile Dropdown */}
          <div className="flex items-center gap-3 relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 hover:bg-slate-50 p-1.5 pr-3 rounded-full border border-transparent hover:border-slate-200 transition-all focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-sm shadow-sm">
                AD
              </div>
              <span className="hidden sm:block text-sm font-semibold text-slate-700">Admin</span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-sm font-semibold text-slate-800">Admin User</p>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{user.email}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg font-semibold transition-colors"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentView === 'DASHBOARD' && (
              <DashboardPage />
            )}

            {currentView === 'USERS' && (
              <UsersPage
                onSelectUser={(user) => {
                  setSelectedUser(user);
                  setCurrentView('POLICIES');
                }}
              />
            )}

            {currentView === 'POLICIES' && selectedUser && (
              <PoliciesPage
                user={selectedUser}
                onBack={() => setCurrentView('USERS')}
                onSelectPolicy={(policy) => {
                  setSelectedPolicy(policy);
                  setCurrentView('INSTALLMENTS');
                }}
              />
            )}

            {currentView === 'INSTALLMENTS' && selectedPolicy && selectedUser && (
              <InstallmentsPage
                policy={selectedPolicy}
                user={selectedUser}
                onBack={() => setCurrentView('POLICIES')}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}