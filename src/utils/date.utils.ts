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

export function displayBRT(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };

  return new Intl.DateTimeFormat('pt-BR', options).format(date);
}
