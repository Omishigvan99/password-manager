require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// middleware
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
const { authorise } = require("./middleware/authorise.js");
// database connection
const dbURI = process.env.DATABASE_URI;
mongoose
    .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) =>
        server.listen(process.env.PORT || 8000, () =>
            console.log(`Server is running on port ${process.env.PORT || 8000}`)
        )
    )
    .catch((err) => console.log(err));

// view engine
app.set("view engine", "ejs");

// app routes
// default route that is called (the home page)
app.get("/", authorise, (req, res) => res.render("home"));

// routes for when the user has not logged in yet
const preLoginRoutes = require("./routes/pre-login-routes.js");
app.use("/api", preLoginRoutes);

// routes for when user has logged in
const postLoginRoutes = require("./routes/post-login-routes.js");
app.use("/api", authorise, postLoginRoutes);

// share the password to all users
io.on("connection", (socket) => {
    socket.on("share-password", (sharedPassword) => {
        socket.broadcast.emit("receive-password", sharedPassword);
    });
});
