// Frontend/src/components/common/Breadcrumb.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  homeLink?: string; // Default is based on role
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, homeLink }) => {
  const navigate = useNavigate();

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 0',
      fontSize: '14px',
      fontFamily: 'Montserrat, sans-serif',
      color: '#666',
      marginBottom: '24px'
    }}>
      {/* Home Icon */}
      <button
        onClick={() => navigate(homeLink || '/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#666',
          padding: '4px',
          borderRadius: '4px',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        title="Home"
      >
        <Home size={18} />
      </button>

      {/* Breadcrumb Items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={index}>
            <ChevronRight size={16} style={{ color: '#ccc' }} />
            
            {item.path && !isLast ? (
              <button
                onClick={() => navigate(item.path!)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#2196F3',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s',
                  fontWeight: 500
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E3F2FD';
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                {item.label}
              </button>
            ) : (
              <span style={{
                color: isLast ? '#111' : '#666',
                fontWeight: isLast ? 600 : 400,
                padding: '4px 8px'
              }}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;