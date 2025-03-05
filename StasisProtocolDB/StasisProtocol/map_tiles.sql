CREATE TABLE [dbo].[mapTiles]
(
    
	[tile_id] INT NOT NULL PRIMARY KEY, 
    [x] INT NOT NULL, 
    [y] INT NOT NULL, 
    [room_id] INT NOT NULL, -- What type of room this tile contains, null if it's empty space
    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
)
