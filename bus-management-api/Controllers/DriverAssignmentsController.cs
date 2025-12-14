using System.Security.Claims;
using BusManagementApi.Authorization;
using BusManagementApi.Data;
using BusManagementApi.DTOs;
using BusManagementApi.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BusManagementApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DriverAssignmentsController : ControllerBase
{
    private readonly BusManagementDbContext _context;

    public DriverAssignmentsController(BusManagementDbContext context)
    {
        _context = context;
    }

    // Admin: View all assignments
    [HttpGet]
    [HasPermission(Permissions.ManageAssignments)]
    public async Task<IActionResult> GetAll()
    {
        var assignments = await _context.DriverAssignments
            .Include(da => da.Driver)
            .Include(da => da.Bus)
            .Select(da => new DriverAssignmentDto
            {
                AssignmentId = da.AssignmentId,
                DriverId = da.DriverId,
                DriverName = da.Driver.Name,
                BusId = da.BusId,
                BusNumber = da.Bus.BusNumber,
                AssignmentDate = da.AssignmentDate,
                Status = da.Status
            })
            .ToListAsync();

        return Ok(ApiResponse<List<DriverAssignmentDto>>.Ok(assignments));
    }

    // Driver: View own assignment
    [HttpGet("my-assignment")]
    [HasPermission(Permissions.ViewOwnAssignment)]
    public async Task<IActionResult> GetMyAssignment()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var assignment = await _context.DriverAssignments
            .Include(da => da.Driver)
            .Include(da => da.Bus)
            .Where(da => da.DriverId == userId && da.Status == "Active")
            .Select(da => new DriverAssignmentDto
            {
                AssignmentId = da.AssignmentId,
                DriverId = da.DriverId,
                DriverName = da.Driver.Name,
                BusId = da.BusId,
                BusNumber = da.Bus.BusNumber,
                AssignmentDate = da.AssignmentDate,
                Status = da.Status
            })
            .FirstOrDefaultAsync();

        if (assignment == null)
            return NotFound(ApiResponse<DriverAssignmentDto>.Fail("No active assignment"));

        return Ok(ApiResponse<DriverAssignmentDto>.Ok(assignment));
    }

    // Admin: Create assignment
    [HttpPost]
    [HasPermission(Permissions.ManageAssignments)]
    public async Task<IActionResult> Create([FromBody] CreateAssignmentDto dto)
    {
        var driver = await _context.Users.FirstOrDefaultAsync(u => u.UserId == dto.DriverId && u.UserType == "Driver");
        if (driver == null)
            return BadRequest(ApiResponse<DriverAssignmentDto>.Fail("Driver not found"));

        var bus = await _context.Buses.FindAsync(dto.BusId);
        if (bus == null)
            return BadRequest(ApiResponse<DriverAssignmentDto>.Fail("Bus not found"));

        // Check if bus already has active driver
        if (await _context.DriverAssignments.AnyAsync(da => da.BusId == dto.BusId && da.Status == "Active"))
            return BadRequest(ApiResponse<DriverAssignmentDto>.Fail("Bus already has an active driver"));

        // Check if driver already assigned
        if (await _context.DriverAssignments.AnyAsync(da => da.DriverId == dto.DriverId && da.Status == "Active"))
            return BadRequest(ApiResponse<DriverAssignmentDto>.Fail("Driver already assigned to another bus"));

        var assignment = new DriverAssignment
        {
            DriverId = dto.DriverId,
            BusId = dto.BusId,
            Status = "Active"
        };

        _context.DriverAssignments.Add(assignment);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<DriverAssignmentDto>.Ok(new DriverAssignmentDto
        {
            AssignmentId = assignment.AssignmentId,
            DriverId = assignment.DriverId,
            DriverName = driver.Name,
            BusId = assignment.BusId,
            BusNumber = bus.BusNumber,
            AssignmentDate = assignment.AssignmentDate,
            Status = assignment.Status
        }, "Driver assigned"));
    }

    // Admin: Delete assignment
    [HttpDelete("{id}")]
    [HasPermission(Permissions.ManageAssignments)]
    public async Task<IActionResult> Delete(int id)
    {
        var assignment = await _context.DriverAssignments.FindAsync(id);
        if (assignment == null)
            return NotFound(ApiResponse<object>.Fail("Assignment not found"));

        _context.DriverAssignments.Remove(assignment);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(null!, "Assignment deleted"));
    }
}
