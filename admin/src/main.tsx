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
  id?: string;
  content: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
  points: number;
  order: number;
  explanation: string;
  options: Option[];
};

const emptyQuestionDraft = (order = 1): QuestionDraft => ({
  id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  content: '',
  type: 'MULTIPLE_CHOICE',
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
  const [modalState, setModalState] = useState<{ type: 'TOPIC_CREATE' | 'TOPIC_EDIT' | 'SET_CREATE' | 'SET_EDIT' | 'SET_PUBLISH' | 'SET_CLOSE' | 'SET_CLONE' | null; payload?: any }>({ type: null });
  const [modalForm, setModalForm] = useState({ title: '', description: '', timeLimit: 300, order: 0, setId: '' });
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

  const openModal = (type: 'TOPIC_CREATE' | 'TOPIC_EDIT' | 'SET_CREATE' | 'SET_EDIT' | 'SET_PUBLISH' | 'SET_CLOSE' | 'SET_CLONE', payload?: any) => {
    setModalForm({
      title: payload?.title || '',
      description: payload?.description || '',
      timeLimit: payload?.timeLimit || 300,
      order: payload?.order || 0,
      setId: selectedSetId || (sets[0]?.id || '')
    });
    setModalState({ type, payload });
  };
  const closeModal = () => setModalState({ type: null });

  const submitModal = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!modalState.type) return;
    if (modalState.type === 'SET_CREATE' && !selectedTopicId) {
      showMessage('Chọn chủ đề trước khi tạo bộ câu hỏi', 'error');
      return;
    }
    await action(async () => {
      if (modalState.type === 'TOPIC_CREATE') {
        await api('/api/admin/quiz/topics', { method: 'POST', body: JSON.stringify({ title: modalForm.title, description: modalForm.description, order: modalForm.order }) });
      } else if (modalState.type === 'TOPIC_EDIT') {
        await api(`/api/admin/quiz/topics/${modalState.payload.id}`, { method: 'PATCH', body: JSON.stringify({ title: modalForm.title, description: modalForm.description, order: modalForm.order }) });
      } else if (modalState.type === 'SET_CREATE') {
        const created = await api<QuizSet>('/api/admin/quiz/sets', { method: 'POST', body: JSON.stringify({ title: modalForm.title, description: modalForm.description, timeLimit: modalForm.timeLimit, order: modalForm.order, topicId: selectedTopicId }) });
        setSelectedSetId(created.id);
      } else if (modalState.type === 'SET_EDIT') {
        await api(`/api/admin/quiz/sets/${modalState.payload.id}`, { method: 'PATCH', body: JSON.stringify({ title: modalForm.title, description: modalForm.description, timeLimit: modalForm.timeLimit, order: modalForm.order }) });
      } else if (modalState.type === 'SET_PUBLISH') {
        if (!modalForm.setId) throw new Error('Vui lòng chọn bộ câu hỏi');
        await api(`/api/admin/quiz/sets/${modalForm.setId}/publish`, { method: 'POST' });
      } else if (modalState.type === 'SET_CLOSE') {
        if (!modalForm.setId) throw new Error('Vui lòng chọn bộ câu hỏi');
        await api(`/api/admin/quiz/sets/${modalForm.setId}/close`, { method: 'POST' });
      } else if (modalState.type === 'SET_CLONE') {
        if (!modalForm.setId) throw new Error('Vui lòng chọn bộ câu hỏi');
        await api(`/api/admin/quiz/sets/${modalForm.setId}/clone`, { method: 'POST' });
      }
      closeModal();
    }, 'Thao tác thành công');
  };

  const saveBatchQuestions = async (draftQuestions: QuestionDraft[], deletedIds: string[]) => {
    if (!selectedSetId) return;
    const hasEmptyOption = draftQuestions.some(q => q.options.some(opt => !opt.content.trim()));
    const hasEmptyContent = draftQuestions.some(q => !q.content.trim());
    if (hasEmptyContent || hasEmptyOption) {
      showMessage('Nhập đầy đủ nội dung câu hỏi và các đáp án', 'error');
      return;
    }
    await action(async () => {
      await api(`/api/admin/quiz/sets/${selectedSetId}/questions/batch`, {
        method: 'POST',
        body: JSON.stringify({ questions: draftQuestions, deletedIds })
      });
      navigateView('bank', 'replace');
    }, 'Đã lưu tất cả câu hỏi');
  };

  const startCreateQuestion = () => navigateView('create', 'push');

  return (
    <AdminShell
      view={view}
      onNavigate={navigateView}
      onLogout={onLogout}
      onCreateQuestion={startCreateQuestion}
      onSaveQuestion={undefined}
      onCloneClick={() => openModal('SET_CLONE')}
      onCloseClick={() => openModal('SET_CLOSE')}
      onPublishClick={() => openModal('SET_PUBLISH')}
    >
      {message && <Notice tone={messageTone} message={message} onClose={() => setMessage('')} />}
      
      <Modal isOpen={modalState.type !== null} onClose={closeModal} title={
        modalState.type === 'TOPIC_CREATE' ? 'Thêm chủ đề mới' :
        modalState.type === 'TOPIC_EDIT' ? 'Cập nhật chủ đề' :
        modalState.type === 'SET_CREATE' ? 'Thêm bộ câu hỏi mới' :
        modalState.type === 'SET_EDIT' ? 'Cập nhật bộ câu hỏi' :
        modalState.type === 'SET_PUBLISH' ? 'Xuất bản bộ câu hỏi' :
        modalState.type === 'SET_CLOSE' ? 'Đóng bộ câu hỏi' :
        'Tạo bản sao bộ câu hỏi'
      }>
        <form className="stack-form" onSubmit={submitModal}>
          {modalState.type && ['SET_PUBLISH', 'SET_CLOSE', 'SET_CLONE'].includes(modalState.type) ? (
            <>
              <p style={{ marginBottom: '16px' }}>
                {modalState.type === 'SET_PUBLISH' ? 'Bộ câu hỏi này sẽ được công khai để mọi người có thể tham gia.' :
                 modalState.type === 'SET_CLOSE' ? 'Bộ câu hỏi này sẽ bị đóng và không ai có thể làm tiếp.' :
                 'Tạo một bản sao của bộ câu hỏi này để tiếp tục chỉnh sửa thành một bài thi mới.'}
              </p>
              <label>Chọn bộ câu hỏi
                <Select value={modalForm.setId} onChange={v => setModalForm({ ...modalForm, setId: v })} ariaLabel="Chọn bộ">
                  <option value="">-- Chọn một bộ câu hỏi --</option>
                  {sets
                    .filter(set => {
                      if (modalState.type === 'SET_PUBLISH') return set.status === 'DRAFT' || set.status === 'CLOSED';
                      if (modalState.type === 'SET_CLOSE') return set.status === 'PUBLISHED';
                      return true;
                    })
                    .map(set => <option key={set.id} value={set.id}>{set.title} ({statusLabel(set.status)})</option>)}
                </Select>
              </label>
            </>
          ) : (
            <>
              <label>Tên {modalState.type?.includes('TOPIC') ? 'chủ đề' : 'bộ câu hỏi'}
                <input required value={modalForm.title} onChange={e => setModalForm({ ...modalForm, title: e.target.value })} />
              </label>
              <label>Mô tả
                <textarea value={modalForm.description} onChange={e => setModalForm({ ...modalForm, description: e.target.value })} />
              </label>
              {modalState.type?.includes('SET') && (
                <label>Thời gian làm bài (giây)
                  <input type="number" min={30} value={modalForm.timeLimit} onChange={e => setModalForm({ ...modalForm, timeLimit: Number(e.target.value) })} />
                </label>
              )}
              <label>Thứ tự ưu tiên
                <input type="number" min={0} value={modalForm.order} onChange={e => setModalForm({ ...modalForm, order: Number(e.target.value) })} />
              </label>
            </>
          )}
          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={closeModal}>Hủy</button>
            <button type="submit" className="primary-button">Lưu lại</button>
          </div>
        </form>
      </Modal>

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
          loading={loading}
          onTopicChange={setSelectedTopicId}
          onSetChange={setSelectedSetId}
          onStatusChange={setSetStatusFilter}
          onSearchChange={setQuestionSearch}
          onRefresh={() => refreshAll().catch(err => showMessage(err instanceof Error ? err.message : 'Không thể làm mới dữ liệu', 'error'))}
          onCreateQuestion={startCreateQuestion}
          onAddTopicClick={() => openModal('TOPIC_CREATE')}
          onAddSetClick={() => openModal('SET_CREATE')}
          onEditTopic={topic => openModal('TOPIC_EDIT', topic)}
          onEditSet={set => openModal('SET_EDIT', set)}
          onEditQuestion={startCreateQuestion}
          onArchiveTopic={topic => action(() => api(`/api/admin/quiz/topics/${topic.id}`, { method: 'DELETE' }), 'Đã lưu trữ chủ đề')}
          onArchiveSet={set => action(() => api(`/api/admin/quiz/sets/${set.id}`, { method: 'DELETE' }), 'Đã lưu trữ bộ câu hỏi')}
          onArchiveQuestion={question => action(() => api(`/api/admin/quiz/questions/${question.id}`, { method: 'DELETE' }), 'Đã lưu trữ câu hỏi')}
        />
      ) : (
        <SetEditorView
          selectedSet={selectedSet}
          initialQuestions={questions}
          onCancel={() => navigateView('bank', 'replace')}
          onSave={saveBatchQuestions}
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
  onSaveQuestion,
  onCloneClick,
  onCloseClick,
  onPublishClick
}: {
  children: React.ReactNode;
  view: ViewMode;
  onNavigate: (view: ViewMode, mode?: NavigationMode) => void;
  onLogout: () => void;
  onCreateQuestion: () => void;
  onSaveQuestion?: () => void;
  onCloneClick?: () => void;
  onCloseClick?: () => void;
  onPublishClick?: () => void;
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
          <div className="user-info">
            <strong>Nguyễn Văn An</strong>
            <span>Quản trị viên</span>
          </div>
          <button className="logout-button" onClick={onLogout} title="Đăng xuất">
            <LogOut size={18} />
          </button>
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
              <>
                <button className="secondary-button" onClick={onCloneClick}>Tạo bản mới</button>
                <button className="secondary-button danger" onClick={onCloseClick}>Đóng bộ</button>
                <button className="primary-button strong" onClick={onPublishClick}>Xuất bản</button>
                <button className="primary-button" onClick={onCreateQuestion}><Plus size={20} /> Thêm câu hỏi</button>
              </>
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
  loading,
  onTopicChange,
  onSetChange,
  onStatusChange,
  onSearchChange,
  onRefresh,
  onCreateQuestion,
  onAddTopicClick,
  onAddSetClick,
  onEditTopic,
  onEditSet,
  onEditQuestion,
  onArchiveTopic,
  onArchiveSet,
  onArchiveQuestion
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
  loading: boolean;
  onTopicChange: (value: string) => void;
  onSetChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onCreateQuestion: () => void;
  onAddTopicClick: () => void;
  onAddSetClick: () => void;
  onEditTopic: (topic: Topic) => void;
  onEditSet: (set: QuizSet) => void;
  onEditQuestion: (question: Question) => void;
  onArchiveTopic: (topic: Topic) => void;
  onArchiveSet: (set: QuizSet) => void;
  onArchiveQuestion: (question: Question) => void;
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

      </section>

      <aside className="side-column">
        <section className="glass-card management-card">
          <div className="section-heading tight">
            <div>
              <p className="eyebrow">Danh mục</p>
              <h2>Chủ đề</h2>
            </div>
            <button className="icon-button" onClick={onAddTopicClick} aria-label="Thêm chủ đề"><Plus size={18} /></button>
          </div>
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
            <button className="icon-button" onClick={onAddSetClick} aria-label="Thêm bộ câu hỏi"><Plus size={18} /></button>
          </div>
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

function SetEditorView({
  selectedSet,
  initialQuestions,
  onCancel,
  onSave
}: {
  selectedSet?: QuizSet;
  initialQuestions: Question[];
  onCancel: () => void;
  onSave: (questions: QuestionDraft[], deletedIds: string[]) => void;
}) {
  const [questions, setQuestions] = useState<QuestionDraft[]>(() => {
    if (!initialQuestions || initialQuestions.length === 0) return [emptyQuestionDraft(1)];
    return initialQuestions.map(q => ({
      id: q.id,
      content: q.content,
      type: q.type,
      points: q.points,
      order: q.order,
      explanation: q.explanation || '',
      options: q.options.map(o => ({ id: o.id, content: o.content, isCorrect: o.isCorrect, order: o.order }))
    }));
  });
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  const addQuestion = () => {
    setQuestions([...questions, emptyQuestionDraft(questions.length + 1)]);
    setActiveQuestionIndex(questions.length);
  };

  const removeQuestion = (index: number) => {
    const q = questions[index];
    if (q.id && !q.id.startsWith('draft-')) {
      setDeletedIds([...deletedIds, q.id]);
    }
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions.length > 0 ? newQuestions : [emptyQuestionDraft(1)]);
    setActiveQuestionIndex(Math.max(0, index - 1));
  };

  const updateQuestion = (index: number, updates: Partial<QuestionDraft>) => {
    setQuestions(questions.map((q, i) => i === index ? { ...q, ...updates } : q));
  };

  const updateOption = (qIndex: number, oIndex: number, updates: Partial<Option>) => {
    setQuestions(questions.map((q, i) => {
      if (i !== qIndex) return q;
      return { ...q, options: q.options.map((o, j) => j === oIndex ? { ...o, ...updates } : o) };
    }));
  };

  const setCorrectOption = (qIndex: number, oIndex: number) => {
    setQuestions(questions.map((q, i) => {
      if (i !== qIndex) return q;
      return { ...q, options: q.options.map((o, j) => ({ ...o, isCorrect: j === oIndex })) };
    }));
  };

  const addOption = (qIndex: number) => {
    setQuestions(questions.map((q, i) => {
      if (i !== qIndex) return q;
      return { ...q, options: [...q.options, { content: '', isCorrect: false }] };
    }));
  };
  
  const removeOption = (qIndex: number, oIndex: number) => {
    setQuestions(questions.map((q, i) => {
      if (i !== qIndex) return q;
      return { ...q, options: q.options.filter((_, j) => j !== oIndex) };
    }));
  };

  return (
    <div className="editor-list-layout">
      <div className="set-header-card">
        <input value={selectedSet?.title || ''} readOnly placeholder="Tiêu đề bộ câu hỏi" />
        <textarea value={selectedSet?.description || ''} readOnly placeholder="Mô tả bộ câu hỏi" />
      </div>

      {questions.map((q, qIndex) => (
        <div key={q.id || `draft-${qIndex}`} className={`question-block ${activeQuestionIndex === qIndex ? 'active' : ''}`} onClick={() => setActiveQuestionIndex(qIndex)}>
          <div className="question-block-header">
            <strong>Câu hỏi {qIndex + 1}</strong>
            <button className="icon-button danger ghost" onClick={() => removeQuestion(qIndex)}><Trash2 size={18} /></button>
          </div>
          <textarea 
            className="question-input" 
            placeholder="Nhập câu hỏi..." 
            value={q.content} 
            onChange={e => updateQuestion(qIndex, { content: e.target.value })} 
          />
          <div className="options-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {q.options.map((opt, oIndex) => (
              <div className="option-row" key={opt.id || oIndex}>
                <input 
                  type="radio" 
                  name={`correct-${qIndex}`} 
                  checked={opt.isCorrect} 
                  onChange={() => setCorrectOption(qIndex, oIndex)} 
                />
                <input 
                  type="text" 
                  placeholder={`Đáp án ${oIndex + 1}`} 
                  value={opt.content} 
                  onChange={e => updateOption(qIndex, oIndex, { content: e.target.value })} 
                />
                <button className="icon-button ghost muted-action" onClick={() => removeOption(qIndex, oIndex)}><X size={18} /></button>
              </div>
            ))}
          </div>
          {activeQuestionIndex === qIndex && (
            <div className="question-actions">
              <button className="text-button" onClick={() => addOption(qIndex)}><Plus size={16} /> Thêm lựa chọn</button>
            </div>
          )}
        </div>
      ))}

      <div className="add-question-btn-container">
        <button className="secondary-button" onClick={addQuestion}><Plus size={20} /> Thêm câu hỏi mới</button>
      </div>

      <footer className="editor-footer" style={{ position: 'sticky', bottom: '0', background: 'var(--surface-solid)', padding: '16px', borderRadius: '16px', boxShadow: '0 -4px 12px rgba(0,0,0,0.05)', zIndex: 10 }}>
        <button className="secondary-button" onClick={onCancel}><X size={18} /> Hủy</button>
        <button className="primary-button" onClick={() => onSave(questions, deletedIds)}><Save size={18} /> Lưu tất cả thay đổi</button>
      </footer>
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

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="icon-button ghost" onClick={onClose}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);

