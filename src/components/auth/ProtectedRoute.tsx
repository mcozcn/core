
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  // Get the current page from the pathname
  const currentPage = location.pathname.split('/')[1] || 'dashboard';
  
  console.log('ProtectedRoute kontrol:', {
    currentPage,
    userAllowedPages: user?.allowedPages,
    userRole: user?.role,
    requiredRole,
    isAuthenticated
  });
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }

  if (!isAuthenticated) {
    // Save the location the user was trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin kullanıcıları her sayfaya erişebilir
  if (user?.role === 'admin') {
    console.log('Admin kullanıcı, tüm sayfalara erişim sağlandı');
    return <>{children}</>;
  }

  // Rol kontrolü (admin dışındaki kullanıcılar için)
  if (requiredRole && user?.role !== requiredRole) {
    console.log('Rol kontrolü başarısız, ana sayfaya yönlendiriliyor');
    return <Navigate to="/" replace />;
  }
  
  // Sayfa erişim kontrolü - sadece staff kullanıcıları için
  if (user && user.role === 'staff' && user.allowedPages) {
    // Ana sayfa her zaman erişilebilir olmalı
    if (currentPage === '' || currentPage === 'dashboard') {
      return <>{children}</>;
    }
    
    // Diğer sayfalar için izin kontrolü
    if (!user.allowedPages.includes(currentPage)) {
      console.log('Sayfa erişim izni yok, ana sayfaya yönlendiriliyor:', currentPage);
      return <Navigate to="/" replace />;
    }
  }

  console.log('Erişim izni verildi');
  return <>{children}</>;
};

export default ProtectedRoute;
