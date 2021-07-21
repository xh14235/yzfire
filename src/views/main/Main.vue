<template>
  <div class="yz-wrapper">
    <div class="yz-header">
      <img
        class="yz-header-img"
        :src="require('@/assets/img/header.png')"
        alt=""
      />
      <div class="back">
        <img class="back-icon" src="@/assets/img/back.png" alt="" />
        <a href="http://116.236.30.222:9404" class="back-title">返回大屏</a>
      </div>
    </div>
    <div class="yz-main">
      <div class="yz-aside">
        <el-menu
          v-if="navList.length"
          :default-active="'a' + navList[0][0].id"
          unique-opened
          class="el-menu-vertical-demo"
          background-color="transparent"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <el-submenu
            :index="item[0].number"
            v-for="item of navList"
            :key="item[0].number"
          >
            <template slot="title">
              <img
                class="nav-icon1"
                src="@/assets/img/building-icon.png"
                alt=""
              />
              <span class="nav-title1">{{ item[0].name }}</span>
            </template>
            <el-menu-item
              v-for="i of item"
              :key="i.id"
              :index="'a' + i.id"
              @click="changeLocation(i.id)"
            >
              <span slot="title">{{ i.name + " " + i.floorNum + " 层" }}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </div>
      <div class="yz-right">
        <div class="condition">
          <div class="power-type-wrapper">
            <span
              class="power-type-item"
              :class="{ active: item.type === lineType }"
              v-for="item of lineTypeList"
              :key="item.type"
              @click="changeLineType(item.type)"
              >{{ item.title }}</span
            >
          </div>
          <el-date-picker
            v-model="dateList"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="changeDate"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
          >
          </el-date-picker>
        </div>
        <div class="line">
          <img src="@/assets/img/line.png" alt="" />
        </div>
        <div
          class="echarts-wrapper"
          v-loading="loading"
          element-loading-text="拼命加载中"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.5)"
        >
          <div class="echarts-box" ref="echarts" id="echarts-box"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  login,
  getNavList,
  getTemplate,
  getElectric,
  getVoltage,
} from "@/http/api";
import { mapState, mapMutations } from "vuex";
import axios from "axios";
export default {
  name: "Main",
  data() {
    return {
      baseUrl: "http://116.236.30.222:9800",
      navList: [],
      lineType: "electric",
      lineTypeList: [
        {
          type: "electric",
          title: "电流",
        },
        {
          type: "voltage",
          title: "电压",
        },
        {
          type: "temperature",
          title: "温度",
        },
      ],
      dId: "1",
      dateList: [],
      dataList: {},
      loading: false,
    };
  },
  computed: {
    ...mapState(["token"]),
  },
  watch: {
    lineType: {
      handler() {
        switch (this.lineType) {
          case "electric":
            this.getElectric();
            break;
          case "temperature":
            this.getTemplate();
            break;
          case "voltage":
            this.getVoltage();
            break;
          default:
            break;
        }
      },
    },
  },
  methods: {
    ...mapMutations(["mutToken"]),
    getNavList() {
      getNavList().then((res) => {
        if (res.success) {
          let list1 = [];
          let list2 = [];
          for (let i = 0; i < res.data.length; i++) {
            if (res.data[i].number === "6") {
              list1.push(res.data[i]);
            }
            if (res.data[i].number === "7") {
              list2.push(res.data[i]);
            }
          }
          this.navList = [list1, list2];
          this.dId = this.navList[0][0].id;
        }
      });
    },
    getElectric() {
      this.loading = true;
      getElectric({
        dId: this.dId,
        endDate: this.dateList[1],
        startDate: this.dateList[0],
      }).then((res) => {
        if (res.success) {
          this.loading = false;
          this.dataList = res.data;
          this.drawEcharts();
        }
      });
    },
    getTemplate() {
      this.loading = true;
      getTemplate({
        dId: this.dId,
        endDate: this.dateList[1],
        startDate: this.dateList[0],
      }).then((res) => {
        if (res.success) {
          this.loading = false;
          this.dataList = res.data;
          this.drawEcharts();
        }
      });
    },
    getVoltage() {
      this.loading = true;
      getVoltage({
        dId: this.dId,
        endDate: this.dateList[1],
        startDate: this.dateList[0],
      }).then((res) => {
        if (res.success) {
          this.loading = false;
          this.dataList = res.data;
          this.drawEcharts();
        }
      });
    },
    changeLineType(type) {
      this.lineType = type;
    },
    changeLocation(id) {
      this.dId = id;
      this.switchLineType();
    },
    switchLineType() {
      switch (this.lineType) {
        case "electric":
          this.getElectric();
          break;
        case "temperature":
          this.getTemplate();
          break;
        case "voltage":
          this.getVoltage();
          break;
        default:
          break;
      }
    },
    changeDate(e) {
      this.dateList = e;
      this.switchLineType();
    },
    drawEcharts() {
      const alist = this.dataList.alist;
      const blist = this.dataList.blist;
      const clist = this.dataList.clist;

      let legendData;
      let unit;
      if (!alist.length || !blist.length || !clist.length) {
        legendData = ["暂无数据", "暂无数据", "暂无数据"];
        unit = " ";
      } else {
        legendData = [alist[0].name, blist[0].name, clist[0].name];
        unit = alist[0].unit;
      }

      let myChart = this.$echarts.init(this.$refs.echarts);

      const option = {
        tooltip: {
          trigger: "item",
        },
        legend: {
          data: legendData,
          itemGap: 80,
          textStyle: {
            fontSize: 16,
            color: "#ffffff",
          },
          left: "5%",
          top: "7%",
        },
        color: ["#01aaaa", "#2190fe", "#f75dae"],
        grid: {
          top: "12%",
          left: "1%",
          right: "1%",
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            data: alist.map((item) => {
              return item.actualTime;
            }),
            spiltLine: {
              show: true,
            },
            boundaryGap: false,
            axisLabel: {
              show: true,
              textStyle: {
                fontSize: 12,
                color: "#657ea9",
              },
            },
            axisLine: {
              lineStyle: {
                color: "#657ea9",
              },
            },
          },
        ],
        yAxis: [
          {
            type: "value",
            name: "(" + unit + ")",
            spiltLine: {
              show: true,
            },
            boundaryGap: false,
            axisLabel: {
              show: true,
              textStyle: {
                fontSize: 12,
                color: "#657ea9",
              },
            },
            axisLine: {
              lineStyle: {
                color: "#657ea9",
              },
            },
          },
        ],
        dataZoom: [
          {
            type: "slider",
            show: true,
            start: 94,
            end: 100,
            handleSize: 8,
            textStyle: {
              color: "#ffffff",
            },
          },
          {
            type: "inside",
            start: 94,
            end: 100,
            textStyle: {
              color: "#ffffff",
            },
          },
        ],
        series: [
          {
            name: legendData[0],
            type: "line",
            smooth: true,
            data: alist.map((item) => {
              return item.value;
            }),
          },
          {
            name: legendData[1],
            type: "line",
            smooth: true,
            data: blist.map((item) => {
              return item.value;
            }),
          },
          {
            name: legendData[2],
            type: "line",
            smooth: true,
            data: clist.map((item) => {
              return item.value;
            }),
          },
        ],
      };

      myChart.setOption(option, true);

      window.onresize = function () {
        myChart.resize();
      };
    },
  },
  mounted() {
    this.dateList = ["2021-06-01", "2021-07-30"];
    login({
      username: "portal",
      password:
        "IURzGaTdY2uQ1aDNQzw9noWlKvO0Ewh7cfwD0DfXrTBgo0M3oIW4JizIXGdDxTiZJbciG1TVjZRdIaqHOgWH6K93Z2QSq+j/40gS632cntRYqXir+muVDWaicFU4KVFe7NSCS/ywecp0/O4yRzvBL/L+U12bimoBrA/6gFN9uNQ=",
    }).then((res) => {
      let token = res.data.tokenHead + res.data.token;
      this.mutToken(token);
      this.$nextTick(() => {
        this.getNavList();
        this.getElectric();
        axios.get("http://116.236.30.222:9800/energy/detector/findByBuilding/3").then(res => {
          console.log(res.data.data);
        })
      });
    });
  },
};
</script>

<style lang="less" scoped>
@hei: 8.8vh;
@blue: #2cc7f2;
.yz-wrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: url("../../assets/img/bg.png");
  background-size: 100% 100%;
  color: #ffffff;
  .yz-header {
    height: @hei;
    position: relative;
    .yz-header-img {
      width: 100%;
      height: 100%;
      vertical-align: top;
    }
    .back {
      position: absolute;
      top: 12px;
      right: 30px;
      display: flex;
      align-items: center;
      cursor: pointer;
      .back-icon {
        margin-right: 10px;
      }
      .back-title {
        color: @blue;
      }
    }
  }
  .yz-main {
    height: calc(100vh - @hei);
    display: flex;
    .yz-aside {
      flex: 0 0 20%;
      width: 20%;
      height: 100%;
      background: url("../../assets/img/bg-left.png");
      background-size: 100% 100%;
      padding-top: 7.5vh;
      .el-menu {
        height: 100%;
        overflow-x: hidden;
        overflow-y: scroll;
        border-right: 0;
        /deep/.el-submenu__title {
          padding-left: 2.3vw !important;
          padding-right: 2.6vw;
          &:focus,
          &:hover {
            background-color: transparent !important;
          }
          .nav-icon1 {
            width: 22px;
            margin-right: 14px;
          }
          .nav-title1 {
            font-size: 1.852vh;
            font-weight: 600;
          }
          .el-submenu__icon-arrow {
            color: #ffffff;
            right: 2.6vw;
          }
        }
        /deep/.el-menu {
          .el-menu-item {
            padding-left: 5.73vw !important;
            color: #999999 !important;
            font-size: 1.666667vh;
            &:focus,
            &:hover,
            &.is-active {
              background-color: transparent;
              background: url("../../assets/img/nav-active.png");
              background-size: 100% 100%;
              color: #ffffff !important;
            }
          }
        }
      }
    }
    .yz-right {
      flex: 0 0 80%;
      width: 80%;
      height: 100%;
      background: url("../../assets/img/bg-right.png");
      background-size: 100% 100%;
      .condition {
        flex: 0 0 11.6vh;
        width: 100%;
        padding: 0 3.5vw;
        padding-top: 12px;
        height: 11.6vh;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .power-type-wrapper {
          width: 18.3vw;
          height: 4.72vh;
          padding: 0 1.25vw;
          background: url("../../assets/img/bg-power.png");
          background-size: 100% 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .power-type-item {
            display: inline-block;
            padding: 0 0.63vw;
            height: 4.72vh;
            line-height: 4.72vh;
            border-bottom: 2px solid transparent;
            color: @blue;
            cursor: pointer;
            &.active {
              border-bottom: 2px solid @blue;
            }
          }
        }
        .el-input__inner {
          background-color: transparent;
          border: 1px solid @blue;
          /deep/.el-range-input {
            background: transparent;
            color: @blue;
          }
          /deep/.el-range-separator {
            color: @blue;
          }
        }
      }
      .line {
        width: 100%;
        height: 2.3vh;
        img {
          vertical-align: top;
          width: 100%;
          height: 2.3vh;
        }
      }
      .echarts-wrapper {
        flex: auto;
        width: 100%;
        padding: 0 3.125vw;
        height: 75vh;
        .echarts-box {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}
</style>
