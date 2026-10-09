// Password policy for the protected views. Messages name the variable, never the value.

export const MIN_PASSWORD_LENGTH = 16;
export const RESEARCHER_VAR = 'RESEARCHER_PASSWORD';
export const SUPERVISOR_VAR = 'SUPERVISOR_PASSWORD';

export interface Passwords {
  researcher: string;
  supervisor: string;
}

export function validatePasswords(env: Record<string, string | undefined>): { errors: string[]; passwords?: Passwords } {
  const errors: string[] = [];
  const read = (name: string): string => {
    const value = env[name];
    if (value === undefined || value === '') {
      errors.push(`${name} is not set`);
      return '';
    }
    if (value.length < MIN_PASSWORD_LENGTH) {
      errors.push(`${name} is shorter than ${MIN_PASSWORD_LENGTH} characters`);
    }
    return value;
  };
  const researcher = read(RESEARCHER_VAR);
  const supervisor = read(SUPERVISOR_VAR);
  if (researcher !== '' && researcher === supervisor) {
    errors.push(`${RESEARCHER_VAR} and ${SUPERVISOR_VAR} must be different`);
  }
  return errors.length ? { errors } : { errors, passwords: { researcher, supervisor } };
}
