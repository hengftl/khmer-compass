import { useState, useEffect, useCallback } from 'react';
import { Navigation, Plus, X, Crosshair } from 'lucide-react';
import { useOrientation } from './hooks/useOrientation';
import {
  listSavedDirections,
  addSavedDirection,
  removeSavedDirection,
  type SavedDirection,
} from './lib/supabase';

const MARKER_COLORS = ['#22d3ee', '#f59e0b', '#f472b6', '#a3e635'];

function App() {
  const { heading, tiltX, tiltY, isSupported, permissionGranted, requestPermission } =
    useOrientation();

  const [savedDirections, setSavedDirections] = useState<SavedDirection[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveColor, setSaveColor] = useState(MARKER_COLORS[0]);
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'error'>('idle');

  const loadDirections = useCallback(async () => {
    try {
      const rows = await listSavedDirections();
      setSavedDirections(rows);
      setLoadError(null);
    } catch {
      setLoadError("Couldn't load saved directions. Check your connection and try again.");
    }
  }, []);

  useEffect(() => {
    loadDirections();
  }, [loadDirections]);

  const handleSave = async () => {
    setSavingState('saving');
    try {
      await addSavedDirection(saveName.trim() || 'Direction', Math.round(heading), saveColor);
      setSaveName('');
      setSaveColor(MARKER_COLORS[0]);
      setShowSaveDialog(false);
      setSavingState('idle');
      await loadDirections();
    } catch {
      setSavingState('error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeSavedDirection(id);
      setSavedDirections((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setLoadError("Couldn't remove that direction. Please try again.");
    }
  };

  const headingLabel = (() => {
    const h = Math.round(heading) % 360;
    const names = [
      'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW',
    ];
    return names[Math.round(h / 45) % 8];
  })();

  const flatness = Math.min(1, Math.sqrt(tiltX * tiltX + tiltY * tiltY) / 30);
  const isFlat = flatness < 0.15;

  const directions = [
    { label: 'ជើង', sublabel: 'N', angle: 0 },
    { label: 'ជើងកើត', sublabel: 'NE', angle: 45 },
    { label: 'កើត', sublabel: 'E', angle: 90 },
    { label: 'ត្បូងកើត', sublabel: 'SE', angle: 135 },
    { label: 'ត្បូង', sublabel: 'S', angle: 180 },
    { label: 'ត្បូងលិច', sublabel: 'SW', angle: 225 },
    { label: 'លិច', sublabel: 'W', angle: 270 },
    { label: 'ជើងលិច', sublabel: 'NW', angle: 315 },
  ];

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-6 py-5 sm:px-8 sm:py-6">
      <div className="w-full max-w-md flex flex-col min-h-0 flex-1">
        <div className="text-center mb-2 shrink-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">ត្រីវិស័យ</h1>
          <p className="text-sm text-slate-400">Compass - ត្រីវិស័យខ្មែរ</p>
        </div>

        <div className="flex-1 min-h-0 flex items-center justify-center">
          {!isSupported && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 text-center max-w-sm">
              <p className="text-amber-400 font-semibold mb-2">Mobile Device Required</p>
              <p className="text-amber-300/80 text-sm">
                This compass app works on smartphones and tablets with orientation sensors (iOS and
                Android).
              </p>
            </div>
          )}

          {isSupported && !permissionGranted && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 text-center max-w-sm">
              <p className="text-blue-400 mb-4 text-sm">
                Permission needed to access device orientation
              </p>
              <button
                onClick={requestPermission}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-6 py-3 rounded-lg font-medium transition-all"
              >
                Grant Permission
              </button>
            </div>
          )}

          {isSupported && permissionGranted && (
            <div
              className="relative w-full max-w-md aspect-square"
              style={{ width: 'min(100%, calc(100dvh - 300px))' }}
            >
              <div
                className="absolute inset-0 transition-transform duration-75 ease-linear"
                style={{ transform: `rotate(${heading}deg)` }}
              >
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-2 sm:border-4 border-slate-600/30"></div>

                  <div className="absolute inset-[8%] rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-inner"></div>

                  {directions.map((direction) => (
                    <div
                      key={direction.angle}
                      className="absolute inset-0"
                      style={{ transform: `rotate(${direction.angle}deg)` }}
                    >
                      <div
                        className="absolute top-[3%] left-1/2 flex flex-col items-center"
                        style={{ transform: `translateX(-50%) rotate(${-direction.angle}deg)` }}
                      >
                        <span
                          className={`font-bold leading-tight ${
                            direction.angle === 0
                              ? 'text-red-500 text-base sm:text-lg'
                              : 'text-slate-400 text-sm'
                          }`}
                        >
                          {direction.label}
                        </span>
                        <span className="text-[10px] leading-tight text-slate-500">
                          {direction.sublabel}
                        </span>
                      </div>
                    </div>
                  ))}

                  {[...Array(36)].map((_, i) => {
                    const angle = i * 10;
                    const isMajor = angle % 30 === 0;
                    return (
                      <div
                        key={i}
                        className="absolute inset-0"
                        style={{ transform: `rotate(${angle}deg)` }}
                      >
                        <div
                          className={`absolute top-0 left-1/2 -translate-x-1/2 rounded-full ${
                            isMajor ? 'w-1 h-[4%] bg-slate-600' : 'w-0.5 h-[2%] bg-slate-700'
                          }`}
                        ></div>
                      </div>
                    );
                  })}

                  {savedDirections.map((saved) => {
                    const relative = (saved.heading - heading + 360) % 360;
                    return (
                      <div
                        key={saved.id}
                        className="absolute inset-0"
                        style={{ transform: `rotate(${relative}deg)` }}
                      >
                        <div
                          className="absolute top-[14%] left-1/2 -translate-x-1/2 flex flex-col items-center"
                          style={{ transform: `translateX(-50%) rotate(${-relative}deg)` }}
                        >
                          <div
                            className="w-3 h-3 rotate-45 border-2 border-slate-900 shadow-md"
                            style={{ backgroundColor: saved.color }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <Navigation className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 drop-shadow-lg" />
                <div className="w-2 h-2 bg-red-500 rounded-full shadow-lg shadow-red-500/50 mt-1"></div>
              </div>
            </div>
          )}
        </div>

        {isSupported && permissionGranted && (
          <div className="shrink-0 mt-2 flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <div className="inline-block bg-slate-900/80 rounded-xl px-5 py-2 border border-slate-700/50 text-center">
                <p className="text-xs text-slate-400 leading-snug">ទិសដៅ / Heading</p>
                <p className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {Math.round(heading)}° {headingLabel}
                </p>
              </div>

              <button
                onClick={() => setShowSaveDialog(true)}
                title="Save current direction"
                className="w-11 h-11 rounded-xl bg-slate-900/80 border border-slate-700/50 flex items-center justify-center text-cyan-400 hover:bg-slate-800 hover:border-cyan-500/40 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2" title="Hold device flat for accuracy">
              <div className="w-6 h-6 rounded-full border border-slate-600/60 bg-slate-900/70 relative overflow-hidden">
                <div
                  className="absolute w-2.5 h-2.5 rounded-full transition-all duration-150"
                  style={{
                    backgroundColor: isFlat ? '#4ade80' : '#f59e0b',
                    left: `calc(50% + ${tiltX * 0.18}px - 5px)`,
                    top: `calc(50% + ${tiltY * 0.18}px - 5px)`,
                  }}
                ></div>
              </div>
              <p
                className={`text-xs transition-colors ${
                  isFlat ? 'text-green-400' : 'text-amber-400'
                }`}
              >
                {isFlat ? 'Level - good reading' : 'Tilt: hold device flatter'}
              </p>
            </div>

            {savedDirections.length > 0 && (
              <div className="w-full space-y-1.5 mt-1">
                {savedDirections.map((saved) => (
                  <div
                    key={saved.id}
                    className="flex items-center gap-2 bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-1.5"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: saved.color }}
                    ></span>
                    <span className="text-sm text-slate-200 flex-1 truncate">{saved.name}</span>
                    <span className="text-xs text-slate-400 tabular-nums shrink-0">
                      {Math.round(saved.heading)}°
                    </span>
                    <button
                      onClick={() => handleDelete(saved.id)}
                      title="Remove"
                      className="text-slate-500 hover:text-red-400 transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {loadError && (
              <p className="text-xs text-red-400 text-center">{loadError}</p>
            )}

            <div className="text-center">
              <p className="text-slate-500 text-xs leading-relaxed">
                Hold your device flat for accurate readings
              </p>
              <p className="text-slate-500 text-xs leading-relaxed">
                កាន់ឧបករណ៍របស់អ្នកឱ្យរាបស្មើទើបត្រឹមត្រូវ
              </p>
            </div>
          </div>
        )}
      </div>

      {showSaveDialog && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 z-50"
          onClick={() => setShowSaveDialog(false)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl p-5 w-full max-w-xs shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <Crosshair className="w-5 h-5 text-cyan-400" />
              <h2 className="text-white font-semibold">Save direction</h2>
            </div>

            <label className="block text-xs text-slate-400 mb-1">Name</label>
            <input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g. Home, Masjid, Landmark"
              maxLength={40}
              autoFocus
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 mb-3"
            />

            <label className="block text-xs text-slate-400 mb-1.5">Marker color</label>
            <div className="flex gap-2 mb-4">
              {MARKER_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSaveColor(color)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    saveColor === color
                      ? 'ring-2 ring-white/80 ring-offset-2 ring-offset-slate-800 scale-110'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color }}
                ></button>
              ))}
            </div>

            {savingState === 'error' && (
              <p className="text-xs text-red-400 mb-3">
                Couldn't save. Check your connection and try again.
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSavingState('idle');
                }}
                className="flex-1 py-2 rounded-lg text-sm text-slate-300 border border-slate-700 hover:bg-slate-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={savingState === 'saving'}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white transition-colors"
              >
                {savingState === 'saving' ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
