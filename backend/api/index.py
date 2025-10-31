"""
Vercel serverless function entry point for FastAPI backend.
This file imports the FastAPI app from main.py and exposes it for Vercel.
"""
import sys
import os

# Add parent directory to path so we can import main
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

# Vercel expects a variable named 'app' or 'handler'
# FastAPI app can be used directly as ASGI application
handler = app

