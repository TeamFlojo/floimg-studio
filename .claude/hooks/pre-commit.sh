#!/bin/bash
# Pre-commit hook for imgflo-studio

set -e

echo "Running pre-commit checks..."

# TypeScript check
STAGED_TS=$(git diff --cached --name-only | grep -E '\.tsx?$' || true)

if [ -n "$STAGED_TS" ]; then
    echo "Checking TypeScript..."
    pnpm -r run typecheck || {
        echo "TypeScript check failed."
        exit 1
    }
fi

# Check for debugger statements
if git diff --cached | grep -E '^\+.*debugger'; then
    echo "ERROR: Remove debugger statements"
    exit 1
fi

# Check for console.log (warning)
if git diff --cached | grep -E '^\+.*console\.log'; then
    echo "WARNING: console.log found"
fi

# Temporal language in evergreen docs
STAGED_EVERGREEN=$(git diff --cached --name-only | grep -E 'vault/(architecture|product)/.*\.md$' || true)

if [ -n "$STAGED_EVERGREEN" ]; then
    for file in $STAGED_EVERGREEN; do
        if [ -f "$file" ]; then
            if grep -inE '\b(will|going to|recently|soon|currently)\b' "$file" | grep -v '^#'; then
                echo "ERROR: Temporal language in: $file"
                exit 1
            fi
        fi
    done
fi

echo "Pre-commit passed!"
