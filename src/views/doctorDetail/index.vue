<template>
  <div class="doctor-home">
    <!-- header -->
    <header class="header">
      <button class="back">←</button>
      <h1>医师主页</h1>
      <button class="menu">⋮</button>
    </header>

    <!-- banner -->
    <section class="banner">
      <p class="tip">线上看诊，为健康省点时间</p>
      <div class="info">
        <p class="name">
          徐立 <span class="tag">知名专家</span>
        </p>
        <p class="dept">北京朝阳医院常营院区 · 心内科</p>
      </div>
      <button class="fav">★</button>
    </section>

    <!-- doctor card -->
    <section class="card">
      <div class="card-top">
        <div>
          <p class="name">
            徐立 <span class="tag">知名专家</span>
          </p>
          <p class="dept">北京朝阳医院常营院区 · 心内科</p>
        </div>
        <span class="score">5.0</span>
      </div>
      <p class="desc">
        冠心病的临床与介入治疗。<a href="#">详情</a>
      </p>
    </section>

    <!-- tabs -->
    <nav class="tabs">
      <div
        class="tab"
        :class="{ active: activeTab === 'intro' }"
        @click="activeTab = 'intro'"
      >
        医师简介
      </div>
      <div
        class="tab"
        :class="{ active: activeTab === 'review' }"
        @click="activeTab = 'review'"
      >
        患者评价
      </div>
      <div
        class="tab"
        :class="{ active: activeTab === 'qa' }"
        @click="activeTab = 'qa'"
      >
        健康问答
      </div>
    </nav>

    <!-- tab content -->
    <section class="content">
      <div v-if="activeTab === 'intro'">
        <h2>医师简介</h2>
        <p>
          先后于浙江大学医学院、中国协和医科大学和首都医科大学求学，曾赴澳大利亚墨尔本大学、西部医院和美国克利夫兰医学中心短期进修。
          现工作于首都医科大学附属北京朝阳医院心脏中心，主要从事冠心病的临床与介入治疗工作，系卫生部心血管介入治疗培训基地导师（冠心病介入）。
        </p>
        <p>
          长期参与心血管临床和冠心病临护工作，能诊断处理大部分心血管疾病和危重急症。
          年完成冠状动脉介入手术约400余例，无严重并发症。
        </p>
      </div>

      <div v-else-if="activeTab === 'review'">
        <h2>患者评价</h2>
        <p>暂无患者评价。</p>
      </div>

      <div v-else-if="activeTab === 'qa'">
        <h2>健康问答</h2>
        <p>暂无健康问答。</p>
      </div>
    </section>

    <!-- hospital info -->
    <section class="hospital">
      <h2>医师简介</h2>
      <p>首都医科大学附属北京朝阳医院-常营院区 三甲</p>
      <p>北京市朝阳区东十里堡路3号院</p>
      <p>电话：010-85231777</p>
    </section>

    <!-- bottom button -->
    <footer class="footer">
      <button class="btn">预约服务</button>
    </footer>
  </div>
</template>

<script setup>
import { ref } from "vue";

const activeTab = ref("intro");
</script>

<style lang="scss" scoped>
.doctor-home {
  background: #f7f8fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #eee;
    background: #fff;

    h1 {
      font-size: 16px;
      font-weight: bold;
    }
    button {
      background: none;
      border: none;
      font-size: 18px;
    }
  }

  .banner {
    background: #e8f2ff;
    padding: 16px;
    position: relative;

    .tip {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }
    .name {
      font-size: 16px;
      font-weight: bold;
      .tag {
        font-size: 12px;
        color: #ff6600;
        margin-left: 4px;
      }
    }
    .dept {
      font-size: 13px;
      color: #555;
    }
    .fav {
      position: absolute;
      right: 10px;
      top: 10px;
      border: none;
      background: none;
      font-size: 18px;
      color: #aaa;
    }
  }

  .card {
    background: #fff;
    margin: -20px 16px 0;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    padding: 12px;

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .name {
        font-weight: bold;
        .tag {
          font-size: 12px;
          color: #ff6600;
        }
      }
      .dept {
        font-size: 13px;
        color: #666;
      }
      .score {
        background: #ffeedd;
        color: #ff6600;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
      }
    }

    .desc {
      font-size: 13px;
      color: #666;
      margin-top: 6px;

      a {
        color: #1677ff;
        text-decoration: none;
      }
    }
  }

  .tabs {
    display: flex;
    border-bottom: 1px solid #eee;
    margin-top: 16px;
    background: #fff;

    .tab {
      flex: 1;
      text-align: center;
      padding: 10px;
      font-size: 14px;
      cursor: pointer;
      &.active {
        color: #1677ff;
        border-bottom: 2px solid #1677ff;
        font-weight: bold;
      }
    }
  }

  .content {
    padding: 16px;
    background: #fff;
    font-size: 14px;
    line-height: 1.6;

    h2 {
      font-size: 15px;
      font-weight: bold;
      margin-bottom: 8px;
    }
  }

  .hospital {
    background: #fff;
    margin: 10px 0;
    padding: 16px;
    font-size: 14px;

    h2 {
      font-size: 15px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    p + p {
      margin-top: 4px;
    }
  }

  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #fff;
    padding: 12px;

    .btn {
      width: 100%;
      background: #1677ff;
      color: #fff;
      border: none;
      padding: 12px 0;
      border-radius: 6px;
      font-size: 16px;
      font-weight: bold;
    }
  }
}
</style>
