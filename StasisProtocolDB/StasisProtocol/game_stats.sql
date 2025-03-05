CREATE TABLE [dbo].[game_stats]
(
	[stats_id] INT NOT NULL PRIMARY KEY, 
    [player_id] INT NOT NULL, 
    [deaths] INT NOT NULL DEFAULT 0, 
    [time_played] TIME(0) NOT NULL DEFAULT '00:00:00', 
    [rooms_explored] INT NOT NULL DEFAULT 0,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE
)
