<template>
  <div class="yz-wrapper">
    <div class="yz-header">
      <img class="yz-header-img" :src="require('@/assets/img/header.png')" alt="">
      <div class="back">
        <img class="back-icon" src="@/assets/img/back.png" alt="">
        <span class="back-title">返回大屏</span>
      </div>
    </div>
    <div class="yz-main">
      <div class="yz-aside">
        <el-menu
          v-if="navList.length"
          :default-active="'a' + navList[0].id"
          class="el-menu-vertical-demo"
          background-color="transparent"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <el-menu-item
            v-for="item of navList"
            :key="item.id"
            :index="'a' + item.id"
            @click="changeLocation(item.id)"
          >
            <i class="el-icon-menu"></i>
            <span slot="title">{{
              item.name + " " + item.floorNum + " 层"
            }}</span>
          </el-menu-item>
        </el-menu>
      </div>
      <div class="yz-right">
        <div class="condition">
          <div class="power-type-wrapper">
            <span class="power-type-item" v-for="item of lineTypeList" :key="item.type" @click="changeLineType(item.type)">{{item.title}}</span>
          </div>
          <el-date-picker
            v-model="value2"
            align="right"
            type="date"
            placeholder="选择日期"
            :picker-options="pickerOptions"
            @change="changeDate"
          >
          </el-date-picker>
        </div>
        <div class="line">
          <img src="@/assets/img/line.png" alt="">
        </div>
        <div class="echarts-wrapper">
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
          title: "电流"
        },
        {
          type: "voltage",
          title: "电压"
        },
        {
          type: "temperature",
          title: "温度"
        },
      ],
      dId: "1",
      startDate: "2021-06-30",
      endDate: "2021-07-19",
      dataList: {},
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
        shortcuts: [
          {
            text: "今天",
            onClick(picker) {
              picker.$emit("pick", new Date());
            },
          },
          {
            text: "昨天",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", date);
            },
          },
          {
            text: "一周前",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", date);
            },
          },
        ],
      },
      value2: new Date(),
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
          this.navList = res.data;
          this.dId = this.navList[0].id;
        }
      });
    },
    getElectric() {
      getElectric({
        dId: this.dId,
        endDate: this.endDate,
        startDate: this.startDate,
      }).then((res) => {
        this.dataList = res.data;
        this.drawEcharts();
      });
    },
    getTemplate() {
      getTemplate({
        dId: this.dId,
        endDate: this.endDate,
        startDate: this.startDate,
      }).then((res) => {
        this.dataList = res.data;
        this.drawEcharts();
      });
    },
    getVoltage() {
      getVoltage({
        dId: this.dId,
        endDate: this.endDate,
        startDate: this.startDate,
      }).then((res) => {
        this.dataList = res.data;
        this.drawEcharts();
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
      console.log(e);
      this.switchLineType();
    },
    drawEcharts() {
      let _this = this;
      const alist = this.dataList.alist;
      const blist = this.dataList.blist;
      const clist = this.dataList.clist;
      // const nlist = this.dataList.nlist;
      const legendData = [
        alist[0].name,
        blist[0].name,
        clist[0].name,
        // nlist[0].name,
      ];

      let myChart = this.$echarts.init(this.$refs.echarts);

      const option = {
        tooltip: {
          trigger: "item",
        },
        legend: {
          data: legendData,
          itemGap: 5,
        },
        grid: {
          top: "12%",
          left: "1%",
          right: "10%",
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            data: alist.map((item) => {
              return item.actualTime;
            }),
          },
        ],
        yAxis: [
          {
            type: "value",
            // name: "Budget (million USD)",
            axisLabel: {
              formatter: function (a) {
                a = +a;
                return isFinite(a)
                  ? _this.$echarts.format.addCommas(+a / 1000)
                  : "";
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
          },
          {
            type: "inside",
            start: 94,
            end: 100,
          }
        ],
        series: [
          {
            name: alist[0].name,
            type: "line",
            data: alist.map((item) => {
              return item.value;
            }),
          },
          {
            name: blist[0].name,
            type: "line",
            data: blist.map((item) => {
              return item.value;
            }),
          },
          {
            name: clist[0].name,
            type: "line",
            data: clist.map((item) => {
              return item.value;
            }),
          },
          // {
          //   name: nlist[0].name,
          //   type: "line",
          //   data: nlist.map((item) => {
          //     return item.value;
          //   }),
          // },
        ],
      };

      myChart.setOption(option);
    },
  },
  mounted() {
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
      });
    });
  },
};
</script>

<style lang="less" scoped>
@hei: 8.8vh;
@blue: #2CC7F2;
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
    .yz-header-img{
      width: 100%;
      height: 100%;
      vertical-align: top;
    }
    .back{
      position: absolute;
      top: 12px;
      right: 30px;
      color: #2CC7F2;
      display: flex;
      align-items: center;
      cursor: pointer;
      .back-icon{
        margin-right: 10px;
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
      .el-menu {
        height: 100%;
        overflow-x: hidden;
        overflow-y: scroll;
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
        .power-type-wrapper{
          width: 18.3vw;
          height: 4.72vh;
          padding: 0 1.25vw;
      background: url("../../assets/img/bg-power.png");
      background-size: 100% 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .power-type-item{
            display: inline-block;
            padding: 0 0.63vw;
            height: 100%;
            line-height: 1;
            border-bottom: 1px solid @blue;
          }
        }
      }
      .line {
        width: 100%;
        height: 2.3vh;
      }
      .echarts-wrapper {
        flex: auto;
        width: 100%;
        height: 100%;
        .echarts-box {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}
</style>
