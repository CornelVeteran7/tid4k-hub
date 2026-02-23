import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRCodeSVG } from 'qrcode.react';
import { Phone, QrCode, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import logoBlack from '@/assets/logo-black.png';

export default function Login() {
  const { login, qrLogin, isLoading } = useAuth();
  const [telefon, setTelefon] = useState('');
  const [pin, setPin] = useState('');
  const [qrSessionId, setQrSessionId] = useState(() => `tid4k_${Date.now()}`);
  const [error, setError] = useState('');

  // Refresh QR every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      setQrSessionId(`tid4k_${Date.now()}`);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(telefon, pin);
    } catch {
      setError('Număr de telefon sau PIN incorect.');
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    try {
      await login('0721234567', '1234');
    } catch {
      setError('Eroare la autentificare.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary text-primary-foreground mb-4">
            <span className="font-display font-bold text-xl">T4K</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">TID4K</h1>
          <p className="text-sm text-muted-foreground mt-1 font-serif">Talk-to-Infodisplay</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Autentificare</CardTitle>
            <CardDescription>Conectează-te la platforma școlară</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="telefon" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="telefon" className="gap-2">
                  <Phone className="h-4 w-4" />
                  Telefon
                </TabsTrigger>
                <TabsTrigger value="qr" className="gap-2">
                  <QrCode className="h-4 w-4" />
                  Cod QR
                </TabsTrigger>
              </TabsList>

              <TabsContent value="telefon">
                <form onSubmit={handlePhoneLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefon">Număr de telefon</Label>
                    <Input
                      id="telefon"
                      type="tel"
                      placeholder="07XX XXX XXX"
                      value={telefon}
                      onChange={(e) => setTelefon(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pin">PIN</Label>
                    <Input
                      id="pin"
                      type="password"
                      placeholder="••••"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Conectare
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="qr">
                <div className="flex flex-col items-center gap-4 py-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Scanează codul QR cu camera telefonului pentru autentificare rapidă
                  </p>
                  <div className="p-4 bg-card rounded-xl border">
                    <QRCodeSVG value={qrSessionId} size={200} level="M" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Se reîmprospătează automat la fiecare 60 de secunde
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full" onClick={handleDemoLogin} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Intră cu cont demo
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 TID4K — Talk-to-Infodisplay
        </p>
      </motion.div>
    </div>
  );
}
