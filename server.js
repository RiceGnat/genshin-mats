const express = require("express");
const port = (process.env.PORT || 8080);

const tap = require("./router.js");

express().use("/", express.static("build")).listen(port, () => {
    console.log(`Server listening on port ${port}`);
});