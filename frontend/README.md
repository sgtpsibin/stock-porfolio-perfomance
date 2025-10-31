# Stock Portfolio Performance - Frontend

Next.js frontend for visualizing Vietnamese stock portfolio performance against VNIndex.

## Features

- 📊 Interactive portfolio input form
- 📈 Real-time performance comparison with VNIndex
- 💹 Visual charts showing portfolio vs market performance
- 📱 Responsive design with Tailwind CSS
- ⚡ Fast and modern with Next.js 16 and Turbopack

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS framework
- **Biome** - Fast linter and formatter
- **React 19** - Latest React features

## Installation

1. Install dependencies:

```bash
npm install
```

## Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome

## Project Structure

```
frontend/
├── app/
│   ├── components/
│   │   ├── PortfolioForm.tsx      # Portfolio input form
│   │   ├── PerformanceChart.tsx   # Performance visualization
│   │   └── PerformanceSummary.tsx # Summary statistics
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Home page
├── public/                         # Static assets
├── package.json
└── tsconfig.json
```

## Components

### PortfolioForm

Input form for entering stock holdings:

- Add/remove stocks dynamically
- Select time period (7 days to 1 year)
- Quick-add popular Vietnamese stocks
- Form validation

### PerformanceSummary

Display key performance metrics:

- Portfolio return percentage
- VNIndex return percentage
- Outperformance/underperformance
- Initial and final portfolio values
- Visual indicators (green for gains, red for losses)

### PerformanceChart

Interactive chart showing:

- Portfolio performance over time
- VNIndex performance comparison
- SVG-based line chart
- Data table with recent performance
- Color-coded returns

## Usage

1. **Enter Your Portfolio**

   - Add stock symbols (e.g., VNM, VIC, HPG)
   - Enter quantity for each stock
   - Select time period for analysis

2. **Analyze Performance**

   - Click "Analyze Performance" button
   - View performance summary
   - Compare with VNIndex

3. **Interpret Results**
   - Green values indicate gains
   - Red values indicate losses
   - Outperformance shows how much better/worse your portfolio performed vs market

## Popular Vietnamese Stocks

The app includes quick-add buttons for:

- **VNM** - Vinamilk
- **VIC** - Vingroup
- **VHM** - Vinhomes
- **HPG** - Hoa Phat Group
- **TCB** - Techcombank
- **VCB** - Vietcombank

## API Integration

The frontend connects to the backend API at `http://localhost:8000`

## Styling

The app uses Tailwind CSS with a custom color scheme:

- Primary: Indigo (portfolio data)
- Secondary: Purple (VNIndex data)
- Background: Blue gradient
- Success: Green
- Error: Red

## Deployment

Deploy on [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) - the easiest way to deploy Next.js apps.
