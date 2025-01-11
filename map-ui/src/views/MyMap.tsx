import "./map.css";
import { Map as MapGL } from "react-map-gl/maplibre";
import { INITIAL_VIEW_STATE, MAP_STYLE_CONFIG } from "../config";
import { ScatterplotLayer } from "@deck.gl/layers";
import DeckGL, { PickingInfo, TripsLayer } from "deck.gl";
import { MjolnirGestureEvent } from "mjolnir.js";
import RouteIcon from "@mui/icons-material/RouteOutlined";

import {
  getNearestPoint,
  getShortestPath,
  getShortestPathWithIntermediatePoints,
  IWayPath,
} from "../services/pointService";
import React, { useEffect } from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Container,
  FormLabel,
  LinearProgress,
  Radio,
  Typography,
} from "@mui/material";
import { useBtnPressed } from "../hooks/useBtnPressed";
import { RoutePreference } from "./types";

interface Point {
  id: number;
  color: number[];
  lineColor: number[];
  coordinates: number[];
}

const MyMap = () => {
  const [startPoint, setStartPoint] = React.useState<Point>();
  const [endPoint, setEndPoint] = React.useState<Point>();
  const [path, setPath] = React.useState<IWayPath>();
  const [loading, setLoading] = React.useState(false);
  const [shortestPathProfile, setShortestPathProfile] =
    React.useState(RoutePreference.DISTANCE);

  const [intermediatePoints, setIntermediatePoints] = React.useState<Point[]>([]);
    
  const { isCtrlPressed } = useBtnPressed("Meta");

  const mapClick = async (info: PickingInfo, event: MjolnirGestureEvent) => {
    // if (loading) return;
    if (!info.coordinate) {
      throw new Error("No coordinate found");
    }

    if(isCtrlPressed && startPoint) {
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
            coordinates: [intermediatePoint.longitude, intermediatePoint.latitude],
          }
        ]
      })
    }

    if (!startPoint || !endPoint) {
      setLoading(true);
      const coordinatesResponse = await getNearestPoint(
        info.coordinate[1],
        info.coordinate[0]
      );

      if (!startPoint) {
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
    if(intermediatePoints.length > 0) {
      shortestPath = await getShortestPathWithIntermediatePoints(startPoint.id, endPoint.id, intermediatePoints.map(p => p.id), "TIME");
    } else {
      shortestPath = await getShortestPath(startPoint.id, endPoint.id);
    }
    setPath(shortestPath);
    setLoading(false);
  };

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

  useEffect(() => {
    console.log(isCtrlPressed);
  }, [isCtrlPressed])

  return (
    <>
    <div onKeyDownCapture={(e) => console.log(e)} onContextMenu={(e) => { e.preventDefault(); }}>
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
              sx={{ color: "text.primary", marginBottom: 5 }}
              variant="h5"
            >
              Shortest Path Finder
              <RouteIcon
                sx={{
                  verticalAlign: "middle",
                  marginLeft: 1,
                  color: "#00a152",
                }}
                fontSize="large"
              />
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
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
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, maxWidth: 300 }}
              >
                Select whether you want the shortest distance or the quickest
                travel time.
              </Typography>
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
                setIntermediatePoints(() => ([]));
                setLoading(false);
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
        layers={[tripLayer, intermediatePointsLayer, layer]}
      >
        <MapGL
          style={{ width: "100%", height: "100%" }}
          mapStyle={MAP_STYLE_CONFIG}
        />
      </DeckGL>
      <Container sx={{ position: "absolute", height: '10px', width: "2000px", zIndex: 111 }}>
        {loading && <LinearProgress />}
      </Container>
    </div>
    </>
  );
};

export default MyMap;
