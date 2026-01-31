import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface QRScannerProps {
  onScan: (workerId: string) => void;
  className?: string;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, className }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualId, setManualId] = useState('');
  const [isFileScanning, setIsFileScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMountedRef = useRef(true);
  // IMPORTANT: Use a per-mount unique ID so fast route changes don't collide.
  const containerIdRef = useRef(`qr-scanner-${Math.random().toString(36).slice(2)}`);

  const getMountEl = () => document.getElementById(containerIdRef.current);

  const getErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return 'Unknown error';
  };

  const isLikelyWorkerId = (value: string) => {
    const v = value.trim();
    // Accept common patterns (keep permissive for demo)
    return v.length >= 3 && v.length <= 64;
  };

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current) {
        const scannerState = scannerRef.current.getState();
        // Only stop if actually scanning (state 2 = SCANNING)
        if (scannerState === 2) {
          await scannerRef.current.stop();
        }
        // Clear ONLY while the mount element still exists (prevents DOM errors on fast unmounts)
        if (getMountEl()) {
          scannerRef.current.clear();
        }
        scannerRef.current = null;
      }
    } catch (err) {
      console.error('Error stopping scanner:', err);
    } finally {
      if (isMountedRef.current) {
        setIsScanning(false);
      }
    }
  }, []);

  const startWithCameraId = useCallback(
    async (cameraId: string) => {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(containerIdRef.current);
      }

      await scannerRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          if (!isMountedRef.current) return;
          // Stop first to avoid route/unmount races, then notify parent.
          await stopScanner();
          if (!isMountedRef.current) return;
          onScan(decodedText);
        },
        () => {
          // scanning in progress
        }
      );
    },
    [onScan, stopScanner]
  );

  const startScanner = useCallback(async () => {
    try {
      setError(null);
      
      // Stop any existing scanner first
      await stopScanner();
      
      // Small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!isMountedRef.current) return;

      // Ensure mount element exists before creating scanner
      if (!getMountEl()) {
        throw new Error('Scanner mount element not found (page still rendering). Please try again.');
      }

      // Pick an actual camera device (more reliable than facingMode constraints)
      const cameras = await Html5Qrcode.getCameras().catch((e) => {
        console.warn('getCameras failed:', e);
        return [];
      });

      if (!cameras || cameras.length === 0) {
        throw new Error(
          'No camera device found. If you are in an embedded preview, try opening the app in a new tab and allow camera permission.'
        );
      }

      const preferred =
        cameras.find((c) => /back|rear|environment/i.test(c.label)) ??
        cameras.find((c) => /camera 2|camera2/i.test(c.label)) ??
        cameras[0];

      // Try preferred camera first, then fall back across others.
      const ordered = [preferred, ...cameras.filter((c) => c.id !== preferred.id)];
      let lastErr: unknown = null;
      for (const cam of ordered) {
        try {
          await startWithCameraId(cam.id);
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
          console.warn('Failed to start camera', cam, e);
          await stopScanner();
          await new Promise((resolve) => setTimeout(resolve, 120));
        }
      }

      if (lastErr) {
        throw lastErr;
      }

      if (isMountedRef.current) {
        setIsScanning(true);
      }
    } catch (err) {
      console.error('Error starting scanner:', err);
      if (isMountedRef.current) {
        setError(`Could not access camera: ${getErrorMessage(err)}`);
        setIsScanning(false);
      }
    }
  }, [startWithCameraId, stopScanner]);

  const handleScanFromImage = useCallback(
    async (file: File) => {
      try {
        setError(null);
        setIsFileScanning(true);

        // Ensure any live scanner is stopped first
        await stopScanner();

        // Ensure mount element exists
        if (!getMountEl()) {
          throw new Error('Scanner mount element not found. Please try again.');
        }

        const tmp = new Html5Qrcode(containerIdRef.current);
        try {
          const decodedText = await tmp.scanFile(file, true);
          if (!isMountedRef.current) return;
          onScan(decodedText);
        } finally {
          // scanFile renders into the container; clear it afterward
          try {
            tmp.clear();
          } catch {
            // ignore
          }
        }
      } catch (e) {
        console.error('scanFile failed:', e);
        if (isMountedRef.current) {
          setError(`Could not scan image: ${getErrorMessage(e)}`);
        }
      } finally {
        if (isMountedRef.current) setIsFileScanning(false);
      }
    },
    [onScan, stopScanner]
  );

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      // Cleanup on unmount
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState();
          if (state === 2) {
            scannerRef.current.stop().catch(() => {});
          }
          // Only clear if mount element still exists
          if (getMountEl()) {
            scannerRef.current.clear();
          }
        } catch (e) {
          // Ignore cleanup errors
        }
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/*
        IMPORTANT: React must never render children inside the html5-qrcode mount node.
        Otherwise html5-qrcode DOM mutations can conflict with React's reconciler, causing removeChild() errors.
      */}
      <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-muted">
        <div id={containerIdRef.current} className="h-full w-full" />

        {!isScanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-10 h-10 text-primary" />
              </div>
              <p className="text-muted-foreground">Click "Start Scanner" to scan a worker's QR code</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <CameraOff className="w-10 h-10 text-destructive" />
              </div>
              <p className="text-destructive text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        {!isScanning ? (
          <Button onClick={startScanner} size="lg" variant="healthcare">
            <Camera className="w-5 h-5 mr-2" />
            Start Scanner
          </Button>
        ) : (
          <>
            <Button onClick={stopScanner} variant="outline" size="lg">
              <CameraOff className="w-5 h-5 mr-2" />
              Stop Scanner
            </Button>
            <Button
              onClick={async () => {
                await stopScanner();
                setTimeout(startScanner, 200);
              }}
              variant="secondary"
              size="lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Restart
            </Button>
          </>
        )}
      </div>

      {/* Manual fallback to keep demo flow functional even without webcam */}
      {!isScanning && (
        <div className="w-full max-w-md mt-6">
          <p className="text-sm text-muted-foreground mb-2">No camera? Enter Worker ID manually</p>
          <div className="flex gap-2">
            <Input
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="e.g. WKR-000123"
              inputMode="text"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const v = manualId.trim();
                if (!isLikelyWorkerId(v)) {
                  setError('Please enter a valid Worker ID.');
                  return;
                }
                onScan(v);
              }}
            >
              Use ID
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => window.open(window.location.href, '_blank', 'noopener,noreferrer')}
            >
              Open New Tab
            </Button>
          </div>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Or scan from an image (screenshot / photo of QR)</p>
            <Input
              type="file"
              accept="image/*"
              disabled={isFileScanning}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                void handleScanFromImage(file);
                // allow selecting the same file again
                e.currentTarget.value = '';
              }}
            />
            {isFileScanning && (
              <p className="text-xs text-muted-foreground mt-2">Scanning image…</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
