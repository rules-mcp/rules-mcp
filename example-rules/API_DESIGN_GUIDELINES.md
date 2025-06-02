---
name: API_DESIGN_GUIDELINES
description: 'Guidelines for designing RESTful APIs and GraphQL endpoints with proper error handling and documentation.'
tags: ['api', 'design', 'rest', 'graphql', 'backend']
---

# API Design Guidelines

Follow these principles when designing APIs:

## RESTful APIs

- Use proper HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Implement consistent error responses with meaningful status codes
- Use clear, descriptive endpoint naming conventions
- Include proper pagination for list endpoints

## GraphQL APIs

- Design schema with clear type definitions
- Implement proper error handling and validation
- Use DataLoader pattern for efficient data fetching
- Document schema with descriptions

## General

- Always validate input data
- Implement rate limiting
- Use proper authentication and authorization
- Document all endpoints with OpenAPI/Swagger or GraphQL schema docs
