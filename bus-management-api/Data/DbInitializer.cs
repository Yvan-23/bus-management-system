using BusManagementApi.Authorization;
using BusManagementApi.Entities;
using Microsoft.EntityFrameworkCore;

namespace BusManagementApi.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(BusManagementDbContext context)
    {
        await context.Database.MigrateAsync();

        // Seed permissions if not exist
        if (!await context.Permissions.AnyAsync())
        {
            var allPermissions = Permissions.GetAllPermissions();
            foreach (var perm in allPermissions)
            {
                context.Permissions.Add(new Permission
                {
                    Name = perm.Name,
                    Description = perm.Description,
                    Module = perm.Module
                });
            }
            await context.SaveChangesAsync();
        }

        // Seed default admin if not exist
        if (!await context.Users.AnyAsync(u => u.UserType == "Admin"))
        {
            var admin = new User
            {
                Name = "System Admin",
                Email = "admin@busmanagement.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Phone = "0000000000",
                UserType = "Admin",
                IsActive = true
            };

            context.Users.Add(admin);
            await context.SaveChangesAsync();

            // Assign admin permissions
            var adminPerms = Permissions.GetDefaultPermissions("Admin");
            var permEntities = await context.Permissions
                .Where(p => adminPerms.Contains(p.Name))
                .ToListAsync();

            foreach (var perm in permEntities)
            {
                context.UserPermissions.Add(new UserPermission
                {
                    UserId = admin.UserId,
                    PermissionId = perm.PermissionId
                });
            }
            await context.SaveChangesAsync();
        }
    }
}
