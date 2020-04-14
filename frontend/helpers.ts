import * as d3 from "d3";

export function setGetParamUrl(key, value) {
  let params = new URLSearchParams(window.location.search);
  params.set(key, value);
  let url =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    "?" +
    params.toString();

  return url;
}

export function getTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return null;
  }
}

export function isTouchDevice() {
  return !!(
    ("ontouchstart" in window || navigator.maxTouchPoints) // works on most browsers
  ); // works on IE10/11 and Surface
}

export const formatBigInteger = d3.format(".2s");
export const formatPercentNumber = d3.format(".2p");

export const formatStatisticsLine = function(
  q05: number,
  q95: number,
  population: number = 0
) {
  let _q05 = formatBigInteger(q05 * population);
  let _q95 = formatBigInteger(q95 * population);
  let _q05_perc = formatPercentNumber(q05);
  let _q95_perc = formatPercentNumber(q95);
  return (
    formatRange(_q05, _q95) + " (" + formatRange(_q05_perc, _q95_perc) + ")"
  );
};

export const formatRange = function(lower, upper) {
  if (lower == upper) {
    return "~" + lower;
  } else {
    return lower + "-" + upper;
  }
};

export function formatSIInteger(precision: number): (n: number) => string {
  const formatInt = d3.format("d");
  const formatSI = d3.format(`.${precision}s`);

  return (number: number) => {
    number = Math.round(number);
    // we want to show SI number, but it has to be integer
    if (number < Math.pow(10, precision))
      // for small numbers just use the decimal formatting
      return formatInt(number);
    // otherwise use the SI formatting
    else return formatSI(number);
  };
}
