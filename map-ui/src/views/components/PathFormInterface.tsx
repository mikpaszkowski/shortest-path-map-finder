import { useEffect } from "react";
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  FormLabel,
  Link,
  Radio,
  Switch,
  Typography,
} from "@mui/material";
import RouteIcon from "@mui/icons-material/RouteOutlined";
import React from "react";
import { ImplementationMode, RoutePreference } from "../types";
import {
  getShortestPath,
  getShortestPathWithIntermediatePoints,
  IShortestPathResult,
  IWayPath,
} from "../../services/pointService";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import { Point } from "../MyMap";

export interface IPathFormInterfaceProps {
  startPoint: Point | undefined;
  endPoint: Point | undefined;
  intermediatePoints: Point[];
  isLoading: boolean;
  setPath: (path: IWayPath) => void;
  setLoading: (loading: boolean) => void;
  setCost: (cost: number) => void;
  setResultShortestPathMode: (mode: RoutePreference) => void;
  resetForm: () => void;
}

export const PathFormInterface = ({
  startPoint,
  endPoint,
  isLoading,
  intermediatePoints,
  setLoading,
  setResultShortestPathMode,
  setPath,
  setCost,
  resetForm
}: IPathFormInterfaceProps) => {
  const [isLeftTurnsMinimized, setIsLeftTurnsMinimized] = React.useState(false);
  const [implMode, setImplMode] = React.useState(ImplementationMode.CUSTOM);
  const [shortestPathProfile, setShortestPathProfile] = React.useState(
    RoutePreference.DISTANCE
  );
  const handleShortestPathProfileChange = (e: any) => {
    setShortestPathProfile(e.target.value);
  };

  const handleChangeImplMode = (e: any) => {
    setImplMode(e.target.value);
  };

  const handleLeftTurnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLeftTurnsMinimized(event.target.checked);
  };

  useEffect(() => {
    if (implMode === ImplementationMode.BUILT_IN) {
      setIsLeftTurnsMinimized(false);
    }
  }, [implMode]);

  const findShortestPathClick = async () => {
    if (!startPoint || !endPoint) {
      throw new Error("Start and end points must be set");
    }
    setResultShortestPathMode(shortestPathProfile);
    setLoading(true);
    let shortestPathResult: IShortestPathResult = {
      path: {
        waypoints: [],
      },
      totalCost: 0,
    };
    try {
      if (intermediatePoints.length > 0) {
        shortestPathResult = await getShortestPathWithIntermediatePoints(
          startPoint.id,
          endPoint.id,
          intermediatePoints.map((p) => p.id),
          shortestPathProfile,
          implMode,
          isLeftTurnsMinimized
        );
      } else {
        shortestPathResult = await getShortestPath(
          startPoint.id,
          endPoint.id,
          shortestPathProfile,
          implMode,
          isLeftTurnsMinimized
        );
      }
    } catch (error: Error | any) {
      console.error(error.message);
      setLoading(false);
    }
    setPath(shortestPathResult.path);
    setCost(shortestPathResult.totalCost);
    setLoading(false);
  };

  return (
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
              onChange={handleShortestPathProfileChange}
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
              onChange={handleShortestPathProfileChange}
              value={RoutePreference.TIME}
              name="radio-buttons"
              inputProps={{ "aria-label": "radtio-btn-profile-time" }}
            />
            <FormLabel id="radtio-btn-profile-distance">
              Quickest Path (Minimize Time)
            </FormLabel>
          </Container>
          <Alert
            icon={<InfoIcon fontSize="inherit" />}
            severity="info"
            variant="outlined"
          >
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
        <Container style={{ marginTop: "1rem" }}>
          <Switch
            aria-label="left-turns-switch"
            checked={isLeftTurnsMinimized}
            disabled={implMode === ImplementationMode.BUILT_IN}
            onChange={handleLeftTurnChange}
          />
          <FormLabel id="left-turns-switch">Minimize left turns</FormLabel>
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
          disabled={!startPoint || !endPoint || isLoading}
        >
          Start
        </Button>
        <Button
          style={{ width: "130px" }}
          variant="outlined"
          color="primary"
          onClick={() => {
            resetForm();
            setLoading(false);
          }}
          disabled={!startPoint && !endPoint && isLoading}
        >
          Reset
        </Button>
      </CardActions>
    </Card>
  );
};
