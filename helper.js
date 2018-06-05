const mongoose = require('mongoose');
const bikeModel = require('./../bikes-back/bikeModel');
mongoose.connect('mongodb://localhost/bikesDatabase');


let action;
const BikeDB = mongoose.model('Bike', bikeModel);

process.argv.forEach((param)=>{
    action = param;
});

let cleaner = {
    drop: function(){
        BikeDB.remove({}, (err, res)=>{
            if(err) console.log(err);
            console.log(res);
        })
    },
    list: function (query = {}){
         BikeDB.find(query, (err, docs)=>{
            if (err) console.log(err);
            console.log(docs);
        })
    }

}

cleaner[action]();