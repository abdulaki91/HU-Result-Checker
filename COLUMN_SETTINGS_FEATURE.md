# Column Settings Feature

## Overview

The admin can now control which columns are displayed to students when they check their results. This provides flexibility to show only relevant information based on the current assessment status.

## How It Works

### For Admins:

1. **Access Column Settings**: Use the "⚙️ Column Settings" button in the admin menu
2. **Toggle Columns**: Click on any column to toggle its visibility (✅ = visible, ❌ = hidden)
3. **Reset All**: Use "🔄 Reset All" to show all columns again
4. **Save Settings**: Use "💾 Save Settings" to confirm changes

### Available Columns:

- **Quiz** - Quiz scores
- **Mid Term** - Midterm exam scores
- **Assignment** - Assignment scores
- **Final Exam** - Final exam scores
- **Total Score** - Total calculated score
- **Grade** - Letter grade or final grade

### Always Visible:

- **Student Name** - Always shown (cannot be hidden)
- **Student ID** - Always shown (cannot be hidden)

### For Students:

Students will only see the columns that the admin has enabled. The result format automatically adjusts based on admin preferences.

## Storage

### MySQL Database:

- Column settings are stored in the `column_settings` table
- Each column has a `is_visible` boolean flag

### JSON Storage:

- Column settings are stored in `./data/column_settings.json`
- Default settings show all columns

## Default Behavior:

- All columns are visible by default
- If no settings exist, all columns will be shown
- Settings persist until changed by admin

## Example Use Cases:

1. **Early Semester**: Hide Final and Total columns until final exams are complete
2. **Quiz Only**: Show only Quiz scores during quiz period
3. **Final Results**: Show all columns when semester is complete
4. **Custom Display**: Show only specific assessment types based on course structure
