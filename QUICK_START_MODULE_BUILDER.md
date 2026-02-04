# Quick Start Guide: Using the Module Builder

## 🎯 Your Goal
Create dynamic fields for the Premises module (or any module) without hardcoding.

## 📋 Step-by-Step Instructions

### Step 1: Make Sure You're Logged In ✓

**Check Auth Status:**
1. Open browser (http://localhost:19006 or your app URL)
2. Press F12 to open Developer Console
3. Type: `await window.debugAuth()`
4. You should see: `Token exists: true`

**If NOT logged in:**
- Navigate to the login page
- Enter your credentials
- After login, you'll be redirected to the dashboard

---

### Step 2: Navigate to Modules Screen ✓

1. Click on **"Modules"** in the sidebar/navigation
2. You'll see a list of currently enabled modules
3. Click the **"+ Add Module"** button (blue button, top right)

---

### Step 3: Select Your Module ✓

**The "Add Module" modal will open with:**

1. **Module Name Dropdown** (top section)
   - Click the dropdown
   - Search or scroll to find **"Premises"**
   - Click to select it
   - You'll see a notification: "Module selected. You can now add fields below."

---

### Step 4: Select Module Head/Section ✓

**Below the module dropdown, you'll see:**

1. **"MODULE HEAD / SECTION NAME"** dropdown
   - This shows sections like:
     - Premises Identity
     - Facility Specifications
     - Location Details
   - Click to select **"Premises Identity"**

---

### Step 5: Add Your First Field ✓

**The field builder form appears on the left side:**

#### Example: Create "Premises Name" field

1. **Field Label**: Type `Premises Name`
   - Field Key auto-generates as: `premises_name`

2. **Field Type**: Click dropdown, select `Textbox`

3. **Placeholder**: Type `Enter premises name`

4. **Required**: Toggle ON (blue)

5. **Active**: Toggle ON (blue)

6. **Sort Order**: Leave as `1`

7. Click **"Save Field"** button (blue, bottom)

**✓ Success!** The field appears in the preview panel on the right.

---

### Step 6: Add a Dropdown Field ✓

#### Example: Create "Ownership Type" field

1. **Field Label**: `Ownership Type`
2. **Field Type**: Select `Dropdown`
3. **Placeholder**: `Select ownership type`
4. **Required**: ON

**Now the Options Editor appears:**

5. **Add Options:**
   - Option 1:
     - Label: `Owned`
     - Value: `OWNED` (auto-filled)
   - Click **"+ Add Option"**
   - Option 2:
     - Label: `Rental`
     - Value: `RENTAL`
   - Click **"+ Add Option"**
   - Option 3:
     - Label: `Subleased`
     - Value: `SUBLEASED`

6. Click **"Save Field"**

**✓ Success!** Dropdown field with 3 options is saved.

---

### Step 7: Add a Radio Button Field ✓

#### Example: Create "Status" field

1. **Field Label**: `Status`
2. **Field Type**: Select `Radio Button`
3. **Required**: ON

**Add Radio Options:**

4. **Options:**
   - Active
   - Inactive
   - Under Maintenance

5. Click **"Save Field"**

---

### Step 8: Review Your Fields ✓

**In the right preview panel, you'll see:**

```
Section Fields Preview
━━━━━━━━━━━━━━━━━━━━━━

[SAVED] Premises Name
premises_name • text
[REQ] [Edit] [Delete]

[SAVED] Ownership Type
ownership_type • dropdown
[REQ] [Edit] [Delete]
OPTIONS: Owned, Rental, Subleased

[SAVED] Status
status • radio
[REQ] [Edit] [Delete]
OPTIONS: Active, Inactive, Under Maintenance
```

---

### Step 9: Add More Sections (Optional) ✓

**To add fields to another section:**

1. Change the **"MODULE HEAD / SECTION NAME"** dropdown
2. Select **"Facility Specifications"**
3. Add fields like:
   - Floor Area (number)
   - Construction Date (date)
   - Facilities (checkbox with options)

---

### Step 10: Finalize ✓

1. Click **"Add Module to Company"** button (bottom right)
2. The module is now enabled for your company
3. All fields are saved in the database

---

## 🎨 What You'll See

### Left Side: Field Builder Form
- Field Label input
- Field Key input (auto-generated)
- Field Type dropdown (20+ types)
- Placeholder input
- Required toggle
- Active toggle
- Sort Order input
- Options editor (for dropdown/radio/checkbox)
- Save Field button

### Right Side: Live Preview
- DRAFT badge for unsaved field (as you type)
- List of saved fields
- Edit button (pencil icon)
- Delete button (trash icon)
- Field options displayed as chips

---

## 🔧 Editing Existing Fields

1. Click the **pencil icon** next to any field
2. The form populates with current values
3. Make your changes
4. Click **"Update Field"**

---

## 🗑️ Deleting Fields

1. Click the **trash icon** next to any field
2. Confirm deletion
3. Field is removed from database

---

## 📊 Database Storage

All your fields are stored in:

- **module_sections** - Section names
- **module_section_fields** - Field definitions
- **module_section_field_options** - Dropdown/radio options

---

## ✅ Example: Complete Premises Module

```
Module: Premises
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Section: Premises Identity
  ├─ Premises Name (text, required)
  ├─ Premises Code (text, required)
  ├─ Ownership Type (dropdown: Owned, Rental, Subleased)
  └─ Status (radio: Active, Inactive)

Section: Facility Specifications
  ├─ Floor Area (number, required)
  ├─ Construction Date (date)
  ├─ Facilities (checkbox: Parking, Security, Cafeteria)
  └─ Description (textarea)

Section: Location Details
  ├─ Address (textarea, required)
  ├─ City (text, required)
  ├─ State (dropdown)
  └─ Postal Code (text)
```

---

## 🚀 You're Done!

Your dynamic module system is now configured. The fields you created will be used when:
- Creating new premises
- Editing premises
- Viewing premises details
- Generating reports

**No hardcoding needed!** Everything is dynamic and stored in the database.

---

## 💡 Pro Tips

1. **Use meaningful field keys** - They're used in the database
2. **Set sort order** - Controls field display order
3. **Use placeholders** - Helps users understand what to enter
4. **Mark required fields** - Enforces data quality
5. **Test with different field types** - Explore all 20+ types available

---

## 🆘 Need Help?

- **Auth issues**: See `TROUBLESHOOTING_AUTH.md`
- **Complete docs**: See `MODULE_BUILDER_COMPLETE.md`
- **Browser console**: Press F12 to see detailed logs
- **Server logs**: Check terminal running `node index.js`

---

**Happy Building! 🎉**
