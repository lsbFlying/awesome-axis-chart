import React, { useState } from "react";
import styled from "styled-components";
import { uniqueId } from "lodash";

interface WrapProps {
}
// font-size: ${p => p.style && p.style.fontSize ? p.style.fontSize : `18px`};
const SwitchBtnWrap = styled.div<WrapProps>`
  width: 100%;
  height: 100%;
  position: relative;
  font-family: PingFangSC;
  font-size: 12px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-align: center;
  color: #3eb5f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  .switchBtnItem {
    width: fit-content;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    padding: 0 9px;
    border: 1px solid transparent;
    border-radius: 11.5px;
    &:hover {
      color: #5cdeff;
      //background-image: linear-gradient(to right, rgba(92, 222, 255, 0) 0%, rgba(92, 222, 255, 0.25) 50%, rgba(92, 222, 255, 0) 100%);
      background-color: rgba(92, 222, 255, 0.15);
    }
    &:active, &:focus {
      color: #00aaff;
      background-image: linear-gradient(to right, rgba(92, 222, 255, 0) 0%, rgba(92, 222, 255, 0.5) 50%, rgba(92, 222, 255, 0) 100%);
    }
  }
  input[name="switchBtnNameSame"] {
    display: none;
    &:checked + label {
      color: #cceeff;
      font-weight: 500;
      border: 1px solid rgba(0, 170, 255, 0.25);
      border-radius: 11.5px;
      &:after {
        content: "";
        width: calc(100% - 24px);
        height: 1px;
        background-image: radial-gradient(circle at 50% 0, #adfcff, rgba(92, 222, 255, 0.76) 24%, rgba(92, 201, 255, 0) 100%);
        position: absolute;
        bottom: -1px;
        left: 50%;
        transform: translateX(-50%);
      }
    }
  }
`;
export interface Item {
  /** code码（value值） */
  value: number | string;
  /** text文本（label值） */
  label: string;
}
type SwitchBtnProps = {
  /** 数据列表 */
  dataList: Item[];
  /** 默认选中值 */
  defaultValue?: number | string;
  /** 点击事件 */
  handleChange(e: any, params: any): void;
};
/**
 * 切换按钮
 * created by liushanbao
 * @author liushanbao
 */
export function SwitchBtn(props: SwitchBtnProps) {
  const { dataList, defaultValue, handleChange } = props;
  const [checkedValue, setCheckedValue] = useState(defaultValue);
  const [statusId] = useState(`${uniqueId("SwitchBtn")}`);
  if (!dataList.length) return null;
  // 避免已选中的重复点击
  const handleChangeTemp = (e: any, params: any) => {
    setCheckedValue(params.value);
    if (checkedValue !== params.value) handleChange(e, params);
  };
  // useEffect(() => {
  // });
  return (
    <SwitchBtnWrap>
      {
        dataList.map((item, index) => {
          return (
            <React.Fragment key={index}>
              <input
                type="radio"
                name="switchBtnNameSame"
                id={`switchBtn${item.value}${statusId}`}
                defaultChecked={item.value === defaultValue}
              />
              <label
                htmlFor={`switchBtn${item.value}${statusId}`}
                className="switchBtnItem"
                onClick={(e: any) => { handleChangeTemp(e, item); }}
              >
                {item.label}
              </label>
            </React.Fragment>
          );
        })
      }
    </SwitchBtnWrap>
  );
}
