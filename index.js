// db.serialize(function() {
//   db.run("CREATE TABLE lorem (info TEXT)");

//   var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
//   for (var i = 0; i < 10; i++) {
//     stmt.run("Ipsum " + i);
//   }
//   stmt.finalize();

//   db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
//     console.log(row.id + ": " + row.info);
//   });
// });

// db.close();

var sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const parse = require("csv-parse");

console.log("Starting script");

var db = new sqlite3.Database("covid.db");

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

parser.on("error", function(err) {
  console.error(err.message);
});

parser.on("end", function() {
  console.log("Finished parsing");
  fillDatabase();
});

fs.createReadStream("time_series_19-covid-Confirmed.csv").pipe(parser);

function fillDatabase() {
  console.log("Insering records in database");
  db.serialize(function() {
    db.run("DROP TABLE IF EXISTS origin");
    db.run(
      "CREATE TABLE origin ( id INTEGER PRIMARY KEY, state TEXT, country TEXT, lat REAL, lon REAL )"
    );
    db.run("DROP TABLE IF EXISTS report");
    db.run(
      "CREATE TABLE report ( date TEXT, number INTEGER, origin_id INTEGER )"
    );
    let headers = [];
    output.forEach(function(record, index) {
      if (index === 0) {
        headers = record;
      } else {
        db.run(
          "INSERT INTO origin (state, country, lat, lon) VALUES (?, ?, ?, ?);",
          [record[0], record[1], record[2], record[3]],
          function(error) {
            if (error) {
              dbErrorHandler(error);
            } else {
              const origin_id = this.lastID;
              record.forEach(function(number, index) {
                if (index > 3) {
                  db.run(
                    "INSERT INTO report (date, number, origin_id) VALUES (?, ?, ?)",
                    [headers[index], number, origin_id],
                    dbErrorHandler
                  );
                }
              });
            }
          }
        );
      }
    });
  });
}

function dbErrorHandler(error) {
  if (error) {
    console.log(error);
  }
}
