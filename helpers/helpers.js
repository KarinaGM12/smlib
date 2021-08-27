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

/**
 * Function to verify if value is string. 
 * @param {any} val 
 * @returns {boolean} True if string, false otherwise.
 * Note: String objects will not be counted as string
 */
function isString(val){
    return typeof val ==='string';
}

/**
 * This function computes the ISO date for 15 days ago from current date
 * @returns {string} Date from 15 days ago with ISO layout 'YYYY-MM-DD'
 */
 function getStartDate(){
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 15);
    return startDate.toISOString();
}

/**
 * Returns the value for 'after' cursos if object has cursor based pagination
 * @param {object} object 
 * @returns {string} Value for 'after' cursor 
 */
function getAfterCursor(object){
    if(typeof object === 'object'){
        if ('data' in object && 'paging' in object){
            if ('cursors' in object.paging){
                if ('after' in object.paging.cursors){
                    return object.paging.cursors.after;
                }
            }
        }
    }
}

module.exports = {
    buildURL: buildURL,
    formatRequestOptions: formatRequestOptions,
    isString: isString,
    getStartDate: getStartDate,
    getAfterCursor: getAfterCursor
}