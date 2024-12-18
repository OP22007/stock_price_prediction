"use client";

import { useState,useEffect } from "react";
import axios from "axios";
import yahooFinance from "yahoo-finance2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "../components/Navbar";
import { useSidebar } from "@/components/ui/sidebar";
import { Select,SelectContent,SelectGroup,SelectItem,SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import data from '../data/tickers.json';
import { TabsDemo } from "../components/TabsFuture";
import { Progress } from "@/components/ui/progress"; // Import Progress bar component

export default function Home() {
    const [ticker, setTicker] = useState<string>("AAPL");
    const [predictions, setPredictions] = useState<number[]>([]);
    console.log(ticker)
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0); // State for progress bar
    const [rawData, setRawData] = useState<number[]>([]);
    const state = useSidebar();
    const isOpen = state.isMobile ? state.openMobile : state.open;
    const [isMounted, setIsMounted] = useState(false);

    const [period1, setPeriod1] = useState<string>(() => {
        const today = new Date();
        today.setDate(today.getDate() - 200);  // Subtract 1 day from today
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');  // Ensure month is two digits
        const day = today.getDate().toString().padStart(2, '0');  // Ensure day is two digits
        return `${year}-${month}-${day}`;  // Format as 'YYYY-MM-DD'
      });
      const period2 = new Date().toISOString().split('T')[0]

    useEffect(() => {
        setIsMounted(true);
    }, []);
    if (!isMounted) {
        return null;
    }
    console.log(period1)
    console.log(period2)
  // Fetch the last 60 days of 'Close' price data
  const fetchStockData = async () => {
    try {
      setError("");
      setLoading(true);
      setProgress(0); // Reset progress
      setPredictions([]);

      if (!ticker) {
        setError("Please enter a valid ticker symbol.");
        setLoading(false);
        return;
      }

      // Fetch historical data for the last 60 days
      const response = await fetch(`/api/finance?symbol=${ticker}&period1=${period1}&period2=${period2}`);

      // Simulate progress bar updates
      for (let i = 0; i <= 100; i += 20) {
          setProgress(i);
          await new Promise((resolve) => setTimeout(resolve, 100));
      }

      let result = await response.json();
        if (!Array.isArray(result)) {
            throw new Error("Unexpected response format.");
        }
        // console.log(result)
      const closePrices = result.map((entry) => entry.close).slice(-60);
      const openPrices = result.map((entry) => entry.open).slice(-60);
      const highPrices = result.map((entry) => entry.high).slice(-60);
      const lowPrices = result.map((entry) => entry.low).slice(-60);
      const volume = result.map((entry) => entry.volume).slice(-60);
        // console.log(closePrices)
      if (closePrices.length !== 60) {
        throw new Error("Not enough data found for 60 days.");
      }

      setRawData(result);
    //   console.log(closePrices)
    //   sendDataToBackend(closePrices);
    } catch (err: any) {
      setError(err.message || "Failed to fetch stock data.");
    } finally {
      setLoading(false);
      setProgress(100); // Set progress to 100% on completion
    }
  };

  return (
    <div>
      <Navbar />
      <div className="main-content-future mt-24 ml-[275px] flex-col justify-center align-middle items-center">
        <h1 className="text-3xl font-bold mb-4">Stock Price Prediction</h1>
        <div className="select flex justify-center">
        <Select onValueChange={(value=>setTicker(value))}>
        <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a ticker" />
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
            <SelectLabel>Tickers</SelectLabel>
            {data.map((ticker:any) => (
                <SelectItem key={ticker.id} value={ticker.symbol}>
                ({ticker.symbol})  {ticker.name}
                </SelectItem>
            ))}
            </SelectGroup>
        </SelectContent>
        </Select>
        </div>
        <div className="flex flex-col justify-center items-center gap-4 mt-3">
          <Button className="w-[300px]" onClick={fetchStockData} disabled={loading}>
            {loading ? "Fetching Data..." : "Fetch Data"}
          </Button>
          <Progress value={progress} className="w-[300px] mt-2" /> {/* Progress bar */}
          <p>Click on any of the below buttons to get predictions</p>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}

        {!rawData ? (
            <div>Loading...</div>
        ) : (
            <TabsDemo symbol={ticker} data={rawData} />
        )}
      </div>
    </div>
  );
}
