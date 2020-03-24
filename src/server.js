const express = require("express");
const serveStatic = require("serve-static");

const app = express();
const port = 3000;

app.use(serveStatic(".", { index: ["index.html"] }));

app.listen(port, () => console.log(`Server listening on port ${port}!`));
