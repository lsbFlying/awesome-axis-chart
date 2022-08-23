import React, {useState} from "react";
import { AxisChart } from "../../components/temp";
import { Wrap } from "./styled";
import {categoryDataTest, testData2, testData3} from "./testData";

const TempTest = () => {
  const [autoFit, setAutoFit] = useState(false);
  
  return (
    <Wrap>
      <div>
        <button onClick={() => setAutoFit(!autoFit)}>测试按钮</button>
      </div>
      <div className="testAxisChart">
        <AxisChart
          // vertical/horizontal/verticalInverse/horizontalInverse
          // theme="verticalInverse"
          // @ts-ignore
          data={testData3}
          // categoryData={categoryDataTest}
          pureData={false}
          autoFit={autoFit}
          option={{
            xAxis: {
              // axisLabel: {
              //   color: "red"
              // },
              // name: "单位：件数",
              // position: "top",
              // inverse: true,
            },
            yAxis: {
              name: "单位：件数",
              // axisLabel: {
              //   margin: 18,
              // },
              // position: "right",
              // inverse: true,
            },
            // tooltip: {
            //   trigger: "axis",
            //   axisPointer: {
            //     type: "shadow",
            //   },
            // },
            // grid: {
            //   bottom: 20,
            // },
            legend: {
              // itemWidth: 0,
              // itemGap: 0,
              // top: 0,
              // bottom: 0,
              // // left: 0,
              // right: 0,
              // width: 190,
              // padding: 8,
              // type: "scroll",
              // orient: "vertical",
              // show: false,
            },
          }}
          // legendPlacement="right"
        />
      </div>
    </Wrap>
  );
}

export default TempTest;
