import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TweetCard from '../TweetCard';
import { Tweet } from '@/types';

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const buildTweet = (overrides: Partial<Tweet> = {}): Tweet => ({
  id: 'tweet-1',
  content: 'Hola mundo',
  userId: {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    createdAt: new Date('2024-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-01T00:00:00Z').toISOString(),
  },
  author: { id: 'user-123', username: 'testuser' },
  likesCount: 0,
  retweetsCount: 0,
  repliesCount: 0,
  hashtags: [],
  mentions: [],
  isRetweet: false,
  createdAt: new Date('2024-01-01T00:00:00Z').toISOString(),
  updatedAt: new Date('2024-01-01T00:00:00Z').toISOString(),
  ...overrides,
});

describe('TweetCard', () => {
  it('enlaza al perfil correspondiente del autor', () => {
    const tweet = buildTweet();

    render(<TweetCard tweet={tweet} />);

    const profileLink = screen.getByRole('link', { name: /testuser/i });

    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute('href', `/profile/${tweet.author.id}`);
  });
});
