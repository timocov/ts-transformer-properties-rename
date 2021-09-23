export interface Ohlc {
	open: number;
	high: number;
	low: number;
	close: number;
}

interface BarValueByType {
	Bar: Ohlc;
	Line: number;
}

type SeriesType = keyof BarValueByType;

function getBarValue<T extends SeriesType>(value: number, seriesType: T): BarValueByType[T] {
	if (seriesType === 'Bar') {
		return {
			open: value,
			high: value,
			low: value,
			close: value,
		} as BarValueByType[T];
	} else {
		return value as BarValueByType[T];
	}
}
