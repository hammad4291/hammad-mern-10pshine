namespace backend.Models;

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, InProgress, Completed
    public string Priority { get; set; } = "Medium";
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Soft Delete: 0 = Active, 1 = Deleted
    public bool IsDeleted { get; set; } = false;

    public int CategoryId { get; set; }
    public Category? Category { get; set; }

    // Links to Worker tracking
    public int AssignedToUserId { get; set; }
    public User? AssignedToUser { get; set; }

    // Links to Creator tracking
    public int CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }
}