import React from "react";
import * as echarts from "echarts";
import uniqueId from "lodash/uniqueId";
import max from "lodash/max";
import reverse from "lodash/reverse";
import uniq from "lodash/uniq";
import merge from "lodash/merge";
import ResizeObserver from "resize-observer-polyfill";
import {AxisChartProps, AxisChartState} from "./model";
import {defaultFontSize} from "./option";
import {EChartsType} from "echarts/types/dist/echarts";

export class AxisChart extends React.PureComponent<AxisChartProps, AxisChartState> {
  
  static defaultProps = {
    data: [],
    theme: "vertical",
    mergeOption: true,
  };
  
  state: AxisChartState = {
    containerId: uniqueId("AxisChart"),
  };
  
  /** 图表实例 */
  private chartsInstance: EChartsType | null = null;
  /** 外层容器尺寸变化容器监听的事件实例 */
  private myObserver: any = null;
  
  componentDidMount() {
    const { containerId } = this.state;
    this.chartsInstance = echarts.init(document.getElementById(containerId) as HTMLElement);
    this.chartOption();
    this.myObserver = new ResizeObserver(() => {
      this.chartsInstance?.resize();
    });
    this.myObserver.observe(document.getElementById(containerId));
  }
  
  componentWillUnmount() {
    const { containerId } = this.state;
    this.chartsInstance?.dispose();
    this.myObserver.unobserve(document.getElementById(containerId));
  }
  
  render() {
    const { containerId } = this.state;
    return <div style={{ width: "100%", height: "100%" }} id={containerId}/>;
  }
  
  /** 图表参数配置 */
  chartOption = () => {
    const { mergeOption } = this.props;
    this.chartsInstance?.setOption(this.genDefaultOption(), !mergeOption);
  }
  
  /**
   * 默认配置项
   * 主要针对grid以及各种边界的距离处理
   */
  genDefaultOption = () => {
    const { theme, data, option } = this.props;
    const categoryDataArray = uniq(data.map(item => item[1]));
    const allSeriesValueDataArray = data.map(item => item[2]);
    const isVertical = theme === "vertical";
    const maxValue = max(allSeriesValueDataArray);
    const seriesTypes = uniq(data.map(item => item[0]));
    
    // 先合并，然后取合并值配置或者无配置则按默认配置处理
    const chartOptions = merge({
      tooltip: {
        confine: true,
      },
      series: seriesTypes.map(item => {
        return {
          name: item,
          type: "bar",
          data: data.filter(itemF => itemF[0] === item).map(itemM => itemM[2]),
        };
      }),
    }, option);
    
    const chartOptionValueAxis: any = chartOptions[isVertical ? "yAxis" : "xAxis"];
    const chartOptionCategoryAxis: any = chartOptions[isVertical ? "xAxis" : "yAxis"];
    
    const valueAxisNameFontSize = chartOptionValueAxis?.nameTextStyle?.fontSize || defaultFontSize;
    const valueAxisName = chartOptionValueAxis?.name || "";
    // +2是为了弥补边界的距离处理
    const valueAxisNamePaddingLeftOrRight = -(`${maxValue}`.length * valueAxisNameFontSize / 2 + 8 + 2);
    // 只有一条值轴时，该值轴是否在右侧
    const singleValueAxisAlignRight = chartOptionValueAxis?.position === "right";
    // 值轴是否有设置上下反向颠倒
    const valueAxisInverse = chartOptionValueAxis?.inverse;
    /**
     * 类目轴添加轴名称或者单位的情况少之又少，
     * 这里暂时不考虑处理类目轴名称，后续看情况考虑是否添加
     */
    const valueAxisNameObj = {
      name: valueAxisName,
      nameGap: valueAxisNameFontSize * 1.5,
      nameTextStyle: {
        fontSize: valueAxisNameFontSize,
        padding: isVertical
          ? singleValueAxisAlignRight
            ? [0, valueAxisNamePaddingLeftOrRight, 0, 0]
            : [0, 0, 0, valueAxisNamePaddingLeftOrRight]
          : [0, valueAxisNameFontSize, 0, 0],
        /**
         * 这个echarts的轴名称单位的水平对齐方式感觉有点反直觉，不知道是bug还是什么，
         * 但是好多个版本都一直如此，需要注意后续如果有版本改动为符合直觉的设置，这里需要同步更改对应
         */
        align: isVertical
          ? singleValueAxisAlignRight ? "right" : "left"
          : "right",
      },
    };
    
    const axisTickObj = {
      axisTick: {
        alignWithLabel: true,
      },
    };
    
    const xAxisObj = {
      xAxis: merge(isVertical
        ?
        {
          type: "category",
          boundaryGap: true,
          data: categoryDataArray,
          ...axisTickObj,
        }
        :
        {
          type: "value",
          ...valueAxisNameObj,
        }, chartOptions.xAxis),
    };
    
    const yAxisObj = {
      yAxis: merge(isVertical
        ?
        {
          type: "value",
          ...valueAxisNameObj,
        }
        :
        {
          type: "category",
          data: reverse(categoryDataArray),
          ...axisTickObj,
        }, chartOptions.yAxis),
    };
    
    const valueAxisLabelFontSize = chartOptionValueAxis?.axisLabel?.fontSize || defaultFontSize;
    const categoryAxisLabelFontSize = chartOptionCategoryAxis?.axisLabel?.fontSize || defaultFontSize;
    const lastValueItemOffset = !isVertical
      ? (`${maxValue}`.length + 1) * valueAxisLabelFontSize / 4
      : 0;
    const gridTopOrBottom = isVertical
      ? valueAxisLabelFontSize / 2 + categoryAxisLabelFontSize * 2
      : 0;
    const gridObj = {
      grid: merge({
        top: valueAxisInverse ? 0 : gridTopOrBottom,
        left: 0,
        right: lastValueItemOffset,
        bottom: valueAxisInverse ? gridTopOrBottom : 0,
        containLabel: true,
      }, chartOptions.grid),
    };
    
    return {
      ...chartOptions,
      ...gridObj,
      ...xAxisObj,
      ...yAxisObj,
    };
  }
}
