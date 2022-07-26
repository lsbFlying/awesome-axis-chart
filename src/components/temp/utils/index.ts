import {fontSizeMap} from "../static";

/**
 * @description 自适应，在没有scale缩放页面屏幕的情况下使用
 * @param px：当前像素尺寸值或者尺寸数组
 * @param defaultEqPx：默认设备的分辨率尺寸宽度（以宽度为基准）
 */
export const fitFlex = <P extends unknown>(px: P, defaultEqPx: number = 1920): P => {
  if (!fitFlex.autoFitFlex) return px;
  // 默认UI设备宽度分辨率按照1920处理（真正开发时按需求设备尺寸更改）
  const clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  if (!clientWidth) return px;
  if (typeof px === "number") return ((clientWidth * px) / defaultEqPx) as P;
  return (px as P as number[]).map(item => (clientWidth * item) / defaultEqPx) as P;
}

/**
 * autoFitFlex：是否禁用fitFlex的适配尺寸计算
 */
fitFlex.autoFitFlex = false;

/**
 * @description 精确计算字符串以设置字体大小的个数
 */
export const exactCalcStrFontCount = (s: string): number => {
  if (typeof s !== "string") throw new Error(`param "s" is not string type!`);
  let count = 0;
  for (const i of s) {
    const curFontSizeRate = fontSizeMap.get(i);
    if (curFontSizeRate) {
      count += curFontSizeRate;
    } else {
      count++;
    }
  }
  return count;
}
