import { request } from "@repo/shared/request"

export interface CreateComponentParams {
  name: string
  description?: string
  id: string
  code: string
  is_active: boolean
}

export interface ComponentProps {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
  cover: string
  category_id: string
  is_active: boolean
  created_user: {
    user_name: string
  }
  code: string
}

export interface ComponentCategoryProps {
  id: number
  parent_id: number
  name: string
  created_at: string
  updated_at: string
  icon: string
  label?: string
  children: ComponentCategoryProps[]
}

export interface PaginationProps {
  page: number
  pageSize: number
  name?: string
}

const createComponent = (data: CreateComponentParams) => {
  return request.post('/component', data)
}

const getComponents = (data: PaginationProps & { category_id?: string }) => {
  return request.get<{ list: ComponentProps[], total: number, page: number, pageSize: number }>('/component', { params: data })
}

const getComponentById = (id: string) => {
  return request.get<ComponentProps>(`/component/${id}`)
}

const updateComponent = (id: string, data: Partial<CreateComponentParams>) => {
  return request.put(`/component/${id}`, data)
}

const getComponentByCategory = (category_id: string) => {
  return request.get<ComponentProps[]>(`/component/category/${category_id}`)
}

const getComponentCategories = () => {
  return request.get<ComponentCategoryProps[]>('/component-category')
}


export default {
  getComponents,
  getComponentCategories,
  getComponentByCategory,
  createComponent,
  getComponentById,
  updateComponent
}
