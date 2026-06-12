import type { TutorConversation, TutorMessage } from '../entities/tutor.entity';

export interface TutorRepository {
  getConversations(): Promise<TutorConversation[]>;
  getConversation(id: string): Promise<TutorConversation>;
  createConversation(title?: string): Promise<TutorConversation>;
  updateConversation(id: string, title: string): Promise<TutorConversation>;
  deleteConversation(id: string): Promise<void>;
  getMessages(conversationId: string): Promise<TutorMessage[]>;
  sendMessage(conversationId: string, content: string): Promise<TutorMessage>;
}
