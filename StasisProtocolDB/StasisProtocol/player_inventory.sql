CREATE TABLE [dbo].[player_inventory]
(
	[inventory_id] INT NOT NULL PRIMARY KEY, 
    [player_id] INT NOT NULL, 
    [item_id] INT NOT NULL,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
    
)
