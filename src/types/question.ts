export interface Question {
  id: string;
  content: string;
  votes: number;
  upvotes: number;
  downvotes: number;
  isAnswered: boolean;
  authorId: string;
  createDate: Date;
  isUpvoted: boolean;
  isDownvoted: boolean;
}
