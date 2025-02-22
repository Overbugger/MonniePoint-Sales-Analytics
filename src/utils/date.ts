export function getMonthName (month: string) {
  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];
  const parts = month.split('-');
  const monthIndex = parts[1] ? parseInt(parts[1]) - 1 : 0;
  return months[monthIndex];
};