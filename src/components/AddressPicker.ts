import { t, i18n } from '../i18n';
import { addressStore, type DeliveryAddress } from '../store/address';
import { apiRequest } from '../config/api';

// Dynamic Google Maps loader
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
let googleMapsLoading = false;
let googleMapsLoaded = false;

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (googleMapsLoaded || typeof google !== 'undefined' && google.maps?.places) {
      googleMapsLoaded = true;
      resolve();
      return;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('VITE_GOOGLE_MAPS_API_KEY not set, Google Places autocomplete disabled');
      resolve();
      return;
    }

    if (googleMapsLoading) {
      // Wait for existing load
      const checkInterval = setInterval(() => {
        if (googleMapsLoaded) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      return;
    }

    googleMapsLoading = true;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.onload = () => {
      googleMapsLoaded = true;
      googleMapsLoading = false;
      resolve();
    };
    script.onerror = () => {
      googleMapsLoading = false;
      reject(new Error('Failed to load Google Maps'));
    };
    document.head.appendChild(script);
  });
}

interface DeliveryCheckResponse {
  canDeliver: boolean;
  address?: string;
  distance?: number;
  zone?: string;
  minimumOrder?: number;
  deliveryFee?: number;
  estimatedTime?: string;
  message: string;
}

export class AddressPicker {
  private element: HTMLElement;
  private isExpanded = false;
  private isLoading = false;
  private autocomplete: google.maps.places.Autocomplete | null = null;
  private outsideClickBound = false;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'address-picker';
    this.render();

    addressStore.subscribe(() => this.updateView());
    i18n.subscribe(() => this.updateView());

    // Add outside click listener only once
    document.addEventListener('click', (e) => {
      if (this.isExpanded && !this.element.contains(e.target as Node)) {
        this.isExpanded = false;
        this.updateView();
      }
    });

    // Try to init Google Places when script loads
    this.initGooglePlaces();
  }

  private updateView(): void {
    // Update without re-attaching all events
    const address = addressStore.getAddress();

    const triggerText = this.element.querySelector('.address-text');
    if (triggerText) {
      triggerText.textContent = address?.address ? this.truncateAddress(address.address) : t('address.placeholder');
    }

    // Update input field with resolved address
    const input = this.element.querySelector('.address-input') as HTMLInputElement;
    if (input && address?.address) {
      input.value = address.address;
    } else if (input && !address) {
      input.value = '';
    }

    const checkMark = this.element.querySelector('.address-check');
    if (address?.canDeliver && !checkMark) {
      const trigger = this.element.querySelector('.address-picker-trigger');
      const span = document.createElement('span');
      span.className = 'address-check';
      span.textContent = '✓';
      trigger?.insertBefore(span, trigger.querySelector('.address-chevron'));
    } else if (!address?.canDeliver && checkMark) {
      checkMark.remove();
    }

    // Update delivery info section
    const dropdown = this.element.querySelector('.address-dropdown');
    if (dropdown) {
      const existingInfo = dropdown.querySelector('.delivery-info');
      const existingClear = dropdown.querySelector('.address-clear-btn');
      existingInfo?.remove();
      existingClear?.remove();

      if (address) {
        const infoHtml = this.renderDeliveryInfo(address);
        if (infoHtml) {
          dropdown.insertAdjacentHTML('beforeend', infoHtml);
        }
        if (address.address) {
          dropdown.insertAdjacentHTML('beforeend', `<button class="address-clear-btn">${t('address.clear')}</button>`);
          dropdown.querySelector('.address-clear-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            addressStore.clear();
            this.isExpanded = false;
            this.updateView();
          });
        }
      }
    }

    // Update dropdown open state
    const dropdownEl = this.element.querySelector('.address-dropdown');
    const chevron = this.element.querySelector('.address-chevron');
    if (this.isExpanded) {
      dropdownEl?.classList.add('open');
      chevron?.classList.add('expanded');
    } else {
      dropdownEl?.classList.remove('open');
      chevron?.classList.remove('expanded');
    }
  }

  private render(): void {
    const address = addressStore.getAddress();

    this.element.innerHTML = `
      <div class="address-picker-trigger" role="button" tabindex="0">
        <svg class="address-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <span class="address-text">
          ${address?.address ? this.truncateAddress(address.address) : t('address.placeholder')}
        </span>
        ${address?.canDeliver ? '<span class="address-check">✓</span>' : ''}
        <svg class="address-chevron ${this.isExpanded ? 'expanded' : ''}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      <div class="address-dropdown ${this.isExpanded ? 'open' : ''}">
        <div class="address-input-wrapper">
          <input
            type="text"
            class="address-input"
            placeholder="${t('address.inputPlaceholder')}"
            value="${address?.address || ''}"
            ${this.isLoading ? 'disabled' : ''}
          />
          <button class="address-gps-btn" title="${t('address.useGps')}" ${this.isLoading ? 'disabled' : ''}>
            ${this.isLoading ? this.getSpinner() : this.getGpsIcon()}
          </button>
        </div>

        ${address ? this.renderDeliveryInfo(address) : ''}

        ${address?.address ? `
          <button class="address-clear-btn">${t('address.clear')}</button>
        ` : ''}
      </div>
    `;

    this.attachEvents();
    this.initGooglePlaces();
  }

  private renderDeliveryInfo(address: DeliveryAddress): string {
    if (!address.address) return '';

    if (address.canDeliver) {
      return `
        <div class="delivery-info delivery-info--success">
          <div class="delivery-info-row">
            <span class="delivery-check-icon">✓</span>
            <span>${t('address.deliveryPossible')}</span>
          </div>
          <div class="delivery-info-details">
            <div class="delivery-detail">
              <span class="delivery-label">${t('address.minOrder')}:</span>
              <span class="delivery-value">CHF ${address.minimumOrder}</span>
            </div>
            <div class="delivery-detail">
              <span class="delivery-label">${t('address.deliveryFee')}:</span>
              <span class="delivery-value">${address.deliveryFee === 0 ? t('address.free') : `CHF ${address.deliveryFee}`}</span>
            </div>
            <div class="delivery-detail">
              <span class="delivery-label">${t('address.time')}:</span>
              <span class="delivery-value">${address.estimatedTime}</span>
            </div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="delivery-info delivery-info--error">
          <div class="delivery-info-row">
            <span class="delivery-x-icon">✕</span>
            <span>${address.message || t('address.noDelivery')}</span>
          </div>
          <p class="delivery-pickup-hint">${t('address.pickupAvailable')}</p>
        </div>
      `;
    }
  }

  private truncateAddress(address: string): string {
    if (address.length > 25) {
      return address.substring(0, 22) + '...';
    }
    return address;
  }

  private getGpsIcon(): string {
    return `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2"/>
        <circle cx="12" cy="12" r="8"/>
      </svg>
    `;
  }

  private getSpinner(): string {
    return `<span class="spinner"></span>`;
  }

  private attachEvents(): void {
    const trigger = this.element.querySelector('.address-picker-trigger');
    const input = this.element.querySelector('.address-input') as HTMLInputElement;
    const gpsBtn = this.element.querySelector('.address-gps-btn');
    const clearBtn = this.element.querySelector('.address-clear-btn');

    trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });
    trigger?.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
        e.preventDefault();
        this.toggleDropdown();
      }
    });

    // Manual address entry (fallback if no Google Places)
    input?.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter') {
        e.preventDefault();
        const address = input.value.trim();
        if (address) {
          this.checkDelivery({ address });
        }
      }
    });

    gpsBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.useGps();
    });

    clearBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      addressStore.clear();
      this.isExpanded = false;
      this.updateView();
    });
  }

  private toggleDropdown(): void {
    this.isExpanded = !this.isExpanded;
    this.updateView();

    if (this.isExpanded) {
      setTimeout(() => {
        const input = this.element.querySelector('.address-input') as HTMLInputElement;
        input?.focus();
      }, 100);
    }
  }

  private async initGooglePlaces(): Promise<void> {
    try {
      await loadGoogleMaps();
    } catch (error) {
      console.error('Failed to load Google Maps:', error);
      return;
    }

    // Check if Google Maps is loaded
    if (typeof google === 'undefined' || !google.maps?.places) {
      return;
    }

    const input = this.element.querySelector('.address-input') as HTMLInputElement;
    if (!input || this.autocomplete) return;

    this.autocomplete = new google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: 'ch' },
      types: ['address'],
      fields: ['formatted_address', 'place_id', 'geometry']
    });

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete?.getPlace();
      if (place?.place_id) {
        this.checkDelivery({ placeId: place.place_id });
      }
    });
  }

  private async useGps(): Promise<void> {
    if (!navigator.geolocation) {
      alert(t('address.gpsNotSupported') || 'GPS not supported');
      return;
    }

    this.setLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        });
      });

      console.log('GPS position:', position.coords.latitude, position.coords.longitude);

      await this.checkDelivery({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    } catch (error: any) {
      console.error('GPS error:', error);
      this.setLoading(false);

      // Show user-friendly error
      let message = 'GPS error';
      if (error?.code === 1) {
        message = t('address.gpsPermissionDenied') || 'Location permission denied. Please allow location access.';
      } else if (error?.code === 2) {
        message = t('address.gpsUnavailable') || 'Location unavailable. Please try again.';
      } else if (error?.code === 3) {
        message = t('address.gpsTimeout') || 'Location request timed out. Please try again.';
      }
      alert(message);
    }
  }

  private setLoading(loading: boolean): void {
    this.isLoading = loading;
    const gpsBtn = this.element.querySelector('.address-gps-btn');
    const input = this.element.querySelector('.address-input') as HTMLInputElement;
    if (gpsBtn) {
      gpsBtn.innerHTML = loading ? this.getSpinner() : this.getGpsIcon();
      (gpsBtn as HTMLButtonElement).disabled = loading;
    }
    if (input) {
      input.disabled = loading;
    }
  }

  private async checkDelivery(params: { placeId?: string; lat?: number; lng?: number; address?: string }): Promise<void> {
    this.setLoading(true);

    try {
      const result = await apiRequest<DeliveryCheckResponse>('/api/delivery/check', {
        method: 'POST',
        body: JSON.stringify(params)
      });

      addressStore.setAddress({
        address: result.address || params.address || '',
        canDeliver: result.canDeliver,
        distance: result.distance,
        zone: result.zone,
        minimumOrder: result.minimumOrder,
        deliveryFee: result.deliveryFee,
        estimatedTime: result.estimatedTime,
        message: result.message
      });

    } catch (error) {
      console.error('Delivery check error:', error);
    } finally {
      this.setLoading(false);
    }
  }

  getElement(): HTMLElement {
    return this.element;
  }
}
