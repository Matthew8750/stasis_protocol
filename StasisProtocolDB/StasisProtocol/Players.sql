CREATE TABLE [dbo].[Players]
(
	[player_id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY, 
    [player_name] VARCHAR(30) NOT NULL,
	[created_at] TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
)
