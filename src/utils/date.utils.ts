export function subtractDays(date: Date, days: number): Date {
  return new Date(date.setDate(date.getDate() - days));
}
