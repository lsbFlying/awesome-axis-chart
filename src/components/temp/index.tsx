import React from "react";
import * as echarts from "echarts";
import max from "lodash/max";
import reverse from "lodash/reverse";
import merge from "lodash/merge";
import ResizeObserver from "resize-observer-polyfill";
import {AxisChartDataItem, AxisChartProps, AxisChartState, ResizeObserverType} from "./model";
import {
  defaultAxisLabelMargin, defaultFontSize,
  legendBottomMargin, legendConfig, legendIconTextDis,
} from "./option";
import {convertNumToThousand, exactCalcStrFontCount, fit} from "./utils";
import {EChartsType} from "echarts/types/dist/echarts";

export class AxisChart extends React.PureComponent<AxisChartProps, AxisChartState> {
  
  static defaultProps = {
    data: [],
    theme: "vertical",
    legendPlacement: "top",
    mergeOption: true,
    autoFit: false,
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
      (this.chartsInstance as EChartsType).resize();
      this.handleChartOption();
    });
    this.myObserver.observe(containerRef.current as Element);
  }
  
  componentDidUpdate(prevProps: Readonly<AxisChartProps>, prevState: Readonly<AxisChartState>, snapshot?: any) {
    const { autoFit, mergeOption, legendPlacement, theme, option, data, categoryData, pureDataItem } = this.props;
    const {
      autoFit: prevAutoFit, mergeOption: prevMergeOption, legendPlacement: prevLegendPlacement,
      theme: prevTheme, option: prevOption, data: prevData, categoryData: prevCategoryData,
      pureDataItem: prevPureDataItem,
    } = prevProps;
    if (
      data !== prevData || categoryData !== prevCategoryData || option !== prevOption
      || legendPlacement !== prevLegendPlacement || theme !== prevTheme || autoFit !== prevAutoFit
      || mergeOption !== prevMergeOption || pureDataItem !== prevPureDataItem
    ) {
      fit.autoFit = autoFit;
      this.handleChartOption();
    }
  }
  
  componentWillUnmount() {
    const { containerRef } = this.state;
    (this.chartsInstance as EChartsType).dispose();
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
  handleChartOption = () => {
    const { mergeOption } = this.props;
    (this.chartsInstance as EChartsType).setOption(this.genDefaultOption(), !mergeOption);
  }
  
  /**
   * 默认配置项
   * 主要针对grid以及各种边界的距离处理
   */
  genDefaultOption = () => {
    const { theme, data, option, legendPlacement, categoryData, pureDataItem } = this.props;
    const chartWidth = (this.chartsInstance as EChartsType).getWidth();
    // @ts-ignore
    const categoryDataArray = categoryData || (pureDataItem ? [] : data[0]?.data.map((item: AxisChartDataItem) => item.name));
    const isVertical = theme.includes("vertical");
    const seriesNames = data.map(item => `${item.name}`);
    
    // 先合并，然后取合并值配置或者无配置则按默认配置处理
    const chartOptions = merge({
      tooltip: {
        confine: true,
      },
      series: data.map(item => ({
        ...item,
        type: "line",
      })),
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
    
    const valueAxisNameFontSize = fit(chartOptionValueAxis?.nameTextStyle?.fontSize || defaultFontSize);
    const valueAxisName = chartOptionValueAxis?.name || "";
  
    // const allSeriesValueDataArray = data.map(item => item[2]);
    // const maxValue = max(allSeriesValueDataArray);
    // const maxValue = 60;
    const maxValue = 50000000;
    
    const valueAxisNamePaddingLeftOrRight = -(
      exactCalcStrFontCount(convertNumToThousand(maxValue)) * valueAxisNameFontSize
      + fit(chartOptionValueAxis?.axisLabel?.margin || defaultAxisLabelMargin)
    );
    // 只有一条值轴时，该值轴是否在右侧
    const singleValueAxisAlignRight = chartOptionValueAxis?.position === "right";
    
    // 值轴是否有设置上下(垂直时)或者左右(水平时)反向颠倒
    const valueAxisInverse = chartOptionValueAxis?.inverse;
    
    const valueAxisLabelFontSize = fit(chartOptionValueAxis?.axisLabel?.fontSize || defaultFontSize);
    
    /**
     * 类目轴添加轴名称或者单位的情况少之又少，
     * 这里暂时不考虑处理类目轴名称，后续看情况考虑是否添加
     */
    const valueAxisNameObj = {
      name: valueAxisName,
      /**
       * 本质上是gridTop - valueAxisName字体本身的尺寸
       * gridTop是valueAxisLabelFontSize / 2 + valueAxisNameFontSize * 2
       * 去除valueAxisName字体本身的尺寸刚好如下
       */
      nameGap: valueAxisLabelFontSize / 2 + valueAxisNameFontSize,
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
              // -1是弥补计算贴边
              ? -valueAxisNameFontSize * (exactCalcStrFontCount(valueAxisName) - 1)
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
    legendObj.legend.padding = fit(legendObj.legend.padding);
    legendObj.legend.itemGap = fit(legendObj.legend.itemGap);
    legendObj.legend.itemWidth = fit(legendObj.legend.itemWidth);
    legendObj.legend.itemHeight = fit(legendObj.legend.itemHeight);
    
    const legendPadding = legendObj.legend.padding;
    const legendPaddingLeftRight = typeof legendPadding === "number"
      ? legendPadding
      : legendPadding.length === 1
        ? legendPadding[0]
        : legendPadding.length === 2 || legendPadding.length === 3
          ? legendPadding[1]
          : legendPadding[1] + legendPadding[3];
    
    const legendNoPaddingWidth = legendObj.legend.width
      ? legendObj.legend.width - legendPaddingLeftRight
      : chartWidth - legendPaddingLeftRight;
    
    let legendRows = 1;
    // 每一行累计的legend的宽度
    let rowReduceLegendItemWidth = 0;
    const legendFontSize = fit(legendObj.legend.textStyle?.fontSize || defaultFontSize);
    // 精确算出legend在不实用滚动类型的情况下会换行换几行
    seriesNames.forEach((item, index, array) => {
      // 当前这个图例的宽度，不包含itemGap的距离
      const curLegendItemWidth = exactCalcStrFontCount(item)
        * legendFontSize
        + legendObj.legend.itemWidth + legendIconTextDis + legendObj.legend.itemGap;
      
      rowReduceLegendItemWidth += curLegendItemWidth;
      
      const nextItem = array[index + 1];
      // 包含itemGap
      const nextLegendItemWidth = nextItem
        ? exactCalcStrFontCount(nextItem) * legendFontSize
        + legendObj.legend.itemWidth + legendIconTextDis + legendObj.legend.itemGap
        : 0;
      
      // 真正的最终legend的宽度需要去除最后一个legend的右侧gap距离
      const zDiffWidth = rowReduceLegendItemWidth - legendObj.legend.itemGap;
      const condition = zDiffWidth > legendNoPaddingWidth
        || (zDiffWidth === legendNoPaddingWidth && index < (array.length - 1))
        || zDiffWidth > legendNoPaddingWidth
        || (zDiffWidth + nextLegendItemWidth) > legendNoPaddingWidth;
      
      if (condition) {
        legendRows++;
        // 此时需要清零重新计算累计的图例宽度
        rowReduceLegendItemWidth = 0;
      }
    });
    
    const lastValueItemOffset = !isVertical
      /**
       * maxValue * 10是由于echarts绘画max最大值时有时候会突破取整，如99->100
       * + 1 是弥补计算贴边
       */
      ? (exactCalcStrFontCount(convertNumToThousand(maxValue * 10)) + 1) * valueAxisLabelFontSize
      : 0;
    
    // 不包含legend的相关尺寸考虑
    const gridTopOrBottom = isVertical
      // + valueAxisNameFontSize * 2 是为了扩大边界展示区域，这样美观舒适
      ? valueAxisLabelFontSize / 2 + valueAxisNameFontSize * 2
      : 0;
    
    const legendPaddingTopBottom = typeof legendPadding === "number"
      ? legendPadding
      : legendPadding.length === 1
        ? legendPadding[0]
        : legendPadding.length === 2
          ? legendPadding[0]
          : legendPadding[0] + legendPadding[2];
  
    // todo
    const legendHeight = legendObj.legend.itemHeight * legendRows
      + legendObj.legend.itemGap * (legendRows - 1) + legendPaddingTopBottom;
    const legendWidth = legendNoPaddingWidth + legendPaddingLeftRight;
    
    // 自动计算的grid边界尺寸距离
    const autoCalcGridObj = {
      top: valueAxisInverse ? 0 : gridTopOrBottom,
      right: !isVertical && valueAxisInverse ? 0 : lastValueItemOffset,
      bottom: valueAxisInverse ? gridTopOrBottom : 0,
      left: !isVertical && valueAxisInverse ? lastValueItemOffset : 0,
      containLabel: true,
    };
    
    // todo
    const valueAxisNameWidth = 0;
    // legend的top与left权重大于bottom与right
    if (legendRows === 1 && (chartWidth) - legendNoPaddingWidth) {}
    // todo
    if (legendPlacement === "top") {
      // autoCalcGridObj.top += (legendHeight + legendBottomMargin);
    }
    if (legendPlacement === "right") {
      autoCalcGridObj.right += legendWidth;
    }
    
    const gridObj = {
      grid: merge(autoCalcGridObj, chartOptions.grid),
    };
    
    return {
      ...chartOptions,
      ...gridObj,
      ...legendObj,
      ...xAxisObj,
      ...yAxisObj,
    };
  }
}
