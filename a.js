fetch('https://qiita.com/api/v2/access_tokens', {
    method: 'post',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(
        {
            "client_id": "6ab1aebe3d1999c206ae14ddbb366f6a65759bf2",
            "client_secret": "190fe6a7296c449bf9af82e3d25132e765ad8f3e",
            "code": "324dae97c63c02461f3b19f7cf2af6d8ac81a977"
        }
    )
});
