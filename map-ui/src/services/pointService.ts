import axios from "axios";
import qs from "qs";
import { ImplementationMode, RoutePreference } from "../views/types";

axios.defaults.withCredentials = false;

export interface IWayPoint {
  id: number;
  longitude: number;
  latitude: number;
}

const BASE_URL = "http://localhost:8080";
export const getNearestPoint = async (
  latitude: number,
  longitude: number
): Promise<IWayPoint> => {
  try {
    const response = await axios.get<IWayPoint>(`${BASE_URL}/nearest-point`, {
      params: {
        latitude,
        longitude,
      },
    });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(`Error fetching nearest point: ${error.message}`);
  }
};

export type ILineGeometry = {
  type: string;
  coordinates: number[][];
};
export type IShortestPathItem = {
  seq: number;
  node: number;
  edge: number;
  geometry: ILineGeometry;
  startLongitude: number;
  startLatitude: number;
  endLongitude: number;
  endLatitude: number;
};

export interface IWayPath {
  waypoints: IWayPoint[];
}

export const prepareWayPath = (pathItems: IShortestPathItem[]): IWayPath => {
  const waypoints: IWayPoint[] = [];

  pathItems.forEach((item) => {
    item.geometry.coordinates.forEach((coordinate, index) => {
      waypoints.push({
        id: item.node, // or use a different unique identifier if available
        longitude: coordinate[0],
        latitude: coordinate[1],
      });
    });
  });

  return { waypoints };
};
export const getShortestPath = async (
  sourceId: number,
  targetId: number,
  routePreference: RoutePreference,
  implementationMode: ImplementationMode
): Promise<IWayPath> => {
  const url =
    implementationMode === ImplementationMode.BUILT_IN
      ? `${BASE_URL}/shortest-path`
      : `${BASE_URL}/shortest-path/custom`;
  try {
    const response = await axios.get<IShortestPathItem[]>(`${url}`, {
      params: {
        sourceId,
        targetId,
        routePreference,
      },
    });
    // Consolidate coordinates from geometry into IWayPoint structure
    const waypoints: IWayPoint[] = response.data.flatMap((item) => ({
      id: item.node, // or use a different unique identifier if available
      longitude: item.startLongitude,
      latitude: item.startLatitude,
    }));
    const lastWaypoint = response.data[response.data.length - 1];
    console.log({
      waypoints: [
        ...waypoints,
        {
          id: lastWaypoint.node,
          latitude: lastWaypoint.endLatitude,
          longitude: lastWaypoint.endLongitude,
        },
      ],
    });
    return {
      waypoints: [
        ...waypoints,
        {
          id: lastWaypoint.node,
          latitude: lastWaypoint.endLatitude,
          longitude: lastWaypoint.endLongitude,
        },
      ],
    };
    // const wayPath = prepareWayPath(response.data);
    // console.log(wayPath.waypoints);
    // return { waypoints: wayPath.waypoints };
  } catch (error: Error | any) {
    throw new Error(`Error fetching shortest path: ${error.message}`);
  }
};

export const getShortestPathWithIntermediatePoints = async (
  sourceId: number,
  targetId: number,
  intermediatePoints: number[],
  routePreference = "TIME"
): Promise<IWayPath> => {
  try {
    const response = await axios.get<IShortestPathItem[]>(
      `${BASE_URL}/shortest-path/intermediate-points`,
      {
        params: {
          sourceId,
          targetId,
          routePreference,
          intermediatePoints,
        },
        paramsSerializer: (params) =>
          qs.stringify(params, { arrayFormat: "repeat" }), // Key change here
      }
    );
    // Consolidate coordinates from geometry into IWayPoint structure
    const waypoints: IWayPoint[] = response.data.flatMap((item) => ({
      id: item.node, // or use a different unique identifier if available
      longitude: item.startLongitude,
      latitude: item.startLatitude,
    }));
    const lastWaypoint = response.data[response.data.length - 1];
    console.log({
      waypoints: [
        ...waypoints,
        {
          id: lastWaypoint.node,
          latitude: lastWaypoint.endLatitude,
          longitude: lastWaypoint.endLongitude,
        },
      ],
    });
    return {
      waypoints: [
        ...waypoints,
        {
          id: lastWaypoint.node,
          latitude: lastWaypoint.endLatitude,
          longitude: lastWaypoint.endLongitude,
        },
      ],
    };
    // const wayPath = prepareWayPath(response.data);
    // console.log(wayPath.waypoints);
    // return { waypoints: wayPath.waypoints };
  } catch (error: Error | any) {
    throw new Error(`Error fetching shortest path: ${error.message}`);
  }
};
