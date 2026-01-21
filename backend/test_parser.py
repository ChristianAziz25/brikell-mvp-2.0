"""
Test script for Danish Rent Roll Parser.

Usage:
    python test_parser.py <file_path>
    python test_parser.py --excel <excel_file>
    python test_parser.py --pdf <pdf_file>

Expects user to provide their own test files.
"""

import sys
import json
from pathlib import Path

from parser import parse_rent_roll, ParseError, convert_danish_number


def print_separator(char="-", length=60):
    print(char * length)


def test_danish_number_conversion():
    """Test Danish number format conversion."""
    print("\n=== Testing Danish Number Conversion ===\n")

    test_cases = [
        ("72.000", 72000),
        ("1.234.567", 1234567),
        ("1.234,56", 1234.56),
        ("100", 100),
        ("50,5", 50.5),
        ("kr 72.000", 72000),
        ("", None),
        (None, None),
        (72000, 72000),
        ("1.5", 1.5),  # Could be 1.5 or 1500 - context dependent
    ]

    for input_val, expected in test_cases:
        result = convert_danish_number(input_val)
        status = "PASS" if result == expected else "FAIL"
        print(f"  {status}: '{input_val}' -> {result} (expected: {expected})")


def test_file(file_path: str):
    """Test parsing a single file."""
    path = Path(file_path)

    if not path.exists():
        print(f"ERROR: File not found: {file_path}")
        return False

    print(f"\n=== Testing: {path.name} ===\n")

    try:
        result = parse_rent_roll(file_path)

        print(f"File Type: {result['file_type']}")
        print(f"Confidence: {result['confidence']}")
        print(f"Header Row: {result['header_row']}")
        print(f"Total Rows: {result['total_rows']}")

        print_separator()
        print("Columns Found:")
        for col in result['columns']:
            if col:
                print(f"  - {col}")

        print_separator()
        print("Column Mapping:")
        for danish, standard in result['column_mapping'].items():
            print(f"  {danish} -> {standard}")

        print_separator()
        print("Source Info:")
        for key, value in result['source_info'].items():
            print(f"  {key}: {value}")

        if result['parse_warnings']:
            print_separator()
            print("Warnings:")
            for warning in result['parse_warnings']:
                print(f"  - {warning}")

        print_separator()
        print("Sample Rows (first 5):")
        for i, row in enumerate(result['rows'][:5]):
            print(f"\n  Row {i+1} (source: {row['source']}, row_num: {row['row_num']}):")
            if row['rent_type']:
                print(f"    rent_type: {row['rent_type']}")
            print(f"    data: {row['raw'][:6]}...")  # Show first 6 columns

        print_separator()
        print("\nParsing successful!")
        return True

    except ParseError as e:
        print(f"Parse Error: {e.error_type}")
        print(f"Message: {e.message}")
        return False

    except Exception as e:
        print(f"Unexpected Error: {type(e).__name__}: {str(e)}")
        return False


def main():
    if len(sys.argv) < 2:
        print("Danish Rent Roll Parser - Test Script")
        print()
        print("Usage:")
        print("  python test_parser.py <file_path>")
        print("  python test_parser.py --test-conversion")
        print()
        print("Examples:")
        print("  python test_parser.py rent_roll.xlsx")
        print("  python test_parser.py lejeliste.pdf")
        print()
        print("Supported file types: .xlsx, .xls, .pdf")
        return

    if sys.argv[1] == "--test-conversion":
        test_danish_number_conversion()
        return

    # Test all provided files
    success_count = 0
    fail_count = 0

    for file_path in sys.argv[1:]:
        if file_path.startswith("--"):
            continue

        if test_file(file_path):
            success_count += 1
        else:
            fail_count += 1

    print("\n" + "=" * 60)
    print(f"Results: {success_count} passed, {fail_count} failed")


if __name__ == "__main__":
    main()
