import React from "react";
import { AxisChart } from "../../components/temp";
import { Wrap } from "./styled";
import {testData1} from "./testData";
import {AxisChartDataType} from "../../components/temp/model";

const TempTest = () => {
  const dataTemp: AxisChartDataType[] = testData1.map(item =>
    [item.type, item.clothing, item.sales]
  );
  return (
    <Wrap>
      <div className="testAxisChart">
        <AxisChart
          theme="vertical"
          // theme="horizontal"
          data={dataTemp}
          option={{
            // xAxis: {
            //   // axisLabel: {
            //   //   color: "red"
            //   // },
            //   // name: "单位：件数",
            //   position: "top",
            // },
            yAxis: {
              name: "单位：件数",
              axisLabel: {
                margin: 18,
              },
              // position: "right",
              // inverse: true,
            },
            // tooltip: {
            //   trigger: "axis",
            //   axisPointer: {
            //     type: "shadow",
            //   },
            // },
          }}
        />
      </div>
    </Wrap>
  );
}

export default TempTest;
