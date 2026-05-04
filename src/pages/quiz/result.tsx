import React, { useMemo } from 'react';
import { Page, Box, Text, Button, Icon, useNavigate } from 'zmp-ui';
import { useLocation } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useQuizStore } from '@/store/quizStore';

const QuizResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const quizId = location.state?.quizId as string;
  
  const getQuizById = useQuizStore(state => state.getQuizById);
  const getAttempt = useQuizStore(state => state.getAttempt);
  
  const quiz = getQuizById(quizId);
  const attempt = getAttempt(quizId);

  if (!quiz || !attempt) {
    return (
      <Page>
        <PageHeader title="Kết quả" />
        <Box style={{ padding: '20px', textAlign: 'center' }}>
          <Text>Không tìm thấy kết quả!</Text>
          <Button onClick={() => navigate('/quiz')} style={{ marginTop: '16px' }}>Quay lại</Button>
        </Box>
      </Page>
    );
  }

  const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);
  const isPerfect = attempt.score === maxScore;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} phút ${s} giây`;
  };

  // Fake leaderboard data mixing current user
  const leaderboard = useMemo(() => {
    const fakeOthers = [
      { id: '1', name: 'Nguyễn Văn A', score: maxScore, timeTaken: 120, isMe: false },
      { id: '2', name: 'Trần Thị B', score: maxScore - 10, timeTaken: 150, isMe: false },
      { id: '3', name: 'Lê Hoàng C', score: maxScore - 20, timeTaken: 200, isMe: false }
    ];
    
    const all = [...fakeOthers, { id: 'me', name: 'Bạn (Hiện tại)', score: attempt.score, timeTaken: attempt.timeTaken, isMe: true }];
    return all.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeTaken - b.timeTaken;
    });
  }, [attempt.score, attempt.timeTaken, maxScore]);

  return (
    <Page className="page" style={{ backgroundColor: '#F5F5F5', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Kết quả bài thi" />
      
      <Box style={{ flex: 1, overflow: 'auto', paddingBottom: '80px' }}>
        {/* Score Banner */}
        <Box style={{ 
          backgroundColor: isPerfect ? '#10B981' : '#246BFD', 
          padding: '32px 20px', 
          color: '#FFF',
          textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px'
          }}>
            <Icon icon={isPerfect ? "zi-star-solid" : "zi-check"} size={40} />
          </div>
          <Text style={{ fontSize: '16px', opacity: 0.9 }}>Điểm số của bạn</Text>
          <Text style={{ fontSize: '48px', fontWeight: 800, lineHeight: '1.2' }}>{attempt.score}<span style={{ fontSize: '24px', opacity: 0.8 }}>/{maxScore}</span></Text>
          
          <div style={{ display: 'flex', gap: '24px', marginTop: '24px', backgroundColor: 'rgba(0,0,0,0.1)', padding: '12px 24px', borderRadius: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: '12px', opacity: 0.8 }}>Thời gian</Text>
              <Text style={{ fontSize: '16px', fontWeight: 600 }}>{formatTime(attempt.timeTaken)}</Text>
            </div>
            <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <div style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: '12px', opacity: 0.8 }}>Xếp hạng</Text>
              <Text style={{ fontSize: '16px', fontWeight: 600 }}>#{leaderboard.findIndex(l => l.isMe) + 1}</Text>
            </div>
          </div>
        </Box>

        {/* Leaderboard */}
        <Box style={{ padding: '20px' }}>
          <Text style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', marginBottom: '16px' }}>
            🏆 Bảng xếp hạng Top 10
          </Text>
          
          <div style={{ backgroundColor: '#FFF', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            {leaderboard.map((item, index) => (
              <div 
                key={item.id}
                style={{ 
                  display: 'flex', alignItems: 'center', padding: '16px',
                  borderBottom: index < leaderboard.length - 1 ? '1px solid #F3F4F6' : 'none',
                  backgroundColor: item.isMe ? '#EFF6FF' : '#FFF'
                }}
              >
                <div style={{ 
                  width: '28px', height: '28px', borderRadius: '14px', 
                  backgroundColor: index === 0 ? '#FEF08A' : index === 1 ? '#E5E7EB' : index === 2 ? '#FED7AA' : '#F3F4F6',
                  color: index < 3 ? '#92400E' : '#6B7280',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '14px', marginRight: '16px'
                }}>
                  {index + 1}
                </div>
                
                <div style={{ flex: 1 }}>
                  <Text style={{ fontSize: '15px', fontWeight: item.isMe ? 700 : 500, color: item.isMe ? '#1E3A8A' : '#374151' }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: '12px', color: '#6B7280' }}>
                    {formatTime(item.timeTaken)}
                  </Text>
                </div>
                
                <Text style={{ fontSize: '16px', fontWeight: 700, color: '#059669' }}>
                  {item.score} đ
                </Text>
              </div>
            ))}
          </div>
        </Box>
      </Box>
    </Page>
  );
};

export default QuizResultPage;
