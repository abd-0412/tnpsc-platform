'use client';

import { useState, useEffect } from 'react';
import { Layers, ChevronDown, ChevronRight, Plus, Edit2, Trash2, CheckCircle2, Folder, BookOpen, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SyllabusNode {
  id: string;
  parent_id: string | null;
  level: string;
  title_en: string;
  title_ta: string;
  order_index: number;
  exam_ids: string[];
  is_active: boolean;
  children?: SyllabusNode[];
}

export default function SyllabusManagementPage() {
  const [nodes, setNodes] = useState<SyllabusNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'sub-tamil': true,
    'sub-polity': true,
  });

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [parentNode, setParentNode] = useState<SyllabusNode | null>(null);
  const [newNodeId, setNewNodeId] = useState('');
  const [newNodeLevel, setNewNodeLevel] = useState('unit');
  const [newNodeTitleTa, setNewNodeTitleTa] = useState('');
  const [newNodeTitleEn, setNewNodeTitleEn] = useState('');
  const [newNodeOrder, setNewNodeOrder] = useState(1);

  const supabase = createClient();

  const fetchSyllabus = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('syllabus_nodes')
      .select('*')
      .order('order_index', { ascending: true });

    if (!error && data) {
      // Build tree structure
      const map: Record<string, SyllabusNode> = {};
      const roots: SyllabusNode[] = [];

      data.forEach((item: SyllabusNode) => {
        map[item.id] = { ...item, children: [] };
      });

      data.forEach((item: SyllabusNode) => {
        if (item.parent_id && map[item.parent_id]) {
          map[item.parent_id].children?.push(map[item.id]);
        } else {
          roots.push(map[item.id]);
        }
      });

      setNodes(roots);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSyllabus();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateNode = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = newNodeId.trim() || `node-${Date.now().toString(36)}`;
    const { error } = await supabase
      .from('syllabus_nodes')
      .insert({
        id,
        parent_id: parentNode ? parentNode.id : null,
        level: newNodeLevel,
        title_ta: newNodeTitleTa,
        title_en: newNodeTitleEn,
        order_index: newNodeOrder,
        exam_ids: ['group_4', 'group_2', 'group_2a'],
        is_active: true,
      });

    if (error) {
      alert(`Error creating syllabus component: ${error.message}`);
    } else {
      setShowAddModal(false);
      setNewNodeTitleTa('');
      setNewNodeTitleEn('');
      setNewNodeId('');
      fetchSyllabus();
    }
  };

  const renderNode = (node: SyllabusNode, depth = 0) => {
    const isExpanded = !!expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="space-y-1">
        <div
          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
            depth === 0
              ? 'bg-slate-800/90 border-slate-700/80 font-semibold text-white'
              : depth === 1
              ? 'bg-slate-850 border-slate-750 text-slate-200 ml-6'
              : 'bg-slate-900/60 border-slate-800 text-slate-300 ml-12'
          }`}
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(node.id)}
                className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="w-5" />
            )}

            {depth === 0 ? (
              <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
            ) : depth === 1 ? (
              <Folder className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}

            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-950/80 text-amber-300/80 border border-slate-700/50">
              {node.level}
            </span>

            <span className="truncate">
              {node.title_ta}
              <span className="text-[11px] text-slate-400 font-normal ml-2">({node.title_en})</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[10px] font-mono text-slate-500">#{node.order_index}</span>
            <button
              onClick={() => {
                setParentNode(node);
                setNewNodeLevel(
                  node.level === 'subject'
                    ? 'unit'
                    : node.level === 'unit'
                    ? 'chapter'
                    : 'topic'
                );
                setShowAddModal(true);
              }}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
              title="Add Child Node"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="space-y-1">
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
            <Layers className="w-6 h-6 text-amber-400" />
            <span>பாடத்திட்ட கட்டமைப்பு (Syllabus Management)</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            8-நிலை பாடத்திட்ட படிநிலை அமைப்பு (Subject → Unit → Lesson → Chapter → Topic - Module 05).
          </p>
        </div>

        <button
          onClick={() => {
            setParentNode(null);
            setNewNodeLevel('subject');
            setShowAddModal(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>புதிய பாடம் சேர் (Add Subject)</span>
        </button>
      </div>

      {/* Tree View Container */}
      <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/70 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
          <span className="text-xs font-semibold text-slate-300">பாடத்திட்ட படிநிலை (Hierarchical Tree)</span>
          <span className="text-xs text-slate-400 font-mono">
            {nodes.length} Subjects Loaded
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            பாடத்திட்டம் ஏற்றப்படுகிறது... (Loading syllabus tree...)
          </div>
        ) : nodes.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            பாடத்திட்டம் காலியாக உள்ளது. (No syllabus nodes found).
          </div>
        ) : (
          <div className="space-y-2">{nodes.map((root) => renderNode(root, 0))}</div>
        )}
      </div>

      {/* Add Component Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <span>
                {parentNode ? `சேர்க்கை: ${parentNode.title_ta}` : 'புதிய பாடம் சேர் (Add Subject)'}
              </span>
            </h2>

            <form onSubmit={handleCreateNode} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">நிலை வகை (Level)</label>
                <select
                  value={newNodeLevel}
                  onChange={(e) => setNewNodeLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="subject">பாடம் (Subject)</option>
                  <option value="unit">அலகு (Unit)</option>
                  <option value="lesson">பாடம் / இயல் (Lesson)</option>
                  <option value="chapter">அத்தியாயம் (Chapter)</option>
                  <option value="topic">தலைப்பு (Topic)</option>
                  <option value="subtopic">உபதலைப்பு (Subtopic)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">பெயர் (தமிழ்)</label>
                <input
                  type="text"
                  required
                  value={newNodeTitleTa}
                  onChange={(e) => setNewNodeTitleTa(e.target.value)}
                  placeholder="e.g. பொது அறிவியல்"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Title (English)</label>
                <input
                  type="text"
                  required
                  value={newNodeTitleEn}
                  onChange={(e) => setNewNodeTitleEn(e.target.value)}
                  placeholder="e.g. General Science"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">குறியீடு (ID / Code)</label>
                  <input
                    type="text"
                    value={newNodeId}
                    onChange={(e) => setNewNodeId(e.target.value)}
                    placeholder="Optional auto ID"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">வரிசை எண் (Order)</label>
                  <input
                    type="number"
                    value={newNodeOrder}
                    onChange={(e) => setNewNodeOrder(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200"
                >
                  ரத்து செய் (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
                >
                  சேர் (Add Component)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

