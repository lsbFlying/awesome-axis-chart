import {fontSizeMap} from "../static";

/**
 * @description 自适应，在没有scale缩放页面屏幕的情况下使用
 * @param px：当前像素尺寸值或者尺寸数组
 * @param defaultPx：默认设备的分辨率尺寸宽度（以宽度为基准）
 */
export const fit = <P extends unknown>(px: P, defaultPx: number = 1920): P => {
  if (!fit.autoFit) return px;
  // 默认UI设备宽度分辨率按照1920处理（真正开发时按需求设备尺寸更改）
  const clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  if (!clientWidth) return px;
  if (typeof px === "number") return ((clientWidth * px) / defaultPx) as P;
  return (px as P as number[]).map(item => (clientWidth * item) / defaultPx) as P;
}

/**
 * autoFit：是否禁用fitFlex的适配尺寸计算
 */
fit.autoFit = false;

/**
 * @description 精确计算字符串以设置字体大小的个数
 */
export const exactCalcStrFontCount = (s: string | number): number => {
  let count = 0;
  for (const i of `${s}`) {
    const curFontSizeRate = fontSizeMap.get(i);
    if (curFontSizeRate) {
      count += curFontSizeRate;
    } else {
      count++;
    }
  }
  return count;
}
