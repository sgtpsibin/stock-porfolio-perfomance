# Stock Portfolio Performance - Backend API

FastAPI backend for analyzing Vietnamese stock portfolio performance against VNIndex.

## Features

- 📊 Fetch historical data for Vietnamese stocks using `vnstock` library
- 📈 Get VNIndex historical data
- 💼 Calculate portfolio performance vs VNIndex
- 🔄 RESTful API with automatic documentation
- ⚡ Fast and async with FastAPI

## Tech Stack

- **FastAPI** - Modern web framework for building APIs
- **vnstock** - Vietnamese stock market data library
- **pandas** - Data manipulation and analysis
- **uvicorn** - ASGI server

## Installation

1. Create and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

```bash
# Development mode with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or using Python directly
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### `GET /`
Health check endpoint

**Response:**
```json
{
  "message": "Stock Portfolio Performance API",
  "status": "running"
}
```

### `GET /api/vnindex?days=30`
Get VNIndex historical data

**Parameters:**
- `days` (optional): Number of days of historical data (default: 30)

**Response:**
```json
{
  "symbol": "VNINDEX",
  "data": [...],
  "count": 30
}
```

### `GET /api/stock/{symbol}?days=30`
Get historical data for a specific stock

**Parameters:**
- `symbol`: Stock symbol (e.g., VNM, VIC, HPG)
- `days` (optional): Number of days of historical data (default: 30)

**Response:**
```json
{
  "symbol": "VNM",
  "data": [...],
  "count": 30
}
```

### `POST /api/portfolio/performance?days=30`
Calculate portfolio performance vs VNIndex

**Parameters:**
- `days` (optional): Number of days to analyze (default: 30)

**Request Body:**
```json
{
  "stocks": [
    {
      "symbol": "VNM",
      "quantity": 100
    },
    {
      "symbol": "VIC",
      "quantity": 50
    }
  ]
}
```

**Response:**
```json
{
  "data": [
    {
      "time": "2024-01-01",
      "portfolio_value": 1000000,
      "vnindex_value": 1200,
      "portfolio_return": 5.5,
      "vnindex_return": 3.2
    }
  ],
  "summary": {
    "portfolio_return": 5.5,
    "vnindex_return": 3.2,
    "outperformance": 2.3,
    "initial_value": 950000,
    "final_value": 1000000
  }
}
```

### `GET /api/stock/{symbol}/info`
Get basic information about a stock

**Parameters:**
- `symbol`: Stock symbol (e.g., VNM, VIC, HPG)

**Response:**
```json
{
  "symbol": "VNM",
  "current_price": 85000,
  "open": 84500,
  "high": 85500,
  "low": 84000,
  "volume": 1500000,
  "date": "2024-01-01"
}
```

## Popular Vietnamese Stock Symbols

- **VNM** - Vinamilk
- **VIC** - Vingroup
- **VHM** - Vinhomes
- **HPG** - Hoa Phat Group
- **TCB** - Techcombank
- **VCB** - Vietcombank
- **FPT** - FPT Corporation
- **MSN** - Masan Group
- **VRE** - Vincom Retail
- **GAS** - PetroVietnam Gas

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000` (Next.js frontend)

To add more origins, edit the `allow_origins` list in `main.py`.

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `404` - Resource not found
- `500` - Internal server error

Error responses include a `detail` field with error information.

## Development

The API uses:
- **VCI** as the data source for vnstock
- Automatic data fetching and caching
- Real-time stock data (with market delays)

## Notes

- Stock data is fetched from Vietnamese stock exchanges
- Historical data availability depends on the vnstock library
- Some stocks may have limited historical data
- Market data may have a 15-minute delay

