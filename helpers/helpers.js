const url = require('url');

/**
 * Takes URL object and creates options object for http request
 * @param {url} requestUrl 
 * URL object
 * @returns {object}
 * options object for http.request with method,hostname, and path
 */
function formatRequestOptions(requestUrl){
    return {
        method: 'GET',
        hostname: requestUrl.hostname,
        path: requestUrl.pathname+requestUrl.search
    }
}

/**
 * buildURL takes a url path and params (key value map) to build a url object
 * @param {string} urlPath 
 * url path for request. Must start with api version ex: /v11.0/...
 * @param {map} params 
 * query parameters as key value pais
 * @returns {url} 
 * The encoded url with query params
 */
function buildURL(urlPath,params){
    if (!isString(urlPath)){
         throw new Error('urlPath is required and must be string');
    }
    if (!hasVersionPrefix(urlPath)){
        throw new Error('Path must start with api version: /v[0-9]+.[0-9]/');
    }
    return new URL(url.format({
        protocol: 'https',
        hostname: 'graph.facebook.com',
        pathname: urlPath,
        query: params,
    }).toString());
}

function hasVersionPrefix(urlPath){
    const regex = new RegExp("^(\/v[0-9]+\.[0-9]\/)")
    return regex.test(urlPath)
}

function isString(value) {
    return typeof value === 'string' || value instanceof String;
}

module.exports = {
    buildURL: buildURL,
    formatRequestOptions: formatRequestOptions
}