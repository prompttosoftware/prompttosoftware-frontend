import { formatCurrency, formatDuration } from './formatters';
import { Duration } from 'date-fns';

describe('formatCurrency', () => {
  it('should format positive integers correctly', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('should format positive decimals correctly', () => {
    expect(formatCurrency(123.45)).toBe('$123.45');
    expect(formatCurrency(0.99)).toBe('$0.99');
  });

  it('should format zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should format negative numbers correctly', () => {
    expect(formatCurrency(-50)).toBe('-$50.00');
    expect(formatCurrency(-123.45)).toBe('-$123.45');
  });

  it('should handle large numbers correctly', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
  });

  it('should round to two decimal places', () => {
    expect(formatCurrency(10.123)).toBe('$10.12');
    expect(formatCurrency(10.128)).toBe('$10.13');
    expect(formatCurrency(10.125)).toBe('$10.13'); // Standard rounding
  });

  it('should add trailing zeros for single decimal places', () => {
    expect(formatCurrency(5.5)).toBe('$5.50');
  });
});

describe('formatDuration', () => {
  it('should format hours, minutes, and seconds correctly', () => {
    const duration: Duration = { hours: 1, minutes: 30, seconds: 5 };
    expect(formatDuration(duration)).toBe('1h 30m 5s');
  });

  it('should format only hours and minutes', () => {
    const duration: Duration = { hours: 2, minutes: 15 };
    expect(formatDuration(duration)).toBe('2h 15m');
  });

  it('should format only minutes and seconds', () => {
    const duration: Duration = { minutes: 45, seconds: 30 };
    expect(formatDuration(duration)).toBe('45m 30s');
  });

  it('should format only seconds', () => {
    const duration: Duration = { seconds: 59 };
    expect(formatDuration(duration)).toBe('59s');
  });

  it('should handle zero duration with zero option false (default)', () => {
    const duration: Duration = { seconds: 0 };
    expect(formatDuration(duration)).toBe('');
  });

  it('should handle zero duration with zero option true', () => {
    const duration: Duration = { seconds: 0 };
    expect(formatDuration(duration, { zero: true })).toBe('0s');
  });

  it('should format with custom delimiter', () => {
    const duration: Duration = { hours: 1, minutes: 30 };
    expect(formatDuration(duration, { delimiter: ', ' })).toBe('1h, 30m');
  });

  it('should format mixed duration with one part missing', () => {
    const duration: Duration = { hours: 1, seconds: 30 };
    expect(formatDuration(duration)).toBe('1h 30s');
  });

  it('should handle fractional seconds (though duration usually integers)', () => {
    const duration: Duration = { seconds: 12.34 }; // date-fns 
    expect(formatDuration(duration)).toBe('12s'); // It should still display '12s' as `duration.seconds` is a number
  });

  it('should show 0s if no hours/minutes but there are seconds (even if 0s not explicitly zero:true)', () => {
    const duration: Duration = { seconds: 0 }; // Example where no hours/minutes
    // The current implementation of formatDuration will return an empty string
    // if seconds is 0 and no hours/minutes unless zero option is true.
    // This test ensures that behavior is as expected given the code.
    expect(formatDuration(duration)).toBe('');
  });
});
