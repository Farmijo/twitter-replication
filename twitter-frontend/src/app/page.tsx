'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tweet } from '@/types';
import { tweetService } from '@/services/tweet.service';
import TweetCard from '@/components/TweetCard';
import CreateTweetForm from '@/components/CreateTweetForm';
import Layout from '@/components/Layout';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [tweetsLoading, setTweetsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      loadTweets();
    }
  }, [isAuthenticated, loading, router]);

  const loadTweets = async () => {
    try {
      setTweetsLoading(true);
      const tweetsData = await tweetService.getAllTweets({ limit: 20 });
      setTweets(tweetsData);
    } catch (error) {
      console.error('Error loading tweets:', error);
    } finally {
      setTweetsLoading(false);
    }
  };

  const handleTweetCreated = (newTweet: Tweet) => {
    console.log("New tweet created:", newTweet);
    setTweets([newTweet, ...tweets]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <CreateTweetForm onTweetCreated={handleTweetCreated} />
        </div>

        <div className="space-y-4">
          {tweetsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : tweets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay tweets aún. ¡Sé el primero en escribir algo!
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