<template>
  <div class="department-page">
    <!-- 顶部搜索栏 -->
    <div class="search-header">
      <div class="search-header-content">
        <div class="back-button">
          <img src="@/assets/back.png" alt="返回" style="width: 24px; height: 24px;display: block" />
        </div>
        <div class="search-bar">
          <input type="text" placeholder="搜索科室" />
        </div>
      </div>
      <!-- 智能分诊卡片 -->
      <div class="ai-card">
        <div class="hospital-info">
          <img src="/hospital-logo.svg" alt="朝阳医院智能分诊" class="hospital-logo" />
          <span class="hospital-name">朝阳医院智能分诊</span>
        </div>
        <div class="ai-content">
          <div class="ai-left">
            <img src="/robot-icon.svg" alt="AI机器人" class="robot-icon" />
            <div class="ai-text">
              <div>科学研判、快速分诊</div>
              <div class="blue-text">针对病症提供建议</div>
            </div>
          </div>
          <button class="ai-button">智能分诊</button>
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
  background-color: #f5f7fa;
  padding-bottom: 20px;
}

.search-header {
  background-color: #4a90e2;
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
  padding: 8px;
  font-size: 20px;
}

.search-bar {
  flex: 1;
  margin: 0 12px;
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

.header-icons {
  display: flex;
  gap: 12px;
  font-size: 18px;
}

.ai-card {
  margin: 16px 16px 0;
  background-color: #5DA4EF;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.hospital-info {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.hospital-logo {
  width: 24px;
  height: 24px;
  margin-right: 8px;
}

.ai-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.robot-icon {
  width: 40px;
  height: 40px;
}

.blue-text {
  color: #4a90e2;
  font-size: 14px;
}

.ai-button {
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
}

.hospital-area {
  padding: 12px 16px;
  background-color: #e8f4ff;
  color: #333;
  font-size: 14px;
  margin-bottom: 16px;
}

.department-container {
  display: flex;
  margin: 0 16px;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.department-categories {
  width: 120px;
  background-color: #f8f8f8;
  overflow-y: auto;
  max-height: calc(100vh - 250px);
}

.category-item {
  padding: 16px 12px;
  font-size: 14px;
  color: #333;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.category-item.active {
  color: #4a90e2;
  background-color: white;
  font-weight: 500;
}

.category-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 16px;
  background-color: #4a90e2;
}

.department-list {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  max-height: calc(100vh - 250px);
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
