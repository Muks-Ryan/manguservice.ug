import React from 'react';

interface PasswordStrengthProps {
  password: string;
}

export const passwordRules = {
  length: (password: string) => password.length >= 10,
  uppercase: (password: string) => /[A-Z]/.test(password),
  special: (password: string) => /[^A-Za-z0-9]/.test(password),
};

export const isValidPassword = (password: string): boolean =>
  Object.values(passwordRules).every((rule) => rule(password));

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const checks = [
    { label: '10 characters', valid: passwordRules.length(password) },
    { label: 'One uppercase letter', valid: passwordRules.uppercase(password) },
    { label: 'One special character', valid: passwordRules.special(password) },
  ];
  const score = checks.filter((check) => check.valid).length;
  const color = score === 3 ? 'bg-emerald-500' : score === 2 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = score === 3 ? 'text-emerald-600 dark:text-emerald-400' : score === 2 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="mt-2 space-y-2" aria-live="polite">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div className={`h-full transition-all duration-200 ${color}`} style={{ width: `${(score / checks.length) * 100}%` }} />
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
        {checks.map((check) => (
          <span key={check.label} className={check.valid ? 'text-emerald-600 dark:text-emerald-400' : textColor}>
            {check.valid ? '\u2713' : '\u2022'} {check.label}
          </span>
        ))}
      </div>
    </div>
  );
};
