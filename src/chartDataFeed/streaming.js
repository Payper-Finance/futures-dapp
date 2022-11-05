import { parseFullSymbol } from './helpers.js';
import io from 'socket.io-client'
const socket = io('http://localhost:8000/');
const channelToSubscription = new Map();
socket.on('connect', () => {
	console.log('[socket] Connected');
});

socket.on('disconnect', (reason) => {
	console.log('[socket] Disconnected:', reason);
});

socket.on('error', (error) => {
	console.log('[socket] Error:', error);
});

socket.on('data4', data => {
	console.log('[socket] Message:', data);
	const tradePrice = parseFloat(data);
	const channelString = `0~${"Zenith"}~${"XTZ"}~${"kUSD"}`;
	const subscriptionItem = channelToSubscription.get(channelString);
	console.log(subscriptionItem)

   
	if (subscriptionItem === undefined) {
		return;
	}
	
	const lastDailyBar = subscriptionItem.lastDailyBar;
	console.log(subscriptionItem.resolution)
	let date = Date.now();
	let bar;
	if (((date - lastDailyBar.time) / 1000) >= 300){
		bar = {
			time: date,
			open: tradePrice,
			high: tradePrice,
			low: tradePrice,
			close: tradePrice,
		};
		console.log('[socket] Generate new bar', bar);
	} else {
		bar = {
			...lastDailyBar,
			high: Math.max(lastDailyBar.high, tradePrice),
			low: Math.min(lastDailyBar.low, tradePrice),
			close: tradePrice
		};
		console.log('[socket] Update the latest bar by price', tradePrice);
	}
	subscriptionItem.lastDailyBar = bar;


	subscriptionItem.handlers.forEach(handler => handler.callback(bar));
});


export function subscribeOnStream(
	symbolInfo,
	resolution,
	onRealtimeCallback,
	subscribeUID,
	onResetCacheNeededCallback,
	lastDailyBar,
	) {

	const parsedSymbol = parseFullSymbol(symbolInfo.name);
	const channelString = `0~${parsedSymbol.exchange}~${parsedSymbol.fromSymbol}~${parsedSymbol.toSymbol}`;
	console.log(resolution)
	const handler = {
		id: subscribeUID,
		callback: onRealtimeCallback,
	};
	let subscriptionItem = channelToSubscription.get(channelString);
	if (subscriptionItem) {
		subscriptionItem.handlers.push(handler);
		return;
	}
	subscriptionItem = {
		subscribeUID,
		resolution,
		lastDailyBar,
		handlers: [handler],
	};
	channelToSubscription.set(channelString, subscriptionItem);
	console.log(channelToSubscription)
	console.log('[subscribeBars]: Subscribe to streaming. Channel:', channelString);
	socket.emit('SubAdd', { subs: [channelString] });
}

export function unsubscribeFromStream(subscriberUID) {

	for (const channelString of channelToSubscription.keys()) {
		const subscriptionItem = channelToSubscription.get(channelString);
		const handlerIndex = subscriptionItem.handlers
			.findIndex(handler => handler.id === subscriberUID);

		if (handlerIndex !== -1) {
			subscriptionItem.handlers.splice(handlerIndex, 1);
			if (subscriptionItem.handlers.length === 0) {
				console.log('[unsubscribeBars]: Unsubscribe from streaming. Channel:', channelString);
				channelToSubscription.delete(channelString);
				break;
			}
		}
	}
}
