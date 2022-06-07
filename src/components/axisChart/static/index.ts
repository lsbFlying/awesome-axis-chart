import {
  AxisChartEventType, AxisNameLocation, IconType, LoadingOption, OpenCloseArea,
  PictureType, SeriesType, TooltipAxisPointerType, LineStyleType,
} from "../interface";
import { darkChartGlobalBasicConfig, lightChartGlobalBasicConfig } from "../chart-base-config";

/**
 * 默认参数配置
 * created by liushanbao
 * @author liushanbao
 */
export const defaultBasicConfigOption = {
  defaultEqPx: 1920,
  legendSelectedMode: true,
  legendColorFollow: true,
  showValueAxisName: true,
  showCategoryAxisName: false,
  valueAxisNameLocation: "end" as AxisNameLocation,
  categoryAxisNameLocation: "end" as AxisNameLocation,
  valueAxisNameFontSize: 10,
  categoryAxisNameFontSize: 10,
  valueAxisFontSize: 10,
  categoryAxisFontSize: 10,
  // tooltip相关数据之所以设置最小默认值12是因为大部分浏览器最小像素值的文本数据值就是12px
  tooltipFontSize: 12,
  tooltipTitleFontSize: 12,
  labelFontSize: 10,
  barWidth: 10,
  barMinHeight: 0,
  stackBarBorderRadius: 2,
  lineWidth: 1,
  rectBarHeight: 2,
  valueLabelDistance: 5,
  legendItemWidth: 8,
  legendItemHeight: 4,
  legendPadding: 0,
  legendItemGap: 10,
  legendFontSize: 10,
  legendIcon: "roundRect" as IconType,
  legendTop: 2,
  tooltipPadding: 5,
  tooltipBorderWidth: 0,
  tooltipBorderRadius: 4,
  axisPointerLineWidth: 1,
  splitValueLineWidth: 1,
  splitValueLineType: "dotted" as LineStyleType,
  splitCategoryLineWidth: 1,
  splitCategoryLineType: "dotted" as LineStyleType,
  axisPointerLineType: "solid" as LineStyleType,
  connectNullsHandle: false,
  showValueAxisLine: false,
  valueAxisLineWidth: 1,
  showTooltipIndex: 0,
  loopShowTooltip: false,
  loopShowTooltipTime: 1000,
  inactiveColor: "#ccc",
  barGap: "30%",
  valueAxisSplitNumber: 5,
  splitValueAreaColorArr: ["rgba(250,250,250,0.0)", "rgba(250,250,250,0.05)"],
  splitCategoryAreaColorArr: ["rgba(250,250,250,0.0)", "rgba(250,250,250,0.05)"],
  showBarTopRect: true,
  showColorLinear: true,
  seriesType: "bar" as SeriesType,
  showTooltip: true,
  alwaysShowTooltip: false,
  tooltipAxisPointerType: "shadow" as TooltipAxisPointerType,
  symbolType: "circle" as IconType,
  symbolBorderWidth: 6,
  symbolSize: 3,
  symbolMargin: 1,
  showLineArea: false,
  axisLabelRotate: false,
  axisLabelRotateAngle: 35,
  showValueSplitLine: true,
  showCategorySplitLine: false,
  showValueAxis: true,
  showCategoryAxis: true,
  categoryBoundaryGap: true,
  showCategoryAxisTick: false,
  showValueAxisTick: false,
  axisTickLength: 4,
  axisTickColor: "#fff",
  showCategoryAxisLine: true,
  showDoubleShadow: false,
  stack: false,
  initShowTooltip: false,
  showSeriesValueLabel: false,
  lineSmooth: false,
  showSymbol: false,
  lineStep: false,
  doubleValueAxis: false,
  singleBarColor: false,
  normalBarProgress: false,
  selfPer: false,
  showBarBgc: false,
  categoryAxisLineWidth: 1,
  markAreaLabelFontSize: 10,
  markAreaLabelColor: "#45c1ee",
  marAreaLabelFontWeight: 500,
  marAreaLabelOffset: 8,
  markAreaEmphasisItemColor: "rgba(92,222,255,0.09)",
  markAreaItemColor: "transparent",
  markLineColor: "#ffbb00",
  markLineLabelColor: "#ffbb00",
  markLineWidth: 1,
  markLineType: "dotted" as LineStyleType,
  markLineLabelFontSize: 10,
  showMarkLineLabelText: true,
  showMarkPointLabelText: true,
  showMarkLineSymbol: false,
  markLineEndSymbol: [5, 5],
  markLineStartSymbol: 5,
  markPointSymbol: "pin" as IconType,
  markPointFontSize: 10,
  showAssistData: false,
  handleValueAxisRange: false,
  assistDataUnit: "",
  assistDataUpDown: false,
  doubleWayBar: false,
  doubleWayBarPNHandle: false,
  doubleWayBarCategoryCenter: false,
  doubleWayBarPercent: false,
  doubleWayBarLabelOffsetY: 0,
  disabledFitFlex: true,
  valueAxisSuffixHandle: false,
  categoryAxisSuffixHandle: false,
  categoryAxisLineOffset: 8,
  valueAxisLineOffset: 8,
  dataZoomAble: false,
  dataZoomBgc: "transparent",
  dataZoomHeight: 14,
  dataZoomLock: false,
  dataZoomRange: [0, 50],
  dataZoomHandleIcon: "path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z",
  dataZoomHandleSize: "110%",
  dataZoomHandleColor: "#45c1ee",
  dataZoomHandleBorderWidth: 0,
  dataZoomHandleTextColor: "#45c1ee",
  dataZoomBorderColor: "rgba(0, 187, 255, 0.45)",
  dataZoomHandleTextSize: 10,
  chartSavePixelRatio: 1,
  chartSaveAsImageBgc: "#fff",
  chartSaveAsImageType: "png" as PictureType,
  largeData: false,
  largeDataThreshold: 150,
  showGridBg: false,
  disabledCalcBarGap: true,
  disabledCalcBarWidth: true,
  onHandleEventType: "click" as AxisChartEventType,
  linearPictorialBarWidth: 2,
  linearPictorialBarDivider: 1.7,
  linearPictorialBarDividerColor: "#061348",
  percentRemainCount: 2,
  symbolSizeRate: 1,
  scatterYValueAxisCenterOffset: 8,
  scatterColorsItemOpenClose: "lcro" as OpenCloseArea,
  scatterSymbolColorOpacity: 0.25,
  categoryAxisLabelStyleObj: {},
  valueAxisLogBase: 10,
  gridBottomDisLegendBottom: 8,
};

/**
 * 明亮系主题风格配置
 * created by liushanbao
 * @author liushanbao
 */
export const lightDefaultBasicConfigOption = {
  ...defaultBasicConfigOption,
  ...lightChartGlobalBasicConfig,
};

/**
 * 暗黑系主题风格配置
 * created by liushanbao
 * @author liushanbao
 */
export const darkDefaultBasicConfigOption = {
  ...defaultBasicConfigOption,
  ...darkChartGlobalBasicConfig,
};

/**
 * 默认loading配置
 * created by liushanbao
 * @author liushanbao
 */
export const defaultLoadingOption: LoadingOption = {
  text: "loading",
  textColor: "#00ccff",
  color: "#00ccff",
  maskColor: "rgba(0, 0, 0, 0.1)",
  zlevel: 0,
  // 字体大小。从 `v4.8.0` 开始支持。
  fontSize: 12,
  // 是否显示旋转动画（spinner）。从 `v4.8.0` 开始支持。
  showSpinner: true,
  // 旋转动画（spinner）的半径。从 `v4.8.0` 开始支持。
  spinnerRadius: 12,
  // 旋转动画（spinner）的线宽。从 `v4.8.0` 开始支持。
  lineWidth: 2,
  // 字体粗细。从 `v5.0.1` 开始支持。
  fontWeight: "normal",
  // 字体风格。从 `v5.0.1` 开始支持。
  fontStyle: "normal",
  // 字体系列。从 `v5.0.1` 开始支持。
  fontFamily: "sans-serif"
};
