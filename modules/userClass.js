// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

class Haram {
  date = new Date();
  id;
  constructor(coords, type, dealer, number, description, trajet, address) {
    this.type = type;
    this.dealer = dealer;
    this.number = number;
    this.id = String(this.date.getTime()).slice(-6);
    this.description = description;
    this.coords = coords;
    this._describe();
    this.trajet = trajet;
    this.address = address;
  }
  _describe() {
    return (this.describeIt = `${this.type} (${this.dealer}): ${this.description}`);
  }
}

class Local extends Haram {
  constructor(
    coords,
    type,
    dealer,
    number,
    description,
    trajet,
    address,
    price
  ) {
    super(coords, type, dealer, number, description, trajet, address);
    this.price = price;
  }
}

class Zatla extends Haram {
  constructor(
    coords,
    type,
    dealer,
    number,
    description,
    trajet,
    address,
    zatla
  ) {
    super(coords, type, dealer, number, description, trajet, address);
    this.zatla = zatla;
  }
}

export { Local, Zatla };
