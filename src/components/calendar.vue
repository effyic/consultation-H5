<template>
  <div class="calendar">
    <div class="calendar-header">
      <img src="@/assets/calendarIcon.png" alt="">
      <span>{{ year }}年{{ month + 1 }}月</span>
    </div>
    <div class="weekdays">
      <div v-for="w in weekdays" :key="w" class="weekday">{{ w }}</div>
    </div>

    <div v-for="(week, wi) in weeks" :key="wi" class="week-row">
      <div v-for="(cell, di) in week" :key="di" class="day" :class="{
        hidden: cell.hidden,
        selected: selectedDay === cell.day
      }" @click="selectDay(cell)">
        <span v-if="!cell.hidden && cell.day">{{ cell.day }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

type Cell = { day: number | null; hidden: boolean };

const emit = defineEmits<{
  (e: "select", value: { date: string; weekday: string }): void;
}>();

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth(); // 0-11
const todayDate = today.getDate();

const weekdays = ["一", "二", "三", "四", "五", "六", "日"];

const daysInMonth = new Date(year, month + 1, 0).getDate();

function mondayFirstOffset(date: Date) {
  return (date.getDay() + 6) % 7;
}

const offsetMonthStart = mondayFirstOffset(new Date(year, month, 1));
const padBeforeToday = offsetMonthStart + (todayDate - 1);

const rawDays = computed<Cell[]>(() => {
  const arr: Cell[] = [];
  for (let i = 0; i < padBeforeToday + 1; i++) { // +1 跳过今天
    arr.push({ day: null, hidden: true });
  }
  for (let d = todayDate + 1; d <= daysInMonth; d++) { // 从明天开始
    arr.push({ day: d, hidden: false });
  }
  return arr;
});

// 按周分组，并过滤整周 hidden
const weeks = computed<Cell[][]>(() => {
  const res: Cell[][] = [];
  const days = rawDays.value;
  for (let i = 0; i < days.length; i += 7) {
    const week = days.slice(i, i + 7);
    if (week.every(c => c.hidden)) continue;
    res.push(week);
  }
  return res;
});

const selectedDay = ref<number | null>(todayDate + 1);

function isToday(day: number | null) {
  return day === todayDate;
}

// 发送给父组件
function emitSelected(day: number) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const date = `${year}-${mm}-${dd}`;
  const weekday = weekdays[new Date(year, month, day).getDay() === 0 ? 6 : new Date(year, month, day).getDay() - 1];
  emit("select", { date, weekday });
}

function selectDay(cell: Cell) {
  if (!cell.hidden && cell.day) {
    selectedDay.value = cell.day;
    emitSelected(cell.day);
  }
}

onMounted(() => {
  emitSelected(todayDate + 1); // 默认返回今天
});
</script>


<style scoped>
.calendar {
  width: 100%;
  background: #fff;
}

.calendar-header {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #333333;
  padding: 0px 0 10px;

  img {
    width: 16px;
    height: 16px;
    margin-right: 8px;
  }
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
}

.week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
}

.weekday {
  font-size: 14px;
  color: #45CC86;
  background: #F2F8FF;
  border-radius: 6px 6px 0 0;
  padding: 2px 0;
  margin: 0 5px;
}

.day {
  padding: 3px 0;
  margin: 0 5px 2px;
  cursor: pointer;
  font-size: 14px;
  background: #F2F8FF;
}

.day.hidden {
  visibility: hidden;
  pointer-events: none;
}

.day.today {
  border: 1px solid #1989fa;
}

.day.selected {
  background: #1989fa;
  color: #fff;
}
</style>
