const fs = require("fs");
const fetch = require("node-fetch");

const downloadFile = async (url, path) => {
  const response = await fetch(url);
  const fileStream = fs.createWriteStream(path);
  response.body.pipe(fileStream);
};

const baseUrl =
  "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/";
const confirmed = "time_series_covid19_confirmed_global.csv";
const deaths = "time_series_covid19_deaths_global.csv";

const savePath = "./data/";

downloadFile(baseUrl + confirmed, savePath + confirmed);
downloadFile(baseUrl + deaths, savePath + deaths);
