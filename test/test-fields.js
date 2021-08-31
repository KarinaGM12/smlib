const fields = require('../fields');
const assert = require('assert');

describe('Fields',()=>{
    it('returns fields object with empty map',()=>{
        const obj = new fields.Fields();
        assert.equal(obj.fields.size,0);
    })
})

describe('setItem',()=>{
    it('adds item to set',()=>{
        const obj = new fields.Fields();
        obj.setItem('test');
        assert.equal(obj.fields.has('test'),true);
    })
})

describe('getAsString',()=>{
    it('returns field values as string',()=>{
        const obj = new fields.Fields();
        obj.setItem('t1');
        obj.setItem('t2');
        assert.equal(obj.getAsString(),'t1,t2');
    })
    it('returns an empty string when no fields are present',()=>{
        const obj = new fields.Fields();
        assert.equal(obj.getAsString(),'');
    })
})