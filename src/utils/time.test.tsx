import { describe, expect, it } from "vitest";

import { timeAgo } from "./time";

describe("timeAgo", () => {
  it('should return "just now" for dates in the future', () => {
    const futureDate = new Date(Date.now());
    futureDate.setDate(futureDate.getDate() + 1);
    const result = timeAgo(futureDate);
    expect(result).toBe("just now");
  });

  it('should return "just now" for dates within the last minute', () => {
    const recentDate = new Date(Date.now());
    recentDate.setSeconds(recentDate.getSeconds() - 40);
    const result = timeAgo(recentDate);
    expect(result).toBe("just now");
  });

  it('should return "1 minute ago" for dates exactly one minute ago', () => {
    const oneMinuteAgo = new Date(Date.now());
    oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);
    const result = timeAgo(oneMinuteAgo);
    expect(result).toBe("1 minute ago");
  });

  it('should return "2 minutes ago" for dates two minutes ago', () => {
    const twoMinutesAgo = new Date(Date.now());
    twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2);
    const result = timeAgo(twoMinutesAgo);
    expect(result).toBe("2 minutes ago");
  });

  it('should return "1 hour ago" for dates exactly one hour ago', () => {
    const oneHourAgo = new Date(Date.now());
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    const result = timeAgo(oneHourAgo);
    expect(result).toBe("1 hour ago");
  });

  it('should return "2 hours ago" for dates exactly two hour ago', () => {
    const twoHoursAgo = new Date(Date.now());
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
    const result = timeAgo(twoHoursAgo);
    expect(result).toBe("2 hours ago");
  });

  it('should return "1 day ago" for dates exactly one day ago', () => {
    const oneDayAgo = new Date(Date.now() - 86400000);
    const result = timeAgo(oneDayAgo);
    expect(result).toBe("1 day ago");
  });

  it('should return "2 days ago" for dates exactly two day ago', () => {
    const twoDaysAgo = new Date(Date.now());
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const result = timeAgo(twoDaysAgo);
    expect(result).toBe("2 days ago");
  });

  it('should return "1 month ago" or "30 days ago" for dates exactly one month ago', () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const result = timeAgo(oneMonthAgo);
    expect(["1 month ago", "30 days ago"]).toContain(result);
  });

  it('should return "2 months ago" for dates exactly one month ago', () => {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const result = timeAgo(twoMonthsAgo);
    expect(result).toBe("2 months ago");
  });

  it('should return "1 year ago" for dates exactly one year ago', () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const result = timeAgo(oneYearAgo);
    expect(result).toBe("1 year ago");
  });

  it('should return "2 years ago" for dates two years ago', () => {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const result = timeAgo(twoYearsAgo);
    expect(result).toBe("2 years ago");
  });
});
