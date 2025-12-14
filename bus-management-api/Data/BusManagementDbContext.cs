using Microsoft.EntityFrameworkCore;
using BusManagementApi.Entities;
using RouteEntity = BusManagementApi.Entities.Route;

namespace BusManagementApi.Data;

public class BusManagementDbContext : DbContext
{
    public BusManagementDbContext(DbContextOptions<BusManagementDbContext> options) : base(options)
    {
    }

    public DbSet<Bus> Buses { get; set; }
    public DbSet<RouteEntity> Routes { get; set; }
    public DbSet<Schedule> Schedules { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<UserPermission> UserPermissions { get; set; }
    public DbSet<Ticket> Tickets { get; set; }
    public DbSet<DriverAssignment> DriverAssignments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Bus configuration
        modelBuilder.Entity<Bus>(entity =>
        {
            entity.HasKey(e => e.BusId);
            entity.Property(e => e.BusNumber).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Model).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Active");
            entity.HasIndex(e => e.BusNumber).IsUnique();
        });

        // Route configuration
        modelBuilder.Entity<RouteEntity>(entity =>
        {
            entity.HasKey(e => e.RouteId);
            entity.Property(e => e.Origin).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Destination).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Distance).HasPrecision(10, 2);
            entity.Property(e => e.Price).HasPrecision(10, 2);
        });

        // Schedule configuration
        modelBuilder.Entity<Schedule>(entity =>
        {
            entity.HasKey(e => e.ScheduleId);
            entity.HasOne(e => e.Bus)
                .WithMany(b => b.Schedules)
                .HasForeignKey(e => e.BusId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Route)
                .WithMany(r => r.Schedules)
                .HasForeignKey(e => e.RouteId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(256).IsRequired();
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.UserType).HasMaxLength(20).IsRequired();
            entity.Property(e => e.LicenceNumber).HasMaxLength(50);
            entity.Property(e => e.LicencePhoto).HasMaxLength(500);
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // Permission configuration
        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.PermissionId);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Module).HasMaxLength(50).IsRequired();
            entity.HasIndex(e => e.Name).IsUnique();
        });

        // UserPermission configuration
        modelBuilder.Entity<UserPermission>(entity =>
        {
            entity.HasKey(e => e.UserPermissionId);
            entity.HasOne(e => e.User)
                .WithMany(u => u.UserPermissions)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Permission)
                .WithMany(p => p.UserPermissions)
                .HasForeignKey(e => e.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.UserId, e.PermissionId }).IsUnique();
        });

        // Ticket configuration
        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(e => e.TicketId);
            entity.Property(e => e.TicketNumber).HasMaxLength(50).IsRequired();
            entity.Property(e => e.PricePaid).HasPrecision(10, 2);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Active");
            entity.HasIndex(e => e.TicketNumber).IsUnique();
            entity.HasOne(e => e.Client)
                .WithMany(u => u.Tickets)
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Schedule)
                .WithMany(s => s.Tickets)
                .HasForeignKey(e => e.ScheduleId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // DriverAssignment configuration
        modelBuilder.Entity<DriverAssignment>(entity =>
        {
            entity.HasKey(e => e.AssignmentId);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Active");
            entity.HasOne(e => e.Driver)
                .WithMany(u => u.DriverAssignments)
                .HasForeignKey(e => e.DriverId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Bus)
                .WithMany(b => b.DriverAssignments)
                .HasForeignKey(e => e.BusId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
