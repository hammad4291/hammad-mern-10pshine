using System.Text;
using backend;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// 1. INITIALIZE SERILOG LOGGING CONFIGURATION
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .WriteTo.File("Logs/task-manager-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

// Switch default framework logger to Serilog
builder.Host.UseSerilog();

// 2. READ APPLICATION CONFIGURATION SETTINGS
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var jwtSettings = builder.Configuration.GetSection("JwtSettings");

// 3. REGISTER CORE SERVICE LAYER
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 🟢 ADDED: Register Cross-Origin Resource Sharing (CORS) Policy System
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000") // Vite dev local server options
              .AllowAnyMethod()                                            // Allows GET, POST, PUT, DELETE
              .AllowAnyHeader()                                            // Allows custom headers like Authorization
              .AllowCredentials();                                         // Crucial for secure cookie/token context handshakes
    });
});

// Register AppDbContext with Microsoft Authentication Connection String
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// 4. REGISTER JWT BEARER AUTHENTICATION PIPELINE
builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options => {
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!))
    };
});

var app = builder.Build();

// 5. CONFIGURE HTTP PIPELINE MIDDLEWARE LAYER
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// 🟢 ADDED: Enable CORS before Authentication/Authorization pipelines inspect headers
app.UseCors("FrontendPolicy");

// Authentication MUST execute right before Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// 6. SAFE EXECUTION RUNTIME BLOCK WITH SERILOG TRACKING
try
{
    Log.Information("Starting Web Host...");
    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Host terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

//using System.Text;
//using backend;
//using Microsoft.AspNetCore.Authentication.JwtBearer;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.IdentityModel.Tokens;
//using Serilog;

//var builder = WebApplication.CreateBuilder(args);

//// 1. INITIALIZE SERILOG LOGGING CONFIGURATION
//Log.Logger = new LoggerConfiguration()
//    .MinimumLevel.Information()
//    .WriteTo.Console()
//    .WriteTo.File("Logs/task-manager-.txt", rollingInterval: RollingInterval.Day)
//    .CreateLogger();

//// Switch default framework logger to Serilog
//builder.Host.UseSerilog();

//// 2. READ APPLICATION CONFIGURATION SETTINGS
//var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
//var jwtSettings = builder.Configuration.GetSection("JwtSettings");

//// 3. REGISTER CORE SERVICE LAYER
//builder.Services.AddControllers();
//builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

//// Register AppDbContext with Microsoft Authentication Connection String
//builder.Services.AddDbContext<AppDbContext>(options =>
//    options.UseSqlServer(connectionString));

//// 4. REGISTER JWT BEARER AUTHENTICATION PIPELINE
//builder.Services.AddAuthentication(options => {
//    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
//    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
//})
//.AddJwtBearer(options => {
//    options.TokenValidationParameters = new TokenValidationParameters
//    {
//        ValidateIssuer = true,
//        ValidateAudience = true,
//        ValidateLifetime = true,
//        ValidateIssuerSigningKey = true,
//        ValidIssuer = jwtSettings["Issuer"],
//        ValidAudience = jwtSettings["Audience"],
//        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!))
//    };
//});

//var app = builder.Build();

//// 5. CONFIGURE HTTP PIPELINE MIDDLEWARE LAYER
//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}

//app.UseHttpsRedirection();

//// Authentication MUST execute right before Authorization
//app.UseAuthentication();
//app.UseAuthorization();

//app.MapControllers();

//// 6. SAFE EXECUTION RUNTIME BLOCK WITH SERILOG TRACKING
//try
//{
//    Log.Information("Starting Web Host...");
//    await app.RunAsync();
//}
//catch (Exception ex)
//{
//    Log.Fatal(ex, "Host terminated unexpectedly");
//}
//finally
//{
//    Log.CloseAndFlush();
//}

////var builder = WebApplication.CreateBuilder(args);

////// Add services to the container.

////builder.Services.AddControllers();
////// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
////builder.Services.AddEndpointsApiExplorer();
////builder.Services.AddSwaggerGen();

////var app = builder.Build();

////// Configure the HTTP request pipeline.
////if (app.Environment.IsDevelopment())
////{
////    app.UseSwagger();
////    app.UseSwaggerUI();
////}

////app.UseHttpsRedirection();

////app.UseAuthorization();

////app.MapControllers();

////await app.RunAsync();