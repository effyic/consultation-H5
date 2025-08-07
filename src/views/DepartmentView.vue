<template>
  <div class="department-page">
    <!-- 顶部搜索栏 -->
    <div class="search-header">
      <div class="search-header-content">
        <div class="back-button" @click="router.push('/index')">
          <img alt="返回" src="@/assets/back.png" style="width: 24px; height: 24px;display: block"/>
        </div>
        <div class="search-bar">
          <input
              v-model="search"
              placeholder="搜索科室"
              type="text"
              @keyup.enter="handleSearch"
          />
        </div>
      </div>
      <!-- 智能分诊卡片 -->
      <div class="ai-card">
        <div class="hospital-info">
          <img alt="朝阳医院智能分诊" class="hospital-logo" src="@/assets/hospital-logo.png"/>
          <span class="hospital-name" style="font-size: 14px;font-weight: 600;color: #5E6C83;">朝阳医院智能分诊</span>
        </div>
        <div class="ai-content">
          <div class="ai-left">
            <img alt="AI机器人" class="robot-icon" src="@/assets/robot-icon.png"/>
            <div class="ai-text">
              <div style="font-size: 14px;color: #5E6C83;">科学研判、快速分诊</div>
              <div class="blue-text">针对病症提供建议</div>
            </div>
          </div>
          <button class="ai-button" @click="toChat">智能分诊</button>
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
            :class="{ active: selectedIndex === index }"
            class="category-item"
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
    <el-dialog
        v-model="isDialog"
    >
      <div class="recommendBox">
        <div class="titleName">推荐挂号科室</div>
        <div class="detail">
          <div class="top">
            <img src="@/assets/recommendIcon.png" style="width: 24px; height: 24px;">
            {{ departmentName }}
          </div>
          <div class="btnBox">
            <div class="leftBtn" @click="isSuccess = true">确认挂号</div>
            <div class="rightBtn" @click="isDialog = false">取消挂号</div>
          </div>
        </div>
      </div>
    </el-dialog>
    <el-dialog
        v-model="isSuccess"
    >
      <div class="dialogBox">
        <img src="@/assets/success.png" style="width: 64px; height: 64px;">
        <span>预约成功</span>
        <div class="time" style="margin-top: 16px;">就诊时间：</div>
        <div class="time">{{appointmentTime}}</div>
        <div class="btn" @click="toDetail">{{chat_id == 0 ? '确认' : '查看病情文档'}}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref, watch} from 'vue';
import type {SubDepartment} from '../types/department';
import DepartmentService from '@/api/department';
import {useRoute, useRouter} from 'vue-router';
import {useWebSocket} from "@/stores/websocket.ts";
const websocket = useWebSocket();
const router = useRouter();
const route = useRoute();
const isDialog = ref(false);
const departmentName = ref('')
const isSuccess = ref(false);
const appointmentTime = ref('')

interface Department {
  id: number;
  name: string;
  children?: SubDepartment[];
}

const selectedIndex = ref(0);
const departmentList = ref<Department[]>([]);
const search = ref('');
const caseDetail = ref<any>({})
const chat_id = ref<any>(0)
const recommendName = ref<any>('')

const currentDepartment = computed(() =>
    departmentList.value[selectedIndex.value] || null
);

const selectCategory = (index: number) => {
  selectedIndex.value = index;
};

const selectDepartment = (department: SubDepartment) => {
  // 这里可以处理科室选择后的逻辑，比如跳转到挂号页面
  console.log('选择科室:', department);
  generateRandomAppointmentTime()
  departmentName.value = department.name
  isDialog.value = true;

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
}

function toChat() {
  websocket.chat_id = 0
  websocket.historyList = []
  router.push('/chat')
}

function toDetail(){
  let id = chat_id.value
  let name = recommendName.value || '无'
  let data = JSON.stringify(caseDetail.value)
  if(id !== 0){
    router.push({
      name: 'detail',
      params: {id, name,data}
    })
  }
  isDialog.value = false
  isSuccess.value = false
}

onMounted(() => {
  if(route.query?.data){
    let data:any = route.query.data
    caseDetail.value = JSON.parse(data)
    chat_id.value = route.query.id
    recommendName.value = route.query.name
  }
  websocket.initialFlg = false
  fetchDepartments();
});

function generateRandomAppointmentTime() {
  // 获取当前时间
  const now = new Date();

  // 生成1-7天后的随机日期
  const daysToAdd = Math.floor(Math.random() * 7) + 1;
  const appointmentDate = new Date(now);
  appointmentDate.setDate(now.getDate() + daysToAdd);

  // 生成9:00-18:00之间的随机时间
  const minMinutes = 9 * 60;  // 9:00
  const maxMinutes = 18 * 60; // 18:00
  const randomMinutes = Math.floor(Math.random() * (maxMinutes - minMinutes)) + minMinutes;

  const hour = Math.floor(randomMinutes / 60);
  const minute = randomMinutes % 60;

  // 设置具体时间
  const time = new Date(appointmentDate);
  time.setHours(hour, minute, 0, 0);

  // 格式化为中文格式
  const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const weekday = weekdays[time.getDay()];

  // 判断上午还是下午
  let period = '上午';
  let displayHour = hour;

  if (hour >= 12) {
    period = '下午';
    if (hour > 12) {
      displayHour = hour - 12;
    }
  }
  appointmentTime.value = `${time.getFullYear()}年${time.getMonth() + 1}月${time.getDate()}日 ${weekday} ${period}${displayHour}:${String(minute).padStart(2, '0')}分`;
}


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
  margin-top: 10px;
}

.search-bar {
  flex: 1;
  margin: 0 12px;
  margin-top: 10px;
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
  border: 1px solid #F0F1F5;
  padding: 14px;
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
  width: 88px;
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
  padding: 0px 16px;
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

:deep(.el-dialog) {
  width: 311px !important;
  padding: 0 !important;
  background: transparent !important;

  .el-dialog__header {
    display: none !important;
  }

  .dialogBox{
    border-radius: 20px !important;
    background: #fff;
    display: flex;
    flex-direction: column;
    padding: 32px 20px;
    align-items: center;
    span{
      font-size: 18px;
      font-weight: 500;
      padding:16px 0 24px;
      color:#000000;
    }
    .detailBox{
      display: flex;
      padding: 18px 16px;
      width: 100%;
      background:#F0F2F5;
      border-radius: 8px;
      align-items: center;
      img{
        margin-right:20px;
      }
      .detailCont{
        display: flex;
        flex-direction: column;
        .name{
          color:#000000D9;
          font-size: 16px;
          font-weight: 500;
        }
        p{
          color:#000000A6;
          font-size: 14px;
          font-weight: 400;
        }
      }

    }
    .time{
      width: 100%;
      color:#333333;
      font-size: 14px;
      font-weight: 500;
    }
    .btn{
      margin-top: 20px;
      width: 151px;
      height: 40px;
      min-height: 40px;
      border-radius: 100px;
      background: #529EEE;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: 500;
      font-size: 16px;
      color: #fff;
    }
  }

  .recommendBox {
    margin-top: 25px;
    margin-bottom: 25px;
    width: 325px;
    height: 208px;
    border-radius: 16px;
    background: url("@/assets/recommendBg.jpg") no-repeat;
    background-size: 100% 100%;

    .titleName {
      color: #FFFFFF;
      font-weight: 500;
      font-size: 17px;
      padding: 16px 20px;
    }

    .detail {
      display: flex;
      flex-direction: column;
      padding: 20px 20px;

      .top {
        display: flex;
        align-items: center;
        color: #262626;
        font-size: 16px;
        font-weight: 400;

        img {
          margin-right: 7px;
        }
      }

      .btnBox {
        display: flex;
        width: 100%;
        justify-content: space-between;
        color: #000;
        margin-top: 40px;

        .leftBtn, .rightBtn {
          width: 139px;
          height: 40px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #529EEE;
          font-weight: 500;
          font-size: 16px;
          color: #fff;
          cursor: pointer;

          &.rightBtn {
            background: #fff;
            border: 1px #529EEE solid;
            color: #529EEE;
          }
        }
      }
    }
  }
}
</style>
