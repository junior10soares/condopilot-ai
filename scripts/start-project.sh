#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="${1:-condopilot-ai}"

echo "Creating project: ${PROJECT_NAME}"

if ! command -v specify >/dev/null 2>&1; then
  echo "Spec Kit CLI not found."
  echo "Install it using the current official Spec Kit installation instructions."
  exit 1
fi

specify init "${PROJECT_NAME}" --integration claude --script sh

cd "${PROJECT_NAME}"

echo
echo "Next:"
echo "1. Copy the project contract files into the repository."
echo "2. Open Claude Code."
echo "3. Run /speckit.constitution with the project principles."
echo "4. Continue with /speckit.specify, /speckit.clarify, /speckit.plan..."
