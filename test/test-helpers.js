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
