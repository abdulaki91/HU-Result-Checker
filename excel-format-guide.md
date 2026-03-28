# Excel File Format Guide

## The Problem You're Experiencing

Your Excel file has columns like `HU-ISIMS-RIS - INDEX`, `__EMPTY`, `__EMPTY_1`, etc. This usually happens when:

1. **Merged cells** are used in the Excel file
2. **Title rows** are above the actual column headers
3. **Empty columns** exist between data columns
4. **Formatting issues** in the Excel file

## How to Fix Your Excel File

### Step 1: Clean Up Your Excel File

1. **Open your Excel file**
2. **Remove any merged cells:**
   - Select all data (Ctrl+A)
   - Go to Home → Merge & Center → Unmerge Cells
3. **Remove title rows:**
   - Delete any rows above your column headers
   - Make sure the first row contains only column names
4. **Remove empty columns:**
   - Delete any empty columns between your data

### Step 2: Proper Column Headers

Make sure your first row has clear column headers like:

| STUDENT NAME | STUDENT ID | QUIZ(5%) | MID(30%) | ASSIGNMENT(15%) | FINAL(50%) | TOTAL | GRADE |
| ------------ | ---------- | -------- | -------- | --------------- | ---------- | ----- | ----- |

### Step 3: Clean Data Format

Your Excel should look like this:

```
Row 1: STUDENT NAME | STUDENT ID | QUIZ(5%) | MID(30%) | ASSIGNMENT(15%) | FINAL(50%) | TOTAL | GRADE
Row 2: John Doe     | ST001      | 85       | 78       | 92              | 88         | 343   | A
Row 3: Jane Smith   | GPR0025/15 | 90       | 82       | 88              | 91         | 351   | A
```

## Supported Column Names

The bot supports these variations (case doesn't matter):

### Student Name:

- `STUDENT NAME` ✅
- `NAME` ✅
- `FULL NAME` ✅
- `STUDENT` ✅

### Student ID:

- `STUDENT ID` ✅
- `ID` ✅
- `STUDENT NO` ✅
- `REG NO` ✅

**📝 Note: Excel import accepts any Student ID format (ST001, GPR0014/14, 0014/14, etc.)**

### Quiz:

- `QUIZ` ✅
- `QUIZ(5%)` ✅ (Your format!)
- `QUIZ MARKS` ✅

### Mid Term:

- `MID` ✅
- `MID(30%)` ✅ (Your format!)
- `MIDTERM` ✅

### Assignment:

- `ASSIGNMENT` ✅
- `ASSIGNMENT(15%)` ✅ (Your format!)
- `HOMEWORK` ✅

### Final:

- `FINAL` ✅
- `FINAL(50%)` ✅ (Your format!)
- `FINAL EXAM` ✅

### Total:

- `TOTAL` ✅ (Your format!)
- `TOTAL MARKS` ✅

### Grade:

- `GRADE` ✅ (Your format!)
- `LETTER GRADE` ✅

## Quick Fix Steps

1. **Save a copy** of your original file
2. **Open the copy** in Excel
3. **Select all data** (Ctrl+A)
4. **Unmerge all cells** (Home → Merge & Center → Unmerge Cells)
5. **Delete any rows above your column headers**
6. **Delete any empty columns**
7. **Make sure first row has clear column names**
8. **Save as .xlsx**
9. **Upload to the bot**

## Example of What NOT to Do

❌ **Bad Format:**

```
HU-ISIMS-RIS - INDEX
                    STUDENT NAME | STUDENT ID | QUIZ(5%) | ...
                    John Doe     | ST001      | 85       | ...
```

✅ **Good Format:**

```
STUDENT NAME | STUDENT ID | QUIZ(5%) | MID(30%) | ASSIGNMENT(15%) | FINAL(50%) | TOTAL | GRADE
John Doe     | ST001      | 85       | 78       | 92              | 88         | 343   | A
Jane Smith   | GPR0025/15 | 90       | 82       | 88              | 91         | 351   | A
```

## Student ID Requirements

### For Excel Import (Flexible):

**✅ Excel import accepts ANY Student ID format:**

- `ST001` ✅
- `GPR0014/14` ✅
- `0014/14` ✅
- `REG123` ✅
- `1234` ✅

### For Student Search (Strict):

**⚠️ Students must enter IDs in format XXXX/XX when searching:**

#### Valid Search Examples:

- `0014/14` ✅
- `0025/15` ✅
- `0123/20` ✅
- `1234/21` ✅

#### Invalid Search Examples:

- `ST001` ❌ (missing slash and year)
- `0014` ❌ (missing slash and year)
- `GPR0014/14` ❌ (has prefix)

**Note:** Admins can upload Excel files with any Student ID format, but students must use the XXXX/XX format when searching for their results.

## Still Having Issues?

If you're still getting errors:

1. **Check the error message** - it will show you what columns were found
2. **Make sure there are no spaces** before/after column names
3. **Ensure all data is in the same sheet**
4. **Try saving as a new .xlsx file**
5. **Remove any special characters** from column names

The bot is now much better at handling different Excel formats, but clean data always works best!
