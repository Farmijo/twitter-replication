import { ValidationException } from '../../../shared/domain/exceptions/domain.exception';

export class TweetContent {
  private static readonly MAX_LENGTH = 280;
  private static readonly MIN_LENGTH = 1;

  constructor(private readonly value: string) {
    this.validate();
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: TweetContent): boolean {
    return this.value === other.value;
  }

  public getLength(): number {
    return this.value.length;
  }

  public extractHashtags(): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = this.value.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1).toLowerCase()) : [];
  }

  public extractMentions(): string[] {
    const mentionRegex = /@(\w+)/g;
    const matches = this.value.match(mentionRegex);
    return matches ? matches.map(mention => mention.substring(1).toLowerCase()) : [];
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new ValidationException('Tweet content cannot be empty');
    }

    if (this.value.trim().length < TweetContent.MIN_LENGTH) {
      throw new ValidationException(`Tweet content must be at least ${TweetContent.MIN_LENGTH} character long`);
    }

    if (this.value.length > TweetContent.MAX_LENGTH) {
      throw new ValidationException(`Tweet content exceeds ${TweetContent.MAX_LENGTH} characters`);
    }
  }
}