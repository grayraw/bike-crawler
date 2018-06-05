const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const safeJsonStringify = require('safe-json-stringify');
require('events').EventEmitter.defaultMaxListeners = 99;

//cannondale
// const startPage = 'https://www.cannondale.com/en/International';
// const filters = ['[data-tab=Mountaintab] + .ddBox .col-xs-2 ul li a', '.viewProducts'];

//cube
const startPage = 'https://www.cube.eu/en/2018/bikes/mountainbike/';
const filters = ['.e-button.e-button-arrow-right', '#filter-items .item a'];

//gt full
const startPage = 'https://www.gtbicycles.com/int_en/bikes?cat=22&limit=36';
const filters = ['.product-image'];

//gt hard
const startPage = 'https://www.gtbicycles.com/int_en/bikes?cat=24&limit=36';
const filters = ['.product-image'];

//trek
const startPage = 'https://www.cube.eu/en/2018/bikes/mountainbike/';
const filters = ['.e-button.e-button-arrow-right', '#filter-items .item a'];

//merida
const startPage = 'https://www.cube.eu/en/2018/bikes/mountainbike/';
const filters = ['.e-button.e-button-arrow-right', '#filter-items .item a'];

//giant
const startPage = 'https://www.cube.eu/en/2018/bikes/mountainbike/';
const filters = ['.e-button.e-button-arrow-right', '#filter-items .item a'];

let browser;
let page;

async function grabAPage(startPage, filters){
    // const browser = await puppeteer.launch({headless: false});
    // await page.goto(startPage, {timeout: 0});
    // let pagesContent = [await page.content()];
  //   await page.screenshot({path: 'example.png'});

    browser = await puppeteer.launch({headless: false});
    page = await browser.newPage();
    page.setJavaScriptEnabled(true);
    let pagesContent = await getContent([startPage]);

    let i = 0;
    while (i < filters.length){
        
        let $pagesContent = pagesContent.map((page)=>{
            return cheerio.load(page);
        });
        let links = [];
        let filter = filters[i];
        $pagesContent.map( ($page) =>{
            let pageLinks = [];
            $page(filter).map(function (i, elem) {
                pageLinks.push(this.attribs.href);
            });
            links = [...links, ...pageLinks];
        });        

        pagesContent = await getContent(links);

        i++;
    }

    fs.mkdir("cube", ()=>{
        pagesContent.forEach((page, index)=>{
            //safe each page on disk with a start page as folder;
            fs.writeFile("cube/" + index + ".html", page, function(err) {
                if(err) {
                    return console.log(err);
                }
            
                console.log("The " + index + ".html was saved!");
            }); 
        })
    })

  
    // await browser.close();
}

async function getContent(links){
    let formattedLinks = filterLinks(links, startPage);
    // debugger;
    // formattedLinks = [formattedLinks[0]];
    let newContent = [];
    await Promise.all(formattedLinks.map(async (link)=>{
        const p = await browser.newPage();
        p.setJavaScriptEnabled(true);
        await page.setRequestInterception(true);
        page.on('request', interceptedRequest => {
          if (interceptedRequest.url().endsWith('.png') || interceptedRequest.url().endsWith('.jpg'))
            interceptedRequest.abort();
          else
            interceptedRequest.continue();
        });
        await p.goto(link, {
            waitUntil: 'networkidle2',                    
            timeout: 0});
        
        newContent.push(await p.content());
        // p.close();
    }));
    return newContent;
}


function filterLinks(links, startPage){
    let filteredLinks = links.map((link)=>{
        if (/^http/g.test(link)) {
            return link;
        }
        else if (/^\//g.test(link)) {
            let rootLink = startPage.match(/^[\w]*:\/\/.+?(?=\/)/g);
            return rootLink + link;
        } else {
            return startPage + link;
        }
    });
    return filteredLinks;
}

grabAPage(startPage, filters);

// console.log($('[data-tab=Mountaintab] + .ddBox .col-xs-2 ul').text());
