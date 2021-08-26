const assert = require('assert');
const fb = require('../fb');


describe('Get', () => {
  it('returns error when calling with empty values', async () => {
    fb.Get().then(()=>{
      assert.fail()
    }).catch((err)=>{
      assert.ok(true);
    })
  });
});
