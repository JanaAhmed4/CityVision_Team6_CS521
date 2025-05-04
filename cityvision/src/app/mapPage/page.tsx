'use client';

import { GoogleMap, LoadScript, Circle, Marker } from '@react-google-maps/api';
import Image from 'next/image';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect, useRef, useState, useCallback } from 'react';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 26.4207,
  lng: 50.0888,
};

export default function Predict() {
  const circleRef = useRef<google.maps.Circle | null>(null);
  const circleCenterRef = useRef<{ lat: number; lng: number }>(defaultCenter);

  const [isEditing, setIsEditing] = useState(true);
  const [businessType, setBusinessType] = useState('restaurant');
  const [markers, setMarkers] = useState<{ lat: number; lng: number }[]>([]);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const handleCenterChanged = useCallback(() => {
    const circle = circleRef.current;
    if (!circle) return;
    const center = circle.getCenter();
    if (center) {
      circleCenterRef.current = {
        lat: center.lat(),
        lng: center.lng(),
      };
    }
  }, []);

  const predictLocations = async () => {
    setIsEditing(false);
    const center = circleCenterRef.current;
    const response = await fetch('/api/predict', {
      method: 'POST',
      body: JSON.stringify({ businessType, center, radius: 1000 }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    setMarkers(data.locations);
    setIsEditing(true);
  };

  useEffect(() => {
    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
      }
    };
  }, []);

  return (
    <main className="relative pt-16 px-12">
      <Image
        src="/dark-background.png"
        alt="background"
        fill
        className="object-cover -z-10"
      />
      <div className="relative z-10 max-w-5xl mx-auto text-left text-white mb-10 mt-20">
        <h1 className="text-4xl font-semibold mb-4">CityVision AI: Business Location Intelligence</h1>
        <p className="text-m text-white">
          Select your business type, move the circle over your area of interest, then click Predict to run the AI model and gain insights.
        </p>
      </div>
      <div className="relative z-10 flex justify-center items-center w-full px-16 pb-12">
        <div className="flex flex-col md:flex-row bg-white/90 rounded-sm overflow-hidden shadow-lg w-full max-w-7xl h-[90vh]">
          <div className="w-full md:w-2/7 p-6 bg-white flex flex-col justify-between rounded-r-4xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select your business type
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded mb-6"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                disabled={!isEditing}
              >
                <option value="1">Restaurant</option>
                <option value="0">Coffee Shop</option>
              </select>
              <button
                className="w-full py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-semibold transition"
                onClick={predictLocations}
                disabled={!isEditing}
              >
                Predict
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-6">CityVision LLM</p>
          </div>

          <div className="w-full  bg-[#f5f3ed] rounded-r-xl flex flex-col">
            <div className="flex-1 rounded-lg overflow-hidden">
              <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={defaultCenter}
                  zoom={14}
                >
                  <Circle
                    center={circleCenterRef.current}
                    radius={1000}
                    draggable={isEditing}
                    editable={false}
                    onCenterChanged={handleCenterChanged}
                    onLoad={(circle) => {
                      if (circleRef.current) {
                        circleRef.current.setMap(null);
                      }
                      circleRef.current = circle;
                    }}
                  />
                  {markers.map((pos, i) => (
                    <Marker key={i} position={pos} />
                  ))}
                </GoogleMap>
              </LoadScript>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


// 'use client';

// import { GoogleMap, LoadScript, Rectangle, Marker } from '@react-google-maps/api';
// import { useCallback, useEffect, useRef, useState } from 'react';

// const containerStyle = {
//   width: '100%',
//   height: '600px',
// };

// const defaultCenter = {
//   lat: 26.4207,
//   lng: 50.0888, // Centered on Dammam, Saudi Arabia
// };

// const defaultBounds = {
//   north: 26.4307,
//   south: 26.4107,
//   east: 50.0988,
//   west: 50.0788,
// };

// export default function MapPage() {
//   const rectangleBoundsRef = useRef(defaultBounds);
//   const rectangleRef = useRef<google.maps.Rectangle | null>(null);

//   const [isEditing, setIsEditing] = useState(true);
//   const [businessType, setBusinessType] = useState('restaurant');
//   const [markers, setMarkers] = useState<{ lat: number; lng: number }[]>([]);

//   const handleBoundsChanged = useCallback(() => {
//     const rect = rectangleRef.current;
//     if (!rect) return;

//     const bounds = rect.getBounds();
//     if (bounds) {
//       const ne = bounds.getNorthEast();
//       const sw = bounds.getSouthWest();

//       rectangleBoundsRef.current = {
//         north: ne.lat(),
//         south: sw.lat(),
//         east: ne.lng(),
//         west: sw.lng(),
//       };
//     }
//   }, []);

//   const predictLocations = async () => {
//     setIsEditing(false); // disable UI

//     const bounds = rectangleBoundsRef.current;

//     const vertices = {
//       ne: { lat: bounds.north, lng: bounds.east },
//       sw: { lat: bounds.south, lng: bounds.west },
//     };

//     const response = await fetch('/api/predict', {
//       method: 'POST',
//       body: JSON.stringify({
//         businessType,
//         rectangle: vertices,
//       }),
//       headers: { 'Content-Type': 'application/json' },
//     });

//     const data = await response.json();
//     setMarkers(data.locations);
//     setIsEditing(true); // re-enable interaction
//   };

//   // Optional: cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (rectangleRef.current) {
//         rectangleRef.current.setMap(null);
//       }
//     };
//   }, []);

//   return (
//     <div>
//       <div className="flex gap-2 mb-4">
//         <select
//           value={businessType}
//           onChange={(e) => setBusinessType(e.target.value)}
//           disabled={!isEditing}
//         >
//           <option value="restaurant">Restaurant</option>
//           <option value="gym">Gym</option>
//           <option value="cafe">Cafe</option>
//         </select>
//         <button onClick={predictLocations} disabled={!isEditing}>
//           Predict
//         </button>
//       </div>

//       <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
//         <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={14}>
//           <Rectangle
//             key="main-rectangle"
//             bounds={rectangleBoundsRef.current}
//             editable={false}
//             draggable={isEditing}
//             onLoad={(rect) => {
//               // ✅ Remove old rectangle if still on the map
//               if (rectangleRef.current) {
//                 rectangleRef.current.setMap(null);
//               }
//               rectangleRef.current = rect;
//             }}
//             onBoundsChanged={handleBoundsChanged}
//           />

//           {markers.map((pos, i) => (
//             <Marker key={i} position={pos} />
//           ))}
//         </GoogleMap>
//       </LoadScript>
//     </div>
//   );
// }
