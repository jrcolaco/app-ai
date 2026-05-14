import { Component, signal, OnInit } from '@angular/core';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrl: './weather.component.scss'
})
export class WeatherComponent implements OnInit {

  weather = signal<any>(null);

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.loadWeather();
  }

  loadWeather(): void {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      this.api.weatherCoords(lat, lon).subscribe({
        next: (res) => {
          this.weather.set(res);
        },
        error: (err) => {
          console.error('Weather ERROR:', err);
        }
      });
    });
  }
}
