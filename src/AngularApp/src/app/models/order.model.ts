export interface Order {
  orderNumber: number;
  date: string;
  status: string;
  description: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
  orderItems: OrderItem[];
  total: number;
}

export interface OrderItem {
  productName: string;
  units: number;
  unitPrice: number;
  pictureUrl: string;
}
