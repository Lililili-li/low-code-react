import { request } from "@repo/shared/request"

export interface UploadProps {
  filename: string
  "originalname": string,
  "mimetype": string,
  "size": number,
  "path": string
}

export interface CategoryProps {
  id: number,
  name: string,
  value: string
  module_name: string,
  module_id: string,
  is_active: boolean,
  sort: number,
  description: string,
  created_at: string,
  updated_at: string,
}

export interface CreateCategoryProps {
  name: string,
  module_name: string,
  module_id: string,
  value: string,
  is_active?: boolean,
  description?: string,
  sort?: number,
}

export interface CategoryDataProps {
  total: number,
  list: CategoryProps[]
}


const uploadFile = (file: FormData) => {
  return request.uploadFile<UploadProps>('/upload', file)
}

const getCategories = (params?: { page?: number, size?: number } & Pick<CategoryProps, 'name' | 'module_name'>) => {
  return request.get<CategoryDataProps>('/sys-category', { params })
}

const getCategoryById = (id: number) => {
  return request.get<CategoryProps>('/sys-category/' + id)
}

const getCategoryByModuleId = (id: string) => {
  return request.get<CategoryProps[]>('/sys-category/module/' + id)
}

const createCategory = (params: CreateCategoryProps) => {
  return request.post<CategoryProps>('/sys-category', params)
}

const updateCategory = (params: Partial<CategoryProps>, id: string) => {
  return request.put<CategoryProps>('/sys-category/' + id, params)
}

export default {
  uploadFile,
  getCategories,
  createCategory,
  updateCategory,
  getCategoryById,
  getCategoryByModuleId
}