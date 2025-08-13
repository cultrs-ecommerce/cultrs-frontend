export const formatDateSeparator = (timestamp: number): string => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const diffInDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 3600 * 24));

  if (diffInDays < 7) {
    return daysOfWeek[date.getDay()];
  }

  return date.toLocaleDateString();
};
