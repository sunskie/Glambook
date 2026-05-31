import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <nav aria-label="Breadcrumb" style={{ padding: '8px 0', fontSize: '14px' }}>
      <ol style={{ display: 'flex', alignItems: 'center', listStyle: 'none', 
                   margin: 0, padding: 0, gap: '4px', flexWrap: 'wrap' }}>
        {items.map((item, index) => (
          <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
            {item.path && index < items.length - 1 ? (
              <Link to={item.path} 
                style={{ color: '#a78bfa', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
              >
                {item.label}
              </Link>
            ) : (
              <span style={{ color: '#9ca3af' }}>{item.label}</span>
            )}
            {index < items.length - 1 && (
              <span style={{ color: '#6b7280', margin: '0 6px' }}>/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
