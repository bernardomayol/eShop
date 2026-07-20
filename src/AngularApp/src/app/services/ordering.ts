import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderingService {
  private apiUrl = `${environment.bffUrl}/api/orders`;

  constructor(private http: HttpClient) { }

  getOrders(): Observable<Order[]> {
    const params = new HttpParams().set('api-version', '1.0');
    return this.http.get<Order[]>(this.apiUrl, { params });
  }

  getOrderById(orderId: number): Observable<Order> {
    const params = new HttpParams().set('api-version', '1.0');
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`, { params });
  }

  cancelOrder(orderId: number): Observable<boolean> {
    const params = new HttpParams().set('api-version', '1.0');
    return this.http.put<boolean>(`${this.apiUrl}/cancel`, { orderId }, { params });
  }

  shipOrder(orderId: number): Observable<boolean> {
    const params = new HttpParams().set('api-version', '1.0');
    return this.http.put<boolean>(`${this.apiUrl}/ship`, { orderId }, { params });
  }
}
