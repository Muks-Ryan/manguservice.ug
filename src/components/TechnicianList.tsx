import React from 'react';
import {
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Mail,
  X,
  UserPlus,
  Briefcase,
} from 'lucide-react';
import { Technician, FilterOptions } from '../types';
import { TRADES, TOWNS, STATUSES } from '../services/technicianService';

interface TechnicianListProps {
  technicians: Technician[];
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onView: (tech: Technician) => void;
  onEdit: (tech: Technician) => void;
  onDelete: (tech: Technician) => void;
  onAddNew: () => void;
}

export const TechnicianList: React.FC<TechnicianListProps> = ({
  technicians,
  filters,
  onFilterChange,
  onView,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.trade !== 'ALL' ||
    filters.town !== 'ALL' ||
    filters.status !== 'ALL';

  const handleResetFilters = () => {
    onFilterChange({
      search: '',
      trade: 'ALL',
      town: 'ALL',
      status: 'ALL',
    });
  };

  const getStatusBadge = (status: Technician['status']) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
            Available
          </span>
        );
      case 'Active':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
            Active
          </span>
        );
      case 'Busy':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
            Busy
          </span>
        );
      case 'Inactive':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400">
            Inactive
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
      {/* Search & Filter Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              placeholder="Search technicians by name, trade, town, or skill..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors placeholder:text-slate-400"
            />
            {filters.search && (
              <button
                onClick={() => onFilterChange({ ...filters, search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Trade Filter */}
          <div className="w-full md:w-44">
            <select
              value={filters.trade}
              onChange={(e) => onFilterChange({ ...filters, trade: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium transition-colors"
            >
              <option value="ALL">All Trades</option>
              {TRADES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Town Filter */}
          <div className="w-full md:w-36">
            <select
              value={filters.town}
              onChange={(e) => onFilterChange({ ...filters, town: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium transition-colors"
            >
              <option value="ALL">All Towns</option>
              {TOWNS.map((tw) => (
                <option key={tw} value={tw}>
                  {tw}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-36">
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium transition-colors"
            >
              <option value="ALL">All Statuses</option>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count & Clear filters indicator */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-800 dark:text-slate-200">{technicians.length}</strong> {technicians.length === 1 ? 'technician' : 'technicians'}
            </span>
            {hasActiveFilters && (
              <span className="text-amber-600 dark:text-amber-400">(filtered)</span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Table for Desktop / Tablet */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Name & Contact</th>
              <th className="py-3.5 px-4 font-semibold">Trade</th>
              <th className="py-3.5 px-4 font-semibold">Town</th>
              <th className="py-3.5 px-4 font-semibold">Rate (UGX/hr)</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {technicians.length > 0 ? (
              technicians.map((tech) => (
                <tr
                  key={tech.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {tech.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{tech.phone}</span>
                      <span>•</span>
                      <span className="truncate max-w-[180px]">{tech.email}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      <Briefcase className="w-3 h-3 text-amber-500" />
                      {tech.trade}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{tech.town}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {tech.hourlyRateUgx.toLocaleString()} UGX
                  </td>

                  <td className="py-3.5 px-4">
                    {getStatusBadge(tech.status)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => onView(tech)}
                        title="View details"
                        className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(tech)}
                        title="Edit technician"
                        className="p-1.5 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(tech)}
                        title="Delete technician"
                        className="p-1.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="max-w-sm mx-auto space-y-3">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      No technicians match your current filters.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      {hasActiveFilters ? (
                        <button
                          onClick={handleResetFilters}
                          className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          Clear Filters
                        </button>
                      ) : (
                        <button
                          onClick={onAddNew}
                          className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Add First Technician</span>
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards View for Mobile Screens */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {technicians.length > 0 ? (
          technicians.map((tech) => (
            <div key={tech.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {tech.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{tech.town}</span>
                  </div>
                </div>
                {getStatusBadge(tech.status)}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  <Briefcase className="w-3 h-3 text-amber-500" />
                  {tech.trade}
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {tech.hourlyRateUgx.toLocaleString()} UGX/hr
                </span>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{tech.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{tech.email}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onView(tech)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => onEdit(tech)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 rounded-lg flex items-center gap-1"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDelete(tech)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 rounded-lg flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center space-y-3">
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              No technicians match your search or filter criteria.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-3.5 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
