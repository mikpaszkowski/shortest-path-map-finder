import "./map.css";
import { Map as MapGL } from "react-map-gl/maplibre";
import { INITIAL_VIEW_STATE, MAP_STYLE_CONFIG } from "../config";
import { PolygonLayer, ScatterplotLayer } from "@deck.gl/layers";
import DeckGL, { PickingInfo, TripsLayer } from "deck.gl";
import { MjolnirGestureEvent } from "mjolnir.js";
import RouteIcon from "@mui/icons-material/RouteOutlined";
import InfoIcon from "@mui/icons-material/InfoOutlined";

import {
  getNearestPoint,
  getShortestPath,
  getShortestPathWithIntermediatePoints,
  IWayPath,
} from "../services/pointService";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  FormLabel,
  LinearProgress,
  Link,
  Radio,
  Typography,
} from "@mui/material";
import { useBtnPressed } from "../hooks/useBtnPressed";
import { ImplementationMode, RoutePreference } from "./types";
import { createGeoJSONCircle } from "../utils/util";

interface Point {
  id: number;
  color: number[];
  lineColor: number[];
  coordinates: number[];
}

interface IRadius {
  contour: number[][];
}

const MyMap = () => {
  const [startPoint, setStartPoint] = React.useState<Point>();
  const [endPoint, setEndPoint] = React.useState<Point>();
  const [path, setPath] = React.useState<IWayPath>();
  const [loading, setLoading] = React.useState(false);
  const [shortestPathProfile, setShortestPathProfile] = React.useState(
    RoutePreference.DISTANCE
  );

  const [implMode, setImplMode] = React.useState(ImplementationMode.CUSTOM);

  const [intermediatePoints, setIntermediatePoints] = React.useState<Point[]>(
    []
  );
  const [selectionRadius, setSelectionRadius] = React.useState<IRadius[]>([{
    contour: [[]],
  }]);

  const { isCtrlPressed } = useBtnPressed("Meta");

  const mapClick = async (info: PickingInfo, event: MjolnirGestureEvent) => {
    // if (loading) return;
    if (!info.coordinate) {
      throw new Error("No coordinate found");
    }

    if (isCtrlPressed && startPoint) {
      console.log("ctrl pressed and point selected");
      setLoading(true);
      const intermediatePoint = await getNearestPoint(
        info.coordinate[1],
        info.coordinate[0]
      );
      setIntermediatePoints((prevState) => {
        return [
          ...prevState,
          {
            id: intermediatePoint.id,
            color: [255, 255, 152],
            lineColor: [0, 0, 0],
            coordinates: [
              intermediatePoint.longitude,
              intermediatePoint.latitude,
            ],
          },
        ];
      });
    }

    if (!startPoint || !endPoint) {
      setLoading(true);
      const coordinatesResponse = await getNearestPoint(
        info.coordinate[1],
        info.coordinate[0]
      );

      if (!startPoint) {
        const circle = createGeoJSONCircle(
          [coordinatesResponse.longitude, coordinatesResponse.latitude],
          0.5
        );
        setSelectionRadius([{ contour: circle }]);
        setStartPoint({
          id: coordinatesResponse.id,
          color: [152, 255, 152],
          lineColor: [0, 0, 0],
          coordinates: [
            coordinatesResponse.longitude,
            coordinatesResponse.latitude,
          ],
        });
      }
      if (startPoint && !endPoint && !isCtrlPressed) {
        setEndPoint({
          id: coordinatesResponse.id,
          color: [255, 152, 152],
          lineColor: [0, 0, 0],
          coordinates: [
            coordinatesResponse.longitude,
            coordinatesResponse.latitude,
          ],
        });
      }
    }
    setLoading(false);
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

  const findShortestPathClick = async () => {
    if (!startPoint || !endPoint) {
      throw new Error("Start and end points must be set");
    }
    setLoading(true);
    let shortestPath;
    try {
      if (intermediatePoints.length > 0) {
        shortestPath = await getShortestPathWithIntermediatePoints(
          startPoint.id,
          endPoint.id,
          intermediatePoints.map((p) => p.id),
          shortestPathProfile
        );
      } else {
        shortestPath = await getShortestPath(
          startPoint.id,
          endPoint.id,
          shortestPathProfile,
          implMode
        );
      }
    }catch (error: Error | any) {
      console.error(error.message);
      setLoading(false);
    }
    setPath(shortestPath);
    setLoading(false);
  };

  const radiusLayer = new PolygonLayer<IRadius>({
    id: "PolygonLayer",
    data: selectionRadius,

    getPolygon: (d: IRadius) => d.contour,
    getFillColor: (d: IRadius) => [80, 210, 0, 10],
    getLineColor: [9, 142, 46, 175],
    getLineWidth: 10,
    lineWidthMinPixels: 1,
    pickable: true,
    stroked: true,
    opacity: 0.4,
  });

  const tripLayer = new TripsLayer<number[]>({
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

  const handleChange = (e: any) => {
    setShortestPathProfile(e.target.value);
  };

  const handleChangeImplMode = (e: any) => {
    setImplMode(e.target.value);
  }

  useEffect(() => {
    console.log(isCtrlPressed);
  }, [isCtrlPressed]);

  return (
    <>
      <div
        onKeyDownCapture={(e) => console.log(e)}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
      >
        <Card
          sx={{
            padding: 1,
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 1,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          }}
        >
          <CardContent>
            <Typography
              gutterBottom
              sx={{ color: "steelblue", marginBottom: 5, fontWeight: "bold" }}
              variant="h5"
            >
              Shortest Path Finder
              <RouteIcon
                sx={{
                  verticalAlign: "middle",
                  marginLeft: 1,
                  marginBottom: 1,
                  color: "text.primary",
                }}
                fontSize="large"
              />
            </Typography>
            <Typography
              sx={{ color: "text.secondary", mb: 1.5, fontWeight: "bold" }}
            >
              Route Preference
            </Typography>

            <Container
              style={{
                display: "flex",
                flexDirection: "column",
                paddingLeft: 0,
              }}
            >
              <Container style={{ padding: 0 }}>
                <Radio
                  checked={shortestPathProfile === RoutePreference.DISTANCE}
                  onChange={handleChange}
                  value={RoutePreference.DISTANCE}
                  name="radio-buttons"
                  inputProps={{ "aria-label": "radtio-btn-profile-distance" }}
                />
                <FormLabel id="radtio-btn-profile-distance">
                  Shortest Path (Minimize Distance)
                </FormLabel>
              </Container>
              <Container style={{ padding: 0 }}>
                <Radio
                  checked={shortestPathProfile === RoutePreference.TIME}
                  onChange={handleChange}
                  value={RoutePreference.TIME}
                  name="radio-buttons"
                  inputProps={{ "aria-label": "radtio-btn-profile-time" }}
                />
                <FormLabel id="radtio-btn-profile-distance">
                  Quickest Path (Minimize Time)
                </FormLabel>
              </Container>
              <Alert icon={<InfoIcon fontSize="inherit"/>} severity="info" variant="outlined">
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1, maxWidth: 300 }}
                >
                  Select whether you want the shortest distance or the quickest
                  travel time.
                </Typography>
              </Alert>
            </Container>
            <Container
              style={{
                display: "flex",
                flexDirection: "column",
                paddingLeft: 0,
                marginTop: "1rem",
              }}
            >
              <Typography
                sx={{ color: "text.secondary", mb: 1.5, fontWeight: "bold" }}
              >
                Implementation mode
              </Typography>
              <Container style={{ padding: 0 }}>
                <Radio
                  checked={implMode === ImplementationMode.CUSTOM}
                  onChange={handleChangeImplMode}
                  value={ImplementationMode.CUSTOM}
                  name="radio-buttons"
                  inputProps={{ "aria-label": "radtio-btn-impl-custom" }}
                />
                <FormLabel id="radtio-btn-impl-custom">Custom</FormLabel>
              </Container>
              <Container style={{ padding: 0 }}>
                <Radio
                  checked={implMode === ImplementationMode.BUILT_IN}
                  onChange={handleChangeImplMode}
                  value={ImplementationMode.BUILT_IN}
                  name="radio-buttons"
                  inputProps={{ "aria-label": "radtio-btn-impl-builtin" }}
                />
                <FormLabel id="radtio-btn-impl-builtin">
                  Built-in (
                  <Link
                    href="https://docs.pgrouting.org/3.0/en/pgRouting-concepts.html"
                    target="_blank"
                  >
                    pgRouting
                  </Link>
                  )
                </FormLabel>
              </Container>
            </Container>
          </CardContent>
          <CardActions
            style={{
              width: "100%",
              justifyContent: "space-evenly",
              padding: "1rem 0 1rem 0",
            }}
          >
            <Button
              style={{ width: "130px" }}
              variant="contained"
              color="primary"
              onClick={findShortestPathClick}
              disabled={!startPoint || !endPoint || loading}
            >
              Start
            </Button>
            <Button
              style={{ width: "130px" }}
              variant="outlined"
              color="primary"
              onClick={() => {
                setStartPoint(undefined);
                setEndPoint(undefined);
                setPath(undefined);
                setIntermediatePoints(() => []);
                setLoading(false);
                setSelectionRadius(() => {
                  return []
                });
              }}
              disabled={!startPoint && !endPoint && loading}
            >
              Reset
            </Button>
          </CardActions>
        </Card>
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller
          onClick={mapClick}
          layers={[radiusLayer, tripLayer, intermediatePointsLayer, layer]}
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
            height: "10px",
            width: "2000px",
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
