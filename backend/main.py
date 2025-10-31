import os
import sys

# Fix for Vercel serverless: vnstock tries to create cache in home directory
# Vercel only allows writes to /tmp directory
if os.environ.get('VERCEL'):
    os.environ['HOME'] = '/tmp'
    os.environ['VNSTOCK_CACHE_DIR'] = '/tmp/.vnstock'
    # Create cache directory if it doesn't exist
    os.makedirs('/tmp/.vnstock', exist_ok=True)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import pandas as pd
from vnstock import Vnstock
import json

app = FastAPI(title="Stock Portfolio Performance API")

# Configure CORS
# Allow both local development and production domains
allowed_origins = [
    "http://localhost:3000",  # Local development
    "https://*.vercel.app",   # Vercel preview deployments
]

# Add production domain from environment variable if set
production_domain = os.getenv("FRONTEND_URL")
if production_domain:
    allowed_origins.append(production_domain)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now - restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize vnstock
stock = Vnstock().stock(symbol='VNI', source='VCI')

# Portfolio storage file
# Use /tmp directory on Vercel (only writable location in serverless)
PORTFOLIO_FILE = "/tmp/default_portfolio.json" if os.environ.get('VERCEL') else "default_portfolio.json"

# Default portfolio configuration
DEFAULT_PORTFOLIO = {
    "stocks": [
        {"symbol": "VNM", "percentage": 30},
        {"symbol": "VIC", "percentage": 30},
        {"symbol": "HPG", "percentage": 40}
    ]
}

def load_default_portfolio():
    """Load default portfolio from file or return default"""
    if os.path.exists(PORTFOLIO_FILE):
        try:
            with open(PORTFOLIO_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading portfolio: {e}")
            return DEFAULT_PORTFOLIO
    return DEFAULT_PORTFOLIO

def save_default_portfolio(portfolio_data):
    """Save default portfolio to file"""
    try:
        with open(PORTFOLIO_FILE, 'w') as f:
            json.dump(portfolio_data, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving portfolio: {e}")
        return False

class StockSymbol(BaseModel):
    symbol: str
    percentage: float  # Percentage of NAV (0-100)

class Portfolio(BaseModel):
    stocks: List[StockSymbol]
    total_nav: Optional[float] = 100000000  # Default 100M VND for calculation

class PerformanceData(BaseModel):
    date: str
    portfolio_value: float
    vnindex_value: float
    portfolio_return: float
    vnindex_return: float

@app.get("/")
def read_root():
    return {"message": "Stock Portfolio Performance API", "status": "running"}

@app.get("/api/vnindex")
def get_vnindex(days: int = 30):
    """Get VNIndex historical data"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Get VNIndex data
        vnindex = Vnstock().stock(symbol='VNINDEX', source='VCI')
        df = vnindex.quote.history(
            start=start_date.strftime('%Y-%m-%d'),
            end=end_date.strftime('%Y-%m-%d')
        )
        
        if df is None or df.empty:
            raise HTTPException(status_code=404, detail="No data found for VNIndex")
        
        # Convert to list of dicts
        data = df.reset_index().to_dict('records')
        
        return {
            "symbol": "VNINDEX",
            "data": data,
            "count": len(data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching VNIndex data: {str(e)}")

@app.get("/api/stock/{symbol}")
def get_stock_data(symbol: str, days: int = 30):
    """Get historical data for a specific stock"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Get stock data
        stock_obj = Vnstock().stock(symbol=symbol.upper(), source='VCI')
        df = stock_obj.quote.history(
            start=start_date.strftime('%Y-%m-%d'),
            end=end_date.strftime('%Y-%m-%d')
        )
        
        if df is None or df.empty:
            raise HTTPException(status_code=404, detail=f"No data found for {symbol}")
        
        # Convert to list of dicts
        data = df.reset_index().to_dict('records')
        
        return {
            "symbol": symbol.upper(),
            "data": data,
            "count": len(data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stock data: {str(e)}")

@app.post("/api/portfolio/performance")
def calculate_portfolio_performance(portfolio: Portfolio, days: int = 30):
    """Calculate portfolio performance vs VNIndex"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Get VNIndex data
        vnindex = Vnstock().stock(symbol='VNINDEX', source='VCI')
        vnindex_df = vnindex.quote.history(
            start=start_date.strftime('%Y-%m-%d'),
            end=end_date.strftime('%Y-%m-%d')
        )

        if vnindex_df is None or vnindex_df.empty:
            raise HTTPException(status_code=404, detail="No VNIndex data found")

        # Ensure the index is datetime - vnstock might return data with 'time' column
        if 'time' in vnindex_df.columns:
            vnindex_df['time'] = pd.to_datetime(vnindex_df['time'])
            vnindex_df.set_index('time', inplace=True)
        elif vnindex_df.index.dtype != 'datetime64[ns]':
            # If index is not datetime, try to convert it
            vnindex_df.index = pd.to_datetime(vnindex_df.index)
        
        # Initialize portfolio dataframe to track weighted returns
        portfolio_returns = pd.DataFrame()
        stock_weights = {}

        # Validate percentages sum to 100 or less
        total_percentage = sum(stock.percentage for stock in portfolio.stocks)
        if total_percentage > 100:
            raise HTTPException(status_code=400, detail=f"Total percentage ({total_percentage}%) exceeds 100%")

        # Get data for each stock in portfolio
        for stock_item in portfolio.stocks:
            stock_obj = Vnstock().stock(symbol=stock_item.symbol.upper(), source='VCI')
            stock_df = stock_obj.quote.history(
                start=start_date.strftime('%Y-%m-%d'),
                end=end_date.strftime('%Y-%m-%d')
            )

            if stock_df is not None and not stock_df.empty:
                # Ensure the index is datetime
                if 'time' in stock_df.columns:
                    stock_df['time'] = pd.to_datetime(stock_df['time'])
                    stock_df.set_index('time', inplace=True)
                elif stock_df.index.dtype != 'datetime64[ns]':
                    stock_df.index = pd.to_datetime(stock_df.index)

                # Store the price data for this stock
                stock_df[stock_item.symbol] = stock_df['close']
                stock_weights[stock_item.symbol] = stock_item.percentage / 100.0

                if portfolio_returns.empty:
                    portfolio_returns = stock_df[[stock_item.symbol]].copy()
                else:
                    portfolio_returns = portfolio_returns.join(stock_df[[stock_item.symbol]], how='outer')

        if portfolio_returns.empty:
            raise HTTPException(status_code=404, detail="No portfolio data found")

        # Forward fill missing values (for stocks that don't trade every day)
        portfolio_returns = portfolio_returns.ffill()

        # Calculate weighted portfolio value over time
        # Start with initial NAV and track the weighted performance
        initial_prices = portfolio_returns.iloc[0]

        # Calculate the return for each stock from its initial price
        weighted_returns = pd.DataFrame()
        for symbol in portfolio_returns.columns:
            stock_return = (portfolio_returns[symbol] / initial_prices[symbol] - 1)
            weighted_returns[symbol] = stock_return * stock_weights[symbol]

        # Sum weighted returns to get total portfolio return
        portfolio_total_return = weighted_returns.sum(axis=1)

        # Merge with VNIndex - ensure we keep the datetime index
        result_df = pd.DataFrame(index=portfolio_returns.index)
        result_df['portfolio_return'] = portfolio_total_return * 100  # Convert to percentage

        # Join with VNIndex data
        result_df = result_df.join(vnindex_df[['close']], how='inner')
        result_df.rename(columns={'close': 'vnindex_value'}, inplace=True)

        # Calculate VNIndex returns (percentage change from first day)
        initial_vnindex = result_df['vnindex_value'].iloc[0]
        result_df['vnindex_return'] = ((result_df['vnindex_value'] - initial_vnindex) / initial_vnindex) * 100

        # Add portfolio value for display (starting from total_nav)
        result_df['portfolio_value'] = portfolio.total_nav * (1 + result_df['portfolio_return'] / 100)

        # Reset index to get the date column, then rename it
        result_df = result_df.reset_index()

        # Find the date column (it might be named 'time', 'date', 'index', or the first column)
        date_col = None
        for col in result_df.columns:
            if col in ['time', 'date', 'index'] or result_df[col].dtype == 'object' or 'datetime' in str(result_df[col].dtype):
                date_col = col
                break

        # If we found a date column, rename it to 'time', otherwise use the first column
        if date_col and date_col != 'time':
            result_df.rename(columns={date_col: 'time'}, inplace=True)
        elif not date_col:
            # Use the first column as time
            first_col = result_df.columns[0]
            result_df.rename(columns={first_col: 'time'}, inplace=True)

        # Ensure time is string format
        result_df['time'] = result_df['time'].astype(str)

        # Reorder columns
        result_df = result_df[['time', 'portfolio_value', 'vnindex_value', 'portfolio_return', 'vnindex_return']]

        # Sample data points based on period length to reduce chart clutter
        # For longer periods, we don't need every single day
        total_points = len(result_df)
        if days <= 7:
            # 7 days or less: show all points
            sampled_df = result_df.copy()
        elif days <= 30:
            # 1 month: show every 2nd point (max ~15 points)
            sampled_df = result_df.iloc[::2].copy()
        elif days <= 90:
            # 3 months: show every 4th point (max ~22 points)
            sampled_df = result_df.iloc[::4].copy()
        elif days <= 180:
            # 6 months: show every 7th point (max ~25 points)
            sampled_df = result_df.iloc[::7].copy()
        else:
            # 1 year: show every 14th point (max ~26 points)
            sampled_df = result_df.iloc[::14].copy()

        # Always include the last data point if not already included
        last_time = result_df.iloc[-1]['time']
        if last_time not in sampled_df['time'].values:
            sampled_df = pd.concat([sampled_df, result_df.iloc[[-1]]], ignore_index=False)
            # Remove any duplicate indices and keep the last occurrence
            sampled_df = sampled_df[~sampled_df.index.duplicated(keep='last')]

        data = sampled_df.to_dict('records')
        
        # Calculate summary statistics
        final_portfolio_return = result_df['portfolio_return'].iloc[-1]
        final_vnindex_return = result_df['vnindex_return'].iloc[-1]
        outperformance = final_portfolio_return - final_vnindex_return
        
        return {
            "data": data,
            "summary": {
                "portfolio_return": round(final_portfolio_return, 2),
                "vnindex_return": round(final_vnindex_return, 2),
                "outperformance": round(outperformance, 2),
                "initial_value": round(portfolio.total_nav, 2),
                "final_value": round(result_df['portfolio_value'].iloc[-1], 2)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating portfolio performance: {str(e)}")

@app.get("/api/stock/{symbol}/info")
def get_stock_info(symbol: str):
    """Get basic information about a stock"""
    try:
        stock_obj = Vnstock().stock(symbol=symbol.upper(), source='VCI')

        # Get latest quote
        df = stock_obj.quote.history(
            start=(datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d'),
            end=datetime.now().strftime('%Y-%m-%d')
        )

        if df is None or df.empty:
            raise HTTPException(status_code=404, detail=f"No data found for {symbol}")

        latest = df.iloc[-1]

        return {
            "symbol": symbol.upper(),
            "current_price": float(latest['close']),
            "open": float(latest['open']),
            "high": float(latest['high']),
            "low": float(latest['low']),
            "volume": int(latest['volume']),
            "date": str(df.index[-1])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stock info: {str(e)}")

@app.get("/api/portfolio/default")
def get_default_portfolio():
    """Get the default portfolio configuration"""
    try:
        portfolio_data = load_default_portfolio()
        return portfolio_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading default portfolio: {str(e)}")

@app.post("/api/portfolio/default")
def set_default_portfolio(portfolio: Portfolio):
    """Set the default portfolio configuration"""
    try:
        # Validate total percentage
        total_percentage = sum(stock.percentage for stock in portfolio.stocks)
        if total_percentage > 100:
            raise HTTPException(status_code=400, detail=f"Total percentage ({total_percentage}%) exceeds 100%")

        # Convert to dict for storage
        portfolio_data = {
            "stocks": [{"symbol": stock.symbol, "percentage": stock.percentage} for stock in portfolio.stocks]
        }

        # Save to file
        if save_default_portfolio(portfolio_data):
            return {"message": "Default portfolio saved successfully", "portfolio": portfolio_data}
        else:
            raise HTTPException(status_code=500, detail="Failed to save portfolio")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving default portfolio: {str(e)}")

# Vercel serverless handler
handler = app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

