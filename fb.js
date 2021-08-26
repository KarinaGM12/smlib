const helpers = require('./helpers/helpers')
const https = require('https');
const { type } = require('os');
const { formatRequestOptions } = require('./helpers/helpers');

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

function DiscoverPosts(urlPath, params,posts){
    // let posts = [];
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
                // if (data.business_discovery){
                //     if (data.business_discovery.media.data){
                       
                //         posts = [...posts, ...data.business_discovery.media.data];
                //         const after = getAfterCursor(data.business_discovery.media)
                //         if (after){
                //             console.log('enter')
                //             params.fields='business_discovery.username(esmuellert){media.since(2021-05-01).until(2021-06-30).after('+after.toString()+').limit(5){timestamp}}'
                //             DiscoverPosts(urlPath,params).then((data)=>{
                //                 posts = [...posts,...data]
                //                 resolve(posts)
                //             }).catch((err)=>{
                //                 reject(err)
                //             })
                //         }
                //     }
                // }
                //console.log(posts)
                resolve(data);
            });
        });
        req.on('error', function(err) {
            reject(err);
        });
        req.end();
    }).then((data) =>{
        if(data){
            if (data.business_discovery){
                if (data.business_discovery.media){
                    if (data.business_discovery.media.data){
                        posts = [...posts, ...data.business_discovery.media.data];
                        //console.log(posts)
                        const after = getAfterCursor(data.business_discovery.media)
                        if (after){
                            console.log('tried');
                            params.fields='business_discovery.username(esmuellert){media.since(2021-05-01).until(2021-06-30).after('+after.toString()+').limit(5){timestamp}}'
                            return DiscoverPosts(urlPath,params, posts)
                        }
                        return posts
                    }
                }
            }
        }
        return undefined
    }).catch((err)=>{
        return err
    })
}

function getAfterCursor(object){
    if ('data' in object && 'paging' in object){
        if ('cursors' in object.paging){
            if ('after' in object.paging.cursors){
                return object.paging.cursors.after;
            }
        }
    }
}
module.exports = {
    Get: Get,
    Discovery: DiscoverPosts
}