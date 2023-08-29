export function subtractDays(date: Date, days: number): Date {
  return new Date(date.setDate(date.getDate() - days));
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.setMinutes(date.getMinutes() + minutes));
}
