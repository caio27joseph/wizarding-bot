export function subtractDays(date: Date, days: number): Date {
  return new Date(date.setDate(date.getDate() - days));
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.setDate(date.getDate() + days));
}

export function subtractHours(date: Date, hours: number): Date {
  return new Date(date.setHours(date.getHours() - hours));
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.setHours(date.getHours() + hours));
}

export function subtractMinutes(date: Date, minutes: number): Date {
  return new Date(date.setMinutes(date.getMinutes() - minutes));
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.setMinutes(date.getMinutes() + minutes));
}
