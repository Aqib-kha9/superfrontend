'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import axios from 'axios';



interface AdminStats {
  totalAdmins: number;
  activeAdmins: number;
  totalProducts: number;
  totalRetailers: number;
}

interface AdminReport {
  adminId: string;
  name: string;
  lastlogin: string;
  city: string;
  state: string;
  zip: string;
  retailersCount: number;
  productsCount: number;
  partyid: string;
  store: string;
  created: string;
  status: string;
  subscription: number;
  subscribed_at: string;
}

// Helper to calculate days left
const getDaysLeft = (subscribed_at: string, subscription: number) => {
  if (!subscribed_at || !subscription) return '-';
  const subDate = new Date(subscribed_at);
  const expiryDate = new Date(subDate.getTime() + subscription * 24 * 60 * 60 * 1000);
  const today = new Date();
  const diff = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : 0;
};

export default function ReportsPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalAdmins: 0,
    activeAdmins: 0,
    totalProducts: 0,
    totalRetailers: 0
  });
  const apiurl = process.env.NEXT_PUBLIC_APIURL;
  
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [filters, setFilters] = useState({
    minProducts: '',
    minRetailers: '',
    minSubscription: '',
    maxSubscription: '',
    minDaysLeft: '',
    maxDaysLeft: '',
    city: '',
    state: '',
  });

  // Mock data - Replace with actual API call
  useEffect(() => {
    const fetchAnalytics = async () => {
      const response = await axios.get(`${apiurl}/superadmin/analytics`);
      setStats(response.data.Stats);
      setReports(response.data.adminReport);
    };
    fetchAnalytics();
  }, []);

  const filteredReports = reports.filter(report => {
    const meetsProductMin = !filters.minProducts || report.productsCount >= parseInt(filters.minProducts);
    const meetsRetailerMin = !filters.minRetailers || report.retailersCount >= parseInt(filters.minRetailers);
    const meetsSubscriptionMin = !filters.minSubscription || report.subscription >= parseInt(filters.minSubscription);
    const meetsSubscriptionMax = !filters.maxSubscription || report.subscription <= parseInt(filters.maxSubscription);
    const daysLeft = getDaysLeft(report.subscribed_at, report.subscription);
    const meetsDaysLeftMin = !filters.minDaysLeft || (typeof daysLeft === 'number' && daysLeft >= parseInt(filters.minDaysLeft));
    const meetsDaysLeftMax = !filters.maxDaysLeft || (typeof daysLeft === 'number' && daysLeft <= parseInt(filters.maxDaysLeft));
    const meetsCity = !filters.city || report.city.toLowerCase().includes(filters.city.toLowerCase());
    const meetsState = !filters.state || report.state.toLowerCase().includes(filters.state.toLowerCase());
    return meetsProductMin && meetsRetailerMin && meetsSubscriptionMin && meetsSubscriptionMax && meetsDaysLeftMin && meetsDaysLeftMax && meetsCity && meetsState;
  });

  return (
    <div className="min-h-screen bg-white flex flex-col sm:flex-row">
      {/* Sidebar: collapses on mobile */}
      <div className="w-full sm:w-64 bg-[#A8E0D8] p-4 sm:p-6 flex-shrink-0">
        <div className="flex items-center gap-2 mb-8 sm:mb-12">
          <div className="w-8 h-8">
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path d="M12 2L2 19h20L12 2z" fill="#000"/>
            </svg>
          </div>
          <span className="text-lg sm:text-xl font-medium">Admin Panel</span>
        </div>
        <nav className="space-y-2 sm:space-y-4 flex sm:block flex-row sm:flex-col gap-2 sm:gap-0">
          <a href="/dashboard" className="block py-2 px-4 hover:bg-white/50 rounded-xl text-center sm:text-left">Dashboard</a>
          <a href="/dashboard/reports" className="block py-2 px-4 bg-white rounded-xl font-medium text-center sm:text-left">Reports</a>
          <a href="/logout" className="block py-2 px-4 hover:bg-white/50 rounded-xl text-center sm:text-left">Logout</a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-8 ml-0 sm:ml-0">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8">Analytics Report</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-8">
            <div className="bg-[#A8E0D8] rounded-3xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Total Admins</h3>
              <p className="text-2xl sm:text-3xl font-bold">{stats.totalAdmins}</p>
            </div>
            <div className="bg-[#FFB6C1] rounded-3xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Active Admins</h3>
              <p className="text-2xl sm:text-3xl font-bold">{stats.activeAdmins}</p>
            </div>
            <div className="bg-[#FFD700] rounded-3xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Total Products</h3>
              <p className="text-2xl sm:text-3xl font-bold">{stats.totalProducts}</p>
            </div>
            <div className="bg-gray-100 rounded-3xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Total Retailers</h3>
              <p className="text-2xl sm:text-3xl font-bold">{stats.totalRetailers}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Filters</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Min Products</label>
                <input
                  type="number"
                  value={filters.minProducts}
                  onChange={(e) => setFilters({...filters, minProducts: e.target.value})}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8E0D8] focus:border-transparent outline-none"
                  placeholder="Minimum products"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Min Retailers</label>
                <input
                  type="number"
                  value={filters.minRetailers}
                  onChange={(e) => setFilters({...filters, minRetailers: e.target.value})}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8E0D8] focus:border-transparent outline-none"
                  placeholder="Minimum retailers"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Min Subscription (days)</label>
                <input
                  type="number"
                  value={filters.minSubscription}
                  onChange={(e) => setFilters({...filters, minSubscription: e.target.value})}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8E0D8] focus:border-transparent outline-none"
                  placeholder="Min subscription"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Max Subscription (days)</label>
                <input
                  type="number"
                  value={filters.maxSubscription}
                  onChange={(e) => setFilters({...filters, maxSubscription: e.target.value})}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8E0D8] focus:border-transparent outline-none"
                  placeholder="Max subscription"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Min Days Left</label>
                <input
                  type="number"
                  value={filters.minDaysLeft}
                  onChange={(e) => setFilters({...filters, minDaysLeft: e.target.value})}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8E0D8] focus:border-transparent outline-none"
                  placeholder="Min days left"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Max Days Left</label>
                <input
                  type="number"
                  value={filters.maxDaysLeft}
                  onChange={(e) => setFilters({...filters, maxDaysLeft: e.target.value})}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8E0D8] focus:border-transparent outline-none"
                  placeholder="Max days left"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => setFilters({...filters, city: e.target.value})}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8E0D8] focus:border-transparent outline-none"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={filters.state}
                  onChange={(e) => setFilters({...filters, state: e.target.value})}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8E0D8] focus:border-transparent outline-none"
                  placeholder="State"
                />
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-xs sm:text-sm">
                <thead className="bg-[#A8E0D8]/20">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-4 text-left">Admin ID</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-4 text-left">Name</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-4 text-left">Store</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-4 text-left">Party ID</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-4 text-left">City</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-4 text-left">State</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-4 text-left">Zip</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-4 text-left">Status</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-4 text-left">Created</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-4 text-left">Subscribed At</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-4 text-left">Subscription (days)</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-4 text-left">Days Left</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-4 text-center">Products</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-4 text-center">Retailers</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-4 text-center">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.adminId} className="border-t border-gray-100">
                      <td className="px-2 sm:px-4 py-2 sm:py-4">{report.adminId}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4">{report.name}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4">{report.store}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4">{report.partyid}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4">{report.city}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4">{report.state}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4">{report.zip}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4">
                        <span
                          className={
                            report.status === 'active'
                              ? 'inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800'
                              : report.status === 'preapproved'
                              ? 'inline-block px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800'
                              : 'inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800'
                          }
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4">{report.created ? new Date(report.created).toLocaleDateString() : '-'}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4">{report.subscribed_at ? new Date(report.subscribed_at).toLocaleDateString() : '-'}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4">{report.subscription}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4">{getDaysLeft(report.subscribed_at, report.subscription)}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4 text-center">{report.productsCount}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4 text-center">{report.retailersCount}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4 text-center">{report.lastlogin ? new Date(report.lastlogin).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}