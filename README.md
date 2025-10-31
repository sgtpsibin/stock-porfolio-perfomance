# 📈 Stock Portfolio Performance Tracker

A full-stack web application to track and compare your Vietnamese stock portfolio performance against the VNIndex market index.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-16.0-black.svg)

## 🌟 Features

- **Portfolio Analysis**: Track multiple stocks and calculate total portfolio performance
- **Market Comparison**: Compare your portfolio returns against VNIndex
- **Historical Data**: Analyze performance over various time periods (7 days to 1 year)
- **Visual Charts**: Interactive charts showing portfolio vs market performance
- **Real-time Data**: Fetch latest stock prices from Vietnamese stock exchanges
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

```
spp/
├── backend/          # FastAPI Python backend
│   ├── main.py      # API endpoints
│   ├── requirements.txt
│   └── README.md
│
└── frontend/         # Next.js React frontend
    ├── app/
    │   ├── components/
    │   └── page.tsx
    ├── package.json
    └── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the backend server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be running at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will be running at `http://localhost:3000`

## 📖 Usage

1. **Open the application** in your browser at `http://localhost:3000`

2. **Enter your portfolio**:
   - Add stock symbols (e.g., VNM, VIC, HPG)
   - Enter the quantity of shares you own
   - Select the time period for analysis

3. **Analyze performance**:
   - Click "Analyze Performance"
   - View your portfolio's return percentage
   - Compare with VNIndex performance
   - See if you outperformed or underperformed the market

4. **Interpret results**:
   - 🟢 Green values = Positive returns
   - 🔴 Red values = Negative returns
   - Outperformance = Your portfolio beat the market!

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **vnstock** - Vietnamese stock market data library
- **pandas** - Data manipulation and analysis
- **uvicorn** - ASGI server

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS v4** - Utility-first CSS framework
- **React 19** - Latest React features

## 📊 API Endpoints

### `GET /`
Health check

### `GET /api/vnindex?days=30`
Get VNIndex historical data

### `GET /api/stock/{symbol}?days=30`
Get stock historical data

### `POST /api/portfolio/performance?days=30`
Calculate portfolio performance vs VNIndex

### `GET /api/stock/{symbol}/info`
Get current stock information

See [backend/README.md](backend/README.md) for detailed API documentation.

## 🎨 Screenshots

### Main Dashboard
The main interface where you enter your portfolio and view results.

### Performance Chart
Visual comparison of your portfolio vs VNIndex over time.

### Summary Statistics
Key metrics showing returns and outperformance.

## 🔧 Configuration

### Backend CORS
Edit `backend/main.py` to add allowed origins:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    ...
)
```

### Frontend API URL
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📈 Popular Vietnamese Stocks

The app includes quick-add buttons for popular stocks:

- **VNM** - Vinamilk (Dairy products)
- **VIC** - Vingroup (Conglomerate)
- **VHM** - Vinhomes (Real estate)
- **HPG** - Hoa Phat Group (Steel)
- **TCB** - Techcombank (Banking)
- **VCB** - Vietcombank (Banking)
- **FPT** - FPT Corporation (Technology)
- **MSN** - Masan Group (Consumer goods)

## 🐛 Troubleshooting

### Backend won't start
- Ensure Python 3.9+ is installed
- Check if port 8000 is available
- Verify all dependencies are installed

### Frontend won't connect to backend
- Ensure backend is running on port 8000
- Check CORS settings in backend
- Verify API URL in frontend

### Stock data not loading
- Check if stock symbol is correct
- Verify vnstock library is working
- Check backend logs for errors

## 🚀 Deployment

### Backend
Deploy to:
- Heroku
- Railway
- DigitalOcean
- AWS EC2

### Frontend
Deploy to:
- Vercel (recommended)
- Netlify
- AWS Amplify

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [vnstock](https://github.com/thinh-vu/vnstock) - Vietnamese stock market data library
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Next.js](https://nextjs.org/) - React framework
- Vietnamese stock exchanges for providing market data

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Note**: This application is for educational and informational purposes only. It is not financial advice. Always do your own research before making investment decisions.

