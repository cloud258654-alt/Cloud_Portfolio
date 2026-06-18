"""Streamlit Cloud entry point for SVM Kernel Trick 3D Demo."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Run the actual app
with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "phase3_streamlit_app.py"), encoding="utf-8") as f:
    exec(f.read())
