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
 * Returns the value for 'after' cursor if object has cursor based pagination
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

/**
 * Returns the value for 'next' cursor if object has pagination
 * @param {object} object 
 * @returns Value for 'next' cursor if any, otherwise undefined
 */
function getNextCursor(object){
    if (typeof object === 'object'){
        if('data' in object && 'paging' in object){
            if('next' in object.paging){
                return object.paging.next;
            }
        }
    }
}

/**
 * Verifies wether or not input is a valid version value for Facebook Graph API
 * @param {string} version
 * @returns {boolean} true if it is a valid version (ex. 'v11.0') and false otherwise
 */
function isVersion(version){
    if(isString(version)){
        const regex = new RegExp("^(v[0-9]+\.[0-9])$");
        return regex.test(version);
    }
    return false;
}

/**
 * Formats response from post request so
 * impressions is a property of response object
 * @param {object} response Response from post request
 */
function formatPostResponse(response){
    let impressions = 0;
    let engagement = 0;
    if (typeof response === 'object'){
        if ('insights' in response){
            if ('data' in response.insights){
                const data = response.insights.data;
                if (data.length > 0){
                    data.forEach((metric)=>{
                        const value = getMetricValue(metric)
                        switch (metric.name){
                            case 'impressions':
                                impressions = value;
                                break;
                            case 'engagement':
                                engagement = value;
                                break;
                        }
                    })
                } 
           }
        }
        response.impressions = impressions;
        response.engagement = engagement;
    }
}

/**
 * Returns object with properties startDate and endDate as ISO date strings.
 * Start date is numberOfDays ago from current date and end date is at most 30 
 * days after start date
 * @param {Number} numberOfDays Number of days ago to set start date
 * @returns object with start date (n days ago) and end date
 */
function getDates(numberOfDays){
    const daysAgo = (Number.isInteger(numberOfDays)?numberOfDays:30);
    const daysAfterStart = (daysAgo > 30? 30:daysAgo);

    let start = new Date();
    start.setDate(start.getDate()-daysAgo);
    const startDate = start.toISOString();
    start.setDate(start.getDate()+daysAfterStart);
    const endDate = start.toISOString();
    
    return {
        startDate: startDate.substring(0,10),
        endDate: endDate.substring(0,10),
    }

}

/**
 * Returns aggregate for daily values in metric object
 * @param {object} metric Object with daily values
 * @returns {number} aggregated metric value
 */
function getMetricValue(metric){
    let value = 0;
    if (typeof metric === 'object'){
        if ('values' in metric && Array.isArray(metric.values)){
            metric.values.forEach((val)=>{
                if (Number.isInteger(val.value)){
                    value += val.value;
                }
            })
        }
    }
    return value
}

/**
 * Aggregates values for impressions,reach, and follower_count metrics in results
 * @param {array} results Array containing metric object 
 * @returns {object} Returns object with aggregated metrics
 */
function aggregateDailyMetrics(results){
    const metrics = {
        impressions: 0,
        reach: 0,
        followerCount: 0
    }
    if (results && Array.isArray(results)){
        results.forEach((metric)=>{
            if (typeof metric === 'object'){
                const value = getMetricValue(metric)
                switch (metric.name){
                    case 'impressions':
                        metrics.impressions += value;
                        break;
                    case 'reach':
                        metrics.reach += value;
                        break;
                    case 'follower_count':
                        metrics.followerCount += value;
                        break;
                }
            }
        })
    }
    return metrics
}

function getDateRange(numberOfDays){
    const daysAgo = (Number.isInteger(numberOfDays));
    let start = new Date();
    const endDate = start.toISOString();
    start.setDate(start.getDate()-daysAgo);
    const startDate = start.toISOString();
    return {
        startDate: startDate.substring(0,10),
        endDate: endDate.substring(0,10)
    }
}

module.exports = {
    buildURL: buildURL,
    formatRequestOptions: formatRequestOptions,
    isString: isString,
    getStartDate: getStartDate,
    getAfterCursor: getAfterCursor,
    getNextCursor: getNextCursor,
    isVersion: isVersion,
    formatPost: formatPostResponse,
    getDates:getDates,
    getMetricValue: getMetricValue,
    aggregateDailyMetrics: aggregateDailyMetrics,
    getDateRange: getDateRange,

}