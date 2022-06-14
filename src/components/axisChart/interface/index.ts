import React from "react";
import { AxisChartICSSProps } from "./icss";
import { ChartProps } from "./chart";
import { ChartColorPalette } from "./color";
import { darkDefaultBasicConfigOption } from "../static";

/**
 * created by liushanbao
 * @author liushanbao
 */
export type AxisChartProps = AxisChartICSSProps & ChartProps & ChartColorPalette & {
  /**
   * @desc: 主题（纵向暗系 | 横向暗系 | 纵向明系 | 横向明系）
   * @type {("verticalDark" | "horizontalDark" | "verticalLight" | "horizontalLight")}
   * @default "verticalDark" 默认纵向暗系
   */
  theme: "verticalDark" | "horizontalDark" | "verticalLight" | "horizontalLight";
  /** 基础配置 */
  basicConfigOption?: BasicConfigOption;
  /**
   * 单位后缀，数组长度为4(按照索引顺序分别是：单位ID后缀，月-类目轴单位，cm-值轴单位，mm-双Y轴时的右侧y轴单位)
   * 为双值轴或者多值轴数据类型衍生出来的功能属性配置，一般非多值轴的情况直接使用suffix即可
   */
  unitFix: string[];
  /** 接收图表chart实例 */
  getInstance?(instance: any): void;
  /** 图表loading对象配置 */
  loadingOption: LoadingOption;
  /** 图表数据缓冲loading */
  echartsLoading: boolean;
  /**
   * 是否合并echarts图表参数配置(默认为false合并，这样可以提高渲染的流畅度)
   * 但是有些情况下还是需要的，可以避免有些合并渲染之后的数据bug，所以一般在配置不是过于交互复杂的情况下可以默认为合并
   * 除非某些功能复杂，配置属性变化多样才可能导致渲染bug的情况下再启用不合并来免除bug
   */
  noMergeOption: boolean;
}

/**
 * created by liushanbao
 * @author liushanbao
 */
export type SeriesType = "bar" | "line" | "pictorialBar" | "scatter";

/**
 * created by liushanbao
 * @author liushanbao
 */
export type AxisChartEventType =
  | "click"
  | "dblclick"
  | "mousedown"
  | "mousemove"
  | "mouseup"
  | "mouseover"
  | "mouseout"
  | "legendselectchanged";

/**
 * created by liushanbao
 * @author liushanbao
 */
export type PositionType = "start" | "middle" | "end";

/**
 * created by liushanbao
 * @author liushanbao
 */
export type MarkLinePositionType =
  | "start"
  | "middle"
  | "end"
  | "insideStartTop"
  | "insideStartBottom"
  | "insideMiddleTop"
  | "insideMiddleBottom"
  | "insideEndTop"
  | "insideEndBottom";

/**
 * created by liushanbao
 * @author liushanbao
 */
export type PictureType = "png" | "jpeg";

/**
 * created by liushanbao
 * @author liushanbao
 * @description lcro:左闭右开; lorc:左开右闭; loro左开右开; lcrc:左闭右闭
 */
export type OpenCloseArea = "lcro" | "lorc" | "loro" | "lcrc";

/**
 * created by liushanbao
 * @author liushanbao
 */
export type AxisNameLocation = (string | number) | "start" | "end";

/**
 * legend/symbol图例的样式类型
 * created by liushanbao
 * @author liushanbao
 */
export type IconType =
  | "circle"
  | "rect"
  | "roundRect"
  | "triangle"
  | "diamond"
  | "pin"
  | "arrow"
  | "none"
  | string;   // 便于兼容image://url类型以及path://svg path data类型

/**
 * 提示框指示器的触发类型
 * created by liushanbao
 * @author liushanbao
 */
export type TooltipAxisPointerType = "line" | "shadow" | "none" | "cross";

/**
 * 线条的类型
 * created by liushanbao
 * @author liushanbao
 */
export type LineStyleType = "solid" | "dashed" | "dotted";

/**
 * created by liushanbao
 * @author liushanbao
 */
export type MarkLineDataTypeArr = ("max" | "min" | "average" | "median")[];

/**
 * created by liushanbao
 * @author liushanbao
 */
export type MarkPointDataTypeArr = ("max" | "min" | "average")[];

/**
 * chart作为图片下载接口
 * created by liushanbao
 * @author liushanbao
 */
export interface ImgSourceDownLoad {
  /** 下载 */
  downLoad(): void;
  /** 销毁下载的dom标签a */
  destroy(): void;
}

/**
 * axis-chart图表基础配置接口
 * created by liushanbao
 * @author liushanbao
 */
export interface BasicConfigOption {
  /**
   * UI设计的分辨率（默认1920px-宽度，即默认UI尺寸为1920 * 1080）
   * 注意：设备尺寸如果开启了组件内部自适应尺寸，只能向下兼容尺寸，
   * 也就是1920只能兼容低于这个分辨率的才准确
   * 如果高于则不在精确会出现适应偏差
   **/
  defaultEqPx?: number;
  /** 是否显示图表标题图例 */
  showLegend?: boolean;
  /** 是否具备 legend 的选择渲染模式*/
  legendSelectedMode?: boolean;
  /** legend图例宽度（但是这个宽度与下面的高度并不是针对于图例本身而言的，而是针对图例icon外层容器） */
  legendItemWidth?: number;
  /** legend图例整体的内边距，默认为0 */
  legendPadding?: number | number[];
  /** legend图例高度 */
  legendItemHeight?: number;
  /** 图例每项之间的间隔(这个间隔不仅是左右，图例flexWrap换行后还包含顶部top/底部bottom的距离同样是该值) */
  legendItemGap?: number;
  /** legend 字体大小 */
  legendFontSize?: number;
  /** legend 字体颜色 */
  legendColor?: string;
  /**
   * 对应图表的标题图例icon
   * 注意：但是legendIcon属性在E charts中是与legendItemWidth/Height相冲突的，如果设置了legendIcon
   * 那么这个icon就不会随着宽高变化，也就是legendItemWidth/Height是针对图例icon外层容器
   **/
  legendIcon?: IconType;
  /** legend颜色是否跟随每一系列图表颜色一样 */
  legendColorFollow?: boolean;
  /** 图例的选择显示数组(初始化默认全部显示) */
  legendSelectedObj?: { [key: string]: boolean };
  /** 是否显示值轴name */
  showValueAxisName?: boolean;
  /** 是否显示类目轴name */
  showCategoryAxisName?: boolean;
  /** 自定义值轴名称(即值轴单位) */
  assignValueAxisName?: string;
  /** 自定义副值轴名称(即第二个值轴单位) */
  assignSubValueAxisName?: string;
  /** 自定义类目轴名称(即值轴单位) */
  assignCategoryAxisName?: string;
  /** 值轴name的位置（start/end，可number/百分比）*/
  valueAxisNameLocation?: AxisNameLocation;
  /** 类目轴name的位置（start/end，可number/百分比）*/
  categoryAxisNameLocation?: AxisNameLocation;
  /** 值轴name的位置（为上下左右四个方位的css调控，最大程度满足自定义）*/
  assignValueAxisNameLocation?: React.CSSProperties;
  /** 类目轴name的位置（为上下左右四个方位的css调控，最大程度满足自定义）*/
  assignCategoryAxisNameLocation?: React.CSSProperties;
  /** 值轴name字体大小 */
  valueAxisNameFontSize?: number;
  /** 值轴name字体颜色 */
  valueAxisNameColor?: string;
  /** 类目轴name字体大小 */
  categoryAxisNameFontSize?: number;
  /** 类目轴name字体颜色 */
  categoryAxisNameColor?: string;
  /** 值轴label字体大小 */
  valueAxisFontSize?: number;
  /** 值轴字体颜色 */
  valueAxisFontColor?: string;
  /** 是否显示y轴值轴的主轴线 */
  showValueAxisLine?: boolean;
  /** 值轴主轴线的宽度 */
  valueAxisLineWidth?: number;
  /** 值轴主轴线的颜色 */
  valueAxisLineColor?: string;
  /** 类目轴轴label字体大小 */
  categoryAxisFontSize?: number;
  /** tooltip内容部分字体大小（不包括类目标题） */
  tooltipFontSize?: number;
  /** tooltip内容部分字体自定义大小（不包括类目标题） */
  tooltipAssignFontSize?: number[];
  /** tooltip类目标题字体大小 */
  tooltipTitleFontSize?: number;
  /** 类目轴字体颜色 */
  categoryAxisFontColor?: string;
  /** 是否显示bar柱状图的bar柱重影 */
  showDoubleShadow?: boolean;
  /** 柱状图柱的宽度 */
  barWidth?: number;
  /** 柱状图柱的最小宽度(默认为0) */
  barMinHeight?: number;
  /** 是否自定义设置的bar柱颜色渐变(如果选择自定义为true，则subColor每两个颜色为一系列bar柱一组渐变) */
  assignBarColor?: boolean;
  /** 是否启用堆叠图表(bar/line都可以数据堆叠) */
  stack?: boolean;
  /** 多组柱状图的bar之间的距离(百分比)，实际展示距离为`barGap`*`barWidth`，支持负值 */
  barGap?: string;
  /** 值轴分割线颜色 */
  splitValueLineColor?: string;
  /** 类目轴分割线颜色 */
  splitCategoryLineColor?: string;
  /** 值轴分割线条数 */
  valueAxisSplitNumber?: number;
  /** 是否显示值轴split分割区域 */
  showValueSplitArea?: boolean;
  /** 值轴split分割区域颜色数组（可以多个颜色） */
  splitValueAreaColorArr?: string[];
  /** 是否显示类目轴split分割区域 */
  showCategorySplitArea?: boolean;
  /** 类目split分割区域颜色数组 */
  splitCategoryAreaColorArr?: string[];
  /** 类目轴轴线颜色 */
  categoryAxisLineColor?: string;
  /** 是否初始化显示图表tooltip（默认显示dataIndex为0的数据） */
  initShowTooltip?: boolean;
  /** 初始化显示第几个tooltip(可以是number(索引从0开始)，也可以是类目轴的轴坐标字符串值)，该属性需要在initShowTooltip为true时有效 */
  showTooltipIndex?: number | string;
  /** 是否循环展示tooltip（默认的循环显示时间间隔loopShowTooltipTime是1秒） */
  loopShowTooltip?: boolean;
  /** 循环显示tooltip时间间隔(毫秒) */
  loopShowTooltipTime?: number;
  /** 部分tooltip的系列名不使用seriesName，而是使用每一系列数据中自身特有的categoryName代替 */
  tooltipSeriesSelfCategoryNameObj?: { [key: string]: boolean };
  /** 是否在bar柱顶/line拐点（高亮）显示其value值 */
  showSeriesValueLabel?: boolean;
  /** 每一系列数据seriesValue的值后拼接的单位 */
  seriesValueLabelSuffix?: string;
  /** 每一系列数据seriesValue的值前拼接的单位 */
  seriesValueLabelPrefix?: string;
  /** 显示每一系列label的辅助数据 */
  showSeriesValueLabelAssistData?: boolean;
  /** 每一系列数据seriesValue的辅助显示label数据前缀文本 */
  seriesValueLabelAssistPrefixArr?: string[];
  /** 每一系列数据seriesValue的辅助显示label数据前缀文本 */
  seriesValueLabelAssistSuffixArr?: string[];
  /** 每一系列数据seriesValue的辅助显示label数据分隔符 */
  seriesValueLabelAssistDivider?: string;
  /** bar柱顶/line拐点（高亮）其value值倾斜角度 */
  seriesValueLabelRotate?: number;
  /** label字体大小 */
  labelFontSize?: number;
  /** legend 图例关闭时icon的颜色 */
  inactiveColor?: string;
  /** legend图例距离容器左侧的距离 */
  legendLeft?: number | string;
  /** legend图例距离容器右侧的距离 */
  legendRight?: number | string;
  /** legend图例距离容器底部的距离 */
  legendBottom?: number | string;
  /**
   * legend图例距离容器顶部的距离
   * 注意：windows系统由于渲染环境与mac不同，它在legend的顶部距离即使设置为0的情况下仍然有出入
   * 这里对legendTop进行2px像素的稳定保留
   **/
  legendTop?: number | string;
  /** grid底部距离legend顶部之间的距离间隔 */
  gridBottomDisLegendBottom?: number;
  /** 是否显示每一个bar柱上的顶部小方块气泡 */
  showBarTopRect?: boolean;
  /** bar柱或者折线颜色是否渐变 */
  showColorLinear?: boolean;
  /** bar柱活折线渐变的指定渐变数组(如[0.55, 0.2]) */
  setAlphaNumberArr?: number[];
  /** bar圆角 */
  barBorderRadius?: number | number[];
  /** 堆叠bar首尾圆角 */
  stackBarBorderRadius?: number;
  /** 系列图表类型(bar/line/pictorialBar等，对于pictorialBar类型进度条也支持单/多组数据) */
  seriesType?: SeriesType;
  /** 是否显示tooltip */
  showTooltip?: boolean;
  /** 是否一直显示tooltip（默认false） */
  alwaysShowTooltip?: boolean;
  /** 提示框指示器的触发类型 */
  tooltipAxisPointerType?: TooltipAxisPointerType;
  /**
   * 折线图是否平滑显示曲线,
   * 如果是 boolean 类型，则表示是否开启平滑处理。
   * 如果是 number 类型（取值范围 0 到 1），表示平滑程度，越小表示越接近折线段，
   * 反之则反。设为 true 时相当于设为 0.5
   */
  lineSmooth?: boolean | number;
  /** 折线的线宽 */
  lineWidth?: number;
  /** 折线图折线拐点处的icon形状symbol类型（包含拐点hover高亮时的状态）->与legendIcon一样 */
  symbolType?: IconType;
  /** 折线拐点阴影shadow高亮symbol border宽度 */
  symbolBorderWidth?: number;
  /** 是否显示拐点 */
  showSymbol?: boolean;
  /** 折线拐点symbol大小(可以传回调函数针对性的处理个别特殊的拐点大小) */
  symbolSize?: number | number[] | any;
  /** symbol对于数据是否重复显示数据量还是依据大小显示数据量(false/null/undefined：不重复，即每个数据值用一个图形元素表示) */
  symbolRepeat?: boolean | number | string;
  /**
   * 折线图是否为阶梯线图,
   * 可以设置为 true 显示成阶梯线图，
   * 也支持设置成 "start", "middle", "end" 分别配置在当前点，当前点与下个点的中间点，下个点拐弯
   */
  lineStep?: boolean | PositionType;
  /** symbol的margin距离 */
  symbolMargin?: number;
  /** symbol的旋转角度 */
  symbolRotate?: number;
  /**
   * 是否显示折线区域阴影(当多条折线时需要部分折线有阴影区域而部分没有使用布尔值类型的数组)
   * 当showLineArea为布尔数组时长度小于legend.length时会自动以false补全
   * 混合系列中showLineArea布尔数组只针对折线系列数据，其长度对应的也是折线line，不用理会bar柱
   **/
  showLineArea?: boolean | boolean[];
  /** 水平轴字体是否旋转 */
  axisLabelRotate?: boolean;
  /** 类目轴字体旋转角度 */
  axisLabelRotateAngle?: number;
  /** 是否启用双Y(值轴)坐标轴 */
  doubleValueAxis?: boolean;
  /** 是否每一个bar柱单独一个颜色（只适合单组数据） */
  singleBarColor?: boolean;
  /** 非pictorialBar的普通bar柱进度条(可适用于单/多组数据) */
  normalBarProgress?: boolean;
  /** pictorialBar的普通bar柱进度条(可适用于单/多组数据) */
  pictorialBarProgress?: boolean;
  /** 渐变的pictorialBar，但渐变本质上还是bar柱不属于pictorialBar的series数据系列 */
  linearPictorialBar?: boolean;
  /** 渐变的pictorialBar宽度 */
  linearPictorialBarWidth?: number;
  /** 渐变的pictorialBar分割线宽度 */
  linearPictorialBarDivider?: number;
  /** 渐变的pictorialBar分割线颜色 */
  linearPictorialBarDividerColor?: string;
  /** 进度条背景色(包含pictorialBar与普通进度条) */
  progressBarBgc?: string;
  /** 百分比进度条的百分比针对全局还是自身(包含pictorialBar与普通进度条) */
  selfPer?: boolean;
  /** 是否显示bar柱背景柱（其背景色控制与progressBarBgc公用该字段） */
  showBarBgc?: boolean;
  /** bar柱label顶部字体颜色 */
  labelValueColor?: string;
  /** bar柱label顶部字体是否偏移（主要用于水平方向label在bar柱上下偏移情况的处理） */
  labelValueOffset?: boolean | number[];
  /** 是否显示值轴分割线 */
  showValueSplitLine?: boolean;
  /** 是否显示类目轴轴分割线 */
  showCategorySplitLine?: boolean;
  /** tooltip提示框轴线阴影颜色 */
  axisPointerShadowColor?: string;
  /** tooltip提示框轴线颜色 */
  axisPointerLineColor?: string;
  /** tooltip提示框轴线宽度 */
  axisPointerLineWidth?: number;
  /** tooltip提示框轴线类型 */
  axisPointerLineType?: LineStyleType;
  /** tooltip背景色 */
  tooltipBgc?: string;
  /** tooltip提示框类目名称颜色 */
  tooltipCategoryColor?: string;
  /** tooltip提示框内容颜色 */
  tooltipContentColor?: string;
  /** tooltip提示框seriesName字体颜色 */
  tooltipSeriesNameColor?: string;
  /** tooltip的内边距 */
  tooltipPadding?: number | number[];
  /** tooltip边线颜色 */
  tooltipBorderColor?: string;
  /** tooltip边线圆角 */
  tooltipBorderRadius?: number;
  /** tooltip的边距 */
  tooltipBorderWidth?: number;
  /** tooltip提示框seriesName字体大小 */
  tooltipSeriesNameFontSize?: number;
  /** tooltip提示框value字体颜色 */
  tooltipValueColor?: string;
  /** tooltip提示框seriesName字体大小 */
  tooltipValueFontSize?: number;
  /** tooltip提示框内容自定义颜色 */
  tooltipContentAssignColor?: string[];
  /** 增加tooltip字体颜色的饱和度 */
  tooltipColorSaturate?: number;
  /** 显示值轴 */
  showValueAxis?: boolean;
  /** 显示类目轴 */
  showCategoryAxis?: boolean;
  /** 对于显示类目轴数据过长是否省略号处理的标准，多长开始省略号处理(优先级高于换行处理) */
  categoryAxisEllipsisCount?: number;
  /** 对于显示类目轴数据过长是否换行处理的标准，多长开始换行处理 */
  categoryAxisReturnLineCount?: number;
  /**
   * 对于显示类目轴数据过长是否换行处理的标准，每行多少字符
   * 优先级比categoryAxisReturnLineCount还低
   **/
  categoryAxisReturnLineRowCount?: number;
  /** 类目轴两边是否留白(false不留白，即两边延伸至顶部) */
  categoryBoundaryGap?: boolean;
  /** 显示类目轴刻度 */
  showCategoryAxisTick?: boolean;
  /** 显示值轴刻度 */
  showValueAxisTick?: boolean;
  /** 轴刻度长度 */
  axisTickLength?: number;
  /** 轴刻度颜色 */
  axisTickColor?: string;
  /** 显示类目轴主轴线 */
  showCategoryAxisLine?: boolean;
  /** 多条折线时折线类型数组 */
  seriesLineTypeArr?: LineStyleType[];
  /** bar柱顶部小方块的高度 */
  rectBarHeight?: number;
  /** series系列value值label的距离 */
  valueLabelDistance?: number;
  /** 自定义分配系列数据的堆叠情况，把需要数据堆叠的系列数据设置为相同的stack名称 */
  assignStack?: string[];
  /** 是否启用折线/bar柱空数据不连接处理(空数据null在组件外部处理成0或者直接缺少即可) */
  connectNullsHandle?: boolean;
  /** 值轴分割线宽度 */
  splitValueLineWidth?: number;
  /** 值轴分割线类型 */
  splitValueLineType?: LineStyleType;
  /** 类目轴分割线宽度 */
  splitCategoryLineWidth?: number;
  /** 类目轴分割线类型 */
  splitCategoryLineType?: LineStyleType;
  /** 类目轴主线宽度 */
  categoryAxisLineWidth?: number;
  /** 是否显示标注区域markArea */
  showMarkArea?: boolean;
  /** 标注区域label相关配置 */
  markAreaLabelFontSize?: number;
  /** 标注区域label相关配置 */
  markAreaLabelColor?: string;
  /** 标注区域label相关配置 */
  marAreaLabelFontWeight?: number | string;
  /** 标注区域label相关配置 */
  marAreaLabelOffset?: number;
  /** 高亮标注区域markArea的轴区域数组，如要显示的轴区域[["1月", "3月"], ["5月", "7月"], ["8月", "9月"]] */
  markAreaEmphasisAxisArr?: string[][];
  /** 非高亮标注区域markArea的轴区域数组，如要显示的轴区域[["1月", "3月"], ["5月", "7月"], ["8月", "9月"]] */
  markAreaAxisArr?: string[][];
  /** 标注区域markArea的自定义颜色 */
  markAreaAssignColor?: string[] | string;
  /** 高亮标注文本markArea数组 */
  markAreaEmphasisTextArr?: string[];
  /** 非高亮标注文本markArea数组 */
  markAreaTextArr?: string[];
  /** 高亮标注区域markArea颜色 */
  markAreaEmphasisItemColor?: string;
  /** 非高亮标注区域markArea颜色 */
  markAreaItemColor?: string;
  /** 显示标注线markLine */
  showMarkLine?: boolean;
  /** markLine标注线的轴值点数组(也可针对类目轴的标记) */
  markLineAxisArr?: string[] | number[];
  /** markLine标线的label文本数组 */
  markLineLabelTextArr?: string[];
  /** 是否连接类目数据 */
  markLineLabelLink?: boolean;
  /** markLine标线的基本配置 */
  markLineColor?: string;
  /** markLine标线的基本配置 */
  markLineWidth?: number;
  /** markLine标线的基本配置 */
  markLineType?: LineStyleType;
  /** markLine标线的基本配置 */
  markLineLabelFontSize?: number;
  /** 是否显示markLine的Label对于值轴的文本标示，如平均值： */
  showMarkLineLabelText?: boolean;
  /** markLine标线的基本配置 */
  markLineLabelColor?: string;
  /** markLine标注线label文本的位置start/end/middle */
  markLineLabelPosition?: MarkLinePositionType;
  /** 简单的markLine标记线(针对值轴的标记)（max/min/average/median(中位数线)） */
  markLineDataTypeArr?: MarkLineDataTypeArr;
  /** 针对markLine/markPoint特定数据类型的文本label */
  markDataTypeAverageText?: string;
  /** 针对markLine/markPoint特定数据类型的文本label */
  markDataTypeMaxText?: string;
  /** 针对markLine/markPoint特定数据类型的文本label */
  markDataTypeMinText?: string;
  /** 针对markLine/markPoint特定数据类型的文本label */
  markDataTypeMedianText?: string;
  /** 是否隐藏markLine首尾symbol */
  showMarkLineSymbol?: boolean;
  /** 如果自定义尾部symbol，设置其尺寸 */
  markLineEndSymbol?: number[];
  /** 起始位置symbol尺寸，不支持数组，即使写了数组也是取数组第一个元素 */
  markLineStartSymbol?: number;
  /** markLine起始位置/尾部symbol类型（circle/rect等，与折线symbol/legend的symbol一样） */
  markLineSymbolType?: string[];
  /** markPoint标注标记点 */
  showMarkPoint?: boolean;
  /** markPoint的标记symbol(支持回调(value: Array | number, params: Object) => string) */
  markPointSymbol?: string;
  /** markPoint的标记symbolSize */
  markPointSymbolSize?: number;
  /** markPoint的基本配置 */
  markPointFontSize?: number;
  /** markPoint的基本配置 */
  markPointFontColor?: string;
  /** markPoint的基本配置 */
  markPointColor?: string;
  /** markPoint数据标记点类型名（max/min/average）注意：没有中位数 */
  markPointDataType?: MarkPointDataTypeArr;
  /** 是否显示markPoint的Label对于值轴的文本标示，如平均值： */
  showMarkPointLabelText?: boolean;
  /** 值轴极值的设置 */
  valueMax?: number;
  /** 值轴极值的设置 */
  valueMin?: number;
  /** 双值轴时最大值数据数组(如[100, 200]，索引0的100表示主值轴的最大值，索引1的200表示副值轴的最大值) */
  doubleValueAxisMaxArr?: (number | undefined)[];
  /** 是否有tooltip辅助数据要显示 */
  showAssistData?: boolean;
  /** 是否需要处理值轴的数据范围（避免多条数据折线图过于拥挤） */
  handleValueAxisRange?: boolean;
  /** 辅助数据名称字符串数组 */
  assistDataNameArr?: string[];
  /** 辅助数据的单位如%等 */
  assistDataUnit?: string;
  /** 辅助数据是否有涨跌处理（布尔值true默认文字涨跌），处理成文字涨跌还是正负号涨跌（"text"，"plusMinus"） */
  assistDataUpDown?: boolean | string;
  /** 辅助数据前缀 */
  assistDataPrefixArr?: string[];
  /** 辅助数据后缀 */
  assistDataSuffixArr?: string[];
  /** 类目轴间隔设置 */
  categoryIntervalNumber?: number;
  /** 辅助数据自定义颜色 */
  assistDataAssignColor?: string[];
  /** 辅助数据自定义字体大小 */
  assistDataAssignFontSize?: number[];
  /** 是否为双向对比bar柱 */
  doubleWayBar?: boolean;
  /** 是否需要双边对比bar柱子正负数值处理(positiveNegativeHandle) */
  doubleWayBarPNHandle?: boolean;
  /** 双边bar柱是否需要调整类目轴在中间 */
  doubleWayBarCategoryCenter?: boolean;
  /** 是否启用双边bar柱百分比对比(为了计算极致在百分比的情况下值轴的分布比例更加精确) */
  doubleWayBarPercent?: boolean;
  /** 双边bar柱label偏移的纵向距离 */
  doubleWayBarLabelOffsetY?: number;
  /** 是否禁用fitFlex自适应 */
  disabledFitFlex?: boolean;
  /** 是否需要值/类目轴类似百分比%的后缀处理(后缀就用chartData的suffix单位) */
  valueAxisSuffixHandle?: boolean;
  /** 值轴数据自定义格式化处理(一般不到万不得已不使用) */
  valueAxisLabelFormatter?: (value: number, index: number) => number | string;
  /** 是否需要值/类目轴类似百分比%的后缀处理(后缀就用chartData的suffix单位) */
  categoryAxisSuffixHandle?: boolean;
  /** 类目轴主轴线上的label左对齐 */
  categoryHorizontalLabelLeft?: boolean;
  /** 类目轴数据自定义格式化处理(一般不到万不得已不使用) */
  categoryAxisLabelFormatter?: (value: any, index: number) => number | string;
  /**
   * grid顶部距离调整
   * 注意：它是调整，相当于偏移量，并不是替代组件内部计算的gridTop
   * 由于它只是偏移量作为弥补计算上的不足，通常不会过大，一般以较小的数量像素px级别作为偏移考量
   * 所以这里只设定number类型即可满足
   **/
  gridTopOffset?: number;
  /** grid顶部距离调整(注意：它也是调整，相当于偏移量) */
  gridBottomOffset?: number;
  /** grid顶部距离调整(注意：它也是调整，相当于偏移量) */
  gridLeftOffset?: number;
  /** grid顶部距离调整(注意：它也是调整，相当于偏移量) */
  gridRightOffset?: number;
  /**
   * 垂直时gridRight（百分比或数值）
   * 本质上该属性并不是为了解决水平类目轴最右侧数据部分遮挡问题，这个问题有别的解决方式
   * 如类目轴最右侧数据偏移，或者省略号处理
   * 由于这里气泡散点图两个轴都是值轴，这里垂直gridRight处理气泡散点图的水平值轴最右侧数据偏移再适合不过了
   * 并且特殊的由于气泡散点图两个轴都是值轴，所以它统一可以处理水平方向时的最右侧数据偏移这个问题
   **/
  gridRightVertical?: string | number;
  /** 针对上述问题的另一个解决方案 */
  categoryLastLabelDistance?: number;
  /** 类目轴线与轴label偏移（label贴边不动） */
  categoryAxisLineOffset?: number;
  /** 类目轴线与轴label偏移（label贴边不动）(额外的距离控制，不包含在自动计算的处理范围之内) */
  categoryAxisLineOffsetExtra?: number;
  /** 值轴线与轴label偏移（label贴边不动） */
  valueAxisLineOffset?: number;
  /** 采用bar/line混合图表，series 系列数据指定的混合系列数组:例：["bar", "line", "bar", "line"] */
  blendBarLineSeriesArr?: ("bar" | "line")[];
  /**
   * 指定每一系列数据对应的值轴，
   * 例：[0, 1, 1, 0, 1], 0代表主值轴，1代表副值轴，垂直时左边即为主值轴，水平时上边即为主值轴
   */
  assignAxisIndexArr?: (0 | 1)[];
  /** 是否启用dataZoom */
  dataZoomAble?: boolean;
  /** dataZoom背景色 */
  dataZoomBgc?: string;
  /** 非内置型dataZoom的高度 */
  dataZoomHeight?: number;
  /** dataZoom的数据窗口（选择区域）是否禁用缩放,设置为 true 则锁定选择区域的大小，也就是说，只能平移，不能缩放 */
  dataZoomLock?: boolean;
  /** dataZoom的数据窗口范围 */
  dataZoomRange?: number[];
  /** dataZoom的数据窗口两边拖动手柄的Icon */
  dataZoomHandleIcon?: string;
  /** dataZoom的数据窗口两边拖动手柄的尺寸 */
  dataZoomHandleSize?: string | number;
  /** dataZoom的数据窗口两边拖动手柄的颜色 */
  dataZoomHandleColor?: string;
  /** dataZoom的数据窗口两边拖动手柄border类型 */
  dataZoomHandleBorderType?: string;
  /** dataZoom的数据窗口两边拖动手柄border宽度 */
  dataZoomHandleBorderWidth?: number;
  /** dataZoom的数据窗口两边拖动手柄的border颜色 */
  dataZoomHandleBorderColor?: string;
  /** dataZoom手柄两边的文字颜色 */
  dataZoomHandleTextColor?: string;
  /** dataZoom手柄两边的文字大小 */
  dataZoomHandleTextSize?: number;
  /** dataZoom边框线 */
  dataZoomBorderColor?: string;
  /** chart图表是否下载保存为图片 */
  chartSaveAsImageHandle?(imgSourceDownLoad: ImgSourceDownLoad): void;
  /** 下载保存的清晰度分辨率(它其实本质上是原本canvas图像分辨率的倍数) */
  chartSavePixelRatio?: number;
  /** 下载图片的背景色 */
  chartSaveAsImageBgc?: string;
  /** 下载的图片的类型（png/jpeg） */
  chartSaveAsImageType?: PictureType;
  /** 图片下载名 */
  chartSaveAsImageName?: string;
  /** 大量数据优化 */
  largeData?: boolean;
  /** 大量数据优化阈值 */
  largeDataThreshold?: number;
  /** 是否显示grid背景颜色 */
  showGridBg?: boolean;
  /** grid背景颜色(string[]数组为渐变情况下使用) */
  gridBgColor?: string | string[];
  /** 类目轴偏移,主要用于水平方向时类目轴偏移到bar柱上方（布尔值使用默认偏移） */
  categoryOffset?: number[] | boolean;
  /**
   * 禁用自动计算barWidth与barGap功能
   * true禁用/false不禁用，正常而言只要布局没毛病不需要禁用，但由于内部计算在有些地方进行了估算弥补
   * 导致会有些许的误差偏离，所以极端情况下可能需要禁用此功能自行设置
   * 为了加速渲染，结合一般情况来看，数据的变化不会过于夸张，不出意外的情况下不需要开启自动计算
   * 所以默认禁用true
   */
  disabledCalcBarWidth?: boolean;
  /**
   * 禁用自动计算barGap功能
   * true禁用/false不禁用，正常而言只要布局没毛病不需要禁用，但由于内部计算在有些地方进行了估算弥补
   * 导致会有些许的误差偏离，所以极端情况下可能需要禁用此功能自行设置
   * 为了加速渲染，结合一般情况来看，数据的变化不会过于夸张，不出意外的情况下不需要开启自动计算
   * 所以默认禁用true
   */
  disabledCalcBarGap?: boolean;
  /** bar柱与line折线symbol点或者pictorialBar的symbol绑定事件 */
  onHandle?(params: any, eventType: AxisChartEventType): void;
  /** onHandle绑定事件的类型（click/dblclick/mousedown/mousemove/mouseup/mouseover/mouseout） */
  onHandleEventType?: AxisChartEventType[] | AxisChartEventType;
  /** tooltip的显示值是否用千分位逗号分割 */
  tooltipValueCommaSplit?: boolean;
  /** 进度条百分比小数保留几位(默认2位) */
  percentRemainCount?: number;
  /**
   * 当数据没有导致系列中某一个数据为undefined而此时又不想使用空数据不连接的处理时进行undefined的替换处理
   * 或者由数据为null导致的NaN显示也进行相应的替换处理
   **/
  assignUndefinedNullValue?: string;
  /** 气泡散点图的气泡点大小映射比例(默认值为1，即数据本身渲染映射) */
  symbolSizeRate?: number;
  /** 气泡散点图y轴（垂直时即垂直的y轴，水平时即水平的y轴）居中处理，一般当水平x轴数据有正负值时使用 */
  scatterYValueAxisCenter?: boolean;
  /** 气泡散点图y轴（垂直时即垂直的y轴，水平时即水平的y轴）居中时label标签的偏移处理，默认右偏移8px */
  scatterYValueAxisCenterOffset?: number;
  /** 隐藏类目轴0值 */
  hideCategoryZeroValue?: boolean;
  /** 隐藏值轴0值(对数轴的情况下就是隐藏1值) */
  hideValueZeroValue?: boolean;
  /** 气泡散点图是否多色渲染 */
  scatterColorsSymbol?: boolean;
  /** 气泡散点图是否多色渲染的阶段范围数组[[1, 2], [3, 4], [5, 6]] */
  scatterColorsRenderArr?: number[][];
  /** 气泡散点图是否多色渲染的阶段范围数组中的元素数组是左右的开闭性，默认是左闭右开 */
  scatterColorsItemOpenClose?: OpenCloseArea;
  /** 气泡散点图气泡点透明度 */
  scatterSymbolColorOpacity?: number;
  /** 气泡散点图的tooltip中是否显示多色渲染的依据数据(默认不显示) */
  showTooltipColorsRenderByData?: boolean;
  /** 气泡散点图气泡点自定义高亮色 */
  scatterSymbolEmphasisColor?: string;
  /**
   * 由于精确计算很难做到极其精确，所以必要时通过自定义计算比例进行调整，默认[0.25, 0.3, 0.3]
   * 对应的所以顺序分别是针对数字1或英文竖线|，空格 ，和英文点.
   **/
  exactlyCalcArr?: number[];
  /** 类目轴样式(除常见样式之外的样式，符合echarts官方文档api) */
  categoryAxisLabelStyleObj?: object;
  /** 值轴为对数轴显示模式(对数模式目前并不稳定，待磨练，后续使用如出现问题立即联系原开发者liushanbao) */
  valueAxisLogMode?: boolean;
  /** 值轴为对数轴显示模式时的对数底数（默认为10） */
  valueAxisLogBase?: number;
  /**
   * 为解决即使对数显示的情况下也无法解决数据差距过大而改变数据本身进行相应的加减乘除某数值操作，改变数据渲染的情况
   * 然后在tooltip显示中再回溯原始数据正确显示，实属无奈之举，哪有既要看到沙子又要看到地球的反人类需求
   **/
  changeRenderDataRadio?: number;
  /** 对changeRenderDataRadio这个数据如何操作(加减乘除->（+，-，*，/）)，默认加法操作 */
  changeRenderDataRadioAction?: string;
  /**
   * 保留几位有效数字小数，本身是不建议这样做，一般在组件外层进行数据小数位数处理
   * 但是changeRenderDataRadio会导致js计算的数据有精确度的偏差
   * 所以这里通过再次保留位数进行偏差弥补
   */
  radioRemainCount?: number;
  /** 解决tooltip高亮时闪现的bug的内部state数据（有些版本的Echarts会有这些问题，当有tooltip触发显示闪现bug时可以开启此属性解决） */
  resolveTooltipFlashShow?: boolean;
}

/**
 * 图表loading对象配置
 * created by liushanbao
 * @author liushanbao
 */
export interface LoadingOption {
  /** loading显示的文本 */
  text?: string;
  /** loading显示的文本颜色 */
  textColor?: string;
  /** loading文本的字体大小 */
  fontSize?: number | string;
  /** loading文本的字体 */
  fontWeight?: number | string;
  /** loading文本的字体 */
  fontStyle?: string;
  /** loading文本的字体 */
  fontFamily?: string;
  /** loading的圈圈颜色 */
  color?: string;
  /** loading蒙层背景色 */
  maskColor?: string;
  /** loading的层级 */
  zlevel?: number;
  /** 是否显示loading圈圈的旋转动画 */
  showSpinner?: boolean;
  /** loading圈圈旋转动画的圆角 */
  spinnerRadius?: number;
  /** loading圈圈的宽度 */
  lineWidth?: number;
}

/**
 * created by liushanbao
 * @author liushanbao
 */
export interface AxisChartState extends ChartColorPalette {
  /** 最外层容器dom的id */
  containerId: string;
  /** 是否已经执行过外层容器尺寸监听事件 */
  resizeObserved: boolean;
  /** legend整体宽度 */
  legendWidth: number;
  /** x表示水平轴(这里水平轴为图表垂直时的类目轴或者图表水平时的值轴)label是否倾斜 */
  xLabelRotate: boolean;
  /** 水平时x Label是否倾斜 */
  horizontalXLabelRotate: boolean;
  /** 水平时gridRight */
  horizontalGridRight: string;
  /** 是否显示legend */
  showLegend: boolean;
  /** 与props basicConfigOption合并 */
  stateBasicConfigOption: (typeof darkDefaultBasicConfigOption) & BasicConfigOption;
  /** 类目轴range数组 */
  categoryRange: string[];
  /** 图例range数组 */
  legendRange: string[];
  /** 数据arr，主要是为双y坐标轴做准备 */
  sDataArr: (number | undefined)[][];
  /** 辅助数据的个数 */
  assistDataCount: number;
  /** 辅助数据数组 */
  assistDataArr: (number | undefined)[][];
  /** 数据最大值 */
  max: number;
  /** 类目轴线偏移距离(为了支持属性百分比需计算处理后转化为number) */
  categoryAxisLineOffset: number;
  /** 值轴线偏移距离(为了支持属性百分比需计算处理后转化为number) */
  valueAxisLineOffset: number;
  /** 值轴数据最大值 */
  maxValueLength: number;
  /** gridTop值 */
  gridTop: number;
  /** 类目轴数据字符串最大数值 */
  categoryRangeMaxLength: number;
  /** 渐变色xy的点 */
  xyLinerPoint: {
    /** x1点 */
    x: number;
    /** y1点 */
    y: number;
    /** x2点 */
    x2: number;
    /** y2点 */
    y2: number;
  };
  /** 解决tooltip高亮时闪现的bug的内部state数据 */
  alwaysShowContent?: boolean;
  /** 是否是垂直的风格主题 */
  isVertical: boolean;
}

export * from "./color";
export * from "./icss";
export * from "./chart";
