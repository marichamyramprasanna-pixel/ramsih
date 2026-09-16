import { 
  calculateEnterpriseRiskScore, 
  calculateRiskLevel, 
  formatRiskScore, 
  isValidRiskScore, 
  FALLBACK_TELEMETRY 
} from './riskCalculator';
import { InfrastructureNode, AnomalyDetection, Investigation } from '../types';

export function runRiskCalculatorTestSuite(): { passed: number; failed: number; log: string[] } {
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, actual?: any, expected?: any) {
    if (condition) {
      passed++;
      results.push(`✅ PASS: ${testName}`);
    } else {
      failed++;
      results.push(`❌ FAIL: ${testName} (Expected: ${expected}, Got: ${actual})`);
    }
  }

  // Test Case 1: Valid risk score such as 72
  assert(formatRiskScore(72) === '72/100', '1. Valid risk score (72)', formatRiskScore(72), '72/100');

  // Test Case 2: Risk score equal to 0
  assert(formatRiskScore(0) === '0/100', '2. Risk score equal to 0', formatRiskScore(0), '0/100');

  // Test Case 3: Risk score equal to 100
  assert(formatRiskScore(100) === '100/100', '3. Risk score equal to 100', formatRiskScore(100), '100/100');

  // Test Case 4: Missing risk score (undefined)
  assert(formatRiskScore(undefined) === 'Data unavailable', '4. Missing risk score (undefined)', formatRiskScore(undefined), 'Data unavailable');

  // Test Case 5: Null risk score (null)
  assert(formatRiskScore(null) === 'Data unavailable', '5. Null risk score (null)', formatRiskScore(null), 'Data unavailable');

  // Test Case 6: String risk score such as "72"
  assert(formatRiskScore("72") === '72/100', '6. String risk score ("72")', formatRiskScore("72"), '72/100');

  // Test Case 7: Invalid string such as "unknown"
  assert(formatRiskScore("unknown") === 'Data unavailable', '7. Invalid string ("unknown")', formatRiskScore("unknown"), 'Data unavailable');

  // Test Case 8: Backend API failure handling with fallback object
  const fallbackScore = FALLBACK_TELEMETRY.enterpriseRiskScore;
  assert(isValidRiskScore(fallbackScore) && formatRiskScore(fallbackScore) === '72/100', '8. Backend API failure fallback handling', formatRiskScore(fallbackScore), '72/100');

  // Test Case 9: Empty database calculation (no nodes)
  const emptyNodes: InfrastructureNode[] = [];
  const emptyAnom: AnomalyDetection[] = [];
  const emptyInv: Investigation[] = [];
  const scoreFromEmpty = calculateEnterpriseRiskScore(emptyNodes, emptyAnom, emptyInv);
  assert(isValidRiskScore(scoreFromEmpty), '9. Empty database risk calculation returns valid score', scoreFromEmpty, '0 <= score <= 100');

  // Test Case 10: Loading state handling (uninitialized state)
  const loadingValue: unknown = undefined;
  assert(formatRiskScore(loadingValue) !== 'undefined/100' && formatRiskScore(loadingValue) === 'Data unavailable', '10. Loading state does NOT render undefined/100', formatRiskScore(loadingValue), 'Data unavailable');

  console.log('--- Threat Catcher Risk Calculator Test Suite ---');
  results.forEach(r => console.log(r));
  console.log(`Passed: ${passed} | Failed: ${failed}`);

  return { passed, failed, log: results };
}

// Auto execute test suite when module is imported
runRiskCalculatorTestSuite();
