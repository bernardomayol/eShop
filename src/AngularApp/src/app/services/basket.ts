import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CustomerBasket, BasketItem } from '../models/basket.model';

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private apiUrl = `${environment.basketApiUrl}/api/basket`;
  private basketSubject = new BehaviorSubject<CustomerBasket | null>(null);
  public basket$ = this.basketSubject.asObservable();

  constructor(private http: HttpClient) { }

  getBasket(buyerId: string): Observable<CustomerBasket> {
    return this.http.get<CustomerBasket>(`${this.apiUrl}/${buyerId}`)
      .pipe(tap(basket => this.basketSubject.next(basket)));
  }

  updateBasket(basket: CustomerBasket): Observable<CustomerBasket> {
    return this.http.post<CustomerBasket>(this.apiUrl, basket)
      .pipe(tap(basket => this.basketSubject.next(basket)));
  }

  addItemToBasket(buyerId: string, productId: number, productName: string, 
                  unitPrice: number, quantity: number = 1, pictureUrl: string = ''): Observable<CustomerBasket> {
    const currentBasket = this.basketSubject.value || { buyerId, items: [] };

    const existingItem = currentBasket.items.find(item => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      currentBasket.items.push({
        id: Math.random().toString(36).substr(2, 9),
        productId,
        productName,
        unitPrice,
        oldUnitPrice: unitPrice,
        quantity,
        pictureUrl
      });
    }

    return this.updateBasket(currentBasket);
  }

  removeItemFromBasket(buyerId: string, productId: number): Observable<CustomerBasket> {
    const currentBasket = this.basketSubject.value;
    if (!currentBasket) {
      throw new Error('No basket found');
    }

    currentBasket.items = currentBasket.items.filter(item => item.productId !== productId);
    return this.updateBasket(currentBasket);
  }

  clearBasket(buyerId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${buyerId}`)
      .pipe(tap(() => this.basketSubject.next(null)));
  }

  getBasketItemCount(): number {
    const basket = this.basketSubject.value;
    return basket ? basket.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  }
}
