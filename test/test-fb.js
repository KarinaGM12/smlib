const assert = require('assert');
const fb = require('../fb');
const nock = require('nock')

//Mock responses for Get tests
const scope = nock('https://graph.facebook.com')
  .get('/v11.0/109012242885489?fields=instagram_business_account%7Bname%7D&access_token=test')
  .reply(200,{
    "instagram_business_account": {
      "name": "test",
      "id": "13269676367939291"
    },
    "id": "109012242885489"
  })
scope.get('/v11.0/109012242885489?fields=instagram_business_account%7Bname%7D&access_token=test')
.reply(400,{
  "error": {
    "code": 190,
    "error_subcode": 463,
    "fbtrace_id": "AosjzQsOBpjsgG9z8ELUi4x",
    "message": "Error validating access token: Session has expired.",
    "type": "OAuthException"
  }
})

//Mock responses for Discover test
scope.get('/v11.0/13269676367939291?fields=business_discovery.username(esmuellert)%7Bmedia.since(2021-06-29).until(2021-06-30)%7Btimestamp%2Ccaption%2Cmedia_type%2Cmedia_url%2Cchildren%7Bmedia_url%7D%7D%7D&access_token=testtoken')
.reply(200,{
  "business_discovery": {
    "media": {
      "data": [
        {
          "timestamp": "2021-06-14T19:59:24+0000",
          "media_type": "CAROUSEL_ALBUM",
          "id": "13269600263609466"
        },
        {
          "timestamp": "2021-06-11T17:07:21+0000",
          "media_type": "VIDEO",
          "id": "13269600263609466"
        }
      ],
      "paging": {
        "cursors": {
          "after": "QVFIUllyRnBUWnVrLWNWemF0LVY2MGJtTFdEMmtVVF96WlFFM3FraGI1LXdzWUs5QmxVbkNGQmRRWHdNcTFRdWNqZAzlGSll6d2t4V1NVbkpvTnBOODducDZAn"
        }
      }
    },
    "id": "13269600263609466"
  },
  "id": "13269676367939291"
}).get('/v11.0/13269676367939291?fields=business_discovery.username(esmuellert)%7Bmedia.since(2021-06-29).until(2021-06-30).after(QVFIUllyRnBUWnVrLWNWemF0LVY2MGJtTFdEMmtVVF96WlFFM3FraGI1LXdzWUs5QmxVbkNGQmRRWHdNcTFRdWNqZAzlGSll6d2t4V1NVbkpvTnBOODducDZAn)%7Btimestamp%2Ccaption%2Cmedia_type%2Cmedia_url%2Cchildren%7Bmedia_url%7D%7D%7D&access_token=testtoken')
.reply(200,{
  "business_discovery": {
    "media": {
      "data": [
        {
          "timestamp": "2021-08-02T14:38:00+0000",
          "media_type": "VIDEO",
          "id": "13269600263609466"
        }
      ]
    },
    "id": "13269600263609466"
  },
  "id": "13269676367939291"
})

//Mock responses for GetPost test
scope.get('/v11.0/13191417006330209?fields=timestamp%2Ccaption%2Cmedia_type%2Cmedia_url%2Cchildren%7Bmedia_url%7D%2Ccomments_count%2Clike_count%2Cinsights.metric(impressions%2Cengagement)&access_token=testtoken')
.reply(200,{
    timestamp: '2021-08-28T19:55:11+0000',
    caption: 'Orange',
    media_type: 'IMAGE',
    media_url: 'https://scontent-qro1-3.cdninstagram.com/v/t51.29350-15/240721311_274360604191304_3264872005916855885_n.jpg?_nc_cat=111&ccb=1-5&_nc_sid=8ae9d6&_nc_ohc=OYrjP4qdXOkAX8arD2o&_nc_ht=scontent-qro1-2.cdninstagram.com&edm=AEQ6tj4EAAAA&oh=b6c814949db790ea08c75326ebc88164&oe=61343868',
    comments_count: 3,
    like_count: 1,
    insights: { data: [ 
      {name: "impressions",period: "lifetime",values: [{value: 1}],title: "Impressions"},
      {name: "engagement",period: "lifetime",values: [{value: 4}],title: "Engagement"} 
    ]},
    id: '13191417006330209',
})

//Mock response for GetAudiences test
scope.get('/v11.0/17269676367939291/insights?metric=audience_country%2Caudience_city&period=lifetime&access_token=testtoken')
.reply(200,{
  "data": [
  ]
})

//Mock responses for GetAll test
scope.get('/v11.0/123412341234/media?fields=timestamp%2Ccaption%2Cmedia_type%2Cchildren%7Bmedia_url%7D&access_token=testtoken')
.reply(200,{
  "data": [
    {
      value: 1
    }
  ],
  "paging": {
    "next": "https://graph.facebook.com/v11.0/123412341234/media?fields=timestamp%2Ccaption%2Cmedia_type%2Cchildren%7Bmedia_url%7D&access_token=testtoken&after=QVFIUmZAfV1BqUVhjQ0JTTmphOXQ4RnYybFlfQjI2ajRXM2s0cVpmTVQta3U0Wk1zcWVIRzRBaXM3RTdQOFNhR3c0TVFCQWMyY2thMERZAeU9QRWhtdko3RLJ"
  }
})
scope.get('/v11.0/123412341234/media?fields=timestamp%2Ccaption%2Cmedia_type%2Cchildren%7Bmedia_url%7D&access_token=testtoken&after=QVFIUmZAfV1BqUVhjQ0JTTmphOXQ4RnYybFlfQjI2ajRXM2s0cVpmTVQta3U0Wk1zcWVIRzRBaXM3RTdQOFNhR3c0TVFCQWMyY2thMERZAeU9QRWhtdko3RLJ')
.reply(200,{
  "data": [
    {
      value:2
    }
  ],
  "paging": {
    "previous": "https://graph.facebook.com/v11.0/123412341234/media?fields=timestamp%2Ccaption%2Cmedia_type%2Cchildren%7Bmedia_url%7D&access_token=testtoken&after=QVFIUmZAfV1BqUVhjQ0JTTmphOXQ4RnYybFlfQjI2ajRXM2s0cVpmTVQta3U0Wk1zcWVIRzRBaXM3RTdQOFNhR3c0TVFCQWMyY2thMERZAeU9QRWhtdko3RLJ"
  }
})

//Mock responses for GetInsights tests
const scope2 = nock('https://graph.facebook.com/v11.0/13191417006330209')
scope2.filteringPath(
  (path)=>{
    let newPath = path.replace(/since=[0-9]{4}-[0-9]{2}-[0-9]{2}/g,'since=XXX')
    let newP2 = newPath.replace(/until=[0-9]{4}-[0-9]{2}-[0-9]{2}/g,'until=XXX')
    console.log(newP2)
    return newP2
  }
)
.get('/insights?metric=impressions%2Creach%2Cfollower_count&period=day&since=XXX&until=XXX&access_token=testtoken')
.reply(200,
  {
    "data": [
      {
        "name": "impressions",
        "values": [
          {
            "value": 2,
            "end_time": "2021-08-23T07:00:00+0000"
          }
        ]
      },
      {
        "name": "reach",
        "values": [
          {
            "value": 1,
            "end_time": "2021-08-23T07:00:00+0000"
          }
        ]
      }
    ],
    "paging": {
      "next": "https://graph.facebook.com/v11.0/13191417006330209/insights?access_token=testtoken&pretty=0&since=XXX&until=XXX&metric=impressions%2Creach%2Cfollower_count&period=day"
 }
})
scope2.get('/insights?access_token=testtoken&pretty=0&since=XXX&until=XXX&metric=impressions%2Creach%2Cfollower_count&period=day')
.reply(200,{
  "data": [
    {
      "name": "impressions",
      "values": [
        {
          "value": 1,
          "end_time": "2021-08-22T07:00:00+0000"
        }
      ]
    },
  ],
  "paging": {
    "previous": "previouscursor"
  }
})


describe('Get',()=>{
  it('sending valid request returns no error',async ()=>{
    let promise = fb.Get('/v11.0/109012242885489',
    {
      'fields':'instagram_business_account{name}',
      'access_token':'test'
    });
    let result = await promise;
    assert.equal(result.instagram_business_account.name,'test');
  })
  it('sending invalid request returns error',async ()=>{
    let promise = fb.Get('/v11.0/109012242885489',
    {
      'fields':'instagram_business_account{name}',
      'access_token':'test'
    });
    
    assert.rejects(promise)
  })
})

describe('Discover',()=>{
  it('returns appended posts in result when there is pagination',async ()=>{
    let promise = fb.Discover('/v11.0/13269676367939291',{
      userName: 'esmuellert',
      startDate: '2021-06-29',
      endDate:'2021-06-30',
    },'testtoken',[]);
    let result = await promise;
    assert.equal(result.length,3)
  })
})

describe('GetPost',()=>{
  const test = {
    timestamp: '2021-08-28T19:55:11+0000',
    caption: 'Orange',
    media_type: 'IMAGE',
    media_url: 'https://scontent-qro1-3.cdninstagram.com/v/t51.29350-15/240721311_274360604191304_3264872005916855885_n.jpg?_nc_cat=111&ccb=1-5&_nc_sid=8ae9d6&_nc_ohc=OYrjP4qdXOkAX8arD2o&_nc_ht=scontent-qro1-2.cdninstagram.com&edm=AEQ6tj4EAAAA&oh=b6c814949db790ea08c75326ebc88164&oe=61343868',
    comments_count: 3,
    like_count: 1,
    insights: { data: [ 
      {name: "impressions",period: "lifetime",values: [{value: 1}],title: "Impressions"},
      {name: "engagement",period: "lifetime",values: [{value: 4}],title: "Engagement"} 
    ]},
    id: '13191417006330209',
    impressions: 1,
    engagement: 4
  }

  it('Aggregates impressions and engagement metrics in post',async ()=>{
    let promise = fb.GetPost('/v11.0/13191417006330209','testtoken');
    let result = await promise;
    assert.deepEqual(result,test)
  })
})

describe('GetInsights',()=>{
  const test = {impressions:3,reach:1,followerCount:0}
  it('Aggregates impressions, reach and followerCount in response',async ()=>{
    let promise = fb.GetInsights('/v11.0/13191417006330209/insights','testtoken',11);
    let result = await promise;
    assert.deepEqual(result,test)
  })
})

describe('GetAudiences',()=>{
  it('Returns empty array when no data is available', async ()=>{
    let promise = fb.GetAudiences('/v11.0/17269676367939291/insights','testtoken');
    let result = await promise;
    assert.deepEqual(result,[]);
  })
})

describe('GetAll',()=>{
  const test = [
    {
      value: 1
    },
    {
      value:2
    }
  ]
  it('Returns appended data', async ()=>{
    let promise = fb.GetAll('/v11.0/123412341234/media',{
      'fields':'timestamp,caption,media_type,children{media_url}',
      'access_token':'testtoken',
    })
    let result = await promise;
    assert.deepEqual(result,test);
  })
})