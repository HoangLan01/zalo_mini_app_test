import React, { useState } from 'react';
import { Page, Box, Text } from 'zmp-ui';
import { useNavigate } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';
import { useHeritageStore } from '@/store/heritageStore';

const HeritageIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const heritages = useHeritageStore(state => state.heritages);
  const [search, setSearch] = useState('');

  const filteredList = heritages.filter(h => h.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Page className="page" style={{ backgroundColor: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Di tích lịch sử" />
      
      {/* Search Bar — Gradient header */}
      <div style={{
        padding: '12px 16px 16px',
        background: 'var(--gradient-hero)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 'var(--radius-pill)',
          padding: '4px 16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm di tích..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              flex: 1, padding: '10px 0',
              fontSize: '14px', fontWeight: 500,
              color: 'var(--text-primary)'
            }}
          />
          {search && (
            <div onClick={() => setSearch('')} style={{ cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* List */}
      <Box style={{ flex: 1, overflow: 'auto', padding: '16px', paddingBottom: '160px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredList.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => navigate('/heritage-detail', { state: { id: item.id } })}
              className={`card-elevated active-scale animate-fade-in-up delay-${Math.min((idx + 1) * 100, 400)}`}
              style={{ overflow: 'hidden', cursor: 'pointer', borderRadius: 'var(--radius-xl)' }}
            >
              {/* Image with gradient overlay */}
              <div style={{ position: 'relative', width: '100%', height: '180px' }}>
                <img
                  src={item.coverImage}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: '80px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
                }} />
                {/* Type badge */}
                <div style={{
                  position: 'absolute', top: '12px', left: '12px',
                }} className="badge badge-primary" >
                  🏛️ Di tích
                </div>
              </div>
              {/* Content */}
              <div style={{ padding: '14px 16px' }}>
                <Text style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                  {item.name}
                </Text>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px', flexShrink: 0 }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <Text style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {item.address}
                  </Text>
                </div>
                <Text style={{
                  fontSize: '13px', color: 'var(--text-muted)',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  lineHeight: '1.5'
                }}>
                  {item.shortDesc}
                </Text>
              </div>
            </div>
          ))}
          
          {filteredList.length === 0 && (
            <Box style={{ textAlign: 'center', marginTop: '40px' }}>
              <div className="animate-float" style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.4 }}>🔍</div>
              <Text style={{ color: 'var(--text-muted)' }}>Không tìm thấy di tích phù hợp</Text>
            </Box>
          )}
        </div>
      </Box>
    </Page>
  );
};

export default HeritageIndexPage;
