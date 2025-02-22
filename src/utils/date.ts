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

export function isValidDateFormat (filename: string) {
    const datePattern = /^\d{4}-\d{2}-\d{2}\.txt$/;
    return datePattern.test(filename);
  };