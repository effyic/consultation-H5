<template>
  <div class="department-page">
    <!-- 顶部搜索栏 -->
    <div class="search-header">
      <div class="search-header-content">
        <div class="back-button">
          <img src="@/assets/back.png" alt="返回" style="width: 24px; height: 24px;display: block" />
        </div>
        <div class="search-bar">
          <input 
            type="text" 
            placeholder="搜索科室" 
            v-model="search"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>
      <!-- 智能分诊卡片 -->
      <div class="ai-card">
        <div class="hospital-info">
          <img src="@/assets/hospital-logo.png" alt="朝阳医院智能分诊" class="hospital-logo" />
          <span class="hospital-name" style="font-size: 14px;font-weight: 600;color: #5E6C83;">朝阳医院智能分诊</span>
        </div>
        <div class="ai-content">
          <div class="ai-left">
            <img src="@/assets/robot-icon.png" alt="AI机器人" class="robot-icon" />
            <div class="ai-text">
              <div style="font-size: 14px;color: #5E6C83;">科学研判、快速分诊</div>
              <div class="blue-text">针对病症提供建议</div>
            </div>
          </div>
          <button class="ai-button" @click="router.push('/chat')">智能分诊</button>
        </div>
      </div>
    </div>

    <!-- 院区信息 -->
    <div class="hospital-area">
      石景山院区 07:00 放次日起第14天号
    </div>

    <!-- 科室列表 -->
    <div class="department-container">
      <!-- 左侧大类列表 -->
      <div class="department-categories">
        <div
          v-for="(dept, index) in departmentList"
          :key="dept.id"
          class="category-item"
          :class="{ active: selectedIndex === index }"
          @click="selectCategory(index)"
        >
          {{ dept.name }}
        </div>
      </div>

      <!-- 右侧科室列表 -->
      <div class="department-list">
        <div
          v-for="subDept in currentDepartment?.children"
          :key="subDept.id"
          class="department-item"
          @click="selectDepartment(subDept)"
        >
          <div class="dept-name">{{ subDept.name }}</div>
          <div class="dept-desc">{{ subDept.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { SubDepartment } from '../types/department';
import DepartmentService from '@/api/department';
import { useRouter } from 'vue-router';

const router = useRouter();

interface Department {
  id: number;
  name: string;
  children?: SubDepartment[];
}

const selectedIndex = ref(0);
const departmentList = ref<Department[]>([]);
const search = ref('');

const currentDepartment = computed(() => 
  departmentList.value[selectedIndex.value] || null
);

const selectCategory = (index: number) => {
  selectedIndex.value = index;
};

const selectDepartment = (department: SubDepartment) => {
  // 这里可以处理科室选择后的逻辑，比如跳转到挂号页面
  console.log('选择科室:', department);
};

const handleSearch = () => {
  fetchDepartments();
};

// 监听搜索值变化
watch(search, (newValue) => {
  if (!newValue) {
    fetchDepartments();
  }
});

// 获取科室列表数据
const fetchDepartments = async () => {
  try {
    const res = await DepartmentService.getDepartments(1, search.value);
    if (res?.data) {
      departmentList.value = res.data.departments;
      // 重置选中索引
      selectedIndex.value = 0;
    }
  } catch (error) {
    console.error('获取科室列表失败:', error);
  }
};

onMounted(() => {
  fetchDepartments();
});
</script>

<style scoped>
.department-page {
  height: 100vh;
  background-color: #f5f7fa;
  display: flex;
    flex-direction: column;
}

.search-header {
  background: linear-gradient(180deg, #4496ED 0%, #5DA4EF 93.39%);
  box-sizing: border-box;
  padding-bottom: 16px;
}

.search-header-content {
  height: 44px;
  padding: 0 16px;
  display: flex;
  align-items: center;
}

.back-button {
  font-size: 20px;
  margin-top:10px;
}

.search-bar {
  flex: 1;
  margin: 0 12px;
  margin-top:10px;
}

.search-bar input {
  width: 100%;
  height: 32px;
  border-radius: 16px;
  border: none;
  background-color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  color: #333;
  padding: 0 12px;
  box-sizing: border-box;
}

.search-bar input::placeholder {
  color: rgba(0, 0, 0, 0.45);
}

.header-icons {
  display: flex;
  gap: 12px;
  font-size: 18px;
}

.ai-card {
  margin: 16px 16px 0;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  /* height: 120px; */
  box-sizing: border-box;
}

.hospital-info {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.hospital-logo {
  width: 24px;
  height: 24px;
  margin-right: 5px;
}

.ai-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  background-color: #F9FAFC;
  border:1px solid #F0F1F5;
  padding:14px;
  border-radius: 6px;
}

.ai-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.robot-icon {
  width: 40px;
  height: 48px;
  object-fit: cover;
}

.blue-text {
  color: #4496ED;
  font-weight: 500; 
  font-size: 14px;
}

.ai-button {
  background: linear-gradient(90deg, #529EEE 0%, #31C9F1 100%);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
  width:88px;
  height: 32px;
  box-sizing: border-box;
}

.hospital-area {
  background-color: #e8f4ff;
  color: #000000;
  font-size: 14px;
  height: 32px;
  display: flex;
  align-items: center;
  padding:0px 16px;
  box-sizing: border-box;
}

.department-container {
  display: flex;
  background-color: white;
  overflow: hidden;
  height: calc(100vh - 236px);
}

.department-categories {
  width: 144px;
  background-color: #F8F8F8;
  overflow-y: auto;
}

.category-item {
  padding: 16px 12px;
  font-size: 16px;
  color: #666666;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.category-item.active {
  color: #529EEE;
  background-color: white;
  font-weight: 500;
}

/* .category-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 16px;
  background-color: #4a90e2;
} */

.department-list {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.department-item {
  height: 58px;
  cursor: pointer;
  transition: all 0.3s;
 display: flex;
 align-items: center;
 justify-content: center;
}

.dept-name {
  font-size: 16px;
  color: #666666;
  margin-bottom: 4px;
}

.dept-desc {
  font-size: 12px;
  color: #999;
}
</style>
