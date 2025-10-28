# Changelog

## Recent Updates

### Repository Cleanup
- Removed unnecessary documentation files:
  - DATABASE_SCHEMA.md
  - DATABASE_SETUP.md
  - DEPLOYMENT_GUIDE.md
  - FIX_CORS_ERROR.md
  - MANUAL_SETUP_GUIDE.md
  - PARTY_CRUD_FEATURES.md
  - QUICK_START.md
  - SETUP_COMPLETE.md
  - VERCEL_DEPLOYMENT.md
  - VERCEL_DEPLOY_STEPS.md
- Removed test/setup HTML files:
  - setup-users-caller.html
  - test-functions.html
- Removed unused SQL files:
  - create-users-manual.sql
  - mysql_migration.sql
  - setup-env.ps1

### Export Functionality Enhancements

#### Added Dependencies
- `xlsx` - For Excel file generation
- `jspdf` - For PDF generation
- `jspdf-autotable` - For table formatting in PDFs

#### Reports Page Updates (src/pages/Reports.tsx)

**New Features:**
1. **Payment Date Column**: Added `payment_date` field to all exports
2. **Excel Export (.xlsx)**: 
   - Replaced CSV export with proper Excel format
   - Includes custom business header with:
     - GSTIN: 29CRIPS99400Q1ZG
     - Business name: PRADHAN MANTRI BHARATIYA JANAUSHADI KENDRA
     - Address: BIN-NOOR CENTER BUILDING NO:G-3, 108 DOWN TOWN
     - DL Numbers: KA-KW1-172867, KA-KW1-172868
     - Mobile: 8095064482
     - Current date
   - All transaction columns including payment date

3. **PDF Export**: 
   - New PDF export option with professional formatting
   - Same custom header as Excel export
   - Purple-themed header matching business branding
   - Properly formatted table with all transaction details
   - Optimized column widths for readability

**Export Columns:**
- Date
- Party Name
- Subtotal
- CGST
- SGST
- Total
- Payment Type
- **Payment Date** (NEW)
- Status
- Notes

**UI Changes:**
- Two separate export buttons:
  - "Download Excel Report" (primary button)
  - "Download PDF Report" (secondary button)
- Updated info card to reflect new features
- Responsive button layout (side-by-side on desktop, stacked on mobile)

### Technical Details
- Both exports include the same custom header for consistency
- Payment date is formatted as Indian locale date (DD/MM/YYYY)
- Empty payment dates show as "-" in exports
- All existing filters (date range, party, status) work with both export formats
