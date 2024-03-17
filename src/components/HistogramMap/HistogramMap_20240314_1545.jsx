import React, { useEffect, useRef, useState, useContext } from 'react';
import * as d3 from 'd3';
import HistogramData from './histogramdata.json'
import UserHistogramData from './userhistogramdata.json'
import { useButtonContext } from '../ButtonContext/ButtonContext';
import { useUserContext } from '../UserContext/UserContext';

const aggregateDataByMonth = (data) => {
  const aggregatedData = {};

  data.forEach((entry) => {
    const month = entry.timestamp.split('/')[0];
    if (!aggregatedData[month]) {
      aggregatedData[month] = {
        timestamp: `${month}/${entry.timestamp.split('/')[1]}/${entry.timestamp.split('/')[2]}`,
        Total: 0,
        Cloudiness: 0,
        Lightning: 0,
        Icy_Conditions: 0,
        Hail: 0,
        Fog: 0,
        Rain: 0,
        Snow: 0,
        Snow_Cover: 0,
        Tornado: 0,
        Wind: 0,
      };
    }

    // Update each weather condition with the maximum value
    Object.keys(aggregatedData[month]).forEach((condition) => {
      if (condition !== 'timestamp') {
        aggregatedData[month][condition] = Math.max(
          aggregatedData[month][condition],
          entry[condition]
        );
      }
    });
  });

  return Object.values(aggregatedData);
};

const aggregateUserDataByMonth = (data) => {
  const aggregatedData = {};

  data.forEach((entry) => {
    const month = entry.timestamp.split('/')[0];
    if (!aggregatedData[month]) {
      aggregatedData[month] = {
        timestamp: `${month}/${entry.timestamp.split('/')[2]}`,
        Total: 0,
        Cloudiness: 0,
        Lightning: 0,
        Icy_Conditions: 0,
        Hail: 0,
        Fog: 0,
        Rain: 0,
        Snow: 0,
        Snow_Cover: 0,
        Tornado: 0,
        Wind: 0,
      };
    }

    aggregatedData[month].Total += entry.freq;

    if (entry.category in aggregatedData[month]) {
      aggregatedData[month][entry.category] += entry.freq;
    }
  });

  const result = Object.values(aggregatedData);

  return result;
};

const HistogramMap = ({ }) => {
  const { selectedButton } = useButtonContext();
  const { selectedUserName } = useUserContext();

  const chartRef = useRef();
  const [selectedCondition, setSelectedCondition] = useState('Total');
  const [aggregatedData, setAggregatedData] = useState([]);

  useEffect(() => {
    if (selectedUserName === 'noUser') {
      setAggregatedData(aggregateDataByMonth(HistogramData));
    } else {
      const filteredHistogramData = UserHistogramData.filter(
        (entry) => entry.username === selectedUserName
      );
      setAggregatedData(aggregateUserDataByMonth(filteredHistogramData));
    }

  }, [HistogramData, UserHistogramData, selectedUserName, selectedButton]);

  useEffect(() => {
    if (!aggregatedData.length) return;

    console.log(aggregatedData)

    const totalWidth = 564;
    const height = 292;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 40;

    const svg = d3.select(chartRef.current)

    const x = d3.scaleBand()
      .domain(d3.map(aggregatedData, d => d.timestamp))
      .range([marginLeft, totalWidth - marginRight])
      .padding(0);

    const y = d3.scaleLinear()
      .domain([0, d3.max(aggregatedData, d => d[selectedButton]) + 10])
      .range([height - marginBottom, marginTop]);

    // Update existing axes
    svg.select('.x-axis').remove();
    svg.select('.y-axis').remove();

    svg.attr("width", totalWidth)
      .attr("height", height)
      .call(zoom);

    const bars = svg.selectAll('.bars').data(aggregatedData);

    // Enter selection
    bars.enter()
      .append("g")
      .attr("class", "bars")
      .append("rect")
      .attr("fill", "cornflowerblue")
      .attr("x", d => x(d.timestamp))
      .attr("y", d => y(d[selectedButton] + 20))
      .attr("height", d => y(0) - y(d[selectedButton]))
      .attr("width", x.bandwidth());

    // Update selection (to handle transitions)
    bars.select("rect")
      .transition()
      .duration(500)
      .attr("x", d => x(d.timestamp))
      .attr("y", d => y(d[selectedButton] + 20))
      .attr("height", d => y(0) - y(d[selectedButton]))
      .attr("width", x.bandwidth());

    // Exit selection
    bars.exit().remove();

    // Append x-axis
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

    svg.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove());

    function zoom(svg) {
      const extent = [[marginLeft, marginTop], [totalWidth - marginRight, height - marginTop]];

      svg.call(d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent(extent)
        .extent(extent)
        .on("zoom", zoomed));

      function zoomed(event) {
        x.range([marginLeft, totalWidth - marginRight].map(d => event.transform.applyX(d)));
        svg.selectAll(".bars rect").attr("x", d => x(d.timestamp)).attr("width", x.bandwidth());
        svg.selectAll(".x-axis").call(d3.axisBottom(x).tickSizeOuter(0));
      }
    }
  }, [aggregatedData, selectedButton, useButtonContext, useUserContext, selectedUserName]);

  const handleToggle = (condition) => {
    setSelectedCondition(condition);
  };

  return <svg ref={chartRef}></svg>;
}

export default HistogramMap;