import React, {
    useEffect, useState,
} from 'react';
import {
    Button, Input, Row, Col,
    Alert
} from 'antd';
import axios from 'axios';
import moment from 'moment';

import ChartPlayer from '@/components/ChartPlayer';
import Layout from '@/layouts/BasicLayout';

const clientId = '6ab1aebe3d1999c206ae14ddbb366f6a65759bf2';
const clientSecret = '190fe6a7296c449bf9af82e3d25132e765ad8f3e';

async function checkToken(token) {
    const response = await axios.get(`https://qiita.com/api/v2/items`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response;
}


async function getAllItems(id, token) {
    const limit = 100;
    let page = 1;
    let items = [];

    let totalCnt;
    do {
        const response = await axios.get(`https://qiita.com/api/v2/users/${id}/items?page=${page}&per_page=${limit}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        let totalLikesCount = 0;
        response.data.forEach(({ likes_count: likesCount }) => {
            totalLikesCount += likesCount;
        });

        if (totalLikesCount > 1000) {
            throw new Error('Over1000LikesCount');
        }

        totalCnt = Number(response.headers['total-count']);
        items = items.concat(response.data);
    } while (page++ * limit < totalCnt);

    return items;
}

async function getAllLikes(itemId, token) {
    const limit = 100;
    let page = 1;
    let likes = [];

    let totalCnt;
    do {
        const response = await axios.get(`https://qiita.com/api/v2/items/${itemId}/likes?page=${page}&per_page=${limit}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        totalCnt = Number(response.headers['total-count']);
        likes = likes.concat(response.data);
    } while (page++ * limit < totalCnt);

    return likes;
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
    const response = await axios.post('https://qiita.com/api/v2/access_tokens', {
        client_id: clientId,
        client_secret: clientSecret,
        code
    });

    const { token } = response.data;
    return token;
}

function gotoOauth() {
    window.location.href = `https://qiita.com/api/v2/oauth/authorize?client_id=${clientId}&scope=read_qiita`;
}

const userCount = 8;

export default () => {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [data, setData] = useState(null);
    const [validUsers, setValidUsers] = useState(null);
    const [token, setToken] = useState(null);
    const [error, setError] = useState(false);
    const [likeExceedError, setLikeExceedError] = useState(false);

    useEffect(() => {
        document.title = 'Qiita Racer';
    }, []);

    useEffect(() => {
        try {
            const users = JSON.parse(localStorage.getItem('users'));
            setUsers(users || []);
        } catch (e) {
            // 
        }
    }, []);

    useEffect(() => {
        const url = new URL(window.location.href);
        const token = url.searchParams.get('token') || localStorage.getItem('token');
        const code = url.searchParams.get('code');
        if (token) {
            checkToken(token).then(() => {
                setToken(token);
            }).catch(() => {
                localStorage.removeItem('token');
                gotoOauth();
            })
            return;
        }

        if (code) {
            getAccessToken(code).then((token) => {
                localStorage.setItem('token', token);
                setToken(token);
            }).catch(() => {
                localStorage.removeItem('token');
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
                {likeExceedError && <Alert type="error" message="LGTMが1000を超えるユーザーは取得できません。" style={{ marginBottom: 8 }} />}
                <Row gutter={8}>
                    {Array(userCount).fill(null).map((_, i) => {
                        const user = users[i];
                        return (
                            <Col key={i} md={6} sm={12} xs={24} style={{ marginBottom: 8 }}>
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

                            localStorage.setItem('users', JSON.stringify(validUsers));

                            setData(null);
                            setError(false);
                            setLikeExceedError(false);
                            setValidUsers(null);

                            setLoading(true);
                            fetchData(validUsers, token).then((data) => {
                                setData(data);
                                setValidUsers(validUsers);
                                setLoading(false);
                            }).catch((e) => {
                                console.log(e);
                                if (e.message === 'Over1000LikesCount') {
                                    setLikeExceedError(true);
                                }
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
