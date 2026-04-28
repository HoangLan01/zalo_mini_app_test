import React, { useEffect } from 'react';
import { App, ZMPRouter, SnackbarProvider, AnimationRoutes, Route } from 'zmp-ui';

import BottomNav from '@/components/BottomNav';
import ComingSoon from '@/components/ComingSoon';
import IndexPage from '@/pages/index/index';

import QuizIndexPage from '@/pages/quiz/index';
import QuizTakePage from '@/pages/quiz/take';
import QuizResultPage from '@/pages/quiz/result';
import DvcPage from '@/pages/dvc/index';
import IhanoiPage from '@/pages/ihanoi/index';
import VneidPage from '@/pages/vneid/index';
import NewsIndexPage from '@/pages/news/index';
import NewsDetailPage from '@/pages/news/detail';
import FeedbackIndexPage from '@/pages/feedback/index';
import FeedbackCreatePage from '@/pages/feedback/create';
import FeedbackDetailPage from '@/pages/feedback/detail';
import BookingIndexPage from '@/pages/booking/index';
import BookingCreatePage from '@/pages/booking/create';
import HeritageIndexPage from '@/pages/heritage/index';
import HeritageDetailPage from '@/pages/heritage/detail';

// Imports for other pages will be added later when implemented
import { useUserStore } from '@/store/userStore';

const MyApp: React.FC = () => {
  const fetchUser = useUserStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <App>
      <SnackbarProvider>
        <ZMPRouter>
          <AnimationRoutes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/news" element={<NewsIndexPage />} />
            <Route path="/news-detail" element={<NewsDetailPage />} />
            <Route path="/feedback" element={<FeedbackIndexPage />} />
            <Route path="/feedback-create" element={<FeedbackCreatePage />} />
            <Route path="/feedback-detail" element={<FeedbackDetailPage />} />
            <Route path="/booking" element={<BookingIndexPage />} />
            <Route path="/booking-create" element={<BookingCreatePage />} />
            <Route path="/heritage" element={<HeritageIndexPage />} />
            <Route path="/heritage-detail" element={<HeritageDetailPage />} />
            <Route path="/services" element={<ComingSoon title="Dịch vụ" />} />
            <Route path="/profile" element={<ComingSoon title="Cá nhân" />} />

            <Route path="/quiz" element={<QuizIndexPage />} />
            <Route path="/quiz-take" element={<QuizTakePage />} />
            <Route path="/quiz-result" element={<QuizResultPage />} />
            <Route path="/dvc" element={<DvcPage />} />
            <Route path="/ihanoi" element={<IhanoiPage />} />
            <Route path="/vneid" element={<VneidPage />} />
            {/* We'll add remaining routes later */}
            <Route path="*" element={<ComingSoon title="Đang phát triển" />} />
          </AnimationRoutes>
          <BottomNav />
        </ZMPRouter>
      </SnackbarProvider>
    </App>
  );
};

export default MyApp;
