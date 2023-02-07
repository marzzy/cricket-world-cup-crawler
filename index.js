import fetch from "node-fetch";
import fs from 'fs';
import jsdom from "jsdom";

const { JSDOM } = jsdom;
const URL = "https://en.wikipedia.org/wiki/Cricket_World_Cup";
const HTML_URL = "./index.html"

// function to get the raw data
const getRawData = (URL) => {
  return fetch(URL)
      .then((response) => response.text())
      .then((data) => {
        return data;
      });
};



function addCSSStylesheet(document) {
  // create document head
  const htmlHead = document.head;
  // create the styleshit link
  const stylesheetLink = document.createElement("link");
  stylesheetLink.type = "text/css";
  stylesheetLink.rel = "stylesheet";
  stylesheetLink.href = './table.css';
  // append link to the head of document
  htmlHead.appendChild(stylesheetLink);
}
function createAndAddTable(data, document) {
  // create table and fill with data
  const tableElement = document.createElement('table');
  const tableHeeader = tableElement.createTHead();
  tableHeeader.innerHTML = "<th>Year</th><th>Winner</th><th>Runner</th>";
  const tableBody = tableElement.createTBody()
  for (let rowNumber = 0; rowNumber < data.length; rowNumber++) {
    const {year, winner, runner} = data[rowNumber];
    const tr = tableBody.insertRow();
    tr.insertCell(0).innerHTML = year;
    tr.insertCell(1).innerHTML = winner;
    tr.insertCell(2).innerHTML = runner;
  }
  // append table to the document
  document.body.appendChild(tableElement);
}
function writeFinalDataToHTML(tableData) {
  const { document: finalHTMLDocument } = (new JSDOM()).window;
  finalHTMLDocument.title = "Cricket World Cup";

  createAndAddTable(tableData, finalHTMLDocument);
  addCSSStylesheet(finalHTMLDocument);

  fs.writeFileSync(HTML_URL, finalHTMLDocument.documentElement.innerHTML);

}
const getCricketWorldCupsList = async () => {
  const cricketWorldCupRawData = await getRawData(URL);  
  // use bellow code to see the row fetch data in html format and find the css selector easier
  // fs.writeFileSync(HTML_URL, cricketWorldCupRawData);
  const { document } = (new JSDOM(cricketWorldCupRawData)).window;
  // use bellow code to check the selected data from fetched html
  // fs.writeFileSync(HTML_URL, document.querySelector("table.wikitable:nth-child(83) tbody tr:nth-child(3) td:nth-child(2) a").outerHTML);

  function getRowData(rowNumber) {
    const isTheRowExist = rowNumber >=3 && !!document.querySelector(`table.wikitable:nth-child(83) tbody tr:nth-child(${rowNumber})`);
    if(isTheRowExist) {
      return {
        winner: document.querySelector(`table.wikitable:nth-child(83) tbody tr:nth-child(${rowNumber}) td:nth-child(5) a`)?.getAttribute("title") || 'NA',
        runner: document.querySelector(`table.wikitable:nth-child(83) tbody tr:nth-child(${rowNumber}) td:nth-child(6) a`)?.getAttribute("title") || 'NA',
        year: document.querySelector(`table.wikitable:nth-child(83) tbody tr:nth-child(${rowNumber}) td:nth-child(2) a`)?.textContent || 'NA',
      }
    }
    return undefined;
    
  }

    const tableData = [];
    console.log("Year --- Winner --- Runner");

    for(let rowCounter= 3; getRowData(rowCounter); rowCounter++) {
      const {year, winner, runner} = getRowData(rowCounter);

      console.log(`${year} --- ${winner} --- ${runner}`);
      tableData.push(getRowData(rowCounter))
    }

    writeFinalDataToHTML(tableData);

};

// invoking the main function
getCricketWorldCupsList();
