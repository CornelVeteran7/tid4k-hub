import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Mail, UserPlus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { tid4kApi } from '@/api/tid4kClient';
import { toast } from 'sonner';

export default function Login() {
  const { login, signUp, loginWithGoogle, isLoading, setDemoUser } = useAuth();
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug?: string }>();
  const [telefon, setTelefon] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loadingTelefon, setLoadingTelefon] = useState(false);

  const handleLoginTelefon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoadingTelefon(true);

    try {
      const sesiune = await tid4kApi.autentificareTelefon(telefon);

      // Converteste sesiunea TID4K in format DemoConfig/UserSession
      // si seteaza userul prin setDemoUser (care actualizeaza AuthContext)
      const grupe = (sesiune.toate_grupele_clase || [sesiune.grupa_clasa_copil]).map((g) => ({
        id: g,
        nume: g.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        tip: 'gradinita' as const,
      }));

      // Superuserul Inky se identifica prin telefon 1313131313
      const esteInky = sesiune.telefon && sesiune.telefon.replace(/\D/g, '').includes('1313131313');
      const numeAfisat = esteInky ? 'Inky' : sesiune.nume_prenume;

      setDemoUser({
        vertical: 'kids',
        status: sesiune.status,
        orgName: '',
        groups: grupe,
        userName: numeAfisat,
      });

      toast.success(`Bine ai venit, ${numeAfisat}!`);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Numărul de telefon nu a fost găsit.');
    } finally {
      setLoadingTelefon(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Email sau parolă incorectă.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await signUp(email, password, fullName);
      setMessage('Verifică-ți email-ul pentru a confirma contul!');
    } catch (err: any) {
      setError(err.message || 'Eroare la înregistrare.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Eroare la autentificarea cu Google.');
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
          <h1 className="text-2xl font-display font-bold text-foreground">TID4K</h1>
          <p className="text-sm text-muted-foreground mt-1 font-serif">
            Talk-to-Infodisplay
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Autentificare</CardTitle>
            <CardDescription>
              Conectează-te la platformă
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="telefon" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="telefon" className="gap-1 text-xs sm:text-sm">
                  <Phone className="h-4 w-4" />
                  Telefon
                </TabsTrigger>
                <TabsTrigger value="login" className="gap-1 text-xs sm:text-sm">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="signup" className="gap-1 text-xs sm:text-sm">
                  <UserPlus className="h-4 w-4" />
                  Cont nou
                </TabsTrigger>
              </TabsList>

              {/* Tab principal: Login cu telefon */}
              <TabsContent value="telefon">
                <form onSubmit={handleLoginTelefon} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-telefon">Număr de telefon</Label>
                    <Input
                      id="login-telefon"
                      type="tel"
                      placeholder="07xxxxxxxx"
                      value={telefon}
                      onChange={(e) => setTelefon(e.target.value)}
                      required
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      Introdu numărul de telefon înregistrat în sistem
                    </p>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loadingTelefon || !telefon.trim()}
                  >
                    {loadingTelefon ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Phone className="h-4 w-4 mr-2" />}
                    Conectare cu telefon
                  </Button>
                </form>
              </TabsContent>

              {/* Tab: Login cu email (viitor) */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="email@exemplu.ro"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Parolă</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  {message && <p className="text-sm text-green-600">{message}</p>}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Conectare
                  </Button>
                </form>
              </TabsContent>

              {/* Tab: Inregistrare (viitor) */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nume complet</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Ion Popescu"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="email@exemplu.ro"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Parolă</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Min. 6 caractere"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  {message && <p className="text-sm text-green-600">{message}</p>}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Creează cont
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-4 pt-4 border-t space-y-3">
              <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Conectare cu Google
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          &copy; 2026 TID4K &mdash; Talk-to-Infodisplay
        </p>
      </motion.div>
    </div>
  );
}
