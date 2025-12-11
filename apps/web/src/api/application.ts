
import { request } from "@repo/shared/request"

export interface CreateApplicationParams {
  name: string
  description?: string
  project_id: number
  status: number
}

export interface ApplicationProps {
  id: number
  name: string
  description: string
  created_by: number
  created_at: string
  updated_at: string
  cover: string
  project_id: number
  industry_id: number
  created_user: {
    user_name: string
  }
}

export interface PaginationProps {
  page: number
  size: number
  name?: string
  status?: number
  project_id?: number
  industry_id?: number
}

const getApplications = (data: PaginationProps) => {
  return request.get<{ list: ApplicationProps[], total: number, page: number, size: number }>('/application', { params: data })
}

const getApplicationById = (id: number) => {
  return request.get<ApplicationProps>(`/application/${id}`)
}

const createApplication = (data: CreateApplicationParams) => {
  return request.post('/application', data)
}

const updateApplication = (data: Partial<CreateApplicationParams>, id: number) => {
  return request.put(`/application/${id}`, data)
}

const deleteApplication = (id: number) => {
  return request.delete(`/application/${id}`)
}



export default {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  getApplicationById
}
