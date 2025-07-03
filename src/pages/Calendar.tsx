
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { useInventoryStore } from "@/hooks/useInventoryStore";
import { toast } from "@/hooks/use-toast";
import { DailySalesSheet } from "@/components/calendar/DailySalesSheet";
import { TopSellingProducts } from "@/components/calendar/TopSellingProducts";

export default function Calendar() {
  const { events, addEvent, sales, products, getSalesByDate, getTopSellingProducts } = useInventoryStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    type: 'meeting' as const
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSalesSheetOpen, setIsSalesSheetOpen] = useState(false);

  const handleAddEvent = () => {
    if (!eventData.title || !eventData.date) {
      toast({
        title: "Error",
        description: "Por favor completa el título y la fecha del evento.",
        variant: "destructive"
      });
      return;
    }

    addEvent({
      ...eventData,
      date: new Date(eventData.date)
    });

    setEventData({ title: '', description: '', date: '', type: 'meeting' });
    setIsAddDialogOpen(false);
    toast({
      title: "Evento agregado",
      description: `${eventData.title} ha sido agregado al calendario.`
    });
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsSalesSheetOpen(true);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-500';
      case 'delivery':
        return 'bg-green-500';
      case 'reminder':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'Reunión';
      case 'delivery':
        return 'Entrega';
      case 'reminder':
        return 'Recordatorio';
      default:
        return 'Otro';
    }
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDay = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dayEvents = events.filter(event => 
        event.date.toDateString() === currentDay.toDateString()
      );
      
      const daySales = getSalesByDate(currentDay);
      
      days.push({
        date: new Date(currentDay),
        isCurrentMonth: currentDay.getMonth() === month,
        events: dayEvents,
        salesCount: daySales.length
      });
      
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const topSellingProducts = getTopSellingProducts(5);
  const selectedDateSales = selectedDate ? getSalesByDate(selectedDate) : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendario</h1>
          <p className="text-muted-foreground">Programa y gestiona eventos importantes</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Evento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Evento</DialogTitle>
              <DialogDescription>
                Programa un nuevo evento en tu calendario.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Título</Label>
                <Input
                  id="title"
                  value={eventData.title}
                  onChange={(e) => setEventData({...eventData, title: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Tipo</Label>
                <Select
                  value={eventData.type}
                  onValueChange={(value) => setEventData({...eventData, type: value as any})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Reunión</SelectItem>
                    <SelectItem value="delivery">Entrega</SelectItem>
                    <SelectItem value="reminder">Recordatorio</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Fecha</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={eventData.date}
                  onChange={(e) => setEventData({...eventData, date: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Descripción</Label>
                <Textarea
                  id="description"
                  value={eventData.description}
                  onChange={(e) => setEventData({...eventData, description: e.target.value})}
                  className="col-span-3"
                  placeholder="Descripción del evento (opcional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddEvent}>Crear Evento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth(-1)}
                  >
                    ←
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth(1)}
                  >
                    →
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`min-h-[80px] p-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                      day.isCurrentMonth 
                        ? 'bg-background border-border' 
                        : 'bg-muted border-muted-foreground/20'
                    } ${
                      day.date.toDateString() === new Date().toDateString()
                        ? 'ring-2 ring-primary'
                        : ''
                    }`}
                    onClick={() => handleDayClick(day.date)}
                  >
                    <div className={`text-sm ${
                      day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {day.date.getDate()}
                    </div>
                    
                    <div className="space-y-1 mt-1">
                      {day.events.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs px-1 py-0.5 rounded text-white truncate ${
                            getEventTypeColor(event.type)
                          }`}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {day.events.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{day.events.length - 2} más
                        </div>
                      )}
                      
                      {/* Sales indicator */}
                      {day.salesCount > 0 && (
                        <div className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                          {day.salesCount} venta{day.salesCount > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List and Top Products */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events
                  .filter(event => event.date >= new Date())
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 5)
                  .map((event) => (
                    <div key={event.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{event.title}</h4>
                        <Badge variant="outline">
                          {getEventTypeLabel(event.type)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 mb-1">
                          <CalendarIcon className="w-3 h-3" />
                          {event.date.toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.date.toLocaleTimeString()}
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  ))}
                
                {events.filter(event => event.date >= new Date()).length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No hay eventos próximos
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Selling Products */}
          <TopSellingProducts products={topSellingProducts} />
        </div>
      </div>

      {/* Daily Sales Sheet */}
      <DailySalesSheet
        isOpen={isSalesSheetOpen}
        onOpenChange={setIsSalesSheetOpen}
        selectedDate={selectedDate}
        sales={selectedDateSales}
        products={products}
      />
    </div>
  );
}
