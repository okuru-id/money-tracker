import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconList,
  IconUsers,
  IconBuildingCommunity,
  IconUserMinus,
  IconRefresh,
  IconArrowUp,
  IconArrowDown,
  IconX,
  IconArrowLeft,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSettings,
  IconPower,
  IconFilter,
} from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAllTransactions,
  listAllFamilies,
  listAllUsers,
  addMemberToFamily,
  removeMemberFromFamily,
  createUser,
  updateUser,
  deleteUser,
  createFamily,
  updateFamily,
  deleteFamily,
  getFamilyMembers,
  getUsersWithoutFamily,
  type TransactionItem,
  type FamilyItem,
  type UserItem,
  type FamilyMember,
  type AddMemberRequest,
  type CreateUserRequest,
  type UpdateUserRequest,
  type CreateFamilyRequest,
  type UpdateFamilyRequest,
  updateTransactionAdmin,
  deleteTransactionAdmin,
} from "../api";
import { useSessionState } from "../../auth/session-store";
import { setSessionUnauthenticated } from "../../auth/session-store";
import { logout, ApiError } from "../../auth/api";
import { showToast } from "../../../lib/toast";
import { Dropdown } from "../../../components/dropdown";
import { DataTable, type Column } from "../../../components/data-table";

type Tab = "transactions" | "families" | "users";

export function AdminPage() {
  const navigate = useNavigate();
  const session = useSessionState();
  const [activeTab, setActiveTab] = useState<Tab>("transactions");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Modal state
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItem | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<FamilyItem | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Transaction modals
  const [showEditTransactionModal, setShowEditTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionItem | null>(null);
  const [showDeleteTransactionConfirm, setShowDeleteTransactionConfirm] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<TransactionItem | null>(null);

  // User modals
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [showDeleteUserConfirm, setShowDeleteUserConfirm] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);

  // Family modals
  const [showCreateFamilyModal, setShowCreateFamilyModal] = useState(false);
  const [showEditFamilyModal, setShowEditFamilyModal] = useState(false);
  const [editingFamily, setEditingFamily] = useState<FamilyItem | null>(null);
  const [showDeleteFamilyConfirm, setShowDeleteFamilyConfirm] = useState(false);
  const [deletingFamily, setDeletingFamily] = useState<FamilyItem | null>(null);

  // Member management modal
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [managingFamily, setManagingFamily] = useState<FamilyItem | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showRemoveMemberConfirm, setShowRemoveMemberConfirm] = useState(false);
  const [removingMember, setRemovingMember] = useState<FamilyMember | null>(null);

  // Transaction filters
  const [filterFamilyId, setFilterFamilyId] = useState<string>("");
  const [filterUserId, setFilterUserId] = useState("");

  // Form dropdown states
  const [createUserRole, setCreateUserRole] = useState<string>("user");
  const [editUserRole, setEditUserRole] = useState<string>("");
  const [createFamilyOwner, setCreateFamilyOwner] = useState<string>("");
  const [addMemberUserId, setAddMemberUserId] = useState<string>("");
  const [addMemberRole, setAddMemberRole] = useState<string>("member");

  // Refresh data based on active tab
  const refreshTabData = () => {
    if (activeTab === "transactions") {
      queryClient.invalidateQueries({ queryKey: ["admin", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "all-families"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "all-users"] });
    } else if (activeTab === "families") {
      queryClient.invalidateQueries({ queryKey: ["admin", "families"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users-without-family"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "all-users"] });
    } else if (activeTab === "users") {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "all-families"] });
    }
  };

  // Queries
  const transactionsQuery = useQuery({
    queryKey: ["admin", "transactions", page, filterFamilyId, filterUserId],
    queryFn: () => listAllTransactions({ page, limit: 20, familyId: filterFamilyId || undefined, userId: filterUserId || undefined }),
  });

  const familiesQuery = useQuery({
    queryKey: ["admin", "families", page],
    queryFn: () => listAllFamilies({ page, limit: 20 }),
  });

  const usersQuery = useQuery({
    queryKey: ["admin", "users", page],
    queryFn: () => listAllUsers({ page, limit: 20 }),
  });

  // All families for filter dropdown (no pagination)
  const allFamiliesQuery = useQuery({
    queryKey: ["admin", "all-families"],
    queryFn: () => listAllFamilies({ page: 1, limit: 1000 }),
  });

  // All users for filter dropdown (no pagination)
  const allUsersQuery = useQuery({
    queryKey: ["admin", "all-users"],
    queryFn: () => listAllUsers({ page: 1, limit: 1000 }),
  });

  const familyMembersQuery = useQuery({
    queryKey: ["admin", "family-members", managingFamily?.id],
    queryFn: () => managingFamily ? getFamilyMembers(managingFamily.id) : Promise.resolve([]),
    enabled: !!managingFamily,
  });

  // Users without family query (for create family modal)
  const usersWithoutFamilyQuery = useQuery({
    queryKey: ["admin", "users-without-family"],
    queryFn: getUsersWithoutFamily,
  });

  // User mutations
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setShowCreateUserModal(false);
      showToast({ title: "User created successfully", type: "success" });
    },
    onError: (error: Error) => {
      showToast({ title: "Failed to create user", description: error.message, type: "error" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserRequest }) =>
      updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setShowEditUserModal(false);
      setEditingUser(null);
      showToast({ title: "User updated successfully", type: "success" });
    },
    onError: (error: Error) => {
      showToast({ title: "Failed to update user", description: error.message, type: "error" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setShowDeleteUserConfirm(false);
      setDeletingUser(null);
      showToast({ title: "User deleted successfully", type: "success" });
    },
    onError: (error: Error) => {
      showToast({ title: "Failed to delete user", description: error.message, type: "error" });
    },
  });

  // Transaction mutations
  const updateTransactionMutation = useMutation({
    mutationFn: ({ txId, data }: { txId: string; data: { amount?: number; category_id?: string | null; note?: string } }) =>
      updateTransactionAdmin(txId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "transactions"] });
      setShowEditTransactionModal(false);
      setEditingTransaction(null);
      showToast({ title: "Transaction updated successfully", type: "success" });
    },
    onError: (error: Error) => {
      showToast({ title: "Failed to update transaction", description: error.message, type: "error" });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: deleteTransactionAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "transactions"] });
      setShowDeleteTransactionConfirm(false);
      setDeletingTransaction(null);
      showToast({ title: "Transaction deleted successfully", type: "success" });
    },
    onError: (error: Error) => {
      showToast({ title: "Failed to delete transaction", description: error.message, type: "error" });
    },
  });

  // Family mutations
  const createFamilyMutation = useMutation({
    mutationFn: createFamily,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "families"] });
      setShowCreateFamilyModal(false);
      showToast({ title: "Family created successfully", type: "success" });
    },
    onError: (error: Error) => {
      showToast({ title: "Failed to create family", description: error.message, type: "error" });
    },
  });

  const updateFamilyMutation = useMutation({
    mutationFn: ({ familyId, data }: { familyId: string; data: UpdateFamilyRequest }) =>
      updateFamily(familyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "families"] });
      setShowEditFamilyModal(false);
      setEditingFamily(null);
      showToast({ title: "Family updated successfully", type: "success" });
    },
    onError: (error: Error) => {
      showToast({ title: "Failed to update family", description: error.message, type: "error" });
    },
  });

  const deleteFamilyMutation = useMutation({
    mutationFn: deleteFamily,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "families"] });
      setShowDeleteFamilyConfirm(false);
      setDeletingFamily(null);
      showToast({ title: "Family deleted successfully", type: "success" });
    },
    onError: (error: Error) => {
      showToast({ title: "Failed to delete family", description: error.message, type: "error" });
    },
  });

  // Member mutations
  const addMemberMutation = useMutation({
    mutationFn: addMemberToFamily,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "family-members"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users-without-family"] });
      setShowAddMemberModal(false);
      showToast({ title: "Member added successfully", type: "success" });
    },
    onError: (error: Error) => {
      showToast({ title: "Failed to add member", description: error.message, type: "error" });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ familyId, userId }: { familyId: string; userId: string }) =>
      removeMemberFromFamily(familyId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "family-members"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users-without-family"] });
      setShowRemoveMemberConfirm(false);
      setRemovingMember(null);
      showToast({ title: "Member removed successfully", type: "success" });
    },
    onError: (error: Error) => {
      showToast({ title: "Failed to remove member", description: error.message, type: "error" });
    },
  });

  const tabs = [
    { id: "transactions" as Tab, label: "Transactions", icon: IconList },
    { id: "families" as Tab, label: "Families", icon: IconBuildingCommunity },
    { id: "users" as Tab, label: "Users", icon: IconUsers },
  ];

  const activeTabLabel = tabs.find(t => t.id === activeTab)?.label ?? "Admin";

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      setSessionUnauthenticated();
      navigate("/login", { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        showToast({ title: "Logout failed", description: error.message, type: "error" });
      } else {
        showToast({ title: "Logout failed", description: "Please try again.", type: "error" });
      }
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <div className="topbar__left">
          <button className="admin-topbar__back" onClick={() => navigate("/settings")}>
            <IconArrowLeft size={16} />
          </button>
          <h1 className="admin-topbar__title">{activeTabLabel}</h1>
        </div>
        <div className="topbar__right">
          <span className="admin-topbar__email">{session.user?.email}</span>
          {session.isAdmin && <span className="admin-topbar__badge">Admin</span>}
          <button
            className="admin-topbar__logout"
            onClick={() => setShowLogoutConfirm(true)}
            aria-label="Logout"
          >
            <IconPower size={18} />
          </button>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal__header">
              <h3>Logout</h3>
              <button
                className="modal__close"
                onClick={() => setShowLogoutConfirm(false)}
                aria-label="Close"
              >
                <IconX size={18} />
              </button>
            </div>
            <div className="modal__body">
              <p>Apakah Anda yakin ingin keluar?</p>
            </div>
            <div className="modal__footer">
              <button
                className="modal__button modal__button--secondary"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="modal__button modal__button--danger"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => {
              setActiveTab(tab.id);
              setPage(1);
            }}
          >
            <tab.icon size={20} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="admin-content">
        {activeTab === "transactions" && (
          <TransactionsTab
            data={transactionsQuery.data}
            isLoading={transactionsQuery.isLoading}
            isFetching={transactionsQuery.isFetching}
            page={page}
            onPageChange={setPage}
            onRefresh={refreshTabData}
            onSelect={setSelectedTransaction}
            filterFamilyId={filterFamilyId}
            filterUserId={filterUserId}
            onFilterFamilyChange={(id) => { setFilterFamilyId(id); setPage(1); }}
            onFilterUserChange={(id) => { setFilterUserId(id); setPage(1); }}
            families={allFamiliesQuery.data?.data ?? []}
            users={allUsersQuery.data?.data ?? []}
            onEditTransaction={(tx) => { setEditingTransaction(tx); setShowEditTransactionModal(true); }}
            onDeleteTransaction={(tx) => { setDeletingTransaction(tx); setShowDeleteTransactionConfirm(true); }}
          />
        )}

        {activeTab === "families" && (
          <FamiliesTab
            data={familiesQuery.data}
            isLoading={familiesQuery.isLoading}
            isFetching={familiesQuery.isFetching}
            page={page}
            onPageChange={setPage}
            onRefresh={refreshTabData}
            onSelect={setSelectedFamily}
            onCreateFamily={() => {
              setCreateFamilyOwner("");
              setShowCreateFamilyModal(true);
            }}
            onEditFamily={(family) => {
              setEditingFamily(family);
              setShowEditFamilyModal(true);
            }}
            onDeleteFamily={(family) => {
              setDeletingFamily(family);
              setShowDeleteFamilyConfirm(true);
            }}
            onManageMembers={(family) => {
              setManagingFamily(family);
              setShowMembersModal(true);
            }}
          />
        )}

        {activeTab === "users" && (
          <UsersTab
            data={usersQuery.data}
            isLoading={usersQuery.isLoading}
            isFetching={usersQuery.isFetching}
            page={page}
            onPageChange={setPage}
            onRefresh={refreshTabData}
            onSelect={setSelectedUser}
            onCreateUser={() => {
              setCreateUserRole("user");
              setShowCreateUserModal(true);
            }}
            onEditUser={(user) => {
              setEditingUser(user);
              setEditUserRole(user.role);
              setShowEditUserModal(true);
            }}
            onDeleteUser={(user) => {
              setDeletingUser(user);
              setShowDeleteUserConfirm(true);
            }}
          />
        )}
      </main>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <DetailModal onClose={() => setSelectedTransaction(null)}>
          <h3>Transaction Details</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">ID</span>
              <span className="detail-value mono">{selectedTransaction.id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Family ID</span>
              <span className="detail-value mono">{selectedTransaction.family_id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Type</span>
              <span className={`detail-value type-${selectedTransaction.type}`}>
                {selectedTransaction.type}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Amount</span>
              <span className={`detail-value amount type-${selectedTransaction.type}`}>
                {formatCurrency(selectedTransaction.amount)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Category</span>
              <span className="detail-value">{selectedTransaction.category_name || "-"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Note</span>
              <span className="detail-value">{selectedTransaction.note || "-"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date</span>
              <span className="detail-value">
                {new Date(selectedTransaction.transaction_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created By</span>
              <span className="detail-value">{selectedTransaction.created_by_name || selectedTransaction.created_by.slice(0, 8)}...</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Wallet Owner</span>
              <span className="detail-value">{selectedTransaction.wallet_owner_name || selectedTransaction.wallet_owner_id.slice(0, 8)}...</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Bank Account</span>
              <span className="detail-value">
                {selectedTransaction.bank_account_name || selectedTransaction.bank_name || "-"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Account Number</span>
              <span className="detail-value mono">{selectedTransaction.account_number || "-"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created At</span>
              <span className="detail-value">
                {new Date(selectedTransaction.created_at).toLocaleString("en-US")}
              </span>
            </div>
          </div>
        </DetailModal>
      )}

      {/* Edit Transaction Modal */}
      {showEditTransactionModal && editingTransaction && (
        <DetailModal onClose={() => { setShowEditTransactionModal(false); setEditingTransaction(null); }}>
          <h3>Edit Transaction</h3>
          <form
            className="edit-transaction-form"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const amount = parseFloat(formData.get("amount") as string);
              updateTransactionMutation.mutate({
                txId: editingTransaction.id,
                data: {
                  amount: isNaN(amount) ? undefined : amount,
                  note: formData.get("note") as string || undefined,
                },
              });
            }}
          >
            <div className="form-field">
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                step="0.01"
                required
                defaultValue={editingTransaction.amount}
              />
            </div>
            <div className="form-field">
              <label>Note</label>
              <input
                type="text"
                name="note"
                defaultValue={editingTransaction.note || ""}
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => { setShowEditTransactionModal(false); setEditingTransaction(null); }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={updateTransactionMutation.isPending}>
                {updateTransactionMutation.isPending ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        </DetailModal>
      )}

      {/* Delete Transaction Confirm */}
      {showDeleteTransactionConfirm && deletingTransaction && (
        <DetailModal onClose={() => { setShowDeleteTransactionConfirm(false); setDeletingTransaction(null); }}>
          <h3>Delete Transaction</h3>
          <div className="delete-confirm">
            <p>Are you sure you want to delete this transaction?</p>
            <div className="delete-info">
              <p><strong>Type:</strong> {deletingTransaction.type}</p>
              <p><strong>Amount:</strong> {formatCurrency(deletingTransaction.amount)}</p>
              <p><strong>Note:</strong> {deletingTransaction.note || "-"}</p>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => { setShowDeleteTransactionConfirm(false); setDeletingTransaction(null); }}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                disabled={deleteTransactionMutation.isPending}
                onClick={() => deleteTransactionMutation.mutate(deletingTransaction.id)}
              >
                {deleteTransactionMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </DetailModal>
      )}

      {/* Family Detail Modal */}
      {selectedFamily && !showMembersModal && (
        <DetailModal onClose={() => setSelectedFamily(null)}>
          <h3>Family Details</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">ID</span>
              <span className="detail-value mono">{selectedFamily.id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Name</span>
              <span className="detail-value">{selectedFamily.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created By</span>
              <span className="detail-value">{selectedFamily.created_by_name || selectedFamily.created_by.slice(0, 8)}...</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created At</span>
              <span className="detail-value">
                {new Date(selectedFamily.created_at).toLocaleString("en-US")}
              </span>
            </div>
          </div>
        </DetailModal>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <DetailModal onClose={() => setSelectedUser(null)}>
          <h3>User Details</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">ID</span>
              <span className="detail-value mono">{selectedUser.id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">{selectedUser.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Role</span>
              <span className={`detail-value role-badge role-${selectedUser.role}`}>
                {selectedUser.role}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Registered</span>
              <span className="detail-value">
                {new Date(selectedUser.created_at).toLocaleString("en-US")}
              </span>
            </div>
          </div>
        </DetailModal>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <DetailModal onClose={() => setShowCreateUserModal(false)}>
          <h3>Create New User</h3>
          <form
            className="create-user-form"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data: CreateUserRequest = {
                email: formData.get("email") as string,
                password: formData.get("password") as string,
                role: createUserRole as "user" | "admin",
              };
              createUserMutation.mutate(data);
            }}
          >
            <div className="form-field">
              <label>Email</label>
              <input type="email" name="email" required placeholder="user@example.com" />
            </div>
            <div className="form-field">
              <label>Password</label>
              <input type="password" name="password" required minLength={8} placeholder="Min 8 characters" />
            </div>
            <Dropdown
              label="Role"
              value={createUserRole}
              onChange={setCreateUserRole}
              options={[
                { value: "user", label: "User" },
                { value: "admin", label: "Admin" },
              ]}
            />
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowCreateUserModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </DetailModal>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && editingUser && (
        <DetailModal onClose={() => { setShowEditUserModal(false); setEditingUser(null); }}>
          <h3>Edit User Role</h3>
          <div className="edit-user-info">
            <p><strong>Email:</strong> {editingUser.email}</p>
            <p><strong>User ID:</strong> <span className="mono">{editingUser.id}</span></p>
          </div>
          <form
            className="edit-user-form"
            onSubmit={(e) => {
              e.preventDefault();
              const data: UpdateUserRequest = {
                role: editUserRole as "user" | "admin",
              };
              updateUserMutation.mutate({ userId: editingUser.id, data });
            }}
          >
            <Dropdown
              label="Role"
              value={editUserRole}
              onChange={setEditUserRole}
              options={[
                { value: "user", label: "User" },
                { value: "admin", label: "Admin" },
              ]}
            />
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => { setShowEditUserModal(false); setEditingUser(null); }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? "Updating..." : "Update Role"}
              </button>
            </div>
          </form>
        </DetailModal>
      )}

      {/* Delete User Confirmation */}
      {showDeleteUserConfirm && deletingUser && (
        <DetailModal onClose={() => { setShowDeleteUserConfirm(false); setDeletingUser(null); }}>
          <h3>Delete User</h3>
          <div className="delete-confirm">
            <p>Are you sure you want to delete this user?</p>
            <div className="delete-user-info">
              <p><strong>Email:</strong> {deletingUser.email}</p>
              <p><strong>Role:</strong> {deletingUser.role}</p>
            </div>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => { setShowDeleteUserConfirm(false); setDeletingUser(null); }}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                disabled={deleteUserMutation.isPending}
                onClick={() => deleteUserMutation.mutate(deletingUser.id)}
              >
                {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </DetailModal>
      )}

      {/* Create Family Modal */}
      {showCreateFamilyModal && (
        <DetailModal onClose={() => setShowCreateFamilyModal(false)}>
          <h3>Create New Family</h3>
          <form
            className="create-family-form"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data: CreateFamilyRequest = {
                name: formData.get("name") as string,
                created_by: createFamilyOwner,
              };
              createFamilyMutation.mutate(data);
            }}
          >
            <div className="form-field">
              <label>Family Name</label>
              <input type="text" name="name" required placeholder="Enter family name" />
            </div>
            <Dropdown
              label="Owner User"
              placeholder="-- Select User --"
              value={createFamilyOwner}
              onChange={setCreateFamilyOwner}
              options={(usersWithoutFamilyQuery.data ?? []).map((user) => ({
                value: user.id,
                label: user.email,
              }))}
            />
            {usersWithoutFamilyQuery.data?.length === 0 && (
              <span className="field-hint">No users without family available</span>
            )}
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowCreateFamilyModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={createFamilyMutation.isPending || !usersWithoutFamilyQuery.data?.length}>
                {createFamilyMutation.isPending ? "Creating..." : "Create Family"}
              </button>
            </div>
          </form>
        </DetailModal>
      )}

      {/* Edit Family Modal */}
      {showEditFamilyModal && editingFamily && (
        <DetailModal onClose={() => { setShowEditFamilyModal(false); setEditingFamily(null); }}>
          <h3>Edit Family</h3>
          <div className="edit-family-info">
            <p><strong>Family ID:</strong> <span className="mono">{editingFamily.id}</span></p>
          </div>
          <form
            className="edit-family-form"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data: UpdateFamilyRequest = {
                name: formData.get("name") as string,
              };
              updateFamilyMutation.mutate({ familyId: editingFamily.id, data });
            }}
          >
            <div className="form-field">
              <label>Family Name</label>
              <input type="text" name="name" required defaultValue={editingFamily.name} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => { setShowEditFamilyModal(false); setEditingFamily(null); }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={updateFamilyMutation.isPending}>
                {updateFamilyMutation.isPending ? "Updating..." : "Update Family"}
              </button>
            </div>
          </form>
        </DetailModal>
      )}

      {/* Delete Family Confirmation */}
      {showDeleteFamilyConfirm && deletingFamily && (
        <DetailModal onClose={() => { setShowDeleteFamilyConfirm(false); setDeletingFamily(null); }}>
          <h3>Delete Family</h3>
          <div className="delete-confirm">
            <p>Are you sure you want to delete this family?</p>
            <div className="delete-family-info">
              <p><strong>Name:</strong> {deletingFamily.name}</p>
              <p><strong>ID:</strong> <span className="mono">{deletingFamily.id}</span></p>
            </div>
            <p className="warning-text">This will also remove all members. This action cannot be undone.</p>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => { setShowDeleteFamilyConfirm(false); setDeletingFamily(null); }}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                disabled={deleteFamilyMutation.isPending}
                onClick={() => deleteFamilyMutation.mutate(deletingFamily.id)}
              >
                {deleteFamilyMutation.isPending ? "Deleting..." : "Delete Family"}
              </button>
            </div>
          </div>
        </DetailModal>
      )}

      {/* Manage Members Modal */}
      {showMembersModal && managingFamily && (
        <DetailModal onClose={() => { setShowMembersModal(false); setManagingFamily(null); }}>
          <h3>Manage Members - {managingFamily.name}</h3>
          <div className="members-list">
            <div className="members-header">
              <span>Family Members</span>
              <button
                className="add-btn small"
                onClick={() => {
                  setAddMemberUserId("");
                  setAddMemberRole("member");
                  setShowAddMemberModal(true);
                }}
              >
                <IconPlus size={16} />
                <span>Add</span>
              </button>
            </div>
            {familyMembersQuery.isLoading ? (
              <div className="loading">Loading members...</div>
            ) : familyMembersQuery.data?.length === 0 ? (
              <div className="no-data">No members yet</div>
            ) : (
              <div className="member-items">
                {familyMembersQuery.data?.map((member) => (
                  <div key={member.id} className="member-item">
                    <div className="member-info">
                      <span className="member-email">{member.email}</span>
                      <span className={`role-badge role-${member.role}`}>{member.role}</span>
                    </div>
                    <button
                      className="action-btn danger"
                      onClick={() => {
                        setRemovingMember(member);
                        setShowRemoveMemberConfirm(true);
                      }}
                      title={member.role === "owner" ? "Remove owner (ownership will transfer)" : "Remove member"}
                    >
                      <IconUserMinus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DetailModal>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && managingFamily && (
        <DetailModal onClose={() => setShowAddMemberModal(false)}>
          <h3>Add Member to {managingFamily.name}</h3>
          <form
            className="add-member-form"
            onSubmit={(e) => {
              e.preventDefault();
              const data: AddMemberRequest = {
                family_id: managingFamily.id,
                user_id: addMemberUserId,
                role: addMemberRole as "owner" | "member",
              };
              addMemberMutation.mutate(data);
            }}
          >
            <Dropdown
              label="Select User"
              placeholder="-- Select User --"
              value={addMemberUserId}
              onChange={setAddMemberUserId}
              options={(usersWithoutFamilyQuery.data ?? []).map((user) => ({
                value: user.id,
                label: user.email,
              }))}
            />
            {usersWithoutFamilyQuery.data?.length === 0 && (
              <span className="field-hint">No users without family available</span>
            )}
            <Dropdown
              label="Role"
              value={addMemberRole}
              onChange={setAddMemberRole}
              options={[
                { value: "member", label: "Member" },
                { value: "owner", label: "Owner" },
              ]}
            />
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowAddMemberModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={addMemberMutation.isPending || !usersWithoutFamilyQuery.data?.length}>
                {addMemberMutation.isPending ? "Adding..." : "Add Member"}
              </button>
            </div>
          </form>
        </DetailModal>
      )}

      {/* Remove Member Confirmation */}
      {showRemoveMemberConfirm && removingMember && managingFamily && (
        <DetailModal onClose={() => { setShowRemoveMemberConfirm(false); setRemovingMember(null); }}>
          <h3>{removingMember.role === "owner" ? "Remove Owner" : "Remove Member"}</h3>
          <div className="delete-confirm">
            {removingMember.role === "owner" ? (
              <p className="warning-text">Removing the owner will transfer ownership to another member automatically.</p>
            ) : null}
            <p>Are you sure you want to remove this {removingMember.role === "owner" ? "owner" : "member"}?</p>
            <div className="delete-user-info">
              <p><strong>Email:</strong> {removingMember.email}</p>
              <p><strong>Role:</strong> {removingMember.role}</p>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => { setShowRemoveMemberConfirm(false); setRemovingMember(null); }}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                disabled={removeMemberMutation.isPending}
                onClick={() => removeMemberMutation.mutate({ familyId: managingFamily.id, userId: removingMember.user_id })}
              >
                {removeMemberMutation.isPending ? "Removing..." : `Remove ${removingMember.role === "owner" ? "Owner" : "Member"}`}
              </button>
            </div>
          </div>
        </DetailModal>
      )}
    </div>
  );
}

// Modal Component
function DetailModal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <IconX size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}

// Transactions Tab
function TransactionsTab({
  data,
  isLoading,
  isFetching,
  page,
  onPageChange,
  onRefresh,
  onSelect,
  filterFamilyId,
  filterUserId,
  onFilterFamilyChange,
  onFilterUserChange,
  families,
  users,
  onEditTransaction,
  onDeleteTransaction,
}: {
  data?: { data: TransactionItem[]; total: number; total_pages: number };
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  onPageChange: (p: number) => void;
  onRefresh: () => void;
  onSelect: (tx: TransactionItem) => void;
  filterFamilyId: string;
  filterUserId: string;
  onFilterFamilyChange: (id: string) => void;
  onFilterUserChange: (id: string) => void;
  families: FamilyItem[];
  users: UserItem[];
  onEditTransaction: (tx: TransactionItem) => void;
  onDeleteTransaction: (tx: TransactionItem) => void;
}) {
  const [showFilterModal, setShowFilterModal] = useState(false);

  const activeFilterCount = [filterFamilyId, filterUserId].filter(Boolean).length;

  const handleResetFilters = () => {
    onFilterFamilyChange("");
    onFilterUserChange("");
  };

  const columns: Column<TransactionItem>[] = [
    {
      id: "type",
      label: "Type",
      width: "100px",
      cell: (tx) => (
        <span className={`type-${tx.type}`}>
          {tx.type === "credit" ? (
            <IconArrowUp size={14} />
          ) : (
            <IconArrowDown size={14} />
          )}
          {tx.type}
        </span>
      ),
    },
    {
      id: "amount",
      label: "Amount",
      width: "120px",
      align: "right",
      cell: (tx) => (
        <span className={`amount type-${tx.type}`}>
          {formatCurrency(tx.amount)}
        </span>
      ),
    },
    {
      id: "created_by",
      label: "Created By",
      cell: (tx) => tx.created_by_name || tx.created_by.slice(0, 8) + "...",
    },
    {
      id: "note",
      label: "Note",
      cell: (tx) => tx.note || "-",
      className: "note",
    },
    {
      id: "transaction_date",
      label: "Date",
      width: "120px",
      cell: (tx) => new Date(tx.transaction_date).toLocaleDateString("en-US"),
    },
    {
      id: "actions",
      label: "",
      width: "80px",
      cell: (tx) => (
        <div className="row-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="action-btn"
            onClick={() => onEditTransaction(tx)}
            title="Edit"
          >
            <IconEdit size={14} />
          </button>
          <button
            className="action-btn action-btn--danger"
            onClick={() => onDeleteTransaction(tx)}
            title="Delete"
          >
            <IconTrash size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data ? { ...data, current_page: page, last_page: data.total_pages, per_page: 20 } : []}
        loading={isLoading}
        emptyText="No transactions found"
        pageSize={20}
        onPageChange={onPageChange}
        onRowClick={onSelect}
        renderHeaderActions={() => (
          <>
            <button
              className={`filter-btn ${activeFilterCount > 0 ? "filter-btn--active" : ""}`}
              onClick={() => setShowFilterModal(true)}
            >
              <IconFilter size={16} />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="filter-btn__badge">{activeFilterCount}</span>
              )}
            </button>
            <button onClick={onRefresh} className={`refresh-btn${isFetching ? ' isRefreshing' : ''}`}>
              <IconRefresh size={18} />
            </button>
          </>
        )}
        renderMobileCard={(tx) => (
          <div key={tx.id} className="data-card clickable" onClick={() => onSelect(tx)}>
            <div className="data-card__header">
              <span className={`data-card__type type-${tx.type}`}>
                {tx.type === "credit" ? (
                  <IconArrowUp size={16} />
                ) : (
                  <IconArrowDown size={16} />
                )}
                {tx.type}
              </span>
              <span className={`data-card__amount type-${tx.type}`}>
                {formatCurrency(tx.amount)}
              </span>
            </div>
            <div className="data-card__body">
              <p className="data-card__note">{tx.note || "No description"}</p>
              <div className="data-card__meta">
                <span>{new Date(tx.transaction_date).toLocaleDateString("en-US")}</span>
                <span className="truncate-id">Family: {tx.family_id.slice(0, 8)}...</span>
              </div>
              <div className="data-card__actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="action-btn"
                  onClick={() => onEditTransaction(tx)}
                  title="Edit"
                >
                  <IconEdit size={14} />
                </button>
                <button
                  className="action-btn action-btn--danger"
                  onClick={() => onDeleteTransaction(tx)}
                  title="Delete"
                >
                  <IconTrash size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      />

      {/* Filter Modal */}
      {showFilterModal && (
        <DetailModal onClose={() => setShowFilterModal(false)}>
          <h3>Filter Transactions</h3>
          <div className="filter-modal__content">
            <Dropdown
              label="Family"
              placeholder="All Families"
              value={filterFamilyId}
              onChange={onFilterFamilyChange}
              options={(families ?? []).map((f) => ({ value: f.id, label: f.name }))}
            />
            <Dropdown
              label="Created By"
              placeholder="All Users"
              value={filterUserId}
              onChange={onFilterUserChange}
              options={(users ?? []).map((u) => ({ value: u.id, label: u.email }))}
            />
          </div>
          <div className="form-actions">
            {activeFilterCount > 0 && (
              <button type="button" className="btn-secondary" onClick={handleResetFilters}>
                Reset
              </button>
            )}
            <button type="button" className="btn-primary" onClick={() => setShowFilterModal(false)}>
              Apply
            </button>
          </div>
        </DetailModal>
      )}
    </>
  );
}

// Families Tab
function FamiliesTab({
  data,
  isLoading,
  isFetching,
  page,
  onPageChange,
  onRefresh,
  onSelect,
  onCreateFamily,
  onEditFamily,
  onDeleteFamily,
  onManageMembers,
}: {
  data?: { data: FamilyItem[]; total: number; total_pages: number };
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  onPageChange: (p: number) => void;
  onRefresh: () => void;
  onSelect: (family: FamilyItem) => void;
  onCreateFamily: () => void;
  onEditFamily: (family: FamilyItem) => void;
  onDeleteFamily: (family: FamilyItem) => void;
  onManageMembers: (family: FamilyItem) => void;
}) {
  const columns: Column<FamilyItem>[] = [
    {
      id: "name",
      label: "Name",
      cell: (family) => (
        <span className="clickable-row" onClick={() => onSelect(family)}>
          {family.name}
        </span>
      ),
    },
    {
      id: "created_by",
      label: "Created By",
      cell: (family) => family.created_by_name || family.created_by.slice(0, 8) + "...",
    },
    {
      id: "created_at",
      label: "Created At",
      width: "120px",
      cell: (family) => new Date(family.created_at).toLocaleDateString("en-US"),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data ? { ...data, current_page: page, last_page: data.total_pages, per_page: 20 } : []}
      loading={isLoading}
      emptyText="No families found"
      pageSize={20}
      onPageChange={onPageChange}
      renderHeaderActions={() => (
        <>
          <button onClick={onCreateFamily} className="add-btn">
            <IconPlus size={18} />
            <span>Add Family</span>
          </button>
          <button onClick={onRefresh} className={`refresh-btn${isFetching ? ' isRefreshing' : ''}`}>
            <IconRefresh size={18} />
          </button>
        </>
      )}
      renderActions={(family) => (
        <>
          <button className="action-btn" onClick={() => onManageMembers(family)} title="Manage Members">
            <IconSettings size={16} />
          </button>
          <button className="action-btn" onClick={() => onEditFamily(family)} title="Edit Family">
            <IconEdit size={16} />
          </button>
          <button className="action-btn danger" onClick={() => onDeleteFamily(family)} title="Delete Family">
            <IconTrash size={16} />
          </button>
        </>
      )}
      renderMobileCard={(family) => (
        <div key={family.id} className="data-card">
          <div className="data-card__header">
            <span className="data-card__title">{family.name}</span>
            <span className="truncate-id">{family.id.slice(0, 8)}...</span>
          </div>
          <div className="data-card__meta">
            <span>Created: {new Date(family.created_at).toLocaleDateString("en-US")}</span>
          </div>
          <div className="data-card__actions">
            <button className="action-btn" onClick={() => onManageMembers(family)} title="Manage Members">
              <IconSettings size={16} />
            </button>
            <button className="action-btn" onClick={() => onEditFamily(family)} title="Edit Family">
              <IconEdit size={16} />
            </button>
            <button className="action-btn danger" onClick={() => onDeleteFamily(family)} title="Delete Family">
              <IconTrash size={16} />
            </button>
          </div>
        </div>
      )}
    />
  );
}

// Users Tab
function UsersTab({
  data,
  isLoading,
  isFetching,
  page,
  onPageChange,
  onRefresh,
  onSelect,
  onCreateUser,
  onEditUser,
  onDeleteUser,
}: {
  data?: { data: UserItem[]; total: number; total_pages: number };
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  onPageChange: (p: number) => void;
  onRefresh: () => void;
  onSelect: (user: UserItem) => void;
  onCreateUser: () => void;
  onEditUser: (user: UserItem) => void;
  onDeleteUser: (user: UserItem) => void;
}) {
  const columns: Column<UserItem>[] = [
    {
      id: "id",
      label: "ID",
      width: "100px",
      cell: (user) => (
        <span className="truncate-id">{user.id.slice(0, 8)}...</span>
      ),
    },
    {
      id: "email",
      label: "Email",
    },
    {
      id: "role",
      label: "Role",
      width: "80px",
      cell: (user) => (
        <span className={`role-${user.role}`}>{user.role}</span>
      ),
    },
    {
      id: "created_at",
      label: "Created At",
      width: "120px",
      cell: (user) => new Date(user.created_at).toLocaleDateString("en-US"),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data ? { ...data, current_page: page, last_page: data.total_pages, per_page: 20 } : []}
      loading={isLoading}
      emptyText="No users found"
      pageSize={20}
      onPageChange={onPageChange}
      renderHeaderActions={() => (
        <>
          <button onClick={onCreateUser} className="add-btn">
            <IconPlus size={18} />
            <span>Add User</span>
          </button>
          <button onClick={onRefresh} className={`refresh-btn${isFetching ? ' isRefreshing' : ''}`}>
            <IconRefresh size={18} />
          </button>
        </>
      )}
      renderActions={(user) => (
        <>
          <button className="action-btn" onClick={() => onSelect(user)} title="View Details">
            <IconUsers size={16} />
          </button>
          <button className="action-btn" onClick={() => onEditUser(user)} title="Edit Role">
            <IconEdit size={16} />
          </button>
          <button className="action-btn danger" onClick={() => onDeleteUser(user)} title="Delete User">
            <IconTrash size={16} />
          </button>
        </>
      )}
      renderMobileCard={(user) => (
        <div key={user.id} className="data-card">
          <div className="data-card__header">
            <span className="data-card__title">{user.email}</span>
            <span className={`role-badge role-${user.role}`}>{user.role}</span>
          </div>
          <div className="data-card__meta">
            <span>Registered: {new Date(user.created_at).toLocaleDateString("en-US")}</span>
          </div>
          <div className="data-card__actions">
            <button className="action-btn" onClick={() => onSelect(user)} title="View Details">
              <IconUsers size={16} />
            </button>
            <button className="action-btn" onClick={() => onEditUser(user)} title="Edit Role">
              <IconEdit size={16} />
            </button>
            <button className="action-btn danger" onClick={() => onDeleteUser(user)} title="Delete User">
              <IconTrash size={16} />
            </button>
          </div>
        </div>
      )}
    />
  );
}

// Helper
function formatCurrency(amount: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(parseFloat(amount));
}