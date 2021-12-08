var yahooFinance = require('yahoo-finance');

yahooFinance.quote({
    symbol: 'TSLA',
    modules: ['price']       // optional; default modules.
  }, function(err, quote) {
    
  });

