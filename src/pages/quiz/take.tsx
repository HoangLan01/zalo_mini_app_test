import React, { useState, useEffect, useRef } from 'react';
import { Page, Box, Text, Button, Icon, useNavigate, useSnackbar, Modal } from 'zmp-ui';
import { useLocation } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useQuizStore, Question } from '@/store/quizStore';

const QuizTakePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openSnackbar } = useSnackbar();
  const quizId = location.state?.quizId as string;
  
  const getQuizById = useQuizStore(state => state.getQuizById);
  const saveAttempt = useQuizStore(state => state.saveAttempt);
  
  const quiz = getQuizById(quizId);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(quiz?.timeLimit || 0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!quiz) {
      openSnackbar({ text: 'Không tìm thấy bài thi', type: 'error' });
      navigate('/quiz');
      return;
    }

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true); // Auto submit when time's up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [quiz]);

  const handleOptionSelect = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowSubmitModal(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    quiz?.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        score += q.points;
      }
    });
    return score;
  };

  const handleSubmit = (autoSubmit = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    clearInterval(timerRef.current);
    
    if (autoSubmit) {
      openSnackbar({ text: 'Đã hết thời gian làm bài!', type: 'warning' });
    } else {
      setShowSubmitModal(false);
    }

    const score = calculateScore();
    const timeTaken = quiz!.timeLimit - timeLeft;

    saveAttempt({
      quizId: quiz!.id,
      answers,
      score,
      timeTaken,
      completedAt: new Date().toISOString()
    });

    // Navigate to result
    setTimeout(() => {
      navigate('/quiz-result', { state: { quizId: quiz!.id }, replace: true });
    }, 1000);
  };

  if (!quiz) return <Page><Text>Đang tải...</Text></Page>;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Page className="page" style={{ backgroundColor: '#F9FAFB', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title={quiz.title} />

      {/* Progress & Timer Header */}
      <Box style={{ backgroundColor: '#FFFFFF', padding: '16px', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <Text style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
            Câu {currentQuestionIndex + 1}/{quiz.questions.length}
          </Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: timeLeft < 60 ? '#FEE2E2' : '#F3F4F6', padding: '4px 12px', borderRadius: '16px' }}>
            <Icon icon="zi-clock-1" size={16} style={{ color: timeLeft < 60 ? '#EF4444' : '#4B5563' }} />
            <Text style={{ fontSize: '14px', fontWeight: 700, color: timeLeft < 60 ? '#EF4444' : '#4B5563', fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(timeLeft)}
            </Text>
          </div>
        </div>
        <div style={{ height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', backgroundColor: '#246BFD', width: `${progressPercent}%`, transition: 'width 0.3s ease' }} />
        </div>
      </Box>

      {/* Question Content */}
      <Box style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        <Text style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '24px', lineHeight: '1.5' }}>
          {currentQuestion.content}
        </Text>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentQuestion.options?.map((option, index) => {
            const isSelected = answers[currentQuestion.id] === option;
            const alphabet = String.fromCharCode(65 + index); // A, B, C, D
            
            return (
              <div 
                key={index}
                onClick={() => handleOptionSelect(currentQuestion.id, option)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                  border: isSelected ? '2px solid #246BFD' : '1px solid #D1D5DB',
                  borderRadius: '12px',
                  gap: '12px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isSelected ? '#246BFD' : '#F3F4F6',
                  color: isSelected ? '#FFFFFF' : '#4B5563',
                  fontWeight: 600, fontSize: '14px', flexShrink: 0
                }}>
                  {alphabet}
                </div>
                <Text style={{ fontSize: '15px', color: isSelected ? '#1E3A8A' : '#374151', flex: 1 }}>
                  {option}
                </Text>
              </div>
            );
          })}
        </div>
      </Box>

      {/* Footer Nav */}
      <Box style={{ backgroundColor: '#FFFFFF', padding: '16px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '12px' }}>
        <Button 
          variant="secondary" 
          disabled={currentQuestionIndex === 0} 
          onClick={handlePrev}
          style={{ flex: 1 }}
        >
          Quay lại
        </Button>
        <Button 
          style={{ flex: 2, backgroundColor: '#246BFD' }} 
          onClick={handleNext}
        >
          {currentQuestionIndex === quiz.questions.length - 1 ? 'Nộp bài' : 'Câu tiếp theo'}
        </Button>
      </Box>

      {/* Submit Confirm Modal */}
      <Modal
        visible={showSubmitModal}
        title="Xác nhận nộp bài"
        onClose={() => setShowSubmitModal(false)}
        actions={[
          { text: 'Kiểm tra lại', onClick: () => setShowSubmitModal(false), close: true },
          { text: 'Nộp ngay', onClick: () => handleSubmit(false), highLight: true }
        ]}
        description={`Bạn đã trả lời ${Object.keys(answers).length}/${quiz.questions.length} câu hỏi. Bạn có chắc chắn muốn nộp bài?`}
      />
    </Page>
  );
};

export default QuizTakePage;
