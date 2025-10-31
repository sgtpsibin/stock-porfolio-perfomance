export interface Stock {
  symbol: string;
  percentage: number;
}

export interface Portfolio {
  stocks: Stock[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const portfolioStorage = {
  get: async (): Promise<Portfolio | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/portfolio/default`);
      if (!response.ok) {
        throw new Error("Failed to fetch default portfolio");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error reading portfolio from backend:", error);
      return null;
    }
  },

  set: async (portfolio: Portfolio): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/portfolio/default`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(portfolio),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to save portfolio");
      }

      return true;
    } catch (error) {
      console.error("Error saving portfolio to backend:", error);
      throw error;
    }
  },

  getDefaultPortfolio: (): Portfolio => {
    return {
      stocks: [
        { symbol: "VNM", percentage: 30 },
        { symbol: "VIC", percentage: 30 },
        { symbol: "HPG", percentage: 40 },
      ],
    };
  },
};
