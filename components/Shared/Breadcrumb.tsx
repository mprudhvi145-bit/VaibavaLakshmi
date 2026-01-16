import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const { trackEvent } = useStore();

  if (!items || items.length === 0) return null;

  const handleTrack = (item: BreadcrumbItem, index: number) => {
    trackEvent('breadcrumb_click', {
      label: item.label,
      path: item.path,
      depth: index,
      source_url: window.location.href,
      total_depth: items.length
    });
  };

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center text-xs text-slate-500 uppercase tracking-wider overflow-x-auto whitespace-nowrap py-2 no-scrollbar ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isFirst = index === 0;

        return (
          <div key={`${index}-${item.label}`} className="flex items-center">
            {index > 0 && (
              <ChevronRight size={12} className="mx-2 text-slate-300 flex-shrink-0" />
            )}
            
            {item.path && !isLast ? (
              <Link 
                to={item.path} 
                onClick={() => handleTrack(item, index)}
                className="hover:text-brand-primary transition-colors flex items-center"
              >
                {isFirst && item.label === 'Home' ? (
                  <Home size={12} className="mr-1 mb-0.5" />
                ) : (
                  <span>{item.label}</span>
                )}
              </Link>
            ) : (
              <span className={`font-bold text-slate-900 ${isLast ? 'truncate max-w-[150px] md:max-w-none' : ''}`}>
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;