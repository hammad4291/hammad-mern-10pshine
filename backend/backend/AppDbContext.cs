using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Role> Roles { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<TaskItem> Tasks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Global filter: Automatically hides soft-deleted tasks from all queries
        modelBuilder.Entity<TaskItem>().HasQueryFilter(t => !t.IsDeleted);

        // Map AllTasks list to the Worker foreign key column
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.AssignedToUser)
            .WithMany(u => u.AllTasks)
            .HasForeignKey(t => t.AssignedToUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Map CreatedTasks list to the Creator foreign key column
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.CreatedByUser)
            .WithMany(u => u.CreatedTasks)
            .HasForeignKey(t => t.CreatedByUserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}