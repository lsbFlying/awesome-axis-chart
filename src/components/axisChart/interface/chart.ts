import React from "react";
import { AxisChartICSSProps } from "./icss";

/**
 * created by liushanbao
 * @author liushanbao
 */
export interface AxisChartBasicProps {}

/**
 * created by liushanbao
 * @author liushanbao
 */
export interface AxisChartBasic<P extends AxisChartBasicProps = AxisChartBasicProps, S = {}, SS = any>
  extends React.PureComponent<P, S, SS> {}

/**
 * css接口，命名为ICSS是为了避免与系统重名
 * created by liushanbao
 * @author liushanbao
 * @interface AxisChartICSS
 * @extends {AxisChartBasic<T, S, SS>}
 * @template T
 * @template S
 * @template SS
 */
export interface AxisChartICSS<T extends AxisChartICSSProps = AxisChartICSSProps, S = {}, SS = any>
  extends AxisChartBasic<T, S, SS> {}

/**
 * created by liushanbao
 * @author liushanbao
 */
export interface ChartProps extends AxisChartBasicProps {
  chartData: ITable;
}

/**
 * created by liushanbao
 * @author liushanbao
 */
export interface Chart extends AxisChartBasic {}

/**
 * created by liushanbao
 * @author liushanbao
 */
type StringOrUndefined = string | undefined;

/**
 * 表格数据原始类型
 * created by liushanbao
 * @author liushanbao
 */
interface ITablePrototype {
  /** 表头标题 */
  head: string[];
  /** 数据，第一列是唯一索引，可用于内外交互，之后的列用于存储具体字段 */
  data: (string | number)[][];
  /** data字段渲染前缀 */
  prefix?: StringOrUndefined[];
  /** data字段渲染后缀 */
  suffix?: StringOrUndefined[];
}

/**
 * 表格数据格式
 * created by liushanbao
 * @author liushanbao
 */
export interface ITable extends ITablePrototype {
  head: [string, string, string, string];
  data: [string, string, string, number][];
  seriesSelfCategoryData?: {
    [key: string]: string[];
  };
  prefix?: [StringOrUndefined, StringOrUndefined, StringOrUndefined, StringOrUndefined];
  suffix?: [StringOrUndefined, StringOrUndefined, StringOrUndefined, StringOrUndefined];
}
