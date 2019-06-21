class HotelPricingView {
  constructor(params) {
    this.hotelPriceModel = params.hotelPriceModel;
  }

  static GetContentSourceById(id) {
    const sources = {
      100: 'Sabre GDS',
      110: 'Expedia Partner Solutions',
      112: 'Bedsonline',
      113: 'Booking.com',
    };

    return sources[id];
  }

  static formatCurrency(code, amount) {
    const currencyFormat = {
      style: 'currency',
      currency: code,
    };

    return amount.toLocaleString('en', currencyFormat);
  }

  static renderHotelRateSummary(hotelRate) {
    const amountAfterTax = hotelRate.AmountAfterTax || 0;
    const currencyCode = hotelRate.CurrencyCode;
    const afterTax = this.formatCurrency(currencyCode, amountAfterTax);
    const averageNightly = hotelRate.AverageNightlyRate || 0;
    const average = this.formatCurrency(currencyCode, averageNightly);

    console.log('  Summary');
    console.log(`    Check in ${hotelRate.StartDate} | Check out ${hotelRate.EndDate} `);
    console.log('\t\t ------------------------');
    console.log(`    Total Price: ${afterTax} (Average Nightly: ${average})`);
    console.log(`    Source: ${HotelPricingView.GetContentSourceById(hotelRate.RateSource)}\n`);
  }

  static renderCancelPolicy(hotelRate) {
    const cancelPolicy = hotelRate.CancelPenalties.CancelPenalty[0];
    const prefix = '      Note: ';

    if (cancelPolicy.Refundable) {
      const deadline = cancelPolicy.Deadline || {};
      let suffix = '';

      if (deadline.OffsetUnitMultiplier && deadline.OffsetTimeUnit) {
        suffix = ` up to ${deadline.OffsetUnitMultiplier} ${deadline.OffsetTimeUnit.toLowerCase()}s`;
      }

      console.log(`${prefix}Can be cancelled${suffix}`);
    } else {
      console.log(`${prefix}Can't be cancelled`);
    }
    console.log('');
  }

  renderRateSummary() {
    const rate = this.hotelPriceModel.results.HotelRateInfo.RateInfos.RateInfo;
    rate.forEach((rateEntry) => {
      HotelPricingView.renderHotelRateSummary(rateEntry);
    });
  }

  static renderRoomRateSummary(room) {
    const roomSummary = room.RateInfo;
    const currencyFormat = {
      style: 'currency',
      currency: roomSummary.CurrencyCode,
    };
    const taxes = roomSummary.Taxes || {};

    const amountAfterTax = roomSummary.AmountAfterTax || 0;
    const amountBeforeTax = roomSummary.AmountBeforeTax || 0;
    const amountOfTax = taxes.Amount || 0;
    const afterTax = amountAfterTax.toLocaleString('en', currencyFormat);
    const beforeTax = amountBeforeTax.toLocaleString('en', currencyFormat);
    const totalTax = amountOfTax.toLocaleString('en', currencyFormat);

    console.log('  Rate Plan Summary');
    console.log(`    PlanName: ${room.RatePlanName}`);
    console.log(`    Check in ${roomSummary.StartDate} | Check out ${roomSummary.EndDate}`);
    console.log('\t\t ------------------------');
    console.log(`    Total Price: ${afterTax} (Base: ${beforeTax} + Tax: ${totalTax})`);
    console.log(`    Source: ${HotelPricingView.GetContentSourceById(room.RateSource)}\n`);
  }

  static renderNightlyRates(nightlyRates) {
    console.log('  Nightly Rates');
    nightlyRates.forEach((nightly) => {
      const currencyFormat = {
        style: 'currency',
        currency: nightly.CurrencyCode,
      };
      const amount = nightly.AmountBeforeTax || nightly.AmountAfterTax || 0;
      const beforeTax = amount.toLocaleString('en', currencyFormat);

      console.log(`    Check in ${nightly.StartDate} | Check out ${nightly.EndDate} | Total ${beforeTax}`);
    });
  }

  renderNightlyRates() {
    const rooms = this.hotelPriceModel.results.HotelRateInfo.Rooms.Room;

    rooms.forEach((room) => {
      const rates = room.RatePlans.RatePlan;
      rates.forEach((rate) => {
        HotelPricingView.renderRoomRateSummary(rate);
        if (rate.RateInfo.Rates) {
          HotelPricingView.renderNightlyRates(rate.RateInfo.Rates.Rate);
        }
        HotelPricingView.renderCancelPolicy(rate.RateInfo);
      });
    });
  }

  checkForError() {
    const appResults = this.hotelPriceModel.results.ApplicationResults || {};
    const isError = appResults.Error !== undefined;

    return isError;
  }

  renderError() {
    const appResults = this.hotelPriceModel.results.ApplicationResults;

    appResults.Error.forEach((error) => {
      error.SystemSpecificResults.forEach((result) => {
        result.Message.forEach((message) => {
          console.log(`${message.code}...${message.value}`);
        });
      });
    });
    console.log('\n');
  }

  render() {
    if (this.checkForError()) {
      this.renderError();
    } else {
      this.renderRateSummary();
      this.renderNightlyRates();
    }
  }
}

module.exports = HotelPricingView;
