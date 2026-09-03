# Medicine Fields Guide

Quick reference for the new medicine-specific fields in the products table.

## Field Reference

| Field | Type | Required | Default | Description | Example |
|-------|------|----------|---------|-------------|---------|
| `form` | text | Yes | 'tablet' | Medicine format | tablet, capsule, sachet, syrup, injection, cream, drops, inhaler, powder, other |
| `dosage_strength` | text | No | null | Strength/concentration | "500mg", "20.5g per sachet", "Multiple vitamins" |
| `pack_sizes` | text[] | No | [] | Available pack options | ["24 tablets", "48 tablets"] |
| `requires_prescription` | boolean | Yes | false | Prescription needed | true/false |
| `active_ingredient` | text | No | null | Active pharmaceutical ingredient | "Paracetamol", "Amoxicillin" |
| `manufacturer` | text | No | null | Manufacturer name | "Kinapharma", "Pharmanova" |
| `expiry_date` | date | No | null | Expiration date | "2025-12-31" |
| `storage_info` | text | No | "Store below 30°C..." | Storage instructions | "Store in a cool, dry place" |
| `side_effects` | text | No | null | Possible side effects | "Nausea, diarrhea, skin rash" |
| `contraindications` | text | No | null | When not to use | "Do not take if allergic to penicillin" |
| `is_featured` | boolean | Yes | false | Show on homepage | true/false |

## Form Values (Constraint)

The `form` field accepts only these values:
- `tablet`
- `capsule`
- `sachet`
- `syrup`
- `injection`
- `cream`
- `drops`
- `inhaler`
- `powder`
- `other`

## UI Display Rules

### Product Card
- **Displays:** dosage_strength, form, requires_prescription (badge)
- **Example:** "500mg • Tablet" with yellow ℞ badge if prescription required

### Product Detail Modal
- **Displays all fields** in organized sections:
  1. Category
  2. Dosage & Form
  3. Active Ingredient
  4. Manufacturer
  5. Storage Instructions
  6. Side Effects
  7. Contraindications
  8. Prescription Warning (if required)

## Examples

### Over-the-Counter Pain Reliever
```sql
INSERT INTO products (name, description, price, stock_quantity, category_id, form, dosage_strength, active_ingredient, manufacturer, storage_info, requires_prescription, is_featured)
VALUES (
  'Paracetamol 500mg Tablets',
  'Fast-acting pain relief and fever reducer',
  5.00,
  200,
  (SELECT id FROM categories WHERE name = 'Pain Relief'),
  'tablet',
  '500mg',
  'Paracetamol',
  'Kinapharma',
  'Store below 30°C in a dry place',
  false,
  true
);
```

### Prescription Antibiotic
```sql
INSERT INTO products (name, description, price, stock_quantity, category_id, form, dosage_strength, pack_sizes, active_ingredient, manufacturer, storage_info, side_effects, contraindications, requires_prescription)
VALUES (
  'Amoxicillin 500mg Capsules',
  'Broad-spectrum antibiotic for bacterial infections',
  12.00,
  150,
  (SELECT id FROM categories WHERE name = 'Antibiotics'),
  'capsule',
  '500mg',
  ARRAY['12 capsules', '21 capsules'],
  'Amoxicillin',
  'Pharmanova',
  'Store in a cool, dry place away from light',
  'Nausea, diarrhea, skin rash. Seek medical attention if severe allergic reaction occurs.',
  'Do not take if allergic to penicillin or cephalosporin antibiotics.',
  true
);
```

### Oral Rehydration Sachet
```sql
INSERT INTO products (name, description, price, stock_quantity, category_id, form, dosage_strength, pack_sizes, active_ingredient, manufacturer, storage_info, requires_prescription, is_featured)
VALUES (
  'Oral Rehydration Salts',
  'Electrolyte replacement for dehydration',
  2.50,
  500,
  (SELECT id FROM categories WHERE name = 'Digestive Health'),
  'sachet',
  '20.5g per sachet',
  ARRAY['10 sachets', '20 sachets'],
  'Sodium Chloride, Potassium Chloride, Glucose',
  'WHO Standard',
  'Store at room temperature',
  false,
  true
);
```

## Admin Panel Updates Needed

To fully support medicine management in the admin panel, you'll need to add form fields for:

1. **Dropdown for form** (tablet, capsule, sachet, etc.)
2. **Text input for dosage_strength**
3. **Array input for pack_sizes** (comma-separated)
4. **Checkbox for requires_prescription**
5. **Text input for active_ingredient**
6. **Text input for manufacturer**
7. **Date picker for expiry_date**
8. **Text area for storage_info**
9. **Text area for side_effects**
10. **Text area for contraindications**
11. **Checkbox for is_featured**

These fields should replace or supplement the old size-based pricing fields (price_s, price_m, etc.).
