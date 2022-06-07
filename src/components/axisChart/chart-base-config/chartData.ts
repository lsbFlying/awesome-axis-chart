import { ITable } from "../interface";

/**
 * 数据模版
 * created by liushanbao
 * @author liushanbao
 * @description todo head、prefix、suffix的第一个索引值暂时未用到，后续功能优化使用
 */
export const chartData: ITable = {
  /** head索引1，2，3分别对应类目轴标题名，双值轴中的副值轴标题名以及值轴标题名(注意：这里不要带单位，单位有unitFix/suffix进行拼接) */
  // head: ["ID", "单位：", "单位：", "单位："],
  head: ["ID", "", "", ""],
  data: [],
  /**
   * x：tooltip类目前缀，xx：tooltip系列数据seriesName前缀，xxx：tooltip：数据值value前缀
   * prefix: ["ID前缀", "x", "xx", "xxx"],
   * x：tooltip类目后缀(类目轴name后缀)，xx：tooltip系列数据seriesName后缀(副值轴name后缀)，xxx：tooltip：数据值value后缀(主值轴name后缀)
   * suffix与unitFix共同作用，suffix还作用于tooltip，unitFix只作用于轴name，且suffix在unitFix之后
   * suffix: ["ID后缀", "x", "xx", "xxx"],
   */
  prefix: ["ID前缀", "", "", ""],
  // suffix: ["ID后缀", "", ":", "xy"],
  suffix: ["ID后缀", "", "", ""],
};
