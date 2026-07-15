import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../services/catalog';
import { BasketService } from '../../services/basket';
import { CatalogItem, CatalogBrand, CatalogType } from '../../models/catalog.model';

@Component({
  selector: 'app-catalog',
  imports: [CommonModule, FormsModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
})
export class CatalogComponent implements OnInit {
  items: CatalogItem[] = [];
  brands: CatalogBrand[] = [];
  types: CatalogType[] = [];
  selectedBrandId?: number;
  selectedTypeId?: number;
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  loading = false;

  // Exponer Math para el template
  Math = Math;

  constructor(
    private catalogService: CatalogService,
    private basketService: BasketService
  ) {}

  ngOnInit(): void {
    this.loadBrands();
    this.loadTypes();
    this.loadItems();
  }

  loadBrands(): void {
    this.catalogService.getCatalogBrands().subscribe({
      next: (brands) => this.brands = brands,
      error: (err) => console.error('Error loading brands:', err)
    });
  }

  loadTypes(): void {
    this.catalogService.getCatalogTypes().subscribe({
      next: (types) => this.types = types,
      error: (err) => console.error('Error loading types:', err)
    });
  }

  loadItems(): void {
    this.loading = true;
    this.catalogService.getItems(this.pageSize, this.pageIndex, this.selectedBrandId, this.selectedTypeId)
      .subscribe({
        next: (response) => {
          this.items = response.data;
          this.totalItems = response.count;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading items:', err);
          this.loading = false;
        }
      });
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.loadItems();
  }

  addToBasket(item: CatalogItem): void {
    const buyerId = 'test-buyer'; // En producción, esto vendría del servicio de autenticación
    this.basketService.addItemToBasket(
      buyerId,
      item.id,
      item.name,
      item.price,
      1,
      item.pictureUri
    ).subscribe({
      next: () => {
        console.log('Item added to basket:', item.name);
        alert(`${item.name} agregado al carrito!`);
      },
      error: (err) => console.error('Error adding to basket:', err)
    });
  }

  previousPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.loadItems();
    }
  }

  nextPage(): void {
    if ((this.pageIndex + 1) * this.pageSize < this.totalItems) {
      this.pageIndex++;
      this.loadItems();
    }
  }
}
