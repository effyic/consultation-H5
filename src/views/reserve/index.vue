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
</script>

<template>
  <div class="headerTab">
    <img alt="返回" src="@/assets/back1.png"
      @click="goback" />
    <div>{{ route.query.departmentName || '' }}</div>
  </div>
  <van-tabs v-model:active="active" style="margin-top: 60px;">
    <van-tab title="日期预约">
      <div class="tabContent">
        <calendar></calendar>
        <div class="weather">
          <img src="@/assets/weather.png" alt="">
          下午
        </div>
        <div class="doctorList">
          <div class="item">
            <div class="avatar"></div>
            <div class="itemContent">
              <div class="name">
                徐立
                <div class="btn"
                  @click="router.push({ path: '/registered', query: { chat_id: route.query.chat_id, departmentName: route.query.departmentName } })">
                  立即挂号
                </div>
              </div>
              <div class="title">副主任医师 {{ route.query.departmentName || '' }}专病</div>
              <div class="label">擅长：{{ route.query.departmentName || '' }}专病</div>
              <div class="registered">
                <div class="registeredItem">
                  <div class="icon" style="background-color: #E3EFFE;">
                    <img src="@/assets/registered.png" alt=""></img>
                  </div>
                  剩余号源：
                  <span style="color: #2386FF;">3</span>
                </div>
                <div class="registeredItem">
                  <div class="icon" style="background-color: #FFF4EA;">
                    <img src="@/assets/price.png" alt=""></img>
                  </div>
                  挂号费：
                  <span style="color: #FF8E2E;">¥ 60.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-tab>
    <van-tab title="专家预约">
      <div class="tabContent">
        <div class="doctorList">
          <div class="item">
            <div class="avatar"></div>
            <div class="itemContent">
              <div class="name">
                徐立
                <div class="btn"
                  @click="router.push({ path: '/registered', query: { chat_id: route.query.chat_id, departmentName: route.query.departmentName } })">
                  立即挂号
                </div>
              </div>
              <div class="title">副主任医师 {{ route.query.departmentName || '' }}专病</div>
              <div class="label">擅长：{{ route.query.departmentName || '' }}专病</div>
              <div class="registered">
                <div class="registeredItem">
                  <div class="icon" style="background-color: #E3EFFE;">
                    <img src="@/assets/registered.png" alt=""></img>
                  </div>
                  剩余号源：
                  <span style="color: #2386FF;">3</span>
                </div>
                <div class="registeredItem">
                  <div class="icon" style="background-color: #FFF4EA;">
                    <img src="@/assets/price.png" alt=""></img>
                  </div>
                  挂号费：
                  <span style="color: #FF8E2E;">¥ 60.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-tab>
  </van-tabs>

</template>

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

.tabContent {
  padding: 16px;

  .weather {
    width: 100%;
    height: 38px;
    display: flex;
    align-items: center;
    padding: 0 6px;
    background-color: #EBF4FF;
    border-radius: 8px 8px 0 0;
    font-size: 14px;
    color: #2386FF;
    margin: 15px 0;

    img {
      width: 16px;
      margin-right: 6px;
    }
  }

  .doctorList {
    width: 100%;

    .item {
      width: 100%;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #F5F5F5;
      margin-bottom: 10px;

      .avatar {
        width: 44px;
        height: 44px;
        margin-right: 12px;
        background: #C2C2C2;
        border-radius: 50%;
      }

      .itemContent {
        flex: 1;

        .name {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;

          .btn {
            width: 80px;
            height: 32px;
            background: #2386FF;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
          }
        }

        .title {
          margin: 3px 0 5px;
          font-size: 13px;
          line-height: 18px;
          color: #666666;
        }

        .label {
          font-size: 13px;
          line-height: 18px;
          color: #999999;
        }

        .registered {
          width: 100%;
          margin: 5px 0 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;

          .registeredItem {
            display: flex;
            align-items: center;
            font-size: 13px;
            color: #303132;

            .icon {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 3px;

              img {
                width: 12px;
              }
            }
          }
        }
      }
    }
  }
}
</style>