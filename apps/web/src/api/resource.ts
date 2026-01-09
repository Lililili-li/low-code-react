import { request } from "@repo/shared/request"


export interface FileResourceParams {
  page: number
  size: number
  name: string
  category_id: string
}

export interface FileResourceProps {
  id: number
  name: string
  url: string
  category_id: string
  size: number
  format: string
  created_at: string
  updated_at: string
}

export interface SaveFileResourceProps extends Omit<FileResourceProps, 'id' | 'created_at' | 'updated_at'> { }

const getFileResource = (params: FileResourceParams) => {
  return request.get<{ list: FileResourceProps[], total: number }>('/resource-manage', { params })
}

const getFileResourceById = (id: number) => {
  return request.get<FileResourceProps>('/resource-manage/' + id)
}

const getFileFormat = () => {
  return request.get<{ label: string, value: string }[]>('/resource-manage/format')
}

const createFileResource = (data: SaveFileResourceProps) => {
  return request.post<FileResourceProps>('/resource-manage', data)
}

const updateFileResource = (data: Partial<SaveFileResourceProps>, id: number) => {
  return request.put<FileResourceProps>('/resource-manage/' + id, data)
}

const deleteFileResource = (id: number) => {
  return request.delete<FileResourceProps>('/resource-manage/' + id)
}


export interface MapResourceParams {
  map_name: string
  map_level: number
  map_code: number
  map_resource: string
  parent_id: number
  parent_code: number
}

export interface MapResourceProps {
  id: number
  map_name: string
  map_level: string
  map_resource: string
  parent_id: string
  parent_code: number
  created_at: string
  updated_at: string
}

const createMapResource = (data: MapResourceParams) => {
  return request.post<MapResourceProps>('/map-resource', data)
}

export default {
  getFileResource,
  getFileResourceById,
  createFileResource,
  updateFileResource,
  getFileFormat,
  deleteFileResource,
  createMapResource
}

