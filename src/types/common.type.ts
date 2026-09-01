export interface ProductData {
  productId: number;
  productCode: string;
  productName: string;
  productPrice: number;
  active?: boolean;
  totalStockAmount?: number;
}

export interface StockData extends ProductData {
  amount?: number;
}

export interface CartItem extends ProductData {
  quantity: number;
  amount?: number;
}
