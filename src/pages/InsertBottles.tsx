import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Leaf, QrCode } from 'lucide-react';

export function InsertBottles() {
  const { user, refreshUser } = useAuth();
  const [binId, setBinId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // If we're not connected to a bin, initialize the scanner
    if (!binId) {
      if (!scannerRef.current) {
        scannerRef.current = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );
        scannerRef.current.render(onScanSuccess, onScanFailure);
      }
    }

    return () => {
      // Clean up the scanner
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error(e));
        scannerRef.current = null;
      }
    };
  }, [binId]);

  // Handle cleanup and disconnecting from the backend session on unmount
  useEffect(() => {
    return () => {
      if (binId) {
        api.post('/iot/disconnect', { binId }).catch(e => console.error(e));
      }
    };
  }, [binId]);

  const onScanSuccess = async (decodedText: string) => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      if (scannerRef.current) {
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
      const res = await api.post('/iot/connect', { binId: decodedText, userId: user?.id });
      setSessionId(res.data.sessionId);
      setBinId(decodedText);
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
        await api.post('/iot/disconnect', { binId });
        setBinId(null);
        setSessionId(null);
        await refreshUser(); // Fetch updated total points
      } catch (err: any) {
        setError('Failed to disconnect');
      }
    }
  };

  return (
    <div className="container mx-auto max-w-lg px-4 py-12">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 p-4 rounded-full mb-4 dark:bg-green-900/50">
            {binId ? <Leaf className="h-10 w-10 text-green-600" /> : <QrCode className="h-10 w-10 text-green-600" />}
          </div>
          <CardTitle className="text-2xl">
            {binId ? 'Session Active' : 'Scan Bin Label'}
          </CardTitle>
          <CardDescription>
            {binId 
              ? `Connected to Bin: ${binId}. Start inserting plastic bottles.`
              : 'Point your camera at the QR code on the PlasTech smart bin.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
          
          {!binId && (
            <div id="qr-reader" className="w-full mx-auto overflow-hidden rounded-lg border-2 border-border" />
          )}

          {binId && (
            <div className="space-y-6">
              <div className="p-6 bg-muted/50 rounded-lg border animate-pulse">
                <p className="text-lg font-medium text-green-600">Waiting for bottles...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  The machine's IR sensors will automatically credit your account. Just refresh the dashboard later to see your updated total.
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
