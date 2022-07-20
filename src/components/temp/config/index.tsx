/**
 * @description 图表grid边界的内部偏移量
 * windows的某些数据情况下如果刚好临界边界线可能导致汉字的显示不完整
 * 这里偏移2个像素是为了安全显示图表内容考量
 */
export const gridOffset = 2;

// x、y轴、图例legend、bar柱/line线的symbol点上的label字体的默认字体大小
export const defaultFontSize = 10;

/**
 * tooltip相关数据之所以设置最小默认值12是因为大部分浏览器最小像素值的文本数据值就是12px
 * 尽管有些浏览器可以支持到最小字体像素值是10px，但是这里仍然以大部分浏览器为主
 */
export const tooltipFontSize = 12;
