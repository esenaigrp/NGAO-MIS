# Geography Data Import Guide

Complete guide for importing Kenyan administrative boundaries from GADM GeoJSON files into the NGAO system.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Data Structure](#data-structure)
- [Import Commands](#import-commands)
- [Troubleshooting](#troubleshooting)
- [API Endpoints](#api-endpoints)

---

## Overview

The NGAO geography system uses a hierarchical structure to represent Kenyan administrative boundaries:

```
Country (Kenya)
  └── County (47 counties)
      └── Sub-County (~290 sub-counties)
          └── Division/Ward (~1,450 wards)
              └── Location
                  └── Sub-Location
```

### Area Model Structure

```python
class Area(models.Model):
    AREA_TYPES = (
        ("country", "Country"),
        ("county", "County"),
        ("sub_county", "Sub County"),
        ("division", "Division"),
        ("location", "Location"),
        ("sub_location", "Sub Location"),
    )
    
    id = UUIDField(primary_key=True)
    name = CharField(max_length=150)
    code = CharField(max_length=20, unique=True)
    area_type = CharField(choices=AREA_TYPES)
    parent = ForeignKey('self')
    boundary = MultiPolygonField(srid=4326)
    latitude = DecimalField()
    longitude = DecimalField()
```

---

## Prerequisites

### 1. Required Files

Place these GADM GeoJSON files in `ngao_core/apps/geography/`:

```
ngao_core/apps/geography/
├── adm0.geojson    # Country level (Kenya)
├── adm1.geojson    # County level (47 counties)
├── adm2.geojson    # Sub-County level (~290)
└── adm3.geojson    # Ward/Division level (~1,450)
```

### 2. Download GADM Data

Download from [GADM.org](https://gadm.org/download_country.html):
- Select **Kenya**
- Choose **GeoJSON** format
- Download administrative levels 0-3

### 3. Database Setup

Ensure PostGIS is enabled:

```sql
CREATE EXTENSION postgis;
```

Run migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## Data Structure

### GADM Property Mapping

| GADM Level | File         | GADM Properties           | Area Type   | Parent      |
|------------|--------------|---------------------------|-------------|-------------|
| 0          | adm0.geojson | GID_0, NAME_0, COUNTRY    | country     | None        |
| 1          | adm1.geojson | GID_1, NAME_1             | county      | country     |
| 2          | adm2.geojson | GID_2, NAME_2, GID_1      | sub_county  | county      |
| 3          | adm3.geojson | GID_3, NAME_3, GID_2      | location    | sub_county  |

### Code Generation

Codes are generated hierarchically:

```
Country:     KEN
County:      KEN.1_1 (from GID_1)
Sub-County:  KEN.1.1_1 (from GID_2)
Ward:        KEN.1.1.1_1 (from GID_3)
```

---

## Import Commands

### Complete Import Process

**⚠️ IMPORTANT:** Import in order - each level requires its parent to exist first.

```bash
# 1. Import Country (Level 0)
python manage.py import_country

# 2. Import Counties (Level 1)
python manage.py import_counties

# 3. Import Sub-Counties (Level 2)
python manage.py import_subcounties

# 4. Import Wards/Divisions (Level 3)
python manage.py import_divisions
```

### Command Options

All commands support these options:

```bash
# Clear existing data before import
python manage.py import_counties --clear

# Skip boundary geometries (faster, for testing)
python manage.py import_subcounties --skip-boundaries

# Combine options
python manage.py import_divisions --clear --skip-boundaries
```

### Quick Import Script

Create a shell script for full import:

```bash
#!/bin/bash
# import_all_geography.sh

echo "Starting geography data import..."

echo "Step 1/4: Importing Country..."
python manage.py import_country || exit 1

echo "Step 2/4: Importing Counties..."
python manage.py import_counties || exit 1

echo "Step 3/4: Importing Sub-Counties..."
python manage.py import_subcounties || exit 1

echo "Step 4/4: Importing Wards/Divisions..."
python manage.py import_divisions || exit 1

echo "Import completed successfully!"
echo ""
echo "Summary:"
python manage.py shell -c "
from ngao_core.apps.geography.models import Area
for area_type in ['country', 'county', 'sub_county', 'location']:
    count = Area.objects.filter(area_type=area_type).count()
    print(f'{area_type.title()}: {count}')
"
```

Make executable and run:

```bash
chmod +x import_all_geography.sh
./import_all_geography.sh
```

---

## Import Command Details

### 1. Import Country (`import_country`)

```bash
python manage.py import_country
```

**What it does:**
- Creates Kenya country boundary
- Code: `KEN`
- Parent: None

**Expected output:**
```
Using GeoJSON file: /path/to/adm0.geojson
Created country: Kenya (KEN)
Country import completed!
```

### 2. Import Counties (`import_counties`)

```bash
python manage.py import_counties [--clear] [--skip-boundaries]
```

**What it does:**
- Creates 47 Kenyan counties
- Assigns each county to Kenya as parent
- Generates codes from GID_1 (e.g., `KEN.1_1`)

**Expected output:**
```
Using GeoJSON file: /path/to/adm1.geojson
Loaded 1 countries as parents
Found 47 features to import

Created: Baringo (KEN.1_1) under Kenya
Created: Bomet (KEN.2_1) under Kenya
...

IMPORT COMPLETED
Created:  47
Updated:  0
Total:    47
```

### 3. Import Sub-Counties (`import_subcounties`)

```bash
python manage.py import_subcounties [--clear] [--skip-boundaries]
```

**What it does:**
- Creates ~290 sub-counties
- Assigns each to parent county via NAME_1
- Generates codes from GID_2 (e.g., `KEN.1.1_1`)

**Expected output:**
```
Using GeoJSON file: /path/to/adm2.geojson
Loaded 47 counties as parents
Found 290 features to import

Created: BaringoCentral (KEN.1.1_1) under Baringo
Created: BaringoNorth (KEN.1.2_1) under Baringo
Progress: 50/290...
...

IMPORT COMPLETED
Created:  290
Updated:  0
Total:    290
```

### 4. Import Wards/Divisions (`import_divisions`)

```bash
python manage.py import_divisions [--clear] [--skip-boundaries]
```

**What it does:**
- Creates ~1,450 wards/divisions
- Assigns each to parent sub-county via NAME_2
- Generates codes from GID_3 (e.g., `KEN.1.1.1_1`)

**Expected output:**
```
Using GeoJSON file: /path/to/adm3.geojson
Loaded 290 sub-counties as parents
Found 1450 features to import

Created: Lembus (KEN.1.1.1_1) under BaringoCentral
Created: Ravine (KEN.1.1.2_1) under BaringoCentral
Progress: 100/1450...
Progress: 200/1450...
...

IMPORT COMPLETED
Created:  1450
Updated:  0
Total:    1450
```

---

## Verification

### Check Import Status

```bash
python manage.py shell
```

```python
from ngao_core.apps.geography.models import Area

# Count by type
print("Country:", Area.objects.filter(area_type='country').count())      # Should be 1
print("Counties:", Area.objects.filter(area_type='county').count())      # Should be 47
print("Sub-Counties:", Area.objects.filter(area_type='sub_county').count())  # ~290
print("Wards:", Area.objects.filter(area_type='location').count())       # ~1450

# View hierarchy
kenya = Area.objects.get(area_type='country')
print(f"\n{kenya.name} has {kenya.children.count()} counties")

baringo = Area.objects.filter(area_type='county', name='Baringo').first()
print(f"{baringo.name} has {baringo.children.count()} sub-counties")

# Check boundaries
with_boundaries = Area.objects.exclude(boundary__isnull=True).count()
print(f"\nAreas with boundaries: {with_boundaries}")
```

### Sample Queries

```python
# Get all counties
counties = Area.objects.filter(area_type='county').order_by('name')

# Get sub-counties for a specific county
baringo = Area.objects.get(code='KEN.1_1')
subcounties = baringo.children.all()

# Get full hierarchy for a ward
ward = Area.objects.get(code='KEN.1.1.1_1')
ancestors = []
current = ward
while current.parent:
    ancestors.append(current.parent)
    current = current.parent
print(" > ".join([a.name for a in reversed(ancestors)] + [ward.name]))
# Output: Kenya > Baringo > BaringoCentral > Lembus
```

---

## API Endpoints

### Available Endpoints

```
GET /api/areas/                    # List top-level areas (countries)
GET /api/areas/{id}/               # Retrieve specific area
GET /api/areas/{id}/children/      # Get direct children
GET /api/areas/{id}/descendants/   # Get all descendants
GET /api/areas/{id}/hierarchy/     # Get full hierarchy tree
GET /api/areas/geojson/            # GeoJSON format
```

### Example API Calls

```bash
# Get all counties
curl http://localhost:8000/api/areas/?area_type=county

# Get children of a county
curl http://localhost:8000/api/areas/{county_id}/children/

# Get GeoJSON for all counties
curl http://localhost:8000/api/areas/geojson/?area_type=county

# Get GeoJSON for Kenya with all nested children
curl http://localhost:8000/api/areas/geojson/?code=KEN&recursive=true

# Get GeoJSON without boundaries (lighter payload)
curl http://localhost:8000/api/areas/geojson/?area_type=county&include_boundaries=false
```

### Frontend Integration (Leaflet)

```javascript
// Fetch and display county boundaries
fetch('/api/areas/geojson/?area_type=county')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: '#3388ff',
        weight: 2,
        fillOpacity: 0.2
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`
          <strong>${feature.properties.name}</strong><br>
          Type: ${feature.properties.area_type_display}<br>
          Code: ${feature.properties.code}
        `);
      }
    }).addTo(map);
  });
```

---

## Troubleshooting

### Common Issues

#### 1. "No counties found. Import counties first."

**Cause:** Trying to import sub-counties before counties exist.

**Solution:** Import in order (country → counties → sub-counties → wards)

#### 2. "GeoJSON file not found"

**Cause:** GeoJSON files not in correct location.

**Solution:** 
```bash
# Check file location
ls ngao_core/apps/geography/*.geojson

# Files should be directly in the geography app folder
```

#### 3. "Parent county not found for sub-county"

**Cause:** Name mismatch between GADM data and database.

**Solution:** The import uses name normalization. Check:
```python
# In Django shell
from ngao_core.apps.geography.models import Area

# See what counties exist
counties = Area.objects.filter(area_type='county').values_list('name', flat=True)
print(list(counties))
```

#### 4. "Error processing geometry"

**Cause:** Invalid or complex geometry in GeoJSON.

**Solution:** Skip boundaries for testing:
```bash
python manage.py import_subcounties --skip-boundaries
```

#### 5. Database Locked Error

**Cause:** SQLite locks on large imports (if using SQLite).

**Solution:** Use PostgreSQL for production, or import with smaller batches.

### Clear All Data and Restart

```bash
# Warning: This deletes ALL geography data
python manage.py shell -c "
from ngao_core.apps.geography.models import Area
Area.objects.all().delete()
print('All areas deleted')
"

# Re-import
python manage.py import_country
python manage.py import_counties
python manage.py import_subcounties
python manage.py import_divisions
```

### Debug Mode

Add verbose output to commands:

```python
# In your command handle() method
import logging
logging.basicConfig(level=logging.DEBUG)
```

---

## Performance Tips

### 1. Skip Boundaries for Testing

```bash
# Much faster imports without geometry processing
python manage.py import_divisions --skip-boundaries
```

### 2. Use PostgreSQL

PostGIS + PostgreSQL is much faster than SQLite for geographic data.

### 3. Import During Off-Hours

Large imports (especially level 3) can take 5-15 minutes with boundaries.

### 4. Database Indexing

Ensure indexes are created:

```python
# In migrations or shell
from django.db import connection
cursor = connection.cursor()
cursor.execute("CREATE INDEX IF NOT EXISTS idx_area_type ON geography_area(area_type);")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_area_parent ON geography_area(parent_id);")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_area_code ON geography_area(code);")
```

---

## Expected Import Times

With boundaries (on modern hardware):

| Level | Count | Time      |
|-------|-------|-----------|
| 0     | 1     | < 1 sec   |
| 1     | 47    | 5-10 sec  |
| 2     | 290   | 30-60 sec |
| 3     | 1450  | 5-15 min  |

Without boundaries:

| Level | Count | Time      |
|-------|-------|-----------|
| 0     | 1     | < 1 sec   |
| 1     | 47    | 2-5 sec   |
| 2     | 290   | 10-20 sec |
| 3     | 1450  | 1-3 min   |

---

## Data Sources

- **GADM**: Global Administrative Areas - https://gadm.org/
- **Version**: GADM 4.1
- **Country**: Kenya (KEN)
- **License**: Free for academic and non-commercial use

---

## Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review command output for specific error messages
3. Verify import order (country → county → sub-county → ward)
4. Check that GeoJSON files are in correct location

---

## License

This import system is part of the NGAO project.
GADM data is subject to GADM's license terms.