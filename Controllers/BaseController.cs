using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using supmusic.Data;

namespace supmusic.Controllers;

public abstract class BaseController<T> : Controller where T: BaseController<T>
{
    protected readonly ApplicationDbContext _context;
    protected readonly UserManager<IdentityUser> _userManager;
    protected readonly ILogger<T> _logger;

    protected BaseController(ApplicationDbContext context, UserManager<IdentityUser> userManager, ILogger<T> logger)
    {
        _context = context;
        _userManager = userManager;
        _logger = logger;
    }

    protected IdentityUser GetCurrentUser()
    {
        return _userManager.FindByNameAsync(HttpContext.User.Identity?.Name).Result;
    }
}