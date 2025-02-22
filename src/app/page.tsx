"use client"

import { useState, useRef } from 'react';
import JSZip from 'jszip';
import { DailySales, Transaction } from '~/types/sales';
import AnalyticsCard from '~/components/analyticsCard';
import { formatShortDate, getMonthName, isValidDateFormat } from '../utils/date';
import { parsedTransaction } from '~/utils/transaction';

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [textContents, setTextContents] = useState<{ [key: string]: string }>({});
  const [analytics, setAnalytics] = useState<{
    highestDailyVolume: DailySales;
    highestDailyValue: DailySales;
    mostSoldProduct: { productId: string; volume: number };
    topStaffByMonth: { [key: string]: string };
    peakHour: { hour: number; avgVolume: number };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const analyticsRef = useRef<HTMLDivElement>(null);

  const analyzeTransactions = (textContents: { [key: string]: string }) => {
    const Transactions: Transaction[] = [];
    const dailySales: { [key: string]: DailySales } = {};
    const productVolumes: { [key: string]: number } = {};
    const monthlyStaffSales: { [key: string]: { [key: string]: number } } = {};
    const hourlyTransactions: { [key: number]: number[] } = {};
 
    Object.values(textContents).forEach(fileContent => {
      fileContent.split('\n').forEach(line => {
        if (line.trim()) {
          const transaction = parsedTransaction(line);
          Transactions.push(transaction);

          const dateKey = transaction.timestamp?.toISOString().split('T')[0];
          // console.log('dateKey:', dateKey);
          if (!dateKey) return;

          if (!dailySales[dateKey]) {
            dailySales[dateKey] = { volume: 0, value: 0, date: dateKey };
          }
          dailySales[dateKey].value += transaction.saleAmount;
          dailySales[dateKey].volume += Object.values(transaction.products).reduce((a, b) => a + b, 0);
          // console.log('dailySales:', dailySales);

          Object.entries(transaction.products).forEach(([productId, quantity]) => {
            productVolumes[productId] = (productVolumes[productId] || 0) + quantity;
          });

          const monthKey = dateKey.substring(0, 7);
          if (!monthlyStaffSales[monthKey]) {
            monthlyStaffSales[monthKey] = {};
          }
          monthlyStaffSales[monthKey][transaction.salesStaffId] = 
            (monthlyStaffSales[monthKey][transaction.salesStaffId] || 0) + transaction.saleAmount;

          const hour = transaction.timestamp.getHours();
          if (!hourlyTransactions[hour]) {
            hourlyTransactions[hour] = [];
          }
          hourlyTransactions[hour].push(
            Object.values(transaction.products).reduce((a, b) => a + b, 0)
          );
        }
      });
    });

    const highestDailyVolume = Object.values(dailySales).reduce(
      (max, curr) => curr.volume > max.volume ? curr : max,
      { volume: 0, value: 0, date: '' }
    );
    // console.log('highestDailyVolume:', highestDailyVolume);

    const highestDailyValue = Object.values(dailySales).reduce(
      (max, curr) => curr.value > max.value ? curr : max,
      { volume: 0, value: 0, date: '' }
    );
    // console.log('highestDailyValue:', highestDailyValue);

    const mostSoldProduct = Object.entries(productVolumes).reduce(
      (max, [id, volume]) => volume > max.volume ? { productId: id, volume } : max,
      { productId: '', volume: 0 }
    );
    // console.log('mostSoldProduct:', mostSoldProduct);

    const topStaffByMonth = Object.entries(monthlyStaffSales).reduce(
      (acc, [month, staffSales]) => ({
        ...acc,
        [month]: Object.entries(staffSales).reduce(
          (maxStaff, [staffId, sales]) => 
            sales > (staffSales[maxStaff] || 0) ? staffId : maxStaff,
          ''
        )
      }),
      {}
    );
    // console.log('topStaffByMonth:', topStaffByMonth);

    const peakHour = Object.entries(hourlyTransactions).reduce(
      (max, [hour, volumes]) => {
        const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
        return avgVolume > max.avgVolume ? { hour: parseInt(hour), avgVolume } : max;
      },
      { hour: 0, avgVolume: 0 }
    );
    // console.log('peakHour:', peakHour);

    setAnalytics({
      highestDailyVolume,
      highestDailyValue,
      mostSoldProduct,
      topStaffByMonth,
      peakHour
    });
  };

  const scrollToAnalytics = () => {
    analyticsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const zipFile = e.target.files[0];

      if (!zipFile.type && !zipFile.name.endsWith('.zip')) {
        setError('Please upload a valid ZIP file.');
        return;
      }

      setFile(zipFile);
      setError(null);
      setIsLoading(true);

      try {
        const zip = new JSZip();
        const contents = await zip.loadAsync(zipFile);
        const textFiles: { [key: string]: string } = {};

        const validFiles = Object.keys(contents.files).filter(filename => 
          contents.files[filename] && !contents.files[filename].dir && isValidDateFormat(filename)
        );
  
        if (validFiles.length === 0) {
          setError('No valid sales data files found in the ZIP archive.');
          return
        }
        

        for (const [filename, file] of Object.entries(contents.files)) {
          if (!file.dir && isValidDateFormat(filename)) {
            const content = await file.async('string');
            textFiles[filename] = content;
          }
        }
        
        setTextContents(textFiles);
        analyzeTransactions(textFiles);
        setTimeout(() => scrollToAnalytics(), 100);
      } catch (error) {
        // console.error('Error processing zip file:', error);
        setError(error instanceof Error ? error.message : 'Error processing the ZIP file.');
        setFile(null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-500 to to-blue-950 text-white select-none">
      <div className="flex flex-col items-center justify-center gap-10 w-full max-w-4xl p-8">
        <h1 className="text-4xl font-bold">MoniePoint Sales Analytics</h1>
        <div className="flex flex-col items-center gap-4 w-full">
          <label 
            htmlFor="file-upload" 
            className={`
              bg-gray-800 hover:bg-gray-600 text-white font-bold 
              py-2 px-4 w-1/4 text-center rounded-lg cursor-pointer transition-all
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isLoading ?  <span className='flex items-center justify-center gap-3'><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Analyzing</span> : 'Upload Data'}

          </label>
          <p className="text-lg text-center text-gray-300">
            Please upload a zip file of the year's sales data
          </p>
          <input 
            id="file-upload"
            name="file-upload"
            type="file"
            accept=".zip"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isLoading}
          />
          
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-lg">
              {error}
            </div>
          )}

        </div>
        {analytics && (
          <div 
            ref={analyticsRef}
            className="w-full space-y-6 rounded-lg p-4" 
          >
             <div className="flex flex-col items-center gap-4 border rounded-lg p-4 w-full bg-gray-200">
              <p className="text-xl text-gray-800">{file?.name.replace(".zip", "")}</p>
              <p className="text-sm text-gray-700">
                {Object.keys(textContents).length} valid files analyzed
              </p>
            </div>
            <AnalyticsCard
              heading="Highest Sales Volume Day"
              metadataOneHead='Date'
              metadataTwoHead='Volume'
              metadataOne={formatShortDate( analytics.highestDailyVolume.date)}
              metadataTwo={analytics.highestDailyVolume.volume.toString()}
            />

            <AnalyticsCard
              heading="Highest Sales Value Day"
              metadataOneHead='Date'
              metadataTwoHead='Value'
              metadataOne={formatShortDate(analytics.highestDailyValue.date)}
              metadataTwo={analytics.highestDailyValue.value.toFixed(2)}
            />

            <AnalyticsCard
              heading="Most Sold Product"
              metadataOneHead='Product ID'
              metadataTwoHead='Volume'
              metadataOne={analytics.mostSoldProduct.productId}
              metadataTwo={`${analytics.mostSoldProduct.volume} units`}
            />

            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Top Sales Staff by Month</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left pb-2 border-b border-gray-700">Month</th>
                      <th className="text-left pb-2 border-b border-gray-700">Staff ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(analytics.topStaffByMonth)
                      .sort((a, b) => a[0].localeCompare(b[0]))
                      .map(([month, staffId]) => (
                        <tr key={month} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="py-2">{getMonthName(month)}</td>
                          <td className="py-2">{staffId}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <AnalyticsCard
              heading="Peak Sales Hour"
              metadataOneHead='Hour'
              metadataTwoHead='Average Volume'
              metadataOne={`${analytics.peakHour.hour}Hrs`}
              metadataTwo={`${analytics.peakHour.avgVolume.toFixed(2)} units`}
            />
          </div>
        )}
      </div>
    </main>
  );
}
