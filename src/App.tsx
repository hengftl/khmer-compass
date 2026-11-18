import { useState, useEffect } from 'react';
import { Navigation } from 'lucide-react';

function App() {
  const [heading, setHeading] = useState<number>(0);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

  useEffect(() => {
    if (!('DeviceOrientationEvent' in window)) {
      setIsSupported(false);
      return;
    }

    const requestPermission = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            setPermissionGranted(true);
          }
        } catch (error) {
          console.error('Error requesting device orientation permission:', error);
        }
      } else {
        setPermissionGranted(true);
      }
    };

    requestPermission();
  }, []);

  useEffect(() => {
    if (!permissionGranted) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setHeading(event.alpha);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [permissionGranted]);

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

  const requestPermissionHandler = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
        }
      } catch (error) {
        console.error('Error requesting permission:', error);
      }
    }
  };

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
              <p className="text-amber-400 font-semibold mb-2">
                Mobile Device Required
              </p>
              <p className="text-amber-300/80 text-sm">
                This compass app works on smartphones and tablets with orientation sensors (iOS and Android).
              </p>
            </div>
          )}

          {isSupported && !permissionGranted && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 text-center max-w-sm">
              <p className="text-blue-400 mb-4 text-sm">
                Permission needed to access device orientation
              </p>
              <button
                onClick={requestPermissionHandler}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-6 py-3 rounded-lg font-medium transition-all"
              >
                Grant Permission
              </button>
            </div>
          )}

          {isSupported && permissionGranted && (
            <div
              className="relative w-full max-w-md aspect-square"
              style={{ width: 'min(100%, calc(100dvh - 250px))' }}
            >
              <div className="absolute inset-0 transition-transform duration-300 ease-out" style={{ transform: `rotate(${heading}deg)` }}>
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
                        className="absolute top-[3%] left-1/2 -translate-x-1/2 flex flex-col items-center"
                        style={{ transform: `translateX(-50%) rotate(${-direction.angle}deg)` }}
                      >
                        <span
                          className={`font-bold leading-tight ${
                            direction.angle === 0 ? 'text-red-500 text-base sm:text-lg' : 'text-slate-400 text-sm'
                          }`}
                        >
                          {direction.label}
                        </span>
                        <span className="text-[10px] leading-tight text-slate-500">{direction.sublabel}</span>
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
            <div className="inline-block bg-slate-900/80 rounded-xl px-5 py-2 border border-slate-700/50 text-center">
              <p className="text-xs text-slate-400 leading-snug">ទិសដៅ / Heading</p>
              <p className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                {Math.round(heading)}°
              </p>
            </div>
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
    </div>
  );
}

export default App;
