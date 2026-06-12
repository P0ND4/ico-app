import type {
  LearningPath,
  GeneratePathDto,
  PathGenerationJob,
  PathStatus,
} from '../entities/path.entity';

export interface UpdatePathDto {
  title?: string;
  description?: string;
  status?: Exclude<PathStatus, 'completed'>;
}

export interface PathRepository {
  getAll(): Promise<LearningPath[]>;
  getById(id: string): Promise<LearningPath>;
  generate(dto: GeneratePathDto): Promise<PathGenerationJob>;
  getJob(jobId: string): Promise<PathGenerationJob>;
  update(id: string, dto: UpdatePathDto): Promise<LearningPath>;
  delete(id: string): Promise<void>;
  askTutor(pathId: string, body: { question: string; chapterContext?: string }): Promise<{ answer: string }>;
}
