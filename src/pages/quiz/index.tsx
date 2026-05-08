import React from 'react';
import { Page, Box, Text, Button, useNavigate } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';
import { useQuizStore } from '@/store/quizStore';

const QuizIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const quizzes = useQuizStore(state => state.quizzes);
  const getAttempt = useQuizStore(state => state.getAttempt);

  return (
    <Page className="page" style={{ backgroundColor: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Khảo sát Kiến thức" />
      
      {/* Hero Banner */}
      <div className="animate-fade-in-up" style={{
        margin: '0',
        padding: '24px 20px',
        background: 'var(--gradient-hero)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Pattern overlay */}
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: '120px', opacity: 0.1,
          background: 'radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Text style={{ fontSize: '24px' }}>🧠</Text>
            <Text style={{ color: '#fff', fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Đánh giá Năng lực Số
            </Text>
          </div>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', lineHeight: '1.5', maxWidth: '280px' }}>
            Tham gia trắc nghiệm để củng cố kiến thức chuyển đổi số và đua top bảng xếp hạng!
          </Text>
        </div>
      </div>

      <Box style={{ flex: 1, overflow: 'auto', padding: '16px', paddingBottom: '160px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {quizzes.map((quiz, idx) => {
            const attempt = getAttempt(quiz.id);
            const isClosed = quiz.status === 'closed';
            
            const borderColor = attempt ? 'var(--success)' : isClosed ? 'var(--text-muted)' : 'var(--primary)';
            const statusGradient = attempt
              ? 'var(--gradient-green)'
              : isClosed
                ? 'linear-gradient(135deg, #9CA3AF, #6B7280)'
                : 'var(--gradient-hero)';

            return (
              <div
                key={quiz.id}
                className={`card-elevated animate-fade-in-up delay-${Math.min((idx + 1) * 100, 400)}`}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  borderLeft: `4px solid ${borderColor}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <Text style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', flex: 1, letterSpacing: '-0.01em' }}>
                    {quiz.title}
                  </Text>
                  {attempt && (
                    <div className="badge badge-success" style={{ marginLeft: '8px' }}>
                      🏆 {attempt.score} điểm
                    </div>
                  )}
                  {isClosed && !attempt && (
                    <div className="badge" style={{ background: 'hsl(220,10%,92%)', color: 'var(--text-muted)', marginLeft: '8px' }}>
                      Đã đóng
                    </div>
                  )}
                </div>
                
                <Text style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.5' }}>
                  {quiz.description}
                </Text>

                {/* Meta info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <Text style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{quiz.timeLimit / 60} phút</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                    <Text style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{quiz.questions.length} câu</Text>
                  </div>
                </div>

                {isClosed ? (
                  <button disabled style={{
                    width: '100%', padding: '11px',
                    background: 'hsl(220,10%,94%)', color: 'var(--text-muted)',
                    border: 'none', borderRadius: 'var(--radius-md)',
                    fontWeight: 600, fontSize: '14px'
                  }}>
                    Đã đóng
                  </button>
                ) : attempt ? (
                  <button
                    onClick={() => navigate('/quiz-result', { state: { quizId: quiz.id } })}
                    style={{
                      width: '100%', padding: '11px',
                      background: 'var(--success-light)', color: 'var(--success)',
                      border: `1.5px solid var(--success)`,
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 600, fontSize: '14px', cursor: 'pointer'
                    }}
                  >
                    Xem kết quả & Xếp hạng
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/quiz-take', { state: { quizId: quiz.id } })}
                    className="btn-gradient ripple-container"
                    style={{
                      width: '100%', padding: '11px',
                      border: 'none', borderRadius: 'var(--radius-md)',
                      fontWeight: 600, fontSize: '14px', cursor: 'pointer'
                    }}
                  >
                    🚀 Bắt đầu làm bài
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Box>
    </Page>
  );
};

export default QuizIndexPage;
