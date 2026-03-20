import * as path from 'path';
import * as fs from 'fs';

export const API_URL = 'http://localhost:3000';
export const BASE_URL = 'http://localhost:4000';

/** Paths to test fixture files */
export const FIXTURES = {
  wedge: path.resolve(__dirname, '../../../motionlab-test/test-vi-wedge.mp4'),
  driver: path.resolve(__dirname, '../../../motionlab-test/test-vi-driver.mp4'),
  putter: path.resolve(__dirname, '../../../motionlab-test/test-vi-putter.mp4'),
  synthetic: path.resolve(__dirname, '../../../motionlab-test/test-vi-synthetic.mp4'),
  wedgeBad: path.resolve(__dirname, '../../../motionlab-test/test-vi-wedge-bad.mp4'),
  invalidTxt: path.resolve(__dirname, '../../../motionlab-test/test-invalid.txt'),
  invalidJpg: path.resolve(__dirname, '../../../motionlab-test/test-invalid.jpg'),
} as const;

/** Check if a fixture file exists at runtime */
export function fixtureExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/** Generate a unique test email (same format as global-setup) */
export function testEmail(suffix?: string): string {
  const ts = Date.now();
  return suffix ? `test-${ts}-${suffix}@motionlab.com` : `test-${ts}@motionlab.com`;
}

export const STRONG_PASSWORD = 'Test1234!@';
export const WEAK_PASSWORD = '12345';
