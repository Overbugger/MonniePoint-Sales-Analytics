import { Transaction } from "~/types/sales";

export  function parsedTransaction (line: string): Transaction {
    const [staffId, timestamp, product, amount] = line.split(',');
    const products: { [key: string]: number } = {};
    
    const parsedProductsStr = product ? product.slice(1, -1) : '';
    parsedProductsStr.split('|').forEach(prod => {
      const [id, quantity] = prod.split(':');
      if (id && quantity) {
        products[id] = parseInt(quantity);
      }
    });

    return {
      salesStaffId: staffId || '',
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      products,
      saleAmount: parseFloat(amount || '0')
    };
  };

  