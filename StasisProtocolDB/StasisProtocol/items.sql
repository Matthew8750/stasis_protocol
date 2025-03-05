CREATE TABLE [dbo].[items]
(
	[item_id] INT NOT NULL PRIMARY KEY, 
    [item_name] VARCHAR(30) NOT NULL, 
    [item_desc] VARCHAR(50) NOT NULL, 
    [item_image] IMAGE NOT NULL
)
