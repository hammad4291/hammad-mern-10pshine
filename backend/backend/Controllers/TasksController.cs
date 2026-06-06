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

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, [FromBody] TaskUpdateDto dto)
    {
        int currentUserId = GetLoggedInUserId();

        // Extract the role name string from the logged-in user's token claims
        string userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)!.Value;

        // Fetch the task from the database
        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id);
        if (task == null) return NotFound("Task not found.");

        // Update universal fields allowed for everyone
        task.Title = dto.Title;
        task.Description = dto.Description;
        task.Status = dto.Status;
        task.Priority = dto.Priority;
        task.DueDate = dto.DueDate;
        task.CategoryId = dto.CategoryId;

        // BUSINESS RULE: Role-Based Assignment Logic
        if (userRole == "Admin")
        {
            // If an Admin provided a targeted user ID, apply it; otherwise default back to the Admin
            task.AssignedToUserId = dto.AssignedToUserId.HasValue ? dto.AssignedToUserId.Value : currentUserId;
        }
        else
        {
            // If a normal user is editing, they can NEVER assign it to someone else
            task.AssignedToUserId = currentUserId;
        }

        await _context.SaveChangesAsync();
        return Ok("Task updated successfully.");
    }

    [HttpGet("assignable-users")]
    [Authorize(Roles = "Admin")] // 🛡️ Security Gate: Only Admins can access this list
    public async Task<IActionResult> GetAssignableUsers()
    {
        // Fetch users whose linked role name matches "User"
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

}