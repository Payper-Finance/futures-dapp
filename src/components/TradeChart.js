import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import am5themes_Responsive from "@amcharts/amcharts5/themes/Responsive";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5stock from "@amcharts/amcharts5/stock";
import $ from 'jquery'
import iO from 'socket.io-client'
import qs from 'qs'
import axios from 'axios';


const socket = iO('http://localhost:8000');



function TradeChart(props) {
  const [activecandle, setActivecandle] = useState("5minute")
  const chartRef = useRef(null);

  useLayoutEffect(() => {



    let root = am5.Root.new("chartdiv");
    const myTheme = am5.Theme.new(root);

    myTheme.rule("Candlestick").states.create("riseFromOpen", {
      fill: am5.color(0xECC89),
      stroke: am5.color(0xECC89)
    });

    myTheme.rule("Candlestick").states.create("dropFromOpen", {
      fill: am5.color(0xE01B3C),
      stroke: am5.color(0xE01B3C)
    });

    root.setThemes([
      am5themes_Dark.new(root),
      am5themes_Responsive.new(root),
      myTheme
    ]);

    let stockChart = root.container.children.push(
      am5stock.StockChart.new(root, {})
    );

    root.numberFormatter.set("numberFormat", "#,###.00");


    let mainPanel = stockChart.panels.push(
      am5stock.StockPanel.new(root, {
        wheelY: "zoomX",
        panX: true,
        panY: true
      })
    );

    let valueAxis = mainPanel.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {
          pan: "zoom"
        }),
        extraMin: 0.1,
        tooltip: am5.Tooltip.new(root, {}),
        numberFormat: "#,###.00",
        extraTooltipPrecision: 2
      })
    );

    let timeunit = "minute";
    if (activecandle == "hour") {
      timeunit = "hour"
    }
    else if (activecandle == "day") {
      timeunit = "day"
    }


    let dateAxis = mainPanel.xAxes.push(
      am5xy.GaplessDateAxis.new(root, {
        baseInterval: {
          timeUnit: timeunit,
          count: 1
        },
        renderer: am5xy.AxisRendererX.new(root, {}),
        tooltip: am5.Tooltip.new(root, {})
      })
    );


    let currentValueDataItem = valueAxis.createAxisRange(valueAxis.makeDataItem({ value: 0 }));
    let currentLabel = currentValueDataItem.get("label");
    if (currentLabel) {
      currentLabel.setAll({
        fill: am5.color(0xffffff),
        background: am5.Rectangle.new(root, { fill: am5.color(0x000000) }),
      })
    }

    let currentGrid = currentValueDataItem.get("grid");
    if (currentGrid) {
      currentGrid.setAll({ strokeOpacity: 0.5, strokeDasharray: [2, 5] });
    }


    let valueSeries = mainPanel.series.push(
      am5xy.CandlestickSeries.new(root, {
        clustered: false,
        valueXField: "Date",
        valueYField: "Close",
        highValueYField: "High",
        lowValueYField: "Low",
        openValueYField: "Open",
        calculateAggregates: true,
        xAxis: dateAxis,
        yAxis: valueAxis,
        legendValueText:
          "open: [bold]{openValueY}[/] high: [bold]{highValueY}[/] low: [bold]{lowValueY}[/] close: [bold]{valueY}[/]",
        legendRangeValueText: ""
      })
    );


    stockChart.set("stockSeries", valueSeries);


    let valueLegend = mainPanel.plotContainer.children.push(
      am5stock.StockLegend.new(root, {
        stockChart: stockChart,
        visible: false
      })
    );


    valueLegend.data.setAll([valueSeries]);

    mainPanel.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        yAxis: valueAxis,
        xAxis: dateAxis,
        snapToSeries: [valueSeries],
        snapToSeriesBy: "y!"
      })
    );

    let scrollbar = mainPanel.set(
      "scrollbarX",
      am5xy.XYChartScrollbar.new(root, {
        orientation: "horizontal",
        height: 50,
        visible: false
      })
    );
    stockChart.toolsContainer.children.push(scrollbar);

    let sbDateAxis = scrollbar.chart.xAxes.push(
      am5xy.GaplessDateAxis.new(root, {
        baseInterval: {
          timeUnit: timeunit,
          count: 1
        },
        renderer: am5xy.AxisRendererX.new(root, {
        })
      })
    );

    let sbValueAxis = scrollbar.chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {})
      })
    );

    let sbSeries = scrollbar.chart.series.push(
      am5xy.LineSeries.new(root, {
        valueYField: "Close",
        valueXField: "Date",
        xAxis: sbDateAxis,
        yAxis: sbValueAxis
      })
    );

    sbSeries.fills.template.setAll({
      visible: true,
      fillOpacity: 0.3
    });


    function loadData() {

      let data1 = qs.stringify({ "granularity": activecandle })
      axios.post('http://localhost:8000/granularity', data1, {
        headers: {
          'Content-Type': "application/x-www-form-urlencoded"
        }
      }).then(res => {
        let data = res.data
        let processor = am5.DataProcessor.new(root, {
          dateFields: ["Date"],
          dateFormat: "yyyy-MM-dd HH:mm:ss",
          numericFields: ["Open", "High", "Low", "Close"]
        });
        processor.processMany(data);

        console.log(data)
        valueSeries.data.setAll(data);
        sbSeries.data.setAll(data);
      }).catch(err => console.log(err))
    }

    loadData()


    let previousDate;

    const greet = (data) => {
      let valueSeries = stockChart.get("stockSeries");

      let lastDataObject = valueSeries.data.getIndex(valueSeries.data.length - 1);
      if (lastDataObject == undefined) {
        return
      }


      let high = lastDataObject.High;
      let low = lastDataObject.Low;
      let open = lastDataObject.Open;

      let value = data
      if (value > high) {
        high = value;
      }

      if (value < low) {
        low = value;
      }

      let dObj2 = {
        Date: lastDataObject.Date,
        Close: value,
        Open: open,
        Low: low,
        High: high
      };
      let processor = am5.DataProcessor.new(root, {
        dateFields: ["Date"],
        dateFormat: "yyyy-MM-dd HH:mm:ss",
        numericFields: ["Open", "High", "Low", "Close"]
      });
      processor.processMany(dObj2);

      console.log(valueSeries.data.length)
      valueSeries.data.setIndex(valueSeries.data.length - 1, dObj2);
      sbSeries.data.setIndex(sbSeries.data.length - 1, dObj2);
      console.log(valueSeries.data.getIndex(valueSeries.data.length - 1))
      // update current value
      if (currentLabel) {
        currentValueDataItem.animate({ key: "value", to: value, duration: 500, easing: am5.ease.out(am5.ease.cubic) });
        currentLabel.set("text", stockChart.getNumberFormatter().format(value));
        let bg = currentLabel.get("background");
        if (bg) {
          if (value < open) {
            bg.set("fill", root.interfaceColors.get("negative"));
          }
          else {
            bg.set("fill", root.interfaceColors.get("positive"));
          }
        }
      }
    }

    const insertvalue = (data) => {

      let date = Date.now();


      let valueSeries = stockChart.get("stockSeries");
      let lastDataObject = valueSeries.data.getIndex(valueSeries.data.length - 1);
      if (lastDataObject == undefined) {
        return
      }



      if (activecandle == "15minute") {
        if (((lastDataObject.Date - date) / 1000) < 900) {
          greet(data)
          return
        }
      }
      else if (activecandle == "hour") {
        if (((lastDataObject.Date - date) / 1000) < 3600) {
          greet(data)
          return
        }
      }
      else if (activecandle == "day") {
        if (((lastDataObject.Date - date) / 1000) < 86400) {
          greet(data)
          return
        }
      }

      let open = lastDataObject.Open;
      let value = data
      let dObj1 = {

        Date: date,
        Close: value,
        Open: value,
        Low: value,
        High: value
      };
      let processor = am5.DataProcessor.new(root, {
        dateFields: ["Date"],
        dateFormat: "yyyy-MM-dd HH:mm:ss",
        numericFields: ["Open", "High", "Low", "Close"]
      });
      processor.processMany(dObj1);
      valueSeries.data.push(dObj1);
      console.log(valueSeries.data)
      sbSeries.data.push(dObj1);
      previousDate = date;


      if (currentLabel) {
        currentValueDataItem.animate({ key: "value", to: value, duration: 500, easing: am5.ease.out(am5.ease.cubic) });
        currentLabel.set("text", stockChart.getNumberFormatter().format(value));
        let bg = currentLabel.get("background");
        if (bg) {
          if (value < open) {
            bg.set("fill", root.interfaceColors.get("negative"));
          }
          else {
            bg.set("fill", root.interfaceColors.get("positive"));
          }
        }
      }
    }


    socket.on("data4", (data) => {
      console.log(data)

      greet(data)
    })
    socket.on("data3", (data) => {
      console.log(data)
      insertvalue(data)
    })

    chartRef.current = stockChart;
    return () => {
      root.dispose();
    };
  }, [activecandle]);



  return (
    <>
      <style>{`

#chartcontrols {
    height: auto;
    padding: 5px 5px 0 16px;
    position: relative;
  }
  

  #chartdiv {
    width: 100%;
    height: 55vh;
    max-width: 100%;
    position: relative;
  }

  .am5stock-control-button {
    box-sizing: border-box;
    max-height: 200px;
    font-size:12px;
    opacity:1;
  }
  .am5stock-control-button{
    box-sizing: border-box;
    max-height: 200px;
  }
  .am5stock .am5stock-control-list-container{
    position:absolute;
    top:-11px;
    left:-2px;
    z-index:1;
    min-height:100%;
    box-sizing:border-box;
    display:flex !important;
  }

  .am5stock-control-list{
    display:flex !important;
  }
  .am5stock-control-list-arrow{
    display:none;
  }

  .am5stock-control-drawing-tools{
    display: block;
  position: absolute;
    display:none
  }
  .am5stock-control-dropdown{
    font-size:12px;
  }
  .am5stock-link {
    color:white;
    text-decoration:none;
  }
  .active{
    background :#281e3d;
    
  }
  .logohide{
    margin-top:-19px;
    position: absolute;
    width:60px;
    height:15px;
    background:#000614;
    z-index:1;
  }
  .candletime{
    margin:0 8px;
    min-width:60px;
    border-radius:5px;
    color:white;
    border:none;
    background:none;
  }
  .active{
    background:#59219d;
  }
@media screen and (max-width:766px) and (min-width:270px){
  #chartdiv {
    width: 100%;
    height: 40vh;
    max-width: 100%;
    position: relative;
  }
}

      `}</style>
      <ul className='candletimediv'>
        <button className={`${activecandle == '5minute' ? 'active' : ''} candletime`} onClick={() => setActivecandle("5minute")} >5min</button>
        <button className={`${activecandle == '15minute' ? 'active' : ''} candletime`} onClick={() => setActivecandle("15minute")} >15min</button>
        <button className={`${activecandle == 'hour' ? 'active' : ''} candletime`} onClick={() => setActivecandle("hour")}>Hour</button>
        <button className={`${activecandle == 'day' ? 'active' : ''} candletime`} onClick={() => setActivecandle("day")}>Day</button>
      </ul>

      <div id="chartcontrols1"></div>
      <div id="chartdiv"></div>
      <span className='logohide'></span>

    </>
  );
}

export default TradeChart;

$(document).ready(function () {
  $(".am5stock-list-item").last().addClass("active");
  $(".am5stock-list-item").click(function () {
    $(".am5stock-list-item").removeClass("active");
    $(this).addClass("active");
  });
});