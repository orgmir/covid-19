var sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const parse = require("csv-parse");

var db = new sqlite3.Database("covid.db");

function parseFile(filename) {
  return new Promise((resolve, reject) => {
    const output = [];

    const parser = parse({
      delimiter: ","
    });

    parser.on("readable", function() {
      let record;
      while ((record = parser.read())) {
        output.push(record);
      }
    });

    parser.on("error", err => reject(err));

    parser.on("end", () => resolve(output));

    fs.createReadStream(filename).pipe(parser);
  });
}

function fillDatabase(output, dataType) {
  return new Promise((resolve, reject) => {
    console.log(`Inserting records in database for ${dataType}`);
    db.serialize(function() {
      let headers = output.shift();
      db.run("DROP TABLE IF EXISTS origin")
        .run(
          "CREATE TABLE origin ( id INTEGER PRIMARY KEY, state TEXT, country TEXT, lat REAL, lon REAL )"
        )
        .run("DROP TABLE IF EXISTS report")
        .run(
          "CREATE TABLE report ( date TEXT, number INTEGER, origin_id INTEGER, type TEXT )"
        );

      let error;

      const originSql = db.prepare(
        "INSERT INTO origin (state, country, lat, lon) VALUES (?, ?, ?, ?)"
      );
      const recordSql = db.prepare(
        "INSERT INTO report (date, number, origin_id, type) VALUES (?, ?, ?, ?)"
      );
      output.forEach(record => {
        originSql.run([record[0], record[1], record[2], record[3]], function(
          err
        ) {
          if (err) {
            error = err;
          } else {
            const origin_id = this.lastID;
            record.forEach(function(number, index) {
              if (index > 3) {
                recordSql.run(
                  [headers[index], number, origin_id, dataType],
                  err => (error = err)
                );
              }
            });
          }
        });
      });

      originSql.finalize(() =>
        recordSql.finalize(() => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        })
      );

      // output.forEach(function(record, index) {
      //   if (index === 0) {
      //     headers = record;
      //   } else {
      //     db.run(
      //       "INSERT INTO origin (state, country, lat, lon) VALUES (?, ?, ?, ?);",
      //       [record[0], record[1], record[2], record[3]],
      //       function(error) {
      //         if (error) {
      //           reject(error);
      //         } else {
      //           const origin_id = this.lastID;
      //           record.forEach(function(number, index) {
      //             if (index > 3) {
      //               db.run(
      //                 "INSERT INTO report (date, number, origin_id, type) VALUES (?, ?, ?, ?)",
      //                 [headers[index], number, origin_id, dataType],
      //                 function(err) {
      //                   if (err) {
      //                     reject(err);
      //                   }
      //                 }
      //               );
      //             }
      //           });
      //         }
      //       }
      //     );
      //   }
      // });
    });
  });
}

console.log("Starting script");

parseFile("data/time_series_19-covid-Confirmed.csv")
  .then(data => fillDatabase(data, "confirmed"))
  .then(() => parseFile("data/time_series_19-covid-Deaths.csv"))
  .then(data => fillDatabase(data, "deaths"))
  .then(() => parseFile("data/time_series_19-covid-Recovered.csv"))
  .then(data => fillDatabase(data, "recovered"))
  .catch(err => console.log(err))
  .finally(() => console.log("Done."));
