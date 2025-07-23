import apiClient from '@/utils/request'

class DepartmentService {
  getDepartments(hospital_id: number, name: string) {
    return apiClient.get(`departments?hospital_id=${hospital_id}&name=${name}`)
  }
}

export default new DepartmentService()
