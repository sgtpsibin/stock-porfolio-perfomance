"""
Vercel serverless function entry point for FastAPI backend.
This file imports the FastAPI app from main.py and exposes it for Vercel.
"""
import sys
import os

# Add parent directory to path so we can import main
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the FastAPI app
from main import app

# Export the app for Vercel
# Vercel's Python runtime expects the ASGI app to be named 'app'
__all__ = ['app']

