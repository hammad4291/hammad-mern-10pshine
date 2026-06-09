using backend.Controllers;
using backend.DTOs;
using backend.Models;
using backend.Tests.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace backend.Tests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IConfiguration> _mockConfiguration;

    public AuthControllerTests()
    {
        _mockConfiguration = new Mock<IConfiguration>();

        // Mock default key configurations required by token generation mechanics
        _mockConfiguration.Setup(c => c.GetSection("JwtSettings:SecretKey").Value).Returns("SuperSecretLongTestingKeyStructure123!");
        _mockConfiguration.Setup(c => c.GetSection("JwtSettings:ExpiryInMinutes").Value).Returns("60");
        _mockConfiguration.Setup(c => c.GetSection("JwtSettings:Issuer").Value).Returns("TestIssuer");
        _mockConfiguration.Setup(c => c.GetSection("JwtSettings:Audience").Value).Returns("TestAudience");
    }

    [Fact]
    public async Task Register_ShouldReturnOk_WhenEmailIsUnique()
    {
        // Arrange
        using var context = TestDatabaseFixture.CreateContext();
        var controller = new AuthController(context, _mockConfiguration.Object);
        var dto = new RegisterDto { Username = "newuser", Email = "unique@gmail.com", Password = "123", RoleId = 2 };

        // Act
        var result = await controller.Register(dto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Registration completed.", okResult.Value);
    }

    [Fact]
    public async Task Register_ShouldReturnBadRequest_WhenEmailAlreadyExists()
    {
        // Arrange
        using var context = TestDatabaseFixture.CreateContext();
        context.Users.Add(new User { Id = 10, Username = "existing", Email = "duplicate@gmail.com", Password = "123", RoleId = 2, RefreshToken = "" });
        await context.SaveChangesAsync();

        var controller = new AuthController(context, _mockConfiguration.Object);
        var dto = new RegisterDto { Username = "test", Email = "duplicate@gmail.com", Password = "123", RoleId = 2 };

        // Act
        var result = await controller.Register(dto);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Email is already registered.", badRequestResult.Value);
    }
}