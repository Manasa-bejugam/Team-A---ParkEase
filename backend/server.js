const express = require("express");
const app = express();
const port = 5000;
require("dotenv").config();

const cors = require("cors");
app.use(cors());
app.use(express.json());

app.use("/api/admin", require("./routes/admin"));

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

const users = [
  { email: "test@gmail.com", password: "1234", role: "user" },
  { email: "admin@gmail.com", password: "admin", role: "admin" },
];

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.json({ message: "Invalid credentials" });
  }

  res.json({ message: "Login successful", role: user.role });
});

const authRoutes = require("./routes/auth");

app.use("/api/auth", authRoutes);
// app.use("/api/admin", authRoutes);

const mongoose = require("mongoose");

// Replace 'your_connection_string' with your actual MongoDB URL
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    // Seed slots
    const seedSlots = require("../seed/slotSeeder");
    seedSlots();
  })
  .catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const companyRoutes = require("./routes/company");
app.use("/api/company", companyRoutes);

const userRoutes = require("./routes/user");
app.use("/api/user", userRoutes);
const slotRoutes = require("./routes/slotRoutes");
app.use("/api/slots", slotRoutes);



require("dotenv").config();
 

app.use(express.json());
 
// Test Route

app.get("/", (req, res) => {

  res.send("Server running successfully 🚀");

});
 
const PORT = process.env.PORT || 5000;
 
app.listen(PORT, () => {

  console.log(`Server started on port ${PORT}`);

});
 