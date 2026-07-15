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
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const timeLeftRef = useRef(0);
  const deadlineRef = useRef(0);
  const isAutoSubmittingRef = useRef(false);
  const openSnackbarRef = useRef(openSnackbar);

  // zmp-ui returns a new snackbar callback on every render. Keep its latest
  // value in a ref so it does not retrigger the quiz-initialization effect.
  useEffect(() => {
    openSnackbarRef.current = openSnackbar;
  }, [openSnackbar]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = useCallback(
    async (autoSubmit = false) => {
      if (!currentSet || !attemptId || isSubmitting) return;
      setIsSubmitting(true);
      clearInterval(timerRef.current);

      try {
        const timeTaken = Math.max(0, currentSet.timeLimit - timeLeftRef.current);
        await submitAttempt(attemptId, {
          timeTaken,
          expired: autoSubmit,
          answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({ questionId, selectedOptionId })),
        });

        if (autoSubmit) {
          openSnackbarRef.current({ text: 'Đã hết thời gian làm bài!', type: 'warning' });
        }

        navigate('/quiz-result', { state: { setId: currentSet.id }, replace: true });
      } catch (error: any) {
        openSnackbarRef.current({ text: error.message, type: 'error' });
        setIsSubmitting(false);
      }
    },
    [answers, currentSet, isSubmitting, navigate, submitAttempt]
  );

  useEffect(() => {
    let mounted = true;
    setAttemptId(null);

    const init = async () => {
      try {
        const set = await fetchSet(setId);
        if (!mounted) return;

        if (set.attempt && set.attempt.status !== 'IN_PROGRESS') {
          navigate('/quiz-result', { state: { setId: set.id }, replace: true });
          return;
        }

        const attempt = set.attempt || (await startAttempt(set.id));
        setAttemptId(attempt.id);
        deadlineRef.current = new Date(attempt.startedAt).getTime() + set.timeLimit * 1000;
        const remainingSeconds = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
        timeLeftRef.current = remainingSeconds;
        setTimeLeft(remainingSeconds);
      } catch (error: any) {
        openSnackbarRef.current({ text: error.message || 'Không tìm thấy bộ câu hỏi', type: 'error' });
        navigate('/quiz');
      }
    };

    init();
    return () => {
      mounted = false;
      clearInterval(timerRef.current);
    };
  }, [fetchSet, navigate, setId, startAttempt]);

  useEffect(() => {
    if (!currentSet || !attemptId) return;

    const updateTimer = () => {
      const next = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      timeLeftRef.current = next;
      setTimeLeft(next);

      if (next <= 0) {
        clearInterval(timerRef.current);
        if (!isAutoSubmittingRef.current) {
          isAutoSubmittingRef.current = true;
          void handleSubmit(true);
        }
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => clearInterval(timerRef.current);
  }, [attemptId, currentSet, handleSubmit]);

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

  const questions = currentSet.questions ?? [];
  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
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
            Câu {currentQuestionIndex + 1}/{questions.length}
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
          {currentQuestionIndex === questions.length - 1 ? 'Nộp bài' : 'Câu tiếp theo'}
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
        description={`Bạn đã trả lời ${Object.keys(answers).length}/${questions.length} câu hỏi. Bạn có chắc chắn muốn nộp bài?`}
      />
    </Page>
  );
};

export default QuizTakePage;
