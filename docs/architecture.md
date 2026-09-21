# Architecture

## High-level

Browser
-> Next.js application
-> authenticated API boundary
-> Agent Runtime
-> policy/authorization
-> typed tools
-> application services
-> PostgreSQL

## Agent Runtime

The agent runtime is composed of:

- Context Manager
- Planner/Intent layer
- Policy Engine
- Tool Registry
- Tool Executor
- Result Validator
- Response Composer
- Trace Recorder

## Tool principle

The model never receives unrestricted database or infrastructure access.

Example:

`getResidentsInDebt({ condominiumId })`

is preferable to:

`executeSql("SELECT ...")`

## Security boundary

Authentication establishes identity.

Authorization establishes what that identity can do.

Business rules establish whether the requested operation is valid.

The LLM does not replace any of these controls.

## Observability

Every agent execution should have:
- execution ID;
- request ID;
- actor/user ID;
- start/end timestamps;
- model/provider metadata;
- tool calls;
- tool duration;
- success/failure;
- sanitized inputs/outputs;
- error classification.

Do not store secrets or unnecessary sensitive data in traces.

## Failure handling

Agent failures must degrade safely:
- invalid tool arguments -> reject;
- authorization failure -> deny;
- tool timeout -> controlled error;
- database failure -> controlled error;
- model failure -> controlled fallback;
- ambiguous high-impact action -> request clarification/confirmation.
