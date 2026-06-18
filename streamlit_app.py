"""Root-level deployment entry point for Streamlit Cloud.
This file lives at the repo root so Streamlit Cloud can find
the requirements.txt without dealing with spaces in subdirectory names.
"""
import sys, os

# Add the project subdirectory to the import path
PROJECT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "projects", "Day-006 SVM kernel")
sys.path.insert(0, PROJECT_DIR)

# Run the actual Streamlit app
with open(os.path.join(PROJECT_DIR, "phase3_streamlit_app.py"), encoding="utf-8") as f:
    exec(f.read())
