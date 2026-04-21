import json
import sqlite3
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

DB_PATH = 'journal.db'
JSON_PATH = 'ClueDataDownload-2026-02-24/measurements.json'

def setup_database(cursor):
    """
    2. The SQL DDL for the new tracking tables.
    """
    ddl = """
    CREATE TABLE IF NOT EXISTS period_logs (
        log_id INTEGER PRIMARY KEY AUTOINCREMENT,
        entry_id INTEGER,
        date TEXT,
        flow_volume INTEGER,
        blood_color TEXT,
        pain_score INTEGER,
        is_start BOOLEAN,
        FOREIGN KEY(entry_id) REFERENCES journal_entries(id)
    );
    """
    cursor.execute(ddl)
    print("Executed DDL:")
    print(ddl)

def ingest_clue_data(conn):
    """
    1. A Python script to ingest a Clue CSV/JSON export and map its headers to a structured SQLite database.
    """
    with open(JSON_PATH, 'r') as f:
        data = json.load(f)
        
    # Process data to find periods
    flow_map = {'spotting': 1, 'light': 2, 'medium': 3, 'heavy': 4}
    
    # Group by date
    records_by_date = {}
    for d in data:
        date_str = d.get('date')
        if not date_str:
            continue
            
        t = d.get('type')
        if t not in ['period', 'spotting']:
            continue
            
        if date_str not in records_by_date:
            records_by_date[date_str] = {'date': date_str, 'flow_volume': None, 'blood_color': None, 'pain_score': None}
            
        val = d.get('value', {})
        option = val.get('option') if isinstance(val, dict) else str(val)
        
        if t == 'period':
            records_by_date[date_str]['flow_volume'] = flow_map.get(option, 3)
        elif t == 'spotting':
            if records_by_date[date_str]['flow_volume'] is None:
                records_by_date[date_str]['flow_volume'] = 1
            # Check for color in spotting, e.g., [{'option': 'red'}]
            if isinstance(val, list) and len(val) > 0:
                color_opt = val[0].get('option')
                if color_opt in ['red', 'brown']:
                    records_by_date[date_str]['blood_color'] = color_opt

    sorted_dates = sorted(records_by_date.keys())
    
    # Determine is_start
    # A day is a start if there was no period in the previous 2 days
    for i, date_str in enumerate(sorted_dates):
        current_date = datetime.strptime(date_str, '%Y-%m-%d')
        is_start = True
        if i > 0:
            prev_date_str = sorted_dates[i-1]
            prev_date = datetime.strptime(prev_date_str, '%Y-%m-%d')
            if (current_date - prev_date).days <= 2:
                is_start = False
        records_by_date[date_str]['is_start'] = is_start

    cursor = conn.cursor()
    for r in records_by_date.values():
        # Try to find a journal entry for this date to link to
        cursor.execute("SELECT id FROM journal_entries WHERE date LIKE ?", (f"{r['date']}%",))
        entry_row = cursor.fetchone()
        entry_id = entry_row[0] if entry_row else None

        cursor.execute('''
            INSERT INTO period_logs (entry_id, date, flow_volume, blood_color, pain_score, is_start)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (entry_id, r['date'], r['flow_volume'], r['blood_color'], r['pain_score'], r['is_start']))
    conn.commit()
    print(f"Ingested {len(records_by_date)} period log entries.")

def calculate_predictions(conn):
    """
    3. An algorithm for period prediction that accounts for cycle variability.
    """
    df = pd.read_sql_query("SELECT date FROM period_logs WHERE is_start = 1 ORDER BY date", conn)
    if df.empty or len(df) < 2:
        return None
        
    df['date'] = pd.to_datetime(df['date'])
    df['cycle_length'] = df['date'].diff().dt.days
    
    cycles = df.dropna().copy()
    
    # Clue methodology: averages on last 6 cycles, predictions on last 12 cycles
    recent_6_cycles = cycles.tail(6)
    avg_cycle_length_6 = recent_6_cycles['cycle_length'].mean()
    
    recent_12_cycles = cycles.tail(12)
    avg_cycle_length_12 = recent_12_cycles['cycle_length'].mean()
    std_cycle_length_12 = recent_12_cycles['cycle_length'].std()
    
    last_start_date = df['date'].iloc[-1]
    
    predicted_start_date = last_start_date + timedelta(days=avg_cycle_length_12)
    # Ovulation calculated by counting backwards 13 days from predicted next period
    predicted_ovulation_date = predicted_start_date - timedelta(days=13)
    
    return {
        'last_start_date': last_start_date.strftime('%Y-%m-%d'),
        'avg_cycle_length_6': avg_cycle_length_6,
        'avg_cycle_length_12': avg_cycle_length_12,
        'std_cycle_length_12': std_cycle_length_12,
        'predicted_start_date': predicted_start_date.strftime('%Y-%m-%d'),
        'predicted_ovulation_date': predicted_ovulation_date.strftime('%Y-%m-%d')
    }

def generate_health_summary(conn):
    """
    4. An interface takes the last 3 months of data and generates a natural language health summary for the journal's 'Insights' page.
    """
    # Use the last recorded date in the database as reference instead of datetime.now() to ensure we have data.
    cursor = conn.cursor()
    cursor.execute("SELECT MAX(date) FROM period_logs")
    last_date_row = cursor.fetchone()
    if not last_date_row or not last_date_row[0]:
        return "No data available."
        
    reference_date = datetime.strptime(last_date_row[0], '%Y-%m-%d')
    three_months_ago = reference_date - timedelta(days=90)
    
    query = f"""
        SELECT date, flow_volume, is_start 
        FROM period_logs 
        WHERE date >= '{three_months_ago.strftime('%Y-%m-%d')}'
        ORDER BY date
    """
    df = pd.read_sql_query(query, conn)
    
    predictions = calculate_predictions(conn)
    
    if df.empty or predictions is None:
        return "Not enough data in the last 3 months to generate a summary."
        
    df['date'] = pd.to_datetime(df['date'])
    
    df['group'] = (df['date'].diff().dt.days > 2).cumsum()
    period_lengths = df.groupby('group').size()
    avg_period_length = period_lengths.mean()
    
    avg_flow = df['flow_volume'].mean()
    flow_desc = "light"
    if avg_flow > 2.5: flow_desc = "medium"
    if avg_flow > 3.5: flow_desc = "heavy"
    
    std_desc = "0.0" if pd.isna(predictions['std_cycle_length_12']) else f"{predictions['std_cycle_length_12']:.1f}"
    
    summary = (
        f"Health Summary (Last 3 Months):\n"
        f"- You had {len(period_lengths)} periods logged in the last quarter.\n"
        f"- Your average period length was {avg_period_length:.1f} days.\n"
        f"- Your average cycle length over the last 6 cycles is {predictions['avg_cycle_length_6']:.1f} days.\n"
        f"- Your flow volume averaged as '{flow_desc}'.\n"
        f"- Based on your last 12 cycles (accounting for variability with a standard deviation of {std_desc} days), "
        f"your next period is predicted to start on {predictions['predicted_start_date']}.\n"
        f"- Your estimated ovulation date is {predictions['predicted_ovulation_date']}."
    )
    
    return summary

def get_insights_data(conn):
    """
    Returns a dictionary with prediction and summary data.
    """
    preds = calculate_predictions(conn)
    summary = generate_health_summary(conn)
    return {
        'predictions': preds,
        'summary': summary
    }

def main():
    import sys
    conn = sqlite3.connect(DB_PATH)
    
    if len(sys.argv) > 1 and sys.argv[1] == '--json':
        print(json.dumps(get_insights_data(conn)))
        return

    print("--- 1 & 2. Database Schema & Ingestion ---")
    setup_database(conn.cursor())
    
    # Clear existing data for idempotency
    conn.cursor().execute("DELETE FROM period_logs")
    
    ingest_clue_data(conn)
    
    print("\n--- 3. Period Prediction Algorithm ---")
    preds = calculate_predictions(conn)
    if preds:
        print(f"Algorithm applied using Mean Cycle Length (last 12 cycles): {preds['avg_cycle_length_12']:.1f} days")
        print(f"Predicted Next Start Date: {preds['predicted_start_date']}")
    
    print("\n--- 4. Natural Language Health Summary ---")
    summary = generate_health_summary(conn)
    print(summary)
    print("\nNote: No PII is included in the calculations or output.")

if __name__ == '__main__':
    main()
