import './App.css';
import { GoogleMap, Marker, useJsApiLoader, Polyline, InfoWindow} from '@react-google-maps/api';
import { useCallback, useState, useRef } from 'react';


const getDistance = (lat1, lon1, lat2, lon2) => {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);  // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d.toFixed(2);
}

const deg2rad = (deg) => {
  return deg * (Math.PI / 180)
}

const getTravelDuration = (distance, speed) => {
  return distance / (speed/1000) // Speed is not in meters per second
}
// const google = window.google;

function App() {

  const [playerName, setPlayerName] = useState('Idris')
  const [health, setPlayerHealth] = useState(100)
  const [alitude, setAltitude] = useState([])
  const [speed, setSpeed] = useState(37)
  const [currentLatLng, setCurrentLatLng] = useState([])
  const [destinationLatLng, setDestinationLatLng] = useState([])

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
    lng: -0.4188800
  };

  const endPoint = {
    lat: 51.8872037,
    lng: 0
  }

  const playerPins = [player1, player2]


  // Movement animation
  // https://stackoverflow.com/questions/72262867/trying-to-animate-markers-movement-with-react-google-maps-smoothly
  // https://stackoverflow.com/a/55043218/9058905
  function animateMarkerTo(marker, newPosition) {
    // save current position. prefixed to avoid name collisions. separate for lat/lng to avoid calling lat()/lng() in every frame
    marker.AT_startPosition_lat = marker.getPosition().lat();
    marker.AT_startPosition_lng = marker.getPosition().lng();
    var newPosition_lat = newPosition.lat();
    var newPosition_lng = newPosition.lng();
    const distanceAtoB = getDistance(marker.AT_startPosition_lat, marker.AT_startPosition_lng, newPosition_lat, newPosition_lng) // Result is in KM
    const durationOfTravel = getTravelDuration(distanceAtoB, speed) // in seconds
    console.log(distanceAtoB, "KM")
    console.log(durationOfTravel, "Seconds")
    console.log(speed, "speed")
    var options = {
      duration: durationOfTravel * 1000,
      easing: function (x, t, b, c, d) {
        // jquery animation: swing (easeOutQuad)
        return -c * (t /= d) * (t - 2) + b;
      }
    };

    window.requestAnimationFrame =
      window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.msRequestAnimationFrame;
    window.cancelAnimationFrame =
      window.cancelAnimationFrame || window.mozCancelAnimationFrame;


    // crossing the 180° meridian and going the long way around the earth?
    if (Math.abs(newPosition_lng - marker.AT_startPosition_lng) > 180) {
      if (newPosition_lng > marker.AT_startPosition_lng) {
        newPosition_lng -= 360;
      } else {
        newPosition_lng += 360;
      }
    }

    var animateStep = function (marker, startTime) {
      var ellapsedTime = new Date().getTime() - startTime;
      var durationRatio = ellapsedTime / options.duration; // 0 - 1
      var easingDurationRatio = options.easing(
        durationRatio,
        ellapsedTime,
        0,
        1,
        options.duration
      );

      if (durationRatio < 1) {
        marker.setPosition({
          lat:
            marker.AT_startPosition_lat +
            (newPosition_lat - marker.AT_startPosition_lat) * easingDurationRatio,
          lng:
            marker.AT_startPosition_lng +
            (newPosition_lng - marker.AT_startPosition_lng) * easingDurationRatio
        });

        // use requestAnimationFrame if it exists on this browser. If not, use setTimeout with ~60 fps
        if (window.requestAnimationFrame) {
          marker.AT_animationHandler = window.requestAnimationFrame(function () {
            animateStep(marker, startTime);
          });
        } else {
          marker.AT_animationHandler = setTimeout(function () {
            animateStep(marker, startTime);
          }, 17);
        }
      } else {
        marker.setPosition(newPosition);
      }
    };

    // stop possibly running animation
    if (window.cancelAnimationFrame) {
      window.cancelAnimationFrame(marker.AT_animationHandler);
    } else {
      clearTimeout(marker.AT_animationHandler);
    }



    animateStep(marker, new Date().getTime());
  }

  const markerRef = useRef(null);

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

  const onClick = useCallback((event) => {
    animateMarkerTo(markerRef.current.marker, event.latLng);
    console.log(event.latLng)
    setCurrentLatLng(markerRef.current.marker.internalPosition)
    setDestinationLatLng(event.latLng)
  }, []);


  const onUnmount = useCallback(function callback(map) {
    setMap(null)
  }, [])

  const image = {
    url:"https://cdn-icons-png.flaticon.com/512/1023/1023356.png", 
    scaledSize: new window.google.maps.Size(50, 50)
  }

  return isLoaded ? (
    <div className="App">
      <main className="App-main">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={7}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={onClick}
        >
          { /* Child components, such as markers, info windows, etc. */}
          {/* {playerPins.map(player => (
            <Marker ref={markerRef} position={player}  icon={"https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"} label={"test label"} animation={"BOUNCE"} />
          ))} */}
          <Marker ref={markerRef} position={player1} icon={image} label={"Hello World"}/>
          {/* <InfoWindow  position={currentLatLng}><h1>InfoWindow</h1></InfoWindow> */}
          <Polyline path={[currentLatLng, destinationLatLng]} />
          <></>
        </GoogleMap>
      </main>
    </div>
  ) : <></>
}

export default App;
