import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Building, Mail, Save } from "lucide-react";
import { useInventoryStore } from "@/hooks/useInventoryStore";
import { toast } from "@/hooks/use-toast";
export default function Profile() {
  const {
    user,
    setUser
  } = useInventoryStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || '',
    role: user?.role || ''
  });
  const handleSaveProfile = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Por favor completa los campos requeridos.",
        variant: "destructive"
      });
      return;
    }
    setUser({
      id: user?.id || '1',
      name: formData.name,
      email: formData.email,
      company: formData.company,
      role: formData.role
    });
    toast({
      title: "Perfil actualizado",
      description: "Los cambios han sido guardados exitosamente."
    });
  };
  return <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Perfil</h1>
        <p className="text-muted-foreground">Gestiona tu información personal y de empresa</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture and Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Avatar className="w-24 h-24 mx-auto">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-2xl">
                {formData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="text-xl font-semibold">{formData.name || 'Usuario'}</h3>
              <p className="text-muted-foreground">{formData.role || 'Sin rol'}</p>
              <p className="text-sm text-muted-foreground">{formData.company || 'Sin empresa'}</p>
            </div>

            <Button variant="outline" className="w-full">
              Cambiar Foto de Perfil
            </Button>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Detalles del Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData({
                  ...formData,
                  name: e.target.value
                })} placeholder="Tu nombre completo" />
                </div>
                
                <div>
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <Input id="email" type="email" value={formData.email} onChange={e => setFormData({
                  ...formData,
                  email: e.target.value
                })} placeholder="tu@email.com" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Empresa/Negocio</Label>
                  <Input id="company" value={formData.company} onChange={e => setFormData({
                  ...formData,
                  company: e.target.value
                })} placeholder="Nombre de tu empresa" />
                </div>
                
                <div>
                  <Label htmlFor="role">Cargo</Label>
                  <Input id="role" value={formData.role} onChange={e => setFormData({
                  ...formData,
                  role: e.target.value
                })} placeholder="Tu cargo en la empresa" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} className="gap-2">
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Estadísticas de Usuario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">15</div>
                  <div className="text-sm text-muted-foreground">Días activo</div>
                </div>
                
                <div className="text-center p-4 bg-success/5 rounded-lg">
                  <div className="text-2xl font-bold text-success">48</div>
                  <div className="text-sm text-muted-foreground">Productos gestionados</div>
                </div>
                
                <div className="text-center p-4 bg-warning/5 rounded-lg">
                  <div className="text-2xl font-bold text-warning">12</div>
                  <div className="text-sm text-muted-foreground">Reportes generados</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}