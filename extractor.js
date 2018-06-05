const fs = require('fs');
const cheerio = require('cheerio');
const CSSselect = require("css-select");
const path = require('path');
const bikeModel = require('./../bikes-back/bikeModel');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/bikesDatabase');

let companyFile, filterObject;

process.argv.forEach((param)=>{
    companyFilename = param;
});

//read param file
filterObject = JSON.parse(fs.readFileSync(companyFilename + ".json", 'utf8')).bikeFilters;
// page = fs.readFileSync(bikeCompany + "/0.html", 'utf8');


let collectedBikes = [];
fs.readdir("./" + companyFilename + "/", (err, pages) => {

    let pagesFiltered = pages.filter(function(file) {
        return path.extname(file).toLowerCase() === ".html";
    });
    // pagesFiltered = [pages[1]];
    pagesFiltered.forEach(pageName => {
        // let collectedData = [];
        let collectedData = {};
        let page = fs.readFileSync(companyFilename + "/" + pageName, 'utf8');
        Object.entries(filterObject).forEach((queryObject)=>{
            let key = queryObject[0];
            let query = queryObject[1];
            let $page = cheerio.load(page);
            let queryResult = $page(query).text();
            collectedData[key] = $page(query).last().text().replace(/(\r\n\t|\n|\r\t|  )/gm,"");
            // collectedData.push({
            //     key,
            //     txt: $page(query).last().text().replace(/(\r\n\t|\n|\r\t|  )/gm,"")
            // });
        });
        collectedBikes.push(collectedData);
    })
    console.log(collectedBikes);

    const Bike = mongoose.model('Bike', bikeModel);
    collectedBikes.forEach(bikeData => {
    
        Bike.find({title: bikeData.title, brand: filterObject.brand}, (err, bikesInDatabase)=>{
            if (err) console.log(err);
            console.log(bikesInDatabase);
            if (bikesInDatabase.length === 0){
                const newBike = new Bike(bikeData);
                newBike.save().then(()=>{
                    console.log('Bike ' + bikeData.title + ' saved')
                });
            } else {
                Object.entries(bikeData).forEach(bikeParamObject => {
                    let key = bikeParamObject[0];
                    let value = bikeParamObject[1];
                    bikesInDatabase[0][key] = value;
                })
    
                bikesInDatabase[0].save((err, savedBike)=>{
                    console.log("Bike " + bikesInDatabase[0].title + " updated");
                })
            }
        })
    })
});

// call for the bike of this brand and name 
// if it exists, update it, if not create a new one
// needs a logic for bikes of previous years




//unescape()
