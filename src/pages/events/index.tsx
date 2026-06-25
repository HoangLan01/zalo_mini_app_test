import React, { useEffect, useState } from 'react';
import { Page, Box, Text } from 'zmp-ui';
import { useNavigate } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';
import { eventCategoryLabel, PublicEventStatus, useEventStore } from '@/store/eventStore';

const statusTabs: Array<{ key: PublicEventStatus; label: string }> = [
  { key: 'upcoming', label: 'Sắp diễn ra' },
  { key: 'ongoing', label: 'Đang diễn ra' },
  { key: 'past', label: 'Đã kết thúc' },
];

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const EventsIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState<PublicEventStatus>('upcoming');
  const { events, isLoading, error, fetchEvents } = useEventStore();

  useEffect(() => {
    fetchEvents(activeStatus);
  }, [activeStatus, fetchEvents]);

  return (
    <Page className="page" style={{ backgroundColor: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Sự kiện" />

      <div style={{ padding: '12px 16px 16px', background: 'var(--gradient-hero)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            background: 'rgba(255,255,255,0.92)',
            borderRadius: 'var(--radius-pill)',
            padding: '5px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
        >
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveStatus(tab.key)}
              style={{
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                background: activeStatus === tab.key ? 'var(--primary)' : 'transparent',
                color: activeStatus === tab.key ? '#fff' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 700,
                minHeight: '36px',
                padding: '0 8px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <Box style={{ flex: 1, overflow: 'auto', padding: '16px', paddingBottom: '160px' }}>
        {isLoading && (
          <Box style={{ textAlign: 'center', marginTop: '40px' }}>
            <Text style={{ color: 'var(--text-muted)' }}>Đang tải sự kiện...</Text>
          </Box>
        )}

        {!isLoading && error && (
          <Box style={{ textAlign: 'center', marginTop: '40px' }}>
            <Text style={{ color: 'var(--danger)' }}>{error}</Text>
          </Box>
        )}

        {!isLoading && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {events.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => navigate(`/events-detail?id=${encodeURIComponent(item.id)}`, { state: { id: item.id } })}
                className={`card-elevated active-scale animate-fade-in-up delay-${Math.min((idx + 1) * 100, 400)}`}
                style={{ overflow: 'hidden', cursor: 'pointer', borderRadius: 'var(--radius-xl)' }}
              >
                <div style={{ position: 'relative', width: '100%', height: '170px' }}>
                  <img src={item.thumbnailUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                    }}
                    className="badge badge-primary"
                  >
                    {eventCategoryLabel(item.category)}
                  </div>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <Text style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px', lineHeight: '1.35' }}>
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 700, marginBottom: '8px' }}>
                    {formatDateTime(item.startAt)}
                  </Text>
                  <Text
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.45',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.location}
                  </Text>
                </div>
              </div>
            ))}

            {events.length === 0 && (
              <Box style={{ textAlign: 'center', marginTop: '40px' }}>
                <Text style={{ color: 'var(--text-muted)' }}>Chưa có sự kiện phù hợp.</Text>
              </Box>
            )}
          </div>
        )}
      </Box>
    </Page>
  );
};

export default EventsIndexPage;
