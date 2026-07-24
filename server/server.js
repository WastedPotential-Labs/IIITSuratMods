//all the code+comments written are cross verified with the documentation ; if u have any suggestions for improvement please let me know :)

// "dotenv/config" must be the FIRST import. ES module imports run before any
// other code in this file, so a plain dotenv.config() call would execute only
// AFTER app.js was already loaded — and app.js reads process.env.FRONTEND_URL
// at load time for CORS. Importing dotenv/config loads .env during the import
// phase, before app.js is evaluated.
import "dotenv/config";
import app from "./src/app.js";//importing the Express app from the src folder
import connectDB from "./src/config/db.js";//connect to database from the src/config folder

const PORT = process.env.PORT || 5000;//sets the port number for the server to listen on. It first checks if there is a PORT environment variable defined (which is common in production environments), and if not, it defaults to 5000.

// Connect to MongoDB first, then start accepting requests. Listening before
// the database is ready lets early requests hit routes that immediately fail.
const start = async () => {
  await connectDB();
  app.get("/ping",(req,res)=>{
    res.sendStatus(200);
  })
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
