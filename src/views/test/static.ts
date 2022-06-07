/** 测试数据 */
export const monthAverageRainfallList: {
	/** 月份 */
	month: string | number;
	/** 18年月平均降雨量 */
	eighteenRainfall: number;
	/** 19年月平均降雨量 */
	nineteenRainfall: number;
	/** 历史月平均降雨量 */
	historyRainfall: number;
	/** 未来月平均降雨量 */
	futureRainfall: number;
	/** 测试月平均降雨量 */
	testRainfall: number;
}[] = [
	{
		month: 1,
		// eighteenRainfall: 9996,
		eighteenRainfall: 7586,
		nineteenRainfall: 2348,
		historyRainfall: 5437,
		futureRainfall: 4346,
		testRainfall: 8234,
	},
	{
		month: 2,
		eighteenRainfall: 8765,
		nineteenRainfall: 7343,
		historyRainfall: 5235,
		futureRainfall: 3612,
		testRainfall: 7895,
	},
	{
		month: 3,
		eighteenRainfall: 7654,
		nineteenRainfall: 4372,
		historyRainfall: 3893,
		futureRainfall: 1784,
		testRainfall: 9035,
	},
	{
		month: 4,
		eighteenRainfall: 6543,
		nineteenRainfall: 4726,
		historyRainfall: 3727,
		futureRainfall: 6538,
		testRainfall: 6239,
	},
	{
		month: 5,
		eighteenRainfall: 5432,
		nineteenRainfall: 6632,
		historyRainfall: 2891,
		futureRainfall: 5233,
		testRainfall: 8454,
	},
	{
		month: 6,
		eighteenRainfall: 5348,
		nineteenRainfall: 8925,
		historyRainfall: 8476,
		futureRainfall: 3437,
		testRainfall: 7648,
	},
	{
		month: 7,
		eighteenRainfall: 2348,
		nineteenRainfall: 7925,
		historyRainfall: 8976,
		futureRainfall: 2417,
		testRainfall: 6448,
		// nineteenRainfall: null as any,
		// historyRainfall: null as any,
		// futureRainfall: null as any,
		// testRainfall: null as any,
	},
];

/** 测试数据 */
export const testData = [
	{ value: 264, name: "黄岛区", code: "370211", category: "生产企业" },
	{ value: 3553, name: "平度市", code: "370283", category: "家庭农场" },
	{ value: 54, name: "崂山区", code: "370212", category: "家庭农场" },
	{ value: 10, name: "平度市", code: "370283", category: "农服协会" },
	{ value: 2150, name: "胶州市", code: "370281", category: "专业合作社" },
	{ value: 390, name: "胶州市", code: "370281", category: "规模养殖场" },
	{ value: 474, name: "胶州市", code: "370281", category: "家庭农场" },
	{ value: 98, name: "莱西市", code: "370285", category: "生产企业" },
	{ value: 16, name: "城阳区", code: "370214", category: "生产企业" },
	{ value: 1748, name: "平度市", code: "370283", category: "规模养殖场" },
	{ value: 293, name: "崂山区", code: "370212", category: "专业合作社" },
	{ value: 1, name: "李沧区", code: "370213", category: "生产企业" },
	{ value: 3944, name: "平度市", code: "370283", category: "专业合作社" },
	{ value: 4, name: "胶州市", code: "370281", category: "农服协会" },
	{ value: 65, name: "即墨区", code: "370282", category: "生产企业" },
	{ value: 2028, name: "即墨区", code: "370282", category: "家庭农场" },
	{ value: 502, name: "黄岛区", code: "370211", category: "规模养殖场" },
	{ value: 3, name: "莱西市", code: "370285", category: "农服协会" },
	{ value: 1685, name: "黄岛区", code: "370211", category: "专业合作社" },
	{ value: 284, name: "城阳区", code: "370214", category: "家庭农场" },
	{ value: 2208, name: "莱西市", code: "370285", category: "家庭农场" },
	{ value: 1, name: "城阳区", code: "370214", category: "农服协会" },
	{ value: 2, name: "即墨区", code: "370282", category: "农服协会" },
	{ value: 29, name: "胶州市", code: "370281", category: "生产企业" },
	{ value: 3373, name: "莱西市", code: "370285", category: "专业合作社" },
	{ value: 6, name: "黄岛区", code: "370211", category: "农服协会" },
	{ value: 1921, name: "莱西市", code: "370285", category: "规模养殖场" },
	{ value: 1759, name: "即墨区", code: "370282", category: "专业合作社" },
	{ value: 79, name: "平度市", code: "370283", category: "生产企业" },
	{ value: 152, name: "城阳区", code: "370214", category: "规模养殖场" },
	{ value: 35, name: "崂山区", code: "370212", category: "生产企业" },
	{ value: 754, name: "即墨区", code: "370282", category: "规模养殖场" },
	{ value: 3743, name: "黄岛区", code: "370211", category: "家庭农场" },
	{ value: 667, name: "城阳区", code: "370214", category: "专业合作社" },
];

export const doubleWayList: {
	/** 类目范围 */
	range: string;
	/** 对应范围男性年龄比例 */
	menPercent: number;
	/** 市县百分比 */
	womenPercent: number;
}[] = [
	{
		range: "XX-XX1",
		// menPercent: 34.78,
		menPercent: 73.56,
		womenPercent: 73.56,
	},
	{
		range: "XX-XX2",
		menPercent: 56.28,
		womenPercent: 47.56,
	},
	{
		range: "XX-XX3",
		menPercent: 99.99,
		womenPercent: 99.99,
	},
	{
		range: "XX-XX4",
		menPercent: 23.78,
		womenPercent: 53.56,
	},
	{
		range: "XX-XX5",
		menPercent: 45.78,
		womenPercent: 75.56,
	},
	{
		range: "XX-XX6",
		menPercent: 23.78,
		womenPercent: 43.56,
	},
	{
		range: "XX-XX7",
		menPercent: 54.78,
		womenPercent: 75.56,
	},
	{
		range: "XX-XX8",
		menPercent: 76.78,
		womenPercent: 35.56,
	},
	{
		range: "XX-XX9",
		menPercent: 63.78,
		womenPercent: 87.56,
	},
	{
		range: "XX-XX10",
		menPercent: 83.78,
		womenPercent: 23.56,
	},
	{
		range: "XX-XX11",
		menPercent: 83.78,
		womenPercent: 87.56,
	},
	{
		range: "XX-XX12",
		menPercent: 76.78,
		womenPercent: 65.56,
	},
	{
		range: "XX-XX13",
		menPercent: 65.78,
		womenPercent: 94.56,
	},
	{
		range: "XX-XX14",
		menPercent: 43.78,
		womenPercent: 73.56,
	},
];

export const percentList: {
	/** 市县 */
	city: string;
	/** 市县百分比 */
	percent: number;
	/** 市县百分比 */
	percent2: number;
}[] = [
	{
		city: "X县",
		percent: 34.78,
		percent2: 65.56,
	},
	{
		city: "XXXX县",
		percent: 56.28,
		percent2: 47.56,
	},
	{
		city: "XX县",
		percent: 89.78,
		percent2: 93.56,
	},
	{
		city: "XXXXXXX县",
		percent: 23.78,
		percent2: 53.56,
	},
	{
		city: "XXXX县",
		percent: 45.78,
		percent2: 75.56,
	},
	{
		city: "XXX县",
		percent: 23.78,
		percent2: 43.56,
	},
	{
		city: "XX县",
		percent: 54.78,
		percent2: 75.56,
	},
	{
		city: "XXXXX县",
		percent: 76.78,
		percent2: 35.56,
	},
	{
		city: "XXX县",
		percent: 63.78,
		percent2: 87.56,
	},
	{
		city: "XXXX县",
		percent: 83.78,
		percent2: 23.56,
	},
];
