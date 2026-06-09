using backend;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests.Helpers;

public static class TestDatabaseFixture
{
    public static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Fresh DB instance per test
            .Options;

        var context = new AppDbContext(options);
        context.Database.EnsureCreated();

        // Let EF build IDs dynamically to avoid InMemory internal identity tracking collisions
        context.Roles.AddRange(
            new Role { Name = "Admin" },
            new Role { Name = "User" }
        );
        context.SaveChanges();

        return context;
    }
}