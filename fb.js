const helpers = require('./helpers/helpers')
const https = require('https');

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
        const options = helpers.formatRequestOptions(helpers.buildURL(urlPath,params));
        const req = https.request(options,(res)=>{
            let data = [];
            res.on('data', (chunk)=> {
                data.push(chunk);
            });
            res.on('error',(err)=>{
                reject(err)
            })
            res.on('end', ()=> {
                try {
                    data = JSON.parse(Buffer.concat(data).toString());
                } catch(e) {
                    reject(e);
                }
                if (res.statusCode < 200 || res.statusCode >=400){
                    reject(data);
                }
                resolve(data);
            });
        });
        req.on('error', function(err) {
            reject(err);
        });
        req.end();
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
    const params = {
        'fields':builDiscoveryFields(fields.userName,fields.startDate,fields.endDate,fields.after),
        'access_token':token
    }
    
    return Get(urlPath,params).then((data)=>{
        if(data){
            if (data.business_discovery && data.business_discovery.media && data.business_discovery.media.data){
                posts = [...posts, ...data.business_discovery.media.data];
                const after = helpers.getAfterCursor(data.business_discovery.media)
                if (after){
                    fields.after = after
                    return DiscoverPosts(urlPath,fields, token,posts)
                }
                return posts
            }
        }
        return []
    }).catch((err)=>{
        return err
    })
}

/**
 * This function build query 'fields' parameter for business_discovery request
 * @param {string} userName he userName of the instagram account to query (required)
 * @param {string} startDate Start date of request in ISO Layout 'YYYY-MM-DD'
 * @param {string} endDate End date of request in ISO Layout 'YYYY-MM-DD
 * @param {string} after Cursor value for following page in cursor based pagination
 * @returns {string} Request query parameter 'fields' as string
 */
function builDiscoveryFields(userName,startDate,endDate,after){
    let fields = ''
    fields+=(helpers.isString(userName)?`business_discovery.username(${ userName }){media`:'');
    fields+=(helpers.isString(startDate)?`.since(${startDate})`:`.since(${helpers.getStartDate()})`);
    fields+=(helpers.isString(endDate)?`.until(${endDate})`:'');
    fields+=(helpers.isString(after)?`.after(${after})`:'');
    fields+=(fields.length > 0?'{timestamp,caption,media_type,children{media_url}}}':'');
    return fields
} 

module.exports = {
    Get: Get,
    Discovery: DiscoverPosts
}