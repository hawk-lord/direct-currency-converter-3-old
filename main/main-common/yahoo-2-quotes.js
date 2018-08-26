/*
 * © Per Johansson
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

"use strict";

const Yahoo2QuotesServiceProvider = function(anEventAggregator, anInformationHolder) {
    const eventAggregator = anEventAggregator;

    eventAggregator.subscribe("quotesReceivedYahoo", (eventArgs) => {
        const response = JSON.parse(eventArgs.response);
        let quote = 1;
        for (let resource of response.list.resources) {
            if (anInformationHolder.convertToCurrency === resource.resource.fields.symbol.substring(0, 3)) {
                quote = resource.resource.fields.price;
                anInformationHolder.setConversionQuote("USD", quote);
                break;
            }
        }
        let mruFound = false;
        let stnFound = false;
        let mroQuote = 0;
        let stdQuote = 0;
        for (let resource of response.list.resources) {
            const symbol = resource.resource.fields.symbol.substring(0, 3);
            if (symbol === "MRU") {
                mruFound = true;
            }
            if (symbol === "STN") {
                stnFound = true;
            }
            const price = resource.resource.fields.price;
            anInformationHolder.setConversionQuote(symbol, quote / price);
            if (symbol === "MRO") {
                mroQuote = quote / price;
            }
            else if (symbol === "STD") {
                stdQuote = quote / price;
            }

        }

        // Workaround for missing MRU and STN
        if (!mruFound) {
            anInformationHolder.setConversionQuote("MRU", mroQuote * 10);
        }
        if (!stnFound) {
            anInformationHolder.setConversionQuote("STN", stdQuote * 1000);
        }

        eventAggregator.publish("quotesParsed");
    });


    const loadQuotes = (aYahooQuotesService) => {
        const urlString = "https://finance.yahoo.com/webservice/v1/symbols/allcurrencies/quote?format=json";
        aYahooQuotesService.fetchQuotes(urlString, "Yahoo");
    };
    return {
        loadQuotes: loadQuotes
    };
};

if (typeof exports === "object") {
    exports.YahooQuotesServiceProvider = YahooQuotesServiceProvider;
}


