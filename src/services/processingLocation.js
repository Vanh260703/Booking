const axios = require('axios');

async function getCoordinates(name) {

    try {
        console.log('ĐANG GỌI HÀM LẤY KINH ĐỘ, VĨ ĐỘ!!!');
        const response = await axios.get('https://serpapi.com/search.json', {
            params: {
                engine: 'google_maps',
                q: name,
                api_key: process.env.GOOGLE_PRIVATE_KEY,
            }
        });

        const data = response.data;
        
        if (data.local_results && data.local_results.length > 0) {
            const results = data.local_results.slice(0,5).map((item) => ({
                type: 'list',
                name: item.title,
                coordinates: item.gps_coordinates,
                address: item.address, 
            }));
            return results;
        }
        
        if (data.place_results) {
            const results = {
                type: 'detail',
                name: data.place_results.title,
                coordinates: data.place_results.gps_coordinates,
                address: data.place_results.address,
                rating: data.place_results.rating,
                reviews: data.place_results.reviews,
                images: data.place_results.images,
                contact: {
                    phone: data.place_results.phone,
                    website: data.place_results.website
                },
                amenities: data.place_results.amenities,
            };
            return results;
        }

        return null;

    } catch (err) {
        console.error('Lỗi khi gọi SerpAPI: ', err.message);
        return null
    };
}

async function getLocationDataForCity(name) {
    const response = await axios.get('https://serpapi.com/search.json', {
        params: {
            engine: 'google_maps',
            q: name,
            api_key: process.env.GOOGLE_PRIVATE_KEY,
        }
    });

    const result = response.data.place_results;

    if (!result) return null;

    return {
        name: result.title,
        coordinates: [result.gps_coordinates.latitude, result.gps_coordinates.longitude],
        images: result.images.map((img) => ({
            title: img.title,
            url: img.thumbnail
        })),
    };
}

async function fetchLocationData(name) {
    const result = await getCoordinates(name);

    if (!result) return null;

    console.log(result);

    return {
        coordinates: [result.coordinates.latitude, result.coordinates.longitude],
        address: result.address,
        contact: result.contact,
        amenities: result.amenities,
        totalReviews: result.reviews,
        starRating: Number(result.rating),
        images: result.images.map((img) => ({
            title: img.title,
            url: img.thumbnail
        }))
    };
}

module.exports = { getCoordinates, getLocationDataForCity, fetchLocationData };