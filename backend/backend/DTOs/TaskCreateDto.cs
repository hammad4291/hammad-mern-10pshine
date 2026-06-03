namespace backend.DTOs
{
    public class TaskCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Priority { get; set; } = "Medium";
        public DateTime? DueDate { get; set; }
        public int CategoryId { get; set; }
        public int? AssignedToUserId { get; set; } // Nullable for automatic self-assignment
    }
}
