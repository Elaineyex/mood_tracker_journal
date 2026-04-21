# Mood Tracker & Period Journal

A local-first journaling application that tracks your mood, activities, and integrates menstrual cycle data for health insights.


## Features

- **Daily Journaling:** Track mood, activities, and gratitude.
- **Visual Insights:** Charts for mood trends and distribution.
- **Health Integration:** Period tracking with prediction logic (based on Clue methodology).
- **Historical Support:** Add and edit entries for past dates.
- **Privacy Focused:** Local storage using SQLite and Markdown files.

## Run Locally

**Prerequisites:** Node.js, Python 3 (with `pandas` and `numpy`)

1. **Install dependencies:**
   ```bash
   npm install
   pip install pandas numpy
   ```
2. **Set up the database:**
   The database will be automatically initialized when you run the ingestion script or the server.
3. **Run the app:**
   ```bash
   npm run dev
   ```

## Period Data Integration

To import historical data from Clue:

1. Place your Clue export folder (e.g., `ClueDataDownload-YYYY-MM-DD`) in the root directory.
2. Ensure the `measurements.json` path in `ingest_clue.py` matches your export.
3. Run the ingestion script:
   ```bash
   python3 ingest_clue.py
   ```

The script will:
- Clean and map Clue data to the local SQLite database.
- Calculate cycle length averages and standard deviations.
- Predict your next period and ovulation dates.
- Link period logs to your existing journal entries.
