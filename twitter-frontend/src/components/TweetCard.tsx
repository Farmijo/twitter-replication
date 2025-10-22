'use client';

import React from 'react';
import { Tweet } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

interface TweetCardProps {
  tweet: Tweet;
}

const TweetCard: React.FC<TweetCardProps> = ({ tweet }) => {
  const formattedDate = formatDistanceToNow(new Date(tweet.createdAt), {
    addSuffix: true,
    locale: es,
  });

  // Handle both populated User object and string userId
  const user = typeof tweet.userId === 'string' ? null : tweet.userId;
  const username = user?.username || 'Usuario';
  const userId = user?._id || (typeof tweet.userId === 'string' ? tweet.userId : '');

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <Link
              href={`/profile/${userId}`}
              className="font-semibold text-gray-900 hover:text-blue-600"
            >
              {username}
            </Link>
            <span className="text-gray-500 text-sm">@{username}</span>
            <span className="text-gray-500 text-sm">·</span>
            <span className="text-gray-500 text-sm">{formattedDate}</span>
          </div>
          
          <div className="mt-2">
            <p className="text-gray-900 text-base leading-relaxed">
              {tweet.content}
            </p>
            {tweet.hashtags && tweet.hashtags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {tweet.hashtags.map((hashtag, index) => (
                  <span key={index} className="text-blue-500 text-sm">
                    #{hashtag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4 flex items-center space-x-6 text-gray-500">
            <button className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm">{tweet.repliesCount}</span>
            </button>
            
            <button className="flex items-center space-x-2 hover:text-green-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm">{tweet.retweetsCount}</span>
            </button>
            
            <button className="flex items-center space-x-2 hover:text-red-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm">{tweet.likesCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TweetCard;