const helpers = require('./helpers/helpers')
const discovery = require('./discovery')
const https = require('https');
const fields = require('./fields');
/**
 * Get request to facebook API
 * @param {string} urlPath 
 * url path for request. Must start with api version ex: /v11.0/..
 * @param {string} params 
 * query parameters as key value pais
 * @returns {Promise} Promise object represents request payload
 * 
 */
const Get = function (urlPath, params){
    return new Promise(function(resolve,reject){
        try{
            const options = helpers.formatRequestOptions(helpers.buildURL(urlPath,params));
            let results = [];
            resolve(getRequest(options,results))
        }catch(e){
            reject(e);
        }
        
    });
}

/** 
 * Business discovery request for facebook API
 * @param {string} urlPath 
 * url path for request. Must start with api version ex: /v11.0/..
 * @param {Object} fields object with the following string properties: userName,startDate,endDate,after
 * @param {string} fields.userName The userName of the instagram account to query (required)
 * @param {string} fields.startDate Start date of request in ISO Layout 'YYYY-MM-DD'
 * @param {string} fields.endDate End date of request in ISO Layout 'YYYY-MM-DD'
 * @param {string} token Facebook graph API token
 * @param {Array} posts Array to append results to
 * @returns {Promise} Promise object represents request payload
*/
function DiscoverPosts(urlPath, fields, token,posts){
    
    const reqFields = new discovery.DiscoveryFields(fields);
    const params = {
        'fields':reqFields.format(),
        'access_token':token
    }    

    return Get(urlPath,params).then((data)=>{
        if(data){
            if (data.business_discovery && data.business_discovery.media && data.business_discovery.media.data){
                posts = [...posts, ...data.business_discovery.media.data];
                const after = helpers.getAfterCursor(data.business_discovery.media)
                if (after){
                    reqFields.setAfter(after)
                    return DiscoverPosts(urlPath,reqFields, token,posts)
                }
                return posts
            }
        }
        return []
    }).catch((err)=>{
        throw (err)
    })
}

/**
 * 
 * Get request to facebook API reading paginated results.
 * Results will be read until no more 'next' cursor is returned in response
 * @param {string} urlPath 
 * url path for request. Must start with api version ex: /v11.0/..
 * @param {string} params 
 * query parameters as key value pais
 * @returns {Promise} Promise object represents request payload
 */
function GetAll(urlPath,params){
    let results = [];
    return Get(urlPath,params).then((data)=>{
        if(data){
            if ('data' in data){
                results = [...results,...data.data];
                const next = helpers.getNextCursor(data);
                if (next){
                    return getAll(next,results);
                }
                return results;
            }
            return data;
        }
        return [];
    }).catch((err)=>{
        throw(err);
    })
}

function getAll(url,results){
    return getRequest(url).then((data)=>{
        if(data){
            if ('data' in data){
                results = [...results,...data.data];
                const next = helpers.getNextCursor(data); 
                if (next){
                    return getAll(next,results);
                }
            }
        }
        return results;
    }).catch((err)=>{
        throw (err);
    })
}

function getRequest(urlParams){
    return new Promise(function(resolve,reject){
        const req = https.request(urlParams,(res) =>{
            let data = [];
            res.on('data',(chunk)=>{
                data.push(chunk);
            });
            res.on('error',(err)=>{
                reject(err);
            });
            res.on('end',()=>{
                try{
                    data = JSON.parse(Buffer.concat(data).toString());
                }catch(e){
                    reject(e);
                }
                if (res.statusCode < 200 || res.statusCode >=400){
                    reject(data);
                }
                resolve(data);
            });
        });
        req.on('error',function(err){
            reject(err);
        });
        req.end();
    });
}

/**
 * GetPostContent gets caption,media_type,media_url,childrens media_url,comment_count,like_count, and impressions 
 * from an Instagram post.  (ex '/v11.0/12437548796'
 * woule request post content for post with Id 12437548796)
 * @param {string} urlPath url path for request. Must start with api version ex: '/v11.0/123412341234'
 * where 12341234 represents the post you want to query
 * @param {string} token Facebook graph API token
 * @returns {Promise} Promise object represents request payload
 */
function GetPostContent(urlPath,token){
    const fieldsSet = getPostFields();
    return new Promise(function(resolve, reject){
        try{
            const params = {
                'fields':fieldsSet.getAsString(),
                'access_token':token
            }
            resolve(
                Get(urlPath,params).then((response)=>{
                    if(response){
                        helpers.formatPost(response)
                        return response;
                    }
                    return {};
                }).catch((err)=>{
                    throw(err);
                })
            )
        }catch(e){
            reject(e);
        }
    })
}

function getPostFields(){
    const f = new fields.Fields();
    f.setItem('timestamp');
    f.setItem('caption');
    f.setItem('media_type');
    f.setItem('media_url');
    f.setItem('children{media_url}');
    f.setItem('comments_count');
    f.setItem('like_count');
    f.setItem('insights.metric(impressions)');
    return f;
}

function GetDailyInsights(urlPath,token,daysAgo){
    return new Promise(function(resolve,reject){
        try{
            const dates = helpers.getDates(daysAgo)
            const params = {
                'metric':'impressions,reach',
                'period':'day',
                'since': dates.startDate,
                'until': dates.endDate,
                'access_token':token
            }
            resolve(
                GetAll(urlPath,params).then((results)=>{
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
                    return metrics;
                }).catch((err)=>{
                    throw (err)
                })
            )
        }catch(e){
            reject(e)
        }
    })
}

function getMetricValue(metric){
    let value = 0;
    if (typeof metric === 'object'){
        if ('values' in metric && Array.isArray(metric.values)){
            metric.values.forEach((val)=>{
                value += val.value;
            })
        }
    }
    return value
}



module.exports = {
    Get: Get,
    Discover: DiscoverPosts,
    GetAll: GetAll,
    GetPost: GetPostContent,
    GetInsights: GetDailyInsights,
}