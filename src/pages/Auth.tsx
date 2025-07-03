import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Package, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const {
    signIn,
    signUp,
    user
  } = useAuth();
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    isTemporaryCompany: false
  });

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      navigate('/', {
        replace: true
      });
    }
  }, [user, navigate]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const {
        error
      } = await signIn(loginForm.email, loginForm.password);
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError('Por favor, confirma tu email antes de iniciar sesión.');
        } else if (error.message.includes('Invalid login credentials')) {
          setError('Credenciales incorrectas. Verifica tu email y contraseña.');
        } else {
          setError(error.message);
        }
      } else {
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión exitosamente."
        });
        // La navegación se manejará automáticamente por el useEffect
      }
    } catch (err) {
      setError('Error inesperado al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }
    if (registerForm.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }
    try {
      const {
        error
      } = await signUp(registerForm.email, registerForm.password, registerForm.name, registerForm.company || undefined, registerForm.isTemporaryCompany);
      if (error) {
        if (error.message.includes('User already registered')) {
          setError('Este email ya está registrado. Intenta iniciar sesión.');
        } else {
          setError(error.message);
        }
      } else {
        toast({
          title: "¡Registro exitoso!",
          description: "Revisa tu email para confirmar tu cuenta antes de iniciar sesión."
        });
        setRegisterForm({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          company: '',
          isTemporaryCompany: false
        });
      }
    } catch (err) {
      setError('Error inesperado al registrarse');
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Soft</h1>
          <p className="text-gray-600 mt-2">Tu inventario en orden con solo unos clics</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>

          {/* Pestaña de Login */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Iniciar Sesión</CardTitle>
                <CardDescription>
                  Ingresa tus credenciales para acceder a tu cuenta
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  {error && <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>}
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" placeholder="tu@email.com" value={loginForm.email} onChange={e => setLoginForm(prev => ({
                    ...prev,
                    email: e.target.value
                  }))} required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <div className="relative">
                      <Input id="login-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm(prev => ({
                      ...prev,
                      password: e.target.value
                    }))} required />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Pestaña de Registro */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Crear Cuenta</CardTitle>
                <CardDescription>
                  Completa el formulario para crear tu cuenta
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  {error && <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>}
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nombre completo</Label>
                    <Input id="register-name" type="text" placeholder="Tu nombre" value={registerForm.name} onChange={e => setRegisterForm(prev => ({
                    ...prev,
                    name: e.target.value
                  }))} required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input id="register-email" type="email" placeholder="tu@email.com" value={registerForm.email} onChange={e => setRegisterForm(prev => ({
                    ...prev,
                    email: e.target.value
                  }))} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-company">Nombre del Negocio</Label>
                    <Input id="register-company" type="text" placeholder="Nombre de tu empresa o negocio" value={registerForm.company} onChange={e => setRegisterForm(prev => ({
                    ...prev,
                    company: e.target.value
                  }))} disabled={registerForm.isTemporaryCompany} />
                    <div className="flex items-center space-x-2">
                      <Checkbox id="temporary-company" checked={registerForm.isTemporaryCompany} onCheckedChange={checked => {
                      setRegisterForm(prev => ({
                        ...prev,
                        isTemporaryCompany: !!checked,
                        company: checked ? '' : prev.company
                      }));
                    }} />
                      <Label htmlFor="temporary-company" className="text-sm text-gray-600">
                        Aún no tengo nombre definido (temporal)
                      </Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <Input id="register-password" type="password" placeholder="••••••••" value={registerForm.password} onChange={e => setRegisterForm(prev => ({
                    ...prev,
                    password: e.target.value
                  }))} required minLength={6} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm">Confirmar contraseña</Label>
                    <Input id="register-confirm" type="password" placeholder="••••••••" value={registerForm.confirmPassword} onChange={e => setRegisterForm(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))} required />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}