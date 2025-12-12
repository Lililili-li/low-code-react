import { request } from "@repo/shared/request"

export interface CreateComponentParams {
  name: string
  description?: string
}

export interface ComponentProps {
  id: number
  name: string
  description: string
  created_by: number
  created_at: string
  updated_at: string
  cover: string
  created_user: {
    user_name: string
  }
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
  size: number
  name?: string
}

const getComponents = (data: PaginationProps) => {
  return request.get<{ list: ComponentProps[], total: number, page: number, size: number }>('/component', { params: data })
}

const getComponentByCategory = (category_id: number) => {
  return request.get<ComponentProps[]>(`/component/category/${category_id}`)
}

const getComponentCategories = () => {
  return request.get<ComponentCategoryProps[]>('/component-category')
}


export default {
  getComponents,
  getComponentCategories,
  getComponentByCategory
}
