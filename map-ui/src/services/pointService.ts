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

export interface IShortestPathResult {
    path: IWayPath;
    totalCost: number;
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

export interface IShortestPathApiResponse {
    path: IShortestPathItem[];
    totalCost: number;
}

export const getShortestPath = async (
    sourceId: number,
    targetId: number,
    routePreference: RoutePreference,
    implementationMode: ImplementationMode,
    isLeftTurnsMinimized = false
): Promise<IShortestPathResult> => {
    const url =
        implementationMode === ImplementationMode.BUILT_IN
            ? `${BASE_URL}/shortest-path`
            : `${BASE_URL}/shortest-path/custom`;
    try {
        const response = await axios.get<IShortestPathApiResponse>(`${url}`, {
            params: {
                sourceId,
                targetId,
                routePreference,
                minimizeLeftTurns: isLeftTurnsMinimized
            },
        });
        const pathSegments = response.data.path;
        const uniqueWaypoints = new Map<string, IWayPoint>();

        pathSegments.forEach((item) => {
            const startKey = `${item.startLongitude},${item.startLatitude}`;
            const endKey = `${item.endLongitude},${item.endLatitude}`;

            if (!uniqueWaypoints.has(startKey)) {
                uniqueWaypoints.set(startKey, {
                    id: item.node,
                    longitude: item.startLongitude,
                    latitude: item.startLatitude,
                });
            }

            if (!uniqueWaypoints.has(endKey)) {
                uniqueWaypoints.set(endKey, {
                    id: item.node,
                    longitude: item.endLongitude,
                    latitude: item.endLatitude,
                });
            }
        });

        const waypoints = Array.from(uniqueWaypoints.values());
        // const waypoints: IWayPoint[] = pathSegments.flatMap((item) => ([
        //     {
        //         id: item.node,
        //         longitude: item.startLongitude,
        //         latitude: item.startLatitude,
        //     },
        //     {
        //         id: item.node,
        //         longitude: item.endLongitude,
        //         latitude: item.endLatitude,
        //     },
        // ]));
        return {
            path: {
                waypoints: [
                    ...waypoints,
                ],
            },
            totalCost: response.data.totalCost,
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
    routePreference = "TIME",
    implementationMode: ImplementationMode,
    isLeftTurnsMinimized = false
): Promise<IShortestPathResult> => {
    const url =
        implementationMode === ImplementationMode.BUILT_IN
            ? `${BASE_URL}/shortest-path/intermediate-points`
            : `${BASE_URL}/shortest-path/intermediate-points/custom`;
    try {
        const response = await axios.get<IShortestPathApiResponse>(
            url,
            {
                params: {
                    sourceId,
                    targetId,
                    routePreference,
                    minimizeLeftTurns: isLeftTurnsMinimized,
                    intermediatePoints,
                },
                paramsSerializer: (params) =>
                    qs.stringify(params, { arrayFormat: "repeat" }), // Key change here
            }
        );
        // Consolidate coordinates from geometry into IWayPoint structure
        const pathSegments = response.data.path;
        const waypoints: IWayPoint[] = pathSegments.flatMap((item) => ({
            id: item.node, // or use a different unique identifier if available
            longitude: item.startLongitude,
            latitude: item.startLatitude,
        }));
        const startWaypoint = pathSegments[0];
        const lastWaypoint = pathSegments[pathSegments.length - 1];

        return {
            path: {
                waypoints: [
                    {
                        id: startWaypoint.node,
                        latitude: startWaypoint.endLatitude,
                        longitude: startWaypoint.endLongitude
                    },
                    ...waypoints,
                    {
                        id: lastWaypoint.node,
                        latitude: lastWaypoint.endLatitude,
                        longitude: lastWaypoint.endLongitude,
                    },
                ]
            },
            totalCost: response.data.totalCost,
        };
    } catch (error: Error | any) {
        throw new Error(`Error fetching shortest path: ${error.message}`);
    }
};
