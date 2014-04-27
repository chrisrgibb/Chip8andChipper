var express = require("express");
var app = express();

app.use(express.bodyParser());

app.use(express.static(__dirname));

app.use(app.router);

app.get('/', function(req, res) {
  console.log("hdeaf");
  res.send('Hello World!');
});



var port = Number(process.env.PORT || 3000);
app.listen(port, function() {
  console.log("Listening on " + port);
});