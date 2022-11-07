import axios from 'axios'
import {
    makeApiRequest,
    generateSymbol,
    parseFullSymbol,
    makeApiDataRequest,
} from './helpers.js';
import {
    subscribeOnStream,
    unsubscribeFromStream,
} from './streaming.js';

const lastBarsCache = new Map();
const configurationData = {
    supported_resolutions: ["5", "15", "60", "D"],
    exchanges: [{
        value: 'Zenith',
        name: 'Zenith',
        desc: 'Zenith',
    },
    {
        // `exchange` argument for the `searchSymbols` method, if a user selects this exchange
        value: 'Kraken',

        // filter name
        name: 'Kraken',

        // full exchange name displayed in the filter popup
        desc: 'Kraken bitcoin exchange',
    },
    ],
    symbols_types: [{
        name: 'crypto',

        // `symbolType` argument for the `searchSymbols` method, if a user selects this symbol type
        value: 'crypto',
    },
        // ...
    ],
};



export default {
    onReady: (callback) => {
        console.log('[onReady]: Method call');
        setTimeout(() => callback(configurationData));
    },


    resolveSymbol: async (
        symbolName,
        onSymbolResolvedCallback,
        onResolveErrorCallback,
    ) => {
        console.log('[resolveSymbol]: Method call', symbolName);

        const symbolInfo = {
            ticker: symbolName,
            name: symbolName,
            description: symbolName,
            type: symbolName,
            session: '24x7',
            timezone: 'Etc/UTC',
            exchange: "Zenith",
            minmov: 1,
            pricescale: 100,
            has_intraday: true,
            has_no_volume: true,
            has_weekly_and_monthly: false,
            supported_resolutions: configurationData.supported_resolutions,
            volume_precision: 2,
            data_status: 'streaming',
        };

        console.log('[resolveSymbol]: Symbol resolved', symbolName);
        onSymbolResolvedCallback(symbolInfo);
    },

    getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
        const { from, to, firstDataRequest } = periodParams;
        console.log('[getBars]: Method call', symbolInfo, resolution, from, to);
        // const parsedSymbol = parseFullSymbol(symbolInfo.full_name);

        try {
            // const data = tradedata
            const data = await makeApiDataRequest(resolution)
  
            if (data.Response && data.Response === 'Error' || data.length === 0) {
                // "noData" should be set if there is no data in the requested period.
                console.log("hero")
                onHistoryCallback([], {
                    noData: true,
                });
                return;
            }
            let bars = [];
            data.forEach(bar => {
                let date = new Date(bar.Date)
                let time = Math.floor(date.getTime() / 1000)
                if (time >= from && time < to) {
                    bars = [...bars, {
                        time: time * 1000,
                        low: bar.Low,
                        high: bar.High,
                        open: bar.Open,
                        close: bar.Close,
                    }];
                }
            });
            if (firstDataRequest) {
                lastBarsCache.set(symbolInfo.name, {
                    ...bars[bars.length - 1],
                });
            }
            console.log(`[getBars]: returned ${bars.length} bar(s)`);
            if (bars.length==0){
                onHistoryCallback([], {
                    noData: true,
                });
                return;
            }
            onHistoryCallback(bars, {
                noData: false,
            });
            
        } catch (error) {
            console.log('[getBars]: Get error', error);
            onErrorCallback(error);
        }
    },

    subscribeBars: (
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscribeUID,
        onResetCacheNeededCallback,
    ) => {
        console.log('[subscribeBars]: Method call with subscribeUID:', subscribeUID);
        subscribeOnStream(
            symbolInfo,
            resolution,
            onRealtimeCallback,
            subscribeUID,
            onResetCacheNeededCallback,
            lastBarsCache.get(symbolInfo.name),
        );
    },

    unsubscribeBars: (subscriberUID) => {
        console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
        unsubscribeFromStream(subscriberUID);
    },
};
