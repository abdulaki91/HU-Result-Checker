# Dynamic Assessment Weighting System

## Overview

The system now supports dynamic assessment weightings, allowing different Excel uploads to have different mark distributions (e.g., Quiz 10% instead of 5%, Midterm 20% instead of 30%).

## Features

### 1. Flexible Mark Storage

- The system accepts ANY mark values from Excel files
- No hardcoded weightings in the database
- Marks are stored as-is from the Excel file

### 2. Assessment Configuration Model

- New `AssessmentConfig` model stores weighting information
- Supports multiple configurations (e.g., different per batch/department)
- Validates that weights add up to 100%

### 3. Dynamic Display

- Column headers show current weightings (e.g., "Quiz (10%)")
- Weightings update automatically based on active configuration
- No need to manually update column names

## Database Schema

### New Table: `assessment_configs`

```sql
CREATE TABLE assessment_configs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  configName VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255),

  -- Weightings (percentages)
  quizWeight DECIMAL(5,2) DEFAULT 5.00,
  midtermWeight DECIMAL(5,2) DEFAULT 30.00,
  assignmentWeight DECIMAL(5,2) DEFAULT 10.00,
  projectWeight DECIMAL(5,2) DEFAULT 15.00,
  finalWeight DECIMAL(5,2) DEFAULT 40.00,

  -- Maximum marks
  quizMaxMarks DECIMAL(5,2) DEFAULT 5.00,
  midtermMaxMarks DECIMAL(5,2) DEFAULT 30.00,
  assignmentMaxMarks DECIMAL(5,2) DEFAULT 10.00,
  projectMaxMarks DECIMAL(5,2) DEFAULT 15.00,
  finalMaxMarks DECIMAL(5,2) DEFAULT 40.00,

  isActive BOOLEAN DEFAULT FALSE,
  createdBy INT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### Updated Table: `courses`

Added field:

```sql
assessmentConfigId INT NULL REFERENCES assessment_configs(id)
```

## How It Works

### 1. Excel Upload

When you upload an Excel file:

- System reads marks as-is (no conversion)
- Stores raw mark values in database
- Optionally detects weighting from first row of data
- Links course to assessment configuration

### 2. Display

When student views results:

- Backend fetches active assessment configuration
- Sends weighting info to frontend
- Frontend displays: "Quiz (10%)" or "Midterm (20%)"
- Marks shown are the actual values from Excel

### 3. Configuration Management

Admins can:

- Create multiple assessment configurations
- Set one as active (default)
- Switch between configurations
- System validates weights add up to 100%

## API Response Structure

### Student Result Endpoint

```json
{
  "success": true,
  "data": {
    "studentInfo": {...},
    "courses": [
      {
        "courseCode": "CS101",
        "marks": {
          "quiz": 8.5,
          "midterm": 25.0,
          "assignment": 12.0,
          "project": 18.0,
          "final": 38.0,
          "total": 101.5
        }
      }
    ]
  },
  "assessmentConfig": {
    "quiz": { "weight": 10, "maxMarks": 10 },
    "midterm": { "weight": 25, "maxMarks": 25 },
    "assignment": { "weight": 15, "maxMarks": 15 },
    "project": { "weight": 20, "maxMarks": 20 },
    "final": { "weight": 30, "maxMarks": 30 }
  }
}
```

## Excel File Format

### Example 1: Traditional Weighting (5-30-10-15-40)

```
Student ID | Name | Course | Quiz | Mid | Assignment | Project | Final | Total | Grade
UGPR001/15 | John | CS101 | 4.5  | 28  | 9          | 14      | 38    | 93.5  | A
```

### Example 2: New Weighting (10-20-15-15-40)

```
Student ID | Name | Course | Quiz | Mid | Assignment | Project | Final | Total | Grade
UGPR001/15 | John | CS101 | 9.0  | 18  | 14         | 14      | 37    | 92.0  | A
```

Both formats work! The system stores the actual values and displays them with the configured weightings.

## Usage Examples

### Scenario 1: Different Weightings Per Batch

**2023 Batch** (Traditional):

- Quiz: 5%, Midterm: 30%, Assignment: 10%, Project: 15%, Final: 40%

**2024 Batch** (New):

- Quiz: 10%, Midterm: 20%, Assignment: 15%, Project: 15%, Final: 40%

**Solution**:

1. Create config "2023-batch" with traditional weights
2. Create config "2024-batch" with new weights
3. When uploading 2023 data, set "2023-batch" as active
4. When uploading 2024 data, set "2024-batch" as active
5. System displays correct weightings for each batch

### Scenario 2: Mid-Semester Change

**Before Change**:

- Quiz: 5%, Midterm: 30%, Assignment: 10%, Project: 15%, Final: 40%

**After Change**:

- Quiz: 10%, Midterm: 25%, Assignment: 15%, Project: 10%, Final: 40%

**Solution**:

1. Create new config "semester2-2024"
2. Set new weights
3. Activate the new config
4. All future uploads use new weights
5. Old data remains unchanged but displays with new labels

## Benefits

### 1. Flexibility

- ✅ Accept any mark distribution from Excel
- ✅ No need to modify code for new weightings
- ✅ Support multiple configurations simultaneously

### 2. Accuracy

- ✅ Marks stored exactly as in Excel
- ✅ No rounding errors from conversions
- ✅ Original data preserved

### 3. Clarity

- ✅ Column headers show current weightings
- ✅ Students see what each component is worth
- ✅ No confusion about mark distribution

### 4. Maintainability

- ✅ Change weightings without code changes
- ✅ Historical data remains valid
- ✅ Easy to audit and verify

## Migration Path

### For Existing Data

1. System creates default configuration on first run
2. Default matches current system (5-30-10-15-40)
3. All existing courses work without changes
4. New configurations can be added anytime

### For New Uploads

1. Upload Excel with any mark distribution
2. System stores marks as-is
3. Optionally create new configuration
4. Set as active for future displays

## Admin Interface (Future Enhancement)

Planned features:

- UI to create/edit assessment configurations
- Batch-specific configuration assignment
- Department-specific configurations
- Configuration history and audit log
- Bulk update tools

## Technical Implementation

### Files Modified

1. `backend/models/AssessmentConfig.js` - New model
2. `backend/models/Student.js` - Added assessmentConfigId to Course
3. `backend/models/index.js` - Registered new model
4. `backend/controllers/studentController.js` - Returns assessment config
5. `frontend/src/pages/CheckResultPage.jsx` - Displays dynamic weightings

### Database Migration

Run on server:

```bash
# The new table will be created automatically on next backend restart
touch backend/tmp/restart.txt
```

Or manually:

```sql
-- Create assessment_configs table
-- (Schema provided above)

-- Add column to courses table
ALTER TABLE courses
ADD COLUMN assessmentConfigId INT NULL,
ADD FOREIGN KEY (assessmentConfigId) REFERENCES assessment_configs(id);

-- Create default configuration
INSERT INTO assessment_configs (
  configName, description, isActive,
  quizWeight, midtermWeight, assignmentWeight, projectWeight, finalWeight,
  quizMaxMarks, midtermMaxMarks, assignmentMaxMarks, projectMaxMarks, finalMaxMarks
) VALUES (
  'default', 'Default assessment configuration', TRUE,
  5.00, 30.00, 10.00, 15.00, 40.00,
  5.00, 30.00, 10.00, 15.00, 40.00
);
```

## Testing

### Test Case 1: Default Configuration

1. Upload Excel with traditional marks (5-30-10-15-40)
2. View student result
3. Verify headers show: "Quiz (5%)", "Midterm (30%)", etc.

### Test Case 2: New Configuration

1. Create config with new weights (10-20-15-15-40)
2. Set as active
3. Upload Excel with new mark distribution
4. View student result
5. Verify headers show: "Quiz (10%)", "Midterm (20%)", etc.

### Test Case 3: Mixed Data

1. Have students with different configurations
2. View results for each
3. Verify correct weightings display for each

## Notes

- The system is backward compatible
- Existing data works without migration
- New features are opt-in
- No breaking changes to existing functionality
- Excel format remains the same (just different values)

## Future Enhancements

1. **Auto-detection**: Detect weighting from Excel data automatically
2. **Per-course config**: Different weightings per course
3. **Validation**: Warn if marks exceed max marks
4. **Reporting**: Show weighting distribution in statistics
5. **Import/Export**: Share configurations between systems
