import { useEffect, useState } from "react";
import adminAxios from "../api/adminAxios";
import AdminFooter from "../layout/AdminFooter";
import LoadingSpinner from "../components/LoadingSpinner";
import {
    BookOpen, FileText, Plus, Trash2, Eye, School, GraduationCap, BookText,
    ChevronDown, ChevronUp, CheckCircle, Loader2, Download, RefreshCw,
    AlertCircle, Layers, Hash, Settings2, Star, ToggleLeft, ToggleRight,
    BookOpenCheck, List,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────
const Q_TYPES = [
    { key: "mcq",           label: "MCQ",           color: "blue",   defaultCount: 5,  defaultMarks: 1 },
    { key: "fill_in_blank", label: "Fill in Blank",  color: "purple", defaultCount: 5,  defaultMarks: 1 },
    { key: "short_answer",  label: "Short Answer",   color: "amber",  defaultCount: 5,  defaultMarks: 3 },
    { key: "long_answer",   label: "Long Answer",    color: "gray",   defaultCount: 5,  defaultMarks: 5 },
];

// Subject worksheet defaults: 30Q, ~100 marks
const SUBJECT_Q_TYPES = [
    { key: "mcq",           label: "MCQ",           color: "blue",   defaultCount: 10, defaultMarks: 1 },
    { key: "fill_in_blank", label: "Fill in Blank",  color: "purple", defaultCount: 5,  defaultMarks: 2 },
    { key: "short_answer",  label: "Short Answer",   color: "amber",  defaultCount: 10, defaultMarks: 4 },
    { key: "long_answer",   label: "Long Answer",    color: "gray",   defaultCount: 5,  defaultMarks: 8 },
];

const DIFFICULTY_OPTIONS = [
    { value: "mixed",  label: "Mixed",  desc: "40% easy · 40% medium · 20% hard" },
    { value: "easy",   label: "Easy",   desc: "All questions at easy level" },
    { value: "medium", label: "Medium", desc: "All questions at medium level" },
    { value: "hard",   label: "Hard",   desc: "All questions at hard level" },
];

// ── Tiny helpers ──────────────────────────────────────────────────────────────
const Badge = ({ label, color = "blue" }) => {
    const colors = {
        blue:   "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
        green:  "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
        amber:  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
        red:    "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
        purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
        gray:   "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
        teal:   "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    };
    return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${colors[color]}`}>{label}</span>;
};

const StatusBadge = ({ status }) => {
    if (status === "done")       return <Badge label="Done" color="green" />;
    if (status === "generating") return <Badge label="Generating…" color="blue" />;
    if (status === "pending")    return <Badge label="Pending" color="amber" />;
    if (status === "error")      return <Badge label="Error" color="red" />;
    return <Badge label={status} color="gray" />;
};

const TypeBadge = ({ type }) => {
    const t = Q_TYPES.find(q => q.key === type);
    return <Badge label={t?.label || type} color={t?.color || "gray"} />;
};

// ── Small counter input ───────────────────────────────────────────────────────
const CountInput = ({ value, onChange, min = 0, max = 30, disabled }) => (
    <div className="flex items-center gap-1">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
            disabled={disabled || value <= min}
            className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors font-bold text-sm">−</button>
        <span className="w-8 text-center font-bold text-gray-900 dark:text-white text-sm">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
            disabled={disabled || value >= max}
            className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors font-bold text-sm">+</button>
    </div>
);

// ── Shared: Question type config builder ──────────────────────────────────────
const QuestionTypeConfig = ({ qtypes, types, totalQuestions, totalMarks, enabledCount, updateType, toggleType, maxQ }) => (
    <div>
        <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Question Types &amp; Marks</h3>
            <span className="text-xs text-gray-400">{enabledCount} type{enabledCount !== 1 ? "s" : ""} enabled</span>
        </div>
        <div className="space-y-2">
            {qtypes.map((t) => {
                const state    = types[t.key];
                const rowTotal = state.enabled ? state.count * state.marks : 0;
                return (
                    <div key={t.key} className={`rounded-xl border transition-all ${state.enabled
                        ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                        : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-60"}`}>
                        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                            <button type="button" onClick={() => toggleType(t.key)} className="flex-shrink-0" title={state.enabled ? "Disable" : "Enable"}>
                                {state.enabled
                                    ? <ToggleRight className="h-5 w-5 text-indigo-500" />
                                    : <ToggleLeft className="h-5 w-5 text-gray-400" />}
                            </button>
                            <span className="flex-1"><Badge label={t.label} color={t.color} /></span>
                            {state.enabled && (
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    = <strong className="text-gray-800 dark:text-gray-200">{rowTotal}</strong> marks
                                </span>
                            )}
                        </div>
                        {state.enabled && (
                            <div className="grid grid-cols-2 gap-3 px-4 pb-3">
                                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">No. of Qs</span>
                                    <CountInput value={state.count} onChange={(v) => updateType(t.key, "count", v)} min={0} max={maxQ} />
                                </div>
                                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Marks each</span>
                                    <CountInput value={state.marks} onChange={(v) => updateType(t.key, "marks", v)} min={1} max={20} />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
        <div className="mt-3 flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
            <span className="text-sm text-gray-600 dark:text-gray-400">
                Total questions: <strong className="ml-1 text-gray-900 dark:text-white">{totalQuestions}</strong>
                {maxQ && <span className="text-gray-400 text-xs ml-1">/ {maxQ} max</span>}
            </span>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                <Star className="h-4 w-4" />{totalMarks} marks
            </div>
        </div>
    </div>
);

// ── Difficulty picker ─────────────────────────────────────────────────────────
const DifficultyPicker = ({ difficulty, setDifficulty }) => (
    <div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Difficulty</h3>
        <div className="grid grid-cols-2 gap-2">
            {DIFFICULTY_OPTIONS.map((d) => (
                <button key={d.value} type="button" onClick={() => setDifficulty(d.value)}
                    className={`px-4 py-3 rounded-xl border text-left transition-all ${difficulty === d.value
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-sm"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"}`}>
                    <div className={`text-sm font-semibold ${difficulty === d.value ? "text-indigo-700 dark:text-indigo-300" : "text-gray-800 dark:text-gray-200"}`}>{d.label}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{d.desc}</div>
                </button>
            ))}
        </div>
    </div>
);

// ── Chapter Generate Modal ────────────────────────────────────────────────────
const GenerateModal = ({ chapter, bookId, onClose, onGenerated }) => {
    const [types, setTypes]       = useState(Q_TYPES.reduce((acc, t) => ({ ...acc, [t.key]: { enabled: true, count: t.defaultCount, marks: t.defaultMarks } }), {}));
    const [difficulty, setDifficulty] = useState("mixed");
    const [generating, setGenerating] = useState(false);
    const [error, setError]       = useState("");

    const updateType = (key, field, val) => setTypes(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } }));
    const toggleType = (key)             => setTypes(prev => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }));

    const totalQuestions = Q_TYPES.reduce((sum, t) => sum + (types[t.key].enabled ? types[t.key].count : 0), 0);
    const totalMarks     = Q_TYPES.reduce((sum, t) => sum + (types[t.key].enabled ? types[t.key].count * types[t.key].marks : 0), 0);
    const enabledCount   = Q_TYPES.filter(t => types[t.key].enabled).length;

    const handleGenerate = async () => {
        if (totalQuestions < 1)  { setError("Enable at least one question type."); return; }
        if (totalQuestions > 50) { setError("Total questions cannot exceed 50."); return; }
        setGenerating(true); setError("");
        try {
            const type_config = {};
            Q_TYPES.forEach(t => {
                if (types[t.key].enabled && types[t.key].count > 0)
                    type_config[t.key] = { count: types[t.key].count, marks: types[t.key].marks };
            });
            const res = await adminAxios.post(`/books/${bookId}/chapters/${chapter.id}/worksheets`, { type_config, difficulty, total_marks: totalMarks });
            onGenerated(res.data.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Generation failed. Please retry.");
        } finally { setGenerating(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                            <Settings2 className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generate Worksheet</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Ch. {chapter.chapter_no}: {chapter.chapter_title}</p>
                        </div>
                        <button onClick={onClose} disabled={generating} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">✕</button>
                    </div>
                </div>
                <div className="px-6 py-5 space-y-6">
                    <QuestionTypeConfig qtypes={Q_TYPES} types={types} totalQuestions={totalQuestions} totalMarks={totalMarks}
                        enabledCount={enabledCount} updateType={updateType} toggleType={toggleType} maxQ={30} />
                    <DifficultyPicker difficulty={difficulty} setDifficulty={setDifficulty} />
                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
                        </div>
                    )}
                    {generating && (
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-sm flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                            Generating {totalQuestions} questions with Gemini AI… This may take 20–40 seconds.
                        </div>
                    )}
                </div>
                <div className="sticky bottom-0 bg-white dark:bg-gray-900 px-6 pb-6 pt-3 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                    <button onClick={onClose} disabled={generating}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-sm disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={handleGenerate} disabled={generating || totalQuestions < 1}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2">
                        {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</> : <><Plus className="h-4 w-4" /> Generate · {totalMarks} marks</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Subject Generate Modal ────────────────────────────────────────────────────
const SubjectGenerateModal = ({ bookId, chapters, onClose, onGenerated }) => {
    const [types, setTypes]           = useState(SUBJECT_Q_TYPES.reduce((acc, t) => ({ ...acc, [t.key]: { enabled: true, count: t.defaultCount, marks: t.defaultMarks } }), {}));
    const [difficulty, setDifficulty] = useState("mixed");
    const [generating, setGenerating] = useState(false);
    const [error, setError]           = useState("");
    // Chapter selection: null = all
    const [selectedChapters, setSelectedChapters] = useState([]);
    const [allChapters, setAllChapters]           = useState(true);

    const updateType = (key, field, val) => setTypes(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } }));
    const toggleType = (key)             => setTypes(prev => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }));

    const totalQuestions = SUBJECT_Q_TYPES.reduce((sum, t) => sum + (types[t.key].enabled ? types[t.key].count : 0), 0);
    const totalMarks     = SUBJECT_Q_TYPES.reduce((sum, t) => sum + (types[t.key].enabled ? types[t.key].count * types[t.key].marks : 0), 0);
    const enabledCount   = SUBJECT_Q_TYPES.filter(t => types[t.key].enabled).length;

    const toggleChapter = (id) => {
        setSelectedChapters(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleGenerate = async () => {
        if (totalQuestions < 1)  { setError("Enable at least one question type."); return; }
        if (totalQuestions > 30) { setError("Subject worksheets are capped at 30 questions."); return; }
        if (!allChapters && selectedChapters.length === 0) { setError("Select at least one chapter."); return; }
        setGenerating(true); setError("");
        try {
            const type_config = {};
            SUBJECT_Q_TYPES.forEach(t => {
                if (types[t.key].enabled && types[t.key].count > 0)
                    type_config[t.key] = { count: types[t.key].count, marks: types[t.key].marks };
            });
            const payload = {
                type_config,
                difficulty,
                total_marks: totalMarks,
                ...((!allChapters && selectedChapters.length > 0) ? { chapter_ids: selectedChapters } : {}),
            };
            const res = await adminAxios.post(`/books/${bookId}/subject-worksheets`, payload);
            onGenerated(res.data.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Generation failed. Please retry.");
        } finally { setGenerating(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600">
                            <BookOpenCheck className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generate Subject Worksheet</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Cross-chapter · max 30 questions · ~100 marks</p>
                        </div>
                        <button onClick={onClose} disabled={generating} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">✕</button>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-6">
                    {/* Chapter selection */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Chapter Coverage</h3>
                        </div>
                        <div className="flex gap-2 mb-3">
                            <button type="button" onClick={() => { setAllChapters(true); setSelectedChapters([]); }}
                                className={`flex-1 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${allChapters
                                    ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300"
                                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"}`}>
                                All Chapters
                            </button>
                            <button type="button" onClick={() => setAllChapters(false)}
                                className={`flex-1 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${!allChapters
                                    ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300"
                                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"}`}>
                                Select Chapters
                            </button>
                        </div>
                        {!allChapters && (
                            <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                                {chapters.map(ch => (
                                    <label key={ch.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <input type="checkbox" checked={selectedChapters.includes(ch.id)}
                                            onChange={() => toggleChapter(ch.id)}
                                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            <span className="font-medium text-teal-600 dark:text-teal-400 mr-1.5">Ch.{ch.chapter_no}</span>
                                            {ch.chapter_title}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                        {!allChapters && selectedChapters.length > 0 && (
                            <p className="text-xs text-teal-600 dark:text-teal-400 mt-1.5 font-medium">
                                {selectedChapters.length} chapter{selectedChapters.length !== 1 ? "s" : ""} selected
                            </p>
                        )}
                    </div>

                    <QuestionTypeConfig qtypes={SUBJECT_Q_TYPES} types={types} totalQuestions={totalQuestions} totalMarks={totalMarks}
                        enabledCount={enabledCount} updateType={updateType} toggleType={toggleType} maxQ={30} />

                    {/* Target marks indicator */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                        <Star className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                            {totalMarks >= 90 && totalMarks <= 110
                                ? <><strong>Target hit!</strong> {totalMarks} marks is close to 100.</>
                                : totalMarks < 90
                                    ? <><strong>{totalMarks} marks</strong> — increase counts or marks per question to reach ~100.</>
                                    : <><strong>{totalMarks} marks</strong> — slightly above 100. Consider reducing marks per question.</>
                            }
                        </p>
                    </div>

                    <DifficultyPicker difficulty={difficulty} setDifficulty={setDifficulty} />

                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
                        </div>
                    )}
                    {generating && (
                        <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 text-sm flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                            Generating subject worksheet across {allChapters ? "all" : selectedChapters.length} chapters… This may take 30–60 seconds.
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 bg-white dark:bg-gray-900 px-6 pb-6 pt-3 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                    <button onClick={onClose} disabled={generating}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-sm disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={handleGenerate} disabled={generating || totalQuestions < 1}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-medium text-sm hover:from-teal-600 hover:to-emerald-700 transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2">
                        {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</> : <><Plus className="h-4 w-4" /> Generate · {totalMarks} marks</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Worksheet Viewer Modal ────────────────────────────────────────────────────
const WorksheetViewModal = ({ worksheet, onClose, isSubject = false }) => {
    const [expandedQ, setExpandedQ]   = useState(null);
    const [filterType, setFilterType] = useState("all");

    const questions  = worksheet.questions || [];
    const totalMarks = questions.reduce((s, q) => s + (q.marks || 0), 0);
    const presentTypes = ["all", ...Q_TYPES.map(t => t.key).filter(k => questions.some(q => q.type === k))];
    const filtered   = filterType === "all" ? questions : questions.filter(q => q.type === filterType);

    const typeCount = (key) => questions.filter(q => q.type === key).length;
    const typeMarks = (key) => questions.filter(q => q.type === key).reduce((s, q) => s + (q.marks || 0), 0);

    const handleDownload = () => {
        const lines = [
            `WORKSHEET: ${worksheet.title}`,
            `Book: ${worksheet.book?.title || ""} | Subject: ${worksheet.book?.subject_name || ""}`,
            isSubject ? `Chapters: all` : `Chapter: ${worksheet.chapter?.chapter_title || ""}`,
            `Total Marks: ${totalMarks} | Questions: ${questions.length}`,
            `Generated: ${worksheet.generated_at ? new Date(worksheet.generated_at).toLocaleDateString() : ""}`,
            "", "─".repeat(70), "",
        ];
        Q_TYPES.forEach(t => {
            const qs = questions.filter(q => q.type === t.key);
            if (!qs.length) return;
            const sectionMarks = qs.reduce((s, q) => s + (q.marks || 0), 0);
            lines.push(`\n${"═".repeat(60)}`);
            lines.push(`SECTION: ${t.label.toUpperCase()} (${qs.length} questions · ${sectionMarks} marks)`);
            lines.push(`${"═".repeat(60)}\n`);
            qs.forEach((q, i) => {
                lines.push(`Q${q.q_no || i + 1}. [${q.difficulty?.toUpperCase() || ""}] [${q.marks || "?"}M]${q.chapter_ref ? ` [${q.chapter_ref}]` : ""}`);
                lines.push(q.question);
                if (q.options) Object.entries(q.options).forEach(([k, v]) => lines.push(`   ${k}. ${v}`));
                lines.push(`\nAnswer: ${q.correct_answer}`);
                if (q.explanation) lines.push(`Explanation: ${q.explanation}`);
                lines.push("");
            });
        });
        const blob = new Blob([lines.join("\n")], { type: "text/plain" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = `${worksheet.title?.replace(/[^a-zA-Z0-9]/g, "_") || "worksheet"}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            {isSubject && <Badge label="Subject Worksheet" color="teal" />}
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{worksheet.title}</h2>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {worksheet.book?.title} · {worksheet.book?.subject_name} · Class {worksheet.book?.class_num}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {totalMarks > 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                <Star className="h-3.5 w-3.5 text-amber-500" />
                                <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{totalMarks} marks</span>
                            </div>
                        )}
                        <button onClick={handleDownload}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                            <Download className="h-4 w-4" />Download
                        </button>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">✕</button>
                    </div>
                </div>

                {/* Type filter tabs */}
                <div className="px-5 pt-3 pb-0 flex gap-2 flex-wrap border-b border-gray-100 dark:border-gray-800">
                    {presentTypes.map(k => {
                        const t   = Q_TYPES.find(q => q.key === k);
                        const cnt = k === "all" ? questions.length : typeCount(k);
                        const mrk = k === "all" ? totalMarks : typeMarks(k);
                        return (
                            <button key={k} onClick={() => setFilterType(k)}
                                className={`px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-colors ${filterType === k
                                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}>
                                {k === "all" ? "All" : t?.label || k} ({cnt}q · {mrk}m)
                            </button>
                        );
                    })}
                </div>

                {/* Questions list */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {filtered.map((q, i) => (
                        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                            <div className="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                onClick={() => setExpandedQ(expandedQ === i ? null : i)}>
                                <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                    {q.q_no || i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <TypeBadge type={q.type} />
                                        {q.chapter_ref && <Badge label={q.chapter_ref} color="teal" />}
                                        <span className="text-xs text-gray-400">{q.difficulty}</span>
                                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                                            <Star className="h-3 w-3" />{q.marks}m
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-800 dark:text-gray-200">{q.question}</p>
                                </div>
                                {expandedQ === i ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" /> : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />}
                            </div>
                            {expandedQ === i && (
                                <div className="border-t border-gray-100 dark:border-gray-800 px-4 pb-4 pt-3 bg-gray-50 dark:bg-gray-800/30 space-y-3">
                                    {q.options && (
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(q.options).map(([k, v]) => (
                                                <div key={k} className={`px-3 py-2 rounded-lg text-sm ${k === q.correct_answer
                                                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-medium"
                                                    : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"}`}>
                                                    <strong className="mr-1">{k}.</strong>{v}
                                                    {k === q.correct_answer && <CheckCircle className="h-3.5 w-3.5 inline ml-1" />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                        <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">Answer</p>
                                        <p className="text-sm text-green-900 dark:text-green-200">{q.correct_answer}</p>
                                    </div>
                                    {q.explanation && (
                                        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Explanation</p>
                                            <p className="text-sm text-blue-900 dark:text-blue-200">{q.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ── Delete confirm modal ──────────────────────────────────────────────────────
const DeleteModal = ({ worksheet, bookId, chapterId, isSubject, onClose, onDeleted }) => {
    const [deleting, setDeleting] = useState(false);
    const handleDelete = async () => {
        setDeleting(true);
        try {
            const url = isSubject
                ? `/books/${bookId}/subject-worksheets/${worksheet.id}`
                : `/books/${bookId}/chapters/${chapterId}/worksheets/${worksheet.id}`;
            await adminAxios.delete(url);
            onDeleted(worksheet.id);
            onClose();
        } catch { } finally { setDeleting(false); }
    };
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/30"><Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" /></div>
                    <div>
                        <h2 className="font-bold text-gray-900 dark:text-white">Delete Worksheet</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">This cannot be undone</p>
                    </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">Delete <strong className="text-gray-900 dark:text-white">"{worksheet.title}"</strong>?</p>
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-sm">Cancel</button>
                    <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Chapter row ───────────────────────────────────────────────────────────────
const ChapterRow = ({ chapter, bookId, onGenerateClick }) => {
    const [expanded, setExpanded]               = useState(false);
    const [worksheets, setWorksheets]           = useState([]);
    const [loading, setLoading]                 = useState(false);
    const [viewingWorksheet, setViewingWorksheet] = useState(null);
    const [deletingWorksheet, setDeletingWorksheet] = useState(null);

    const loadWorksheets = async () => {
        setLoading(true);
        try {
            const res = await adminAxios.get(`/books/${bookId}/chapters/${chapter.id}/worksheets`);
            setWorksheets(res.data.data || []);
        } catch { setWorksheets([]); } finally { setLoading(false); }
    };

    const handleExpand = () => { if (!expanded) loadWorksheets(); setExpanded(e => !e); };

    const handleViewWorksheet = async (ws) => {
        try {
            const res = await adminAxios.get(`/books/${bookId}/chapters/${chapter.id}/worksheets/${ws.id}`);
            setViewingWorksheet(res.data.data);
        } catch { console.error("Failed to load worksheet"); }
    };

    const handleGenerated    = (newWs) => { setWorksheets(prev => [newWs, ...prev]); if (!expanded) { setExpanded(true); loadWorksheets(); } };
    const handleDeleted      = (id)    => setWorksheets(prev => prev.filter(w => w.id !== id));

    return (
        <>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" onClick={handleExpand}>
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {chapter.chapter_no}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{chapter.chapter_title || `Chapter ${chapter.chapter_no}`}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {chapter.total_segments || 0} segments
                            {chapter.worksheet_count > 0 && (
                                <span className="ml-2 text-indigo-500 dark:text-indigo-400 font-medium">· {chapter.worksheet_count} worksheet{chapter.worksheet_count !== 1 ? "s" : ""}</span>
                            )}
                        </p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onGenerateClick(chapter, handleGenerated); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-sm">
                        <Plus className="h-3.5 w-3.5" />Generate
                    </button>
                    {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </div>
                {expanded && (
                    <div className="border-t border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/30">
                        {loading ? (
                            <div className="flex items-center justify-center py-8 gap-2 text-gray-500"><Loader2 className="h-5 w-5 animate-spin" /><span className="text-sm">Loading…</span></div>
                        ) : worksheets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <FileText className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">No worksheets yet</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click "Generate" to create the first one</p>
                            </div>
                        ) : (
                            <div className="p-3 space-y-2">
                                {worksheets.map(ws => (
                                    <div key={ws.id} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <Hash className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{ws.title}</p>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <StatusBadge status={ws.status} />
                                                {ws.total_questions > 0 && <span className="text-xs text-gray-400">{ws.total_questions} questions</span>}
                                                {ws.total_marks > 0 && (
                                                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                                                        <Star className="h-3 w-3" />{ws.total_marks} marks
                                                    </span>
                                                )}
                                                {ws.generated_at && <span className="text-xs text-gray-400">{new Date(ws.generated_at).toLocaleDateString()}</span>}
                                                {ws.error_message && <span className="text-xs text-red-500 truncate max-w-xs" title={ws.error_message}>{ws.error_message}</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            {ws.status === "done" && (
                                                <button onClick={() => handleViewWorksheet(ws)} className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-500 transition-colors" title="View">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button onClick={() => setDeletingWorksheet(ws)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors" title="Delete">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            {viewingWorksheet && <WorksheetViewModal worksheet={viewingWorksheet} onClose={() => setViewingWorksheet(null)} />}
            {deletingWorksheet && (
                <DeleteModal worksheet={deletingWorksheet} bookId={bookId} chapterId={chapter.id} isSubject={false}
                    onClose={() => setDeletingWorksheet(null)} onDeleted={handleDeleted} />
            )}
        </>
    );
};

// ── Subject Worksheets tab panel ──────────────────────────────────────────────
const SubjectWorksheetsPanel = ({ bookId, chapters, onShowGenerateModal }) => {
    const [worksheets, setWorksheets]           = useState([]);
    const [loading, setLoading]                 = useState(false);
    const [viewingWorksheet, setViewingWorksheet] = useState(null);
    const [deletingWorksheet, setDeletingWorksheet] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await adminAxios.get(`/books/${bookId}/subject-worksheets`);
            setWorksheets(res.data.data || []);
        } catch { setWorksheets([]); } finally { setLoading(false); }
    };

    useEffect(() => { if (bookId) load(); }, [bookId]);

    const handleViewWorksheet = async (ws) => {
        try {
            const res = await adminAxios.get(`/books/${bookId}/subject-worksheets/${ws.id}`);
            setViewingWorksheet(res.data.data);
        } catch { console.error("Failed to load worksheet"); }
    };

    const handleDeleted = (id) => setWorksheets(prev => prev.filter(w => w.id !== id));

    const handleGenerated = (newWs) => {
        setWorksheets(prev => [newWs, ...prev]);
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {worksheets.length} Subject Worksheet{worksheets.length !== 1 ? "s" : ""}
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={load} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-teal-600 transition-colors">
                        <RefreshCw className="h-3.5 w-3.5" />Refresh
                    </button>
                    <button onClick={() => onShowGenerateModal(handleGenerated)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-sm font-medium hover:from-teal-600 hover:to-emerald-700 transition-all shadow-sm">
                        <Plus className="h-4 w-4" />New Subject Worksheet
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin text-teal-500" /><span>Loading…</span>
                </div>
            ) : worksheets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-900/20 mb-4">
                        <BookOpenCheck className="h-10 w-10 text-teal-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">No subject worksheets yet</h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm mb-4">Generate a cross-chapter worksheet covering the entire book or selected chapters.</p>
                    <button onClick={() => onShowGenerateModal(handleGenerated)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-medium text-sm hover:from-teal-600 hover:to-emerald-700 transition-all shadow-md">
                        <Plus className="h-4 w-4" />Generate First Subject Worksheet
                    </button>
                </div>
            ) : (
                <div className="space-y-3 mb-8">
                    {worksheets.map(ws => (
                        <div key={ws.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                                    <BookOpenCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{ws.title}</p>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <StatusBadge status={ws.status} />
                                        {ws.total_questions > 0 && <span className="text-xs text-gray-400">{ws.total_questions} questions</span>}
                                        {ws.total_marks > 0 && (
                                            <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                                                <Star className="h-3 w-3" />{ws.total_marks} marks
                                            </span>
                                        )}
                                        {ws.difficulty && <Badge label={ws.difficulty} color={ws.difficulty === "mixed" ? "blue" : ws.difficulty === "easy" ? "green" : ws.difficulty === "hard" ? "red" : "amber"} />}
                                        {ws.generated_at && <span className="text-xs text-gray-400">{new Date(ws.generated_at).toLocaleDateString()}</span>}
                                        {ws.error_message && <span className="text-xs text-red-500 truncate max-w-xs" title={ws.error_message}>{ws.error_message}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {ws.status === "done" && (
                                        <button onClick={() => handleViewWorksheet(ws)} className="p-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 text-teal-500 transition-colors" title="View">
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    )}
                                    <button onClick={() => setDeletingWorksheet(ws)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors" title="Delete">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {viewingWorksheet && <WorksheetViewModal worksheet={viewingWorksheet} onClose={() => setViewingWorksheet(null)} isSubject />}
            {deletingWorksheet && (
                <DeleteModal worksheet={deletingWorksheet} bookId={bookId} isSubject
                    onClose={() => setDeletingWorksheet(null)} onDeleted={handleDeleted} />
            )}
        </>
    );
};

// ── Stats cards ───────────────────────────────────────────────────────────────
const StatsCards = ({ stats }) => {
    const cards = [
        { label: "Total Books",          value: stats.books,           icon: <BookText className="h-5 w-5" />,         color: "blue"   },
        { label: "Total Chapters",       value: stats.chapters,        icon: <Layers className="h-5 w-5" />,           color: "purple" },
        { label: "Chapter Worksheets",   value: stats.worksheets,      icon: <FileText className="h-5 w-5" />,         color: "green"  },
        { label: "Subject Worksheets",   value: stats.subjectSheets,   icon: <BookOpenCheck className="h-5 w-5" />,    color: "teal"   },
    ];
    const colors = { blue: "from-blue-500 to-blue-600", purple: "from-purple-500 to-purple-600", green: "from-emerald-500 to-emerald-600", teal: "from-teal-500 to-teal-600", amber: "from-amber-500 to-amber-600" };
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map(c => (
                <div key={c.label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{c.label}</span>
                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${colors[c.color]} text-white`}>{c.icon}</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{c.value ?? "—"}</div>
                </div>
            ))}
        </div>
    );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const Worksheets = () => {
    const [schools, setSchools]               = useState([]);
    const [classes, setClasses]               = useState([]);
    const [books, setBooks]                   = useState([]);
    const [chapters, setChapters]             = useState([]);
    const [selectedSchool, setSelectedSchool] = useState("");
    const [selectedClass, setSelectedClass]   = useState("");
    const [selectedBook, setSelectedBook]     = useState("");
    const [loading, setLoading]               = useState(true);
    const [loadingChapters, setLoadingChapters] = useState(false);
    const [stats, setStats]                   = useState({ books: 0, chapters: 0, worksheets: 0, subjectSheets: 0 });
    const [statusMsg, setStatusMsg]           = useState({ type: "", message: "" });
    const [generateModal, setGenerateModal]   = useState(null);  // chapter modal
    const [subjectModal, setSubjectModal]     = useState(null);  // subject modal callback
    const [activeTab, setActiveTab]           = useState("chapter"); // "chapter" | "subject"

    useEffect(() => {
        const init = async () => {
            try { const res = await adminAxios.get("/schools"); setSchools(res.data.data || []); } catch {}
            setLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        setClasses([]); setSelectedClass(""); setBooks([]); setSelectedBook(""); setChapters([]);
        if (!selectedSchool) return;
        adminAxios.get(`/classes?school_id=${selectedSchool}`).then(r => setClasses(r.data.data || [])).catch(() => {});
    }, [selectedSchool]);

    useEffect(() => {
        setBooks([]); setSelectedBook(""); setChapters([]);
        if (!selectedSchool || !selectedClass) return;
        adminAxios.get("/books", { params: { school_id: selectedSchool, class_id: selectedClass } })
            .then(r => setBooks(r.data.data || [])).catch(() => {});
    }, [selectedSchool, selectedClass]);

    useEffect(() => {
        setChapters([]);
        if (!selectedBook) return;
        setLoadingChapters(true);
        const load = async () => {
            try {
                const [chapRes, wsRes, swRes] = await Promise.all([
                    adminAxios.get(`/books/${selectedBook}/chapters`),
                    adminAxios.get(`/books/${selectedBook}/worksheets`),
                    adminAxios.get(`/books/${selectedBook}/subject-worksheets`).catch(() => ({ data: { data: [] } })),
                ]);
                const chaps    = chapRes.data.data?.chapters || [];
                const allWs    = wsRes.data.data || [];
                const allSws   = swRes.data.data || [];
                const countMap = {};
                for (const ws of allWs) countMap[ws.chapter_id] = (countMap[ws.chapter_id] || 0) + 1;
                const enriched = chaps.map(ch => ({ ...ch, worksheet_count: countMap[ch.id] || 0 }));
                setChapters(enriched);
                setStats({
                    books:        books.length,
                    chapters:     enriched.length,
                    worksheets:   allWs.length,
                    subjectSheets: allSws.length,
                });
            } catch { setChapters([]); } finally { setLoadingChapters(false); }
        };
        load();
    }, [selectedBook]);

    const showStatus = (type, message) => {
        setStatusMsg({ type, message });
        setTimeout(() => setStatusMsg({ type: "", message: "" }), 4000);
    };

    if (loading) return <LoadingSpinner message="Loading…" />;
    const selectedBookData = books.find(b => String(b.id) === String(selectedBook));

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 px-4 md:px-6 lg:px-8 pt-8 pb-0 transition-colors duration-200">
            {statusMsg.message && (
                <div className={`mb-6 p-4 rounded-2xl shadow-lg ${statusMsg.type === "success" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" : statusMsg.type === "error" ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"}`}>
                    <div className="flex items-center justify-between">
                        <p className="font-medium">{statusMsg.message}</p>
                        <button onClick={() => setStatusMsg({ type: "", message: "" })} className="text-current hover:opacity-75">✕</button>
                    </div>
                </div>
            )}

            {/* Page header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                        <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Worksheets</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Generate AI-powered chapter &amp; subject worksheets</p>
                    </div>
                </div>
            </div>

            <StatsCards stats={stats} />

            {/* Book selector */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-6">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-indigo-500" />Select Book
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: "School", icon: <School />,        value: selectedSchool, set: setSelectedSchool, opts: schools,  nameKey: "name",       disabled: false },
                        { label: "Class",  icon: <GraduationCap />, value: selectedClass,  set: setSelectedClass,  opts: classes,  nameKey: "class_name", disabled: !selectedSchool },
                        { label: "Book",   icon: <BookText />,      value: selectedBook,   set: setSelectedBook,   opts: books,    nameKey: "title",      disabled: !selectedClass },
                    ].map(f => (
                        <div key={f.label}>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{f.label}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 [&>svg]:h-4 [&>svg]:w-4">{f.icon}</span>
                                <select value={f.value} onChange={e => f.set(e.target.value)} disabled={f.disabled}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50">
                                    <option value="">Select {f.label.toLowerCase()}…</option>
                                    {f.opts.map(o => <option key={o.id} value={o.id}>{o[f.nameKey]}</option>)}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
                {selectedBookData && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4 text-indigo-400" />
                            <strong className="text-gray-900 dark:text-white">{selectedBookData.title}</strong>
                        </span>
                        <Badge label={selectedBookData.board || "CBSE"} color="blue" />
                        <Badge label={`Class ${selectedBookData.class_num}`} color="purple" />
                        <Badge label={selectedBookData.subject || "—"} color="amber" />
                        <span className="text-gray-400">{chapters.length} chapters</span>
                    </div>
                )}
            </div>

            {!selectedBook ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 mb-4">
                        <BookOpen className="h-10 w-10 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">Select a book to get started</h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm">Choose a school, class, and book above to see chapters and generate worksheets.</p>
                </div>
            ) : loadingChapters ? (
                <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" /><span>Loading chapters…</span>
                </div>
            ) : (
                <>
                    {/* ── Tabs ── */}
                    <div className="flex gap-1 mb-6 bg-white dark:bg-gray-800 rounded-2xl p-1.5 shadow-sm border border-gray-100 dark:border-gray-700">
                        <button onClick={() => setActiveTab("chapter")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${activeTab === "chapter"
                                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
                            <List className="h-4 w-4" />Chapter Worksheets
                        </button>
                        <button onClick={() => setActiveTab("subject")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${activeTab === "subject"
                                ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
                            <BookOpenCheck className="h-4 w-4" />Subject Worksheets
                            <span className="text-xs opacity-75">(100 marks)</span>
                        </button>
                    </div>

                    {/* ── Chapter tab ── */}
                    {activeTab === "chapter" && (
                        <>
                            {chapters.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <AlertCircle className="h-10 w-10 text-amber-400 mb-3" />
                                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">No chapters found</h3>
                                    <p className="text-sm text-gray-400 mt-1">This book has no processed chapters yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                            {chapters.length} Chapter{chapters.length !== 1 ? "s" : ""}
                                        </h2>
                                        <button
                                            onClick={() => { setLoadingChapters(true); const b = selectedBook; setSelectedBook(""); setTimeout(() => setSelectedBook(b), 50); }}
                                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                                            <RefreshCw className="h-3.5 w-3.5" />Refresh
                                        </button>
                                    </div>
                                    {chapters.map(ch => (
                                        <ChapterRow key={ch.id} chapter={ch} bookId={selectedBook}
                                            onGenerateClick={(chapter, onGenerated) => setGenerateModal({ chapter, onGenerated })} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── Subject tab ── */}
                    {activeTab === "subject" && (
                        <SubjectWorksheetsPanel
                            bookId={selectedBook}
                            chapters={chapters}
                            onShowGenerateModal={(cb) => setSubjectModal({ onGenerated: cb })}
                        />
                    )}
                </>
            )}

            {/* Chapter generate modal */}
            {generateModal && (
                <GenerateModal chapter={generateModal.chapter} bookId={selectedBook}
                    onClose={() => setGenerateModal(null)}
                    onGenerated={(newWs) => {
                        generateModal.onGenerated?.(newWs);
                        setGenerateModal(null);
                        showStatus("success", `✅ Worksheet generated: ${newWs.total_questions} questions · ${newWs.total_marks || ""}${newWs.total_marks ? " marks" : ""}`);
                    }} />
            )}

            {/* Subject generate modal */}
            {subjectModal && (
                <SubjectGenerateModal bookId={selectedBook} chapters={chapters}
                    onClose={() => setSubjectModal(null)}
                    onGenerated={(newWs) => {
                        subjectModal.onGenerated?.(newWs);
                        setSubjectModal(null);
                        showStatus("success", `✅ Subject worksheet generated: ${newWs.total_questions} questions · ${newWs.total_marks} marks`);
                        setStats(prev => ({ ...prev, subjectSheets: prev.subjectSheets + 1 }));
                    }} />
            )}

            <div className="md:-mx-8 -mx-4"><AdminFooter /></div>
        </div>
    );
};

export default Worksheets;