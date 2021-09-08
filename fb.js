const helpers = require('./helpers/helpers')
const discovery = require('./discovery')
const https = require('https');
const fields = require('./fields');
/**
 * Get request to Facebook API
 * @param {string} urlPath 
 * URL path for request. Must start with api version ex: /v11.0/..
 * @param {Object} params Query parameters as key value pairs. 
 * Check the documentation https://developers.facebook.com/docs/instagram for valid key value pairs
 * @param {string} params.fields Comma separated list of fields and edges to be returned
 * @param {string} params.access_token Facebook API access token
 * @return {Promise<Object,Error>} Promise to the request response
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
 * 
 * @typedef PostChildren 
 * @property {DiscoveryPosts[]} data Array with posts children
 */

/**
 * 
 * @typedef DiscoveryPosts 
 * @property {string} timestamp Date when posts was posted 
 * @property {string} caption Post caption  
 * @property {string} media_type Post type (CAROUSEL_ALBUM, IMAGE, or VIDEO)
 * @property {string} media_url video or image URL
 * @property {PostChildren} children Post's children 
 * @property {string} id Post ID
 */

/** 
 * Business discovery request for Facebook API
 * @param {string} urlPath 
 * URL path for request. Must start with api version ex: /v11.0/..
 * @param {Object} fields Object with the following properties: userName,startDate,endDate
 * @param {string} fields.userName The userName of the instagram account to query (required)
 * @param {string} fields.startDate Start date of request in ISO Layout 'YYYY-MM-DD'
 * @param {string} fields.endDate End date of request in ISO Layout 'YYYY-MM-DD'
 * @param {string} token Facebook API access token
 * @param {Array} posts Array to append results to
 * @returns {Promise<DiscoveryPosts[],Error>} Promise to the request response
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
 * Get request to Facebook API reading paginated results.
 * Results will be read until no more 'next' cursor is returned in response
 * @param {string} urlPath 
 * URL path for request. Must start with api version ex: /v11.0/..
 * @param {string} params Query parameters as key value pairs. 
 * Check the documentation https://developers.facebook.com/docs/instagram for valid key value pairs
 * @returns {Promise<Object[],Error>} Promise to the request response
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
 * @typedef Children
 * @property {Post[]} data Array with Post's children
 */

/**
 * 
 * @typedef Post
 * @property {string} id Post ID
 * @property {string} timestamp Date 
 * @property {string} caption Post caption
 * @property {string} media_type Post type (CAROUSEL_ALBUM, IMAGE, or VIDEO)
 * @property {string} media_url video or image URL
 * @property {number} comments_count Comment counts on the post
 * @property {number} like_count Like counts on the post
 * @property {number} impressions Number of times post has been seen
 * @property {number} engagement Sum of likes_count, comment_count and saved counts on post
 * @property {Object} insights Social interaction metrics on the post
 * @property {Children} children Post's children 
 */

/**
 * Returns post caption,media_type,media_url,children,media_url,comment_count,like_count, and impressions 
 * from an Instagram post. Ex. '/v11.0/12437548796' would request post content for post with Id 12437548796
 * @param {string} urlPath URL path for request. Must start with api version and end with post ID
 * ex: '/v11.0/12341234' where 12341234 is the post ID you want to query
 * @param {string} token Facebook API access token
 * @returns {Promise<Post,Error>} Promise object represents request payload
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
    f.setItem('insights.metric(impressions,engagement)');
    return f;
}

/**
 * 
 * @typedef Metrics
 * @property {number} reach Number of unique users ho have viewed at least one post from the Instagram user
 * @property {number} impressions Number of times posts from the Instagram user have been seen
 * @property {number} follower_count Sum of new followers within the specified range
 */

/**
 * Returns reach,impressions,and follower_count metrics of an instagram profile
 * aggregated over a time range from n days ago up to current date
 * @param {string} urlPath URL path for request. Must start with api version, 
 * then indicate Instagram user ID you want to query, and end with 'insights' path. Ex: '/v11.0/123412345/insights'
 * where 123412345 is the Instagram user Id
 * @param {string} token access token for Facebook API
 * @param {Number} daysAgo Number of days you want to query. Ex 2 means you want to query insights from 2 days ago till today
 * @returns {Promise<Metrics|Error>} Promise object represents request payload
 */
function GetDailyInsights(urlPath,token,daysAgo){
    return new Promise(function(resolve,reject){
        try{
            const dates = helpers.getDates(daysAgo)
            const params = {
                'metric':'impressions,reach,follower_count',
                'period':'day',
                'since': dates.startDate,
                'until': dates.endDate,
                'access_token':token
            }
            resolve(
                GetAll(urlPath,params).then((results)=>{
                    return helpers.aggregateDailyMetrics(results);
                }).catch((err)=>{
                    throw (err)
                })
            )
        }catch(e){
            reject(e)
        }
    })
}

/**
 * Returns countries and cities for Instagram user followers
 * @param {string} urlPath URL path for request. Must start with api version. 
 * then indicate Instagram user ID you want to query, and end with 'insights' path. Ex: '/v11.0/123412345/insights'
 * where 123412345 is the Instagram user Id
 * @param {string} token access token for Facebook API
 * @returns {Promise<Array,Error>} Promise object represents request payload
 */
function GetLifetimeInsights(urlPath,token){
    return new Promise(function(resolve,reject){
        try{
            const params = {
                'metric':'audience_country,audience_city',
                'period':'lifetime',
                'access_token':token
            }
            resolve(
                GetAll(urlPath,params).then((results)=>{
                    return results
                }).catch((err)=>{
                    throw (err)
                })
            )
        }catch(e){
            reject(e)
        }
    })
}


/** 
 * Returns posts for Instagram user using business dicovery since 'daysAgo' till current date
 * @param {string} urlPath 
 * URL path for request. Must start with api version ex: /v11.0/..
 * @param {string} userName The userName of the instagram account to query (required)
 * @param {number} daysAgo  Number of days you want to query. Ex 2 means you want to query posts from 2 days ago till today
 * @param {string} token Facebook API access token
 * @returns {Promise<DiscoveryPosts[],Error>} Promise to the request response
*/
function DiscoverUserPosts(urlPath,userName,daysAgo,token){
    return new Promise(function(resolve,reject){
        try{
            const dates = helpers.getDateRange(daysAgo);
            const fields ={
                userName: userName,
                startDate: dates.startDate,
                endDate: dates.endDate,
            }
            let posts =[];
            resolve(DiscoverPosts(urlPath,fields,token,posts));
        }catch(e){
            reject(e)
        }
    });
}

module.exports = {
    Get: Get,
    Discover: DiscoverPosts,
    GetAll: GetAll,
    GetPost: GetPostContent,
    GetInsights: GetDailyInsights,
    GetAudiences: GetLifetimeInsights,
    DiscoverUserPosts: DiscoverUserPosts,
}