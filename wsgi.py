import sys
import os

sys.path.insert(0, os.path.abspath('src'))

# Import Flask app
from backend.app import app

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 4000))
    app.run(host='0.0.0.0', port=port)