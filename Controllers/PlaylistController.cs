﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using supmusic.Data;
using supmusic.Models;

namespace supmusic.Controllers;

[Authorize]
public class PlaylistController : BaseController<PlaylistController>
{
    public PlaylistController(ApplicationDbContext context, UserManager<IdentityUser> userManager, ILogger<PlaylistController> logger) : base(context, userManager, logger)
    {
    }

    public async Task<IActionResult> Index()
    {
        var query = _context.Playlists.Where(p => p.User == GetCurrentUser());
        return View(await query.ToListAsync());
    }

    public async Task<IActionResult> Details(int Id)
    {
        var playlist = await _context.Playlists.FindAsync(Id);
        if (playlist == null)
        {
            return NotFound();
        }

        var query = _context.PlaylistSongs.Where(p => p.Playlist == playlist)
            .Include(p => p.Song)
            .Include(p => p.Playlist);

        var temp = new PlaylistDetails
        {
            Playlist = playlist,
            Songs = await query.ToListAsync()
        };
        
        return View(temp);
    }

    public IActionResult Create()
    {
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Store(Playlist playlist)
    {
        playlist.User = GetCurrentUser();
        _context.Add(playlist);
        await _context.SaveChangesAsync();
        
        return RedirectToAction(nameof(Index));
    }

    public async Task<IActionResult> Edit(int Id)
    {
        var playlist = await _context.Playlists.FindAsync(Id);
        if (playlist == null)
        {
            NotFound();
        }

        return View(playlist);
    }
    
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Update(Playlist playlist)
    {
        _context.Playlists.Update(playlist);
        await _context.SaveChangesAsync();
        
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int Id)
    {
        var playlist = await _context.Playlists.FindAsync(Id);
        if (playlist == null)
        {
            NotFound();
        }

        _context.Playlists.Remove(playlist);
        await _context.SaveChangesAsync();

        return RedirectToAction(nameof(Index));
    }

    [HttpGet]
    public async Task<List<Song>> SearchSong([FromQuery(Name = "name")] string name)
    {
        var request = _context.Songs.Where(s => s.Name.Contains(name));
        return await request.ToListAsync();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<RedirectToActionResult> AddSong(int Id, int songId)
    {
        var playlist = await _context.Playlists.FindAsync(Id);
        var song = await _context.Songs.FindAsync(songId);
        
        if (playlist == null || song == null)
        {
            NotFound();
        }

        var playlistSong = new PlaylistSong
        {
            Playlist = playlist,
            Song = song
        };
        _context.PlaylistSongs.Add(playlistSong);
        await _context.SaveChangesAsync();
        
        return RedirectToAction(nameof(Details), new {@id = Id});
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteSong(int Id, int playlistSongId)
    {
        var song = await _context.PlaylistSongs.FindAsync(playlistSongId);
        if (song == null)
        {
            NotFound();
        }

        _context.PlaylistSongs.Remove(song);
        await _context.SaveChangesAsync();
        
        return RedirectToAction(nameof(Details), new {@id = Id});
    }

    public async Task<List<PlaylistSong>> GetPlaylistSongs(int Id)
    {
        var query = _context.PlaylistSongs.Where(p => p.Playlist.ID == Id)
            .Include(p => p.Playlist)
            .Include(p => p.Song);

        return await query.ToListAsync();
    }

    public async Task<List<Playlist>> GetAllMyPlaylist()
    {
        var query = _context.Playlists.Where(p => p.User == GetCurrentUser());

        return await query.ToListAsync();
    }
}