# Troubleshooting Guide

## Issue 1: Project Column Not Showing for Students

### Possible Causes:

1. **Column Settings**: The project column visibility might be set to false
2. **Data Values**: The project values might be null or undefined
3. **Excel Import**: The project column might not be properly imported from Excel
4. **Database Migration**: Existing data might not have the new project column

### Solutions:

#### Check Column Settings

1. Go to Admin Menu → "⚙️ Column Settings"
2. Ensure "✅ Project" is enabled (green checkmark)
3. If it shows "❌ Project", click to toggle it to enabled

#### Check Data Values

- The project column will only show if:
  - Column setting is enabled (not false)
  - Student has a project value (not null or undefined)
  - Value is a valid number or text

#### For Excel Import

- Make sure your Excel file includes a "PROJECT" column
- Supported column names: PROJECT, FINAL PROJECT, TERM PROJECT, CAPSTONE, etc.
- If column is missing, it will default to null (not displayed)

#### For Existing Data

- Re-upload your Excel file with project data
- Or manually update database records to include project values

### Debug Steps:

1. Check the console logs when a student searches for results
2. Look for "🔍 Project not shown:" debug messages
3. The debug output will show:
   - `projectVisible`: Whether column setting allows display
   - `projectValue`: The actual project value
   - `projectNotNull`: Whether value is not null
   - `projectNotUndefined`: Whether value is not undefined

## Issue 2: Telegram "Message Not Modified" Error

### Cause:

This error occurs when trying to edit a Telegram message with exactly the same content and buttons.

### Solution:

The course settings now include a timestamp to ensure the message content is always unique:

```
🕐 Last updated: [current date/time]
```

### Error Handling:

The bot now gracefully handles this error and continues operation without disruption.

## General Debugging

### Enable Debug Mode:

1. Check console output when students search for results
2. Debug messages will show why columns are not displayed
3. Use the test scripts:
   - `node debug-project.js` - Check database and column settings
   - `node test-project-display.js` - Test result formatting

### Common Issues:

1. **Column not in Excel**: Add the column to your Excel file
2. **Column setting disabled**: Enable in admin column settings
3. **Null values**: Ensure data has actual values, not empty cells
4. **Database migration**: New columns added automatically, but existing data needs re-import

### Quick Fixes:

1. **Reset Column Settings**: Use "🔄 Reset All" in column settings
2. **Re-upload Excel**: Upload your Excel file again to ensure new columns are included
3. **Check Admin Menu**: Ensure you're using the admin account to access settings

## Testing

### Test Student Data:

```javascript
const testStudent = {
  studentName: "John Doe",
  studentId: "GPR0015/15",
  quiz: 85,
  mid: 78,
  assignment: 92,
  groupAssignment: 88, // Should show if enabled
  project: 95, // Should show if enabled
  final: 82,
  total: 87.5,
  grade: "B+",
};
```

### Expected Result Format:

```
🎓 Student Result

📚 Course: Computer Science 101
👨‍🏫 Instructor: Dr. John Smith

👤 Name: John Doe
🆔 ID: GPR0015/15
📝 Quiz: 85
📚 Mid: 78
📋 Assignment: 92
👥 Group Assignment: 88
🚀 Project: 95
📖 Final: 82
📊 Total: 87.5
🏆 Grade: B+
```

If Project or Group Assignment are missing, check the debug output in the console.
