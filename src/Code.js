/**
 * HTTP GET 핸들러
 * - 일반 접속: 웹 앱 반환
 * - ?test=1: 테스트 실행 및 결과 반환
 */
function doGet(e) {
  var params = e.parameter || {};
  
  // 테스트 실행 요청
  if (params.test === '1') {
    try {
      var results = testAll();
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          timestamp: new Date().toISOString(),
          results: results
        }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch(error) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          timestamp: new Date().toISOString(),
          error: error.toString(),
          stack: error.stack
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // 일반 웹 앱
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('My App');
}

function saveData(data) {
  try {
    Logger.log('Data: ' + JSON.stringify(data));
    return {success: true, message: 'Saved', data: data};
  } catch(e) {
    Logger.log('Error in saveData: ' + e.toString());
    return {success: false, error: e.toString()};
  }
}

// ===== 테스트 함수들 =====

/**
 * 모든 테스트를 실행하는 메인 함수
 */
function testAll() {
  Logger.log('=== Starting All Tests ===');
  var results = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: [],
    details: []
  };
  
  // 테스트 목록
  var tests = [
    testSaveData,
    testSaveDataWithNull,
    testSaveDataWithObject,
    testDoGet
  ];
  
  // 각 테스트 실행
  tests.forEach(function(test) {
    results.total++;
    var testName = test.name;
    var startTime = new Date().getTime();
    
    try {
      Logger.log('Running: ' + testName);
      test();
      var duration = new Date().getTime() - startTime;
      results.passed++;
      results.details.push({
        name: testName,
        status: 'PASSED',
        duration: duration + 'ms'
      });
      Logger.log('✅ PASSED: ' + testName + ' (' + duration + 'ms)');
    } catch(e) {
      var duration = new Date().getTime() - startTime;
      results.failed++;
      var errorInfo = {
        test: testName,
        error: e.toString(),
        duration: duration + 'ms'
      };
      results.errors.push(errorInfo);
      results.details.push({
        name: testName,
        status: 'FAILED',
        error: e.toString(),
        duration: duration + 'ms'
      });
      Logger.log('❌ FAILED: ' + testName + ' - ' + e.toString());
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
  assertNotNull(result.data, 'saveData should return data');
}

/**
 * saveData null 입력 테스트
 */
function testSaveDataWithNull() {
  var result = saveData(null);
  assertEqual(typeof result, 'object', 'saveData should return an object');
  assertEqual(typeof result.success, 'boolean', 'result should have success field');
}

/**
 * saveData 복잡한 객체 테스트
 */
function testSaveDataWithObject() {
  var complexData = {
    user: 'test',
    items: [1, 2, 3],
    nested: {key: 'value'}
  };
  var result = saveData(complexData);
  assertEqual(result.success, true, 'saveData should handle complex objects');
}

/**
 * doGet 함수 테스트
 */
function testDoGet() {
  var result = doGet({parameter: {}});
  assertNotNull(result, 'doGet should return a result');
}

// ===== 테스트 헬퍼 함수들 =====

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      (message || 'Assertion failed') + 
      '\n  Expected: ' + JSON.stringify(expected) + 
      '\n  Actual: ' + JSON.stringify(actual)
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
    throw new Error(message || 'Value should be true, but was: ' + value);
  }
}

function assertFalse(value, message) {
  if (value !== false) {
    throw new Error(message || 'Value should be false, but was: ' + value);
  }
}
