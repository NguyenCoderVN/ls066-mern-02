import express from "express";

const app = express();

app.get("/", (_req, res) => {
  res.send("Server is working");
});

app.listen(
  5000,
  console.log("Server is running on port 5000 number"),
);
