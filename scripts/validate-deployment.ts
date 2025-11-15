#!/usr/bin/env tsx
/**
 * Pre-Deployment Validation Script
 *
 * Runs all checks before deployment to ensure the application is ready for production.
 * This script should be run manually before deploying to production or integrated into CI/CD.
 *
 * Usage:
 *   npm run validate-deployment
 *   or
 *   npx tsx scripts/validate-deployment.ts
 */

import { execSync } from 'child_process';
import { validateProductionEnvironment } from '../lib/env-validation';

interface CheckResult {
  name: string;
  passed: boolean;
  message?: string;
}

const checks: CheckResult[] = [];

function runCheck(name: string, command: string): boolean {
  console.log(`\n🔍 Running: ${name}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    checks.push({ name, passed: true });
    console.log(`✅ ${name} passed`);
    return true;
  } catch {
    checks.push({
      name,
      passed: false,
      message: 'Check failed',
    });
    console.error(`❌ ${name} failed`);
    return false;
  }
}

function checkGitStatus(): boolean {
  console.log('\n🔍 Checking Git status...');
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (status.trim()) {
      console.warn('⚠️  Warning: You have uncommitted changes:');
      console.log(status);
      checks.push({
        name: 'Git Status',
        passed: false,
        message: 'Uncommitted changes detected',
      });
      return false;
    }
    checks.push({ name: 'Git Status', passed: true });
    console.log('✅ Git status clean');
    return true;
  } catch {
    checks.push({
      name: 'Git Status',
      passed: false,
      message: 'Failed to check git status (not a git repository?)',
    });
    console.error('❌ Git status check failed');
    return false;
  }
}

function checkEnvironmentVariables(): boolean {
  console.log('\n🔍 Validating environment variables...');

  const result = validateProductionEnvironment();

  if (result) {
    checks.push({ name: 'Environment Variables', passed: true });
    console.log('✅ Environment validation passed');
    return true;
  } else {
    checks.push({
      name: 'Environment Variables',
      passed: false,
      message: 'Environment validation failed (check console output above)',
    });
    console.error('❌ Environment validation failed');
    return false;
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 DEPLOYMENT VALIDATION SUMMARY');
  console.log('='.repeat(60));

  const passed = checks.filter((c) => c.passed).length;
  const total = checks.length;

  checks.forEach((check) => {
    const status = check.passed ? '✅' : '❌';
    const message = check.message ? ` (${check.message})` : '';
    console.log(`${status} ${check.name}${message}`);
  });

  console.log('='.repeat(60));
  console.log(`Result: ${passed}/${total} checks passed`);
  console.log('='.repeat(60));

  return passed === total;
}

async function main() {
  console.log('🚀 Starting Pre-Deployment Validation');
  console.log('='.repeat(60));

  // Run all checks
  checkEnvironmentVariables();
  checkGitStatus();
  runCheck('ESLint', 'npm run lint');
  runCheck('TypeScript', 'npm run typecheck');
  runCheck('Unit Tests', 'npm run test');
  runCheck('Build', 'npm run build');

  // Print summary
  const allPassed = printSummary();

  if (allPassed) {
    console.log('\n🎉 All checks passed! Ready for deployment.');
    process.exit(0);
  } else {
    console.log('\n❌ Some checks failed. Please fix the issues before deploying.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\n💥 Validation script failed:');
  console.error(error);
  process.exit(1);
});
