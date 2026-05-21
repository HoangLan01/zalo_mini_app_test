import React, { useEffect, useState } from 'react';
import { Page, Box, Text, useNavigate } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';
import { QuizTopic, useQuizStore } from '@/store/quizStore';

const QuizIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<QuizTopic | null>(null);
  const { topics, sets, isLoading, error, fetchTopics, fetchSetsByTopic } = useQuizStore();

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const handleSelectTopic = async (topic: QuizTopic) => {
    setSelectedTopic(topic);
    await fetchSetsByTopic(topic.id);
  };

  return (
    <Page className="page" style={{ backgroundColor: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title={selectedTopic ? selectedTopic.title : 'Kiến thức CĐS'} />

      <div className="animate-fade-in-up" style={{
        padding: '24px 20px',
        background: 'var(--gradient-hero)',
        color: '#fff'
      }}>
        <Text style={{ color: '#fff', fontSize: '18px', fontWeight: 800 }}>
          Đánh giá năng lực số
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.86)', fontSize: '13px', lineHeight: 1.5, marginTop: '8px' }}>
          Chọn chủ đề, tham gia trắc nghiệm và theo dõi xếp hạng theo từng bộ câu hỏi.
        </Text>
      </div>

      <Box style={{ flex: 1, overflow: 'auto', padding: '16px', paddingBottom: '160px' }}>
        {selectedTopic && (
          <button
            onClick={() => setSelectedTopic(null)}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--primary)',
              fontWeight: 700,
              padding: '0 0 12px'
            }}
          >
            ← Tất cả chủ đề
          </button>
        )}

        {isLoading && (
          <Box style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
            <Text>Đang tải...</Text>
          </Box>
        )}

        {error && (
          <div className="card-elevated" style={{ padding: '16px', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        {!isLoading && !selectedTopic && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topics.map((topic) => (
              <button
                key={topic.id}
                className="card-elevated"
                onClick={() => handleSelectTopic(topic)}
                style={{
                  border: 'none',
                  textAlign: 'left',
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  background: '#fff'
                }}
              >
                <Text style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{topic.title}</Text>
                {topic.description && (
                  <Text style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.45 }}>
                    {topic.description}
                  </Text>
                )}
                <Text style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>
                  {topic._count?.sets || 0} bộ câu hỏi
                </Text>
              </button>
            ))}
            {topics.length === 0 && !error && (
              <Text style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '24px' }}>
                Chưa có chủ đề nào được xuất bản.
              </Text>
            )}
          </div>
        )}

        {!isLoading && selectedTopic && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {sets.map((quiz) => {
              const attempt = quiz.attempt;
              const isClosed = quiz.status === 'CLOSED';

              return (
                <div
                  key={quiz.id}
                  className="card-elevated"
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    borderLeft: `4px solid ${attempt ? 'var(--success)' : isClosed ? 'var(--text-muted)' : 'var(--primary)'}`
                  }}
                >
                  <Text style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {quiz.title}
                  </Text>
                  {quiz.description && (
                    <Text style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                      {quiz.description}
                    </Text>
                  )}

                  <div style={{ display: 'flex', gap: '16px', margin: '14px 0' }}>
                    <Text style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {Math.round(quiz.timeLimit / 60)} phút
                    </Text>
                    <Text style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {quiz.questionCount || 0} câu
                    </Text>
                    {attempt && (
                      <Text style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 700 }}>
                        {attempt.score}/{attempt.maxScore} điểm
                      </Text>
                    )}
                  </div>

                  {attempt && attempt.status !== 'IN_PROGRESS' ? (
                    <button
                      onClick={() => navigate('/quiz-result', { state: { setId: quiz.id } })}
                      style={{
                        width: '100%',
                        padding: '11px',
                        background: 'var(--success-light)',
                        color: 'var(--success)',
                        border: '1.5px solid var(--success)',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 700
                      }}
                    >
                      Xem kết quả & xếp hạng
                    </button>
                  ) : isClosed ? (
                    <button disabled style={{
                      width: '100%',
                      padding: '11px',
                      background: 'hsl(220,10%,94%)',
                      color: 'var(--text-muted)',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 700
                    }}>
                      Đã đóng
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/quiz-take', { state: { setId: quiz.id } })}
                      className="btn-gradient ripple-container"
                      style={{
                        width: '100%',
                        padding: '11px',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 700
                      }}
                    >
                      Bắt đầu làm bài
                    </button>
                  )}
                </div>
              );
            })}
            {sets.length === 0 && (
              <Text style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '24px' }}>
                Chủ đề này chưa có bộ câu hỏi đang mở.
              </Text>
            )}
          </div>
        )}
      </Box>
    </Page>
  );
};

export default QuizIndexPage;
