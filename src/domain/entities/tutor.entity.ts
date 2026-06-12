export interface TutorConversation {
  id: string;
  userId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TutorMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}
