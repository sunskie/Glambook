import React from 'react';
import RouteBreadcrumbs from './RouteBreadcrumbs';

interface BreadcrumbPageWrapperProps {
  children: React.ReactNode;
  maxWidth?: string;
  padding?: string;
  backgroundColor?: string;
}

const BreadcrumbPageWrapper: React.FC<BreadcrumbPageWrapperProps> = ({
  children,
  maxWidth = '1400px',
  padding = '16px 24px 0',
  backgroundColor = 'transparent',
}) => {
  return (
    <div style={{ backgroundColor }}>
      <div style={{ maxWidth, margin: '0 auto', padding }}>
        <RouteBreadcrumbs />
      </div>
      {children}
    </div>
  );
};

export default BreadcrumbPageWrapper;
