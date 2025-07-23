<template>
  <div class="department-page">
    <div class="department-container">
      <!-- 左侧大类列表 -->
      <div class="department-categories">
        <div
          v-for="(dept, index) in departments"
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
import { ref, computed } from 'vue';
import { departments } from '../data/departments';
import type { SubDepartment } from '../types/department';

const selectedIndex = ref(0);

const currentDepartment = computed(() => departments[selectedIndex.value]);

const selectCategory = (index: number) => {
  selectedIndex.value = index;
};

const selectDepartment = (department: SubDepartment) => {
  // 这里可以处理科室选择后的逻辑，比如跳转到挂号页面
  console.log('选择科室:', department);
};
</script>

<style scoped>
.department-page {
  height: 100vh;
  background-color: #f5f5f5;
}

.department-container {
  display: flex;
  height: 100%;
  max-width: 960px;
  margin: 0 auto;
  background-color: #fff;
}

.department-categories {
  width: 120px;
  background-color: #f8f8f8;
  overflow-y: auto;
}

.category-item {
  padding: 16px 12px;
  font-size: 14px;
  color: #333;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.category-item.active {
  background-color: #fff;
  color: #2196f3;
  font-weight: 500;
}

.department-list {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.department-item {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;
}

.department-item:hover {
  background-color: #f8f8f8;
}

.dept-name {
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}

.dept-desc {
  font-size: 12px;
  color: #999;
}
</style> 