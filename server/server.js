//all the code+comments written are cross verified with the documentation ; if u have any suggestions for improvement please let me know :)


import dotenv from "dotenv";//
import app from "./src/app.js";//importing the Express app from the src folder
import connectDB from "./src/config/db.js";//connect to database from the src/config folder
//call the function
dotenv.config();//loads environment variables from a .env file into process.env. This allows you to keep sensitive information like database credentials and API keys out of your codebase and easily manage them in a separate file.

const PORT = process.env.PORT || 5000;//sets the port number for the server to listen on. It first checks if there is a PORT environment variable defined (which is common in production environments), and if not, it defaults to 5000. This allows for flexibility in different deployment scenarios.
//const - basically means that the variable can't be reassigned.
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
//reference from the documentation :)

//app.listen` starts the Express server.
//() => { ... }- runs after the server starts 
