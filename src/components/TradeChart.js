// import React, { useRef, useLayoutEffect, useState, useEffect,useContext } from 'react';
// import am5themes_Responsive from "@amcharts/amcharts5/themes/Responsive";
// import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
// import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
// import * as am5 from "@amcharts/amcharts5";
// import * as am5xy from "@amcharts/amcharts5/xy";
// import * as am5stock from "@amcharts/amcharts5/stock";
// import $ from 'jquery'
// import iO from 'socket.io-client'
// import qs from 'qs'
// import axios from 'axios';
// import Position from './Position';
// import UserContext from '../ContextProvider';

// const socket = iO('https://zenith-api-l8hhy.ondigitalocean.app/');



// function TradeChart(props) {
//   const {Theme} = useContext(UserContext)
//   const [activecandle, setActivecandle] = useState("5minute")
//   const chartRef = useRef(null);

//   useLayoutEffect(() => {



//     let root = am5.Root.new("chartdiv");
//     const myTheme = am5.Theme.new(root);
    
//     myTheme.rule("Candlestick").states.create("riseFromOpen", {
//       fill: am5.color(0xECC89),
//       stroke: am5.color(0xECC89)
//     });
    
//     myTheme.rule("Candlestick").states.create("dropFromOpen", {
//       fill: am5.color(0xE01B3C),
//       stroke: am5.color(0xE01B3C)
//     });
//     {
//       Theme=="Light"?(
//         root.setThemes([
//           am5themes_Responsive.new(root),
//           am5themes_Animated.new(root),
//           myTheme
//         ])
//       ):(
//         root.setThemes([
//           am5themes_Dark.new(root),
//           am5themes_Responsive.new(root),
//           am5themes_Animated.new(root),
//           myTheme
//         ])
//   )
//     }
  
    

//     let stockChart = root.container.children.push(
//       am5stock.StockChart.new(root, {})
//     );

//     root.numberFormatter.set("numberFormat", "#,###.000");

//     let mainPanel = stockChart.panels.push(
//       am5stock.StockPanel.new(root, {
//         wheelY: "zoomX",
//         panX: true,
//         panY: true,
        
//       })
//     );

//     let valueAxis = mainPanel.yAxes.push(
//       am5xy.ValueAxis.new(root, {
//         renderer: am5xy.AxisRendererY.new(root, {
//           pan: "zoom"
//         }),
//         maxPrecision: 3,
//         tooltip: am5.Tooltip.new(root, {}),
//         numberFormat: "#,###.000",
//         extraTooltipPrecision: 3
//       })
//     );

//     let timeunit = "minute";
//     if (activecandle == "hour") {
//       timeunit = "hour"
//     }
//     else if (activecandle == "day") {
//       timeunit = "day"
//     }


//     let dateAxis = mainPanel.xAxes.push(
//       am5xy.GaplessDateAxis.new(root, {
//         baseInterval: {
//           timeUnit: timeunit,
//           count: 1
//         },
//         renderer: am5xy.AxisRendererX.new(root, {}),
//         tooltip: am5.Tooltip.new(root, {})
//       })
//     );


//     let currentValueDataItem = valueAxis.createAxisRange(valueAxis.makeDataItem({ value: 0 }));
//     let currentLabel = currentValueDataItem.get("label");
//     if (currentLabel) {
//       currentLabel.setAll({
//         fill: am5.color(0xffffff),
//         background: am5.Rectangle.new(root, { fill: am5.color(0x000000) }),
//       })
//     }

//     let currentGrid = currentValueDataItem.get("grid");
//     if (currentGrid) {
//       currentGrid.setAll({ strokeOpacity: 0.5, strokeDasharray: [2, 5] });
//     }


//     let valueSeries = mainPanel.series.push(
//       am5xy.CandlestickSeries.new(root, {
//         clustered: false,
//         valueXField: "Date",
//         valueYField: "Close",
//         highValueYField: "High",
//         lowValueYField: "Low",
//         openValueYField: "Open",
//         calculateAggregates: true,
//         xAxis: dateAxis,
//         yAxis: valueAxis,
//         legendValueText:
//           "open: [bold]{openValueY}[/] high: [bold]{highValueY}[/] low: [bold]{lowValueY}[/] close: [bold]{valueY}[/]",
//         legendRangeValueText: ""
//       })
//     );


//     stockChart.set("stockSeries", valueSeries);


//     let valueLegend = mainPanel.plotContainer.children.push(
//       am5stock.StockLegend.new(root, {
//         stockChart: stockChart,
//         visible: true,
//         width:"200px",
//       })
//     );


//     valueLegend.data.setAll([valueSeries]);

//     mainPanel.set(
//       "cursor",
//       am5xy.XYCursor.new(root, {
//         yAxis: valueAxis,
//         xAxis: dateAxis,
//         snapToSeries: [valueSeries],
//         snapToSeriesBy: "y!"
//       })
//     );

//     let scrollbar = mainPanel.set(
//       "scrollbarX",
//       am5xy.XYChartScrollbar.new(root, {
//         orientation: "horizontal",
//         height: 50,
//         visible: false
//       })
//     );
//     stockChart.toolsContainer.children.push(scrollbar);

//     let sbDateAxis = scrollbar.chart.xAxes.push(
//       am5xy.GaplessDateAxis.new(root, {
//         baseInterval: {
//           timeUnit: timeunit,
//           count: 1
//         },
        
//         renderer: am5xy.AxisRendererX.new(root, {
//         })
//       })
//     );

//     let sbValueAxis = scrollbar.chart.yAxes.push(
//       am5xy.ValueAxis.new(root, {
//         renderer: am5xy.AxisRendererY.new(root, {})
//       })
//     );

//     let sbSeries = scrollbar.chart.series.push(
//       am5xy.LineSeries.new(root, {
//         valueYField: "Close",
//         valueXField: "Date",
//         xAxis: sbDateAxis,
//         yAxis: sbValueAxis
//       })
//     );

//     sbSeries.fills.template.setAll({
//       visible: true,
//       fillOpacity: 0.3
//     });


//     function loadData() {

//       let data1 = qs.stringify({ "granularity": activecandle })

//       axios.post('https://zenith-api-l8hhy.ondigitalocean.app/granularity', data1, {
//         headers: {
//           'Content-Type': "application/x-www-form-urlencoded"
//         }
//       }).then(res => {
//         let data = res.data
       
        
//         let processor = am5.DataProcessor.new(root, {
          
//           dateFields: ["Date"],
//           dateFormat: "yyyy.MM.dd G 'at' HH:mm:ss zzz",
//           numericFields: ["Open", "High", "Low", "Close"]
//         });

//         processor.processMany(data)
        
//         valueSeries.data.setAll(data);
//         sbSeries.data.setAll(data);
//       }).catch(err => console.log(err))
//     }

//     loadData()


//     let previousDate;

//     const greet = (data) => {
//       let valueSeries = stockChart.get("stockSeries");

//       let lastDataObject = valueSeries.data.getIndex(valueSeries.data.length - 1);
//       if (lastDataObject == undefined) {
//         return
//       }


//       let high = lastDataObject.High;
//       let low = lastDataObject.Low;
//       let open = lastDataObject.Open;

//       let value = data
//       if (value > high) {
//         high = value;
//       }

//       if (value < low) {
//         low = value;
//       }

//       let dObj2 = {
//         Date: lastDataObject.Date,
//         Close: value,
//         Open: open,
//         Low: low,
//         High: high
//       };
//       let processor = am5.DataProcessor.new(root, {
//         dateFields: ["Date"],
//         dateFormat: "yyyy-MM-dd HH:mm:ss",
//         numericFields: ["Open", "High", "Low", "Close"]
//       });
//       processor.processMany(dObj2);

//       console.log(valueSeries.data.length)
//       valueSeries.data.setIndex(valueSeries.data.length - 1, dObj2);
//       sbSeries.data.setIndex(sbSeries.data.length - 1, dObj2);
//       console.log(valueSeries.data.getIndex(valueSeries.data.length - 1))
//       // update current value
//       if (currentLabel) {
//         currentValueDataItem.animate({ key: "value", to: value, duration: 500, easing: am5.ease.out(am5.ease.cubic) });
//         currentLabel.set("text", stockChart.getNumberFormatter().format(value));
//         let bg = currentLabel.get("background");
//         if (bg) {
//           if (value < open) {
//             bg.set("fill", root.interfaceColors.get("negative"));
//           }
//           else {
//             bg.set("fill", root.interfaceColors.get("positive"));
//           }
//         }
//       }
//     }

//     const insertvalue = (data) => {

//       let date = Date.now();


//       let valueSeries = stockChart.get("stockSeries");
//       let lastDataObject = valueSeries.data.getIndex(valueSeries.data.length - 1);
//       if (lastDataObject == undefined) {
//         return
//       }



//       if (activecandle == "15minute") {
//         if (((lastDataObject.Date - date) / 1000) < 900) {
//           greet(data)
//           return
//         }
//       }
//       else if (activecandle == "hour") {
//         if (((lastDataObject.Date - date) / 1000) < 3600) {
//           greet(data)
//           return
//         }
//       }
//       else if (activecandle == "day") {
//         if (((lastDataObject.Date - date) / 1000) < 86400) {
//           greet(data)
//           return
//         }
//       }

//       let open = lastDataObject.Open;
//       let value = data
//       let dObj1 = {

//         Date: date,
//         Close: value,
//         Open: value,
//         Low: value,
//         High: value
//       };
//       let processor = am5.DataProcessor.new(root, {
//         dateFields: ["Date"],
//         dateFormat: "yyyy-MM-dd HH:mm:ss",
//         numericFields: ["Open", "High", "Low", "Close"]
//       });
//       processor.processMany(dObj1);
//       valueSeries.data.push(dObj1);
//       sbSeries.data.push(dObj1);
//       previousDate = date;


//       if (currentLabel) {
//         currentValueDataItem.animate({ key: "value", to: value, duration: 500, easing: am5.ease.out(am5.ease.cubic) });
//         currentLabel.set("text", stockChart.getNumberFormatter().format(value));
//         let bg = currentLabel.get("background");
//         if (bg) {
//           if (value < open) {
//             bg.set("fill", root.interfaceColors.get("negative"));
//           }
//           else {
//             bg.set("fill", root.interfaceColors.get("positive"));
//           }
//         }
//       }
//     }


//     socket.on("data4", (data) => {
//       console.log(data)

//       greet(data)
//     })
//     socket.on("data3", (data) => {
//       insertvalue(data)
//     })
//     // let toolbar = am5stock.StockToolbar.new(root, {
//     //   container: document.getElementById("chartcontrols"),
//     //   stockChart: stockChart,
//     //   controls: [
//     //     am5stock.IndicatorControl.new(root, {
//     //       stockChart: stockChart,
//     //       legend: valueLegend
//     //     }),
//     //     am5stock.DrawingControl.new(root, {
//     //       stockChart: stockChart
//     //     }),
//     //     am5stock.ResetControl.new(root, {
//     //       stockChart: stockChart
//     //     }),
//     //     am5stock.SettingsControl.new(root, {
//     //       stockChart: stockChart
//     //     })
//     //   ]
//     // })

//     chartRef.current = stockChart;
//     return () => {
//       root.dispose();
//     };
//   }, [activecandle,Theme]);



//   return (
//     <>
//       <style>{`

// #chartcontrols {
//   left: 450px;
//   position: absolute;
//   margin-top: -5px;
//   }


//   #chartdiv {
//     width: 100%;
//     height: 55vh;
//     max-width: 100%;
//     position: relative;
//   }

//   // .am5stock-control-button {
//   //   box-sizing: border-box;
//   //   max-height: 200px;
//   //   font-size:12px;
//   //   opacity:1;
//   // }
//   // .am5stock-control-button{
//   //   box-sizing: border-box;
//   //   max-height: 200px;
//   // }
//   // .am5stock .am5stock-control-list-container{
//   //   position:absolute;
//   //   top:-11px;
//   //   left:-2px;
//   //   z-index:1;
//   //   min-height:100%;
//   //   box-sizing:border-box;
//   //   display:flex !important;
//   // }

//   // .am5stock-control-list{
//   //   display:flex !important;
//   // }
//   // .am5stock-control-list-arrow{
//   //   display:none;
//   // }
//   .am5stock-control-list-container{
//     max-height: 350px;
//     overflow-y: scroll;
//   }
//   // .am5stock-control-drawing-tools{
//   //   display: block;
//   // position: absolute;
//   //   display:none
//   // }
//   // .am5stock-control-dropdown{
//   //   font-size:12px;
//   // }
//   .am5stock-link {
//     color:white;
//     text-decoration:none;
//   }
//   .active{
//     background :#281e3d;
//   }
//   .logohide{
//     margin-top:-19px;
//     position: absolute;
//     width:60px;
//     height:15px;
//     background:#000614;
//     z-index:1;
//   }
//   .candletime{
//     margin:0 8px;
//     min-width:60px;
//     border-radius:5px;
//     border:none;
//     background:none;
//   }
//   .active{
//     background:#59219d;
//   }
// @media screen and (max-width:766px) and (min-width:270px){
//   #chartdiv {
//     width: 100%;
//     height: 40vh;
//     max-width: 100%;
//     position: relative;
//   }
//   #chartcontrols {
//    display:none
//     }
// }

//       `}</style>
//       <ul className='candletimediv'>
//         <button style={Theme=="Light" && activecandle =='5minute'?{color:"black",background:"#c99eff"}:Theme=="Light"?{color:"black"}:{color:"aliceblue"}}  className={`${activecandle == '5minute'&& Theme!="Light" ? 'active' : ''} candletime`} onClick={() => setActivecandle("5minute")} >5min</button>
//         <button style={Theme=="Light" && activecandle =='15minute'?{color:"black",background:"#c99eff"}:Theme=="Light"?{color:"black"}:{color:"aliceblue"}} className={`${activecandle == '15minute'&& Theme!="Light" ? 'active' : ''} candletime`} onClick={() => setActivecandle("15minute")} >15min</button>
//         <button style={Theme=="Light" && activecandle =='hour'?{color:"black",background:"#c99eff"}:Theme=="Light"?{color:"black"}:{color:"aliceblue"}} className={`${activecandle == 'hour'&& Theme!="Light" ? 'active' : ''} candletime`} onClick={() => setActivecandle("hour")}>Hour</button>
//         <button style={Theme=="Light" && activecandle =='day'?{color:"black",background:"#c99eff"}:Theme=="Light"?{color:"black"}:{color:"aliceblue"}} className={`${activecandle == 'day' && Theme!="Light" ? 'active' : ''} candletime`} onClick={() => setActivecandle("day")}>Day</button>
//       </ul>

//       <div id="chartdiv"></div>
//       <span style={Theme=="Light"?{background:"aliceblue"}:{}} className='logohide'></span>

//     </>
//   );
// }

// export default TradeChart;

// $(document).ready(function () {
//   $(".am5stock-list-item").last().addClass("active");
//   $(".am5stock-list-item").click(function () {
//     $(".am5stock-list-item").removeClass("active");
//     $(this).addClass("active");
//   });
// });

// Datafeed implementation, will be added later
import Datafeed from '../chartDataFeed/datafeed.js';
import {useEffect, useLayoutEffect,useContext} from 'react';
import {widget} from '../charting_library/'
import UserContext from "../ContextProvider.js";

export default function TradeChart() {
	const {Theme } = useContext(UserContext)

	useLayoutEffect(()=> {
		let tvWidget = new widget({
			symbol: 'Zenith:XTZ/kUSD', // default symbol
			interval: '5', // default interval
			fullscreen: false, // displays the chart in the fullscreen mode
			container: 'tv_chart_container',
			datafeed: Datafeed,
			theme:Theme,
			library_path: '../charting_library/',
			loading_screen: { backgroundColor: `${Theme=="Dark"?"#000614":"#F0F8FF"}`,foregroundColor:"#000000"},
			toolbar_bg:`${Theme=="Dark"?"#000614":"#F0F8FF"}`,
			timezone:"Asia/Kolkata",
			disabled_features: ['use_localstorage_for_settings', 'header_symbol_search','header_compare'],
			custom_css_url:'css/my-custom-css.css',
			overrides: {
				"paneProperties.background":`${Theme=="Dark"?"#000614":"#F0F8FF"}`,
				"paneProperties.backgroundType": "solid",
				"mainSeriesProperties.candleStyle.upColor": "#1ecc89",
				"mainSeriesProperties.candleStyle.downColor": "#e01b3c",
				"symbolWatermarkProperties.transparency": 90,
				"scalesProperties.textColor" : "#AAA",
			},
			// logo: ""
			logo: {
				image: "../../public/img/Logo.png",
				link: "https://zenith.payperfi.com/"
			},
		
		});
	},[Theme])

	
		return (
			<>
			<style>{`
			// #tradingview_f5a94{
			// 	height:55vh !important;
			// 	width:100% !important
 			// }
			iframe{
				width:100%;
				height:68vh
			}
		
			html.theme-dark .group-3uonVBsm {
			  /* background-color: var(--tv-color-pane-background,#131722); */
			  background-color: #000614 !important;
			}
			

			`}</style>
			<div
				id="tv_chart_container"
				style={{height:"70vh"}}
				// className={ 'TVChartContainer' }
			/>
			</>
		);
	
}
