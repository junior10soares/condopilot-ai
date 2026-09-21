# Testing Strategy

## Pyramid

### Unit

Pure business logic:

- authorization policies;
- reservation rules;
- validators;
- tool schemas;
- prompt-independent agent decision helpers.

### Component

UI:

- forms;
- tables;
- dialogs;
- execution trace;
- loading/error states;
- accessibility behavior.

### Integration

- API + database;
- service + repository;
- agent + mocked model;
- agent + real tool registry;
- authorization + tenant isolation.

### Contract/API

Verify request/response schemas and error contracts.

### Agent evaluation

Use deterministic fixtures to test:

- intent recognition;
- correct tool selection;
- invalid tool argument handling;
- permission denial;
- confirmation requirement;
- prompt injection resistance;
- hallucination-sensitive responses.

### E2E

Critical user journeys:

1. sign in;
2. open agent;
3. ask about delinquency;
4. inspect trace;
5. create reservation;
6. confirm high-impact action;
7. verify resulting data;
8. verify unauthorized user cannot access it.

### Smoke

A production-like environment must pass:

- application startup;
- health endpoint;
- database connectivity;
- authentication;
- one agent request;
- one tool execution.

## Coverage

Coverage is a signal, not the only quality metric.

Critical business logic should have strong line and branch coverage.
Critical authorization paths must have explicit tests.
Do not exclude important code merely to improve coverage percentage.

## Test data

Use isolated test databases/fixtures.
Never run destructive tests against production.
Never use real personal data.
