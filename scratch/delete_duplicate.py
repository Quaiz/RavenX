import os

filepath = 'tactical-ui/src/Layout.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the first NewsTicker
first_ticker_idx = -1
for i, line in enumerate(lines):
    if "{/* SLIM BOTTOM NEWS TICKER" in line:
        first_ticker_idx = i
        break

# Find the last NewsTicker
last_ticker_idx = -1
for i in range(len(lines) - 1, -1, -1):
    if "{/* SLIM BOTTOM NEWS TICKER" in line:
        last_ticker_idx = i
        break

print(f"First ticker at line {first_ticker_idx}")
print(f"Last ticker at line {last_ticker_idx}")

if first_ticker_idx != -1 and last_ticker_idx != -1 and first_ticker_idx != last_ticker_idx:
    # Delete from first_ticker_idx to last_ticker_idx - 1
    new_lines = lines[:first_ticker_idx] + lines[last_ticker_idx:]
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Deleted duplicate block successfully.")
else:
    print("No duplicates found.")
