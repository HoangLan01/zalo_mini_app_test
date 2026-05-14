import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Bell,
  BookOpen,
  Building2,
  CheckCircle,
  ChevronDown,
  ClipboardList,
  Edit,
  FileQuestion,
  LayoutDashboard,
  ListFilter,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Shield,
  SlidersHorizontal,
  Trash2,
  X
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'quiz_admin_token';

type ApiResponse<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } };
type Topic = { id: string; title: string; slug: string; description?: string; order: number; isActive: boolean; _count?: { sets: number } };
type QuizSetStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED' | string;
type QuizSet = {
  id: string;
  topicId: string;
  title: string;
  description?: string;
  timeLimit: number;
  status: QuizSetStatus;
  version: number;
  order: number;
  topic?: Topic;
  _count?: { questions: number; attempts: number };
};
type Option = { id?: string; content: string; order?: number; isCorrect: boolean };
type Question = {
  id: string;
  quizSetId: string;
  content: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
  points: number;
  order: number;
  explanation?: string;
  options: Option[];
};
type Stats = {
  attemptCount: number;
  averageScore: number;
  averageTimeTaken: number;
  leaderboard: Array<{ id: string; score: number; maxScore: number; timeTaken: number; user: { displayName: string } }>;
};
type ViewMode = 'bank' | 'create';
type NavigationMode = 'push' | 'replace';
type QuestionDraft = {
  content: string;
  points: number;
  order: number;
  explanation: string;
  options: Option[];
};

const emptyQuestionDraft = (order = 1): QuestionDraft => ({
  content: '',
  points: 10,
  order,
  explanation: '',
  options: [
    { content: '', isCorrect: true },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false }
  ]
});

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !json.success) {
    throw new Error(json.success ? `HTTP ${res.status}` : json.error.message);
  }
  return json.data;
}

const statusLabel = (status: QuizSetStatus) => {
  const labels: Record<string, string> = {
    DRAFT: 'Nháp',
    PUBLISHED: 'Hoạt động',
    CLOSED: 'Đã đóng',
    ARCHIVED: 'Lưu trữ'
  };
  return labels[status] || status;
};

const formatSeconds = (value: number) => {
  if (!value) return '0 giây';
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  if (!minutes) return `${seconds} giây`;
  return seconds ? `${minutes} phút ${seconds} giây` : `${minutes} phút`;
};

const getViewFromLocation = (): ViewMode => {
  return new URLSearchParams(window.location.search).get('view') === 'create' ? 'create' : 'bank';
};

const buildViewUrl = (nextView: ViewMode) => {
  const url = new URL(window.location.href);
  if (nextView === 'create') {
    url.searchParams.set('view', 'create');
  } else {
    url.searchParams.delete('view');
  }
  return `${url.pathname}${url.search}${url.hash}`;
};

function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const data = await api<{ token: string }>('/api/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      onLogin();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể đăng nhập');
    }
  };

  return (
    <main className="login-shell">
      <form className="login-card glass-card" onSubmit={submit}>
        <div className="brand-mark">
          <Building2 size={26} />
        </div>
        <div>
          <p className="eyebrow">Tùng Thiện Digital Admin</p>
          <h1>Đăng nhập quản trị</h1>
          <p className="muted">Quản lý ngân hàng câu hỏi chuyển đổi số.</p>
        </div>
        <label>
          Email
          <input value={email} onChange={event => setEmail(event.target.value)} type="email" autoComplete="email" />
        </label>
        <label>
          Mật khẩu
          <input value={password} onChange={event => setPassword(event.target.value)} type="password" autoComplete="current-password" />
        </label>
        {error && <Notice tone="error" message={error} />}
        <button type="submit" className="primary-button">Đăng nhập</button>
      </form>
    </main>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));
  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;
  return <Dashboard onLogout={() => { localStorage.removeItem(TOKEN_KEY); setLoggedIn(false); }} />;
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<ViewMode>(() => getViewFromLocation());
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sets, setSets] = useState<QuizSet[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedSetId, setSelectedSetId] = useState('');
  const [setStatusFilter, setSetStatusFilter] = useState('ALL');
  const [questionSearch, setQuestionSearch] = useState('');
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<'info' | 'error'>('info');
  const [loading, setLoading] = useState(false);
  const [topicForm, setTopicForm] = useState({ title: '', description: '', order: 0 });
  const [setForm, setSetForm] = useState({ title: '', description: '', timeLimit: 300, order: 0 });
  const [questionDraft, setQuestionDraft] = useState<QuestionDraft>(emptyQuestionDraft());
  const [stats, setStats] = useState<Stats | null>(null);

  const selectedSet = useMemo(() => sets.find(item => item.id === selectedSetId), [sets, selectedSetId]);
  const filteredSets = useMemo(
    () => sets.filter(set => setStatusFilter === 'ALL' || set.status === setStatusFilter),
    [sets, setStatusFilter]
  );
  const filteredQuestions = useMemo(() => {
    const query = questionSearch.trim().toLowerCase();
    if (!query) return questions;
    return questions.filter(question =>
      question.content.toLowerCase().includes(query) ||
      question.options.some(option => option.content.toLowerCase().includes(query))
    );
  }, [questionSearch, questions]);

  const dashboardStats = useMemo(() => {
    const totalQuestions = sets.reduce((sum, set) => sum + (set._count?.questions || 0), 0);
    return [
      { label: 'Tổng câu hỏi', value: totalQuestions.toLocaleString('vi-VN'), icon: FileQuestion, accent: 'blue' },
      { label: 'Hoạt động', value: sets.filter(set => set.status === 'PUBLISHED').length.toLocaleString('vi-VN'), icon: CheckCircle, accent: 'green' },
      { label: 'Bản nháp', value: sets.filter(set => set.status === 'DRAFT').length.toLocaleString('vi-VN'), icon: ClipboardList, accent: 'purple' },
      { label: 'Đã đóng', value: sets.filter(set => set.status === 'CLOSED').length.toLocaleString('vi-VN'), icon: Shield, accent: 'orange' }
    ] as const;
  }, [sets]);

  const showMessage = (text: string, tone: 'info' | 'error' = 'info') => {
    setMessage(text);
    setMessageTone(tone);
  };

  const navigateView = useCallback((nextView: ViewMode, mode: NavigationMode = 'push') => {
    const nextUrl = buildViewUrl(nextView);
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) {
      const state = { adminView: nextView };
      if (mode === 'replace') {
        window.history.replaceState(state, '', nextUrl);
      } else {
        window.history.pushState(state, '', nextUrl);
      }
    }
    setView(nextView);
  }, []);

  const loadTopics = async () => {
    setTopics(await api<Topic[]>('/api/admin/quiz/topics'));
  };

  const loadSets = async (topicId = selectedTopicId) => {
    const query = topicId ? `?topicId=${topicId}` : '';
    const data = await api<QuizSet[]>(`/api/admin/quiz/sets${query}`);
    setSets(data);
  };

  const loadQuestions = async (setId = selectedSetId) => {
    if (!setId) {
      setQuestions([]);
      return;
    }
    setQuestions(await api<Question[]>(`/api/admin/quiz/questions?quizSetId=${setId}`));
  };

  const loadStats = async (setId = selectedSetId) => {
    if (!setId) {
      setStats(null);
      return;
    }
    setStats(await api<Stats>(`/api/admin/quiz/sets/${setId}/stats`));
  };

  const refreshAll = async () => {
    setLoading(true);
    try {
      await loadTopics();
      await loadSets();
      if (selectedSetId) {
        await loadQuestions();
        await loadStats();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll().catch(err => showMessage(err instanceof Error ? err.message : 'Không thể tải dữ liệu', 'error'));
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setView(getViewFromLocation());
    };
    window.history.replaceState({ adminView: getViewFromLocation() }, '', `${window.location.pathname}${window.location.search}${window.location.hash}`);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    loadSets(selectedTopicId).catch(err => showMessage(err instanceof Error ? err.message : 'Không thể tải bộ câu hỏi', 'error'));
  }, [selectedTopicId]);

  useEffect(() => {
    const nextSetId = filteredSets.some(set => set.id === selectedSetId) ? selectedSetId : filteredSets[0]?.id || '';
    if (nextSetId !== selectedSetId) setSelectedSetId(nextSetId);
  }, [filteredSets, selectedSetId]);

  useEffect(() => {
    loadQuestions(selectedSetId).catch(err => showMessage(err instanceof Error ? err.message : 'Không thể tải câu hỏi', 'error'));
    loadStats(selectedSetId).catch(err => showMessage(err instanceof Error ? err.message : 'Không thể tải thống kê', 'error'));
    setQuestionDraft(emptyQuestionDraft(questions.length + 1));
  }, [selectedSetId]);

  const action = async (fn: () => Promise<unknown>, successMessage?: string) => {
    setMessage('');
    try {
      await fn();
      await refreshAll();
      if (successMessage) showMessage(successMessage);
    } catch (err: unknown) {
      showMessage(err instanceof Error ? err.message : 'Thao tác thất bại', 'error');
    }
  };

  const createTopic = async (event: React.FormEvent) => {
    event.preventDefault();
    await action(async () => {
      await api('/api/admin/quiz/topics', { method: 'POST', body: JSON.stringify(topicForm) });
      setTopicForm({ title: '', description: '', order: 0 });
    }, 'Đã thêm chủ đề');
  };

  const createSet = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedTopicId) {
      showMessage('Chọn chủ đề trước khi tạo bộ câu hỏi', 'error');
      return;
    }
    await action(async () => {
      const created = await api<QuizSet>('/api/admin/quiz/sets', {
        method: 'POST',
        body: JSON.stringify({ ...setForm, topicId: selectedTopicId })
      });
      setSelectedSetId(created.id);
      setSetForm({ title: '', description: '', timeLimit: 300, order: 0 });
    }, 'Đã thêm bộ câu hỏi');
  };

  const saveQuestion = async (publishAfterSave = false) => {
    if (!selectedSetId) {
      showMessage('Chọn bộ câu hỏi trước khi lưu', 'error');
      return;
    }
    const hasEmptyOption = questionDraft.options.some(option => !option.content.trim());
    if (!questionDraft.content.trim() || hasEmptyOption) {
      showMessage('Nhập đầy đủ nội dung câu hỏi và 4 đáp án', 'error');
      return;
    }
    await action(async () => {
      await api('/api/admin/quiz/questions', {
        method: 'POST',
        body: JSON.stringify({
          quizSetId: selectedSetId,
          content: questionDraft.content.trim(),
          type: 'MULTIPLE_CHOICE',
          points: questionDraft.points,
          order: questionDraft.order,
          explanation: questionDraft.explanation.trim() || undefined,
          options: questionDraft.options.map((option, index) => ({
            content: option.content.trim(),
            order: index,
            isCorrect: option.isCorrect
          }))
        })
      });
      if (publishAfterSave) {
        await api(`/api/admin/quiz/sets/${selectedSetId}/publish`, { method: 'POST' });
      }
      setQuestionDraft(emptyQuestionDraft(questions.length + 2));
      navigateView('bank', 'replace');
    }, publishAfterSave ? 'Đã lưu câu hỏi và xuất bản bộ câu hỏi' : 'Đã lưu câu hỏi');
  };

  const editTopic = (topic: Topic) => action(async () => {
    const title = window.prompt('Tên chủ đề', topic.title);
    if (!title) return;
    const description = window.prompt('Mô tả chủ đề', topic.description || '') || '';
    await api(`/api/admin/quiz/topics/${topic.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title, description })
    });
  }, 'Đã cập nhật chủ đề');

  const editSet = (set: QuizSet) => action(async () => {
    const title = window.prompt('Tiêu đề bộ câu hỏi', set.title);
    if (!title) return;
    const description = window.prompt('Mô tả bộ câu hỏi', set.description || '') || '';
    const timeLimit = Number(window.prompt('Thời gian làm bài (giây)', String(set.timeLimit)) || set.timeLimit);
    await api(`/api/admin/quiz/sets/${set.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title, description, timeLimit })
    });
  }, 'Đã cập nhật bộ câu hỏi');

  const editQuestion = (question: Question) => action(async () => {
    const content = window.prompt('Nội dung câu hỏi', question.content);
    if (!content) return;
    const options = question.options.map((option, index) => ({
      content: window.prompt(`Đáp án ${String.fromCharCode(65 + index)}`, option.content) || option.content,
      order: index,
      isCorrect: option.isCorrect
    }));
    const currentCorrectIndex = Math.max(1, question.options.findIndex(option => option.isCorrect) + 1);
    const correctIndex = Number(window.prompt('Đáp án đúng là số thứ tự nào?', String(currentCorrectIndex)) || currentCorrectIndex) - 1;
    await api(`/api/admin/quiz/questions/${question.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        content,
        points: question.points,
        options: options.map((option, index) => ({ ...option, isCorrect: index === correctIndex }))
      })
    });
  }, 'Đã cập nhật câu hỏi');

  const startCreateQuestion = () => {
    setQuestionDraft(emptyQuestionDraft(questions.length + 1));
    navigateView('create', 'push');
  };

  return (
    <AdminShell
      view={view}
      onNavigate={navigateView}
      onLogout={onLogout}
      onCreateQuestion={startCreateQuestion}
      onSaveQuestion={view === 'create' ? () => saveQuestion(false) : undefined}
    >
      {message && <Notice tone={messageTone} message={message} onClose={() => setMessage('')} />}
      {view === 'bank' ? (
        <QuestionBankView
          topics={topics}
          sets={sets}
          filteredSets={filteredSets}
          questions={filteredQuestions}
          selectedTopicId={selectedTopicId}
          selectedSetId={selectedSetId}
          setStatusFilter={setStatusFilter}
          questionSearch={questionSearch}
          selectedSet={selectedSet}
          stats={stats}
          dashboardStats={dashboardStats}
          topicForm={topicForm}
          setForm={setForm}
          loading={loading}
          onTopicChange={setSelectedTopicId}
          onSetChange={setSelectedSetId}
          onStatusChange={setSetStatusFilter}
          onSearchChange={setQuestionSearch}
          onRefresh={() => refreshAll().catch(err => showMessage(err instanceof Error ? err.message : 'Không thể làm mới dữ liệu', 'error'))}
          onCreateQuestion={startCreateQuestion}
          onTopicFormChange={setTopicForm}
          onSetFormChange={setSetForm}
          onCreateTopic={createTopic}
          onCreateSet={createSet}
          onEditTopic={editTopic}
          onEditSet={editSet}
          onEditQuestion={editQuestion}
          onArchiveTopic={topic => action(() => api(`/api/admin/quiz/topics/${topic.id}`, { method: 'DELETE' }), 'Đã lưu trữ chủ đề')}
          onArchiveSet={set => action(() => api(`/api/admin/quiz/sets/${set.id}`, { method: 'DELETE' }), 'Đã lưu trữ bộ câu hỏi')}
          onArchiveQuestion={question => action(() => api(`/api/admin/quiz/questions/${question.id}`, { method: 'DELETE' }), 'Đã lưu trữ câu hỏi')}
          onPublishSet={set => action(() => api(`/api/admin/quiz/sets/${set.id}/publish`, { method: 'POST' }), 'Đã xuất bản bộ câu hỏi')}
          onCloseSet={set => action(() => api(`/api/admin/quiz/sets/${set.id}/close`, { method: 'POST' }), 'Đã đóng bộ câu hỏi')}
          onCloneSet={set => action(() => api(`/api/admin/quiz/sets/${set.id}/clone`, { method: 'POST' }), 'Đã tạo bản nháp mới')}
        />
      ) : (
        <QuestionEditorView
          topics={topics}
          sets={filteredSets}
          selectedTopicId={selectedTopicId}
          selectedSetId={selectedSetId}
          selectedSet={selectedSet}
          draft={questionDraft}
          onTopicChange={setSelectedTopicId}
          onSetChange={setSelectedSetId}
          onDraftChange={setQuestionDraft}
          onCancel={() => navigateView('bank', 'replace')}
          onSave={() => saveQuestion(false)}
          onSaveAndPublish={() => saveQuestion(true)}
        />
      )}
    </AdminShell>
  );
}

function AdminShell({
  children,
  view,
  onNavigate,
  onLogout,
  onCreateQuestion,
  onSaveQuestion
}: {
  children: React.ReactNode;
  view: ViewMode;
  onNavigate: (view: ViewMode, mode?: NavigationMode) => void;
  onLogout: () => void;
  onCreateQuestion: () => void;
  onSaveQuestion?: () => void;
}) {
  const pageTitle = view === 'bank' ? 'Ngân hàng câu hỏi' : 'Thêm câu hỏi mới';
  return (
    <main className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark"><Building2 size={24} /></div>
          <div>
            <strong>Tùng Thiện</strong>
            <span>Digital Admin</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Điều hướng quản trị">
          <button className="nav-item"><LayoutDashboard size={20} /> Tổng quan</button>
          <p>Quản lý nội dung</p>
          <button className={view === 'bank' ? 'nav-item active' : 'nav-item'} onClick={() => onNavigate('bank', 'replace')}>
            <FileQuestion size={20} /> Chuyển đổi số
          </button>
          <button className="nav-item"><BookOpen size={20} /> Tin tức & Sự kiện</button>
          <button className="nav-item"><ClipboardList size={20} /> Thủ tục hành chính</button>
          <p>Hệ thống</p>
          <button className="nav-item"><Shield size={20} /> Người dùng</button>
          <button className="nav-item"><Settings size={20} /> Cài đặt</button>
        </nav>

        <div className="sidebar-user">
          <div className="avatar">NA</div>
          <div>
            <strong>Nguyễn Văn An</strong>
            <span>Quản trị viên</span>
          </div>
          <button className="icon-button ghost" onClick={onLogout} aria-label="Đăng xuất"><LogOut size={20} /></button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <div className="breadcrumb">
              <span>Kiến thức Chuyển đổi số</span>
              <span>/</span>
              <button onClick={() => onNavigate('bank', 'replace')}>Quản lý câu hỏi</button>
              {view === 'create' && <><span>/</span><strong>Thêm câu hỏi mới</strong></>}
            </div>
            <h1>{pageTitle}</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button notify" aria-label="Thông báo"><Bell size={21} /></button>
            {view === 'bank' ? (
              <button className="primary-button" onClick={onCreateQuestion}><Plus size={20} /> Thêm câu hỏi mới</button>
            ) : (
              <>
                <button className="secondary-button" onClick={() => onNavigate('bank', 'replace')}>Hủy</button>
                <button className="primary-button" onClick={onSaveQuestion}><Save size={19} /> Lưu câu hỏi</button>
              </>
            )}
          </div>
        </header>
        <div className="content-shell">{children}</div>
      </section>
    </main>
  );
}

function QuestionBankView({
  topics,
  sets,
  filteredSets,
  questions,
  selectedTopicId,
  selectedSetId,
  setStatusFilter,
  questionSearch,
  selectedSet,
  stats,
  dashboardStats,
  topicForm,
  setForm,
  loading,
  onTopicChange,
  onSetChange,
  onStatusChange,
  onSearchChange,
  onRefresh,
  onCreateQuestion,
  onTopicFormChange,
  onSetFormChange,
  onCreateTopic,
  onCreateSet,
  onEditTopic,
  onEditSet,
  onEditQuestion,
  onArchiveTopic,
  onArchiveSet,
  onArchiveQuestion,
  onPublishSet,
  onCloseSet,
  onCloneSet
}: {
  topics: Topic[];
  sets: QuizSet[];
  filteredSets: QuizSet[];
  questions: Question[];
  selectedTopicId: string;
  selectedSetId: string;
  setStatusFilter: string;
  questionSearch: string;
  selectedSet?: QuizSet;
  stats: Stats | null;
  dashboardStats: ReadonlyArray<{ label: string; value: string; icon: LucideIcon; accent: string }>;
  topicForm: { title: string; description: string; order: number };
  setForm: { title: string; description: string; timeLimit: number; order: number };
  loading: boolean;
  onTopicChange: (value: string) => void;
  onSetChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onCreateQuestion: () => void;
  onTopicFormChange: (value: { title: string; description: string; order: number }) => void;
  onSetFormChange: (value: { title: string; description: string; timeLimit: number; order: number }) => void;
  onCreateTopic: (event: React.FormEvent) => void;
  onCreateSet: (event: React.FormEvent) => void;
  onEditTopic: (topic: Topic) => void;
  onEditSet: (set: QuizSet) => void;
  onEditQuestion: (question: Question) => void;
  onArchiveTopic: (topic: Topic) => void;
  onArchiveSet: (set: QuizSet) => void;
  onArchiveQuestion: (question: Question) => void;
  onPublishSet: (set: QuizSet) => void;
  onCloseSet: (set: QuizSet) => void;
  onCloneSet: (set: QuizSet) => void;
}) {
  return (
    <div className="bank-layout">
      <section className="main-column">
        <div className="stats-grid">
          {dashboardStats.map(stat => <StatCard key={stat.label} {...stat} />)}
        </div>

        <div className="toolbar glass-card">
          <div className="search-box">
            <Search size={20} />
            <input value={questionSearch} onChange={event => onSearchChange(event.target.value)} placeholder="Tìm kiếm câu hỏi hoặc đáp án..." />
          </div>
          <div className="filter-group">
            <ListFilter size={20} />
            <Select value={selectedTopicId} onChange={onTopicChange} ariaLabel="Lọc chủ đề">
              <option value="">Tất cả chủ đề</option>
              {topics.map(topic => <option key={topic.id} value={topic.id}>{topic.title}</option>)}
            </Select>
            <Select value={setStatusFilter} onChange={onStatusChange} ariaLabel="Lọc trạng thái">
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PUBLISHED">Hoạt động</option>
              <option value="DRAFT">Nháp</option>
              <option value="CLOSED">Đã đóng</option>
            </Select>
            <Select value={selectedSetId} onChange={onSetChange} ariaLabel="Chọn bộ câu hỏi">
              {filteredSets.length === 0 && <option value="">Chưa có bộ câu hỏi</option>}
              {filteredSets.map(set => <option key={set.id} value={set.id}>{set.title}</option>)}
            </Select>
          </div>
          <button className="text-button" onClick={onRefresh} disabled={loading}><RefreshCw size={17} /> Làm mới</button>
        </div>

        <section className="table-card glass-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Quản lý câu hỏi</p>
              <h2>{selectedSet?.title || 'Chưa chọn bộ câu hỏi'}</h2>
            </div>
            <button className="primary-button compact" onClick={onCreateQuestion}><Plus size={18} /> Thêm câu hỏi</button>
          </div>
          {selectedSet ? (
            questions.length > 0 ? (
              <>
                <div className="question-table">
                  <div className="table-row table-head">
                    <span>Nội dung câu hỏi</span>
                    <span>Danh mục</span>
                    <span>Điểm</span>
                    <span>Trạng thái</span>
                    <span>Thao tác</span>
                  </div>
                  {questions.map(question => (
                    <div className="table-row" key={question.id}>
                      <div className="question-cell">
                        <strong>{question.content}</strong>
                        <small>ID: {question.id.slice(0, 8)} · {question.options.length} đáp án</small>
                      </div>
                      <span className="chip">{selectedSet.topic?.title || topics.find(topic => topic.id === selectedSet.topicId)?.title || 'Chưa phân loại'}</span>
                      <span>{question.points}</span>
                      <StatusBadge status={selectedSet.status} />
                      <div className="row-actions">
                        <button className="icon-button" onClick={() => onEditQuestion(question)} aria-label="Sửa câu hỏi"><Edit size={18} /></button>
                        <button className="icon-button danger" onClick={() => onArchiveQuestion(question)} aria-label="Lưu trữ câu hỏi"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="table-footer">
                  <span>Hiển thị {questions.length} câu hỏi</span>
                  <span>Lượt làm: {stats?.attemptCount || 0} · Điểm TB: {(stats?.averageScore || 0).toFixed(1)}</span>
                </div>
              </>
            ) : <EmptyState title="Chưa có câu hỏi" description="Tạo câu hỏi đầu tiên cho bộ này để có thể xuất bản." actionLabel="Thêm câu hỏi" onAction={onCreateQuestion} />
          ) : <EmptyState title="Chưa có bộ câu hỏi" description="Hãy tạo hoặc chọn một bộ câu hỏi trước khi thêm nội dung." />}
        </section>

        {selectedSet && (
          <section className="guide-banner">
            <div>
              <p className="eyebrow">Mẹo nhỏ</p>
              <h2>Hướng dẫn tạo câu hỏi chuẩn</h2>
              <p>Đảm bảo câu hỏi rõ ràng, đáp án đúng duy nhất và nội dung phù hợp với kiến thức chuyển đổi số.</p>
            </div>
            <div className="banner-actions">
              <button className="light-button" onClick={() => onCloneSet(selectedSet)}>Tạo bản mới</button>
              <button className="light-button" onClick={() => onCloseSet(selectedSet)}>Đóng</button>
              <button className="light-button strong" onClick={() => onPublishSet(selectedSet)}>Xuất bản</button>
            </div>
          </section>
        )}
      </section>

      <aside className="side-column">
        <section className="glass-card management-card">
          <div className="section-heading tight">
            <div>
              <p className="eyebrow">Danh mục</p>
              <h2>Chủ đề</h2>
            </div>
          </div>
          <form className="stack-form" onSubmit={onCreateTopic}>
            <input placeholder="Tên chủ đề" value={topicForm.title} onChange={event => onTopicFormChange({ ...topicForm, title: event.target.value })} />
            <textarea placeholder="Mô tả chủ đề" value={topicForm.description} onChange={event => onTopicFormChange({ ...topicForm, description: event.target.value })} />
            <button className="secondary-button" type="submit"><Plus size={17} /> Thêm chủ đề</button>
          </form>
          <div className="mini-list">
            {topics.map(topic => (
              <div className={topic.id === selectedTopicId ? 'mini-row selected' : 'mini-row'} key={topic.id}>
                <button onClick={() => onTopicChange(topic.id)}>
                  <strong>{topic.title}</strong>
                  <span>{topic._count?.sets || 0} bộ câu hỏi</span>
                </button>
                <IconMenu onEdit={() => onEditTopic(topic)} onArchive={() => onArchiveTopic(topic)} />
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card management-card">
          <div className="section-heading tight">
            <div>
              <p className="eyebrow">Bộ câu hỏi</p>
              <h2>Thiết lập nhanh</h2>
            </div>
          </div>
          <form className="stack-form" onSubmit={onCreateSet}>
            <input placeholder="Tiêu đề bộ câu hỏi" value={setForm.title} onChange={event => onSetFormChange({ ...setForm, title: event.target.value })} />
            <textarea placeholder="Mô tả" value={setForm.description} onChange={event => onSetFormChange({ ...setForm, description: event.target.value })} />
            <input type="number" min={30} value={setForm.timeLimit} onChange={event => onSetFormChange({ ...setForm, timeLimit: Number(event.target.value) })} />
            <button className="secondary-button" type="submit"><Plus size={17} /> Thêm bộ</button>
          </form>
          <div className="mini-list">
            {sets.map(set => (
              <div className={set.id === selectedSetId ? 'mini-row selected' : 'mini-row'} key={set.id}>
                <button onClick={() => onSetChange(set.id)}>
                  <strong>{set.title}</strong>
                  <span>{statusLabel(set.status)} · {set._count?.questions || 0} câu · {formatSeconds(set.timeLimit)}</span>
                </button>
                <IconMenu onEdit={() => onEditSet(set)} onArchive={() => onArchiveSet(set)} />
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card stats-panel">
          <p className="eyebrow">Thống kê bộ đang chọn</p>
          <h2>{selectedSet ? selectedSet.title : 'Chưa chọn bộ'}</h2>
          {stats ? (
            <>
              <Metric label="Lượt làm" value={stats.attemptCount.toLocaleString('vi-VN')} />
              <Metric label="Điểm trung bình" value={stats.averageScore.toFixed(1)} />
              <Metric label="Thời gian TB" value={formatSeconds(Math.round(stats.averageTimeTaken))} />
              <div className="leaderboard">
                {stats.leaderboard.slice(0, 5).map((item, index) => (
                  <div key={item.id}>
                    <span>#{index + 1} {item.user.displayName}</span>
                    <strong>{item.score}/{item.maxScore}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="muted">Chọn một bộ câu hỏi để xem thống kê.</p>}
        </section>
      </aside>
    </div>
  );
}

function QuestionEditorView({
  topics,
  sets,
  selectedTopicId,
  selectedSetId,
  selectedSet,
  draft,
  onTopicChange,
  onSetChange,
  onDraftChange,
  onCancel,
  onSave,
  onSaveAndPublish
}: {
  topics: Topic[];
  sets: QuizSet[];
  selectedTopicId: string;
  selectedSetId: string;
  selectedSet?: QuizSet;
  draft: QuestionDraft;
  onTopicChange: (value: string) => void;
  onSetChange: (value: string) => void;
  onDraftChange: (value: QuestionDraft) => void;
  onCancel: () => void;
  onSave: () => void;
  onSaveAndPublish: () => void;
}) {
  const setOption = (index: number, content: string) => {
    onDraftChange({
      ...draft,
      options: draft.options.map((option, optionIndex) => optionIndex === index ? { ...option, content } : option)
    });
  };

  const setCorrect = (index: number) => {
    onDraftChange({
      ...draft,
      options: draft.options.map((option, optionIndex) => ({ ...option, isCorrect: optionIndex === index }))
    });
  };

  return (
    <div className="editor-layout">
      <section className="editor-side">
        <div className="glass-card form-card">
          <div className="card-title"><ClipboardList size={22} /><h2>Thông tin chủ đề</h2></div>
          <label>
            Chọn chủ đề
            <Select value={selectedTopicId} onChange={onTopicChange} ariaLabel="Chọn chủ đề">
              <option value="">Tất cả chủ đề</option>
              {topics.map(topic => <option key={topic.id} value={topic.id}>{topic.title}</option>)}
            </Select>
          </label>
          <label>
            Bộ câu hỏi
            <Select value={selectedSetId} onChange={onSetChange} ariaLabel="Chọn bộ câu hỏi">
              {sets.length === 0 && <option value="">Chưa có bộ câu hỏi</option>}
              {sets.map(set => <option key={set.id} value={set.id}>{set.title}</option>)}
            </Select>
          </label>
        </div>

        <div className="glass-card form-card">
          <div className="card-title"><SlidersHorizontal size={22} /><h2>Cấu hình câu hỏi</h2></div>
          <label>
            Điểm số
            <input type="number" min={1} value={draft.points} onChange={event => onDraftChange({ ...draft, points: Number(event.target.value) })} />
          </label>
          <label>
            Thứ tự
            <input type="number" min={0} value={draft.order} onChange={event => onDraftChange({ ...draft, order: Number(event.target.value) })} />
          </label>
          <div className="difficulty">
            <span>Độ khó</span>
            <i />
            <i />
            <i className="muted-bar" />
          </div>
        </div>
      </section>

      <section className="editor-main">
        <div className="glass-card form-card question-content-card">
          <div className="card-title"><Edit size={22} /><h2>Nội dung câu hỏi</h2></div>
          <div className="editor-toolbar" aria-hidden="true">
            <strong>B</strong><em>I</em><u>U</u><span /> <BookOpen size={18} />
          </div>
          <textarea
            className="question-textarea"
            placeholder="Nhập câu hỏi của bạn tại đây..."
            value={draft.content}
            onChange={event => onDraftChange({ ...draft, content: event.target.value })}
          />
        </div>

        <div className="glass-card form-card answers-card">
          <div className="section-heading tight">
            <div className="card-title"><CheckCircle size={22} /><h2>Danh sách đáp án</h2></div>
            <button className="text-button" type="button"><Plus size={17} /> Thêm đáp án</button>
          </div>
          <div className="answer-list">
            {draft.options.map((option, index) => (
              <div className={option.isCorrect ? 'answer-row correct-answer' : 'answer-row'} key={index}>
                <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                <input placeholder={`Đáp án ${String.fromCharCode(65 + index)}`} value={option.content} onChange={event => setOption(index, event.target.value)} />
                <label className="switch-label">
                  <span>Đúng</span>
                  <input type="radio" name="correct-answer" checked={option.isCorrect} onChange={() => setCorrect(index)} />
                </label>
                <button className="icon-button muted-action" type="button" aria-label="Đáp án cố định"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="draft-note">
          <div className="brand-mark soft"><BookOpen size={22} /></div>
          <div>
            <strong>Mẹo nhỏ</strong>
            <p>Hãy đảm bảo câu hỏi mang tính giáo dục và dễ hiểu đối với mọi tầng lớp công dân.</p>
          </div>
          <div className="draft-status">
            <span>Trạng thái soạn thảo</span>
            <strong>{selectedSet ? statusLabel(selectedSet.status) : 'Nháp'}</strong>
          </div>
        </div>

        <footer className="editor-footer">
          <button className="secondary-button" onClick={onCancel}><X size={18} /> Hủy thay đổi</button>
          <button className="primary-button" onClick={onSaveAndPublish}><CheckCircle size={18} /> Lưu & Đăng tải</button>
          <button className="primary-button" onClick={onSave}><Save size={18} /> Lưu câu hỏi</button>
        </footer>
      </section>
    </div>
  );
}

function Select({ value, onChange, children, ariaLabel }: { value: string; onChange: (value: string) => void; children: React.ReactNode; ariaLabel: string }) {
  return (
    <span className="select-wrap">
      <select value={value} onChange={event => onChange(event.target.value)} aria-label={ariaLabel}>
        {children}
      </select>
      <ChevronDown size={18} />
    </span>
  );
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: LucideIcon; accent: string }) {
  return (
    <article className={`stat-card glass-card accent-${accent}`}>
      <div className="stat-icon"><Icon size={22} /></div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function StatusBadge({ status }: { status: QuizSetStatus }) {
  return <span className={`status-badge status-${String(status).toLowerCase()}`}>{statusLabel(status)}</span>;
}

function IconMenu({ onEdit, onArchive }: { onEdit: () => void; onArchive: () => void }) {
  return (
    <div className="row-actions">
      <button className="icon-button" onClick={onEdit} aria-label="Sửa"><Edit size={17} /></button>
      <button className="icon-button danger" onClick={onArchive} aria-label="Lưu trữ"><Trash2 size={17} /></button>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}

function EmptyState({ title, description, actionLabel, onAction }: { title: string; description: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="empty-state">
      <FileQuestion size={34} />
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction && <button className="primary-button compact" onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}

function Notice({ tone, message, onClose }: { tone: 'info' | 'error'; message: string; onClose?: () => void }) {
  return (
    <div className={`notice ${tone}`}>
      <span>{message}</span>
      {onClose && <button onClick={onClose} aria-label="Đóng thông báo"><X size={16} /></button>}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
