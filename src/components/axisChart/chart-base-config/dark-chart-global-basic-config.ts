// 实际开发可以引入接口配置对应chartGlobalBasicConfig上，方便编译提示
import { BasicConfigOption } from "../index";
/**
 * axis-chart全局配置暗黑系主题风格配置
 * created by liushanbao
 * @author liushanbao
 */
export const darkChartGlobalBasicConfig: BasicConfigOption = {
  /** legend 字体颜色 */
  legendColor: "#83deff",
  /** 值轴name字体颜色 */
  valueAxisNameColor: "#45c1ee",
  /** 类目轴name字体颜色 */
  categoryAxisNameColor: "#45c1ee",
  /** 类目轴轴线颜色 */
  categoryAxisLineColor: "rgba(0, 187, 255, 0.45)",
  /** 值轴主轴线的颜色 */
  valueAxisLineColor: "rgba(0, 187, 255, 0.45)",
  /** 类目轴字体颜色 */
  categoryAxisFontColor: "#45c1ee",
  /** 值轴字体颜色 */
  valueAxisFontColor: "#45c1ee",
  /** tooltip边线颜色 */
  tooltipBorderColor: "#00cbff",
  /** tooltip背景色 */
  tooltipBgc: "rgba(0, 0, 0, 0.62)",
  /** tooltip提示框类目名称颜色 */
  tooltipCategoryColor: "#00cbff",
  /** tooltip提示框轴线阴影颜色 */
  axisPointerShadowColor: "rgba(0,187,255,0.09)",
  /** tooltip提示框轴线颜色 */
  axisPointerLineColor: "rgba(0,187,255,0.65)",
  /** 值轴分割线颜色 */
  splitValueLineColor: "rgba(0, 187, 255, 0.25)",
  /** 类目轴分割线颜色 */
  splitCategoryLineColor: "rgba(0, 187, 255, 0.25)",
};
