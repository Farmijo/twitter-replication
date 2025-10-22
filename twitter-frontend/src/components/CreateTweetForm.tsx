'use client';

import React, { useState } from 'react';
import { Tweet } from '@/types';
import { tweetService } from '@/services/tweet.service';
import { useAuth } from '@/contexts/AuthContext';

interface CreateTweetFormProps {
  onTweetCreated: (tweet: Tweet) => void;
}

const CreateTweetForm: React.FC<CreateTweetFormProps> = ({ onTweetCreated }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    try {
      setLoading(true);
      const newTweet = await tweetService.createTweet({ content: content.trim() });
      console.log("Component newTweet:", newTweet);
      onTweetCreated(newTweet);
      setContent('');
    } catch (error) {
      console.error('Error creating tweet:', error);
      alert('Error al crear el tweet. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="¿Qué está pasando?"
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            maxLength={280}
            disabled={loading}
          />
          
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-gray-500">
              {content.length}/280
            </span>
            
            <button
              type="submit"
              disabled={loading || !content.trim() || content.length > 280}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-full font-semibold transition-colors"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Twitteando...</span>
                </div>
              ) : (
                'Twittear'
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateTweetForm;