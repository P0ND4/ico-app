import type {
  LearningPath,
  GeneratePathDto,
  PathGenerationJob,
} from '../entities/path.entity';

export interface UpdatePathDto {
  title?: string;
  description?: string;
  /** The API only accepts these two transitions. */
  status?: 'active' | 'archived';
}

export interface PathRepository {
  getAll(includeDeleted?: boolean): Promise<LearningPath[]>;
  getById(id: string): Promise<LearningPath>;
  generate(dto: GeneratePathDto): Promise<PathGenerationJob>;
  getJob(jobId: string): Promise<PathGenerationJob>;
  update(id: string, dto: UpdatePathDto): Promise<LearningPath>;
  delete(id: string): Promise<void>;
  restore(id: string): Promise<LearningPath>;
  askTutor(pathId: string, body: { question: string; chapterContext?: string }): Promise<{ answer: string }>;
}
