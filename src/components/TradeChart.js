
import React, { useRef, useLayoutEffect } from 'react';

import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Responsive from "@amcharts/amcharts5/themes/Responsive";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5stock from "@amcharts/amcharts5/stock";
import { Hidden } from '@mui/material';
import $ from 'jquery'


function TradeChart(props) {
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
    
    
    // Create a stock chart
    // -------------------------------------------------------------------------------
    // https://www.amcharts.com/docs/v5/charts/stock-chart/#Instantiating_the_chart
    let stockChart = root.container.children.push(am5stock.StockChart.new(root, {
    }));
    
    
    // Set global number format
    // -------------------------------------------------------------------------------
    // https://www.amcharts.com/docs/v5/concepts/formatters/formatting-numbers/
    root.numberFormatter.set("numberFormat", "#,###.00");
    
    
    // Create a main stock panel (chart)
    // -------------------------------------------------------------------------------
    // https://www.amcharts.com/docs/v5/charts/stock-chart/#Adding_panels
    let mainPanel = stockChart.panels.push(am5stock.StockPanel.new(root, {
      wheelY: "zoomX",
      panX: true,
      panY: true
    }));
    
    
    // Create value axis
    // -------------------------------------------------------------------------------
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    let valueAxis = mainPanel.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {
        pan: "zoom"
      }),
      extraMin: 0.1, // adds some space for for main series
      tooltip: am5.Tooltip.new(root, {}),
      numberFormat: "#,###.00",
      extraTooltipPrecision: 2
    }));
    
    let dateAxis = mainPanel.xAxes.push(am5xy.GaplessDateAxis.new(root, {
      baseInterval: {
        timeUnit: "day",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(root, {}),
      tooltip: am5.Tooltip.new(root, {})
    }));
    
    
    // Add series
    // -------------------------------------------------------------------------------
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/

    let valueSeries = mainPanel.series.push(am5xy.CandlestickSeries.new(root, {
      name: "MSFT",
      clustered: false,
      valueXField: "Date",
      valueYField: "Close",
      highValueYField: "High",
      lowValueYField: "Low",
      openValueYField: "Open",
      calculateAggregates: true,
      xAxis: dateAxis,
      yAxis: valueAxis,
      legendValueText: "open: [bold]{openValueY}[/] high: [bold]{highValueY}[/] low: [bold]{lowValueY}[/] close: [bold]{valueY}[/]",
      legendRangeValueText:""
    }));
    
    
    // Set main value series
    // -------------------------------------------------------------------------------
    // https://www.amcharts.com/docs/v5/charts/stock-chart/#Setting_main_series
    stockChart.set("stockSeries", valueSeries);
    
    
    // Add a stock legend
    // -------------------------------------------------------------------------------
    // https://www.amcharts.com/docs/v5/charts/stock-chart/stock-legend/
    let valueLegend = mainPanel.plotContainer.children.push(am5stock.StockLegend.new(root, {
      stockChart: stockChart
    }));
    
    
    // Create volume axis
    // -------------------------------------------------------------------------------
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    let volumeAxisRenderer = am5xy.AxisRendererY.new(root, {
      inside: false
    });
    
    volumeAxisRenderer.labels.template.set("forceHidden", false);
    volumeAxisRenderer.grid.template.set("forceHidden", false);

    let volumeValueAxis = mainPanel.yAxes.push(am5xy.ValueAxis.new(root, {
      forceHidden: true,
      numberFormat: "#.#a",
      height: am5.percent(20),
      y: am5.percent(100),
      centerY: am5.percent(100),
      renderer: volumeAxisRenderer
    }));
        
volumeValueAxis.get("renderer").grid.template.set("forceHidden", true);
volumeValueAxis.get("renderer").labels.template.set("forceHidden", true);
    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    let volumeSeries = mainPanel.series.push(am5xy.ColumnSeries.new(root, {

      name: "Volume",
      clustered: false,
      valueXField: "Date",
      valueYField: "Volume",
      xAxis: dateAxis,
      yAxis: volumeValueAxis,
      disabled:true,
      forceHidden: true,
      legendValueText: "[bold]{valueY.formatNumber('#,###.0a')}[/]"
    }));
    
    volumeSeries.columns.template.setAll({
      strokeOpacity: 0,
      fillOpacity: 0.0,
      disabled:true

    });
    
    // color columns by stock rules
    volumeSeries.columns.template.adapters.add("fill", function(fill, target) {
      let dataItem = target.dataItem;
      if (dataItem) {
        return stockChart.getVolumeColor(dataItem);
      }
      return fill;
    })
stockChart.set("volumeSeries", volumeSeries);
    
    
    // Set main series
    // -------------------------------------------------------------------------------
    // https://www.amcharts.com/docs/v5/charts/stock-chart/#Setting_main_series
    stockChart.set("volumeSeries", volumeSeries);
    // valueLegend.data.setAll([valueSeries, volumeSeries]);
    
    
    // Add cursor(s)
    // -------------------------------------------------------------------------------
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    mainPanel.set("cursor", am5xy.XYCursor.new(root, {
      yAxis: valueAxis,
      xAxis: dateAxis,
      snapToSeries: [valueSeries],
      snapToSeriesBy: "y!"
    }));
    
    
    // Add scrollbar
    // -------------------------------------------------------------------------------
    // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    let scrollbar = mainPanel.set("scrollbarX", am5xy.XYChartScrollbar.new(root, {
      orientation: "horizontal",
      height: 0,
      opacity:0.2,
      visible:false
    }));
 
    stockChart.toolsContainer.children.push(scrollbar);
    
    let sbDateAxis = scrollbar.chart.xAxes.push(am5xy.GaplessDateAxis.new(root, {
      baseInterval: {
        timeUnit: "day",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(root, {})
    }));
    
    let sbValueAxis = scrollbar.chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    }));
    
    let sbSeries = scrollbar.chart.series.push(am5xy.LineSeries.new(root, {
      valueYField: "Close",
      valueXField: "Date",
      xAxis: sbDateAxis,
      yAxis: sbValueAxis
    }));
    
    sbSeries.fills.template.setAll({
      visible: false,
      fillOpacity: 0.0
    });
    
    
    // Function that dynamically loads data
    function loadData(ticker, series, granularity) {
    
      // Load external data
      // https://www.amcharts.com/docs/v5/charts/xy-chart/series/#Setting_data
      am5.net.load("https://www.amcharts.com/wp-content/uploads/assets/docs/stock/" + ticker + "_" + granularity + ".csv").then(function(result) {
    
        // Parse loaded data
        let data = am5.CSVParser.parse(result.response, {
            delimiter: ",",
            skipEmpty: true,
            useColumnNames: true
        });
        console.log(data)
    
        // Process data (convert dates and values)
        let processor = am5.DataProcessor.new(root, {
          dateFields: ["Date"],
          dateFormat: granularity == "minute" ? "yyyy-MM-dd HH:mm:ss" : "yyyy-MM-dd",
          numericFields: ["Open", "High", "Low", "Close"]
        });
        processor.processMany(data);
    
        // Set data
        am5.array.each(series, function(item) {
            
          item.data.setAll(data);
        });
      });
    }
    
    // Load initial data for the first series
    let currentGranularity = "day";
    loadData("MSFT", [valueSeries, volumeSeries, sbSeries], currentGranularity);
    
    // Set up series type switcher
    // -------------------------------------------------------------------------------
    // https://www.amcharts.com/docs/v5/charts/stock/toolbar/series-type-control/
    let seriesSwitcher = am5stock.SeriesTypeControl.new(root, {
      stockChart: stockChart
    });
    
    seriesSwitcher.events.on("selected", function(ev) {
      setSeriesType(ev.item.id);
    });
    
    function getNewSettings(series) {
      let newSettings = [];
      am5.array.each(["name", "valueYField", "highValueYField", "lowValueYField", "openValueYField", "calculateAggregates", "valueXField", "xAxis", "yAxis", "legendValueText", "stroke", "fill"], function(setting) {
        newSettings[setting] = series.get(setting);
      });
      return newSettings;
    }
    
    function setSeriesType(seriesType) {
      // Get current series and its settings
      let currentSeries = stockChart.get("stockSeries");
    
      let newSettings = getNewSettings(currentSeries);
    
      // Remove previous series
      let data = currentSeries.data.values;
      mainPanel.series.removeValue(currentSeries);
    
      // Create new series
      let series;
      switch (seriesType) {
        case "line":
          series = mainPanel.series.push(am5xy.LineSeries.new(root, newSettings));
          break;
        case "candlestick":
        case "procandlestick":
          newSettings.clustered = false;
          series = mainPanel.series.push(am5xy.CandlestickSeries.new(root, newSettings));
          if (seriesType == "procandlestick") {
            series.columns.template.get("themeTags").push("pro");
          }
          break;
        case "ohlc":
          newSettings.clustered = false;
          series = mainPanel.series.push(am5xy.OHLCSeries.new(root, newSettings));
          break;
      }
    
      // Set new series as stockSeries
      if (series) {
        valueLegend.data.removeValue(currentSeries);
        series.data.setAll(data);
        stockChart.set("stockSeries", series);
        let cursor = mainPanel.get("cursor");
        if (cursor) {
          cursor.set("snapToSeries", [series]);
        }
        valueLegend.data.insertIndex(0, series);
      }
    }
    
    // Interval switcher
    // -------------------------------------------------------------------------------
    // https://www.amcharts.com/docs/v5/charts/stock/toolbar/interval-control/
    let intervalSwitcher = am5stock.IntervalControl.new(root, {
      stockChart: stockChart,
      items: [
        { id: "5 minute", label: "5 minute", interval: { timeUnit: "minute", count: 1 } },
        { id: "15 minute", label: "15 minutes", interval: { timeUnit: "minute", count: 15 } },
        { id: "1 hour", label: "1 hour", interval: { timeUnit: "hour", count: 1 } },
        { id: "1 day", label: "1 day", interval: { timeUnit: "day", count: 1 } },
     
      ]
      // items: [
      //   { id: "1 minute", label: "1 minute", interval: { timeUnit: "minute", count: 1 } },
      //   { id: "1 day", label: "1 day", interval: { timeUnit: "day", count: 1 } },
      //   { id: "1 week", label: "1 week", interval: { timeUnit: "week", count: 1 } },
      //   { id: "1 month", label: "1 month", interval: { timeUnit: "month", count: 1 } }
      // ]
    });
    
    // intervalSwitcher.events.on("selected", function(ev) {
    //   // Determine selected granularity
    //   currentGranularity = ev.item.interval.timeUnit;
    //   console.log(currentGranularity)
      
    //   // Get series
    //   let valueSeries = stockChart.get("stockSeries");
    //   let volumeSeries = stockChart.get("volumeSeries");
    
    //   // Set up zoomout
    //   valueSeries.events.once("datavalidated", function() {
    //     mainPanel.zoomOut();
    //   });
    
    //   // Load data for all series (main series + comparisons)
    //   // let promises = [];
    //   // promises.push(loadData("XTZ", [valueSeries, volumeSeries, sbSeries], currentGranularity));
    //   // am5.array.each(stockChart.getPrivate("comparedSeries", []), function(series) {
    //   //   promises.push(loadData(series.get("name"), [series], currentGranularity));
    //   // });
    
    //   // Once data loading is done, set `baseInterval` on the DateAxis
    //   Promise.all(promises).then(function() {
    //     dateAxis.set("baseInterval", ev.item.interval);
    //     sbDateAxis.set("baseInterval", ev.item.interval);
    //   });
    // });
    
intervalSwitcher.events.on("selected", function(ev) {
  // Determine selected granularity
  currentGranularity = ev.item.interval.timeUnit;
  
  // Get series
  let valueSeries = stockChart.get("stockSeries");
  let volumeSeries = stockChart.get("volumeSeries");

  // Set up zoomout
  valueSeries.events.once("datavalidated", function() {
    mainPanel.zoomOut();
  });

  // Load data for all series (main series + comparisons)
  let promises = [];
  promises.push(loadData("MSFT", [valueSeries, volumeSeries, sbSeries], currentGranularity));
  am5.array.each(stockChart.getPrivate("comparedSeries", []), function(series) {
    promises.push(loadData(series.get("name"), [series], currentGranularity));
  });

  // Once data loading is done, set `baseInterval` on the DateAxis
  Promise.all(promises).then(function() {
    dateAxis.set("baseInterval", ev.item.interval);
    sbDateAxis.set("baseInterval", ev.item.interval);
  });
});
    
    // Stock toolbar
    // -------------------------------------------------------------------------------
    // https://www.amcharts.com/docs/v5/charts/stock/toolbar/
    let toolbar = am5stock.StockToolbar.new(root, {
      container: document.getElementById("chartcontrols1"),
      stockChart: stockChart,
      controls: [
   
        // am5stock.DateRangeSelector.new(root, {
        //   stockChart: stockChart
        // }),

        intervalSwitcher,
        // seriesSwitcher,
        // am5stock.DrawingControl.new(root, {
        //   stockChart: stockChart
        // }),
        // am5stock.ResetControl.new(root, {
        //   stockChart: stockChart
        // }),
   
      ]
    })
    

chartRef.current = stockChart;
    return () => {
      root.dispose();
    };
  }, []);

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
    height: 48vh;
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
  
@media screen and (max-width:766px) and (min-width:270px){
  #chartdiv {
    width: 100%;
    height: 40vh;
    max-width: 100%;
    position: relative;
  }
}

      `}</style>

      
    <div id="chartcontrols1"></div>
    <div id="chartdiv"></div>
    <span className='logohide'></span>

    </>
  );
}

export default TradeChart;
    
$(document).ready(function() {
  $( ".am5stock-list-item" ).last().addClass( "active" );
  $(".am5stock-list-item").click(function () {
      $(".am5stock-list-item").removeClass("active");
      $(this).addClass("active");     
  });
});