'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { User, Tweet, UserStats } from '@/types';
import { userService } from '@/services/auth.service';
import { tweetService } from '@/services/tweet.service';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import TweetCard from '@/components/TweetCard';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState({
    user: true,
    stats: true,
    tweets: true,
    follow: false,
  });

  useEffect(() => {
    if (userId) {
      loadUserData();
      loadUserStats();
      checkFollowStatus();
    }
  }, [userId]);

  // Cargar tweets después de que tengamos los datos del usuario
  useEffect(() => {
    if (user) {
      loadUserTweets();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const userData = await userService.getUserProfile(userId);
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(prev => ({ ...prev, user: false }));
    }
  };

  const loadUserStats = async () => {
    try {
      const stats = await userService.getUserStats(userId);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  const loadUserTweets = async () => {
    try {
      const userTweets = await tweetService.getUserTweets(userId, { limit: 20 });
      
      // Solución temporal: asignar datos del usuario a tweets que no tienen userId populated
      const tweetsWithUser = userTweets.map(tweet => {
        if (typeof tweet.userId === 'string' && user) {
          return {
            ...tweet,
            userId: user
          };
        }
        return tweet;
      });
      
      setTweets(tweetsWithUser);
    } catch (error) {
      console.error('Error loading user tweets:', error);
    } finally {
      setLoading(prev => ({ ...prev, tweets: false }));
    }
  };

  const checkFollowStatus = async () => {
    if (!currentUser || currentUser._id === userId) return;
    
    try {
      const followStatus = await userService.isFollowing(userId);
      setIsFollowing(followStatus.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser || currentUser._id === userId) return;
    
    setLoading(prev => ({ ...prev, follow: true }));
    
    try {
      if (isFollowing) {
        await userService.unfollowUser(userId);
        setIsFollowing(false);
        setUserStats(prev => prev ? { ...prev, followersCount: prev.followersCount - 1 } : null);
      } else {
        await userService.followUser(userId);
        setIsFollowing(true);
        setUserStats(prev => prev ? { ...prev, followersCount: prev.followersCount + 1 } : null);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(prev => ({ ...prev, follow: false }));
    }
  };

  if (loading.user) {
    return (
      <Layout>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-gray-900">Usuario no encontrado</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                <p className="text-gray-600">@{user.username}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Se unió el {new Date(user.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div>
            </div>
            
            {currentUser && currentUser._id !== userId && (
              <button
                onClick={handleFollowToggle}
                disabled={loading.follow}
                className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading.follow ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  </div>
                ) : (
                  isFollowing ? 'Siguiendo' : 'Seguir'
                )}
              </button>
            )}
          </div>
          
          {/* Stats */}
          <div className="flex space-x-6 mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {loading.stats ? '...' : userStats?.tweetsCount || 0}
              </div>
              <div className="text-sm text-gray-600">Tweets</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {loading.stats ? '...' : userStats?.followingCount || 0}
              </div>
              <div className="text-sm text-gray-600">Siguiendo</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {loading.stats ? '...' : userStats?.followersCount || 0}
              </div>
              <div className="text-sm text-gray-600">Seguidores</div>
            </div>
          </div>
        </div>
        
        {/* User Tweets */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Tweets</h2>
          
          {loading.tweets ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : tweets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {currentUser?._id === userId 
                ? 'No has escrito ningún tweet aún.'
                : `@${user.username} no ha escrito ningún tweet aún.`
              }
            </div>
          ) : (
            tweets.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}