import type { Department } from '../types/department';

export const departments: Department[] = [
  {
    id: 1,
    name: '常用科室',
    children: [
      { id: 101, name: '心内科', description: '治疗心脏相关疾病' },
      { id: 102, name: '神经内科', description: '治疗神经系统疾病' },
      { id: 103, name: '消化内科', description: '治疗消化系统疾病' }
    ]
  },
  {
    id: 2,
    name: '专家团队',
    children: [
      { id: 201, name: '心血管专家', description: '心血管疾病诊疗' },
      { id: 202, name: '神经专家', description: '神经系统疾病诊疗' },
      { id: 203, name: '消化专家', description: '消化系统疾病诊疗' }
    ]
  },
  {
    id: 3,
    name: '专病门诊',
    children: [
      { id: 301, name: '高血压门诊', description: '高血压专科诊疗' },
      { id: 302, name: '糖尿病门诊', description: '糖尿病专科诊疗' },
      { id: 303, name: '心衰门诊', description: '心力衰竭专科诊疗' }
    ]
  },
  {
    id: 4,
    name: '内科系统',
    children: [
      { id: 401, name: '心内科', description: '心脏内科诊疗' },
      { id: 402, name: '呼吸内科', description: '呼吸系统疾病诊疗' },
      { id: 403, name: '消化内科', description: '消化系统疾病诊疗' },
      { id: 404, name: '神经内科', description: '神经系统疾病诊疗' },
      { id: 405, name: '内分泌科', description: '内分泌系统疾病诊疗' }
    ]
  },
  {
    id: 5,
    name: '外科系统',
    children: [
      { id: 501, name: '普通外科', description: '常规外科手术' },
      { id: 502, name: '神经外科', description: '神经系统手术' },
      { id: 503, name: '心胸外科', description: '心脏和胸腔手术' }
    ]
  },
  {
    id: 6,
    name: '妇产科',
    children: [
      { id: 601, name: '妇科门诊', description: '妇科疾病诊疗' },
      { id: 602, name: '产科门诊', description: '孕期检查与分娩' },
      { id: 603, name: '产后门诊', description: '产后恢复与护理' }
    ]
  },
  {
    id: 7,
    name: '儿科',
    children: [
      { id: 701, name: '儿科门诊', description: '儿童疾病诊疗' },
      { id: 702, name: '新生儿科', description: '新生儿护理与治疗' },
      { id: 703, name: '儿童保健', description: '儿童生长发育检查' }
    ]
  },
  {
    id: 8,
    name: '五官科',
    children: [
      { id: 801, name: '耳鼻喉科', description: '耳鼻喉疾病诊疗' },
      { id: 802, name: '眼科', description: '眼部疾病诊疗' },
      { id: 803, name: '口腔科', description: '口腔疾病诊疗' }
    ]
  }
]; 