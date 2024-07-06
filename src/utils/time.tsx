/**
 * Calculates the time elapsed since a given date in a human-readable format.
 * @function timeAgo
 * @param {Date} date - The date to calculate the time elapsed from.
 * @returns {string} A string representing the time elapsed in a human-readable format.
 */
export const timeAgo = (date: Date): string => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const intervals = [
    { label: "year", seconds: 31557600 },
    { label: "month", seconds: 2629800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
};
