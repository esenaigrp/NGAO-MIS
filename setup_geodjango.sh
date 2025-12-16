#!/bin/bash

# 1️⃣ Deactivate Conda base if active
if [[ "$CONDA_PREFIX" != "" ]]; then
    echo "Deactivating Conda base..."
    conda deactivate
fi

# 2️⃣ Activate your virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# 3️⃣ Export GDAL, GEOS, PROJ library paths
export GDAL_LIBRARY_PATH=$(brew --prefix gdal)/lib/libgdal.dylib
export GEOS_LIBRARY_PATH=$(brew --prefix geos)/lib/libgeos_c.dylib
export PROJ_LIBRARY_PATH=$(brew --prefix proj)/lib/libproj.dylib

echo "GDAL_LIBRARY_PATH=$GDAL_LIBRARY_PATH"
echo "GEOS_LIBRARY_PATH=$GEOS_LIBRARY_PATH"
echo "PROJ_LIBRARY_PATH=$PROJ_LIBRARY_PATH"

# 4️⃣ Verify Django installation
echo "Checking Django version..."
python -c "import django; print('Django version:', django.get_version())"

# 5️⃣ Verify GeoDjango can load GDAL/GEOS
echo "Testing GeoDjango..."
python -c "from django.contrib.gis import gdal, geos; print('GDAL & GEOS OK')"

echo "✅ Setup complete. You are ready to run GeoDjango."
