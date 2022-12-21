import logo from './logo.svg';
import './App.css';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useCallback, useState } from 'react';

function App() {

  const containerStyle = {
    width: '100vw',
    height: '100vh'
  };
  
  const center = {
    lat: 51.8872037,
    lng: -0.4188479
  };

  const player1 = {
    lat: 51.8872037,
    lng: -0.4188479
  };

  const player2 = {
    lat: 51.8872037,
    lng: -0.4100480
  };

  const playerPins = [player1, player2]

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyDVDIlbC7oyz3K935y6h1sWFOHBTlWIKM0"
  })

  const [map, setMap] = useState(null)

  const onLoad = useCallback(function callback(map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);

    setMap(map)
  }, [])

  const onUnmount = useCallback(function callback(map) {
    setMap(null)
  }, [])

  return  isLoaded ? (
    <div className="App">
      <main className="App-main">
        <h1>My Map</h1>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
        { /* Child components, such as markers, info windows, etc. */ }
          {playerPins.map(player => (
            <Marker position={player}  icon={"https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"} label={"test"} />
          ))}

          <></>
        </GoogleMap>
      </main>
    </div>
  ) : <></>
}

export default App;
