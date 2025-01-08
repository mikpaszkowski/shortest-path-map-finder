import axios from 'axios';

axios.defaults.withCredentials = false;

interface PointResponse {
    id: number;
    longitude: number;
    latitude: number;
}

const BASE_URL = 'http://localhost:8080';
export const getNearestPoint = async (latitude: number, longitude: number): Promise<PointResponse> => {
    try {
        const response = await axios.get<PointResponse>(`${BASE_URL}/nearest-point`, {
            params: {
                latitude,
                longitude
            }
        });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(`Error fetching nearest point: ${error.message}`);
    }
};