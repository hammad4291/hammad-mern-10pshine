namespace backend.DTOs
{
    public class TaskUpdateDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public string Priority { get; set; }
        public DateTime DueDate { get; set; }
        public int CategoryId { get; set; }
        public int? AssignedToUserId { get; set; } // Nullable because regular users won't send this
    }
}
