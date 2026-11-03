'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  History,
  Shield,
  Search,
  Filter,
  RefreshCw,
  FileText,
  User,
  CheckCircle2,
  AlertCircle,
  Database,
  Clock,
  ArrowUpRight
} from 'lucide-react';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, any>;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedAction !== 'all') params.set('action', selectedAction);
      if (selectedEntity !== 'all') params.set('entity_type', selectedEntity);
      params.set('limit', '50');

      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedAction, selectedEntity]);

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const actionMatch = log.action?.toLowerCase().includes(q);
    const entityMatch = log.entity_type?.toLowerCase().includes(q);
    const idMatch = log.entity_id?.toLowerCase().includes(q);
    const userMatch = log.profiles?.email?.toLowerCase().includes(q) || log.profiles?.full_name?.toLowerCase().includes(q);
    return actionMatch || entityMatch || idMatch || userMatch;
  });

  const getActionBadge = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'publish':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'update':
      case 'verify':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'delete':
      case 'reject':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'import':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
            <span>Module 18</span>
            <span>•</span>
            <span>Compliance, Security & Activity Logs</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 text-indigo-400" />
            செயல் வரலாறு & தணிக்கை (Audit & Activity Logs)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Immutable audit trail of question bank mutations, test publications, and administrative operations.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Refresh Trail</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-850 p-4 rounded-xl border border-slate-700/70">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs by user, entity ID, action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">அனைத்து செயல்கள் (All Actions)</option>
            <option value="create">உருவாக்கம் (Create)</option>
            <option value="import">இறக்குமதி (Import)</option>
            <option value="verify">சரிபார்ப்பு (Verify)</option>
            <option value="publish">வெளியீடு (Publish)</option>
            <option value="update">திருத்தம் (Update)</option>
            <option value="delete">நீக்கம் (Delete)</option>
          </select>
        </div>

        <div>
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">அனைத்து பிரிவுகள் (All Entities)</option>
            <option value="question">வினா (Question)</option>
            <option value="test_template">தேர்வு வார்ப்புரு (Test Template)</option>
            <option value="profile">பயனர் (User Profile)</option>
            <option value="syllabus">பாடத்திட்டம் (Syllabus Node)</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-850 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-2" />
            <p>Loading audit trail...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs space-y-2">
            <Shield className="w-8 h-8 text-slate-500 mx-auto opacity-60" />
            <p className="font-semibold text-slate-300">செயல் பதிவுகள் எதுவும் இல்லை</p>
            <p className="text-[11px] text-slate-500">
              No audit logs matched your query. Activity logs are recorded automatically on data mutations.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-700 text-slate-400 font-mono text-[11px] uppercase">
                  <th className="py-3 px-4">நேரம் (Timestamp)</th>
                  <th className="py-3 px-4">பயனர் (Operator)</th>
                  <th className="py-3 px-4">செயல் (Action)</th>
                  <th className="py-3 px-4">பிரிவு (Entity)</th>
                  <th className="py-3 px-4">குறியீடு (Entity ID)</th>
                  <th className="py-3 px-4">விவரங்கள் (Details)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="text-white font-medium">
                          {log.profiles?.full_name || log.profiles?.email || 'Platform Admin'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300 uppercase">
                      {log.entity_type}
                    </td>

                    <td className="py-3 px-4 text-amber-400 font-bold truncate max-w-xs">
                      {log.entity_id}
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-sans truncate max-w-sm">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

