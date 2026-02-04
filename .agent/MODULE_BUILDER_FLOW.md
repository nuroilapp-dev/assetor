# Module Builder - Field Creation Flow

## Overview
The Module Builder allows you to create custom fields for modules. When you add field details in the form, they are:
1. **Previewed in real-time** in the "Section Fields Preview" panel
2. **Saved to the database** when you click "Save Field"

## Database Tables

### 1. `module_section_fields`
Stores the field definitions:
- `id` - Auto-increment primary key
- `company_id` - Company that owns this field
- `module_id` - Module this field belongs to
- `section_id` - Section within the module
- `field_key` - Unique identifier (auto-generated from label)
- `label` - Display name for the field
- `field_type` - Type of field (text, dropdown, date, etc.)
- `placeholder` - Helper text
- `is_required` - Boolean flag
- `is_active` - Boolean flag
- `sort_order` - Display order
- `created_at`, `updated_at` - Timestamps

### 2. `module_section_field_options`
Stores options for dropdown/radio/checkbox fields:
- `id` - Auto-increment primary key
- `field_id` - Foreign key to module_section_fields
- `option_label` - Display text
- `option_value` - Stored value
- `sort_order` - Display order

## Complete Flow

### Frontend (FieldBuilderPanel.js)

1. **User fills in the form:**
   - Field Label (e.g., "Asset Name")
   - Field Key (auto-generated: "asset_name")
   - Field Type (dropdown selection)
   - Placeholder text
   - Required/Active toggles
   - Options (for dropdown/radio/checkbox types)

2. **Live Preview appears:**
   - Shows in real-time as you type
   - Blue border indicates it's a draft
   - "DRAFT" or "EDITING" badge
   - Shows all field properties including options

3. **User clicks "Save Field":**
   - `handleSaveField()` function is called
   - Validates required fields
   - Creates payload with all field data
   - Sends POST request to `/api/module-builder/fields`

### Backend (moduleBuilderController.js)

1. **Receives the request:**
   - Route: `POST /api/module-builder/fields`
   - Controller: `createField()`
   - Requires authentication (COMPANY_ADMIN or SUPER_ADMIN)

2. **Database transaction:**
   ```sql
   BEGIN TRANSACTION;
   
   -- Insert field
   INSERT INTO module_section_fields 
   (company_id, module_id, section_id, field_key, label, field_type, 
    placeholder, is_required, is_active, sort_order)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
   
   -- Insert options (if field type supports them)
   INSERT INTO module_section_field_options 
   (field_id, option_label, option_value, sort_order)
   VALUES (?, ?, ?, ?);
   
   COMMIT;
   ```

3. **Returns success response:**
   ```json
   {
     "success": true,
     "message": "Field created",
     "data": { "id": 123 }
   }
   ```

### Frontend Response Handling

1. **Success:**
   - Shows success alert
   - Resets the form
   - Fetches updated field list
   - Live preview disappears
   - New field appears in saved fields list

2. **Error:**
   - Shows error alert with message
   - Form remains filled for correction

## Testing the Flow

### 1. Open the Module Builder
- Navigate to Modules section
- Click "Add Module"
- Select a module (e.g., "Asset Categories")

### 2. Select a Section
- Choose a section from the dropdown (e.g., "Category Identity")

### 3. Fill in Field Details
- **Field Label:** "Priority Level"
- **Field Key:** (auto-fills as "priority_level")
- **Field Type:** Select "Dropdown"
- **Placeholder:** "Select priority"
- **Required:** Toggle ON
- **Active:** Toggle ON

### 4. Add Options (for Dropdown)
- Click "+ Add Option"
- Option 1: Label="High", Value="HIGH"
- Option 2: Label="Medium", Value="MEDIUM"
- Option 3: Label="Low", Value="LOW"

### 5. Watch the Live Preview
- As you type, the preview card appears at the top
- Blue border indicates it's a draft
- All changes reflect immediately

### 6. Save the Field
- Click "Save Field" button
- Watch browser console for logs:
  ```
  [FieldBuilder] Saving field with payload: {...}
  [FieldBuilder] Creating new field
  [FieldBuilder] Server response: {...}
  [FieldBuilder] Field saved successfully!
  ```
- Watch server console for logs:
  ```
  [ModuleBuilder] createField called with payload: {...}
  [ModuleBuilder] Inserting field into module_section_fields...
  [ModuleBuilder] Field created with ID: 123
  [ModuleBuilder] Inserting 3 options for field 123...
  [ModuleBuilder] 3 options inserted successfully
  [ModuleBuilder] Transaction committed successfully
  ```

### 7. Verify in Database
```sql
-- Check the field was created
SELECT * FROM module_section_fields 
WHERE field_key = 'priority_level';

-- Check the options were created
SELECT o.* 
FROM module_section_field_options o
JOIN module_section_fields f ON o.field_id = f.id
WHERE f.field_key = 'priority_level';
```

## Troubleshooting

### Field not saving?
1. Check browser console for errors
2. Check server console for errors
3. Verify authentication (must be logged in as COMPANY_ADMIN or SUPER_ADMIN)
4. Verify module_id and section_id are valid
5. Check database connection

### Options not showing?
1. Verify field_type is one of: dropdown, radio, checkbox, select, multiselect
2. Check that options have both label and value
3. Verify options were sent in the payload

### Live preview not showing?
1. Ensure you've selected a section
2. Ensure you've typed a field label
3. Check that fieldLabel state is updating

## Enhanced Features

### Logging
- Detailed console logs on both frontend and backend
- Helps track the complete flow
- Easy debugging

### Error Handling
- User-friendly error messages
- Server error messages passed to frontend
- Transaction rollback on errors

### Success Feedback
- Success alert after save
- Form automatically resets
- Field appears in saved list immediately

## API Endpoints

### Create Field
```
POST /api/module-builder/fields
Authorization: Bearer <token>

Body:
{
  "module_id": 1,
  "section_id": 5,
  "field_key": "priority_level",
  "label": "Priority Level",
  "field_type": "dropdown",
  "placeholder": "Select priority",
  "is_required": true,
  "is_active": true,
  "sort_order": 1,
  "options": [
    { "label": "High", "value": "HIGH" },
    { "label": "Medium", "value": "MEDIUM" },
    { "label": "Low", "value": "LOW" }
  ]
}

Response:
{
  "success": true,
  "message": "Field created",
  "data": { "id": 123 }
}
```

### Get Fields
```
GET /api/module-builder/fields?section_id=5
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": 123,
      "field_key": "priority_level",
      "label": "Priority Level",
      "field_type": "dropdown",
      "placeholder": "Select priority",
      "is_required": 1,
      "is_active": 1,
      "sort_order": 1,
      "options": [
        {
          "id": 1,
          "field_id": 123,
          "option_label": "High",
          "option_value": "HIGH",
          "sort_order": 0
        },
        ...
      ]
    }
  ]
}
```
