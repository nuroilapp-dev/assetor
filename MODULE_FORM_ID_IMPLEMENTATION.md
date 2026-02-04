# Module Form ID-Based Implementation Summary

## Overview
Updated the module form system to save `country_id`, `premises_type_id`, `area_id`, and `status_id` to the database instead of text values.

## Changes Made

### 1. Backend Updates

#### `server/controllers/companyModulesController.js`
- **Added `getAreas()` endpoint**: Fetches area list from the `area` table
- **Updated `addCompanyModule()`**: Now accepts and saves `country_id`, `premises_type_id`, `area_id`, and `status_id`
- **Updated `updateCompanyModule()`**: Now updates using ID fields instead of text fields

#### `server/routes/companyModules.js`
- Added route: `GET /api/areas` to fetch available areas

### 2. Frontend Updates

#### `apps/web/src/components/modals/ModuleFormModal.js`
- **State Management**: Changed to store complete objects instead of text:
  - `country`: Now stores `{id, country_name}` object
  - `premisesType`: Now stores `{id, type_name}` object
  - `sectionArea`: Now stores `{id, name}` object
  
- **Added `fetchAreas()`**: Fetches area list from API
- **Updated `handleSave()`**: Sends IDs to backend:
  ```javascript
  {
    country_id: country?.id || null,
    premises_type_id: premisesType?.id || null,
    area_id: sectionArea?.id || null,
    status_id: status === 'ACTIVE' ? 1 : 2
  }
  ```

- **Updated Dropdowns**: 
  - Display values using object properties (e.g., `country?.country_name`)
  - Set complete objects on selection
  - Section Area now loads from database instead of hardcoded values

### 3. Database Migration

#### `db/migrations/add_id_columns_company_modules.sql`
SQL migration script to add ID columns to `company_modules` table:
- `country_id INT(11) NULL`
- `premises_type_id INT(11) NULL`
- `area_id INT(11) NULL`
- `status_id INT(11) NULL DEFAULT 1`

**To apply migration:**
```bash
mysql -u root -h localhost software_db < "d:\Asset Web\db\migrations\add_id_columns_company_modules.sql"
```

## Database Schema Requirements

The system expects these tables to exist:
- `countries` (id, country_name)
- `premises_types` (id, type_name)
- `area` (id, name)
- `module_sections` (already has country_id, premises_types_id, area_id, status_id columns)

## API Endpoints

### New Endpoint
- `GET /api/areas` - Returns list of areas

### Existing Endpoints (unchanged)
- `GET /api/countries` - Returns list of countries
- `GET /api/premises-types` - Returns list of premises types
- `POST /api/company-modules` - Creates module (now accepts IDs)
- `PUT /api/company-modules/:id` - Updates module (now accepts IDs)

## Data Flow

1. **Module Creation/Edit**:
   - Frontend loads dropdown options (countries, types, areas)
   - User selects from dropdowns
   - Frontend stores complete objects with IDs
   - On save, extracts IDs and sends to backend
   - Backend saves IDs to `company_modules` table

2. **Module Loading**:
   - Backend needs to be updated to JOIN with reference tables to return names
   - Frontend reconstructs objects from ID + name pairs

## Next Steps

1. **Run the migration** to add ID columns to `company_modules` table
2. **Update `getModuleMaster()` and `listCompanyModules()`** to JOIN with countries, premises_types, and area tables to return both IDs and names
3. **Test the complete flow**: Create, edit, and view modules with the new ID-based system
4. **Optional**: Add foreign key constraints for data integrity

## Benefits

- ✅ Normalized database structure
- ✅ Referential integrity (with foreign keys)
- ✅ Easier to update reference data
- ✅ Consistent with `module_sections` table structure
- ✅ Better query performance with indexed IDs
