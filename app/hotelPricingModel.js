const axios = require('axios');
const fileHelper = require('./fileHelper');

function ComputeRequestPayload(searchCriteria) {
  const requestPayload = {
    HotelPriceCheckRQ: {
      version: '2.1.0',
      RateInfoRef: {
        RateKey: searchCriteria.rateKey,
      },
    },
  };

  return JSON.stringify(requestPayload);
}

class HotelPricingModel {
  constructor(params) {
    this.searchCriteria = params.searchCriteria;
    this.apiAccessToken = params.apiAccessToken;
    this.appId = params.appId;
    this.apiEndPoint = params.apiEndPoint;
  }


  get results() {
    let rc = this.searchResponse.HotelPriceCheckRS.PriceCheckInfo;

    if (!rc) {
      rc = this.searchResponse.HotelPriceCheckRS;
    }

    return rc;
  }

  async read() {
    try {
      const response = await axios({
        method: 'post',
        url: `${this.apiEndPoint}/v2.1.0/hotel/pricecheck`,
        data: ComputeRequestPayload(this.searchCriteria),
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
          authorization: `Bearer ${this.apiAccessToken}`,
          'Application-ID': this.appId,
        },
      });

      this.searchResponse = response.data;
      fileHelper.writeData(JSON.stringify(this.searchResponse), './cachedResponse.json');
    } catch (error) {
      console.log('\nUnexpected error calling hotel get availability.');
      console.log(`[${error.response.status}] ... [${error.response.statusText}]`);
      console.log(`[${error.response.data.errorCode}] ... [${error.response.data.message}]`);
      fileHelper.writeData(JSON.stringify(error.response.data), './cachedResponse.json');
    }
  }
}

module.exports = HotelPricingModel;
