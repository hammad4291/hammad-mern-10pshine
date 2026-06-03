using System.Security.Claims;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context) => _context = context;

    private int GetLoggedInUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpPost("create")]
    public async Task<IActionResult> CreateTask([FromBody] TaskCreateDto dto)
    {
        int currentUserId = GetLoggedInUserId();

        var task = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            DueDate = dto.DueDate,
            CategoryId = dto.CategoryId,
            CreatedByUserId = currentUserId
        };

        // Admin assigns to someone else, otherwise user self-assigns
        task.AssignedToUserId = dto.AssignedToUserId.HasValue ? dto.AssignedToUserId.Value : currentUserId;

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return Ok("Task created successfully.");
    }

    [HttpGet("my-tasks")]
    public async Task<IActionResult> GetMyTasks()
    {
        int currentUserId = GetLoggedInUserId();

        // EF automatically ignores any tasks where IsDeleted == true due to global filter
        var tasks = await _context.Tasks
            .Include(t => t.Category)
            .Include(t => t.CreatedByUser)
            .Where(t => t.AssignedToUserId == currentUserId)
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDeleteTask(int id)
    {
        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id);
        if (task == null) return NotFound("Task not found.");

        // Soft delete execution: Marks flag as true without purging row from database
        task.IsDeleted = true;

        await _context.SaveChangesAsync();
        return Ok("Task removed successfully.");
    }
}