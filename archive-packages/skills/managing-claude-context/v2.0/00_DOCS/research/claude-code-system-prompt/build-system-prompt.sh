#!/bin/bash
#
# Claude Code System Prompt Builder
#
# This script concatenates all numbered markdown files in numerical order
# to create the complete system prompt reference document.
#
# Usage: ./build-system-prompt.sh
# Output: CONCATENATED_SYSTEM_PROMPT_COMPLETE.md
#

set -e  # Exit on error

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

OUTPUT_FILE="CONCATENATED_SYSTEM_PROMPT_COMPLETE.md"

echo "Building Claude Code System Prompt..."
echo "Output: $OUTPUT_FILE"
echo

# Clear output file
> "$OUTPUT_FILE"

# Count files
file_count=0

# Concatenate all numbered .md files in version-sorted order
# This handles files like: 01_file.md, 02_file.md, ... 34_file.md
# Note: Files starting with underscore (_INDEX.md, _variables-reference.md)
# are meta-documentation and are excluded from concatenation
for file in $(ls [0-9]*.md 2>/dev/null | sort -V); do
    if [ -f "$file" ]; then
        echo "  Adding: $file"
        cat "$file" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"  # Add newline between files
        ((file_count++))
    fi
done

echo
echo "Build complete!"
echo "  Files concatenated: $file_count"
echo "  Output file: $OUTPUT_FILE"
echo "  Output size: $(wc -l < "$OUTPUT_FILE") lines"
echo

# Optional: Show which numbered files exist
echo "File inventory:"
ls -1 [0-9]*.md 2>/dev/null | sort -V | nl
