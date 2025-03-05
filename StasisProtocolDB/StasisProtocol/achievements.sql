CREATE TABLE [dbo].[achievements]
(
	[achievement_id] INT NOT NULL PRIMARY KEY, 
    [achievement_name] VARCHAR(30) NOT NULL, 
    [achievement_desc] VARCHAR(50) NOT NULL, 
    [achievement_image] IMAGE NOT NULL
)
