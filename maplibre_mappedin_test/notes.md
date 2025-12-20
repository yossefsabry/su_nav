❌ UNUSED NODE TYPES IN TEMP_MVF
Based on my analysis, here are the node types NOT currently displayed on your map:

1. 🛗 ELEVATOR NODES - Found in 
connections.json
Count: 2 elevator connections
Total Locations: 8 nodes (4 floors × 2 elevators)
Status: ❌ NOT USED
Potential: Could display as cyan circles for elevator locations

2. 🟢 WALKABLE NODES - Folder: walkable/
    Files: 4 files (one per floor)
    Status: ❌ NOT DISPLAYED (loaded for pathfinding but not visible)
    Potential: Could show as green dots for debugging walkable areas

3. 🔵 KINDS NODES - Folder: kinds/
Files: 4 files (one per floor)
Total Size: ~42KB of data
Status: ❌ NOT USED
Potential: Node type classifications/categories

4. 🔵 ANNOTATIONS - Folder: annotations/
Files: 1 file ( f_b5369b1f7a27bb97.json )
Size: 889 bytes
Status: ❌ NOT USED
Symbols Available: Primary Entrance, Secondary Entrance
Potential: Special markers for entrances

5. 🚪 DOOR NODES - Found in 
connections.json
Count: Hundreds of door connections
Status: ⚠️ PARTIALLY USED (rendered as 3D geometry, not as clickable nodes)
Potential: Could add interactive door markers
