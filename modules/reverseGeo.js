const apiKey = '7832e98c7316445a86389b66ce154876';

let z;
const arr = [];
class ReverseGeo {
  constructor(coords) {
    (async () => {
      this.lat = coords[0];
      this.lng = coords[1];
    })();
  }
  fetchData() {
    return new Promise((resolve, reject) => {
      fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${this.lat}&lon=${this.lng}&apiKey=${apiKey}`
      )
        .then(res => res.json())
        .then(data => resolve(data));
    });
  }
}

export { ReverseGeo };
