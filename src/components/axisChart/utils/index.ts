import { ITable } from "../interface";
import uniq from "lodash/uniq";

/**
 * 获取数据中一列的范围
 * created by liushanbao
 * @author liushanbao
 * @export
 * @template S
 * @template N
 * @param {ITable<S, N>} chartData 图表数据
 * @param {number} index 列号
 * @returns
 */
export const getRangeByIndex = (chartData: ITable, index: number) => {
  return uniq(chartData.data.map(item => item[index]));
}

/**
 * 根据给定的字符组合筛选出符合条件的数字
 * created by liushanbao
 * @author liushanbao
 * @export
 * @template S
 * @template N
 * @param chartData 图表数据
 * @param filters 过滤器，按照0-n中不为undefined的列的值筛选，并按照0-n中为undefined的列对应的range排序
 * @returns
 */
export const getNumbersByStrings = (
  chartData: ITable,
  filters: (string | number | undefined)[],
): [number | undefined][] => {
  const data = chartData.data;
  const numberOfString = (data[0] || []).filter(item => typeof item === "string").length;
  const numberOfNumber = (data[0] || []).filter(item => typeof item === "number").length;
  const indexOfString = filters.lastIndexOf(undefined);
  const ranges = getRangeByIndex(chartData, indexOfString + 1) as string[];
  const filterUndefineNumber = filters.filter(item => item === undefined).length;
  if ((filterUndefineNumber !== 1)) {
    throw new Error(`filters 参数中应该有1列为undefined，现在有${filterUndefineNumber}列`);
  }
  /** 返回过滤函数，按照所有的字符做过滤 */
  function privateFilter(item: string) {
    const filterCopy = filters.concat();
    filterCopy[indexOfString] = item;
    return (dataLine: [string, string, string, number]) => {
      for (let index = 0; index < filterCopy.length; index++) {
        if (dataLine[index + 1] !== filterCopy[index]) {
          return false;
        }
      }
      return true;
    };
  }
  return ranges.map(item => {
    const filted = data.filter(privateFilter(item));
    if (filted.length > 0) {
      return filted[0].slice(numberOfString);
    }
    return ([] as (number | undefined)[])
      .fill(undefined, 0, numberOfNumber);
  }) as [number | undefined][];
}

/**
 * 千分位逗号分割(不用Number.toLocaleString("zh", { minimumFractionDigits: n }))或者
 * Number.toLocaleString("zh", { maximumFractionDigits: n })是因为小数点的后续位数保留考量
 **/
export const convertNumToThousand = (num: number | string | undefined | null, assignUndefinedNullValue: string = "") => {
  if (num === null || num === undefined || num === "") return assignUndefinedNullValue || "";
  const numStr = `${num}`;
  if (numStr.indexOf(".") === -1) {
    // 不带小数点的情况
    // 将数字转化的字符串反转
    const str = numStr.split("").reverse().join("");
    const len = numStr.split("").length;
    // 每3位加一个千分位逗号
    const convertStr = str.replace(/(\d{3})/g, "$1,");
    // 将加了千分位的字符转再反转回来
    const result = convertStr.split("").reverse().join("");
    // 如果数字的位数是3的整数倍，则去掉开头的逗号
    return len % 3 === 0 ? result.slice(1) : result;
  }
  // 带小数点的情况
  return numStr.replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
}

/** 自适应，在没有scale缩放页面屏幕的情况下使用 */
export const fitFlex = (px: number, disabledFitFlex: boolean = true, defaultEqPx: number = 1920) => {
  if (disabledFitFlex) return px;
  // 默认UI设备宽度分辨率按照1920处理（真正开发时按需求设备尺寸更改）
  const clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  if (!clientWidth) return px;
  return (clientWidth * px) / defaultEqPx;
}

/**
 * @description 精确计算字符串个数，纯粹经验计算积累，无逻辑可言
 */
export const exactlyCalcStrCount = (param: string, exact = true, exactlyCalcArr: [number, number, number] = [0.25, 0.3, 0.3]) => {
  let calcStrCount = 0;
  // 为了scatter这里特意处理一下字符串
  for (const i of `${param}`) {
    // 对于下面的类目轴名称倾斜而言是可以粗略计算，但是legend需要精确计算
    if (((i.charCodeAt(0) === 32)
      || (i.charCodeAt(0) === 46)
      || (i.charCodeAt(0) === 47) // "/"符号
      || (i.charCodeAt(0) === 124)
      || (i.charCodeAt(0) >= 48 && i.charCodeAt(0) <= 57)
      || (i.charCodeAt(0) >= 65 && i.charCodeAt(0) <= 90)
      || (i.charCodeAt(0) >= 97 && i.charCodeAt(0) <= 122)) && exact) {
      // 特殊字符在canvas实际渲染时所占的空间大小不一样，需要特殊处理
      if (i.charCodeAt(0) === 49 || i.charCodeAt(0) === 124) { // 数字"1"或者英文竖线"|"
        calcStrCount += (exactlyCalcArr[0]);
      } else if (i.charCodeAt(0) === 32) {  // 空格
        calcStrCount += (exactlyCalcArr[1]);
      } else if (i.charCodeAt(0) === 46) {  // "."符号
        calcStrCount += (exactlyCalcArr[2]);
      } else {
        calcStrCount += 0.5;
      }
    } else {
      calcStrCount++;
    }
  }
  return calcStrCount;
}

/** 生成随机颜色 */
export const getRandomColor = () => {
  let str = "#";
  // 定义一个十六进制的值的数组
  const arr = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
  // 遍历循环产生 6 个数
  for (let i = 0; i < 6; i++) {
    // 随机产生 0~15 的个索引数,然后根据该索引找到数组中对应的值,拼接到一起
    const lut = parseInt(`${Math.random() * 16}`, 10);
    str += arr[lut];
  }
  return str;
}
