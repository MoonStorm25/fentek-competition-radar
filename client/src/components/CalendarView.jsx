import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  ExternalLink, 
  Download,
  AlertCircle
} from 'lucide-react';

export default function CalendarView({ competitions, onExportCalendar }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of current month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Convert to Monday-first (0 is Monday, 6 is Sunday)
  const startingDay = (firstDayIndex + 6) % 7;

  // Number of days in current month
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Month names
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const daysOfWeek = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayEvents(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayEvents(null);
  };

  // Find all events for this month
  const getEventsForDay = (day) => {
    return competitions.filter(comp => {
      const deadline = new Date(comp.registrationDeadline);
      return (
        deadline.getFullYear() === year &&
        deadline.getMonth() === month &&
        deadline.getDate() === day
      );
    });
  };

  // Calendar cells
  const calendarCells = [];
  // Empty padding cells for days before the 1st
  for (let i = 0; i < startingDay; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="min-h-[90px] bg-slate-950/30 border border-slate-800/40 rounded-xl opacity-20" />);
  }

  // Days of the month
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dayEvents = getEventsForDay(d);
    const hasEvents = dayEvents.length > 0;
    const isToday = 
      new Date().getDate() === d && 
      new Date().getMonth() === month && 
      new Date().getFullYear() === year;

    calendarCells.push(
      <div
        key={`day-${d}`}
        onClick={() => hasEvents && setSelectedDayEvents({ day: d, events: dayEvents })}
        className={`min-h-[90px] p-2 rounded-xl border transition-all flex flex-col justify-between ${
          hasEvents
            ? 'bg-slate-900/90 border-cyan-800/80 hover:border-cyan-400 hover:shadow-lg cursor-pointer'
            : 'bg-slate-950/60 border-slate-800/60'
        } ${isToday ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-950' : ''}`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold ${isToday ? 'text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded' : 'text-slate-400'}`}>
            {d}
          </span>
          {hasEvents && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950">
              {dayEvents.length}
            </span>
          )}
        </div>

        {/* Mini event tags */}
        <div className="flex flex-col gap-1 mt-1 overflow-hidden">
          {dayEvents.slice(0, 2).map(e => (
            <div 
              key={e.id}
              className={`text-[10px] truncate px-1.5 py-0.5 rounded font-medium ${
                e.scope === 'Global' 
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60' 
                  : 'bg-rose-950 text-rose-300 border border-rose-800/60'
              }`}
              title={e.title}
            >
              {e.title}
            </div>
          ))}
          {dayEvents.length > 2 && (
            <span className="text-[9px] text-slate-400 font-medium">+{dayEvents.length - 2} daha</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Calendar Header with Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center border border-cyan-800">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-slate-400">
              Son Başvuru Tarihleri & Etkinlik Takvimi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700 transition-colors"
          >
            Bugün
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 py-1">
        {daysOfWeek.map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarCells}
      </div>

      {/* Selected Day Details Modal / Drawer */}
      {selectedDayEvents && (
        <div className="bg-slate-900 border border-cyan-800 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span>{selectedDayEvents.day} {monthNames[month]} {year} - Son Başvuru Günü</span>
            </h3>
            <button
              onClick={() => setSelectedDayEvents(null)}
              className="text-xs text-slate-400 hover:text-slate-100 px-2 py-1 bg-slate-800 rounded-lg"
            >
              Kapat
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedDayEvents.events.map(ev => (
              <div key={ev.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ev.scope === 'Global' ? 'bg-cyan-950 text-cyan-300' : 'bg-rose-950 text-rose-300'
                    }`}>
                      {ev.scope}
                    </span>
                    <span className="text-[10px] text-slate-400">{ev.organizer}</span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-sm mb-1">{ev.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">{ev.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => onExportCalendar(ev.id)}
                    className="flex items-center gap-1 text-xs text-slate-300 hover:text-cyan-300 font-medium"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Takvime Ekle</span>
                  </button>

                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-bold"
                  >
                    <span>Başvuru Sayfası</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
