# Grade System Changes - Migration from Calculated to Uploaded Grades

## Overview

The system has been updated to remove automatic grade calculation logic and instead require grades to be uploaded directly in Excel files. Individual assessment marks (quiz, midterm, assignment, project, final) are now stored for reference only.

## Changes Made

### Backend Changes

#### 1. Student Model (`backend/models/Student.js`)

- **REMOVED**: `Student.calculateGrade()` static method that calculated grades from total marks
- **UPDATED**: `Student.prototype.calculateGPA()` to only use courses with uploaded grades (not N/A)
- **UPDATED**: `Student.getGradePoints()` to handle "N/A" grades (returns 0.0 points)

#### 2. Course Model (`backend/models/Student.js`)

- **ADDED**: "N/A" to grade enum for courses without uploaded grades
- **UPDATED**: Added comments indicating marks are for reference only
- **UPDATED**: Grade field now requires uploaded values, no calculation

#### 3. Excel Service (`backend/services/ExcelService.js`)

- **REMOVED**: Grade calculation logic in `processCourses()` method
- **UPDATED**: Now requires grade to be provided in Excel upload
- **UPDATED**: Individual marks are stored for reference only
- **UPDATED**: Required columns now include "grade" field
- **UPDATED**: Courses are only created if grade is provided

#### 4. Assessment Config Model (`backend/models/AssessmentConfig.js`)

- **UPDATED**: Comments to reflect that configurations are for reference only
- **MAINTAINED**: Structure preserved for historical data and reference

### Frontend Changes

#### 1. Check Result Page (`frontend/src/pages/CheckResultPage.jsx`)

- **REMOVED**: `calculateGrade()` function that duplicated backend calculation logic
- **UPDATED**: Now displays uploaded grades directly from `course.grade`
- **ADDED**: Support for "N/A" grade styling (gray color)
- **UPDATED**: No longer calculates grades from total marks on frontend

### Database Migration

#### 1. Migration Script (`backend/scripts/updateGradeSystem.js`)

- **CREATED**: Script to migrate existing data to new grade system
- **FEATURES**:
  - Updates null grades to "N/A"
  - Recalculates GPAs based on uploaded grades only
  - Updates database schema to support "N/A" grades
  - Preserves all existing student and course data

#### 2. Documentation (`backend/scripts/README.md`)

- **UPDATED**: Added documentation for the new migration script
- **ADDED**: Information about grade system changes
- **ADDED**: Best practices for the new system

## New System Requirements

### Excel Upload Requirements

1. **Grade Column**: Must include a "Grade" column with letter grades (A+, A, A-, B+, B, B-, C+, C, C-, D, Fx, F, I, W)
2. **Individual Marks**: Quiz, Midterm, Assignment, Project, Final columns are optional and for reference only
3. **Required Fields**: Full Name, Student ID, and Grade are now required

### Grade Values

- **Valid Grades**: A+, A, A-, B+, B, B-, C+, C, C-, D, Fx, F, I, W, N/A
- **N/A Grade**: Used for courses without uploaded grades (0.0 grade points)
- **GPA Calculation**: Only includes courses with valid uploaded grades (excludes N/A)

## Migration Steps

1. **Update Code**: Deploy the updated codebase
2. **Run Migration**: Execute `node backend/scripts/updateGradeSystem.js`
3. **Update Excel Templates**: Ensure all future uploads include Grade column
4. **Verify Data**: Check that GPAs are calculated correctly from uploaded grades

## Benefits

1. **Accuracy**: Grades are now explicitly provided rather than calculated, reducing errors
2. **Flexibility**: Supports different grading schemes and manual grade adjustments
3. **Transparency**: Clear separation between assessment marks (reference) and final grades
4. **Consistency**: Eliminates discrepancies between calculated and actual grades
5. **Compliance**: Better alignment with institutional grading policies

## Backward Compatibility

- **Existing Data**: All existing student and course data is preserved
- **Assessment Configs**: Historical assessment configurations are maintained for reference
- **Individual Marks**: All existing individual marks are preserved as reference data
- **GPAs**: Recalculated based on existing uploaded grades

## Important Notes

- **No More Calculation**: The system will no longer calculate grades from individual marks
- **Upload Required**: All grades must be provided in Excel uploads
- **Reference Only**: Individual assessment marks are stored but not used for grade calculation
- **Migration Once**: The migration script should only be run once after deploying the changes
