/**
 * 传入config对象进行裁剪
 * str为目标，config对象为配置
 * config{
 *   cut_len 保留长度，默认10
 *   cut_poly 最后一位为中文且刚好超出时的取舍策略，true取/false舍，默认false
 *   fill_flag  超出时的填充物符号，默认为.
 *   fill_len 填充物长度，默认为3
 *   do_trim 裁剪前后空格操作，true开/false关，默认true
 * }
 */
//lodash里处理emoji的一段代码，将字符串中的每一个字符都拆成数组之一（否则一个emoji会占几个字符）
import { toArray } from "./toArray";
export const cutString = (str, config = {}) => {
  //初始化默认参数,使用&&代替了if，参数为空时使用默认值
  isNot(config.cut_len) && (config.cut_len = 10);
  isNot(config.cut_poly) && (config.cut_poly = false);
  isNot(config.fill_flag) && (config.fill_flag = ".");
  isNot(config.fill_len) && (config.fill_len = 3);
  isNot(config.do_trim) && (config.do_trim = true);
  //预处理
  str = doAdjust(str, config);
  //裁剪填充
  str = doCut(str, config);
  return str;
};

//判断是否为null，undefined
const isNot = parm => parm === null || parm === undefined;

//求字符串长度（若是将任意字符视为一个字节，用下面第一个，否则用第二个）
const getStrLen = str => toArray(str).length;
// const getStrLen = str => str.replace(/[^\x00-\xff]/g, "01").length;

//对接受的字符串进行预处理
const doAdjust = (str, config) => {
  //检测空值
  let errArr = [null, undefined, ""];
  if (errArr.includes(str)) {
    printErr(1);
    return "";
  }
  if (config.cut_len < 0) {
    printErr(2);
    return "";
  }
  if (config.fill_len < 0) {
    printErr(3);
    return "";
  }
  //转换为字符串
  if (typeof str !== "string") {
    str = String(str);
  }
  return str;
};
//长度判断：实际长度大于标准，但策略为入，且只因为最后一字导致超出范围
const isOk = (str, config) => {
  const max = config.cut_len;
  const str_len = getStrLen(str);
  // 最后一个字符有可能为emoji，所以用Array先分组
  const str_arr = toArray(str);
  const last = getStrLen(str_arr[str_arr.length - 1]);
  if (config.cut_poly && str_len - last < max) {
    return true;
  } else {
    return false;
  }
};
//裁剪
const doCut = (str, config) => {
  if (str === "") return "";
  //删除空格操作
  config.do_trim && (str = str.trim());

  //获得字符串实际长度
  let str_len = getStrLen(str);

  //若实际长度小于标准，则直接返回
  if (str_len <= config.cut_len) return str;
  //若实际长度大于标准，但策略为入，且只因为最后一字导致超出范围，也直接返回(条件过复杂，抽出为方法)
  else if (isOk(str, config)) return str;
  //若实际长度大于标准，则需要裁剪并填充
  else {
    let temp = "";
    let temp_len = 0;
    //考虑到emoji的存在，需要先进行Array.from
    for (let item of toArray(str)) {
      //若该字的长度加上当前长度大于最大长度，且策略为舍时，结束循环
      if (getStrLen(item) + temp_len > config.cut_len && !config.cut_poly)
        break;
      //若长度正常满足，结束循环
      if (temp_len >= config.cut_len) break;
      //若长度不满足，继续增长
      else {
        temp += item;
        temp_len += getStrLen(item);
      }
    }
    //填充
    return (temp += config.fill_flag.repeat(config.fill_len));
  }
};

//error函数
const printErr = num => {
  switch (num) {
    case 1: {
      console.log("裁剪的字符串为空/undefined/null");
      break;
    }
    case 2: {
      console.log("裁剪的长度不能为负数");
      break;
    }
    case 3: {
      console.log("填充的长度不能为负数");
      break;
    }
  }
};
