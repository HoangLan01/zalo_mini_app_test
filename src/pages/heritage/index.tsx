import React, { useState } from 'react';
import { Page, Box, Text, Input, Icon } from 'zmp-ui';
import { useNavigate } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';
import { useHeritageStore } from '@/store/heritageStore';

const HeritageIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const heritages = useHeritageStore(state => state.heritages);
  const [search, setSearch] = useState('');

  const filteredList = heritages.filter(h => h.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Page className="page" style={{ backgroundColor: '#F5F5F5', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Di tích lịch sử" />
      
      <Box style={{ padding: '16px', backgroundColor: '#0068FF' }}>
        <Input.Search 
          placeholder="Tìm kiếm tên di tích..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          clearable
        />
      </Box>

      <Box style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredList.map(item => (
            <div 
              key={item.id}
              onClick={() => navigate('/heritage-detail', { state: { id: item.id } })}
              style={{ 
                backgroundColor: '#FFFFFF', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                cursor: 'pointer'
              }}
            >
              <img 
                src={item.coverImage} 
                alt={item.name} 
                style={{ width: '100%', height: '160px', objectFit: 'cover' }} 
              />
              <div style={{ padding: '16px' }}>
                <Text style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>
                  {item.name}
                </Text>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '8px' }}>
                  <Icon icon="zi-location" size={16} style={{ color: '#0068FF', marginTop: '2px' }} />
                  <Text style={{ fontSize: '13px', color: '#555555' }}>
                    {item.address}
                  </Text>
                </div>
                <Text style={{ fontSize: '14px', color: '#888888', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.shortDesc}
                </Text>
              </div>
            </div>
          ))}
          
          {filteredList.length === 0 && (
            <Box style={{ textAlign: 'center', marginTop: '40px' }}>
              <Text style={{ color: '#888888' }}>Không tìm thấy di tích nào phù hợp.</Text>
            </Box>
          )}
        </div>
      </Box>
    </Page>
  );
};

export default HeritageIndexPage;
