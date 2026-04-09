// Frontend/src/components/common/PageHeader.tsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backUrl?: string;
  action?: React.ReactNode;
  gradient?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  showBack = false,
  backUrl,
  action,
  gradient = false
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`${gradient ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-white border-b'} shadow-sm`}>
      <div className="container-custom py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {showBack && (
              <button
                onClick={handleBack}
                className={`p-2 rounded-lg transition-colors ${
                  gradient 
                    ? 'hover:bg-white/10' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${gradient ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h1>
              {subtitle && (
                <p className={`mt-1 text-sm ${gradient ? 'text-white/80' : 'text-gray-600'}`}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;