import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'quiz_admin_token';

type ApiResponse<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } };
type Topic = { id: string; title: string; slug: string; description?: string; order: number; isActive: boolean; _count?: { sets: number } };
type QuizSet = { id: string; topicId: string; title: string; description?: string; timeLimit: number; status: string; version: number; order: number; topic?: Topic; _count?: { questions: number; attempts: number } };
type Option = { id?: string; content: string; order?: number; isCorrect: boolean };
type Question = { id: string; quizSetId: string; content: string; type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE'; points: number; order: number; explanation?: string; options: Option[] };
type Stats = { attemptCount: number; averageScore: number; averageTimeTaken: number; leaderboard: Array<{ id: string; score: number; maxScore: number; timeTaken: number; user: { displayName: string } }> };

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
  const json = await res.json() as ApiResponse<T>;
  if (!res.ok || !json.success) {
    throw new Error(json.success ? `HTTP ${res.status}` : json.error.message);
  }
  return json.data;
}

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
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="login-shell">
      <form className="login-card" onSubmit={submit}>
        <h1>Quản trị Kiến thức CĐS</h1>
        <label>Email<input value={email} onChange={event => setEmail(event.target.value)} type="email" /></label>
        <label>Mật khẩu<input value={password} onChange={event => setPassword(event.target.value)} type="password" /></label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Đăng nhập</button>
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
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sets, setSets] = useState<QuizSet[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedSetId, setSelectedSetId] = useState('');
  const [message, setMessage] = useState('');
  const [topicForm, setTopicForm] = useState({ title: '', description: '', order: 0 });
  const [setForm, setSetForm] = useState({ title: '', description: '', timeLimit: 300, order: 0 });
  const [questionForm, setQuestionForm] = useState({
    content: '',
    points: 10,
    order: 0,
    options: [
      { content: '', isCorrect: true },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false }
    ] as Option[]
  });
  const [stats, setStats] = useState<Stats | null>(null);

  const selectedSet = useMemo(() => sets.find(item => item.id === selectedSetId), [sets, selectedSetId]);

  const loadTopics = async () => setTopics(await api<Topic[]>('/api/admin/quiz/topics'));
  const loadSets = async (topicId = selectedTopicId) => {
    const query = topicId ? `?topicId=${topicId}` : '';
    const data = await api<QuizSet[]>(`/api/admin/quiz/sets${query}`);
    setSets(data);
  };
  const loadQuestions = async (setId = selectedSetId) => {
    if (!setId) return setQuestions([]);
    setQuestions(await api<Question[]>(`/api/admin/quiz/questions?quizSetId=${setId}`));
  };
  const loadStats = async (setId = selectedSetId) => {
    if (!setId) return setStats(null);
    setStats(await api<Stats>(`/api/admin/quiz/sets/${setId}/stats`));
  };

  const refreshAll = async () => {
    await loadTopics();
    await loadSets();
    await loadQuestions();
    await loadStats();
  };

  useEffect(() => {
    refreshAll().catch(err => setMessage(err.message));
  }, []);

  useEffect(() => {
    loadSets(selectedTopicId).catch(err => setMessage(err.message));
  }, [selectedTopicId]);

  useEffect(() => {
    loadQuestions(selectedSetId).catch(err => setMessage(err.message));
    loadStats(selectedSetId).catch(err => setMessage(err.message));
  }, [selectedSetId]);

  const createTopic = async (event: React.FormEvent) => {
    event.preventDefault();
    await api('/api/admin/quiz/topics', { method: 'POST', body: JSON.stringify(topicForm) });
    setTopicForm({ title: '', description: '', order: 0 });
    await refreshAll();
  };

  const createSet = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedTopicId) return setMessage('Chọn chủ đề trước khi tạo bộ câu hỏi');
    await api('/api/admin/quiz/sets', { method: 'POST', body: JSON.stringify({ ...setForm, topicId: selectedTopicId }) });
    setSetForm({ title: '', description: '', timeLimit: 300, order: 0 });
    await loadSets();
  };

  const createQuestion = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedSetId) return setMessage('Chọn bộ câu hỏi trước');
    await api('/api/admin/quiz/questions', {
      method: 'POST',
      body: JSON.stringify({ ...questionForm, quizSetId: selectedSetId, type: 'MULTIPLE_CHOICE' })
    });
    setQuestionForm({
      content: '',
      points: 10,
      order: questions.length + 1,
      options: [
        { content: '', isCorrect: true },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false }
      ]
    });
    await loadQuestions();
  };

  const action = async (fn: () => Promise<unknown>) => {
    setMessage('');
    try {
      await fn();
      await refreshAll();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const editTopic = (topic: Topic) => action(async () => {
    const title = window.prompt('Tên chủ đề', topic.title);
    if (!title) return;
    const description = window.prompt('Mô tả chủ đề', topic.description || '') || '';
    await api(`/api/admin/quiz/topics/${topic.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title, description })
    });
  });

  const editSet = (set: QuizSet) => action(async () => {
    const title = window.prompt('Tiêu đề bộ câu hỏi', set.title);
    if (!title) return;
    const description = window.prompt('Mô tả bộ câu hỏi', set.description || '') || '';
    const timeLimit = Number(window.prompt('Thời gian làm bài (giây)', String(set.timeLimit)) || set.timeLimit);
    await api(`/api/admin/quiz/sets/${set.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title, description, timeLimit })
    });
  });

  const editQuestion = (question: Question) => action(async () => {
    const content = window.prompt('Nội dung câu hỏi', question.content);
    if (!content) return;
    const options = question.options.map((option, index) => ({
      content: window.prompt(`Đáp án ${index + 1}`, option.content) || option.content,
      order: index,
      isCorrect: option.isCorrect
    }));
    const correctIndex = Number(window.prompt('Đáp án đúng là số thứ tự nào?', String(Math.max(1, question.options.findIndex(option => option.isCorrect) + 1))) || 1) - 1;
    await api(`/api/admin/quiz/questions/${question.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        content,
        points: question.points,
        options: options.map((option, index) => ({ ...option, isCorrect: index === correctIndex }))
      })
    });
  });

  return (
    <main>
      <header className="topbar">
        <div>
          <h1>Quản trị Kiến thức CĐS</h1>
          <p>Quản lý chủ đề, bộ câu hỏi, đáp án và thống kê xếp hạng.</p>
        </div>
        <button className="secondary" onClick={onLogout}>Đăng xuất</button>
      </header>

      {message && <div className="notice">{message}</div>}

      <section className="grid">
        <div className="panel">
          <h2>Chủ đề</h2>
          <form onSubmit={createTopic} className="form">
            <label>Tên chủ đề
              <input placeholder="Tên chủ đề" value={topicForm.title} onChange={e => setTopicForm({ ...topicForm, title: e.target.value })} />
            </label>
            <label>Mô tả
              <textarea placeholder="Mô tả" value={topicForm.description} onChange={e => setTopicForm({ ...topicForm, description: e.target.value })} />
            </label>
            <label>Thứ tự
              <input type="number" placeholder="Thứ tự" value={topicForm.order} onChange={e => setTopicForm({ ...topicForm, order: Number(e.target.value) })} />
            </label>
            <button>Thêm chủ đề</button>
          </form>
          <div className="list">
            {topics.map(topic => (
              <button key={topic.id} className={topic.id === selectedTopicId ? 'row selected' : 'row'} onClick={() => setSelectedTopicId(topic.id)}>
                <span>{topic.title}</span>
                <small>{topic._count?.sets || 0} bộ</small>
                <span className="link neutral" onClick={event => { event.stopPropagation(); editTopic(topic); }}>Sửa</span>
                <span className="link" onClick={event => { event.stopPropagation(); action(() => api(`/api/admin/quiz/topics/${topic.id}`, { method: 'DELETE' })); }}>Lưu trữ</span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>Bộ câu hỏi</h2>
          <form onSubmit={createSet} className="form">
            <label>Tiêu đề bộ câu hỏi
              <input placeholder="Tiêu đề bộ câu hỏi" value={setForm.title} onChange={e => setSetForm({ ...setForm, title: e.target.value })} />
            </label>
            <label>Mô tả
              <textarea placeholder="Mô tả" value={setForm.description} onChange={e => setSetForm({ ...setForm, description: e.target.value })} />
            </label>
            <label>Thời gian làm bài (giây)
              <input type="number" value={setForm.timeLimit} onChange={e => setSetForm({ ...setForm, timeLimit: Number(e.target.value) })} />
            </label>
            <button>Thêm bộ câu hỏi</button>
          </form>
          <div className="list">
            {sets.map(set => (
              <button key={set.id} className={set.id === selectedSetId ? 'row selected' : 'row'} onClick={() => setSelectedSetId(set.id)}>
                <span>{set.title}</span>
                <small>{set.status} - {set._count?.questions || 0} câu</small>
                <span className="link neutral" onClick={event => { event.stopPropagation(); editSet(set); }}>Sửa</span>
              </button>
            ))}
          </div>
          {selectedSet && (
            <div className="actions">
              <button onClick={() => action(() => api(`/api/admin/quiz/sets/${selectedSet.id}/publish`, { method: 'POST' }))}>Xuất bản</button>
              <button className="secondary" onClick={() => action(() => api(`/api/admin/quiz/sets/${selectedSet.id}/close`, { method: 'POST' }))}>Đóng</button>
              <button className="secondary" onClick={() => action(() => api(`/api/admin/quiz/sets/${selectedSet.id}/clone`, { method: 'POST' }))}>Tạo bản mới</button>
              <button className="danger" onClick={() => action(() => api(`/api/admin/quiz/sets/${selectedSet.id}`, { method: 'DELETE' }))}>Lưu trữ</button>
            </div>
          )}
        </div>

        <div className="panel wide">
          <h2>Câu hỏi và đáp án</h2>
          <form onSubmit={createQuestion} className="question-form">
            <label>Nội dung câu hỏi
              <textarea placeholder="Nội dung câu hỏi" value={questionForm.content} onChange={e => setQuestionForm({ ...questionForm, content: e.target.value })} />
            </label>
            <label>Điểm số
              <input type="number" value={questionForm.points} onChange={e => setQuestionForm({ ...questionForm, points: Number(e.target.value) })} />
            </label>
            <div className="options">
              {questionForm.options.map((option, index) => (
                <label key={index} className="option-line">
                  <input type="radio" checked={option.isCorrect} onChange={() => setQuestionForm({
                    ...questionForm,
                    options: questionForm.options.map((item, itemIndex) => ({ ...item, isCorrect: itemIndex === index }))
                  })} />
                  <input placeholder={`Đáp án ${index + 1}`} value={option.content} onChange={e => setQuestionForm({
                    ...questionForm,
                    options: questionForm.options.map((item, itemIndex) => itemIndex === index ? { ...item, content: e.target.value } : item)
                  })} />
                </label>
              ))}
            </div>
            <button>Thêm câu hỏi</button>
          </form>

          <div className="question-list">
            {questions.map(question => (
              <article key={question.id}>
                <div className="question-head">
                  <strong>{question.order}. {question.content}</strong>
                  <div className="inline-actions">
                    <button className="secondary small" onClick={() => editQuestion(question)}>Sửa</button>
                    <button className="danger small" onClick={() => action(() => api(`/api/admin/quiz/questions/${question.id}`, { method: 'DELETE' }))}>Lưu trữ</button>
                  </div>
                </div>
                {question.options.map(option => (
                  <p key={option.id} className={option.isCorrect ? 'correct' : ''}>{option.isCorrect ? '✓ ' : ''}{option.content}</p>
                ))}
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>Thống kê</h2>
          {stats ? (
            <>
              <div className="stat"><span>Lượt làm</span><strong>{stats.attemptCount}</strong></div>
              <div className="stat"><span>Điểm TB</span><strong>{stats.averageScore.toFixed(1)}</strong></div>
              <div className="stat"><span>Thời gian TB</span><strong>{Math.round(stats.averageTimeTaken)} giây</strong></div>
              <h3>Top người dùng</h3>
              {stats.leaderboard.map((item, index) => (
                <div key={item.id} className="rank"><span>#{index + 1} {item.user.displayName}</span><strong>{item.score}/{item.maxScore}</strong></div>
              ))}
            </>
          ) : <p>Chọn bộ câu hỏi để xem thống kê.</p>}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
