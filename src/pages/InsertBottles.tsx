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
        { fps: 10, qrbox: { width: 250, height: 250 } },
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
      <Card className="text-center">
        <CardHeader className="flex flex-col items-center text-center">
          <div className="w-fit mx-auto bg-green-100 p-4 rounded-full mb-4 dark:bg-green-500/10">
            {binId ? <Leaf className="h-10 w-10 text-green-600 dark:text-green-500" /> : <QrCode className="h-10 w-10 text-green-600 dark:text-green-500" />}
          </div>
          <CardTitle className="text-2xl mt-2">
            {binId ? 'Session Active' : 'Scan Bin Label'}
          </CardTitle>
          <CardDescription className="max-w-[280px] sm:max-w-xs mx-auto mt-2">
            {binId 
              ? `Connected to Bin: ${binId}. Start inserting plastic bottles.`
              : 'Point your camera at the QR code on the PlasTech smart bin.'}
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
            <div id="qr-reader" className="w-full mx-auto overflow-hidden rounded-lg border-2 border-border" />
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
              <Button onClick={handleDisconnect} variant="destructive" className="w-full">
                End Session & Check Out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
