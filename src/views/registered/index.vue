<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import calendar from '@/components/calendar.vue';

const route = useRoute()
const router = useRouter()

const active = ref(0);
const goback = () => {
  router.go(-1)
}

const date = ref('')
const weekday = ref('')
const time = ref('13:30-14:00')

const handleSelect = (val: any) => {
  date.value = val.date
  weekday.value = val.weekday
}

</script>

<template>
  <div class="bg">
    <div class=" headerTab">
      <img alt="返回" src="@/assets/back1.png" @click="goback" />
    </div>
    <div class="container">
      <div class="top">
        <div class="title">请选择服务类型</div>
        <div class="itemList">
          <div class="item" :class="{ active: active == 0 }" @click="active = 0">
            <div class="content">
              <img src="@/assets/registeredIcon1.png" alt="">
              线下号源
            </div>
          </div>
          <div class="item" :class="{ active: active == 1 }" @click="active = 1">
            <div class="content">
              <img src="@/assets/registeredIcon2.png" alt="">
              网络门诊
            </div>
          </div>
          <div class="item" :class="{ active: active == 2 }" @click="active = 2">
            <div class="content">
              <img src="@/assets/registeredIcon3.png" alt="">
              在线咨询
            </div>
          </div>
        </div>
      </div>
      <div class="bottom" v-if="active == 0">
        <div class="info">
          <div class="label" style="color: #45CC86;background: #E3F8ED;">线下号源</div>
          <div class="name">预约挂号</div>
          <div style="margin-top: 6px;">1.系统支持当日挂号和预约挂号。</div>
          <div style="margin-top: 6px;">2.预约患者请您务必在预约时段之前去就诊科室报到机上报到，最迟不能超过十分钟，否则您将影响后面的患者就诊!</div>
        </div>
        <calendar @select="handleSelect"></calendar>
        <div class="weather">
          <img src="@/assets/weather.png" alt="">
          下午
          <span style="margin-left: 11px;">剩余号源：3</span>
        </div>
        <div class="itemList">
          <div class="item" :class="{ 'active': time == '13:30-14:00' }" @click="time = '13:30-14:00'">
            <div>13:30-14:00</div>
            <div>剩余1</div>
          </div>
          <div class="item" :class="{ 'active': time == '14:30-15:00' }" @click="time = '14:30-15:00'">
            <div>14:30-15:00</div>
            <div>剩余1</div>
          </div>
          <div class="item" :class="{ active: time == '15:30-16:00' }" @click="time = '15:30-16:00'">
            <div>15:30-16:00</div>
            <div>剩余1</div>
          </div>
        </div>
      </div>
      <div class="submit" v-if="active == 0">
        <div class="info">
          <div class="time">{{ date }} {{ time }}</div>
          <div class="week">星期{{ weekday }}（下午）</div>
        </div>
        <div class="btn" @click="router.push({
          path: '/confirmReservation', query: {
            chat_id: route.query.chat_id,
            departmentName: route.query.departmentName,
            doctorName: route.query.doctorName,
            time: time,
            weekday: weekday,
            date: date
          }
        })">
          确认预约</div>
      </div>
      <div class=" bottom" v-if="active == 1">
        <div class="info">
          <div class="label">暂未开通</div>
          <div class="name">网络门诊</div>
          <div style="margin-top: 6px;">1.预约成功后，支付挂号费，就诊当天请耐心等待医生呼叫接诊。</div>
        </div>
        <div class="empty">
          <img src="@/assets/empty.png" alt="">
          服务为开通
        </div>
      </div>
      <div class="bottom" v-if="active == 2">
        <div class="info">
          <div class="label">暂未开通</div>
          <div class="name">在线咨询</div>
          <div style="margin-top: 6px;">1.如您所咨询的医师不能及时接诊，请您耐心等待或取消后向别的医师发起咨询。</div>
        </div>
        <div class="empty">
          <img src="@/assets/empty.png" alt="">
          服务为开通
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bg {
  background: rgba($color: #000000, $alpha: 0.2);
  overflow: hidden;
}

.headerTab {
  height: 98px;
  background: transparent;
  width: 100vw;
  line-height: 44px;
  display: flex;
  align-items: center;
  z-index: 99;
  padding-bottom: 54px;

  img {
    width: 24px;
    height: 24px;
    display: block;
    margin-left: 12px;
  }


  div {
    position: absolute;
    left: 50%;
    transform: translate(-50%);
    color: #000000;
    font-size: 17px;
    font-weight: 500;
  }

}

.container {
  width: 100%;
  height: calc(100vh - 98px);
  background: linear-gradient(180deg, #C8E1FF 0%, #FFFFFF 50%);
  border-radius: 12px 12px 0 0;

  .top {
    width: 100%;
    height: 196px;
    border-radius: 16px 16px 0 0;
    padding: 16px;

    .title {
      text-align: center;
      font-size: 18px;
      margin: 8px 0 22px;
      color: #333333;
    }

    .itemList {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;

      .item {
        width: 100%;
        height: 109px;
        display: flex;
        justify-content: center;

        &.active {
          background: url('@/assets/registeredBg.png');
          background-size: 100% 100%;
        }

        .content {
          width: 100px;
          margin-top: 2px;
          height: 98px;
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 13px;
          color: #666;
          border-radius: 12px;

          img {
            width: 40px;
            margin-bottom: 7px;
          }
        }
      }
    }
  }

  .bottom {
    width: 100%;
    height: calc(100% - 290px);
    overflow-y: auto;
    padding: 0 16px;

    .info {
      width: 100%;
      background: #fff;
      padding: 20px 16px;
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      color: #999999;
      font-size: 13px;
      margin-bottom: 33px;

      .label {
        position: absolute;
        right: 0;
        top: 0;
        width: 64px;
        height: 22px;
        border-radius: 0 0 0 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: #999999;
        background: #EDEFF2;
      }

      .name {
        display: flex;
        align-items: center;
        color: #333333;

        &::before {
          content: '';
          width: 2px;
          height: 12px;
          margin-right: 4px;
          background: #2386FF;
        }
      }
    }

    .weather {
      width: 100%;
      height: 38px;
      display: flex;
      align-items: center;
      padding: 0 6px;
      border-radius: 8px 8px 0 0;
      font-size: 14px;
      color: #2386FF;
      margin: 30px 0 15px;

      img {
        width: 16px;
        margin-right: 6px;
      }
    }

    .itemList {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(3, 1fr);

      .item {
        width: 90px;
        margin-bottom: 10px;
        background: #F2F8FF;
        font-size: 13px;
        color: #2386FF;
        border-radius: 4px;

        &.active {
          background: #2386FF;
          color: #fff;

          div {
            &:first-child {
              border-bottom: 1px dashed #fff;
            }
          }
        }

        div {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 28px;

          &:first-child {
            height: 29px;
            border-bottom: 1px dashed #2386FF;
          }
        }
      }
    }

    .empty {
      width: 100%;
      height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #999999;
      font-size: 14px;

      img {
        width: 133px;
        margin-bottom: 8px;
      }
    }
  }

  .submit {
    width: 100%;
    height: 94px;
    padding: 9px 16px 43px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .info {
      .time {
        font-size: 16px;
        color: #333333;
        margin-bottom: 3px;
      }

      .week {
        font-size: 12px;
        color: #6A82A0;
      }
    }

    .btn {
      width: 106px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      color: #FFFFFF;
      background: #2386FF;
      border-radius: 4px;
    }
  }
}
</style>