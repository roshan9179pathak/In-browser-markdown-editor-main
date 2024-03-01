const getData = async (url) => {
    const response = await fetch(url);
    return response.json();
};

const postData = async (url, data) => {
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response.json();
};

const putData = async (url, data) => {
    const response = await fetch(url, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response.json();
};

const deleteData = async (url) => {
    const response = await fetch(url, {
        method: "DELETE",
    });
    return response.json();
};
