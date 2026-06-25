import React, { useEffect } from 'react';
import { Page, Box, Text, Button, useNavigate } from 'zmp-ui';
import { useLocation } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useQuizStore } from '@/store/quizStore';

const QuizResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setId = location.state?.setId as string;
  const { result, leaderboard, isLoading, error, fetchResult, fetchLeaderboard } = useQuizStore();

  useEffect(() => {
    if (!setId) {
      navigate('/quiz', { replace: true });
      return;
    }
    fetchResult(setId);
    fetchLeaderboard(setId);
  }, [fetchLeaderboard, fetchResult, navigate, setId]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} phút ${s} giây`;
  };

  if (isLoading || !result) {
    return (
      <Page>
        <PageHeader title="Kết quả" />
        <Box style={{ padding: '20px', textAlign: 'center' }}>
          <Text>{error || 'Đang tải kết quả...'}</Text>
          {error && (
            <Button onClick={() => navigate('/quiz')} style={{ marginTop: '16px' }}>
              Quay lại
            </Button>
          )}
        </Box>
      </Page>
    );
  }

  const rank = leaderboard.findIndex((item) => item.id === result.id) + 1;
  const isPerfect = result.score === result.maxScore;

  return (
    <Page className="page" style={{ backgroundColor: '#F5F5F5', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Kết quả bài thi" />

      <Box style={{ flex: 1, overflow: 'auto', paddingBottom: '80px' }}>
        <Box
          style={{
            backgroundColor: isPerfect ? '#10B981' : '#246BFD',
            padding: '32px 20px',
            color: '#FFF',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: '15px', opacity: 0.9, color: '#fff' }}>{result.quizSet.title}</Text>
          <Text style={{ fontSize: '16px', opacity: 0.9, marginTop: '20px', color: '#fff' }}>Điểm số của bạn</Text>
          <Text style={{ fontSize: '48px', fontWeight: 800, lineHeight: '1.2', color: '#fff' }}>
            {result.score}
            <span style={{ fontSize: '24px', opacity: 0.8 }}>/ {result.maxScore}</span>
          </Text>

          <div style={{ display: 'flex', gap: '24px', marginTop: '24px', backgroundColor: 'rgba(0,0,0,0.1)', padding: '12px 24px', borderRadius: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: '12px', opacity: 0.8, color: '#fff' }}>Thời gian</Text>
              <Text style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{formatTime(result.timeTaken)}</Text>
            </div>
            <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <div style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: '12px', opacity: 0.8, color: '#fff' }}>Xếp hạng</Text>
              <Text style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{rank > 0 ? `#${rank}` : 'Ngoài top'}</Text>
            </div>
          </div>
        </Box>

        <Box style={{ padding: '20px' }}>
          <Text style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A', marginBottom: '16px' }}>Bảng xếp hạng Top 10</Text>

          <div style={{ backgroundColor: '#FFF', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            {leaderboard.map((item, index) => {
              const isMe = item.id === result.id;
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    borderBottom: index < leaderboard.length - 1 ? '1px solid #F3F4F6' : 'none',
                    backgroundColor: isMe ? '#EFF6FF' : '#FFF',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '14px',
                      backgroundColor: index === 0 ? '#FEF08A' : index === 1 ? '#E5E7EB' : index === 2 ? '#FED7AA' : '#F3F4F6',
                      color: index < 3 ? '#92400E' : '#6B7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '14px',
                      marginRight: '16px',
                    }}
                  >
                    {index + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: '15px', fontWeight: isMe ? 800 : 600, color: isMe ? '#1E3A8A' : '#374151' }}>
                      {item.user.displayName}
                    </Text>
                    <Text style={{ fontSize: '12px', color: '#6B7280' }}>{formatTime(item.timeTaken)}</Text>
                  </div>

                  <Text style={{ fontSize: '16px', fontWeight: 800, color: '#059669' }}>{item.score} đ</Text>
                </div>
              );
            })}
          </div>
        </Box>

        <Box style={{ padding: '0 20px 20px' }}>
          <Button fullWidth onClick={() => navigate('/quiz')}>
            Về danh sách chủ đề
          </Button>
        </Box>
      </Box>
    </Page>
  );
};

export default QuizResultPage;
