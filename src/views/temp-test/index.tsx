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
          // vertical/horizontal/verticalInverse/horizontalInverse
          // theme="verticalInverse"
          data={dataTemp}
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
