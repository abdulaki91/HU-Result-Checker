# Sample Excel Data Structure

## Simplified Requirements - Only NAME and ID Required!

The bot now only requires **2 columns** - all others are optional and will use default values if missing.

## Required Columns (Mandatory)

### Student Name Column:

- `STUDENT NAME` ✅
- `STUDENT_NAME` ✅
- `NAME` ✅
- `FULL NAME` ✅
- `FULLNAME` ✅
- `STUDENT` ✅

### Student ID Column:

- `STUDENT ID` ✅
- `STUDENT_ID` ✅
- `ID` ✅
- `STUDENT NO` ✅
- `REG NO` ✅
- `ROLL NO` ✅

## Optional Columns (Will Use Defaults if Missing)

### Quiz Column (default: 0):

- `QUIZ` ✅
- `QUIZ(5%)` ✅
- `QUIZ MARKS` ✅
- `Q` ✅

### Mid Term Column (default: 0):

- `MID` ✅
- `MID(30%)` ✅
- `MIDTERM` ✅
- `MID TERM` ✅

### Assignment Column (default: 0):

- `ASSIGNMENT` ✅
- `ASSIGNMENT(15%)` ✅
- `HOMEWORK` ✅
- `HW` ✅

### Final Exam Column (default: 0):

- `FINAL` ✅
- `FINAL(50%)` ✅
- `FINAL EXAM` ✅
- `FINALS` ✅

### Total Column (default: 0):

- `TOTAL` ✅
- `TOTAL MARKS` ✅
- `TOTAL SCORE` ✅

### Grade Column (default: "--"):

- `GRADE` ✅
- `LETTER GRADE` ✅
- `FINAL GRADE` ✅
- **Accepts any text**: A, B, C, D, F, A+, B-, "--", "N/A", "Incomplete", etc.

## Minimum Excel Format (Only Required Columns)

| NAME       | ID    |
| ---------- | ----- |
| John Doe   | ST001 |
| Jane Smith | ST002 |

**This will work!** Missing columns will show as:

- Quiz: 0, Mid: 0, Assignment: 0, Final: 0, Total: 0, Grade: "--"

## Full Excel Format (All Columns)

| STUDENT NAME | STUDENT ID | QUIZ(5%) | MID(30%) | ASSIGNMENT(15%) | FINAL(50%) | TOTAL | GRADE |
| ------------ | ---------- | -------- | -------- | --------------- | ---------- | ----- | ----- |
| John Doe     | ST001      | 85       | 78       | 92              | 88         | 343   | A     |
| Jane Smith   | ST002      | 90       | 82       | 88              | 91         | 351   | A     |
| Bob Johnson  | ST003      | --       | --       | --              | --         | --    | --    |

## Mixed Format (Some Optional Columns)

| NAME        | ID    | QUIZ | GRADE      |
| ----------- | ----- | ---- | ---------- |
| John Doe    | ST001 | 85   | A          |
| Jane Smith  | ST002 | 90   | B+         |
| Bob Johnson | ST003 | --   | Incomplete |

**This will work!** Missing columns (Mid, Assignment, Final, Total) will default to 0.

## Special Grade Values Supported

- **Letter grades**: A, B, C, D, F, A+, A-, B+, B-, etc.
- **Special markers**: "--", "N/A", "Incomplete", "Absent", "Withdrawn"
- **Custom text**: Any text you want

## Important Notes

1. **Only NAME and ID are required** - everything else is optional
2. **Case doesn't matter** - `name`, `NAME`, `Name` all work
3. **Flexible formats** - `STUDENT NAME`, `FULL NAME`, `NAME` all work
4. **Default values** - Missing optional columns get sensible defaults
5. **Grade flexibility** - Accepts any text including "--", "N/A", etc.
6. **File format** - Must be .xlsx or .xls

## Your Simplified Workflow

1. **Create Excel with just NAME and ID columns**
2. **Add any optional columns you have data for**
3. **Upload to bot** - it will work with whatever you have!
4. **Missing columns automatically get defaults**

**This makes it much easier to upload partial data or student lists!** 🎉
