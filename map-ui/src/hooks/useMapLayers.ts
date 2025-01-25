import { PolygonLayer, ScatterplotLayer, TripsLayer } from "deck.gl";
import { IWayPath } from "../services/pointService";
import { Point } from "../views/MyMap";

export interface IRadius {
  contour: number[][];
}

export interface IUseMapLayerProps {
  startPoint: Point | undefined;
  endPoint: Point | undefined;
  intermediatePoints: Point[];
  selectionRadius: IRadius[];
  path: IWayPath | undefined;
}

export const useMapLayers = ({
  startPoint,
  endPoint,
  intermediatePoints,
  selectionRadius,
  path,
}: IUseMapLayerProps) => {
  const startEndPointsLayer = new ScatterplotLayer({
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
    radiusMaxPixels: 30,
    lineWidthMinPixels: 1,
    lineWidthMaxPixels: 2,
    getPosition: (d) => d.coordinates,
    getFillColor: (d) => d.color,
    getLineColor: (d) => d.lineColor,
  });

  const intermediatePointsLayer = new ScatterplotLayer({
    id: "ScatterplotLayer",
    data: [...intermediatePoints],
    pickable: true,
    opacity: 1,
    stroked: true,
    filled: true,
    radiusScale: 1,
    radiusMinPixels: 7,
    radiusMaxPixels: 30,
    lineWidthMinPixels: 1,
    lineWidthMaxPixels: 2,
    getPosition: (d) => d.coordinates,
    getFillColor: (d) => d.color,
    getLineColor: (d) => d.lineColor,
  });

  const radiusLayer = new PolygonLayer<IRadius>({
    id: "PolygonLayer",
    data: selectionRadius,

    getPolygon: (d: IRadius) => d.contour,
    getFillColor: (d: IRadius) => [33, 150, 243, 30],
    getLineColor: [33, 150, 243],
    getLineWidth: 10,
    lineWidthMinPixels: 1,
    pickable: true,
    stroked: true,
    opacity: 0.4,
  });

  const tripLayer = new TripsLayer<IWayPath>({
    id: "TripsLayer",
    data: [...(path ? [path] : [])],
    getPath: (d: IWayPath) => d.waypoints.map((p) => [p.longitude, p.latitude]),
    // Timestamp is stored as float32, do not return a long int as it will cause precision loss
    // getTimestamps: (d: DataType) => d.waypoints.map(p => p.timestamp - 1554772579000),
    getColor: [21, 101, 192],
    // currentTime: 500,
    trailLength: 600,
    capRounded: true,
    jointRounded: true,
    widthMinPixels: 8,
  });

  return [tripLayer, startEndPointsLayer, intermediatePointsLayer, radiusLayer];
};
