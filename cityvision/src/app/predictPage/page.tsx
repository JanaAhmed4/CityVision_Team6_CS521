'use client';

import {
  GoogleMap,
  useJsApiLoader,
  Rectangle,
  Marker,
  Circle,
  Polygon,
} from '@react-google-maps/api';
import Image from 'next/image';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect, useRef, useState } from 'react';
import React from 'react';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 26.32,
  lng: 50.16,
};

const defaultBounds = {
  north: defaultCenter.lat + 0.02,
  south: defaultCenter.lat - 0.02,
  east: defaultCenter.lng + 0.04,
  west: defaultCenter.lng - 0.04,
};

interface GridData {
  id: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  center: {
    lat: number;
    lng: number;
  };
}

export default function Predict() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  });

  const [rectangleBounds, setRectangleBounds] = useState(defaultBounds);
  const rectangleRef = useRef<google.maps.Rectangle | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [gridData, setGridData] = useState<GridData[]>([]);
  const [businessType, setBusinessType] = useState('restaurant');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [markerPositions, setMarkerPositions] = useState<
    { lat: number; lng: number; rank: number }[]
  >([]);
  const [allowedBounds, setAllowedBounds] =
    useState<google.maps.LatLngBoundsLiteral | null>(null);
  const [districtPolygons, setDistrictPolygons] = useState<
    google.maps.LatLngLiteral[][]
  >([]);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });

    const fetchDistricts = async () => {
      const res = await fetch('/data/districts.geojson');
      const data = await res.json();

      const allCoords: google.maps.LatLngLiteral[] = [];
      const polygons: google.maps.LatLngLiteral[][] = [];

      data.features.forEach((feature: any) => {
        const { coordinates, type } = feature.geometry;

        if (type === 'Polygon') {
          coordinates.forEach((ring: any) => {
            const path = ring.map(([lng, lat]: [number, number]) => ({
              lat,
              lng,
            }));
            polygons.push(path);
            allCoords.push(...path);
          });
        } else if (type === 'MultiPolygon') {
          coordinates.forEach((poly: any) => {
            poly.forEach((ring: any) => {
              const path = ring.map(([lng, lat]: [number, number]) => ({
                lat,
                lng,
              }));
              polygons.push(path);
              allCoords.push(...path);
            });
          });
        }
      });

      if (allCoords.length > 0) {
        const lats = allCoords.map((p) => p.lat);
        const lngs = allCoords.map((p) => p.lng);

        setAllowedBounds({
          north: Math.max(...lats),
          south: Math.min(...lats),
          east: Math.max(...lngs),
          west: Math.min(...lngs),
        });

        setDistrictPolygons(polygons);
      }
    };

    fetchDistricts();
  }, []);

  const handleRectangleDragStart = () => {
    setGridData([]);
    setExplanation('');
    setMarkerPositions([]);
  };

  const handleBoundsChanged = () => {
    const rect = rectangleRef.current;
    if (!rect || !allowedBounds) return;

    const bounds = rect.getBounds();
    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const newBounds = {
      north: ne.lat(),
      south: sw.lat(),
      east: ne.lng(),
      west: sw.lng(),
    };

    const isWithinAllowed =
      newBounds.north <= allowedBounds.north &&
      newBounds.south >= allowedBounds.south &&
      newBounds.east <= allowedBounds.east &&
      newBounds.west >= allowedBounds.west;

    if (!isWithinAllowed) {
      alert('Please keep the rectangle within the allowed region.');
      rect.setBounds(rectangleBounds);
      return;
    }

    setRectangleBounds(newBounds);
  };

  const predictLocations = async () => {
    setIsEditing(false);
    setIsLoading(true);
    setExplanation('');
    setMarkerPositions([]);

    try {
      const rect = rectangleRef.current;
      if (!rect) return;

      const bounds = rect.getBounds();
      if (!bounds) return;

      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();

      const liveBounds = {
        north: ne.lat(),
        south: sw.lat(),
        east: ne.lng(),
        west: sw.lng(),
      };

      const rows = 3;
      const cols = 5;
      const latStep = (liveBounds.north - liveBounds.south) / rows;
      const lngStep = (liveBounds.east - liveBounds.west) / cols;

      const newGridData: GridData[] = [];

      for (let i = 0; i < rows; i++) {
        const reversedRow = rows - 1 - i;
        for (let j = 0; j < cols; j++) {
          const cellSouth = liveBounds.south + reversedRow * latStep;
          const cellNorth = cellSouth + latStep;
          const cellWest = liveBounds.west + j * lngStep;
          const cellEast = cellWest + lngStep;

          const cellId = `cell-${i * cols + j + 1}`;

          newGridData.push({
            id: cellId,
            bounds: {
              north: cellNorth,
              south: cellSouth,
              east: cellEast,
              west: cellWest,
            },
            center: {
              lat: (cellNorth + cellSouth) / 2,
              lng: (cellEast + cellWest) / 2,
            },
          });
        }
      }

      setGridData(newGridData);

      const potentialLocationsResponse = await fetch('/api/potentialLocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gridData: newGridData, businessType }),
      });

      const potentialLocationsData = await potentialLocationsResponse.json();

      setExplanation(potentialLocationsData.generated_text ?? 'No explanation returned.');

      if (Array.isArray(potentialLocationsData.topLocations)) {
        const markers = potentialLocationsData.topLocations
          .map((loc: any, idx: number) => {
            const gridCell = newGridData.find((g) => g.id === `cell-${loc.id}`);
            return gridCell ? { ...gridCell.center, rank: idx + 1 } : null;
          })
          .filter(Boolean);

        setMarkerPositions(markers as { lat: number; lng: number; rank: number }[]);
      }
    } catch (error) {
      console.error('Prediction error:', error);
      setExplanation('An error occurred while generating the prediction. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <main className="relative pt-16 px-12">
      <Image src="/dark-background.png" alt="background" fill className="object-cover -z-10" />

      {isLoading && (
        <div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center space-y-4">
          <p className="text-gray-700 text-lg font-medium">Analyzing candidate locations...</p>
          <div className="flex gap-2">
            <div className="w-4 h-4 bg-gray-800 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-4 h-4 bg-gray-800 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-4 h-4 bg-gray-800 rounded-full animate-bounce" />
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto text-left text-white mb-10 mt-20">
        <h1 className="text-4xl font-semibold mb-4">CityVision AI: Business Location Intelligence</h1>
        <p>Select your business type, move the rectangle over your area of interest, then click Predict.</p>
      </div>

      <div className="relative z-10 flex justify-center items-center w-full px-16 pb-12">
        <div className="flex flex-col md:flex-row bg-white/90 rounded-sm overflow-hidden shadow-lg w-full max-w-7xl h-[90vh]">
          <div className="w-full md:w-2/7 p-6 bg-white flex flex-col justify-start">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select your business type</label>
            <select
              className="w-full p-2 border border-gray-300 rounded mb-6"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              disabled={!isEditing}
            >
              <option value="restaurant">Restaurant</option>
              <option value="coffee_shop">Coffee Shop</option>
            </select>
            <button
              className="w-full py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-semibold"
              onClick={predictLocations}
              disabled={isLoading}
            >
              Predict
            </button>

            {!isLoading && explanation && (
              <div className="explanation-box mt-6 p-4 bg-white rounded shadow-md max-h-96 overflow-y-auto">
                <h5 className="font-semibold mb-2">Business Location Analysis</h5>
                <p>{explanation}</p>
              </div>
            )}
          </div>

          <div className="w-full bg-[#f5f3ed] flex flex-col">
            <div className="flex-1 overflow-hidden">
              {loadError && <p>Error loading map</p>}
              {!isLoaded && <p>Loading map...</p>}
              {isLoaded && (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={defaultCenter}
                  zoom={13}
                  options={{
                    restriction: allowedBounds
                      ? { latLngBounds: allowedBounds, strictBounds: true }
                      : undefined,
                  }}
                >
                  {isEditing && (
                    <Rectangle
                      draggable={true}
                      editable={false}
                      onLoad={(rect) => {
                        rectangleRef.current = rect;
                        rect.setBounds(rectangleBounds);
                      }}
                      onDragStart={handleRectangleDragStart}
                      onDragEnd={handleBoundsChanged}
                      options={{
                        strokeColor: '#333',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: '#333',
                        fillOpacity: 0.15,
                      }}
                    />
                  )}

                  {districtPolygons.map((path, idx) => (
                    <Polygon
                      key={`district-polygon-${idx}`}
                      path={path}
                      options={{
                        strokeColor: '#000',
                        strokeOpacity: 0,
                        strokeWeight: 0,
                        fillColor: '#aac',
                        fillOpacity: 0,
                      }}
                    />
                  ))}

                  {!isLoading &&
                    markerPositions.map((pos, idx) => (
                      <React.Fragment key={`marker-${idx}`}>
                        <Marker
                          position={{ lat: pos.lat, lng: pos.lng }}
                          title={`Recommendation #${pos.rank}`}
                          label={{
                            text: `#${pos.rank}`,
                            fontSize: '14px',
                            color: '#fff',
                            className: 'marker-label',
                          }}
                        />
                        <Circle
                          center={{ lat: pos.lat, lng: pos.lng }}
                          radius={800}
                          options={{
                            fillColor: '#6c1e6d',
                            fillOpacity: 0.2,
                            strokeColor: 'transparent',
                          }}
                        />
                      </React.Fragment>
                    ))}
                </GoogleMap>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
