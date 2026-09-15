import React, { useState } from 'react';
import { Search, MapPin, Phone, Eye, Bookmark, BookmarkCheck, CheckCircle, Sparkles, Filter } from 'lucide-react';
import { Technician, User, FilterOptions } from '../../types';
import { ContactTechnicianModal } from './ContactTechnicianModal';
import { TechnicianDetailsModal } from '../TechnicianDetailsModal';

interface ClientDashboardProps {
  user: User;
  technicians: Technician[];
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  user,
  technicians,
  filters,
  onFilterChange,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(`mangu_saved_${user.id}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [viewingTech, setViewingTech] = useState<Technician | null>(null);
  const [contactingTech, setContactingTech] = useState<Technician | null>(null);

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem(`mangu_saved_${user.id}`, JSON.stringify(next));
      return next;
    });
  };

  const displayedTechnicians = activeTab === 'saved'
    ? technicians.filter((t) => savedIds.includes(t.id))
    : technicians;

  const trades = ['ALL', 'Electrical', 'Plumbing', 'Appliance Repair', 'ICT & Computers', 'Carpentry', 'Auto Mechanics', 'Welding & Metalwork'];
  const towns = ['ALL', 'Kampala', 'Entebbe', 'Jinja', 'Mbarara', 'Gulu', 'Mukono'];

  return (
    <div className="space-y-6">
      {/* Client Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-xs text-blue-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Client Dashboard • Operating in {user.town || 'Uganda'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hello, {user.name}
          </h1>
          <p className="text-sm text-blue-100 leading-relaxed">
            Search, compare rates, and directly contact licensed electricians, plumbers, and mechanics near you.
          </p>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Technicians ({technicians.length})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'saved'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved ({savedIds.length})</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-900 dark:text-white">{displayedTechnicians.length}</strong> available providers
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              placeholder="Search by name, trade, skill, or keyword..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={filters.trade}
              onChange={(e) => onFilterChange({ ...filters, trade: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {trades.map((trade) => (
                <option key={trade} value={trade}>
                  {trade === 'ALL' ? 'All Trades' : trade}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={filters.town}
              onChange={(e) => onFilterChange({ ...filters, town: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {towns.map((town) => (
                <option key={town} value={town}>
                  {town === 'ALL' ? 'All Towns' : town}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Technicians Grid */}
      {displayedTechnicians.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <Filter className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            {activeTab === 'saved' ? 'No Saved Technicians Yet' : 'No matching technicians found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {activeTab === 'saved'
              ? 'Click the bookmark icon on any technician card to save them here for fast access.'
              : 'Try clearing your filters or adjusting your search term to view more technicians.'}
          </p>
          {activeTab !== 'saved' && (
            <button
              onClick={() => onFilterChange({ search: '', trade: 'ALL', town: 'ALL', status: 'ALL' })}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedTechnicians.map((tech) => {
            const isSaved = savedIds.includes(tech.id);
            const isAvailable = tech.status === 'Available';

            return (
              <div
                key={tech.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar: Trade & Favorite */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                      {tech.trade}
                    </span>
                    <button
                      onClick={() => toggleSave(tech.id)}
                      className="text-slate-400 hover:text-amber-500 p-1 rounded-lg transition-colors"
                      title={isSaved ? 'Remove from saved' : 'Save technician'}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Technician Profile Header */}
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center text-sm shrink-0 border border-slate-200 dark:border-slate-700">
                      {tech.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                        {tech.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>{tech.town}, Uganda</span>
                      </p>
                    </div>
                  </div>

                  {/* Rate & Status Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                        Standard Rate
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        UGX {tech.hourlyRateUgx.toLocaleString()}{' '}
                        <span className="text-[10px] font-normal text-slate-500">/hr</span>
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {isAvailable && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                      <span>{tech.status}</span>
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {tech.bio}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => setViewingTech(tech)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Details</span>
                  </button>

                  <button
                    onClick={() => setContactingTech(tech)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Contact</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <TechnicianDetailsModal
        technician={viewingTech}
        onClose={() => setViewingTech(null)}
        onEdit={() => {}} // Read-only for client
      />

      <ContactTechnicianModal
        technician={contactingTech}
        onClose={() => setContactingTech(null)}
      />
    </div>
  );
};
