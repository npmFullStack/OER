// src/pages/Users.jsx
import React, { useState, useEffect } from "react";
import {
  Users as UsersIcon,
  Plus,
  Search,
  X,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";
import AddNewAdminModal from "@/components/modals/AddNewAdminModal";
import WarningModal from "@/components/modals/WarningModal";
import EditUserRoleModal from "@/components/modals/EditUserRoleModal";
import Pagination from "@/components/Pagination";

// Mock data for admins
const INITIAL_ADMINS = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    role: "super_admin",
    status: "active",
    lastActive: "2024-01-15T10:30:00",
    createdAt: "2023-01-01",
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    role: "admin",
    status: "active",
    lastActive: "2024-01-14T15:45:00",
    createdAt: "2023-02-15",
  },
  {
    id: 3,
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.johnson@example.com",
    role: "admin",
    status: "inactive",
    lastActive: "2023-12-20T09:15:00",
    createdAt: "2023-03-10",
  },
  {
    id: 4,
    firstName: "Emily",
    lastName: "Williams",
    email: "emily.williams@example.com",
    role: "admin",
    status: "active",
    lastActive: "2024-01-15T08:00:00",
    createdAt: "2023-04-05",
  },
  {
    id: 5,
    firstName: "David",
    lastName: "Brown",
    email: "david.brown@example.com",
    role: "admin",
    status: "active",
    lastActive: "2024-01-13T14:20:00",
    createdAt: "2023-05-20",
  },
];

const Users = () => {
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [adminForRoleChange, setAdminForRoleChange] = useState(null);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState("super_admin"); // Simulate current logged-in user role

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    // Simulate async fetch
    const timer = setTimeout(() => {
      setAdmins(INITIAL_ADMINS);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

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

  const handleAddAdmin = (adminData) => {
    const newAdmin = {
      id: Math.max(...admins.map((a) => a.id), 0) + 1,
      ...adminData,
      role: "admin",
      status: "active",
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setAdmins([newAdmin, ...admins]);
    toast.success(
      `${adminData.firstName} ${adminData.lastName} has been added as an admin`,
    );
  };

  const handleEditClick = (admin) => {
    setOpenActionMenu(null);
    setSelectedAdmin(admin);
    setIsAddModalOpen(true);
  };

  const handleUpdateAdmin = (updatedData) => {
    setAdmins(
      admins.map((admin) =>
        admin.id === selectedAdmin.id ? { ...admin, ...updatedData } : admin,
      ),
    );
    toast.success(
      `${updatedData.firstName} ${updatedData.lastName} has been updated`,
    );
    setIsAddModalOpen(false);
    setSelectedAdmin(null);
  };

  const handleRoleClick = (admin) => {
    setOpenActionMenu(null);
    setAdminForRoleChange(admin);
    setIsRoleModalOpen(true);
  };

  const handleRoleChange = (newRole) => {
    setAdmins(
      admins.map((admin) =>
        admin.id === adminForRoleChange.id
          ? { ...admin, role: newRole }
          : admin,
      ),
    );
    toast.success(
      `${adminForRoleChange.firstName} ${adminForRoleChange.lastName} has been ${newRole === "super_admin" ? "promoted to Super Admin" : "demoted to Admin"}`,
    );
    setIsRoleModalOpen(false);
    setAdminForRoleChange(null);
  };

  const handleDeleteClick = (admin) => {
    setOpenActionMenu(null);
    setAdminToDelete(admin);
    setIsWarningModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (adminToDelete) {
      setAdmins(admins.filter((a) => a.id !== adminToDelete.id));
      toast.success(
        `${adminToDelete.firstName} ${adminToDelete.lastName} has been removed`,
      );
      setIsWarningModalOpen(false);
      setAdminToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsWarningModalOpen(false);
    setAdminToDelete(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getRoleBadge = (role) => {
    if (role === "super_admin") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <ShieldAlert className="w-3 h-3" />
          Super Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <Shield className="w-3 h-3" />
        Admin
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (status === "active") {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        Inactive
      </span>
    );
  };

  // Check if current user can modify roles (only super admin can)
  const canModifyRoles = currentUserRole === "super_admin";

  return (
    <div className="bg-white rounded-xl p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Users</h1>
          <p className="mt-2 text-gray-600">
            Manage system administrators and their permissions
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedAdmin(null);
            setIsAddModalOpen(true);
          }}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Admin
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6">
        <div className="flex gap-3">
          {/* Search Input */}
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

          {/* Status Filter Select */}
          <div className="w-36">
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
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Role Filter Select */}
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

        {/* Active Filters */}
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

                      {/* Dropdown Menu */}
                      {openActionMenu === admin.id && (
                        <div className="absolute right-4 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={() => handleEditClick(admin)}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Edit Admin
                          </button>

                          {/* Set as Super Admin / Remove Super Admin - Only visible to super admins */}
                          {canModifyRoles && (
                            <button
                              onClick={() => handleRoleClick(admin)}
                              className="w-full px-3 py-2 text-left text-sm text-purple-600 hover:bg-purple-50 flex items-center gap-2 transition-colors"
                            >
                              <ShieldAlert className="w-4 h-4" />
                              {admin.role === "super_admin"
                                ? "Remove Super Admin"
                                : "Set as Super Admin"}
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteClick(admin)}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove Admin
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Component */}
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

      {/* Add/Edit Admin Modal */}
      <AddNewAdminModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedAdmin(null);
        }}
        onAdd={handleAddAdmin}
        onEdit={handleUpdateAdmin}
        editData={selectedAdmin}
      />

      {/* Edit User Role Modal */}
      <EditUserRoleModal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setAdminForRoleChange(null);
        }}
        admin={adminForRoleChange}
        onConfirm={handleRoleChange}
      />

      {/* Delete Confirmation Modal */}
      <WarningModal
        isOpen={isWarningModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Remove Admin"
        message={`Are you sure you want to remove "${adminToDelete?.firstName} ${adminToDelete?.lastName}" as an admin? This action can be reversed by adding them back.`}
      />
    </div>
  );
};

export default Users;
