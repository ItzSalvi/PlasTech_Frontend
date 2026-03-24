import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Leaf, QrCode } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export function InsertBottles() {
  const { user, refreshUser, logout } = useAuth();
  // Show loading spinner if user context is not loaded
  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 640"
          className="h-16 w-16 text-green-500 animate-spin"
          style={{ color: '#22c55e' }}
        >
          <path
            fill="currentColor"
            d="M216.3 124C262.5 44 378 44 424.2 124L461.5 188.6L489.2 172.6C497.6 167.7 508.1 168.4 515.8 174.3C523.5 180.2 526.9 190.2 524.4 199.6L500.9 287C497.5 299.8 484.3 307.4 471.5 304L384.1 280.6C374.7 278.1 367.8 270.2 366.5 260.6C365.2 251 369.9 241.5 378.3 236.7L406 220.7L368.7 156.1C347.1 118.8 293.3 118.8 271.7 156.1L266.4 165.2C257.6 180.5 238 185.7 222.7 176.9C207.4 168.1 202.2 148.5 211 133.1L216.3 124zM513.7 343.1C529 334.3 548.6 339.5 557.4 354.8L562.7 363.9C608.9 443.9 551.2 543.9 458.8 543.9L384.2 543.9L384.2 575.9C384.2 585.6 378.4 594.4 369.4 598.1C360.4 601.8 350.1 599.8 343.2 592.9L279.2 528.9C269.8 519.5 269.8 504.3 279.2 495L343.2 431C350.1 424.1 360.4 422.1 369.4 425.8C378.4 429.5 384.2 438.3 384.2 448L384.2 480L458.8 480C501.9 480 528.9 433.3 507.3 396L502 386.9C493.2 371.6 498.4 352 513.7 343.2zM115 299.4L87.3 283.4C78.9 278.5 74.2 269.1 75.5 259.5C76.8 249.9 83.7 242 93.1 239.5L180.5 216C193.3 212.6 206.5 220.2 209.9 233L233.3 320.4C235.8 329.8 232.4 339.7 224.7 345.7C217 351.7 206.5 352.3 198.1 347.4L170.4 331.4L133.1 396C111.5 433.3 138.5 480 181.6 480L192.2 480C209.9 480 224.2 494.3 224.2 512C224.2 529.7 209.9 544 192.2 544L181.6 544C89.3 544 31.6 444 77.8 364L115 299.4z"
          />
        </svg>
      </div>
    );
  }
  const location = useLocation();
  const navigate = useNavigate();
  const [binId, setBinId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [sessionStats, setSessionStats] = useState<{ userPoints: number; bottlesLogged: number; pointsThisSession: number } | null>(null);
  const userEndedSessionRef = useRef(false);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  /** If the scanned or URL content has ?binId=xxx, use xxx so backend and Arduino match. */
  const normalizeBinId = (value: string | null): string | null => {
    if (!value || !value.trim()) return null;
    const trimmed = value.trim();
    try {
      const match = trimmed.match(/[?&]binId=([^&]+)/);
      if (match) return decodeURIComponent(match[1]);
    } catch {
      /* ignore */
    }
    return trimmed;
  };

  // Whether user landed via QR link (insert?binId=...) — if so we never use camera (works on HTTP)
  const urlBinId = normalizeBinId(new URLSearchParams(location.search).get('binId'));

  useEffect(() => {
    // If we arrived via QR code with a binId in the URL, auto-connect (no camera needed)
    if (urlBinId && !binId && user?.id) {
      (async () => {
        try {
          setIsConnecting(true);
          const res = await api.post('/iot/connect', { binId: urlBinId, userId: user.id });
          setSessionId(res.data.sessionId);
          setBinId(urlBinId);
          setError('');
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to connect to bin from QR code.');
        } finally {
          setIsConnecting(false);
        }
      })();
    }
  }, [location.search, binId, user?.id, urlBinId]);

  useEffect(() => {
    // Only init camera scanner when NOT opened via QR link (camera requires HTTPS or localhost)
    if (urlBinId) return;
    if (!binId && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          videoConstraints: { facingMode: "environment" },
          rememberLastUsedCamera: false // Hide camera selection, always use default environment camera
        },
        /* verbose= */ false
      );
      scannerRef.current.render(onScanSuccess, onScanFailure);
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [binId, urlBinId]);

  // Poll session status (points + bottles) while connected
  useEffect(() => {
    if (!binId) {
      setSessionStats(null);
      return;
    }
    const fetchStatus = async () => {
      try {
        const res = await api.get('/iot/status', { params: { binId } });
        if (res.data?.hasUser && (res.data.userPoints !== undefined || res.data.bottlesLogged !== undefined)) {
          setSessionStats({
            userPoints: res.data.userPoints ?? 0,
            bottlesLogged: res.data.bottlesLogged ?? 0,
            pointsThisSession: res.data.pointsThisSession ?? 0,
          });
        }
      } catch {
        setSessionStats(null);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [binId]);

  // Handle cleanup when user navigates away (not when they click "End Session")
  useEffect(() => {
    return () => {
      if (binId) {
        api.post('/iot/disconnect', { binId }).catch(e => console.error(e));
        // Only logout when leaving the page (e.g. closing tab, navigating away). Do not logout when user clicked "End Session".
        if (!userEndedSessionRef.current) {
          logout();
        }
      }
    };
  }, [binId]);

  const onScanSuccess = async (decodedText: string) => {
    if (isConnecting) return;
    const actualBinId = normalizeBinId(decodedText) ?? decodedText.trim();
    setIsConnecting(true);
    try {
      if (scannerRef.current) {
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
      const res = await api.post('/iot/connect', { binId: actualBinId, userId: user?.id });
      setSessionId(res.data.sessionId);
      setBinId(actualBinId);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to connect to bin');
      setIsConnecting(false);
    }
  };

  const onScanFailure = (err: any) => {
    // Ignored, happens constantly during scanning
  };

  const handleDisconnect = async () => {
    if (binId) {
      try {
        userEndedSessionRef.current = true; // Prevent cleanup from logging user out
        await api.post('/iot/disconnect', { binId });
        setBinId(null);
        setSessionId(null);
        setSessionStats(null);
        await refreshUser(); // Fetch updated total points
        navigate('/transactions', { replace: true }); // Go to transactions so user sees session + no data loss
      } catch (err: any) {
        setError('Failed to disconnect');
        userEndedSessionRef.current = false;
      }
    }
  };

  return (
    <div className="container mx-auto max-w-lg px-4 py-12">
      <Card className="text-center shadow-lg border-border bg-card">
        <CardHeader className="flex flex-col items-center text-center gap-2 pb-2">
          <div className="w-full flex justify-center">
            <div className="flex flex-col items-center justify-center mb-2">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20 shadow-inner">
                {binId ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="h-10 w-10">
                    <path fill="#16a34a" d="M216.3 124C262.5 44 378 44 424.2 124L461.5 188.6L489.2 172.6C497.6 167.7 508.1 168.4 515.8 174.3C523.5 180.2 526.9 190.2 524.4 199.6L500.9 287C497.5 299.8 484.3 307.4 471.5 304L384.1 280.6C374.7 278.1 367.8 270.2 366.5 260.6C365.2 251 369.9 241.5 378.3 236.7L406 220.7L368.7 156.1C347.1 118.8 293.3 118.8 271.7 156.1L266.4 165.2C257.6 180.5 238 185.7 222.7 176.9C207.4 168.1 202.2 148.5 211 133.1L216.3 124zM513.7 343.1C529 334.3 548.6 339.5 557.4 354.8L562.7 363.9C608.9 443.9 551.2 543.9 458.8 543.9L384.2 543.9L384.2 575.9C384.2 585.6 378.4 594.4 369.4 598.1C360.4 601.8 350.1 599.8 343.2 592.9L279.2 528.9C269.8 519.5 269.8 504.3 279.2 495L343.2 431C350.1 424.1 360.4 422.1 369.4 425.8C378.4 429.5 384.2 438.3 384.2 448L384.2 480L458.8 480C501.9 480 528.9 433.3 507.3 396L502 386.9C493.2 371.6 498.4 352 513.7 343.2zM115 299.4L87.3 283.4C78.9 278.5 74.2 269.1 75.5 259.5C76.8 249.9 83.7 242 93.1 239.5L180.5 216C193.3 212.6 206.5 220.2 209.9 233L233.3 320.4C235.8 329.8 232.4 339.7 224.7 345.7C217 351.7 206.5 352.3 198.1 347.4L170.4 331.4L133.1 396C111.5 433.3 138.5 480 181.6 480L192.2 480C209.9 480 224.2 494.3 224.2 512C224.2 529.7 209.9 544 192.2 544L181.6 544C89.3 544 31.6 444 77.8 364L115 299.4z"/>
                  </svg>
                ) : (
                  <QrCode className="h-10 w-10 text-green-600 dark:text-green-500" />
                )}
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl md:text-4xl font-bold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-2">
            {binId ? 'Session Active' : 'Scan Bin QR Code'}
          </CardTitle>
          <CardDescription className="max-w-[320px] sm:max-w-sm mx-auto mt-2 text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {binId 
              ? <>Connected to Bin: <strong className="text-zinc-900 dark:text-zinc-100">{binId}</strong>. Start inserting plastic bottles.</>
              : (
                <>
                  <span className="block mb-1">Allow camera access and point your device at the QR code on the PlasTech smart bin to begin.</span>
                </>
              )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

          {urlBinId && !binId && (
            <div className="p-6 bg-muted/50 rounded-lg border text-center text-muted-foreground">
              {!user ? (
                <p>Please log in first, then scan the bin QR code again.</p>
              ) : isConnecting ? (
                <p>Connecting to bin...</p>
              ) : null}
            </div>
          )}

          {!binId && !urlBinId && (
            <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
              <div 
                id="qr-reader" 
                className="w-full mx-auto overflow-hidden rounded-2xl border border-border shadow-sm bg-zinc-50 dark:bg-zinc-900/50 p-2 sm:p-4 flex flex-col items-center justify-center relative" 
                style={{ maxWidth: 360, minHeight: 320 }} 
              />
              <div className="mt-6 text-sm text-zinc-500 dark:text-zinc-400 text-center flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Make sure the QR code is well lit and in focus.
              </div>
            </div>
          )}

          {binId && (
            <div className="space-y-6">
              {sessionStats !== null && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-lg border bg-muted/30 text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                      {sessionStats.userPoints.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Total points</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/30 text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {sessionStats.pointsThisSession.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Points this session</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/30 text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {sessionStats.bottlesLogged.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Bottles this session</p>
                  </div>
                </div>
              )}
              <div className="p-6 bg-muted/50 rounded-lg border">
                <p className="text-lg font-medium text-green-600">Waiting for bottles...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  The machine&apos;s IR sensors will automatically credit your account. Totals update every few seconds.
                </p>
              </div>
              <Button
                onClick={handleDisconnect}
                variant="secondary"
                className="w-full bg-red-600/20 hover:bg-red-700/40 text-red-700 border-none shadow-lg gap-2 rounded-[5px] px-8 py-5 text-lg transition-all"
              >
                End Session & Check Out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
