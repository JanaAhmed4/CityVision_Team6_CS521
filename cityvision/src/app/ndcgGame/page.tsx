'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AOS from 'aos';
import 'aos/dist/aos.css';

// NDCG helpers
function calculateDCG(scores: number[]) {
  return scores.reduce((sum, rel, idx) => sum + rel / Math.log2(idx + 2), 0);
}

function calculateNDCG(user: string[], ideal: string[], relevanceLabels: Record<string, number>) {
  const userScores = user.map((loc) => relevanceLabels[loc] ?? 0);
  const idealScores = ideal.map((loc) => relevanceLabels[loc] ?? 0);

  const dcg = calculateDCG(userScores);
  const idcg = calculateDCG(idealScores);

  return idcg === 0 ? 0 : +(dcg / idcg).toFixed(3);
}

// Draggable item component
function SortableItem({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="p-2 mb-2 bg-blue-100 rounded-lg cursor-grab"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {id}
    </div>
  );
}

export default function Page() {
  useEffect(() => { AOS.init({ duration: 1000, once: true }); }, []);

  // Locations A–J
  const allLocations = Array.from({ length: 10 }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  // Relevance labels
  const relevanceLabels: Record<string, number> = {
    A: 5, B: 4, C: 5, D: 3, E: 2, F: 5, G: 3, H: 4, I: 2, J: 3,
  };

  // True ranking based on relevance (higher first, if equal keep initial order)
  const trueRanking = [...allLocations].sort((a, b) => {
    const relDiff = (relevanceLabels[b] ?? 0) - (relevanceLabels[a] ?? 0);
    return relDiff !== 0 ? relDiff : a.localeCompare(b);
  });

  const [userRanking, setUserRanking] = useState<string[]>([]);
  const [showTrueRanking, setShowTrueRanking] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setUserRanking((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const ndcg = calculateNDCG(userRanking, trueRanking, relevanceLabels);

  const markerCoords: Record<string, { x: number; y: number }> = {
    A: { x: 20, y: 30 },
    B: { x: 40, y: 25 },
    C: { x: 60, y: 35 },
    D: { x: 80, y: 20 },
    E: { x: 25, y: 60 },
    F: { x: 45, y: 55 },
    G: { x: 65, y: 65 },
    H: { x: 85, y: 50 },
    I: { x: 50, y: 80 },
    J: { x: 30, y: 80 },
  };

  function addLocation(id: string) {
    setUserRanking((r) => (r.includes(id) ? r : [...r, id]));
  }

  function getRelevanceColor(relevance: number) {
    const colors: Record<number, string> = {
      5: '#4B0082',   // Dark Purple
      4: '#6A0DAD',   // Medium Dark Purple
      3: '#8E44AD',   // Medium Purple
      2: '#BB8FCE',   // Light Purple
      1: '#E8DAEF',   // Very Light Purple
    };
    return colors[relevance] || '#ffffff'; // fallback white
  }
  

  return (
    <main className="relative pt-24 pb-12 px-12">
      <Image
        src="/dark-background.png"
        alt="background"
        fill
        className="object-cover -z-10"
      />

      <div className="relative z-10 max-w-5xl mx-auto text-left text-white mb-10" data-aos="fade-down">
        <h1 className="text-4xl font-semibold mb-4">Can you compete CityVision score?</h1>
        <p className="text-lg">Click on markers, rank them, and see your NDCG score!</p>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row bg-white/90 rounded-sm overflow-hidden shadow-lg mx-auto max-w-5xl h-[80vh]">
        <div className="md:w-2/3 relative bg-gray-100 overflow-hidden">
          <img
            src="/map.png"
            alt="Map"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {allLocations.map((id) => {
            const coord = markerCoords[id];
            return (
              <div
                key={id}
                onClick={() => addLocation(id)}
                className="absolute cursor-pointer"
                style={{ top: `${coord.y}%`, left: `${coord.x}%`, transform: 'translate(-50%, -100%)' }}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-white ${userRanking.includes(id) ? 'bg-gray-600' : 'bg-purple-600'}`}
                >
                  {id}
                </div>
              </div>
            );
          })}
        </div>

        <div className="md:w-1/3 p-6 flex flex-col overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-4">Your Ranking</h2>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={userRanking}
              strategy={verticalListSortingStrategy}
            >
              {userRanking.length === 0 ? (
                <p className="text-gray-600">Click a marker on the map to add it here.</p>
              ) : (
                userRanking.map((loc) => <SortableItem key={loc} id={loc} />)
              )}
            </SortableContext>
          </DndContext>

          <div className="mt-6">
            <div className="text-lg"><strong>Your ranking:</strong> {userRanking.join(' → ') || '—'}</div>
            {userRanking.length > 0 && (
              <div className="text-lg mt-2"><strong>NDCG score:</strong> {ndcg}</div>
            )}
          </div>

          <button
            onClick={() => setShowTrueRanking((prev) => !prev)}
            className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded w-full transition-all duration-300"
          >
            {showTrueRanking ? 'Hide True Ranking' : 'Show True Ranking'}
          </button>

          {showTrueRanking && (
            <div className="mt-6 animate-fade-in-down">
              <h2 className="text-xl font-semibold mb-4">True Ranking</h2>
              <div className="flex flex-col gap-2">
                {trueRanking.map((loc) => {
                  const relevance = relevanceLabels[loc];
                  return (
                    <div
                      key={loc}
                      className="p-2 rounded-lg text-white font-semibold text-center"
                      style={{ backgroundColor: getRelevanceColor(relevance) }}
                    >
                      {loc}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out;
        }
      `}</style>
    </main>
  );
}
