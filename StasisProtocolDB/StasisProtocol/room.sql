CREATE TABLE [dbo].[room]
(
	[room_id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY, 
    [room_image] IMAGE NOT NULL, 
    [room_name] VARCHAR(30) NOT NULL, 
    [room_desc] VARCHAR(100) NOT NULL

)
