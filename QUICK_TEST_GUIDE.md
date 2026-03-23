# Quick Test Guide - Create Simple Excel File

## Your Current Issue

Your Excel file has a title row `HU-ISIMS-RIS - INDEX` which is confusing the parser. Let's create a simple test file first.

## Create a Simple Test Excel File

### Step 1: Open Excel/Google Sheets

### Step 2: Create This Simple Structure

**Row 1 (Headers):**

```
A1: NAME
B1: ID
```

**Row 2 (Data):**

```
A2: John Doe
B2: ST001
```

**Row 3 (Data):**

```
A3: Jane Smith
B3: ST002
```

### Step 3: Save as .xlsx

Save the file as `test_students.xlsx`

## Test This Simple File First

This minimal file should work perfectly:

| NAME       | ID    |
| ---------- | ----- |
| John Doe   | ST001 |
| Jane Smith | ST002 |

## If Simple File Works, Then Fix Your Original File

### Option 1: Clean Your Original File

1. **Open your original Excel file**
2. **Delete the title row** (`HU-ISIMS-RIS - INDEX`)
3. **Make sure first row has clear headers** like:
   - Column A: `NAME` or `STUDENT NAME`
   - Column B: `ID` or `STUDENT ID`
   - Column C: `QUIZ` (optional)
   - etc.
4. **Remove any merged cells**
5. **Save as new .xlsx file**

### Option 2: Copy Data to New File

1. **Create new Excel file**
2. **Add headers in row 1**: `NAME`, `ID`, `QUIZ`, `MID`, etc.
3. **Copy your student data** (skip title rows)
4. **Paste starting from row 2**
5. **Save as .xlsx**

## Expected Result

After uploading the simple test file, you should see:

```
✅ File processed successfully!
📊 Summary:
• Students processed: 2
• File: test_students.xlsx
```

Then students can search:

- `ST001` → Shows: John Doe, Quiz: 0, Mid: 0, etc., Grade: "--"
- `ST002` → Shows: Jane Smith, Quiz: 0, Mid: 0, etc., Grade: "--"

## Debug Information

The bot now shows detailed parsing information in the console. You'll see:

- `📊 Parsing Excel file`
- `📋 Excel range`
- `📊 Trying from row X`
- `📋 First row keys`
- `✅ Found valid data structure`

This will help identify exactly where the parsing is failing.

## Common Excel Issues to Avoid

1. **Title rows above headers** ❌
2. **Merged cells** ❌
3. **Empty rows between title and headers** ❌
4. **Complex formatting** ❌
5. **Headers not in first data row** ❌

## What Works ✅

1. **Simple headers in row 1**: `NAME`, `ID`
2. **Data starting in row 2**
3. **No merged cells**
4. **Clean .xlsx format**
5. **At least NAME and ID columns**

Try the simple test file first, then we can work on fixing your original file format!
