<template>
  <div :style="divStyle">{{ strResult }}</div>
</template>

<script>
/*
 * 处理字符串的组件

 * str：要处理的字符串
 * config：处理配置
    * range: 处理范围，由多个有三个值的数组构成的二维数组，如[[0,100,10],[100,200,5]]，表示[0,100)长度的字符串将显示为10px大小,[100,200)长度的字符串将显示为5px大小
    *               第一个值最小长度，支持"min"，表示范围直接到达极小，
    *               第二个值最大长度，支持"max"，表示范围直接到达极大
    *               第三个值字符大小，为数字时会自动添加"px"，但也支持字符串形式，不过必须是可用的如"10px"，"2em"等，若输入了错误的字符串可能导致该该组件无效
    * max_len: 最大长度，超出最大长度时不进行范围判断，将字符串截取至该长度，并字符串变为最小尺寸min_size，
    *          设定该值时，优先级高于处理范围中的max
    *          不设定该值时，将自动从处理范围内取出最大长度，但此时若处理范围中存在max，则该属性失效
    * min_size: 最小尺寸，若为空时，将从处理范围内取出最小的值
    *           不设定该值时，将自动从处理范围中取出最小尺寸
 * 
 * 
 * 输入样例1，使用普通范围搭配max
 *    divStyle = {
 *      str: "12345678",
 *      config: {
 *        range: [["min",5,10],[5,"max",5]]// 字符串长度在5以下（不包括5）时，字体大小将被设定为10，在5或5以上时，字体大小将被设定为5
 *      }
 *    }
 * 输出：<div style="fontSize:5px">12345678</div>
 * 
 * 输入样例2，使用max_len
 *    divStyle = {
 *      str: "12345678",
 *      max_len: 5,
 *      min_size: 10,//最大长度为5，超过该长度时，截取为5并添加...，且其字体大小为10
 *    }
 * 输出：<div style="fontSize:10px">12345...</div>
 * 
 * 输入样例3，混合使用
 *    divStyle = {
 *      str: "12345678",
 *      config: {
 *        range: [["min",5,20],[5,10,15]]
 *        min_size: 10,//字符串长度为5以下时，字体大小为20；5-10之间为大小15；10以上截取到10，并且字体大小设为10
 *      }
 *    }
 */
import { toArray } from "@/utils/toArray.js";
import { cutString } from "@/utils/cutString.js";
export default {
  props: {
    str: {
      require: true,
      type: String
    },
    config: {
      type: Object,
      require: false,
      default: () => {}
    }
  },
  data() {
    return {
      divStyle: {},
      strResult: ""
    };
  },
  methods: {
    setString(config) {
      this.strResult = this.str;
      //获取长度
      const strLen = toArray(this.strResult).length;
      //若最大长度为空，则从范围域中取出最大值
      if (!config.max_len && config.range) {
        let max = 0;
        for (const item of config.range) {
          //若最大长度为空且处理范围内出现了"max"，那么不需要进行最大长度截取
          if (item[2] === "max") break;
          //记录最大长度
          item[2] > max && (max = item[1]);
        }
        config.max_len = max;
      }
      //若未设定最小字体，那么取范围域中取出最小值
      if (!config.min_size && config.range) {
        let min = Infinity;
        for (const item of config.range) {
          //记录最小字体
          parseInt(item[2]) < min && (min = item[2]);
        }
        if (typeof min === "number") min += "px";
        config.min_size = min;
      }

      //若设定了最大长度且长度超标，那么截取字符串，并按最小字体来
      if (config.max_len && strLen >= config.max_len) {
        this.strResult = cutString(this.strResult, { cut_len: config.max_len });
        let temp = {};
        temp.fontSize = isNaN(config.min_size)
          ? config.min_size
          : config.min_size + "px";
        this.divStyle = temp;
        return;
      }
      //读取配置，设定大小
      for (let item of config.range) {
        //item中，0为最小长度，1为最大长度，2为字体大小
        item[0] === "min" && (item[0] = -Infinity);
        item[1] === "max" && (item[1] = Infinity);
        if (strLen >= item[0] && strLen < item[1]) {
          let temp = {};
          temp.fontSize = isNaN(item[2]) ? item[2] : item[2] + "px";
          this.divStyle = temp;
          break;
        }
      }
    }
  },
  watch: {
    //监听字符串长度
    str() {
      this.setString(this.config);
    }
  }
};
</script>
<style scoped></style>
