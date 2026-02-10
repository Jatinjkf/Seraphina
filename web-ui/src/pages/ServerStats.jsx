import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import './ServerStats.css';

function ServerStats() {
    const [stats, setStats] = useState(null);
    const [recentGuilds, setRecentGuilds] = useState([]);
    const [topGuilds, setTopGuilds] = useState([]);
    const [allGuilds, setAllGuilds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [view, setView] = useState('overview'); // 'overview' or 'all'

    useEffect(() => {
        loadStats();
    }, []);

    useEffect(() => {
        if (view === 'all') {
            loadAllGuilds(currentPage);
        }
    }, [currentPage, view]);

    const loadStats = async () => {
        try {
            const response = await fetch(`${API_URL}/api/stats/guilds`);
            const data = await response.json();

            if (data.success) {
                setStats(data.stats);
                setRecentGuilds(data.recentGuilds);
                setTopGuilds(data.topGuilds);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error loading stats:', error);
            setLoading(false);
        }
    };

    const loadAllGuilds = async (page) => {
        try {
            const response = await fetch(`${API_URL}/api/stats/guilds/all?page=${page}&limit=20`);
            const data = await response.json();

            if (data.success) {
                setAllGuilds(data.guilds);
                setTotalPages(data.pagination.pages);
            }
        } catch (error) {
            console.error('Error loading guilds:', error);
        }
    };

    if (loading) {
        return <div className="loading">Loading server statistics...</div>;
    }

    return (
        <div className="server-stats">
            <div className="stats-header">
                <h1>🎀 Server Statistics</h1>
                <div className="stats-nav">
                    <a href="/admin" className="back-button">← Back to Admin</a>
                    <div className="view-toggle">
                        <button
                            className={view === 'overview' ? 'active' : ''}
                            onClick={() => setView('overview')}
                        >
                            Overview
                        </button>
                        <button
                            className={view === 'all' ? 'active' : ''}
                            onClick={() => setView('all')}
                        >
                            All Servers
                        </button>
                    </div>
                </div>
            </div>

            {view === 'overview' ? (
                <>
                    {/* Overview Cards */}
                    <div className="stats-cards">
                        <div className="stat-card">
                            <div className="stat-icon">🏰</div>
                            <div className="stat-value">{stats?.totalActive || 0}</div>
                            <div className="stat-label">Active Servers</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">👥</div>
                            <div className="stat-value">{stats?.totalMembers?.toLocaleString() || 0}</div>
                            <div className="stat-label">Total Members</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">📈</div>
                            <div className="stat-value">{stats?.recentJoins || 0}</div>
                            <div className="stat-label">New This Week</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">📊</div>
                            <div className="stat-value">{stats?.averageMembers || 0}</div>
                            <div className="stat-label">Avg Members/Server</div>
                        </div>
                    </div>

                    {/* Top Servers */}
                    <div className="section">
                        <h2>🏆 Top Servers by Members</h2>
                        <div className="guild-list">
                            {topGuilds.map((guild, index) => (
                                <div key={guild._id} className="guild-item top">
                                    <div className="guild-rank">#{index + 1}</div>
                                    <div className="guild-info">
                                        <div className="guild-name">{guild.guildName}</div>
                                        <div className="guild-meta">{guild.memberCount} members</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recently Joined */}
                    <div className="section">
                        <h2>✨ Recently Joined</h2>
                        <div className="guild-list">
                            {recentGuilds.map((guild) => (
                                <div key={guild._id} className="guild-item">
                                    <div className="guild-info">
                                        <div className="guild-name">{guild.guildName}</div>
                                        <div className="guild-meta">
                                            {guild.memberCount} members • Owner: {guild.ownerTag} •
                                            Joined {new Date(guild.joinedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* All Servers List */}
                    <div className="section">
                        <h2>📋 All Active Servers</h2>
                        <div className="guild-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Server Name</th>
                                        <th>Members</th>
                                        <th>Owner</th>
                                        <th>Joined</th>
                                        <th>Last Activity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allGuilds.map((guild) => (
                                        <tr key={guild._id}>
                                            <td className="guild-name-cell">{guild.guildName}</td>
                                            <td>{guild.memberCount}</td>
                                            <td>{guild.ownerTag}</td>
                                            <td>{new Date(guild.joinedAt).toLocaleDateString()}</td>
                                            <td>
                                                {guild.lastActivity
                                                    ? new Date(guild.lastActivity).toLocaleDateString()
                                                    : 'Never'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    ← Previous
                                </button>
                                <span>Page {currentPage} of {totalPages}</span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default ServerStats;
