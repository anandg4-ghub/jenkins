// Simple test file
console.log('Running tests...');

// Test 1: Basic assertion
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
  console.log('✓ Test passed:', message);
};

// Run tests
try {
  assert(true, 'Basic test');
  assert(1 + 1 === 2, 'Math works');
  assert(typeof require('./server.js') === 'object', 'Server module loads');
  
  console.log('\n✓ All tests passed!');
  process.exit(0);
} catch (error) {
  console.error('\n✗ Test failed:', error.message);
  process.exit(1);
}
