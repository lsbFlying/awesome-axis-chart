import * as React from 'react';
import { Wrap, SaveAsImage } from './styled';
import { cloneDeep } from 'lodash';
import Card from './card';
import { SwitchBtn, Item } from './switch-btn';
import { testData, monthAverageRainfallList, doubleWayList, percentList } from './static';
import {
  chartData, AxisChart, BasicConfigOption, AxisChartEventType, ImgSourceDownLoad,
} from '../../components';

type Props = {
  /** 数据??? */
};
interface State {
  /** tooltip切换数据 */
  tooltipCategoryIndex: string | number;
  /** 切换按钮数据 */
  dataList: Item[];
}
/**
 * 类测试组件模板 TestClass
 * created by liushanbao
 * @author liushanbao
 * @class TestClass
 */
export default class TestClass extends React.PureComponent<Props, State> {
  static defaultProps = {};
  
  private imgSourceDownLoad: ImgSourceDownLoad | null = null;

  state: State = {
    tooltipCategoryIndex: 0,
    dataList: [
      {
        // value: "1月降水量",
        value: 0,
        label: "切换一",
      },
      {
        // value: "2月降水量",
        value: 1,
        label: "切换二",
      },
      {
        // value: "3月降水量",
        value: 2,
        label: "切换三",
      },
    ],
  };
  
  /** 切换按钮改变事件 */
  handleSwitchChange = (e: any, params: Item) => {
    // e.stopImmediatePropagation();
    e.stopPropagation();
    // console.log(e, params);
    this.setState({ tooltipCategoryIndex: params.value });
  }
  /** 下载chart图片 */
  saveAsImageClick = () => {
    // console.log(this.imgSourceDownLoad);
    this.imgSourceDownLoad?.downLoad();
  }
  /** 绑定事件(默认click) */
  onHandle = (params: any, eventType: AxisChartEventType) => {
    console.log(eventType);
    console.log(params);
    // $vars: (3) ["seriesName", "name", "value"]
    // borderColor: undefined
    // color: {type: "linear", x: 0, y: 0, x2: 0, y2: 1, …}
    // componentIndex: 1
    // componentSubType: "bar"
    // componentType: "series"
    // data: 7586
    // dataIndex: 0
    // dataType: undefined
    // dimensionNames: (4) ["x", "y", "__ecstackresult", "__ecstackedover"]
    // encode: {x: Array(1), y: Array(1)}
    // event: {type: "click", event: MouseEvent, target: Sub, topTarget: Sub, cancelBubble: false, …}
    // marker: "<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:[object Object];"></span>"
    // name: "1月降水量"
    // seriesId: "2018月累计降水量1"
    // seriesIndex: 1
    // seriesName: "2018月累计降水量"
    // seriesType: "bar"
    // type: "click"
    // value: 7586
  }

  render() {
    const { dataList } = this.state;
    
    return (
      <Wrap>
        <Card
          title="chart1（bar柱过于拥挤会自动计算重新置barGap为0）"
          rightComponent={
            <div className="btnWrap">
              <SwitchBtn
                handleChange={this.handleSwitchChange}
                dataList={dataList}
                defaultValue={0}
              />
              <SaveAsImage
                onClick={() => { this.saveAsImageClick(); }}
              />
            </div>
          }
        >
          <div className="chartsWrap">{this.renderEcharts(1)}</div>
        </Card>
        <Card title="chart2（bar柱超出内容范围则重新计算并设置bar柱宽度）">
          <div className="chartsWrap">
            {this.renderEcharts(2, "horizontal")}
          </div>
        </Card>
        <Card title="chart3（自定义渐变色bar柱）">
          <div className="chartsWrap">{this.renderEcharts(3)}</div>
        </Card>
        <Card title="chart4(混合图表模式)(本组件都有垂直与水平方向示例不过多展示)">
          <div className="chartsWrap">{this.renderEcharts(4)}</div>
        </Card>
        <Card title="chart5(bar柱双阴影柱)">
          <div className="chartsWrap">{this.renderEcharts(5)}</div>
        </Card>
        <Card title="chart6(bar柱进度条（针对每一系列bar柱的百分比数据）)">
          <div className="chartsWrap">{this.renderEcharts(6, "horizontal")}</div>
        </Card>
        <Card title="chart7(pictorialBar类型（同样针对每一系列bar柱的百分比）)">
          <div className="chartsWrap">{this.renderEcharts(7, "horizontal")}</div>
        </Card>
        <Card title="chart8(普通bar柱背景色)">
          <div className="chartsWrap">{this.renderEcharts(8, "horizontal")}</div>
        </Card>
        <Card title="chart9(堆叠bar柱)">
          <div className="chartsWrap">{this.renderEcharts(9)}</div>
        </Card>
        <Card title="chart10(自定义堆叠bar柱)">
          <div className="chartsWrap">{this.renderEcharts(10)}</div>
        </Card>
        <Card title="chart11(双值轴bar柱-垂直)">
          <div className="chartsWrap">{this.renderEcharts(11)}</div>
        </Card>
        <Card title="chart12(双值轴bar柱-水平,混合系列搭配)">
          <div className="chartsWrap">{this.renderEcharts(12, "horizontal")}</div>
        </Card>
        <Card title="chart13(普通line折线图)">
          <div className="chartsWrap">{this.renderEcharts(13)}</div>
        </Card>
        <Card title="chart14(分类line折线图)">
          <div className="chartsWrap">{this.renderEcharts(14)}</div>
        </Card>
        <Card title="chart15(line阶梯折线图)">
          <div className="chartsWrap">{this.renderEcharts(15)}</div>
        </Card>
        <Card title="chart16(具有标注标记line线markLine)">
          <div className="chartsWrap">{this.renderEcharts(16)}</div>
        </Card>
        <Card title="chart17(具有标注标记区域markArea)">
          <div className="chartsWrap">{this.renderEcharts(17)}</div>
        </Card>
        <Card title="chart18(具有单独颜色的bar柱）">
          <div className="chartsWrap">{this.renderEcharts(18)}</div>
        </Card>
        <Card title="chart19(具有splitArea分隔区域）">
          <div className="chartsWrap">{this.renderEcharts(19)}</div>
        </Card>
        <Card title="chart20(普通水平bar柱，top值偏移）">
          <div className="chartsWrap">{this.renderEcharts(20, "horizontal")}</div>
        </Card>
        <Card title="chart21(markLine/markPoint）">
          <div className="chartsWrap">{this.renderEcharts(21)}</div>
        </Card>
        <Card title="chart22(双值轴与混合系列配合）">
          <div className="chartsWrap">{this.renderEcharts(22)}</div>
        </Card>
        <Card title="chart23(启用dataZoom/暂无横向）">
          <div className="chartsWrap">{this.renderEcharts(23)}</div>
        </Card>
        <Card title="chart24（类目轴最右侧数据遮挡时偏移处理/添加显示辅助数据）">
          <div className="chartsWrap">{this.renderEcharts(24)}</div>
        </Card>
        <Card title="chart25（渐变背景色/添加绑定事件/极值设置）">
          <div className="chartsWrap">{this.renderEcharts(25)}</div>
        </Card>
        <Card title="chart26（自定义pictorialBar，不重复(横向时需要横向的symbol)）">
          <div className="chartsWrap">{this.renderEcharts(26)}</div>
        </Card>
        <Card title="chart27（类目轴偏移）">
          <div className="chartsWrap">{this.renderEcharts(27, "horizontal")}</div>
        </Card>
        <Card title="chart28(自定义pictorialBar，重复)">
          <div className="chartsWrap">{this.renderEcharts(28)}</div>
        </Card>
        <Card title="chart29(自定义pictorialBar，背景条)">
          <div className="chartsWrap">{this.renderEcharts(29, "horizontal")}</div>
        </Card>
        <Card title="chart30(渐变的pictorialBar-假pictorialBar)">
          <div className="chartsWrap">{this.renderEcharts(30, "horizontal")}</div>
        </Card>
        <Card title="chart31(显示label辅助数据/类目轴偏移)">
          <div className="chartsWrap">{this.renderEcharts(31, "horizontal")}</div>
        </Card>
        <Card title="chart32(气泡图scatter,气泡大小表示总产量)">
          <div className="chartsWrap">{this.renderScatterChart()}</div>
        </Card>
        <Card title="chart33(针对每一条bar柱的百分比/类目轴居左)">
          <div className="chartsWrap">{this.renderPerBar()}</div>
        </Card>
        <Card title="chartN（双边bar柱类型，水平，类目居左/暂无纵向）">
          <div className="chartsWrap">{this.renderDoubleWayBar(false)}</div>
        </Card>
        <Card title="chartN+1（双边bar柱类型，水平，类目居中/暂无纵向）">
          <div className="chartsWrap">{this.renderDoubleWayBar(true)}</div>
        </Card>
        <Card title="测试(当数据值为0时tooltip的显示处理)">
          <div className="chartsWrap">{this.renderTestEcharts()}</div>
        </Card>
      </Wrap>
    );
  }
  
  chartSaveAsImageHandle = (imgSourceDownLoad: ImgSourceDownLoad) => {
    this.imgSourceDownLoad = imgSourceDownLoad;
  }
  
  // tslint:disable-next-line:cyclomatic-complexity
  renderEcharts = (numberIndex: number, theme: string = "verticalDark") => {
    
    const { tooltipCategoryIndex } = this.state;
    
    const monthAverageRainfallListTemp = monthAverageRainfallList;
    // const monthAverageRainfallListTemp: any[] = [];
    const chartDataTemp = cloneDeep(chartData);
    Object.assign(chartDataTemp, {
      data: monthAverageRainfallListTemp.reduce((preItem, item, index) => {
        // 注意：后续组件内会使用getNumbersByStrings方法进行数据提取，但是它必须要求数组第一个元素是字符串
        // 且getRangeByIndex方法提取类目数据时也需要是字符串，所以数组第三个元素必须是字符串
        // index索引5，6为添加的辅助数据（tooltip显示用，不参与图表渲染）
        let itemData: [string, string, string, number, number, number][] = [
          [`${index}`, "2018月累计降水量", `${item.month}月降水量`, item.eighteenRainfall, 1099, 2709],
          [`${index + 1}`, "2019月累计降水量", `${item.month}月降水量`, item.nineteenRainfall, 1509, 2199],
          [`${index + 2}`, "历史月累计降水量", `${item.month}月降水量`, item.historyRainfall, 1709, 2609],
          [`${index + 3}`, "未来月累计降水量", `${item.month}月降水量`, item.futureRainfall, 3909, 1809],
          [`${index + 4}`, "测试月累计降水量", `${item.month}月降水量`, item.testRainfall, 1934, 2035],
        ];
        if ((numberIndex >= 5 && numberIndex < 9) || (numberIndex > 10 && numberIndex < 13)) {
          itemData = [
            [
              `${index}`,
              "2018月累计降水量",
              `${item.month}月降水量`,
              item.nineteenRainfall,
              1099,
              2709,
            ],
            [
              `${index + 1}`, "2019月累计降水量", `${item.month}月降水量`,
              numberIndex === 11 || numberIndex === 12 ? item.eighteenRainfall / 100 : item.eighteenRainfall,
              1509, 2199],
          ];
        }
        if (numberIndex >= 18 && numberIndex <= 21) {
          itemData = [
            [`${index}`, "2018月累计降水量", `${item.month}月降水量`, item.eighteenRainfall, 1099, 2709],
          ];
        }
        if (numberIndex === 22) {
          itemData = [
            [`${index}`, "2018月累计降水量", `${item.month}月降水量`, item.eighteenRainfall / 100, 1099, 2709],
            [`${index + 1}`, "2019月累计降水量", `${item.month}月降水量`, item.nineteenRainfall / 100, 1509, 2199],
            [
              `${index}`,
              "历史月累计降水量",
              `${item.month}月降水量`,
              // item.historyRainfall / 100,
              item.historyRainfall,
              1099,
              2709,
            ],
            [`${index}`, "未来月累计降水量", `${item.month}月降水量`, item.futureRainfall, 1099, 2709],
            [`${index}`, "测试月累计降水量", `${item.month}月降水量`, item.testRainfall, 1099, 2709],
          ];
        }
        if (numberIndex === 24) {
          itemData = [
            [`${index}`, "2018月累计降水量", `${item.month}月降水量降水量`, item.eighteenRainfall, 1099, 2709],
            [`${index + 1}`, "2019月累计降水量", `${item.month}月降水量降水量`, item.nineteenRainfall, 1509, 2199],
            [`${index + 2}`, "历史月累计降水量", `${item.month}月降水量降水量`, item.historyRainfall, 1709, 2609],
            [`${index + 3}`, "未来月累计降水量", `${item.month}月降水量降水量`, item.futureRainfall, 3909, 1809],
            [`${index + 4}`, "测试月累计降水量", `${item.month}月降水量降水量`, item.testRainfall, 1934, 2035],
          ];
        }
        if (numberIndex >= 25) {
          itemData = [
            [`${index}`, "2018月累计降水量", `${item.month}月降水量`, item.eighteenRainfall, 1099, 2709],
          ];
        }
        if (numberIndex >= 29 && numberIndex <= 30) {
          itemData = [
            [`${index}`, "2018月累计降水量", `${item.month}月降水量`, item.eighteenRainfall, 1099, 2709],
            [`${index + 1}`, "2019月累计降水量", `${item.month}月降水量`, item.nineteenRainfall, 1509, 2199],
          ];
        }
        return [...preItem, ...itemData];
      }, ([] as [string, string, string, number, number, number][])),
      // data: [],
      head: numberIndex === 32 ? ["长势程度", "总产", "单产", "种植"] : chartDataTemp.head,
    });
    // 实际开发可以引入接口配置对应chartGlobalBasicConfig上，方便编译提示
    // import { BasicConfigOption } from "@gago/axis-chart";
    let basicConfigOption: BasicConfigOption = {};
    const basicConfigOption1: BasicConfigOption = {
      // showBarTopRect: false,
      chartSaveAsImageHandle: this.chartSaveAsImageHandle,
      chartSaveAsImageName: "123123test",
      chartSavePixelRatio: 4,
      legendRight: 0,
      legendBottom: 0,
      // tooltip的显示值是否用逗号千分位分割
      tooltipValueCommaSplit: true,
      // showCategoryAxisLine: false,
      // showCategoryAxisName: true,
      // disabledCalcBarGap: true,
      // legendItemGap: 6,
      // tooltipCategoryColor: "green",
      // tooltipTitleFontSize: 14,
      // tooltipSeriesNameColor: "blue",
      // tooltipSeriesNameFontSize: 16,
      // tooltipValueColor: "red",
      // tooltipValueFontSize: 18,
      // tooltipPadding: 10,
      // tooltipBorderWidth: 1,
      // tooltipBorderColor: "#5398f2",
      // tooltipBorderRadius: 0,
      // rectBarHeight: 4,
      // barTopRectDistance: 3,
      /** 是否初始化显示图表tooltip（默认显示dataIndex为0的数据） */
      initShowTooltip: true,
      /** 初始化显示第几个tooltip(可以是number(索引从0开始)，也可以是类目轴的轴坐标字符串值)，该属性需要在initShowTooltip为true时有效 */
      showTooltipIndex: tooltipCategoryIndex,
      // showTooltipIndex: -1, // 则不显示
      // showTooltipIndex: "2月降水量",
      /** 是否循环展示tooltip（默认的循环显示时间间隔loopShowTooltipTime是1秒） */
      // loopShowTooltip: true,
      /** 循环显示tooltip时间间隔(毫秒) */
      // loopShowTooltipTime: 2000,
      // valueAxisSplitNumber: 2,
      // disabledCalcBarGap: true,
      // disabledCalcBarWidth: true,
      // showValueAxis: false,
    };
    const basicConfigOption2: BasicConfigOption = {
      // 垂直方向当然也可以显示，只是过于拥挤的情况下不建议使用(即使可以旋转角度但依然丑)，容器范围宽裕的情况下锦上添花
      // 所以一般是水平方向上使用
      showSeriesValueLabel: theme.includes("horizontal"),
      // 一般而言可以不使用barTopRectDistance/valueLabelDistance控制距离
      // 否则组件内部本身为了显示数据的安全可见性会移动较大距离
      // barTopRectDistance: 10,
      // valueLabelDistance: 10,
      // disabledCalcBarWidth: true,
      // showValueAxis: false,
      // showCategoryAxis: false,
      disabledCalcBarGap: false,
      disabledCalcBarWidth: false,
    };
    const basicConfigOption3: BasicConfigOption = {
      // 需要配合colorPalette中的assignColor
      assignBarColor: true,
      legendRight: 0,
      barWidth: 8,
      // loopShowTooltip: true,
    };
    const basicConfigOption4: BasicConfigOption = {
      legendRight: 0,
      // blendBarLineSeriesArr设置长度小于legend.length会自动以line补全
      blendBarLineSeriesArr: ["bar", "line", "bar", "line"],
      // 当showLineArea为布尔数组时长度小于legend.length时会自动以false补全
      // 混合系列中showLineArea布尔数组只针对折线系列数据，其长度对应的也是折线line，不用理会bar柱
      showLineArea: [true, false],
    };
    const basicConfigOption5: BasicConfigOption = {
      showDoubleShadow: true,
      assignBarColor: true,
      barWidth: 8,
      barGap: "-30%",
      // barBorderRadius: 0,
      // showBarTopRect: true,
      // showColorLinear: false,
    };
    const basicConfigOption6: BasicConfigOption = {
      assignBarColor: true,
      normalBarProgress: true,
      barWidth: 8,
      // showSeriesValueLabel: false,
    };
    const basicConfigOption7: BasicConfigOption = {
      seriesType: "pictorialBar",   // 默认的symbolType是rect，且此时的symbolRepeat是重复的
      pictorialBarProgress: true,
      // showSeriesValueLabel: false,
    };
    const basicConfigOption8: BasicConfigOption = {
      showBarBgc: true,
      progressBarBgc: "rgba(83,152,242,0.13)",
      // showSeriesValueLabel: true,
    };
    const basicConfigOption9: BasicConfigOption = {
      stack: true,
      // barWidth: 12,
      // showBarTopRect: true,
      // showColorLinear: true,
      legendRight: 0,
      barWidth: 4,
      // barBorderRadius: 8,
      // stackBarBorderRadius: 8,
    };
    const basicConfigOption10: BasicConfigOption = {
      legendRight: 0,
      // assignStack同样具有容错性处理，如下写法会自动将非第一条数据叠加
      // assignStack: ["stackTotal"],
      // 传空数组或者一样的元素堆叠在一起
      // assignStack: ["stackTotal", "stackTotal", "stackTotal", "stackTotal", "stackTotal"],
      // assignStack: [],
      // 分别对应每一系列数据相对应的堆叠处理
      assignStack: ["stack1", "stack2", "stack3", "stack2", "stack3"],
    };
    const basicConfigOption11: BasicConfigOption = {
      doubleValueAxis: true,
      // 如果默认不传assignAxisIndexArr，会自动有容错性处理，如果压根没写，则除了第一个都副值轴对齐
      // 0代表主值轴，1代表副值轴，垂直时左边即为主值轴，水平时上边即为主值轴
      // assignAxisIndexArr: [0, 1],
      // assignAxisIndexArr: [1, 0],
    };
    const basicConfigOption12: BasicConfigOption = {
      doubleValueAxis: true,
      blendBarLineSeriesArr: ["bar", "line"],
    };
    const basicConfigOption13: BasicConfigOption = {
      seriesType: "line",
      // 针对折线图是否启用空数据（无数据，数据为0）不连接处理(connectNullsHandle默认状态同echarts的折线图为false)
      connectNullsHandle: true,
      legendRight: 0,
      showLineArea: true,
      // lineSmooth: true,
      // showSymbol: true,
      // symbolSize: 5,
      // showSeriesValueLabel: true,
    };
    const basicConfigOption14: BasicConfigOption = {
      seriesType: "line",
      legendRight: 0,
      lineSmooth: true,
      // seriesLineTypeArr支持容错性处理，不足会自动以solid补全
      seriesLineTypeArr: ["dotted", "solid", "dotted", "dotted"],
    };
    const basicConfigOption15: BasicConfigOption = {
      seriesType: "line",
      // lineStep也支持设置成 'start', 'middle', 'end' 分别配置在当前点，当前点与下个点的中间点，下个点拐弯
      lineStep: true,
      legendRight: 0,
    };
    const basicConfigOption16: BasicConfigOption = {
      legendRight: 0,
      seriesType: "line",
      showMarkLine: true,
      markLineAxisArr: ["2月降水量", "4月降水量", "6月降水量"],
      markLineLabelTextArr: ["首例", "武汉封城", "全国复工"],
      // markLineLabelLink: true,
    };
    const basicConfigOption17: BasicConfigOption = {
      legendRight: 0,
      seriesType: "line",
      showMarkArea: true,
      markAreaEmphasisAxisArr: [["2月降水量", "4月降水量"], ["6月降水量", "7月降水量"]],
      markAreaAxisArr: [["1月降水量", "2月降水量"], ["4月降水量", "6月降水量"]],
      // 之所以写成高亮与非高亮，也是因为markArea的itemStyle的颜色不支持回调，无奈之举，凑合用吧
      markAreaEmphasisTextArr: ["返青期", "抽穗期"],
      markAreaTextArr: ["越冬期", "拔节期"],
      /**
       * 同样关于markArea/markPoint相关样式配置皆可调整，这里不做详细介绍，可自行查阅源码接口详细介绍
       * */
    };
    const basicConfigOption18: BasicConfigOption = {
      singleBarColor: true,
      showSeriesValueLabel: true,
      // 如果这里想要跟随bar柱颜色，暂时无法实现，无论新旧版本echarts-for-react/echarts都会有问题，可以单独设置颜色，如下：
      // labelValueColor: "#5398f2",
    };
    const basicConfigOption19: BasicConfigOption = {
      // true标示值轴区域，false表示类目轴区域，undefined表示都不显示
      showValueSplitArea: true,   // 有对应的类目轴的
      // splitValueAreaColorArr: ["rgba(250,250,250,0.0)", "rgba(0,187,255,0.05)"],
      splitValueAreaColorArr: [
        "rgba(255,179,0,0.3)",
        "rgba(29,233,182,0.3)",
        "rgba(237,62,97,0.3)",
        "rgba(230,244,72,0.3)",
        "rgba(11,255,39,0.3)",
      ],
    };
    const basicConfigOption20: BasicConfigOption = {
      labelValueOffset: true,
      // labelValueOffset: [0, 10],
      showSeriesValueLabel: true,
      seriesValueLabelSuffix: "自定义后缀/suffix",
      categoryAxisEllipsisCount: 3,
    };
    const basicConfigOption21: BasicConfigOption = {
      showMarkLine: true,
      markLineDataTypeArr: ["average", "max"],
      markLineLabelPosition: "insideStartTop",
      // 每一系列数据可以显示多个标记线，如下:
      // markLineDataTypeArr: ["average", "median", "max", "min"],
      markLineAxisArr: [4000],
      markLineLabelTextArr: ["目标值:"],
      showMarkPoint: true,
      // 注意：标记point没有中位数
      markPointDataType: ["average", "max", "min"],
      markPointSymbol: "pin",
      // markPointSymbol: "path://M101.963 119.253v22.262l28.066 28.242a6.027 6.027 0 0 1 0 8.486 5.936 5.936 0 0 1-8.432 0l-19.634-19.758V186c0 3.314-2.67 6-5.963 6s-5.963-2.686-5.963-6v-27.515l-19.634 19.758a5.936 5.936 0 0 1-8.432 0 6.027 6.027 0 0 1 0-8.486l28.066-28.242v-22.262a23.973 23.973 0 0 1-11.123-6.398L59.81 123.954l-10.273 38.58c-.853 3.2-4.122 5.1-7.303 4.242-3.18-.857-5.068-4.147-4.216-7.348l7.186-26.99-23.68 13.758c-2.851 1.657-6.498.674-8.145-2.196-1.646-2.87-.67-6.54 2.183-8.196l23.68-13.758-26.821-7.231c-3.181-.858-5.069-4.148-4.216-7.349.852-3.2 4.121-5.1 7.302-4.242l38.34 10.337 19.043-11.063A24.02 24.02 0 0 1 72 96c0-2.252.31-4.431.89-6.498L53.847 78.439l-38.34 10.337c-3.18.858-6.45-1.042-7.302-4.242-.853-3.201 1.035-6.491 4.216-7.349l26.82-7.231-23.68-13.758C12.71 54.54 11.734 50.87 13.38 48c1.647-2.87 5.294-3.853 8.145-2.196l23.68 13.757-7.186-26.989c-.852-3.2 1.035-6.49 4.216-7.348 3.18-.858 6.45 1.042 7.303 4.242l10.273 38.58 19.104 11.1a23.973 23.973 0 0 1 11.123-6.4v-22.26L61.971 22.242a6.027 6.027 0 0 1 0-8.486 5.936 5.936 0 0 1 8.432 0l19.634 19.758V6c0-3.314 2.67-6 5.963-6s5.963 2.686 5.963 6v27.515l19.634-19.758a5.936 5.936 0 0 1 8.432 0 6.027 6.027 0 0 1 0 8.486l-28.066 28.242v22.262a23.973 23.973 0 0 1 11.123 6.398l19.104-11.099 10.273-38.58c.853-3.2 4.122-5.1 7.303-4.242 3.18.857 5.068 4.147 4.216 7.348l-7.186 26.99 23.68-13.758c2.851-1.657 6.498-.674 8.145 2.196 1.646 2.87.67 6.54-2.183 8.196l-23.68 13.758 26.821 7.231c3.181.858 5.069 4.148 4.216 7.349-.852 3.2-4.121 5.1-7.302 4.242l-38.34-10.337-19.043 11.063c.58 2.067.89 4.246.89 6.498s-.31 4.431-.89 6.498l19.043 11.063 38.34-10.337c3.18-.858 6.45 1.042 7.302 4.242.853 3.201-1.035 6.491-4.216 7.349l-26.82 7.231 23.68 13.758c2.851 1.657 3.828 5.326 2.182 8.196-1.647 2.87-5.294 3.853-8.145 2.196l-23.68-13.757 7.186 26.989c.852 3.2-1.035 6.49-4.216 7.348-3.18.858-6.45-1.042-7.303-4.242l-10.273-38.58-19.104-11.1a23.973 23.973 0 0 1-11.123 6.4zM96 108c6.627 0 12-5.373 12-12s-5.373-12-12-12-12 5.373-12 12 5.373 12 12 12z",
      // 针对markLine/markPoint特定数据类型的文本label（可不传，有默认的）
      markDataTypeAverageText: "均值:",
      markDataTypeMaxText: "极大值:",
      // markPointSymbolSize: 40,
      // markDataTypeMinText: "",
      // markDataTypeMedianText: "",
    };
    const basicConfigOption22: BasicConfigOption = {
      legendRight: 0,
      doubleValueAxis: true,
      // 混合可以不加
      blendBarLineSeriesArr: ["bar", "line", "bar"],
      // 0代表主值轴，1代表副值轴，垂直时左边即为主值轴，水平时上边即为主值轴
      assignAxisIndexArr: [0, 0, 1, 1, 1],
      showLineArea: true,
      valueAxisNameLocation: "2%",
    };
    const basicConfigOption23: BasicConfigOption = {
      legendRight: 0,
      dataZoomAble: true,
      dataZoomRange: [20, 70],
      // barWidth: 14,
    };
    const basicConfigOption24: BasicConfigOption = {
      legendRight: 0,
      assignBarColor: true,
      barWidth: 8,
      // categoryLastLabelDistance: 24,
      // 当最右侧的类目数据太长而被遮挡时可以通过偏移处理实现可见
      // 也可以通过省略号隐藏处理，或者横向时类目过长也可以处理
      // categoryAxisEllipsisCount: 3,
      // 也可以通过换行处理
      categoryAxisReturnLineCount: 5,
      showAssistData: true,
      // 辅助数据名称字符串数组
      assistDataNameArr: ["环比:", "同比:"],
      // 辅助数据的单位如%等
      assistDataUnit: "cx",
      // assistDataPrefixArr: ["*", "~"],
      // assistDataSuffixArr: ["@", "#"],
      // 可以换行的同时倾斜
      // axisLabelRotate: true,
      // handleValueAxisRange: true,
      // 辅助数据是否有涨跌处理（布尔值true默认文字涨跌），处理成文字涨跌还是正负号涨跌（"text"，"plusMinus"）
      // 实际上是对于数据正负性质的转换显示，与后缀本质不同
      // assistDataUpDown: "plusMinus",
      // assistDataAssignColor: ["red", "blue"],
      // assistDataAssignFontSize: [14, 16],
    };
    const basicConfigOption25: BasicConfigOption = {
      // 渐变背景色
      gridBgColor: ["rgba(19,194,147,0.1)", "rgba(255,207,112,0.2)"],
      // 可不渐变
      // gridBgColor: "rgba(83,152,242,0.21)",
      onHandle: this.onHandle,
      // 可同时绑定多个事件，默认["click"]，只绑定一种事件的话也可以只写"click"这样
      onHandleEventType: ["click", "mouseout"],
      // onHandleEventType: "mouseout",
      // 按需设置
      // valueMin: 90,
      // valueMax: 11000,
      // axisLabelRotate: true,
      // 是否需要处理值轴的数据范围（避免多条数据折线图过于拥挤）
      // handleValueAxisRange: true,
      // 对数轴显示
      // valueAxisLogMode: true,
    };
    const basicConfigOption26: BasicConfigOption = {
      seriesType: "pictorialBar",
      symbolType: "path://M0,10 L10,10 C5.5,10 5.5,5 5,0 C4.5,5 4.5,10 0,10 z",
      // symbolType: `path://d="M936.1,773.6l-10-160.3h20Zm0-264.1-.8,103.8-30.4-42.6s17.4,11.8,8.9-19c0,0,18.8,13.9,8.9-16.8,0-.1,9.6,4.8,13.4-25.4Zm1.7.1L937,613.3l31.1-42.1s-17.6,11.5-8.6-19.1c0,0-19,13.6-8.7-17.1C950.8,535,941.1,539.8,937.8,509.6Zm.5,107.8h-4.4l2.2,132.8Z"`,
      showSeriesValueLabel: true,
      showColorLinear: true,
    };
    const basicConfigOption27: BasicConfigOption = {
      categoryOffset: true,
      // categoryOffset: [10, 3],
      showSeriesValueLabel: true,
      labelValueOffset: true,
      showBarBgc: true,
      progressBarBgc: "rgba(83,152,242,0.13)",
      seriesValueLabelSuffix: "元/公斤",
      seriesValueLabelPrefix: "自定义前缀",
      showValueSplitLine: false,
      showCategorySplitLine: true,
      // categoryAxisEllipsisCount: 3,
    };
    const basicConfigOption28: BasicConfigOption = {
      seriesType: "pictorialBar",
      symbolType: "path://M-244.396,44.399c0,0,0.47-2.931-2.427-6.512c2.819-8.221,3.21-15.709,3.21-15.709s5.795,1.383,5.795,7.325C-237.818,39.679-244.396,44.399-244.396,44.399z M-260.371,40.827c0,0-3.881-12.946-3.881-18.319c0-2.416,0.262-4.566,0.669-6.517h17.684c0.411,1.952,0.675,4.104,0.675,6.519c0,5.291-3.87,18.317-3.87,18.317H-260.371z M-254.745,18.951c-1.99,0-3.603,1.676-3.603,3.744c0,2.068,1.612,3.744,3.603,3.744c1.988,0,3.602-1.676,3.602-3.744S-252.757,18.951-254.745,18.951z M-255.521,2.228v-5.098h1.402v4.969c1.603,1.213,5.941,5.069,7.901,12.5h-17.05C-261.373,7.373-257.245,3.558-255.521,2.228zM-265.07,44.399c0,0-6.577-4.721-6.577-14.896c0-5.942,5.794-7.325,5.794-7.325s0.393,7.488,3.211,15.708C-265.539,41.469-265.07,44.399-265.07,44.399z M-252.36,45.15l-1.176-1.22L-254.789,48l-1.487-4.069l-1.019,2.116l-1.488-3.826h8.067L-252.36,45.15z",
      showSeriesValueLabel: true,
      symbolRepeat: true,
      symbolSize: [15, 20],  // 默认20
      // symbolRotate: -90,
    };
    const basicConfigOption29: BasicConfigOption = {
      seriesType: "pictorialBar",
      symbolType: `path://d="M936.1,773.6l-10-160.3h20Zm0-264.1-.8,103.8-30.4-42.6s17.4,11.8,8.9-19c0,0,18.8,13.9,8.9-16.8,0-.1,9.6,4.8,13.4-25.4Zm1.7.1L937,613.3l31.1-42.1s-17.6,11.5-8.6-19.1c0,0-19,13.6-8.7-17.1C950.8,535,941.1,539.8,937.8,509.6Zm.5,107.8h-4.4l2.2,132.8Z"`,
      // pictorialBar的普通bar柱进度条
      pictorialBarProgress: true,
      // symbolSize: 13,
      symbolSize: [20, 10],
      // symbolMargin: 0,
    };
    const basicConfigOption30: BasicConfigOption = {
      linearPictorialBar: true,
      showBarTopRect: false,
      setAlphaNumberArr: [0.9, 0.2],
      // linearPictorialBarWidth: 6,
      // linearPictorialBarDivider: 2,
      // linearPictorialBarDividerColor: "red",
    };
    const basicConfigOption31: BasicConfigOption = {
      // normalBarProgress: true,
      showBarBgc: true,
      progressBarBgc: "rgba(83,152,242,0.13)",
      categoryOffset: true,
      showSeriesValueLabel: true,
      labelValueColor: "#ff7043",
      labelValueOffset: true,
      seriesValueLabelPrefix: "自定义前缀",
      showSeriesValueLabelAssistData: true,
      seriesValueLabelAssistPrefixArr: ["总计：", "已完成："],
      seriesValueLabelAssistSuffixArr: ["元", "斤"],
      seriesValueLabelAssistDivider: "  |  ",
      singleBarColor: true,
    };
    if (numberIndex === 1) {
      basicConfigOption = basicConfigOption1;
    } else if (numberIndex === 2) {
      basicConfigOption = basicConfigOption2;
    } else if (numberIndex === 3) {
      basicConfigOption = basicConfigOption3;
    } else if (numberIndex === 4) {
      basicConfigOption = basicConfigOption4;
    } else if (numberIndex === 5) {
      basicConfigOption = basicConfigOption5;
    } else if (numberIndex === 6) {
      basicConfigOption = basicConfigOption6;
    } else if (numberIndex === 7) {
      basicConfigOption = basicConfigOption7;
    } else if (numberIndex === 8) {
      basicConfigOption = basicConfigOption8;
    } else if (numberIndex === 9) {
      basicConfigOption = basicConfigOption9;
    } else if (numberIndex === 10) {
      basicConfigOption = basicConfigOption10;
    } else if (numberIndex === 11) {
      basicConfigOption = basicConfigOption11;
    } else if (numberIndex === 12) {
      basicConfigOption = basicConfigOption12;
    } else if (numberIndex === 13) {
      basicConfigOption = basicConfigOption13;
    } else if (numberIndex === 14) {
      basicConfigOption = basicConfigOption14;
    } else if (numberIndex === 15) {
      basicConfigOption = basicConfigOption15;
    } else if (numberIndex === 16) {
      basicConfigOption = basicConfigOption16;
    } else if (numberIndex === 17) {
      basicConfigOption = basicConfigOption17;
    } else if (numberIndex === 18) {
      basicConfigOption = basicConfigOption18;
    } else if (numberIndex === 19) {
      basicConfigOption = basicConfigOption19;
    } else if (numberIndex === 20) {
      basicConfigOption = basicConfigOption20;
    } else if (numberIndex === 21) {
      basicConfigOption = basicConfigOption21;
    } else if (numberIndex === 22) {
      basicConfigOption = basicConfigOption22;
    } else if (numberIndex === 23) {
      basicConfigOption = basicConfigOption23;
    } else if (numberIndex === 24) {
      basicConfigOption = basicConfigOption24;
    } else if (numberIndex === 25) {
      basicConfigOption = basicConfigOption25;
    } else if (numberIndex === 26) {
      basicConfigOption = basicConfigOption26;
    } else if (numberIndex === 27) {
      basicConfigOption = basicConfigOption27;
    } else if (numberIndex === 28) {
      basicConfigOption = basicConfigOption28;
    } else if (numberIndex === 29) {
      basicConfigOption = basicConfigOption29;
    } else if (numberIndex === 30) {
      basicConfigOption = basicConfigOption30;
    } else if (numberIndex === 31) {
      basicConfigOption = basicConfigOption31;
    }
    return (
      <AxisChart
        theme={theme.includes("horizontal") ? "horizontalDark" : "verticalDark"}
        chartData={chartDataTemp}
        // 单位后缀，数组长度为4(分别是：单位ID后缀，月-类目轴单位，cm-值轴单位，mm-双Y轴时的右侧y轴单位)
        unitFix={["单位ID后缀", "月", "mm", "cm"]}
        basicConfigOption={basicConfigOption}
        subColor={[
          "#ff7043", "#ffb300", "#1de9b6", "#00d4ec",
          "#ed3e61", "#bccd07", "#04ce1c", '#058ff8',
        ]}
        assignColor={
          [3, 5, 6, 24].includes(numberIndex)
            ? [
              ["#f5804d", "#fccb05"],
              ["#8bd46e", "#09bcb7"],
              ["#6851f1", "#248ff7"],
              ["#00feff", "#027eff"],
              ["#fffc00", "#04ce1c"],
            ]
            : undefined
        }
      />
    );
  }
  /** 渲染双向bar柱 */
  renderDoubleWayBar = (doubleWayBarCategoryCenter: boolean, theme: string = "horizontalDark") => {
    const basicConfigOption: BasicConfigOption = {
      doubleWayBarCategoryCenter,
      labelValueOffset: !doubleWayBarCategoryCenter,
      // doubleWayBarLabelOffsetY: 3,
      barBorderRadius: 1,
      barWidth: 4,
      showBarTopRect: false,
      setAlphaNumberArr: [0.8, 0.2],
      showValueSplitLine: false,
      // 可自定义，也可直接设置head[1]
      // assignCategoryAxisName: "年龄：岁",
      axisLabelRotate: false,
      showCategoryAxisLine: false,
      showValueAxisLine: true,
      legendColor: "#69a1cc",
      legendRight: 0,
      doubleWayBar: true,
      doubleWayBarPercent: true,
      doubleWayBarPNHandle: true,
      valueAxisSuffixHandle: true,
      showSeriesValueLabel: true,
      seriesValueLabelSuffix: "%",
      // valueMax: 80,
      // showColorLinear: false,
    };
    const chartDataTemp = cloneDeep(chartData);
    Object.assign(chartDataTemp, {
      data: doubleWayList.reduce((preItem, item, index) => {
        const itemDate: [string, string, string, number][] = [
          [`${index}`, "男性", `${item.range}`, item.menPercent],
          [`${index + 1}`, "女性", `${item.range}`, item.womenPercent],
        ];
        return [...preItem, ...itemDate];
      }, ([] as [string, string, string, number][])),
      suffix: ["", "岁", "", "%"],
      head: ["", "年龄：", "", ""],
    });
    return (
      <AxisChart
        theme={theme.includes("horizontal") ? "horizontalDark" : "verticalDark"}
        chartData={chartDataTemp}
        basicConfigOption={basicConfigOption}
        subColor={["#ed3e61", "#42a5f5"]}
      />
    );
  }
  
  /** 渲染气泡散点图 */
  renderScatterChart = (theme?: string) => {
    const testScatterData = [
      { city: "莱西市", level: 0.25, totalYield: 364, singleYield: 86, plantArea: 58 },
      { city: "平度市", level: 0.36, totalYield: 315, singleYield: 86, plantArea: 95 },
      { city: "芜湖市", level: 0.41, totalYield: 212, singleYield: 78, plantArea: 129 },
      { city: "合肥市", level: 0.48, totalYield: 198, singleYield: 49, plantArea: 96 },
      { city: "南京市", level: 0.34, totalYield: 189, singleYield: 21, plantArea: 56 },
      { city: "长沙市", level: 0.27, totalYield: 110, singleYield: 28, plantArea: 71 },
      { city: "苏州市", level: 0.82, totalYield: 100, singleYield: 19, plantArea: 138 },
      { city: "泰州市", level: 0.72, totalYield: 124, singleYield: 74, plantArea: 59 },
      { city: "广州市", level: 0.62, totalYield: 134, singleYield: 65, plantArea: 40 },
      { city: "北京市", level: 0.59, totalYield: 455, singleYield: 90, plantArea: 30 },
      { city: "常州市", level: 0.93, totalYield: 321, singleYield: 52, plantArea: 31 },
    ];
    const chartDataTemp = cloneDeep(chartData);
    Object.assign(chartDataTemp, {
      data: testScatterData.map((item, index) => {
        // 数据按倒序后三个从右到左对应的分别时水平x轴，y轴，气泡散点symbol大小映射数据，然后都是附加的渲染数据
        return [
          `${index}`,
          // 气泡散点图系列数据名
          `小麦长势`,
          // 如果有分级别渲染的多色symbol数据，该数据需要放在系列数据名之后，即第三个索引位置，并且要开启多色气泡散点图渲染属性
          item.level,  // 此等级数据来识别长势级别(多色渲染的依据数据，根据该数据以及范围数组进行颜色区分)
          // 气泡散点图高亮使用的是倒数第四个数据，如这里的城市(它是非重复数据，不会导致tooltip混乱)
          item.city,
          item.totalYield,
          item.singleYield,
          item.plantArea,
        ];
      }),
      // head的名称对应data数据对应的索引数据
      head: ["ID", "气泡散点图系列数据名", "长势:", "城市:", "总产:", "单产:", "种植:"],
      // suffix与prefix这里与head一一对应，为数据值的前后缀
      suffix: ["", "", "", "", "吨", "吨", "亩"],
      prefix: ["", "", "", "", "", "", ""],
    });
    const basicConfigOption: BasicConfigOption = {
      seriesType: "scatter",
      // symbolType: "rect",   // 默认circle
      // 由于这里气泡散点图两个轴都是值轴，这里用gridRightVertical调整水平值轴右侧数据遮挡再适合不过了
      // 同样适用于水平气泡图的水平值轴右侧数据的遮挡调整
      gridRightVertical: "2%",
      // tooltipType: "cross",
      symbolSizeRate: 0.3,
      // 由于非气泡类型图的轴名称都是有head数据处理的，气泡图的head另作他用，这里轴name需要自定义
      assignValueAxisName: "单产：(吨)",
      assignCategoryAxisName: "种植(亩)",
      showCategoryAxisName: true,
      assignCategoryAxisNameLocation: { bottom: 28 },
      // showValueAxisLine: true,
      // y值轴居中
      // scatterYValueAxisCenter: true,
      // scatterYValueAxisCenterOffset: -30,
      // 垂直
      // assignValueAxisNameLocation: { left: "50%", transform: "translateX(-50%)" },
      // 水平
      // assignValueAxisNameLocation: { left: "100%", bottom: "50%", transform: "translate(-100%, 0px)" },
      // hideCategoryZeroValue: true,
      hideValueZeroValue: true,
      // 多色渲染
      scatterColorsSymbol: true,
      scatterColorsRenderArr: [[0, 0.2], [0.2, 0.4], [0.4, 0.6], [0.6, 0.8], [0.8, 1]],
      // scatterColorsItemOpenClose: "lcro",
      scatterSymbolColorOpacity: 1,
      showTooltipColorsRenderByData: true,
      // scatterSymbolEmphasisColor: "#6851f1",
      initShowTooltip: true,
      showTooltipIndex: "莱西市",
      // showTooltipIndex: "北京市",
      // loopShowTooltip: true,
    };
    return (
      <AxisChart
        theme={theme?.includes("horizontal") ? "horizontalDark" : "verticalDark"}
        chartData={chartDataTemp}
        basicConfigOption={basicConfigOption}
        subColor={[
          "#ff7043", "#ffb300", "#1de9b6", "#00d4ec",
          "#ed3e61", "#bccd07", "#04ce1c", '#058ff8',
        ]}
      />
    );
  }
  
  /** 渲染柱状图 */
  renderPerBar = () => {
    const basicConfigOption: BasicConfigOption = {
      showBarTopRect: false,
      barBorderRadius: 1,
      barWidth: 8,
      showCategoryAxisLine: false,
      showValueAxisName: false,
      showValueSplitLine: false,
      // labelValueColor: "#ebf8ff",
      categoryAxisFontColor: "#2e74a3",
      showValueAxis: false,
      normalBarProgress: true,
      // 针对自身bar柱的百分比
      selfPer: true,
      // showSeriesValueLabel: false,
      progressBarBgc: "rgba(46,116,163,0.3)",
      showColorLinear: true,
      // 控制渐变透明度
      setAlphaNumberArr: [0.8, 0.2],
      // 用于水平时类目轴数据居左
      categoryHorizontalLabelLeft: true,
      // categoryAxisEllipsisCount: 12,
    };
    const chartDataTemp = cloneDeep(chartData);
    Object.assign(chartDataTemp, {
      data: percentList.reduce((preItem, item, index) => {
        const itemDate: [string, string, string, number][] = [
          [`${index}`, "耕地破碎比例", `TOP${index + 1}.    ${item.city}`, item.percent],
          [`${index + 1}`, "耕地破碎比例2", `TOP${index + 1}.    ${item.city}`, item.percent2],
        ];
        return [...preItem, ...itemDate];
      }, ([] as [string, string, string, number][])),
      suffix: ["", "", "", ""],
    });
    return (
      <AxisChart
        theme="horizontalDark"
        chartData={chartDataTemp}
        basicConfigOption={basicConfigOption}
        subColor={[
          "#ff7043", "#ffb300", "#1de9b6", "#00d4ec",
          "#ed3e61", "#bccd07", "#04ce1c", '#058ff8',
        ]}
      />
    );
  }
  
  /** 测试 */
  renderTestEcharts = () => {
    const chartDataTemp = cloneDeep(chartData);
    Object.assign(chartDataTemp, {
      data: testData.map((item, index) => {
        return [`${index}`, `${item.category}`, `${item.name}`, item.value];
      }),
      suffix: ["", "", "", ""],
    });
    return (
      <AxisChart
        chartData={chartDataTemp}
        basicConfigOption={{
          assignUndefinedNullValue: "-",
          // tooltipValueCommaSplit: true,
          // doubleValueAxis: true,
          // assignAxisIndexArr: [0, 1, 0, 1, 1],
          // connectNullsHandle: true,
          // setAlphaNumberArr: [0.8, 0.2],
          // seriesType: "line",
          // showSymbol: true,
          // symbolSize: 5,
          // axisLabelRotate: true,
        }}
        subColor={[
          "#ff7043", "#ffb300", "#1de9b6", "#00d4ec",
          "#ed3e61", "#bccd07", "#04ce1c", '#058ff8',
        ]}
      />
    );
  }
}
