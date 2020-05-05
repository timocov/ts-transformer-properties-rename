export interface LineData {
	time: number;
	value: number;
}

export interface HistogramData extends LineData {
	color?: string;
}

export interface BarData {
	time: number;

	open: number;
	high: number;
	low: number;
	close: number;
}

export interface SeriesDataItemTypeMap {
	Bar: BarData;
	Candlestick: BarData;
	Area: LineData;
	Line: LineData;
	Histogram: HistogramData;
}

export type SeriesType = keyof SeriesDataItemTypeMap;

export function foo<TSeriesType extends SeriesType>(item: SeriesDataItemTypeMap[TSeriesType]): void {
	console.log(item.time);
}
