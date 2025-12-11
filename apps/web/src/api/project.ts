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
  industry_id: number
  created_user: {
    user_name: string
  }
}

export interface PaginationProps {
  page: number
  size: number
  name?: string
}



const getProjects = (data: PaginationProps) => {
  return request.get<{list: ProjectProps[], total: number, page: number, size: number}>('/project', {params: data})
}

const getProjectsByUser = () => {
  return request.get<ProjectProps[]>('/project/all')
}

const getProjectById = (id: number) => {
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
  getProjectsByUser,
  createProject,
  updateProject,
  deleteProject
}