import React, { useEffect } from 'react';
import { Page, Box, Text } from 'zmp-ui';
import { useLocation } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';
import { eventCategoryLabel, useEventStore } from '@/store/eventStore';

const formatDateTime = (value: string) => new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
}).format(new Date(value));

const EventsDetailPage: React.FC = () => {
  const { state } = useLocation();
  const eventId = state?.id as string | undefined;
  const { currentEvent, isLoading, error, fetchEvent } = useEventStore();

  useEffect(() => {
    if (eventId) fetchEvent(eventId).catch(() => undefined);
  }, [eventId, fetchEvent]);

  const event = currentEvent?.id === eventId ? currentEvent : null;

  if (isLoading) {
    return (
      <Page className="page" style={{ backgroundColor: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <PageHeader title="Chi tiet su kien" />
        <Box style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: 'var(--text-muted)' }}>Dang tai su kien...</Text>
        </Box>
      </Page>
    );
  }

  if (!event || error) {
    return (
      <Page className="page" style={{ backgroundColor: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <PageHeader title="Chi tiet su kien" />
        <Box style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
          <Text style={{ color: 'var(--text-muted)' }}>{error || 'Khong tim thay su kien.'}</Text>
        </Box>
      </Page>
    );
  }

  const gallery = (event.imageUrls || []).filter(url => url !== event.thumbnailUrl);

  return (
    <Page className="page" style={{ backgroundColor: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Chi tiet su kien" />

      <Box style={{ flex: 1, overflow: 'auto', paddingBottom: '160px' }}>
        <div className="animate-fade-in" style={{ width: '100%', height: '260px', position: 'relative' }}>
          <img src={event.thumbnailUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '100px',
            background: 'linear-gradient(to top, var(--surface-raised), transparent)'
          }} />
        </div>

        <Box className="animate-fade-in-up delay-100" style={{
          padding: '24px 20px',
          backgroundColor: 'var(--surface-raised)',
          marginTop: '-24px',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)',
          position: 'relative',
          zIndex: 10
        }}>
          <div className="badge badge-primary" style={{ marginBottom: '12px' }}>{eventCategoryLabel(event.category)}</div>
          <Text style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', lineHeight: '1.3' }}>
            {event.title}
          </Text>

          <div style={{ display: 'grid', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid var(--border-light)', marginBottom: '20px' }}>
            <Text style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              <strong>Thoi gian:</strong> {formatDateTime(event.startAt)} - {formatDateTime(event.endAt)}
            </Text>
            <Text style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              <strong>Dia diem:</strong> {event.location}
            </Text>
            <Text style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              <strong>Don vi to chuc:</strong> {event.organizer}
            </Text>
            {event.contactInfo && (
              <Text style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                <strong>Lien he:</strong> {event.contactInfo}
              </Text>
            )}
          </div>

          <div
            style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '15px', textAlign: 'justify' }}
            dangerouslySetInnerHTML={{ __html: event.description }}
          />

          {gallery.length > 0 && (
            <Box className="animate-fade-in-up delay-200" style={{ marginTop: '32px' }}>
              <Text style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Thu vien anh
              </Text>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {gallery.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Event gallery ${idx + 1}`}
                    className="active-scale"
                    style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                  />
                ))}
              </div>
            </Box>
          )}
        </Box>
      </Box>
    </Page>
  );
};

export default EventsDetailPage;
