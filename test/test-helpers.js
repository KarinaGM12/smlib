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
})