
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'user';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  const currentPage = location.pathname.split('/')[1] || 'dashboard';
  
  console.log('ProtectedRoute - Erişim Kontrolü:', {
    currentPage,
    userRole: user?.role,
    userAllowedPages: user?.allowedPages,
    requiredRole,
    isAuthenticated,
    username: user?.username
  });
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // In public mode, redirect to home instead of a login page
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Admin kullanıcıları her yere erişebilir
  if (user?.role === 'admin') {
    console.log('Admin erişimi - tüm sayfalara izin verildi');
    return <>{children}</>;
  }

  // Manager kullanıcıları admin dışındaki her yere erişebilir
  if (user?.role === 'manager') {
    if (currentPage === 'users') {
      console.log('Manager - kullanıcı yönetimine erişim engellendi');
      return <Navigate to="/" replace />;
    }
    console.log('Manager erişimi - sayfa izin verildi');
    return <>{children}</>;
  }

  // Rol kontrolü
  if (requiredRole && user?.role !== requiredRole) {
    console.log('Rol kontrolü başarısız:', { userRole: user?.role, requiredRole });
    return <Navigate to="/" replace />;
  }
  
  // User kullanıcıları için sayfa erişim kontrolü
  if (user?.role === 'user') {
    // Ana sayfa her zaman erişilebilir
    if (currentPage === '' || currentPage === 'dashboard') {
      console.log('Ana sayfa erişimi - izin verildi');
      return <>{children}</>;
    }
    
    // allowedPages kontrolü
    if (!user.allowedPages || !Array.isArray(user.allowedPages) || user.allowedPages.length === 0) {
      console.log('User kullanıcı - allowedPages tanımlı değil, ana sayfaya yönlendiriliyor');
      return <Navigate to="/" replace />;
    }
    
    // Sayfa erişim kontrolü
    if (!user.allowedPages.includes(currentPage)) {
      console.log('User kullanıcı - sayfa erişim izni yok:', {
        currentPage,
        allowedPages: user.allowedPages
      });
      return <Navigate to="/" replace />;
    }

    console.log('User kullanıcı - sayfa erişim izni var:', {
      currentPage,
      allowedPages: user.allowedPages
    });
  }

  console.log('Erişim izni verildi');
  return <>{children}</>;
};

export default ProtectedRoute;
