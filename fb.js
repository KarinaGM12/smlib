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

module.exports = {
    Get: Get
}