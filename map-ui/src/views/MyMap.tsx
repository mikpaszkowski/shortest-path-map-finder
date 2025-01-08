import "./map.css";
import { Map as MapGL } from "react-map-gl/maplibre";
import { INITIAL_VIEW_STATE, MAP_STYLE_CONFIG } from "../config";
import { ScatterplotLayer } from "@deck.gl/layers";
import DeckGL, { PickingInfo } from "deck.gl";
import { MjolnirGestureEvent } from "mjolnir.js";
import { getNearestPoint } from "../services/pointService";
import React, { useEffect } from "react";

interface Point {
  color: number[];
  lineColor: number[];
  coordinates: number[];
}

const MyMap = () => {
  const [startPoint, setStartPoint] = React.useState<Point>();
  const [endPoint, setEndPoint] = React.useState<Point>();
  
  const mapClick = async (info: PickingInfo, event: MjolnirGestureEvent) => {
    if (!info.coordinate) {
      throw new Error("No coordinate found");
    }
    const coordinatesResponse = await getNearestPoint(
      info.coordinate[1],
      info.coordinate[0]
    );
    if(!startPoint) {
      setStartPoint({
        color: [152, 255, 152],
        lineColor: [0, 0, 0],
        coordinates: [
          coordinatesResponse.longitude,
          coordinatesResponse.latitude,
        ],
      });
    }else {
      setEndPoint({
        color: [255, 152, 152],
        lineColor: [0, 0, 0],
        coordinates: [
          coordinatesResponse.longitude,
          coordinatesResponse.latitude,
        ],
      });
    }
  };

  useEffect(() => {
    if (startPoint) {
    console.log(startPoint);
    }
  }, [startPoint]);

  const layer = new ScatterplotLayer({
    id: "ScatterplotLayer",
    data: [
      ...(startPoint ? [startPoint] : []),
      ...(endPoint ? [endPoint] : []),
    ],
    pickable: true,
    opacity: 1,
    stroked: true,
    filled: true,
    radiusScale: 1,
    radiusMinPixels: 7,
    radiusMaxPixels: 20,
    lineWidthMinPixels: 1,
    lineWidthMaxPixels: 3,
    getPosition: (d) => d.coordinates,
    getFillColor: (d) => d.color,
    getLineColor: (d) => d.lineColor,
  });

  return (
    <DeckGL 
    initialViewState={INITIAL_VIEW_STATE} 
    controller 
    onClick={mapClick}
    layers={[layer]}>
      <MapGL
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE_CONFIG}
      />
    </DeckGL>
  );
};

export default MyMap;
