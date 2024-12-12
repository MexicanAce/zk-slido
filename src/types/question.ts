export interface Question {
  id: string;
  content: string;
  votes: number;
  isAnswered: boolean;
  authorId: string;
  createDate: Date;
  isUpvoted: boolean;
  isDownvoted: boolean;
}
