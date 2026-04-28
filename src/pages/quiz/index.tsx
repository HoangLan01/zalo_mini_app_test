import React from 'react';
import { Page, Box, Text, Icon, Button, useNavigate } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';
import { useQuizStore } from '@/store/quizStore';

const QuizIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const quizzes = useQuizStore(state => state.quizzes);
  const getAttempt = useQuizStore(state => state.getAttempt);

  return (
    <Page className="page" style={{ backgroundColor: '#F5F5F5', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Khảo sát Kiến thức" />
      
      <Box style={{ padding: '20px', backgroundColor: '#0068FF' }}>
        <Text style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
          Đánh giá Năng lực Số
        </Text>
        <Text style={{ color: '#FFFFFF', fontSize: '14px', opacity: 0.9 }}>
          Tham gia các bài kiểm tra trắc nghiệm để củng cố kiến thức chuyển đổi số và đua top bảng xếp hạng cùng mọi người.
        </Text>
      </Box>

      <Box style={{ flex: 1, overflow: 'auto', padding: '16px', paddingBottom: '80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {quizzes.map(quiz => {
            const attempt = getAttempt(quiz.id);
            const isClosed = quiz.status === 'closed';

            return (
              <div 
                key={quiz.id}
                style={{ 
                  backgroundColor: '#FFFFFF', 
                  borderRadius: '12px', 
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  borderLeft: attempt ? '4px solid #10B981' : isClosed ? '4px solid #9CA3AF' : '4px solid #0068FF'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <Text style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', flex: 1 }}>
                    {quiz.title}
                  </Text>
                  {attempt && (
                    <div style={{ backgroundColor: '#D1FAE5', padding: '4px 8px', borderRadius: '4px', marginLeft: '8px' }}>
                      <Text style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>{attempt.score} điểm</Text>
                    </div>
                  )}
                </div>
                
                <Text style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                  {quiz.description}
                </Text>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Icon icon="zi-clock-1" size={16} style={{ color: '#888' }} />
                    <Text style={{ fontSize: '13px', color: '#555' }}>{quiz.timeLimit / 60} phút</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Icon icon="zi-list-1" size={16} style={{ color: '#888' }} />
                    <Text style={{ fontSize: '13px', color: '#555' }}>{quiz.questions.length} câu</Text>
                  </div>
                </div>

                {isClosed ? (
                  <Button fullWidth disabled style={{ backgroundColor: '#E5E7EB', color: '#9CA3AF' }}>
                    Đã đóng
                  </Button>
                ) : attempt ? (
                  <Button 
                    fullWidth 
                    variant="secondary"
                    onClick={() => navigate('/quiz-result', { state: { quizId: quiz.id } })}
                  >
                    Xem kết quả & Xếp hạng
                  </Button>
                ) : (
                  <Button 
                    fullWidth 
                    style={{ backgroundColor: '#0068FF' }}
                    onClick={() => navigate('/quiz-take', { state: { quizId: quiz.id } })}
                  >
                    Bắt đầu làm bài
                  </Button>
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
