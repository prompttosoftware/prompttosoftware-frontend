// src/services/projectKeys.ts
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { GetExploreProjectsRequest } from '@/lib/api';

export const projectKeys = createQueryKeys({
  exploreProjects: (params: GetExploreProjectsRequest) => ['exploreProjects', params],
});
