import { request } from "@repo/shared/request"

export interface CreateProjectParams {
  name: string
  description?: string
}

export interface ProjectProps {
  id: number
  name: string
  description: string
  created_by: number
  created_at: string
  updated_at: string
}

export interface PaginationProps {
  page: number
  size: number
  name?: string
}



const getProjects = (data: PaginationProps) => {
  return request.get<{list: ProjectProps[], total: number, page: number, size: number}>('/project', {params: data})
}

const getProjectById = (id: string) => {
  return request.get<ProjectProps>(`/project/${id}`)
}

const createProject = (data: CreateProjectParams) => {
  return request.post(`/project`, data)
}

const updateProject = (data: Partial<CreateProjectParams>, id: number) => {
  return request.put(`/project/${id}`, data)
}

const deleteProject = (id: number) => {
  return request.delete(`/project/${id}`)
}

export default {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
}