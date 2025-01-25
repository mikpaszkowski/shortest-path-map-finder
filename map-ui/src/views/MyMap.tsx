import "./map.css";
import { Map as MapGL } from "react-map-gl/maplibre";
import { INITIAL_VIEW_STATE, MAP_STYLE_CONFIG } from "../config";
import DeckGL, { PickingInfo, TripsLayer } from "deck.gl";
import { MjolnirGestureEvent } from "mjolnir.js";
import InfoIcon from "@mui/icons-material/InfoOutlined";

import { getNearestPoint, IWayPath, IWayPoint } from "../services/pointService";
import React from "react";
import { Alert, Container, LinearProgress, Typography } from "@mui/material";
import { useBtnPressed } from "../hooks/useBtnPressed";
import { RoutePreference } from "./types";
import { createGeoJSONCircle } from "../utils/util";
import { PathFormInterface } from "./components/PathFormInterface";
import { ResultContainer } from "./components/ResultContainer";
import { IRadius, useMapLayers } from "../hooks/useMapLayers";

export interface Point {
  id: number;
  color: number[];
  lineColor: number[];
  coordinates: number[];
}

type PointType = "start" | "end" | "intermediate";

const getPointColorByType = (type: PointType): number[] => {
  if (type === "start") {
    return [152, 255, 152];
  } else if (type === "end") {
    return [255, 152, 152];
  } else if (type === "intermediate") {
    return [255, 255, 152];
  } else {
    return [255, 255, 255];
  }
};

const MyMap = () => {
  const [startPoint, setStartPoint] = React.useState<Point>();
  const [endPoint, setEndPoint] = React.useState<Point>();
  const [path, setPath] = React.useState<IWayPath>();
  const [loading, setLoading] = React.useState(false);
  const [intermediatePoints, setIntermediatePoints] = React.useState<Point[]>(
    []
  );
  const [selectionRadius, setSelectionRadius] = React.useState<IRadius[]>([
    {
      contour: [[]],
    },
  ]);
  const [cost, setCost] = React.useState<number>(0);
  const [resultShortestPathMode, setResultShortestPathMode] =
    React.useState<RoutePreference>(RoutePreference.DISTANCE);

  const { isCtrlPressed } = useBtnPressed("Meta");

  const createRadiusAroundPoint = (point: IWayPoint) => {
    const circle = createGeoJSONCircle([point.longitude, point.latitude], 0.5);
    setSelectionRadius([{ contour: circle }]);
  };

  const mapPointResponseToPoint = (
    response: IWayPoint,
    type: PointType
  ): Point => {
    const pointColor = getPointColorByType(type);
    return {
      id: response.id,
      color: pointColor,
      lineColor: [0, 0, 0],
      coordinates: [response.longitude, response.latitude],
    };
  };

  const resetForm = () => {
    setStartPoint(undefined);
    setEndPoint(undefined);
    setIntermediatePoints([]);
    setPath(undefined);
    setCost(0);
    setResultShortestPathMode(RoutePreference.DISTANCE);
  };

  const hasNoStartOrEnd = !startPoint || !endPoint;
  const isAboutToCreateIntermediatePoint = isCtrlPressed && startPoint;
  const isAboutToSelectEndPoint = startPoint && !endPoint && !isCtrlPressed;

  const mapClick = async (info: PickingInfo, event: MjolnirGestureEvent) => {
    if (loading) return;

    if (!info.coordinate) {
      throw new Error("No coordinate found");
    }

    const latitude = info.coordinate[1];
    const longitude = info.coordinate[0];

    if (isAboutToCreateIntermediatePoint) {
      setLoading(true);
      const intermediatePoint = await getNearestPoint(latitude, longitude);
      const point = mapPointResponseToPoint(intermediatePoint, "intermediate");
      setIntermediatePoints((prevState) => {
        return [...prevState, point];
      });
    }

    if (hasNoStartOrEnd) {
      setLoading(true);
      const coordinatesResponse = await getNearestPoint(latitude, longitude);
      const point = mapPointResponseToPoint(
        coordinatesResponse,
        startPoint ? "end" : "start"
      );
      if (!startPoint) {
        createRadiusAroundPoint(coordinatesResponse);
        setStartPoint(point);
      }
      if (isAboutToSelectEndPoint) {
        setEndPoint(point);
      }
    }
    setLoading(false);
  };

  const mapLayers = useMapLayers({
    startPoint,
    endPoint,
    intermediatePoints,
    selectionRadius,
    path,
  });

  return (
    <>
      <div
        onKeyDownCapture={(e) => console.log(e)}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
      >
        <PathFormInterface
          resetForm={resetForm}
          setResultShortestPathMode={setResultShortestPathMode}
          setLoading={setLoading}
          setPath={setPath}
          setCost={setCost}
          isLoading={loading}
          startPoint={startPoint}
          endPoint={endPoint}
          intermediatePoints={intermediatePoints}
        />
        <ResultContainer
          resultShortestPathMode={resultShortestPathMode}
          cost={cost}
        />
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller
          onClick={mapClick}
          layers={mapLayers}
        >
          <MapGL
            style={{ width: "100%", height: "100%" }}
            mapStyle={MAP_STYLE_CONFIG}
          />
        </DeckGL>
        {isCtrlPressed ? (
          <Alert
            icon={<InfoIcon fontSize="inherit" />}
            severity="info"
            sx={{ position: "absolute", top: 10, right: "50%", zIndex: 1 }}
          >
            <Typography fontSize={16}>Intermediate points mode</Typography>
          </Alert>
        ) : null}
        <Container
          sx={{
            position: "absolute",
            height: "20px",
            zIndex: 111,
          }}
        >
          {loading && <LinearProgress />}
        </Container>
      </div>
    </>
  );
};

export default MyMap;
