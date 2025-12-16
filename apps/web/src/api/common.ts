import { request } from "@repo/shared/request"

export interface UploadProps {
  filename: string
  "originalname": string,
  "mimetype": string,
  "size": number,
  "path": string
}


const uploadFile = (file: FormData) => {
  return request.uploadFile<UploadProps>('/upload', file)
}

export default {
  uploadFile
}