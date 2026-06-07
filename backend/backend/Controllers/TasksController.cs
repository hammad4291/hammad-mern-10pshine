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
            Status = "Pending", // Match your database string initialization default rules
            DueDate = dto.DueDate,
            CategoryId = dto.CategoryId,
            CreatedByUserId = currentUserId,
            CreatedAt = DateTime.Now
        };

        task.AssignedToUserId = dto.AssignedToUserId.HasValue ? dto.AssignedToUserId.Value : currentUserId;

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return Ok("Task created successfully.");
    }
    [HttpGet("my-tasks")]
    public async Task<IActionResult> GetMyTasks()
    {
        int currentUserId = GetLoggedInUserId();

        // Extract the role safely from the authenticated JWT claims context
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        // Build the query base with both user joins included to prevent UI property crashes
        var query = _context.Tasks
            .Include(t => t.Category)
            .Include(t => t.CreatedByUser)
            .Include(t => t.AssignedToUser)
            .AsQueryable();

        // Dynamically branch the database query filter based on the token role
        if (userRole == "Admin")
        {
            // Admins see tasks they created and managed out
            query = query.Where(t => t.CreatedByUserId == currentUserId);
        }
        else
        {
            // Regular users see tasks assigned explicitly to them
            query = query.Where(t => t.AssignedToUserId == currentUserId);
        }

        var tasks = await query.ToListAsync();
        return Ok(tasks);
    }
    //[HttpGet("my-tasks")]
    //public async Task<IActionResult> GetMyTasks()
    //{
    //    int currentUserId = GetLoggedInUserId();

    //    // Safe Join executions to avoid 500 entity missing mapping breaks
    //    var tasks = await _context.Tasks
    //        .Include(t => t.Category)
    //        .Include(t => t.CreatedByUser)
    //        .Where(t => t.AssignedToUserId == currentUserId)
    //        .ToListAsync();

    //    return Ok(tasks);
    //}
    //[HttpGet]
    //[Route("admin-assigned")]
    //public async Task<IActionResult> GetAdminAssignedTasks()
    //{
    //    // 1. Get the unique ID of the logged-in Admin from the JWT claims
    //    int currentAdminId = GetLoggedInUserId();

    //    // 2. Fetch tasks created by this Admin but assigned to other users
    //    var tasks = await _context.Tasks
    //        .Include(t => t.Category)
    //        .Include(t => t.AssignedToUser) // Join the user who is working on the task
    //        .Where(t => t.CreatedByUserId == currentAdminId)
    //        .ToListAsync();

    //    return Ok(tasks);
    //}
    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDeleteTask(int id)
    {
        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id);
        if (task == null) return NotFound("Task not found.");

        task.IsDeleted = true;

        await _context.SaveChangesAsync();
        return Ok("Task removed successfully.");
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, [FromBody] TaskUpdateDto dto)
    {
        int currentUserId = GetLoggedInUserId();
        string userRole = User.FindFirst(ClaimTypes.Role)!.Value;

        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id);
        if (task == null) return NotFound("Task not found.");

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.Status = dto.Status;
        task.Priority = dto.Priority;
        task.DueDate = dto.DueDate;
        task.CategoryId = dto.CategoryId;

        if (userRole == "Admin")
        {
            task.AssignedToUserId = dto.AssignedToUserId.HasValue ? dto.AssignedToUserId.Value : currentUserId;
        }
        else
        {
            task.AssignedToUserId = currentUserId;
        }

        await _context.SaveChangesAsync();
        return Ok("Task updated successfully.");
    }

    [HttpGet("assignable-users")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAssignableUsers()
    {
        var users = await _context.Users
            .Where(u => u.Role.Name == "User")
            .Select(u => new UserSelectDto
            {
                Id = u.Id,
                Username = u.Username
            })
            .ToListAsync();

        return Ok(users);
    }
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.Categories
            .Select(c => new
            {
                c.Id,
                c.Name
            })
            .ToListAsync();

        return Ok(categories);
    }
}