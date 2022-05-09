class DistanceCalc {
  constructor(coords, myCoords) {
    this.coords = coords;
    this.myCoords = myCoords;
  }
  calc() {
    const R = 6371e3; // metres
    const φ1 = (this.myCoords[0] * Math.PI) / 180; // φ, λ in radians
    const φ2 = (this.coords[0] * Math.PI) / 180;
    const Δφ = ((this.coords[0] - this.myCoords[0]) * Math.PI) / 180;
    const Δλ = ((this.coords[1] - this.myCoords[1]) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // in metres
    const newLocal = +(d / 1000).toFixed(3);
    return newLocal;
  }
}

export { DistanceCalc };
