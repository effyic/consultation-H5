export interface Department {
  id: number;
  name: string;
  children?: SubDepartment[];
}

export interface SubDepartment {
  id: number;
  name: string;
  description?: string;
} 