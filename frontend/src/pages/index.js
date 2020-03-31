import React, {
    useEffect, useRef, useCallback, useState
} from 'react';
import {
    Button, Input, Row, Col, Spin
} from 'antd';
import moment from 'moment';

import Layout from '@/layouts/BasicLayout';
import RacingBarChart from '@/components/RacingBarChart';

const clientId = '6ab1aebe3d1999c206ae14ddbb366f6a65759bf2';
const clientSecret = '190fe6a7296c449bf9af82e3d25132e765ad8f3e';
const sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));

async function getAllItems(id, token) {
    const limit = 100;
    let page = 1;

    let totalCnt;
    let items = [];

    let current;
    do {
        await sleep(10);
        const response = await fetch(`https://qiita.com/api/v2/users/${id}/items?page=${page}&per_page=${limit}`, {
            mode: 'cors',
            method: 'get',
            headers: {
                Authorization: `Bearer ${token}`,
                'Access-Control-Allow-Headers': 'total-count',
                'Access-Control-Expose-Headers': 'total-count'
            },
        });

        current = await response.json();
        items = items.concat(current);
        page++;
    } while (limit === current.length);

    return items;
}

async function getAllLikes(itemId, token) {
    const limit = 100;
    let page = 1;

    let totalCnt;
    let items = [];

    let current;
    do {
        await sleep(10);
        const response = await fetch(`https://qiita.com/api/v2/items/${itemId}/likes?page=${page}&per_page=${limit}`, {
            mode: 'cors',
            method: 'get',
            headers: {
                Authorization: `Bearer ${token}`,
                'Access-Control-Allow-Headers': 'total-count',
                'Access-Control-Expose-Headers': 'total-count'
            }
        });

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

    const datesData = [];
    Object.keys(data).forEach((date) => {
        datesData.push({
            date,
            likeCounts: { ...emptyData, ...data[date] }
        });
    });

    datesData.sort((a, b) => moment(a.date) - moment(b.date));

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

    const { token } = await response.json();
    return token;
}

const userCount = 8;

export default () => {
    const [users, setUsers] = useState(Array(userCount).fill(null));
    const [validUsers, setValidUsers] = useState(null);
    const [data, setData] = useState(null);
    const [code, setCode] = useState(null);
    const [token, setToken] = useState(null);
    const ref = useRef(null);

    useEffect(() => {
        const url = new URL(location.href);
        const code = url.searchParams.get('code');
        if (!code) {
            location.href = `https://qiita.com/api/v2/oauth/authorize?client_id=${clientId}&scope=read_qiita`;
        }
        setCode(code);
    }, [])

    useEffect(() => {
        if (!code) {
            return;
        }

        getAccessToken(code).then((token) => {
            setToken(token);
        }).catch(() => {
            location.href = `https://qiita.com/api/v2/oauth/authorize?client_id=${clientId}&scope=read_qiita`;
        });
    }, [code]);

    return (
        <Layout>
            <Spin tip="Loading..." spinning={loading}>
                <Row gutter={8}>
                    {users.map((user, i) => {
                        return (
                            <Col key={i} span={6} style={{ marginBottom: 8 }}>
                                <Input
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
                <div style={{ textAlign: 'right' }}>
                    <Button
                        onClick={async () => {
                            const validUsers = users.filter((n) => n);
                            const data = await fetchData(validUsers, token);
                            setData(data);
                            setValidUsers(validUsers);
                        }}
                        disabled={!token}
                    >
                        取得
                </Button>
                    <Button
                        onClick={() => {
                            ref.current.play();
                        }}
                        disabled={!data}
                    >
                        実行
                </Button>
                </div>
                <div style={{ width: '100%', height: 500 }}>
                    <RacingBarChart ref={ref} data={data} users={validUsers} />
                </div>
            </Spin>
        </Layout>
    );
};
