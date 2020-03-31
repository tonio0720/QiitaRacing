import React, {
    useEffect, useState,
} from 'react';
import {
    Button, Input, Row, Col,
    Divider,
    Alert
} from 'antd';
import moment from 'moment';

import ChartPlayer from '@/components/ChartPlayer';
import Layout from '@/layouts/BasicLayout';

const clientId = '6ab1aebe3d1999c206ae14ddbb366f6a65759bf2';
const clientSecret = '190fe6a7296c449bf9af82e3d25132e765ad8f3e';

async function getAllItems(id, token) {
    const limit = 100;
    let page = 1;
    let items = [];

    let current;
    do {
        const response = await fetch(`https://qiita.com/api/v2/users/${id}/items?page=${page}&per_page=${limit}`, {
            mode: 'cors',
            method: 'get',
            headers: {
                Authorization: `Bearer ${token}`,
                'Access-Control-Allow-Headers': 'total-count',
                'Access-Control-Expose-Headers': 'total-count'
            },
        });

        if (!response.ok) {
            throw new Error();
        }

        current = await response.json();
        items = items.concat(current);
        page++;
    } while (limit === current.length);

    return items;
}

async function getAllLikes(itemId, token) {
    const limit = 100;
    let page = 1;
    let items = [];

    let current;
    do {
        const response = await fetch(`https://qiita.com/api/v2/items/${itemId}/likes?page=${page}&per_page=${limit}`, {
            mode: 'cors',
            method: 'get',
            headers: {
                Authorization: `Bearer ${token}`,
                'Access-Control-Allow-Headers': 'total-count',
                'Access-Control-Expose-Headers': 'total-count'
            }
        });

        if (!response.ok) {
            throw new Error();
        }

        current = await response.json();
        items = items.concat(current);
        page++;
    } while (limit === current.length);

    return items;
}

const fetchData = async (users, token) => {
    const data = {};
    for (let i = 0; i < users.length; i++) {
        const userId = users[i];
        const items = await getAllItems(userId, token);
        let totalLikes = [];

        for (let j = 0; j < items.length; j++) {
            const item = items[j];
            const likes = await getAllLikes(item.id, token);
            totalLikes = totalLikes.concat(likes);
        }

        totalLikes.forEach(({ created_at: createdAt }) => {
            const date = moment(createdAt).format('YYYY-MM-DD');
            if (!data[date]) {
                data[date] = {};
            }
            if (!data[date][userId]) {
                data[date][userId] = 0;
            }
            data[date][userId]++;
        });
    }

    const emptyData = {};
    users.forEach((user) => {
        emptyData[user] = 0;
    });

    let datesData = [];
    Object.keys(data).forEach((date) => {
        datesData.push({
            date,
            likeCounts: { ...emptyData, ...data[date] }
        });
    });

    datesData.sort((a, b) => moment(a.date) - moment(b.date));
    datesData = datesData.map((n, i) => {
        if (datesData[i - 1]) {
            users.forEach((user) => {
                n.likeCounts[user] = n.likeCounts[user] || 0;
                n.likeCounts[user] += datesData[i - 1].likeCounts[user];
            });
            return n;
        }
        return n;
    });

    return datesData;
};

async function getAccessToken(code) {
    const response = await fetch('https://qiita.com/api/v2/access_tokens', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            {
                client_id: clientId,
                client_secret: clientSecret,
                code
            }
        )
    });

    if (!response.ok) {
        throw new Error();
    }

    const { token } = await response.json();
    return token;
}

function gotoOauth() {
    window.location.href = `https://qiita.com/api/v2/oauth/authorize?client_id=${clientId}&scope=read_qiita`;
}

const userCount = 8;

export default () => {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState(Array(userCount).fill(null));
    const [data, setData] = useState(null);
    const [validUsers, setValidUsers] = useState(null);
    const [token, setToken] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const url = new URL(window.location.href);
        const token = url.searchParams.get('token');
        const code = url.searchParams.get('code');
        if (token) {
            setToken(token);
            return;
        }

        if (code) {
            getAccessToken(code).then((token) => {
                window.location.href = `?token=${token}`;
            }).catch(() => {
                gotoOauth();
            });
            return;
        }

        gotoOauth();
    }, []);

    if (!token) {
        return (
            <Layout>
                <div>トークンを取得します。</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div style={{ background: '#fff', padding: 16 }}>
                {error && <Alert type="error" message="エラーが発生しました。" style={{ marginBottom: 8 }} />}
                <Row gutter={8}>
                    {users.map((user, i) => {
                        return (
                            <Col key={i} span={6} style={{ marginBottom: 8 }}>
                                <Input
                                    placeholder="ユーザーIDを入力してください。"
                                    value={user}
                                    onChange={(e) => {
                                        const updatedUsers = [...users];
                                        updatedUsers[i] = e.target.value;
                                        setUsers(updatedUsers);
                                    }}
                                />
                            </Col>
                        );
                    })}
                </Row>
                <div style={{ textAlign: 'center' }}>
                    <Button
                        type="primary"
                        block
                        onClick={() => {
                            const validUsers = users.filter((n) => n);
                            if (validUsers.length === 0) {
                                return;
                            }
                            setData(null);
                            setError(false);
                            setValidUsers(null);

                            setLoading(true);
                            fetchData(validUsers, token).then((data) => {
                                setData(data);
                                setValidUsers(validUsers);
                                setLoading(false);
                            }).catch((e) => {
                                console.log(e);
                                setLoading(false);
                                setError(true);
                            });
                        }}
                        disabled={!token}
                        loading={loading}
                    >
                        データ取得
                    </Button>
                </div>
            </div>
            <ChartPlayer data={data} loading={loading} users={validUsers} />
        </Layout>
    );
};
