// src/pages/Users.jsx (Updated version)
import React, { useState, useEffect } from "react";
import {
  Users as UsersIcon,
  Plus,
  Search,
  X,
  MoreVertical,
  Shield,
  Crown,
  Ban,
  Unlock,
} from "lucide-react";
import toast from "react-hot-toast";
import AddNewAdminModal from "@/components/modals/AddNewAdminModal";
import WarningModal from "@/components/modals/WarningModal";
import PromoteToSuperAdminModal from "@/components/modals/PromoteToSuperAdminModal";
import Pagination from "@/components/Pagination";
import adminService from "@/services/admin.service";
import { useAuth } from "@/context/AuthContext";

const Users = () => {
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [adminToAction, setAdminToAction] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [adminToPromote, setAdminToPromote] = useState(null);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState("super_admin");
  const [currentUserId, setCurrentUserId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { user } = useAuth();

  useEffect(() => {
    fetchAdmins();
    // Get current user role and ID from auth context
    if (user) {
      setCurrentUserRole(user.role === "superadmin" ? "super_admin" : "admin");
      setCurrentUserId(user.id);
    }
  }, [user]);

  const fetchAdmins = async () => {
    setLoading(true);
    const result = await adminService.getAllAdmins();
    if (result.admins) {
      setAdmins(result.admins);
    } else if (result.error) {
      toast.error(result.error);
    }
    setLoading(false);
  };

  // Filter admins
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      searchTerm === "" ||
      admin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "" || admin.status === statusFilter;
    const matchesRole = roleFilter === "" || admin.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAdmins.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

  const activeFilterCount = [searchTerm, statusFilter, roleFilter].filter(
    Boolean,
  ).length;

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setRoleFilter("");
    setCurrentPage(1);
  };

  // Update the handleAddAdmin function in Users.jsx (find this function and replace it)
  const handleAddAdmin = async (adminData) => {
    const result = await adminService.addAdmin(adminData, currentUserId);
    if (result.success) {
      toast.success(
        `${adminData.firstName} ${adminData.lastName} has been added as an admin. Default password: ${result.password}`,
        {
          duration: 8000, // Show longer for password visibility
        },
      );
      await fetchAdmins(); // Refresh the list
      return result; // Return result to show password in modal
    } else {
      toast.error(result.error || "Failed to add admin");
    }
  };

  const handleRestrictClick = (admin) => {
    setOpenActionMenu(null);
    setAdminToAction(admin);
    setActionType("restrict");
    setIsWarningModalOpen(true);
  };

  const handleUnrestrictClick = (admin) => {
    setOpenActionMenu(null);
    setAdminToAction(admin);
    setActionType("unrestrict");
    setIsWarningModalOpen(true);
  };

  const handlePromoteClick = (admin) => {
    setOpenActionMenu(null);
    setAdminToPromote(admin);
    setIsPromoteModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (actionType === "restrict" && adminToAction) {
      const result = await adminService.restrictUser(
        adminToAction.id,
        currentUserId,
      );
      if (result.success) {
        toast.success(
          `${adminToAction.firstName} ${adminToAction.lastName} has been restricted`,
        );
        await fetchAdmins(); // Refresh the list
      } else {
        toast.error(result.error || "Failed to restrict user");
      }
    } else if (actionType === "unrestrict" && adminToAction) {
      const result = await adminService.unrestrictUser(
        adminToAction.id,
        currentUserId,
      );
      if (result.success) {
        toast.success(
          `${adminToAction.firstName} ${adminToAction.lastName} has been unrestricted`,
        );
        await fetchAdmins(); // Refresh the list
      } else {
        toast.error(result.error || "Failed to unrestrict user");
      }
    }

    setIsWarningModalOpen(false);
    setAdminToAction(null);
    setActionType(null);
  };

  const handleConfirmPromote = async () => {
    if (adminToPromote) {
      const result = await adminService.promoteToSuperAdmin(
        adminToPromote.id,
        currentUserId,
      );
      if (result.success) {
        toast.success(
          `${adminToPromote.firstName} ${adminToPromote.lastName} has been promoted to Super Admin`,
        );
        await fetchAdmins(); // Refresh the list
      } else {
        toast.error(result.error || "Failed to promote user");
      }
    }
    setIsPromoteModalOpen(false);
    setAdminToPromote(null);
  };

  const handleCancelAction = () => {
    setIsWarningModalOpen(false);
    setAdminToAction(null);
    setActionType(null);
  };

  const handleCancelPromote = () => {
    setIsPromoteModalOpen(false);
    setAdminToPromote(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) {
      return "just now";
    } else if (minutes < 60) {
      return `${minutes}min`;
    } else if (hours < 24) {
      return `${hours}hr${hours > 1 ? "" : ""}`;
    } else if (days < 30) {
      return `${days}day${days > 1 ? "s" : ""}`;
    } else if (months < 12) {
      return `${months}mon${months > 1 ? "s" : ""}`;
    } else {
      return `${years}yr${years > 1 ? "s" : ""}`;
    }
  };

  const getStatusBadge = (status) => {
    if (status === "active") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      );
    } else if (status === "restricted") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Restricted
        </span>
      );
    }
    return null;
  };

  const getRoleBadge = (role) => {
    if (role === "super_admin") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <Crown className="w-3 h-3" />
          Super Admin
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Shield className="w-3 h-3" />
          Admin
        </span>
      );
    }
  };

  const getActiveStatusDisplay = (lastActive, status) => {
    if (status === "restricted") {
      return (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
          <span className="text-sm text-gray-500">Restricted</span>
        </div>
      );
    }

    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastActiveDate) / 1000 / 60);
    const isOnline = diffMinutes < 5;

    if (isOnline) {
      return (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm text-gray-900">Online</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
          <span className="text-sm text-gray-500">
            {getTimeAgo(lastActive)}
          </span>
        </div>
      );
    }
  };

  const canModifyUsers = currentUserRole === "super_admin";

  const getWarningModalContent = () => {
    if (actionType === "restrict") {
      return {
        title: "Restrict User",
        message: `Are you sure you want to restrict "${adminToAction?.firstName} ${adminToAction?.lastName}"? Restricted users will not be able to access the system until unrestricted.`,
        confirmText: "Restrict",
        isDanger: true,
      };
    } else {
      return {
        title: "Unrestrict User",
        message: `Are you sure you want to unrestrict "${adminToAction?.firstName} ${adminToAction?.lastName}"? They will regain access to the system.`,
        confirmText: "Unrestrict",
        isDanger: false,
      };
    }
  };

  const modalContent = getWarningModalContent();

  return (
    <div className="bg-white rounded-xl p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
          <p className="mt-2 text-gray-600">
            Manage system administrators and their roles
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Admin
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          <div className="w-40">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="restricted">Restricted</option>
            </select>
          </div>

          <div className="w-40">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                Search: {searchTerm}
                <button
                  onClick={() => setSearchTerm("")}
                  className="hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                Status: {statusFilter}
                <button
                  onClick={() => setStatusFilter("")}
                  className="hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {roleFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                Role: {roleFilter === "super_admin" ? "Super Admin" : "Admin"}
                <button
                  onClick={() => setRoleFilter("")}
                  className="hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="mt-2 text-xs text-gray-500">
          Showing {currentItems.length} of {filteredAdmins.length} admins
        </div>
      </div>

      {/* Admin Table */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admins...</p>
        </div>
      ) : admins.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-50 rounded-full">
              <UsersIcon className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Admins Added Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start by adding your first system administrator
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Admin
          </button>
        </div>
      ) : filteredAdmins.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No admins found
          </h3>
          <p className="text-gray-600">No admins match your search criteria</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Online Status
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600 w-12">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((admin) => (
                  <tr
                    key={admin.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {admin.firstName} {admin.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{admin.email}</td>
                    <td className="px-4 py-3">{getRoleBadge(admin.role)}</td>
                    <td className="px-4 py-3">
                      {getStatusBadge(admin.status)}
                    </td>
                    <td className="px-4 py-3">
                      {getActiveStatusDisplay(admin.lastActive, admin.status)}
                    </td>
                    <td className="px-4 py-3 text-center relative">
                      <button
                        onClick={() =>
                          setOpenActionMenu(
                            openActionMenu === admin.id ? null : admin.id,
                          )
                        }
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Actions"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>

                      {openActionMenu === admin.id && (
                        <div className="absolute right-4 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          {canModifyUsers &&
                            (admin.status === "restricted" ? (
                              <button
                                onClick={() => handleUnrestrictClick(admin)}
                                className="w-full px-3 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 transition-colors"
                              >
                                <Unlock className="w-4 h-4" />
                                Unrestrict User
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRestrictClick(admin)}
                                className="w-full px-3 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2 transition-colors"
                              >
                                <Ban className="w-4 h-4" />
                                Restrict User
                              </button>
                            ))}

                          {canModifyUsers && admin.role === "admin" && (
                            <>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button
                                onClick={() => handlePromoteClick(admin)}
                                className="w-full px-3 py-2 text-left text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2 transition-colors"
                              >
                                <Crown className="w-4 h-4" />
                                Promote to Super Admin
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      <AddNewAdminModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
        }}
        onAdd={handleAddAdmin}
      />

      <WarningModal
        isOpen={isWarningModalOpen}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
        title={modalContent.title}
        message={modalContent.message}
        confirmText={modalContent.confirmText}
        cancelText="Cancel"
        isDanger={modalContent.isDanger}
      />

      <PromoteToSuperAdminModal
        isOpen={isPromoteModalOpen}
        onClose={handleCancelPromote}
        onConfirm={handleConfirmPromote}
        adminName={`${adminToPromote?.firstName} ${adminToPromote?.lastName}`}
        adminEmail={adminToPromote?.email}
      />
    </div>
  );
};

export default Users;
