'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, GraduationCap, CheckCircle2, XCircle, KeyRound, Search, AlertCircle, RefreshCw } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'learner';
  is_active: boolean;
  target_exam_id?: string;
  created_at: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'learner' | 'admin'>('learner');
  const [newExam, setNewExam] = useState('group_4');
  const [modalLoading, setModalLoading] = useState(false);

  // Password Reset Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
      setUsers(data.users || []);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (user: Profile) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, is_active: !user.is_active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user status');
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setModalLoading(true);
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          full_name: newFullName,
          role: newRole,
          target_exam_id: newExam,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      setShowAddModal(false);
      setNewEmail('');
      setNewFullName('');
      setNewPassword('');
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setModalLoading(true);
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedUser.id, password: resetPasswordVal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      alert(`Password updated successfully for ${selectedUser.email}`);
      setShowResetModal(false);
      setSelectedUser(null);
      setResetPasswordVal('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
            <Users className="w-6 h-6 text-amber-400" />
            <span>பயனர் மேலாண்மை (User Management)</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            அனுமதிக்கப்பட்ட நிர்வாகி மற்றும் மாணவர் கணக்குகள் (Module 03).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>புதிய மாணவர் கணக்கு சேர் (Add Learner)</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <button
          onClick={fetchUsers}
          className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-700 transition-colors"
          title="Refresh List"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-700/80 bg-slate-800/60 shadow-xl">
        <table className="min-w-full divide-y divide-slate-700/80 text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-6 py-4">பயனர் (User)</th>
              <th className="px-6 py-4">பொறுப்பு (Role)</th>
              <th className="px-6 py-4">இலக்கு தேர்வு (Target Exam)</th>
              <th className="px-6 py-4">நிலை (Status)</th>
              <th className="px-6 py-4">சேர்க்கப்பட்ட தேதி (Joined)</th>
              <th className="px-6 py-4 text-right">நடவடிக்கை (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-slate-300">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  பயனர்கள் ஏற்றப்படுகின்றன... (Loading users...)
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  எந்த பயனரும் கிடைக்கவில்லை (No users found)
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-amber-400">
                        {user.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user.full_name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'admin' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <Shield className="w-3 h-3" />
                        <span>Admin</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <GraduationCap className="w-3 h-3" />
                        <span>Learner</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-300">
                    {user.target_exam_id ? user.target_exam_id.toUpperCase().replace('_', ' ') : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {user.is_active ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-400 font-medium text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>செயலில் (Active)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-red-400 font-medium text-[11px]">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>முடக்கப்பட்டது (Deactivated)</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-[11px]">
                    {new Date(user.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowResetModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white transition-all"
                      title="Reset Password"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          user.is_active
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                      >
                        {user.is_active ? 'முடக்கு (Deactivate)' : 'இயக்கு (Activate)'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-amber-400" />
              <span>புதிய மாணவர் கணக்கு சேர் (Add New Account)</span>
            </h2>
            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">முழு பெயர் (Full Name)</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. K. Selvi"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">மின்னஞ்சல் (Email Address)</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. learner3@tnpsc.local"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">கடவுச்சொல் (Password)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">பொறுப்பு (Role)</label>
                <select
                  value={newRole}
                  onChange={(e: any) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="learner">மாணவர் (Learner)</option>
                  <option value="admin">நிர்வாகி (Admin)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">இலக்கு தேர்வு (Target Exam)</label>
                <select
                  value={newExam}
                  onChange={(e) => setNewExam(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="group_4">TNPSC Group 4 (VAO & JA)</option>
                  <option value="group_2">TNPSC Group 2 (Interview Posts)</option>
                  <option value="group_2a">TNPSC Group 2A (Non-Interview Posts)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200"
                >
                  ரத்து செய் (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold disabled:opacity-50"
                >
                  {modalLoading ? 'சேர்க்கப்படுகிறது...' : 'கணக்கு உருவாக்கு (Create Account)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 sm:p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              <span>கடவுச்சொல் மாற்று (Reset Password)</span>
            </h2>
            <p className="text-xs text-slate-400">
              User: <span className="text-white font-medium">{selectedUser.email}</span>
            </p>
            <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">புதிய கடவுச்சொல் (New Password)</label>
                <input
                  type="password"
                  required
                  value={resetPasswordVal}
                  onChange={(e) => setResetPasswordVal(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200"
                >
                  ரத்து செய் (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold disabled:opacity-50"
                >
                  {modalLoading ? 'சேமிக்கப்படுகிறது...' : 'கடவுச்சொல் மாற்று (Update)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

