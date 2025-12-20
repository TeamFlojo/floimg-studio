#!/bin/bash
# Pre-compaction hook for imgflo-studio

echo "Context compaction detected."
echo ""
echo "Consider using /w to save session context."
echo ""
echo "Current task:"
grep -A 1 "Current Focus" PROJECT_STATUS.md 2>/dev/null || echo "No active task"
