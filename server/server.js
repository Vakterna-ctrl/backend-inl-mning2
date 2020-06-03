const express = require('express')
const MongoClient = require('mongodb').MongoClient
const path = require('path')
const cors = require('cors')
const app = express();

// JSON parser
let parser = (req, res, next ) => {
  let data = '';
  req.on('data',(chunk) => {
    data += chunk;
  });
  req.on('end', () => {
    if (data && data.indexOf('{') > -1 ) {
      req.body = JSON.parse(data);
    }
    next();
  });
}

//logger
let logger = (req, res, next) => {
  let startTimer = Date.now()
  let method = req.method
  let path = req.path
  res.on('finish', function(){
    let responseTime = Date.now() - startTimer
    let statusCode = res.statusCode
    console.log(method + ' ' + path + ' ' + statusCode + ' - ' + responseTime + ' ms')
  })
  next();
};

//connection URL
const url = 'mongodb://localhost:27017'

//Database Name
const dbName = 'Trello'
const client = new MongoClient(url, { useUnifiedTopology: true })

//middleware
app.use(express.static(path.join(__dirname, '../trello/build')));
app.use((err, req, res, next) => {
  if(err.stack){
  res.status(500).send('Server error')
}
next();
})

app.use(parser);

app.use(logger)

app.use(cors())

client.connect((err) => {

  const db = client.db(dbName)
  const collection = db.collection('List')

  app.get('/lists', (req,res) => {
    collection.find({}).toArray((err,docs) => {
      if(err){
        return res.status(404).end()
      }else{
        res.status(200).send(docs)
      }
    })
  })

  app.post('/lists', (req,res) => {
    if(!req.body){
      return res.status(400).end()
    }
    collection.insertOne({listname: req.body.listname, id:req.body.id, cards:req.body.cards},(err,results) => {
      res.status(201).end()
    })
  })
  app.post('/v1/lists/:listId/cards', (req,res) => {
    if(!req.body){
      return res.status(400).end()
    }
    collection.updateOne({ id:req.params.listId }
    ,{$set:{"cards":req.body.cards}}, function(err, result) {
      return res.status(201).end()
  })
  })

  app.post('/v2/lists/:listId/cards', (req,res) => {
    if(!req.body){
      return res.status(400).end()
    }
    collection.updateOne({ id:req.params.listId }
    ,{ $push: { cards : req.body } }, function(err, result) {
      return res.status(201).end()
  })
})

  app.patch('/lists/:listId/cards/:cardId/names', (req,res) => {
    collection.updateOne({id:req.params.listId, 'cards.id':`${req.params.cardId}`}, {$set: {"cards.$.name":req.body.name}}, (err, result) => {
      if(err){
        return res.status(404).end()
      }
      return res.status(200).end()
    })
  })

  app.patch('/lists/:listId/cards/:cardId/descriptions', (req,res) => {
    collection.updateOne({id:req.params.listId, 'cards.id':`${req.params.cardId}`}, {$set: {"cards.$.description":req.body.description}}, (err, result) => {
      if(err){
        return res.status(404).end()
      }
      return res.status(200).end()
    })
  })

  app.delete('/lists/:listId/cards/:cardId', (req,res) => {
    collection.updateOne({id:req.params.listId, 'cards.id':`${req.params.cardId}`}, {$pull: {"cards": {id:req.params.cardId}}}, (err, result) => {
      if(err){
        return res.status(404).end()
      }
      return res.status(204).end()
    })
  })

})

app.listen(8080, ()=>{
  console.log('listening on port 8080')
})
