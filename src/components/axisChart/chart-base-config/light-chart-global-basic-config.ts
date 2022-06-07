// 实际开发可以引入接口配置对应chartGlobalBasicConfig上，方便编译提示
import { BasicConfigOption } from "../index";
/**
 * axis-chart全局配置明亮系主题风格配置
 * created by liushanbao
 * @author liushanbao
 */
export const lightChartGlobalBasicConfig: BasicConfigOption = {
  /** legend 字体颜色 */
  legendColor: "rgba(15, 41, 61, 0.45)",
  /** 值轴name字体颜色 */
  valueAxisNameColor: "rgba(12, 38, 61, 0.45)",
  /** 类目轴name字体颜色 */
  categoryAxisNameColor: "rgba(12, 38, 61, 0.45)",
  /** 类目轴轴线颜色 */
  categoryAxisLineColor: "rgba(12, 38, 61, 0.45)",
  /** 值轴主轴线的颜色 */
  valueAxisLineColor: "rgba(12, 38, 61, 0.45)",
  /** 类目轴字体颜色 */
  categoryAxisFontColor: "rgba(12, 38, 61, 0.45)",
  /** 值轴字体颜色 */
  valueAxisFontColor: "rgba(12, 38, 61, 0.45)",
  /** tooltip边线颜色 */
  tooltipBorderColor: "#00cbff",
  /** tooltip背景色 */
  tooltipBgc: "#ffffff",
  /** tooltip提示框类目名称颜色 */
  tooltipCategoryColor: "#333e59",
  /** tooltip提示框轴线阴影颜色 */
  axisPointerShadowColor: "rgba(0,187,255,0.09)",
  /** tooltip提示框轴线颜色 */
  axisPointerLineColor: "rgba(12, 38, 61, 0.45)",
  /** 值轴分割线颜色 */
  splitValueLineColor: "#e5e9f2",
  /** 类目轴分割线颜色 */
  splitCategoryLineColor: "#e5e9f2",
};
