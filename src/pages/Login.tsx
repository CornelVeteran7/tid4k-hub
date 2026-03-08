import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, UserPlus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import logoBlack from '@/assets/logo-black.png';

interface OrgBranding {
  name: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
}

export default function Login() {
  const { login, signUp, loginWithGoogle, isLoading } = useAuth();
  const { orgSlug } = useParams<{ orgSlug?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [orgBranding, setOrgBranding] = useState<OrgBranding | null>(null);

  useEffect(() => {
    if (!orgSlug) return;
    supabase
      .from('organizations')
      .select('name, logo_url, primary_color, secondary_color')
      .eq('slug', orgSlug)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setOrgBranding(data as OrgBranding);
      });
  }, [orgSlug]);

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

  const primaryColor = orgBranding?.primary_color || undefined;
  const logoSrc = orgBranding?.logo_url || logoBlack;
  const orgName = orgBranding?.name || 'TID4K';

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background p-4"
      style={primaryColor ? {
        background: `linear-gradient(135deg, ${primaryColor}11 0%, transparent 50%)`,
      } : undefined}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={logoSrc}
            alt={orgName}
            className="h-12 mx-auto mb-3"
            style={orgBranding?.logo_url ? { height: 56, objectFit: 'contain' } : undefined}
          />
          <h1 className="text-2xl font-display font-bold text-foreground">{orgName}</h1>
          <p className="text-sm text-muted-foreground mt-1 font-serif">
            {orgBranding ? orgBranding.name : 'Talk-to-Infodisplay'}
          </p>
        </div>

        <Card className="shadow-lg" style={primaryColor ? {
          borderTop: `3px solid ${primaryColor}`,
        } : undefined}>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Autentificare</CardTitle>
            <CardDescription>
              {orgBranding ? `Conectează-te la ${orgBranding.name}` : 'Conectează-te la platformă'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Conectare
                </TabsTrigger>
                <TabsTrigger value="signup" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Înregistrare
                </TabsTrigger>
              </TabsList>

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
                    style={primaryColor ? { backgroundColor: primaryColor } : undefined}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Conectare
                  </Button>
                </form>
              </TabsContent>

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
                    style={primaryColor ? { backgroundColor: primaryColor } : undefined}
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
          © 2026 TID4K — Talk-to-Infodisplay
        </p>
      </motion.div>
    </div>
  );
}
