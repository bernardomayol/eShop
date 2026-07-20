export interface CatalogItem {
  id: number;
  name: string;
  description: string;
  price: number;
  pictureFileName: string;
  pictureUri: string;
  catalogTypeId: number;
  catalogType: string;
  catalogBrandId: number;
  catalogBrand: string;
  availableStock: number;
  restockThreshold: number;
  maxStockThreshold: number;
  onReorder: boolean;
}

export interface CatalogBrand {
  id: number;
  brand: string;
}

export interface CatalogType {
  id: number;
  type: string;
}

export interface PaginatedItems<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
}
