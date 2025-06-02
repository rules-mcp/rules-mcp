---
name: TESTING_BEST_PRACTICES
description: 'Comprehensive testing guidelines covering unit tests, integration tests, and end-to-end testing strategies.'
tags: ['testing', 'quality', 'unit-tests', 'integration', 'e2e']
---

# Testing Best Practices

## Unit Testing

- Write tests for all public methods and functions
- Use descriptive test names that explain the scenario
- Follow the Arrange-Act-Assert pattern
- Mock external dependencies appropriately
- Aim for high code coverage but focus on meaningful tests

## Integration Testing

- Test component interactions and data flow
- Use realistic test data and scenarios
- Test error conditions and edge cases
- Ensure database transactions are properly handled

## End-to-End Testing

- Test critical user journeys
- Use page object patterns for maintainable tests
- Run tests in environments similar to production
- Include accessibility testing in your E2E suite

## General Guidelines

- Run tests in CI/CD pipelines
- Keep tests fast and reliable
- Clean up test data after each test
- Use factories or builders for test data creation
