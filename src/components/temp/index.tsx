import React from "react";
import * as echarts from "echarts";
import uniqueId from "lodash/uniqueId";
import max from "lodash/max";
import reverse from "lodash/reverse";
import merge from "lodash/merge";
import ResizeObserver from "resize-observer-polyfill";
import {AxisChartProps, AxisChartState} from "./model";
import {ReactChartWrap} from "./styled";
import {defaultFontSize, gridOffset} from "./config";
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
    return (
      <ReactChartWrap id={containerId}>
        {this.renderAxisName()}
      </ReactChartWrap>
    );
  }
  
  /**
   * 生成类目轴与值轴名称dom
   * @description 之所以用dom来生成轴的名称，是因为echarts本身的轴名的距离调整不严谨准确
   */
  renderAxisName = () => {
    return (
      <>
        <span/>
      </>
    );
  }
  
  /** 图表参数配置 */
  chartOption = () => {
    const { chartOption, mergeOption } = this.props;
    const defaultOption = this.genDefaultOption();
    this.chartsInstance?.setOption(merge(defaultOption, chartOption), !mergeOption);
  }
  
  /** 默认处理配置 */
  genDefaultOption = () => {
    const { theme, data } = this.props;
    const categoryDataArray = data.map(item => item[1]);
    const valueDataArray = data.map(item => item[2]);
    
    const axisLabelObj = {
      axisLabel: {
        fontSize: defaultFontSize,
      },
    };
    const xAxisObj = {
      xAxis: theme === "vertical"
        ?
        {
          type: "category",
          data: categoryDataArray,
          ...axisLabelObj,
        }
        :
        {
          type: "value",
          ...axisLabelObj,
        },
    };
    const yAxisObj = {
      yAxis: theme === "vertical"
        ?
        {
          type: "value",
          ...axisLabelObj,
        }
        :
        {
          type: "category",
          data: reverse(categoryDataArray),
          ...axisLabelObj,
        },
    };
    
    const lastCategoryItemOffset = theme === "vertical"
      ? categoryDataArray[categoryDataArray.length - 1].length * defaultFontSize / 2
      : 0;
    const maxValue = max(valueDataArray);
    const lastValueItemOffset = theme === "horizontal"
      ? `${maxValue}`.length * defaultFontSize / 2
      : 0;
    
    return {
      grid: {
        top: defaultFontSize / 2 + gridOffset,
        left: gridOffset,
        right: gridOffset + lastCategoryItemOffset + lastValueItemOffset,
        bottom: gridOffset,
        containLabel: true,
      },
      tooltip: {
        confine: true,
      },
      ...xAxisObj,
      ...yAxisObj,
      series: [
        {
          name: "衣物销量",
          type: "bar",
          data: theme === "horizontal" ? reverse(valueDataArray) : valueDataArray,
        }
      ],
    };
  }
}
