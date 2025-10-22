'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Cookies from 'js-cookie';
import { STORAGE_KEYS } from '@/config/constants';

const DebugContext: React.FC = () => {
  const { user, loading, isAuthenticated, isInitialized } = useAuth();

  const allCookies = {
    accessToken: Cookies.get(STORAGE_KEYS.ACCESS_TOKEN),
    refreshToken: Cookies.get(STORAGE_KEYS.REFRESH_TOKEN), 
    userData: Cookies.get(STORAGE_KEYS.USER_DATA),
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; 
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg max-w-md text-xs z-50">
      <h3 className="font-bold mb-2"> Auth Debug</h3>
      
      <div className="space-y-2">
        <div>
          <strong>Context State:</strong>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify({ 
              loading, 
              isInitialized,
              isAuthenticated, 
              userId: user?._id,
              username: user?.username 
            }, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>Cookies:</strong>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify({
              hasAccessToken: !!allCookies.accessToken,
              hasRefreshToken: !!allCookies.refreshToken,
              hasUserData: !!allCookies.userData,
              accessTokenLength: allCookies.accessToken?.length || 0
            }, null, 2)}
          </pre>
        </div>

        <div>
          <strong>User Data:</strong>
          <pre className="text-xs overflow-x-auto max-h-32">
            {user ? JSON.stringify(user, null, 2) : 'No user data'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DebugContext;