## LeetCode Tracker (local)

519 LeetCode problems list in ascending ELO format served with a tiny Python HTTP server.
Built to feel like you’re leveling up as you solve LeetCode problems.

## Prerequisites

- Python 3.8+ installed

## Installation

1. Download or clone this folder to your machine. Keep `index.html`, `data (1).json`, and `server.py` in the same directory.
2. Optional: create and activate a virtual environment if you prefer, though only the Python standard library is used.

## Run locally

1. Open a terminal in the project folder.
2. Start the server:
   - `python3 server.py`
3. Your browser should open `http://localhost:8001`. If it does not, open that URL manually.
4. Stop with `Ctrl+C`.

## Troubleshooting

- Port already in use: pick a different `PORT` in `server.py`.
- Nothing loads: ensure you ran the command from the project folder so the server can find `index.html` and `data (1).json`.
