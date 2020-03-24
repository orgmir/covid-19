const sqlite3 = require("sqlite3");
const fs = require("fs");

var db = new sqlite3.Database("covid.db");

db.all(
  `SELECT report.date, SUM(report.number) AS count, country
FROM report
JOIN origin ON report.origin_id = origin.id
WHERE report.type="confirmed" AND origin.country = "Portugal" OR origin.country = "Australia" OR origin.country = "Italy" 
OR origin.country = "Spain" OR origin.country ="UK" OR origin.country = "US" 
GROUP BY report.date, origin.country`,
  [],
  (err, rows) => {
    if (err) {
      console.log(err);
    } else {
      rows.forEach(row => {
        let { date, count, country } = row;
        console.log(`${date},${count},${country}`);
      });
    }
  }
);
