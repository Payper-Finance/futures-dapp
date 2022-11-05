// Make requests to CryptoCompare API
import axios from 'axios';
import qs from 'qs';
export async function makeApiRequest(path) {
	try {
		const response = await fetch(`https://min-api.cryptocompare.com/${path}`);
		return response.json();
	} catch (error) {
		throw new Error(`CryptoCompare request error: ${error.status}`);
	}
}
export async function makeApiDataRequest(granularity) {
	try {
		let x
		if(granularity=='5'){
			x = "5minute"
		}
		else if(granularity=='15'){
			x = "15minute"
		}
		else if(granularity=='60'){
			x = "hour"
		}
		if(granularity=='1D'){
			x = "day"
		}
		let data = await axios.get(`http://localhost:8000/granularity?candle=${x}`)
		  return data.data
	} catch (error) {
		throw new Error(`CryptoCompare request error: ${error.status}`);
	}
}
// Generate a symbol ID from a pair of the coins
export function generateSymbol(exchange, fromSymbol, toSymbol) {
	const short = `${fromSymbol}/${toSymbol}`;
	return {
		short,
		full: `${exchange}:${short}`,
	};
}

export function parseFullSymbol(fullSymbol) {
	const match = fullSymbol.match(/^(\w+):(\w+)\/(\w+)$/);
	if (!match) {
		return null;
	}

	return {
		exchange: match[1],
		fromSymbol: match[2],
		toSymbol: match[3],
	};
}
