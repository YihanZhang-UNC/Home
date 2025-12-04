
import re

def find_unescaped_gt(filename):
    with open(filename, 'r') as f:
        lines = f.readlines()

    for i, line in enumerate(lines):
        # Simple heuristic: remove tags, check for >
        # This is not perfect for JSX but good enough for simple cases
        # Remove <...> tags
        clean_line = re.sub(r'<[^>]+>', '', line)
        
        # Check if > remains
        if '>' in clean_line:
            # Ignore arrow functions => or ->
            # But -> is not valid JS arrow, it's usually text
            # => is valid JS
            
            # Check if it's part of =>
            # We want to find > that is NOT part of => or -> or >=
            
            # Let's find all occurrences of >
            for match in re.finditer(r'>', clean_line):
                # Get context
                pos = match.start()
                char_before = clean_line[pos-1] if pos > 0 else ''
                char_after = clean_line[pos+1] if pos < len(clean_line)-1 else ''
                
                if char_before == '=': # =>
                    continue
                if char_before == '-': # ->
                    # -> is valid in comments or strings, but in JSX text it might be an issue if not escaped?
                    # Actually -> is fine in JS logic, but in JSX text node it should be &gt; or -> is treated as text.
                    # But React complains about > in text.
                    pass
                
                # If we are here, we found a suspicious >
                print(f"Line {i+1}: Found suspicious '>' in: {line.strip()}")
                print(f"Cleaned line context: {clean_line.strip()}")

find_unescaped_gt('/Users/zhayihan/Desktop/Github/Home/Pluggy.html')
