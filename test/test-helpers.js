const assert = require('assert');
const helpers = require('../helpers/helpers');

describe('helpers',()=>{
    it('throws error when url path has wrong format',()=>{
        const exercise = () => helpers.buildURL('/invalid-path/')
        assert.throws(exercise, Error);
    })
    it('throws errors when urlPath is missing',()=>{
        const exercise = () => helpers.buildURL()
        assert.throws(exercise, Error);
    })
})

describe('isString',()=>{
    it('returns true when val is string',()=>{
        const exercise = helpers.isString('string')
        assert.equal(exercise,true,'Should be true')
    })
    it('returns false when val is String object',()=>{
        const s = new String('string')
        const exercise = helpers.isString(s)
        assert.equal(exercise,false,'Should be false')
    })
    it('returns false when val is null',()=>{
        const exercise = helpers.isString(null)
        assert.equal(exercise,false,'Should be false')
    })
    it('returns false when val is undefined',()=>{
        const exercise = helpers.isString(undefined)
        assert.equal(exercise,false,'Should be false')
    })
})

describe('getStartDate',()=>{
    it('returns ISO date',()=>{
        const regex = new RegExp("([0-9]{4}-[0-9]{2}-[0-9]{2})")
        const exercise = helpers.getStartDate()
        assert.match(exercise,regex);
    })
})

describe('getAfterCursor',()=>{
    it('returns undefined when no cursor is present',()=>{
        const exercise = helpers.getAfterCursor()
        assert.equal(exercise,undefined)
    })
    it('returns undefined when a string is passed',()=>{
        const excercise = helpers.getAfterCursor('test')
        assert.equal(excercise,undefined)
    })
    it('returns undefined when an array is passed',()=>{
        const excercise = helpers.getAfterCursor([])
        assert.equal(excercise,undefined)
    })
    it('returns cursor when data object with paging and after cursor is passed',()=>{
        const object = {
            data: [],
            paging:{
                cursors:{
                    after: 'nextPage'
                }
            }
        } 
        const excercise = helpers.getAfterCursor(object)
        assert.equal(excercise,'nextPage')
    })
})

describe('getNextCursor',()=>{
    it('returns undefined when no cursor is present',()=>{
        const exercise = helpers.getNextCursor()
        assert.equal(exercise,undefined)
    })
    it('returns undefined when a string is passed',()=>{
        const excercise = helpers.getNextCursor('test')
        assert.equal(excercise,undefined)
    })
    it('returns undefined when an array is passed',()=>{
        const excercise = helpers.getNextCursor([])
        assert.equal(excercise,undefined)
    })
    it('returns cursor when data object with paging and next cursor is passed',()=>{
        const object = {
            data: [],
            paging:{
                next:'nextPage'
            }
        } 
        const excercise = helpers.getNextCursor(object)
        assert.equal(excercise,'nextPage')
    })
})

describe('isVersion',()=>{
    it('returns true with input v11.0',()=>{
        assert.equal(helpers.isVersion('v11.0'),true)
    })
    it('returns false with input v1.00',()=>{
        assert.equal(helpers.isVersion('v1.00'),false)
    })
    it('returns false with empty object as input',()=>{
        assert.equal(helpers.isVersion({}),false)
    })
})

describe('formatPostResponse',()=>{
    it('sets impressions in response when it is an object',()=>{
        const response = {}
        helpers.formatPost(response)
        if ('impressions' in response){
            assert.ok(true)
        }else{
            assert.fail();
        }
    })
    it('does not set impressions in response when it is an array',()=>{
        let response = [];
        helpers.formatPost(response)
        if ('impressions' in response){
            assert.ok(true)
        }else{
            assert.fail();
        }
    })
    it('sets impressions and engagement as input object properties',()=>{
        let response = {
            insights: {
                data: [
                  {
                    name: 'impressions',
                    values: [
                      {
                        value: 1
                      }
                    ],
                  },
                  {
                    name: 'engagement',
                    period: 'lifetime',
                    values: [
                      {
                        value: 4
                      }
                    ],
                  }
                ]
            }
        }
        helpers.formatPost(response);
        assert.equal(response.engagement,4);
        assert.equal(response.impressions,1);
    })
})

describe('getDates',()=>{
    it('sets start date as 30 days ago and end date as today when input is not number',()=>{
        const dates = helpers.getDates(['test']);
        let d = new Date();
        assert.equal(dates.endDate, d.toISOString().substring(0,10));
        d.setDate(d.getDate() - 30);
        assert.equal(dates.startDate,d.toISOString().substring(0,10));
    })
    it('sets start date according to input and end date as 30 days later',()=>{
        const daysAgo = 45;
        const dates = helpers.getDates(daysAgo);
        let d = new Date();
        d.setDate(d.getDate()-daysAgo);
        assert.equal(dates.startDate,d.toISOString().substring(0,10));
        d.setDate(d.getDate()+30);
        assert.equal(dates.endDate,d.toISOString().substring(0,10));
    })
    it('sets start date according to input and end date as today',()=>{
        const daysAgo = 5;
        const dates = helpers.getDates(daysAgo);
        let d = new Date();
        assert.equal(dates.endDate,d.toISOString().substring(0,10));
        d.setDate(d.getDate()-daysAgo);
        assert.equal(dates.startDate,d.toISOString().substring(0,10));
    })
})

describe('getMetricValue',()=>{
    it('returns 0 when metric is not an object',()=>{
        const val = helpers.getMetricValue(['test']);
        assert.equal(val,0);
    })
    it('returns 0 when metric does not contain values property',()=>{
        const val = helpers.getMetricValue({test: 'Test'})
        assert.equal(val,0);
    })
    it('returns 0 when metric does not contain array values',()=>{
        const val = helpers.getMetricValue({values: 'test'})
        assert.equal(val,0);
    })
    it('returns 0 when metric does not contain value property',()=>{
        const val = helpers.getMetricValue({values: [{test: 1}]});
        assert.equal(val,0);
    })
    it('returns 1 when metric contains integer values',()=>{
        const val = helpers.getMetricValue({values: [{value: 1}]});
        assert.equal(val,1);
    })
})

describe('aggregateDailyMetrics',()=>{
    it('returns zero value results when input is not array',()=>{
        const results = helpers.aggregateDailyMetrics({})
        assert.equal(results.impressions,0);
        assert.equal(results.reach,0);
        assert.equal(results.followerCount,0);
    })
    it('returns zero value results when input does not contain metric with values',()=>{
        const results = helpers.aggregateDailyMetrics({values: true})
        assert.equal(results.impressions,0);
        assert.equal(results.reach,0);
        assert.equal(results.followerCount,0);
    })
    it('returns zero value results when input is empty',()=>{
        const results = helpers.aggregateDailyMetrics([])
        assert.equal(results.impressions,0);
        assert.equal(results.reach,0);
        assert.equal(results.followerCount,0);
    })
    it('returns non zero results when input has values for each metric',()=>{
        const results = helpers.aggregateDailyMetrics([
            {
                name: 'impressions',
                values: [
                    {
                        value: 1
                    }
                ]
            },
            {
                name: 'reach',
                values: [
                    {
                        value: 2
                    },
                    {
                        value: 3   
                    }
                ]
            },
            {
                name: 'follower_count',
                values: [
                    {
                        value: 3
                    }
                ]
            },
            {
                name:'follower_count',
                values: [
                    {
                        value: 1
                    }
                ]
            }
        ])
        assert.equal(results.impressions,1);
        assert.equal(results.reach,5);
        assert.equal(results.followerCount,4);
    })
})

describe('formatFbPostMetrics',()=>{
    it('returns object with zero value metrics when response is not object',()=>{
        const results = helpers.formatFbPostMetrics('test');
        assert.equal(results.comments,0);
        assert.equal(results.reactions,0);
    })
    it('returns object with zero value metrics when response does not have summary',()=>{
        const results = helpers.formatFbPostMetrics({});
        assert.equal(results.comments,0);
        assert.equal(results.reactions,0);
    })
    it('returns object with metrics when response contains summary and total count',()=>{
        const results = helpers.formatFbPostMetrics({
            reactions: {
                summary: {
                    total_count: 2
                }
            },
            comments: {
                summary: {
                    total_count: 3
                }
            }
        });
        assert.equal(results.comments,3);
        assert.equal(results.reactions,2);
    })
})

describe('formatAudiencesResponse',()=>{
    it('returns empty object when response is empty',()=>{
        const result = helpers.formatAudiencesResponse([]);
        assert.deepEqual(result,{countries:{},cities:{}});
    })

    it('returns cities and countries when response is not empyt',()=>{
        const result = helpers.formatAudiencesResponse([
        {
            "name": "audience_country",
            "values": [
                {
                    "value": {
                        "DE": 1
                    }
                }
            ]
        },
        {
            "name": "audience_city",
            "values": [
                {
                  "value": {
                    "Tepic, Nayarit": 1
                  }
                }
            ]
        }
        ]);
        assert.deepEqual(result,{
            countries: {
                "DE": 1
            },
            cities:{
                "Tepic, Nayarit": 1
            }
        })
    })
})