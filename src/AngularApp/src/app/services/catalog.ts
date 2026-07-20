import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CatalogItem, CatalogBrand, CatalogType, PaginatedItems } from '../models/catalog.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private apiUrl = `${environment.bffUrl}/catalog-api/api/catalog`;

  constructor(private http: HttpClient) { }

  getItems(pageSize: number = 10, pageIndex: number = 0, brandId?: number, typeId?: number): Observable<PaginatedItems<CatalogItem>> {
    let params = new HttpParams()
      .set('pageSize', pageSize.toString())
      .set('pageIndex', pageIndex.toString())
      .set('api-version', '1.0');

    if (brandId) {
      params = params.set('brandId', brandId.toString());
    }
    if (typeId) {
      params = params.set('typeId', typeId.toString());
    }

    return this.http.get<PaginatedItems<CatalogItem>>(`${this.apiUrl}/items`, { params });
  }

  getItemById(id: number): Observable<CatalogItem> {
    const params = new HttpParams().set('api-version', '1.0');
    return this.http.get<CatalogItem>(`${this.apiUrl}/items/${id}`, { params });
  }

  getCatalogBrands(): Observable<CatalogBrand[]> {
    const params = new HttpParams().set('api-version', '1.0');
    return this.http.get<CatalogBrand[]>(`${this.apiUrl}/catalogBrands`, { params });
  }

  getCatalogTypes(): Observable<CatalogType[]> {
    const params = new HttpParams().set('api-version', '1.0');
    return this.http.get<CatalogType[]>(`${this.apiUrl}/catalogTypes`, { params });
  }
}
