<template>
  <div class="headerTab">
    <img alt="返回" src="@/assets/back1.png" @click="goback" />
    <div>医师主页</div>
  </div>
  <div class="banner">
    <div class="tip">线上看诊，为健康省点时间</div>
    <div class="info">
      <p class="name">
        <span>{{ route.query.doctorName }}</span>知名专家
      </p>
      <p>北京朝阳医院石景山院区 · {{ route.query.departmentName }}</p>
    </div>
    <div class="bottom">
      <img class="bg" src="@/assets/doctorBottom.png" alt="">
      <div class="doctor">
        {{ route.query.doctorName }}
        <div class="label">
          知名专家
          <img src="@/assets/evaluate.png" alt="">
        </div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="name">
      <div class="label">三甲</div>
      北京朝阳医院石景山院区·{{ route.query.departmentName }}
    </div>
    <div class="title">
      <div class="label">医师简介</div>
      冠心病的临床与介入治疗。
    </div>
  </div>
  <div style="height: 12px;background: #F3F3F3;"></div>
  <van-tabs v-model:active="active">
    <van-tab title="医师简介">
      <div class="Introduction">
        <div class="title">医师简介</div>
        <div class="content">
          <p>
            先后于浙江大学医学院、中国协和医科大学和首都医科大学求学，曾赴澳大利亚墨尔本大学、西部医院和美国克利夫兰医学中心短期进修。
            现工作于首都医科大学附属北京朝阳医院心脏中心，主要从事冠心病的临床与介入治疗工作，系卫生部心血管介入治疗培训基地导师（冠心病介入）。
          </p>
          <p>
            长期参与心血管临床和冠心病临护工作，能诊断处理大部分心血管疾病和危重急症。
            年完成冠状动脉介入手术约400余例，无严重并发症。
          </p>
        </div>
      </div>
    </van-tab>
    <van-tab title="患者评价">

    </van-tab>
    <van-tab title="健康问答">

    </van-tab>
  </van-tabs>
  <div class="submit">
    <div class="btn"
      @click="router.push({ path: '/registered', query: { chat_id: route.query.chat_id, departmentName: route.query.departmentName, doctorName: route.query.doctorName } })">
      预约服务</div>
  </div>

</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import calendar from '@/components/calendar.vue';

const route = useRoute()
const router = useRouter()

const active = ref(0);
const goback = () => {
  router.go(-1)
}
</script>

<style lang="scss" scoped>
:deep(.van-tabs__nav) {
  border-bottom: 1px solid #F0F0F0;

  .van-tabs__line {
    width: 112px !important;
    height: 1px !important;
    background-color: #2386FF !important;
  }
}

.headerTab {
  position: fixed;
  top: 0;
  height: 44px;
  background: #fff;
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

.banner {
  position: relative;
  margin-top: 50px;
  width: 100%;
  height: 256px;
  background: url('@/assets/doctorBg.png');
  background-size: 100% 100%;
  background-color: #F4F9FF;
  padding: 70px 20px 0;

  .tip {
    color: #6A82A0;
    font-size: 16px;
  }

  .info {
    position: relative;
    margin-top: 22px;
    font-size: 12px;
    color: #6A82A0;
    padding-left: 10px;

    ::after {
      content: '';
      width: 1px;
      height: 32px;
      background: #FF8E2E;
      position: absolute;
      left: 0;
      top: 5px;
    }

    .name {
      span {
        font-size: 14px;
        color: #FF8E2E;
        margin: 0 4px 2px 0;
      }
    }
  }

  .bottom {
    position: absolute;
    width: 100%;
    height: 46px;
    background: #D5E9FF;
    bottom: 0;
    left: 0;
    padding: 0 16px;
    font-size: 18px;
    color: #0D3360;

    .label {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #406088;

      img {
        height: 20px;
        margin-left: 4px;
      }
    }

    .bg {
      width: 165px;
      position: absolute;
      bottom: 0;
      left: 0;
    }

    .doctor {
      position: relative;
      z-index: 2;
      top: -9px;
    }
  }
}

.card {
  padding: 16px 16px 24px;

  .name {
    display: flex;
    align-items: center;
    font-size: 16px;
    color: #333333;
    margin-bottom: 10px;

    .label {
      width: 26px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #FFEEE0;
      font-size: 11px;
      color: #FF8E2E;
      margin-right: 8px;
      border-radius: 2px;
    }
  }

  .title {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #999999;

    .label {
      width: 48px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #DEECFF;
      font-size: 11px;
      color: #2386FF;
      margin-right: 8px;
      border-radius: 2px;
    }
  }
}

.Introduction {
  margin: 16px;
  background: url('@/assets/Introduction.png');
  background-size: 100% 100%;
  height: 335px;
  padding: 8px 12px;
  margin-bottom: 100px;

  .title {
    padding-left: 20px;
    font-size: 16px;
    color: #333333;
  }

  .content {
    margin-top: 12px;
    background: #fff;
    border-radius: 8px;
    padding: 12px 14px;
    color: #666666;
    font-size: 14px;
  }
}

.submit {
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 0 16px 34px;
  background: #fff;

  .btn {
    width: 100%;
    display: flex;
    height: 47px;
    align-items: center;
    justify-content: center;
    background: #2386FF;
    color: #fff;
    font-size: 16px;

    &.disabled {
      background: #EDEFF2;
      color: #BEC2CC;
    }
  }
}
</style>
