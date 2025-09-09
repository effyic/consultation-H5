<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import chat from '@/api/chat'

const route = useRoute()
const router = useRouter()

const goback = () => {
  router.go(-1)
}

const isSuccess = ref(false)
const patient_name = ref('张丽')
const confirm = () => {
  if (route.query.chat_id) {
    chat.patients({ chat_id: parseInt(route.query.chat_id as string) }).then(res => {
      patient_name.value = res.data.patient_name
      isSuccess.value = true
    })
    chat.summary(parseInt(route.query.chat_id as string))
  }
}
</script>

<template>
  <div class=" headerTab">
    <img alt="返回" src="@/assets/back1.png" @click="goback" />
    <div>确认预约</div>
  </div>
  <div class="container" v-if="!isSuccess">
    <div class="doctor">
      <div class="avatar"></div>
      <div class="info">
        <div class="name">{{ route.query.doctorName }}</div>
        <div class="title">副主任医师 {{ route.query.departmentName }}专病</div>
        <div class="address">
          <div class="label">三甲</div>
          首都医科大学附属北京朝阳医院石景山院区
        </div>
      </div>
    </div>
    <div class="reserveInfo">
      <div class="item">
        <div class="title">预约时间</div>
        <div class="value" style="color: #2386FF;">{{ route.query.date }} {{ route.query.time }}</div>
      </div>
      <div class="item">
        <div class="title">就诊</div>
        <div class="value">7211262858</div>
      </div>
      <div class="item">
        <div class="title">证件</div>
        <div class="value">110***********6376</div>
      </div>
      <div class="item">
        <div class="title">手机</div>
        <div class="value">13800138000</div>
      </div>
    </div>
    <div class="btn" @click="confirm">确认预约</div>
    <div class="prompt">
      <div class="title">温馨提示</div>
      <div>1.为防止号源被随意占用浪费，请核对预约信息。</div>
      <div>2.上午号最晚需在11:30之前取号，下午号最晚需在16:30之前取号。</div>
    </div>
  </div>
  <div v-else class="success">
    <div class="icon">
      <img src="@/assets/successIcon.png" alt="">
      预约成功
    </div>
    <div class="bg"></div>
    <div class="content">
      <div class="item">{{ route.query.doctorName }}</div>
      <div class="item">北京朝阳医院石景山院区</div>
      <div style="color: #666666;">{{ route.query.departmentName }}</div>
      <div class="info">
        <div>
          {{ route.query.date }} 星期{{ route.query.weekday }}（下午）{{ route.query.time }}
        </div>
        <div>
          就诊人： {{ patient_name }}【7211262858】
        </div>
      </div>
    </div>
    <div class="btnBox">
      <div class="btn"
        @click="route.query.chat_id ? router.push({ path: '/chat', query: { chat_id: route.query.chat_id } }) : router.push({ path: '/' })">
        返回首页</div>
      <div class="btn" style="background: #2386FF;color: #fff;">医保支付</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.headerTab {
  height: 44px;
  background: transparent;
  width: 100vw;
  line-height: 44px;
  display: flex;
  align-items: center;
  z-index: 99;

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
  height: calc(100vh - 44px);
  background: #F5F5F5;
  overflow-y: auto;
  padding: 16px;

  .doctor {
    width: 100%;
    background: #FFFFFF;
    padding: 20px 15px 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 4px;

    .avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #D9D9D9;
      margin-right: 10px;
    }

    .info {
      flex: 1;

      .name {
        font-size: 18px;
        color: #333333;
      }

      .title {
        margin: 6px 0;
        font-size: 13px;
        color: #999999;
      }

      .address {
        font-size: 14px;
        color: #606265;
        display: flex;
        align-items: flex-start;

        .label {
          min-width: 26px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FFEEE0;
          color: #FF8E2E;
          font-size: 11px;
          margin-right: 4px;
        }
      }
    }
  }

  .patient {
    width: 100%;
    height: 45px;
    display: flex;
    align-items: center;
    padding: 0 14px;
    font-size: 14px;
    color: #333333;
    background: #FFFFFF;
    border-radius: 4px;
    margin: 15px 0;
  }

  .reserveInfo {
    background: #FFFFFF;
    border-radius: 4px;
    padding: 15px;

    .item {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      .title {
        color: #8F9399;
      }

      .value {
        color: #333333;
      }
    }
  }

  .btn {
    width: 100%;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    color: #FFFFFF;
    background: #2386FF;
    border-radius: 4px;
    margin: 16px 0 32px;
  }

  .prompt {
    font-size: 14px;
    color: #999999;

    .title {
      margin-bottom: 4px;
      color: #FF8E2E;
    }
  }
}

.success {
  width: 100%;
  height: calc(100vh - 44px);
  overflow-y: auto;
  padding: 0 20px;

  .icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 50px;
    font-size: 20px;
    color: #333;

    img {
      width: 53px;
      margin-bottom: 20px;
    }
  }

  .bg {
    width: 100%;
    height: 22px;
    border-radius: 8px;
    background: #ECEEF1;
    margin-top: 20px;
  }

  .content {
    width: calc(100% - 16px);
    margin: -10px 8px 0;
    padding: 10px 12px;
    background: #FFFFFF;
    box-shadow: 0px 6px 14px 0px #CED8DD;
    border-radius: 0 0 8px 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #333333;
    font-size: 16px;

    .item {
      margin-bottom: 4px;
      font-weight: 600;
    }

    .info {
      margin: 11px 0 0;
      background: #F2F8FF;
      border-radius: 4px;
      width: 100%;
      height: 72px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      color: #2386FF;
    }

  }

  .btnBox {
    margin-top: 52px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .btn {
      width: 152px;
      height: 48px;
      border-radius: 4px;
      border: 1px solid #2386FF;
      color: #2386FF;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>