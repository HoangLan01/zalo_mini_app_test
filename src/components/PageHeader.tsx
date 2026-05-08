import React, { useEffect } from 'react';
import api from 'zmp-sdk';

interface PageHeaderProps {
  title: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  useEffect(() => {
    // Set native navigation bar title using ZMP SDK
    api.setNavigationBarTitle({
      title: title
    });
  }, [title]);

  return null; // Don't render any custom UI, use the native bar
};

export default PageHeader;


