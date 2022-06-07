// tslint:disable: jsx-no-multiline-js variable-name cyclomatic-complexity prefer-for-of early-exit forin no-collapsible-if
// tslint:disable: prefer-template no-parameter-reassignment max-params ter-max-len max-file-line-count no-shadowed-variable
import React from "react";
import ReactEcharts, { EChartsReactProps } from "echarts-for-react";
import tinycolor from "tinycolor2";
import uniqueId from "lodash/uniqueId";
import chunk from "lodash/chunk";
import cloneDeep from "lodash/cloneDeep";
import max from "lodash/max";
import min from "lodash/min";
import round from "lodash/round";
import omit from "lodash/omit";
import ResizeObserver from "resize-observer-polyfill";
import { isEqual } from "echarts-for-react/lib/helper/is-equal";
import { ReactChartWrap } from "./styled";
import {
  getNumbersByStrings, getRangeByIndex, convertNumToThousand, fitFlex, exactlyCalcStrCount, getRandomColor,
} from "./utils";
import {
  AxisChartICSS, AxisChartProps, AxisChartState, BasicConfigOption, Chart,
} from "./interface";
import {
  darkDefaultBasicConfigOption, defaultLoadingOption, lightDefaultBasicConfigOption,
} from "./static";

/**
 * created by liushanbao
 *
 * @description 1、AxisChart最重要的不是它的配置参数调控，
 * 而是它内部的自动化尺寸处理足以应对大量各种数据层次的显示而使得图表的显示没有越出边界超出显示，
 * 它附带的各种参数化配置不是组件创始的本意，只是应对各种项目经理的奇葩需求应运而生的畸形配置
 * echarts各个版本之间会有细微的差别，截止目前2022-04-01刚出的5.3.2最新echarts版本是有dataZoom的使用问题
 * 目前依赖的echarts版本是5.2.2，echarts-for-react版本是3.0.2
 * 如果依赖版本诧异导致的渲染报错可以使用这两个稳定的版本，并且锁住版本
 *
 * 2、代码中多处使用原生写法均是为了提高代码执行效率，事实上只有在数据量较大达到百万级别的时候使用lodash的方法才会有优势体现
 * 但一般而言页面渲染的数据并未达到百万级别的数据量，所以这里采用原生写法以便于提高代码执行率提高渲染速度
 *
 * @author liushanbao
 * @date 2020-01-10
 * @class AxisChart
 * @extends { React.Component<AxisChartProps, AxisChartState> }
 * @implements { Chart<number, number>, AxisChartICSS }
 */
export class AxisChart extends React.Component<AxisChartProps, AxisChartState> implements Chart, AxisChartICSS {
  
  static defaultProps = {
    theme: "verticalDark",
    unitFix: ["", "", "", ""],
    assignColor: [],
    echartsLoading: false,
    noMergeOption: false,
    loadingOption: defaultLoadingOption,
  };
  
  /** 除了必要的Echarts参数配置，其余的影响配置因素的变量均以组件私有变量的形式存在，提高渲染流畅度 */
  /** 图表实例 */
  private chartsInstance: any;
  /** 图宽 */
  private chartWidth = 0;
  /** 图高 */
  private chartHeight = 0;
  /** 循环高亮与tooltip的定时器id */
  private loopTipIntervalId = 0;
  /** 非循环高亮与tooltip的延时器id */
  private tipTimeOutId = 0;
  
  /** 外层容器尺寸变化容器监听的事件实例 */
  private myObserver: any = null;
  
  state: AxisChartState = {
    containerId: uniqueId("AxisChart"),
    resizeObserved: false,
    legendWidth: 0,
    xLabelRotate: false,
    horizontalXLabelRotate: false,
    horizontalGridRight: "",
    showLegend: true,
    categoryRange: [],
    legendRange: [],
    sDataArr: [],
    subColor: this.props.subColor || [],
    assignColor: this.props.assignColor,
    assistDataCount: 0,
    assistDataArr: [],
    max: 0,
    categoryAxisLineOffset: 0,
    valueAxisLineOffset: 0,
    maxValueLength: 0,
    gridTop: 0,
    categoryRangeMaxLength: 0,
    xyLinerPoint: this.props.theme.includes("vertical")
      ? { x: 0, y: 0, x2: 0, y2: 1 }
      : { x: 1, y: 0, x2: 0, y2: 0 },
    isVertical: this.props.theme.includes("vertical"),
    // 内部有很多配置兼容性以及逻辑性的处理，所以设置在state而不是直接用props
    stateBasicConfigOption: this.props.theme.toLocaleLowerCase().includes("dark")
      ? darkDefaultBasicConfigOption
      : lightDefaultBasicConfigOption,
  };
  
  componentDidMount() {
    const { chartData: { data } } = this.props;
    if (data?.length !== 0) this.updateHandle(this.assignOptions());
  }
  
  shouldComponentUpdate(nextProps: Readonly<AxisChartProps>, nextState: Readonly<AxisChartState>, nextContext: any): boolean {
    return !isEqual(nextProps, this.props) || !isEqual(nextState, this.state);
  }
  
  componentDidUpdate(prevProps: Readonly<AxisChartProps>, prevState: Readonly<AxisChartState>, snapshot?: any) {
    const { containerId, resizeObserved } = this.state;
    if (!isEqual(omit(prevProps, ["echartsLoading"]), omit(this.props, ["echartsLoading"]))) {
      clearInterval(this.loopTipIntervalId);
      clearTimeout(this.tipTimeOutId);
      this.updateHandle(this.assignOptions());
    }
    if (document.getElementById(containerId) && !resizeObserved) {
      this.myObserver = new ResizeObserver((
        // entries: any
      ) => {
        // console.log(entries);
        this.chartsInstance?.resize();
      });
      this.myObserver.observe(document.getElementById(containerId));
      if (!resizeObserved) this.setState({ resizeObserved: true });
    }
  }
  
  componentWillUnmount() {
    const { containerId } = this.state;
    this.myObserver.unobserve(document.getElementById(containerId));
  }
  
  render() {
    const { style, className, loadingOption, echartsLoading, noMergeOption } = this.props;
    const { containerId } = this.state;
    
    return (
      <ReactChartWrap id={containerId} nameProps={this.genNameProps()} style={style} className={className}>
        <ReactEcharts
          notMerge={noMergeOption}
          className="echartsForReactDiv"
          style={{ width: "100%", height: "100%" }}
          option={this.getChartOption()}
          shouldSetOption={this.shouldSetEchartsOption}
          onChartReady={this.handleChartReady}
          showLoading={echartsLoading}
          loadingOption={Object.assign({}, defaultLoadingOption, loadingOption)}
        />
        {this.renderAxisName()}
      </ReactChartWrap>
    );
  }
  
  /** 更新配置参数，优化更新 */
  shouldSetEchartsOption = (prevProps: EChartsReactProps, props: EChartsReactProps) => {
    const { basicConfigOption } = this.props;
    const res = !isEqual(prevProps.option, props.option);
    if (basicConfigOption?.chartSaveAsImageHandle && res) this.chartSaveAsImageHandle();
    return res;
  }
  
  /**
   * 生成类目轴与值轴名称dom
   * @description 之所以用dom来生成轴的名称，是因为echarts本身的轴名的距离调整不严谨准确
   */
  renderAxisName = () => {
    const { chartData: { head, suffix }, unitFix } = this.props;
    const { stateBasicConfigOption, isVertical } = this.state;
    const nameProps = this.genNameProps();
    const unitValue = `${(head as string[])[isVertical ? 3 : 1]}${(unitFix)[isVertical ? 3 : 1]}${(suffix as string[])[isVertical ? 3 : 1]}`;
    const unitCategory = `${(head as string[])[isVertical ?
      1
      :
      stateBasicConfigOption.doubleValueAxis ?
        stateBasicConfigOption.assignSubValueAxisName ? 0 : 2
        : 3]}${(unitFix)[isVertical ?
      1
      :
      stateBasicConfigOption.doubleValueAxis ?
        stateBasicConfigOption.assignSubValueAxisName ? 0 : 2
        : 3]}${(suffix as string[])[isVertical ?
      1
      :
      stateBasicConfigOption.doubleValueAxis ?
        stateBasicConfigOption.assignSubValueAxisName ? 0 : 2
        : 3]}`;
    const unitValueSub = `${(head as string[])[isVertical ? 2 : 3]}${(unitFix)[isVertical ? 2 : 3]}`;
    let valueNameSubTemp = stateBasicConfigOption.assignSubValueAxisName && isVertical ?
      stateBasicConfigOption.assignSubValueAxisName : `${unitValueSub}`;
    valueNameSubTemp = stateBasicConfigOption.doubleValueAxis
    && !isVertical
    && stateBasicConfigOption.assignValueAxisName ?
      stateBasicConfigOption.assignValueAxisName : valueNameSubTemp;
    const valueNameTemp = stateBasicConfigOption.assignValueAxisName ?
      stateBasicConfigOption.assignValueAxisName
      :
      stateBasicConfigOption.showValueAxisName ?
        (stateBasicConfigOption.seriesType === "pictorialBar" && stateBasicConfigOption.pictorialBarProgress)
        || stateBasicConfigOption.normalBarProgress ?
          "" : `${unitValue}`
        : "";
    let categoryNameTemp = stateBasicConfigOption.assignCategoryAxisName ?
      stateBasicConfigOption.assignCategoryAxisName
      :
      stateBasicConfigOption.showCategoryAxisName ?
        `${unitCategory}` : "";
    categoryNameTemp = stateBasicConfigOption.doubleValueAxis
    && !isVertical
    && stateBasicConfigOption.assignSubValueAxisName ?
      stateBasicConfigOption.assignSubValueAxisName
      : categoryNameTemp;
    const doubleWayBarCenterObj = stateBasicConfigOption.doubleWayBarCategoryCenter && !isVertical ?
      {
        left: "50%",
        transform: "translateX(-50%)",
      }
      : {};
    const valueAxisNameLocationTemp = isVertical ?
      stateBasicConfigOption.valueAxisNameLocation
      : stateBasicConfigOption.categoryAxisNameLocation;
    const categoryAxisNameLocationTemp = isVertical ?
      stateBasicConfigOption.categoryAxisNameLocation
      : stateBasicConfigOption.valueAxisNameLocation;
    const assignValueAxisNameLocation = isVertical ?
      stateBasicConfigOption.assignValueAxisNameLocation ?
        stateBasicConfigOption.assignValueAxisNameLocation : {}
      :
      stateBasicConfigOption.assignCategoryAxisNameLocation ?
        stateBasicConfigOption.assignCategoryAxisNameLocation : {};
    const assignCategoryAxisNameLocation = isVertical ?
      stateBasicConfigOption.assignCategoryAxisNameLocation ?
        stateBasicConfigOption.assignCategoryAxisNameLocation : {}
      :
      stateBasicConfigOption.assignValueAxisNameLocation ?
        stateBasicConfigOption.assignValueAxisNameLocation : {};
    
    return (
      <>
        {
          stateBasicConfigOption.showValueAxisName &&
          <span>
            <span
              style={Object.assign({}, {
                top: valueAxisNameLocationTemp === "start" ?
                  "unset"
                  :
                  valueAxisNameLocationTemp === "end" ?
                    0
                    :
                    typeof valueAxisNameLocationTemp === "number" ?
                      `${valueAxisNameLocationTemp}px`
                      : valueAxisNameLocationTemp,
                bottom: valueAxisNameLocationTemp === "start" ? `0px` : "unset",
                right: isVertical ? 0 : "unset",
              }, assignValueAxisNameLocation, doubleWayBarCenterObj)}
              className="valueAxisName"
            >
              {valueNameTemp}
            </span>
            {
              stateBasicConfigOption.doubleValueAxis &&
              <span
                className="valueAxisNameSub"
                style={{
                  top: valueAxisNameLocationTemp === "start" ?
                    "unset"
                    :
                    valueAxisNameLocationTemp === "end" ?
                      0
                      :
                      typeof valueAxisNameLocationTemp === "number" ?
                        `${valueAxisNameLocationTemp}px`
                        : valueAxisNameLocationTemp,
                }}
              >
                {valueNameSubTemp}
              </span>
            }
          </span>
        }
        {
          stateBasicConfigOption.showCategoryAxisName &&
          <span>
            <span
              style={Object.assign({}, {
                right: categoryAxisNameLocationTemp === "start" ?
                  "unset"
                  :
                  categoryAxisNameLocationTemp === "end" ?
                    0
                    :
                    typeof categoryAxisNameLocationTemp === "number" ?
                      `${categoryAxisNameLocationTemp}px`
                      : categoryAxisNameLocationTemp,
                left: categoryAxisNameLocationTemp === "start" ? `0px` : "unset",
                bottom: categoryAxisNameLocationTemp === "start" || !stateBasicConfigOption.showValueAxis ?
                  0 : nameProps.categoryNameFontSize,
              }, assignCategoryAxisNameLocation)}
              className="categoryAxisName"
            >
              {categoryNameTemp}
            </span>
            {
              stateBasicConfigOption.doubleValueAxis &&
              <span
                className="valueAxisNameSub"
                style={{
                  right: categoryAxisNameLocationTemp === "start" ?
                    "unset"
                    :
                    categoryAxisNameLocationTemp === "end" ?
                      0
                      :
                      typeof categoryAxisNameLocationTemp === "number" ?
                        `${categoryAxisNameLocationTemp}px`
                        : categoryAxisNameLocationTemp,
                }}
              >
                {valueNameSubTemp}
              </span>
            }
          </span>
        }
      </>
    );
  }
  
  /** 生成类目轴与值轴名称属性 */
  genNameProps = () => {
    const { stateBasicConfigOption } = this.state;
    return {
      categoryNameFontSize: `${fitFlex(stateBasicConfigOption.categoryAxisNameFontSize)}px`,
      categoryNameFontColor: `${stateBasicConfigOption.categoryAxisNameColor}`,
      valueNameFontSize: `${fitFlex(stateBasicConfigOption.valueAxisNameFontSize)}px`,
      valueNameFontColor: `${stateBasicConfigOption.valueAxisNameColor}`,
    };
  }
  
  /** 合并兼容处理配置参数 */
  assignOptions = (): Pick<AxisChartState, "stateBasicConfigOption"> => {
    const { theme, basicConfigOption, chartData } = this.props;
    const isVertical = theme.includes("vertical");
    const legendRange = getRangeByIndex(chartData, 1);
    const configOption = cloneDeep(basicConfigOption) || {};
    // 需要放在前面，否则后续tooltipAxisPointerType会不对，并且下面seriesType=line时对于tooltipAxisPointerType的调整需要注意判读
    if (configOption.blendBarLineSeriesArr || configOption.doubleValueAxis) {
      configOption.tooltipAxisPointerType = configOption.tooltipAxisPointerType ? configOption.tooltipAxisPointerType : "cross";
      if (configOption.blendBarLineSeriesArr) {
        configOption.showSymbol = configOption.showSymbol === undefined ? true : configOption.showSymbol;
      }
    }
    // 折线line与柱状图的相关属性相冲突，需要做处理，堆叠柱状图与pictorialBar也是如此
    if (
      (configOption.seriesType === "line" && !configOption.blendBarLineSeriesArr)
      || configOption.stack
      || configOption.seriesType === "pictorialBar"
    ) {
      if (configOption.seriesType === "pictorialBar") {
        configOption.symbolType = configOption.symbolType ? configOption.symbolType : "rect";
        configOption.symbolRepeat = configOption.symbolType === "rect" || configOption.pictorialBarProgress ? true : configOption.symbolRepeat;
        configOption.symbolSize = configOption.symbolSize ?
          typeof configOption.symbolSize === "number" ?
            fitFlex(configOption.symbolSize)
            : isVertical ?
            [fitFlex(configOption.symbolSize[0]), fitFlex(configOption.symbolSize[1])]
            : [fitFlex(configOption.symbolSize[1]), fitFlex(configOption.symbolSize[0])]
          : isVertical ? [10, 4] : [4, 10];
        configOption.showSeriesValueLabel = configOption.showSeriesValueLabel !== undefined ? configOption.showSeriesValueLabel : configOption.pictorialBarProgress;
        configOption.symbolMargin = configOption.symbolMargin ? configOption.symbolMargin : 1;
      }
      if (configOption.seriesType === "line") {
        configOption.tooltipAxisPointerType = configOption.tooltipAxisPointerType ? configOption.tooltipAxisPointerType : "line";
      }
      configOption.showBarTopRect = !!configOption.showBarTopRect;
      configOption.showColorLinear = configOption.seriesType === "pictorialBar" ?
        configOption.symbolType === "rect" ? false : configOption.showColorLinear
        :
        configOption.seriesType === "line" ?
          false
          :
          configOption.stack ?
            configOption.showColorLinear : true;
    }
    // 水平主题与轴值name名称的对应调整
    if (!isVertical) {
      const showValueAxisNameTemp = configOption.showValueAxisName;
      const showCategoryAxisNameTemp = configOption.showCategoryAxisName;
      configOption.showValueAxisName = showCategoryAxisNameTemp !== undefined ? showCategoryAxisNameTemp : configOption.doubleWayBar;
      configOption.showCategoryAxisName = showValueAxisNameTemp !== undefined ? showValueAxisNameTemp : !configOption.doubleWayBar;
      const assignValueAxisNameTemp = configOption.assignValueAxisName;
      configOption.assignValueAxisName = configOption.assignCategoryAxisName;
      configOption.assignCategoryAxisName = assignValueAxisNameTemp;
      if (configOption.doubleValueAxis && !isVertical && assignValueAxisNameTemp) {
        configOption.assignValueAxisName = assignValueAxisNameTemp;
      }
    }
    // 普通bar柱进度条
    if (configOption.normalBarProgress) {
      configOption.showSeriesValueLabel = configOption.showSeriesValueLabel ? configOption.showSeriesValueLabel : true;
    }
    // 自定义情况下的pictorialBar(非进度条)的symbolSize/symbolRotate需要处理(因为默认的pictorialBar是rect且是进度条)
    if (configOption.symbolType !== "rect" && configOption.seriesType === "pictorialBar") {
      const symbolSizeArr = [fitFlex((configOption.categoryAxisFontSize || 12) * 3), "100%"];
      configOption.symbolSize = !configOption.symbolRepeat ?
        isVertical ? symbolSizeArr : symbolSizeArr.reverse()
        : configOption.symbolSize !== undefined ? configOption.symbolSize : 20;
      configOption.symbolRotate = !isVertical && configOption.symbolRepeat ?
        configOption.symbolRotate !== undefined ? configOption.symbolRotate : -90
        : undefined;
    }
    if (configOption.assignBarColor || configOption.showDoubleShadow) {
      configOption.showBarTopRect = !!configOption.showBarTopRect;
      if (configOption.assignBarColor) {
        configOption.showColorLinear = configOption.showColorLinear !== undefined ? configOption.showColorLinear : true;
      }
    }
    if (configOption.assignBarColor || configOption.showDoubleShadow || configOption.normalBarProgress) {
      configOption.barBorderRadius = configOption.barBorderRadius
      || configOption.barBorderRadius === 0 ?
        configOption.barBorderRadius : 6;
    }
    // markArea垂直图表时折线图两边不留白且空连接处理必须为true，以保证正确渲染
    if (configOption.showMarkArea) {
      configOption.categoryBoundaryGap = configOption.seriesType !== "line";
      configOption.connectNullsHandle = true;
    }
    // 自定义混合与双值模式下指定对应值轴容错性处理
    if (
      (!configOption.assignAxisIndexArr && configOption.doubleValueAxis)
      || (
        configOption.assignAxisIndexArr
        && configOption.doubleValueAxis
        && configOption.assignAxisIndexArr.length < legendRange.length
      )
    ) {
      const assignAxisIndexArrConcat: (0 | 1)[] = [];
      const assignAxisIndexArrLengthTemp = configOption.assignAxisIndexArr ?
        configOption.assignAxisIndexArr.length : 0;
      for (let i = 0; i < legendRange.length - assignAxisIndexArrLengthTemp; i++) {
        // 如果压根没写，则除了第一个都副值轴对齐
        assignAxisIndexArrConcat.push(i === 0 && assignAxisIndexArrLengthTemp === 0 ? 0 : 1);
      }
      configOption.assignAxisIndexArr = configOption.assignAxisIndexArr ?
        configOption.assignAxisIndexArr.concat(assignAxisIndexArrConcat)
        : assignAxisIndexArrConcat;
    }
    if (configOption.valueLabelDistance !== undefined) {
      configOption.valueLabelDistance += 2;
    } else {
      configOption.valueLabelDistance = 5;
    }
    configOption.dataZoomBorderColor = configOption.dataZoomBorderColor ? configOption.dataZoomBorderColor : configOption.categoryAxisLineColor;
    if (configOption.gridBgColor) {
      // gridBgColor生效需要grid的show为true
      configOption.showGridBg = true;
    }
    if (configOption.categoryOffset) {
      configOption.showCategoryAxisLine = false;
    }
    
    // 与初始默认配置合并
    return Object.assign({}, this.props.theme.toLocaleLowerCase().includes("dark")
      ? darkDefaultBasicConfigOption
      : lightDefaultBasicConfigOption, configOption) as any;
  }
  
  /** 渲染数据更新处理 */
  updateHandle = (setTempObject?: Pick<AxisChartState, "stateBasicConfigOption">) => {
    const { stateBasicConfigOption, xyLinerPoint } = this.state;
    const { theme, chartData, subColor, assignColor, basicConfigOption } = this.props;
    const isVertical = theme.includes("vertical");
    const xyLinerPointTemp = !isVertical ? { x: 1, y: 0, x2: 0, y2: 0 } : xyLinerPoint;
    const configOption: BasicConfigOption = basicConfigOption ? basicConfigOption : {};
    const categoryRange = getRangeByIndex(chartData, 2);
    const legendRange = getRangeByIndex(chartData, 1);
    // 根据系列数据的条数以及subColor或者assignColor的数据个数进行颜色不足的处理
    const subColorTemp = subColor || [];
    // 对于气泡散点图和单色柱的图表需要特殊处理颜色
    const subColorRes = (configOption.seriesType === "scatter" || configOption.singleBarColor)
      ? isVertical ? subColorTemp : subColorTemp.reverse()
      : legendRange.map((item, index) => subColorTemp[index] || getRandomColor());
    const assignColorTemp = assignColor || [];
    const assignColorRes = (configOption.seriesType === "scatter" || configOption.singleBarColor) ?
      assignColorTemp
      :
      legendRange.map((item, index) => {
        return assignColorTemp[index] || [getRandomColor(), getRandomColor()];
      });
    if (!isVertical) categoryRange.reverse();
    const assistDataCountSingleItemLength = (configOption.showAssistData || configOption.showSeriesValueLabelAssistData)
      ? (getNumbersByStrings(chartData, [legendRange[0] || "", undefined])[0] || []).length
      : 0;
    const assistDataCount = assistDataCountSingleItemLength ? assistDataCountSingleItemLength - 1 : 0;
    const sDataArr: (number | undefined)[][] = [];
    const assistDataArr: (number | undefined)[][] = [];
    for (let index = 0; index < legendRange.length; index++) {
      const numbersArrByStringsArr = getNumbersByStrings(chartData, [legendRange[index], undefined]);
      let sData = numbersArrByStringsArr.map((item: any) => {
        if (configOption.changeRenderDataRadio && typeof item[0] === "number") {
          if (configOption.changeRenderDataRadioAction === "+") {
            return item[0] + (configOption.changeRenderDataRadio || 0);
          }
          if (configOption.changeRenderDataRadioAction === "-") {
            return item[0] - (configOption.changeRenderDataRadio || 0);
          }
          if (configOption.changeRenderDataRadioAction === "*") {
            return item[0] * (configOption.changeRenderDataRadio || 1);
          }
          if (configOption.changeRenderDataRadioAction === "/") {
            return item[0] / (configOption.changeRenderDataRadio || 1);
          }
        }
        return item[0];
      });
      // 如果某一系列数据全部为空数据便不会渲染，在这里直接处理至少让其渲染
      sData = sData.map(item => item === undefined || item === null ? configOption.assignUndefinedNullValue || "-" : item);
      if (!isVertical) {
        sData.reverse();
      }
      sDataArr.push(sData);
      // 添加seriesValueLabel显示的辅助数据或者tooltip的辅助数据
      if (configOption?.showSeriesValueLabelAssistData || configOption?.showAssistData) {
        for (let j = 1; j <= assistDataCount; j++) {
          const assistData = numbersArrByStringsArr.map((item: any) => item[j]);
          assistDataArr.push(isVertical ? assistData : assistData.reverse());
        }
      }
    }
  
    const minValue = min(sDataArr.map(item => (min(item))));
    const maxValue = max(sDataArr.map(item => (max(item))));
  
    const waitUpdateStateTemp = {
      categoryRange,
      legendRange,
      sDataArr,
      assistDataCount,
      assistDataArr,
      isVertical,
      xyLinerPoint: xyLinerPointTemp,
      stateBasicConfigOption: setTempObject || stateBasicConfigOption,
      subColor: subColorRes,
      assignColor: assignColorRes,
      // 注意：最小值允许为0
      max: configOption.showBarBgc && maxValue && typeof minValue === "number"
        ? Math.ceil(maxValue + (maxValue - minValue) * 0.1)
        : this.state.max,
    };
    const finalAssignObjTemp = this.finalAssignObjHandle(
      Object.assign({}, this.state, waitUpdateStateTemp),
      isVertical,
    );
    const updateResObj = Object.assign({}, finalAssignObjTemp, waitUpdateStateTemp);
    
    this.setState(updateResObj as any);
  }
  
  /** 最终的合并以及关于有了实例对象后的计算处理 */
  finalAssignObjHandle = (paramsState: AxisChartState, isVertical: boolean) => {
    const { stateBasicConfigOption, sDataArr } = paramsState;
    const categoryAxisLineOffsetTemp: number = typeof stateBasicConfigOption.categoryAxisLineOffset === "string" ?
      // @ts-ignore
      parseFloat(stateBasicConfigOption.categoryAxisLineOffset.substring(0, stateBasicConfigOption.categoryAxisLineOffset.length - 1))
      * (!isVertical ? this.chartWidth : this.chartHeight)
      :
      stateBasicConfigOption.categoryAxisLineOffset;
    const markLineOffset: number = stateBasicConfigOption.categoryAxisFontSize;
    const categoryAxisLineOffset = isVertical
    && stateBasicConfigOption.showMarkLine
    && stateBasicConfigOption.markLineAxisArr
    && typeof stateBasicConfigOption.markLineAxisArr[0] === "string" ?
      markLineOffset + 2 + categoryAxisLineOffsetTemp
      :
      categoryAxisLineOffsetTemp;
    const valueAxisLineOffsetTemp = typeof stateBasicConfigOption.valueAxisLineOffset === "string" ?
      // @ts-ignore
      parseFloat(stateBasicConfigOption.valueAxisLineOffset.substring(0, stateBasicConfigOption.valueAxisLineOffset.length - 1))
      * (!isVertical ? this.chartWidth : this.chartHeight)
      :
      stateBasicConfigOption.valueAxisLineOffset;
    const valueAxisLineOffset = !isVertical
    && stateBasicConfigOption.showMarkLine
    && stateBasicConfigOption.markLineAxisArr
    && typeof stateBasicConfigOption.markLineAxisArr[0] === "number"
      ? markLineOffset + 2 + valueAxisLineOffsetTemp
      : valueAxisLineOffsetTemp;
    
    // 值轴最大值(注意：如果极限情况下有100，没有小数点100.00，这种情况应该在数据进入组件之前处理一致，都是有两位小数类型的)
    const axisData = sDataArr.map(item => { return String(max(item) as number).includes(".") ? (max(item) as number) : Math.ceil(max(item) as number); });
    const maxValueLength = String(max(axisData) as number).includes(".")
      ? `${max(axisData)}`.length
      : `${Math.ceil(max(axisData) as number)}`.length;
    
    // 为了处理legend相关配置对于props的有效变化
    if (this.chartsInstance) {
      const waitUpdateStateTemp0 = {
        maxValueLength,
        categoryAxisLineOffset,
        valueAxisLineOffset,
      };
      this.handleShowTip(
        stateBasicConfigOption.showTooltipIndex,
        Object.assign({}, this.state, paramsState, waitUpdateStateTemp0),
        isVertical,
      );
      // 添加绑定事件
      if (stateBasicConfigOption.onHandle) {
        // 显清除一下之前绑定的事件（由于代码逻辑更新，可能这里会多次处理）
        if (typeof stateBasicConfigOption.onHandleEventType === "string") {
          this.chartsInstance.off(stateBasicConfigOption.onHandleEventType)
        } else {
          for (let i = 0; i < stateBasicConfigOption.onHandleEventType.length; i++) {
            this.chartsInstance.off(stateBasicConfigOption.onHandleEventType[i]);
          }
        }
        
        if (typeof stateBasicConfigOption.onHandleEventType === "string") {
          this.chartsInstance.on(stateBasicConfigOption.onHandleEventType, (params: any) => {
            // @ts-ignore
            stateBasicConfigOption.onHandle(params, stateBasicConfigOption.onHandleEventType);
          })
        } else {
          for (let i = 0; i < stateBasicConfigOption.onHandleEventType.length; i++) {
            this.chartsInstance.on(stateBasicConfigOption.onHandleEventType[i], (params: any) => {
              // @ts-ignore
              stateBasicConfigOption.onHandle(params, stateBasicConfigOption.onHandleEventType[i]);
            });
          }
        }
      }
      const waitUpdateStateTemp1 = this.handleChartReady(
        this.chartsInstance,
        this.props,
        Object.assign({}, this.state, paramsState, waitUpdateStateTemp0),
        isVertical,
      );
      return Object.assign({}, waitUpdateStateTemp0, waitUpdateStateTemp1);
    } else {
      return {
        maxValueLength,
        categoryAxisLineOffset,
        valueAxisLineOffset,
      };
    }
  }
  
  /** chart下载处理 */
  chartSaveAsImageHandle = async () => {
    const { stateBasicConfigOption } = this.state;
    const { basicConfigOption } = this.props;
    
    const saveImgOpts = {
      // 导出的图片分辨率比率，本组件默认设置较高分辨率5
      pixelRatio: stateBasicConfigOption.chartSavePixelRatio,
      // 图表背景色
      backgroundColor: stateBasicConfigOption.chartSaveAsImageBgc,
      excludeComponents: ["toolbox"],
      // 图片类型支持png和jpeg
      type: stateBasicConfigOption.chartSaveAsImageType,
    };
    // 图表下载保存图片，也可使用getConnectedDataURL，但是效率更慢
    const downloadNameAndId = stateBasicConfigOption.chartSaveAsImageName ? stateBasicConfigOption.chartSaveAsImageName : "图片";
    const imageUrl = this.chartsInstance.getDataURL(saveImgOpts);
    const originDom = document.getElementById(downloadNameAndId);
    const a: any = originDom || document.createElement("a");
    a.download = downloadNameAndId;
    a.id = downloadNameAndId;
    a.style = "display: none";
    a.href = imageUrl;
    !originDom && document.body.appendChild(a);
    const imgSourceDownLoad = {
      downLoad: () => {
        a.click();
      },
      destroy: () => {
        a.remove();
      },
    };
    basicConfigOption?.chartSaveAsImageHandle?.(imgSourceDownLoad);
  }
  
  /** 分析处理布局(实现自动化计算进行参数配置) */
  handleChartReady = (chartsInstance: any, nextProps?: Readonly<AxisChartProps>, paramsState?: AxisChartState, isVertical?: boolean) => {
    const { getInstance } = nextProps || this.props;
    if (nextProps === undefined) {
      this.chartsInstance = chartsInstance;
      this.chartWidth = this.chartsInstance.getWidth();
      this.chartHeight = this.chartsInstance.getHeight();
      getInstance?.(this.chartsInstance);
      return null;
    }
    const {
      stateBasicConfigOption, maxValueLength, valueAxisLineOffset,
      categoryAxisLineOffset, categoryRange, legendRange,
    } = paramsState || this.state;
    const { chartData } = nextProps || this.props;
    let maxValueLengthTemp = maxValueLength;
    
    const xLabelArr: string[] = cloneDeep(categoryRange);
    let xLabelCount = 0;
    let strCount = 0;
    let legendCount = 0;  // legend的总计算字符个数（以中文字符字体计算尺寸）
    for (let i = 0; i < legendRange.length; i++) {
      legendCount++;
      // 对于下面的类目轴名称倾斜而言是可以粗略计算，但是legend需要精确计算
      const strCountTemp = exactlyCalcStrCount(legendRange[i]);
      strCount += strCountTemp;
    }
    for (let i = 0; i < xLabelArr.length; i++) {
      // 原本我考虑着数字和小写字母没有中文那么大，按0.5半个中文字符尺寸计算较为合理，事实上也确实如此，但是有问题点的是这样毕竟是估算，
      // 在极限接近的时候可能导致计算出来的值还是小于图表容器，但实际上它已经需要类目倾斜了，所以还是用更粗略的估算来确保倾斜稳定性
      const xLabelCountTemp = exactlyCalcStrCount(xLabelArr[i], false);
      xLabelCount += xLabelCountTemp;
    }
    // 逆序（从大到小）
    let valueDataSortArr = chartData.data.map((item: [string, string, string, number]) => (item[3])).sort((item1: number, item2: number) => {
      return item2 - item1;
    });
    // 为了处理pictorialBar时的进度计算数值对原数据产生的影响，从而影响自动布局上的类目倾斜分析
    if ((stateBasicConfigOption.seriesType === "pictorialBar" && stateBasicConfigOption.pictorialBarProgress)
      || stateBasicConfigOption.normalBarProgress) {
      let sDataTotalValue = 0;
      valueDataSortArr.map((item: any) => sDataTotalValue += item);
      valueDataSortArr = Array(valueDataSortArr.length).fill(100);
    }
    const valueDataSortArrMaxTemp = `${valueDataSortArr[0] || 0}`;
    // 最大数值与轴坐标的最大值很接近，但为了避免出入，+1是较为稳妥
    const horizontalGridRightNumber = valueDataSortArrMaxTemp.length + 1 + (
      valueDataSortArrMaxTemp.length >= 3 ?
        (
          (valueDataSortArrMaxTemp.length + 1) % 3 === 0 ?
            Math.floor((valueDataSortArrMaxTemp.length + 1) / 3) - 1
            :
            Math.floor((valueDataSortArrMaxTemp.length + 1) / 3)
        )
        :
        0
    );
    // 注意，这里最后一列数值是会隐藏一半，且由于这里是数字，为了更精确按字体大小的一半计算
    // 最终计算所得的数值难免有微小偏差，向上取整以保证数值显示不受影响
    // 最后对于加series系列的label值偏移时需要特殊处理更加精确，加上3个数值的长度保证范围的安全性
    let horizontalGridRight: any = Math.ceil(((horizontalGridRightNumber / 2 + (stateBasicConfigOption.labelValueOffset ? 3 : 0))
      * (fitFlex(stateBasicConfigOption.categoryAxisFontSize) / 2))
      / this.chartWidth * 100);
    // 保证横向又显示label值时能让其全部显示
    if (stateBasicConfigOption.seriesType === "bar"
      || (stateBasicConfigOption.seriesType === "pictorialBar" && stateBasicConfigOption.pictorialBarProgress)) {
      if (stateBasicConfigOption.showSeriesValueLabel) {
        // 当pictorialBar需要显示进度百分比时，由于有%号与小数点(两位小数)的可能，这里需要做处理
        if ((stateBasicConfigOption.seriesType === "pictorialBar" && stateBasicConfigOption.pictorialBarProgress)
          || stateBasicConfigOption.normalBarProgress
          || stateBasicConfigOption.showBarBgc) {
          // 以99.99%的长度为安全限度
          // 由于实际显示时百分比符号%接近于两个数字，且由于这里是满度值label的right处显示，这里按7.5计算还是稳定的
          maxValueLengthTemp = 7.5;
        }
        if (stateBasicConfigOption.labelValueOffset) {
          maxValueLengthTemp = 0;
        }
        // 注意这里label的数值数字同样以字体大小的一半进行计算，这里是安全的，否则会过大
        // 且这里在前面计算的horizontalGridRight基础之上已经有部分label数值显现，不需要再除以2，
        horizontalGridRight /= 2;   // 去掉多余空间（由于底值遮挡一半的情况与下面计算的空间有部分重合，而这个重合值是底值遮挡的一半）
        // 算上label前/后缀
        const labelSuffixLength = (stateBasicConfigOption.seriesValueLabelSuffix && !stateBasicConfigOption.labelValueOffset) ?
          exactlyCalcStrCount(stateBasicConfigOption.seriesValueLabelSuffix) : 0;
        const labelPrefixLength = (stateBasicConfigOption.seriesValueLabelPrefix && !stateBasicConfigOption.labelValueOffset) ?
          exactlyCalcStrCount(stateBasicConfigOption.seriesValueLabelPrefix) : 0;
        horizontalGridRight += ((maxValueLengthTemp * fitFlex(stateBasicConfigOption.labelFontSize) / 2
          + (labelSuffixLength + labelPrefixLength) * fitFlex(stateBasicConfigOption.labelFontSize)
          + fitFlex(stateBasicConfigOption.valueLabelDistance - 5)) / this.chartWidth * 100);
      }
    }
    horizontalGridRight += "%";
    // 最长的类目名长度
    const xLabelArrLength: string[] = xLabelArr.sort((item1, item2) => {
      return item2.length - item1.length;
    });
    // 水平方向上去除类目轴label的图表内容的宽度
    const contentWidth = this.chartWidth - fitFlex(stateBasicConfigOption.categoryAxisLineOffset)
      - (xLabelArrLength[0] || "").length * fitFlex(stateBasicConfigOption.categoryAxisFontSize);
    const legendWidth = strCount * fitFlex(stateBasicConfigOption.legendFontSize)
      + legendCount * fitFlex(stateBasicConfigOption.legendItemWidth)
      + (typeof stateBasicConfigOption.legendPadding === "number" ?
        fitFlex(stateBasicConfigOption.legendPadding * 2)
        :
        fitFlex((stateBasicConfigOption.legendPadding as number[]).length === 2 ?
          stateBasicConfigOption.legendPadding[1] * 2
          : (stateBasicConfigOption.legendPadding[1] + stateBasicConfigOption.legendPadding[3])))
      + (legendCount - 1) * fitFlex(stateBasicConfigOption.legendItemGap)
      // 图例的icon与文字之间貌似有一段不可调控的距离，大概为4～6
      + legendCount * fitFlex(6);

    // 计算grid top值(行数 * 字体大小 + legendItemGap + legend的padding上下部分距离)
    const legendPaddingTB = typeof stateBasicConfigOption.legendPadding === "number" ?
      stateBasicConfigOption.legendPadding * 2
      :
      (stateBasicConfigOption.legendPadding as number[]).length === 2 ?
        stateBasicConfigOption.legendPadding[0] * 2
        : (stateBasicConfigOption.legendPadding[0] + stateBasicConfigOption.legendPadding[2]);
    let gridTop = Math.ceil(legendWidth / this.chartWidth) *
      Math.ceil(fitFlex(stateBasicConfigOption.legendFontSize) +
        fitFlex(stateBasicConfigOption.legendBottom !== undefined
          ? 0
          : stateBasicConfigOption.legendItemGap + legendPaddingTB
        )
      ) + (
            isVertical || stateBasicConfigOption.doubleValueAxis ? fitFlex(stateBasicConfigOption.valueAxisFontSize / 2) : 0
      );
    const showLegendTemp = stateBasicConfigOption.showLegend !== undefined ?
      stateBasicConfigOption.showLegend : legendRange.length > 1;
    gridTop = showLegendTemp || (stateBasicConfigOption.showValueAxisName && isVertical) ? gridTop : 0;
    gridTop += (stateBasicConfigOption.gridTopOffset ? stateBasicConfigOption.gridTopOffset : 0);
    
    const categoryCountArr = categoryRange.map((item) => {
      return exactlyCalcStrCount(item);
    });
    const categoryRangeMaxLength = (max(categoryCountArr) as number);
    
    const horizontalXLabelRotate = (`${valueDataSortArr[valueDataSortArr.length - 1]}`.length
      * fitFlex(stateBasicConfigOption.categoryAxisFontSize))
      >= (contentWidth / stateBasicConfigOption.valueAxisSplitNumber);
    
    const waitUpdateStateTemp = {
      categoryRangeMaxLength,
      gridTop,
      // horizontalGridRight是为了水平方向时将最右边的x轴value值显示出来，通过grid的right进行偏移处理
      // ECharts图表value显示在大于1000时有逗号分割，为实现较为精准的自动化布局需要计算处理分割逗号
      horizontalGridRight,
      // 计算理论上不换行的legend总宽度是为了自适应grid的top相应的变化值
      legendWidth,
      // y轴左侧也占据一部分空间，算上最大坐标值长度加上与轴线的估算一个字体的距离再加上可能有的数字分号较为合理
      xLabelRotate: (xLabelCount + maxValueLength + 2) * fitFlex(stateBasicConfigOption.categoryAxisFontSize)
        > this.chartWidth
        && isVertical,
      // 以最小值的位数长度作为横向时是否倾斜的标准
      horizontalXLabelRotate,
      showLegend: showLegendTemp,
    };
    
    // 根据chart宽高的识别分析自动计算legend个数引起的flexWrap换行从而重置gridTop的值，
    // 且同样计算是否需要x轴label的旋转显示，实现一切自动化识别布局，使之布局合理化
    if (!stateBasicConfigOption.dataZoomAble) {
      const chartSize = isVertical ? this.chartWidth : this.chartHeight;
      // 类目轴倾斜时按旋转度数35度进行估算tan35 ～= 0.48(所以一般不建议改变旋转角度配置)
      const categoryAxisFontHeight = horizontalXLabelRotate ?
        fitFlex(stateBasicConfigOption.categoryAxisFontSize) * 3
        + fitFlex(stateBasicConfigOption.categoryAxisFontSize) * 2 * 0.48
        : fitFlex(stateBasicConfigOption.categoryAxisFontSize) * 2;
      let actualContentSize;
      if (!isVertical) {
        actualContentSize = chartSize - gridTop - categoryAxisFontHeight - fitFlex(categoryAxisLineOffset);
      } else {
        actualContentSize = chartSize - (maxValueLength + 1)
          * fitFlex(stateBasicConfigOption.valueAxisFontSize) - fitFlex(valueAxisLineOffset);
      }
      // 如果多组柱合计宽度小于contentWidth在barGap + 10%以内则重置barGap为0（为了显示不拥挤）
      const barTotalWidth = this.preBarTotalWidth(stateBasicConfigOption.barWidth);
      const barGapTemp = (parseFloat(stateBasicConfigOption.barGap.substring(0, stateBasicConfigOption.barGap.length - 1)) / 100 + 0.1)
        * fitFlex(stateBasicConfigOption.barWidth) * (legendRange.length * categoryRange.length - 1);
      if ((actualContentSize - barTotalWidth <= barGapTemp) && !stateBasicConfigOption.disabledCalcBarGap) {
        return Object.assign({}, waitUpdateStateTemp, {
          stateBasicConfigOption: Object.assign({}, this.state.stateBasicConfigOption, { barGap: "0%" }),
        });
      }
      return waitUpdateStateTemp;
    }
    return waitUpdateStateTemp;
  }
  
  /** 初始化显示tooltip */
  handleShowTip = (dataIndexSearch: any, paramsState: AxisChartState, isVertical: boolean) => {
    const { stateBasicConfigOption, categoryRange } = paramsState;
    const { chartData } = this.props;
    let dataIndexSearchCategory = isVertical ?
      dataIndexSearch
      :
      (categoryRange.length - ((typeof dataIndexSearch === "number" ? dataIndexSearch : 0) + 1));
    if (categoryRange.length && typeof dataIndexSearch === "string") {
      for (let index = 0; index < categoryRange.length; index++) {
        if (categoryRange[index] === dataIndexSearch) {
          dataIndexSearchCategory = index;
        }
      }
    }
    if (stateBasicConfigOption.seriesType === "scatter") {
      // 气泡散点图的类目数据是在第四个索引
      dataIndexSearchCategory = getRangeByIndex(chartData, 3).indexOf(dataIndexSearch);
    }
    const seriesIndexTemp = stateBasicConfigOption.seriesType === "scatter" ?
      0
      :
      stateBasicConfigOption.categoryOffset && !isVertical ? 2 : 1;
    if (stateBasicConfigOption.loopShowTooltip) {
      let currentDataIndex = -1;
      this.loopTipIntervalId = window.setInterval(() => {
        const dataSeriesIndex = stateBasicConfigOption.seriesType === "scatter" ? 0 : 1;
        const dataLength = this.chartsInstance.getOption().series[dataSeriesIndex].data.length;
        // 取消之前高亮的图形
        this.chartsInstance.dispatchAction({
          type: "downplay",
          seriesIndex: seriesIndexTemp,
          dataIndex: currentDataIndex,
        });
        currentDataIndex = (currentDataIndex + 1) % dataLength;
        // 高亮当前图形
        this.chartsInstance.dispatchAction({
          type: "highlight",
          seriesIndex: seriesIndexTemp,
          dataIndex: currentDataIndex,
        });
        // 显示 tooltip
        this.chartsInstance.dispatchAction({
          type: "showTip",
          // 显示第几个series(该系列中的索引index都是从1开始的，而该组件是第二步push了真实需要渲染的数据，所以seriesIndex是2)
          seriesIndex: seriesIndexTemp,
          dataIndex: currentDataIndex, // 显示第几个数据(该系列索引是从0开始)
        });
      }, stateBasicConfigOption.loopShowTooltipTime);
    } else if (stateBasicConfigOption.initShowTooltip) {
      // 将其使用setTimeOut进行执行放在代码最后执行增加其触发高亮tooltip的稳定性
      this.tipTimeOutId = window.setTimeout(() => {
        // 解决tooltip高亮闪现bug
        if (stateBasicConfigOption.resolveTooltipFlashShow) {
          this.setState({
            alwaysShowContent: dataIndexSearch !== -1,
          });
        }
        this.chartsInstance.dispatchAction({
          type: "highlight",
          seriesIndex: seriesIndexTemp,
          dataIndex: dataIndexSearchCategory,
          // 这里由于组件实现功能程度的复杂性，不直接用name
          // name: dataIndexSearchCategory,
        });
        this.chartsInstance.dispatchAction({
          type: "showTip",
          seriesIndex: seriesIndexTemp,
          dataIndex: dataIndexSearchCategory,
        });
        this.chartsInstance.on("mousemove", () => {
          if (stateBasicConfigOption.resolveTooltipFlashShow) {
            this.setState({
              alwaysShowContent: false,
            });
          }
        });
        // 气泡散点图的高亮触发事件有点小问题，后续鼠标tooltip无法取消高亮（4.x版本，新版本未知），所以需要这里手动监听特意取消
        if (stateBasicConfigOption.seriesType === "scatter") {
          this.chartsInstance.on("mousemove", () => {
            this.chartsInstance.dispatchAction({
              type: "downplay",
              seriesIndex: seriesIndexTemp,
              dataIndex: dataIndexSearchCategory,
            });
            this.chartsInstance.off("mousemove");
          });
        }
      }, 0);
    }
  }
  
  /** 双值轴处理 */
  doubleValueAxisHandle = <T, >(axis: T, splitNumber: number, isVertical: boolean) => {
    const { sDataArr, stateBasicConfigOption } = this.state;
    
    let axisLeftData: (number | undefined)[] = [];
    if (stateBasicConfigOption.assignAxisIndexArr) {
      axisLeftData = sDataArr.filter((item, index) => {
        return (stateBasicConfigOption.assignAxisIndexArr as number[])[index] === 0;
        // 处理某一系列数据全部为空数据不渲染的问题带来的极值确认的问题
      }).flat(Infinity).map(item => item === ((stateBasicConfigOption.assignUndefinedNullValue || "-") as any) ? 0 : item) as (number | undefined)[];
    }
    // 除以9.5是为了不让最大值达到顶峰刻度线，一来这样图表比较合理化，二来可以尽量减小柱状图顶部小方块极限数值情况下遮挡显示的bug
    const maxLeftValue = Math.ceil(max(axisLeftData) as number / 9.5 * 10);
    const axisLeftInterval = Math.ceil(maxLeftValue / splitNumber);
    
    let axisRightData: (number | undefined)[] = [];
    if (stateBasicConfigOption.assignAxisIndexArr) {
      axisRightData = sDataArr.filter((item, index) => {
        return (stateBasicConfigOption.assignAxisIndexArr as number[])[index] === 1;
        // 处理某一系列数据全部为空数据不渲染的问题带来的极值确认的问题
      }).flat(Infinity).map(item => item === ((stateBasicConfigOption.assignUndefinedNullValue || "-") as any) ? 0 : item) as (number | undefined)[];
    }
    const maxRightValue = Math.ceil(max(axisRightData) as number / 9.5 * 10);
    const axisRightInterval = Math.ceil(maxRightValue / splitNumber);
    
    const intervals = [axisLeftInterval, axisRightInterval];
    const result = [axis, axis].map((item, index) => (Object.assign({}, item, {
      interval: intervals[index],
      max: index === 0 ?
        stateBasicConfigOption.doubleValueAxisMaxArr ?
          // 原始数据轴max不设置即例如为undefined可以保证原始数据轴刻度数据不变，但是这样以来于副值轴无法对其刻度分割线
          stateBasicConfigOption.doubleValueAxisMaxArr[0] : maxLeftValue
        :
        stateBasicConfigOption.doubleValueAxisMaxArr ?
          stateBasicConfigOption.doubleValueAxisMaxArr[1] : maxRightValue,
      // @ts-ignore
      splitLine: Object.assign({}, axis.splitLine || {}, { show: index !== 1 }),
    })));
    if (!isVertical) result.reverse();
    return result;
  }
  
  /** 通用的配置 */
  getDefaultChartOption = () => {
    const {
      stateBasicConfigOption, categoryRange, legendRange, categoryRangeMaxLength,
      sDataArr, subColor, assistDataCount, horizontalGridRight, alwaysShowContent,
      valueAxisLineOffset, categoryAxisLineOffset, gridTop, legendWidth, isVertical,
    } = this.state;
    const { chartData: { suffix, prefix, head }, unitFix } = this.props;
    const categoryInterval: any = {};
    if (stateBasicConfigOption.axisLabelRotate) {
      categoryInterval.interval = 0;
    }
    // 类似于值轴的splitNumber效果，可以尽量避免轴值label显示不完全
    // 主要是防止水平时类目数据过多没有完全显示的时候强制全部显示
    if (stateBasicConfigOption.categoryIntervalNumber !== undefined) {
      categoryInterval.interval = stateBasicConfigOption.categoryIntervalNumber;
    }
    
    let maxMinValueObj: {
      /** 最小值 */
      min?: number;
      /** 最大值 */
      max?: number;
    } = {};
    const minValue = min(sDataArr.map(item => (min(item))));
    const maxValue = max(sDataArr.map(item => (max(item))));
    if (stateBasicConfigOption.handleValueAxisRange && maxValue && minValue) {
      maxMinValueObj.min = Math.floor(minValue - (maxValue - minValue) * 0.1);
      maxMinValueObj.max = Math.ceil(maxValue + (maxValue - minValue) * 0.1);
    }
    if (stateBasicConfigOption.doubleWayBar && maxValue && minValue) {
      // 双向对比图表一般为对比性质较强，直接以双向极值即可（除非后续实在是需要设置极值大小）
      maxMinValueObj.min = 0;
      maxMinValueObj.max = stateBasicConfigOption.doubleWayBarPercent ?
        100 : Math.ceil(maxValue + (maxValue - minValue) * 0.1);
    }
    if (stateBasicConfigOption.valueMax !== undefined) {
      maxMinValueObj.max = stateBasicConfigOption.valueMax;
    }
    if (stateBasicConfigOption.showBarBgc && maxValue && minValue) {
      maxMinValueObj.max = Math.ceil(maxValue + (maxValue - minValue) * 0.1);
    }
    if (stateBasicConfigOption.valueMin !== undefined) {
      maxMinValueObj.min = stateBasicConfigOption.valueMin;
    }
    if (stateBasicConfigOption.valueAxisLogMode) {
      maxMinValueObj = {};
    }
    const valueAxisLabelFormatterObj = stateBasicConfigOption.valueAxisSuffixHandle
    || stateBasicConfigOption.scatterYValueAxisCenter || stateBasicConfigOption.hideValueZeroValue ?
      {
        formatter: (value: number) => {
          return `${
            stateBasicConfigOption.scatterYValueAxisCenter
            || stateBasicConfigOption.hideValueZeroValue ?
              value === 0
              || (value === 1 && stateBasicConfigOption.valueAxisLogMode) ? "" : value
              : value
          }${
            stateBasicConfigOption.valueAxisSuffixHandle ?
              value === 0 ? "" : (suffix as string[])[3]
              : ""
          }`;
        },
      }
      :
      stateBasicConfigOption.valueAxisLabelFormatter ?
        {
          formatter: stateBasicConfigOption.valueAxisLabelFormatter,
        }
        :
        {};
    const logBaseObj: any = {};
    if (stateBasicConfigOption.valueAxisLogMode) {
      logBaseObj.logBase = stateBasicConfigOption.valueAxisLogBase;
    }
    const valueAxisOption = Object.assign({}, maxMinValueObj, logBaseObj, {
      show: stateBasicConfigOption.showValueAxis,
      // 强制统一设置值坐标轴分割段数，为双值轴分割线统一作准备
      splitNumber: stateBasicConfigOption.valueAxisLogMode ? undefined : stateBasicConfigOption.valueAxisSplitNumber,
      type: stateBasicConfigOption.valueAxisLogMode ? "log" : "value",
      axisLine: {
        show: stateBasicConfigOption.showValueAxisLine,
        lineStyle: {
          width: fitFlex(stateBasicConfigOption.valueAxisLineWidth),
          color: stateBasicConfigOption.valueAxisLineColor,
        },
      },
      axisLabel: Object.assign({
        fontSize: fitFlex(stateBasicConfigOption.valueAxisFontSize),
        color: stateBasicConfigOption.valueAxisFontColor,
      }, categoryInterval, {
        inside: stateBasicConfigOption.seriesType === "scatter",
        margin: stateBasicConfigOption.seriesType === "scatter" && stateBasicConfigOption.scatterYValueAxisCenter ?
          (isVertical ? this.chartWidth : this.chartHeight) / 2 + stateBasicConfigOption.scatterYValueAxisCenterOffset
          :
          stateBasicConfigOption.doubleWayBar ?
            fitFlex(stateBasicConfigOption.valueAxisLineOffset) : 0,
        rotate: isVertical ?
          0 : (this.state.horizontalXLabelRotate ?
            stateBasicConfigOption.axisLabelRotate ? stateBasicConfigOption.axisLabelRotateAngle : 0
            : 0),
      }, valueAxisLabelFormatterObj),
      axisTick: {
        show: stateBasicConfigOption.showValueAxisTick,
        length: fitFlex(stateBasicConfigOption.axisTickLength),
        lineStyle: {
          color: stateBasicConfigOption.axisTickColor,
        },
      },
      splitLine: {
        show: stateBasicConfigOption.showValueSplitLine,
        lineStyle: {
          type: stateBasicConfigOption.splitValueLineType,
          width: fitFlex(stateBasicConfigOption.splitValueLineWidth),
          color: stateBasicConfigOption.splitValueLineColor,
        },
      },
      splitArea: {
        show: stateBasicConfigOption.showValueSplitArea,
        areaStyle: {
          color: stateBasicConfigOption.splitValueAreaColorArr,
        },
      },
      offset: fitFlex(valueAxisLineOffset),
    });
    
    const categoryAxisLabelFormatterObj = stateBasicConfigOption.hideCategoryZeroValue
    || stateBasicConfigOption.categoryAxisSuffixHandle
    || stateBasicConfigOption.categoryAxisEllipsisCount
    || stateBasicConfigOption.categoryAxisReturnLineCount
    || stateBasicConfigOption.categoryAxisReturnLineRowCount ?
    {
      formatter: (value: any) => {
        if (stateBasicConfigOption.categoryAxisEllipsisCount
          && (value.length > stateBasicConfigOption.categoryAxisEllipsisCount)) {
          return `${value.substring(0, stateBasicConfigOption.categoryAxisEllipsisCount)}...`;
        }
        if (stateBasicConfigOption.categoryAxisReturnLineCount
          && (value.length > stateBasicConfigOption.categoryAxisReturnLineCount)) {
          return `${
            value.substring(0, stateBasicConfigOption.categoryAxisReturnLineCount)
          }\r\n${
            value.substring(stateBasicConfigOption.categoryAxisReturnLineCount)
          }${!isVertical ? " " : ""}`;
        }
        if (stateBasicConfigOption.categoryAxisReturnLineRowCount
          && (value.length > stateBasicConfigOption.categoryAxisReturnLineRowCount)) {
          const strArr = [];
          for (let stri = 0; stri < value.length / stateBasicConfigOption.categoryAxisReturnLineRowCount; stri++) {
            const itemA = value.slice(
              stateBasicConfigOption.categoryAxisReturnLineRowCount * stri,
              stateBasicConfigOption.categoryAxisReturnLineRowCount * (stri + 1),
            );
            strArr.push(itemA);
          }
          let strTemp = "";
          for (let strArrIndex = 0; strArrIndex < strArr.length; strArrIndex++) {
            strTemp += (strArr[strArrIndex] + (strArrIndex !== strArr.length - 1 ? "\r\n" : ""));
          }
          return `${strTemp}${!isVertical ? " " : ""}`;
        }
        return `${
          stateBasicConfigOption.hideCategoryZeroValue ?
            value === 0 ? "" : value
            : value
        }${
          stateBasicConfigOption.categoryAxisSuffixHandle ?
            value === 0 ? "" : (suffix as string[])[1]
            : ""
        }`;
      },
    }
    :
    stateBasicConfigOption.categoryAxisLabelFormatter ?
      {
        formatter: stateBasicConfigOption.categoryAxisLabelFormatter,
      }
      :
      {};
    // 类目轴水平时主轴线上的label左对齐
    const categoryHorizontalLabelLeftObj = stateBasicConfigOption.categoryHorizontalLabelLeft ? {
      align: "left",
      margin: fitFlex(
        (
          categoryRangeMaxLength
          -
          (
            stateBasicConfigOption.categoryAxisEllipsisCount ?
              (categoryRangeMaxLength
                - (stateBasicConfigOption.categoryAxisEllipsisCount ?
                    stateBasicConfigOption.categoryAxisEllipsisCount : 0
                ) / 2)
                : 0)
        )
        * stateBasicConfigOption.categoryAxisFontSize
        + stateBasicConfigOption.categoryAxisFontSize * 2 / 3
        + stateBasicConfigOption.categoryAxisLineOffset),
    } : {};
    
    const categoryAxisOption = {
      boundaryGap: stateBasicConfigOption.seriesType !== "scatter" ? stateBasicConfigOption.categoryBoundaryGap : undefined,
      show: stateBasicConfigOption.showCategoryAxis,
      type: stateBasicConfigOption.seriesType === "scatter" ? "value" : "category",
      data: stateBasicConfigOption.seriesType === "scatter"
        ? undefined
        : categoryRange,
      axisTick: {
        show: stateBasicConfigOption.showCategoryAxisTick,
        length: fitFlex(stateBasicConfigOption.axisTickLength),
        lineStyle: {
          color: stateBasicConfigOption.axisTickColor,
        },
      },
      axisLabel: Object.assign({}, categoryInterval, {
        margin: stateBasicConfigOption.doubleWayBar
        || stateBasicConfigOption.valueMin !== undefined
        || stateBasicConfigOption.handleValueAxisRange
        || stateBasicConfigOption.valueAxisLogMode ?
          fitFlex(stateBasicConfigOption.categoryAxisLineOffset) : 0,
        rotate: isVertical ?
          (this.state.xLabelRotate ?
            stateBasicConfigOption.axisLabelRotate ?
              stateBasicConfigOption.axisLabelRotateAngle : 0
            : 0)
          : 0,
        fontSize: fitFlex(stateBasicConfigOption.categoryAxisFontSize),
        // 弥补计算上的不足
        color: stateBasicConfigOption.categoryOffset ?
          "rgba(255,255,255,0)"
          :
          stateBasicConfigOption.categoryAxisFontColor,
      }, categoryAxisLabelFormatterObj, categoryHorizontalLabelLeftObj, {
        padding: [
          0,
          stateBasicConfigOption.categoryLastLabelDistance !== undefined ?
            fitFlex(stateBasicConfigOption.categoryLastLabelDistance) : 0,
          0,
          0,
        ],
      }, stateBasicConfigOption.categoryAxisLabelStyleObj),
      axisLine: {
        show: stateBasicConfigOption.showCategoryAxisLine,
        lineStyle: {
          width: fitFlex(stateBasicConfigOption.categoryAxisLineWidth),
          color: stateBasicConfigOption.categoryAxisLineColor,
        },
      },
      splitArea: {
        show: stateBasicConfigOption.showCategorySplitArea,
        areaStyle: {
          color: stateBasicConfigOption.splitCategoryAreaColorArr,
        },
      },
      splitLine: {
        show: stateBasicConfigOption.showCategorySplitLine,
        lineStyle: {
          type: stateBasicConfigOption.splitCategoryLineType,
          width: fitFlex(stateBasicConfigOption.splitCategoryLineWidth),
          color: stateBasicConfigOption.splitCategoryLineColor,
        },
      },
      offset: stateBasicConfigOption.valueMin !== undefined
      || stateBasicConfigOption.handleValueAxisRange
      || stateBasicConfigOption.valueAxisLogMode
        ? 0
        : fitFlex(categoryAxisLineOffset + (
          stateBasicConfigOption.categoryAxisLineOffsetExtra !== undefined
            ? stateBasicConfigOption.categoryAxisLineOffsetExtra
            : 0
        )),
    };
    
    const basicXAxis = isVertical ? categoryAxisOption : valueAxisOption;
    const basicYAxis = isVertical ? valueAxisOption : categoryAxisOption;
    
    let xAxis = [basicXAxis];
    let yAxis = [basicYAxis];
    
    if (stateBasicConfigOption.doubleValueAxis && isVertical) {
      yAxis = this.doubleValueAxisHandle(basicYAxis, stateBasicConfigOption.valueAxisSplitNumber, isVertical);
    }
    if (stateBasicConfigOption.doubleValueAxis && !isVertical) {
      xAxis = this.doubleValueAxisHandle(basicXAxis, stateBasicConfigOption.valueAxisSplitNumber, isVertical);
    }
    // 解决tooltip辅助数据参与渲染的问题
    if (stateBasicConfigOption.showAssistData && isVertical) {
      yAxis = [basicYAxis, Object.assign({}, basicYAxis, { show: false })];
    }
    if (stateBasicConfigOption.showAssistData && !isVertical) {
      xAxis = [basicXAxis, Object.assign({}, basicXAxis, { show: false })];
    }
    if ((stateBasicConfigOption.seriesType === "pictorialBar" && stateBasicConfigOption.pictorialBarProgress)
      || stateBasicConfigOption.normalBarProgress
      || stateBasicConfigOption.showBarBgc
      || stateBasicConfigOption.showMarkArea) {
      const axis1 = {
        boundaryGap: stateBasicConfigOption.categoryBoundaryGap,
        data: categoryRange,
        type: "category",
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        splitArea: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      };
      if (isVertical) {
        xAxis = [
          basicXAxis,
          // @ts-ignore
          axis1,
        ];
      } else {
        yAxis = [
          basicYAxis,
          // @ts-ignore
          axis1,
        ];
      }
    }
    if (stateBasicConfigOption.doubleWayBar) {
      // todo 目前先兼容到水平双向bar柱（垂直方向等有时间或者项目UI出现的情况下再搞吧，是真的麻烦。。。）
      const axis1MaxMinValueObj = basicXAxis.type === "value" ? {
        max: 0,
        // @ts-ignore
        min: -maxMinValueObj.max,
      } : {};
      const xAxisTemp = Object.assign({}, basicXAxis, axis1MaxMinValueObj, {
        axisLabel: Object.assign({}, basicXAxis.axisLabel, {
          formatter: (value: any) => {
            if (basicXAxis.type === "value") {
              return stateBasicConfigOption.doubleWayBarPNHandle ?
                stateBasicConfigOption.valueAxisSuffixHandle ?
                  `${value * (-1)}${value === 0 ? "" : (suffix as string[])[3]}`
                  : value * (-1)
                : `${value}${(suffix as string[])[3]}`;
            }
            return value;
          },
        }),
      });
      const xAxisTemp2 = Object.assign({}, basicXAxis, Object.assign({}, basicXAxis, {
        gridIndex: 1,
        axisLabel: Object.assign({}, basicXAxis.axisLabel, {
          formatter: (value: any) => {
            if (basicXAxis.type === "value") {
              return stateBasicConfigOption.valueAxisSuffixHandle ?
                `${value}${value === 0 ? "" : (suffix as string[])[3]}` : value;
            }
            return value;
          },
        }),
      }));
      xAxis = [xAxisTemp, xAxisTemp2];
      const yAxisTemp1 = stateBasicConfigOption.doubleWayBarCategoryCenter ?
      Object.assign({}, basicYAxis, {
        axisLabel : {
          show: false,
        },
      }) : basicYAxis;
      const yAxisTemp2 = stateBasicConfigOption.doubleWayBarCategoryCenter ?
      Object.assign({}, basicYAxis, {
        gridIndex: 1,
      })
      :
      Object.assign({}, basicYAxis, {
        gridIndex: 1,
        axisLabel : {
          show: isVertical,
        },
      });
      yAxis = [yAxisTemp1, yAxisTemp2];
    }
    
    const legendLeftRightObj: any = {};
    if (stateBasicConfigOption.legendLeft !== undefined) {
      legendLeftRightObj.left = stateBasicConfigOption.legendLeft;
    }
    if (stateBasicConfigOption.legendRight !== undefined) {
      legendLeftRightObj.right = stateBasicConfigOption.legendRight;
    }
    const legendPaddingTemp = typeof stateBasicConfigOption.legendPadding === "number" ?
      stateBasicConfigOption.legendPadding
      :
      (stateBasicConfigOption.legendPadding as number[]).length === 2 ?
        stateBasicConfigOption.legendPadding[0] * 2
        :
        (stateBasicConfigOption.legendPadding[0] + stateBasicConfigOption.legendPadding[2]);
    const legendTopBottomObj: any = {};
    if (stateBasicConfigOption.legendBottom !== undefined) {
      // 减去legend的内置padding距离
      legendTopBottomObj.bottom = typeof stateBasicConfigOption.legendBottom === "number" ?
        stateBasicConfigOption.legendBottom - legendPaddingTemp
        :
        (parseFloat(stateBasicConfigOption.legendBottom) / 100) * this.chartHeight
        - legendPaddingTemp;
    } else {
      legendTopBottomObj.top = typeof stateBasicConfigOption.legendTop === "number" ?
        stateBasicConfigOption.legendTop - legendPaddingTemp
        :
        (parseFloat(stateBasicConfigOption.legendTop) / 100) * this.chartHeight
        - legendPaddingTemp;
    }
    
    const gridBottom = isVertical ?
      fitFlex(categoryAxisLineOffset
        + (stateBasicConfigOption.dataZoomAble ? stateBasicConfigOption.dataZoomHeight * 3 / 2 : 0))
      : fitFlex(valueAxisLineOffset);
    let categoryRangeMaxLengthTemp = categoryRangeMaxLength;
    if (stateBasicConfigOption.categoryAxisEllipsisCount) {
      const categoryRangeItemLengthArr = categoryRange.map((item) => {
        return item.length;
      });
      let categoryRangeMaxlengthItemIndex = 0;
      for (let index = 0; index < categoryRangeItemLengthArr.length; index++) {
        if (categoryRangeItemLengthArr[index] === max(categoryRangeItemLengthArr)) {
          categoryRangeMaxlengthItemIndex = index;
        }
      }
      const categoryRangeMaxLengthItem = categoryRange[categoryRangeMaxlengthItemIndex] || "";

      categoryRangeMaxLengthTemp = exactlyCalcStrCount(`${categoryRangeMaxLengthItem.substring(0, stateBasicConfigOption.categoryAxisEllipsisCount + 1)}`);
    }
    const gridLeft = isVertical
      ? fitFlex(valueAxisLineOffset)
      : stateBasicConfigOption.categoryOffset
        ? -fitFlex(categoryRangeMaxLengthTemp * stateBasicConfigOption.categoryAxisFontSize)
          + fitFlex(stateBasicConfigOption.categoryAxisFontSize / 2)
        : fitFlex(categoryAxisLineOffset);
    const originLeftTemp = stateBasicConfigOption.categoryHorizontalLabelLeft
      ? -fitFlex(categoryRangeMaxLengthTemp
        * stateBasicConfigOption.categoryAxisFontSize) - gridLeft
      : gridLeft;
    // 数据最大值
    const maxValueTemp = max(sDataArr.map((item) => max(item)));
    // 不显示值/类目轴时的gridLeft处理
    const hideAxisLeft = (!stateBasicConfigOption.showValueAxis ?
        exactlyCalcStrCount(convertNumToThousand(String(maxValueTemp).includes(".") ?
        Math.ceil(maxValueTemp !== undefined ? maxValueTemp * 10 : 0)
        :
        maxValueTemp !== undefined ? maxValueTemp * 10 : 0))
      :
      !stateBasicConfigOption.showCategoryAxis ?
        categoryRangeMaxLength > 0 ? categoryRangeMaxLength - 0.5 : 0
        : 0
      ) * fitFlex(!stateBasicConfigOption.showValueAxis ?
        stateBasicConfigOption.valueAxisFontSize
        :
        !stateBasicConfigOption.showCategoryAxis ?
          stateBasicConfigOption.categoryAxisFontSize : 0);
    const legendRows = !isNaN(Math.ceil(legendWidth / (this.chartWidth || 1))) ? Math.ceil(legendWidth / (this.chartWidth || 1)) : 1;
    const originBottomTemp = stateBasicConfigOption.legendBottom !== undefined ?
      gridBottom + (legendRows - 1) * fitFlex(stateBasicConfigOption.legendItemGap * 2)
      + (stateBasicConfigOption.gridBottomDisLegendBottom ? fitFlex(stateBasicConfigOption.gridBottomDisLegendBottom) : 0)
      + fitFlex(stateBasicConfigOption.categoryAxisFontSize)
      :
      (stateBasicConfigOption.valueMin !== undefined
        || stateBasicConfigOption.handleValueAxisRange
        || stateBasicConfigOption.valueAxisLogMode) && isVertical ?
        0 : gridBottom;
    // 不显示值/类目轴时的gridBottom处理
    let gridBottomRes = (isVertical && !stateBasicConfigOption.showCategoryAxis) ?
      originBottomTemp - fitFlex(stateBasicConfigOption.categoryAxisFontSize + stateBasicConfigOption.categoryAxisLineOffset)
      : (!isVertical && !stateBasicConfigOption.showValueAxis) ?
        originBottomTemp - fitFlex(stateBasicConfigOption.valueAxisFontSize + stateBasicConfigOption.valueAxisLineOffset)
        :
        originBottomTemp;
    if (stateBasicConfigOption.gridBottomOffset) {
      gridBottomRes += stateBasicConfigOption.gridBottomOffset;
    }
    
    let gridLeftTemp = stateBasicConfigOption.seriesType === "scatter"
      && stateBasicConfigOption.scatterYValueAxisCenter
      && stateBasicConfigOption.gridRightVertical
        ? stateBasicConfigOption.gridRightVertical
        : (isVertical && !stateBasicConfigOption.showValueAxis)
          || (!isVertical && !stateBasicConfigOption.showCategoryAxis)
          ? -hideAxisLeft
          : originLeftTemp;
    if (stateBasicConfigOption.gridLeftOffset) {
      if (typeof gridLeftTemp === "number") {
        gridLeftTemp += stateBasicConfigOption.gridLeftOffset;
      } else {
        gridLeftTemp = parseFloat(gridLeftTemp) / 100 * this.chartWidth;
        gridLeftTemp += stateBasicConfigOption.gridLeftOffset;
      }
    }
    
    let gridRightTemp = isVertical ?
      stateBasicConfigOption.doubleValueAxis ?
        fitFlex(stateBasicConfigOption.valueAxisLineOffset)
        : stateBasicConfigOption.gridRightVertical ? stateBasicConfigOption.gridRightVertical : 0
      :
      stateBasicConfigOption.seriesType === "scatter" ?
        stateBasicConfigOption.gridRightVertical ?
          stateBasicConfigOption.gridRightVertical : 0
        : horizontalGridRight;
    if (stateBasicConfigOption.gridRightOffset) {
      if (typeof gridRightTemp === "number") {
        gridRightTemp += stateBasicConfigOption.gridRightOffset;
      } else {
        gridRightTemp = parseFloat(gridRightTemp) / 100 * this.chartWidth;
        gridRightTemp += stateBasicConfigOption.gridRightOffset;
      }
    }
    
    const gridObj: any = {
      grid: {
        show: stateBasicConfigOption.showGridBg,
        top: stateBasicConfigOption.legendBottom !== undefined && stateBasicConfigOption.showValueAxisName ?
            fitFlex(stateBasicConfigOption.legendItemGap
              + stateBasicConfigOption.legendFontSize + legendPaddingTemp
              + stateBasicConfigOption.valueAxisNameFontSize)
            :
            // 有些情况比如不显示值轴数据单位的情况下gridTop的自动计算的值会显的过多，所以需要注意调整
            stateBasicConfigOption.legendBottom !== undefined && !stateBasicConfigOption.showValueAxisName ?
              fitFlex(stateBasicConfigOption.legendFontSize)
              :
              gridTop,
        bottom: gridBottomRes,
        left: gridLeftTemp,
        right: gridRightTemp,
        containLabel: true,
        borderColor: "transparent",
        backgroundColor: typeof stateBasicConfigOption.gridBgColor === "string" ?
          stateBasicConfigOption.gridBgColor : this.generateColor(1, [0.8, 0.05], true),
      },
    };
    if (stateBasicConfigOption.doubleWayBar) {
      const categoryAxisLabelWidth = (max(categoryRange.map(item => item.length)) as number)
        * fitFlex(stateBasicConfigOption.categoryAxisFontSize) + fitFlex(categoryAxisLineOffset);
      // 类目轴居中的左右处理
      const leftTemp = parseFloat(horizontalGridRight.substring(0, horizontalGridRight.length - 1)) / 2;
      // 为了弥补计算上的不足
      const showSeriesValueLabelLeft = stateBasicConfigOption.showSeriesValueLabel ?
        stateBasicConfigOption.doubleWayBarCategoryCenter ?
          stateBasicConfigOption.labelValueOffset ? leftTemp * 1.8 : leftTemp * 2.5
          :
          stateBasicConfigOption.labelValueOffset ? leftTemp * 3 : leftTemp * 3.2
        : leftTemp * 2;
      // 按数学逻辑计算宽度width应该是除以2的，但是除以2反而对于echart构图显得两边grid宽度差距很大，
      // 所以除以4进行调和，并且进行3/2与1/2的宽度调和才能达到两者相等
      const gridWidthHeight1 = stateBasicConfigOption.doubleWayBarCategoryCenter ?
        `${50 - categoryAxisLabelWidth / (isVertical ? this.chartHeight : this.chartWidth) / 4 * 3 / 2 * 100
        - fitFlex(categoryAxisLineOffset) / (isVertical ? this.chartHeight : this.chartWidth)
        * 100 / 2 - showSeriesValueLabelLeft}%`
        : `${categoryAxisLabelWidth / (isVertical ? this.chartHeight : this.chartWidth) / 4 / 2 * 100 + 50}%`;
      const gridWidthHeight2 = stateBasicConfigOption.doubleWayBarCategoryCenter ?
        `${categoryAxisLabelWidth / (isVertical ? this.chartHeight : this.chartWidth) / 4 * 3 / 2 * 100 + 50
        - fitFlex(categoryAxisLineOffset) / (isVertical ? this.chartHeight : this.chartWidth)
        * 100 * 2 - showSeriesValueLabelLeft}%`
        : `${50 - categoryAxisLabelWidth / (isVertical ? this.chartHeight : this.chartWidth)
        / 4 / 2 * 100 - showSeriesValueLabelLeft}%`;
      const gridLeftRight2 = stateBasicConfigOption.doubleWayBarCategoryCenter ?
        `${50 - categoryAxisLabelWidth / (isVertical ? this.chartHeight : this.chartWidth) / 4 * 3 / 2 * 100
        + fitFlex(categoryAxisLineOffset) / (isVertical ? this.chartHeight : this.chartWidth) * 100 * 2}%`
        : `${categoryAxisLabelWidth / (isVertical ? this.chartHeight : this.chartWidth) / 4 / 2 * 100 + 50
        + fitFlex(valueAxisLineOffset) / (isVertical ? this.chartHeight : this.chartWidth) * 100}%`;
      const gridTemp1 = !isVertical ? {
        show: stateBasicConfigOption.showGridBg,
        top: gridTop,
        left: stateBasicConfigOption.doubleWayBarCategoryCenter ?
          `${showSeriesValueLabelLeft}%`
          : `${fitFlex(valueAxisLineOffset) / this.chartWidth * 100}%`,
        bottom: fitFlex(categoryAxisLineOffset),
        containLabel: true,
        backgroundColor: typeof stateBasicConfigOption.gridBgColor === "string" ?
          stateBasicConfigOption.gridBgColor : this.generateColor(1, [0.8, 0.05], true),
        width: gridWidthHeight1,
      } : {
        show: stateBasicConfigOption.showGridBg,
        containLabel: true,
        top: gridTop,
        backgroundColor: typeof stateBasicConfigOption.gridBgColor === "string" ?
          stateBasicConfigOption.gridBgColor : this.generateColor(1, [0.8, 0.05], true),
        left: `${fitFlex(valueAxisLineOffset) / this.chartWidth * 100}%`,
        height: gridWidthHeight1,
      };
      const gridTemp2 = !isVertical ? Object.assign({}, gridTemp1, {
        width: gridWidthHeight2,
        left: gridLeftRight2,
      }) : Object.assign({}, gridTemp1, {
        height: gridWidthHeight2,
        left: gridLeftRight2,
      });
      gridObj.grid = [gridTemp1, gridTemp2];
    }
    const dataZoomObj = stateBasicConfigOption.dataZoomAble ? {
      dataZoom: [
        {
          type: "slider",
          backgroundColor: stateBasicConfigOption.dataZoomBgc,
          handleIcon: stateBasicConfigOption.dataZoomHandleIcon,
          zoomLock: stateBasicConfigOption.dataZoomLock,
          xAxisIndex: [0],
          show: true,
          height: fitFlex(stateBasicConfigOption.dataZoomHeight),
          bottom: fitFlex(2),
          left: fitFlex(4),
          right: fitFlex(4),
          // 5.x的新版本的echarts会有这个选择刷出现在handleIcon的上方，这里看着难受去掉显示它
          brushSelect: false,
          // 5.x的新版本的echarts会有自动显示数据阴影，数据阴影可以简单地反应数据走势，
          // 但是在多系列数据的时候这个趋势折线图就不好显示了，会有些问题，所以这里也禁掉
          showDataShadow: false,
          start: stateBasicConfigOption.dataZoomRange ? stateBasicConfigOption.dataZoomRange[0] : 0,
          end: stateBasicConfigOption.dataZoomRange ? stateBasicConfigOption.dataZoomRange[1] : 100,
          handleSize: stateBasicConfigOption.dataZoomHandleSize,
          handleStyle: {
            color: stateBasicConfigOption.dataZoomHandleColor,
            borderWidth: fitFlex(stateBasicConfigOption.dataZoomHandleBorderWidth),
            borderColor: stateBasicConfigOption.dataZoomHandleBorderColor,
            borderType: stateBasicConfigOption.dataZoomHandleBorderType,
          },
          textStyle: {
            color: stateBasicConfigOption.dataZoomHandleTextColor,
            fontSize: fitFlex(stateBasicConfigOption.dataZoomHandleTextSize),
          },
          borderColor: stateBasicConfigOption.dataZoomBorderColor,
        },
        /**
         * dataZoom的类型
         * 内置型inside与slider滚动条型，
         * 注意：内置型是不显示dataZoom滚动条的，但是该有的dataZoom相关功能都正常
         * todo 由于dataZoom用的极少，只有在某些极限xxx项目经理可能会要求，目前只支持到垂直方向的图表缩放滚动，水平方向待优化
         */
        // 通过添加两个缩放轴弥补inside型的不显示缺陷
        {
          type: "inside",
          start: stateBasicConfigOption.dataZoomRange ? stateBasicConfigOption.dataZoomRange[0] : 0,
          end: stateBasicConfigOption.dataZoomRange ? stateBasicConfigOption.dataZoomRange[1] : 100,
        },
      ],
    } : {};
    // 气泡散点图head水平与垂直方向处理
    const headTemp = head;
    if (!isVertical) {
      // 水平时x/y轴数据交换，head也需要处理交换
      const headChangeTemp = headTemp[headTemp.length - 1];
      headTemp[headTemp.length - 1] = headTemp[headTemp.length - 2];
      headTemp[headTemp.length - 2] = headChangeTemp;
    }
    const legendSelectedObj: { [key: string]: boolean } = {};
    for (let i = 0; i < legendRange.length; i++) {
      legendSelectedObj[legendRange[i]] = true;
      if (stateBasicConfigOption.legendSelectedObj) {
        legendSelectedObj[legendRange[i]] = stateBasicConfigOption.legendSelectedObj[legendRange[i]];
      }
    }
    return Object.assign({}, {
      xAxis: xAxis.length === 1 ? xAxis[0] : xAxis,
      yAxis: yAxis.length === 1 ? yAxis[0] : yAxis,
      color: subColor,
    }, gridObj, dataZoomObj, {
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            show: false,
          },
        },
      },
      legend: Object.assign({}, {
        show: this.state.showLegend,
        icon: stateBasicConfigOption.legendIcon,
        itemWidth: fitFlex(stateBasicConfigOption.legendItemWidth),
        itemHeight: fitFlex(stateBasicConfigOption.legendItemHeight),
        itemGap: fitFlex(stateBasicConfigOption.legendItemGap),
        padding: typeof stateBasicConfigOption.legendPadding === "number" ?
          fitFlex(stateBasicConfigOption.legendPadding)
          : (stateBasicConfigOption.legendPadding as number[]).length === 2 ?
            [fitFlex(stateBasicConfigOption.legendPadding[0]), fitFlex(stateBasicConfigOption.legendPadding[1])]
            : [
              fitFlex(stateBasicConfigOption.legendPadding[0]),
              fitFlex(stateBasicConfigOption.legendPadding[1]),
              fitFlex(stateBasicConfigOption.legendPadding[2]),
              fitFlex(stateBasicConfigOption.legendPadding[3]),
            ],
        inactiveColor: stateBasicConfigOption.inactiveColor,  // 图例关闭时的颜色（ECharts组件默认"#ccc"）
      }, legendTopBottomObj, legendLeftRightObj, {
        width: "100%",
        selectedMode: stateBasicConfigOption.legendSelectedMode,
        selected: legendSelectedObj,
        data: legendRange,
        textStyle: {
          color: stateBasicConfigOption.legendColorFollow ?
            (params: any) => subColor[params.dataIndex]
            :
            stateBasicConfigOption.legendColor,
          fontSize: fitFlex(stateBasicConfigOption.legendFontSize),
          lineHeight: Math.ceil(fitFlex(stateBasicConfigOption.legendFontSize)),   // 行高只能是整数，需要取整
        },
      }),
      tooltip: {
        show: stateBasicConfigOption.showTooltip,
        alwaysShowContent: alwaysShowContent !== undefined ? alwaysShowContent : stateBasicConfigOption.alwaysShowTooltip,
        trigger: stateBasicConfigOption.seriesType === "bar" || stateBasicConfigOption.seriesType === "line" ?
          "axis" : "item",
        confine: true,    // 显示在图形范围之内
        axisPointer: {
          type: stateBasicConfigOption.tooltipAxisPointerType,
          // type为line时有效
          lineStyle: {
            type: stateBasicConfigOption.axisPointerLineType,
            color: stateBasicConfigOption.axisPointerLineColor,
            width: stateBasicConfigOption.axisPointerLineWidth,
          },
          shadowStyle: {
            color: stateBasicConfigOption.axisPointerShadowColor,
          },
        },
        backgroundColor: stateBasicConfigOption.tooltipBgc,
        formatter: (toolItems: any) => {
          // 这里取了第一条item[0]为了和legend颜色一致不渐变的空数据的marker，
          // 然后取了第二次item[1]push的真实数据的seriesName及data value值
          // 最需要注意的就是这个chunk的size取值，要看取值情况
          // 这里还需要注意处理的是双series系列数据bar/line混合型图表
          const toolItem = chunk(
            stateBasicConfigOption.seriesType === "pictorialBar" ? [toolItems] : toolItems,
            stateBasicConfigOption.blendBarLineSeriesArr ?
              stateBasicConfigOption.showAssistData ? (assistDataCount + 1) : 1
              : stateBasicConfigOption.showDoubleShadow ?
              stateBasicConfigOption.showAssistData ? (assistDataCount + 2) : 2
              :
              stateBasicConfigOption.showAssistData ? (assistDataCount + 1) : 1
          ).map((item: any) => {
            const markTemp = item[0].marker.replace("[object Object]",
              `${tinycolor(typeof item[0].color === "string" ?
                item[0].color
                : item[0].color.colorStops[0].color).setAlpha(1).toRgbString()}`);
            let valueTemp = stateBasicConfigOption.doubleWayBarPNHandle && item[stateBasicConfigOption.showDoubleShadow ? 1 : 0].value < 0
              ? item[stateBasicConfigOption.showDoubleShadow ? 1 : 0].value * -1
              : item[stateBasicConfigOption.showDoubleShadow ? 1 : 0].value;
            if (stateBasicConfigOption.changeRenderDataRadio && typeof valueTemp === "number") {
              // 是否为小数
              const decimalFlag = `${valueTemp}`.includes(".");
              const valueTempLength = `${valueTemp}`.length;
              if (stateBasicConfigOption.changeRenderDataRadioAction === "+") {
                valueTemp -= (stateBasicConfigOption.changeRenderDataRadio || 0);
              }
              if (stateBasicConfigOption.changeRenderDataRadioAction === "-") {
                valueTemp += (stateBasicConfigOption.changeRenderDataRadio || 0);
              }
              if (stateBasicConfigOption.changeRenderDataRadioAction === "*") {
                valueTemp /= (stateBasicConfigOption.changeRenderDataRadio || 1);
              }
              if (stateBasicConfigOption.changeRenderDataRadioAction === "/") {
                valueTemp *= (stateBasicConfigOption.changeRenderDataRadio || 1);
              }
              // 解决由于js计算带来的不准确
              if (decimalFlag) {
                const decimalCount = valueTempLength - (`${valueTemp}`.indexOf(".") + 1);
                valueTemp = round(valueTemp, stateBasicConfigOption.radioRemainCount ?
                  stateBasicConfigOption.radioRemainCount : decimalCount);
              }
            }
            const seriesNameByCategoryNameObj: { [key: string]: boolean } = {};
            for (let i = 0; i < legendRange.length; i++) {
              seriesNameByCategoryNameObj[legendRange[i]] = false;
              if (stateBasicConfigOption.tooltipSeriesSelfCategoryNameObj) {
                seriesNameByCategoryNameObj[legendRange[i]] = stateBasicConfigOption.tooltipSeriesSelfCategoryNameObj[legendRange[i]];
              }
            }
            const itemTemp = item[stateBasicConfigOption.showDoubleShadow ? 1 : 0];
            return {
              // 解决渐变色的marker背景色为对象显示不了以及双边bar柱特殊情况的bug
              marker: markTemp,
              seriesName: seriesNameByCategoryNameObj[itemTemp.seriesName] ?
                this.props.chartData.seriesSelfCategoryData ?
                  this.props.chartData.seriesSelfCategoryData[itemTemp.seriesName][itemTemp.dataIndex]
                  :
                  ""
                : itemTemp.seriesName,
              value: valueTemp,
              dataIndex: itemTemp.dataIndex,
              assistDataValue: stateBasicConfigOption.showAssistData ? this.handleAssistData(item) : undefined,
            };
          });
          let tooltipFontSize = `${Math.floor(fitFlex(stateBasicConfigOption.tooltipFontSize))}px`;
          const tooltipTitleFontSize = `${Math.floor(fitFlex(stateBasicConfigOption.tooltipTitleFontSize))}px`;
          // 这里主要是想要获取横轴的label名称，所以实际上哪一个都无所谓，只是这里取了index为0的那一条
          let tooltipResult = `<div
                                style="color: ${stateBasicConfigOption.tooltipCategoryColor};
                                       font-size: ${tooltipTitleFontSize}"
                               >
                                ${prefix ? prefix[1] : ""}${toolItems[0] ? toolItems[0].axisValueLabel : ""}${suffix ? suffix[1] : ""}
                               </div>`;
          const toolItemTemp = stateBasicConfigOption.seriesType === "scatter" ?
            [toolItems] : toolItem;
          let index = -1;
          for (const item of toolItemTemp) {
            index++;
            const { marker, seriesName, value } = item;
            if (stateBasicConfigOption.connectNullsHandle && (!value && value !== 0)) {
              // 对于空数据不连接时跳过
              continue;
            }
            let tooltipContentColor = stateBasicConfigOption.tooltipContentColor ?
              stateBasicConfigOption.tooltipContentColor
              : `${stateBasicConfigOption.tooltipColorSaturate ?
                tinycolor(marker.substring(marker.includes("rgb") ?
                  marker.indexOf("rgb") : marker.indexOf("#"), marker.lastIndexOf(";")))
                  .saturate(stateBasicConfigOption.tooltipColorSaturate).setAlpha(1).toRgbString()
                :
                tinycolor(marker.substring(marker.includes("rgb") ?
                  marker.indexOf("rgb") : marker.indexOf("#"), marker.lastIndexOf(";")))
                  .setAlpha(1).toRgbString()}`;
            tooltipContentColor = stateBasicConfigOption.tooltipContentAssignColor ?
              stateBasicConfigOption.tooltipContentAssignColor[index] || "#00e5ff" : tooltipContentColor;
            if (stateBasicConfigOption.doubleWayBar) {
              tooltipContentColor = tinycolor(typeof toolItems[0].color === "string" ?
                toolItems[0].color
                : toolItems[0].color.colorStops[0].color).setAlpha(1).toRgbString();
            }
            const tooltipSeriesNameColor = stateBasicConfigOption.tooltipSeriesNameColor ?
              stateBasicConfigOption.tooltipSeriesNameColor : tooltipContentColor;
            const tooltipSeriesNameFontSize = stateBasicConfigOption.tooltipSeriesNameFontSize ?
              stateBasicConfigOption.tooltipSeriesNameFontSize : tooltipFontSize;
            const tooltipValueColor = stateBasicConfigOption.tooltipValueColor ?
              stateBasicConfigOption.tooltipValueColor : tooltipContentColor;
            const tooltipValueFontSize = stateBasicConfigOption.tooltipValueFontSize ?
              stateBasicConfigOption.tooltipValueFontSize : tooltipFontSize;
            
            tooltipFontSize = stateBasicConfigOption.tooltipAssignFontSize ?
              `${fitFlex(stateBasicConfigOption.tooltipAssignFontSize[index] || 12)}px` : tooltipFontSize;
            
            // scatter气泡散点图
            if (stateBasicConfigOption.seriesType === "scatter") {
              const originalData = ([] as any[]).concat(toolItems.data).reverse();
              const toolLabel = headTemp.map((scatterItem: string, scatterIndex: number) => {
                if (scatterIndex <= (
                  stateBasicConfigOption.scatterColorsSymbol
                  && !stateBasicConfigOption.showTooltipColorsRenderByData ? 2 : 1)
                ) return "";
                return `
                  <div>
                    <span style="color: ${tinycolor(tooltipSeriesNameColor).setAlpha(1).toRgbString()};
                          font-size: ${tooltipSeriesNameFontSize}"
                    >${scatterItem}</span>
                    <span style="color: ${tinycolor(tooltipValueColor).setAlpha(1).toRgbString()};
                          font-size: ${tooltipValueFontSize}"
                    >${prefix && prefix[scatterIndex]}${originalData[scatterIndex]}${suffix && suffix[scatterIndex]}
                    </span>
                  </div>
                `;
              });
              tooltipResult += `
                <div style="color: ${tinycolor(tooltipContentColor).setAlpha(1).toRgbString()};
                            font-size: ${tooltipFontSize}">
                  <div>${originalData[1]}</div>
                  ${toolLabel.join("")}
                </div>
              `;
              return tooltipResult;
            }
            
            tooltipResult += `
              <div style="color: ${tooltipContentColor};
                          font-size: ${tooltipFontSize}">
                  ${marker.replace(marker.substring(marker.includes("rgb") ?
              marker.indexOf("rgb") : marker.indexOf("#"),
              marker.lastIndexOf(";")),
              tinycolor(marker.substring(marker.includes("rgb") ?
                marker.indexOf("rgb") : marker.indexOf("#"), marker.lastIndexOf(";"))).setAlpha(1).toRgbString()
            )}
                  <span style="color: ${tooltipSeriesNameColor};
                   font-size: ${tooltipSeriesNameFontSize}">${prefix ? prefix[2] : ""}${seriesName}${suffix ? suffix[2] : ""}
                  </span>
                  <span style="color: ${tooltipValueColor};
                   font-size: ${tooltipValueFontSize}">${
              prefix && value !== stateBasicConfigOption.assignUndefinedNullValue
              ? prefix[3]
              : ""}${(
              stateBasicConfigOption.normalBarProgress || (stateBasicConfigOption.seriesType === "pictorialBar" && stateBasicConfigOption.pictorialBarProgress)
            ) ?
              `${stateBasicConfigOption.selfPer ? "" : sDataArr[index][item.dataIndex]}`
              : stateBasicConfigOption.tooltipValueCommaSplit
                ? convertNumToThousand(value)
                : (
                  value === stateBasicConfigOption.assignUndefinedNullValue
                    ? stateBasicConfigOption.assignUndefinedNullValue
                    : value
                )
            }${
              (stateBasicConfigOption.doubleValueAxis ?
                stateBasicConfigOption.assignAxisIndexArr ?
                  (stateBasicConfigOption.assignAxisIndexArr[index] === 0) ? `${unitFix[3]}` : `${unitFix[2]}`
                  : `${unitFix[2]}`
                : `${unitFix[3]}${
                  (
                    stateBasicConfigOption.normalBarProgress
                    || (stateBasicConfigOption.seriesType === "pictorialBar" && stateBasicConfigOption.pictorialBarProgress)
                  ) && !stateBasicConfigOption.selfPer ? " | " : ""
                }`)
              + `${((
                stateBasicConfigOption.normalBarProgress
                || (stateBasicConfigOption.seriesType === "pictorialBar" && stateBasicConfigOption.pictorialBarProgress)
              ) ?
                `${stateBasicConfigOption.tooltipValueCommaSplit ?
                  convertNumToThousand(round(value, stateBasicConfigOption.percentRemainCount))
                  : round(value, stateBasicConfigOption.percentRemainCount)}${value !== stateBasicConfigOption.assignUndefinedNullValue ? "%" : ""}`
                : "")}${suffix && value !== stateBasicConfigOption.assignUndefinedNullValue ? suffix[3] : ""}`}
                  </span>
                  ${stateBasicConfigOption.showAssistData ? this.handleAssistDataDom(item) : ""}
              </span>
            `;
          }
          return tooltipResult;
        },
        padding: typeof stateBasicConfigOption.tooltipPadding === "number" ?
          fitFlex(stateBasicConfigOption.tooltipPadding) : stateBasicConfigOption.tooltipPadding,
        borderWidth: fitFlex(stateBasicConfigOption.tooltipBorderWidth),
        borderColor: stateBasicConfigOption.tooltipBorderColor,
        borderRadius: stateBasicConfigOption.tooltipBorderRadius,
      },
    });
  }
  
  /** 处理辅助数据 */
  handleAssistData = (item: any) => {
    const { assistDataCount } = this.state;
    const assistDataArrTemp: any[] = [];
    for (let si = 1; si <= assistDataCount; si++) {
      assistDataArrTemp.push(item[si]?.value);
    }
    return assistDataArrTemp;
  }
  
  /** 处理辅助数据渲染的dom节点 */
  handleAssistDataDom = (item: any) => {
    const { stateBasicConfigOption } = this.state;
    let domResult = ``;
    for (let domIndex = 0; domIndex < item.assistDataValue.length; domIndex++) {
      const assistDataColor = stateBasicConfigOption.assistDataAssignColor ?
        stateBasicConfigOption.assistDataAssignColor[domIndex] || "#00e5ff" : undefined;
      const assistDataFontSize = stateBasicConfigOption.assistDataAssignFontSize ?
        `${fitFlex(stateBasicConfigOption.assistDataAssignFontSize[domIndex] || 12)}px` : undefined;
      domResult += `<span style="color: ${assistDataColor}; font-size: ${assistDataFontSize}">
                              <span>${stateBasicConfigOption.assistDataPrefixArr
      && stateBasicConfigOption.assistDataPrefixArr[domIndex] ?
        stateBasicConfigOption.assistDataPrefixArr[domIndex] : ""}${
        stateBasicConfigOption.assistDataNameArr
        && stateBasicConfigOption.assistDataNameArr[domIndex] ?
          stateBasicConfigOption.assistDataNameArr[domIndex] : ""}</span>
                              <span>${isNaN(item.assistDataValue[domIndex]) ?
        "-"
        :
        `${
          stateBasicConfigOption.assistDataUpDown ?
            typeof stateBasicConfigOption.assistDataUpDown === "boolean"
            || stateBasicConfigOption.assistDataUpDown === "text" ?
              item.assistDataValue[domIndex] < 0 ?
                `跌${`${item.assistDataValue[domIndex]}`.substring(1)}`
                :
                item.assistDataValue[domIndex] === 0 ? `${item.assistDataValue[domIndex]}`
                  :
                  `涨${item.assistDataValue[domIndex]}`
              :
              item.assistDataValue[domIndex] < 0 ?
                `${item.assistDataValue[domIndex]}`
                :
                item.assistDataValue[domIndex] === 0 ? `${item.assistDataValue[domIndex]}`
                  :
                  `+${item.assistDataValue[domIndex]}`
            : item.assistDataValue[domIndex]
        }${stateBasicConfigOption.assistDataUnit}`}${stateBasicConfigOption.assistDataSuffixArr
      && stateBasicConfigOption.assistDataSuffixArr[domIndex] ?
        stateBasicConfigOption.assistDataSuffixArr[domIndex] : ""}</span>
                            </span>`;
    }
    return domResult;
  }
  
  /** 生成颜色 */
  generateColor = (index: number, setAlphaNumber: number[] = [0.8, 0.05], handleGridBgc: boolean = false) => {
    const { stateBasicConfigOption, xyLinerPoint, subColor, assignColor } = this.state;
    return stateBasicConfigOption.showColorLinear
    || (handleGridBgc && stateBasicConfigOption.gridBgColor instanceof Array) ?
    // 暗黑风格且显示顶部小方块
    Object.assign({}, {
      type: "linear",     // 线性渐变
    }, xyLinerPoint, {
      colorStops: [
        {
          // 100% 处(顶部->offset=0)的颜色
          offset: stateBasicConfigOption.doubleWayBar && index === 0 ? 1 : 0,
          color: handleGridBgc && stateBasicConfigOption.gridBgColor instanceof Array ?
            (stateBasicConfigOption.gridBgColor as string[])[0]
            :
            stateBasicConfigOption.assignBarColor ?
              (assignColor && assignColor[index] ? assignColor[index][0]
                :
                `${tinycolor(subColor[index]).setAlpha(stateBasicConfigOption.showBarTopRect ?
                  setAlphaNumber[0] : setAlphaNumber[0] + 0.2)}`)
              : `${tinycolor(subColor[index]).setAlpha(setAlphaNumber[0])}`,
        },
        {
          // 0% 处(底部->offset=1)的颜色
          offset: stateBasicConfigOption.doubleWayBar && index === 0 ? 0 : 1,
          color: handleGridBgc && stateBasicConfigOption.gridBgColor instanceof Array ?
            (stateBasicConfigOption.gridBgColor as string[])[1]
            :
            stateBasicConfigOption.assignBarColor ?
              (assignColor && assignColor[index] ? assignColor[index][1]
                :
                `${tinycolor(subColor[index]).setAlpha(stateBasicConfigOption.showBarTopRect ?
                  setAlphaNumber[1] : setAlphaNumber[1] + 0.05)}`)
              : `${tinycolor(subColor[index]).darken().setAlpha(setAlphaNumber[1])}`,
        },
      ],
    })
    : subColor[index];
  }
  
  /** 按数据本身的映射比例处理symbolSize */
  handleSymbolSize = (source: number[], beta: number, rate: number) => {
    const maxTemp = max(source);
    const minTemp = min(source) === 0 ? 1 : min(source);
    return beta * ((minTemp || 1) / (maxTemp || 1)) * rate;
  }
  
  /** 气泡散点图透明度 */
  handleScatterItemStyle = (
    scatterSymbolColorOpacity: number = this.state.stateBasicConfigOption.scatterSymbolColorOpacity,
    scatterSymbolEmphasisColor?: string,
    scatterSymbolEmphasis?: boolean,
  ) => {
    const { stateBasicConfigOption, subColor } = this.state;
    return {
      borderWidth: 1,
      // 边线颜色不支持函数回调，多色渲染只好透明
      borderColor: stateBasicConfigOption.scatterColorsSymbol ?
        "transparent"
        :
        scatterSymbolEmphasisColor ?
          scatterSymbolEmphasisColor
          : subColor[0],
      // 注意：高亮里面的color不支持回调函数
      color: stateBasicConfigOption.scatterColorsSymbol && !scatterSymbolEmphasis ? (params: any) => {
        const scatterColorsRenderArrTemp = stateBasicConfigOption.scatterColorsRenderArr ?
          stateBasicConfigOption.scatterColorsRenderArr : [];
        let colorTemp = tinycolor(subColor[0]).setAlpha(scatterSymbolColorOpacity).toRgbString();
        for (let index = 0; index < scatterColorsRenderArrTemp.length; index++) {
          const item = scatterColorsRenderArrTemp[index];
          let rangeCondition = false;
          if (stateBasicConfigOption.scatterColorsItemOpenClose === "lcro") {
            rangeCondition = (params.data[params.data.length - 3] >= item[0] && params.data[params.data.length - 3] < item[1]);
          }
          if (stateBasicConfigOption.scatterColorsItemOpenClose === "lorc") {
            rangeCondition = (params.data[params.data.length - 3] > item[0] && params.data[params.data.length - 3] <= item[1]);
          }
          if (stateBasicConfigOption.scatterColorsItemOpenClose === "loro") {
            rangeCondition = (params.data[params.data.length - 3] > item[0] && params.data[params.data.length - 3] < item[1]);
          }
          if (stateBasicConfigOption.scatterColorsItemOpenClose === "lcrc") {
            rangeCondition = (params.data[params.data.length - 3] >= item[0] && params.data[params.data.length - 3] <= item[1]);
          }
          if (rangeCondition) {
            colorTemp = tinycolor(
              scatterSymbolEmphasisColor || subColor[index]
            ).setAlpha(scatterSymbolColorOpacity).toRgbString();
          }
        }
        return colorTemp;
      }
      :
        scatterSymbolEmphasis && !scatterSymbolEmphasisColor ?
          undefined
          :
          tinycolor(scatterSymbolEmphasisColor ?
            scatterSymbolEmphasisColor
            :
            subColor[0]).setAlpha(scatterSymbolColorOpacity).toRgbString(),
    };
  }
  
  /** 获取图表的配置 */
  getChartOption = () => {
    const {
      stateBasicConfigOption, legendRange, categoryRange, subColor,
      assignColor, assistDataCount, assistDataArr, sDataArr, isVertical,
    } = this.state;
    const { chartData } = this.props;
    const defaultChartOption = this.getDefaultChartOption();
    
    const options = Object.assign({}, defaultChartOption, {
      series: [] as any[],
    });
    
    const scatterData = chartData.data.map(dataItem => {
      if (!isVertical) {
        const resArrTemp = ([] as any[]).concat(dataItem).reverse();
        // 水平时交换x/y轴数据渲染
        const resArrChangeTemp = resArrTemp[1];
        resArrTemp[1] = resArrTemp[0];
        resArrTemp[0] = resArrChangeTemp;
        return resArrTemp;
      }
      return ([] as any[]).concat(dataItem).reverse();
    });
    const symbolSizeData = scatterData.map(dataItem => dataItem[2]);
    if (stateBasicConfigOption.seriesType === "scatter") {
      options.series.push({
        name: legendRange[0],
        data: scatterData,
        type: "scatter",
        symbolSize: (dataItem: any) => {
          return this.handleSymbolSize(symbolSizeData, dataItem[2], stateBasicConfigOption.symbolSizeRate);
        },
        itemStyle: this.handleScatterItemStyle(),
        emphasis: {
          itemStyle: this.handleScatterItemStyle(stateBasicConfigOption.scatterSymbolColorOpacity + 0.3,
            stateBasicConfigOption.scatterSymbolEmphasisColor, true),
        },
        symbol: stateBasicConfigOption.symbolType,
        symbolRotate: stateBasicConfigOption.symbolRotate,
        large: stateBasicConfigOption.largeData,
        largeThreshold: stateBasicConfigOption.largeDataThreshold,
      });
      return options;
    }
    
    for (let index = 0; index < sDataArr.length; index++) {
      const sData = sDataArr[index];
      let color: any = this.generateColor(
        index,
        stateBasicConfigOption.setAlphaNumberArr
          ? stateBasicConfigOption.setAlphaNumberArr
          : [0.8, 0.05]
      );
  
      // xAxisIndexObj、yAxisIndexObj是为了小方块rect与头一个空stack保持数据渲染的轴索引一致
      const xAxisIndexObj: any = {
        xAxisIndex: stateBasicConfigOption.doubleValueAxis && !isVertical ?
          stateBasicConfigOption.assignAxisIndexArr ?
            stateBasicConfigOption.assignAxisIndexArr[index] === 0 ? 1 : 0
            : index === 0 ? 1 : 0
          : 0,
      };
      const yAxisIndexObj: any = {
        yAxisIndex: stateBasicConfigOption.doubleValueAxis && isVertical
          ? stateBasicConfigOption.assignAxisIndexArr
            ? stateBasicConfigOption.assignAxisIndexArr[index]
            : index === 0 ? 0 : 1
          : 0,
      };
  
      // 添加这个stack空数据是为了通过该系列数据的itemStyle的color使得legend的颜色不是跟真实数据的颜色渐变一样，
      // 所以它必须是在series系列的第一条数据才能使得legend颜色与此一致
      options.series.push(Object.assign({}, {
        name: legendRange[index],
        data: stateBasicConfigOption.valueAxisLogMode ? undefined : sData.map(() => 0),
        // 改为custom是去除图例选择模式的切换带来的类目轴刻度label不对齐的副作用
        type: "custom",
        renderItem: () => null,
        // 否则对于堆叠柱状图会有影响
        stack: stateBasicConfigOption.stack ?
          "stack"
          :
          stateBasicConfigOption.assignStack ?
            stateBasicConfigOption.assignStack[0] || "stackConcat" : legendRange[index],
        barHeight: 0,
        itemStyle: {
          color: stateBasicConfigOption.assignBarColor ?
            assignColor && assignColor[index] ? assignColor[index][0] : getRandomColor()
            : subColor[index],
        },
        tooltip: {
          show: false,
        },
      }, yAxisIndexObj, xAxisIndexObj));
      // 横向时添加类目轴数据（方便对bar柱上方偏移）
      if (stateBasicConfigOption.categoryOffset && !isVertical) {
        options.series.push({
          name: legendRange[index],
          data: sData.map(() => 0),
          type: "bar",
          stack: stateBasicConfigOption.stack ?
            "stack"
            : stateBasicConfigOption.assignStack ?
              stateBasicConfigOption.assignStack[0] || "stackConcat" : legendRange[0],
          barHeight: 0,
          tooltip: {
            show: false,
          },
          label: {
            show: true,
            position: "right",
            distance: 0,
            offset: typeof stateBasicConfigOption.categoryOffset === "boolean" ?
              // 当有categoryOffset为布尔值且有categoryAxisEllipsisCount时，类目x偏移量则不能再为0
              // 此时也不好计算，只能手动改categoryOffset为number[]数组进行调整
              [0, -fitFlex(stateBasicConfigOption.barWidth + 3)]
              :
              [
                fitFlex(stateBasicConfigOption.categoryOffset[0]),
                -fitFlex(stateBasicConfigOption.barWidth + stateBasicConfigOption.categoryOffset[1]),
              ],
            fontSize: fitFlex(stateBasicConfigOption.categoryAxisFontSize),
            color: stateBasicConfigOption.categoryAxisFontColor,
            formatter: (obj: any) => {
              const resTemp = categoryRange[obj.dataIndex];
              if (stateBasicConfigOption.categoryAxisEllipsisCount) {
                if (`${resTemp}`.length > stateBasicConfigOption.categoryAxisEllipsisCount) {
                  return `${`${resTemp}`.substring(0, stateBasicConfigOption.categoryAxisEllipsisCount)}...`;
                }
              }
              return resTemp;
            },
          },
        });
      }
      // 混合bar/line中折线是不渐变的(你一条线渐变什么玩意儿你渐变个锤子)
      if (
        stateBasicConfigOption.blendBarLineSeriesArr && (stateBasicConfigOption.blendBarLineSeriesArr[index] || "line") === "line"
      ) {
        color = subColor[index];
      }
  
      this.pushRealSeriesData(isVertical, options, sData as number[], color, index, true);
  
      if (stateBasicConfigOption.showDoubleShadow
        || (stateBasicConfigOption.seriesType === "pictorialBar" && stateBasicConfigOption.pictorialBarProgress)
        || stateBasicConfigOption.normalBarProgress
        || stateBasicConfigOption.showMarkArea
        || stateBasicConfigOption.showBarBgc
        || stateBasicConfigOption.linearPictorialBar) {
        this.pushRealSeriesData(
          isVertical,
          options,
          sData as number[],
          color,
          index,
          false,
          stateBasicConfigOption.showDoubleShadow,
          (stateBasicConfigOption.seriesType === "pictorialBar" && stateBasicConfigOption.pictorialBarProgress)
          || stateBasicConfigOption.normalBarProgress
          || stateBasicConfigOption.showBarBgc,
          stateBasicConfigOption.linearPictorialBar,
        );
      }
      // 添加tooltip显示的辅助数据
      if (stateBasicConfigOption.showAssistData) {
        for (let j = 1; j <= assistDataCount; j++) {
          options.series.push({
            name: legendRange[index],
            data: assistDataArr[index * 2 + j - 1],
            type: "custom",
            renderItem: () => null,
            // 解决辅助数据参与渲染的问题
            yAxisIndex: 1,
          });
        }
      }
      let showBarTopRectFlag = stateBasicConfigOption.showBarTopRect;
      if (
        stateBasicConfigOption.blendBarLineSeriesArr
        && (stateBasicConfigOption.blendBarLineSeriesArr[index] || "line") === "line"
      ) {
        showBarTopRectFlag = false;
      }
  
      if (showBarTopRectFlag) {
        options.series.push(Object.assign({}, {
          name: legendRange[index],
          data: stateBasicConfigOption.valueAxisLogMode ? undefined : sData.map(() => 0),
          type: "bar",
          stack: stateBasicConfigOption.assignStack ?
            stateBasicConfigOption.assignStack[index] || "stackConcat"
            :
            stateBasicConfigOption.stack ? "stack" : legendRange[index],
          itemStyle: {
            color: stateBasicConfigOption.singleBarColor ?
              (params: any) => subColor[params.dataIndex]
              : subColor[index],
          },
          // 防止数据为0后续rect被覆盖
          z: stateBasicConfigOption.assignStack ?
            (stateBasicConfigOption.assignStack.length - index)
            : undefined,
          tooltip: {
            show: false,
          },
          // 添加柱状图顶部小方块，这里通过数据堆叠stack实现小方块，
          // 但是会有一个bug，当y轴数据峰值刚好与data中某一列数据差距较小时，堆叠的小方块就看不见了或者只有一半的高度显现
          barMinHeight: fitFlex(stateBasicConfigOption.rectBarHeight),
        }, yAxisIndexObj, xAxisIndexObj));
      }
    }
    return options;
  }
  
  /** 根据实际图表内容尺寸（不包括轴与图例）来计算所需的bar柱宽度 */
  calcBarWidth = (actualContentSize: number, barWidth: number): number => {
    const { stateBasicConfigOption, categoryRange, legendRange } = this.state;
    
    // 每一组系列一个chunk一捆的距离按一个bar柱的宽度进行设置，避免过于拥挤
    const actualContentSizeTemp = actualContentSize - (legendRange.length - 1) * fitFlex(barWidth);
    
    let needBarWidth = 0;
    if (stateBasicConfigOption.stack) {
      needBarWidth = fitFlex(actualContentSizeTemp / categoryRange.length);
    } else if (!stateBasicConfigOption.stack) {
      let barCount = legendRange.length;
      if (stateBasicConfigOption.blendBarLineSeriesArr) {
        barCount = 0;
        for (let i = 0; i < stateBasicConfigOption.blendBarLineSeriesArr.length; i++) {
          if (stateBasicConfigOption.blendBarLineSeriesArr[i] === "bar") {
            barCount++;
          }
        }
      }
      needBarWidth = fitFlex(actualContentSizeTemp / (barCount * categoryRange.length));
    }
    const originBarWidth = fitFlex(barWidth);
    return needBarWidth > originBarWidth ? originBarWidth : needBarWidth;
  }
  
  /** 预估算bar柱总宽度(barGap也要预想到) */
  preBarTotalWidth = (barWidth: number) => {
    const { stateBasicConfigOption, categoryRange, legendRange } = this.state;
    let preSetBarTotalWidth = 0;
    const barGapFloat = parseFloat(stateBasicConfigOption.barGap);
    if (stateBasicConfigOption.stack) {
      preSetBarTotalWidth = categoryRange.length * fitFlex(barWidth);
    } else if (!stateBasicConfigOption.stack) {
      let barCount = legendRange.length;
      // 需要注意自定义分配的数据堆叠
      if (stateBasicConfigOption.assignStack) {
        // es6去重
        const setAssignStack = new Set(stateBasicConfigOption.assignStack);
        barCount = setAssignStack.size + 1;
      }
      if (stateBasicConfigOption.blendBarLineSeriesArr) {
        barCount = 0;
        for (let i = 0; i < stateBasicConfigOption.blendBarLineSeriesArr.length; i++) {
          if (stateBasicConfigOption.blendBarLineSeriesArr[i] === "bar") {
            barCount++;
          }
        }
      }
      preSetBarTotalWidth = barCount * categoryRange.length * fitFlex(barWidth)
        + (barCount * categoryRange.length - 1) * fitFlex(
          barWidth * (
            barGapFloat < 0
              ? 1
              : (barGapFloat / 100)
          )
        );
    }
    if (stateBasicConfigOption.showDoubleShadow) {
      preSetBarTotalWidth = preSetBarTotalWidth * (
        barGapFloat > 0
          ? 2
          : Math.abs(barGapFloat) / 100
      );
    }
    return preSetBarTotalWidth;
  }
  
  /** 所有bar柱宽度总和超出范围时自适应 */
  barWidthFitFlex = (isVertical: boolean): {
    /** 重置之后的bar柱宽度 */
    actualBarWidth?: number;
    /** 是否有必要重置 */
    flag: boolean;
  } => {
    const {
      stateBasicConfigOption, valueAxisLineOffset, categoryAxisLineOffset, max, gridTop,
    } = this.state;
    
    const barWidth = stateBasicConfigOption.seriesType === "pictorialBar"
      ? isVertical
        // todo 非直角情况目前不考虑，后续优化
        ? stateBasicConfigOption.symbolRotate === -90 ? stateBasicConfigOption.symbolSize[1] : stateBasicConfigOption.symbolSize[0]
        : stateBasicConfigOption.symbolRotate === -90 ? stateBasicConfigOption.symbolSize[0] : stateBasicConfigOption.symbolSize[1]
      : stateBasicConfigOption.barWidth;
    const chartSize = isVertical ? this.chartWidth : this.chartHeight;
    const preSetBarTotalWidth = this.preBarTotalWidth(barWidth);
    
    // 通过计算的粗略预估图表去除y轴的预估内容尺寸(+1是为了不仅弥补计算上的不足，还是安全预估的保障，以免极端情况下应该缩放尺寸的时候没有缩放尺寸)
    let predictContentPx = (`${convertNumToThousand(max)}`.length + 1)
      * fitFlex(stateBasicConfigOption.valueAxisFontSize)
      + preSetBarTotalWidth + fitFlex(valueAxisLineOffset);
    if (!isVertical) {
      predictContentPx = gridTop + fitFlex(stateBasicConfigOption.valueAxisFontSize)
        // 这里底部偏移量*2确实是因为底部gridBottom即使设置为0也还是有距离，这个距离大概是偏移量的大小
        + fitFlex(valueAxisLineOffset) * 2 + preSetBarTotalWidth;
    }
    // 这几步是防止类目数据量过多bar柱宽度此时让其由echarts本身自适应(接近于两个个bar柱宽度即自适应，否则过于拥挤)
    if (!(predictContentPx < chartSize && (chartSize - predictContentPx) > fitFlex(barWidth) * 2)) {
      let actualContentSize;
      if (!isVertical) {
        actualContentSize = chartSize - gridTop - fitFlex(stateBasicConfigOption.valueAxisFontSize) - fitFlex(categoryAxisLineOffset) * 2;
      } else {
        actualContentSize = chartSize - (`${convertNumToThousand(max)}`.length + 1)
          * fitFlex(stateBasicConfigOption.valueAxisFontSize) - fitFlex(valueAxisLineOffset);
      }
      const actualBarWidth = this.calcBarWidth(actualContentSize, barWidth);
      // true已超出范围
      return {
        actualBarWidth,
        flag: true,
      };
    }
    // false未超出范围
    return {
      flag: false,
    };
  }
  
  /** 处理添加真正渲染的series数据 */
  pushRealSeriesData = (
    isVertical: boolean,
    options: any,
    sData: number[],
    color: any,
    index: number,
    markAreaEmphasis?: boolean,
    showDoubleShadow?: boolean,
    progress?: boolean,
    linearPictorialBar?: boolean,
  ) => {
    const {
      stateBasicConfigOption, legendRange, sDataArr, subColor, assistDataArr,
      maxValueLength, xyLinerPoint, assignColor,
    } = this.state;
    
    const seriesTypeTemp = stateBasicConfigOption.blendBarLineSeriesArr ?
      stateBasicConfigOption.blendBarLineSeriesArr[index] || "line"
      :
      linearPictorialBar ?
        "pictorialBar" : stateBasicConfigOption.seriesType;
    
    // bar系列
    const barSeriesType = stateBasicConfigOption.blendBarLineSeriesArr?.includes("bar")
      || seriesTypeTemp === "bar" || seriesTypeTemp === "pictorialBar";
    
    let sDataTotalValue = 0;
    // 对于symbol相关的配置，其实line和pictorialBar都有涉及，
    // 本组件主要默认配置都是针对line的，所以这里做一个对pictorialBar的配置支持
    const pictorialBarSymbol: any = {};
    if (stateBasicConfigOption.seriesType === "pictorialBar" && stateBasicConfigOption.pictorialBarProgress) {
      pictorialBarSymbol.symbolSize = stateBasicConfigOption.symbolSize;
      pictorialBarSymbol.symbol = stateBasicConfigOption.symbolType;
      if (!progress) {
        pictorialBarSymbol.symbolClip = true;
        pictorialBarSymbol.symbolRepeat = true;
        pictorialBarSymbol.animationEasing = "elasticOut";
        pictorialBarSymbol.animationDelay = (dataIndex: number, params: any) => {
          return params.index * 30;
        };
      } else if (progress) {
        pictorialBarSymbol.symbolRepeat = "fixed";
        pictorialBarSymbol.symbolBoundingData = 100;
      }
    }
    if (stateBasicConfigOption.seriesType === "pictorialBar" && !stateBasicConfigOption.pictorialBarProgress) {
      pictorialBarSymbol.symbolRepeat = stateBasicConfigOption.symbolRepeat;
    }
    if (
      (stateBasicConfigOption.seriesType === "pictorialBar" && stateBasicConfigOption.pictorialBarProgress)
      || stateBasicConfigOption.normalBarProgress
    ) {
      // 注意这里需要判断处理
      sData.map(item => sDataTotalValue += (typeof item === "number" ? item : 0));
    }
    if (linearPictorialBar) {
      pictorialBarSymbol.symbolRepeat = true;
      pictorialBarSymbol.symbolClip = true;
      pictorialBarSymbol.symbolMargin = fitFlex(stateBasicConfigOption.linearPictorialBarWidth);
      pictorialBarSymbol.symbolSize = isVertical ?
        [fitFlex(stateBasicConfigOption.barWidth), stateBasicConfigOption.linearPictorialBarDivider]
        : [stateBasicConfigOption.linearPictorialBarDivider, fitFlex(stateBasicConfigOption.barWidth)];
      pictorialBarSymbol.symbol = "rect";
      pictorialBarSymbol.animationEasing = "elasticOut";
      pictorialBarSymbol.symbolOffset = isVertical ?
        [0, -fitFlex(stateBasicConfigOption.linearPictorialBarWidth * 2)]
        : [fitFlex(stateBasicConfigOption.linearPictorialBarWidth * 2), 0];
      pictorialBarSymbol.itemStyle = {
        color: stateBasicConfigOption.linearPictorialBarDividerColor,
      };
      pictorialBarSymbol.emphasis = {
        itemStyle: {
          color: stateBasicConfigOption.linearPictorialBarDividerColor,
        },
      };
    }
    const zObj = { z: 2 };
    const xAxisIndexObj: any = {
      xAxisIndex: stateBasicConfigOption.doubleValueAxis && !isVertical ?
        stateBasicConfigOption.assignAxisIndexArr ?
          stateBasicConfigOption.assignAxisIndexArr[index] === 0 ? 1 : 0
          : index === 0 ? 1 : 0
        : 0,
    };
    const yAxisIndexObj: any = {
      yAxisIndex: stateBasicConfigOption.doubleValueAxis && isVertical ?
        stateBasicConfigOption.assignAxisIndexArr ?
          stateBasicConfigOption.assignAxisIndexArr[index]
          : index === 0 ? 0 : 1
        : 0,
    };
    const tooltipObj: any = {};
    if ((
      (stateBasicConfigOption.seriesType === "pictorialBar" && stateBasicConfigOption.pictorialBarProgress)
      || stateBasicConfigOption.normalBarProgress
      || stateBasicConfigOption.showBarBgc)
      && progress) {
      zObj.z = 1;
      tooltipObj.tooltip = {
        show: false,
      };
      // 调整进度条或者有bar柱背景色的图表轴index索引
      if (isVertical) {
        xAxisIndexObj.xAxisIndex = 1;
      } else {
        yAxisIndexObj.yAxisIndex = 1;
      }
    }
    if (stateBasicConfigOption.doubleWayBar && index === 1) {
      xAxisIndexObj.xAxisIndex = 1;
      yAxisIndexObj.yAxisIndex = 1;
    }
    const labelValueOffsetObj: any = {};
    if (stateBasicConfigOption.labelValueOffset && !isVertical) {
      let maxValueLengthTemp = maxValueLength;
      if ((stateBasicConfigOption.seriesType === "pictorialBar" && stateBasicConfigOption.pictorialBarProgress)
        || stateBasicConfigOption.normalBarProgress) {
        maxValueLengthTemp = 7.5;
      }
      const offsetX = maxValueLengthTemp * fitFlex(stateBasicConfigOption.labelFontSize) * 2 / 3;
      const offsetY = typeof stateBasicConfigOption.categoryOffset === "boolean" && !isVertical ? 3 : 2;
      let exactlyCalcStrTemp = (stateBasicConfigOption.seriesValueLabelSuffix ? stateBasicConfigOption.seriesValueLabelSuffix : "")
        +
        (stateBasicConfigOption.seriesValueLabelPrefix ? stateBasicConfigOption.seriesValueLabelPrefix : "");
      if (stateBasicConfigOption.showSeriesValueLabelAssistData && assistDataArr.length !== 0) {
        const labelAssistData = `${max(assistDataArr.map(item => (max(item))))}`;
        const seriesValueLabelAssistPrefixArrTemp = stateBasicConfigOption.seriesValueLabelAssistPrefixArr ?
          cloneDeep(stateBasicConfigOption.seriesValueLabelAssistPrefixArr) : "";
        const seriesValueLabelAssistSuffixArrTemp = stateBasicConfigOption.seriesValueLabelAssistSuffixArr ?
          cloneDeep(stateBasicConfigOption.seriesValueLabelAssistSuffixArr) : "";
        const labelPrefix = seriesValueLabelAssistPrefixArrTemp ?
          seriesValueLabelAssistPrefixArrTemp.sort((a, b) => { return a.length - b.length; })[seriesValueLabelAssistPrefixArrTemp.length - 1]
          : "";
        const labelSuffix = seriesValueLabelAssistSuffixArrTemp ?
          seriesValueLabelAssistSuffixArrTemp.sort((a, b) => { return a.length - b.length; })[seriesValueLabelAssistSuffixArrTemp.length - 1]
          : "";
        const labelDivider = `${stateBasicConfigOption.seriesValueLabelAssistDivider || ""}`;
        for (let i = 0; i < assistDataArr.length; i++) {
          exactlyCalcStrTemp += (labelAssistData + labelPrefix + labelSuffix + labelDivider);
        }
      }
      const seriesValueLength = (stateBasicConfigOption.seriesValueLabelSuffix && !(
        (stateBasicConfigOption.seriesType === "pictorialBar" && stateBasicConfigOption.pictorialBarProgress)
        || stateBasicConfigOption.normalBarProgress
      )) || stateBasicConfigOption.seriesValueLabelPrefix ?
        exactlyCalcStrCount(exactlyCalcStrTemp)
        : 0;
      const offsetSeriesValueLabel = fitFlex(seriesValueLength * stateBasicConfigOption.labelFontSize);
      
      labelValueOffsetObj.offset = stateBasicConfigOption.doubleWayBar
        ? [
          index === 0 ? (offsetX + offsetSeriesValueLabel) : -(offsetX + offsetSeriesValueLabel),
          -fitFlex(stateBasicConfigOption.labelFontSize / 2 + stateBasicConfigOption.barWidth / 2 + stateBasicConfigOption.doubleWayBarLabelOffsetY),
        ]
        : typeof stateBasicConfigOption.labelValueOffset === "boolean"
          ? stateBasicConfigOption.categoryOffset
            ? [
              -(
                (maxValueLengthTemp) * fitFlex(stateBasicConfigOption.labelFontSize) * 2 / 3
                + fitFlex(stateBasicConfigOption.labelFontSize)
                + offsetSeriesValueLabel
              ),
              -fitFlex(stateBasicConfigOption.barWidth + offsetY),
            ]
            : [-(offsetX + offsetSeriesValueLabel), -fitFlex(stateBasicConfigOption.barWidth + offsetY)]
          :
          [fitFlex(stateBasicConfigOption.labelValueOffset[0]), -fitFlex(stateBasicConfigOption.labelValueOffset[1])];
    }
    if (linearPictorialBar) {
      zObj.z = 3;
      tooltipObj.tooltip = {
        show: false,
      };
    }
    const barWidthObj: any = {
      barWidth: fitFlex(stateBasicConfigOption.barWidth),
    };
    let barTopValueSize: number | undefined;
    const barGapObj: any = {
      barGap: stateBasicConfigOption.blendBarLineSeriesArr
        ? "0%"
        : stateBasicConfigOption.barGap,
    };
    
    // 折线系列不需要计算bar柱宽度的影响
    if (!stateBasicConfigOption.dataZoomAble && barSeriesType) {
      const chartContentRangeFlag = this.barWidthFitFlex(isVertical);
      if (chartContentRangeFlag.flag && !stateBasicConfigOption.disabledCalcBarWidth) {
        barWidthObj.barWidth = chartContentRangeFlag.actualBarWidth;
        // 重置bar柱宽度后需要将barGap置0
        barGapObj.barGap = "0%";
        // barTopValue的label字体大小也要与重置的bar柱宽度一致(由于一般数字要比中文小一半所以乘以1.35弥补计算上的不足)
        // @ts-ignore
        barTopValueSize = chartContentRangeFlag.actualBarWidth * 1.35;
      }
    }
    let markAreaObj = {};
    if (stateBasicConfigOption.showMarkArea && index === 0) {
      const markAreaAxisArrTemp = markAreaEmphasis ?
        stateBasicConfigOption.markAreaEmphasisAxisArr : stateBasicConfigOption.markAreaAxisArr;
      const markAreaTextArrTemp = markAreaEmphasis ?
        stateBasicConfigOption.markAreaEmphasisTextArr : stateBasicConfigOption.markAreaTextArr;
      const markAreaItemColorTemp = markAreaEmphasis ?
        stateBasicConfigOption.markAreaEmphasisItemColor : stateBasicConfigOption.markAreaItemColor;
      markAreaObj = {
        markArea: {
          silent: true,
          data: (markAreaAxisArrTemp || []).map((item: string[]) => {
            return isVertical ?
              [{ xAxis: item[0] }, { xAxis: item[1] }]
              :
              [{ yAxis: item[0] }, { yAxis: item[1] }];
          }),
          label: {
            show: true,
            formatter: (params: any) => {
              if (markAreaTextArrTemp && markAreaTextArrTemp.length !== 0 && markAreaTextArrTemp[params.dataIndex]) {
                return markAreaTextArrTemp[params.dataIndex];
              }
              return "";
            },
            color: stateBasicConfigOption.markAreaLabelColor,
            fontSize: fitFlex(stateBasicConfigOption.markAreaLabelFontSize),
            fontWeight: stateBasicConfigOption.marAreaLabelFontWeight,
            offset: isVertical ?
              [0, fitFlex(stateBasicConfigOption.marAreaLabelOffset)]
              :
              [-fitFlex(stateBasicConfigOption.marAreaLabelOffset), 0],
            position: isVertical ? "insideTop" : "insideRight",
          },
          itemStyle: {
            color: markAreaItemColorTemp,
          },
        },
      };
    }
    let markLineObj = {};
    if (stateBasicConfigOption.showMarkLine) {
      const markLineData: any = stateBasicConfigOption.markLineAxisArr ?
        // @ts-ignore
        stateBasicConfigOption.markLineAxisArr.map((item: string | number) => {
          return (isVertical && typeof item === "string") || (!isVertical && typeof item === "number") ?
          {
            xAxis: item,
            symbol: stateBasicConfigOption.markLineSymbolType ? stateBasicConfigOption.markLineSymbolType[0] : "circle",
            symbolSize: stateBasicConfigOption.showMarkLineSymbol ? stateBasicConfigOption.markLineStartSymbol : 0,
          }
          :
          {
            yAxis: item,
            symbol: stateBasicConfigOption.markLineSymbolType ? stateBasicConfigOption.markLineSymbolType[0] : "circle",
            symbolSize: stateBasicConfigOption.showMarkLineSymbol ? stateBasicConfigOption.markLineStartSymbol : 0,
          };
        }) : [];
      if (stateBasicConfigOption.markLineDataTypeArr) {
        for (let i = 0; i < stateBasicConfigOption.markLineDataTypeArr.length; i++) {
          markLineData.push({
            type: stateBasicConfigOption.markLineDataTypeArr[i],
            symbol: stateBasicConfigOption.markLineSymbolType ? stateBasicConfigOption.markLineSymbolType[0] : "circle",
            symbolSize: stateBasicConfigOption.showMarkLineSymbol ? stateBasicConfigOption.markLineStartSymbol : 0,
          });
        }
      }
      markLineObj = {
        markLine: {
          silent: true,
          symbol: stateBasicConfigOption.markLineSymbolType ? stateBasicConfigOption.markLineSymbolType[1] : "arrow",
          // 标记线尾部箭头只能通过全局配置消除，data内部设置的是针对起始位置的symbol
          symbolSize: stateBasicConfigOption.showMarkLineSymbol ?
            [
              fitFlex(stateBasicConfigOption.markLineEndSymbol[0]),
              fitFlex(stateBasicConfigOption.markLineEndSymbol[0]),
            ]
            : 0,
          data: markLineData,
          lineStyle: {
            // 不支持回调
            color: stateBasicConfigOption.markLineColor,
            width: fitFlex(stateBasicConfigOption.markLineWidth),
            type: stateBasicConfigOption.markLineType,
          },
          label: {
            position: stateBasicConfigOption.markLineLabelPosition ?
              stateBasicConfigOption.markLineLabelPosition
              : isVertical ||
              (!isVertical
              && stateBasicConfigOption.markLineAxisArr
              && typeof stateBasicConfigOption.markLineAxisArr[0] === "number") ?
                "start" : "end",
            formatter: (params: any) => {
              const labelText = params.data.type === "average"
                ? `${stateBasicConfigOption.markDataTypeAverageText || "平均值"}`
                : params.data.type === "median"
                  ? `${stateBasicConfigOption.markDataTypeMedianText || "中位数"}`
                  : params.data.type === "max"
                    ? `${stateBasicConfigOption.markDataTypeMaxText || "最大值"}`
                    : params.data.type === "min"
                      ? `${stateBasicConfigOption.markDataTypeMinText || "最小值"}`
                      : "";
              if (labelText) {
                return `${stateBasicConfigOption.showMarkLineLabelText ? labelText : ``}${params.data.value}`;
              }
              // @ts-ignore
              if (stateBasicConfigOption.markLineAxisArr && typeof stateBasicConfigOption.markLineAxisArr[0] === "number") {
                return `${stateBasicConfigOption.showMarkLineLabelText ?
                  `${stateBasicConfigOption.markLineLabelTextArr ?
                    stateBasicConfigOption.markLineLabelTextArr[params.dataIndex] : ""}` : ``}${params.data.value}`;
              }
              // @ts-ignore
              return `${stateBasicConfigOption.markLineLabelLink ? `${params.value} ` : ""}${stateBasicConfigOption.markLineLabelTextArr[params.dataIndex]}`;
            },
            fontSize: fitFlex(stateBasicConfigOption.markLineLabelFontSize),
            color: stateBasicConfigOption.markLineLabelColor,
          },
          // 之前有一版本的echarts-for-react貌似不支持emphasis高亮，现在更新了版本尚未调试emphasis
        },
      };
    }
    let markPointObj = {};
    if (stateBasicConfigOption.showMarkPoint) {
      let markPointData: any = [];
      if (stateBasicConfigOption.markPointDataType) {
        for (let i = 0; i < stateBasicConfigOption.markPointDataType.length; i++) {
          markPointData.push({
            type: stateBasicConfigOption.markPointDataType[i],
          });
        }
      } else {
        markPointData = [{ type: "average" }];
      }
      markPointObj = {
        markPoint: {
          symbol: stateBasicConfigOption.markPointSymbol,
          symbolSize: stateBasicConfigOption.markPointSymbolSize ?
            stateBasicConfigOption.markPointSymbolSize
            : (value: number) => {
              return (`${value}`.length * 1.8) * stateBasicConfigOption.markPointFontSize;
            },
          itemStyle: {
            color: stateBasicConfigOption.markPointColor ? stateBasicConfigOption.markPointColor : undefined,
          },
          label: {
            color: stateBasicConfigOption.markPointFontColor ?
              stateBasicConfigOption.markPointFontColor
              : subColor[index],
            fontSize: fitFlex(stateBasicConfigOption.markPointFontSize),
            formatter: (params: any) => {
              const labelText = params.data.type === "average" ?
                `${stateBasicConfigOption.markDataTypeAverageText || "平均值"}\n`
                : params.data.type === "max" ?
                  `${stateBasicConfigOption.markDataTypeMaxText || "最大值"}\n`
                  : `${stateBasicConfigOption.markDataTypeMinText || "最小值"}\n`;
              if (params.data.type) {
                return `${stateBasicConfigOption.showMarkPointLabelText ? labelText : ``}${params.data.value}`;
              }
              // @ts-ignore
              return `${params.data.value}`;
            },
          },
          data : markPointData,
        },
      };
    }
    
    const barSeriesLargeObj = (
      stateBasicConfigOption.blendBarLineSeriesArr?.includes("bar")
      || stateBasicConfigOption.seriesType === "bar" || linearPictorialBar
    ) ? {
      // 大数据量优化，缺点：优化后不能自定义设置单个数据项的样式
      large: stateBasicConfigOption.largeData,
      // large为true且数据量>largeThreshold才启用大规模模式
      largeThreshold: stateBasicConfigOption.largeDataThreshold,
    } : {};
    
    // 加载数据（也就是第二步push才是真正的渲染数据）
    options.series.push(Object.assign({},
      markLineObj, markAreaObj, markPointObj,
      yAxisIndexObj, xAxisIndexObj, Object.assign({},
        { name: legendRange[index] },
        zObj, tooltipObj, Object.assign({}, {
          barMinHeight: stateBasicConfigOption.barMinHeight,
          data: (stateBasicConfigOption.seriesType === "pictorialBar" && stateBasicConfigOption.pictorialBarProgress)
          || stateBasicConfigOption.normalBarProgress ?
            progress ?
              Array(sData.length).fill(100)
              :
              stateBasicConfigOption.selfPer ? sData : sData.map(item => item / sDataTotalValue * 100)
            : stateBasicConfigOption.connectNullsHandle ?
              markAreaEmphasis ? sData.map(item => {
                // 判断数据是否全部为0，解决与connectNullsHandle的tooltip冲突bug
                if (sData.every(d => { return d === 0; })) {
                  return 0;
                }
                if (item === 0) {
                  return null;
                }
                return item;
              }) : sData.map(() => null)
              :
              stateBasicConfigOption.showBarBgc && progress ?
                sData.map(() => this.state.max)
                :
                stateBasicConfigOption.doubleWayBar && index === 0 ?
                  sData.map(item => (typeof item === "number" ? -item : item))
                  : sData,
          type: seriesTypeTemp,
          stack: stateBasicConfigOption.stack ?
            "stack"
            :
            showDoubleShadow ?
              `doubleShadow${index}`
              :
              progress ?
                `${legendRange[index]}Progress`
                :
                stateBasicConfigOption.assignStack ?
                  stateBasicConfigOption.assignStack[index] || "stackConcat"
                  :
                  legendRange[index],
        }, barGapObj, barWidthObj, Object.assign({}, {
          // 对于bar柱状图就是bar柱，对于line折线图就是折线拐点
          itemStyle: {
            color: showDoubleShadow ?
              "rgba(250,250,250,0.1)"
              :
              progress ?
                (((stateBasicConfigOption.seriesType === "pictorialBar" && stateBasicConfigOption.pictorialBarProgress)
                  || stateBasicConfigOption.normalBarProgress
                  || stateBasicConfigOption.showBarBgc)
                  && stateBasicConfigOption.progressBarBgc) ?
                  stateBasicConfigOption.progressBarBgc
                  :
                  stateBasicConfigOption.assignBarColor ?
                    assignColor && assignColor[index] ?
                      `${tinycolor(assignColor[index][0]).setAlpha(0.15)}`
                      : `${tinycolor(subColor[index]).setAlpha(0.15)}`
                    :
                    `${stateBasicConfigOption.showColorLinear ?
                      (stateBasicConfigOption.singleBarColor && stateBasicConfigOption.normalBarProgress) ?
                        "rgba(250,250,250,0.1)"
                        :
                        tinycolor(subColor[index]).setAlpha(0.1)
                      :
                      (stateBasicConfigOption.singleBarColor && stateBasicConfigOption.normalBarProgress) ?
                        "rgba(250,250,250,0.1)"
                        :
                        tinycolor(color).setAlpha(0.15)}`
                :
                stateBasicConfigOption.singleBarColor ?
                  stateBasicConfigOption.showColorLinear ?
                    (params: any) => {
                      return this.generateColor(
                        params.dataIndex,
                        stateBasicConfigOption.setAlphaNumberArr
                          ? stateBasicConfigOption.setAlphaNumberArr
                          : [0.8, 0.05]
                      );
                    }
                    :
                    (params: any) => subColor[params.dataIndex]
                  :
                  color,
            borderRadius: stateBasicConfigOption.stack && stateBasicConfigOption.barBorderRadius === undefined ? (
              index === 0 ? (
                isVertical ?
                  [
                    0,
                    0,
                    fitFlex(stateBasicConfigOption.stackBarBorderRadius),
                    fitFlex(stateBasicConfigOption.stackBarBorderRadius),
                  ]
                  :
                  [
                    fitFlex(stateBasicConfigOption.stackBarBorderRadius),
                    0,
                    0,
                    fitFlex(stateBasicConfigOption.stackBarBorderRadius),
                  ]
              ) : (
                index === legendRange.length - 1 ? (
                  isVertical ?
                    [
                      fitFlex(stateBasicConfigOption.stackBarBorderRadius),
                      fitFlex(stateBasicConfigOption.stackBarBorderRadius),
                      0,
                      0,
                    ]
                    :
                    [
                      0,
                      fitFlex(stateBasicConfigOption.stackBarBorderRadius),
                      fitFlex(stateBasicConfigOption.stackBarBorderRadius),
                      0,
                    ]
                ) : 0
              )
            ) : stateBasicConfigOption.barBorderRadius
            && stateBasicConfigOption.barBorderRadius instanceof Array ?
              stateBasicConfigOption.barBorderRadius
              :
              fitFlex(stateBasicConfigOption.barBorderRadius ? stateBasicConfigOption.barBorderRadius as number : 0),
          },
          // 折线的拐点外层阴影高亮symbol/bar柱的高亮
          emphasis: {
            // 这里高亮item样式是针对line的，所以要判断，否则会影响bar图表的高亮样式
            itemStyle: stateBasicConfigOption.seriesType === "line" ? {
              borderColor: tinycolor(color).setAlpha(0.2).toRgbString(),
              borderWidth: fitFlex(stateBasicConfigOption.symbolBorderWidth),
            } : stateBasicConfigOption.seriesType === "bar"
            && !progress
            && !stateBasicConfigOption.singleBarColor
            && !showDoubleShadow ?
              {
                color: this.generateColor(
                  index,
                  stateBasicConfigOption.setAlphaNumberArr ?
                    stateBasicConfigOption.setAlphaNumberArr.map((item: number) => { return item + 0.35; }) : [0.8, 0.45]),
              }
              : {},
          },
          label: Object.assign({}, {
            // 这个seriesValueLabel值的显示可能会垂直方向左右拥挤显示交叠，目前采用倾斜办法补救(水平方向已解决显示bug)
            // 这个bug只能通过调整chart图表整体de宽度进行调整，通过自适应计算布局很难实现
            // 望使用此功能的使用者尽量在图形范围宽裕的情况下使用更加锦上添花哟
            // 如果是重影则不显示label值
            show: showDoubleShadow ?
              false
              :
              (stateBasicConfigOption.seriesType === "pictorialBar" && stateBasicConfigOption.pictorialBarProgress)
              || stateBasicConfigOption.normalBarProgress
              || stateBasicConfigOption.showBarBgc ?
                !stateBasicConfigOption.showSeriesValueLabel ? false : !!progress
                :
                stateBasicConfigOption.showSeriesValueLabel,
            position: isVertical ?
              "top"
              :
              stateBasicConfigOption.doubleWayBar && index === 0 ? "left" : "right",
            distance: fitFlex(stateBasicConfigOption.valueLabelDistance),
            fontSize: barTopValueSize ? barTopValueSize : fitFlex(stateBasicConfigOption.labelFontSize),
            color: stateBasicConfigOption.labelValueColor
              ? stateBasicConfigOption.labelValueColor
              : stateBasicConfigOption.assignBarColor
                ? assignColor && assignColor[index]
                  ? assignColor[index][0]
                  : subColor[index]
                : subColor[index],
            formatter: (obj: any) => {
              const progressData = stateBasicConfigOption.selfPer ?
                sData : sData.map(item => (typeof item === "number" ? item : 0) / sDataTotalValue * 100);
              let labelData = 0;
              for (let indexProgress = 0; indexProgress < progressData.length; indexProgress++) {
                if (indexProgress === obj.dataIndex) {
                  labelData = progressData[indexProgress];
                }
              }
              let resTemp = ((stateBasicConfigOption.seriesType === "pictorialBar" && stateBasicConfigOption.pictorialBarProgress)
                || stateBasicConfigOption.normalBarProgress
                || stateBasicConfigOption.showBarBgc) && progress ?
                `${stateBasicConfigOption.showBarBgc ?
                  `${sData[obj.dataIndex]}${stateBasicConfigOption.seriesValueLabelSuffix ? stateBasicConfigOption.seriesValueLabelSuffix : ""}`
                  : `${round(labelData, stateBasicConfigOption.percentRemainCount)}%`}`
                :
                stateBasicConfigOption.doubleWayBar
                && stateBasicConfigOption.doubleWayBarPNHandle
                && obj.value < 0 ?
                  `${-obj.value}${stateBasicConfigOption.seriesValueLabelSuffix ? stateBasicConfigOption.seriesValueLabelSuffix : ""}`
                  :
                  `${obj.value}${stateBasicConfigOption.seriesValueLabelSuffix ? stateBasicConfigOption.seriesValueLabelSuffix : ""}`;
              resTemp = `${stateBasicConfigOption.seriesValueLabelPrefix ? stateBasicConfigOption.seriesValueLabelPrefix : ""}${resTemp}`;
              // 依辅助数据为基准计算
              if (stateBasicConfigOption.showSeriesValueLabelAssistData) {
                let assistDataFixStr = "";
                for (let adrIndex = 0; adrIndex < assistDataArr.length; adrIndex++) {
                  const item = assistDataArr[adrIndex];
                  for (let adrIndex2 = 0; adrIndex2 < item.length; adrIndex2++) {
                    if (obj.dataIndex === adrIndex2) {
                      const item2 = item[adrIndex2];
                      const labelPrefix = stateBasicConfigOption.seriesValueLabelAssistPrefixArr
                      && stateBasicConfigOption.seriesValueLabelAssistPrefixArr[adrIndex] ?
                        stateBasicConfigOption.seriesValueLabelAssistPrefixArr[adrIndex] : "";
                      const labelSuffix = stateBasicConfigOption.seriesValueLabelAssistSuffixArr
                      && stateBasicConfigOption.seriesValueLabelAssistSuffixArr[adrIndex] ?
                        stateBasicConfigOption.seriesValueLabelAssistSuffixArr[adrIndex] : "";
                      const labelDivider = `${stateBasicConfigOption.seriesValueLabelAssistDivider || ""}`;
                      assistDataFixStr += `${labelPrefix}${item2}${labelSuffix}${labelDivider}`;
                    }
                  }
                }
                resTemp = `${assistDataFixStr}${resTemp}`;
              }
              return resTemp;
            },
            rotate: sDataArr.length > 1 ?
              isVertical ?
                stateBasicConfigOption.seriesType === "bar" ?
                  stateBasicConfigOption.seriesValueLabelRotate !== undefined ? stateBasicConfigOption.seriesValueLabelRotate : 45
                  :
                  stateBasicConfigOption.seriesValueLabelRotate !== undefined ? stateBasicConfigOption.seriesValueLabelRotate : 0
                : 0
              : 0,
          }, labelValueOffsetObj),
          // <!-- 折线line -->
          smooth: stateBasicConfigOption.lineSmooth,
          lineStyle: {
            width: fitFlex(stateBasicConfigOption.lineWidth),
            type: stateBasicConfigOption.seriesLineTypeArr ? (stateBasicConfigOption.seriesLineTypeArr[index] || "solid") : "solid",
          },
          areaStyle: stateBasicConfigOption.showLineArea === false || stateBasicConfigOption.showLineArea === undefined ?
            undefined
            :
            {
              color: (typeof stateBasicConfigOption.showLineArea === "boolean" && stateBasicConfigOption.showLineArea)
              || (
                stateBasicConfigOption.showLineArea instanceof Array
                && stateBasicConfigOption.showLineArea[index]
              )
                // 解决line且有areaStyle时数据只要含有0时又要对数显示而出现echarts渐变画图的bug
                ? (stateBasicConfigOption.valueAxisLogMode && sData.some(d => { return d === 0; }))
                  ? "transparent"
                  : Object.assign({}, { type: "linear" }, xyLinerPoint, {
                    colorStops: [
                      {
                        offset: 0,
                        color: tinycolor(color).setAlpha(stateBasicConfigOption.setAlphaNumberArr ?
                          stateBasicConfigOption.setAlphaNumberArr[0] : 0.2).toRgbString(), // 0% 处的颜色
                      },
                      {
                        offset: 1,
                        color: tinycolor(color).setAlpha(stateBasicConfigOption.setAlphaNumberArr ?
                          stateBasicConfigOption.setAlphaNumberArr[1] : 0).toRgbString(), // 100% 处的颜色
                      },
                    ],
                    // 前四个参数分别是 x0, y0, x2, y2, 范围从 0 - 1，相当于在图形包围盒中的百分比，
                    // 如果 globalCoord 为 `true`，则该四个值是绝对的像素位置
                    globalCoord: false, // 缺省为 false
                  })
                : "transparent",
          },
          showSymbol: stateBasicConfigOption.showSymbol,
          symbol: stateBasicConfigOption.symbolType,
          symbolSize: typeof stateBasicConfigOption.symbolSize === "number" ?
            fitFlex(stateBasicConfigOption.symbolSize)
            :
            stateBasicConfigOption.symbolSize,
          step: stateBasicConfigOption.lineStep,
          // <!-- pictorialBar -->
          symbolMargin: fitFlex(stateBasicConfigOption.symbolMargin),
          symbolRotate: stateBasicConfigOption.symbolRotate,
        }, pictorialBarSymbol, barSeriesLargeObj)))));
  }
}

export * from "./chart-base-config";
export * from "./interface";
export * from "./static";
export * from "./styled";
export * from "./utils";
