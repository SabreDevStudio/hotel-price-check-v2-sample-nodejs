const config = require('./config');
const hotelSearchCritera = require('./searchCriteria');

const AuthenticationModel = require('./authenticationModel');
const HotelPriceModel = require('./hotelPricingModel');
const HotelPriceView = require('./hotelPricingView');

let authentication;


function SearchForHotels() {
  const hotelPriceModel = new HotelPriceModel({
    searchCriteria: hotelSearchCritera,
    apiAccessToken: authentication.token,
    appId: config.appId,
    apiEndPoint: config.apiEndPoint,
  });

  hotelPriceModel.read()
    .then(() => {
      const hotelPriceView = new HotelPriceView({
        hotelPriceModel,
      });
      hotelPriceView.render();
    })
    .catch(() => {
      console.log('\n');
    });
}

console.log('\n  Running the Hotel Pricing Check V2 demo\n\n');

authentication = new AuthenticationModel({
  apiEndPoint: config.apiEndPoint,
  userSecret: config.userSecret,
});

authentication.createToken()
  .then(() => {
    SearchForHotels();
  })
  .catch(() => {
    console.log('\n');
  });

