import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import logo from './assets/logo.jpg';
import { createRoot } from 'react-dom/client';
import {
  Award,
  Bell,
  Bold,
  BookOpen,
  CalendarDays,
  CheckCircle,
  ChevronDown,
  Clock,
  ClipboardList,
  Edit,
  FileQuestion,
  Heading2,
  HelpCircle,
  Italic,
  LayoutDashboard,
  Link2,
  ListFilter,
  List,
  ListOrdered,
  LogOut,
  Menu,
  Image as ImageIcon,
  MessageSquareWarning,
  Plus,
  Redo2,
  RefreshCw,
  Save,
  Search,
  Settings,
  Shield,
  SlidersHorizontal,
  Star,
  Trash2,
  TrendingUp,
  Underline as UnderlineIcon,
  Undo2,
  Upload,
  Users,
  X
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : window.location.origin
);
const BOOKING_NOTIFICATION_READ_KEY = 'booking_notification_read_ids';
const FEEDBACK_NOTIFICATION_READ_KEY = 'feedback_notification_read_ids';

type ApiResponse<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } };
type Topic = { id: string; title: string; slug: string; description?: string; order: number; isActive: boolean; _count?: { sets: number } };
type QuizSetStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED' | string;
type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED' | string;
type EventCategory = 'VAN_HOA' | 'THE_THAO' | 'HANH_CHINH' | 'LE_HOI' | 'KHAC';
type ManagedEvent = {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  startAt: string;
  endAt: string;
  organizer: string;
  contactInfo?: string | null;
  imageUrls: string[];
  thumbnailUrl: string;
  status: EventStatus;
  order: number;
  publishedAt?: string | null;
  closedAt?: string | null;
};
type EventListResponse = {
  items: ManagedEvent[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};
type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';
type BookingField = 'HO_TICH' | 'CU_TRU' | 'CHUNG_THUC' | 'DAT_DAI' | 'XA_HOI' | 'KHAC';
type ManagedBooking = {
  id: string;
  code: string;
  field: BookingField;
  preferredDate: string;
  preferredTime: string;
  confirmedDate?: string | null;
  confirmedTime?: string | null;
  description: string;
  contactName: string;
  contactPhone?: string | null;
  status: BookingStatus;
  rejectionReason?: string | null;
  rescheduledNote?: string | null;
  createdAt: string;
  updatedAt?: string;
  user?: { id: string; displayName: string; avatarUrl?: string | null; zaloId?: string | null };
};
type BookingListResponse = {
  items: ManagedBooking[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};
type BookingSummary = {
  total: number;
  pendingCount: number;
  byStatus: Partial<Record<BookingStatus, number>>;
};
type FeedbackType = 'FIELD' | 'SERVICE_ATTITUDE';
type FeedbackStatus = 'PENDING' | 'PROCESSING' | 'TRANSFERRED' | 'RESOLVED';
type FeedbackCategory = 'HA_TANG' | 'VE_SINH' | 'TRAT_TU' | 'AN_NINH' | 'KHAC';
type ManagedFeedback = {
  id: string;
  code: string;
  type: FeedbackType;
  title: string;
  category: FeedbackCategory;
  serviceUnit?: string | null;
  satisfactionScore?: number | null;
  contactPhone?: string | null;
  description: string;
  imageUrls: string[];
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  status: FeedbackStatus;
  response?: string | null;
  respondedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  user?: { id: string; displayName: string; avatarUrl?: string | null; zaloId?: string | null };
};
type FeedbackListResponse = {
  items: ManagedFeedback[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};
type FeedbackSummary = {
  total: number;
  pendingCount: number;
  byStatus: Partial<Record<FeedbackStatus, number>>;
  byType: Partial<Record<FeedbackType, number>>;
};
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
type AdminUser = { id: string; displayName: string; email: string; role: 'ADMIN' | 'SUPER_ADMIN'; status: 'ACTIVE' | 'DISABLED'; mustChangePassword: boolean; lastLoginAt?: string | null };
type ManagedAdmin = AdminUser & { createdAt: string; updatedAt: string; createdBy?: { displayName: string; email: string } | null };
type AdminAuditLog = { id: string; action: string; entityType: string; entityId?: string | null; metadata?: unknown; ipAddress?: string | null; createdAt: string; actor: { displayName: string; email: string } };
type ViewMode = 'dashboard' | 'bank' | 'create' | 'guide' | 'events' | 'bookings' | 'feedbacks' | 'news' | 'procedures' | 'users' | 'admins' | 'settings';
const VIEW_CONFIG: Record<ViewMode, { title: string; section: string; label: string }> = {
  dashboard: { title: 'Tổng quan', section: 'Hệ thống', label: 'Tổng quan hệ thống' },
  bank: { title: 'Ngân hàng câu hỏi', section: 'Kiến thức Chuyển đổi số', label: 'Quản lý câu hỏi' },
  create: { title: 'Thêm câu hỏi mới', section: 'Kiến thức Chuyển đổi số', label: 'Thêm câu hỏi mới' },
  guide: { title: 'Hướng dẫn sử dụng', section: 'Hệ thống', label: 'Hướng dẫn sử dụng' },
  events: { title: 'Quản lý sự kiện', section: 'Quản lý nội dung', label: 'Sự kiện' },
  bookings: { title: 'Quản lý lịch hẹn', section: 'Nghiệp vụ', label: 'Lịch hẹn' },
  feedbacks: { title: 'Phản ánh, kiến nghị', section: 'Nghiệp vụ', label: 'Phản ánh, kiến nghị' },
  news: { title: 'Tin tức & Sự kiện', section: 'Quản lý nội dung', label: 'Tin tức & Sự kiện' },
  procedures: { title: 'Thủ tục hành chính', section: 'Quản lý nội dung', label: 'Thủ tục hành chính' },
  users: { title: 'Quản lý người dùng', section: 'Hệ thống', label: 'Người dùng' },
  admins: { title: 'Quản trị viên', section: 'Hệ thống', label: 'Quản trị viên' },
  settings: { title: 'Cài đặt hệ thống', section: 'Hệ thống', label: 'Cài đặt' }
};
type DashboardData = {
  summary: { totalUsers: number; totalTopics: number; totalSets: number; totalAttempts: number };
  dailyAttempts: { date: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
  topUsers: { userId: string; displayName: string; avatarUrl: string | null; totalScore: number; attemptCount: number }[];
  recentAttempts: { id: string; score: number; maxScore: number; timeTaken: number; submittedAt: string; user: { displayName: string; avatarUrl: string | null }; quizSet: { title: string } }[];
};
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
type EventFormState = {
  id?: string;
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  startAt: string;
  endAt: string;
  organizer: string;
  contactInfo: string;
  imageUrls: string[];
  thumbnailUrl: string;
  order: number;
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

const emptyEventForm = (): EventFormState => ({
  title: '',
  description: '',
  category: 'KHAC',
  location: '',
  startAt: '',
  endAt: '',
  organizer: '',
  contactInfo: '',
  imageUrls: [],
  thumbnailUrl: '',
  order: 0
});

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !json.success) {
    if ((res.status === 401 || res.status === 403) && !path.includes('/admin/login')) {
      window.dispatchEvent(new Event('admin-session-invalid'));
    }
    throw new Error(json.success ? `HTTP ${res.status}` : json.error.message);
  }
  return json.data;
}

async function uploadEventImages(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));

  const res = await fetch(`${API_URL}/api/upload?purpose=event`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });
  const json = (await res.json()) as ApiResponse<{ urls: string[] }>;
  if (!res.ok || !json.success) {
    throw new Error(json.success ? `HTTP ${res.status}` : json.error.message);
  }
  return json.data.urls;
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

const eventCategoryLabel = (category: EventCategory) => {
  const labels: Record<EventCategory, string> = {
    VAN_HOA: 'Văn hóa',
    THE_THAO: 'Thể thao',
    HANH_CHINH: 'Hành chính',
    LE_HOI: 'Lễ hội',
    KHAC: 'Khác'
  };
  return labels[category] || category;
};

const formatDateTime = (value: string) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
};

const toDateTimeInputValue = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const formatSeconds = (value: number) => {
  if (!value) return '0 giây';
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  if (!minutes) return `${seconds} giây`;
  return seconds ? `${minutes} phút ${seconds} giây` : `${minutes} phút`;
};

const getTextFromHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
};

const getImageSourcesFromHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  return Array.from(doc.body.querySelectorAll('img'))
    .map(img => img.getAttribute('src')?.trim())
    .filter((src): src is string => Boolean(src));
};

const hasDescriptionContent = (html: string) => {
  return Boolean(getTextFromHtml(html) || getImageSourcesFromHtml(html).length);
};

const hasImageSource = (html: string, src: string) => {
  return getImageSourcesFromHtml(html).includes(src);
};

function EventDescriptionEditor({
  value,
  disabled,
  onChange,
  onUploadImage,
  showMessage
}: {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onUploadImage: (files: File[]) => Promise<string[]>;
  showMessage: (text: string, tone?: 'info' | 'error') => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] }
      }),
      Underline,
      Link.configure({
        autolink: false,
        openOnClick: false,
        protocols: ['http', 'https', 'mailto'],
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      Image.configure({
        allowBase64: false,
        inline: false
      })
    ],
    content: value || '',
    editable: !disabled,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'event-rich-editor-content'
      }
    }
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if ((value || '') !== current) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [editor, value]);

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Nhập đường dẫn liên kết', previousUrl || 'https://');
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const insertImage = async (files: FileList | null) => {
    if (!editor || !files || files.length === 0) return;
    const file = files.item(0);
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const urls = await onUploadImage([file]);
      const url = urls.find(item => item?.trim())?.trim();
      if (!url) {
        throw new Error('Upload ảnh không trả về đường dẫn hợp lệ');
      }
      const inserted = editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      if (!inserted || !hasImageSource(editor.getHTML(), url)) {
        throw new Error('Không thể chèn ảnh vào mô tả');
      }
      showMessage('Đã chèn ảnh vào mô tả');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể chèn ảnh vào mô tả';
      setUploadError(message);
      showMessage(message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const buttonClass = (active = false) => active ? 'editor-tool active' : 'editor-tool';

  return (
    <div className="event-rich-editor">
      <div className="event-editor-toolbar" aria-label="Công cụ soạn thảo mô tả">
        <button type="button" className={buttonClass(editor?.isActive('bold'))} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleBold().run()} title="In đậm"><Bold size={16} /></button>
        <button type="button" className={buttonClass(editor?.isActive('italic'))} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleItalic().run()} title="In nghiêng"><Italic size={16} /></button>
        <button type="button" className={buttonClass(editor?.isActive('underline'))} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleUnderline().run()} title="Gạch chân"><UnderlineIcon size={16} /></button>
        <button type="button" className={buttonClass(editor?.isActive('heading', { level: 2 }))} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="Tiêu đề"><Heading2 size={16} /></button>
        <button type="button" className={buttonClass(editor?.isActive('bulletList'))} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleBulletList().run()} title="Danh sách chấm"><List size={16} /></button>
        <button type="button" className={buttonClass(editor?.isActive('orderedList'))} disabled={!editor || disabled} onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Danh sách số"><ListOrdered size={16} /></button>
        <button type="button" className={buttonClass(editor?.isActive('link'))} disabled={!editor || disabled} onClick={setLink} title="Liên kết"><Link2 size={16} /></button>
        <button type="button" className="editor-tool" disabled={!editor || disabled || uploading} onClick={() => fileInputRef.current?.click()} title="Chèn ảnh"><ImageIcon size={16} /></button>
        <button type="button" className="editor-tool" disabled={!editor || disabled || !editor.can().undo()} onClick={() => editor?.chain().focus().undo().run()} title="Hoàn tác"><Undo2 size={16} /></button>
        <button type="button" className="editor-tool" disabled={!editor || disabled || !editor.can().redo()} onClick={() => editor?.chain().focus().redo().run()} title="Làm lại"><Redo2 size={16} /></button>
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={event => { insertImage(event.target.files); event.currentTarget.value = ''; }} />
      </div>
      <EditorContent editor={editor} />
      <p className="editor-help">{uploading ? 'Đang tải ảnh...' : 'Nhập mô tả như văn bản thường, dùng thanh công cụ để định dạng.'}</p>
      {uploadError && <p className="editor-error">{uploadError}</p>}
    </div>
  );
}

const getViewFromLocation = (): ViewMode => {
  const v = new URLSearchParams(window.location.search).get('view');
  if (v === 'create') return 'create';
  if (v === 'guide') return 'guide';
  if (v === 'bank') return 'bank';
  if (v === 'events') return 'events';
  if (v === 'bookings') return 'bookings';
  if (v === 'feedbacks') return 'feedbacks';
  if (v === 'news') return 'news';
  if (v === 'procedures') return 'procedures';
  if (v === 'users') return 'users';
  if (v === 'admins') return 'admins';
  if (v === 'settings') return 'settings';
  return 'dashboard';
};

const buildViewUrl = (nextView: ViewMode) => {
  const url = new URL(window.location.href);
  if (nextView === 'dashboard') {
    url.searchParams.delete('view');
  } else {
    url.searchParams.set('view', nextView);
  }
  return `${url.pathname}${url.search}${url.hash}`;
};

const loadReadBookingNotificationIds = () => {
  try {
    const raw = localStorage.getItem(BOOKING_NOTIFICATION_READ_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

const saveBookingNotificationIds = (ids: string[]) => {
  localStorage.setItem(BOOKING_NOTIFICATION_READ_KEY, JSON.stringify(Array.from(new Set(ids))));
};

const loadReadFeedbackNotificationIds = () => {
  try {
    const raw = localStorage.getItem(FEEDBACK_NOTIFICATION_READ_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

const saveFeedbackNotificationIds = (ids: string[]) => {
  localStorage.setItem(FEEDBACK_NOTIFICATION_READ_KEY, JSON.stringify(Array.from(new Set(ids))));
};

function Login({ onLogin }: { onLogin: (user: AdminUser) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const data = await api<{ user: AdminUser }>('/api/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      onLogin(data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể đăng nhập');
    }
  };

  return (
    <main className="login-shell">
      <form className="login-card glass-card" onSubmit={submit}>
        <div className="brand-mark">
          <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
        </div>
        <div>
          <p className="eyebrow">Tùng Thiện Digital Admin</p>
          <h1>Đăng nhập quản trị</h1>
          <p className="muted">Quản lý Zalo Mini App dành cho Admin.</p>
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

function ChangePassword({ onChanged }: { onChanged: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await api('/api/auth/admin/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) });
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đổi mật khẩu');
    }
  };
  return (
    <main className="login-shell">
      <form className="login-card glass-card" onSubmit={submit}>
        <Shield size={40} />
        <div><p className="eyebrow">Bảo mật tài khoản</p><h1>Đổi mật khẩu bắt buộc</h1></div>
        <p className="muted">Mật khẩu mới cần ít nhất 12 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</p>
        <label>Mật khẩu hiện tại<input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /></label>
        <label>Mật khẩu mới<input type="password" required minLength={12} value={newPassword} onChange={e => setNewPassword(e.target.value)} /></label>
        {error && <Notice tone="error" message={error} />}
        <button className="primary-button" type="submit">Đổi mật khẩu</button>
      </form>
    </main>
  );
}

function App() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const loadMe = useCallback(() => api<AdminUser>('/api/auth/admin/me').then(setUser), []);
  useEffect(() => {
    loadMe().catch(() => setUser(null)).finally(() => setLoadingSession(false));
    const clear = () => setUser(null);
    window.addEventListener('admin-session-invalid', clear);
    return () => window.removeEventListener('admin-session-invalid', clear);
  }, [loadMe]);
  if (loadingSession) return <main className="login-shell"><div className="login-card glass-card">Đang kiểm tra phiên đăng nhập...</div></main>;
  if (!user) return <Login onLogin={setUser} />;
  if (user.mustChangePassword) return <ChangePassword onChanged={() => loadMe().catch(() => setUser(null))} />;
  return <Dashboard user={user} onLogout={() => api('/api/auth/admin/logout', { method: 'POST' }).finally(() => setUser(null))} />;
}

function Dashboard({ user, onLogout }: { user: AdminUser; onLogout: () => void }) {
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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardRange, setDashboardRange] = useState({ start: '', end: '' });
  const [bookingSummary, setBookingSummary] = useState<BookingSummary>({ total: 0, pendingCount: 0, byStatus: {} });
  const [bookingNotifications, setBookingNotifications] = useState<ManagedBooking[]>([]);
  const [readBookingNotificationIds, setReadBookingNotificationIds] = useState<string[]>(() => loadReadBookingNotificationIds());
  const [feedbackSummary, setFeedbackSummary] = useState<FeedbackSummary>({ total: 0, pendingCount: 0, byStatus: {}, byType: {} });
  const [feedbackNotifications, setFeedbackNotifications] = useState<ManagedFeedback[]>([]);
  const [readFeedbackNotificationIds, setReadFeedbackNotificationIds] = useState<string[]>(() => loadReadFeedbackNotificationIds());

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
  const unreadBookingCount = useMemo(
    () => bookingNotifications.filter(item => !readBookingNotificationIds.includes(item.id)).length,
    [bookingNotifications, readBookingNotificationIds]
  );
  const unreadFeedbackCount = useMemo(
    () => feedbackNotifications.filter(item => !readFeedbackNotificationIds.includes(item.id)).length,
    [feedbackNotifications, readFeedbackNotificationIds]
  );
  const isQuizView = ['bank', 'create'].includes(view);

  const dashboardStats = useMemo(() => {
    const totalQuestions = sets.reduce((sum, set) => sum + (set._count?.questions || 0), 0);
    return [
      { label: 'Tổng câu hỏi', value: totalQuestions.toLocaleString('vi-VN'), icon: FileQuestion, accent: 'blue' },
      { label: 'Hoạt động', value: sets.filter(set => set.status === 'PUBLISHED').length.toLocaleString('vi-VN'), icon: CheckCircle, accent: 'green' },
      { label: 'Bản nháp', value: sets.filter(set => set.status === 'DRAFT').length.toLocaleString('vi-VN'), icon: ClipboardList, accent: 'purple' },
      { label: 'Đã đóng', value: sets.filter(set => set.status === 'CLOSED').length.toLocaleString('vi-VN'), icon: Shield, accent: 'orange' }
    ] as const;
  }, [sets]);

  const showMessage = useCallback((text: string, tone: 'info' | 'error' = 'info') => {
    setMessage(text);
    setMessageTone(tone);
  }, []);

  const applyBookingSummary = useCallback((nextSummary: BookingSummary) => {
    setBookingSummary(prev => {
      const keys = new Set([...Object.keys(prev.byStatus), ...Object.keys(nextSummary.byStatus)]);
      const sameStatusCounts = Array.from(keys).every(key =>
        (prev.byStatus[key as BookingStatus] || 0) === (nextSummary.byStatus[key as BookingStatus] || 0)
      );
      if (prev.total === nextSummary.total && prev.pendingCount === nextSummary.pendingCount && sameStatusCounts) {
        return prev;
      }
      return nextSummary;
    });
  }, []);

  const applyBookingNotifications = useCallback((nextItems: ManagedBooking[]) => {
    setBookingNotifications(prev => {
      const prevSignature = prev.map(item => `${item.id}:${item.status}:${item.updatedAt || item.createdAt}`).join('|');
      const nextSignature = nextItems.map(item => `${item.id}:${item.status}:${item.updatedAt || item.createdAt}`).join('|');
      return prevSignature === nextSignature ? prev : nextItems;
    });
  }, []);

  const applyFeedbackSummary = useCallback((nextSummary: FeedbackSummary) => {
    setFeedbackSummary(prev => {
      const statusKeys = new Set([...Object.keys(prev.byStatus), ...Object.keys(nextSummary.byStatus)]);
      const typeKeys = new Set([...Object.keys(prev.byType), ...Object.keys(nextSummary.byType)]);
      const sameStatusCounts = Array.from(statusKeys).every(key =>
        (prev.byStatus[key as FeedbackStatus] || 0) === (nextSummary.byStatus[key as FeedbackStatus] || 0)
      );
      const sameTypeCounts = Array.from(typeKeys).every(key =>
        (prev.byType[key as FeedbackType] || 0) === (nextSummary.byType[key as FeedbackType] || 0)
      );
      if (prev.total === nextSummary.total && prev.pendingCount === nextSummary.pendingCount && sameStatusCounts && sameTypeCounts) {
        return prev;
      }
      return nextSummary;
    });
  }, []);

  const applyFeedbackNotifications = useCallback((nextItems: ManagedFeedback[]) => {
    setFeedbackNotifications(prev => {
      const prevSignature = prev.map(item => `${item.id}:${item.status}:${item.updatedAt || item.createdAt}`).join('|');
      const nextSignature = nextItems.map(item => `${item.id}:${item.status}:${item.updatedAt || item.createdAt}`).join('|');
      return prevSignature === nextSignature ? prev : nextItems;
    });
  }, []);

  const markBookingNotificationRead = useCallback((bookingId: string) => {
    setReadBookingNotificationIds(prev => {
      if (prev.includes(bookingId)) return prev;
      const next = [...prev, bookingId];
      saveBookingNotificationIds(next);
      return next;
    });
  }, []);

  const markFeedbackNotificationRead = useCallback((feedbackId: string) => {
    setReadFeedbackNotificationIds(prev => {
      if (prev.includes(feedbackId)) return prev;
      const next = [...prev, feedbackId];
      saveFeedbackNotificationIds(next);
      return next;
    });
  }, []);

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

  useEffect(() => {
    if (view === 'admins' && user.role !== 'SUPER_ADMIN') navigateView('dashboard', 'replace');
  }, [navigateView, user.role, view]);

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

  const loadBookingSummary = useCallback(async () => {
    const data = await api<BookingSummary>('/api/admin/bookings/summary');
    applyBookingSummary(data);
  }, [applyBookingSummary]);

  const loadBookingNotifications = useCallback(async () => {
    const data = await api<BookingListResponse>('/api/admin/bookings?status=PENDING&limit=10');
    applyBookingNotifications(data.items);
  }, [applyBookingNotifications]);

  const loadFeedbackSummary = useCallback(async () => {
    const data = await api<FeedbackSummary>('/api/admin/feedbacks/summary');
    applyFeedbackSummary(data);
  }, [applyFeedbackSummary]);

  const loadFeedbackNotifications = useCallback(async () => {
    const data = await api<FeedbackListResponse>('/api/admin/feedbacks?status=PENDING&limit=10');
    applyFeedbackNotifications(data.items);
  }, [applyFeedbackNotifications]);

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
    if (!isQuizView) return;
    loadTopics().catch(err => showMessage(err instanceof Error ? err.message : 'Không thể tải dữ liệu', 'error'));
  }, [isQuizView]);

  useEffect(() => {
    const loadHeader = () => Promise.all([
      view === 'bookings' ? loadBookingNotifications() : Promise.all([loadBookingSummary(), loadBookingNotifications()]),
      view === 'feedbacks' ? loadFeedbackNotifications() : Promise.all([loadFeedbackSummary(), loadFeedbackNotifications()])
    ]);

    loadHeader().catch(err => showMessage(err instanceof Error ? err.message : 'Không thể tải thông báo', 'error'));
    const timer = window.setInterval(() => {
      if (!document.hidden) loadHeader().catch(() => undefined);
    }, 60000);
    return () => window.clearInterval(timer);
  }, [loadBookingNotifications, loadBookingSummary, loadFeedbackNotifications, loadFeedbackSummary, showMessage, view]);

  useEffect(() => {
    if (view === 'dashboard') {
      const params = new URLSearchParams();
      if (dashboardRange.start) params.set('startDate', dashboardRange.start);
      if (dashboardRange.end) params.set('endDate', dashboardRange.end);
      
      api<DashboardData>(`/api/admin/quiz/dashboard?${params.toString()}`)
        .then(setDashboardData)
        .catch(err => showMessage(err instanceof Error ? err.message : 'Không thể tải dữ liệu tổng quan', 'error'));
    }
  }, [view, dashboardRange]);

  useEffect(() => {
    const handlePopState = () => {
      setView(getViewFromLocation());
    };
    window.history.replaceState({ adminView: getViewFromLocation() }, '', `${window.location.pathname}${window.location.search}${window.location.hash}`);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!isQuizView) return;
    loadSets(selectedTopicId).catch(err => showMessage(err instanceof Error ? err.message : 'Không thể tải bộ câu hỏi', 'error'));
  }, [isQuizView, selectedTopicId]);

  useEffect(() => {
    const nextSetId = filteredSets.some(set => set.id === selectedSetId) ? selectedSetId : filteredSets[0]?.id || '';
    if (nextSetId !== selectedSetId) setSelectedSetId(nextSetId);
  }, [filteredSets, selectedSetId]);

  useEffect(() => {
    if (!isQuizView) return;
    loadQuestions(selectedSetId).catch(err => showMessage(err instanceof Error ? err.message : 'Không thể tải câu hỏi', 'error'));
    loadStats(selectedSetId).catch(err => showMessage(err instanceof Error ? err.message : 'Không thể tải thống kê', 'error'));
  }, [isQuizView, selectedSetId]);

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
      user={user}
      view={view}
      onNavigate={navigateView}
      onLogout={onLogout}
      onCreateQuestion={startCreateQuestion}
      onCloneClick={() => openModal('SET_CLONE')}
      onCloseClick={() => openModal('SET_CLOSE')}
      onPublishClick={() => openModal('SET_PUBLISH')}
      pendingNotificationCount={unreadBookingCount + unreadFeedbackCount}
      bookingNotifications={bookingNotifications}
      readBookingNotificationIds={readBookingNotificationIds}
      onBookingNotificationRead={markBookingNotificationRead}
      onReloadBookingNotifications={loadBookingNotifications}
      feedbackNotifications={feedbackNotifications}
      readFeedbackNotificationIds={readFeedbackNotificationIds}
      onFeedbackNotificationRead={markFeedbackNotificationRead}
      onReloadFeedbackNotifications={loadFeedbackNotifications}
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

      {view === 'dashboard' ? (
        <DashboardView 
          data={dashboardData} 
          range={dashboardRange} 
          onRangeChange={setDashboardRange} 
        />
      ) : view === 'events' ? (
        <EventManagementView showMessage={showMessage} />
      ) : view === 'bookings' ? (
        <BookingManagementView showMessage={showMessage} onSummaryChange={applyBookingSummary} />
      ) : view === 'feedbacks' ? (
        <FeedbackManagementView showMessage={showMessage} onSummaryChange={applyFeedbackSummary} />
      ) : view === 'admins' && user.role === 'SUPER_ADMIN' ? (
        <AdminManagementView currentUser={user} showMessage={showMessage} />
      ) : ['news', 'procedures', 'users', 'settings'].includes(view) ? (
        <ComingSoonView view={view} />
      ) : view === 'bank' ? (
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
      ) : view === 'guide' ? (
        <UserGuideView />
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
  user,
  view,
  onNavigate,
  onLogout,
  onCreateQuestion,
  onCloneClick,
  onCloseClick,
  onPublishClick,
  pendingNotificationCount,
  bookingNotifications,
  readBookingNotificationIds,
  onBookingNotificationRead,
  onReloadBookingNotifications,
  feedbackNotifications,
  readFeedbackNotificationIds,
  onFeedbackNotificationRead,
  onReloadFeedbackNotifications
}: {
  children: React.ReactNode;
  user: AdminUser;
  view: ViewMode;
  onNavigate: (view: ViewMode, mode?: NavigationMode) => void;
  onLogout: () => void;
  onCreateQuestion: () => void;
  onCloneClick?: () => void;
  onCloseClick?: () => void;
  onPublishClick?: () => void;
  pendingNotificationCount: number;
  bookingNotifications: ManagedBooking[];
  readBookingNotificationIds: string[];
  onBookingNotificationRead: (bookingId: string) => void;
  onReloadBookingNotifications: () => Promise<void>;
  feedbackNotifications: ManagedFeedback[];
  readFeedbackNotificationIds: string[];
  onFeedbackNotificationRead: (feedbackId: string) => void;
  onReloadFeedbackNotifications: () => Promise<void>;
}) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const notificationButtonRef = useRef<HTMLButtonElement | null>(null);
  const notificationPopoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isNotificationOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!notificationButtonRef.current?.contains(target) && !notificationPopoverRef.current?.contains(target)) {
        setIsNotificationOpen(false);
      }
    };
    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [isNotificationOpen]);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [view]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1040) setIsMobileNavOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const unreadNotifications = bookingNotifications.filter(item => !readBookingNotificationIds.includes(item.id));
  const readNotifications = bookingNotifications.filter(item => readBookingNotificationIds.includes(item.id));
  const unreadFeedbackNotifications = feedbackNotifications.filter(item => !readFeedbackNotificationIds.includes(item.id));
  const readFeedbackNotifications = feedbackNotifications.filter(item => readFeedbackNotificationIds.includes(item.id));
  const orderedBookingNotifications = [...unreadNotifications, ...readNotifications];
  const orderedFeedbackNotifications = [...unreadFeedbackNotifications, ...readFeedbackNotifications];

  const openNotifications = () => {
    setIsNotificationOpen(open => !open);
    Promise.all([onReloadBookingNotifications(), onReloadFeedbackNotifications()]).catch(() => undefined);
  };

  const selectNotification = (bookingId: string) => {
    onBookingNotificationRead(bookingId);
    setIsNotificationOpen(false);
    onNavigate('bookings');
  };
  const selectFeedbackNotification = (feedbackId: string) => {
    onFeedbackNotificationRead(feedbackId);
    setIsNotificationOpen(false);
    onNavigate('feedbacks');
  };
  const handleNavigate = (nextView: ViewMode) => {
    setIsMobileNavOpen(false);
    onNavigate(nextView);
  };
  const viewConfig = VIEW_CONFIG[view];
  return (
    <main className={isMobileNavOpen ? 'admin-layout mobile-nav-open' : 'admin-layout'}>
      <button
        type="button"
        className={isMobileNavOpen ? 'sidebar-backdrop visible' : 'sidebar-backdrop'}
        aria-label="Đóng menu điều hướng"
        aria-hidden={!isMobileNavOpen}
        onClick={() => setIsMobileNavOpen(false)}
      />
      <aside className={isMobileNavOpen ? 'sidebar mobile-open' : 'sidebar'}>
        <div className="sidebar-brand">
          <div className="brand-mark">
            <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
          </div>
          <div>
            <strong>Tùng Thiện</strong>
            <span>Digital Admin</span>
          </div>
          <button type="button" className="icon-button ghost sidebar-close" onClick={() => setIsMobileNavOpen(false)} aria-label="Đóng menu">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Điều hướng quản trị">
          <button className={view === 'dashboard' ? 'nav-item active' : 'nav-item'} onClick={() => onNavigate('dashboard')}><LayoutDashboard size={20} /> Tổng quan</button>
          <p>Quản lý nội dung</p>
          <button className={(view === 'bank' || view === 'create') ? 'nav-item active' : 'nav-item'} onClick={() => onNavigate('bank')}>
            <FileQuestion size={20} /> Chuyển đổi số
          </button>
          <button className={view === 'news' ? 'nav-item active' : 'nav-item'} onClick={() => onNavigate('news')}>
            <BookOpen size={20} /> Tin tức & Sự kiện
          </button>
          <button className={view === 'events' ? 'nav-item active' : 'nav-item'} onClick={() => onNavigate('events')}>
            <CalendarDays size={20} /> Sự kiện
          </button>
          <button className={view === 'bookings' ? 'nav-item active' : 'nav-item'} onClick={() => onNavigate('bookings')}>
            <Clock size={20} /> Lịch hẹn
          </button>
          <button className={view === 'feedbacks' ? 'nav-item active' : 'nav-item'} onClick={() => onNavigate('feedbacks')}>
            <MessageSquareWarning size={20} /> Phản ánh, kiến nghị
          </button>
          <button className={view === 'procedures' ? 'nav-item active' : 'nav-item'} onClick={() => onNavigate('procedures')}>
            <ClipboardList size={20} /> Thủ tục hành chính
          </button>
          <p>Hệ thống</p>
          <button className={view === 'guide' ? 'nav-item active' : 'nav-item'} onClick={() => onNavigate('guide')}>
            <HelpCircle size={20} /> Hướng dẫn sử dụng
          </button>
          <button className={view === 'users' ? 'nav-item active' : 'nav-item'} onClick={() => onNavigate('users')}>
            <Award size={20} /> Người dùng
          </button>
          {user.role === 'SUPER_ADMIN' && (
            <button className={view === 'admins' ? 'nav-item active' : 'nav-item'} onClick={() => onNavigate('admins')}>
              <Shield size={20} /> Quản trị viên
            </button>
          )}
          <button className={view === 'settings' ? 'nav-item active' : 'nav-item'} onClick={() => onNavigate('settings')}>
            <Settings size={20} /> Cài đặt
          </button>
        </nav>

        <div className="sidebar-user">
          <div className="avatar">{user.displayName.slice(0, 2).toUpperCase()}</div>
          <div className="user-info">
            <strong>{user.displayName}</strong>
            <span>{user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}</span>
          </div>
          <button className="logout-button" onClick={onLogout} title="Đăng xuất">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="topbar-heading">
            <button type="button" className="icon-button ghost mobile-nav-toggle" onClick={() => setIsMobileNavOpen(true)} aria-label="Mở menu điều hướng">
              <Menu size={22} />
            </button>
            <div className="breadcrumb">
              {view === 'dashboard' ? (
                <strong>{viewConfig.label}</strong>
              ) : view === 'bank' || view === 'create' ? (
                <>
                  <button onClick={() => onNavigate('dashboard')}>Tổng quan</button>
                  <span>/</span>
                  <button onClick={() => onNavigate('bank')}>Quản lý câu hỏi</button>
                  {view === 'create' && <><span>/</span><strong>Thêm câu hỏi mới</strong></>}
                </>
              ) : (
                <>
                  <button onClick={() => onNavigate('dashboard')}>Tổng quan</button>
                  <span>/</span>
                  <span>{viewConfig.section}</span>
                  <span>/</span>
                  <strong>{viewConfig.label}</strong>
                </>
              )}
            </div>
            <h1>{viewConfig.title}</h1>
          </div>
          <div className="topbar-actions">
            <button
              ref={notificationButtonRef}
              className={pendingNotificationCount > 0 ? 'icon-button notify has-alert' : 'icon-button notify'}
              aria-label="Thông báo"
              aria-expanded={isNotificationOpen}
              onClick={openNotifications}
              title="Thông báo chờ xử lý"
            >
              <Bell size={21} />
              {pendingNotificationCount > 0 && <span className="notify-badge">{pendingNotificationCount > 99 ? '99+' : pendingNotificationCount}</span>}
            </button>
            {isNotificationOpen && (
              <div className="notification-popover" role="dialog" aria-label="Thông báo" ref={notificationPopoverRef}>
                <div className="notification-popover-header">
                  <strong>Thông báo chờ xử lý</strong>
                  <span>{pendingNotificationCount} chưa xem</span>
                </div>
                {orderedBookingNotifications.length > 0 || orderedFeedbackNotifications.length > 0 ? (
                  <div className="notification-list">
                    {orderedFeedbackNotifications.map(item => {
                      const isRead = readFeedbackNotificationIds.includes(item.id);
                      return (
                        <button
                          key={`feedback-${item.id}`}
                          type="button"
                          className={isRead ? 'notification-item read' : 'notification-item unread'}
                          onClick={() => selectFeedbackNotification(item.id)}
                        >
                          <span className="notification-dot" aria-hidden="true" />
                          <span className="notification-body">
                            <strong>{item.code} - {item.user?.displayName || 'Người gửi'}</strong>
                            <small>{feedbackTypeLabel(item.type)} · {item.title}</small>
                            <em>{isRead ? 'Đã xem' : 'Phản ánh mới'}</em>
                          </span>
                        </button>
                      );
                    })}
                    {orderedBookingNotifications.map(item => {
                      const isRead = readBookingNotificationIds.includes(item.id);
                      return (
                        <button
                          key={`booking-${item.id}`}
                          type="button"
                          className={isRead ? 'notification-item read' : 'notification-item unread'}
                          onClick={() => selectNotification(item.id)}
                        >
                          <span className="notification-dot" aria-hidden="true" />
                          <span className="notification-body">
                            <strong>{item.code} - {item.contactName || item.user?.displayName || 'Người đặt'}</strong>
                            <small>{bookingFieldLabel(item.field)} · {formatBookingDate(item.preferredDate, item.preferredTime)}</small>
                            <em>{isRead ? 'Đã xem' : 'Chưa xem'}</em>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="notification-empty">Chưa có thông báo chờ xử lý</div>
                )}
              </div>
            )}
            {view === 'dashboard' ? (
              null
            ) : view === 'bank' ? (
              <>
                <button className="secondary-button" onClick={onCloneClick}>Tạo bản mới</button>
                <button className="secondary-button danger" onClick={onCloseClick}>Đóng bộ</button>
                <button className="primary-button strong" onClick={onPublishClick}>Xuất bản</button>
                <button className="primary-button" onClick={onCreateQuestion}><Plus size={20} /> Thêm câu hỏi</button>
              </>
            ) : null}
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

const bookingFieldLabel = (field: BookingField) => {
  const labels: Record<BookingField, string> = {
    HO_TICH: 'Hộ tịch',
    CU_TRU: 'Cư trú',
    CHUNG_THUC: 'Chứng thực',
    DAT_DAI: 'Đất đai - Xây dựng',
    XA_HOI: 'Chính sách xã hội',
    KHAC: 'Vấn đề khác'
  };
  return labels[field] || field;
};

const bookingStatusLabel = (status: BookingStatus) => {
  const labels: Record<BookingStatus, string> = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    REJECTED: 'Đã từ chối',
    RESCHEDULED: 'Đã dời lịch',
    COMPLETED: 'Đã hoàn thành',
    CANCELLED: 'Đã hủy'
  };
  return labels[status] || status;
};

const feedbackTypeLabel = (type: FeedbackType) => {
  const labels: Record<FeedbackType, string> = {
    FIELD: 'Hiện trường',
    SERVICE_ATTITUDE: 'Thái độ phục vụ'
  };
  return labels[type] || type;
};

const feedbackCategoryLabel = (category: FeedbackCategory) => {
  const labels: Record<FeedbackCategory, string> = {
    HA_TANG: 'Hạ tầng - Đường sá',
    VE_SINH: 'Vệ sinh môi trường',
    TRAT_TU: 'Trật tự đô thị',
    AN_NINH: 'An ninh - Trật tự',
    KHAC: 'Vấn đề khác'
  };
  return labels[category] || category;
};

const feedbackStatusLabel = (status: FeedbackStatus) => {
  const labels: Record<FeedbackStatus, string> = {
    PENDING: 'Chờ xử lý',
    PROCESSING: 'Đang xử lý',
    TRANSFERRED: 'Đã chuyển đơn vị',
    RESOLVED: 'Đã hoàn tất'
  };
  return labels[status] || status;
};

const toDateInputValue = (value?: string | null) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

const formatBookingDate = (date: string, time?: string | null) => {
  const formatted = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
  return time ? `${formatted} - ${time}` : formatted;
};

function FeedbackManagementView({
  showMessage,
  onSummaryChange
}: {
  showMessage: (text: string, tone?: 'info' | 'error') => void;
  onSummaryChange: (summary: FeedbackSummary) => void;
}) {
  const [feedbacks, setFeedbacks] = useState<ManagedFeedback[]>([]);
  const [summary, setSummary] = useState<FeedbackSummary>({ total: 0, pendingCount: 0, byStatus: {}, byType: {} });
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resolveFeedback, setResolveFeedback] = useState<ManagedFeedback | null>(null);
  const [response, setResponse] = useState('');

  const loadSummary = useCallback(async () => {
    const data = await api<FeedbackSummary>('/api/admin/feedbacks/summary');
    setSummary(data);
    onSummaryChange(data);
  }, [onSummaryChange]);

  const loadFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'ALL') params.set('type', typeFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      params.set('limit', '50');
      const data = await api<FeedbackListResponse>(`/api/admin/feedbacks?${params.toString()}`);
      setFeedbacks(data.items);
      await loadSummary();
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Không thể tải phản ánh', 'error');
    } finally {
      setLoading(false);
    }
  }, [loadSummary, search, showMessage, statusFilter, typeFilter]);

  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden) loadFeedbacks().catch(() => undefined);
    }, 60000);
    return () => window.clearInterval(timer);
  }, [loadFeedbacks]);

  const updateStatus = async (feedbackId: string, payload: { status: 'PROCESSING' | 'RESOLVED'; response?: string }) => {
    await api(`/api/admin/feedbacks/${feedbackId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    await loadFeedbacks();
  };

  const markProcessing = async (feedback: ManagedFeedback) => {
    try {
      await updateStatus(feedback.id, { status: 'PROCESSING' });
      showMessage('Đã chuyển phản ánh sang đang xử lý');
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Không thể cập nhật phản ánh', 'error');
    }
  };

  const openResolveModal = (feedback: ManagedFeedback) => {
    setResolveFeedback(feedback);
    setResponse(feedback.response || '');
  };

  const closeResolveModal = () => {
    if (submitting) return;
    setResolveFeedback(null);
    setResponse('');
  };

  const submitResolve = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resolveFeedback) return;
    if (!response.trim()) {
      showMessage('Vui lòng nhập phản hồi khi hoàn tất phản ánh', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await updateStatus(resolveFeedback.id, { status: 'RESOLVED', response: response.trim() });
      showMessage('Đã hoàn tất phản ánh');
      closeResolveModal();
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Không thể hoàn tất phản ánh', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const statItems = [
    { label: 'Tổng phản ánh', value: summary.total.toLocaleString('vi-VN'), icon: MessageSquareWarning, accent: 'blue' },
    { label: 'Chờ xử lý', value: (summary.byStatus.PENDING || 0).toLocaleString('vi-VN'), icon: Clock, accent: 'orange' },
    { label: 'Đang xử lý', value: (summary.byStatus.PROCESSING || 0).toLocaleString('vi-VN'), icon: RefreshCw, accent: 'purple' },
    { label: 'Đã hoàn tất', value: (summary.byStatus.RESOLVED || 0).toLocaleString('vi-VN'), icon: CheckCircle, accent: 'green' }
  ] as const;

  return (
    <div className="event-management-layout">
      <section className="main-column">
        <div className="stats-grid">
          {statItems.map(stat => <StatCard key={stat.label} {...stat} />)}
        </div>

        <div className="toolbar glass-card">
          <div className="search-box">
            <Search size={20} />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm mã, tiêu đề, nội dung, người gửi, SĐT, đơn vị..." />
          </div>
          <div className="filter-group">
            <ListFilter size={20} />
            <Select value={typeFilter} onChange={setTypeFilter} ariaLabel="Lọc loại phản ánh">
              <option value="ALL">Tất cả loại</option>
              <option value="FIELD">Hiện trường</option>
              <option value="SERVICE_ATTITUDE">Thái độ phục vụ</option>
            </Select>
            <Select value={statusFilter} onChange={setStatusFilter} ariaLabel="Lọc trạng thái phản ánh">
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="RESOLVED">Đã hoàn tất</option>
            </Select>
          </div>
          <button className="text-button" onClick={loadFeedbacks} disabled={loading}><RefreshCw size={17} /> Làm mới</button>
        </div>

        <section className="table-card glass-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Phản ánh</p>
              <h2>Danh sách phản ánh, kiến nghị</h2>
            </div>
          </div>

          {feedbacks.length > 0 ? (
            <>
              <div className="question-table feedback-table">
                <div className="table-row table-head">
                  <span>Phản ánh</span>
                  <span>Người gửi</span>
                  <span>Ảnh / đánh giá</span>
                  <span>Trạng thái</span>
                  <span>Thao tác</span>
                </div>
                {feedbacks.map(item => (
                  <div className="table-row" key={item.id}>
                    <div className="question-cell">
                      <strong>{item.code} - {feedbackTypeLabel(item.type)}</strong>
                      <small>{item.title}</small>
                      <small>{item.type === 'SERVICE_ATTITUDE' ? item.serviceUnit || 'Chưa có đơn vị' : feedbackCategoryLabel(item.category)}</small>
                      <small>{item.description}</small>
                    </div>
                    <div className="booking-contact">
                      <strong>{item.user?.displayName || 'Người gửi'}</strong>
                      <span>{item.contactPhone || 'Chưa có SĐT'}</span>
                      <span>{formatDateTime(item.createdAt)}</span>
                    </div>
                    <div className="feedback-media">
                      {item.type === 'SERVICE_ATTITUDE' ? (
                        <span className="feedback-stars"><Star size={16} /> {item.satisfactionScore || 0}/5</span>
                      ) : item.imageUrls?.[0] ? (
                        <img src={item.imageUrls[0]} alt={item.title} />
                      ) : (
                        <span className="chip">Không có ảnh</span>
                      )}
                    </div>
                    <span className={`status-badge status-${item.status.toLowerCase()}`}>{feedbackStatusLabel(item.status)}</span>
                    <div className="row-actions">
                      {item.status === 'PENDING' && <button className="icon-button" onClick={() => markProcessing(item)} aria-label="Chuyển xử lý"><RefreshCw size={18} /></button>}
                      {item.status !== 'RESOLVED' && <button className="icon-button" onClick={() => openResolveModal(item)} aria-label="Hoàn tất"><CheckCircle size={18} /></button>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="table-footer">
                <span>Hiển thị {feedbacks.length} phản ánh</span>
              </div>
            </>
          ) : <EmptyState title="Chưa có phản ánh" description="Các phản ánh, kiến nghị từ Mini App sẽ hiển thị tại đây." />}
        </section>
      </section>

      <Modal isOpen={Boolean(resolveFeedback)} onClose={closeResolveModal} title="Hoàn tất phản ánh">
        <form className="stack-form" onSubmit={submitResolve}>
          <label>Phản hồi gửi người dân
            <textarea required value={response} onChange={event => setResponse(event.target.value)} />
          </label>
          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={closeResolveModal}>Hủy</button>
            <button type="submit" className="primary-button" disabled={submitting}>Hoàn tất</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function BookingManagementView({
  showMessage,
  onSummaryChange
}: {
  showMessage: (text: string, tone?: 'info' | 'error') => void;
  onSummaryChange: (summary: BookingSummary) => void;
}) {
  const [bookings, setBookings] = useState<ManagedBooking[]>([]);
  const [summary, setSummary] = useState<BookingSummary>({ total: 0, pendingCount: 0, byStatus: {} });
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalState, setModalState] = useState<{ type: 'CONFIRMED' | 'REJECTED' | 'RESCHEDULED' | null; booking?: ManagedBooking }>({ type: null });
  const [statusForm, setStatusForm] = useState({ confirmedDate: '', confirmedTime: '', rejectionReason: '', rescheduledNote: '' });

  const loadSummary = useCallback(async () => {
    const data = await api<BookingSummary>('/api/admin/bookings/summary');
    setSummary(data);
    onSummaryChange(data);
  }, [onSummaryChange]);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      params.set('limit', '50');
      const data = await api<BookingListResponse>(`/api/admin/bookings?${params.toString()}`);
      setBookings(data.items);
      await loadSummary();
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Không thể tải lịch hẹn', 'error');
    } finally {
      setLoading(false);
    }
  }, [loadSummary, search, showMessage, statusFilter]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden) loadBookings().catch(() => undefined);
    }, 60000);
    return () => window.clearInterval(timer);
  }, [loadBookings]);

  const openStatusModal = (type: 'CONFIRMED' | 'REJECTED' | 'RESCHEDULED', booking: ManagedBooking) => {
    setModalState({ type, booking });
    setStatusForm({
      confirmedDate: toDateInputValue(booking.confirmedDate || booking.preferredDate),
      confirmedTime: booking.confirmedTime || booking.preferredTime,
      rejectionReason: booking.rejectionReason || '',
      rescheduledNote: booking.rescheduledNote || ''
    });
  };

  const closeStatusModal = () => {
    if (submitting) return;
    setModalState({ type: null });
  };

  const updateStatus = async (bookingId: string, payload: Record<string, string>) => {
    await api(`/api/admin/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    await loadBookings();
  };

  const submitStatusModal = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!modalState.type || !modalState.booking) return;
    setSubmitting(true);
    try {
      if (modalState.type === 'CONFIRMED') {
        await updateStatus(modalState.booking.id, {
          status: 'CONFIRMED',
          confirmedDate: statusForm.confirmedDate,
          confirmedTime: statusForm.confirmedTime
        });
        showMessage('Đã xác nhận lịch hẹn');
      } else if (modalState.type === 'REJECTED') {
        await updateStatus(modalState.booking.id, {
          status: 'REJECTED',
          rejectionReason: statusForm.rejectionReason.trim()
        });
        showMessage('Đã từ chối lịch hẹn');
      } else {
        await updateStatus(modalState.booking.id, {
          status: 'RESCHEDULED',
          confirmedDate: statusForm.confirmedDate,
          confirmedTime: statusForm.confirmedTime,
          rescheduledNote: statusForm.rescheduledNote.trim()
        });
        showMessage('Đã dời lịch hẹn');
      }
      closeStatusModal();
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Không thể cập nhật lịch hẹn', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const runQuickStatus = async (booking: ManagedBooking, status: 'COMPLETED' | 'CANCELLED') => {
    try {
      await updateStatus(booking.id, { status });
      showMessage(status === 'COMPLETED' ? 'Đã hoàn thành lịch hẹn' : 'Đã hủy lịch hẹn');
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Không thể cập nhật lịch hẹn', 'error');
    }
  };

  const statItems = [
    { label: 'Tổng lịch', value: summary.total.toLocaleString('vi-VN'), icon: CalendarDays, accent: 'blue' },
    { label: 'Chờ xử lý', value: (summary.byStatus.PENDING || 0).toLocaleString('vi-VN'), icon: Clock, accent: 'orange' },
    { label: 'Đã xác nhận', value: ((summary.byStatus.CONFIRMED || 0) + (summary.byStatus.RESCHEDULED || 0)).toLocaleString('vi-VN'), icon: CheckCircle, accent: 'green' },
    { label: 'Đã từ chối/hủy', value: ((summary.byStatus.REJECTED || 0) + (summary.byStatus.CANCELLED || 0)).toLocaleString('vi-VN'), icon: Shield, accent: 'purple' }
  ] as const;

  return (
    <div className="event-management-layout">
      <section className="main-column">
        <div className="stats-grid">
          {statItems.map(stat => <StatCard key={stat.label} {...stat} />)}
        </div>

        <div className="toolbar glass-card">
          <div className="search-box">
            <Search size={20} />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm mã lịch, tên, số điện thoại, nội dung..." />
          </div>
          <div className="filter-group">
            <ListFilter size={20} />
            <Select value={statusFilter} onChange={setStatusFilter} ariaLabel="Lọc trạng thái lịch hẹn">
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="RESCHEDULED">Đã dời lịch</option>
              <option value="REJECTED">Đã từ chối</option>
              <option value="COMPLETED">Đã hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </Select>
          </div>
          <button className="text-button" onClick={loadBookings} disabled={loading}><RefreshCw size={17} /> Làm mới</button>
        </div>

        <section className="table-card glass-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Tiếp dân</p>
              <h2>Danh sách lịch hẹn</h2>
            </div>
          </div>

          {bookings.length > 0 ? (
            <>
              <div className="question-table booking-table">
                <div className="table-row table-head">
                  <span>Lịch hẹn</span>
                  <span>Người đặt</span>
                  <span>Thời gian</span>
                  <span>Trạng thái</span>
                  <span>Thao tác</span>
                </div>
                {bookings.map(item => (
                  <div className="table-row" key={item.id}>
                    <div className="question-cell">
                      <strong>{item.code} - {bookingFieldLabel(item.field)}</strong>
                      <small>{item.description}</small>
                    </div>
                    <div className="booking-contact">
                      <strong>{item.contactName || item.user?.displayName || 'Người đặt'}</strong>
                      <span>{item.contactPhone || 'Chưa có SĐT'}</span>
                    </div>
                    <div className="booking-time">
                      <span>Mong muốn: {formatBookingDate(item.preferredDate, item.preferredTime)}</span>
                      {(item.confirmedDate || item.confirmedTime) && <strong>Xác nhận: {formatBookingDate(item.confirmedDate || item.preferredDate, item.confirmedTime || item.preferredTime)}</strong>}
                    </div>
                    <span className={`status-badge status-${item.status.toLowerCase()}`}>{bookingStatusLabel(item.status)}</span>
                    <div className="row-actions">
                      {item.status === 'PENDING' && <button className="icon-button" onClick={() => openStatusModal('CONFIRMED', item)} aria-label="Xác nhận"><CheckCircle size={18} /></button>}
                      {item.status === 'PENDING' && <button className="icon-button" onClick={() => openStatusModal('RESCHEDULED', item)} aria-label="Dời lịch"><Clock size={18} /></button>}
                      {item.status === 'PENDING' && <button className="icon-button danger" onClick={() => openStatusModal('REJECTED', item)} aria-label="Từ chối"><X size={18} /></button>}
                      {['CONFIRMED', 'RESCHEDULED'].includes(item.status) && <button className="icon-button" onClick={() => runQuickStatus(item, 'COMPLETED')} aria-label="Hoàn thành"><CheckCircle size={18} /></button>}
                      {['PENDING', 'CONFIRMED', 'RESCHEDULED'].includes(item.status) && <button className="icon-button danger" onClick={() => runQuickStatus(item, 'CANCELLED')} aria-label="Hủy"><Trash2 size={18} /></button>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="table-footer">
                <span>Hiển thị {bookings.length} lịch hẹn</span>
              </div>
            </>
          ) : <EmptyState title="Chưa có lịch hẹn" description="Các yêu cầu đặt lịch từ Mini App sẽ hiển thị tại đây." />}
        </section>
      </section>

      <Modal
        isOpen={modalState.type !== null}
        onClose={closeStatusModal}
        title={
          modalState.type === 'CONFIRMED' ? 'Xác nhận lịch hẹn' :
          modalState.type === 'REJECTED' ? 'Từ chối lịch hẹn' :
          'Dời lịch hẹn'
        }
      >
        <form className="stack-form" onSubmit={submitStatusModal}>
          {modalState.type !== 'REJECTED' ? (
            <>
              <label>Ngày hẹn
                <input required type="date" value={statusForm.confirmedDate} onChange={event => setStatusForm({ ...statusForm, confirmedDate: event.target.value })} />
              </label>
              <label>Giờ hẹn
                <input required type="time" value={statusForm.confirmedTime} onChange={event => setStatusForm({ ...statusForm, confirmedTime: event.target.value })} />
              </label>
              {modalState.type === 'RESCHEDULED' && (
                <label>Ghi chú dời lịch
                  <textarea value={statusForm.rescheduledNote} onChange={event => setStatusForm({ ...statusForm, rescheduledNote: event.target.value })} />
                </label>
              )}
            </>
          ) : (
            <label>Lý do từ chối
              <textarea required value={statusForm.rejectionReason} onChange={event => setStatusForm({ ...statusForm, rejectionReason: event.target.value })} />
            </label>
          )}
          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={closeStatusModal}>Hủy</button>
            <button type="submit" className="primary-button" disabled={submitting}>Lưu lại</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function EventManagementView({ showMessage }: { showMessage: (text: string, tone?: 'info' | 'error') => void }) {
  const [events, setEvents] = useState<ManagedEvent[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingEventImages, setUploadingEventImages] = useState(false);
  const [uploadingDescriptionImage, setUploadingDescriptionImage] = useState(false);
  const [form, setForm] = useState<EventFormState>(() => emptyEventForm());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      params.set('limit', '50');
      const data = await api<EventListResponse>(`/api/admin/events?${params.toString()}`);
      setEvents(data.items);
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Không thể tải sự kiện', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, showMessage]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const resetForm = () => setForm(emptyEventForm());

  const openCreateEventModal = () => {
    setForm(emptyEventForm());
    setIsEventModalOpen(true);
  };

  const openEditEventModal = (event: ManagedEvent) => {
    setForm({
      id: event.id,
      title: event.title,
      description: event.description,
      category: event.category,
      location: event.location,
      startAt: toDateTimeInputValue(event.startAt),
      endAt: toDateTimeInputValue(event.endAt),
      organizer: event.organizer,
      contactInfo: event.contactInfo || '',
      imageUrls: event.imageUrls || [],
      thumbnailUrl: event.thumbnailUrl,
      order: event.order || 0
    });
    setIsEventModalOpen(true);
  };

  const closeEventModal = () => {
    if (submitting || uploadingEventImages || uploadingDescriptionImage) return;
    setIsEventModalOpen(false);
    resetForm();
  };

  const validateForm = () => {
    if (!form.title.trim() || !hasDescriptionContent(form.description) || !form.location.trim() || !form.organizer.trim()) {
      throw new Error('Nhập đầy đủ tiêu đề, mô tả, địa điểm và đơn vị tổ chức');
    }
    if (!form.startAt || !form.endAt) throw new Error('Nhập đầy đủ thời gian bắt đầu và kết thúc');
    if (new Date(form.endAt) < new Date(form.startAt)) throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu');
    if (form.thumbnailUrl && !form.imageUrls.includes(form.thumbnailUrl)) throw new Error('Thumbnail phải nằm trong danh sách ảnh');
  };

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (uploadingDescriptionImage) {
      showMessage('Vui lòng đợi tải ảnh mô tả hoàn tất trước khi lưu sự kiện', 'error');
      return;
    }
    setSubmitting(true);
    try {
      validateForm();
      const imageUrls = Array.from(new Set(form.imageUrls.filter(Boolean)));
      const thumbnailUrl = form.thumbnailUrl || imageUrls[0] || '';
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        location: form.location.trim(),
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        organizer: form.organizer.trim(),
        contactInfo: form.contactInfo.trim() || null,
        imageUrls,
        thumbnailUrl,
        order: form.order
      };
      if (form.id) {
        await api(`/api/admin/events/${form.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        showMessage('Đã cập nhật sự kiện');
      } else {
        await api('/api/admin/events', { method: 'POST', body: JSON.stringify(payload) });
        showMessage('Đã tạo sự kiện');
      }
      setIsEventModalOpen(false);
      resetForm();
      await loadEvents();
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Không thể lưu sự kiện', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const uploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingEventImages(true);
    try {
      const urls = await uploadEventImages(Array.from(files));
      setForm(prev => {
        const imageUrls = Array.from(new Set([...prev.imageUrls, ...urls]));
        return { ...prev, imageUrls, thumbnailUrl: prev.thumbnailUrl || imageUrls[0] || '' };
      });
      showMessage('Đã tải ảnh sự kiện');
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Không thể tải ảnh', 'error');
    } finally {
      setUploadingEventImages(false);
    }
  };

  const uploadDescriptionImages = async (files: File[]) => {
    setUploadingDescriptionImage(true);
    try {
      return await uploadEventImages(files);
    } finally {
      setUploadingDescriptionImage(false);
    }
  };

  const removeImage = (url: string) => {
    setForm(prev => {
      const imageUrls = prev.imageUrls.filter(item => item !== url);
      return {
        ...prev,
        imageUrls,
        thumbnailUrl: prev.thumbnailUrl === url ? imageUrls[0] || '' : prev.thumbnailUrl
      };
    });
  };

  const runAction = async (fn: () => Promise<unknown>, message: string) => {
    try {
      await fn();
      showMessage(message);
      await loadEvents();
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Thao tác thất bại', 'error');
    }
  };

  const summary = [
    { label: 'Tổng sự kiện', value: events.length.toLocaleString('vi-VN'), icon: CalendarDays, accent: 'blue' },
    { label: 'Hoạt động', value: events.filter(item => item.status === 'PUBLISHED').length.toLocaleString('vi-VN'), icon: CheckCircle, accent: 'green' },
    { label: 'Bản nháp', value: events.filter(item => item.status === 'DRAFT').length.toLocaleString('vi-VN'), icon: ClipboardList, accent: 'purple' },
    { label: 'Đã đóng', value: events.filter(item => item.status === 'CLOSED').length.toLocaleString('vi-VN'), icon: Shield, accent: 'orange' }
  ] as const;

  return (
    <div className="event-management-layout">
      <section className="main-column">
        <div className="stats-grid">
          {summary.map(stat => <StatCard key={stat.label} {...stat} />)}
        </div>

        <div className="toolbar glass-card">
          <div className="search-box">
            <Search size={20} />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm tiêu đề, địa điểm, đơn vị tổ chức..." />
          </div>
          <div className="filter-group">
            <ListFilter size={20} />
            <Select value={statusFilter} onChange={setStatusFilter} ariaLabel="Lọc trạng thái sự kiện">
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PUBLISHED">Hoạt động</option>
              <option value="DRAFT">Nháp</option>
              <option value="CLOSED">Đã đóng</option>
            </Select>
          </div>
          <button className="text-button" onClick={loadEvents} disabled={loading}><RefreshCw size={17} /> Làm mới</button>
        </div>

        <section className="table-card glass-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Nội dung sự kiện</p>
              <h2>Danh sách sự kiện</h2>
            </div>
            <button className="primary-button compact" onClick={openCreateEventModal}><Plus size={18} /> Thêm sự kiện</button>
          </div>
          {events.length > 0 ? (
            <>
              <div className="question-table event-table">
                <div className="table-row table-head">
                  <span>Sự kiện</span>
                  <span>Thời gian</span>
                  <span>Danh mục</span>
                  <span>Trạng thái</span>
                  <span>Thao tác</span>
                </div>
                {events.map(item => (
                  <div className="table-row" key={item.id}>
                    <div className="event-cell">
                      {item.thumbnailUrl ? (
                        <img src={item.thumbnailUrl} alt={item.title} />
                      ) : (
                        <div className="event-thumb-placeholder" aria-label="Chưa có ảnh đại diện">
                          <ImageIcon size={22} />
                        </div>
                      )}
                      <div className="question-cell">
                        <strong>{item.title}</strong>
                        <small>{item.location} - {item.organizer}</small>
                      </div>
                    </div>
                    <span>{formatDateTime(item.startAt)}</span>
                    <span className="chip">{eventCategoryLabel(item.category)}</span>
                    <StatusBadge status={item.status} />
                    <div className="row-actions">
                      <button className="icon-button" onClick={() => openEditEventModal(item)} aria-label="Sửa sự kiện"><Edit size={18} /></button>
                      {item.status !== 'PUBLISHED' && <button className="icon-button" onClick={() => runAction(() => api(`/api/admin/events/${item.id}/publish`, { method: 'POST' }), 'Đã xuất bản sự kiện')} aria-label="Xuất bản"><CheckCircle size={18} /></button>}
                      {item.status === 'PUBLISHED' && <button className="icon-button" onClick={() => runAction(() => api(`/api/admin/events/${item.id}/close`, { method: 'POST' }), 'Đã đóng sự kiện')} aria-label="Đóng"><Shield size={18} /></button>}
                      <button className="icon-button danger" onClick={() => runAction(() => api(`/api/admin/events/${item.id}`, { method: 'DELETE' }), 'Đã lưu trữ sự kiện')} aria-label="Lưu trữ"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="table-footer">
                <span>Hiển thị {events.length} sự kiện</span>
              </div>
            </>
          ) : <EmptyState title="Chưa có sự kiện" description="Tạo sự kiện đầu tiên và xuất bản để hiển thị trên Mini App." actionLabel="Thêm sự kiện" onAction={openCreateEventModal} />}
        </section>
      </section>

      <Modal
        isOpen={isEventModalOpen}
        onClose={closeEventModal}
        title={form.id ? 'Sửa sự kiện' : 'Thêm sự kiện'}
        className="event-modal"
      >
        <form className="event-form event-modal-form" onSubmit={submitForm}>
          <label>Tiêu đề
            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </label>
          <div className="event-form-field">
            <span>Mô tả</span>
            <EventDescriptionEditor
              value={form.description}
              disabled={submitting}
              onChange={description => setForm(prev => ({ ...prev, description }))}
              onUploadImage={uploadDescriptionImages}
              showMessage={showMessage}
            />
            {uploadingDescriptionImage && <small className="field-hint">Đang tải ảnh mô tả...</small>}
          </div>
          <label>Danh mục
            <Select value={form.category} onChange={value => setForm({ ...form, category: value as EventCategory })} ariaLabel="Danh mục sự kiện">
              <option value="VAN_HOA">Văn hóa</option>
              <option value="THE_THAO">Thể thao</option>
              <option value="HANH_CHINH">Hành chính</option>
              <option value="LE_HOI">Lễ hội</option>
              <option value="KHAC">Khác</option>
            </Select>
          </label>
          <label>Địa điểm
            <input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          </label>
          <div className="form-grid-two">
            <label>Bắt đầu
              <input required type="datetime-local" value={form.startAt} onChange={e => setForm({ ...form, startAt: e.target.value })} />
            </label>
            <label>Kết thúc
              <input required type="datetime-local" value={form.endAt} onChange={e => setForm({ ...form, endAt: e.target.value })} />
            </label>
          </div>
          <label>Đơn vị tổ chức
            <input required value={form.organizer} onChange={e => setForm({ ...form, organizer: e.target.value })} />
          </label>
          <label>Liên hệ
            <input value={form.contactInfo} onChange={e => setForm({ ...form, contactInfo: e.target.value })} />
          </label>
          <label>Thứ tự ưu tiên
            <input type="number" min={0} value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} />
          </label>

          <div className="event-upload-box">
            <label className="secondary-button">
              <Upload size={18} /> {uploadingEventImages ? 'Đang tải...' : 'Tải ảnh'}
              <input type="file" accept="image/*" multiple hidden disabled={uploadingEventImages || submitting} onChange={e => { uploadImages(e.target.files); e.currentTarget.value = ''; }} />
            </label>
            <span>{form.imageUrls.length}/10 ảnh</span>
          </div>

          {form.imageUrls.length > 0 ? (
            <div className="event-image-grid">
              {form.imageUrls.map(url => (
                <div className={form.thumbnailUrl === url ? 'event-image selected' : 'event-image'} key={url}>
                  <img src={url} alt="Event" />
                  <button type="button" className="image-select" onClick={() => setForm({ ...form, thumbnailUrl: url })}>
                    <ImageIcon size={14} /> Thumbnail
                  </button>
                  <button type="button" className="image-remove" onClick={() => removeImage(url)} aria-label="Xóa ảnh"><X size={14} /></button>
                </div>
              ))}
            </div>
          ) : <p className="muted">Chưa có ảnh. Tải ảnh và chọn thumbnail để có thể xuất bản.</p>}

          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={resetForm}>Làm mới</button>
            <button type="submit" className="primary-button" disabled={submitting || uploadingDescriptionImage}>
              {submitting ? 'Đang lưu...' : uploadingDescriptionImage ? 'Đang tải ảnh...' : 'Lưu sự kiện'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


function DashboardView({ data, range, onRangeChange }: { 
  data: DashboardData | null; 
  range: { start: string; end: string };
  onRangeChange: (range: { start: string; end: string }) => void;
}) {
  const lineRef = useRef<HTMLCanvasElement>(null);
  const pieRef = useRef<HTMLCanvasElement>(null);

  const setQuickRange = (days: number) => {
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - (days - 1) * 86400000).toISOString().split('T')[0];
    onRangeChange({ start, end });
  };

  const getRangeLabel = () => {
    if (!range.start || !range.end) return '14 ngày gần nhất';
    const s = new Date(range.start);
    const e = new Date(range.end);
    const diff = Math.ceil(Math.abs(e.getTime() - s.getTime()) / 86400000) + 1;
    if (diff === 7) return '7 ngày qua';
    if (diff === 30) return '30 ngày qua';
    return `${s.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${e.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
  };

  useEffect(() => {
    if (!data || !lineRef.current) return;
    const canvas = lineRef.current;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width, h = rect.height;
    const pad = { top: 30, right: 20, bottom: 46, left: 48 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;
    const points = data.dailyAttempts;
    const maxVal = Math.max(...points.map(p => p.count), 1);
    const yTicks = 5;

    ctx.clearRect(0, 0, w, h);

    // Grid lines and Y labels
    ctx.strokeStyle = '#edf0f6';
    ctx.fillStyle = '#8d93a5';
    ctx.font = '12px Inter, system-ui';
    ctx.textAlign = 'right';
    for (let i = 0; i <= yTicks; i++) {
      const y = pad.top + ch - (i / yTicks) * ch;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
      ctx.fillText(String(Math.round((maxVal * i) / yTicks)), pad.left - 10, y + 4);
    }

    // X labels
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8d93a5';
    const labelStep = Math.max(1, Math.ceil(points.length / 10));
    points.forEach((p, i) => {
      if (i % labelStep === 0 || i === points.length - 1) {
        const x = pad.left + (i / (points.length - 1 || 1)) * cw;
        const label = p.date.slice(5); // MM-DD
        ctx.fillText(label, x, h - pad.bottom + 22);
      }
    });

    // Gradient fill
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + ch);
    grad.addColorStop(0, 'rgba(0, 82, 204, 0.18)');
    grad.addColorStop(1, 'rgba(0, 82, 204, 0)');
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = pad.left + (i / (points.length - 1 || 1)) * cw;
      const y = pad.top + ch - (p.count / maxVal) * ch;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(pad.left + cw, pad.top + ch);
    ctx.lineTo(pad.left, pad.top + ch);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = '#0052cc';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    points.forEach((p, i) => {
      const x = pad.left + (i / (points.length - 1 || 1)) * cw;
      const y = pad.top + ch - (p.count / maxVal) * ch;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dots
    if (points.length <= 45) {
      points.forEach((p, i) => {
        const x = pad.left + (i / (points.length - 1 || 1)) * cw;
        const y = pad.top + ch - (p.count / maxVal) * ch;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#0052cc';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
  }, [data]);

  useEffect(() => {
    if (!data || !pieRef.current) return;
    const canvas = pieRef.current;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const size = Math.min(rect.width, rect.height);
    const cx = rect.width / 2, cy = rect.height / 2;
    const r = size / 2 - 24;
    const items = data.statusDistribution;
    const total = items.reduce((s, i) => s + i.count, 0) || 1;
    const colors: Record<string, string> = {
      DRAFT: '#8d93a5', PUBLISHED: '#0f9f6e', CLOSED: '#a33500', ARCHIVED: '#7658d8'
    };
    const labels: Record<string, string> = {
      DRAFT: 'Nháp', PUBLISHED: 'Hoạt động', CLOSED: 'Đã đóng', ARCHIVED: 'Lưu trữ'
    };

    ctx.clearRect(0, 0, rect.width, rect.height);
    let angle = -Math.PI / 2;
    items.forEach(item => {
      const sweep = (item.count / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + sweep);
      ctx.closePath();
      ctx.fillStyle = colors[item.status] || '#ccc';
      ctx.fill();
      angle += sweep;
    });

    // Inner circle (donut)
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.58, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Center text
    ctx.fillStyle = '#191b23';
    ctx.font = 'bold 28px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(String(total), cx, cy + 4);
    ctx.font = '12px Inter, system-ui';
    ctx.fillStyle = '#8d93a5';
    ctx.fillText('bộ câu hỏi', cx, cy + 22);

    // Legend
    const legendY = rect.height - 20;
    const legendW = items.length * 110;
    let lx = (rect.width - legendW) / 2;
    ctx.font = '13px Inter, system-ui';
    items.forEach(item => {
      ctx.fillStyle = colors[item.status] || '#ccc';
      ctx.beginPath();
      ctx.arc(lx + 6, legendY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#606575';
      ctx.textAlign = 'left';
      ctx.fillText(`${labels[item.status] || item.status} (${item.count})`, lx + 16, legendY + 4);
      lx += 110;
    });
  }, [data]);

  if (!data) {
    return <div className="empty-state"><RefreshCw size={28} /><h3>Đang tải dữ liệu...</h3><p>Vui lòng đợi trong giây lát.</p></div>;
  }

  const { summary, topUsers, recentAttempts } = data;
  const summaryCards = [
    { label: 'Người dùng', value: summary.totalUsers, icon: Users, accent: 'blue' },
    { label: 'Chủ đề', value: summary.totalTopics, icon: BookOpen, accent: 'purple' },
    { label: 'Bộ câu hỏi', value: summary.totalSets, icon: FileQuestion, accent: 'green' },
    { label: 'Lượt thi', value: summary.totalAttempts, icon: TrendingUp, accent: 'orange' }
  ];

  return (
    <div className="dashboard-layout">
      <div className="dashboard-toolbar">
        <div className="range-presets">
          <button className="text-button compact" onClick={() => setQuickRange(7)}>7 ngày</button>
          <button className="text-button compact" onClick={() => setQuickRange(30)}>30 ngày</button>
          <button className="text-button compact" onClick={() => onRangeChange({ start: '', end: '' })}>Tất cả</button>
        </div>
        <div className="range-inputs">
          <input type="date" value={range.start} onChange={e => onRangeChange({ ...range, start: e.target.value })} />
          <span>-</span>
          <input type="date" value={range.end} onChange={e => onRangeChange({ ...range, end: e.target.value })} />
        </div>
      </div>

      <div className="stats-grid">
        {summaryCards.map(c => <StatCard key={c.label} label={c.label} value={c.value.toLocaleString('vi-VN')} icon={c.icon} accent={c.accent} />)}
      </div>

      <div className="dashboard-charts">
        <section className="glass-card chart-card">
          <div className="section-heading tight">
            <div><p className="eyebrow">{getRangeLabel()}</p><h2>Lượt thi theo ngày</h2></div>
            <TrendingUp size={22} style={{ color: 'var(--primary)', opacity: 0.6 }} />
          </div>
          <canvas ref={lineRef} style={{ width: '100%', height: '260px' }} />
        </section>

        <section className="glass-card chart-card">
          <div className="section-heading tight">
            <div><p className="eyebrow">Phân bổ nội dung</p><h2>Trạng thái bộ câu hỏi</h2></div>
          </div>
          <canvas ref={pieRef} style={{ width: '100%', height: '260px' }} />
        </section>
      </div>

      <div className="dashboard-bottom">
        <section className="glass-card table-card">
          <div className="section-heading tight">
            <div><p className="eyebrow">Bảng xếp hạng</p><h2>Top 10 người dùng</h2></div>
            <Award size={22} style={{ color: 'var(--purple)', opacity: 0.7 }} />
          </div>
          {topUsers.length > 0 ? (
            <div className="rank-list">
              {topUsers.map((u, i) => (
                <div className="rank-row" key={u.userId}>
                  <span className={`rank-badge rank-${i < 3 ? i + 1 : 'default'}`}>{i + 1}</span>
                  <div className="rank-info">
                    <strong>{u.displayName}</strong>
                    <span>{u.attemptCount} lượt thi</span>
                  </div>
                  <strong className="rank-score">{u.totalScore.toLocaleString('vi-VN')}</strong>
                </div>
              ))}
            </div>
          ) : <p className="muted" style={{ padding: '16px 0' }}>Chưa có dữ liệu người dùng.</p>}
        </section>

        <section className="glass-card table-card">
          <div className="section-heading tight">
            <div><p className="eyebrow">Dòng thời gian</p><h2>Hoạt động gần đây</h2></div>
            <Clock size={22} style={{ color: 'var(--green)', opacity: 0.7 }} />
          </div>
          {recentAttempts.length > 0 ? (
            <div className="activity-list">
              {recentAttempts.map(a => (
                <div className="activity-row" key={a.id}>
                  <div className="activity-avatar">{a.user.displayName.charAt(0).toUpperCase()}</div>
                  <div className="activity-info">
                    <strong>{a.user.displayName}</strong>
                    <span>{a.quizSet.title}</span>
                  </div>
                  <div className="activity-meta">
                    <strong>{a.score}/{a.maxScore}</strong>
                    <span>{formatSeconds(a.timeTaken)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="muted" style={{ padding: '16px 0' }}>Chưa có hoạt động nào.</p>}
        </section>
      </div>
    </div>
  );
}

function AdminManagementView({ currentUser, showMessage }: { currentUser: AdminUser; showMessage: (text: string, tone?: 'info' | 'error') => void }) {
  const [tab, setTab] = useState<'accounts' | 'audit'>('accounts');
  const [accounts, setAccounts] = useState<ManagedAdmin[]>([]);
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [form, setForm] = useState({ displayName: '', email: '', role: 'ADMIN' as 'ADMIN' | 'SUPER_ADMIN' });

  const loadAccounts = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (role !== 'ALL') params.set('role', role);
    if (status !== 'ALL') params.set('status', status);
    const data = await api<{ items: ManagedAdmin[] }>(`/api/admin/accounts?${params}`);
    setAccounts(data.items);
  }, [role, search, status]);
  const loadLogs = useCallback(async () => {
    const data = await api<{ items: AdminAuditLog[] }>('/api/admin/audit-logs?limit=50');
    setLogs(data.items);
  }, []);
  useEffect(() => { (tab === 'accounts' ? loadAccounts() : loadLogs()).catch(err => showMessage(err.message, 'error')); }, [tab, loadAccounts, loadLogs, showMessage]);

  const run = async (fn: () => Promise<unknown>, message: string) => {
    try { await fn(); await loadAccounts(); showMessage(message); } catch (err) { showMessage(err instanceof Error ? err.message : 'Thao tác thất bại', 'error'); }
  };
  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const data = await api<{ temporaryPassword: string }>('/api/admin/accounts', { method: 'POST', body: JSON.stringify(form) });
      setTemporaryPassword(data.temporaryPassword);
      setForm({ displayName: '', email: '', role: 'ADMIN' });
      await loadAccounts();
    } catch (err) { showMessage(err instanceof Error ? err.message : 'Không thể tạo tài khoản', 'error'); }
  };
  const edit = async (account: ManagedAdmin) => {
    const displayName = window.prompt('Tên hiển thị', account.displayName);
    if (displayName === null) return;
    const email = window.prompt('Email', account.email);
    if (email === null) return;
    const nextRole = window.prompt('Role: ADMIN hoặc SUPER_ADMIN', account.role);
    if (nextRole !== 'ADMIN' && nextRole !== 'SUPER_ADMIN') return showMessage('Role không hợp lệ', 'error');
    await run(() => api(`/api/admin/accounts/${account.id}`, { method: 'PATCH', body: JSON.stringify({ displayName, email, role: nextRole }) }), 'Đã cập nhật tài khoản');
  };
  const resetPassword = async (account: ManagedAdmin) => {
    try {
      const data = await api<{ temporaryPassword: string }>(`/api/admin/accounts/${account.id}/reset-password`, { method: 'POST' });
      setTemporaryPassword(data.temporaryPassword);
      await loadAccounts();
    } catch (err) { showMessage(err instanceof Error ? err.message : 'Không thể reset mật khẩu', 'error'); }
  };

  return (
    <div className="event-management-layout">
      <div className="toolbar glass-card">
        <button className={tab === 'accounts' ? 'primary-button compact' : 'secondary-button compact'} onClick={() => setTab('accounts')}>Tài khoản</button>
        <button className={tab === 'audit' ? 'primary-button compact' : 'secondary-button compact'} onClick={() => setTab('audit')}>Nhật ký hoạt động</button>
      </div>
      {temporaryPassword && <section className="notice info"><span>Mật khẩu tạm thời, chỉ hiển thị lần này: <strong>{temporaryPassword}</strong></span><button onClick={() => setTemporaryPassword('')}>Đóng</button></section>}
      {tab === 'accounts' ? <>
        <form className="glass-card form-card admin-create-form" onSubmit={create}>
          <div className="section-heading tight"><div><p className="eyebrow">SUPER_ADMIN</p><h2>Tạo tài khoản quản trị</h2></div></div>
          <input required placeholder="Tên hiển thị" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} />
          <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <Select value={form.role} onChange={value => setForm({ ...form, role: value as 'ADMIN' | 'SUPER_ADMIN' })} ariaLabel="Vai trò"><option value="ADMIN">ADMIN</option><option value="SUPER_ADMIN">SUPER_ADMIN</option></Select>
          <button className="primary-button" type="submit"><Plus size={18} /> Tạo tài khoản</button>
        </form>
        <section className="glass-card table-card">
          <div className="toolbar">
            <div className="search-box"><Search size={18} /><input placeholder="Tìm tên hoặc email" value={search} onChange={e => setSearch(e.target.value)} /></div>
            <Select value={role} onChange={setRole} ariaLabel="Lọc role"><option value="ALL">Mọi role</option><option value="ADMIN">ADMIN</option><option value="SUPER_ADMIN">SUPER_ADMIN</option></Select>
            <Select value={status} onChange={setStatus} ariaLabel="Lọc trạng thái"><option value="ALL">Mọi trạng thái</option><option value="ACTIVE">ACTIVE</option><option value="DISABLED">DISABLED</option></Select>
          </div>
          <div className="admin-account-list">
            {accounts.map(account => <div className="admin-account-row" key={account.id}>
              <div className="question-cell"><strong>{account.displayName}</strong><small>{account.email}</small></div>
              <span className="chip">{account.role}</span>
              <span className={`status-badge ${account.status === 'ACTIVE' ? 'status-published' : 'status-closed'}`}>{account.status}</span>
              <small>{account.lastLoginAt ? formatDateTime(account.lastLoginAt) : 'Chưa đăng nhập'}</small>
              <div className="row-actions">
                <button className="icon-button" title="Sửa" onClick={() => edit(account)}><Edit size={16} /></button>
                <button className="secondary-button compact" onClick={() => resetPassword(account)}>Reset mật khẩu</button>
                <button disabled={account.id === currentUser.id} className="secondary-button compact" onClick={() => run(() => api(`/api/admin/accounts/${account.id}/${account.status === 'ACTIVE' ? 'disable' : 'enable'}`, { method: 'POST' }), account.status === 'ACTIVE' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản')}>{account.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}</button>
              </div>
            </div>)}
          </div>
        </section>
      </> : <section className="glass-card table-card">
        <div className="section-heading tight"><div><p className="eyebrow">Audit</p><h2>Hoạt động gần đây</h2></div></div>
        <div className="admin-audit-list">{logs.map(log => <div className="admin-audit-row" key={log.id}><div><strong>{log.action}</strong><small>{log.entityType}{log.entityId ? ` · ${log.entityId}` : ''}</small></div><div><strong>{log.actor.displayName}</strong><small>{log.actor.email}</small></div><span>{formatDateTime(log.createdAt)}</span></div>)}</div>
      </section>}
    </div>
  );
}

function ComingSoonView({ view }: { view: ViewMode }) {
  const titles: Record<string, string> = {
    news: 'Tin tức & Sự kiện',
    procedures: 'Thủ tục hành chính',
    users: 'Quản lý người dùng',
    settings: 'Cài đặt hệ thống'
  };
  
  return (
    <div className="coming-soon-container">
      <div className="glass-card coming-soon-card">
        <div className="coming-soon-icon">
          <div className="icon-pulse"></div>
          <Clock size={48} className="icon-main" />
        </div>
        <h2>{titles[view] || 'Đang phát triển'}</h2>
        <p>Tính năng này hiện đang trong giai đoạn phát triển.</p>
        <div className="progress-bar-container">
          <div className="progress-bar-fill"></div>
        </div>
        <div className="coming-soon-badge">Coming Soon</div>
      </div>
    </div>
  );
}

function UserGuideView() {
  return (
    <div className="guide-layout">
      <section className="glass-card guide-section hero-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Luồng nghiệp vụ</p>
            <h2>Quy trình quản lý nội dung</h2>
          </div>
          <div className="guide-icon-badge"><HelpCircle size={28} /></div>
        </div>
        <div className="guide-content">
          <p className="guide-intro">
            Hệ thống được thiết kế theo cấu trúc phân cấp 3 lớp để tối ưu hóa việc quản lý và tổ chức dữ liệu bài thi.
          </p>
          <div className="guide-steps">
            <div className="step">
              <span className="step-number">1</span>
              <div className="step-body">
                <strong>Chủ đề (Topic)</strong>
                <p>Danh mục cấp cao nhất để phân loại bài thi.</p>
              </div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <span className="step-number">2</span>
              <div className="step-body">
                <strong>Bộ câu hỏi (Quiz Set)</strong>
                <p>Các bài thi cụ thể nằm trong chủ đề.</p>
              </div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <span className="step-number">3</span>
              <div className="step-body">
                <strong>Câu hỏi (Question)</strong>
                <p>Nội dung chi tiết của từng bài thi.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="guide-grid">
        <section className="glass-card guide-section">
          <div className="card-header">
            <div className="card-icon blue"><Plus size={20} /></div>
            <h3>Thêm mới dữ liệu</h3>
          </div>
          <div className="guide-list">
            <div className="list-item">
              <span className="item-label">Chủ đề</span>
              <span className="item-desc">Nhấn dấu cộng <Plus size={13} className="inline-icon" /> tại cột "Chủ đề" bên phải màn hình.</span>
            </div>
            <div className="list-item">
              <span className="item-label">Bộ câu hỏi</span>
              <span className="item-desc">Nhấn dấu cộng <Plus size={13} className="inline-icon" /> tại cột "Thiết lập nhanh" bên phải.</span>
            </div>
            <div className="list-item">
              <span className="item-label">Câu hỏi</span>
              <span className="item-desc">Chọn bộ câu hỏi, sau đó nhấn "Thêm câu hỏi" ở góc trên bên phải.</span>
            </div>
          </div>
        </section>

        <section className="glass-card guide-section">
          <div className="card-header">
            <div className="card-icon purple"><Edit size={20} /></div>
            <h3>Chỉnh sửa & Lưu</h3>
          </div>
          <div className="guide-list">
            <div className="list-item">
              <span className="item-label">Chỉnh sửa</span>
              <span className="item-desc">Sử dụng icon cây bút <Edit size={13} className="inline-icon" /> cạnh mỗi mục để thay đổi.</span>
            </div>
            <div className="list-item">
              <span className="item-label">Lưu dữ liệu</span>
              <span className="item-desc">Tại trình soạn thảo, nhấn "Lưu tất cả thay đổi" để cập nhật hệ thống.</span>
            </div>
          </div>
        </section>

        <section className="glass-card guide-section">
          <div className="card-header">
            <div className="card-icon green"><CheckCircle size={20} /></div>
            <h3>Xuất bản & Trạng thái</h3>
          </div>
          <div className="guide-list">
            <div className="list-item">
              <span className="item-label">Nháp</span>
              <span className="item-desc">Trạng thái mặc định, người dùng chưa thể thấy nội dung.</span>
            </div>
            <div className="list-item">
              <span className="item-label">Hoạt động</span>
              <span className="item-desc">Nhấn "Xuất bản" để bài thi hiển thị trên ứng dụng Zalo Mini App.</span>
            </div>
            <div className="list-item">
              <span className="item-label">Đã đóng</span>
              <span className="item-desc">Dừng bài thi tạm thời, không cho phép người dùng tham gia mới.</span>
            </div>
          </div>
        </section>

        <section className="glass-card guide-section">
          <div className="card-header">
            <div className="card-icon orange"><Trash2 size={20} /></div>
            <h3>Lưu trữ & Xoá</h3>
          </div>
          <div className="guide-list">
            <div className="list-item">
              <span className="item-label">Lưu trữ</span>
              <span className="item-desc">Nhấn icon <Trash2 size={13} className="inline-icon" /> để ẩn nội dung khỏi danh sách chính.</span>
            </div>
            <div className="list-item">
              <span className="item-label">Lưu ý</span>
              <span className="item-desc">Hệ thống sử dụng cơ chế xoá mềm, có thể khôi phục lại khi cần.</span>
            </div>
          </div>
        </section>
      </div>
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

function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = ''
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (!isOpen) return null;
  const contentClassName = className ? `modal-content ${className}` : 'modal-content';
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={contentClassName}>
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

