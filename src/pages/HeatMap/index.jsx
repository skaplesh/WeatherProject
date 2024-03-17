import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import SwitzerlandChoropleth from "../../components/HeatMapRep";
import data from "../../components/SwitzerlandChoropleth/severity-data.json";
import { useSelector } from "react-redux";
import { convertAndFilterData } from "./utils";
import CategorySelectorHorizontal from "../../components/selection/sidebar/CategorySelectorHorizontal";
import "../../static/style/sidebar.css"
import RightSideBar from "./RightSideBar/RightSideBar";
import DAroow from "../../static/images/darrow.svg";
import { Rotate90DegreesCcw } from "@mui/icons-material";

const CustomAEButton = styled(Button)({
  boxShadow: 'none',
  textTransform: 'none',
  width: 148,
  fontSize: 14,
  padding: '8px 12px',
  marginBottom: '8px',
  marginRight: '8px',
  border: '1px solid',
  lineHeight: 1.5,
  backgroundColor: 'transparent',
  borderColor: '#FFF',
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  '&:hover': {
    backgroundColor: '#2F4356',
    borderColor: '#2F4356',
    boxShadow: 'none',
  },
  '&:active': {
    boxShadow: 'none',
    backgroundColor: '#FFF',
    borderColor: '#FFF',
  },
  '&:focus': {
    boxShadow: '0 0 0 0.2rem rgba(0,123,255,.5)',
  },
});

const SwitzerlandMap = () => {
  const [startTime, endTime] = useSelector(
    (state) => state.savings.current.timeRange
  );

  const filteredData = useMemo(() => {
    return convertAndFilterData(data, startTime, endTime);
  }, [startTime, endTime]);

  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="App map-boxes map-boxes-heatmap" style={{ overflow: "hidden" }}>
      <h1 className='cell-header'>Severity by canton</h1>
      <div id="ae-main-temp">
        <div className="ae-main-header">
          {/* <Link to="/netmap">
            <CustomAEButton variant="contained">Network Map</CustomAEButton>
          </Link> */}
          {/* <Link to="/heatnet">
            <CustomAEButton variant="contained">HeatNet Map</CustomAEButton>
          </Link> */}
        </div>
        <div className="ae-main-map-body" id="ae-heatmap-map-blend-mode">
          {/* <CategorySelectorHorizontal /> */}
          <div id="Map" className="heatmap-map-main" style={{ position: "relative" }}>
            <button id="toggleButtonHeatmap" onClick={toggleSidebar}>{sidebarVisible ? <img style={{ width: 12, transform: 'rotate(180deg)' }} src={DAroow} alt="" /> : <img style={{ width: 12 }} src={DAroow} alt="" />}</button>
            <SwitzerlandChoropleth data={filteredData} />
          </div>
          <RightSideBar data={sidebarVisible} />
        </div>
      </div>
    </div>
  );
};

export default SwitzerlandMap;