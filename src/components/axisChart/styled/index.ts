import styled from "styled-components";

/**
 * 单位字体样式属性
 * created by liushanbao
 * @author liushanbao
 */
interface NameProps {
  /** name字体样式属性 */
  nameProps: {
    /** 类目轴字体大小(包含px像素值的字符串) */
    categoryNameFontSize: string;
    /** 类目轴字体颜色 */
    categoryNameFontColor: string;
    /** 值轴字体大小 */
    valueNameFontSize: string;
    /** 值轴字体颜色 */
    valueNameFontColor: string;
  };
}

/**
 * 外层容器
 * created by liushanbao
 * @author liushanbao
 */
export const ReactChartWrap = styled.div<NameProps>`
  width: 100%;
  height: 100%;
  position: relative;
  user-select: none;
  .echartsForReactDiv {
    div {
      &:first-child {
        width: 100% !important;
        height: 100% !important;;
        canvas {
          width: 100% !important;;
          height: 100% !important;;
        }
      }
    }
  }
  .categoryAxisName {
    position: absolute;
    right: 0;
    bottom: 0;
    font-size: ${p => p.nameProps.categoryNameFontSize};
    color: ${p => p.nameProps.categoryNameFontColor};
    width: fit-content;
    line-height: 1;
  }
  .valueAxisName {
    position: absolute;
    left: 0;
    top: 0;
    font-size: ${p => p.nameProps.valueNameFontSize};
    color: ${p => p.nameProps.valueNameFontColor};
    width: fit-content;
    line-height: 1;
  }
  .valueAxisNameSub {
    position: absolute;
    right: 0;
    top: 0;
    font-size: ${p => p.nameProps.valueNameFontSize};
    color: ${p => p.nameProps.valueNameFontColor};
    width: fit-content;
    line-height: 1;
  }
  .gridDom {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    .gridDomInner {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      .gridDomInnerLeft {
        font-family: PingFangSC;
        font-size: 12px;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        letter-spacing: normal;
        color: #24a2e0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        .textItem {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
      .gridDomInnerRight {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
      }
    }
  }
`;
