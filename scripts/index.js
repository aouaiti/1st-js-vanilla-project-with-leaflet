'use strict';
// import { Running, Cycling } from '../modules/api';

const importTasks = () => import('userClass.js');
const reverseGeo = () => import('reverseGeo.js');
const distanceCalc = () => import('distanceCalc.js');
import { mobi9at } from 'data.js';
import '../style/style.css';
import '../style/leaflet.extra-markers.min.css';
import { ExtraMarkers } from 'leaflet.extra-markers.min.js';

const form = document.querySelector('.form');
const containermobi9ats = document.querySelector('.mobi9ats');
const inputType = document.querySelector('.form__input--type');
const inputPrice = document.querySelector('.form__input--price');
const inputNumber = document.querySelector('.form__input--number');
const inputDealer = document.querySelector('.form__input--dealer');
const inputZatla = document.querySelector('.form__input--zatla');
const inputDescription = document.querySelector('.form__input--wasf');
const whereAmI = document.querySelector('.whereAmI');
const note = document.querySelector('.note');
const burger = document.querySelector('.burger');
const sideBar = document.querySelector('.sidebar');

console.log(mobi9at);

class App {
  #map;
  #coords;
  #activities = [];
  //   reverseCoords = [];
  constructor() {
    (async () => {
      this.#map = await this._lefletMap();
      this._loadData();
      this.markmenow();
      this.#map.on('click', this._displayInput.bind(this));
      form.addEventListener('submit', this._formSubmit.bind(this));
      inputType.addEventListener('change', this._changeFields);
      containermobi9ats.addEventListener('click', this._dataToMap.bind(this));
      whereAmI.addEventListener('click', this.iAmHere.bind(this));
      burger.addEventListener('click', () => {
        sideBar.classList.toggle('popIt');
        burger.classList.toggle('burgerSwag');
      });
    })();
  }

  _geoLocation() {
    return new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject)
    );
  }

  async _getMyCoords() {
    const pos = await this._geoLocation();
    const { latitude: lat, longitude: lng } = await pos.coords;
    // return [36.2365198503968, 9.74418640136719];
    return [lat, lng];
    // return await pos.coords;
  }

  async markmenow() {
    this._markerIt(await this._getMyCoords(), 'none');
    // this._loadData();
  }

  async _lefletMap() {
    this.#map = L.map('map').setView(await this._getMyCoords(), 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    return this.#map;
  }

  _markerIt(coords, activity) {
    // <i class="fas fa-cannabis"></i>
    // <i class="fas fa-home"></i>
    // <i class="fas fa-angle-double-down"></i>

    const redMarker = L.ExtraMarkers.icon({
      icon: `${
        activity.type === 'لوكال'
          ? 'fa-home'
          : activity.type === 'لحام'
          ? 'fa-cannabis'
          : 'fa-angle-double-down'
      }`,
      markerColor: `${
        activity.type === 'لوكال'
          ? 'pink'
          : activity.type === 'لحام'
          ? 'green-light'
          : 'black'
      }`,
      shape: `${
        activity.type === 'لوكال'
          ? 'square'
          : activity.type === 'لحام'
          ? 'star'
          : 'circle'
      }`,
      prefix: 'fas',
      iconColor: 'white',
      extraClasses: 'pimpIcon',
    });

    L.marker(coords, { icon: redMarker })
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          autoClose: false,
          closeOnClick: false,
          className: `${
            activity.type === 'لوكال'
              ? 'local'
              : activity.type === 'زطلة'
              ? 'zatla'
              : 'self'
          }-popup`,
        })
      )
      .openPopup()
      .setPopupContent(`<p>${activity.describeIt || 'العبد لله'}</p>`);
  }

  _displayInput(pos) {
    form.classList.remove('hidden');
    inputDealer.focus();
    note.style.display = 'none';
    sideBar.classList.remove('popIt');
    burger.classList.toggle('burgerSwag');
    return (this.#coords = pos);
  }

  _populatedFields(...inputs) {
    return inputs.every(value => value.length > 0);
  }

  //   _numberFields(...inputs) {
  //     return inputs.every(value => !Number.isNaN(value));
  //   }

  _changeFields(e) {
    // inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    // inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputZatla.closest('.form__row').classList.toggle('form__row--hidden');
    inputPrice.closest('.form__row').classList.toggle('form__row--hidden');
  }

  async _formSubmit(e) {
    //init
    e.preventDefault();
    const { lat, lng } = this.#coords.latlng;
    const trajet = await this.distanceCalculator([lat, lng]);
    const address = await this._countryData([lat, lng]);
    console.log(lat, lng);
    //var
    let currentTask;
    const type = inputType.value;
    const dealer = inputDealer.value;
    const number = inputNumber.value;
    const description = inputDescription.value;
    //local control
    if (type === 'local') {
      const price = inputPrice.value;
      if (!this._populatedFields(dealer, number, description, price)) {
        return alert('check your data bitch !!!');
      } else {
        console.log(trajet);
        currentTask = importTasks().then(
          task =>
            new task.Local(
              [lat, lng],
              'لوكال',
              dealer,
              number,
              description,
              trajet,
              address,
              price
            )
        );
      }
    }
    //zatla control
    if (type === 'zatla') {
      const zatla = inputZatla.value;
      if (!this._populatedFields(dealer, number, description)) {
        return alert('check your data bitch !!!');
      } else {
        console.log(trajet);
        currentTask = importTasks().then(
          task =>
            new task.Zatla(
              [lat, lng],
              'لحام',
              dealer,
              number,
              description,
              trajet,
              address,
              zatla
            )
        );
      }
    }
    // closure
    currentTask.then(data => {
      this._renderTask(data);
      this.#activities.push(data);
      this._markerIt([lat, lng], data);
      this._storeData();
    });
    console.log(this.#activities);
    this._uiUpdate();
  }

  _renderTask(x) {
    const html = `
      <li class="mobi9at ${
        x.type === 'لوكال' ? 'mobi9at--local' : 'mobi9at--zatla'
      }" data-id=${x.id}>
      <h2 class="mobi9at__title" style="grid-column-start:span 2; z-index:5">${
        x.describeIt
      }</h2>
      <div class="mobi9at__details">
        ${
          x.type === 'لوكال'
            ? '<i class="fa-solid fa-house"></i>'
            : '<i class="fa-solid fa-cannabis"></i>'
        }
        <span class="mobi9at__value">${x.type}</span>
      </div>
      <div class="mobi9at__details">
      <i class="fa-solid fa-user-secret"></i>
      <span class="mobi9at__value">${
        x.type === 'لوكال' ? x.dealer : x.dealer
      }</span>
    </div>
      <div class="mobi9at__details">
      <i class="fa-solid fa-mobile-screen-button"></i>
        <span class="mobi9at__value">${x.number}</span>
      </div>
      <div class="mobi9at__details">
        ${
          x.type === 'لوكال'
            ? '<i class="fa-solid fa-hand-holding-dollar"></i>'
            : '<i class="fa-solid fa-joint"></i>'
        }
        <span class="mobi9at__value">${
          x.type === 'لوكال' ? x.price : x.zatla
        } </span>
        <span class="mobi9at__unit">${
          x.type === 'لوكال' ? 'دينار/الساعة' : ''
        }</span>
      </div>
      <div class="mobi9at__details trajet">
      <i class="fa-solid fa-shoe-prints"></i>
        <span class="mobi9at__value">${
          x.trajet.toFixed() + ' كلم ' + ((x.trajet % 1) * 1000).toFixed()
        } </span>
      </div>
      <div class="mobi9at__details trajet">
      <i class="fa-solid fa-map-location-dot"></i>
        <span class="mobi9at__value">${x.address} </span>
      </div>
    </li>
    `;
    form.insertAdjacentHTML('afterend', html);
  }
  _uiUpdate() {
    form.classList.add('hidden');
    form.style.display = 'none';
    inputDealer.value =
      inputPrice.value =
      inputNumber.value =
      inputDescription.value =
        '';
    setTimeout(() => (form.style.display = 'grid'), 20);
  }

  _dataToMap(e) {
    if (!e.target.closest('.mobi9at')) return;
    const activity = this.#activities.find(
      data => e.target.closest('.mobi9at').dataset.id == data.id
    );
    this.#map.setView(activity.coords, 13);
    this._countryData(activity.coords);
    console.log('coords =', activity.coords);
    sideBar.classList.add('popIt');
    burger.classList.toggle('burgerSwag');
  }

  _storeData() {
    // const previousData = JSON.parse(localStorage.getItem('activity')) || [];
    // this.#activities.sort((a, b) => b.trajet - a.trajet);
    localStorage.setItem('activity', JSON.stringify(this.#activities));
  }

  async _loadData() {
    const loadedData =
      (await JSON.parse(localStorage.getItem('activity'))) || mobi9at;

    // await Promise.all(
    loadedData.map(async elem => {
      const data = await this.distanceCalculator(elem.coords);
      elem.trajet = data;
      console.log(data);
    });
    // );

    loadedData.sort((a, b) => b.trajet - a.trajet);
    this.#activities = [...loadedData];

    this.#activities.map((elem, i) => {
      this._renderTask(elem);
      this._markerIt(elem.coords, elem);
    });

    console.log(this.#activities);

    this.#map.setView(await this._getMyCoords(), 13);

    return this.#activities;
  }
  async _countryData(x) {
    // reverseGeo().then(data =>
    //   new data.ReverseGeo(x)
    //     .fetchData()
    //     .then(dataReady => console.log(dataReady.features[0]))
    // );
    const dataInit = await reverseGeo(x);
    const dataConstructor = await new dataInit.ReverseGeo(x);
    const dataFetch = await dataConstructor.fetchData();
    const [finalData] = await dataFetch.features;
    console.log(finalData.properties);
    const recapData =
      (finalData.properties.county || '',
      finalData.properties.road || '',
      finalData.properties.district || '');
    return finalData.properties.formatted;
  }

  async distanceCalculator(x) {
    const mypos = await this._getMyCoords();
    return distanceCalc().then(data => new data.DistanceCalc(x, mypos).calc());
  }
  async iAmHere() {
    this.#map.setView(await this._getMyCoords(), 13);
    sideBar.classList.add('popIt');
    burger.classList.remove('burgerSwag');
  }
}
const app = new App();
