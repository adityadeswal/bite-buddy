## Setup

```
python3 -m venv path/to/venv
source path/to/venv/bin/activate
python3 -m pip install -r requirements.txt
```

## Running the app

**Option 1 — uvicorn directly:**
```
uvicorn main:app --reload
```

**Option 2 — Python entrypoint:**
```
python main.py
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.
