import React from 'react';
import { useData } from '../../contexts/DataContext';
import { MapPin, Square } from 'lucide-react';

const StablingVisual: React.FC = () => {
  const { stablingGeometry } = useData();

  // Create a map of occupied positions
  const occupiedPositions = stablingGeometry.reduce((acc, geometry) => {
    const key = `${geometry.track_name}-${geometry.slot_position}`;
    acc[key] = {
      train_id: geometry.train_id,
      status: geometry.status
    };
    return acc;
  }, {} as Record<string, { train_id: string; status: string }>);

  // Generate track layout
  const stablingTracks = Array.from({length: 20}, (_, i) => `S${i + 1}`);
  const lineTracks = Array.from({length: 6}, (_, i) => `L${i + 1}`);

  const renderTrack = (trackName: string, isLine: boolean = false) => {
    const slot1Key = `${trackName}-1`;
    const slot2Key = `${trackName}-2`;
    const slot1 = occupiedPositions[slot1Key];
    const slot2 = occupiedPositions[slot2Key];

    return (
      <div key={trackName} className={`flex items-center space-x-2 p-2 rounded-lg ${isLine ? 'bg-blue-50' : 'bg-gray-50'}`}>
        <div className="w-12 text-xs font-medium text-gray-700">
          {trackName}
        </div>
        
        {/* Slot 1 */}
        <div className={`flex-1 h-8 rounded border-2 border-dashed flex items-center justify-center text-xs font-medium ${
          slot1?.status === 'Occupied' 
            ? 'bg-red-100 border-red-300 text-red-700' 
            : 'bg-green-100 border-green-300 text-green-600'
        }`}>
          {slot1?.status === 'Occupied' ? slot1.train_id : 'Empty'}
        </div>
        
        {/* Slot 2 */}
        <div className={`flex-1 h-8 rounded border-2 border-dashed flex items-center justify-center text-xs font-medium ${
          slot2?.status === 'Occupied' 
            ? 'bg-red-100 border-red-300 text-red-700' 
            : 'bg-green-100 border-green-300 text-green-600'
        }`}>
          {slot2?.status === 'Occupied' ? slot2.train_id : 'Empty'}
        </div>
      </div>
    );
  };

  const totalSlots = (stablingTracks.length + lineTracks.length) * 2;
  const occupiedSlots = Object.values(occupiedPositions).filter(p => p.status === 'Occupied').length;
  const occupancyRate = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-semibold text-gray-900">Depot Stabling Layout</h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Occupancy Rate</p>
            <p className="text-2xl font-bold text-teal-600">{occupancyRate}%</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stabling Tracks */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Square className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-900">Stabling Tracks (S1-S20)</h4>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {stablingTracks.map(track => renderTrack(track))}
            </div>
          </div>

          {/* Line Tracks */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Square className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-gray-900">Line Tracks (L1-L6)</h4>
            </div>
            <div className="space-y-2">
              {lineTracks.map(track => renderTrack(track, true))}
            </div>

            {/* Legend */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h5 className="font-medium text-gray-900 mb-3">Legend</h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                  <span className="text-gray-700">Empty Slot</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
                  <span className="text-gray-700">Occupied Slot</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-50 rounded"></div>
                  <span className="text-gray-700">Line Track</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-900">{totalSlots}</p>
            <p className="text-sm text-gray-600">Total Slots</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-xl">
            <p className="text-2xl font-bold text-red-600">{occupiedSlots}</p>
            <p className="text-sm text-gray-600">Occupied</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-2xl font-bold text-green-600">{totalSlots - occupiedSlots}</p>
            <p className="text-sm text-gray-600">Available</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StablingVisual;