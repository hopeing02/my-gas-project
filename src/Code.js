function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('My App');
}

function saveData(data) {
  try {
    Logger.log('Data: ' + JSON.stringify(data));
    return {success: true, message: 'Saved'};
  } catch(e) {
    Logger.log('Error in saveData: ' + e.toString());
    return {success: false, error: e.toString()};
  }
}

// ===== 테스트 함수들 =====

/**
 * 모든 테스트를 실행하는 메인 함수
 * GitHub Actions에서 자동으로 실행됩니다
 */
function testAll() {
  Logger.log('=== Starting All Tests ===');
  var results = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  };
  
  // 각 테스트 실행
  var tests = [
    testSaveData,
    testSaveDataWithInvalidInput,
    testDoGet
  ];
  
  tests.forEach(function(test) {
    results.total++;
    try {
      Logger.log('Running: ' + test.name);
      test();
      results.passed++;
      Logger.log('✅ PASSED: ' + test.name);
    } catch(e) {
      results.failed++;
      results.errors.push({
        test: test.name,
        error: e.toString()
      });
      Logger.log('❌ FAILED: ' + test.name + ' - ' + e.toString());
    }
  });
  
  // 결과 요약
  Logger.log('=== Test Results ===');
  Logger.log('Total: ' + results.total);
  Logger.log('Passed: ' + results.passed);
  Logger.log('Failed: ' + results.failed);
  
  if (results.failed > 0) {
    Logger.log('Errors:');
    results.errors.forEach(function(err) {
      Logger.log('  - ' + err.test + ': ' + err.error);
    });
    throw new Error('Tests failed: ' + results.failed + ' out of ' + results.total);
  }
  
  Logger.log('✅ All tests passed!');
  return results;
}

/**
 * saveData 함수 기본 테스트
 */
function testSaveData() {
  var testData = {test: 'data', number: 123};
  var result = saveData(testData);
  
  assertEqual(result.success, true, 'saveData should return success=true');
  assertEqual(result.message, 'Saved', 'saveData should return correct message');
}

/**
 * saveData 잘못된 입력 테스트
 */
function testSaveDataWithInvalidInput() {
  var result = saveData(null);
  // null도 처리 가능해야 함
  assertEqual(typeof result, 'object', 'saveData should always return an object');
  assertEqual(typeof result.success, 'boolean', 'result should have success field');
}

/**
 * doGet 함수 테스트
 */
function testDoGet() {
  var result = doGet();
  assertNotNull(result, 'doGet should return a result');
  assertEqual(typeof result.getContent, 'function', 'doGet should return HtmlOutput');
}

// ===== 테스트 헬퍼 함수들 =====

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      (message || 'Assertion failed') + 
      '\nExpected: ' + JSON.stringify(expected) + 
      '\nActual: ' + JSON.stringify(actual)
    );
  }
}

function assertNotNull(value, message) {
  if (value === null || value === undefined) {
    throw new Error(message || 'Value should not be null or undefined');
  }
}

function assertTrue(value, message) {
  if (value !== true) {
    throw new Error(message || 'Value should be true');
  }
}

function assertFalse(value, message) {
  if (value !== false) {
    throw new Error(message || 'Value should be false');
  }
}