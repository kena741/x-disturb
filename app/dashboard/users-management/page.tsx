"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import { updateUserStatus, useFetchUsers, deleteUser } from "@/app/api/user-management-api";
import UserManagementTable from "@/components/dashboard/user-management-table ";
import { AdminPageContent } from "@/components/admin/admin-layout";
import {
  AdminFilterPanel,
  AdminSearchInput,
  AdminFilterSelect,
} from "@/components/admin/admin-filter-panel";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "user", label: "User" },
];

const REFERRAL_OPTIONS = [
  { value: "Orthodox Tewahedo", label: "Orthodox Tewahedo" },
  { value: "Protestant", label: "Protestant" },
  { value: "Mosque", label: "Mosque" },
  { value: "Library", label: "Library" },
];

const Page = () => {
  const { users, loading } = useFetchUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [referralFilter, setReferralFilter] = useState("");

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const result = await updateUserStatus(userId, currentStatus);
    if (!result.success) {
      toast.error(result.message);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    const matchesReferral = referralFilter
      ? user.referralCode === referralFilter
      : true;
    return matchesSearch && matchesRole && matchesReferral;
  });

  const handleDelete = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      const result = await deleteUser(userId);
      if (!result.success) toast.error(result.message);
    }
  };

  return (
    <AdminPageContent>
      <AdminFilterPanel>
        <AdminSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name or email"
          className="md:flex-1"
        />
        <AdminFilterSelect
          value={roleFilter}
          onChange={setRoleFilter}
          options={ROLE_OPTIONS}
          placeholder="All Roles"
          className="md:w-40"
        />
        <AdminFilterSelect
          value={referralFilter}
          onChange={setReferralFilter}
          options={REFERRAL_OPTIONS}
          placeholder="All Referral Codes"
          className="md:w-48"
        />
      </AdminFilterPanel>

      <UserManagementTable
        users={filteredUsers}
        handleToggle={handleToggleStatus}
        isLoading={loading}
        handleDelete={handleDelete}
      />
    </AdminPageContent>
  );
};

export default Page;
