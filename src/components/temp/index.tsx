import React from "react";
import * as echarts from "echarts";
import max from "lodash/max";
import reverse from "lodash/reverse";
import uniq from "lodash/uniq";
import merge from "lodash/merge";
import ResizeObserver from "resize-observer-polyfill";
import {AxisChartProps, AxisChartState, ResizeObserverType} from "./model";
import {
  defaultAxisLabelMargin, defaultFontSize, legendConfig, legendIconTextDiff, legendBottomMargin,
} from "./option";
import {EChartsType} from "echarts/types/dist/echarts";

export class AxisChart extends React.PureComponent<AxisChartProps, AxisChartState> {
  
  static defaultProps = {
    data: [],
    theme: "vertical",
    mergeOption: true,
  };
  
  state: AxisChartState = {
    containerRef: React.createRef<HTMLElement>(),
  };
  
  /** 图表实例 */
  private chartsInstance: EChartsType | null = null;
  /** 外层容器尺寸变化容器监听的事件实例 */
  private myObserver: ResizeObserverType | null = null;
  
  componentDidMount() {
    const { containerRef } = this.state;
    this.chartsInstance = echarts.init(containerRef.current as HTMLElement);
    this.myObserver = new ResizeObserver(() => {
      this.chartsInstance?.resize();
      this.chartOption();
    });
    this.myObserver.observe(containerRef.current as Element);
  }
  
  componentWillUnmount() {
    const { containerRef } = this.state;
    this.chartsInstance?.dispose();
    this.myObserver?.unobserve(containerRef.current as Element);
  }
  
  render() {
    const { containerRef } = this.state;
    return (
      <div
        ref={containerRef as any}
        style={{ width: "100%", height: "100%" }}
      />
    );
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
    if (!this.chartsInstance) return;
    const { theme, data, option } = this.props;
    const chartWidth = this.chartsInstance.getWidth();
    const categoryDataArray = uniq(data.map(item => item[1]));
    const allSeriesValueDataArray = data.map(item => item[2]);
    const isVertical = theme.includes("vertical");
    const maxValue = max(allSeriesValueDataArray);
    const seriesTypes: string[] = uniq(data.map(item => item[0]));
    
    // 先合并，然后取合并值配置或者无配置则按默认配置处理
    const chartOptions = merge({
      tooltip: {
        confine: true,
      },
      series: seriesTypes.map(item => {
        const dataTemp = data.filter(itemF => itemF[0] === item).map(itemM => itemM[2]);
        return {
          name: item,
          type: "bar",
          data: isVertical ? dataTemp : reverse(dataTemp),
        };
      }),
    }, option);
    
    if (theme === "verticalInverse") {
      chartOptions.xAxis = merge({ position: "top" }, option.xAxis);
      chartOptions.yAxis = merge({ inverse: true }, option.yAxis);
    }
  
    if (theme === "horizontalInverse") {
      chartOptions.xAxis = merge({ inverse: true }, option.xAxis);
      chartOptions.yAxis = merge({ position: "right" }, option.yAxis);
    }
    
    const chartOptionValueAxis: any = chartOptions[isVertical ? "yAxis" : "xAxis"];
    const chartOptionCategoryAxis: any = chartOptions[isVertical ? "xAxis" : "yAxis"];
    
    const valueAxisNameFontSize = chartOptionValueAxis?.nameTextStyle?.fontSize || defaultFontSize;
    const valueAxisName = chartOptionValueAxis?.name || "";
    const valueAxisNamePaddingLeftOrRight = -(
      `${maxValue}`.length * valueAxisNameFontSize / 2
      + (chartOptionValueAxis?.axisLabel?.margin || defaultAxisLabelMargin)
      // +2是为了弥补边界的距离处理
      + 2
    );
    // 只有一条值轴时，该值轴是否在右侧
    const singleValueAxisAlignRight = chartOptionValueAxis?.position === "right";
  
    // 值轴是否有设置上下(垂直时)或者左右(水平时)反向颠倒
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
          :
          [
            0,
            !isVertical && valueAxisInverse
              ? -valueAxisNameFontSize * (valueAxisName.length - 1)
              : -valueAxisNameFontSize,
            0,
            0,
          ],
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
  
    // legend的是否换行很难计算，所以干脆保持最宽泛的原始配置项
    const legendObj = {
      legend: merge(legendConfig, chartOptions?.legend),
    };
    const legendPadding = legendObj.legend.padding;
    const legendPaddingLeftRight = typeof legendPadding === "number"
      ? legendPadding
      : legendPadding.length === 1
        ? legendPadding[0]
        : legendPadding.length === 2 || legendPadding.length === 3
          ? legendPadding[1]
          : legendPadding[1] + legendPadding[3];
    
    const legendRangeWidth = chartWidth - legendPaddingLeftRight;
    
    let legendRows = 1;
    // 每一行累计的legend的宽度
    let rowReduceLegendItemWidth = 0;
    // 精确算出legend在不实用滚动类型的情况下会换行换几行
    seriesTypes.forEach((item, index, array) => {
      // 当前这个图例的宽度，不包含itemGap的距离
      const curLegendItemWidth = item.length * (legendObj.legend.textStyle?.fontSize || defaultFontSize)
        + legendObj.legend.itemWidth + legendIconTextDiff + legendObj.legend.itemGap;
      
      rowReduceLegendItemWidth += curLegendItemWidth;
      
      const nextItem = array[index + 1];
      // 包含itemGap
      const nextLegendItemWidth = nextItem
        ? nextItem.length * (legendObj.legend.textStyle?.fontSize || defaultFontSize)
          + legendObj.legend.itemWidth + legendIconTextDiff + legendObj.legend.itemGap
        : 0;
      
      // 真正的最终legend的宽度需要去除最后一个legend的右侧gap距离
      const zDiffWidth = rowReduceLegendItemWidth - legendObj.legend.itemGap;
      const condition = zDiffWidth > legendRangeWidth
        || (zDiffWidth === legendRangeWidth && index < (array.length - 1))
        || zDiffWidth > legendRangeWidth
        || (zDiffWidth + nextLegendItemWidth) > legendRangeWidth;
      
      if (condition) {
        legendRows++;
        // 此时需要清零重新计算累计的图例宽度
        rowReduceLegendItemWidth = 0;
      }
    });
  
    const legendPaddingTopBottom = typeof legendPadding === "number"
      ? legendPadding
      : legendPadding.length === 1
        ? legendPadding[0]
        : legendPadding.length === 2
          ? legendPadding[0]
          : legendPadding[0] + legendPadding[2];
    
    const legendRangeHeight = legendObj.legend.itemHeight * legendRows
      + legendObj.legend.itemGap * (legendRows - 1) + legendPaddingTopBottom;
    
    const valueAxisLabelFontSize = chartOptionValueAxis?.axisLabel?.fontSize || defaultFontSize;
    
    const lastValueItemOffset = !isVertical
      /**
       * / 4是因为值轴数字是一半在split线上，另外值轴的数字是常规汉字的一半字体宽度大小
       * + valueAxisLabelFontSize * 2 是为了扩大边界展示区域，这样美观舒适
       */
      ? (`${maxValue}`.length + 1) * valueAxisLabelFontSize / 4  + valueAxisLabelFontSize * 2
      : 0;
    
    // 不包含legend的相关尺寸考虑
    const gridTopOrBottom = isVertical
      // + valueAxisNameFontSize * 2 是为了扩大边界展示区域，这样美观舒适
      ? valueAxisLabelFontSize / 2 + valueAxisNameFontSize * 2
      : 0;
    
    const gridObj = {
      grid: merge({
        top: valueAxisInverse ? 0 : gridTopOrBottom,
        right: !isVertical && valueAxisInverse ? 0 : lastValueItemOffset,
        bottom: valueAxisInverse ? gridTopOrBottom : 0,
        left: !isVertical && valueAxisInverse ? lastValueItemOffset : 0,
        containLabel: true,
      }, chartOptions.grid),
    };
    console.log((chartWidth - 30) / seriesTypes[0].length / 12)
    return {
      ...chartOptions,
      ...gridObj,
      ...legendObj,
      ...xAxisObj,
      ...yAxisObj,
    };
  }
}
