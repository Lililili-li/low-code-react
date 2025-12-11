import { request } from "@repo/shared/request"

interface IndustryProps {
  id: number
  name: string
  description: string
  is_active: boolean
  sort: number
}

const getIndustries = () => {
  return request.get<IndustryProps[]>('/industry')
}

export default {
  getIndustries
}