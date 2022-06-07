import * as React from 'react';
import styled from "styled-components";

const Wrap = styled.div`
  width: fit-content;
  height: fit-content;
  margin-bottom: 12px;
  border-radius: 4px;
  background-image: radial-gradient(circle at 100% 50%,rgba(6,43,71,0.9),rgba(5,24,41,0.9) 66%);
  box-shadow: 0 2px 6px 0 rgb(0 0 0 / 25%);
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    margin-bottom: 8px;
    .title {
      width: fit-content;
      padding-left: 12px;
      font-size: 12px;
      line-height: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      letter-spacing: normal;
      color: rgb(255, 255, 255);
      position: relative;
      &:before {
        content: "";
        width: 2px;
        height: 12px;
        background-color: #61dafb;
        position: absolute;
        left: 0;
        top: 0;
      }
    }
    .rightComponent {
      margin-right: 12px;
      width: fit-content;
      height: fit-content;
    }
  }
  .content {
    padding: 16px;
  }
`;

type Props = {
  /** 标题 */
  title?: React.ReactNode;
  /** 右侧组件 */
  rightComponent?: React.Component | React.PureComponent | React.ReactNode | React.FC;
};
interface State {
  /** 数据??? */
}
/**
 * created by liushanbao
 * @author liushanbao
 * @class Card
 */
export default class Card extends React.PureComponent<Props, State> {
  static defaultProps = {};

  state: State = {};

  render() {
    const { title, children, rightComponent } = this.props;
    return (
      <Wrap>
        <div className="header">
          <div className="title">{title}</div>
          <div className="rightComponent">{rightComponent}</div>
        </div>
        <div className="content">
          {children}
        </div>
      </Wrap>
    );
  }
}
