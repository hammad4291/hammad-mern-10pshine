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
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProfileController(AppDbContext context) => _context = context;

    private int GetLoggedInUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpPut("update-name")]
    public async Task<IActionResult> UpdateName([FromBody] ProfileUpdateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName))
        {
            return BadRequest("Name cannot be empty.");
        }

        int userId = GetLoggedInUserId();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return NotFound("User not found.");
        }

        // Update the username field in your database
        user.Username = dto.FullName;
        await _context.SaveChangesAsync();

        return Ok("Profile name updated successfully.");
    }
}