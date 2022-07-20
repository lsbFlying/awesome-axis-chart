import {AxisChartICSS} from "./icss";
import {ECBasicOption} from "echarts/types/dist/shared";

export interface AxisChartState {
  containerId: string;
}

export type AxisChartDataType = [string, string, number];

export interface AxisChartProps extends AxisChartICSS {
  /**
   * 数据源[seriesData, categoryData, valueData][]
   *       系列数据     类目数据        值数据
   *       图例legend  x轴(横向则为y轴) y轴(横向则为x轴)
   */
  data: AxisChartDataType[];
  /** echarts的配置参数(echarts官方文档上的配置项) */
  chartOption?: ECBasicOption;
  /** 主题(垂直/水平) */
  theme: "vertical" | "horizontal";
  /**
   * 是否合并echarts配置项
   * 默认true合并，但是合并会影响图表数据渲染的准确性，所以需要时设置为false不合并->保证每次都是最新的配置项即可
   */
  mergeOption: boolean;
}
