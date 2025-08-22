import apiClient from '@/utils/request'

class DepartmentService {
  getDepartments(hos_code: number, name: string) {
    return apiClient.get(`departments?hos_code=${hos_code}&name=${name}`)
  }
}

export default new DepartmentService()
