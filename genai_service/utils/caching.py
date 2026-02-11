import sqlite3
import json
import logging
import hashlib
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)
DB_FILE = "search_cache.db"
CACHE_EXPIRY_HOURS = 24  

def init_db():
    """Creates the cache table if it doesn't exist."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS searches (
            id TEXT PRIMARY KEY,
            keywords TEXT,
            country TEXT,
            page INTEGER,
            results JSON,
            timestamp DATETIME
        )
    ''')
    conn.commit()
    conn.close()

def generate_cache_key(keywords: str, country: str, page: int) -> str:
    """Creates a unique ID for this specific search combination."""
    k = keywords.lower().strip() if keywords else ""
    c = country.lower().strip() if country else ""
    p = str(page)
    
    raw_string = f"{k}|{c}|{p}"
    return hashlib.sha256(raw_string.encode()).hexdigest()

def get_cached_results(keywords: str, country: str, page: int):
    """
    Checks DB for saved results. 
    Returns: List of profiles OR None if cache is empty/expired.
    """
    key = generate_cache_key(keywords, country, page)
    
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT results, timestamp FROM searches WHERE id = ?", (key,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        results_json, timestamp_str = row
        saved_time = datetime.fromisoformat(timestamp_str)
        
        if datetime.now() - saved_time < timedelta(hours=CACHE_EXPIRY_HOURS):
            logger.info("✓ CACHE HIT: Serving saved results from DB.")
            return json.loads(results_json)
        else:
            logger.info(" CACHE EXPIRED: Found data but it's too old.")
            return None
            
    logger.info("✗ CACHE MISS: No saved data found.")
    return None

def save_to_cache(keywords: str, country: str, page: int, profiles: list):
    """Saves new Apify results to the DB."""
    key = generate_cache_key(keywords, country, page)
    
    data_to_save = []
    for p in profiles:
        if hasattr(p, "dict"):
            data_to_save.append(p.dict()) 
        else:
            data_to_save.append(p)

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT OR REPLACE INTO searches (id, keywords, country, page, results, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (key, keywords, country, page, json.dumps(data_to_save), datetime.now().isoformat()))
        conn.commit()
        logger.info(" CACHE SAVED: Results stored in DB.")
    except Exception as e:
        logger.error(f"Failed to save cache: {e}")
    finally:
        conn.close()

init_db()