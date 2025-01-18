/**
 * 
 * @param {Number[]} center array with longitude and latitude coordinates of the center point
 * @param {Number} radiusInKm radius
 * @param {Number} points how many will the resulting polygon have
 * @returns {Number[][]} 2D array with latitude and longitude coordinates for each point
 */
export function createGeoJSONCircle(center: number[], radiusInKm: number, points: number = 64): number[][] {
    const coords = {
        latitude: center[1],
        longitude: center[0]
    };

    const km = radiusInKm;

    const ret = [];
    const distanceX = km / (111.320 * Math.cos(coords.latitude * Math.PI / 180));
    const distanceY = km / 110.574;

    let theta, x, y;
    for (var i = 0; i < points; i++) {
        theta = (i / points) * (2 * Math.PI);
        x = distanceX * Math.cos(theta);
        y = distanceY * Math.sin(theta);

        ret.push([coords.longitude + x, coords.latitude + y]);
    }
    ret.push(ret[0]);

    return ret;
}