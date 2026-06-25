import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Page, Box, Text, Button, useNavigate, useSnackbar, Modal } from 'zmp-ui';
import { useLocation } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useQuizStore } from '@/store/quizStore';

const QuizTakePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openSnackbar } = useSnackbar();
  const setId = location.state?.setId as string;
  const { currentSet, currentAttempt, fetchSet, startAttempt, submitAttempt } = useQuizStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const timeLeftRef = useRef(0);
  const attemptIdRef = useRef<string | null>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = useCallback(
    async (autoSubmit = false) => {
      if (!currentSet || !attemptIdRef.current || isSubmitting) return;
      setIsSubmitting(true);
      clearInterval(timerRef.current);

      try {
        const timeTaken = currentSet.timeLimit - timeLeftRef.current;
        await submitAttempt(attemptIdRef.current, {
          timeTaken,
          expired: autoSubmit,
          answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({ questionId, selectedOptionId })),
        });

        if (autoSubmit) {
          openSnackbar({ text: 'Đã hết thời gian làm bài!', type: 'warning' });
        }

        navigate('/quiz-result', { state: { setId: currentSet.id }, replace: true });
      } catch (error: any) {
        openSnackbar({ text: error.message, type: 'error' });
        setIsSubmitting(false);
      }
    },
    [answers, currentSet, isSubmitting, navigate, openSnackbar, submitAttempt]
  );

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const set = await fetchSet(setId);
        if (!mounted) return;

        if (set.attempt && set.attempt.status !== 'IN_PROGRESS') {
          navigate('/quiz-result', { state: { setId: set.id }, replace: true });
          return;
        }

        const attempt = set.attempt || (await startAttempt(set.id));
        attemptIdRef.current = attempt.id;
        timeLeftRef.current = set.timeLimit;
        setTimeLeft(set.timeLimit);
      } catch (error: any) {
        openSnackbar({ text: error.message || 'Không tìm thấy bộ câu hỏi', type: 'error' });
        navigate('/quiz');
      }
    };

    init();
    return () => {
      mounted = false;
      clearInterval(timerRef.current);
    };
  }, [fetchSet, navigate, openSnackbar, setId, startAttempt]);

  useEffect(() => {
    if (!currentSet || !attemptIdRef.current) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        timeLeftRef.current = Math.max(0, next);
        if (next <= 0) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentSet, handleSubmit]);

  if (!currentSet || !currentSet.questions?.length || !currentAttempt) {
    return (
      <Page className="page">
        <PageHeader title="Làm bài" />
        <Box style={{ padding: '20px' }}>
          <Text>Đang tải...</Text>
        </Box>
      </Page>
    );
  }

  const currentQuestion = currentSet.questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / currentSet.questions.length) * 100;

  const handleNext = () => {
    if (currentQuestionIndex < currentSet.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setShowSubmitModal(true);
    }
  };

  return (
    <Page className="page" style={{ backgroundColor: '#F9FAFB', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title={currentSet.title} />

      <Box style={{ backgroundColor: '#FFFFFF', padding: '16px', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <Text style={{ fontSize: '14px', fontWeight: 700, color: '#374151' }}>
            Câu {currentQuestionIndex + 1}/{currentSet.questions.length}
          </Text>
          <Text
            style={{
              fontSize: '14px',
              fontWeight: 800,
              color: timeLeft < 60 ? '#EF4444' : '#4B5563',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatTime(timeLeft)}
          </Text>
        </div>
        <div style={{ height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', backgroundColor: '#246BFD', width: `${progressPercent}%`, transition: 'width 0.3s ease' }} />
        </div>
      </Box>

      <Box style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        <Text style={{ fontSize: '18px', fontWeight: 800, color: '#111827', marginBottom: '24px', lineHeight: '1.5' }}>
          {currentQuestion.content}
        </Text>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = answers[currentQuestion.id] === option.id;
            const alphabet = String.fromCharCode(65 + index);

            return (
              <button
                key={option.id}
                onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option.id }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  textAlign: 'left',
                  padding: '16px',
                  backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                  border: isSelected ? '2px solid #246BFD' : '1px solid #D1D5DB',
                  borderRadius: '12px',
                  gap: '12px',
                }}
              >
                <span
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isSelected ? '#246BFD' : '#F3F4F6',
                    color: isSelected ? '#FFFFFF' : '#4B5563',
                    fontWeight: 700,
                    fontSize: '14px',
                    flexShrink: 0,
                  }}
                >
                  {alphabet}
                </span>
                <Text style={{ fontSize: '15px', color: isSelected ? '#1E3A8A' : '#374151', flex: 1 }}>{option.content}</Text>
              </button>
            );
          })}
        </div>
      </Box>

      <Box style={{ backgroundColor: '#FFFFFF', padding: '16px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '12px' }}>
        <Button
          variant="secondary"
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
          style={{ flex: 1 }}
        >
          Quay lại
        </Button>
        <Button style={{ flex: 2, backgroundColor: '#246BFD' }} onClick={handleNext}>
          {currentQuestionIndex === currentSet.questions.length - 1 ? 'Nộp bài' : 'Câu tiếp theo'}
        </Button>
      </Box>

      <Modal
        visible={showSubmitModal}
        title="Xác nhận nộp bài"
        onClose={() => setShowSubmitModal(false)}
        actions={[
          { text: 'Kiểm tra lại', onClick: () => setShowSubmitModal(false), close: true },
          { text: 'Nộp ngay', onClick: () => handleSubmit(false), highLight: true },
        ]}
        description={`Bạn đã trả lời ${Object.keys(answers).length}/${currentSet.questions.length} câu hỏi. Bạn có chắc chắn muốn nộp bài?`}
      />
    </Page>
  );
};

export default QuizTakePage;
