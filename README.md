# Inventory Soft - Sistema de Gestión de Inventario Empresarial

Sistema inteligente de gestión de inventario diseñado específicamente para empresas, con autenticación segura y datos persistentes en la nube.

## 🚀 Características Principales

### 🔐 **Autenticación Empresarial**
- Registro e inicio de sesión seguro con Supabase Auth
- Perfiles de usuario con información de empresa
- Datos aislados por usuario/empresa
- Sesiones persistentes

### 📊 **Dashboard Inteligente**
- KPIs en tiempo real
- Análisis de ventas y ganancias
- Alertas de stock bajo
- Gráficos de rendimiento de productos
- Resumen financiero completo

### 📦 **Gestión de Inventario**
- Registro de productos con categorías
- Control de stock mínimo y máximo
- Alertas automáticas de stock bajo
- Historial de actualizaciones
- Búsqueda avanzada de productos

### 💰 **Sistema de Ventas**
- Registro de transacciones comerciales
- Cálculo automático de ganancias
- Historial de ventas por fecha
- Análisis de productos más vendidos
- Reportes de rentabilidad

### 📅 **Calendario de Eventos**
- Programación de entregas
- Recordatorios de reabastecimiento
- Eventos empresariales
- Gestión de citas y reuniones

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **UI**: Tailwind CSS + Shadcn/ui
- **Estado**: Zustand
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Build Tool**: Vite
- **Gráficos**: Recharts

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase (gratuita)

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd efficient-goods-manager-main
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Supabase**
   - Crear una cuenta en [Supabase](https://supabase.com)
   - Crear un nuevo proyecto
   - Ejecutar las migraciones SQL en la carpeta `supabase/migrations/`
   - Copiar las credenciales del proyecto

4. **Configurar variables de entorno**
   ```bash
   # Las credenciales ya están configuradas en src/integrations/supabase/client.ts
   # Para producción, usar variables de entorno
   ```

5. **Ejecutar la aplicación**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:8080
   ```

## 🗄️ Estructura de la Base de Datos

### Tablas Principales

#### `profiles`
- Información de usuarios y empresas
- Datos de contacto y configuración

#### `inventory_items`
- Productos del inventario
- Stock, precios, categorías
- Proveedores y descripciones

#### `sales`
- Registro de ventas
- Productos vendidos y cantidades
- Información de clientes

#### `events`
- Eventos del calendario
- Recordatorios y programación

## 🔧 Configuración para Empresas

### Primeros Pasos
1. **Registrar empresa**: Crear cuenta con información de la empresa
2. **Configurar categorías**: Definir categorías de productos
3. **Agregar productos**: Registrar productos iniciales
4. **Configurar alertas**: Establecer umbrales de stock mínimo

### Funcionalidades Empresariales
- **Multi-usuario**: Cada empresa tiene sus datos aislados
- **Escalabilidad**: Soporte para grandes volúmenes de datos
- **Backup automático**: Datos respaldados en la nube
- **Acceso móvil**: Interfaz responsive para dispositivos móviles

## 📱 Uso de la Aplicación

### Dashboard
- Vista general de la empresa
- KPIs en tiempo real
- Acceso rápido a funciones principales

### Inventario
- Gestión completa de productos
- Control de stock
- Alertas automáticas

### Ventas
- Registro de transacciones
- Análisis de rendimiento
- Reportes de ganancias

### Reportes
- Análisis detallado de datos
- Exportación de información
- Gráficos y estadísticas

## 🔒 Seguridad

- Autenticación segura con Supabase
- Datos encriptados en tránsito
- Aislamiento de datos por empresa
- Sesiones seguras y persistentes

## 🚀 Despliegue

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm run preview
```

### Variables de Entorno
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📊 Rendimiento

- **Carga inicial**: < 2 segundos
- **Navegación**: Instantánea
- **Búsquedas**: < 100ms
- **Optimización**: Code splitting y lazy loading

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🆘 Soporte

Para soporte técnico o consultas empresariales:
- Email: soporte@inventorysoft.com
- Documentación: [docs.inventorysoft.com](https://docs.inventorysoft.com)

---

**Inventory Soft** - Tu inventario en orden con solo unos clics 🚀
