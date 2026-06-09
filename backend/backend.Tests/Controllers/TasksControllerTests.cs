using backend.Controllers;
using backend.DTOs;
using backend.Models;
using backend.Tests.Helpers;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace backend.Tests.Controllers;

public class TasksControllerTests
{
    [Fact]
    public async Task CreateCategory_ShouldReturnOk_WhenCategoryNameIsUnique()
    {
        // Arrange
        using var context = TestDatabaseFixture.CreateContext();
        var controller = new TasksController(context);
        var dto = new CategoryDto { Name = "Backend Architecture Tasks" };

        // Act
        var result = await controller.CreateCategory(dto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Category created successfully.", okResult.Value);
    }

    [Fact]
    public async Task CreateCategory_ShouldReturnBadRequest_WhenNameMatchesExistingSeed()
    {
        // Arrange
        using var context = TestDatabaseFixture.CreateContext();
        context.Categories.Add(new Category { Id = 10, Name = "Urgent" });
        await context.SaveChangesAsync();

        var controller = new TasksController(context);
        var dto = new CategoryDto { Name = "urgent" }; // Validation forces lowercase checking comparisons

        // Act
        var result = await controller.CreateCategory(dto);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("A category with this name already exists.", badRequestResult.Value);
    }
}