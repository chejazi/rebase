export const prettyPrint = (num: string, units: number) => parseFloat(num).toFixed(units);

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;

export const getDuration = (duration: number) => {
  let value = 0;
  let unit = '';
  if (duration <= 0) {
    return 'just now';
  }
  if (duration < HOUR) {
    unit = 'minute';
    value = Math.floor(duration / MINUTE) || 1; // min 1 minute
  } else if (duration < DAY) {
    unit = 'hour';
    value = Math.floor(duration / HOUR);
  } else if (duration < (DAY * 7)) {
    unit = 'day';
    value = Math.floor(duration / DAY);
  } else if (duration < (365 * DAY)) {
    unit = 'week';
    value = Math.floor(duration / (7 * DAY));
  } else {
    unit = 'year';
    value = Math.floor(duration / (365 * DAY));
  }
  // return `${duration}`;
  return `${value}${String.fromCharCode(160)}${unit}${value > 1 ? 's' : ''} ago`;
};
