import "./map.css";
import { Map as MapGL} from "react-map-gl/maplibre";
import { INITIAL_VIEW_STATE, MAP_STYLE_CONFIG } from "../config";
import { ScatterplotLayer } from "@deck.gl/layers";
import DeckGL from "deck.gl";

const MyMap = () => {

  const layer = new ScatterplotLayer({
    id: 'ScatterplotLayer',
    data: [
      {
        color: [152, 255, 152],
        lineColor: [0, 0, 0],
        coordinates: [21.0122,52.2297]
      }
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
    getPosition: d => d.coordinates,
    getFillColor: d => d.color,
    getLineColor: d => d.lineColor,
  });
  
  return (
    <DeckGL 
    initialViewState={INITIAL_VIEW_STATE} 
    controller 
    layers={[layer]}>
      <MapGL 
      style={{width: '100%', height: '100%'}}
      mapStyle={MAP_STYLE_CONFIG}/>
    </DeckGL>
  );
};

export default MyMap;
