export const prettyPrint = (num: string, units: number) => parseFloat(parseFloat(num).toFixed(units)).toLocaleString();

export const prettyPrintTruncated = (num: string | number, units: number) => {
  let val = parseFloat(num.toString());
  let suffix = '';
  if (val >= 1_000_000_000) {
    val /= 1_000_000_000;
    suffix = 'B';
  } else if (val >= 1_000_000) {
    val /= 1_000_000;
    suffix = 'M';
  }
  return parseFloat(val.toFixed(units)).toLocaleString() + suffix;
};

export const prettyPrintAddress = (address: string) => `${address.substr(0, 6)}...${address.substr(-4)}`;

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;

export const getDuration = (duration: number) => {
  let value = 0;
  let unit = '';
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
  return `${value}${String.fromCharCode(160)}${unit}${value > 1 ? 's' : ''}`;
};

export const getDurationDays = (duration: number) => {
  const unit = 'day';
  const value = Math.floor(duration / DAY);
  return `${value}${String.fromCharCode(160)}${unit}${value > 1 ? 's' : ''}`;
};