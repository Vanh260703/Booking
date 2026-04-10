const RoomInstance = require('../app/models/RoomInstance');

function generateRoomNumbers(totalRooms) {
    const rooms = [];
    let floor = 1;
    let count = 1;

    for (let i = 0; i < totalRooms; i++) {
        const roomNumber = floor * 100 + count;
        rooms.push({ roomNumber, floor });

        count++;
        if (count > 5) { 
            count = 1;
            floor++;
        }
    }
    return rooms;
}

async function generateRoomInstance(roomType) {
    const roomConfigs = generateRoomNumbers(roomType.totalRooms);

    for (const { roomNumber, floor } of roomConfigs) {
        await RoomInstance.create({
            roomType: roomType._id,
            hotel: roomType.hotel,
            roomNumber,
            floor,
        });
    }
}

module.exports = { generateRoomInstance };