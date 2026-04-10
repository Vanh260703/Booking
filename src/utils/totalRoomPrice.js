function totalRoomPrice(checkIn, checkOut, roomType) {
    let total = 0;
    let currentDate = new Date(checkIn);

    while(currentDate < new Date(checkOut)) {
        const day = new Date(currentDate).getDay();
        const isWeekend = (day === 0 || day === 6);
        total += isWeekend ? roomType.pricing.weekendPrice : roomType.pricing.basePrice;

        currentDate.setDate(currentDate.getDate() + 1);
    };

    return total;
}

module.exports = totalRoomPrice;