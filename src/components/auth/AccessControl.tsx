
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { User } from '@/types/user';

interface AccessControlProps {
  children: React.ReactNode;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const AccessControl = ({ children, user, isAuthenticated, loading }: AccessControlProps) => {
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to homepage instead of login in public mode
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Mevcut sayfa
  const currentPage = location.pathname.split('/')[1] || 'dashboard';
  
  // Admin ve manager her yere erişebilir
  if (user?.role === 'admin' || user?.role === 'manager') {
    return <>{children}</>;
  }

  // User sadece izinli sayfalara erişebilir
  if (user?.role === 'user') {
    if (currentPage === '' || currentPage === 'dashboard') {
      return <>{children}</>;
    }
    
    if (!user.allowedPages?.includes(currentPage)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default AccessControl;
