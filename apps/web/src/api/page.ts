import { PageSchema } from "@repo/core/types"
import { request } from "@repo/shared/request"

export interface CreatePageParams {
  name: string
  application_id: number
}

export interface PageProps {
  id: number
  name: string
  application_id: number
}

const createPage = (data: CreatePageParams) => {
  return request.post('/application/page', data)
}

const updatePage = (data: Omit<CreatePageParams, 'application_id'>, id: string) => {
  return request.put(`/application/page/${id}`, data)
}

const updatePageSchema = (data: PageSchema, id: string) => {
  return request.put(`/application/page/${id}`, {schema: data})
}

const getPageById = (id: string) => {
  return request.get<PageProps & {schema: PageSchema}>(`/application/page/${id}`)
}

const getPagesByApplicationId = (application_id: number) => {
  return request.get<PageProps[]>(`/application/page/application/${application_id}`)
}


export default {
  createPage,
  updatePage,
  getPageById,
  getPagesByApplicationId,
  updatePageSchema
}