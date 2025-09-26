'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { BACKEND_URL } from '../../constants/backend';

interface Admin {
  _id: string;
  userid: string;
  name?: string;
  email: string;
  phonenumber?: string;
  city?: string;
  status: string;
  created_stamp: string;
  adminid?: string;
  productsCount?: number;
  retailersCount?: number;
  subscription?: number;
}

export default function DashboardPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState<{
    email: string;
    id: string;
    subscription: number | null;
  }>({
    email: '',
    id: '',
    subscription: null
  });  
  const [id, setId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; admin: Admin | null }>({ visible: false, x: 0, y: 0, admin: null });
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionValue, setSubscriptionValue] = useState<number>(0);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionAction, setSubscriptionAction] = useState<'StartNew' | 'HandleDays'>('StartNew');
  const [handleDaysType, setHandleDaysType] = useState<'increase' | 'decrease'>('increase');
  const router = useRouter();
  let Status = '';
  // Fetch admin data
  useEffect(() => {
    const storedId = localStorage.getItem('userid');
    const storedToken = localStorage.getItem('token');  
    if (storedId) {
      setId(storedId);
    }
    if (storedToken) {
      setToken(storedToken);
    }
    const fetchAdmins = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/superadmin/admins`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Transform the data to include productsCount and retailersCount
        const adminsWithCounts = response.data.map((admin: any) => ({
          ...admin,
          productsCount: admin.productsCount || 0,  // Default to 0 if not provided
          retailersCount: admin.retailersCount || 0,  // Default to 0 if not provided
          subscription: admin.subscription || 0, // Default to 0 if not provided
        }));
        
        setAdmins(adminsWithCounts);
      } catch (error: any) {
        toast.error('Failed to fetch admin data');
        console.error('Error fetching admins:', error);
      }
    };

    fetchAdmins();
  }, [token]);

  // Close context menu on click outside or scroll
  useEffect(() => {
    const handleClick = () => setContextMenu({ visible: false, x: 0, y: 0, admin: null });
    const handleScroll = () => setContextMenu({ visible: false, x: 0, y: 0, admin: null });
    if (contextMenu.visible) {
      window.addEventListener('click', handleClick);
      window.addEventListener('scroll', handleScroll);
    }
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [contextMenu.visible]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Sending email:', newAdmin.email);
      console.log('Sending id:', id);
      console.log('Sending subscription:', newAdmin.subscription);

      const response = await axios.post(`${BACKEND_URL}/auth/registeraccessadmin`, {
        email: newAdmin.email,
        id: id,
        subscription: newAdmin.subscription,
      });
      toast.success("Added Admin successfully!");
      router.refresh();
    } catch (error: any) {
      const message = error.response?.data?.message;
      toast.error(message || "An unexpected error occurred.");
    }
  };
  

  const filteredAdmins = admins.filter(admin => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      admin.name?.toLowerCase().includes(searchTermLower) ||
      admin.email?.toLowerCase().includes(searchTermLower) ||
      admin.city?.toLowerCase().includes(searchTermLower) ||
      admin.phonenumber?.toLowerCase().includes(searchTermLower) ||
      admin.userid.toLowerCase().includes(searchTermLower)
    );
  });

  const hasAccess = (status: string) => {
    const statusLower = status.toLowerCase();
    return statusLower === 'active' || statusLower === 'preapproved';
  };

  const getButtonText = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'inactive') {
      return 'Grant Access';
    }
    return 'Remove Access';
  };

  const toggleAdminStatus = async (adminUserId: string, currentStatus: string) => {
    try {
      // If they currently have access (active/preapproved), we're setting to inactive
      // If they're inactive, we're setting back to active
      const newStatus = hasAccess(currentStatus) ? 'inactive' : 'active';

      const response = await axios.put(
        `${BACKEND_URL}/superadmin/toggle-admin-status`,
        {
          userid: adminUserId,
          superAdminId: id,
          newStatus: newStatus
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        if(response.data.message === 'Status updated to preapproved'){
          Status = 'preapproved';
        }
        setAdmins(admins.map(admin => {
          if (admin.userid === adminUserId  ) {
            if(Status === 'preapproved'){
              return {
                ...admin,
                status: 'preapproved'
              };
            }else{
            return {
              ...admin,
              status: newStatus
            };
            }
          }
          return admin;
        }));
        
        toast.success(`Admin access ${newStatus === 'inactive' ? 'removed' : 'granted'} successfully`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update admin status';
      toast.error(message);
      console.error('Error updating admin status:', error);
    }
  };

  const handleStatusToggle = (adminUserId: string, currentStatus: string) => {
    if (hasAccess(currentStatus)) {
      // Show confirmation before removing access
      if (window.confirm('Are you sure you want to remove access for this admin?')) {
        toggleAdminStatus(adminUserId, currentStatus);
      }
    } else {
      // No confirmation needed for granting access
      toggleAdminStatus(adminUserId, currentStatus);
    }
  };

  const handleRowContextMenu = (e: React.MouseEvent, admin: Admin) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      admin,
    });
  };

  const handleSubscriptionClick = () => {
    setShowSubscriptionModal(true);
    setContextMenu({ ...contextMenu, visible: false });
    setSubscriptionValue(0); // Default to 0 for new input
    setSubscriptionAction('StartNew'); // Default action
    setHandleDaysType('increase');
  };

  const handleSubscriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contextMenu.admin) return;
    setSubscriptionLoading(true);
    try {
      const payload: any = {
        userid: contextMenu.admin.userid,
        days: subscriptionValue,
        action: subscriptionAction,
        superAdminId: id,
      };
      if (subscriptionAction === 'HandleDays') {
        payload.handleDaysType = handleDaysType;
      }
      await axios.put(
        `${BACKEND_URL}/superadmin/subscription`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success('Subscription updated successfully!');
      setShowSubscriptionModal(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update subscription');
    } finally {
      setSubscriptionLoading(false);
    }
  };

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
          <a href="/dashboard" className="block py-2 px-4 bg-white rounded-xl font-medium text-center sm:text-left">Dashboard</a>
          <a href="/dashboard/reports" className="block py-2 px-4 hover:bg-white/50 rounded-xl text-center sm:text-left">Reports</a>
          <a href="/logout" className="block py-2 px-4 hover:bg-white/50 rounded-xl text-center sm:text-left">Logout</a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-8 ml-0 sm:ml-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-2xl sm:text-4xl font-bold">Admin Management</h1>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8E0D8] focus:border-transparent outline-none"
                />
              </div>
              <button
                onClick={() => setShowAddAdminModal(true)}
                className="px-6 py-2 bg-[#A8E0D8] text-black rounded-xl hover:bg-[#97CDC5] transition-colors w-full sm:w-auto"
              >
                Add Admin
              </button>
            </div>
          </div>
          <div>
            <h2 className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">Right click on Admins for options</h2>
          </div>

          {/* Add Admin Modal */}
          {showAddAdminModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
              <div className="bg-white rounded-3xl p-4 sm:p-8 w-full max-w-md">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Add New Admin</h2>
                <form onSubmit={handleAddAdmin}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        placeholder="Enter Admin's email"
                        required
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8E0D8] focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Subscription</label>
                      <select
                        value={newAdmin.subscription ??''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val !== '') {
                            setNewAdmin({ ...newAdmin, subscription: parseInt(val) });
                          }
                        }}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      >
                        <option value="" disabled >
                          -- Select duration --
                        </option>
                        {[7, 14, 30, 60, 90, 120, 180, 360].map((day) => (
                          <option key={day} value={day}>
                            {day} Days
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-6 flex justify-end gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddAdminModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#A8E0D8] text-black rounded-xl hover:bg-[#97CDC5] transition-colors"
                    >
                      Add Admin
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Admin List */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-xs sm:text-sm">
                <thead className="bg-[#A8E0D8]/20">
                  <tr>
                    <th className="px-2 sm:px-6 py-2 sm:py-4 text-left">User ID</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-4 text-left">Name</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-4 text-left">Email</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-4 text-left">Phone Number</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-4 text-left">City</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-4 text-center">Status</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((admin) => (
                    <tr key={admin._id} className="border-t border-gray-100" onContextMenu={(e) => handleRowContextMenu(e, admin)}>
                      <td className="px-2 sm:px-6 py-2 sm:py-4">{admin.userid}</td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4">{admin.name || '-'}</td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4">{admin.email}</td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4">{admin.phonenumber || '-'}</td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4">{admin.city || '-'}</td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm ${
                          hasAccess(admin.status)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {admin.status}
                        </span>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 text-center">
                        <button
                          onClick={() => handleStatusToggle(admin.userid, admin.status)}
                          className={`px-4 py-2 rounded-full text-xs sm:text-sm ${
                            !hasAccess(admin.status)
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-red-500 text-white hover:bg-red-600'
                          }`}
                        >
                          {getButtonText(admin.status)}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Custom Context Menu */}
              {contextMenu.visible && (
                <div
                  style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 50 }}
                  className="bg-white border rounded shadow-lg min-w-[150px]"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={handleSubscriptionClick}
                  >
                    Subscription
                  </button>
                </div>
              )}
              {/* Subscription Modal */}
              {showSubscriptionModal && contextMenu.admin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
                  <div className="bg-white rounded-3xl p-4 sm:p-8 w-full max-w-md">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Update Subscription</h2>
                    <div className="text-xs sm:text-sm text-black-500 mb-2 sm:mb-4">
                      <div className="mb-2"><b>StartNew</b>: Start a whole new subscription which will start from today and how many days left from today.</div>
                      <div className="mb-2"><b>HandleDays</b>: Add or remove days from existing subscription, it will count how many days left from the day when subscription started.</div>
                      <div className="mb-2">(If Starting new subscription previous subscription days will be lost, if you just want to add days in existing subscription use <b>"HandleDays"</b>.)</div>
                    </div>
                    <form onSubmit={handleSubscriptionSubmit}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                          <select
                            value={subscriptionAction}
                            onChange={e => setSubscriptionAction(e.target.value as 'StartNew' | 'HandleDays')}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8E0D8] focus:border-transparent outline-none"
                          >
                            <option value="StartNew">StartNew</option>
                            <option value="HandleDays">HandleDays</option>
                          </select>
                        </div>
                        {subscriptionAction === 'HandleDays' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                              value={handleDaysType}
                              onChange={e => setHandleDaysType(e.target.value as 'increase' | 'decrease')}
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8E0D8] focus:border-transparent outline-none"
                            >
                              <option value="increase">Increase</option>
                              <option value="decrease">Decrease</option>
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Days</label>
                          <input
                            type="number"
                            value={subscriptionValue}
                            onChange={e => setSubscriptionValue(Number(e.target.value))}
                            min={0}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8E0D8] focus:border-transparent outline-none"
                          />
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-6 flex justify-end gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => setShowSubscriptionModal(false)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-[#A8E0D8] text-black rounded-xl hover:bg-[#97CDC5] transition-colors"
                          disabled={subscriptionLoading}
                        >
                          {subscriptionLoading ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 