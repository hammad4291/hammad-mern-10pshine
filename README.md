================================================================================
          MERN + .NET PROJECT — SETUP & INSTALLATION GUIDE
          github.com/hammad4291/hammad-mern-10pshine
================================================================================


--------------------------------------------------------------------------------
PROJECT OVERVIEW
--------------------------------------------------------------------------------

This is a full-stack web application with a React (Vite) frontend and an
ASP.NET Core backend connected to a SQL Server database via Entity Framework Core.

  Layer            Technology
  --------------- -------------------------------------------------------
  Frontend        React 19 + Vite 8 (JavaScript / JSX)
  Routing         React Router DOM v7
  HTTP Client     Axios v1
  Backend         ASP.NET Core (C#)
  Database ORM    Entity Framework Core (Code-First + Migrations)
  Architecture    MVC — Controllers / DTOs / Models / AppDbContext
  Testing Suite   xUnit + Moq + EF Core InMemory Database


--------------------------------------------------------------------------------
STEP 1 — CLONE THE REPOSITORY
--------------------------------------------------------------------------------

    git clone https://github.com/hammad4291/hammad-mern-10pshine.git
    cd hammad-mern-10pshine


--------------------------------------------------------------------------------
STEP 2 — FRONTEND SETUP (React + Vite)
--------------------------------------------------------------------------------

2.1  Go to the frontend folder:

    cd frontend1

2.2  Install the required packages individually or via package.json:

     If cloning for the first time, simply run:
     
     npm install

     Alternatively, if you need to install the project dependencies manually,
     run these explicit commands:

       npm install react@19 react-dom@19
       npm install react-router-dom@7
       npm install axios@1
       npm install --save-dev vite@8 @vitejs/plugin-react@6 eslint@10 @eslint/js@10

2.3  Configure the backend API URL:

    Open frontend1/src/ and set the base URL to your backend in .env:

        VITE_API_BASE_URL=https://localhost:44392

2.4  Start the frontend dev server:

    npm run dev

    Browser URL: http://localhost:5173


--------------------------------------------------------------------------------
STEP 3 — BACKEND SETUP (ASP.NET Core API)
--------------------------------------------------------------------------------

3.1  Go to the main backend solution folder (where backend.sln lives):
    
    cd backend
    
3.2  Restore all dependencies across the entire solution workspace:

    dotnet restore
    
3.3  Go into the inner backend Web API code project folder:

    cd backend

3.4  Update the database connection string in appsettings.json:

    {
      "ConnectionStrings": {
        "DefaultConnection": "Server=localhost;Database=YourDbName;Trusted_Connection=True;TrustServerCertificate=True"
      }
    }

3.5  Install the dotnet-ef CLI tool (required for database migrations):

    dotnet tool install --global dotnet-ef

3.6  Install the required backend NuGet packages manually (Optional):

     If you want to manually install each package project dependency instead 
     of using 'dotnet restore' above, run these inside the inner backend folder:

       dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.0.0
       dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.0.11
       dotnet add package Microsoft.EntityFrameworkCore.SqlServer --version 8.0.11
       dotnet add package Microsoft.EntityFrameworkCore.Tools --version 10.0.8
       dotnet add package Portable.BouncyCastle --version 1.9.0
       dotnet add package Serilog.AspNetCore --version 10.0.0
       dotnet add package Serilog.Sinks.File --version 7.0.0
       dotnet add package Swashbuckle.AspNetCore --version 6.6.2

3.7  Apply database migrations (creates the database schema):

    dotnet ef database update

    This command automatically injects the following production seed data markers:
      - Roles: Admin (Id=1), User (Id=2)
      - Classifications: Work, Personal, Urgent
      - Core Admin Credentials:
          • Username: admin
          • Email: admin@gmail.com
          • Password: 123

3.8  Start the backend server:

    dotnet run

    Backend will be running at:
        http://localhost:5000
        https://localhost:7000


--------------------------------------------------------------------------------
STEP 4 — RUNNING THE COMPONENT TEST SUITE
--------------------------------------------------------------------------------

4.1  Navigate to the test project directory from your current inner backend folder:

    cd ../backend.Tests

4.2  Run the automated test matrix suite immediately:

    dotnet test

4.3  Manual Creation & Deep Package Installation commands (Optional):

     If you ever need to recreate the testing project layer reference structures 
     manually from the solution root workspace directory, the setup commands are:

       dotnet new xunit -o backend.Tests
       dotnet sln backend.sln add backend.Tests/backend.Tests.csproj
       dotnet add backend.Tests/backend.Tests.csproj reference backend/backend.csproj
       cd backend.Tests
       dotnet add package Microsoft.EntityFrameworkCore.InMemory --version 8.0.11
       dotnet add package Moq --version 4.20.70


--------------------------------------------------------------------------------
STEP 5 — RUNNING THE FULL APPLICATION
--------------------------------------------------------------------------------

Open TWO terminals and run these side by side:

  Terminal 1 — Backend                  Terminal 2 — Frontend
  -------------------------             -------------------------
  cd backend/backend                    cd frontend1
  dotnet run                            npm run dev

Then open your browser at:  http://localhost:5173


--------------------------------------------------------------------------------
PROJECT STRUCTURE
--------------------------------------------------------------------------------

hammad-mern-10pshine/
├── frontend1/                 React + Vite app
│   ├── src/
│   │   ├── components/        Reusable UI components
│   │   ├── pages/             Route-level page components
│   │   ├── App.jsx            Root component & router setup
│   │   └── main.jsx           Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json           Frontend dependencies
│
└── backend/                   ASP.NET Core API Solution Workspace
    ├── backend.sln            Global Solution File
    │
    ├── backend/               Web API Code Project Folder
    │   ├── Controllers/       API endpoints (HTTP GET/POST/PUT/DELETE)
    │   ├── DTOs/              Data Transfer Objects (request/response shapes)
    │   ├── Models/            C# entity classes (database tables)
    │   ├── Migrations/        EF Core migration history
    │   ├── AppDbContext.cs    EF Core database context
    │   ├── Program.cs         App startup & middleware config
    │   └── appsettings.json   Config (DB connection, ports, etc.)
    │
    └── backend.Tests/         Automated Testing Architecture Layer
        ├── Helpers/           Test fixtures and database memory providers
        └── Controllers/       Isolated endpoint validation suites