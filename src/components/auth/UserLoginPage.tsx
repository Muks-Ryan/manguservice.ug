import React, { useMemo, useState } from 'react';
import { User, Wrench, LogIn, UserPlus, AlertCircle, ShieldCheck, CheckCircle2, Search, ChevronDown } from 'lucide-react';
import { AsYouType, getCountries, getCountryCallingCode, isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';
import { City } from 'country-state-city';
import { authService } from '../../services/authService';
import { TRADES } from '../../services/technicianService';
import { isValidPassword, PasswordStrength } from './PasswordStrength';

interface UserLoginPageProps {
  onSuccess: () => void;
  onSwitchToAdmin: () => void;
  onForgotPassword: () => void;
}

type CountryCode = ReturnType<typeof getCountries>[number];

export const UserLoginPage: React.FC<UserLoginPageProps> = ({ onSuccess, onSwitchToAdmin, onForgotPassword }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Registration Role Choice: Client or Technician
  const [registerRole, setRegisterRole] = useState<'client' | 'technician'>('client');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [name, setName] = useState('');
  const [trade, setTrade] = useState('Electrical');
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>('UG');
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [phone, setPhone] = useState('');
  const [town, setTown] = useState('Kampala');
  const [townSearch, setTownSearch] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const countryNames = useMemo(() => new Intl.DisplayNames(['en'], { type: 'region' }), []);
  const countryOptions: Array<{ country: CountryCode; callingCode: string }> = useMemo(
    () => getCountries()
      .map((country) => ({
        country,
        callingCode: getCountryCallingCode(country),
      }))
      .sort((left, right) => left.country.localeCompare(right.country)),
    []
  );

  const availableTowns: string[] = useMemo(() => {
    const towns = City.getCitiesOfCountry(phoneCountry)?.map((city) => city.name) || [];
    return [...new Set(towns)].sort((left, right) => left.localeCompare(right));
  }, [phoneCountry]);

  const filteredTowns = availableTowns.filter((availableTown) =>
    availableTown.toLowerCase().includes(townSearch.trim().toLowerCase())
  );

  const filteredCountries = countryOptions.filter(({ country, callingCode }) => {
    const query = countrySearch.trim().toUpperCase();
    const countryName = (countryNames.of(country) || '').toUpperCase();
    return !query || country.includes(query) || countryName.includes(query) || callingCode.includes(countrySearch.trim());
  });

  const countryFlag = (country: CountryCode) => country
    .split('')
    .map((character) => String.fromCodePoint(character.charCodeAt(0) + 127397))
    .join('');

  const handlePhoneCountryChange = (country: CountryCode) => {
    setPhoneCountry(country);
    setPhone('');
    const firstTown = City.getCitiesOfCountry(country)?.[0]?.name || '';
    setTown(firstTown);
    setTownSearch('');
    setCountryMenuOpen(false);
    setCountrySearch('');
  };

  const handlePhoneChange = (value: string) => {
    setPhone(new AsYouType(phoneCountry).input(value));
  };

  // Handle Login: System automatically identifies whether the user is Client or Technician!
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please provide both your email and password.');
      return;
    }

    try {
      setLoading(true);
      // Allows both client and technician, system identifies role
      await authService.login(email, password, ['client', 'technician'], rememberMe);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in your name, email, and password.');
      return;
    }

    if (!phone.trim() || !isValidPhoneNumber(phone, phoneCountry)) {
      setError('Please enter a valid phone number for the selected country.');
      return;
    }
    if (phoneCountry !== 'UG') {
      setError('Mangu Service is not yet available in the selected country. Please select Uganda to register.');
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password must be at least 10 characters and include an uppercase letter and a special character.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (registerRole === 'technician' && !trade) {
      setError('Please select your professional trade.');
      return;
    }

    try {
      setLoading(true);
      await authService.register(
        name,
        email,
        password,
        registerRole,
        parsePhoneNumber(phone, phoneCountry).number,
        town,
        registerRole === 'technician' ? trade : undefined
      );
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col justify-center items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* Header with dual client/technician identity */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div className="text-slate-300 dark:text-slate-700 font-bold text-lg">+</div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {isRegistering ? 'Create User Account' : 'Mangu Service Sign In'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {isRegistering
              ? 'Join as a client to hire experts or as a technician to offer professional services.'
              : 'Sign in to access your account. The system automatically identifies you as a Client or Technician.'}
          </p>
        </div>

        {/* Role Identification Notice */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            <strong>Unified User Sign In:</strong> Both clients and technicians log in here with their registered email. Your workspace is configured automatically.
          </span>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* REGISTRATION: Role selector toggle */}
        {isRegistering && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Select Account Type:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setRegisterRole('client')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  registerRole === 'client'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Client (Hire Services)</span>
              </button>

              <button
                type="button"
                onClick={() => setRegisterRole('technician')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  registerRole === 'technician'
                    ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Technician (Provider)</span>
              </button>
            </div>
          </div>
        )}

        {/* MAIN FORM */}
        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={registerRole === 'technician' ? 'e.g., Kato Joseph' : 'e.g., Harriet Nalubega'}
                required
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}

          {isRegistering && registerRole === 'technician' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Professional Trade / Specialization
              </label>
              <select
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {TRADES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <label className="mt-2 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"><input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} className="accent-amber-500" />Show password</label>
            {isRegistering && <PasswordStrength password={password} />}
          </div>

          {isRegistering && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
              <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat your password" required className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
              <label className="mt-2 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"><input type="checkbox" checked={showConfirmPassword} onChange={(e) => setShowConfirmPassword(e.target.checked)} className="accent-amber-500" />Show confirmed password</label>
            </div>
          )}

          {!isRegistering && (
            <div className="flex items-center justify-between gap-3 text-xs">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="accent-amber-500" /><span>Remember me</span></label>
              <button type="button" onClick={onForgotPassword} className="font-bold text-amber-600 hover:underline dark:text-amber-400">Forgot password?</button>
            </div>
          )}

          {isRegistering && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCountryMenuOpen((open) => !open)}
                      aria-expanded={countryMenuOpen}
                      aria-haspopup="listbox"
                      className="w-full h-full min-h-10 flex items-center justify-between gap-2 text-xs sm:text-sm px-2.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <span>{countryFlag(phoneCountry)} {phoneCountry} (+{getCountryCallingCode(phoneCountry)})</span>
                      <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
                    </button>
                    {countryMenuOpen && (
                      <div className="absolute left-0 top-full z-20 mt-1 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-xl">
                        <div className="relative mb-2">
                          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                          <input
                            autoFocus
                            type="search"
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder="Search country code..."
                            aria-label="Search country code"
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-8 pr-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <div className="max-h-56 overflow-y-auto" role="listbox" aria-label="Country codes">
                          {filteredCountries.length ? filteredCountries.map(({ country, callingCode }) => (
                            <button
                              key={country}
                              type="button"
                              onClick={() => handlePhoneCountryChange(country)}
                              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800 ${phoneCountry === country ? 'bg-amber-50 dark:bg-amber-950/40' : ''}`}
                            >
                              <span className="text-slate-900 dark:text-white">{countryFlag(country)} {country}</span>
                              <span className="text-slate-500 dark:text-slate-400">+{callingCode}</span>
                            </button>
                          )) : <p className="px-2.5 py-3 text-xs text-slate-500">No country codes found.</p>}
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder={`e.g. ${phoneCountry === 'UG' ? '700 000 000' : 'Enter local number'}`}
                    required
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                {phoneCountry !== 'UG' ? (
                  <p className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-[11px] text-amber-800 dark:text-amber-200">
                    Mangu Service is not yet available in {countryNames.of(phoneCountry) || 'this country'}.
                  </p>
                ) : phone && !isValidPhoneNumber(phone, phoneCountry) ? (
                  <p className="mt-2 text-[11px] text-red-600 dark:text-red-400">Enter a valid Ugandan phone number.</p>
                ) : null}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Town / District
                </label>
                <input
                  type="search"
                  value={townSearch}
                  onChange={(e) => setTownSearch(e.target.value)}
                  placeholder="Search town or city"
                  disabled={!availableTowns.length}
                  className="mb-2 w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60"
                />
                <select
                  value={town}
                  onChange={(e) => setTown(e.target.value)}
                  disabled={!filteredTowns.length}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60"
                >
                  {filteredTowns.length ? filteredTowns.map((availableTown) => (
                    <option key={availableTown} value={availableTown}>
                      {availableTown}
                    </option>
                  )) : <option value="">No towns found</option>}
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isRegistering ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>
              {loading
                ? 'Processing...'
                : isRegistering
                ? registerRole === 'technician'
                  ? 'Register as Technician'
                  : 'Register as Client'
                : 'Sign In (Client or Technician)'}
            </span>
          </button>
        </form>

        {/* Toggle between Login and Registration */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400"
          >
            {isRegistering
              ? 'Already have an account? Sign in here'
              : "Don't have an account yet? Register as a Client or Technician"}
          </button>
        </div>

        {/* Admin Separated Login Link */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
          <button
            onClick={onSwitchToAdmin}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Administrator? Login to the Admin Portal separately &rarr;</span>
          </button>
        </div>

      </div>
    </div>
  );
};
