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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">ត្រីវិស័យ</h1>
          <p className="text-slate-400">Compass - ត្រីវិស័យខ្មែរ</p>
        </div>

        {!isSupported && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 text-center">
            <p className="text-amber-400 font-semibold mb-2">
              Mobile Device Required
            </p>
            <p className="text-amber-300/80 text-sm">
              This compass app works on smartphones and tablets with orientation sensors (iOS and Android).
            </p>
            <p className="text-amber-300/60 text-xs mt-3">
              ជើងបាទ/ស្រី។ অ্যাপ្លিकেশនទាំងនេះ ត្រូវការឧបករណ៍ដែលមានឯកតា Orientation
            </p>
          </div>
        )}

        {isSupported && !permissionGranted && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 text-center">
            <p className="text-blue-400 mb-4">
              Permission needed to access device orientation
            </p>
            <button
              onClick={requestPermissionHandler}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Grant Permission
            </button>
          </div>
        )}

        {isSupported && permissionGranted && (
          <div className="relative">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-slate-700/50">
              <div className="relative w-full aspect-square">
                <div
                  className="absolute inset-0 transition-transform duration-300 ease-out"
                  style={{ transform: `rotate(${heading}deg)` }}
                >
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-4 border-slate-600/30"></div>

                    <div className="absolute inset-8 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-inner"></div>

                    {directions.map((direction) => (
                      <div
                        key={direction.angle}
                        className="absolute top-1/2 left-1/2 origin-center"
                        style={{
                          transform: `translate(-50%, -50%) rotate(${direction.angle}deg) translateY(-140px)`,
                        }}
                      >
                        <div
                          className="flex flex-col items-center"
                          style={{
                            transform: `rotate(-${direction.angle}deg)`,
                          }}
                        >
                          <span
                            className={`text-xl font-bold mb-1 ${
                              direction.angle === 0 ? 'text-red-500' : 'text-slate-400'
                            }`}
                          >
                            {direction.label}
                          </span>
                          <span className="text-xs text-slate-500">{direction.sublabel}</span>
                        </div>
                      </div>
                    ))}

                    {[...Array(36)].map((_, i) => {
                      const angle = i * 10;
                      const isMajor = angle % 30 === 0;
                      return (
                        <div
                          key={i}
                          className="absolute top-1/2 left-1/2 origin-center"
                          style={{
                            transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                          }}
                        >
                          <div
                            className={`${
                              isMajor
                                ? 'w-1 h-6 bg-slate-600'
                                : 'w-0.5 h-3 bg-slate-700'
                            } mx-auto`}
                            style={{ marginTop: '-160px' }}
                          ></div>
                        </div>
                      );
                    })}

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
                  </div>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center mt-12">
                  <Navigation className="w-12 h-12 text-red-500 mb-2" />
                </div>
              </div>

              <div className="mt-6 text-center">
                <div className="inline-block bg-slate-900/80 rounded-xl px-6 py-3 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">ទិសដៅ / Heading</p>
                  <p className="text-3xl font-bold text-white">
                    {Math.round(heading)}°
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-slate-500 text-sm">
                Hold your device flat for accurate readings
              </p>
              <p className="text-slate-500 text-sm mt-1">
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
